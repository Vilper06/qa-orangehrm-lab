import base from './playwright.config';
import { defineConfig } from '@playwright/test';
export default defineConfig({ ...base, testDir: './seed', retries: 0, workers: 1 });
