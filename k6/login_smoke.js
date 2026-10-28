import http from 'k6/http';
import { check, sleep, group } from 'k6';

const BASE = __ENV.BASE || 'http://localhost:8081';
export const options = {
  vus: 5, duration: '30s',
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<2000'] },
};

export default function () {
  const res = http.get(`${BASE}/web/index.php/auth/login`);
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
