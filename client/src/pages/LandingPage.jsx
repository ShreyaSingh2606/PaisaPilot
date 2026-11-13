import React from 'react';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Receipt,
  PieChart,
  Bot,
  Zap,
  TrendingUp,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage({ onExploreApp }) {
  const features = [
    {
      icon: Bot,
      title: 'Context-Grounded Financial AI',
      desc: 'Never hallucinates figures. Injects real database metrics directly into the prompt context with a 100% offline deterministic reasoning engine fallback.',
      color: '#10B981',
    },
    {
      icon: Zap,
      title: 'Instant Smart Categorization',
      desc: 'Automatic merchant matching for Indian services (Zomato, Uber, Amazon, Blinkit, College fees) as you type, with manual override control.',
      color: '#3B82F6',
    },
    {
      icon: PieChart,
      title: 'Proactive Budget Radar',
      desc: 'Visual category budgets with automatic utilization tracking, warning states at 80%, and strict overspending alerts.',
      color: '#F59E0B',
    },
    {
      icon: TrendingUp,
      title: 'Dynamic Spending Insights',
      desc: 'Actionable recommendations, highest/lowest spending breakdowns, and personalized ₹2,000 monthly savings playbooks.',
      color: '#8B5CF6',
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 0 4rem' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0B132B 0%, #1C2541 65%, #0F3838 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '4rem 3rem',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          marginBottom: '3rem',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '780px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.35rem 0.875rem',
              borderRadius: '999px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#34D399',
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={15} />
            <span>ARTHATON 2026 — AI FINANCE HACKATHON</span>
          </div>

          <h1
            style={{
              fontSize: '3rem',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
            }}
          >
            Your Money. Your Decisions.{' '}
            <span style={{ color: '#10B981', display: 'block' }}>
              Your AI Financial Companion.
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.125rem',
              color: '#94A3B8',
              lineHeight: 1.6,
              marginBottom: '2.25rem',
              maxWidth: '650px',
            }}
          >
            Solving the financial blind spot for Indian college students and young professionals.
            Track UPI spends, master monthly budgets, and converse with a grounded AI assistant that calculates answers directly from your PostgreSQL records.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={onExploreApp}
              className="btn btn-primary"
              style={{ padding: '0.875rem 1.75rem', fontSize: '1rem' }}
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight size={18} />
            </button>
            <a
              href="https://github.com/ShreyaSingh2606"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                padding: '0.875rem 1.5rem',
                fontSize: '1rem',
              }}
            >
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>

        {/* Developer Attribution Tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            right: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'rgba(11, 19, 43, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Solo Developer</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>Shreya Singh</div>
          </div>
        </div>
      </div>

      {/* College Problem & Solution Grid */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            Engineered for Real Student Finance Realities
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.5rem' }}>
            College life involves dozens of micro-transactions on UPI, split bills, and stipend management.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.75rem',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: `${f.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: f.color,
                    marginBottom: '1.25rem',
                  }}
                >
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack Banner */}
      <div
        className="card"
        style={{
          backgroundColor: '#FFFFFF',
          padding: '2.5rem',
          textAlign: 'center',
          border: '1px solid var(--border-light)',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--primary-emerald)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          COLLEGE CURRICULUM ARCHITECTURE
        </span>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Pure JavaScript Full-Stack with PostgreSQL & Prisma ORM
        </h3>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          {[
            'React.js + Hooks',
            'Fetch API',
            'Node.js & Express',
            'PostgreSQL',
            'Prisma ORM',
            'Grounded LLM & Fallback',
            'Pure CSS Design System',
            'Recharts Visualizations',
          ].map((tag, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--surface-card-subtle)',
                borderRadius: '999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--secondary-navy)',
                border: '1px solid var(--border-light)',
              }}
            >
              <CheckCircle2 size={15} color="var(--primary-emerald)" />
              <span>{tag}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button onClick={onExploreApp} className="btn btn-navy">
            <span>Launch Dashboard Now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
