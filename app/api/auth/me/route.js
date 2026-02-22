/**
 * GET   /api/auth/me  - Get current user profile with location
 * PATCH /api/auth/me  - Update own profile
 */

import { connectDB } from '../../../../lib/db';
import User from '../../../../models/User';
import { withAuth } from '../../../../lib/auth';

export const GET = withAuth(async (request, authUser) => {
    try {
        await connectDB();

        const user = await User.findById(authUser.userId)
            .populate('locationId', 'name code latitude longitude radius address timezone');

        if (!user) {
            return Response.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return Response.json({ success: true, user: user.toSafeObject() });
    } catch (error) {
        console.error('[GET /api/auth/me]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
});

export const PATCH = withAuth(async (request, authUser) => {
    try {
        await connectDB();

        const body = await request.json();
        const allowed = ['fullName', 'firstName', 'lastName', 'phone', 'photoUrl', 'locationId'];
        const updates = {};
        allowed.forEach((key) => {
            if (body[key] !== undefined) updates[key] = body[key];
        });

        if (updates.firstName || updates.lastName) {
            const user = await User.findById(authUser.userId).lean();
            const first = updates.firstName || user?.firstName || '';
            const last = updates.lastName || user?.lastName || '';
            updates.fullName = [first, last].filter(Boolean).join(' ').trim();
        }

        const updatedUser = await User.findByIdAndUpdate(authUser.userId, updates, {
            new: true,
            runValidators: true,
        }).populate('locationId', 'name code latitude longitude radius address');

        if (!updatedUser) {
            return Response.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return Response.json({ success: true, user: updatedUser.toSafeObject() });
    } catch (error) {
        console.error('[PATCH /api/auth/me]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
});
