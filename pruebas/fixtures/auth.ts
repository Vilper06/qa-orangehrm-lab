import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export const ADMIN_USER = process.env.OHRM_ADMIN_USER ?? 'Admin';
export const ADMIN_PASS = process.env.OHRM_ADMIN_PASSWORD ?? '';

// Fixture: pagina ya autenticada como Admin
export const test = base.extend<{ adminPage: import('@playwright/test').Page }>({
  adminPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(ADMIN_USER, ADMIN_PASS);
    await page.waitForURL(/dashboard\/index/);
    await use(page);
  },
});
export { expect } from '@playwright/test';
