import { type Page } from '@playwright/test';

export class SellPage {
  constructor(private readonly page: Page) {}

  async openForFirstHolding() {
    await this.page.getByRole('button', { name: 'Sell' }).first().click();
  }

  async chooseMarket(market: string) {
    await this.page.getByRole('radio', { name: market }).check();
  }

  async enterChequeBranch(branch: string) {
  await this.page.getByLabel('Branch').fill(branch);
}

  async chooseSettlement(settlement: string) {
    await this.page.getByRole('radio', { name: settlement }).check();
  }

  async enterQuantity(quantity: string) {
    await this.page.getByLabel('Quantity').fill(quantity);
  }

  async confirmDetails() {
    await this.page.getByRole('checkbox').check();
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Submit for Redemption' }).click();
  }

  get confirmationHeading() {
    return this.page.getByRole('heading', {
      name: 'Transaction submitted and under process',
    });
  }

  get status() {
    return this.page.getByText('processing', { exact: true });
  }

  get settlement() {
    return this.page.getByText('cash', { exact: true });
  }
}