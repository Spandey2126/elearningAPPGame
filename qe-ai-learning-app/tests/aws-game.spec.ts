import { test, expect } from '@playwright/test';
import { missions } from '../client/src/content/awsMissions';

test('AWS adventure validates configurations, unlocks missions, persists progress and avoids duplicate XP', async ({ page }) => {
  await page.goto('/?area=aws');
  await expect(page.getByRole('heading', { name: /Your cloud adventure/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start EC2 mission', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Choose Byte', exact: true }).click();
  await page.getByRole('button', { name: 'Start IAM mission', exact: true }).click();
  await expect(page.getByText('Byte’s field notes')).toBeVisible();
  await page.getByRole('button', { name: 'Validate configuration' }).click();
  await expect(page.getByRole('alert')).toContainText('3 highlighted settings');
  await page.getByLabel('Team access method').selectOption('Share the root password');
  await page.getByLabel('Permission scope').selectOption('AdministratorAccess');
  await page.getByLabel('Multi-factor authentication').selectOption('Password only');
  await page.getByRole('button', { name: 'Validate configuration' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Back to mission map', exact: false }).click();
  await expect(page.getByRole('button', { name: 'Start EC2 mission', exact: true })).toBeDisabled();

  for (const m of missions) {
    await page.getByRole('button', { name: `Start ${m.service} mission`, exact: true }).click();
    for (const f of m.fields) await page.getByLabel(f.label, { exact: true }).selectOption(f.correct);
    await page.getByRole('button', { name: 'Validate configuration' }).click();
    await expect(page.getByRole('heading', { name: 'Mission accomplished!' })).toBeVisible();
    await page.getByRole('button', { name: 'Return to mission map', exact: false }).click();
  }
  await expect(page.getByText('BADGE UNLOCKED', { exact: true })).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'AWS learning path completion' })).toHaveAttribute('value', '7');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Choose Byte', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('BADGE UNLOCKED', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Replay IAM mission', exact: true }).click();
  for (const f of missions[0].fields) await page.getByLabel(f.label, { exact: true }).selectOption(f.correct);
  await page.getByRole('button', { name: 'Validate configuration' }).click();
  await page.getByRole('button', { name: 'Return to mission map', exact: false }).click();
  await expect(page.getByRole('progressbar', { name: 'AWS learning path completion' })).toHaveAttribute('value', '7');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('cloudquest.aws.v1')!));
  expect(saved.completed).toHaveLength(7);
});

test('mobile map fits the viewport and generated art loads', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?area=aws');
  const art = page.getByRole('img', { name: /Floating cloud islands/ });
  await expect(art).toBeVisible();
  await expect(art).toHaveJSProperty('naturalWidth', 1672);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: '/tmp/cloudquest-mobile.png', fullPage: true });
});

test('invalid stored progress falls back safely', async ({ page }) => {
  await page.goto('/?area=aws');
  await page.evaluate(() => localStorage.setItem('cloudquest.aws.v1', '{broken'));
  await page.reload();
  await expect(page.getByRole('button', { name: 'Start IAM mission', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Start EC2 mission', exact: true })).toBeDisabled();
});
