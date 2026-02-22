/**
 * JWT Authentication Middleware Helpers
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
    throw new Error('Please define JWT_SECRET in .env.local');
}

/**
 * Sign a JWT token
 */
export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token
 * @returns {Object} decoded payload
 * @throws {Error} if token is invalid or expired
 */
export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

/**
 * Extract and verify the Bearer token from a Next.js Request
 * Returns { userId, role, employeeId } or throws
 */
export function getAuthUser(request) {
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
        throw new Error('No token provided');
    }
    const token = authHeader.replace('Bearer ', '').trim();
    return verifyToken(token);
}

/**
 * Higher-order helper: wraps a route handler with auth check.
 * Returns 401 JSON if not authenticated.
 * Usage: export const GET = withAuth(async (req, authUser) => { ... })
 */
export function withAuth(handler, allowedRoles = null) {
    return async function (request, context) {
        try {
            const authUser = getAuthUser(request);
            if (allowedRoles && !allowedRoles.includes(authUser.role)) {
                return Response.json(
                    { success: false, message: 'Forbidden: insufficient permissions' },
                    { status: 403 }
                );
            }
            return handler(request, authUser, context);
        } catch (error) {
            return Response.json(
                { success: false, message: 'Unauthorized: ' + error.message },
                { status: 401 }
            );
        }
    };
}
