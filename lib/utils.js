import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 * @param {...string} inputs - Class names to merge
 * @returns {string} Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to display string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const defaultOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  };
  
  return d.toLocaleDateString('en-IN', defaultOptions);
}

/**
 * Format time to display string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time string
 */
export function formatTime(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date and time together
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
  if (!date) return '-';
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Get greeting based on time of day
 * @returns {string} Greeting message
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Calculate duration between two dates in hours
 * @param {Date|string} start - Start date/time
 * @param {Date|string} end - End date/time
 * @returns {number} Duration in hours
 */
export function calculateDuration(start, end) {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate - startDate;
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format number with Indian number system
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString('en-IN');
}

/**
 * Get status color based on status value
 * @param {string} status - Status value
 * @returns {string} Tailwind color class
 */
export function getStatusColor(status) {
  const colors = {
    present: 'text-status-success bg-status-success/10',
    absent: 'text-status-error bg-status-error/10',
    'half-day': 'text-status-warning bg-status-warning/10',
    leave: 'text-status-info bg-status-info/10',
    pending: 'text-status-warning bg-status-warning/10',
    approved: 'text-status-success bg-status-success/10',
    rejected: 'text-status-error bg-status-error/10',
    active: 'text-status-success bg-status-success/10',
    inactive: 'text-grey-500 bg-grey-100',
  };
  return colors[status?.toLowerCase()] || 'text-grey-600 bg-grey-100';
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
export function isValidPhone(phone) {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate employee ID format
 * @param {string} id - Employee ID to validate
 * @returns {boolean} Is valid ID
 */
export function isValidEmployeeId(id) {
  const idRegex = /^[A-Z]{2}\d{4,6}$/;
  return idRegex.test(id?.toUpperCase());
}

/**
 * Delay execution (for mock API calls)
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Load Google Maps script dynamically
 * @param {string} apiKey - Google Maps API key
 * @param {Function} callback - Callback function when script loads
 */
export function loadGoogleMapsScript(apiKey, callback) {
  if (window.google?.maps) {
    callback();
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,geometry,places`;
  script.async = true;
  script.defer = true;
  script.onload = callback;
  document.head.appendChild(script);
}

/**
 * Calculate days between two dates
 * @param {string} fromDate - Start date (YYYY-MM-DD)
 * @param {string} toDate - End date (YYYY-MM-DD)
 * @returns {number} Number of days
 */
export function calculateDaysBetween(fromDate, toDate) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 * @param {number} lat - Latitude of point
 * @param {number} lng - Longitude of point
 * @param {Array} polygon - Array of {lat, lng} points
 * @returns {boolean} True if point is inside polygon
 */
export function isPointInPolygon(lat, lng, polygon) {
  if (!polygon || polygon.length < 3) return false;
  
  let inside = false;
  let j = polygon.length - 1;
  
  for (let i = 0; i < polygon.length; i++) {
    const xi = polygon[i].lng || polygon[i].longitude;
    const yi = polygon[i].lat || polygon[i].latitude;
    const xj = polygon[j].lng || polygon[j].longitude;
    const yj = polygon[j].lat || polygon[j].latitude;
    
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
    j = i;
  }
  
  return inside;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees value
 * @returns {number} Radians value
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
