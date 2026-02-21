import Driver from '../models/Driver.js';

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private (Manager, Dispatcher, SafetyOfficer)
export const getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({});
        res.status(200).json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch drivers', error: error.message });
    }
};

// @desc    Add a new driver
// @route   POST /api/drivers
// @access  Private (Manager, SafetyOfficer)
export const addDriver = async (req, res) => {
    const { name, licenseExpiry, status, safetyScore } = req.body;

    // Optional basic validation
    if (!name || !licenseExpiry) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isExpired = new Date(licenseExpiry) < today;
        const initialStatus = status || 'On Duty';
        const isAvailable = initialStatus === 'On Duty' && !isExpired && (safetyScore || 100) >= 0; // Simple logic as requested

        const driver = await Driver.create({
            name,
            licenseExpiry,
            status: initialStatus,
            safetyScore: safetyScore || 100,
            isAvailableForDispatch: isAvailable
        });

        res.status(201).json(driver);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create driver', error: error.message });
    }
};

// @desc    Update driver profile (Safety Score, License tracking)
// @route   PUT /api/drivers/:id
// @access  Private (Manager, SafetyOfficer)
export const updateDriver = async (req, res) => {
    const { name, licenseExpiry, status, safetyScore } = req.body;

    try {
        const driver = await Driver.findById(req.params.id);

        if (driver) {
            driver.name = name || driver.name;
            driver.licenseExpiry = licenseExpiry || driver.licenseExpiry;
            driver.status = status || driver.status;
            driver.safetyScore = safetyScore !== undefined ? safetyScore : driver.safetyScore;

            // Recalculate strict DB boolean
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isExpired = new Date(driver.licenseExpiry) < today;
            driver.isAvailableForDispatch = (driver.status === 'On Duty' && !isExpired);

            const updatedDriver = await driver.save();
            res.json(updatedDriver);
        } else {
            res.status(404).json({ message: 'Driver not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update driver', error: error.message });
    }
};
