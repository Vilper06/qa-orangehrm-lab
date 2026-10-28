import { Page, expect } from '@playwright/test';

export class ModulePage {
  constructor(private page: Page) {}
  async open(urlPath: string, heading: RegExp | string) {
    await this.page.goto(`/web/index.php/${urlPath}`);
    await expect(this.page.locator('.oxd-topbar-header-breadcrumb, h5').first()).toBeVisible();
    await expect(this.page.getByText(heading).first()).toBeVisible();
  }
}
