/**
 * PATCH /api/leaves/[id]/reject
 * Reject a leave application (admin only)
 */

import { connectDB } from '../../../../../lib/db';
import Leave from '../../../../../models/Leave';
import { withAuth } from '../../../../../lib/auth';

export const PATCH = withAuth(
    async (request, authUser, { params }) => {
        try {
            await connectDB();
            const { id } = params;
            const body = await request.json().catch(() => ({}));
            const { reason } = body;

            const application = await Leave.findById(id);
            if (!application) {
                return Response.json({ success: false, message: 'Leave application not found' }, { status: 404 });
            }

            if (application.status !== 'pending') {
                return Response.json(
                    { success: false, message: `Leave is already ${application.status}. Only pending leaves can be rejected.` },
                    { status: 400 }
                );
            }

            application.status = 'rejected';
            application.approvedAt = new Date();
            application.approvedBy = authUser.userId;
            application.comments = reason || null;
            await application.save();

            const populated = await application.populate([
                { path: 'userId', select: 'fullName employeeId department' },
                { path: 'approvedBy', select: 'fullName employeeId' },
            ]);

            return Response.json({ success: true, message: 'Leave application rejected.', application: populated });
        } catch (error) {
            console.error('[PATCH /api/leaves/[id]/reject]', error);
            return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
        }
    },
    ['admin', 'super_admin']
);
