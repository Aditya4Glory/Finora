import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  PieChart,
  ShieldCheck,
  ArrowRight,
  Receipt,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LandingPage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage text="Loading Finora..." />;
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const features = [
    {
      icon: TrendingUp,
      title: 'Income & Expense Tracking',
      description: 'Log daily transactions effortlessly with categorizations for complete financial visibility.',
    },
    {
      icon: PieChart,
      title: 'Visual Insights & Charts',
      description: 'Explore visual breakdowns with category donuts, monthly trends, and income vs. expense charts.',
    },
    {
      icon: Receipt,
      title: 'Smart Search & Filters',
      description: 'Search by keyword, filter by date ranges or categories, and sort by amounts with ease.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Isolated',
      description: 'Your financial data is protected with JWT token authentication and database-level isolation.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Fin<span className="text-emerald-600">ora</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition shadow-sm hover:shadow"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Modern Personal Finance Made Simple
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight mb-6">
          Master your money with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            clarity and confidence.
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Finora gives you total control over your income, expenses, and savings with real-time analytics, visual breakdown charts, and seamless tracking.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-base hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/25 hover:shadow-xl active:scale-95"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 transition shadow-sm hover:shadow"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs sm:text-sm font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free Forever Plan
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Bank-grade Security
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real-time Analytics
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-100">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Everything you need to stay on top of your finances
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            Clean, fast, and engineered with no clutter — just the insights you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Finora. Personal Finance & Expense Tracker. Built with MERN Stack.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
