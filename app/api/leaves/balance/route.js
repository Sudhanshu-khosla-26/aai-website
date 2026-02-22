/**
 * GET /api/leaves/balance
 * Get leave balance for current user (or specific user for admin)
 */

import { connectDB } from '../../../../lib/db';
import LeaveBalance from '../../../../models/LeaveBalance';
import { withAuth } from '../../../../lib/auth';
import { LEAVE_TYPES } from '../../../../lib/constants';
import mongoose from 'mongoose';

export const GET = withAuth(async (request, authUser) => {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        let targetUserId = authUser.userId;
        if (authUser.role !== 'employee') {
            const queryUserId = searchParams.get('userId');
            if (queryUserId) targetUserId = queryUserId;
        }

        let balance = await LeaveBalance.findOne({
            userId: new mongoose.Types.ObjectId(targetUserId),
        }).lean();

        if (!balance) {
            // Auto-create default balance
            balance = await LeaveBalance.create({ userId: targetUserId });
            balance = balance.toObject();
        }

        // Enrich with leave type names and colors
        const enriched = {};
        LEAVE_TYPES.forEach((type) => {
            enriched[type.id] = {
                ...(balance[type.id] || { total: 0, used: 0, remaining: 0 }),
                name: type.name,
                color: type.color,
                icon: type.icon,
            };
        });

        return Response.json({ success: true, balance: enriched });
    } catch (error) {
        console.error('[GET /api/leaves/balance]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
});

/**
 * PATCH /api/leaves/balance
 * Admin updates leave balance for a user
 */
export const PATCH = withAuth(
    async (request, authUser) => {
        try {
            await connectDB();

            const body = await request.json();
            const { userId, CL, SL, EL } = body;

            if (!userId) {
                return Response.json({ success: false, message: 'userId is required' }, { status: 400 });
            }

            const updates = {};
            if (CL) updates.CL = CL;
            if (SL) updates.SL = SL;
            if (EL) updates.EL = EL;

            const balance = await LeaveBalance.findOneAndUpdate(
                { userId: new mongoose.Types.ObjectId(userId) },
                updates,
                { new: true, upsert: true }
            );

            return Response.json({ success: true, balance });
        } catch (error) {
            console.error('[PATCH /api/leaves/balance]', error);
            return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
        }
    },
    ['admin', 'super_admin']
);
