import { type Locator, type Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  holdingRows(): Locator {
    return this.page.locator('ul.holdings-list > li');
  }

  firstHoldingName(): Locator {
    return this.holdingRows().first().locator('div p').first();
  }

  firstHoldingMeta(): Locator {
    return this.holdingRows().first().locator('div p').nth(1);
  }
}