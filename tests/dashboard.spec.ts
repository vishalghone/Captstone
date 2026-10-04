import { test, expect } from '../fixtures';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';


test('TC04 Dashboard lists the holdings for the account', async ({ loggedInPage }) => {
  const dashboard = new DashboardPage(loggedInPage.page);

  await expect(dashboard.holdingRows()).toHaveCount(3);
  await expect(dashboard.firstHoldingName()).toHaveText('Bluechip Growth Fund');
  await expect(dashboard.firstHoldingMeta()).toContainText(/^NSE/);
});


test('TC05 An account with no holdings shows the empty message', async ({ page, createAccount }) => {
  const account = await createAccount({ holdings: [] });

  const login = new LoginPage(page);
  await login.open();
  await login.login('Retail Banking', account.username, account.password);
  await login.expectOnDashboard();

  const dashboard = new DashboardPage(page);
  await expect(page.getByText('No holdings remaining.')).toBeVisible();
  await expect(dashboard.holdingRows()).toHaveCount(0);
});
