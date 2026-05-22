import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    write_storm: {
      executor: 'constant-arrival-rate',
      rate: 100, // Kecepatan target (100 request per detik)
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 50,
      maxVUs: 200,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // Kegagalan request harus < 1%
    http_req_duration: ['p(95)<300'], // 95% request harus selesai di bawah 300ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// Setup: Dipanggil sekali di awal untuk mengambil token JWT admin
export function setup() {
  const loginUrl = `${BASE_URL}/api/auth/login`;
  const payload = JSON.stringify({
    username: 'admin',
    password: 'admin123',
  });
  const params = { headers: { 'Content-Type': 'application/json' } };
  
  const res = http.post(loginUrl, payload, params);
  
  if (res.status !== 200) {
    throw new Error(`Setup login gagal dengan status ${res.status}: ${res.body}`);
  }
  
  const token = res.json().token;
  return { token };
}

// Default VU function: Menembak POST pengumuman
export default function (data) {
  const url = `${BASE_URL}/api/announcements`;
  const payload = JSON.stringify({
    channelId: 'dte',
    title: `Pengumuman Stress Test - VU ${__VU} - Iter ${__ITER}`,
    content: 'Simulasi Write Storm untuk menguji tabrakan UUID dan Write Cassandra dalam waktu yang bersamaan.',
    priority: 'info',
    attachments: [],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`,
    },
  };

  const res = http.post(url, payload, params);
  
  check(res, {
    'status is 201': (r) => r.status === 201,
  });
}
