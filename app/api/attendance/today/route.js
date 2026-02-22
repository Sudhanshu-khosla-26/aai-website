/**
 * GET /api/attendance/today
 * Get today's attendance summary (admin) or own record (employee)
 */

import { connectDB } from '../../../../lib/db';
import Attendance from '../../../../models/Attendance';
import { withAuth } from '../../../../lib/auth';

export const GET = withAuth(async (request, authUser) => {
    try {
        await connectDB();

        const today = new Date().toISOString().split('T')[0];

        if (authUser.role === 'employee') {
            // Employee: return their own check-in/out status
            const record = await Attendance.findOne({
                userId: authUser.userId,
                date: today,
            }).lean();

            return Response.json({
                success: true,
                record: record || null,
                checkedIn: !!record?.checkIn,
                checkedOut: !!record?.checkOut,
            });
        }

        // Admin/Super Admin: return all records for today with user details
        const records = await Attendance.find({ date: today })
            .populate('userId', 'fullName employeeId department designation photoUrl')
            .sort({ 'checkIn.time': 1 })
            .lean();

        const summary = {
            present: records.filter((r) => r.status === 'present').length,
            absent: records.filter((r) => r.status === 'absent').length,
            halfDay: records.filter((r) => r.status === 'half-day').length,
            onLeave: records.filter((r) => r.status === 'leave').length,
            total: records.length,
        };

        return Response.json({
            success: true,
            date: today,
            records,
            summary,
        });
    } catch (error) {
        console.error('[GET /api/attendance/today]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
});
