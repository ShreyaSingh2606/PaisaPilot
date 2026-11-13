import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import CategoryIcon from './CategoryIcon';

export default function TransactionModal({ isOpen, onClose, onSave, editingTransaction, categories = [] }) {
  const [type, setType] = useState('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [description, setDescription] = useState('');
  const [predictedCategory, setPredictedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state if editing an existing transaction
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setCategoryId(editingTransaction.categoryId);
      setDate(new Date(editingTransaction.date).toISOString().split('T')[0]);
      setPaymentMethod(editingTransaction.paymentMethod || 'UPI');
      setDescription(editingTransaction.description || '');
      setPredictedCategory(null);
    } else {
      setType('EXPENSE');
      setTitle('');
      setAmount('');
      setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setDescription('');
      setPredictedCategory(null);
    }
    setErrorMessage('');
  }, [editingTransaction, isOpen]);

  // Debounced auto-categorization when typing title
  useEffect(() => {
    if (editingTransaction || !title || title.trim().length < 3) {
      setPredictedCategory(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.predictCategory(title, type);
        if (res.success && res.data && res.data.categoryId) {
          setPredictedCategory(res.data);
          // Only auto-select if user hasn't explicitly chosen another category
          if (!categoryId) {
            setCategoryId(res.data.categoryId);
          }
        }
      } catch (err) {
        console.warn('Smart categorization query failed:', err);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [title, type]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Please enter a transaction title.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }

    let finalCategoryId = categoryId;
    if (!finalCategoryId) {
      if (predictedCategory && predictedCategory.categoryId) {
        finalCategoryId = predictedCategory.categoryId;
      } else if (filteredCategories.length > 0) {
        finalCategoryId = filteredCategories[0].id;
      }
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        amount: parseFloat(amount),
        type,
        categoryId: finalCategoryId,
        date: new Date(date).toISOString(),
        paymentMethod,
        description: description.trim(),
      };

      if (editingTransaction) {
        await api.updateTransaction(editingTransaction.id, payload);
      } else {
        await api.createTransaction(payload);
      }

      onSave();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Type Toggle: Expense / Income */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', backgroundColor: '#F1F5F9', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE');
                setCategoryId('');
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                backgroundColor: type === 'EXPENSE' ? '#EF4444' : 'transparent',
                color: type === 'EXPENSE' ? '#FFFFFF' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('INCOME');
                setCategoryId('');
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                backgroundColor: type === 'INCOME' ? '#10B981' : 'transparent',
                color: type === 'INCOME' ? '#FFFFFF' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              Income (+)
            </button>
          </div>

          {/* Title with Smart Auto-categorization */}
          <div className="form-group">
            <label className="form-label">Title / Merchant / Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Zomato lunch, Uber ride, Myntra hoodie, TCS Stipend"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            {/* Live smart categorization pill */}
            {predictedCategory && predictedCategory.categoryName && (
              <div
                style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#D1FAE5',
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  color: '#065F46',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Sparkles size={14} color="#059669" />
                  <span>
                    Smart Categorization: <strong>{predictedCategory.categoryName}</strong>
                    {predictedCategory.matchedKeyword ? ` (matched "${predictedCategory.matchedKeyword}")` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCategoryId(predictedCategory.categoryId)}
                  style={{
                    border: 'none',
                    background: '#059669',
                    color: '#FFF',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Amount & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Amount (₹ INR)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Payment Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="UPI">UPI (GPay, PhonePe, Paytm)</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Split with Priya, college lab printout"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : editingTransaction ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
