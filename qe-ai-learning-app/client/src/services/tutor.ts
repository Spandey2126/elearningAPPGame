export type TutorRequest = { lessonTitle: string; lessonText: string; question: string };
export type TutorResponse = { answer: string; model: string; lessonTitle: string };

export async function askTutor(body: TutorRequest): Promise<TutorResponse> {
  let res: Response;
  try {
    res = await fetch('/api/tutor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    throw new Error('The tutor API is not running. Start it with "npm run start:server".');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Tutor request failed (${res.status}).`);
  return data as TutorResponse;
}
