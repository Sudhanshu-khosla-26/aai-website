/**
 * AAI Attendance Web - Mock Data
 * Simulated data for frontend development
 */

import { generateId } from './utils';
import { ROLES, LEAVE_TYPES, DEPARTMENTS, DESIGNATIONS, SAMPLE_LOCATIONS, DEFAULT_LEAVE_BALANCES } from './constants';

// Mock Users
export const mockUsers = [
  {
    id: 'user-1',
    employeeId: 'AA100001',
    email: 'admin@aai.aero',
    password: 'Admin@123',
    fullName: 'Rajesh Kumar',
    phone: '9876543210',
    department: 'OPS',
    designation: 'MANAGER',
    locationId: 'loc-1',
    role: ROLES.ADMIN,
    status: 'active',
    isEmailVerified: true,
    isPhotoVerified: true,
    photoUrl: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLoginAt: '2024-12-01T08:30:00.000Z',
  },
  {
    id: 'user-2',
    employeeId: 'AA100002',
    email: 'priya.sharma@aai.aero',
    password: 'User@123',
    fullName: 'Priya Sharma',
    phone: '9876543211',
    department: 'ATC',
    designation: 'EXEC',
    locationId: 'loc-2',
    role: ROLES.EMPLOYEE,
    status: 'active',
    isEmailVerified: true,
    isPhotoVerified: true,
    photoUrl: null,
    createdAt: '2024-01-15T00:00:00.000Z',
    lastLoginAt: '2024-12-01T09:00:00.000Z',
  },
  {
    id: 'user-3',
    employeeId: 'AA100003',
    email: 'amit.patel@aai.aero',
    password: 'User@123',
    fullName: 'Amit Patel',
    phone: '9876543212',
    department: 'ENG',
    designation: 'EXEC',
    locationId: 'loc-1',
    role: ROLES.EMPLOYEE,
    status: 'active',
    isEmailVerified: true,
    isPhotoVerified: true,
    photoUrl: null,
    createdAt: '2024-02-01T00:00:00.000Z',
    lastLoginAt: '2024-11-30T08:45:00.000Z',
  },
  {
    id: 'user-4',
    employeeId: 'AA100004',
    email: 'sneha.gupta@aai.aero',
    password: 'User@123',
    fullName: 'Sneha Gupta',
    phone: '9876543213',
    department: 'HR',
    designation: 'MANAGER',
    locationId: 'loc-3',
    role: ROLES.EMPLOYEE,
    status: 'active',
    isEmailVerified: true,
    isPhotoVerified: true,
    photoUrl: null,
    createdAt: '2024-02-15T00:00:00.000Z',
    lastLoginAt: '2024-12-01T08:15:00.000Z',
  },
  {
    id: 'user-5',
    employeeId: 'AA100005',
    email: 'vikram.singh@aai.aero',
    password: 'User@123',
    fullName: 'Vikram Singh',
    phone: '9876543214',
    department: 'SEC',
    designation: 'DGM',
    locationId: 'loc-4',
    role: ROLES.ADMIN,
    status: 'active',
    isEmailVerified: true,
    isPhotoVerified: true,
    photoUrl: null,
    createdAt: '2024-03-01T00:00:00.000Z',
    lastLoginAt: '2024-12-01T07:30:00.000Z',
  },
  {
    id: 'user-6',
    employeeId: 'SA100001',
    email: 'super.admin@aai.aero',
    password: 'Super@123',
    fullName: 'Super Administrator',
    phone: '9999999999',
    department: 'IT',
    designation: 'GM',
    locationId: 'loc-1',
    role: ROLES.SUPER_ADMIN,
    status: 'active',
    isEmailVerified: true,
    isPhotoVerified: true,
    photoUrl: null,
    createdAt: '2023-01-01T00:00:00.000Z',
    lastLoginAt: '2024-12-01T06:00:00.000Z',
  },
];

// Mock Leave Balances
export const mockLeaveBalances = {
  'user-1': { ...DEFAULT_LEAVE_BALANCES, CL: { total: 15, used: 2, remaining: 13 } },
  'user-2': { ...DEFAULT_LEAVE_BALANCES, CL: { total: 15, used: 3, remaining: 12 }, EL: { total: 15, used: 5, remaining: 10 } },
  'user-3': { ...DEFAULT_LEAVE_BALANCES, SL: { total: 12, used: 1, remaining: 11 } },
  'user-4': { ...DEFAULT_LEAVE_BALANCES, CL: { total: 15, used: 5, remaining: 10 } },
  'user-5': { ...DEFAULT_LEAVE_BALANCES, EL: { total: 15, used: 3, remaining: 12 } },
  'user-6': { ...DEFAULT_LEAVE_BALANCES },
};

