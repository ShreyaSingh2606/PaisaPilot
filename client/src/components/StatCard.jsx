import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  variant = 'neutral', // emerald, navy, danger, warning, neutral
  badge,
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return {
          iconBg: 'rgba(16, 185, 129, 0.12)',
          iconColor: '#10B981',
          borderAccent: '#10B981',
        };
      case 'navy':
        return {
          iconBg: 'rgba(11, 19, 43, 0.08)',
          iconColor: '#0B132B',
          borderAccent: '#1C2541',
        };
      case 'warning':
        return {
          iconBg: 'rgba(245, 158, 11, 0.12)',
          iconColor: '#D97706',
          borderAccent: '#F59E0B',
        };
      case 'danger':
        return {
          iconBg: 'rgba(239, 68, 68, 0.12)',
          iconColor: '#EF4444',
          borderAccent: '#EF4444',
        };
      default:
        return {
          iconBg: '#F1F5F9',
          iconColor: '#475569',
          borderAccent: '#E2E8F0',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
            {value}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: styles.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: styles.iconColor,
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
        {change !== undefined && change !== null ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', fontWeight: 600 }}>
            {change > 0 ? (
              <span style={{ color: variant === 'danger' ? 'var(--color-danger)' : 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <TrendingUp size={14} /> +{change}%
              </span>
            ) : change < 0 ? (
              <span style={{ color: variant === 'danger' ? 'var(--color-success)' : 'var(--color-danger)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <TrendingDown size={14} /> {change}%
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <Minus size={14} /> 0%
              </span>
            )}
            <span style={{ color: 'var(--text-light)', fontWeight: 400, marginLeft: '4px' }}>vs last month</span>
          </div>
        ) : (
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{subtitle}</span>
        )}

        {badge && (
          <span className={`badge badge-${badge.type || 'neutral'}`}>
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
}
