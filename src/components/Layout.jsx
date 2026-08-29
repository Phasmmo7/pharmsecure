import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Icon, cx } from './ui.jsx';
import CapsuleLogo from './CapsuleLogo.jsx';
import { useState } from 'react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'home' },
  { to: '/verify', label: 'Verify', icon: 'scan' },
  { to: '/inventory', label: 'Inventory', icon: 'box' },
  { to: '/match', label: 'Matching', icon: 'arrows' },
  { to: '/qr', label: 'QR Studio', icon: 'qricon', mfg: true },
  { to: '/audits', label: 'Audit Trail', icon: 'audit' },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <CapsuleLogo size={32} />
      <div className="leading-tight">
        <p className="font-bold uppercase tracking-tighter text-primary">PharmSecure</p>
        <p className="font-mono text-[10px] text-text-secondary">Chain of Custody</p>
      </div>
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 border border-primary bg-primary-container/20 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-primary">
      <span className="relative size-1.5 bg-primary animate-live" />
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
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border-low bg-surface-panel px-4 py-5 lg:flex">
        <Brand />
        <div className="mt-1 font-mono text-[10px] text-text-secondary">Terminal ID: 882-QX</div>

        <nav className="mt-6 flex flex-1 flex-col gap-0.5">
          {links.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}
              className={({ isActive }) => cx(
                'flex items-center gap-3 border-l-2 px-3 py-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] transition',
                isActive
                  ? 'border-primary bg-primary-container/15 text-primary'
                  : 'border-transparent text-text-secondary hover:text-on-surface hover:bg-surface-high',
              )}>
              <Icon name={n.icon} size={16} />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border border-border-low bg-surface p-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center border border-border-low bg-surface-high font-mono text-[11px] font-bold text-primary">{account?.initials}</span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-bold text-on-surface">{account?.name}</p>
              <p className="truncate font-mono text-[10px] text-text-secondary">{account?.title}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => nav('/audits')} className="flex-1 border border-border-low bg-surface px-2 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-primary hover:bg-primary-container/15 transition"><Icon name="audit" size={11} />&nbsp;Audit</button>
            <button onClick={logout} className="flex-1 border border-border-low bg-surface px-2 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-secondary hover:text-error hover:border-error transition"><Icon name="logout" size={11} />&nbsp;Logout</button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border-low bg-surface-panel px-4 py-3 backdrop-blur-xl lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <LiveBadge />
          <button onClick={() => setMenuOpen(true)} className="grid size-9 place-items-center text-text-secondary hover:text-on-surface transition">
            <Icon name="menu" size={19} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-surface/80" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-72 border-l border-border-low bg-surface-panel p-5 animate-fade-up">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setMenuOpen(false)} className="grid size-8 place-items-center text-text-secondary hover:text-on-surface transition"><Icon name="x" size={15} /></button>
            </div>
            <div className="mt-6 border border-border-low bg-surface px-3 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center border border-border-low bg-surface-high font-mono text-[11px] font-bold text-primary">{account?.initials}</span>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-on-surface">{account?.name}</p>
                  <p className="font-mono text-[10px] text-text-secondary">{account?.role}</p>
                </div>
              </div>
            </div>
            <nav className="mt-4 flex flex-col gap-0.5">
              {links.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => cx(
                    'flex items-center gap-3 border-l-2 px-3 py-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] transition',
                    isActive ? 'border-primary bg-primary-container/15 text-primary' : 'border-transparent text-text-secondary hover:text-on-surface',
                  )}>
                  <Icon name={n.icon} size={16} />{n.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 border-t border-border-low pt-4">
              <button onClick={logout} className="flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-error hover:bg-secondary-container/15 transition">
                <Icon name="logout" size={16} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="relative z-10 px-4 pb-24 pt-5 sm:px-6 lg:pb-10 lg:pl-[260px] lg:pr-8 lg:pt-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 hidden items-center justify-between lg:flex">
            <div>
              <h1 className="text-lg font-bold uppercase tracking-tight text-on-surface">
                {account?.name.split(' ')[0]}, <span className="text-primary">{org?.name}</span>
              </h1>
              <p className="font-mono text-[11px] text-text-secondary">
                {org?.type} · {org?.city} · role: {account?.role.toLowerCase()}
              </p>
            </div>
            <LiveBadge />
          </div>
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border-low bg-surface-panel pb-[env(safe-area-inset-bottom)] lg:hidden">
        {links.slice(0, 5).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}
            className={({ isActive }) => cx(
              'flex flex-col items-center gap-1 py-2.5 text-[10px] font-mono font-medium uppercase tracking-[0.1em] transition',
              isActive ? 'text-primary' : 'text-text-secondary',
            )}>
            <Icon name={n.icon} size={18} />
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
