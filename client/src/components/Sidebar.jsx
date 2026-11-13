import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Bot,
  Lightbulb,
  Compass,
  ArrowRight,
  ShieldCheck,
  Github,
} from 'lucide-react';

export default function Sidebar({ currentTab, setTab, onQuickAdd }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budget Planner', icon: PieChart },
    { id: 'ai', label: 'AI Assistant', icon: Bot, badge: 'Grounded' },
    { id: 'insights', label: 'Financial Insights', icon: Lightbulb },
    { id: 'landing', label: 'Product Tour', icon: Compass },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem 1rem',
        minHeight: 'calc(100vh - 65px)',
      }}
    >
      <div>
        <div style={{ padding: '0 0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          NAVIGATION
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--primary-navy)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-main)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon
                    size={18}
                    color={isActive ? 'var(--primary-emerald)' : 'var(--text-muted)'}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      backgroundColor: isActive ? 'rgba(16, 185, 129, 0.25)' : 'var(--emerald-light)',
                      color: isActive ? '#34D399' : 'var(--emerald-dark)',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '999px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Card - Hackathon Project Info */}
      <div style={{ marginTop: '2rem' }}>
        <div
          style={{
            backgroundColor: 'var(--surface-card-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={16} color="var(--primary-emerald)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-navy)' }}>
              Hackathon Verified
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
            Built for <strong>Arthaton 2026</strong> using Node.js, Express, PostgreSQL, Prisma & React.
          </p>
          <a
            href="https://github.com/ShreyaSingh2606"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--secondary-navy)',
            }}
          >
            <Github size={14} />
            <span>@ShreyaSingh2606</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
