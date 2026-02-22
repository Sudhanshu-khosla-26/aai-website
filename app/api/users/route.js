/**
 * GET  /api/users  - List users (admin only)
 * POST /api/users  - Create user (admin only)
 */

import { connectDB } from '../../../lib/db';
import User from '../../../models/User';
import LeaveBalance from '../../../models/LeaveBalance';
import { withAuth } from '../../../lib/auth';

// GET /api/users
export const GET = withAuth(
  async (request, authUser) => {
    try {
      await connectDB();

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100);
      const skip = (page - 1) * limit;

      const filter = {};

      const role = searchParams.get('role');
      if (role) filter.role = role;

      const department = searchParams.get('department');
      if (department) filter.department = department;

      const status = searchParams.get('status');
      if (status) filter.status = status;

      const search = searchParams.get('search');
      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } },
        ];
      }

      const [users, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        User.countDocuments(filter),
      ]);

      return Response.json({
        success: true,
        users,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      console.error('[GET /api/users]', error);
      return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
  },
  ['admin', 'super_admin']
);

// POST /api/users - Admin creates user directly (status: active)
export const POST = withAuth(
  async (request, authUser) => {
    try {
      await connectDB();

      const body = await request.json();
      const { employeeId, email, password, fullName, firstName, lastName, phone, department, designation, role, status } = body;

      if (!employeeId || !email || !password || (!fullName && !firstName)) {
        return Response.json(
          { success: false, message: 'employeeId, email, password and name are required' },
          { status: 400 }
        );
      }

      const existing = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { employeeId: employeeId.toUpperCase() }],
      });

      if (existing) {
        const field = existing.email === email.toLowerCase() ? 'Email' : 'Employee ID';
        return Response.json({ success: false, message: `${field} already exists.` }, { status: 409 });
      }

      // Only super_admin can create admins
      const assignedRole = role && role !== 'employee'
        ? (authUser.role === 'super_admin' ? role : 'employee')
        : 'employee';

      const resolvedFullName =
        fullName?.trim() || [firstName, lastName].filter(Boolean).join(' ').trim();

      const newUser = new User({
        employeeId: employeeId.toUpperCase().trim(),
        email: email.toLowerCase().trim(),
        password,
        fullName: resolvedFullName,
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        phone: phone?.trim(),
        department,
        designation,
        role: assignedRole,
        status: status || 'active',
      });

      await newUser.save();
      await LeaveBalance.create({ userId: newUser._id });

      return Response.json(
        { success: true, user: newUser.toSafeObject() },
        { status: 201 }
      );
    } catch (error) {
      console.error('[POST /api/users]', error);
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return Response.json({ success: false, message: `${field} already exists.` }, { status: 409 });
      }
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return Response.json({ success: false, message: messages.join(', ') }, { status: 400 });
      }
      return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
  },
  ['admin', 'super_admin']
);
