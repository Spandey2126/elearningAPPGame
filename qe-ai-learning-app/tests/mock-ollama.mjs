// Minimal fake Ollama for tests/CI. Returns a fixed reply; no model required.
import http from 'node:http';

http.createServer((req, res) => {
  if (req.method === 'GET') { res.end('ok'); return; }
  req.resume();
  req.on('end', () => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ model: 'llama3:latest', message: { role: 'assistant', content: 'Mock tutor answer: use const for bindings you do not reassign.' } }));
  });
}).listen(11435, '127.0.0.1');
