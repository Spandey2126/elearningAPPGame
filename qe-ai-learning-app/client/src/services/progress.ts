export type Attempt = { testId: string; score: number; total: number; percent: number; at: string };
export type Progress = { completedLessons: string[]; attempts: Attempt[] };

const KEY = 'qe-ai-learning:v1';
const empty = (): Progress => ({ completedLessons: [], attempts: [] });

function validAttempt(value: unknown): value is Attempt {
  if (!value || typeof value !== 'object') return false;
  const a = value as Attempt;
  return typeof a.testId === 'string' && typeof a.at === 'string' && !Number.isNaN(Date.parse(a.at)) &&
    Number.isFinite(a.score) && Number.isFinite(a.total) && a.total > 0 && a.score >= 0 && a.score <= a.total;
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const p: unknown = JSON.parse(raw);
    if (!p || typeof p !== 'object') return empty();
    const saved = p as Partial<Progress>;
    return {
      completedLessons: Array.isArray(saved.completedLessons) ? [...new Set(saved.completedLessons.filter((id) => typeof id === 'string'))] : [],
      // Recalculate legacy rounded percentages from marks. Invalid entries do not crash the course.
      attempts: Array.isArray(saved.attempts) ? saved.attempts.filter(validAttempt).map((a) => ({ ...a, percent: a.score / a.total * 100 })) : [],
    };
  } catch {
    return empty();
  }
}

export function saveProgress(p: Progress): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
}
