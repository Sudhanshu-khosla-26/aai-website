/**
 * GET /api/users/stats
 * User/employee statistics (admin only)
 */

import { connectDB } from '../../../../lib/db';
import User from '../../../../models/User';
import { withAuth } from '../../../../lib/auth';

export const GET = withAuth(
    async (request, authUser) => {
        try {
            await connectDB();

            const [total, active, inactive, pending, byDept, byDesig] = await Promise.all([
                User.countDocuments({ role: { $ne: 'super_admin' } }),
                User.countDocuments({ status: 'active', role: { $ne: 'super_admin' } }),
                User.countDocuments({ status: 'inactive' }),
                User.countDocuments({ status: 'pending' }),
                User.aggregate([
                    { $match: { role: { $ne: 'super_admin' } } },
                    { $group: { _id: '$department', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                ]),
                User.aggregate([
                    { $match: { role: { $ne: 'super_admin' } } },
                    { $group: { _id: '$designation', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                ]),
            ]);

            const byDepartment = {};
            byDept.forEach(({ _id, count }) => {
                if (_id) byDepartment[_id] = count;
            });

            const byDesignation = {};
            byDesig.forEach(({ _id, count }) => {
                if (_id) byDesignation[_id] = count;
            });

            return Response.json({
                success: true,
                stats: { total, active, inactive, pending, byDepartment, byDesignation },
            });
        } catch (error) {
            console.error('[GET /api/users/stats]', error);
            return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
        }
    },
    ['admin', 'super_admin']
);
