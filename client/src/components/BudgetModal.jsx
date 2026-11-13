import React, { useState, useEffect } from 'react';
import { X, Target, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function BudgetModal({ isOpen, onClose, onSave, editingBudget, categories = [], currentMonth, currentYear }) {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(currentMonth || 11);
  const [year, setYear] = useState(currentYear || 2026);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editingBudget) {
      setCategoryId(editingBudget.categoryId);
      setAmount(editingBudget.budgetedAmount?.toString() || editingBudget.amount?.toString() || '');
      setMonth(editingBudget.month || currentMonth || 11);
      setYear(editingBudget.year || currentYear || 2026);
    } else {
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setAmount('');
      setMonth(currentMonth || 11);
      setYear(currentYear || 2026);
    }
    setErrorMessage('');
  }, [editingBudget, isOpen, categories, currentMonth, currentYear]);

  if (!isOpen) return null;

  // Filter only EXPENSE categories for budgeting
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!categoryId) {
      setErrorMessage('Please select a category.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please specify a monthly budget limit.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.setBudget({
        categoryId,
        amount: parseFloat(amount),
        month: parseInt(month, 10),
        year: parseInt(year, 10),
      });

      onSave();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--emerald-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald-dark)' }}>
              <Target size={18} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              {editingBudget ? 'Adjust Budget Limit' : 'Set Category Budget'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Expense Category</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!!editingBudget}
              required
            >
              <option value="">Select Category</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Limit (₹ INR)</label>
            <input
              type="number"
              step="100"
              min="100"
              className="form-input"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
              PaisaPilot will track real-time transactions against this ceiling and alert you when approaching 80%.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Month</label>
              <select className="form-select" value={month} onChange={(e) => setMonth(e.target.value)}>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input type="number" className="form-input" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
