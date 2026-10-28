import { defineConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Credenciales de prueba desde ../.env (no se versionan)
const envFile = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 1,
  workers: 2,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['list'],
  ],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    viewport: { width: 1366, height: 768 },
  },
  projects: [
    { name: 'v1', use: { baseURL: 'http://localhost:8081' } },
    { name: 'v2', use: { baseURL: 'http://localhost:8082' } },
  ],
});
