import { test, expect } from '@playwright/test';

const valid = { lessonTitle: 'Variables', lessonText: 'Use const for values that do not change.', question: 'When should I use const?' };
const API = 'http://127.0.0.1:3001';

test('returns the response contract for a valid request (structure, not exact prose)', async ({ request }) => {
  const res = await request.post(`${API}/api/tutor`, { data: valid });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(typeof body.answer).toBe('string');
  expect(body.answer.length).toBeGreaterThan(0);
  expect(body.model).toBe('llama3:latest');
  expect(body.lessonTitle).toBe(valid.lessonTitle);
});

test('rejects a missing question with 400', async ({ request }) => {
  const res = await request.post(`${API}/api/tutor`, { data: { ...valid, question: '' } });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toContain('question');
});

test('rejects an over-long question with 400', async ({ request }) => {
  const res = await request.post(`${API}/api/tutor`, { data: { ...valid, question: 'x'.repeat(501) } });
  expect(res.status()).toBe(400);
});

test('returns 503 when Ollama is unreachable', async ({ request }) => {
  const res = await request.post('http://127.0.0.1:3002/api/tutor', { data: valid });
  expect(res.status()).toBe(503);
  expect((await res.json()).error).toBeTruthy();
});

for (const [field, max] of [['lessonTitle', 200], ['lessonText', 4000], ['question', 500]] as const) {
  test(`validates ${field} type, whitespace and upper bound`, async ({ request }) => {
    for (const value of [42, null, '   ', 'x'.repeat(max + 1)]) {
      const response = await request.post(`${API}/api/tutor`, { data: { ...valid, [field]: value } });
      expect(response.status()).toBe(400);
      expect((await response.json()).error).toContain(field);
    }
    const atLimit = await request.post(`${API}/api/tutor`, { data: { ...valid, [field]: 'x'.repeat(max) } });
    expect(atLimit.status()).toBe(200);
  });
}

test('rejects malformed JSON and oversized request bodies', async ({ request }) => {
  const malformed = await request.post(`${API}/api/tutor`, {
    data: '{broken', headers: { 'Content-Type': 'application/json' },
  });
  expect(malformed.status()).toBe(400);
  expect((await malformed.json()).error).toContain('Invalid JSON');

  const oversized = await request.post(`${API}/api/tutor`, { data: { ...valid, lessonText: 'x'.repeat(21000) } });
  expect(oversized.status()).toBe(413);
});
