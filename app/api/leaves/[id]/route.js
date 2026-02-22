/**
 * GET    /api/leaves/[id]    - Get a single leave application
 * DELETE /api/leaves/[id]    - Cancel own leave (employee)
 */

import { connectDB } from '../../../../lib/db';
import Leave from '../../../../models/Leave';
import { withAuth } from '../../../../lib/auth';
import { LEAVE_TYPES } from '../../../../lib/constants';

export const GET = withAuth(async (request, authUser, { params }) => {
    try {
        await connectDB();
        const { id } = params;

        const application = await Leave.findById(id)
            .populate('userId', 'fullName employeeId department')
            .populate('approvedBy', 'fullName employeeId')
            .lean();

        if (!application) {
            return Response.json({ success: false, message: 'Leave application not found' }, { status: 404 });
        }

        // Employees can only see their own
        if (
            authUser.role === 'employee' &&
            application.userId._id.toString() !== authUser.userId
        ) {
            return Response.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const leaveType = LEAVE_TYPES.find((t) => t.id === application.leaveType);
        return Response.json({
            success: true,
            application: {
                ...application,
                leaveTypeName: leaveType?.name || application.leaveType,
                leaveTypeColor: leaveType?.color || '#6B7280',
            },
        });
    } catch (error) {
        console.error('[GET /api/leaves/[id]]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
});
