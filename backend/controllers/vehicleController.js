import Vehicle from '../models/Vehicle.js';

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private (Manager)
export const getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({});
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch vehicles', error: error.message });
    }
};

// @desc    Add a new vehicle
// @route   POST /api/vehicles
// @access  Private (Manager)
export const addVehicle = async (req, res) => {
    const { name, licensePlate, maxLoadCapacity, odometer, vehicleType } = req.body;

    try {
        const vehicleExists = await Vehicle.findOne({ licensePlate });

        if (vehicleExists) {
            return res.status(400).json({ message: 'Vehicle with this License Plate already exists' });
        }

        const vehicle = await Vehicle.create({
            name,
            licensePlate,
            maxLoadCapacity,
            odometer: odometer || 0,
            vehicleType,
            status: 'Available', // default
        });

        res.status(201).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create vehicle', error: error.message });
    }
};

// @desc    Update a vehicle's status or details
// @route   PUT /api/vehicles/:id
// @access  Private (Manager)
export const updateVehicle = async (req, res) => {
    const { name, maxLoadCapacity, odometer, status } = req.body;

    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (vehicle) {
            vehicle.name = name || vehicle.name;
            vehicle.maxLoadCapacity = maxLoadCapacity || vehicle.maxLoadCapacity;
            vehicle.odometer = odometer !== undefined ? odometer : vehicle.odometer;
            vehicle.status = status || vehicle.status;

            const updatedVehicle = await vehicle.save();
            res.json(updatedVehicle);
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update vehicle', error: error.message });
    }
};
