const mongoose = require('mongoose');
const { Transaction, ALL_CATEGORIES } = require('../models/Transaction');

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a title' });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number greater than 0',
      });
    }

    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "income" or "expense"',
      });
    }

    if (!category || !ALL_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${ALL_CATEGORIES.join(', ')}`,
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title: title.trim(),
      amount: numericAmount,
      type,
      category,
      date: date ? new Date(date) : new Date(),
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      data: transaction,
      message: `${type === 'income' ? 'Income' : 'Expense'} added successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user transactions with search, filters, sorting & pagination
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      search,
      type,
      category,
      startDate,
      endDate,
      sort = 'newest',
      page = 1,
      limit = 50,
    } = req.query;

    // Scope strictly to authenticated user
    const query = { user: req.user._id };

    // Search query on title or description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Filter by type
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Sorting
    let sortOptions = { date: -1, createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { date: 1, createdAt: 1 };
    } else if (sort === 'amount_high') {
      sortOptions = { amount: -1 };
    } else if (sort === 'amount_low') {
      sortOptions = { amount: 1 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id, // Enforce ownership
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id, // Enforce ownership
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or you are not authorized to edit it',
      });
    }

    const { title, amount, type, category, date, description } = req.body;

    if (title !== undefined) {
      if (!title || title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' });
      }
      transaction.title = title.trim();
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number greater than 0',
        });
      }
      transaction.amount = numericAmount;
    }

    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "income" or "expense"',
        });
      }
      transaction.type = type;
    }

    if (category !== undefined) {
      if (!ALL_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Category must be one of: ${ALL_CATEGORIES.join(', ')}`,
        });
      }
      transaction.category = category;
    }

    if (date !== undefined) {
      transaction.date = new Date(date);
    }

    if (description !== undefined) {
      transaction.description = description ? description.trim() : '';
    }

    const updated = await transaction.save();

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Transaction updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id, // Enforce ownership
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or you are not authorized to delete it',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard financial summary & chart statistics
// @route   GET /api/transactions/summary
// @access  Private
const getTransactionSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Overall Income, Expense & Count aggregation
    const totalsAggregation = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    let totalTransactions = 0;

    totalsAggregation.forEach((item) => {
      if (item._id === 'income') {
        totalIncome = item.total;
      } else if (item._id === 'expense') {
        totalExpenses = item.total;
      }
      totalTransactions += item.count;
    });

    const totalBalance = totalIncome - totalExpenses;

    // 2. Expense breakdown by category
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          amount: 1,
          count: 1,
        },
      },
    ]);

    // 3. Monthly trends (last 6 months or all active months)
    const monthlyTrendsAggregation = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    // Map monthly data into clean chart format { month: 'Jan 2026', income: 1000, expense: 500, balance: 500 }
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const monthlyMap = new Map();

    monthlyTrendsAggregation.forEach((item) => {
      const { year, month, type } = item._id;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      const label = `${monthNames[month - 1]} ${year}`;

      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          key,
          month: label,
          income: 0,
          expense: 0,
          net: 0,
        });
      }

      const entry = monthlyMap.get(key);
      if (type === 'income') {
        entry.income += item.total;
      } else if (type === 'expense') {
        entry.expense += item.total;
      }
      entry.net = entry.income - entry.expense;
    });

    const monthlyTrends = Array.from(monthlyMap.values()).slice(-6);

    // 4. Fetch 5 most recent transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalBalance,
        totalIncome,
        totalExpenses,
        totalTransactions,
        categoryBreakdown,
        monthlyTrends,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
};
