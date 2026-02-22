/**
 * AAI Attendance Web - Location Service (Production)
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

function buildQuery(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  return qs.toString() ? `?${qs.toString()}` : '';
}

export async function getLocations(filters = {}) {
  const qs = buildQuery(filters);
  const data = await apiFetch(`/api/locations${qs}`);
  // For backward compatibility - some callers expect an array directly
  return data.locations || (Array.isArray(data) ? data : []);
}

export async function getLocation(locationId) {
  const data = await apiFetch(`/api/locations/${locationId}`);
  if (!data.success) throw new Error(data.message || 'Location not found');
  return data.location;
}

export async function createLocation(locationData) {
  const data = await apiFetch('/api/locations', {
    method: 'POST',
    body: JSON.stringify(locationData),
  });
  if (!data.success) throw new Error(data.message || 'Failed to create location');
  return data.location;
}

export async function updateLocation(locationId, updates) {
  const data = await apiFetch(`/api/locations/${locationId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  if (!data.success) throw new Error(data.message || 'Failed to update location');
  return data.location;
}

export async function deleteLocation(locationId) {
  const data = await apiFetch(`/api/locations/${locationId}`, { method: 'DELETE' });
  if (!data.success) throw new Error(data.message || 'Failed to delete location');
  return { success: true };
}

/**
 * Check if coordinates are within a location's geofence
 * Pure client-side calculation - no API round-trip needed
 */
export async function checkGeofence(locationId, coordinates) {
  const location = await getLocation(locationId);
  const { latitude, longitude } = coordinates;

  if (location.polygon && location.polygon.length >= 3) {
    const isInside = isPointInPolygon(latitude, longitude, location.polygon);
    return {
      isInside,
      location,
      distance: isInside ? 0 : null,
      message: isInside
        ? 'You are within the designated work area'
        : 'You are outside the designated work area',
    };
  }

  const distance = calculateDistance(
    latitude,
    longitude,
    location.latitude,
    location.longitude
  );
  const isInside = distance <= location.radius;

  return {
    isInside,
    location,
    distance,
    message: isInside
      ? `Within range (${distance.toFixed(0)}m from center)`
      : `Outside range — ${distance.toFixed(0)}m from center (max: ${location.radius}m)`,
  };
}

export async function getNearbyLocations(coordinates, maxDistance = 5000) {
  const data = await apiFetch('/api/locations?isActive=true');
  const locations = data.locations || [];
  const { latitude, longitude } = coordinates;

  return locations
    .map((loc) => ({
      ...loc,
      distance: calculateDistance(latitude, longitude, loc.latitude, loc.longitude),
    }))
    .filter((loc) => loc.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
}

export function validateGeofence(geofence) {
  if (!Array.isArray(geofence) || geofence.length < 3) {
    return { valid: false, error: 'Geofence must be an array of at least 3 coordinates' };
  }
  for (const point of geofence) {
    if (typeof point.lat !== 'number' || typeof point.lng !== 'number') {
      return { valid: false, error: 'Each point must have numeric lat and lng' };
    }
  }
  return { valid: true };
}

// ---- Geometry helpers ----

function isPointInPolygon(lat, lng, polygon) {
  let inside = false;
  let j = polygon.length - 1;
  for (let i = 0; i < polygon.length; i++) {
    const xi = polygon[i].lng ?? polygon[i].longitude;
    const yi = polygon[i].lat ?? polygon[i].latitude;
    const xj = polygon[j].lng ?? polygon[j].longitude;
    const yj = polygon[j].lat ?? polygon[j].latitude;
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
    j = i;
  }
  return inside;
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}
