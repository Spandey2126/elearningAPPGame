import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { chat, OllamaError, type OllamaConfig } from './ollama';
import { buildMessages } from './prompt';

export const LIMITS = { title: 200, lesson: 4000, question: 500 };

export function createApp(cfg: OllamaConfig) {
  const app = express();
  app.use(cors({ origin: ['http://127.0.0.1:5173', 'http://localhost:5173'] }));
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.post('/api/tutor', async (req: Request, res: Response) => {
    const { lessonTitle, lessonText, question } = req.body ?? {};
    const fields: Array<[string, unknown, number]> = [
      ['lessonTitle', lessonTitle, LIMITS.title],
      ['lessonText', lessonText, LIMITS.lesson],
      ['question', question, LIMITS.question],
    ];
    for (const [name, value, max] of fields) {
      if (typeof value !== 'string' || value.trim() === '') {
        return res.status(400).json({ error: `${name} is required and must be a non-empty string.` });
      }
      if (value.length > max) {
        return res.status(400).json({ error: `${name} must be at most ${max} characters.` });
      }
    }
    try {
      const answer = await chat(buildMessages(lessonTitle, lessonText, question), cfg);
      return res.json({ answer, model: cfg.model, lessonTitle });
    } catch (err) {
      const message = err instanceof OllamaError ? err.message : 'Tutor unavailable.';
      return res.status(503).json({ error: message });
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: { type?: string; status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large.' });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
    return res.status(500).json({ error: 'Unexpected server error.' });
  });
  return app;
}
