import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  PieChart,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';

export default function InsightsPage({ onNavigateTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedYear, setSelectedYear] = useState(2026);

  useEffect(() => {
    loadInsights();
  }, [selectedMonth, selectedYear]);

  async function loadInsights() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getInsights(selectedMonth, selectedYear);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load financial insights');
    } finally {
      setLoading(false);
    }
  }

  const summary = data?.summary || null;
  const insights = data?.insights || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Financial Intelligence & Insights</span>
            <span
              style={{
                fontSize: '0.6875rem',
                backgroundColor: 'var(--emerald-light)',
                color: 'var(--emerald-dark)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontWeight: 700,
              }}
            >
              Real Analytics
            </span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Deep heuristics and pattern recognition calculated from your actual transactions.
          </p>
        </div>

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
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Computing financial analytics from database...
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#991B1B' }}>
          {error}
        </div>
      ) : (
        <>
          {/* Insights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {insights.map((item, index) => {
              let iconBg = '#F1F5F9';
              let iconColor = '#475569';
              let Icon = Lightbulb;

              if (item.severity === 'success') {
                iconBg = '#D1FAE5';
                iconColor = '#059669';
                Icon = CheckCircle2;
              } else if (item.severity === 'warning') {
                iconBg = '#FEF3C7';
                iconColor = '#D97706';
                Icon = AlertTriangle;
              } else if (item.severity === 'danger') {
                iconBg = '#FEE2E2';
                iconColor = '#DC2626';
                Icon = ShieldAlert;
              } else {
                iconBg = '#DBEAFE';
                iconColor = '#2563EB';
                Icon = Sparkles;
              }

              return (
                <div
                  key={index}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          backgroundColor: iconBg,
                          color: iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={20} />
                      </div>

                      {item.metric && (
                        <span
                          className={`badge ${
                            item.severity === 'success'
                              ? 'badge-success'
                              : item.severity === 'warning'
                              ? 'badge-warning'
                              : item.severity === 'danger'
                              ? 'badge-danger'
                              : 'badge-info'
                          }`}
                        >
                          {item.metric}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                      {item.title}
                    </h3>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {item.description}
                    </p>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      onClick={() => onNavigateTab('ai', `Explain the insight: ${item.title}`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-emerald)',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <span>Ask AI to dive deeper</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Student Financial Health Blueprint Card */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #0B132B 0%, #162447 100%)',
              color: '#FFFFFF',
              padding: '2.5rem',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div style={{ maxWidth: '800px' }}>
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
                <span>STUDENT WEALTH ACCELERATOR</span>
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                The 50/30/20 Rule for College Students & Interns
              </h2>

              <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Based on your current recorded monthly income of <strong>₹{summary?.kpi?.totalIncome?.toLocaleString('en-IN') || '37,000'}</strong>:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>50% NEEDS</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '0.25rem 0' }}>
                    ₹{Math.round((summary?.kpi?.totalIncome || 35000) * 0.5).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Hostel rent, mess, commute pass</div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>30% WANTS</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '0.25rem 0' }}>
                    ₹{Math.round((summary?.kpi?.totalIncome || 35000) * 0.3).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Dining out, OTT, gaming, clothes</div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600 }}>20% SAVINGS</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399', margin: '0.25rem 0' }}>
                    ₹{Math.round((summary?.kpi?.totalIncome || 35000) * 0.2).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Emergency cash, index fund SIP</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
