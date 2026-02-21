import express from 'express';
import { getExpenses, addExpense } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to restrict access to Manager and FinancialAnalyst
const managerOrFinanceRole = (req, res, next) => {
    if (req.user && (req.user.role === 'Manager' || req.user.role === 'FinancialAnalyst')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized for Financial operations' });
    }
};

router.route('/')
    .get(protect, managerOrFinanceRole, getExpenses)
    .post(protect, managerOrFinanceRole, addExpense);

export default router;
