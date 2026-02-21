import Driver from '../models/Driver.js';

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private (Manager, Dispatcher, SafetyOfficer)
export const getDrivers = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Auto-lock drivers whose license has expired
        await Driver.updateMany(
            { licenseExpiry: { $lt: today }, status: { $ne: 'LOCKED' } },
            { $set: { status: 'LOCKED', isAvailableForDispatch: false } }
        );

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
    const { name, licenseNumber, licenseExpiry, status, safetyScore, complaintsCount } = req.body;

    if (!name || !licenseNumber || !licenseExpiry) {
        return res.status(400).json({ message: 'Please provide all required fields (Name, License Number, Expiry)' });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isExpired = new Date(licenseExpiry) < today;

        let finalStatus = status || 'OFF_DUTY';
        if (isExpired) {
            finalStatus = 'LOCKED';
        }

        const isAvailable = finalStatus === 'ON_DUTY' && !isExpired && (safetyScore || 100) >= 0;

        const driver = await Driver.create({
            name,
            licenseNumber,
            licenseExpiry,
            status: finalStatus,
            safetyScore: safetyScore || 100,
            complaintsCount: complaintsCount || 0,
            isAvailableForDispatch: isAvailable
        });

        res.status(201).json(driver);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'License Number already exists.' });
        }
        res.status(500).json({ message: 'Failed to create driver', error: error.message });
    }
};

// @desc    Update driver profile (Safety Score, License tracking)
// @route   PUT /api/drivers/:id
// @access  Private (Manager, SafetyOfficer)
export const updateDriver = async (req, res) => {
    const { name, licenseNumber, licenseExpiry, status, safetyScore, complaintsCount } = req.body;

    try {
        const driver = await Driver.findById(req.params.id);

        if (driver) {
            driver.name = name || driver.name;
            if (licenseNumber) driver.licenseNumber = licenseNumber;
            driver.licenseExpiry = licenseExpiry || driver.licenseExpiry;
            driver.safetyScore = safetyScore !== undefined ? safetyScore : driver.safetyScore;
            driver.complaintsCount = complaintsCount !== undefined ? complaintsCount : driver.complaintsCount;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isExpired = new Date(driver.licenseExpiry) < today;

            if (isExpired) {
                driver.status = 'LOCKED';
            } else if (status) {
                driver.status = status;
                // If status was strictly passed as LOCKED but license is not expired, revert it to OFF_DUTY or accept the new valid status.
                if (driver.status === 'LOCKED') {
                    driver.status = 'OFF_DUTY';
                }
            }

            // Recalculate strict DB boolean
            driver.isAvailableForDispatch = (driver.status === 'ON_DUTY' && !isExpired);

            const updatedDriver = await driver.save();
            res.json(updatedDriver);
        } else {
            res.status(404).json({ message: 'Driver not found' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'License Number already exists.' });
        }
        res.status(500).json({ message: 'Failed to update driver', error: error.message });
    }
};
