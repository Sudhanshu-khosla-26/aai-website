/**
 * POST /api/auth/forgot-password
 * Generate and store OTP for password reset
 */

import { connectDB } from '../../../../lib/db';
import User from '../../../../models/User';

export async function POST(request) {
    try {
        await connectDB();

        const { email } = await request.json();

        if (!email) {
            return Response.json({ success: false, message: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
            '+resetOtp +resetOtpExpiry +resetOtpAttempts'
        );

        // Always return success to prevent email enumeration
        if (!user) {
            return Response.json({
                success: true,
                message: 'If this email is registered, an OTP has been sent.',
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        user.resetOtpAttempts = 0;
        await user.save({ validateBeforeSave: false });

        // In production: send email here
        // await sendOtpEmail(user.email, otp);
        console.log(`[OTP] ${user.email}: ${otp}`);

        return Response.json({
            success: true,
            message: 'OTP sent to your email address. It expires in 15 minutes.',
            // Remove demoOtp in production
            demoOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
        });
    } catch (error) {
        console.error('[POST /api/auth/forgot-password]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
