import { test as base, expect, request as pwRequest, type APIRequestContext, type Page } from '@playwright/test';


const API_URL = process.env.API_URL ?? 'http://localhost:4000/api/';

export interface SeededAccount {
  accountId: string;
  username: string;
  password: string;
}

interface SeedOptions {
  holdings?: { name: string; market: string; quantity: number; avgPrice: number }[];
}

type Fixtures = {
  /** An API client pointed at the Sandbox API. (given) */
  api: APIRequestContext;
  /** Creates a brand-new account for this test. (given) */
  createAccount: (options?: SeedOptions) => Promise<SeededAccount>;
  /** A page already signed in as a brand-new account, sitting on the dashboard. (YOU BUILD THIS) */
  loggedInPage: { page: Page; account: SeededAccount };
};

export const test = base.extend<Fixtures>({
  api: async ({}, use) => {
    const api = await pwRequest.newContext({ baseURL: API_URL });
    await use(api);
    await api.dispose();
  },

  createAccount: async ({ api }, use) => {
    await use(async (options = {}) => {
      const res = await api.post('test/seed-account', { data: options });
      expect(res.ok()).toBeTruthy();
      return res.json();
    });
  },

  // TODO: build loggedInPage.
  //   1. Create a fresh account with createAccount().
  //   2. Get the browser signed in as that account. The Sandbox keeps its whole session in one
  //      localStorage entry named 'holdingsSandbox.accountId' (its value is the account id).
  //      Think about where and when to set it. (Hint: after a test logs out, it must stay logged out.)
  //   3. Open /dashboard and wait until the welcome heading shows.
  //   4. Hand the test { page, account }.
  loggedInPage: async ({ page, createAccount }, use) => {
  const account = await createAccount();

  await page.goto('/login');
  await page.evaluate((accountId) => {
    localStorage.setItem('holdingsSandbox.accountId', accountId);
  }, account.accountId);

  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    `Welcome, ${account.username}`,
  );

  await use({ page, account });
}
});

export { expect };
