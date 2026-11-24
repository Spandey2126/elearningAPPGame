import { test, expect, type Locator, type Page } from '@playwright/test';
import { course, TOTAL_MINUTES } from '../client/src/content/course';
import { explainers } from '../client/src/content/explainers';

/** Seed only genuinely complete earlier stages; the stage under review stays available. */
async function openStage(page: Page, order = 1) {
  const previous = course.stages.filter(stage => stage.order < order);
  await page.addInitScript(progress => {
    localStorage.setItem('qe-ai-learning:v1', JSON.stringify(progress));
  }, {
    completedLessons: previous.flatMap(stage => stage.lessonIds),
    attempts: previous.map(stage => ({
      testId: stage.id, score: 2, total: 2, percent: 100,
      at: '2026-11-24T00:00:00.000Z',
    })),
  });
  await page.goto('/');
  await page.getByRole('button', { name: `Open Stage ${order}`, exact: true }).click();
  return page.getByRole('region', { name: explainers[`s${order}`].title, exact: true });
}

async function expectFrame(explainer: Locator, stageId: string, index: number) {
  const frame = explainers[stageId].frames[index];
  await expect(explainer.getByRole('heading', { name: frame.title, exact: true })).toBeVisible();
  await expect(explainer.getByText(frame.narration, { exact: true }).first()).toBeVisible();
  await expect(explainer.getByLabel(`Code snapshot: ${frame.title}`, { exact: true })).toHaveText(frame.code);
  const current = explainer.getByRole('list', { name: 'Concept flow', exact: true }).locator('[aria-current="step"]');
  await expect(current).toHaveCount(1);
  await expect(current).toContainText(explainers[stageId].nodes[frame.activeNode]);
}

test('every topic stage has a complete explainer inside the four-hour curriculum', () => {
  expect(TOTAL_MINUTES).toBe(240);
  expect(Object.keys(explainers).sort()).toEqual(course.stages.map(stage => stage.id).sort());
  const allIds: string[] = [];
  for (const stage of course.stages) {
    const explainer = explainers[stage.id];
    expect(explainer.stageId).toBe(stage.id);
    expect(explainer.title.trim().length).toBeGreaterThan(0);
    expect(explainer.summary.trim().length).toBeGreaterThan(0);
    expect(explainer.frames).toHaveLength(6);
    expect(explainer.nodes).toHaveLength(6);
    expect(new Set(explainer.nodes).size).toBe(explainer.nodes.length);
    allIds.push(explainer.id);
    for (const frame of explainer.frames) {
      allIds.push(frame.id);
      expect(frame.title.trim().length).toBeGreaterThan(0);
      expect(frame.narration.trim().length).toBeGreaterThan(0);
      expect(frame.code.trim().length).toBeGreaterThan(0);
      expect(Number.isInteger(frame.activeNode)).toBe(true);
      expect(frame.activeNode).toBeGreaterThanOrEqual(0);
      expect(frame.activeNode).toBeLessThan(explainer.nodes.length);
    }
    // The existing learning allocation includes this explainer; it adds no required block.
    expect(stage.learningMinutes + stage.testMinutes).toBe(25);
  }
  expect(new Set(allIds).size).toBe(allIds.length);
});

for (const stage of course.stages) {
  test(`Stage ${stage.order} opens its own narrated technical explainer`, async ({ page }, testInfo) => {
    const explainer = await openStage(page, stage.order);
    await expect(explainer).toBeVisible();
    await expect(explainer.getByText(explainers[stage.id].summary, { exact: true })).toBeVisible();
    await expectFrame(explainer, stage.id, 0);
    await expect(explainer.getByText('Included in this stage’s 20-minute learning and practice block.', { exact: false })).toBeVisible();
    await expect(explainer.getByRole('button', { name: 'Previous step', exact: true })).toBeDisabled();
    await explainer.getByRole('button', { name: 'Next step', exact: true }).click();
    await expectFrame(explainer, stage.id, 1);
    if (stage.order === 1) {
      await testInfo.attach('desktop-stage-1-explainer', {
        body: await explainer.screenshot({ animations: 'disabled' }), contentType: 'image/png',
      });
      await page.getByRole('button', { name: 'Back to stage map', exact: true }).click();
      await testInfo.attach('desktop-qe-dashboard', {
        body: await page.screenshot({ fullPage: true, animations: 'disabled' }), contentType: 'image/png',
      });
    }
  });
}

