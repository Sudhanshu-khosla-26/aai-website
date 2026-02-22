/**
 * GET    /api/locations/[id]  - Get location by ID (with admin info)
 * PATCH  /api/locations/[id]  - Update location or assign admin
 * PUT    /api/locations/[id]  - Full update
 * DELETE /api/locations/[id]  - Delete location
 */

import { connectDB } from '../../../../lib/db';
import Location from '../../../../models/Location';
import User from '../../../../models/User';
import { withAuth } from '../../../../lib/auth';

// GET /api/locations/[id]
export const GET = withAuth(async (request, authUser, { params }) => {
    try {
        await connectDB();
        const { id } = await params;

        const location = await Location.findById(id)
            .populate('adminId', 'fullName employeeId email department')
            .lean();

        if (!location) {
            return Response.json({ success: false, message: 'Location not found' }, { status: 404 });
        }

        return Response.json({ success: true, location });
    } catch (error) {
        console.error('[GET /api/locations/[id]]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
});

// PATCH /api/locations/[id] - Partial update (including adminId assignment)
export const PATCH = withAuth(
    async (request, authUser, { params }) => {
        try {
            await connectDB();
            const { id } = await params;
            const body = await request.json();

            const allowed = [
                'name', 'latitude', 'longitude', 'radius', 'address',
                'polygon', 'isActive', 'allowedDepartments', 'adminId', 'timezone', 'airportCode'
            ];
            const updates = {};
            allowed.forEach((key) => {
                if (body[key] !== undefined) updates[key] = body[key];
            });

            // Validate adminId if being set
            if (updates.adminId) {
                const adminUser = await User.findById(updates.adminId).lean();
                if (!adminUser) {
                    return Response.json({ success: false, message: 'Admin user not found' }, { status: 404 });
                }
                if (!['admin', 'super_admin'].includes(adminUser.role)) {
                    return Response.json(
                        { success: false, message: 'Selected user must have admin or super_admin role' },
                        { status: 400 }
                    );
                }
            }

            const location = await Location.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
                .populate('adminId', 'fullName employeeId email department');

            if (!location) {
                return Response.json({ success: false, message: 'Location not found' }, { status: 404 });
            }

            return Response.json({ success: true, location, message: 'Location updated successfully' });
        } catch (error) {
            console.error('[PATCH /api/locations/[id]]', error);
            return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
        }
    },
    ['admin', 'super_admin']
);

// PUT /api/locations/[id] - Full update
export const PUT = withAuth(
    async (request, authUser, { params }) => {
        try {
            await connectDB();
            const { id } = await params;
            const body = await request.json();

            const { name, code, latitude, longitude, radius, address, isActive, allowedDepartments, adminId, timezone } = body;

            if (!name || latitude == null || longitude == null) {
                return Response.json(
                    { success: false, message: 'name, latitude, and longitude are required' },
                    { status: 400 }
                );
            }

            const updates = { name, latitude, longitude, radius: radius || 200, address, isActive, allowedDepartments, adminId, timezone };
            if (code) updates.code = code.toUpperCase();

            const location = await Location.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
                .populate('adminId', 'fullName employeeId email');

            if (!location) {
                return Response.json({ success: false, message: 'Location not found' }, { status: 404 });
            }

            return Response.json({ success: true, location, message: 'Location updated successfully' });
        } catch (error) {
            console.error('[PUT /api/locations/[id]]', error);
            return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
        }
    },
    ['admin', 'super_admin']
);

// DELETE /api/locations/[id]
export const DELETE = withAuth(
    async (request, authUser, { params }) => {
        try {
            await connectDB();
            const { id } = await params;

            const location = await Location.findByIdAndDelete(id);
            if (!location) {
                return Response.json({ success: false, message: 'Location not found' }, { status: 404 });
            }

            return Response.json({ success: true, message: 'Location deleted successfully.' });
        } catch (error) {
            console.error('[DELETE /api/locations/[id]]', error);
            return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
        }
    },
    ['super_admin'] // Only super_admin can delete locations
);
