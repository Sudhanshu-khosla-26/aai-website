/**
 * Location Service
 * Handles workplace location and geofence management
 */

import { mockLocations } from '../lib/mockData';
import { delay } from '../lib/utils';

// In-memory storage for locations (would be a database in production)
let locationsStore = [...mockLocations];

/**
 * Get all locations with optional filtering
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} List of locations
 */
export async function getLocations(filters = {}) {
  await delay(400);
  
  let filteredLocations = [...locationsStore];
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredLocations = filteredLocations.filter(
      loc =>
        loc.name.toLowerCase().includes(searchLower) ||
        loc.address.toLowerCase().includes(searchLower) ||
        loc.airportCode.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters.airportCode) {
    filteredLocations = filteredLocations.filter(
      loc => loc.airportCode === filters.airportCode
    );
  }
  
  if (filters.isActive !== undefined) {
    filteredLocations = filteredLocations.filter(
      loc => loc.isActive === filters.isActive
    );
  }
  
  if (filters.department) {
    filteredLocations = filteredLocations.filter(
      loc => loc.allowedDepartments.includes(filters.department)
    );
  }
  
  return filteredLocations;
}

/**
 * Get location by ID
 * @param {string} locationId - Location ID
 * @returns {Promise<Object>} Location data
 */
export async function getLocation(locationId) {
  await delay(300);
  
  const location = locationsStore.find(loc => loc.id === locationId);
  
  if (!location) {
    throw new Error('Location not found');
  }
  
  return location;
}

/**
 * Create a new location
 * @param {Object} locationData - Location data
 * @returns {Promise<Object>} Created location
 */
export async function createLocation(locationData) {
  await delay(600);
  
  const newLocation = {
    id: `loc_${Date.now()}`,
    ...locationData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  locationsStore.push(newLocation);
  
  return newLocation;
}

/**
 * Update an existing location
 * @param {string} locationId - Location ID
 * @param {Object} updates - Location updates
 * @returns {Promise<Object>} Updated location
 */
export async function updateLocation(locationId, updates) {
  await delay(500);
  
  const locationIndex = locationsStore.findIndex(loc => loc.id === locationId);
  
  if (locationIndex === -1) {
    throw new Error('Location not found');
  }
  
  const updatedLocation = {
    ...locationsStore[locationIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  locationsStore[locationIndex] = updatedLocation;
  
  return updatedLocation;
}

/**
 * Delete a location
 * @param {string} locationId - Location ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteLocation(locationId) {
  await delay(400);
  
  const locationIndex = locationsStore.findIndex(loc => loc.id === locationId);
  
  if (locationIndex === -1) {
    throw new Error('Location not found');
  }
  
  locationsStore.splice(locationIndex, 1);
  
  return { success: true, message: 'Location deleted successfully' };
}

/**
 * Check if coordinates are within geofence
 * @param {string} locationId - Location ID
 * @param {Object} coordinates - { latitude, longitude }
 * @returns {Promise<Object>} Geofence check result
 */
export async function checkGeofence(locationId, coordinates) {
  await delay(200);
  
  const location = locationsStore.find(loc => loc.id === locationId);
  
  if (!location) {
    throw new Error('Location not found');
  }
  
  const { latitude, longitude } = coordinates;
  const { geofence, radius } = location;
  
  // If polygon geofence is defined, check if point is inside
  if (geofence && geofence.length >= 3) {
    const isInside = isPointInPolygon(latitude, longitude, geofence);
    
    return {
      isInside,
      location,
      distance: isInside ? 0 : calculateDistanceToPolygon(latitude, longitude, geofence),
      message: isInside 
        ? 'You are within the designated work area' 
        : 'You are outside the designated work area',
    };
  }
  
  // Fallback to circular geofence
  const center = geofence && geofence.length > 0 
    ? geofence[0] 
    : { latitude: location.latitude, longitude: location.longitude };
  
  const distance = calculateDistance(
    latitude,
    longitude,
    center.latitude,
    center.longitude
  );
  
  const isInside = distance <= radius;
  
  return {
    isInside,
    location,
    distance,
    message: isInside 
      ? `You are ${distance.toFixed(0)}m from center - within allowed range` 
      : `You are ${distance.toFixed(0)}m from center - outside allowed range of ${radius}m`,
  };
}

/**
 * Get nearby locations based on coordinates
 * @param {Object} coordinates - { latitude, longitude }
 * @param {number} maxDistance - Maximum distance in meters
 * @returns {Promise<Array>} Nearby locations
 */
export async function getNearbyLocations(coordinates, maxDistance = 5000) {
  await delay(400);
  
  const { latitude, longitude } = coordinates;
  
  const nearbyLocations = locationsStore
    .filter(loc => loc.isActive)
    .map(loc => {
      const distance = calculateDistance(
        latitude,
        longitude,
        loc.latitude,
        loc.longitude
      );
      return { ...loc, distance };
    })
    .filter(loc => loc.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
  
  return nearbyLocations;
}

/**
 * Get location statistics
 * @param {string} locationId - Location ID
 * @returns {Promise<Object>} Location statistics
 */
export async function getLocationStats(locationId) {
  await delay(300);
  
  const location = locationsStore.find(loc => loc.id === locationId);
  
  if (!location) {
    throw new Error('Location not found');
  }
  
  // Mock statistics
  return {
    locationId,
    totalCheckIns: Math.floor(Math.random() * 500) + 100,
    todayCheckIns: Math.floor(Math.random() * 50) + 10,
    averageDailyAttendance: Math.floor(Math.random() * 40) + 20,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Validate geofence coordinates
 * @param {Array} geofence - Array of coordinate objects
 * @returns {Object} Validation result
 */
export function validateGeofence(geofence) {
  if (!Array.isArray(geofence)) {
    return { valid: false, error: 'Geofence must be an array of coordinates' };
  }
  
  if (geofence.length < 3) {
    return { valid: false, error: 'Geofence must have at least 3 points to form a polygon' };
  }
  
  for (const point of geofence) {
    if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
      return { valid: false, error: 'Each point must have latitude and longitude as numbers' };
    }
    
    if (point.latitude < -90 || point.latitude > 90) {
      return { valid: false, error: 'Latitude must be between -90 and 90' };
    }
    
    if (point.longitude < -180 || point.longitude > 180) {
      return { valid: false, error: 'Longitude must be between -180 and 180' };
    }
  }
  
  return { valid: true };
}

// Helper function: Check if point is inside polygon using ray casting algorithm
function isPointInPolygon(lat, lng, polygon) {
  let inside = false;
  let j = polygon.length - 1;
  
  for (let i = 0; i < polygon.length; i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;
    
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
    j = i;
  }
  
  return inside;
}

// Helper function: Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
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

// Helper function: Calculate minimum distance from point to polygon
function calculateDistanceToPolygon(lat, lng, polygon) {
  let minDistance = Infinity;
  
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const distance = distanceToSegment(
      lat,
      lng,
      polygon[i].latitude,
      polygon[i].longitude,
      polygon[j].latitude,
      polygon[j].longitude
    );
    minDistance = Math.min(minDistance, distance);
  }
  
  return minDistance;
}

// Helper function: Calculate distance from point to line segment
function distanceToSegment(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }
  
  let xx, yy;
  
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  const dx = px - xx;
  const dy = py - yy;
  
  return Math.sqrt(dx * dx + dy * dy) * 111320; // Convert to meters (approximate)
}

// Helper function: Convert degrees to radians
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
