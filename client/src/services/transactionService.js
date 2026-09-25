import api from './api';

export const transactionService = {
  // Fetch transactions with query parameters (search, type, category, date range, sort, pagination)
  async getTransactions(params = {}) {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  // Fetch single transaction by ID
  async getTransactionById(id) {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Create new transaction (income or expense)
  async createTransaction(transactionData) {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  // Update existing transaction
  async updateTransaction(id, transactionData) {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  // Delete transaction
  async deleteTransaction(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  // Fetch dashboard summary & statistics
  async getSummary() {
    const response = await api.get('/transactions/summary');
    return response.data;
  },
};

export default transactionService;
