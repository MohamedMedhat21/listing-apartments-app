import { expect, test } from '@playwright/test';

test('search narrows listing results', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText(/40 apartments/)).toBeVisible();

  await page.getByLabel('Search apartments').fill('F-111');

  await expect(page).toHaveURL(/[?&]q=F-111/, { timeout: 10_000 });
  await expect(page.getByText(/Showing 1 apartment/)).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /F-111/i })).toBeVisible();
});
