import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TransactionModal from '../components/TransactionModal';
import transactionService from '../services/transactionService';
import { useToast } from '../hooks/useToast';

const DashboardLayout = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleCreateTransaction = async (data) => {
    try {
      setIsSubmitting(true);
      await transactionService.createTransaction(data);
      toast.success(`${data.type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      setIsAddModalOpen(false);
      // Dispatch custom event to notify child components (Dashboard & Transactions) to reload their data
      window.dispatchEvent(new CustomEvent('finora:transaction-changed'));
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add transaction. Please check inputs.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/60 text-slate-800">
      {/* Sidebar for Desktop */}
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTransaction}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DashboardLayout;
