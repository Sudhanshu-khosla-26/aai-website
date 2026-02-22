/**
 * GET    /api/users/[id]   - Get a user by ID
 * PATCH  /api/users/[id]   - Update a user
 * DELETE /api/users/[id]   - Soft-delete (deactivate) a user
 */

import { connectDB } from '../../../../lib/db';
import User from '../../../../models/User';
import { withAuth } from '../../../../lib/auth';

// GET /api/users/[id]
export const GET = withAuth(
    async (request, authUser, { params }) => {
        try {
            await connectDB();
            const { id } = params;

            const user = await User.findById(id).lean();
            if (!user) {
                return Response.json({ success: false, message: 'User not found' }, { status: 404 });
            }

            return Response.json({ success: true, user });
        } catch (error) {
            console.error('[GET /api/users/[id]]', error);
            return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
        }
    },
    ['admin', 'super_admin']
);

// PATCH /api/users/[id]
export const PATCH = withAuth(
    async (request, authUser, { params }) => {
        try {
            await connectDB();
            const { id } = params;

            const body = await request.json();
            const allowed = [
                'fullName', 'firstName', 'lastName', 'phone', 'department',
                'designation', 'locationId', 'status', 'role', 'photoUrl',
                'isEmailVerified', 'isPhotoVerified',
            ];

            const updates = {};
            allowed.forEach((key) => {
                if (body[key] !== undefined) updates[key] = body[key];
            });

            // Only super_admin can change roles
            if (updates.role && authUser.role !== 'super_admin') {
                delete updates.role;
            }

            // Sync fullName ↔ firstName/lastName
            if ((updates.firstName || updates.lastName) && !updates.fullName) {
                const existing = await User.findById(id).lean();
                const fn = updates.firstName || existing?.firstName || '';
                const ln = updates.lastName || existing?.lastName || '';
                updates.fullName = [fn, ln].filter(Boolean).join(' ').trim();
            }

            const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
            if (!user) {
                return Response.json({ success: false, message: 'User not found' }, { status: 404 });
            }

            return Response.json({ success: true, user: user.toSafeObject() });
        } catch (error) {
            console.error('[PATCH /api/users/[id]]', error);
            return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
        }
    },
    ['admin', 'super_admin']
);

// DELETE /api/users/[id] - Soft delete (deactivate)
export const DELETE = withAuth(
    async (request, authUser, { params }) => {
        try {
            await connectDB();
            const { id } = params;

            // Prevent deleting own account
            if (id === authUser.userId) {
                return Response.json({ success: false, message: 'Cannot deactivate your own account.' }, { status: 400 });
            }

            const user = await User.findByIdAndUpdate(
                id,
                { status: 'inactive' },
                { new: true }
            );

            if (!user) {
                return Response.json({ success: false, message: 'User not found' }, { status: 404 });
            }

            return Response.json({ success: true, message: 'User deactivated successfully.', user: user.toSafeObject() });
        } catch (error) {
            console.error('[DELETE /api/users/[id]]', error);
            return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
        }
    },
    ['admin', 'super_admin']
);
