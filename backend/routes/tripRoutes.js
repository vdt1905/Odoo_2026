import express from 'express';
import { getTrips, createTrip, updateTripStatus } from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to restrict access to Dispatcher roles
const dispatchRole = (req, res, next) => {
    if (req.user && req.user.role === 'Dispatcher') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized for Dispatch operations' });
    }
};

const dispatcherOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Dispatcher') {
        next();
    } else {
        res.status(403).json({ message: 'Only Dispatchers can create trips' });
    }
};

router.route('/')
    .get(protect, dispatchRole, getTrips)
    .post(protect, dispatcherOnly, createTrip);

router.route('/:id/status')
    .put(protect, dispatchRole, updateTripStatus);

export default router;
