# QE Quest — Learning Arcade

A local-first QE learning game covering JavaScript/TypeScript, Playwright, POM/Git/CI, and local AI integration. The updated [project context](LOCAL_QE_AI_ELEARNING_APP_CONTEXT.md) matches the supplied video-game context document. The maintained application is in [`qe-ai-learning-app/`](qe-ai-learning-app/); the original ZIP remains an archive.

The QE game opens at `/`. It includes eight gated topic stages, an interactive technical explainer for every stage, checkpoint MCQs, saved attempts, XP, and a cumulative final exam. Passing requires at least 65% of the available marks, calculated from fixed answer keys without rounding up. The completion badge links to the separate [capstone submission brief](QE_for_AI_Learning_Game_Capstone_Project_Submission_Brief.docx), which is also packaged with the app and unchanged from the supplied brief.

## Run locally

Requires Node.js 20 or newer and npm.

```sh
cd qe-ai-learning-app
npm ci
npm run dev
```

Open <http://127.0.0.1:5173>. Vite proxies `/api` to the Express tutor API on port 3001; both bind to loopback. Lessons, explainers, quizzes, progression and final scoring remain usable when Ollama is stopped. The optional tutor uses local Ollama with `llama3:latest`.

The first-attempt course plan is **240 minutes**: 5 minutes orientation, eight stages of 20 minutes learning/practice (including the explainer) plus 5 minutes checkpoint, and a 35-minute final exam. Optional tutor questions, retakes, enrichment and the separate capstone project are outside this estimate.

Each explainer has Play/Pause, Replay, Previous/Next step controls, code snapshots and a full transcript. Reduced-motion mode disables automatic playback and keeps manual stepping available. Progress and attempt dates/scores are stored in the current browser on the current device; clearing browser storage clears progress.

## Validate

```sh
cd qe-ai-learning-app
npm run build
npx playwright install chromium
npm test
npm run test:report
```

In the prepared cloud environment with `/usr/bin/chromium`, use `npm test -- --config playwright.cloud.config.ts`. Stop development servers before testing. Tests and CI start mock model/API services and do not require installing or running Ollama.

See the [application README](qe-ai-learning-app/README.md) for configuration, architecture, a learner walkthrough, scoring boundary coverage, real-model smoke checks and troubleshooting. The API reads process environment variables; `.env.example` documents defaults, but `.env` is **not** loaded automatically.

## Preserved AWS adventure

Open `/?area=aws` or select **AWS fundamentals** for the existing CloudQuest game: seven console simulations (IAM, EC2, S3, VPC, RDS, CloudWatch and Budgets), three robot guides (Nova, Byte and Orbit), sequential unlocking, per-setting feedback, XP and a completion badge. It runs in the browser without an AWS account, credentials, provisioned resources or charges. AWS progress is separate from QE progress.

The cloud-island illustration was AI-generated for this project. Avatar SVGs and service-category symbols are original artwork served locally, not official AWS icons. Fonts use local system fallbacks; the app does not fetch external fonts. CloudQuest is an independent learning simulation and does not award an AWS certification.

## Update content

- `qe-ai-learning-app/client/src/content/course.ts`: reviewed lessons, checkpoint/final questions, answer keys and marks.
- `qe-ai-learning-app/client/src/content/explainers.ts`: reviewed per-stage technical diagrams, narration and code snapshots.
- `qe-ai-learning-app/client/src/services/game.ts`: stage gates, deterministic scoring and configurable checkpoint threshold.
- `qe-ai-learning-app/client/src/components/TechnicalExplainer.tsx`: accessible player and transcript.
- `qe-ai-learning-app/client/src/content/awsMissions.ts`: preserved AWS mission content.
