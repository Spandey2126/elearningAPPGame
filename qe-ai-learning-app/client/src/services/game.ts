import { course, type Stage, type StageTestQuestion } from '../content/course';
import type { Progress } from './progress';

export const FINAL_PASS_PERCENT = 65;
/** Configurable. null = checkpoint tests only need to be submitted (no invented cutoff). */
export const CHECKPOINT_PASS_PERCENT: number | null = null;

export type StageStatus = 'locked' | 'available' | 'in-progress' | 'completed';
export type Score = { score: number; total: number; percent: number };

/** Grade reviewed MCQs with their available marks; keep the unrounded percentage. */
export function gradeQuestions(questions: StageTestQuestion[], answers: Record<string, number>): Score {
  const total = questions.reduce((sum, question) => sum + question.marks, 0);
  const score = questions.reduce((sum, question) => sum + (answers[question.id] === question.answerIndex ? question.marks : 0), 0);
  return { score, total, percent: total > 0 ? score / total * 100 : 0 };
}

/** Compare marks directly so a rounded 64.5% can never pass a 65% threshold. */
export function scoreMeetsThreshold(result: Pick<Score, 'score' | 'total'>, threshold: number): boolean {
  return Number.isFinite(result.score) && Number.isFinite(result.total) && result.total > 0 &&
    result.score >= 0 && result.score <= result.total && result.score * 100 >= threshold * result.total;
}

/** Truncate display decimals rather than showing a rounded-up passing percentage. */
export const formatPercent = (percent: number) => String(Math.floor(percent * 100) / 100);

export const lessonsDone = (s: Stage, p: Progress) => s.lessonIds.filter((id) => p.completedLessons.includes(id)).length;
export const allLessonsDone = (s: Stage, p: Progress) => lessonsDone(s, p) === s.lessonIds.length;
export const testSubmitted = (id: string, p: Progress) => p.attempts.some((a) => a.testId === id);
export const isStageComplete = (s: Stage, p: Progress, cutoff: number | null = CHECKPOINT_PASS_PERCENT) =>
  allLessonsDone(s, p) && p.attempts.some((a) => a.testId === s.id && (cutoff === null || scoreMeetsThreshold(a, cutoff)));

export function stageStatus(s: Stage, p: Progress): StageStatus {
  if (course.stages.some((previous) => previous.order < s.order && !isStageComplete(previous, p))) return 'locked';
  if (isStageComplete(s, p)) return 'completed';
  return lessonsDone(s, p) > 0 || testSubmitted(s.id, p) ? 'in-progress' : 'available';
}

export const finalUnlocked = (p: Progress) => course.stages.every((s) => isStageComplete(s, p));
export const finalPassed = (p: Progress) => finalUnlocked(p) && p.attempts.some((a) => a.testId === 'final' && scoreMeetsThreshold(a, FINAL_PASS_PERCENT));
export const bestPercent = (id: string, p: Progress) =>
  p.attempts.filter((a) => a.testId === id && a.total > 0).reduce<number | null>((best, a) => {
    const percent = a.score / a.total * 100;
    return best === null ? percent : Math.max(best, percent);
  }, null);
