import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Receipt,
  PieChart as PieIcon,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import StatCard from '../components/StatCard';
import CategoryIcon from '../components/CategoryIcon';
import { api } from '../services/api';

const DONUT_COLORS = [
  '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B',
  '#06B6D4', '#EF4444', '#14B8A6', '#6B7280', '#6366F1'
];

export default function DashboardPage({ onOpenAddModal, onNavigateTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default month: November 2026
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedYear, setSelectedYear] = useState(2026);

  useEffect(() => {
    loadDashboard();
  }, [selectedMonth, selectedYear]);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardSummary(selectedMonth, selectedYear);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (loading && !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading PaisaPilot Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}>
        <p style={{ color: '#991B1B', fontWeight: 600 }}>{error}</p>
        <button onClick={loadDashboard} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  const kpi = data?.kpi || {
    totalIncome: 0,
    totalExpenses: 0,
    remainingBalance: 0,
    savingsRate: 0,
    totalBudget: 0,
    budgetUtilization: 0,
    expenseChangePercentage: 0,
    incomeChangePercentage: 0,
  };

  const categoryBreakdown = data?.categoryBreakdown || [];
  const monthlyTrends = data?.monthlyTrends || [];
  const recentTransactions = data?.recentTransactions || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner: Greeting & Month Picker */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.02em' }}>
            Financial Overview
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Welcome back, <strong>{data?.user?.name || 'Shreya'}</strong>. Here is your financial snapshot.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            className="form-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            style={{ width: 'auto', fontWeight: 600 }}
          >
            <option value="10">October 2026</option>
            <option value="11">November 2026 (Current)</option>
            <option value="12">December 2026</option>
          </select>

          <button onClick={onOpenAddModal} className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Total Monthly Income"
          value={`₹${kpi.totalIncome.toLocaleString('en-IN')}`}
          change={kpi.incomeChangePercentage}
          icon={Wallet}
          variant="emerald"
        />

        <StatCard
          title="Total Monthly Expenses"
          value={`₹${kpi.totalExpenses.toLocaleString('en-IN')}`}
          change={kpi.expenseChangePercentage}
          icon={Receipt}
          variant="danger"
        />

        <StatCard
          title="Remaining Balance"
          value={`₹${kpi.remainingBalance.toLocaleString('en-IN')}`}
          subtitle={kpi.remainingBalance >= 0 ? 'Surplus in bank' : 'Budget deficit'}
          icon={PiggyBank}
          variant={kpi.remainingBalance >= 0 ? 'emerald' : 'danger'}
        />

        <StatCard
          title="Savings Percentage"
          value={`${kpi.savingsRate}%`}
          subtitle={kpi.savingsRate >= 20 ? 'Target achieved (≥20%)' : 'Below 20% target'}
          icon={TrendingUp}
          variant={kpi.savingsRate >= 20 ? 'emerald' : 'warning'}
          badge={{
            text: kpi.savingsRate >= 30 ? 'Excellent' : kpi.savingsRate >= 20 ? 'Healthy' : 'Needs Focus',
            type: kpi.savingsRate >= 20 ? 'success' : 'warning',
          }}
        />
      </div>

      {/* Budget Utilization Radar Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
              Monthly Budget Utilization
            </span>
            <span className={`badge ${kpi.budgetUtilization > 100 ? 'badge-danger' : kpi.budgetUtilization >= 80 ? 'badge-warning' : 'badge-success'}`}>
              {kpi.budgetUtilization}% Used
            </span>
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Spent <strong>₹{kpi.totalExpenses.toLocaleString('en-IN')}</strong> of <strong>₹{kpi.totalBudget.toLocaleString('en-IN')}</strong> allocated
          </span>
        </div>

        <div className="progress-container">
          <div
            className="progress-bar"
            style={{
              width: `${Math.min(kpi.budgetUtilization, 100)}%`,
              backgroundColor:
                kpi.budgetUtilization > 100
                  ? 'var(--color-danger)'
                  : kpi.budgetUtilization >= 80
                  ? 'var(--color-warning)'
                  : 'var(--primary-emerald)',
            }}
          />
        </div>
      </div>

      {/* Charts Grid: Monthly Trends Area Chart & Category Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Spending Trends Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Income vs. Expense Trend</h3>
              <p className="card-subtitle">Monthly trajectory calculated from database</p>
            </div>
          </div>

          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="monthLabel" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0B132B', border: 'none', borderRadius: '8px', color: '#FFF' }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGradient)"
                  name="Expenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Category-wise Spending Breakdown</h3>
              <p className="card-subtitle">Where your money went this month</p>
            </div>
          </div>

          {categoryBreakdown.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#0B132B', border: 'none', borderRadius: '8px', color: '#FFF' }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    formatter={(val) => <span style={{ fontSize: '0.75rem', color: '#334155' }}>{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No expense records recorded for this month.
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions & Quick AI Action Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Transactions List */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Transactions</h3>
              <p className="card-subtitle">Latest recorded financial entries</p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-emerald)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface-card-subtle)',
                    transition: 'background var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: tx.type === 'INCOME' ? '#D1FAE5' : '#FEE2E2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tx.type === 'INCOME' ? '#059669' : '#DC2626',
                      }}
                    >
                      <CategoryIcon name={tx.category.icon} size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                        {tx.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {tx.category.name} • {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {tx.paymentMethod}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: tx.type === 'INCOME' ? 'var(--color-success)' : 'var(--primary-navy)',
                    }}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                No recent transactions found.
              </p>
            )}
          </div>
        </div>

        {/* AI Assistant Quick Callout Card */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #0B132B 0%, #1C2541 100%)',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: 'none',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#34D399',
                padding: '0.25rem 0.625rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={14} />
              <span>PAISAPILOT FINANCIAL COPILOT</span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.3 }}>
              Have questions about your money this month?
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Our AI analyzes your PostgreSQL transaction records directly to explain your spending habits, evaluate budget health, and formulate savings roadmaps.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                'Where am I spending most of my money?',
                'Am I exceeding my monthly budget?',
                'How can I save ₹2,000 next month?',
              ].map((query, i) => (
                <button
                  key={i}
                  onClick={() => onNavigateTab('ai', query)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem 0.875rem',
                    color: '#F8FAFC',
                    fontSize: '0.8125rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>"{query}"</span>
                  <ArrowRight size={14} color="#10B981" />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('ai')}
            className="btn btn-primary"
            style={{ marginTop: '1.5rem', width: '100%' }}
          >
            <span>Open AI Financial Assistant</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
