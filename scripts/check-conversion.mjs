
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const STRICT = process.argv.includes('--strict');
const EXPECTED = Array.from({ length: 15 }, (_, i) => String(i + 1).padStart(2, '0'));

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (name.endsWith('.ts')) out.push(full);
  }
  return out;
}

const dirs = ['tests', 'pages', 'fixtures'].map((d) => join(ROOT, d)).filter((d) => {
  try { return statSync(d).isDirectory(); } catch { return false; }
});
const files = dirs.flatMap(walk);


const RULES = [
  [/waitForTimeout\s*\(/, 'waitForTimeout is a sleep. Use a web-first assertion instead.'],
  [/Thread\.sleep|\bsleep\s*\(/, 'Sleeping is not needed: Playwright waits for you.'],
  [/xpath\s*=|['"`]\(?\/\/[\w*.@\[]/, 'XPath found. Use getByRole, getByLabel, getByText, getByTestId or a CSS locator.'],
  [/\bpage\.\$\$?\s*\(|\$x\s*\(/, 'page.$ / page.$$ are legacy element handles. Use locators.'],
  [/waitForSelector\s*\(/, 'waitForSelector is discouraged. Assert on a locator instead.'],
  [/implicitlyWait|setDefaultTimeout\s*\(/, 'Timeout juggling: rely on the built-in auto-waiting and expect timeouts.'],
  [/demo1234/, 'A shared demo account is hard-coded here. Use the seeded-account fixtures.',
    (f) => !/login\.spec\.ts$/.test(f) && !/fixtures/.test(f)],
];

const violations = [];
const found = new Map();

for (const file of files) {
  const rel = relative(ROOT, file);
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const code = line.replace(/\s\/\/\s.*$/, ''); // ignore trailing comments (only ' // text', so XPath in strings survives)
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    for (const [re, msg, applies] of RULES) {
      if (applies && !applies(rel)) continue;
      if (re.test(code)) violations.push(`${rel}:${i + 1}  ${msg}`);
    }
    const m = line.match(/\btest(\.fixme|\.skip)?\s*\(\s*[`'"](\d\d) /);
    if (m) {
      const n = m[2];
      const converted = !m[1];
      const prev = found.get(n);
      found.set(n, { converted: prev ? prev.converted || converted : converted });
    }
  });
}

const done = EXPECTED.filter((n) => found.get(n)?.converted);
const todo = EXPECTED.filter((n) => !found.get(n)?.converted);

console.log('Conversion progress');
console.log('-------------------');
for (const n of EXPECTED) {
  const s = found.get(n);
  console.log(`  ${n}  ${s ? (s.converted ? 'converted' : 'still fixme') : 'missing'}`);
}
console.log(`\n${done.length} of 15 converted.`);

if (violations.length) {
  console.log(`\n${violations.length} rubric problem(s):`);
  for (const v of violations) console.log('  - ' + v);
} else {
  console.log('\nNo lazy patterns found.');
}

let failed = violations.length > 0;
if (STRICT && todo.length) {
  console.log(`\n--strict: ${todo.length} test(s) not converted yet (${todo.join(', ')}).`);
  failed = true;
}
process.exit(failed ? 1 : 0);
