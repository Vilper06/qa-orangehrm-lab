import http from 'k6/http';
import { check, sleep, group } from 'k6';

// CP-38: 20 VUs, 60 s, login con sesion + dashboard
const BASE = __ENV.BASE || 'http://localhost:8081';
const USER = __ENV.OHRM_USER || 'Admin';
const PASS = __ENV.OHRM_PASS || '';

export const options = {
  vus: 20, duration: '60s',
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<3000'] },
};

export default function () {
  const jar = http.cookieJar();
  group('login', () => {
    const page = http.get(`${BASE}/web/index.php/auth/login`);
    check(page, { 'login 200': (r) => r.status === 200 });
    const m = page.body.match(/:token="&quot;([^&]+)&quot;"/);
    const token = m ? m[1] : '';
    const res = http.post(`${BASE}/web/index.php/auth/validate`, { _token: token, username: USER, password: PASS }, { redirects: 5 });
    check(res, { 'sesion iniciada (dashboard)': (r) => r.url.includes('/dashboard') || r.body.includes('Dashboard') });
  });
  group('dashboard', () => {
    const d = http.get(`${BASE}/web/index.php/dashboard/index`);
    check(d, { 'dashboard 200': (r) => r.status === 200 });
    const api = http.get(`${BASE}/web/index.php/api/v2/dashboard/employees/time-at-work?currentDate=2026-10-15&currentTime=10:00`);
    check(api, { 'api dashboard < 400': (r) => r.status < 400 });
  });
  sleep(1);
}
