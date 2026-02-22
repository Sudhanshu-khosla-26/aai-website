/**
 * GET  /api/leaves  - List leave applications
 * POST /api/leaves  - Apply for leave
 */

import { connectDB } from '../../../lib/db';
import Leave from '../../../models/Leave';
import LeaveBalance from '../../../models/LeaveBalance';
import { withAuth } from '../../../lib/auth';
import { LEAVE_TYPES } from '../../../lib/constants';
import mongoose from 'mongoose';

// GET /api/leaves
export const GET = withAuth(async (request, authUser) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100);
    const skip = (page - 1) * limit;

    const filter = {};

    if (authUser.role === 'employee') {
      filter.userId = new mongoose.Types.ObjectId(authUser.userId);
    } else {
      const userId = searchParams.get('userId');
      if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
    }

    const status = searchParams.get('status');
    if (status) filter.status = status;

    const leaveType = searchParams.get('leaveType');
    if (leaveType) filter.leaveType = leaveType;

    const [applications, total] = await Promise.all([
      Leave.find(filter)
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName employeeId department')
        .populate('approvedBy', 'fullName employeeId')
        .lean(),
      Leave.countDocuments(filter),
    ]);

    // Enrich leave type info
    const enriched = applications.map((app) => {
      const leaveType = LEAVE_TYPES.find((t) => t.id === app.leaveType);
      return {
        ...app,
        leaveTypeName: leaveType?.name || app.leaveType,
        leaveTypeColor: leaveType?.color || '#6B7280',
      };
    });

    return Response.json({
      success: true,
      applications: enriched,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[GET /api/leaves]', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});

// POST /api/leaves - Apply for leave
export const POST = withAuth(async (request, authUser) => {
  try {
    await connectDB();

    const body = await request.json();
    const { leaveType, startDate, endDate, reason } = body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return Response.json(
        { success: false, message: 'leaveType, startDate, endDate, and reason are required' },
        { status: 400 }
      );
    }

    if (!['CL', 'SL', 'EL'].includes(leaveType)) {
      return Response.json({ success: false, message: 'Invalid leave type' }, { status: 400 });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return Response.json(
        { success: false, message: 'End date must be on or after start date.' },
        { status: 400 }
      );
    }

    // Calculate working days (Mon-Fri)
    let days = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) days++;
    }

    if (days === 0) {
      return Response.json({ success: false, message: 'Selected dates fall on weekends only.' }, { status: 400 });
    }

    // Check leave balance
    const balance = await LeaveBalance.findOne({ userId: authUser.userId });
    if (!balance || !balance[leaveType] || balance[leaveType].remaining < days) {
      const remaining = balance?.[leaveType]?.remaining || 0;
      return Response.json(
        {
          success: false,
          message: `Insufficient ${leaveType} balance. You have ${remaining} day(s) remaining.`,
        },
        { status: 400 }
      );
    }

    // Check for overlapping approved/pending leaves
    const overlap = await Leave.findOne({
      userId: authUser.userId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });

    if (overlap) {
      return Response.json(
        { success: false, message: 'You already have a leave application overlapping these dates.' },
        { status: 409 }
      );
    }

    const application = await Leave.create({
      userId: authUser.userId,
      leaveType,
      startDate,
      endDate,
      numberOfDays: days,
      reason: reason.trim(),
      status: 'pending',
    });

    return Response.json(
      {
        success: true,
        message: 'Leave application submitted successfully.',
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/leaves]', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return Response.json({ success: false, message: messages.join(', ') }, { status: 400 });
    }
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});
