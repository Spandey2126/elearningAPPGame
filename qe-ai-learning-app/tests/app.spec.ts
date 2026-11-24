import { test, expect, type Page } from '@playwright/test';

async function answerFirstOption(page: Page, regionName: string) {
  const region = page.getByRole('region', { name: regionName });
  for (const group of await region.getByRole('group').all()) await group.getByRole('radio').first().check();
}

test('later stages and the final exam start locked', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'QE learning path', exact: true }).click();
  const stage2 = page.getByRole('listitem').filter({ hasText: 'Stage 2: Async JavaScript' });
  await expect(stage2.getByText('Locked', { exact: false }).first()).toBeVisible();
  await expect(stage2.getByRole('button', { name: 'Open Stage 2' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Open final exam' })).toBeDisabled();
  await expect(page.getByText('240 minutes maximum', { exact: false })).toBeVisible();
});

test('stage gate: test needs the lesson, then submission unlocks the next stage and persists', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'QE learning path', exact: true }).click();
  await page.getByRole('button', { name: 'Open Stage 1' }).click();
  await expect(page.getByText('Mark the lesson complete to unlock this test.')).toBeVisible();

  await page.getByRole('button', { name: 'Mark lesson complete' }).click();
  await answerFirstOption(page, 'Checkpoint test');
  await page.getByRole('button', { name: 'Submit test' }).click();
  await expect(page.getByRole('region', { name: 'Checkpoint test' }).getByText('Score:', { exact: false })).toBeVisible();

  await page.getByRole('button', { name: 'Back to stage map' }).click();
  await expect(page.getByRole('button', { name: 'Open Stage 2' })).toBeEnabled();

  await page.reload();
  await page.getByRole('button', { name: 'QE learning path', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Open Stage 2' })).toBeEnabled();
});

test('tutor shows an AI-generated label using the mocked model', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'QE learning path', exact: true }).click();
  await page.getByRole('button', { name: 'Open Stage 1' }).click();
  await page.getByLabel('Your question about this lesson').fill('When should I use const?');
  await page.getByRole('button', { name: 'Ask tutor' }).click();
  await expect(page.getByText('AI-generated answer')).toBeVisible();
  await expect(page.getByText('Lesson context used')).toBeVisible();
});

test('tutor failure shows setup guidance and the course stays usable', async ({ page }) => {
  await page.route('**/api/tutor', (route) => route.fulfill({ status: 503, json: { error: 'Cannot reach Ollama.' } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'QE learning path', exact: true }).click();
  await page.getByRole('button', { name: 'Open Stage 1' }).click();
  await page.getByLabel('Your question about this lesson').fill('Hello?');
  await page.getByRole('button', { name: 'Ask tutor' }).click();
  await expect(page.getByRole('alert')).toContainText('ollama pull llama3:latest');
  await page.getByRole('button', { name: 'Mark lesson complete' }).click();
  await expect(page.getByRole('button', { name: /Lesson complete/ })).toBeVisible();
});
