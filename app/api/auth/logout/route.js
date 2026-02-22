/**
 * POST /api/auth/logout
 * Stateless logout (client should discard the token)
 * Optionally could invalidate a refresh token in DB
 */

export async function POST() {
    return Response.json({ success: true, message: 'Logged out successfully.' });
}
