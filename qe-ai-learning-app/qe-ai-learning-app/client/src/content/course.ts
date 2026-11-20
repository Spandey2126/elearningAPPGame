// Reviewed course content. Edit this file to change lessons or answer keys; no React code involved.
export type QuizItem = { question: string; options: string[]; answerIndex: number; rationale: string };
export type Lesson = {
  id: string; title: string; minutes: number; prerequisites: string; objectives: string[];
  explanation: string; codeExample?: string; labSteps: string[]; labExtension?: string;
  quiz: QuizItem[]; mistakes: string[];
};
export type StageTestQuestion = {
  id: string; question: string; options: string[]; answerIndex: number; marks: number; rationale: string;
};
export type Stage = {
  id: string; title: string; trackId: string; order: number; description: string;
  lessonIds: string[]; learningMinutes: number; testMinutes: number;
  checkpointQuestions: StageTestQuestion[];
};
export type Course = {
  id: string; title: string; description: string; stages: Stage[]; finalExamQuestions: StageTestQuestion[];
};

export const TRACKS: Record<string, string> = {
  A: 'Track A: JavaScript and TypeScript',
  B: 'Track B: Playwright with TypeScript',
  C: 'Track C: POM, Git/GitHub and CI/CD',
  D: 'Track D: Local LLM with Ollama and Playwright',
};

export const ORIENTATION_MINUTES = 5;
export const FINAL_EXAM_MINUTES = 35;

const q = (id: string, question: string, options: string[], answerIndex: number, rationale: string, marks = 1): StageTestQuestion =>
  ({ id, question, options, answerIndex, marks, rationale });

