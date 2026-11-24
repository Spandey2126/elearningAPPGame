// Reviewed teaching diagrams, not recordings of an executing program.
// These activities fit inside each stage's existing 20-minute learning block.
export type ExplainerFrame = {
  id: string;
  title: string;
  narration: string;
  code: string;
  activeNode: number;
};

export type TechnicalExplainer = {
  id: string;
  stageId: string;
  title: string;
  summary: string;
  nodes: string[];
  frames: ExplainerFrame[];
};

export const explainers: Record<string, TechnicalExplainer> = {
  s1: {
    id: 'javascript-data-flow', stageId: 's1',
    title: 'Follow a value through a test utility',
    summary: 'Trace variables, a function, a loop and a branch as test names become a filtered array and a summary object.',
    nodes: ['Values', 'Function', 'Loop', 'Branch', 'Array', 'Object'],
    frames: [
      {
        id: 'js-values', title: '1. Give the input a name', activeNode: 0,
        narration: 'The cases variable refers to an array of three strings. const prevents reassignment of this variable; it does not freeze the array.',
        code: "const cases = ['login valid', 'checkout', 'login invalid'];\n// cases → ['login valid', 'checkout', 'login invalid']",
      },
      {
        id: 'js-function', title: '2. Pass the array to a function', activeNode: 1,
        narration: 'A function groups reusable steps. selectLogin receives cases as its names parameter and prepares an empty result array.',
        code: "function selectLogin(names) {\n  const selected = [];\n  // next: inspect each name\n}\nselectLogin(cases);\n// names → cases; selected → []",
      },
      {
        id: 'js-loop', title: '3. Visit one name per loop iteration', activeNode: 2,
        narration: 'for…of visits each array element in order. On the first iteration name holds the string login valid; it will then hold checkout, then login invalid.',
        code: "for (const name of names) {\n  // first iteration: name → 'login valid'\n  // next: 'checkout', then 'login invalid'\n}",
      },
      {
        id: 'js-branch', title: '4. Choose a branch', activeNode: 3,
        narration: 'includes returns true when a name contains login. The if branch adds that name; checkout is skipped because its condition is false.',
        code: "if (name.includes('login')) {\n  selected.push(name);\n}\n// 'login valid' → true → add\n// 'checkout' → false → skip\n// 'login invalid' → true → add",
      },
      {
        id: 'js-array', title: '5. Return the selected names', activeNode: 4,
        narration: 'After the loop, return passes the new array back to the caller. The shorter filter expression performs the same selection without writing a loop yourself.',
        code: "return selected;\n// selected: [] → ['login valid']\n//          → ['login valid', 'login invalid']\n\nconst loginCases = cases.filter((name) => name.includes('login'));",
      },
      {
        id: 'js-object', title: '6. Store a named summary', activeNode: 5,
        narration: 'An object groups named values. Reading the filtered array length gives count: 2. The original cases array still contains all three names.',
        code: "const summary = { names: loginCases, count: loginCases.length };\n// summary → { names: ['login valid', 'login invalid'], count: 2 }\n// cases.length → 3",
      },
    ],
  },
  s2: {
    id: 'async-and-narrowing', stageId: 's2',
    title: 'Wait for a response, then narrow a type',
    summary: 'Follow an asynchronous HTTP request and see how a runtime check makes an unknown JSON field safe to use.',
    nodes: ['Request', 'Promise', 'HTTP check', 'JSON', 'Type check', 'Typed value'],
    frames: [
      {
        id: 'async-request', title: '1. Start the asynchronous request', activeNode: 0,
        narration: 'fetch starts an HTTP request and returns a Promise. A Promise represents a result that may arrive later or fail.',
        code: "const pending: Promise<Response> = fetch('/api/users/1');\n// request sent; pending is not the response body",
      },
      {
        id: 'async-await', title: '2. Await the Promise', activeNode: 1,
        narration: 'await pauses this async function until the Promise settles. Other browser work can continue. A network failure rejects the Promise and should be handled with try/catch.',
        code: "export async function getUserName(): Promise<string> {\n  const response = await fetch('/api/users/1');\n  // continue here after response headers arrive\n}",
      },
      {
        id: 'async-status', title: '3. Check the HTTP result', activeNode: 2,
        narration: 'An HTTP 404 still resolves fetch. Checking response.ok rejects unsuccessful status codes before treating the body as successful data.',
        code: "if (!response.ok) {\n  throw new Error(`HTTP ${response.status}`);\n}\n// response.ok is true for status 200–299",
      },
      {
        id: 'async-json', title: '4. Treat external JSON as unknown', activeNode: 3,
        narration: 'Parsing JSON is another asynchronous step. A TypeScript annotation alone cannot validate a server response, so keep external data unknown until it is checked.',
        code: "const data: unknown = await response.json();\n// Example response: { name: 'Ada' }\n// data is still unknown to TypeScript",
      },
      {
        id: 'async-narrow', title: '5. Narrow the object and its name field', activeNode: 4,
        narration: 'These runtime checks rule out null, non-objects, missing names and non-string names. Within the successful branch TypeScript knows data.name is a string.',
        code: "if (typeof data === 'object' && data !== null &&\n    'name' in data && typeof data.name === 'string') {\n  return data.name;\n}\nthrow new Error('Expected a user with a string name');",
      },
      {
        id: 'async-use', title: '6. Use the result and handle errors', activeNode: 5,
        narration: 'The function exports a Promise<string> contract for other modules. The caller awaits it and catches network, HTTP, parsing or validation errors.',
        code: "try {\n  const name: string = await getUserName();\n  console.log(name.toUpperCase()); // 'ADA' for this example\n} catch (error) {\n  console.error(error instanceof Error ? error.message : 'Request failed');\n}",
      },
    ],
  },
  s3: {
    id: 'playwright-action-flow', stageId: 's3',
    title: 'From browser to a reliable assertion',
    summary: 'See the browser, isolated context, page, locator, auto-wait and assertion that make up a Playwright UI test.',
    nodes: ['Browser', 'Context', 'Page', 'Locator', 'Auto-wait', 'Assertion'],
    frames: [
      {
        id: 'pw-browser', title: '1. Select a browser project', activeNode: 0,
        narration: 'Playwright Test launches the configured browser. Projects let the same test run against different browser engines when those browsers are installed.',
        code: "// playwright.config.ts\nexport default defineConfig({\n  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],\n});",
      },
      {
        id: 'pw-context', title: '2. Give the test an isolated context', activeNode: 1,
        narration: 'The built-in page fixture belongs to a fresh browser context for each test. Cookies and local storage are isolated from other tests by default.',
        code: "test('saves a profile', async ({ page }) => {\n  // page belongs to this test's context\n  // other tests do not inherit its cookies\n});",
      },
      {
        id: 'pw-page', title: '3. Navigate the page', activeNode: 2,
        narration: 'A page is a browser tab. Navigate to the application using a configured baseURL. The following snippets describe an example profile form.',
        code: "await page.goto('/profile');\nawait page.getByLabel('Display name').fill('Ada');",
      },
      {
        id: 'pw-locator', title: '4. Describe the intended control', activeNode: 3,
        narration: 'A locator describes how to find an element when it is used. The role and accessible name express the same Save button a learner would perceive.',
        code: "const save = page.getByRole('button', { name: 'Save', exact: true });\n// Locator describes the Save button; no fixed CSS path needed",
      },
      {
        id: 'pw-wait', title: '5. Let the action wait for readiness', activeNode: 4,
        narration: 'Before click, Playwright checks relevant actionability conditions such as visibility, stability and enabled state. A missing or blocked control produces a timeout instead of a reliable click.',
        code: "await save.click();\n// auto-wait for the click's actionability checks\n// avoid page.waitForTimeout(5000)",
      },
      {
        id: 'pw-assert', title: '6. Assert the user-visible outcome', activeNode: 5,
        narration: 'A web-first assertion retries until the expected state appears or its timeout expires. It checks the outcome rather than assuming the save worked because the click returned.',
        code: "await expect(page.getByRole('status')).toHaveText('Profile saved');\n// retries against the current page state",
      },
    ],
  },
  s4: {
    id: 'ui-api-test-lifecycle', stageId: 's4',
    title: 'Follow a UI and API test lifecycle',
    summary: 'Connect fixtures, isolated UI actions, API response checks and useful failure evidence.',
    nodes: ['Fixtures', 'UI action', 'API request', 'Parse body', 'Assertions', 'Trace'],
    frames: [
      {
        id: 'lifecycle-fixtures', title: '1. Prepare test-scoped fixtures', activeNode: 0,
        narration: 'Fixtures provide setup and cleanup around a test. The built-in page is isolated per test; use unique test data and cleanup so backend state does not leak between tests.',
        code: "test('new item appears', async ({ page, request }) => {\n  // page: isolated browser context\n  // request: HTTP client fixture\n  // create unique data and clean it up after the test\n});",
      },
      {
        id: 'lifecycle-ui', title: '2. Exercise the UI', activeNode: 1,
        narration: 'A UI test fills the form through an accessible label and submits it through a role locator. Keep assertions about visible behavior even when an API helps set up data.',
        code: "await page.goto('/items/new');\nawait page.getByLabel('Item name').fill('QE practice item');\nawait page.getByRole('button', { name: 'Create', exact: true }).click();\nawait expect(page.getByRole('status')).toHaveText('Item created');",
      },
      {
        id: 'lifecycle-api', title: '3. Call an API without a page', activeNode: 2,
        narration: 'The request fixture can check the server directly. An HTTP request does not require a browser tab; check the status before relying on the returned data.',
        code: "const response = await request.get('/api/items');\nexpect(response.ok()).toBeTruthy();\n// status 200–299 means the HTTP request succeeded",
      },
      {
        id: 'lifecycle-parse', title: '4. Parse the response body', activeNode: 3,
        narration: 'await response.json() parses the body. A successful status does not prove the API returned the expected shape, so inspect the parsed value too.',
        code: "const body = await response.json();\nexpect(Array.isArray(body)).toBe(true);\n// Example body: [{ id: 42, name: 'QE practice item' }]",
      },
      {
        id: 'lifecycle-assert', title: '5. Check the contract and release resources', activeNode: 4,
        narration: 'Check the fields that matter to the test. Fixture teardown runs after use, including when an assertion fails; clean up data you created using its unique identifier.',
        code: "expect(body).toEqual(expect.arrayContaining([\n  expect.objectContaining({ name: 'QE practice item' }),\n]));\n// custom fixture pattern:\n// await use(item); then delete the created item in teardown",
      },
      {
        id: 'lifecycle-trace', title: '6. Investigate a failure with evidence', activeNode: 5,
        narration: 'With retries enabled, on-first-retry records the first retried attempt. A trace can show actions, DOM snapshots and network activity. The HTML report connects the failing assertion to its attachments.',
        code: "// playwright.config.ts\nretries: 1,\nuse: { trace: 'on-first-retry' },\n\n// terminal\n// npx playwright show-report\n// npx playwright show-trace path/to/trace.zip",
      },
    ],
  },
  s5: {
    id: 'pom-delegation', stageId: 's5',
    title: 'Delegate mechanics without hiding test intent',
    summary: 'Follow a readable test into a fixture, a page object and a reusable form component, then back to the assertion.',
    nodes: ['Test intent', 'Fixture', 'Page object', 'Component', 'UI action', 'Assertion'],
    frames: [
      {
        id: 'pom-intent', title: '1. Keep the test readable', activeNode: 0,
        narration: 'The test states the user goal and expected result. A page object will hold reusable mechanics so a locator change does not require editing every test.',
        code: "test('user signs in', async ({ loginPage, page }) => {\n  await loginPage.login('learner', 'example-password');\n  await expect(page.getByRole('heading', { name: 'Dashboard' }))\n    .toBeVisible();\n});",
      },
      {
        id: 'pom-fixture', title: '2. Supply the object through a fixture', activeNode: 1,
        narration: 'test.extend creates a typed fixture. It receives the isolated page and provides a fresh LoginPage to this test. Example credentials here are fictional test data.',
        code: "const test = base.extend<{ loginPage: LoginPage }>({\n  loginPage: async ({ page }, use) => {\n    await page.goto('/login');\n    await use(new LoginPage(page));\n  },\n});",
      },
      {
        id: 'pom-page', title: '3. Let the page object coordinate', activeNode: 2,
        narration: 'LoginPage owns the page-level interaction. It delegates a repeated form interaction to a focused component instead of duplicating fields in every page class.',
        code: "class LoginPage {\n  readonly form: LoginForm;\n  constructor(page: Page) { this.form = new LoginForm(page); }\n  async login(user: string, password: string) {\n    await this.form.submit(user, password);\n  }\n}",
      },
      {
        id: 'pom-component', title: '4. Keep reusable fields together', activeNode: 3,
        narration: 'A component object groups only the locators and behavior for its part of the UI. Add this layer when it earns its place through reuse or clearer boundaries.',
        code: "class LoginForm {\n  constructor(private page: Page) {}\n  async submit(user: string, password: string) {\n    await this.page.getByLabel('Username').fill(user);\n    await this.page.getByLabel('Password').fill(password);\n    await this.page.getByRole('button', { name: 'Sign in' }).click();\n  }\n}",
      },
      {
        id: 'pom-action', title: '5. Await the actions in order', activeNode: 4,
        narration: 'Each awaited Playwright action completes before the next starts. The component changes the UI through accessible controls; it does not decide whether the business outcome is correct.',
        code: "// Call path:\n// test → loginPage.login → form.submit\n//      → fill username → fill password → click Sign in\n// then control returns to the test",
      },
      {
        id: 'pom-assert', title: '6. Return to an explicit assertion', activeNode: 5,
        narration: 'The test checks its intended outcome. Keeping this assertion visible makes failures and test purpose easier to review while shared mechanics remain in page objects.',
        code: "await expect(page.getByRole('heading', { name: 'Dashboard' }))\n  .toBeVisible();\n// a sign-in click alone is not proof of successful login",
      },
    ],
  },
  s6: {
    id: 'git-to-artifacts', stageId: 's6',
    title: 'Follow a change from branch to test evidence',
    summary: 'Trace a local commit through a pull request, reproducible build, Playwright checks and downloadable failure artifacts.',
    nodes: ['Commit', 'Pull request', 'Actions', 'Build', 'Tests', 'Artifacts'],
    frames: [
      {
        id: 'git-commit', title: '1. Commit a focused change', activeNode: 0,
        narration: 'A feature branch separates your work from the main branch. Stage the intended files and write a commit message that describes the behavior changed.',
        code: "git switch -c feature/login-tests\ngit add tests/login.spec.ts\ngit commit -m \"Cover successful learner sign-in\"",
      },
      {
        id: 'git-pr', title: '2. Push and request review', activeNode: 1,
        narration: 'Pushing publishes the branch to your repository. Open a pull request with a clear change description and validation evidence so another person can review it.',
        code: "git push -u origin feature/login-tests\n// In GitHub: open a pull request into main\n// Describe the behavior, checks and any limits",
      },
      {
        id: 'git-actions', title: '3. Trigger the workflow', activeNode: 2,
        narration: 'GitHub Actions reads the workflow from .github/workflows. push and pull_request events start the configured job; setup-node chooses the supported Node version.',
        code: "on: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20 }",
      },
      {
        id: 'git-build', title: '4. Install and build reproducibly', activeNode: 3,
        narration: 'npm ci installs the committed lockfile without updating it. Build and type checks catch errors before browser tests begin. The working directory must contain package.json and its lockfile.',
        code: "      - run: npm ci\n      - run: npm run build\n      - run: npx playwright install --with-deps chromium",
      },
      {
        id: 'git-tests', title: '5. Run deterministic checks', activeNode: 4,
        narration: 'Run Playwright against the app and a mocked model service. Hosted CI should not download Llama 3 or depend on a learner’s local Ollama daemon.',
        code: "      - run: npm test\n// test configuration starts app and mock services\n// failures stop the job from succeeding",
      },
      {
        id: 'git-artifacts', title: '6. Preserve evidence for triage', activeNode: 5,
        narration: 'An always condition uploads the report even when tests fail, provided report files exist. Open the report, inspect traces, fix the cause and push a new commit for another run.',
        code: "      - uses: actions/upload-artifact@v4\n        if: always()\n        with:\n          name: playwright-report\n          path: playwright-report/",
      },
    ],
  },
  s7: {
    id: 'local-tutor-request', stageId: 's7',
    title: 'Follow one local tutor question',
    summary: 'Trace lesson context through the local Express backend to Ollama and back. This schematic explains the contract; it does not send a live request.',
    nodes: ['Question', 'App API', 'Validation', 'Ollama', 'Parse', 'Display'],
    frames: [
      {
        id: 'tutor-question', title: '1. Pair the question with lesson context', activeNode: 0,
        narration: 'The learner asks about the active lesson. Send only the bounded question and non-sensitive lesson excerpt; the browser does not call Ollama directly.',
        code: "const requestBody = {\n  lessonTitle: 'JavaScript essentials',\n  lessonText: 'const prevents reassignment of a binding.',\n  question: 'Can a const array change?',\n};",
      },
      {
        id: 'tutor-api', title: '2. POST to the local app backend', activeNode: 1,
        narration: 'The UI sends JSON to the Express tutor endpoint. This backend boundary centralizes validation, timeouts and the local model configuration.',
        code: "await fetch('/api/tutor', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify(requestBody),\n});",
      },
      {
        id: 'tutor-validation', title: '3. Validate and ground the prompt', activeNode: 2,
        narration: 'The backend rejects missing, invalid or oversized fields with 400. It builds a lesson-grounded prompt that asks the model to acknowledge uncertainty. Learner text remains input, not app policy.',
        code: "// Express validates string fields and length bounds first\n// System guidance: explain for a beginner using this lesson\n// Missing context? Say what is missing; do not invent evidence\n// No claim that generated code has been executed",
      },
      {
        id: 'tutor-ollama', title: '4. Call the local Llama 3 model', activeNode: 3,
        narration: 'Express POSTs to Ollama’s /api/chat endpoint with llama3:latest by default. stream: false requests one JSON response. The configured timeout bounds how long the app waits.',
        code: "POST http://127.0.0.1:11434/api/chat\n{\n  \"model\": \"llama3:latest\",\n  \"stream\": false,\n  \"messages\": [\n    { \"role\": \"system\", \"content\": \"Lesson-grounded guidance…\" },\n    { \"role\": \"user\", \"content\": \"Can a const array change?\" }\n  ]\n}",
      },
      {
        id: 'tutor-parse', title: '5. Validate the response text', activeNode: 4,
        narration: 'Read message.content and reject empty or malformed output. An unavailable model or a timeout returns a useful 503 response; it does not prevent reading or assessments.',
        code: "// Ollama success shape:\n{ message: { role: 'assistant', content: 'Generated explanation…' } }\n\n// App success shape:\n{ answer: 'Generated explanation…', model: 'llama3:latest',\n  lessonTitle: 'JavaScript essentials' }",
      },
      {
        id: 'tutor-display', title: '6. Display an answer with its limits', activeNode: 5,
        narration: 'The tutor shows the lesson context, AI-generated label and visible answer text. Optional speech can read it aloud. The learner reviews the explanation against the fixed lesson content; the model never grades an MCQ.',
        code: "// UI: thinking → answer ready (or error)\n// Label: AI-generated — review before using\n// Lesson and fixed answer keys stay authoritative\n// No live model? Continue the course normally",
      },
    ],
  },
  s8: {
    id: 'mocked-ai-contract', stageId: 's8',
    title: 'Test the AI boundary with a deterministic mock',
    summary: 'Follow a Playwright API test through a mock Ollama response and separate repeatable contract checks from variable generated wording.',
    nodes: ['CI mock', 'Tutor request', 'Ollama stub', 'Contract', 'Error cases', 'Review'],
    frames: [
      {
        id: 'ai-mock', title: '1. Replace the live model in CI', activeNode: 0,
        narration: 'Start a small local HTTP stub that speaks the Ollama response contract. Point the app backend to it using OLLAMA_BASE_URL. No model download is needed for automated checks.',
        code: "// CI test environment example\nOLLAMA_BASE_URL=http://127.0.0.1:11435\n// 11435 serves the test stub, not a live LLM\n// production/local default remains port 11434",
      },
      {
        id: 'ai-request', title: '2. Exercise the real tutor endpoint', activeNode: 1,
        narration: 'Playwright calls the app API with lesson context. The test still exercises Express validation, prompt assembly, the upstream POST and response parsing around the mock.',
        code: "const response = await request.post('/api/tutor', {\n  data: {\n    lessonTitle: 'JavaScript essentials',\n    lessonText: 'const prevents reassignment.',\n    question: 'Explain const.',\n  },\n});",
      },
      {
        id: 'ai-stub', title: '3. Return a controlled response', activeNode: 2,
        narration: 'The stub checks the request contract and returns a fixed, non-empty message.content. This makes a CI failure reproducible. A mock response does not demonstrate the quality of a real model.',
        code: "// Upstream request must use POST /api/chat\n// body.model is configured; body.stream is false\n// Stub response:\n{ message: { role: 'assistant', content: 'Mock tutor explanation.' } }",
      },
      {
        id: 'ai-contract', title: '4. Assert the app’s response contract', activeNode: 3,
        narration: 'Check the status, field types and non-empty answer instead of an exact paragraph. Real generated wording may differ while still satisfying this contract; contract success alone does not prove factual accuracy.',
        code: "expect(response.status()).toBe(200);\nconst body = await response.json();\nexpect(typeof body.answer).toBe('string');\nexpect(body.answer.trim().length).toBeGreaterThan(0);\nexpect(body.model).toBe('llama3:latest');\nexpect(body.lessonTitle).toBe('JavaScript essentials');",
      },
      {
        id: 'ai-errors', title: '5. Check failures and offline learning', activeNode: 4,
        narration: 'Use controlled stub cases for timeout, unavailable service and empty output. Check that invalid input returns 400, upstream failure returns 503, and the UI keeps lessons and fixed-key quizzes usable.',
        code: "// Deterministic scenarios:\n// missing question → 400\n// unreachable upstream or timeout → 503\n// empty message.content → 503\n// tutor error shown → lessons and assessments still usable",
      },
      {
        id: 'ai-review', title: '6. Review real output separately', activeNode: 5,
        narration: 'A manual local smoke check asks a live model a non-sensitive question and reviews grounding, uncertainty and usefulness. Models can hallucinate. Reviewed lesson content and human judgment remain essential.',
        code: "// Optional manual check with local llama3:latest:\n// same question → different wording may still be acceptable\n// review accuracy and lesson grounding\n// never use the model to grade fixed-answer MCQs",
      },
    ],
  },
};
