import * as fs from 'fs';
import * as path from 'path';

export const LAB = path.resolve(__dirname, '..', '..');
const env: Record<string, string> = {};
if (fs.existsSync(path.join(LAB, '.env'))) {
  for (const l of fs.readFileSync(path.join(LAB, '.env'), 'utf8').split(/\r?\n/)) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2];
  }
}
export const ENV = env;
export const ADMIN = { user: env.OHRM_ADMIN_USER ?? 'Admin', pass: env.OHRM_ADMIN_PASSWORD ?? '' };
export const SEEDPASS = env.SEED_USER_PASSWORD ?? '';
export const PORTS: Record<string, number> = { v1: 8081, v2: 8082 };
