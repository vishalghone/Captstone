import { type Locator, type Page } from '@playwright/test';

export class ConfirmationPage {
  constructor(private readonly page: Page) {}

  heading(): Locator {
    return this.page.getByTestId('confirmation-heading');
  }

  status(): Locator {
    return this.page.getByTestId('transaction-status');
  }

  settlement(): Locator {
    return this.page.locator('dt:text-is("Settlement") + dd');
  }

  quantity(): Locator {
    return this.page.locator('dt:text-is("Quantity") + dd');
  }

  async headingText(): Promise<string> {
    return this.heading().innerText();
  }

  async statusText(): Promise<string> {
    return this.status().innerText();
  }

  async settlementText(): Promise<string> {
    return this.settlement().innerText();
  }

  async quantityText(): Promise<string> {
    return this.quantity().innerText();
  }
}