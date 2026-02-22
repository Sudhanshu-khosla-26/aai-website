/**
 * Attendance Model - MongoDB Atlas via Mongoose
 */

import mongoose from 'mongoose';

const checkEventSchema = new mongoose.Schema(
    {
        time: { type: Date, required: true },
        location: {
            lat: { type: Number },
            lng: { type: Number },
        },
        photoUrl: { type: String, default: null },
        locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    },
    { _id: false }
);

const attendanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        // YYYY-MM-DD string for fast date-based queries
        date: {
            type: String,
            required: [true, 'Date is required'],
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'half-day', 'leave', 'pending'],
            default: 'pending',
        },
        checkIn: { type: checkEventSchema, default: null },
        checkOut: { type: checkEventSchema, default: null },
        duration: { type: Number, default: 0 }, // hours
        syncStatus: {
            type: String,
            enum: ['synced', 'pending', 'failed'],
            default: 'synced',
        },
        remarks: { type: String, default: null },
    },
    {
        timestamps: true,
    }
);

// Compound index: one record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
// Index for date-range queries
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ userId: 1, date: -1 });

const Attendance =
    mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

export default Attendance;
