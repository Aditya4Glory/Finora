const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// Protect all transaction routes
router.use(protect);

// Summary endpoint must be placed before /:id route
router.get('/summary', getTransactionSummary);

router.route('/')
  .post(createTransaction)
  .get(getTransactions);

router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
