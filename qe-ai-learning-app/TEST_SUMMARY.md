# QE learning game: requirements and validation

Validated on 24 November 2026 using the prepared cloud environment's Chromium, with mocked Ollama. This maps the supplied video-game context and capstone brief to the maintained application. The capstone remains a separate practical assignment outside the required four-hour course.

## Commands and results

| Command | Result |
| --- | --- |
| `npm run build` | Passed: client/server TypeScript checks and production Vite build |
| `npm test -- --config playwright.cloud.config.ts` | 42 passed |

Open the generated [Playwright HTML report](playwright-report/index.html), or run `npm run test:report`. The report includes desktop/mobile explainer and final-exam fail/pass screenshots. GitHub Actions is configured to build and run the mocked suite and upload this report; hosted execution was not performed in this session.

## Requirement coverage

| Requirement | Implementation | Automated evidence |
| --- | --- | --- |
| Orientation, eight ordered topic stages and cumulative final, within 240 minutes | `content/course.ts`, dashboard time budget | Explainer curriculum test verifies 240 minutes and existing 25-minute stage budgets |
| All eight technical concepts have instructional animations | `content/explainers.ts`, `components/TechnicalExplainer.tsx` | All stages open their own narrated flow and code snapshot, then advance correctly |
| Pause, replay, step, transcript, keyboard and reduced motion | Local React player, CSS motion preference and manual alternative | `tests/explainers.spec.ts`: playback/end/restart, manual controls, transcript, focus and mobile width |
| Locked, available, in-progress and completed stages | `services/game.ts`, stage map | Initial locks; lesson completion alone keeps the next stage locked; checkpoint submission unlocks it |
| Configurable checkpoint cutoff, without an invented default pass mark | `CHECKPOINT_PASS_PERCENT = null`, `isStageComplete` | Submission-only default and numeric-cutoff checks; all earlier stages must be complete |
| Browser-local lessons, attempts, marks and timestamps survive refresh | `services/progress.ts`, saved-attempt history | Stage persistence and final failure/retake persistence checks |
| Fixed keys and final threshold of at least 65% | `gradeQuestions`, `scoreMeetsThreshold`, `Quiz` | Exact 64% fails, exact 65% passes; legacy rounded 64.5% cannot pass |
| Real final-exam failure, retake, completion and capstone | `FinalView`, packaged DOCX | POM-backed answer submission below/above reachable threshold, badge, successful DOCX download and refresh |
| Optional lesson-grounded local tutor | Express `/api/tutor` to Ollama `POST /api/chat` | Captured POST validates context, model, non-streaming request and response contract |
| Tutor failure does not block the course | Independent local content/scoring and setup guidance | UI error followed by lesson completion; unavailable API and timeout tests |
| Bounded input and useful model errors | Express validation and Ollama client | Field types/whitespace/limits, malformed/oversized JSON, empty/malformed/non-text responses, missing model |
| CI works without a live model | Test-managed mock server and isolated contract stubs | All automated tests use controlled model behavior |
| Existing AWS game remains available | AWS tab and `/?area=aws`, separate storage | Mission validation/unlocks, guide choice, duplicate-XP prevention, persistence and mobile checks |

## Scoring boundary evidence

The existing cumulative exam has 16 two-mark questions (32 marks) spanning all eight topic stages. Its reachable scores around 65% are **20/32 = 62.5% (fail)** and **22/32 = 68.75% (pass)**. The browser journey submits those actual answers, retries, downloads the capstone, and verifies both attempts after refresh. Screenshots are attached to that test's report entry.

To verify the exact boundary without changing the reviewed exam's mark distribution, the same grading and course-completion functions run against fixed-answer 100-mark fixtures: **64/100 fails** and **65/100 passes**. A separate regression uses 129/200 = 64.5% with a legacy stored percentage of 65; it still fails. These are scoring fixtures, not evidence that the 32-mark exam can produce exactly 64% or 65%.

## Reviewer walkthrough

1. Follow `README.md` to install and run the local UI/API. The QE campaign opens first; no model is required for the learning flow.
2. Open Stage 1. Play the explainer, pause it, step backward/forward, replay and open the transcript. With reduced motion enabled, use manual steps.
3. Mark the lesson complete, return to the map, and confirm Stage 2 remains locked. Return, submit the checkpoint, and confirm Stage 2 unlocks. Refresh to verify persistence.
4. Continue the stages, or use the automated POM exam test for a reproducible final-exam failure and successful retake. Open Saved attempts for marks and timestamps. The passing screen provides the separate project brief.
5. For the optional real-model smoke check, start local Ollama with `llama3:latest`, ask a lesson question, inspect its context and AI-generated label, and try Speak/Stop if supported. Stop the model and confirm that reading and tests remain available.

The live-model smoke check and hosted GitHub Actions execution were not run in this session. Browser progress and client-side answer keys support local learning; they do not provide protected examination records. The four-hour duration is a designed first-attempt estimate rather than an enforced timer.
