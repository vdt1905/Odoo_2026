import express from 'express';
import { getLogs, addLog, updateLogStatus } from '../controllers/maintenanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to restrict access to Manager role
const managerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Manager') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized for Maintenance approvals' });
    }
};

const entryRole = (req, res, next) => {
    if (req.user && req.user.role === 'Manager') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized to log Maintenance' });
    }
};

router.route('/')
    .get(protect, entryRole, getLogs)
    .post(protect, entryRole, addLog);

router.route('/:id/status')
    .put(protect, managerOnly, updateLogStatus);

export default router;
