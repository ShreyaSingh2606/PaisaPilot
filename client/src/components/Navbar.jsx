import React from 'react';
import { Compass, Sparkles, User, Calendar, ExternalLink } from 'lucide-react';

export default function Navbar({ onOpenAddModal, currentMonthName = 'November 2026' }) {
  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-light)',
        padding: '0.875rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0B132B 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
          }}
        >
          <Compass size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.02em' }}>
              PaisaPilot
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                backgroundColor: 'var(--emerald-light)',
                color: 'var(--emerald-dark)',
                padding: '0.125rem 0.5rem',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Arthaton '26
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1 }}>
            Your Money. Your Decisions. Your AI Financial Companion.
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Active Month Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.75rem',
            backgroundColor: 'var(--surface-card-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--secondary-navy)',
          }}
        >
          <Calendar size={15} color="var(--primary-emerald)" />
          <span>{currentMonthName}</span>
        </div>

        {/* Currency Tag */}
        <div
          style={{
            padding: '0.375rem 0.625rem',
            backgroundColor: '#F1F5F9',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
          }}
        >
          ₹ INR
        </div>

        {/* Add Transaction Button */}
        {onOpenAddModal && (
          <button onClick={onOpenAddModal} className="btn btn-primary btn-sm">
            <span>+ Add Transaction</span>
          </button>
        )}

        {/* Developer Profile Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.25rem 0.5rem 0.25rem 0.35rem',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-navy)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            SS
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
              Shreya Singh
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Developer Mode
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