test('manual next, previous and replay controls explain every state', async ({ page }) => {
  const explainer = await openStage(page);
  const next = explainer.getByRole('button', { name: 'Next step', exact: true });
  const previous = explainer.getByRole('button', { name: 'Previous step', exact: true });
  await expect(previous).toBeDisabled();
  for (let index = 1; index < explainers.s1.frames.length; index++) {
    await next.click();
    await expectFrame(explainer, 's1', index);
  }
  await expect(next).toBeDisabled();
  await previous.click();
  await expectFrame(explainer, 's1', 4);
  await explainer.getByRole('button', { name: 'Replay from start', exact: true }).click();
  await expectFrame(explainer, 's1', 0);
  await expect(previous).toBeDisabled();
});

test('play advances, pause holds the frame, and playback stops at the end', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-24T00:00:00.000Z') });
  await page.clock.pauseAt(new Date('2026-11-24T00:00:01.000Z'));
  const explainer = await openStage(page);
  await explainer.getByRole('button', { name: 'Play explainer', exact: true }).click();
  await expect(explainer.getByRole('button', { name: 'Pause explainer', exact: true })).toBeVisible();
  await page.clock.runFor(5001);
  await expectFrame(explainer, 's1', 1);
  await explainer.getByRole('button', { name: 'Pause explainer', exact: true }).click();
  await page.clock.runFor(10000);
  await expectFrame(explainer, 's1', 1);
  await explainer.getByRole('button', { name: 'Play explainer', exact: true }).click();
  for (let index = 2; index < explainers.s1.frames.length; index++) {
    await page.clock.runFor(5001);
    await expectFrame(explainer, 's1', index);
  }
  await expect(explainer.getByRole('button', { name: 'Play explainer', exact: true })).toBeVisible();
  await page.clock.runFor(10000);
  await expectFrame(explainer, 's1', 5);
  await explainer.getByRole('button', { name: 'Play explainer', exact: true }).click();
  await expectFrame(explainer, 's1', 0);
});

test('reduced motion keeps manual steps and the complete transcript usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const explainer = await openStage(page);
  await expect(explainer.getByRole('button', { name: 'Play explainer', exact: true })).toBeDisabled();
  await expect(explainer.getByText('Reduced motion is on.', { exact: false })).toBeVisible();
  await explainer.getByRole('button', { name: 'Next step', exact: true }).click();
  await expectFrame(explainer, 's1', 1);
  await explainer.getByText('Read the full explainer transcript', { exact: true }).click();
  const transcript = explainer.locator('details');
  await expect(transcript).toHaveAttribute('open', '');
  for (const frame of explainers.s1.frames) {
    await expect(transcript.getByText(frame.narration, { exact: true })).toBeVisible();
    await expect(transcript.getByText(frame.code, { exact: true })).toBeVisible();
  }
});

test('keyboard controls have visible focus and support step-through navigation', async ({ page }) => {
  const explainer = await openStage(page);
  await explainer.getByRole('button', { name: 'Play explainer', exact: true }).focus();
  await page.keyboard.press('Tab');
  const replay = explainer.getByRole('button', { name: 'Replay from start', exact: true });
  await expect(replay).toBeFocused();
  await expect(replay).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Tab');
  const next = explainer.getByRole('button', { name: 'Next step', exact: true });
  await expect(next).toBeFocused();
  await page.keyboard.press('Enter');
  await expectFrame(explainer, 's1', 1);
  await page.keyboard.press('Shift+Tab');
  const previous = explainer.getByRole('button', { name: 'Previous step', exact: true });
  await expect(previous).toBeFocused();
  await page.keyboard.press('Space');
  await expectFrame(explainer, 's1', 0);
});

test('mobile explainer fits the viewport and all playback controls remain usable', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const explainer = await openStage(page);
  await explainer.getByRole('button', { name: 'Next step', exact: true }).click();
  await expectFrame(explainer, 's1', 1);
  const next = explainer.getByRole('button', { name: 'Next step', exact: true });
  await expect(next).toBeInViewport();
  const pageWidth = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(pageWidth.content).toBeLessThanOrEqual(pageWidth.viewport);
  const box = await explainer.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  await testInfo.attach('mobile-stage-1-explainer', {
    body: await explainer.screenshot({ animations: 'disabled' }), contentType: 'image/png',
  });
});
