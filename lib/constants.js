/**
 * AAI Attendance Web - Constants
 */

// App Information
export const APP_INFO = {
  name: 'AAI Attendance',
  fullName: 'Airport Authority of India - Attendance Management System',
  version: '1.0.0',
  copyright: '© 2024 Airport Authority of India',
  governmentNotice: 'Authorized Personnel Only - Government of India',
};

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  SUPER_ADMIN: 'super_admin',
};

// Leave Types
export const LEAVE_TYPES = [
  { id: 'CL', name: 'Casual Leave', color: '#3B82F6', icon: 'Umbrella' },
  { id: 'SL', name: 'Sick Leave', color: '#F59E0B', icon: 'HeartPulse' },
  { id: 'EL', name: 'Earned Leave', color: '#10B981', icon: 'CalendarCheck' },
];

// Departments
export const DEPARTMENTS = [
  { id: 'ATC', name: 'Air Traffic Control' },
  { id: 'ENG', name: 'Engineering' },
  { id: 'OPS', name: 'Operations' },
  { id: 'SEC', name: 'Security' },
  { id: 'ADM', name: 'Administration' },
  { id: 'FIN', name: 'Finance' },
  { id: 'HR', name: 'Human Resources' },
  { id: 'IT', name: 'Information Technology' },
];

// Designations
export const DESIGNATIONS = [
  { id: 'EXEC', name: 'Executive' },
  { id: 'MANAGER', name: 'Manager' },
  { id: 'DGM', name: 'Deputy General Manager' },
  { id: 'GM', name: 'General Manager' },
  { id: 'ED', name: 'Executive Director' },
  { id: 'CHAIRMAN', name: 'Chairman' },
];

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  HALF_DAY: 'half-day',
  LEAVE: 'leave',
  PENDING: 'pending',
};

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

// Default Leave Balances
export const DEFAULT_LEAVE_BALANCES = {
  CL: { total: 15, used: 0, remaining: 15 },
  SL: { total: 12, used: 0, remaining: 12 },
  EL: { total: 15, used: 0, remaining: 15 },
};

// Geofence Default Radius (meters)
export const DEFAULT_GEOFENCE_RADIUS = 200;

// Working Hours
export const WORKING_HOURS = {
  start: 9,   // 9 AM
  end: 18,    // 6 PM
};

// Sample Airport Locations
export const SAMPLE_LOCATIONS = [
  {
    id: 'loc-1',
    name: 'Indira Gandhi International Airport',
    code: 'DEL',
    latitude: 28.5562,
    longitude: 77.1000,
    radius: 500,
    address: 'New Delhi, Delhi 110037',
  },
  {
    id: 'loc-2',
    name: 'Chhatrapati Shivaji Maharaj International Airport',
    code: 'BOM',
    latitude: 19.0896,
    longitude: 72.8656,
    radius: 500,
    address: 'Mumbai, Maharashtra 400099',
  },
  {
    id: 'loc-3',
    name: 'Chennai International Airport',
    code: 'MAA',
    latitude: 12.9941,
    longitude: 80.1709,
    radius: 400,
    address: 'Chennai, Tamil Nadu 600027',
  },
  {
    id: 'loc-4',
    name: 'Kempegowda International Airport',
    code: 'BLR',
    latitude: 13.1986,
    longitude: 77.7066,
    radius: 500,
    address: 'Bengaluru, Karnataka 560300',
  },
];

// Sidebar Navigation Items
export const SIDEBAR_ITEMS = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard' },
    { id: 'employees', label: 'Employees', icon: 'Users', href: '/dashboard/employees' },
    { id: 'attendance', label: 'Attendance', icon: 'CalendarCheck', href: '/dashboard/attendance' },
    { id: 'leaves', label: 'Leave Management', icon: 'FileText', href: '/dashboard/leaves' },
    { id: 'locations', label: 'Locations', icon: 'MapPin', href: '/dashboard/locations' },
    { id: 'reports', label: 'Reports', icon: 'BarChart3', href: '/dashboard/reports' },
    { id: 'settings', label: 'Settings', icon: 'Settings', href: '/dashboard/settings' },
  ],
  employee: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard' },
    { id: 'my-attendance', label: 'My Attendance', icon: 'CalendarCheck', href: '/dashboard/my-attendance' },
    { id: 'apply-leave', label: 'Apply Leave', icon: 'FilePlus', href: '/dashboard/apply-leave' },
    { id: 'my-leaves', label: 'My Leaves', icon: 'FileText', href: '/dashboard/my-leaves' },
    { id: 'profile', label: 'Profile', icon: 'User', href: '/dashboard/profile' },
  ],
  super_admin: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard' },
    { id: 'employees', label: 'Employees', icon: 'Users', href: '/dashboard/employees' },
    { id: 'attendance', label: 'Attendance', icon: 'CalendarCheck', href: '/dashboard/attendance' },
    { id: 'leaves', label: 'Leave Management', icon: 'FileText', href: '/dashboard/leaves' },
    { id: 'locations', label: 'Locations', icon: 'MapPin', href: '/dashboard/locations' },
    { id: 'admins', label: 'Admin Users', icon: 'Shield', href: '/dashboard/admins' },
    { id: 'reports', label: 'Reports', icon: 'BarChart3', href: '/dashboard/reports' },
    { id: 'settings', label: 'Settings', icon: 'Settings', href: '/dashboard/settings' },
  ],
};

// Table Page Sizes
export const PAGE_SIZES = [10, 25, 50, 100];

// Date Formats
export const DATE_FORMATS = {
  display: 'dd MMM yyyy',
  displayWithTime: 'dd MMM yyyy, hh:mm a',
  input: 'yyyy-MM-dd',
  iso: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'',
};

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    forgotPassword: '/api/auth/forgot-password',
    verifyOTP: '/api/auth/verify-otp',
    resetPassword: '/api/auth/reset-password',
    refreshToken: '/api/auth/refresh-token',
  },
  users: {
    list: '/api/users',
    get: '/api/users/:id',
    create: '/api/users',
    update: '/api/users/:id',
    delete: '/api/users/:id',
  },
  attendance: {
    list: '/api/attendance',
    get: '/api/attendance/:id',
    checkIn: '/api/attendance/check-in',
    checkOut: '/api/attendance/check-out',
    today: '/api/attendance/today',
    stats: '/api/attendance/stats',
  },
  leaves: {
    list: '/api/leaves',
    get: '/api/leaves/:id',
    apply: '/api/leaves/apply',
    approve: '/api/leaves/:id/approve',
    reject: '/api/leaves/:id/reject',
    cancel: '/api/leaves/:id/cancel',
    balance: '/api/leaves/balance',
  },
  locations: {
    list: '/api/locations',
    get: '/api/locations/:id',
    create: '/api/locations',
    update: '/api/locations/:id',
    delete: '/api/locations/:id',
  },
};
