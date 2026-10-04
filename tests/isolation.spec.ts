import { test, expect } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('TC12 A freshly seeded account starts with the default holdings and balance', async ({ page, createAccount }) => {
 const account = await createAccount();

  const login = new LoginPage(page);
  await login.open();
  await login.login('Retail Banking', account.username, account.password);
  await login.expectOnDashboard();

  const dashboard = new DashboardPage(page);
  await expect(page.locator('main').getByRole('heading', { level: 1 }))
    .toHaveText(`Welcome, ${account.username}`);
  await expect(dashboard.holdingRows()).toHaveCount(3);
  await expect(page.getByTestId('account-balance')).toHaveText('₹1,25,000.50');

});
