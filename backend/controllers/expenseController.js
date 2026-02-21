import Expense from '../models/Expense.js';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private (Manager, FinancialAnalyst)
export const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({})
            .populate('trip')
            .populate('vehicle')
            .populate('driver')
            .sort({ createdAt: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
    }
};

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private (Manager, FinancialAnalyst)
export const addExpense = async (req, res) => {
    const { trip, distance, fuelCost, miscCost, status } = req.body;

    try {
        const tripDoc = await Trip.findById(trip);

        if (!tripDoc) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const expStatus = status || 'Pending';
        const calcTotalCost = Number(fuelCost || 0) + Number(miscCost || 0);

        const expense = await Expense.create({
            trip: tripDoc._id,
            vehicle: tripDoc.vehicle,
            driver: tripDoc.driver,
            distance: Number(distance || 0),
            fuelCost: Number(fuelCost || 0),
            miscCost: Number(miscCost || 0),
            totalCost: calcTotalCost,
            status: expStatus,
        });

        const savedExpense = await Expense.findById(expense._id)
            .populate('trip')
            .populate('vehicle')
            .populate('driver');

        res.status(201).json(savedExpense);

    } catch (error) {
        res.status(500).json({ message: 'Failed to log expense', error: error.message });
    }
};
