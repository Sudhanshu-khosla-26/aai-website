/**
 * AAI Attendance Web - Leave Service (Production)
 * All operations go through Next.js API routes → MongoDB Atlas
 */

import { LEAVE_TYPES } from '../lib/constants';

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

export async function getLeaves(filters = {}) {
  const qs = buildQuery(filters);
  return apiFetch(`/api/leaves${qs}`);
}

export async function getLeave(leaveId) {
  return apiFetch(`/api/leaves/${leaveId}`);
}

export async function applyLeave(userId, leaveData) {
  return apiFetch('/api/leaves', {
    method: 'POST',
    body: JSON.stringify(leaveData),
  });
}

export async function approveLeave(leaveId, approvedBy, comments = '') {
  return apiFetch(`/api/leaves/${leaveId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ comments }),
  });
}

export async function rejectLeave(leaveId, rejectedBy, reason = '') {
  return apiFetch(`/api/leaves/${leaveId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export async function cancelLeave(leaveId) {
  return apiFetch(`/api/leaves/${leaveId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}

export async function getLeaveBalance(userId) {
  const qs = userId ? `?userId=${userId}` : '';
  return apiFetch(`/api/leaves/balance${qs}`);
}

export async function getLeaveStats() {
  return apiFetch('/api/leaves/stats');
}

export async function getUpcomingLeaves(limit = 5) {
  const data = await apiFetch('/api/leaves/stats');
  return {
    success: true,
    leaves: data.upcomingLeaves?.slice(0, limit) || [],
  };
}

/** Employee shortcut: get own leaves */
export async function getMyLeaves(filters = {}) {
  const qs = buildQuery(filters);
  const data = await apiFetch(`/api/leaves${qs}`);
  return data.applications || [];
}

/** Employee shortcut: apply for own leave */
export async function applyForLeave(leaveData) {
  return apiFetch('/api/leaves', {
    method: 'POST',
    body: JSON.stringify(leaveData),
  });
}
