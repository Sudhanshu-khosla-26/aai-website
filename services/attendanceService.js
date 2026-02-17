/**
 * AAI Attendance Web - Attendance Service
 * Handles attendance-related operations
 */

import { delay, generateId } from '../lib/utils';
import { 
  mockAttendanceRecords, 
  mockUsers, 
  mockLocations,
  getUserById 
} from '../lib/mockData';

/**
 * Get attendance records
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Attendance records
 */
export async function getAttendance(filters = {}) {
  await delay(600);

  let records = [...mockAttendanceRecords];

  // Apply filters
  if (filters.userId) {
    records = records.filter(r => r.userId === filters.userId);
  }

  if (filters.date) {
    records = records.filter(r => r.date === filters.date);
  }

  if (filters.status) {
    records = records.filter(r => r.status === filters.status);
  }

  if (filters.startDate && filters.endDate) {
    records = records.filter(r => 
      r.date >= filters.startDate && r.date <= filters.endDate
    );
  }

  // Sort by date descending
  records.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedRecords = records.slice(startIndex, endIndex);

  // Enrich with user data
  const enrichedRecords = paginatedRecords.map(record => {
    const user = getUserById(record.userId);
    return {
      ...record,
      user: user ? { 
        id: user.id, 
        fullName: user.fullName, 
        employeeId: user.employeeId,
        department: user.department,
      } : null,
    };
  });

  return {
    success: true,
    records: enrichedRecords,
    pagination: {
      total: records.length,
      page,
      limit,
      totalPages: Math.ceil(records.length / limit),
    },
  };
}

/**
 * Get today's attendance
 * @returns {Promise<Object>} Today's attendance
 */
export async function getTodayAttendance() {
  await delay(400);

  const today = new Date().toISOString().split('T')[0];
  const records = mockAttendanceRecords.filter(r => r.date === today);

  // Enrich with user data
  const enrichedRecords = records.map(record => {
    const user = getUserById(record.userId);
    return {
      ...record,
      user: user ? { 
        id: user.id, 
        fullName: user.fullName, 
        employeeId: user.employeeId,
        department: user.department,
      } : null,
    };
  });

  const present = enrichedRecords.filter(r => r.status === 'present').length;
  const absent = enrichedRecords.filter(r => r.status === 'absent').length;
  const halfDay = enrichedRecords.filter(r => r.status === 'half-day').length;
  const onLeave = enrichedRecords.filter(r => r.status === 'leave').length;

  return {
    success: true,
    records: enrichedRecords,
    summary: {
      present,
      absent,
      halfDay,
      onLeave,
      total: enrichedRecords.length,
    },
  };
}

/**
 * Get attendance statistics
 * @param {Object} params - Parameters
 * @returns {Promise<Object>} Attendance statistics
 */
