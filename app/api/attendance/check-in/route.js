/**
 * POST /api/attendance/check-in
 * Employee checks in for the day
 */

import { connectDB } from '../../../../lib/db';
import Attendance from '../../../../models/Attendance';
import { withAuth } from '../../../../lib/auth';

export const POST = withAuth(async (request, authUser) => {
    try {
        await connectDB();

        const body = await request.json();
        const { location, photoUrl, localPhotoUri, locationId } = body;

        const today = new Date().toISOString().split('T')[0];

        // Check for existing record today
        const existing = await Attendance.findOne({
            userId: authUser.userId,
            date: today,
        });

        if (existing?.checkIn) {
            return Response.json(
                {
                    success: false,
                    message: 'Already checked in today.',
                    record: existing,
                },
                { status: 409 }
            );
        }

        const checkInTime = new Date();

        let record;
        if (existing) {
            // Update existing draft record
            existing.checkIn = {
                time: checkInTime,
                location: location || null,
                photoUrl: photoUrl || localPhotoUri || null,
                locationId: locationId || null,
            };
            existing.status = 'present';
            record = await existing.save();
        } else {
            // Create new record
            record = await Attendance.create({
                userId: authUser.userId,
                date: today,
                checkIn: {
                    time: checkInTime,
                    location: location || null,
                    photoUrl: photoUrl || localPhotoUri || null,
                    locationId: locationId || null,
                },
                status: 'present',
            });
        }

        return Response.json({
            success: true,
            message: 'Check-in successful.',
            record,
            checkInTime: checkInTime.toISOString(),
        });
    } catch (error) {
        console.error('[POST /api/attendance/check-in]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
});
