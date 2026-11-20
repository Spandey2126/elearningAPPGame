import { createApp } from './app';

const port = Number(process.env.PORT ?? 3001);
const app = createApp({
  baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434',
  model: process.env.OLLAMA_MODEL ?? 'llama3:latest',
  timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS ?? 60000),
});
// Loopback only: do not expose to a shared network without authentication.
app.listen(port, '127.0.0.1', () => console.log(`Tutor API on http://127.0.0.1:${port}`));
