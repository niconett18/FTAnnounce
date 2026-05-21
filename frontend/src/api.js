/**
 * api.js — Semua komunikasi ke backend dikumpulkan di sini
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let logoutCallback = null;

export function setLogoutCallback(callback) {
  logoutCallback = callback;
}

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && logoutCallback) {
      alert("Sesi Anda telah habis atau tidak valid. Silakan login kembali.");
      logoutCallback();
    }
    return Promise.reject(err);
  }
);

// === Ambil pengumuman per channel (publik) ===
export async function fetchAnnouncements(channelId, lastTimestamp = null) {
  let url = `${BASE_URL}/api/announcements/${channelId}`;
  if (lastTimestamp) {
    url += `?last_timestamp=${lastTimestamp}`;
  }
  const res = await axios.get(url);
  return {
    announcements: res.data.announcements.map(a => ({
      id: a.id,
      author: a.authorName,
      authorRole: a.authorRole || null,
      authorAccountType: a.authorAccountType || null,
      date: a.createdAt,
      priority: a.priority,
      title: a.title,
      content: a.content,
      attachments: a.attachments || [],
      pinUntil: a.pinUntil || null,
      readCount: a.readCount || 0,
    })),
    nextTimestamp: res.data.nextTimestamp
  };
}

// === Login admin ===
export async function loginAdmin(username, password) {
  const res = await axios.post(`${BASE_URL}/api/auth/login`, { username, password });
  return res.data;
}

// === Buat pengumuman baru (butuh token) ===
export async function createAnnouncement(data, token) {
  const res = await axios.post(
    `${BASE_URL}/api/announcements`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// === Update profile admin (butuh token) ===
export async function updateAdminProfile({ displayName, roleTitle, profilePicture }, token) {
  const res = await axios.put(
    `${BASE_URL}/api/admin/profile`,
    { displayName, roleTitle, profilePicture },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// === Tandai pengumuman telah dibaca ===
export async function markAsRead(announcementId, readerId) {
  const res = await axios.post(`${BASE_URL}/api/announcements/${announcementId}/read`, { readerId });
  return res.data;
}

// === Dapatkan atau buat reader ID untuk perangkat ini ===
export function getReaderId() {
  let readerId = localStorage.getItem('ftannounce_reader_id');
  if (!readerId) {
    readerId = crypto.randomUUID();
    localStorage.setItem('ftannounce_reader_id', readerId);
  }
  return readerId;
}
