import { test, expect } from '@playwright/test';
import http, { type Server, type RequestListener } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from '../server/src/app';

const valid = {
  lessonTitle: 'Variables',
  lessonText: 'Use const for bindings that will not be reassigned.',
  question: 'When should I use const?',
};

async function start(server: Server): Promise<string> {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => { server.off('error', reject); resolve(); });
  });
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

async function withTutor(handler: RequestListener, run: (url: string) => Promise<void>, timeoutMs = 1000) {
  const model = http.createServer(handler);
  const baseUrl = await start(model);
  const api = http.createServer(createApp({ baseUrl, model: 'llama3:latest', timeoutMs }));
  try {
    await run(await start(api));
  } finally {
    await Promise.all([api, model].map((server) => new Promise<void>((resolve) => {
      server.close(() => resolve());
      server.closeAllConnections();
    })));
  }
}

test('sends a grounded non-streaming POST to Ollama and returns the tutor contract', async ({ request }) => {
  let captured: { method?: string; path?: string; body?: Record<string, unknown> } = {};
  await withTutor((req, res) => {
    let text = '';
    req.on('data', (chunk) => { text += chunk; });
    req.on('end', () => {
      captured = { method: req.method, path: req.url, body: JSON.parse(text) };
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: { content: '  A useful explanation.  ' } }));
    });
  }, async (url) => {
    const response = await request.post(`${url}/api/tutor`, { data: valid });
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ model: 'llama3:latest', lessonTitle: valid.lessonTitle });
    expect((await response.json()).answer.trim().length).toBeGreaterThan(0);
    expect(captured).toMatchObject({ method: 'POST', path: '/api/chat', body: { model: 'llama3:latest', stream: false } });
    const messages = captured.body?.messages as Array<{ role: string; content: string }>;
    expect(messages.some((m) => m.role === 'system')).toBe(true);
    expect(messages.map((m) => m.content).join('\n')).toContain(valid.lessonText);
    expect(messages.map((m) => m.content).join('\n')).toContain(valid.question);
  });
});

test('returns 503 when the model times out and the API remains usable', async ({ request }) => {
  await withTutor((req) => { req.resume(); }, async (url) => {
    const response = await request.post(`${url}/api/tutor`, { data: valid });
    expect(response.status()).toBe(503);
    expect((await response.json()).error).toContain('timed out');
    expect((await request.get(`${url}/api/health`)).ok()).toBe(true);
  }, 150);
});

for (const scenario of [
  { name: 'empty text', body: JSON.stringify({ message: { content: '   ' } }), error: 'empty response' },
  { name: 'non-text content', body: JSON.stringify({ message: { content: 42 } }), error: 'expected message.content text' },
  { name: 'missing message', body: JSON.stringify({ answer: 'not the Ollama schema' }), error: 'expected message.content text' },
  { name: 'null body', body: 'null', error: 'expected message.content text' },
  { name: 'malformed JSON', body: '{broken', error: 'invalid JSON response' },
]) {
  test(`returns a useful 503 for model ${scenario.name}`, async ({ request }) => {
    await withTutor((req, res) => {
      req.resume();
      res.setHeader('Content-Type', 'application/json');
      res.end(scenario.body);
    }, async (url) => {
      const response = await request.post(`${url}/api/tutor`, { data: valid });
      expect(response.status()).toBe(503);
      expect((await response.json()).error).toContain(scenario.error);
    });
  });
}

test('missing model reports the setup command', async ({ request }) => {
  await withTutor((req, res) => {
    req.resume(); res.statusCode = 404; res.end('{}');
  }, async (url) => {
    const response = await request.post(`${url}/api/tutor`, { data: valid });
    expect(response.status()).toBe(503);
    expect((await response.json()).error).toContain('ollama pull llama3:latest');
  });
});
