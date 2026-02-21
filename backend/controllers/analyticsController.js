import Expense from '../models/Expense.js';
import Trip from '../models/Trip.js';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import MaintenanceLog from '../models/MaintenanceLog.js';

// @desc    Get aggregated fleet analytics
// @route   GET /api/analytics
// @access  Private (FinancialAnalyst)
export const getFleetAnalytics = async (req, res) => {
    try {
        const expenses = await Expense.find({}).populate('vehicle');
        const trips = await Trip.find({});
        const maintenanceLogs = await MaintenanceLog.find({}).populate('vehicle');
        const vehicles = await Vehicle.find({});

        // 1. KPI Calculation
        const totalFuelCost = expenses.reduce((sum, exp) => sum + (exp.fuelCost || 0), 0);
        const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
        const totalOtherExpenses = expenses.reduce((sum, exp) => sum + (exp.miscCost || 0), 0);
        const totalCosts = totalFuelCost + totalMaintenanceCost + totalOtherExpenses;

        const completedTrips = trips.filter(t => t.status === 'Completed');
        const totalRevenue = completedTrips.reduce((sum, trip) => sum + ((trip.cargoWeight || 0) * 50), 0); // Mock revenue: 50 Rs per kg

        const netProfit = totalRevenue - totalCosts;
        const fleetROI = totalCosts > 0 ? ((netProfit / totalCosts) * 100).toFixed(1) : 0;

        const vehiclesOnTrip = vehicles.filter(v => v.status === 'On Trip').length;
        const utilizationRate = vehicles.length > 0 ? Math.round((vehiclesOnTrip / vehicles.length) * 100) : 0;

        // 2. Monthly Summary Table & Fuel Efficiency Trend
        const monthlyData = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        monthNames.forEach(month => {
            monthlyData[month] = {
                month: month,
                revenue: 0,
                fuelCost: 0,
                maintenance: 0,
                netProfit: 0,
                totalDistance: 0
            };
        });

        // Add Revenue from Trips
        completedTrips.forEach(trip => {
            const date = new Date(trip.updatedAt);
            const month = monthNames[date.getMonth()];
            monthlyData[month].revenue += ((trip.cargoWeight || 0) * 50);
        });

        // Add Fuel Cost and Distance from Expenses
        expenses.forEach(exp => {
            const date = new Date(exp.createdAt);
            const month = monthNames[date.getMonth()];
            monthlyData[month].fuelCost += (exp.fuelCost || 0);
            monthlyData[month].totalDistance += (exp.distance || 0);
        });

        // Add Maintenance Cost
        maintenanceLogs.forEach(log => {
            const date = new Date(log.serviceDate || log.createdAt);
            const month = monthNames[date.getMonth()];
            monthlyData[month].maintenance += (log.cost || 0);
        });

        // Calculate Net Profit and Fuel Efficiency per month
        const financialSummary = monthNames.map(month => {
            const data = monthlyData[month];
            data.netProfit = data.revenue - data.fuelCost - data.maintenance;

            // Fuel efficiency = distance / liters (assuming 100 Rs/L)
            const litersUsed = data.fuelCost > 0 ? (data.fuelCost / 100) : 0;
            const fuelEfficiency = litersUsed > 0 ? (data.totalDistance / litersUsed).toFixed(1) : 0;

            return {
                month: data.month,
                revenue: data.revenue,
                fuelCost: data.fuelCost,
                maintenance: data.maintenance,
                netProfit: data.netProfit,
                efficiency: Number(fuelEfficiency)
            };
        });

        // fuelEfficiencyTrend points
        const fuelEfficiencyTrend = financialSummary.map(m => ({
            month: m.month,
            efficiency: m.efficiency
        }));

        // 3. Top 5 Costliest Vehicles
        const vehicleCosts = {};
        expenses.forEach(exp => {
            if (exp.vehicle) {
                const vId = exp.vehicle._id.toString();
                if (!vehicleCosts[vId]) {
                    vehicleCosts[vId] = { name: exp.vehicle.name || exp.vehicle.licensePlate, cost: 0 };
                }
                vehicleCosts[vId].cost += (exp.fuelCost || 0) + (exp.miscCost || 0);
            }
        });
        maintenanceLogs.forEach(log => {
            if (log.vehicle) {
                const vId = log.vehicle._id.toString();
                if (!vehicleCosts[vId]) {
                    vehicleCosts[vId] = { name: log.vehicle.name || log.vehicle.licensePlate, cost: 0 };
                }
                vehicleCosts[vId].cost += (log.cost || 0);
            }
        });

        const topCostliestVehicles = Object.values(vehicleCosts)
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 5);

        // Calculate Vehicle ROI (Total Cost vs Revenue)
        const vehicleStats = {};
        vehicles.forEach(v => {
            vehicleStats[v._id.toString()] = {
                name: v.name || v.licensePlate,
                totalCost: 0,
                revenue: 0
            };
        });

        expenses.forEach(exp => {
            if (exp.vehicle && vehicleStats[exp.vehicle._id.toString()]) {
                vehicleStats[exp.vehicle._id.toString()].totalCost += (exp.fuelCost || 0) + (exp.miscCost || 0);
            }
        });

        maintenanceLogs.forEach(log => {
            if (log.vehicle && vehicleStats[log.vehicle._id.toString()]) {
                vehicleStats[log.vehicle._id.toString()].totalCost += (log.cost || 0);
            }
        });

        completedTrips.forEach(trip => {
            if (trip.vehicle && vehicleStats[trip.vehicle.toString()]) {
                vehicleStats[trip.vehicle.toString()].revenue += ((trip.cargoWeight || 0) * 50); // Same mock revenue logic
            }
        });

        const vehicleROI = Object.values(vehicleStats)
            .filter(v => v.totalCost > 0 || v.revenue > 0) // Only show vehicles with activity
            .map(v => ({
                name: v.name,
                totalCost: v.totalCost,
                revenue: v.revenue,
                netProfit: v.revenue - v.totalCost
            }))
            .sort((a, b) => b.netProfit - a.netProfit); // Sort by profitability

        const expenseBreakdown = {
            'Fuel': totalFuelCost,
            'Maintenance': totalMaintenanceCost,
            'Misc': totalOtherExpenses,
            'Driver Payments': expenses.reduce((sum, exp) => sum + ((exp.distance || 0) * 5), 0) // $5 per km
        };

        // 4. Trip Completion Funnel
        const tripFunnel = [
            { name: 'Planned', count: trips.filter(t => t.status === 'Draft').length, fill: '#8884d8' },
            { name: 'Running', count: trips.filter(t => t.status === 'Dispatched').length, fill: '#83a6ed' },
            { name: 'Completed', count: completedTrips.length, fill: '#8dd1e1' },
            { name: 'Cancelled', count: trips.filter(t => t.status === 'Cancelled').length, fill: '#ffc658' }
        ];

        // 5. Downtime Chart (Days lost per vehicle)
        const downtimeData = {};
        maintenanceLogs.forEach(log => {
            if (log.vehicle) {
                const vName = log.vehicle.name || log.vehicle.licensePlate;
                if (!downtimeData[vName]) downtimeData[vName] = { name: vName, daysLost: 0 };
                downtimeData[vName].daysLost += 3; // Assume 3 days downtime per maintenance log
            }
        });
        const downtimeChart = Object.values(downtimeData).sort((a, b) => b.daysLost - a.daysLost);

        // 6. Vehicle Utilization Heatmap (Last 30 Days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const recentTrips = trips.filter(t => new Date(t.createdAt) >= thirtyDaysAgo);
        const utilizationHeatmap = [];

        vehicles.forEach((vehicle, vIndex) => {
            const vName = vehicle.name || vehicle.licensePlate;
            for (let i = 0; i < 30; i++) {
                const stepDate = new Date(thirtyDaysAgo);
                stepDate.setDate(stepDate.getDate() + i);

                // Check if vehicle had a trip created on this date
                const hadTrip = recentTrips.some(t => {
                    const tDate = new Date(t.createdAt);
                    return t.vehicle.toString() === vehicle._id.toString() &&
                        tDate.getDate() === stepDate.getDate() &&
                        tDate.getMonth() === stepDate.getMonth();
                });

                utilizationHeatmap.push({
                    x: i,
                    y: vIndex,
                    date: stepDate.toISOString().split('T')[0],
                    vehicle: vName,
                    active: hadTrip ? 1 : 0
                });
            }
        });

        res.status(200).json({
            kpis: {
                totalFuelCost,
                fleetROI: Number(fleetROI),
                utilizationRate,
                totalRevenue,
                netProfit
            },
            monthlySummary: financialSummary,
            charts: {
                fuelEfficiencyTrend,
                costliestVehicles: topCostliestVehicles,
                expenseBreakdown,
                tripFunnel,
                downtimeChart,
                utilizationHeatmap,
                vehicleROI
            }
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Failed to aggregate analytics', error: error.message });
    }
};
