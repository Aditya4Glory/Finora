import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  ArrowRight,
  PieChart as PieChartIcon,
  BarChart2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import transactionService from '../services/transactionService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORY_COLORS } from '../utils/constants';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await transactionService.getSummary();
      if (res?.data) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setError('Failed to load dashboard metrics. Please refresh or try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();

    // Listen for transaction updates triggered anywhere in the app
    const handleTxChanged = () => fetchSummary();
    window.addEventListener('finora:transaction-changed', handleTxChanged);

    return () => {
      window.removeEventListener('finora:transaction-changed', handleTxChanged);
    };
  }, [fetchSummary]);

  if (loading && !summary) {
    return <LoadingSpinner fullPage text="Loading dashboard insights..." />;
  }

  if (error && !summary) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-rose-100 shadow-sm max-w-xl mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">Unable to load dashboard</h3>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button
          onClick={fetchSummary}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    totalBalance = 0,
    totalIncome = 0,
    totalExpenses = 0,
    totalTransactions = 0,
    categoryBreakdown = [],
    monthlyTrends = [],
    recentTransactions = [],
  } = summary || {};

  // Custom Recharts tooltip for currency values
  const CurrencyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
          {label && <p className="font-semibold text-slate-300 mb-1">{label}</p>}
          {payload.map((item, idx) => (
            <p key={idx} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              <span className="text-slate-400 capitalize">{item.name}:</span>
              <span className="font-bold">{formatCurrency(item.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Title & Intro */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Financial Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Here is an overview of your real-time balance, income, expenses, and analytics.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Balance"
          amount={totalBalance}
          icon={Wallet}
          colorScheme={totalBalance >= 0 ? 'emerald' : 'rose'}
          trend={totalBalance >= 0 ? 'Net positive savings' : 'Net negative deficit'}
        />
        <StatCard
          title="Total Income"
          amount={totalIncome}
          icon={TrendingUp}
          colorScheme="blue"
          trend="Total earned to date"
        />
        <StatCard
          title="Total Expenses"
          amount={totalExpenses}
          icon={TrendingDown}
          colorScheme="rose"
          trend="Total spent across categories"
        />
        <StatCard
          title="Transactions"
          amount={totalTransactions}
          isCurrency={false}
          icon={Receipt}
          colorScheme="slate"
          trend="Recorded transaction events"
        />
      </div>

      {/* If brand new user with 0 transactions, show prominent onboarding empty state */}
      {totalTransactions === 0 ? (
        <EmptyState
          title="No transactions yet"
          description="You haven't recorded any income or expense transactions yet. Add your first transaction to unlock interactive charts and analytics."
          actionText="Add your first transaction"
          onAction={() => {
            // Trigger add modal using the layout's button or click quick-add
            const addBtn = document.querySelector('button[aria-label="Add transaction"]') ||
              document.querySelector('header button');
            if (addBtn) addBtn.click();
          }}
        />
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Expense by Category (Donut Chart) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <PieChartIcon className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">Expense by Category</h2>
                </div>
                <span className="text-xs text-slate-400 font-medium">Breakdown</span>
              </div>

              {categoryBreakdown.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6">
                  <p>No expense data recorded yet to display breakdown.</p>
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CATEGORY_COLORS[entry.category] || '#64748b'}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CurrencyTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 2: Income vs Expense (Bar Chart) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">Income vs. Expense</h2>
                </div>
                <span className="text-xs text-slate-400 font-medium">Comparison</span>
              </div>

              {monthlyTrends.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6">
                  <p>No data recorded yet to compare income and expense.</p>
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                      />
                      <Tooltip content={<CurrencyTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      />
                      <Bar dataKey="income" name="Income" fill="#22c55e" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Chart 3: Monthly Spending Trend (Line Chart) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Monthly Spending Trend</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Trajectory</span>
            </div>

            {monthlyTrends.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6">
                <p>No monthly trend data available.</p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip content={<CurrencyTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      name="Expense"
                      stroke="#f43f5e"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#f43f5e' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#22c55e' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent Transactions List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-800">Recent Transactions</h2>
                <p className="text-xs text-slate-400 mt-0.5">Your last 5 recorded activities</p>
              </div>
              <Link
                to="/transactions"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
              >
                <span>View all</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2">Title</th>
                    <th className="pb-3 px-3">Category</th>
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 pr-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentTransactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 pl-2 font-semibold text-slate-800 flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
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
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{tx.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className={`py-3.5 pr-2 text-right font-bold text-sm whitespace-nowrap ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
