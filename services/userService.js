/**
 * AAI Attendance Web - User Service
 * Handles user/employee management operations
 */

import { delay, generateId } from '../lib/utils';
import { mockUsers, getUserById, getLeaveBalance, mockLeaveBalances, DEFAULT_LEAVE_BALANCES } from '../lib/mockData';

const normalizeUser = (user) => {
  if (!user) return user;

  let firstName = user.firstName;
  let lastName = user.lastName;
  let fullName = user.fullName;

  if (!firstName && !lastName && fullName) {
    const parts = fullName.trim().split(/\s+/);
    firstName = parts.shift() || '';
    lastName = parts.join(' ');
  }

  if ((!fullName || !fullName.trim()) && (firstName || lastName)) {
    fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  }

  const status = user.status || (user.isActive === false ? 'inactive' : 'active');
  const isActive = user.isActive !== undefined ? user.isActive : status === 'active';

  return {
    ...user,
    firstName,
    lastName,
    fullName,
    status,
    isActive,
  };
};

/**
 * Get all users/employees
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Users list
 */
export async function getUsers(filters = {}) {
  await delay(600);

  let users = mockUsers.map(u => normalizeUser({ ...u, password: undefined }));

  // Apply filters
  if (filters.role) {
    users = users.filter(u => u.role === filters.role);
  }

  if (filters.department) {
    users = users.filter(u => u.department === filters.department);
  }

  if (filters.status) {
    users = users.filter(u => u.status === filters.status);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    users = users.filter(u => 
      u.fullName.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      u.employeeId.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = users.slice(startIndex, endIndex);

  return {
    success: true,
    users: paginatedUsers,
    pagination: {
      total: users.length,
      page,
      limit,
      totalPages: Math.ceil(users.length / limit),
    },
  };
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 */
export async function getUser(userId) {
  await delay(400);

  const user = getUserById(userId);
  if (!user) {
    return {
      success: false,
      error: 'User not found.',
    };
  }

  return {
    success: true,
    user: normalizeUser({ ...user, password: undefined }),
  };
}

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
export async function createUser(userData) {
  await delay(800);

  // Check for duplicates
  if (mockUsers.some(u => u.email === userData.email)) {
    return {
      success: false,
      error: 'Email already exists.',
    };
  }

  if (mockUsers.some(u => u.employeeId === userData.employeeId)) {
    return {
      success: false,
      error: 'Employee ID already exists.',
    };
  }

  const fullName = userData.fullName || [userData.firstName, userData.lastName].filter(Boolean).join(' ').trim();
  const status = userData.status || (userData.isActive === false ? 'inactive' : 'active');
  const newUser = {
    id: `user-${generateId()}`,
    ...userData,
    fullName,
    status,
    isActive: userData.isActive !== undefined ? userData.isActive : status === 'active',
    isEmailVerified: false,
    isPhotoVerified: false,
    photoUrl: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  mockUsers.push(newUser);

  // Initialize leave balance
  mockLeaveBalances[newUser.id] = { ...DEFAULT_LEAVE_BALANCES };

  return {
    success: true,
    user: normalizeUser({ ...newUser, password: undefined }),
  };
}

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated user
 */
export async function updateUser(userId, updates) {
  await delay(600);

  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return {
      success: false,
      error: 'User not found.',
    };
  }

  // Update allowed fields
  const allowedFields = [
    'firstName', 'lastName', 'fullName', 'phone', 'department', 'designation',
    'locationId', 'status', 'role', 'photoUrl', 'isActive'
  ];

  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      mockUsers[userIndex][field] = updates[field];
    }
  });

  if ((updates.firstName || updates.lastName) && !updates.fullName) {
    mockUsers[userIndex].fullName = [mockUsers[userIndex].firstName, mockUsers[userIndex].lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  if (updates.isActive !== undefined) {
    mockUsers[userIndex].status = updates.isActive ? 'active' : 'inactive';
  }

  if (updates.status) {
    mockUsers[userIndex].isActive = updates.status === 'active';
  }

  return {
    success: true,
    user: normalizeUser({ ...mockUsers[userIndex], password: undefined }),
  };
}

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Delete result
 */
export async function deleteUser(userId) {
  await delay(600);

  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return {
      success: false,
      error: 'User not found.',
    };
  }

  // Soft delete - mark as inactive
  mockUsers[userIndex].status = 'inactive';

  return {
    success: true,
    message: 'User deactivated successfully.',
  };
}

/**
 * Get user statistics
 * @returns {Promise<Object>} User statistics
 */
export async function getUserStats() {
  await delay(400);

  const total = mockUsers.filter(u => u.role !== 'super_admin').length;
  const active = mockUsers.filter(u => u.status === 'active' && u.role !== 'super_admin').length;
  const inactive = mockUsers.filter(u => u.status === 'inactive').length;
  const pending = mockUsers.filter(u => u.status === 'pending').length;

  // By department
  const byDepartment = {};
  mockUsers.forEach(u => {
    if (u.role === 'super_admin') return;
    if (!byDepartment[u.department]) {
      byDepartment[u.department] = 0;
    }
    byDepartment[u.department]++;
  });

  // By designation
  const byDesignation = {};
  mockUsers.forEach(u => {
    if (u.role === 'super_admin') return;
    if (!byDesignation[u.designation]) {
      byDesignation[u.designation] = 0;
    }
    byDesignation[u.designation]++;
  });

  return {
    success: true,
    stats: {
      total,
      active,
      inactive,
      pending,
      byDepartment,
      byDesignation,
    },
  };
}

/**
 * Get employee's leave balance
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Leave balance
 */
export async function getEmployeeLeaveBalance(userId) {
  await delay(300);

  const balance = getLeaveBalance(userId);
  
  return {
    success: true,
    balance,
  };
}

/**
 * Update employee's leave balance
 * @param {string} userId - User ID
 * @param {Object} balance - New balance
 * @returns {Promise<Object>} Updated balance
 */
export async function updateLeaveBalance(userId, balance) {
  await delay(500);

  mockLeaveBalances[userId] = { ...balance };

  return {
    success: true,
    balance: mockLeaveBalances[userId],
  };
}

/**
 * Approve user registration
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Approval result
 */
export async function approveUser(userId) {
  await delay(500);

  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return {
      success: false,
      error: 'User not found.',
    };
  }

  user.status = 'active';

  return {
    success: true,
    message: 'User approved successfully.',
    user: { ...user, password: undefined },
  };
}
