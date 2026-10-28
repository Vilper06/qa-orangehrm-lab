import { Page, Locator, expect } from '@playwright/test';

export const field = (page: Page, label: string): Locator =>
  page.locator('.oxd-input-group').filter({ has: page.locator('label').filter({ hasText: new RegExp('^\\s*' + label + '\\s*$') }) });

export const fillField = async (page: Page, label: string, v: string) => { await field(page, label).locator('input, textarea').first().fill(v); };

export async function pick(page: Page, label: string, option: string) {
  await field(page, label).locator('.oxd-select-text').click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

export async function autocomplete(page: Page, label: string, typed: string, option?: string) {
  const inp = field(page, label).locator('input').first();
  await inp.fill('');
  await inp.pressSequentially(typed, { delay: 40 });
  const opt = page.locator('.oxd-autocomplete-option').filter({ hasText: option ?? typed }).first();
  await opt.waitFor({ timeout: 15000 });
  await opt.click();
}

/** Textos de validacion/alertas/toasts visibles */
export async function msgs(page: Page): Promise<string[]> {
  const t = await page.locator('.oxd-input-field-error-message, .oxd-alert-content-text, .oxd-text--toast-message, .oxd-text--toast-title').allInnerTexts();
  return t.map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

export async function toast(page: Page): Promise<string> {
  const t = page.locator('.oxd-toast').first();
  await t.waitFor({ timeout: 15000 });
  return (await t.innerText()).replace(/\s+/g, ' ').trim();
}

export async function goto(page: Page, p: string) {
  await page.goto('/web/index.php/' + p);
  await page.waitForLoadState('networkidle');
}

export async function login(page: Page, user: string, pass: string) {
  await page.goto('/web/index.php/auth/login');
  await page.getByPlaceholder('Username').fill(user);
  await page.getByPlaceholder('Password').fill(pass);
  await page.getByRole('button', { name: 'Login' }).click();
}

export async function loginOk(page: Page, user: string, pass: string) {
  await login(page, user, pass);
  await page.waitForURL(/dashboard\/index/);
}

/** n-esimo dia habil a partir de hoy (yyyy-mm-dd) */
export function businessDay(n: number, from = new Date()): string {
  const d = new Date(from); let c = 0;
  while (c < n) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) c++; }
  const p2 = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}

/** Campo de fecha: limpia y escribe (fill concatena con el valor autocompletado) */
export async function setDate(page: Page, label: string, v: string) {
  const i = field(page, label).locator('input').first();
  await i.click(); await i.press('Control+A'); await i.press('Backspace');
  await i.pressSequentially(v, { delay: 20 });
}
