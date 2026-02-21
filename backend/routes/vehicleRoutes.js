import express from 'express';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to restrict access to Manager role only
const managerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Manager') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as Manager' });
    }
};

// Helper middleware for Dispatchers
const viewFleetRole = (req, res, next) => {
    if (req.user && (req.user.role === 'Manager' || req.user.role === 'Dispatcher')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized to view fleet' });
    }
};

router.route('/')
    .get(protect, viewFleetRole, getVehicles)
    .post(protect, managerOnly, addVehicle);

router.route('/:id')
    .put(protect, managerOnly, updateVehicle)
    .delete(protect, managerOnly, deleteVehicle);

export default router;
