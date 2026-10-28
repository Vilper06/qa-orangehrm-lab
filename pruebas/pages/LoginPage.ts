import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}
  async goto() {
    await this.page.goto('/web/index.php/auth/login');
    await expect(this.page.getByPlaceholder('Username')).toBeVisible();
  }
  async login(user: string, pass: string) {
    if (user) await this.page.getByPlaceholder('Username').fill(user);
    if (pass) await this.page.getByPlaceholder('Password').fill(pass);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
  async logout() {
    await this.page.locator('.oxd-userdropdown-tab').click();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
  }
}
