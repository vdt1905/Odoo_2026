import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    licenseExpiry: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Off Duty', 'On Duty', 'Suspended'],
        default: 'Off Duty',
    },
    safetyScore: {
        type: Number,
        required: true,
        default: 100, // Starts at 100
    },
    tripsCompleted: {
        type: Number,
        default: 0
    },
    totalTripsAssigned: {
        type: Number,
        default: 0
    },
    isAvailableForDispatch: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;
