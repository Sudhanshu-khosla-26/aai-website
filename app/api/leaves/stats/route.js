/**
 * GET /api/leaves/stats
 * Leave statistics (admin only summary, or own summary for employees)
 */

import { connectDB } from '../../../../lib/db';
import Leave from '../../../../models/Leave';
import { withAuth } from '../../../../lib/auth';
import { LEAVE_TYPES } from '../../../../lib/constants';
import mongoose from 'mongoose';

export const GET = withAuth(async (request, authUser) => {
    try {
        await connectDB();

        const filter = {};
        if (authUser.role === 'employee') {
            filter.userId = new mongoose.Types.ObjectId(authUser.userId);
        }

        const leaves = await Leave.find(filter).lean();

        const total = leaves.length;
        const pending = leaves.filter((l) => l.status === 'pending').length;
        const approved = leaves.filter((l) => l.status === 'approved').length;
        const rejected = leaves.filter((l) => l.status === 'rejected').length;
        const cancelled = leaves.filter((l) => l.status === 'cancelled').length;

        const byType = {};
        LEAVE_TYPES.forEach((type) => {
            byType[type.id] = leaves.filter((l) => l.leaveType === type.id).length;
        });

        // Upcoming approved leaves (next 30 days)
        const today = new Date().toISOString().split('T')[0];
        const upcoming = leaves
            .filter((l) => l.status === 'approved' && l.startDate >= today)
            .sort((a, b) => a.startDate.localeCompare(b.startDate))
            .slice(0, 5);

        return Response.json({
            success: true,
            stats: { total, pending, approved, rejected, cancelled, byType },
            upcomingLeaves: upcoming,
        });
    } catch (error) {
        console.error('[GET /api/leaves/stats]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
});
