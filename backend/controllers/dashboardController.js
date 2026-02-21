import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import MaintenanceLog from '../models/MaintenanceLog.js';

export const getDashboardStats = async (req, res) => {
    try {
        // Fetch raw metrics from existing tables
        const [vehicles, trips, maints] = await Promise.all([
            Vehicle.find({}),
            Trip.find({}).sort({ createdAt: -1 }).limit(10).populate('vehicle').populate('driver'),
            MaintenanceLog.find({ status: 'Scheduled' }).sort({ createdAt: -1 }).limit(5).populate('vehicle')
        ]);

        const activeFleet = vehicles.filter(v => v.status === 'On Trip').length;
        const totalFleet = vehicles.length;
        const maintenanceAlerts = maints.length;
        const utilizationRate = totalFleet > 0 ? Math.round((activeFleet / totalFleet) * 100) : 0;
        const pendingCargo = trips.filter(t => t.status === 'Draft').length;

        const stats = {
            activeFleet,
            maintenanceAlerts,
            utilizationRate,
            pendingCargo,
        };

        const recentTrips = trips.map(t => ({
            id: t._id.toString().substring(0, 8).toUpperCase(),
            vehicle: t.vehicle?.name || 'Unknown',
            driver: t.driver?.name || 'Unknown',
            driver: t.driver?.name || 'Unknown',
            status: t.status,
            origin: t.origin,
            destination: t.destination,
            cargoWeight: t.cargoWeight,
            estimatedFuelCost: t.estimatedFuelCost,
            createdAt: t.createdAt
        }));

        res.status(200).json({ stats, recentTrips });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
};
