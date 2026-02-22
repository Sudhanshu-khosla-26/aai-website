/**
 * PATCH /api/leaves/[id]/approve
 * Approve a leave application (admin only)
 */

import { connectDB } from '../../../../../lib/db';
import Leave from '../../../../../models/Leave';
import LeaveBalance from '../../../../../models/LeaveBalance';
import { withAuth } from '../../../../../lib/auth';

export const PATCH = withAuth(
    async (request, authUser, { params }) => {
        try {
            await connectDB();
            const { id } = params;
            const body = await request.json().catch(() => ({}));
            const { comments } = body;

            const application = await Leave.findById(id);
            if (!application) {
                return Response.json({ success: false, message: 'Leave application not found' }, { status: 404 });
            }

            if (application.status !== 'pending') {
                return Response.json(
                    { success: false, message: `Leave is already ${application.status}. Only pending leaves can be approved.` },
                    { status: 400 }
                );
            }

            // Deduct from leave balance
            const balance = await LeaveBalance.findOne({ userId: application.userId });
            if (balance && balance[application.leaveType]) {
                balance[application.leaveType].used += application.numberOfDays;
                balance[application.leaveType].remaining -= application.numberOfDays;
                await balance.save();
            }

            application.status = 'approved';
            application.approvedAt = new Date();
            application.approvedBy = authUser.userId;
            if (comments) application.comments = comments;
            await application.save();

            const populated = await application.populate([
                { path: 'userId', select: 'fullName employeeId department' },
                { path: 'approvedBy', select: 'fullName employeeId' },
            ]);

            return Response.json({ success: true, message: 'Leave application approved.', application: populated });
        } catch (error) {
            console.error('[PATCH /api/leaves/[id]/approve]', error);
            return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
        }
    },
    ['admin', 'super_admin']
);
