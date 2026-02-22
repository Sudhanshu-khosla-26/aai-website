/**
 * POST /api/auth/verify-otp
 * Verify OTP for password reset flow
 */

import { connectDB } from '../../../../lib/db';
import User from '../../../../models/User';

export async function POST(request) {
    try {
        await connectDB();

        const { email, otp } = await request.json();

        if (!email || !otp) {
            return Response.json({ success: false, message: 'Email and OTP are required' }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
            '+resetOtp +resetOtpExpiry +resetOtpAttempts'
        );

        if (!user || !user.resetOtp) {
            return Response.json({ success: false, message: 'OTP expired or not found. Please request a new one.' }, { status: 400 });
        }

        if (new Date() > user.resetOtpExpiry) {
            user.resetOtp = undefined;
            user.resetOtpExpiry = undefined;
            await user.save({ validateBeforeSave: false });
            return Response.json({ success: false, message: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }

        if (user.resetOtpAttempts >= 3) {
            user.resetOtp = undefined;
            user.resetOtpExpiry = undefined;
            await user.save({ validateBeforeSave: false });
            return Response.json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' }, { status: 429 });
        }

        if (user.resetOtp !== otp.toString()) {
            user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
            await user.save({ validateBeforeSave: false });
            return Response.json({ success: false, message: 'Invalid OTP. Please try again.' }, { status: 400 });
        }

        // OTP verified — keep it briefly so reset-password can validate
        return Response.json({ success: true, message: 'OTP verified successfully.' });
    } catch (error) {
        console.error('[POST /api/auth/verify-otp]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
