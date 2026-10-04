import { expect, type Locator, type Page } from '@playwright/test';

export class StatementPage {
  constructor(private readonly page: Page) {}

  heading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  rows(): Locator {
    return this.page.getByTestId('statement-list').locator('li');
  }

  marketFilter(): Locator {
    return this.page.locator('#market-filter');
  }

  statementList(): Locator {
    return this.page.getByTestId('statement-list');
  }

  async rowCount(): Promise<number> {
    return this.rows().count();
  }

  async rowsText(): Promise<string> {
    return this.statementList().innerText();
  }

  async headingText(): Promise<string> {
    return this.heading().innerText();
  }

  async acceptTermsInFrame(): Promise<string> {
    const frame = this.page.frameLocator('iframe[title="Statement terms"]');
    const result = frame.locator('#result');

    await frame.locator('#accept').click();
    await expect(result).toHaveText('Terms accepted');

    return result.innerText();
  }
}