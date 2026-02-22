/**
 * POST /api/auth/reset-password
 * Reset password after OTP verification
 */

import { connectDB } from '../../../../lib/db';
import User from '../../../../models/User';

export async function POST(request) {
    try {
        await connectDB();

        const { email, otp, newPassword } = await request.json();

        if (!email || !otp || !newPassword) {
            return Response.json(
                { success: false, message: 'Email, OTP and new password are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return Response.json(
                { success: false, message: 'New password must be at least 6 characters' },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
            '+password +resetOtp +resetOtpExpiry'
        );

        if (!user || !user.resetOtp) {
            return Response.json(
                { success: false, message: 'Invalid or expired OTP. Please request a new one.' },
                { status: 400 }
            );
        }

        if (new Date() > user.resetOtpExpiry) {
            user.resetOtp = undefined;
            user.resetOtpExpiry = undefined;
            await user.save({ validateBeforeSave: false });
            return Response.json({ success: false, message: 'OTP has expired.' }, { status: 400 });
        }

        if (user.resetOtp !== otp.toString()) {
            return Response.json({ success: false, message: 'Invalid OTP.' }, { status: 400 });
        }

        // Set new password (pre-save hook will hash it)
        user.password = newPassword;
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
        user.resetOtpAttempts = 0;
        await user.save();

        return Response.json({
            success: true,
            message: 'Password reset successful. Please login with your new password.',
        });
    } catch (error) {
        console.error('[POST /api/auth/reset-password]', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
