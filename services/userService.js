/**
 * AAI Attendance Web - User Service (Production)
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
  return res.json();
}

function buildQuery(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  return qs.toString() ? `?${qs.toString()}` : '';
}

export async function getUsers(filters = {}) {
  const qs = buildQuery(filters);
  return apiFetch(`/api/users${qs}`);
}

export async function getUser(userId) {
  return apiFetch(`/api/users/${userId}`);
}

export async function createUser(userData) {
  return apiFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function updateUser(userId, updates) {
  return apiFetch(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteUser(userId) {
  return apiFetch(`/api/users/${userId}`, { method: 'DELETE' });
}

export async function approveUser(userId) {
  return apiFetch(`/api/users/${userId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}

export async function getUserStats() {
  return apiFetch('/api/users/stats');
}

export async function getEmployeeLeaveBalance(userId) {
  const qs = userId ? `?userId=${userId}` : '';
  return apiFetch(`/api/leaves/balance${qs}`);
}

export async function updateLeaveBalance(userId, balance) {
  return apiFetch('/api/leaves/balance', {
    method: 'PATCH',
    body: JSON.stringify({ userId, ...balance }),
  });
}
