/**
 * PaisaPilot API Client
 * Clean HTTP Fetch wrapper communicating with Express backend
 */

const BASE_URL = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Health
  async checkHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },

  // Analytics & Dashboard
  async getDashboardSummary(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const res = await fetch(`${BASE_URL}/analytics/dashboard?${params.toString()}`);
    return handleResponse(res);
  },

  async getInsights(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const res = await fetch(`${BASE_URL}/analytics/insights?${params.toString()}`);
    return handleResponse(res);
  },

  // Transactions
  async getTransactions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.skip) params.append('skip', filters.skip);

    const res = await fetch(`${BASE_URL}/transactions?${params.toString()}`);
    return handleResponse(res);
  },

  async getTransactionById(id) {
    const res = await fetch(`${BASE_URL}/transactions/${id}`);
    return handleResponse(res);
  },

  async createTransaction(transactionData) {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData),
    });
    return handleResponse(res);
  },

  async updateTransaction(id, transactionData) {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData),
    });
    return handleResponse(res);
  },

  async deleteTransaction(id) {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Smart Expense Categorization
  async predictCategory(title, type = 'EXPENSE') {
    const params = new URLSearchParams({ title, type });
    const res = await fetch(`${BASE_URL}/transactions/predict-category?${params.toString()}`);
    return handleResponse(res);
  },

  // Budgets
  async getMonthlyBudgets(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const res = await fetch(`${BASE_URL}/budgets?${params.toString()}`);
    return handleResponse(res);
  },

  async setBudget(budgetData) {
    const res = await fetch(`${BASE_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budgetData),
    });
    return handleResponse(res);
  },

  async deleteBudget(id) {
    const res = await fetch(`${BASE_URL}/budgets/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Categories
  async getCategories(type) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    const res = await fetch(`${BASE_URL}/categories?${params.toString()}`);
    return handleResponse(res);
  },

  async createCategory(categoryData) {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
    return handleResponse(res);
  },

  // AI Assistant
  async askAi(message) {
    const res = await fetch(`${BASE_URL}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return handleResponse(res);
  },

  async getAiContext() {
    const res = await fetch(`${BASE_URL}/ai/context`);
    return handleResponse(res);
  },
};
