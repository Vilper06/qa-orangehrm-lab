import { test, expect } from '../../fixtures/auth';
test('Smoke PIM - abrir y buscar empleado', async ({ adminPage: page }) => {
  await page.goto('/web/index.php/pim/viewEmployeeList');
  await expect(page.getByRole('heading', { name: 'PIM' })).toBeVisible();
  await page.getByPlaceholder('Type for hints...').first().fill('Admin');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.oxd-table-card, .oxd-text--span').first()).toBeVisible();
});
