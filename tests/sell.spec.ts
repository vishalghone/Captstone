import { test, expect } from '../fixtures';
import { SellPage } from '../pages/SellPage';
import type { APIRequestContext } from '@playwright/test';

async function holdingQuantity(
  api: APIRequestContext,
  accountId: string,
  holdingName: string,
): Promise<number> {
 const response = await api.get(`http://localhost:4000/api/accounts/${accountId}/holdings`);
  expect(response.ok()).toBeTruthy();

  const holdings = (await response.json()) as {
    name: string;
    quantity: number;
  }[];

  const holding = holdings.find(({ name }) => name === holdingName);
  if (!holding) {
    throw new Error(`Holding not found: ${holdingName}`);
  }

  return holding.quantity;
}


test('TC07 Selling on NSE with cash settlement is confirmed', async ({ loggedInPage }) => {
  const sell = new SellPage(loggedInPage.page);

  await sell.openForFirstHolding();
  await sell.chooseMarket('NSE');
  await sell.chooseSettlement('Cash');
  await sell.enterQuantity('1');
  await sell.confirmDetails();
  await sell.submit();

  await expect(sell.confirmationHeading).toBeVisible();
  await expect(sell.status).toBeVisible();
  
  await expect(sell.settlement).toBeVisible();
});


test('TC08 Cheque settlement without a branch is rejected', async ({ loggedInPage }) => {
  const { page } = loggedInPage;
  const sell = new SellPage(page);

  await sell.openForFirstHolding();
  await sell.chooseSettlement('Cheque');
  await sell.enterQuantity('1');
  await sell.confirmDetails();
  await sell.submit();

  await expect(page.getByRole('alert')).toHaveText('Cheque settlement requires a branch');
  await expect(page).toHaveURL(/\/sell\//);
});

test('TC09 Cheque settlement with a branch is confirmed', async ({ loggedInPage }) => {
  const { page } = loggedInPage;
  const sell = new SellPage(page);

  await sell.openForFirstHolding();
  await sell.chooseMarket('NSE');
  await sell.chooseSettlement('Cheque');
  await sell.enterChequeBranch('Fort, Mumbai');
  await sell.enterQuantity('1');
  await sell.confirmDetails();
  await sell.submit();

  await expect(page.getByText('cheque', { exact: true })).toBeVisible();
  await expect(sell.status).toHaveText('processing');
});


test('TC10 Selling more than is held is rejected', async ({ loggedInPage }) => {
  const { page } = loggedInPage;
  const sell = new SellPage(page);

  await sell.openForFirstHolding();
  await sell.enterQuantity('9999');
  await sell.confirmDetails();
  await sell.submit();

  await expect(page.getByRole('alert')).toHaveText(/^Only .* units available to sell$/);
});


test('TC11 A sale reduces the quantity held on the server', async ({ loggedInPage, api }) => {
  const { page, account } = loggedInPage;

  const before = await holdingQuantity(api, account.accountId, 'Bluechip Growth Fund');

  const sell = new SellPage(page);
  await sell.openForFirstHolding();
  await sell.enterQuantity('2');
  await sell.confirmDetails();
  await sell.submit();
  await expect(sell.confirmationHeading).toBeVisible();

  const after = await holdingQuantity(api, account.accountId, 'Bluechip Growth Fund');
  expect(after).toBe(before - 2);
});
