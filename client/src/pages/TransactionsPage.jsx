import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Edit2,
  Trash2,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '../services/api';
import CategoryIcon from '../components/CategoryIcon';

export default function TransactionsPage({ onOpenAddModal, onEditTransaction }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState(''); // '', 'EXPENSE', 'INCOME'
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Delete State
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [type, categoryId, startDate, endDate]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function loadCategories() {
    try {
      const res = await api.getCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  async function loadTransactions() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTransactions({
        search,
        type,
        categoryId,
        startDate,
        endDate,
      });
      if (res.success) {
        setTransactions(res.data);
        setTotalCount(res.total);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) {
      return;
    }

    try {
      setDeletingId(id);
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setTotalCount((prev) => prev - 1);
    } catch (err) {
      alert(`Error deleting transaction: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  // Quick reset filters
  function resetFilters() {
    setSearch('');
    setType('');
    setCategoryId('');
    setStartDate('');
    setEndDate('');
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Quick Action */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.02em' }}>
            Transaction Ledger
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing <strong>{transactions.length}</strong> of <strong>{totalCount}</strong> recorded entries in PostgreSQL.
          </p>
        </div>

        <button onClick={onOpenAddModal} className="btn btn-primary">
          <PlusCircle size={16} />
          <span>Record New Transaction</span>
        </button>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search title or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All Types (Income & Expenses)</option>
              <option value="EXPENSE">Expenses Only (-)</option>
              <option value="INCOME">Income Only (+)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
            />
          </div>
        </div>

        {(search || type || categoryId || startDate || endDate) && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Filters active</span>
            <button
              onClick={resetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-emerald)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Transactions Table / List */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading transactions...
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#991B1B' }}>
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>No transactions found</p>
            <p style={{ fontSize: '0.875rem' }}>Try clearing your filters or record a new transaction.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-card-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>TRANSACTION</th>
                  <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>CATEGORY</th>
                  <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>DATE</th>
                  <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>METHOD</th>
                  <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>AMOUNT</th>
                  <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.1s ease',
                    }}
                  >
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: tx.type === 'INCOME' ? '#D1FAE5' : '#FEE2E2',
                            color: tx.type === 'INCOME' ? '#059669' : '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <CategoryIcon name={tx.category.icon} size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                            {tx.title}
                          </div>
                          {tx.description && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {tx.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: `${tx.category.color}18`,
                          color: tx.category.color,
                          border: `1px solid ${tx.category.color}30`,
                        }}
                      >
                        {tx.category.name}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9', fontSize: '0.75rem', fontWeight: 600 }}>
                        {tx.paymentMethod}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: '1rem 1.25rem',
                        textAlign: 'right',
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        color: tx.type === 'INCOME' ? 'var(--color-success)' : 'var(--primary-navy)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => onEditTransaction(tx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                          }}
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          disabled={deletingId === tx.id}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                          }}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
