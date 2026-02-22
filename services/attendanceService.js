/**
 * AAI Attendance Web - Attendance Service (Production)
 * All operations go through Next.js API routes → MongoDB Atlas
 */

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('aai_token') : null;

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok && res.status !== 200) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }

  return res.json();
}

function buildQuery(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  return qs.toString() ? `?${qs.toString()}` : '';
}

export async function getAttendance(filters = {}) {
  const qs = buildQuery(filters);
  return apiFetch(`/api/attendance${qs}`);
}

export async function getTodayAttendance() {
  return apiFetch('/api/attendance/today');
}

export async function getAttendanceStats(params = {}) {
  const qs = buildQuery(params);
  return apiFetch(`/api/attendance/stats${qs}`);
}

export async function getUserAttendance(userId, params = {}) {
  const qs = buildQuery({ userId, ...params });
  return apiFetch(`/api/attendance${qs}`);
}

export async function checkIn(userId, data) {
  return apiFetch('/api/attendance/check-in', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function checkOut(userId, data) {
  return apiFetch('/api/attendance/check-out', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAttendanceTrend(params = {}) {
  const qs = buildQuery(params);
  return apiFetch(`/api/attendance/stats${qs}`);
}

export async function getDepartmentAttendance() {
  return apiFetch('/api/attendance/today');
}

/** For employee pages - returns current user's records */
export async function getMyAttendance(filters = {}) {
  const qs = buildQuery(filters);
  const data = await apiFetch(`/api/attendance${qs}`);
  return data.records || [];
}
