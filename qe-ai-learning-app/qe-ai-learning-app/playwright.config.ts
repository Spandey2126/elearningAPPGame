import { defineConfig, devices } from '@playwright/test';

const mockOllama = 'http://127.0.0.1:11435';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: { baseURL: 'http://127.0.0.1:5173', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: 'node tests/mock-ollama.mjs', url: mockOllama, reuseExistingServer: false },
    // API wired to the mock model (port 3001, used by the UI via the Vite proxy).
    { command: 'npm run start:server', url: 'http://127.0.0.1:3001/api/health', reuseExistingServer: false,
      env: { PORT: '3001', OLLAMA_BASE_URL: mockOllama } },
    // Second API instance whose Ollama is unreachable, for the 503 test.
    { command: 'npm run start:server', url: 'http://127.0.0.1:3002/api/health', reuseExistingServer: false,
      env: { PORT: '3002', OLLAMA_BASE_URL: 'http://127.0.0.1:1' } },
    { command: 'npm run dev:client', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI },
  ],
});
