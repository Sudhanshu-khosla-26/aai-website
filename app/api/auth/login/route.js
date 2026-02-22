/**
 * POST /api/auth/login
 * Authenticate user and return JWT token + user profile with location
 */

import { connectDB } from '../../../../lib/db';
import User from '../../../../models/User';
import { signToken } from '../../../../lib/auth';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { identifier, email, employeeId, password } = body;

    const loginId = identifier || email || employeeId;

    if (!loginId || !password) {
      return Response.json(
        { success: false, message: 'Email/Employee ID and password are required' },
        { status: 400 }
      );
    }

    const isEmail = loginId.includes('@');
    const query = isEmail
      ? { email: loginId.toLowerCase().trim() }
      : { employeeId: loginId.toUpperCase().trim() };

    // Include password for comparison + populate location data
    const user = await User.findOne(query)
      .select('+password')
      .populate('locationId', 'name code latitude longitude radius address timezone');

    if (!user) {
      return Response.json(
        { success: false, message: 'Invalid credentials. Please check your Employee ID and password.' },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      const msg =
        user.status === 'pending'
          ? 'Your account is pending admin approval. Please contact your HR.'
          : 'Your account is inactive. Please contact your administrator.';
      return Response.json({ success: false, message: msg }, { status: 403 });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return Response.json(
        { success: false, message: 'Invalid credentials. Please check your Employee ID and password.' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate JWT
    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      employeeId: user.employeeId,
    });

    // Build safe user object including location
    const safeUser = user.toSafeObject();

    return Response.json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('[POST /api/auth/login]', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
