import { test, expect } from '../../fixtures/auth';
test('Smoke Recruitment - abrir Vacancies', async ({ adminPage: page }) => {
  await page.goto('/web/index.php/recruitment/viewJobVacancy');
  await expect(page.getByRole('heading', { name: 'Vacancies' })).toBeVisible();
});
