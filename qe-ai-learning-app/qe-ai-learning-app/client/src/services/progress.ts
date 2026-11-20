export type Attempt = { testId: string; score: number; total: number; percent: number; at: string };
export type Progress = { completedLessons: string[]; attempts: Attempt[] };

const KEY = 'qe-ai-learning:v1';
const empty = (): Progress => ({ completedLessons: [], attempts: [] });

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const p = JSON.parse(raw) as Progress;
    return { completedLessons: p.completedLessons ?? [], attempts: p.attempts ?? [] };
  } catch {
    return empty();
  }
}

export function saveProgress(p: Progress): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
}
