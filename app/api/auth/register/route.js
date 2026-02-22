/**
 * POST /api/auth/register
 * Register a new employee (status: pending — requires admin approval)
 */

import { connectDB } from '../../../../lib/db';
import User from '../../../../models/User';
import LeaveBalance from '../../../../models/LeaveBalance';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      employeeId,
      email,
      password,
      fullName,
      firstName,
      lastName,
      phone,
      department,
      designation,
      locationId, // assigned location
    } = body;

    // Basic validation
    if (!employeeId || !email || !password || (!fullName && !firstName)) {
      return Response.json(
        { success: false, message: 'Employee ID, email, password and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check for existing email/employeeId
    const existing = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { employeeId: employeeId.toUpperCase().trim() },
      ],
    });

    if (existing) {
      const field = existing.email === email.toLowerCase().trim() ? 'Email' : 'Employee ID';
      return Response.json(
        { success: false, message: `${field} is already registered.` },
        { status: 409 }
      );
    }

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
      locationId: locationId || null,
      role: 'employee',
      status: 'pending',
    });

    await newUser.save();

    // Initialize default leave balance
    await LeaveBalance.create({ userId: newUser._id });

    return Response.json(
      {
        success: true,
        message: 'Registration successful! Please wait for admin approval before logging in.',
        user: newUser.toSafeObject(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/auth/register]', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return Response.json(
        { success: false, message: `${field} already exists.` },
        { status: 409 }
      );
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return Response.json({ success: false, message: messages.join(', ') }, { status: 400 });
    }
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
