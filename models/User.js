/**
 * User Model - MongoDB Atlas via Mongoose
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: [true, 'Employee ID is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default
        },
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
        },
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        phone: {
            type: String,
            trim: true,
            match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number'],
        },
        department: {
            type: String,
            enum: ['ATC', 'ENG', 'OPS', 'SEC', 'ADM', 'FIN', 'HR', 'IT'],
            required: [true, 'Department is required'],
        },
        designation: {
            type: String,
            enum: ['EXEC', 'MANAGER', 'DGM', 'GM', 'ED', 'CHAIRMAN'],
            required: [true, 'Designation is required'],
        },
        locationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
        },
        role: {
            type: String,
            enum: ['admin', 'employee', 'super_admin'],
            default: 'employee',
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'pending'],
            default: 'pending',
        },
        isEmailVerified: { type: Boolean, default: false },
        isPhotoVerified: { type: Boolean, default: false },
        photoUrl: { type: String, default: null },
        lastLoginAt: { type: Date, default: null },

        // OTP for password reset (temporary, expires)
        resetOtp: { type: String, select: false },
        resetOtpExpiry: { type: Date, select: false },
        resetOtpAttempts: { type: Number, default: 0, select: false },
    },
    {
        timestamps: true,
    }
);

// Combine name + password hashing in one pre-save hook (avoids double-next issue)
userSchema.pre('save', async function () {
    // Derive firstName/lastName from fullName if not provided
    if (this.fullName && (!this.firstName || !this.lastName)) {
        const parts = this.fullName.trim().split(/\s+/);
        this.firstName = parts.shift() || '';
        this.lastName = parts.join(' ');
    }
    if (!this.fullName && (this.firstName || this.lastName)) {
        this.fullName = [this.firstName, this.lastName].filter(Boolean).join(' ').trim();
    }

    // Hash password only when modified
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Return safe user object (no password)
userSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.resetOtp;
    delete obj.resetOtpExpiry;
    delete obj.resetOtpAttempts;
    return obj;
};

// Handle model caching in Next.js HMR
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
