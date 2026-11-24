import { test, expect } from '@playwright/test';
import { course, type StageTestQuestion } from '../client/src/content/course';
import { finalPassed, formatPercent, gradeQuestions, isStageComplete, scoreMeetsThreshold, stageStatus } from '../client/src/services/game';
import type { Progress } from '../client/src/services/progress';
import { LearningGamePage } from './pages/LearningGamePage';

const now = '2026-11-24T10:00:00.000Z';
const prerequisiteProgress = (): Progress => ({
  completedLessons: course.stages.flatMap((stage) => stage.lessonIds),
  attempts: course.stages.map((stage) => ({ testId: stage.id, score: 0, total: 2, percent: 0, at: now })),
});

const boundaryQuestions: StageTestQuestion[] = [64, 1, 35].map((marks, index) => ({
  id: `boundary-${index}`, question: `Reviewed question ${index + 1}`, options: ['Correct', 'Incorrect'], answerIndex: 0, marks, rationale: 'Fixed answer key.',
}));

test('fixed-key grading: exactly 64% fails and exactly 65% passes', () => {
  const below = gradeQuestions(boundaryQuestions, { 'boundary-0': 0, 'boundary-1': 1, 'boundary-2': 1 });
  const pass = gradeQuestions(boundaryQuestions, { 'boundary-0': 0, 'boundary-1': 0, 'boundary-2': 1 });
  expect(below).toEqual({ score: 64, total: 100, percent: 64 });
  expect(pass).toEqual({ score: 65, total: 100, percent: 65 });
  expect(scoreMeetsThreshold(below, 65)).toBe(false);
  expect(scoreMeetsThreshold(pass, 65)).toBe(true);
  expect(finalPassed({ ...prerequisiteProgress(), attempts: [...prerequisiteProgress().attempts, { testId: 'final', ...below, at: now }] })).toBe(false);
  expect(finalPassed({ ...prerequisiteProgress(), attempts: [...prerequisiteProgress().attempts, { testId: 'final', ...pass, at: now }] })).toBe(true);
});

test('rounding cannot turn 64.5% into a passing final result', () => {
  const savedRoundedAttempt = { testId: 'final', score: 129, total: 200, percent: 65, at: now };
  const progress = prerequisiteProgress();
  progress.attempts.push(savedRoundedAttempt);
  expect(finalPassed(progress)).toBe(false);
  expect(scoreMeetsThreshold(savedRoundedAttempt, 65)).toBe(false);
  expect(formatPercent(64.999)).toBe('64.99');
});

test('checkpoint cutoff is configurable and every earlier stage gates later stages', () => {
  const progress = prerequisiteProgress();
  const first = course.stages[0];
  expect(isStageComplete(first, progress, null)).toBe(true);
  expect(isStageComplete(first, progress, 60)).toBe(false);
  progress.attempts.push({ testId: first.id, score: 3, total: 5, percent: 60, at: now });
  expect(isStageComplete(first, progress, 60)).toBe(true);
  progress.completedLessons = progress.completedLessons.filter((id) => !first.lessonIds.includes(id));
  expect(stageStatus(course.stages[2], progress)).toBe('locked');
  expect(finalPassed({ ...progress, attempts: [...progress.attempts, { testId: 'final', score: 100, total: 100, percent: 100, at: now }] })).toBe(false);
});

test('lesson completion alone keeps the next stage locked', async ({ page }) => {
  const game = new LearningGamePage(page);
  await game.open();
  await page.getByRole('button', { name: 'Open Stage 1', exact: true }).click();
  await page.getByRole('button', { name: 'Mark lesson complete', exact: true }).click();
  await page.getByRole('button', { name: 'Back to stage map', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Open Stage 2', exact: true })).toBeDisabled();
});

// Find a reproducible set of reviewed questions immediately below/at the threshold.
// Current course has 32 marks: 20/32 fails, 22/32 passes. Exact 64/65 is verified above.
function examScores() {
  const combinations = new Map<number, string[]>([[0, []]]);
  for (const question of course.finalExamQuestions) {
    for (const [score, ids] of [...combinations]) combinations.set(score + question.marks, [...ids, question.id]);
  }
  const total = course.finalExamQuestions.reduce((sum, question) => sum + question.marks, 0);
  const scores = [...combinations.keys()].sort((a, b) => a - b);
  const fail = scores.filter((score) => score * 100 < 65 * total).at(-1)!;
  const pass = scores.find((score) => score * 100 >= 65 * total)!;
  return { fail, pass, total, failIds: combinations.get(fail)!, passIds: combinations.get(pass)! };
}

test('final exam fail, retake, passing badge and capstone preserve attempts after refresh', async ({ page }, testInfo) => {
  const game = new LearningGamePage(page);
  const scores = examScores();
  await game.open(prerequisiteProgress());
  await game.openFinal();
  await game.answerFinal(scores.failIds);
  await page.getByRole('button', { name: 'Submit final exam', exact: true }).click();
  await expect(await game.resultText()).toContainText('Not passed. 65% needed.');
  await expect(page.getByRole('region', { name: 'Course complete', exact: true })).toHaveCount(0);
  await testInfo.attach('final-exam-below-threshold', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });

  await page.getByRole('region', { name: 'Final exam', exact: true }).getByRole('button', { name: 'Retake', exact: true }).click();
  await game.answerFinal(scores.passIds);
  await page.getByRole('button', { name: 'Submit final exam', exact: true }).click();
  await expect(await game.resultText()).toContainText('Passed.');
  const complete = page.getByRole('region', { name: 'Course complete', exact: true });
  await expect(complete).toBeVisible();
  const brief = complete.getByRole('link', { name: 'Open the capstone project submission brief' });
  await expect(brief).toHaveAttribute('href', /Capstone_Project_Submission_Brief\.docx$/);
  const response = await page.request.get((await brief.getAttribute('href'))!);
  expect(response.ok()).toBe(true);
  expect((await response.body()).subarray(0, 2).toString()).toBe('PK');
  await testInfo.attach('final-exam-pass-badge', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });

  await page.reload();
  await game.openFinal();
  await expect(page.getByRole('region', { name: 'Course complete', exact: true })).toBeVisible();
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('qe-ai-learning:v1')!));
  expect(progress.completedLessons).toEqual(prerequisiteProgress().completedLessons);
  const attempts = progress.attempts.filter((attempt: { testId: string }) => attempt.testId === 'final');
  expect(attempts.map((attempt: { score: number }) => attempt.score)).toEqual([scores.fail, scores.pass]);
  expect(attempts.every((attempt: { at: string }) => Number.isFinite(Date.parse(attempt.at)))).toBe(true);
});
