import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 200 }, // Ramping up ke 200 pengguna virtual
    { duration: '20s', target: 200 }, // Tetap di 200 pengguna virtual selama 20 detik
    { duration: '10s', target: 0 },   // Ramping down ke 0 pengguna virtual
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // Kegagalan request harus < 1%
    http_req_duration: ['p(95)<200'], // 95% request harus selesai di bawah 200ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

const CHANNELS = [
  'dtm', 'dts', 'dte', 'dti', 'dtmm', 'dtk', 'da', 
  'beasiswa', 'magang-karir', 'seminar', 'lomba'
];

export default function () {
  // Pilih channel secara acak untuk mensimulasikan sebaran lalu lintas nyata
  const randomChannel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];
  const url = `${BASE_URL}/api/announcements/${randomChannel}`;
  
  const res = http.get(url);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has announcements array': (r) => {
      try {
        return Array.isArray(r.json().announcements);
      } catch (e) {
        return false;
      }
    }
  });

  // Simulasi pengguna membaca feed sebelum melakukan navigasi/refresh
  sleep(0.5);
}
