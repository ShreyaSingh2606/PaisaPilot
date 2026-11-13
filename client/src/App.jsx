import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TransactionModal from './components/TransactionModal';
import BudgetModal from './components/BudgetModal';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import AiAssistantPage from './pages/AiAssistantPage';
import InsightsPage from './pages/InsightsPage';

import { api } from './services/api';

export default function App() {
  const [currentTab, setTab] = useState('dashboard');
  const [categories, setCategories] = useState([]);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // AI Prompt Passing
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');

  // Refresh trigger counter to signal pages when data mutated
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await api.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories in root App:', err);
    }
  }

  function handleOpenAddTransaction() {
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  }

  function handleEditTransaction(tx) {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  }

  function handleOpenAddBudget() {
    setEditingBudget(null);
    setIsBudgetModalOpen(true);
  }

  function handleEditBudget(b) {
    setEditingBudget(b);
    setIsBudgetModalOpen(true);
  }

  function handleNavigateWithAiPrompt(tab, prompt = '') {
    setTab(tab);
    if (prompt) {
      setAiInitialPrompt(prompt);
    }
  }

  function triggerDataRefresh() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setTab={(tab) => {
          setTab(tab);
          setAiInitialPrompt('');
        }}
        onQuickAdd={handleOpenAddTransaction}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          onOpenAddModal={currentTab !== 'landing' ? handleOpenAddTransaction : null}
          currentMonthName="November 2026"
        />

        <main className="page-wrapper">
          {currentTab === 'landing' && (
            <LandingPage onExploreApp={() => setTab('dashboard')} />
          )}

          {currentTab === 'dashboard' && (
            <DashboardPage
              key={`dashboard-${refreshKey}`}
              onOpenAddModal={handleOpenAddTransaction}
              onNavigateTab={handleNavigateWithAiPrompt}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsPage
              key={`transactions-${refreshKey}`}
              onOpenAddModal={handleOpenAddTransaction}
              onEditTransaction={handleEditTransaction}
            />
          )}

          {currentTab === 'budgets' && (
            <BudgetsPage
              key={`budgets-${refreshKey}`}
              onOpenBudgetModal={handleOpenAddBudget}
              onEditBudget={handleEditBudget}
            />
          )}

          {currentTab === 'ai' && (
            <AiAssistantPage initialPrompt={aiInitialPrompt} />
          )}

          {currentTab === 'insights' && (
            <InsightsPage
              key={`insights-${refreshKey}`}
              onNavigateTab={handleNavigateWithAiPrompt}
            />
          )}
        </main>
      </div>

      {/* Reusable Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={() => {
          triggerDataRefresh();
          loadCategories();
        }}
        editingTransaction={editingTransaction}
        categories={categories}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={triggerDataRefresh}
        editingBudget={editingBudget}
        categories={categories}
        currentMonth={11}
        currentYear={2026}
      />
    </div>
  );
}
