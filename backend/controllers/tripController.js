import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private (Manager, Dispatcher)
export const getTrips = async (req, res) => {
    try {
        // Populate refs to get name and license info for frontend display
        const trips = await Trip.find({}).populate('vehicle').populate('driver').sort({ createdAt: -1 });
        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch trips', error: error.message });
    }
};

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private (Dispatcher, Manager)
export const createTrip = async (req, res) => {
    const { vehicle, driver, cargoWeight, origin, destination, estimatedFuelCost } = req.body;

    try {
        const vehicleDoc = await Vehicle.findById(vehicle);
        const driverDoc = await Driver.findById(driver);

        // 1. Validation Rule: Prevent trip creation if CargoWeight > MaxCapacity
        if (!vehicleDoc) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        if (!driverDoc) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        if (driverDoc.status === 'SUSPENDED' || driverDoc.status === 'LOCKED') {
            return res.status(400).json({ message: 'Driver is currently restricted (Suspended or Locked) and cannot be assigned.' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(driverDoc.licenseExpiry) < today) {
            return res.status(400).json({ message: 'Driver license has expired. Assignment blocked.' });
        }

        if (Number(cargoWeight) > vehicleDoc.maxLoadCapacity) {
            return res.status(400).json({ message: `Cargo weight (${cargoWeight}kg) exceeds vehicle max capacity (${vehicleDoc.maxLoadCapacity}kg)` });
        }

        const trip = await Trip.create({
            vehicle,
            driver,
            cargoWeight,
            origin,
            destination,
            estimatedFuelCost,
            status: 'Draft',
        });

        const savedTrip = await Trip.findById(trip._id).populate('vehicle').populate('driver');
        res.status(201).json(savedTrip);

    } catch (error) {
        res.status(500).json({ message: 'Failed to create trip', error: error.message });
    }
};

// @desc    Update a trip status (and associated vehicle/driver statuses)
// @route   PUT /api/trips/:id
// @access  Private (Dispatcher, Manager)
export const updateTripStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const oldStatus = trip.status;
        trip.status = status;
        const updatedTrip = await trip.save();

        // Auto-Logic updates for linked assets
        if (status === 'Dispatched' && oldStatus !== 'Dispatched') {
            await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'On Trip' });
            await Driver.findByIdAndUpdate(trip.driver, {
                status: 'ON_DUTY',
                isAvailableForDispatch: false,
                $inc: { totalTripsAssigned: 1 }
            });
        } else if (status === 'Completed' && oldStatus === 'Dispatched') {
            await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });

            // Re-check license on completion before making available again
            const driverData = await Driver.findById(trip.driver);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isExpired = new Date(driverData.licenseExpiry) < today;

            await Driver.findByIdAndUpdate(trip.driver, {
                status: 'ON_DUTY',
                isAvailableForDispatch: !isExpired && driverData.safetyScore >= 0,
                $inc: { tripsCompleted: 1 }
            });
        } else if (status === 'Cancelled' && oldStatus === 'Dispatched') {
            await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });

            const driverData = await Driver.findById(trip.driver);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isExpired = new Date(driverData.licenseExpiry) < today;

            await Driver.findByIdAndUpdate(trip.driver, {
                status: 'ON_DUTY',
                isAvailableForDispatch: !isExpired && driverData.safetyScore >= 0
            });
        }

        const populatedTrip = await Trip.findById(updatedTrip._id).populate('vehicle').populate('driver');
        res.json(populatedTrip);

    } catch (error) {
        res.status(500).json({ message: 'Failed to update trip status', error: error.message });
    }
};
