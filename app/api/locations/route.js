/**
 * GET  /api/locations  - List all locations (with admin info)
 * POST /api/locations  - Create a new location (admin)
 */

import { connectDB } from '../../../lib/db';
import Location from '../../../models/Location';
import User from '../../../models/User';
import { withAuth } from '../../../lib/auth';

// GET /api/locations
export const GET = withAuth(async (request, authUser) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const filter = {};

    const search = searchParams.get('search');
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const isActive = searchParams.get('isActive');
    if (isActive !== null && isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    const airportCode = searchParams.get('airportCode');
    if (airportCode) filter.code = airportCode.toUpperCase();

    const locations = await Location.find(filter)
      .sort({ name: 1 })
      .populate('adminId', 'fullName employeeId email department')
      .lean();

    return Response.json({ success: true, locations });
  } catch (error) {
    console.error('[GET /api/locations]', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});

// POST /api/locations - Admin creates a new location
export const POST = withAuth(
  async (request, authUser) => {
    try {
      await connectDB();

      const body = await request.json();
      const { name, code, latitude, longitude, radius, address, isActive, allowedDepartments, airportCode, adminId, timezone } = body;

      if (!name || !code || latitude == null || longitude == null) {
        return Response.json(
          { success: false, message: 'name, code, latitude, and longitude are required' },
          { status: 400 }
        );
      }

      const existing = await Location.findOne({ code: code.toUpperCase() });
      if (existing) {
        return Response.json({ success: false, message: 'Location code already exists.' }, { status: 409 });
      }

      // Validate adminId if provided
      if (adminId) {
        const adminUser = await User.findById(adminId).lean();
        if (!adminUser) {
          return Response.json({ success: false, message: 'Admin user not found' }, { status: 404 });
        }
      }

      const location = await Location.create({
        name: name.trim(),
        code: code.toUpperCase().trim(),
        latitude,
        longitude,
        radius: radius || 200,
        address: address?.trim(),
        isActive: isActive !== undefined ? isActive : true,
        allowedDepartments: allowedDepartments || [],
        airportCode: airportCode?.toUpperCase() || code.toUpperCase(),
        adminId: adminId || null,
        timezone: timezone || 'Asia/Kolkata',
      });

      await location.populate('adminId', 'fullName employeeId email');

      return Response.json({ success: true, location, message: 'Location created successfully' }, { status: 201 });
    } catch (error) {
      console.error('[POST /api/locations]', error);
      if (error.name === 'ValidationError') {
        const msgs = Object.values(error.errors).map((e) => e.message);
        return Response.json({ success: false, message: msgs.join(', ') }, { status: 400 });
      }
      return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
  },
  ['admin', 'super_admin']
);
