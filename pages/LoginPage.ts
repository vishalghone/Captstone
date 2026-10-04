import { type Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/login');
  }

  async login(area: string, username: string, password: string) {
    await this.page.getByLabel('Business area').selectOption(area);
    await this.page.getByLabel('Username').fill(username);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Log In' }).click();
  }

  get errorMessage() {
    return this.page.getByRole('alert');
  }

  async expectOnDashboard() {
    await expect(this.page).toHaveURL(/\/dashboard/);
  }
}
