/**
 * Leave Balance Model - MongoDB Atlas via Mongoose
 * Tracks how many days of each leave type an employee has
 */

import mongoose from 'mongoose';

const leaveTypeBalanceSchema = new mongoose.Schema(
    {
        total: { type: Number, required: true, default: 0 },
        used: { type: Number, default: 0 },
        remaining: { type: Number, default: 0 },
    },
    { _id: false }
);

const leaveBalanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        year: {
            type: Number,
            required: true,
            default: () => new Date().getFullYear(),
        },
        CL: {
            type: leaveTypeBalanceSchema,
            default: () => ({ total: 15, used: 0, remaining: 15 }),
        },
        SL: {
            type: leaveTypeBalanceSchema,
            default: () => ({ total: 12, used: 0, remaining: 12 }),
        },
        EL: {
            type: leaveTypeBalanceSchema,
            default: () => ({ total: 15, used: 0, remaining: 15 }),
        },
    },
    {
        timestamps: true,
    }
);

leaveBalanceSchema.index({ userId: 1, year: 1 }, { unique: true });

const LeaveBalance =
    mongoose.models.LeaveBalance || mongoose.model('LeaveBalance', leaveBalanceSchema);

export default LeaveBalance;