// Mock Leave Applications
export const mockLeaveApplications = [
  {
    id: 'leave-1',
    userId: 'user-2',
    leaveType: 'CL',
    startDate: '2024-12-10',
    endDate: '2024-12-11',
    numberOfDays: 2,
    reason: 'Family function at hometown',
    status: 'approved',
    appliedAt: '2024-12-01T10:00:00.000Z',
    approvedAt: '2024-12-02T14:00:00.000Z',
    approvedBy: 'user-1',
    comments: 'Approved. Enjoy your time!',
  },
  {
    id: 'leave-2',
    userId: 'user-2',
    leaveType: 'SL',
    startDate: '2024-11-15',
    endDate: '2024-11-16',
    numberOfDays: 2,
    reason: 'Fever and cold',
    status: 'approved',
    appliedAt: '2024-11-14T09:00:00.000Z',
    approvedAt: '2024-11-14T11:00:00.000Z',
    approvedBy: 'user-1',
    comments: 'Get well soon!',
  },
  {
    id: 'leave-3',
    userId: 'user-3',
    leaveType: 'CL',
    startDate: '2024-12-20',
    endDate: '2024-12-20',
    numberOfDays: 1,
    reason: 'Personal work',
    status: 'pending',
    appliedAt: '2024-12-01T11:00:00.000Z',
    approvedAt: null,
    approvedBy: null,
    comments: null,
  },
  {
    id: 'leave-4',
    userId: 'user-4',
    leaveType: 'EL',
    startDate: '2024-12-25',
    endDate: '2024-12-31',
    numberOfDays: 5,
    reason: 'Year-end vacation with family',
    status: 'pending',
    appliedAt: '2024-12-01T08:00:00.000Z',
    approvedAt: null,
    approvedBy: null,
    comments: null,
  },
  {
    id: 'leave-5',
    userId: 'user-2',
    leaveType: 'CL',
    startDate: '2024-10-05',
    endDate: '2024-10-05',
    numberOfDays: 1,
    reason: 'Urgent personal work',
    status: 'rejected',
    appliedAt: '2024-10-04T16:00:00.000Z',
    approvedAt: '2024-10-04T17:00:00.000Z',
    approvedBy: 'user-1',
    comments: 'Insufficient staff on that day',
  },
];

// Generate Mock Attendance Records
function generateAttendanceRecords() {
  const records = [];
  const today = new Date();
  
  // Generate records for the last 30 days for each user
  mockUsers.forEach(user => {
    if (user.role === ROLES.SUPER_ADMIN) return;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      const isPresent = Math.random() > 0.15; // 85% present rate
      
      if (isPresent) {
        const checkInTime = new Date(date);
        checkInTime.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
        
        const checkOutTime = new Date(date);
        checkOutTime.setHours(16 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));
        
        const duration = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        
        records.push({
          id: `att-${generateId()}`,
          userId: user.id,
          date: dateStr,
          status: duration < 4 ? 'half-day' : 'present',
          checkIn: {
            time: checkInTime.toISOString(),
            location: { lat: 28.5562 + (Math.random() - 0.5) * 0.01, lng: 77.1000 + (Math.random() - 0.5) * 0.01 },
            photoUrl: null,
          },
          checkOut: {
            time: checkOutTime.toISOString(),
            location: { lat: 28.5562 + (Math.random() - 0.5) * 0.01, lng: 77.1000 + (Math.random() - 0.5) * 0.01 },
            photoUrl: null,
          },
          duration: Math.round(duration * 100) / 100,
          syncStatus: 'synced',
          createdAt: checkInTime.toISOString(),
        });
      } else {
        // Check if user was on leave
        const onLeave = mockLeaveApplications.some(leave => 
          leave.userId === user.id &&
          leave.status === 'approved' &&
          dateStr >= leave.startDate &&
          dateStr <= leave.endDate
        );
        
        records.push({
          id: `att-${generateId()}`,
          userId: user.id,
          date: dateStr,
          status: onLeave ? 'leave' : 'absent',
          checkIn: null,
          checkOut: null,
          duration: 0,
          syncStatus: 'synced',
          createdAt: date.toISOString(),
        });
      }
    }
  });
  
  return records.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export const mockAttendanceRecords = generateAttendanceRecords();

