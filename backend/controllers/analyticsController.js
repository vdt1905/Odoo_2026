import Expense from '../models/Expense.js';
import Trip from '../models/Trip.js';
import Driver from '../models/Driver.js';

// @desc    Get aggregated fleet analytics
// @route   GET /api/analytics
// @access  Private (Manager, FinancialAnalyst)
export const getFleetAnalytics = async (req, res) => {
    try {
        // 1. Expense Breakdown
        const expenses = await Expense.find({});

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        const expenseBreakdown = {
            Fuel: 0,
            Maintenance: 0,
            Tolls: 0,
            Insurance: 0,
            Other: 0
        };

        expenses.forEach(exp => {
            if (expenseBreakdown[exp.expenseType] !== undefined) {
                expenseBreakdown[exp.expenseType] += exp.amount;
            } else {
                expenseBreakdown['Other'] += exp.amount;
            }
        });

        // 2. Trip Activity
        const trips = await Trip.find({});
        const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
        const completedTrips = trips.filter(t => t.status === 'Completed').length;

        // 3. Driver Safety
        const drivers = await Driver.find({});
        const averageSafetyScore = drivers.length > 0
            ? Math.round(drivers.reduce((sum, d) => sum + d.safetyScore, 0) / drivers.length)
            : 0;

        res.status(200).json({
            financials: {
                totalExpenses,
                breakdown: expenseBreakdown
            },
            operations: {
                totalTripsLogged: trips.length,
                activeTrips,
                completedTrips
            },
            safety: {
                averageSafetyScore,
                totalDrivers: drivers.length
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to aggregate analytics', error: error.message });
    }
};
