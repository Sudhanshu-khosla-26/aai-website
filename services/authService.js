/**
 * AAI Attendance Web - Authentication Service (Production)
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

// ---------- Exported functions used by AuthContext ----------

export async function login(identifier, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

export async function register(userData) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function logout() {
  return apiFetch('/api/auth/logout', { method: 'POST' });
}

export async function getCurrentUser() {
  const data = await apiFetch('/api/auth/me');
  return data.success ? data.user : null;
}

export async function generateOTP(email) {
  return apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyOTP(email, otp) {
  return apiFetch('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
}

export async function resetPassword(email, newPassword, otp) {
  return apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, otp, newPassword }),
  });
}

export async function forgotPassword(email) {
  return apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function updateProfile(userId, updates) {
  return apiFetch('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function changePassword(userId, currentPassword, newPassword) {
  // In production, implement a dedicated change-password route
  // For now return a placeholder
  return {
    success: false,
    message: 'Use forgot password flow to change your password.',
  };
}

export function isAuthenticated() {
  return !!getToken();
}

export function getCurrentUserSync() {
  return null; // Use async getCurrentUser() instead
}

// Stub - kept for backwards compatibility with any remaining mock refs
export function setCurrentUser() { }
export function hasRole() { return false; }
