/**
 * PATCH /api/leaves/[id]/cancel
 * Employee cancels their own pending leave
 */

import { connectDB } from '../../../../../lib/db';
import Leave from '../../../../../models/Leave';
import { withAuth } from '../../../../../lib/auth';

export const PATCH = withAuth(async (request, authUser, { params }) => {
    try {
        await connectDB();
        const { id } = params;

        const application = await Leave.findById(id);
        if (!application) {
            return Response.json({ success: false, message: 'Leave application not found' }, { status: 404 });
        }

        // Employees can only cancel their own leaves
        if (
            authUser.role === 'employee' &&
            application.userId.toString() !== authUser.userId
        ) {
            return Response.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        if (application.status !== 'pending') {
            return Response.json(
                { success: false, message: 'Only pending leave applications can be cancelled.' },
                { status: 400 }
            );
        }

        application.status = 'cancelled';
        await application.save();

        return Response.json({ success: true, message: 'Leave application cancelled.', application });
    } catch (error) {
        console.error('[PATCH /api/leaves/[id]/cancel]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
});
