import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons.jsx';

export { Icon };
export const cx = (...args) => args.filter(Boolean).join(' ');

export function Card({ className = '', children, onClick }) {
  return (
    <div onClick={onClick} className={cx(
      'relative rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent',
      onClick && 'cursor-pointer hover:border-white/[0.1] hover:from-white/[0.05] transition-all duration-300',
      className,
    )}>
      <div className="relative bg-panel/80 backdrop-blur-sm rounded-2xl">
        {children}
      </div>
    </div>
  );
}

export function SectionTitle({ title, sub, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-base font-bold text-mist-50 tracking-tight">{title}</h2>
        {sub && <p className="mt-0.5 text-[11px] text-mist-400">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, tone = 'brand', index = 0 }) {
  const tones = {
    brand: { bg: 'from-brand-500/15 to-brand-500/5', icon: 'text-brand-400', glow: 'shadow-brand-500/10' },
    rose: { bg: 'from-rose-500/15 to-rose-500/5', icon: 'text-rose-400', glow: 'shadow-rose-500/10' },
    amber: { bg: 'from-amber-400/15 to-amber-400/5', icon: 'text-amber-400', glow: 'shadow-amber-400/10' },
    violet: { bg: 'from-violet-500/15 to-violet-500/5', icon: 'text-violet-400', glow: 'shadow-violet-500/10' },
    sky: { bg: 'from-sky-500/15 to-sky-500/5', icon: 'text-sky-400', glow: 'shadow-sky-500/10' },
  };
  const t = tones[tone] || tones.brand;
  return (
    <Card className="p-4 hover:shadow-lg hover:shadow-black/10 transition-all duration-300" >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-mist-500">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-mist-50">{value}</p>
          {sub && <p className="mt-1 text-[11px] text-mist-400">{sub}</p>}
        </div>
        <div className={cx('grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br', t.bg, 'shadow-lg', t.glow)}>
          <Icon name={icon} size={18} className={t.icon} />
        </div>
      </div>
    </Card>
  );
}

const VERDICT_STYLES = {
  Verified: 'bg-blue-500/12 text-blue-300 ring-blue-500/20',
  Suspicious: 'bg-amber-400/12 text-amber-300 ring-amber-400/20',
  'High-Risk': 'bg-rose-500/12 text-rose-300 ring-rose-500/20',
  Critical: 'bg-rose-500/12 text-rose-300 ring-rose-500/20',
  High: 'bg-orange-500/12 text-orange-300 ring-orange-500/20',
  Medium: 'bg-amber-400/12 text-amber-300 ring-amber-400/20',
  Low: 'bg-blue-500/12 text-blue-300 ring-blue-500/20',
  Manageable: 'bg-blue-500/12 text-blue-300 ring-blue-500/20',
  Expired: 'bg-mist-700 text-mist-300 ring-mist-600',
  Registered: 'bg-brand-500/12 text-brand-300 ring-brand-500/20',
  'In transit': 'bg-sky-500/12 text-sky-300 ring-sky-500/20',
  Delivered: 'bg-blue-500/12 text-blue-300 ring-blue-500/20',
  Proposed: 'bg-mist-700 text-mist-300 ring-mist-600',
  Accepted: 'bg-brand-500/12 text-brand-300 ring-brand-500/20',
  OK: 'bg-blue-500/12 text-blue-300 ring-blue-500/20',
  Surplus: 'bg-brand-500/12 text-brand-300 ring-brand-500/20',
};
export function Pill({ label, className = '' }) {
  const base = cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ring-1', VERDICT_STYLES[label] || 'bg-mist-700 text-mist-300 ring-mist-600', className);
  return <span className={base}>{label}</span>;
}

export function ScoreBar({ score, tone = 'auto', h = 'h-1.5', showLabel = true }) {
  const toneMap = { auto: score >= 70 ? 'bg-rose-500' : score >= 40 ? 'bg-amber-400' : 'bg-blue-500', rose: 'bg-rose-500', amber: 'bg-amber-400', emerald: 'bg-blue-500' };
  return (
    <div className="flex items-center gap-2">
      <div className={cx('w-full overflow-hidden rounded-full bg-mist-700/30', h)}>
        <div className={cx('h-full rounded-full transition-all duration-500 ease-out', toneMap[tone])} style={{ width: `${Math.max(3, Math.min(100, score))}%` }} />
      </div>
      {showLabel && <span className="w-8 shrink-0 text-right text-xs font-bold tabular-nums text-mist-200">{score}</span>}
    </div>
  );
}

export function Chip({ icon, children, onClick, active, className = '' }) {
  return (
    <button onClick={onClick} className={cx(
      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-wide transition-all duration-200',
      active ? 'border-brand-400/40 bg-brand-500/15 text-brand-300 shadow-[0_0_12px_rgba(59,130,246,0.15)]' : 'border-white/[0.06] bg-white/[0.03] text-mist-400 hover:border-white/[0.12] hover:text-brand-300 hover:bg-white/[0.05]',
      className,
    )}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </button>
  );
}

export function Button({ children, onClick, variant = 'primary', icon, size = 'md', full, disabled, className = '', type = 'button' }) {
  const v = {
    primary: 'bg-gradient-to-r from-brand-500 to-brand-400 text-void hover:from-brand-400 hover:to-brand-300 disabled:opacity-40 shadow-[0_2px_12px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.35)]',
    soft: 'bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 ring-1 ring-inset ring-brand-500/25',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-40',
    ghost: 'bg-white/[0.03] text-mist-300 ring-1 ring-inset ring-white/[0.06] hover:bg-white/[0.06] hover:ring-white/[0.1]',
  }[variant];
  const s = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-5 py-3 text-sm' : 'px-4 py-2.5 text-sm';
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cx(
      'inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-wide transition-all duration-200 active:scale-[.98] disabled:cursor-not-allowed',
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
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.15em] text-mist-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10px] text-mist-500">{hint}</span>}
    </label>
  );
}

export const inputCls = 'w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-mist-100 outline-none transition-all duration-200 placeholder:text-mist-500 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15 focus:bg-white/[0.05]';

export function Drawer({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={onClose} />
      <div className={cx('animate-fade-up absolute inset-y-0 right-0 flex w-full flex-col border-l border-white/[0.06] bg-panel/95 backdrop-blur-xl', wide ? 'sm:max-w-xl' : 'sm:max-w-md')}>
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h3 className="text-sm font-bold text-mist-50">{title}</h3>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-xl text-mist-400 hover:bg-white/[0.05] hover:text-mist-100 transition"><Icon name="x" size={15} /></button>
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
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-panel/95 backdrop-blur-xl p-5 animate-scale-in shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-mist-50">{title}</h3>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-xl text-mist-400 hover:bg-white/[0.05] transition"><Icon name="x" size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, sub }) {
  return (
    <div className="grid place-items-center gap-2 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.03] border border-white/[0.06] text-mist-500"><Icon name={icon} size={22} /></span>
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
    <div ref={ref} className={cx('opacity-0 transition-all duration-500', inView && 'opacity-100 translate-y-0', !inView && 'translate-y-4', className)} style={{ transitionDelay: `${delay}ms` }}>
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
