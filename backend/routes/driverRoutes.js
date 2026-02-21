import express from 'express';
import { getDrivers, addDriver, updateDriver } from '../controllers/driverController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to restrict access to SafetyOfficer
const safetyRole = (req, res, next) => {
    if (req.user && req.user.role === 'SafetyOfficer') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized for Safety operations' });
    }
};

router.route('/')
    .get(protect, getDrivers) // Dispatchers also need GET
    .post(protect, safetyRole, addDriver);

router.route('/:id')
    .put(protect, safetyRole, updateDriver);

export default router;
