/**
 * GET /api/attendance  - List attendance records (with filters)
 * POST /api/attendance - Create a manual attendance record (admin)
 */

import { connectDB } from '../../../lib/db';
import Attendance from '../../../models/Attendance';
import User from '../../../models/User';
import { withAuth } from '../../../lib/auth';
import mongoose from 'mongoose';

// GET /api/attendance
export const GET = withAuth(async (request, authUser) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    // Employees can only see their own records
    if (authUser.role === 'employee') {
      filter.userId = new mongoose.Types.ObjectId(authUser.userId);
    } else {
      const userId = searchParams.get('userId');
      if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
    }

    const date = searchParams.get('date');
    if (date) filter.date = date;

    const status = searchParams.get('status');
    if (status) filter.status = status;

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.date = { $gte: startDate };
    } else if (endDate) {
      filter.date = { $lte: endDate };
    }

    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName employeeId department email photoUrl')
        .lean(),
      Attendance.countDocuments(filter),
    ]);

    return Response.json({
      success: true,
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[GET /api/attendance]', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});

// POST /api/attendance - Admin creates a manual record
export const POST = withAuth(
  async (request, authUser) => {
    try {
      await connectDB();

      const body = await request.json();
      const { userId, date, status, checkIn, checkOut, duration, remarks } = body;

      if (!userId || !date || !status) {
        return Response.json(
          { success: false, message: 'userId, date, and status are required' },
          { status: 400 }
        );
      }

      const record = await Attendance.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId), date },
        { userId, date, status, checkIn, checkOut, duration, remarks },
        { upsert: true, new: true, runValidators: true }
      );

      return Response.json({ success: true, record }, { status: 201 });
    } catch (error) {
      console.error('[POST /api/attendance]', error);
      if (error.code === 11000) {
        return Response.json(
          { success: false, message: 'Attendance record already exists for this user and date.' },
          { status: 409 }
        );
      }
      return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
  },
  ['admin', 'super_admin']
);
