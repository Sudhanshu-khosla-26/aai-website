/**
 * AAI Attendance Web - Leave Service
 * Handles leave management operations
 */

import { delay, generateId } from '../lib/utils';
import { 
  mockLeaveApplications, 
  mockLeaveBalances, 
  mockUsers,
  getUserById,
  DEFAULT_LEAVE_BALANCES 
} from '../lib/mockData';
import { LEAVE_TYPES } from '../lib/constants';

/**
 * Get leave applications
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Leave applications
 */
export async function getLeaves(filters = {}) {
  await delay(500);

  let applications = [...mockLeaveApplications];

  // Apply filters
  if (filters.userId) {
    applications = applications.filter(l => l.userId === filters.userId);
  }

  if (filters.status) {
    applications = applications.filter(l => l.status === filters.status);
  }

  if (filters.leaveType) {
    applications = applications.filter(l => l.leaveType === filters.leaveType);
  }

  // Sort by applied date descending
  applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedApplications = applications.slice(startIndex, endIndex);

  // Enrich with user data
  const enrichedApplications = paginatedApplications.map(app => {
    const user = getUserById(app.userId);
    const leaveType = LEAVE_TYPES.find(t => t.id === app.leaveType);
    return {
      ...app,
      user: user ? { 
        id: user.id, 
        fullName: user.fullName, 
        employeeId: user.employeeId,
        department: user.department,
      } : null,
      leaveTypeName: leaveType?.name || app.leaveType,
      leaveTypeColor: leaveType?.color || '#6B7280',
    };
  });

  return {
    success: true,
    applications: enrichedApplications,
    pagination: {
      total: applications.length,
      page,
      limit,
      totalPages: Math.ceil(applications.length / limit),
    },
  };
}

/**
 * Get leave application by ID
 * @param {string} leaveId - Leave ID
 * @returns {Promise<Object>} Leave application
 */
export async function getLeave(leaveId) {
  await delay(300);

  const application = mockLeaveApplications.find(l => l.id === leaveId);
  if (!application) {
    return {
      success: false,
      error: 'Leave application not found.',
    };
  }

  const user = getUserById(application.userId);
  const leaveType = LEAVE_TYPES.find(t => t.id === application.leaveType);

  return {
    success: true,
    application: {
      ...application,
      user: user ? { 
        id: user.id, 
        fullName: user.fullName, 
        employeeId: user.employeeId,
        department: user.department,
      } : null,
      leaveTypeName: leaveType?.name || application.leaveType,
      leaveTypeColor: leaveType?.color || '#6B7280',
    },
  };
}

/**
 * Apply for leave
 * @param {string} userId - User ID
 * @param {Object} leaveData - Leave application data
 * @returns {Promise<Object>} Application result
 */
export async function applyLeave(userId, leaveData) {
  await delay(800);

  const { leaveType, startDate, endDate, reason } = leaveData;

  // Validate dates
  if (new Date(startDate) > new Date(endDate)) {
    return {
      success: false,
      error: 'End date must be after start date.',
    };
  }

  // Calculate number of days (excluding weekends)
  const start = new Date(startDate);
  const end = new Date(endDate);
  let days = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      days++;
    }
  }

  // Check leave balance
  const balance = mockLeaveBalances[userId]?.[leaveType];
  if (!balance || balance.remaining < days) {
    return {
      success: false,
      error: `Insufficient leave balance. You have ${balance?.remaining || 0} days remaining.`,
    };
  }

  // Check for overlapping leaves
  const overlapping = mockLeaveApplications.some(app => 
    app.userId === userId &&
    app.status !== 'rejected' &&
    app.status !== 'cancelled' &&
    ((startDate >= app.startDate && startDate <= app.endDate) ||
     (endDate >= app.startDate && endDate <= app.endDate) ||
     (startDate <= app.startDate && endDate >= app.endDate))
  );

  if (overlapping) {
    return {
      success: false,
      error: 'You already have a leave application for these dates.',
    };
  }

  const newApplication = {
    id: `leave-${generateId()}`,
    userId,
    leaveType,
    startDate,
    endDate,
    numberOfDays: days,
    reason,
    status: 'pending',
    appliedAt: new Date().toISOString(),
    approvedAt: null,
    approvedBy: null,
    comments: null,
  };

  mockLeaveApplications.unshift(newApplication);

  return {
    success: true,
    message: 'Leave application submitted successfully.',
    application: newApplication,
  };
}

/**
 * Approve leave application
 * @param {string} leaveId - Leave ID
 * @param {string} approvedBy - Approver user ID
 * @param {string} comments - Approval comments
 * @returns {Promise<Object>} Approval result
 */
