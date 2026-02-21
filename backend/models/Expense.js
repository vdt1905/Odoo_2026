import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Trip',
    },
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
    distance: {
        type: Number,
        required: true,
    },
    fuelCost: {
        type: Number,
        required: true,
    },
    miscCost: {
        type: Number,
        required: true,
    },
    totalCost: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Approved', 'Done'],
        default: 'Pending',
    }
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
