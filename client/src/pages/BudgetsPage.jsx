import React, { useState, useEffect } from 'react';
import {
  Target,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  Trash2,
  Edit2,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';
import CategoryIcon from '../components/CategoryIcon';

export default function BudgetsPage({ onOpenBudgetModal, onEditBudget }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth, selectedYear]);

  async function loadBudgets() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMonthlyBudgets(selectedMonth, selectedYear);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this budget limit?')) return;
    try {
      setDeletingId(id);
      await api.deleteBudget(id);
      loadBudgets();
    } catch (err) {
      alert(`Error deleting budget: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  const summary = data?.summary || {
    totalBudgeted: 0,
    totalSpent: 0,
    totalRemaining: 0,
    totalOverspent: 0,
    overallUtilizationRate: 0,
    overspentCount: 0,
    warningCount: 0,
  };

  const budgets = data?.budgets || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.02em' }}>
            Category Budget Planner
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Track real spending limits against actual PostgreSQL ledger records.
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

          <button onClick={() => onOpenBudgetModal()} className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Set New Budget</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Budget Limit
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.25rem' }}>
            ₹{summary.totalBudgeted.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
            Across {budgets.length} categories
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Actual Spent So Far
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.25rem' }}>
            ₹{summary.totalSpent.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
            {summary.overallUtilizationRate}% of total budget
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Remaining Buffer
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.25rem' }}>
            ₹{summary.totalRemaining.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
            Available to spend safely
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Budget Health
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            {summary.overspentCount > 0 ? (
              <span className="badge badge-danger" style={{ fontSize: '0.875rem' }}>
                <AlertTriangle size={14} /> {summary.overspentCount} Overspent
              </span>
            ) : summary.warningCount > 0 ? (
              <span className="badge badge-warning" style={{ fontSize: '0.875rem' }}>
                <Clock size={14} /> {summary.warningCount} Warning
              </span>
            ) : (
              <span className="badge badge-success" style={{ fontSize: '0.875rem' }}>
                <CheckCircle2 size={14} /> All on Track
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
            Real-time status
          </span>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
          Category Breakdown & Utilization
        </h2>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading budget telemetry...
          </div>
        ) : budgets.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontWeight: 600, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>No budgets set for this month</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Set category limits to keep student expenses controlled and avoid month-end deficits.
            </p>
            <button onClick={() => onOpenBudgetModal()} className="btn btn-primary">
              Set Your First Budget
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {budgets.map((b) => {
              const isOverspent = b.status === 'OVERSPENT';
              const isWarning = b.status === 'WARNING';

              const barColor = isOverspent ? 'var(--color-danger)' : isWarning ? 'var(--color-warning)' : 'var(--primary-emerald)';

              return (
                <div key={b.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Card Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: `${b.categoryColor}18`,
                            color: b.categoryColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CategoryIcon name={b.categoryIcon} size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.9375rem' }}>
                            {b.categoryName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Limit: ₹{b.budgetedAmount.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span className={`badge ${isOverspent ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-success'}`}>
                          {b.utilizationRate}%
                        </span>
                        <button
                          onClick={() => onEditBudget(b)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                          title="Edit Limit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          disabled={deletingId === b.id}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                          title="Delete Limit"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ margin: '0.75rem 0' }}>
                      <div className="progress-container">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${Math.min(b.utilizationRate, 100)}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Spent vs Remaining */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #F1F5F9',
                      fontSize: '0.8125rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Spent: </span>
                      <strong style={{ color: 'var(--primary-navy)' }}>
                        ₹{b.spentAmount.toLocaleString('en-IN')}
                      </strong>
                    </div>

                    <div>
                      {isOverspent ? (
                        <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>
                          Over by ₹{b.overspentAmount.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                          Remaining: ₹{b.remainingAmount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
