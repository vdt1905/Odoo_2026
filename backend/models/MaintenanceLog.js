import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Vehicle',
    },
    serviceType: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    cost: {
        type: Number,
        required: true,
    },
    serviceDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Scheduled', 'In Progress', 'Completed'],
        default: 'Scheduled',
    },
}, { timestamps: true });

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceSchema);

export default MaintenanceLog;
