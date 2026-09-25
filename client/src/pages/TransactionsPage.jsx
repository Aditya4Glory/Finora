import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  X,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import TransactionModal from '../components/TransactionModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import transactionService from '../services/transactionService';
import { useToast } from '../hooks/useToast';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ALL_CATEGORIES, SORT_OPTIONS } from '../utils/constants';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [category, setCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const limit = 15;

  // Modal states
  const [editModalData, setEditModalData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Fetch transactions with applied filters
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        sort,
      };

      if (search.trim()) params.search = search.trim();
      if (type !== 'All') params.type = type;
      if (category !== 'All') params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await transactionService.getTransactions(params);
      if (res?.data) {
        setTransactions(res.data);
        setTotalCount(res.total || 0);
        setTotalPages(res.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, sort, type, category, startDate, endDate, search, toast]);

  useEffect(() => {
    fetchTransactions();

    const handleTxChanged = () => fetchTransactions();
    window.addEventListener('finora:transaction-changed', handleTxChanged);

    return () => {
      window.removeEventListener('finora:transaction-changed', handleTxChanged);
    };
  }, [fetchTransactions]);

  // Handle Add Transaction
  const handleAddTransaction = async (data) => {
    try {
      setIsSubmittingAdd(true);
      await transactionService.createTransaction(data);
      toast.success(`${data.type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      setIsAddModalOpen(false);
      window.dispatchEvent(new CustomEvent('finora:transaction-changed'));
      fetchTransactions();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add transaction';
      toast.error(msg);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Handle Edit Transaction
  const handleOpenEdit = (tx) => {
    setEditModalData(tx);
    setIsEditModalOpen(true);
  };

  const handleUpdateTransaction = async (data) => {
    if (!editModalData?._id) return;
    try {
      setIsSubmittingEdit(true);
      await transactionService.updateTransaction(editModalData._id, data);
      toast.success('Transaction updated successfully!');
      setIsEditModalOpen(false);
      setEditModalData(null);
      window.dispatchEvent(new CustomEvent('finora:transaction-changed'));
      fetchTransactions();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update transaction';
      toast.error(msg);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Delete Transaction
  const handleOpenDelete = (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await transactionService.deleteTransaction(deleteTargetId);
      toast.success('Transaction deleted successfully!');
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      window.dispatchEvent(new CustomEvent('finora:transaction-changed'));
      fetchTransactions();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete transaction';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setType('All');
    setCategory('All');
    setStartDate('');
    setEndDate('');
    setSort('newest');
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    type !== 'All' ||
    category !== 'All' ||
    startDate !== '' ||
    endDate !== '' ||
    sort !== 'newest';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage, filter, search, and track all your financial logs.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition shadow-sm hover:shadow active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>

          {/* Type Filter */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            {['All', 'income', 'expense'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setPage(1);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                  type === t
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t === 'All' ? 'All Types' : t}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            >
              <option value="All">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              title="Start Date"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              title="End Date"
            />

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 font-semibold transition ml-2"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-xs focus:outline-none focus:border-emerald-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table / List View */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Fetching transactions..." />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title={hasActiveFilters ? 'No transactions match your filters' : 'No transactions recorded yet'}
              description={
                hasActiveFilters
                  ? 'Try adjusting your search keywords, category filters, or date range.'
                  : 'Start tracking your expenses and income right now.'
              }
              actionText={hasActiveFilters ? 'Reset Filters' : 'Add your first transaction'}
              onAction={hasActiveFilters ? handleResetFilters : () => setIsAddModalOpen(true)}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 pl-6">Transaction</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/80 transition">
                      {/* Title & Description */}
                      <td className="py-4 pl-6 font-semibold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              tx.type === 'income'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-rose-50 text-rose-600'
                            }`}
                          >
                            {tx.type === 'income' ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{tx.title}</p>
                            {tx.description && (
                              <p className="text-xs text-slate-400 max-w-xs truncate">{tx.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                          {tx.category}
                        </span>
                      </td>

                      {/* Type Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            tx.type === 'income'
                              ? 'bg-emerald-100/70 text-emerald-800'
                              : 'bg-rose-100/70 text-rose-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-4 px-4 text-right font-bold text-sm whitespace-nowrap ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="Edit Transaction"
                            aria-label="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(tx._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Transaction"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {transactions.length} of {totalCount} transactions
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Previous
                  </button>
                  <span className="font-semibold text-slate-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTransaction}
        isSubmitting={isSubmittingAdd}
      />

      {/* Edit Modal */}
      <TransactionModal
        isOpen={isEditModalOpen}
        initialData={editModalData}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditModalData(null);
        }}
        onSubmit={handleUpdateTransaction}
        isSubmitting={isSubmittingEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
        onConfirm={handleDeleteTransaction}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default TransactionsPage;
