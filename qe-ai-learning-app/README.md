# QE Quest: Local QE for AI Learning Game

A React/TypeScript game with eight ordered QE topic stages and a cumulative final MCQ exam. The QE campaign opens at `/`. The canonical requirements are in [the updated context document](../LOCAL_QE_AI_ELEARNING_APP_CONTEXT.md).

## Prerequisites and installation

Use Node.js 20 or newer with npm; CI uses Node.js 22. Run commands below from this `qe-ai-learning-app` directory. Dependencies are pinned by the committed `package-lock.json`.

```sh
npm ci
npm run dev
```

Open <http://127.0.0.1:5173>. `npm run dev` starts Vite on port 5173 and the Express tutor API on port 3001. Both bind to `127.0.0.1`. The UI proxies `/api` to Express. To start them separately, use `npm run start:server` and `npm run dev:client` in separate terminals.

Ollama is optional for taking the course. To enable the tutor, install [Ollama](https://ollama.com), then run:

```sh
ollama pull llama3:latest
ollama serve
```

Skip `ollama serve` if its service is already running. Initial package/model downloads require network access. After setup, course reading, local technical explainers, assessments, progress and scoring work without Ollama or a cloud model service. This is a local application, not an installable offline PWA.

## Learner walkthrough and time budget

1. Read the 5-minute orientation and open Stage 1. Later stages and the final exam begin locked.
2. Read the lesson, inspect the code, use the technical explainer, try the guided lab and knowledge check, then select **Mark lesson complete**.
3. Submit that stage's checkpoint MCQ. With the default configuration, submission plus completed lessons completes the stage; a low checkpoint score does not impose an invented pass cutoff.
4. Return to the stage map. The next stage unlocks. Repeat through Stage 8; each completed topic stage awards 100 XP.
5. Take the 35-minute cumulative final exam. A score of at least 65% of available marks unlocks the completion badge and an additional 200 XP. A lower score preserves the attempt and allows a retake without resetting lessons.
6. Download the capstone brief from the completion screen. The badge indicates completion of this course and is not an externally accredited credential.

The planned required path totals **240 minutes**: 5 minutes orientation + 8 × (20 minutes learning/practice + 5 minutes checkpoint) + 35 minutes final. Every explainer fits within its stage's existing 20-minute learning/practice block. Tutor questions, retakes, optional extensions and separate capstone implementation/submission are outside that first-attempt estimate. These are planning estimates, not enforced countdown timers.

The stage map shows locked, available, in-progress and completed states with text labels. Progress, checkpoint/final attempts, score and timestamp are saved in `localStorage` in this browser on this device. Refresh restores saved progress. Clearing site data removes it; there is no account or cross-device synchronization. Do not enter secrets or personal/production information in tutor questions.

## Technical explainers and accessibility

Every topic stage includes reviewed local diagram frames, narration and code snapshots: JavaScript value flow, async/types, Playwright locators and waits, UI/API lifecycle, POM delegation, GitHub CI, Ollama request/response flow, and mocked AI contracts in CI.

Use **Play/Pause**, **Replay from start**, **Previous step** and **Next step**, or open **Read the full explainer transcript**. Playback starts only after selecting Play and pauses when the document is hidden. `prefers-reduced-motion` disables automatic playback and motion effects while preserving manual stepping and all text. Diagrams illustrate reviewed lesson content; they do not execute code or verify generated model output. Controls support keyboard navigation and visible focus. The tutor avatar shows textual interaction states; optional browser speech keeps the answer visible and provides Stop.

## Architecture and assessment rules

```text
Browser: React/TypeScript + versioned course/explainer data + localStorage
   |
   | POST /api/tutor (current lesson title, excerpt, learner question)
   v
Local Express API: input limits + lesson-grounded prompt + timeout/error handling
   |
   | POST /api/chat, model llama3:latest, stream false
   v
Local Ollama -> message.content -> labelled AI-generated tutor answer
```

- `client/src/content/course.ts` owns stable lesson/stage IDs, reviewed explanations and fixed MCQ keys/marks. `content/explainers.ts` holds instructional frames separately from React layout.
- `services/game.ts` determines gates and score outcomes. Every earlier stage must be complete before a later stage opens. A stage requires all its lessons and an eligible checkpoint attempt. `CHECKPOINT_PASS_PERCENT = null` means submission only; setting a numeric threshold enforces it. The fixed final threshold is `FINAL_PASS_PERCENT = 65`.
- Quiz grading sums fixed marks. Passing compares raw earned/available marks, so rounding 64.5% to 65 cannot produce a pass. Attempts remain separate from lesson completion; best scores and attempt history remain visible after refresh.
- The cumulative final includes reviewed questions from every topic stage and unlocks after all eight stages. The supplied exam totals 32 marks in two-mark questions, so exact 64% and 65% cannot occur with those questions: 20/32 fails and 22/32 passes.
- AI explains optional questions. It never grades MCQs, decides stage completion or awards the badge. Replies are labelled AI-generated and unverified. Tutor input limits, malformed/empty responses, missing models, service failures and timeouts have explicit error responses. Reading and assessments remain usable during tutor failure.
- `client/public/QE_for_AI_Learning_Game_Capstone_Project_Submission_Brief.docx` is already packaged and linked after a passing final. Its bytes match the supplied brief. The repository ZIP is an older archive, not the maintained source.

The API and Ollama are intended for single-computer loopback use. Add authentication and appropriate network controls before exposing either to a shared network. Client-side quiz keys/progress are learning aids, not tamper-resistant examination security.

## Configuration

[`.env.example`](.env.example) documents these non-secret process environment variables. The server does **not** automatically load a `.env` file.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | Express listening port |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Local model server |
| `OLLAMA_MODEL` | `llama3:latest` | Model tag |
| `OLLAMA_TIMEOUT_MS` | `60000` | Model request timeout |

For example, in a POSIX shell:

```sh
OLLAMA_BASE_URL=http://127.0.0.1:11434 OLLAMA_MODEL=llama3:latest OLLAMA_TIMEOUT_MS=60000 npm run dev
```

Alternatively export variables before starting Node. Changing `PORT` also requires updating the `/api` proxy target in `vite.config.ts`; Vite's own host/port are configured there. Defaults work without setting any variables. No credentials belong in source or browser storage.

## Build, automated checks and evidence

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm test
npm run test:report
```

`npm run build` type-checks client and server and builds the UI to `client/dist`. There is no configured lint command. On Linux, `npx playwright install --with-deps chromium` can also install required OS libraries when permitted. In the prepared cloud environment, use its installed Chromium:

```sh
npm test -- --config playwright.cloud.config.ts
```

Stop development servers first. Tests start mock Ollama on 11435, the tutor API on 3001, an API with an unavailable model on 3002, and the UI on 5173. The default local config can reuse Vite on 5173; CI starts a fresh instance. Contract tests also use temporary loopback ports. No test requires a live model or a downloaded LLM.

| Coverage | Test source |
| --- | --- |
| All eight explainers, playback/pause, manual steps, reduced motion, transcripts, keyboard and mobile layout | `tests/explainers.spec.ts` |
| Initial stage/final locks, checkpoint gates and persistence, tutor success/error UI | `tests/app.spec.ts` |
| POM learner interactions, lesson-only gate, final fail/retake/success, badge, capstone download and preserved attempts | `tests/assessment.spec.ts`, `tests/pages/LearningGamePage.ts` |
| Exact 64% fail / 65% pass using reviewed-key 100-mark fixtures; rounding regression; configurable checkpoints and prior-stage gates | `tests/assessment.spec.ts` |
| API contract, input type/whitespace/length bounds, malformed/oversized JSON and unavailable model | `tests/tutor-api.spec.ts` |
| Grounded POST request, response shape, timeout, malformed/empty/non-text model output and missing model | `tests/tutor-contract.spec.ts` |

The 100-mark boundary fixtures verify the exact threshold independently of the 32-mark course question set; the UI test submits real course questions immediately below/above its reachable threshold. It attaches screenshots for representative final fail/pass states. Model tests assert structure, request contracts and state transitions rather than matching one generated sentence.

See [TEST_SUMMARY.md](TEST_SUMMARY.md) for the requirement-to-test mapping and validation results.

Playwright writes an HTML report to `playwright-report/` and traces on first retry under `test-results/`. Run `npm run test:report` to review the latest local results. The GitHub Actions workflow runs on pushes to `main` and pull requests: Node 22, `npm ci`, build, Chromium installation, mocked-model tests and report upload. A local passing result does not establish that a hosted workflow has run; use the Actions run and uploaded report for CI evidence.

## Manual real-model smoke check

Start Ollama with `llama3:latest` available and run `npm run dev`. Open Stage 1, ask a lesson question, and confirm the thinking state, AI-generated answer label and lesson-context details. Check the response is relevant without requiring exact wording. Try optional Speak/Stop where supported. Stop Ollama, ask again, and confirm setup guidance appears while lesson completion and the checkpoint still work. Live model wording and accuracy require human review; automated CI uses mocks.

## Troubleshooting

- **Ollama unavailable:** start `ollama serve`; check `curl http://127.0.0.1:11434` and the process's `OLLAMA_BASE_URL`.
- **Model missing:** run `ollama pull llama3:latest`, or set `OLLAMA_MODEL` to a locally installed model tag.
- **Timeout:** cold model loading can be slow; inspect the Ollama service, then increase `OLLAMA_TIMEOUT_MS` through the launching process if appropriate.
- **Port conflict:** stop the conflicting development process or change the app's configured port/proxy together. Tests expect their configured ports to be free.
- **CORS/API error:** use the Vite URL and relative `/api` requests. Express permits `http://127.0.0.1:5173` and `http://localhost:5173`.
- **Speech unavailable:** browser/OS voice support varies; use the visible answer text. No speech service is required for the course.
- **No animation:** with reduced motion enabled, manual steps and the transcript are the intended behavior.
- **CI failure:** inspect the `playwright-report` artifact for assertions, screenshots and traces; check lockfile installation and browser setup.

The Nova SVG robot guide is served locally for the QE hero and tutor. Course content, explainers and guide imagery do not require external animation, font or avatar services.
