import { expect, test, type Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@nawy.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'change-me-too';

async function chooseSelectOption(page: Page, triggerId: string, optionName: RegExp) {
  await page.locator(`#${triggerId}`).click();
  await page.getByRole('option', { name: optionName }).click();
}

test('log in and create an apartment', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/apartments\/new/);

  const unitNumber = `E2E-${Date.now()}`;

  await page.getByLabel('Unit name').fill('E2E Test Unit');
  await page.getByLabel('Unit number').fill(unitNumber);
  await chooseSelectOption(page, 'projectId', /Palm Hills New Cairo/);
  await page.getByLabel('Price (EGP)').fill('2500000');
  await page.getByLabel('Area (m²)').fill('120');
  await page.getByLabel('Bedrooms').fill('2');
  await page.getByLabel('Bathrooms').fill('2');

  await page.getByRole('button', { name: 'Create apartment' }).click();

  await expect(page).toHaveURL(/\/apartments\/[0-9a-f-]+/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('E2E Test Unit');
  await expect(page.getByText(`Unit ${unitNumber}`)).toBeVisible();
});