// Mock Locations with Polygon Geofences
export const mockLocations = [
  ...SAMPLE_LOCATIONS,
  {
    id: 'loc-5',
    name: 'AAI Regional Office - Hyderabad',
    code: 'HYD-RO',
    latitude: 17.4065,
    longitude: 78.4772,
    radius: 150,
    address: 'Hyderabad, Telangana 500004',
    polygon: null,
    isActive: true,
  },
  {
    id: 'loc-6',
    name: 'AAI Training Center',
    code: 'TRN-CTR',
    latitude: 28.6139,
    longitude: 77.2090,
    radius: 100,
    address: 'New Delhi, Delhi 110001',
    polygon: [
      { lat: 28.6149, lng: 77.2080 },
      { lat: 28.6149, lng: 77.2100 },
      { lat: 28.6129, lng: 77.2100 },
      { lat: 28.6129, lng: 77.2080 },
    ],
    isActive: true,
  },
];

// Mock Dashboard Stats
export const mockDashboardStats = {
  totalEmployees: mockUsers.filter(u => u.role !== ROLES.SUPER_ADMIN).length,
  presentToday: Math.floor(mockUsers.length * 0.85),
  absentToday: Math.floor(mockUsers.length * 0.10),
  onLeaveToday: Math.floor(mockUsers.length * 0.05),
  pendingLeaves: mockLeaveApplications.filter(l => l.status === 'pending').length,
  avgCheckInTime: '08:45 AM',
  avgCheckOutTime: '05:30 PM',
  avgWorkingHours: 8.5,
};

// Mock Attendance Trend Data (for charts)
export const mockAttendanceTrend = [
  { date: 'Mon', present: 45, absent: 3, leave: 2 },
  { date: 'Tue', present: 47, absent: 2, leave: 1 },
  { date: 'Wed', present: 46, absent: 2, leave: 2 },
  { date: 'Thu', present: 48, absent: 1, leave: 1 },
  { date: 'Fri', present: 44, absent: 4, leave: 2 },
];

// Mock Department-wise Attendance
export const mockDepartmentAttendance = [
  { department: 'ATC', present: 12, total: 14 },
  { department: 'ENG', present: 8, total: 10 },
  { department: 'OPS', present: 15, total: 16 },
  { department: 'SEC', present: 10, total: 12 },
  { department: 'HR', present: 5, total: 6 },
  { department: 'IT', present: 7, total: 8 },
];

// Mock Recent Activities
export const mockRecentActivities = [
  { id: 1, type: 'check-in', user: 'Priya Sharma', time: '08:30 AM', message: 'Checked in at DEL' },
  { id: 2, type: 'leave', user: 'Amit Patel', time: '09:00 AM', message: 'Applied for Casual Leave' },
  { id: 3, type: 'check-in', user: 'Sneha Gupta', time: '08:45 AM', message: 'Checked in at MAA' },
  { id: 4, type: 'check-out', user: 'Vikram Singh', time: '05:30 PM', message: 'Checked out from BLR' },
  { id: 5, type: 'leave', user: 'Rajesh Kumar', time: '10:00 AM', message: 'Approved leave application' },
];

// Get user by ID
export function getUserById(id) {
  return mockUsers.find(u => u.id === id) || null;
}

// Get user by email
export function getUserByEmail(email) {
  return mockUsers.find(u => u.email === email) || null;
}

// Get user by employee ID
export function getUserByEmployeeId(employeeId) {
  return mockUsers.find(u => u.employeeId === employeeId) || null;
}

// Get leave balance for user
export function getLeaveBalance(userId) {
  return mockLeaveBalances[userId] || DEFAULT_LEAVE_BALANCES;
}

// Get attendance for user
export function getUserAttendance(userId, limit = 30) {
  return mockAttendanceRecords
    .filter(r => r.userId === userId)
    .slice(0, limit);
}

// Get leave applications for user
export function getUserLeaves(userId) {
  return mockLeaveApplications.filter(l => l.userId === userId);
}
