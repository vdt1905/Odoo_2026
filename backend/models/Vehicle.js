import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    licensePlate: {
        type: String,
        required: true,
        unique: true,
    },
    maxLoadCapacity: {
        type: Number,
        required: true,
    },
    odometer: {
        type: Number,
        required: true,
        default: 0,
    },
    vehicleType: {
        type: String,
        required: true,
        enum: ['Truck', 'Van', 'Bike'],
    },
    status: {
        type: String,
        required: true,
        enum: ['Available', 'On Trip', 'In Shop', 'Out of Service'],
        default: 'Available',
    },
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
