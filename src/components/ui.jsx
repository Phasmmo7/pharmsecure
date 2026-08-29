import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons.jsx';

export { Icon };
export const cx = (...args) => args.filter(Boolean).join(' ');

export function Card({ className = '', children, onClick }) {
  return (
    <div onClick={onClick} className={cx(
      'border bg-surface-panel',
      onClick && 'cursor-pointer hover:bg-surface-high transition-colors',
      className,
    )}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, sub, action }) {
  return (
    <div className="mb-4">
      <div className="double-header pb-2">
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-text-secondary">{title}</h2>
      </div>
      {sub && <p className="mt-2 text-xs text-on-surface-variant">{sub}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, tone = 'brand' }) {
  const tones = {
    brand: 'text-primary',
    rose: 'text-error',
    amber: 'text-tertiary',
    violet: 'text-[#c1c4e5]',
    sky: 'text-primary-fixed-dim',
  };
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-text-secondary">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-on-surface">{value}</p>
          {sub && <p className="mt-1 text-[11px] text-on-surface-variant">{sub}</p>}
        </div>
        <span className={cx('grid size-9 shrink-0 place-items-center border border-border-low bg-surface-high', tones[tone])}>
          <Icon name={icon} size={18} />
        </span>
      </div>
    </Card>
  );
}

const VERDICT_STYLES = {
  Verified: 'border-primary text-primary',
  Suspicious: 'border-tertiary text-tertiary',
  'High-Risk': 'border-error text-error',
  Critical: 'border-error text-error',
  High: 'border-secondary text-secondary',
  Medium: 'border-tertiary text-tertiary',
  Low: 'border-primary text-primary',
  Manageable: 'border-primary text-primary',
  Expired: 'border-outline text-outline',
  Registered: 'border-primary text-primary',
  'In transit': 'border-primary-fixed-dim text-primary-fixed-dim',
  Delivered: 'border-primary text-primary',
  Proposed: 'border-outline text-outline',
  Accepted: 'border-primary text-primary',
  Optimal: 'border-primary text-primary',
  Warning: 'border-secondary text-secondary',
  'Restock needed': 'border-tertiary text-tertiary',
};
export function Pill({ label, className = '' }) {
  const base = cx('stamp', VERDICT_STYLES[label] || 'border-outline text-outline', className);
  return <span className={base}>{label}</span>;
}

export function ScoreBar({ score, tone = 'auto', h = 'h-1.5', showLabel = true }) {
  const toneMap = { auto: score >= 70 ? 'bg-error' : score >= 40 ? 'bg-tertiary' : 'bg-primary', rose: 'bg-error', amber: 'bg-tertiary', emerald: 'bg-primary' };
  return (
    <div className="flex items-center gap-2">
      <div className={cx('w-full overflow-hidden bg-border-low', h)}>
        <div className={cx('h-full transition-all', toneMap[tone])} style={{ width: `${Math.max(3, Math.min(100, score))}%` }} />
      </div>
      {showLabel && <span className="w-8 shrink-0 text-right font-mono text-xs tabular-nums text-on-surface">{score}</span>}
    </div>
  );
}

export function Chip({ icon, children, onClick, active, className = '' }) {
  return (
    <button onClick={onClick} className={cx(
      'inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] transition',
      active ? 'border-primary bg-primary-container/20 text-primary' : 'border-border-low bg-surface text-text-secondary hover:border-primary hover:text-primary',
      className,
    )}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </button>
  );
}

export function Button({ children, onClick, variant = 'primary', icon, size = 'md', full, disabled, className = '', type = 'button' }) {
  const v = {
    primary: 'bg-primary-container text-on-primary hover:bg-on-primary-container disabled:opacity-40',
    soft: 'border border-primary bg-surface text-primary hover:bg-primary-container/20',
    danger: 'bg-secondary-container text-on-secondary hover:bg-error-container disabled:opacity-40',
    ghost: 'border border-border-low bg-surface text-text-secondary hover:text-on-surface hover:border-text-secondary',
  }[variant];
  const s = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-5 py-3 text-sm' : 'px-4 py-2.5 text-sm';
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cx(
      'inline-flex items-center justify-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.1em] transition disabled:cursor-not-allowed',
      v, s, full && 'w-full', className,
    )}>
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-on-surface-variant">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10px] text-text-secondary">{hint}</span>}
    </label>
  );
}

export const inputCls = 'bureaucratic-input';

export function Drawer({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-surface/80" onClick={onClose} />
      <div className={cx('absolute inset-y-0 right-0 flex w-full flex-col border-l border-border-low bg-surface-panel', wide ? 'sm:max-w-xl' : 'sm:max-w-md')}>
        <div className="flex items-center justify-between border-b border-border-low px-5 py-4">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-on-surface">{title}</h3>
          <button onClick={onClose} className="grid size-8 place-items-center text-text-secondary hover:text-on-surface transition"><Icon name="x" size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-surface/80" onClick={onClose} />
      <div className="relative w-full max-w-md border border-border-low bg-surface-panel p-5 animate-fade-up">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-on-surface">{title}</h3>
          <button onClick={onClose} className="grid size-8 place-items-center text-text-secondary hover:text-on-surface transition"><Icon name="x" size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, sub }) {
  return (
    <div className="grid place-items-center gap-2 py-10 text-center">
      <span className="grid size-12 place-items-center border border-border-low bg-surface text-text-secondary"><Icon name={icon} size={22} /></span>
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">{title}</p>
      {sub && <p className="max-w-xs text-xs text-text-secondary">{sub}</p>}
    </div>
  );
}

export function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={cx('animate-fade-up', inView && 'opacity-100', className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function AnimatedNumber({ value, className = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const dur = 1100;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref} className={className}>{display}</span>;
}

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function fmtNum(n) {
  return new Intl.NumberFormat('en-IN').format(n || 0);
}
