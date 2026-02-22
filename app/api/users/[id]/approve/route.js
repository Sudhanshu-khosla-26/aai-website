/**
 * PATCH /api/users/[id]/approve
 * Admin approves a pending user registration
 */

import { connectDB } from '../../../../../lib/db';
import User from '../../../../../models/User';
import { withAuth } from '../../../../../lib/auth';

export const PATCH = withAuth(
    async (request, authUser, { params }) => {
        try {
            await connectDB();
            const { id } = params;

            const user = await User.findById(id);
            if (!user) {
                return Response.json({ success: false, message: 'User not found' }, { status: 404 });
            }

            if (user.status !== 'pending') {
                return Response.json(
                    { success: false, message: `User is already ${user.status}.` },
                    { status: 400 }
                );
            }

            user.status = 'active';
            await user.save({ validateBeforeSave: false });

            return Response.json({
                success: true,
                message: 'User approved successfully.',
                user: user.toSafeObject(),
            });
        } catch (error) {
            console.error('[PATCH /api/users/[id]/approve]', error);
            return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
        }
    },
    ['admin', 'super_admin']
);
