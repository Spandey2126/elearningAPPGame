import type { ChatMessage } from './prompt';

export class OllamaError extends Error {}

export type OllamaConfig = { baseUrl: string; model: string; timeoutMs: number };

export async function chat(messages: ChatMessage[], cfg: OllamaConfig): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), cfg.timeoutMs);
  try {
    const res = await fetch(`${cfg.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: cfg.model, messages, stream: false }),
      signal: ctrl.signal,
    });
    if (res.status === 404) {
      throw new OllamaError(`Model "${cfg.model}" not found. Run: ollama pull ${cfg.model}`);
    }
    if (!res.ok) throw new OllamaError(`Ollama returned HTTP ${res.status}.`);
    let data: { message?: { content?: unknown } } | null;
    try {
      data = await res.json();
    } catch (err) {
      if (ctrl.signal.aborted) throw err;
      throw new OllamaError('Ollama returned an invalid JSON response.');
    }
    if (typeof data?.message?.content !== 'string') {
      throw new OllamaError('Ollama returned an invalid response: expected message.content text.');
    }
    const content = data.message.content.trim();
    if (!content) throw new OllamaError('Ollama returned an empty response.');
    return content;
  } catch (err) {
    if (err instanceof OllamaError) throw err;
    if ((err as Error).name === 'AbortError') throw new OllamaError('Ollama timed out.');
    throw new OllamaError(`Cannot reach Ollama at ${cfg.baseUrl}. Start it with "ollama serve".`);
  } finally {
    clearTimeout(timer);
  }
}
