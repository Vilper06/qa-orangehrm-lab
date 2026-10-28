import { defineConfig } from '@playwright/test';
import base from './playwright.config';

const ver = (n: number) => ({ baseURL: `http://localhost:${n}` });
export default defineConfig({
  ...base,
  testDir: './tests',
  retries: 0, workers: 1, fullyParallel: false, timeout: 90_000,
  reporter: [['list'], ['html', { outputFolder: process.env.PW_REPORT || 'playwright-report', open: 'never' }], ['json', { outputFile: (process.env.PW_REPORT || 'reports') + '/results.json' }], ['junit', { outputFile: (process.env.PW_REPORT || 'reports') + '/junit.xml' }], ['./reporters/cp-reporter.ts']],
  projects: [
    { name: 'v1', testMatch: 'funcionales/**/*.spec.ts', use: ver(8081) },
    { name: 'v2', testMatch: 'funcionales/**/*.spec.ts', use: ver(8082) },
    { name: 'v1-firefox', testMatch: '**/*.smoke.spec.ts', use: { ...ver(8081), browserName: 'firefox' } },
    { name: 'v1-webkit', testMatch: '**/*.smoke.spec.ts', use: { ...ver(8081), browserName: 'webkit' } },
    { name: 'v2-firefox', testMatch: '**/*.smoke.spec.ts', use: { ...ver(8082), browserName: 'firefox' } },
    { name: 'v2-webkit', testMatch: '**/*.smoke.spec.ts', use: { ...ver(8082), browserName: 'webkit' } },
    { name: 'v1-chromium', testMatch: '**/*.smoke.spec.ts', use: ver(8081) },
    { name: 'v2-chromium', testMatch: '**/*.smoke.spec.ts', use: ver(8082) },
  ],
});
