/**
 * AAI Attendance Web - Authentication Service
 * Handles all authentication-related operations
 */

import { delay } from '../lib/utils';
import { mockUsers, getUserByEmail, getUserByEmployeeId } from '../lib/mockData';
import { ROLES } from '../lib/constants';

// In-memory storage for session (simulating backend)
let currentUser = null;
let otpStore = {}; // Store OTPs temporarily

/**
 * Login user with email/employee ID and password
 * @param {string} identifier - Email or Employee ID
 * @param {string} password - User password
 * @returns {Promise<Object>} Login result
 */
export async function login(identifier, password) {
  // Simulate API delay
  await delay(800);

  // Find user by email or employee ID
  let user = getUserByEmail(identifier);
  if (!user) {
    user = getUserByEmployeeId(identifier);
  }

  if (!user) {
    return {
      success: false,
      error: 'Invalid credentials. Please check your email/employee ID and password.',
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      error: 'Invalid credentials. Please check your email/employee ID and password.',
    };
  }

  if (user.status !== 'active') {
    return {
      success: false,
      error: 'Your account is inactive. Please contact your administrator.',
    };
  }

  // Create session (exclude password)
  const { password: _, ...userWithoutPassword } = user;
  currentUser = userWithoutPassword;

  // Update last login
  user.lastLoginAt = new Date().toISOString();

  return {
    success: true,
    user: userWithoutPassword,
    token: generateMockToken(user.id),
  };
}

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration result
 */
export async function register(userData) {
  await delay(1000);

  // Check if email already exists
  if (getUserByEmail(userData.email)) {
    return {
      success: false,
      error: 'Email already registered. Please use a different email.',
    };
  }

  // Check if employee ID already exists
  if (getUserByEmployeeId(userData.employeeId)) {
    return {
      success: false,
      error: 'Employee ID already registered.',
    };
  }

  // Create new user (in real app, this would be saved to database)
  const newUser = {
    id: `user-${Date.now()}`,
    ...userData,
    role: ROLES.EMPLOYEE,
    status: 'pending', // Requires admin approval
    isEmailVerified: false,
    isPhotoVerified: false,
    photoUrl: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  // Add to mock users (in memory only)
  mockUsers.push(newUser);

  return {
    success: true,
    message: 'Registration successful! Please wait for admin approval.',
    user: { ...newUser, password: undefined },
  };
}

/**
 * Logout current user
 * @returns {Promise<Object>} Logout result
 */
export async function logout() {
  await delay(300);
  currentUser = null;
  return { success: true };
}

/**
 * Get current logged-in user
 * @returns {Object|null} Current user or null
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean} Is authenticated
 */
export function isAuthenticated() {
  return currentUser !== null;
}

/**
 * Check if user has specific role
 * @param {string|string[]} roles - Role(s) to check
 * @returns {boolean} Has role
 */
export function hasRole(roles) {
  if (!currentUser) return false;
  if (Array.isArray(roles)) {
    return roles.includes(currentUser.role);
  }
  return currentUser.role === roles;
}

/**
 * Generate and send OTP for password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} OTP generation result
 */
export async function generateOTP(email) {
  await delay(800);

  const user = getUserByEmail(email);
  if (!user) {
    return {
      success: false,
      error: 'Email not found. Please check your email address.',
    };
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with expiry (15 minutes)
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 15 * 60 * 1000,
    attempts: 0,
  };

  // In real app, send email here
  console.log(`OTP for ${email}: ${otp}`);

  return {
    success: true,
    message: 'OTP sent to your email address.',
    // For demo purposes, return OTP
    demoOtp: otp,
  };
}

/**
 * Verify OTP
 * @param {string} email - User email
 * @param {string} otp - OTP to verify
 * @returns {Promise<Object>} Verification result
 */
export async function verifyOTP(email, otp) {
  await delay(500);

  const storedData = otpStore[email];
  if (!storedData) {
    return {
      success: false,
      error: 'OTP expired. Please request a new one.',
    };
  }

  if (Date.now() > storedData.expiresAt) {
    delete otpStore[email];
    return {
      success: false,
      error: 'OTP expired. Please request a new one.',
    };
  }

  if (storedData.attempts >= 3) {
    delete otpStore[email];
    return {
      success: false,
      error: 'Too many failed attempts. Please request a new OTP.',
    };
  }

  if (storedData.otp !== otp) {
    storedData.attempts++;
    return {
      success: false,
      error: 'Invalid OTP. Please try again.',
    };
  }

  // Clear OTP after successful verification
  delete otpStore[email];

  return {
    success: true,
    message: 'OTP verified successfully.',
  };
}

/**
 * Reset user password
 * @param {string} email - User email
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Reset result
 */
export async function resetPassword(email, newPassword) {
  await delay(800);

  const user = getUserByEmail(email);
  if (!user) {
    return {
      success: false,
      error: 'User not found.',
    };
  }

  // Update password
  user.password = newPassword;

  return {
    success: true,
    message: 'Password reset successful. Please login with your new password.',
  };
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Update result
 */
export async function updateProfile(userId, updates) {
  await delay(600);

  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return {
      success: false,
      error: 'User not found.',
    };
  }

  // Update allowed fields
  const allowedFields = ['fullName', 'phone', 'photoUrl'];
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      user[field] = updates[field];
    }
  });

  // Update current user if it's the same user
  if (currentUser && currentUser.id === userId) {
    currentUser = { ...currentUser, ...updates };
  }

  return {
    success: true,
    user: { ...user, password: undefined },
  };
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Change result
 */
export async function changePassword(userId, currentPassword, newPassword) {
  await delay(600);

  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return {
      success: false,
      error: 'User not found.',
    };
  }

  if (user.password !== currentPassword) {
    return {
      success: false,
      error: 'Current password is incorrect.',
    };
  }

  user.password = newPassword;

  return {
    success: true,
    message: 'Password changed successfully.',
  };
}

/**
 * Generate a mock JWT token
 * @param {string} userId - User ID
 * @returns {string} Mock token
 */
function generateMockToken(userId) {
  return `mock_token_${userId}_${Date.now()}`;
}

/**
 * Set current user (for demo/testing purposes)
 * @param {Object} user - User object
 */
export function setCurrentUser(user) {
  currentUser = user;
}
