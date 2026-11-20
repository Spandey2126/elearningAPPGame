import { course, type Stage } from '../content/course';
import type { Progress } from './progress';

export const FINAL_PASS_PERCENT = 65;
/** Configurable. null = checkpoint tests only need to be submitted (no invented cutoff). */
export const CHECKPOINT_PASS_PERCENT: number | null = null;

export type StageStatus = 'locked' | 'available' | 'in-progress' | 'completed';

export const lessonsDone = (s: Stage, p: Progress) => s.lessonIds.filter((id) => p.completedLessons.includes(id)).length;
export const allLessonsDone = (s: Stage, p: Progress) => lessonsDone(s, p) === s.lessonIds.length;
export const testSubmitted = (id: string, p: Progress) => p.attempts.some((a) => a.testId === id);
export const isStageComplete = (s: Stage, p: Progress) => allLessonsDone(s, p) && testSubmitted(s.id, p);

export function stageStatus(s: Stage, p: Progress): StageStatus {
  const prev = course.stages[s.order - 2];
  if (prev && !isStageComplete(prev, p)) return 'locked';
  if (isStageComplete(s, p)) return 'completed';
  return lessonsDone(s, p) > 0 || testSubmitted(s.id, p) ? 'in-progress' : 'available';
}

export const finalUnlocked = (p: Progress) => course.stages.every((s) => isStageComplete(s, p));
export const finalPassed = (p: Progress) => p.attempts.some((a) => a.testId === 'final' && a.percent >= FINAL_PASS_PERCENT);
export const bestPercent = (id: string, p: Progress) =>
  p.attempts.filter((a) => a.testId === id).reduce<number | null>((m, a) => (m === null ? a.percent : Math.max(m, a.percent)), null);
