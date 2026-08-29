import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons.jsx';

export { Icon };
export const cx = (...args) => args.filter(Boolean).join(' ');

export function Card({ className = '', children, onClick }) {
  return (
    <div onClick={onClick} className={cx(
      'rounded-2xl border border-edge/60 bg-panel/70 backdrop-blur-sm',
      onClick && 'cursor-pointer lift',
      className,
    )}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, sub, action }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-base font-bold tracking-tight text-mist-50">{title}</h2>
        {sub && <p className="mt-0.5 text-xs text-mist-400">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-500/10 text-brand-300',
    rose: 'bg-rose-500/10 text-rose-300',
    amber: 'bg-amber-400/10 text-amber-300',
    violet: 'bg-violet-500/10 text-violet-300',
    sky: 'bg-sky-500/10 text-sky-300',
  };
  return (
    <Card className="p-4 glow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-mist-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-mist-50">{value}</p>
          {sub && <p className="mt-1 text-[11px] text-mist-500">{sub}</p>}
        </div>
        <span className={cx('grid size-9 shrink-0 place-items-center rounded-xl', tones[tone])}>
          <Icon name={icon} size={18} />
        </span>
      </div>
    </Card>
  );
}

const VERDICT_STYLES = {
  Verified: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  Suspicious: 'bg-amber-400/15 text-amber-300 ring-amber-400/30',
  'High-Risk': 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  Critical: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  High: 'bg-orange-500/15 text-orange-300 ring-orange-500/30',
  Medium: 'bg-amber-400/15 text-amber-300 ring-amber-400/30',
  Low: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  Manageable: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  Expired: 'bg-mist-700 text-mist-300 ring-mist-600',
  Registered: 'bg-brand-500/15 text-brand-300 ring-brand-500/30',
  'In transit': 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  Delivered: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  Proposed: 'bg-mist-700 text-mist-300 ring-mist-600',
  Accepted: 'bg-brand-500/15 text-brand-300 ring-brand-500/30',
};
export function Pill({ label, className = '' }) {
  const base = cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ring-1', VERDICT_STYLES[label] || 'bg-mist-700 text-mist-300 ring-mist-600', className);
  return <span className={base}>{label}</span>;
}

export function ScoreBar({ score, tone = 'auto', h = 'h-2', showLabel = true }) {
  const toneMap = { auto: score >= 70 ? 'bg-rose-500' : score >= 40 ? 'bg-amber-400' : 'bg-emerald-500', rose: 'bg-rose-500', amber: 'bg-amber-400', emerald: 'bg-emerald-500' };
  return (
    <div className="flex items-center gap-2">
      <div className={cx('w-full overflow-hidden rounded-full bg-mist-700/40', h)}>
        <div className={cx('h-full rounded-full transition-all', toneMap[tone])} style={{ width: `${Math.max(3, Math.min(100, score))}%` }} />
      </div>
      {showLabel && <span className="w-8 shrink-0 text-right text-xs font-bold tabular-nums text-mist-200">{score}</span>}
    </div>
  );
}

export function Chip({ icon, children, onClick, active, className = '' }) {
  return (
    <button onClick={onClick} className={cx(
      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-wide transition',
      active ? 'border-brand-400/50 bg-brand-500/20 text-brand-300' : 'border-edge bg-panel2 text-mist-300 hover:border-brand-400/40 hover:text-brand-300',
      className,
    )}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </button>
  );
}

export function Button({ children, onClick, variant = 'primary', icon, size = 'md', full, disabled, className = '', type = 'button' }) {
  const v = {
    primary: 'bg-brand-500 text-void hover:bg-brand-400 disabled:opacity-40',
    soft: 'bg-brand-500/15 text-brand-300 hover:bg-brand-500/25 ring-1 ring-inset ring-brand-500/30',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-40',
    ghost: 'bg-panel2 text-mist-200 ring-1 ring-inset ring-edge hover:bg-edge',
  }[variant];
  const s = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-5 py-3 text-sm' : 'px-4 py-2.5 text-sm';
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cx(
      'inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-wide transition active:scale-[.98] disabled:cursor-not-allowed',
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
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-mist-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10px] text-mist-500">{hint}</span>}
    </label>
  );
}

export const inputCls = 'w-full rounded-xl border border-edge bg-panel2 px-3.5 py-2.5 text-sm text-mist-100 outline-none transition placeholder:text-mist-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15';

export function Drawer({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-void/70 backdrop-blur-[3px]" onClick={onClose} />
      <div className={cx('animate-fade-up absolute inset-y-0 right-0 flex w-full flex-col border-l border-edge bg-panel shadow-2xl', wide ? 'sm:max-w-xl' : 'sm:max-w-md')}>
        <div className="flex items-center justify-between border-b border-edge px-5 py-4">
          <h3 className="text-sm font-bold text-mist-50">{title}</h3>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-mist-400 hover:bg-edge hover:text-mist-100 transition"><Icon name="x" size={15} /></button>
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
      <div className="absolute inset-0 bg-void/70 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-edge bg-panel p-5 shadow-2xl animate-fade-up">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-mist-50">{title}</h3>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-mist-400 hover:bg-edge transition"><Icon name="x" size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, sub }) {
  return (
    <div className="grid place-items-center gap-2 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-panel2 text-mist-500"><Icon name={icon} size={22} /></span>
      <p className="text-sm font-bold text-mist-200">{title}</p>
      {sub && <p className="max-w-xs text-xs text-mist-500">{sub}</p>}
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
    <div ref={ref} className={cx('reveal', inView && 'in', className)} style={{ transitionDelay: `${delay}ms` }}>
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
