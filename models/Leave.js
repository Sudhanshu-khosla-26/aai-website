/**
 * Leave Application Model - MongoDB Atlas via Mongoose
 */

import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        leaveType: {
            type: String,
            enum: ['CL', 'SL', 'EL'],
            required: [true, 'Leave type is required'],
        },
        startDate: {
            type: String,
            required: [true, 'Start date is required'],
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
        },
        endDate: {
            type: String,
            required: [true, 'End date is required'],
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
        },
        numberOfDays: {
            type: Number,
            required: true,
            min: [0.5, 'Minimum 0.5 days leave required'],
        },
        reason: {
            type: String,
            required: [true, 'Reason is required'],
            trim: true,
            maxlength: [500, 'Reason cannot exceed 500 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'cancelled'],
            default: 'pending',
        },
        appliedAt: { type: Date, default: Date.now },
        approvedAt: { type: Date, default: null },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        comments: { type: String, default: null, maxlength: 500 },
    },
    {
        timestamps: true,
    }
);

// Indexes
leaveSchema.index({ userId: 1, status: 1 });
leaveSchema.index({ userId: 1, startDate: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

const Leave = mongoose.models.Leave || mongoose.model('Leave', leaveSchema);

export default Leave;
