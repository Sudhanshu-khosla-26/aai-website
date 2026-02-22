/**
 * Location Model - MongoDB Atlas via Mongoose
 * Supports point-based geofence + optional admin assignment per location
 */

import mongoose from 'mongoose';

const coordinateSchema = new mongoose.Schema(
    {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    { _id: false }
);

const locationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Location name is required'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Airport/location code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        latitude: {
            type: Number,
            required: [true, 'Latitude is required'],
            min: -90,
            max: 90,
        },
        longitude: {
            type: Number,
            required: [true, 'Longitude is required'],
            min: -180,
            max: 180,
        },
        radius: {
            type: Number,
            required: [true, 'Geofence radius (meters) is required'],
            min: 10,
            default: 200,
        },
        address: { type: String, trim: true },

        // Optional polygon override (if set, polygon takes precedence over radius)
        polygon: { type: [coordinateSchema], default: null },

        isActive: { type: Boolean, default: true },

        allowedDepartments: {
            type: [String],
            default: [],
        },

        airportCode: { type: String, uppercase: true, trim: true },

        // Admin assigned to manage this specific location
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        // Display timezone for this location, e.g. 'Asia/Kolkata'
        timezone: {
            type: String,
            default: 'Asia/Kolkata',
        },
    },
    {
        timestamps: true,
    }
);

locationSchema.index({ code: 1 });
locationSchema.index({ isActive: 1 });
locationSchema.index({ adminId: 1 });

const Location =
    mongoose.models.Location || mongoose.model('Location', locationSchema);

export default Location;
