import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Vehicle',
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Driver',
    },
    cargoWeight: {
        type: Number,
        required: true,
    },
    origin: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    estimatedFuelCost: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
        default: 'Draft',
    },
}, { timestamps: true });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
