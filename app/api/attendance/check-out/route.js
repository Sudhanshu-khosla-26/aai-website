/**
 * POST /api/attendance/check-out
 * Employee checks out for the day
 */

import { connectDB } from '../../../../lib/db';
import Attendance from '../../../../models/Attendance';
import { withAuth } from '../../../../lib/auth';

export const POST = withAuth(async (request, authUser) => {
    try {
        await connectDB();

        const body = await request.json();
        const { location, photoUrl, locationId } = body;

        const today = new Date().toISOString().split('T')[0];

        const record = await Attendance.findOne({
            userId: authUser.userId,
            date: today,
        });

        if (!record?.checkIn) {
            return Response.json(
                { success: false, message: 'You have not checked in today.' },
                { status: 400 }
            );
        }

        if (record.checkOut) {
            return Response.json(
                { success: false, message: 'Already checked out today.' },
                { status: 409 }
            );
        }

        const checkOutTime = new Date();
        record.checkOut = {
            time: checkOutTime,
            location: location || null,
            photoUrl: photoUrl || null,
            locationId: locationId || null,
        };

        // Calculate duration in hours
        const checkInTime = new Date(record.checkIn.time);
        const durationMs = checkOutTime - checkInTime;
        const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;
        record.duration = durationHours;

        // Update status based on hours worked
        if (durationHours < 4) {
            record.status = 'half-day';
        } else {
            record.status = 'present';
        }

        await record.save();

        return Response.json({
            success: true,
            message: 'Check-out successful.',
            record,
        });
    } catch (error) {
        console.error('[POST /api/attendance/check-out]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
});
