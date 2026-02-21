import MaintenanceLog from '../models/MaintenanceLog.js';
import Vehicle from '../models/Vehicle.js';

// @desc    Get all maintenance logs
// @route   GET /api/maintenance
// @access  Private (Manager)
export const getLogs = async (req, res) => {
    try {
        const logs = await MaintenanceLog.find({}).populate('vehicle').sort({ serviceDate: -1 });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch maintenance logs', error: error.message });
    }
};

// @desc    Add a new maintenance log
// @route   POST /api/maintenance
// @access  Private (Manager)
export const addLog = async (req, res) => {
    const { vehicle, serviceType, description, cost, serviceDate, status } = req.body;

    try {
        const vehicleDoc = await Vehicle.findById(vehicle);

        if (!vehicleDoc) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        const logStatus = status || 'Scheduled';

        const log = await MaintenanceLog.create({
            vehicle,
            serviceType,
            description,
            cost,
            serviceDate,
            status: logStatus,
        });

        // Auto-Logic: If Scheduled or In Progress, mark Vehicle as In Shop
        if (logStatus === 'Scheduled' || logStatus === 'In Progress') {
            await Vehicle.findByIdAndUpdate(vehicle, { status: 'In Shop' });
        } else if (logStatus === 'Completed' && vehicleDoc.status === 'In Shop') {
            // Edge case where creating it as completed instantly
            await Vehicle.findByIdAndUpdate(vehicle, { status: 'Available' });
        }

        const savedLog = await MaintenanceLog.findById(log._id).populate('vehicle');
        res.status(201).json(savedLog);

    } catch (error) {
        res.status(500).json({ message: 'Failed to log maintenance', error: error.message });
    }
};

// @desc    Update a maintenance log status (and associated vehicle status)
// @route   PUT /api/maintenance/:id/status
// @access  Private (Manager)
export const updateLogStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const log = await MaintenanceLog.findById(req.params.id);

        if (!log) {
            return res.status(404).json({ message: 'Maintenance log not found' });
        }

        const oldStatus = log.status;
        log.status = status;
        const updatedLog = await log.save();

        // Auto-Logic updates for linked assets
        if ((status === 'Scheduled' || status === 'In Progress') && oldStatus === 'Completed') {
            await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'In Shop' });
        } else if (status === 'Completed' && oldStatus !== 'Completed') {
            await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'Available' });
        }

        const populatedLog = await MaintenanceLog.findById(updatedLog._id).populate('vehicle');
        res.json(populatedLog);

    } catch (error) {
        res.status(500).json({ message: 'Failed to update maintenance status', error: error.message });
    }
};
