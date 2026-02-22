/**
 * POST /api/attendance/check-geofence
 * Validates if user coordinates are within an assigned location's geofence
 */

import { connectDB } from '../../../../lib/db';
import Location from '../../../../models/Location';
import { withAuth } from '../../../../lib/auth';
import User from '../../../../models/User';

// Haversine distance in meters
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const POST = withAuth(async (request, authUser) => {
    try {
        await connectDB();

        const body = await request.json();
        const { latitude, longitude, locationId } = body;

        if (latitude == null || longitude == null) {
            return Response.json(
                { success: false, message: 'latitude and longitude are required' },
                { status: 400 }
            );
        }

        // Determine which location to check against
        let targetLocationId = locationId;

        if (!targetLocationId) {
            // Use the user's assigned location
            const user = await User.findById(authUser.userId).select('locationId').lean();
            targetLocationId = user?.locationId;
        }

        if (!targetLocationId) {
            return Response.json(
                { success: false, message: 'No location assigned. Please contact admin.' },
                { status: 400 }
            );
        }

        const location = await Location.findById(targetLocationId).lean();
        if (!location) {
            return Response.json(
                { success: false, message: 'Assigned location not found' },
                { status: 404 }
            );
        }

        const distance = haversineDistance(
            latitude,
            longitude,
            location.latitude,
            location.longitude
        );

        const isInside = distance <= location.radius;

        return Response.json({
            success: true,
            isInside,
            distance: Math.round(distance),
            radius: location.radius,
            formattedDistance: distance < 1000
                ? `${Math.round(distance)}m`
                : `${(distance / 1000).toFixed(1)}km`,
            location: {
                _id: location._id,
                name: location.name,
                code: location.code,
                latitude: location.latitude,
                longitude: location.longitude,
                radius: location.radius,
            },
        });
    } catch (error) {
        console.error('[POST /api/attendance/check-geofence]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
});