export async function getAttendanceStats(params = {}) {
  await delay(500);

  const { startDate, endDate, userId } = params;
  
  let records = [...mockAttendanceRecords];

  if (startDate && endDate) {
    records = records.filter(r => 
      r.date >= startDate && r.date <= endDate
    );
  }

  if (userId) {
    records = records.filter(r => r.userId === userId);
  }

  const totalDays = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const halfDay = records.filter(r => r.status === 'half-day').length;
  const onLeave = records.filter(r => r.status === 'leave').length;

  const totalHours = records.reduce((sum, r) => sum + (r.duration || 0), 0);
  const avgHours = totalDays > 0 ? totalHours / totalDays : 0;

  const attendanceRate = totalDays > 0 
    ? ((present + onLeave) / totalDays) * 100 
    : 0;

  return {
    success: true,
    stats: {
      totalDays,
      present,
      absent,
      halfDay,
      onLeave,
      totalHours: Math.round(totalHours * 100) / 100,
      avgHours: Math.round(avgHours * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    },
  };
}

/**
 * Get attendance by user ID
 * @param {string} userId - User ID
 * @param {Object} params - Parameters
 * @returns {Promise<Object>} User attendance
 */
export async function getUserAttendance(userId, params = {}) {
  await delay(400);

  let records = mockAttendanceRecords.filter(r => r.userId === userId);

  if (params.startDate && params.endDate) {
    records = records.filter(r => 
      r.date >= params.startDate && r.date <= params.endDate
    );
  }

  records.sort((a, b) => new Date(b.date) - new Date(a.date));

  const limit = params.limit || 30;
  const limitedRecords = records.slice(0, limit);

  return {
    success: true,
    records: limitedRecords,
  };
}

/**
 * Check in user
 * @param {string} userId - User ID
 * @param {Object} data - Check-in data
 * @returns {Promise<Object>} Check-in result
 */
export async function checkIn(userId, data) {
  await delay(800);

  const today = new Date().toISOString().split('T')[0];
  
  // Check if already checked in
  const existingRecord = mockAttendanceRecords.find(
    r => r.userId === userId && r.date === today
  );

  if (existingRecord?.checkIn) {
    return {
      success: false,
      error: 'Already checked in today.',
    };
  }

  const checkInData = {
    time: new Date().toISOString(),
    location: data.location,
    photoUrl: data.photoUrl,
  };

  if (existingRecord) {
    existingRecord.checkIn = checkInData;
  } else {
    mockAttendanceRecords.unshift({
      id: `att-${generateId()}`,
      userId,
      date: today,
      status: 'present',
      checkIn: checkInData,
      checkOut: null,
      duration: 0,
      syncStatus: 'synced',
      createdAt: new Date().toISOString(),
    });
  }

  return {
    success: true,
    message: 'Check-in successful.',
    record: mockAttendanceRecords.find(r => r.userId === userId && r.date === today),
  };
}

/**
 * Check out user
 * @param {string} userId - User ID
 * @param {Object} data - Check-out data
 * @returns {Promise<Object>} Check-out result
 */
export async function checkOut(userId, data) {
  await delay(800);

  const today = new Date().toISOString().split('T')[0];
  
  const record = mockAttendanceRecords.find(
    r => r.userId === userId && r.date === today
  );

  if (!record?.checkIn) {
    return {
      success: false,
      error: 'Not checked in today.',
    };
  }

  if (record.checkOut) {
    return {
      success: false,
      error: 'Already checked out today.',
    };
  }

  const checkOutData = {
    time: new Date().toISOString(),
    location: data.location,
    photoUrl: data.photoUrl,
  };

  record.checkOut = checkOutData;

  // Calculate duration
  const checkInTime = new Date(record.checkIn.time);
  const checkOutTime = new Date(checkOutData.time);
  const durationMs = checkOutTime - checkInTime;
  record.duration = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;

  // Update status based on duration
  if (record.duration < 4) {
    record.status = 'half-day';
  }

  return {
    success: true,
    message: 'Check-out successful.',
    record,
  };
}

/**
 * Get attendance trend data for charts
 * @param {Object} params - Parameters
 * @returns {Promise<Object>} Trend data
 */
export async function getAttendanceTrend(params = {}) {
  await delay(500);

  const { days = 7 } = params;
  const today = new Date();
  const trend = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayRecords = mockAttendanceRecords.filter(r => r.date === dateStr);
    
    trend.push({
      date: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      present: dayRecords.filter(r => r.status === 'present').length,
      absent: dayRecords.filter(r => r.status === 'absent').length,
      halfDay: dayRecords.filter(r => r.status === 'half-day').length,
      leave: dayRecords.filter(r => r.status === 'leave').length,
    });
  }

  return {
    success: true,
    trend,
  };
}

/**
 * Get department-wise attendance
 * @returns {Promise<Object>} Department attendance
 */
export async function getDepartmentAttendance() {
  await delay(400);

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = mockAttendanceRecords.filter(r => r.date === today);

  const departmentStats = {};

  todayRecords.forEach(record => {
    const user = getUserById(record.userId);
    if (!user) return;

    if (!departmentStats[user.department]) {
      departmentStats[user.department] = {
        department: user.department,
        total: 0,
        present: 0,
        absent: 0,
      };
    }

    departmentStats[user.department].total++;
    if (record.status === 'present' || record.status === 'half-day') {
      departmentStats[user.department].present++;
    } else {
      departmentStats[user.department].absent++;
    }
  });

  return {
    success: true,
    departments: Object.values(departmentStats),
  };
}

/**
 * Get logged-in user's attendance records
 * This is a wrapper around getAttendance that uses the current user's ID from context
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Attendance records (direct array for simpler usage)
 */
export async function getMyAttendance(filters = {}) {
  // In a real app, get userId from auth context or token
  // For now, return mock data for the first user
  const userId = 'user-1'; // This should come from auth context in production
  
  // Get the user's attendance with filters
  const result = await getAttendance({ ...filters, userId });
  
  // Return just the records array for simpler usage in employee pages
  return result.records || [];
}
