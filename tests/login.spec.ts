import { test, expect } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';

test('TC01 Valid login lands on the dashboard', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.login('Retail Banking', 'demo', 'demo1234');

  await login.expectOnDashboard();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome, demo');
});


test('TC02 Wrong password shows an error', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.login('Retail Banking', 'demo', 'vishal');
  await expect(login.errorMessage).toHaveText('Invalid area, username or password');
  await expect(page).toHaveURL(/.*\/login.*/);

});

[
  ['Retail Banking', 'demo'],
  ['Corporate Banking', 'demo2'],
  ['NRI Services', 'demo3'],
].forEach(([area, username]) => {
  test(`TC03 Every business area can log in: ${area}`, async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login(area, username, 'demo1234');

    await login.expectOnDashboard();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Welcome, ${username}`);
    await expect(page.locator('.area-badge')).toHaveText(area);
  });
});

test('TC06 Logging out returns to login and blocks the dashboard', async ({ loggedInPage }) => {
  const { page } = loggedInPage;

  await page.getByRole('button', { name: 'Log Out' }).click();
  await expect(page).toHaveURL(/\/login/);

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});