/**
 * GET /api/attendance/stats
 * Attendance statistics for a user or org-wide
 */

import { connectDB } from '../../../../lib/db';
import Attendance from '../../../../models/Attendance';
import { withAuth } from '../../../../lib/auth';
import mongoose from 'mongoose';

export const GET = withAuth(async (request, authUser) => {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        // Build date filter
        let startDate = searchParams.get('startDate');
        let endDate = searchParams.get('endDate');

        if (!startDate || !endDate) {
            // Default: current month
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            startDate = `${year}-${month}-01`;
            const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
            endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
        }

        const filter = { date: { $gte: startDate, $lte: endDate } };

        // Employees can only see their own stats
        const targetUserId = authUser.role === 'employee'
            ? authUser.userId
            : searchParams.get('userId') || null;

        if (targetUserId) {
            filter.userId = new mongoose.Types.ObjectId(targetUserId);
        }

        const records = await Attendance.find(filter).lean();

        const totalDays = records.length;
        const present = records.filter((r) => r.status === 'present').length;
        const absent = records.filter((r) => r.status === 'absent').length;
        const halfDay = records.filter((r) => r.status === 'half-day').length;
        const onLeave = records.filter((r) => r.status === 'leave').length;

        const totalHours = records.reduce((sum, r) => sum + (r.duration || 0), 0);
        const avgHours = totalDays > 0 ? totalHours / totalDays : 0;
        const attendanceRate = totalDays > 0
            ? (((present + halfDay * 0.5 + onLeave) / totalDays) * 100)
            : 0;

        // Trend for last 7 days
        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayRecords = records.filter((r) => r.date === dateStr);
            trend.push({
                date: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
                dateStr,
                present: dayRecords.filter((r) => r.status === 'present').length,
                absent: dayRecords.filter((r) => r.status === 'absent').length,
                halfDay: dayRecords.filter((r) => r.status === 'half-day').length,
                leave: dayRecords.filter((r) => r.status === 'leave').length,
            });
        }

        return Response.json({
            success: true,
            period: { startDate, endDate },
            stats: {
                totalDays,
                present,
                absent,
                halfDay,
                onLeave,
                totalHours: Math.round(totalHours * 100) / 100,
                avgHours: Math.round(avgHours * 100) / 100,
                attendanceRate: Math.round(attendanceRate * 100) / 100,
            },
            trend,
        });
    } catch (error) {
        console.error('[GET /api/attendance/stats]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
});