export const lessons: Lesson[] = [
  {
    id: 'l1', title: 'JavaScript essentials', minutes: 20, prerequisites: 'None.',
    objectives: ['Declare values with const and let', 'Use if/else and loops', 'Write functions and transform arrays and objects'],
    explanation: 'A variable is a named box for a value. Use const when the name will not be reassigned and let when it will. Functions package reusable steps. Arrays hold ordered lists and objects hold named fields. Methods such as map, filter and reduce build new arrays from old ones.',
    codeExample: "const prices = [10, 20, 30];\nconst doubled = prices.map((p) => p * 2);\nconst total = prices.reduce((sum, p) => sum + p, 0);\nconsole.log(doubled, total); // [20, 40, 60] 60",
    labSteps: ['Open a browser console or Node REPL.', 'Create an array of three test case names.', 'Use filter to keep names containing "login".', 'Print the count.'],
    labExtension: 'Group the names into an object keyed by first word.',
    quiz: [{ question: 'Which keyword declares a value you will not reassign?', options: ['var', 'const', 'let', 'static'], answerIndex: 1, rationale: 'const prevents reassignment of the binding.' }],
    mistakes: ['Using == instead of ===.'],
  },
  {
    id: 'l2', title: 'Async JavaScript and TypeScript types', minutes: 20, prerequisites: 'Lesson 1.',
    objectives: ['Use async/await with fetch', 'Annotate types and interfaces', 'Narrow union types'],
    explanation: 'A Promise represents a value that arrives later. await pauses an async function until the promise settles. fetch only rejects on network failure, so check response.ok for HTTP errors. TypeScript adds types: interfaces describe object shapes, unions like string | number allow several types, and narrowing (typeof checks) tells the compiler which one you have.',
    codeExample: "interface User { id: number; name: string }\nexport async function getUser(id: number): Promise<User> {\n  const res = await fetch(`/api/users/${id}`);\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  return (await res.json()) as User;\n}",
    labSteps: ['Create a typed getUser function.', 'Throw a clear error when res.ok is false.', 'Wrap the call in try/catch and log the message.'],
    labExtension: 'Make the function generic: getJson<T>(url).',
    quiz: [{ question: 'Does fetch reject the promise on an HTTP 404?', options: ['Yes', 'No, check response.ok', 'Only in Node', 'Only with await'], answerIndex: 1, rationale: 'fetch resolves for any HTTP response; you must check ok or status.' }],
    mistakes: ['Forgetting await and getting a Promise instead of data.'],
  },
  {
    id: 'l3', title: 'Playwright setup, locators and assertions', minutes: 20, prerequisites: 'Lessons 1-2.',
    objectives: ['Write a first Playwright test', 'Choose accessible locators', 'Use web-first assertions instead of sleeps'],
    explanation: 'Playwright launches a browser, creates an isolated context for each test, and gives you a page. Prefer locators users can perceive: getByRole, getByLabel, getByText. Playwright auto-waits for elements to be actionable, and expect(locator) assertions retry until they pass or time out, so fixed sleeps are rarely needed.',
    codeExample: "import { test, expect } from '@playwright/test';\n\ntest('shows heading', async ({ page }) => {\n  await page.goto('https://example.com');\n  await expect(page.getByRole('heading', { name: 'Example Domain' })).toBeVisible();\n});",
    labSteps: ['Run npm init playwright@latest in a scratch folder.', 'Write the test above.', 'Run npx playwright test and open the HTML report.'],
    labExtension: 'Add a second test and confirm it does not share state with the first.',
    quiz: [{ question: 'Which locator is usually preferred?', options: ['A long CSS path', 'getByRole', 'An XPath index', 'nth-child'], answerIndex: 1, rationale: 'Role locators match how users and assistive tech see the page.' }],
    mistakes: ['Using page.waitForTimeout instead of an assertion.'],
  },
  {
    id: 'l4', title: 'Playwright UI and API testing, fixtures, debugging', minutes: 20, prerequisites: 'Lesson 3.',
    objectives: ['Test an API with the request fixture', 'Create a custom fixture', 'Debug with traces'],
    explanation: 'Playwright can test HTTP APIs without a browser using the request fixture (APIRequestContext). Check status and parse the JSON body. Fixtures created with test.extend provide shared setup to tests. Set trace: "on-first-retry" to capture a trace you can open in the trace viewer when a test fails.',
    codeExample: "test('API returns 200', async ({ request }) => {\n  const res = await request.get('https://api.example.com/items');\n  expect(res.ok()).toBeTruthy();\n  const body = await res.json();\n  expect(Array.isArray(body)).toBe(true);\n});",
    labSteps: ['Add an API test with the request fixture.', 'Set trace: "on-first-retry" in playwright.config.ts.', 'Force a failure and open the trace with npx playwright show-trace.'],
    quiz: [{ question: 'Which fixture performs HTTP calls without a browser page?', options: ['page', 'context', 'request', 'browser'], answerIndex: 2, rationale: 'request is an APIRequestContext.' }],
    mistakes: ['Asserting only the status and ignoring the body shape.'],
  },
  {
    id: 'l5', title: 'Page Object Model design', minutes: 20, prerequisites: 'Lessons 3-4.',
    objectives: ['Explain the purpose of a page object', 'Build a page class with locators and actions', 'Inject it through a fixture'],
    explanation: 'A page object holds the locators and actions for one page or component, so tests read as intent ("login as user") and UI changes are fixed in one place. Keep assertions mostly in tests, and avoid adding layers when a page has only one or two tests.',
    codeExample: "export class LoginPage {\n  constructor(private page: Page) {}\n  async login(user: string, pass: string) {\n    await this.page.getByLabel('Username').fill(user);\n    await this.page.getByLabel('Password').fill(pass);\n    await this.page.getByRole('button', { name: 'Sign in' }).click();\n  }\n}",
    labSteps: ['Move login steps from a test into LoginPage.', 'Expose it as a fixture with test.extend.', 'Rewrite the test to call loginPage.login().'],
    quiz: [{ question: 'What belongs in a page object?', options: ['Locators and user actions', 'All test assertions', 'CI secrets', 'Test reports'], answerIndex: 0, rationale: 'Page objects encapsulate locators and actions.' }],
    mistakes: ['Creating huge page classes that mirror the whole app.'],
  },
  {
    id: 'l6', title: 'Git, GitHub and Actions CI/CD', minutes: 20, prerequisites: 'Lesson 5.',
    objectives: ['Use feature branches and pull requests', 'Write a workflow that runs Playwright', 'Upload reports as artifacts'],
    explanation: 'Work on a feature branch, commit small changes and open a pull request for review. GitHub Actions runs workflows defined in .github/workflows on events such as push and pull_request. A test job checks out code, sets up Node, runs npm ci, installs browsers and runs the tests, then uploads the report as an artifact for triage. Keep secrets in GitHub secrets, never in code.',
    codeExample: "on: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20 }\n      - run: npm ci\n      - run: npx playwright install --with-deps chromium\n      - run: npx playwright test",
    labSteps: ['Create a branch: git switch -c feature/tests.', 'Add the workflow file.', 'Push and open a pull request.', 'Download the report artifact from the run.'],
    quiz: [{ question: 'Which command installs dependencies exactly from the lockfile?', options: ['npm install', 'npm ci', 'npm update', 'npm audit'], answerIndex: 1, rationale: 'npm ci gives reproducible installs.' }],
    mistakes: ['Forgetting to install Playwright browsers in CI.'],
  },
  {
    id: 'l7', title: 'Ollama and Llama 3 basics', minutes: 20, prerequisites: 'Lessons 2 and 6.',
    objectives: ['Install Ollama and pull a model', 'POST to /api/chat', 'Parse the response safely'],
    explanation: 'Ollama runs large language models on your own computer. Download the model once with ollama pull llama3:latest. Then send an HTTP POST to http://127.0.0.1:11434/api/chat with a model name and messages. With stream set to false the reply is a single JSON object and the text is in message.content. Always handle timeouts, errors and empty replies.',
    codeExample: "const res = await fetch('http://127.0.0.1:11434/api/chat', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ model: 'llama3:latest', stream: false,\n    messages: [{ role: 'user', content: 'Explain const in one sentence.' }] }),\n});\nconst data = await res.json();\nconsole.log(data.message?.content);",
    labSteps: ['Run ollama pull llama3:latest.', 'Run the snippet in a Node script.', 'Stop Ollama and confirm your code reports a clear error.'],
    quiz: [{ question: 'Where is the reply text in a non-streaming /api/chat response?', options: ['data.answer', 'data.message.content', 'data.text', 'data.output[0]'], answerIndex: 1, rationale: 'The assistant message is in message.content.' }],
    mistakes: ['Sending learner confidential data to the model.'],
  },
  {
    id: 'l8', title: 'Playwright with a local LLM and QE for AI', minutes: 20, prerequisites: 'Lessons 3 and 7.',
    objectives: ['Separate deterministic checks from model output', 'Mock Ollama in CI', 'Explain hallucination risk and human review'],
    explanation: 'Model output varies between runs, so tests should not match exact sentences. Assert the contract instead: status codes, JSON shape, non-empty text, error handling and UI states. In CI, point the API at a mock Ollama server so tests are fast and stable. Ground the model in lesson text, flag uncertainty, protect privacy, and keep a human reviewing anything AI-generated.',
    codeExample: "const res = await request.post('/api/tutor', { data: { lessonTitle: 'T', lessonText: 'x', question: 'Why?' } });\nexpect(res.status()).toBe(200);\nconst body = await res.json();\nexpect(typeof body.answer).toBe('string');\nexpect(body.answer.length).toBeGreaterThan(0);",
    labSteps: ['Write a test that checks the response shape only.', 'Point the API at a mock server.', 'Add a test for the 503 case with Ollama unreachable.'],
    quiz: [{ question: 'Why avoid exact-text assertions on LLM output?', options: ['They are slow', 'Output varies between runs', 'Playwright forbids it', 'JSON cannot hold text'], answerIndex: 1, rationale: 'Probabilistic output changes, so test structure and contract.' }],
    mistakes: ['Requiring a live model in hosted CI.'],
  },
];

