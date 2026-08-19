import { expect, test } from '@playwright/test';

test('browse the listing and open a details page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText(/\d+ apartments/)).toBeVisible();

  const firstListingLink = page
    .getByRole('link')
    .filter({ has: page.getByRole('heading', { level: 2 }) })
    .first();
  const unitName = await firstListingLink.getByRole('heading', { level: 2 }).innerText();

  await firstListingLink.click();

  await expect(page).toHaveURL(/\/apartments\/[0-9a-f-]+/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(unitName);
  await expect(page.getByRole('link', { name: 'Back to listings' })).toBeVisible();
});
