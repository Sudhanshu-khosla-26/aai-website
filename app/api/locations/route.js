/**
 * GET /api/locations
 * Get workplace locations
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const airportCode = searchParams.get('airportCode');
    
    return Response.json({
      success: true,
      message: 'Get locations endpoint',
      data: [],
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/locations
 * Create a new location
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    return Response.json({
      success: true,
      message: 'Create location endpoint',
      data: { id: 'new_location_id', ...body },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
