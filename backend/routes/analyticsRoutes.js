import express from 'express';
import { getFleetAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to restrict access to FinancialAnalyst and Manager
const analyticsRole = (req, res, next) => {
    if (req.user && (req.user.role === 'FinancialAnalyst' || req.user.role === 'Manager')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized for Analytics operations' });
    }
};

router.route('/')
    .get(protect, analyticsRole, getFleetAnalytics);

export default router;
