import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Icon, cx } from './ui.jsx';
import { useState } from 'react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'home' },
  { to: '/verify', label: 'Verify', icon: 'scan' },
  { to: '/inventory', label: 'Inventory', icon: 'box' },
  { to: '/match', label: 'Redistribution', icon: 'arrows' },
  { to: '/qr', label: 'QR Studio', icon: 'qricon', mfg: true },
  { to: '/audits', label: 'Audit Trail', icon: 'audit' },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-500 text-void shadow-[0_0_16px_-2px_rgba(34,211,238,.5)]">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M12 3v18M3 12h18" />
        </svg>
      </span>
      <div className="leading-tight">
        <p className="text-sm font-bold tracking-tight text-mist-50">
          Pharm<span className="text-brand-300">Secure</span>
        </p>
        <p className="text-[10px] font-semibold text-mist-500 tracking-wide">Verify · Rescue · Connect</p>
      </div>
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
      <span className="relative size-1.5 rounded-full bg-emerald-400"><span className="absolute inset-0 rounded-full bg-emerald-400 ping-dot" /></span>
      Live ledger
    </span>
  );
}

export default function Layout({ children }) {
  const { account, org, logout, can } = useStore();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = NAV.filter((n) => !n.mfg || can?.qr);

  return (
    <div className="relative min-h-screen">
      <div className="aurora" />
      <div className="grid-overlay" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-edge/50 bg-panel/60 px-4 py-5 backdrop-blur-xl lg:flex">
        <Brand />
        <nav className="mt-7 flex flex-1 flex-col gap-1">
          {links.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}
              className={({ isActive }) => cx(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold tracking-wide transition',
                isActive
                  ? 'bg-brand-500/15 text-brand-300 ring-1 ring-inset ring-brand-500/25 glow-sm'
                  : 'text-mist-400 hover:bg-panel2 hover:text-mist-100',
              )}>
              <Icon name={n.icon} size={16} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 rounded-2xl border border-edge/60 bg-panel2/60 p-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300 ring-1 ring-brand-500/25">{account?.initials}</span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-bold text-mist-100">{account?.name}</p>
              <p className="truncate text-[11px] text-mist-500">{account?.title}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => nav('/audits')} className="flex-1 rounded-lg bg-panel/60 px-2 py-1.5 text-[11px] font-bold text-brand-300 ring-1 ring-inset ring-brand-500/25 hover:bg-brand-500/10 transition"><Icon name="audit" size={11} />&nbsp;Audit</button>
            <button onClick={logout} className="flex-1 rounded-lg bg-panel/60 px-2 py-1.5 text-[11px] font-bold text-mist-300 ring-1 ring-inset ring-edge hover:bg-edge transition"><Icon name="logout" size={11} />&nbsp;Logout</button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-edge/50 bg-panel/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <LiveBadge />
          <button onClick={() => setMenuOpen(true)} className="grid size-9 place-items-center rounded-xl text-mist-300 hover:bg-panel2 transition">
            <Icon name="menu" size={19} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-void/70 backdrop-blur-[2px]" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-72 border-l border-edge bg-panel p-5 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setMenuOpen(false)} className="grid size-8 place-items-center rounded-lg text-mist-400 hover:bg-edge transition"><Icon name="x" size={15} /></button>
            </div>
            <div className="mt-6 rounded-xl border border-edge/60 bg-panel2/60 px-3 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300">{account?.initials}</span>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-mist-100">{account?.name}</p>
                  <p className="text-[11px] text-mist-500">{account?.role}</p>
                </div>
              </div>
            </div>
            <nav className="mt-4 flex flex-col gap-1">
              {links.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => cx(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold tracking-wide transition',
                    isActive ? 'bg-brand-500/15 text-brand-300 ring-1 ring-inset ring-brand-500/25' : 'text-mist-300 hover:bg-panel2',
                  )}>
                  <Icon name={n.icon} size={16} />{n.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 border-t border-edge pt-4">
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-300 hover:bg-rose-500/10 transition">
                <Icon name="logout" size={16} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 px-4 pb-24 pt-5 sm:px-6 lg:pb-10 lg:pl-[280px] lg:pr-8 lg:pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 hidden items-center justify-between lg:flex">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-mist-50">
                {account?.name.split(' ')[0]}, <span className="text-brand-300">{org?.name}</span>
              </h1>
              <p className="text-xs text-mist-500 tracking-wide">
                {org?.type} · {org?.city} · role: {account?.role.toLowerCase()}
              </p>
            </div>
            <LiveBadge />
          </div>
          {children}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-edge/50 bg-panel/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {links.slice(0, 5).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}
            className={({ isActive }) => cx(
              'flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold tracking-wide transition',
              isActive ? 'text-brand-300' : 'text-mist-500',
            )}>
            <Icon name={n.icon} size={18} />
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
