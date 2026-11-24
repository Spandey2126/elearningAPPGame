import { defineConfig } from '@playwright/test';
import config from './playwright.config';

export default defineConfig(config, {
  workers: 2,
  use: { launchOptions: { executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] } },
});