export async function approveLeave(leaveId, approvedBy, comments = '') {
  await delay(600);

  const application = mockLeaveApplications.find(l => l.id === leaveId);
  if (!application) {
    return {
      success: false,
      error: 'Leave application not found.',
    };
  }

  if (application.status !== 'pending') {
    return {
      success: false,
      error: 'Leave application is not pending.',
    };
  }

  // Deduct leave balance
  const balance = mockLeaveBalances[application.userId]?.[application.leaveType];
  if (balance) {
    balance.used += application.numberOfDays;
    balance.remaining -= application.numberOfDays;
  }

  application.status = 'approved';
  application.approvedAt = new Date().toISOString();
  application.approvedBy = approvedBy;
  application.comments = comments;

  return {
    success: true,
    message: 'Leave application approved.',
    application,
  };
}

/**
 * Reject leave application
 * @param {string} leaveId - Leave ID
 * @param {string} rejectedBy - Rejector user ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Rejection result
 */
export async function rejectLeave(leaveId, rejectedBy, reason = '') {
  await delay(600);

  const application = mockLeaveApplications.find(l => l.id === leaveId);
  if (!application) {
    return {
      success: false,
      error: 'Leave application not found.',
    };
  }

  if (application.status !== 'pending') {
    return {
      success: false,
      error: 'Leave application is not pending.',
    };
  }

  application.status = 'rejected';
  application.approvedAt = new Date().toISOString();
  application.approvedBy = rejectedBy;
  application.comments = reason;

  return {
    success: true,
    message: 'Leave application rejected.',
    application,
  };
}

/**
 * Cancel leave application
 * @param {string} leaveId - Leave ID
 * @returns {Promise<Object>} Cancel result
 */
export async function cancelLeave(leaveId) {
  await delay(500);

  const application = mockLeaveApplications.find(l => l.id === leaveId);
  if (!application) {
    return {
      success: false,
      error: 'Leave application not found.',
    };
  }

  if (application.status !== 'pending') {
    return {
      success: false,
      error: 'Only pending applications can be cancelled.',
    };
  }

  application.status = 'cancelled';

  return {
    success: true,
    message: 'Leave application cancelled.',
    application,
  };
}

/**
 * Get leave balance for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Leave balance
 */
export async function getLeaveBalance(userId) {
  await delay(300);

  const balance = mockLeaveBalances[userId] || { ...DEFAULT_LEAVE_BALANCES };

  // Enrich with leave type details
  const enrichedBalance = {};
  LEAVE_TYPES.forEach(type => {
    enrichedBalance[type.id] = {
      ...balance[type.id],
      name: type.name,
      color: type.color,
    };
  });

  return {
    success: true,
    balance: enrichedBalance,
  };
}

/**
 * Get leave statistics
 * @returns {Promise<Object>} Leave statistics
 */
export async function getLeaveStats() {
  await delay(400);

  const total = mockLeaveApplications.length;
  const pending = mockLeaveApplications.filter(l => l.status === 'pending').length;
  const approved = mockLeaveApplications.filter(l => l.status === 'approved').length;
  const rejected = mockLeaveApplications.filter(l => l.status === 'rejected').length;
  const cancelled = mockLeaveApplications.filter(l => l.status === 'cancelled').length;

  // By type
  const byType = {};
  LEAVE_TYPES.forEach(type => {
    byType[type.id] = mockLeaveApplications.filter(l => l.leaveType === type.id).length;
  });

  return {
    success: true,
    stats: {
      total,
      pending,
      approved,
      rejected,
      cancelled,
      byType,
    },
  };
}

/**
 * Get upcoming leaves
 * @param {number} limit - Number of records to return
 * @returns {Promise<Object>} Upcoming leaves
 */
export async function getUpcomingLeaves(limit = 5) {
  await delay(400);

  const today = new Date().toISOString().split('T')[0];
  
  const upcoming = mockLeaveApplications
    .filter(l => 
      l.status === 'approved' && 
      l.startDate >= today
    )
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, limit);

  // Enrich with user data
  const enrichedLeaves = upcoming.map(app => {
    const user = getUserById(app.userId);
    return {
      ...app,
      user: user ? { 
        id: user.id, 
        fullName: user.fullName, 
        employeeId: user.employeeId,
      } : null,
    };
  });

  return {
    success: true,
    leaves: enrichedLeaves,
  };
}

/**
 * Get logged-in user's leave applications
 * This is a wrapper around getLeaves that uses the current user's ID from context
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Leave applications (direct array for simpler usage)
 */
export async function getMyLeaves(filters = {}) {
  // In a real app, get userId from auth context or token
  // For now, return mock data for the first user
  const userId = 'user-1'; // This should come from auth context in production
  
  // Get the user's leaves with filters
  const result = await getLeaves({ ...filters, userId });
  
  // Return just the applications array for simpler usage in employee pages
  return result.applications || [];
}

/**
 * Apply for leave (current user)
 * This is a wrapper around applyLeave that uses the current user's ID from context
 * @param {Object} leaveData - Leave application data
 * @returns {Promise<Object>} Application result
 */
export async function applyForLeave(leaveData) {
  // In a real app, get userId from auth context or token
  const userId = 'user-1'; // This should come from auth context in production
  
  return await applyLeave(userId, leaveData);
}