const stageDefs: Array<[string, string, string, string, StageTestQuestion[], StageTestQuestion[]]> = [
  ['s1', 'A', 'JavaScript fundamentals', 'Values, control flow, functions, arrays and objects.', [
    q('s1c1', 'Which method returns a new array of items that pass a test?', ['map', 'filter', 'push', 'forEach'], 1, 'filter keeps items for which the callback returns true.'),
    q('s1c2', 'What is [1, 2, 3].map((n) => n * 2)?', ['[1, 2, 3]', '[2, 4, 6]', '6', 'undefined'], 1, 'map returns a new array of transformed values.'),
  ], [
    q('s1f1', 'What does typeof null return?', ['"null"', '"undefined"', '"object"', '"number"'], 2, 'A long-standing JavaScript quirk.', 2),
    q('s1f2', 'Which comparison avoids type coercion?', ['==', '===', '=', '!='], 1, '=== compares value and type.', 2),
  ]],
  ['s2', 'A', 'Async JavaScript and TypeScript', 'Promises, async/await, types, interfaces, unions and modules.', [
    q('s2c1', 'What does await do inside an async function?', ['Blocks the whole browser', 'Pauses that function until the promise settles', 'Cancels the promise', 'Makes code synchronous everywhere'], 1, 'Only the async function pauses.'),
    q('s2c2', 'Which type allows a string or a number?', ['string & number', 'string | number', 'any[]', 'string, number'], 1, 'A union type uses |.'),
  ], [
    q('s2f1', 'How do you narrow string | number to string?', ['typeof x === "string"', 'x as any', 'x!', 'delete x'], 0, 'typeof checks narrow unions.', 2),
    q('s2f2', 'An interface in TypeScript describes:', ['Runtime behaviour', 'The shape of an object', 'A CSS class', 'An npm package'], 1, 'Interfaces are compile-time shapes.', 2),
  ]],
  ['s3', 'B', 'Playwright foundations', 'Setup, locators, assertions, waits and test isolation.', [
    q('s3c1', 'Each Playwright test by default gets:', ['A shared page', 'A fresh browser context', 'The previous test cookies', 'No page'], 1, 'Isolation is per test.'),
    q('s3c2', 'Which assertion style retries until it passes or times out?', ['expect(await el.isVisible()).toBe(true)', 'await expect(locator).toBeVisible()', 'if (el) {}', 'setTimeout'], 1, 'Web-first assertions auto-retry.'),
  ], [
    q('s3f1', 'Which is discouraged in most tests?', ['getByRole', 'getByLabel', 'page.waitForTimeout(5000)', 'expect(locator)'], 2, 'Fixed sleeps are slow and flaky.', 2),
    q('s3f2', 'getByRole("button", { name: "Save" }) finds:', ['A button with accessible name Save', 'Any element with class Save', 'A link', 'Page title'], 0, 'Role plus accessible name.', 2),
  ]],
  ['s4', 'B', 'Playwright UI, API and debugging', 'API testing, fixtures, reporting and debugging.', [
    q('s4c1', 'Which Playwright config option captures traces for retried failures?', ['trace: "on-first-retry"', 'video: false', 'workers: 1', 'retries: 0'], 0, 'It records a trace on the first retry.'),
    q('s4c2', 'A custom fixture is created with:', ['test.extend', 'test.skip', 'expect.poll', 'page.route'], 0, 'test.extend adds fixtures.'),
  ], [
    q('s4f1', 'response.ok() is true for:', ['Status 200-299', 'Only 200', 'Status 400+', 'Any response'], 0, 'ok covers the 2xx range.', 2),
    q('s4f2', 'Which tool opens an HTML test report?', ['npx playwright show-report', 'npm audit', 'git log', 'tsc'], 0, 'show-report serves the HTML report.', 2),
  ]],
  ['s5', 'C', 'Page Object Model', 'Page classes, components and fixtures.', [
    q('s5c1', 'A main benefit of POM is:', ['UI changes fixed in one place', 'Faster browsers', 'No need for locators', 'Automatic CI'], 0, 'Locators are centralised.'),
    q('s5c2', 'When might a page object be unnecessary abstraction?', ['A page used by one tiny test', 'A login used everywhere', 'A shared header', 'A checkout flow'], 0, 'Do not add layers without reuse.'),
  ], [
    q('s5f1', 'Where do assertions usually live?', ['In tests', 'In the Dockerfile', 'In CSS', 'In package.json'], 0, 'Keeps page objects about mechanics.', 2),
    q('s5f2', 'How can tests receive page objects cleanly?', ['Fixtures', 'Global variables', 'localStorage', 'Sleeping'], 0, 'Fixtures inject setup.', 2),
  ]],
  ['s6', 'C', 'Git, GitHub and CI/CD', 'Branches, pull requests, Actions, artifacts and triage.', [
    q('s6c1', 'A workflow that runs on pushes and PRs uses:', ['on: [push, pull_request]', 'run: all', 'needs: git', 'if: always'], 0, 'Triggers live under on.'),
    q('s6c2', 'Where should API secrets be stored for Actions?', ['GitHub secrets', 'The repo README', 'A public JSON file', 'localStorage'], 0, 'Never commit secrets.'),
  ], [
    q('s6f1', 'Which step is needed before Playwright runs in CI?', ['npx playwright install', 'git rebase', 'npm audit fix', 'ollama pull'], 0, 'Browsers must be installed.', 2),
    q('s6f2', 'Uploading the report as an artifact helps with:', ['Triage of failures', 'Faster npm ci', 'Type checking', 'Branch naming'], 0, 'You can inspect failures after the run.', 2),
  ]],
  ['s7', 'D', 'Ollama and Llama 3', 'Ollama, POST requests, prompts and response parsing.', [
    q('s7c1', 'Which command downloads the model?', ['ollama pull llama3:latest', 'npm i llama3', 'git clone llama3', 'ollama push'], 0, 'pull downloads the model.'),
    q('s7c2', 'Ollama chat endpoint:', ['POST /api/chat', 'GET /chat', 'PUT /llm', 'DELETE /api'], 0, 'Chat uses POST /api/chat.'),
  ], [
    q('s7f1', 'stream: false makes Ollama return:', ['One JSON response', 'A video', 'Many events', 'HTML'], 0, 'A single JSON object.', 2),
    q('s7f2', 'A good tutor prompt should:', ['Include lesson context and say what to do when unsure', 'Contain secrets', 'Ask the model to run code', 'Be empty'], 0, 'Grounding plus uncertainty handling.', 2),
  ]],
  ['s8', 'D', 'Playwright with a local LLM and responsible AI', 'AI-assisted QE, variability, responsible AI and mock-based CI.', [
    q('s8c1', 'In hosted CI the model should be:', ['Mocked', 'The learner laptop', 'Downloaded each run', 'Ignored'], 0, 'CI must not need a live model.'),
    q('s8c2', 'Which assertion suits LLM output?', ['Response is non-empty text with a valid structure', 'Equals an exact paragraph', 'Has 142 words', 'Rhymes'], 0, 'Assert the contract, not prose.'),
  ], [
    q('s8f1', 'Hallucination means:', ['Confident but unsupported output', 'A slow response', 'A syntax error', 'A cached reply'], 0, 'Models can state false things fluently.', 2),
    q('s8f2', 'Which data may be sent to the model?', ['Non-sensitive lesson text', 'Production credentials', 'Customer records', 'Passwords'], 0, 'Protect privacy.', 2),
  ]],
];

const stages: Stage[] = stageDefs.map(([id, trackId, title, description, checkpointQuestions], i) => ({
  id, trackId, title, description, order: i + 1, lessonIds: [`l${i + 1}`],
  learningMinutes: 20, testMinutes: 5, checkpointQuestions,
}));

export const course: Course = {
  id: 'qe-for-ai',
  title: 'QE for AI: Local E-Learning Game',
  description: 'Eight gated stages and a cumulative final exam covering TypeScript, Playwright, POM/CI and local LLM integration.',
  stages,
  finalExamQuestions: stageDefs.flatMap((d) => d[5]),
};

export const TOTAL_MINUTES = ORIENTATION_MINUTES + stages.reduce((n, s) => n + s.learningMinutes + s.testMinutes, 0) + FINAL_EXAM_MINUTES;
