# QE for AI: Local E-Learning Game

Gated, game-style course (8 stages + cumulative final exam, 240 minutes planned: 5 orientation + 8 x 25 + 35)
covering JavaScript/TypeScript, Playwright, POM/Git/CI and local LLM integration with Ollama (`llama3:latest`).
Reading, quizzes and progress work without Ollama. Progress is stored in this browser only (`localStorage`).

## Prerequisites
- Node.js 20 or newer
- Optional, for the AI tutor: [Ollama](https://ollama.com)

## Setup
```bash
npm install            # commit the generated package-lock.json, then CI can use `npm ci`
cp .env.example .env   # optional; defaults already work
ollama pull llama3:latest
ollama serve           # skip if Ollama already runs as a service
```

## Run
```bash
npm run dev            # API on http://127.0.0.1:3001 and UI on http://127.0.0.1:5173
```
Open http://127.0.0.1:5173. Walkthrough: open Stage 1, read the lesson, mark it complete, submit the checkpoint test, return to the stage map and Stage 2 unlocks. After Stage 8, take the final exam (pass at 65%).

## Scripts
| Command | Purpose |
| --- | --- |
| `npm run typecheck` | Type-check client and server |
| `npm run build` | Type-check and build the UI to `client/dist` |
| `npm test` | Playwright tests using a mock Ollama (no model needed) |
| `npm run test:report` | Open the HTML report |

Tests start their own API on ports 3001/3002 and a mock Ollama on 11435, so stop `npm run dev:server` first. Port 5173 is reused if the UI is already running.

## Content and configuration
- Edit `client/src/content/course.ts` (lessons, checkpoint and final questions, answer keys, marks).
- `client/src/services/game.ts`: `FINAL_PASS_PERCENT = 65`; `CHECKPOINT_PASS_PERCENT` is configurable (`null` = submission only).
- Capstone brief: place `QE_for_AI_Learning_Game_Capstone_Project_Submission_Brief.docx` in `client/public/`. It is linked after the final exam passes and is not part of the 240 minutes.

## Manual smoke test with a real model
Run `npm run dev`, open a lesson, ask the tutor a question and confirm an AI-generated answer appears. Then stop Ollama and confirm the setup guidance shows while the course keeps working. Do not use exact-text assertions for model output.

## Troubleshooting
- **Ollama unavailable**: run `ollama serve`; check `curl http://127.0.0.1:11434`.
- **Model missing (503 "not found")**: `ollama pull llama3:latest`.
- **Port conflicts**: change `PORT` in `.env` (and the proxy in `vite.config.ts`), or stop the other process.
- **CORS**: the UI calls `/api` through the Vite proxy; the API also allows `localhost:5173`.
- **Speech not working**: the Speak button needs browser SpeechSynthesis; the text answer is always shown.
- **CI failures**: open the `playwright-report` artifact on the run; check that `npm ci` has a lockfile.

The API binds to 127.0.0.1 only. Do not expose it or Ollama to a network without authentication.
