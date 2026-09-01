import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Icon, cx } from './ui.jsx';
import { useState } from 'react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'home', group: 'main' },
  { to: '/verify', label: 'Verify', icon: 'scan', group: 'main' },
  { to: '/inventory', label: 'Inventory', icon: 'box', group: 'main' },
  { to: '/catalog', label: 'Catalog', icon: 'beaker', group: 'operations' },
  { to: '/requirements', label: 'Requirements', icon: 'alert', group: 'operations' },
  { to: '/emergency', label: 'Emergency', icon: 'truck', group: 'operations' },
  { to: '/match', label: 'Redistribution', icon: 'arrows', group: 'operations' },
  { to: '/qr', label: 'QR Studio', icon: 'qricon', group: 'tools', mfg: true },
  { to: '/audits', label: 'Audit Trail', icon: 'audit', group: 'tools' },
];

const NAV_GROUPS = [
  { id: 'main', label: 'Overview' },
  { id: 'operations', label: 'Operations' },
  { id: 'tools', label: 'Tools' },
];

function PharmSecureLogo() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldGrad" x1="9" y1="9" x2="29" y2="29">
          <stop offset="0%" stopColor="#93c5fd"/>
          <stop offset="100%" stopColor="#3b82f6"/>
        </linearGradient>
        <linearGradient id="crossGrad" x1="17" y1="12" x2="21" y2="26">
          <stop offset="0%" stopColor="#93c5fd"/>
          <stop offset="100%" stopColor="#60a5fa"/>
        </linearGradient>
      </defs>
      <rect width="38" height="38" rx="10" fill="#0d1219" stroke="#1e2a3a" strokeWidth="1"/>
      <path d="M19 8L28 13V21C28 25.5 24 29 19 30C14 29 10 25.5 10 21V13L19 8Z" fill="url(#shieldGrad)" fillOpacity="0.15" stroke="url(#shieldGrad)" strokeWidth="1.5"/>
      <path d="M17 17H21M19 15V19" stroke="url(#crossGrad)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function NavItem({ n }) {
  return (
    <NavLink to={n.to} end={n.to === '/'}
      className={({ isActive }) => cx(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-200',
        isActive
          ? 'bg-gradient-to-r from-brand-500/15 to-brand-500/5 text-brand-300 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]'
          : 'text-mist-400 hover:text-mist-200 hover:bg-white/[0.03]',
      )}>
      {({ isActive }) => (
        <>
          {/* Active left accent */}
          <div className={cx(
            'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full transition-all duration-300',
            isActive ? 'bg-brand-400 opacity-100' : 'bg-transparent opacity-0',
          )} />
          {/* Icon container */}
          <div className={cx(
            'grid size-8 place-items-center rounded-lg transition-all duration-200',
            isActive
              ? 'bg-brand-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
              : 'bg-white/[0.02] border border-white/[0.04] group-hover:bg-white/[0.05] group-hover:border-white/[0.08]',
          )}>
            <Icon name={n.icon} size={15} className={isActive ? 'text-brand-400' : 'text-mist-500 group-hover:text-mist-300'} />
          </div>
          <span className="tracking-wide">{n.label}</span>
          {/* Hover arrow */}
          <Icon name="chevron-right" size={12} className={cx(
            'ml-auto transition-all duration-200',
            isActive ? 'text-brand-400/60 opacity-100' : 'text-mist-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5',
          )} />
        </>
      )}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { account, org, logout, can } = useStore();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = NAV.filter((n) => !n.mfg || can?.qr);
  const grouped = NAV_GROUPS.map(g => ({
    ...g,
    items: links.filter(n => n.group === g.id),
  })).filter(g => g.items.length > 0);

  return (
    <div className="min-h-screen bg-medical-pattern">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col lg:flex">
        {/* Background panel with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-panel via-panel to-panel/95 border-r border-edge/50" />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

        <div className="relative flex flex-col h-full">
          {/* ── Logo Area ── */}
          <div className="px-5 py-5 border-b border-edge/40">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-brand-500/10 rounded-xl blur-md" />
                <div className="relative">
                  <PharmSecureLogo />
                </div>
              </div>
              <div>
                <p className="text-[13px] font-bold text-mist-50 tracking-tight">
                  Pharm<span className="text-brand-400">Secure</span>
                </p>
                <p className="text-[9px] text-mist-600 tracking-wider uppercase">Supply Chain Integrity</p>
              </div>
            </div>
          </div>

          {/* ── Navigation ── */}
          <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
            {grouped.map((group) => (
              <div key={group.id}>
                <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-mist-600">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map((n) => (
                    <NavItem key={n.to} n={n} />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* ── User Card ── */}
          <div className="relative px-3 pb-4">
            <div className="relative rounded-2xl overflow-hidden">
              {/* Card background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.05] rounded-2xl" />
              <div className="relative p-4">
                <div className="flex items-center gap-3">
                  {/* Avatar with status ring */}
                  <div className="relative">
                    <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-brand-400/30 to-brand-600/20" />
                    <div className="relative grid size-9 place-items-center rounded-[10px] bg-panel text-[11px] font-bold text-brand-300">
                      {account?.initials}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-panel" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-mist-100">{account?.name}</p>
                    <p className="truncate text-[10px] text-mist-500">{account?.title}</p>
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => nav('/audits')} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] px-2.5 py-2 text-[10px] font-semibold text-mist-300 hover:bg-white/[0.07] hover:text-mist-100 transition-all duration-200">
                    <Icon name="audit" size={12} />
                    Audit
                  </button>
                  <button onClick={logout} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] px-2.5 py-2 text-[10px] font-semibold text-mist-400 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/20 transition-all duration-200">
                    <Icon name="logout" size={12} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-edge/50 bg-panel/80 backdrop-blur-xl px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <PharmSecureLogo />
          <p className="text-sm font-bold text-mist-50">Pharm<span className="text-brand-400">Secure</span></p>
        </div>
        <button onClick={() => setMenuOpen(true)} className="grid size-9 place-items-center rounded-xl text-mist-300 hover:bg-white/[0.05] transition">
          <Icon name="menu" size={19} />
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-72 border-l border-edge/50 bg-panel/95 backdrop-blur-2xl p-5 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <PharmSecureLogo />
                <p className="text-sm font-bold text-mist-50">Pharm<span className="text-brand-400">Secure</span></p>
              </div>
              <button onClick={() => setMenuOpen(false)} className="grid size-8 place-items-center rounded-xl text-mist-400 hover:bg-white/[0.05] transition">
                <Icon name="x" size={15} />
              </button>
            </div>

            {/* User card */}
            <div className="relative rounded-2xl overflow-hidden mb-5">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] rounded-2xl" />
              <div className="relative p-3.5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-brand-400/30 to-brand-600/20" />
                    <div className="relative grid size-9 place-items-center rounded-[10px] bg-panel text-[11px] font-bold text-brand-300">{account?.initials}</div>
                  </div>
                  <div className="leading-tight">
                    <p className="text-[12px] font-semibold text-mist-100">{account?.name}</p>
                    <p className="text-[10px] text-mist-500">{account?.role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <div className="space-y-4">
              {grouped.map((group) => (
                <div key={group.id}>
                  <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-mist-600">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map((n) => (
                      <NavLink key={n.to} to={n.to} end={n.to === '/'}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) => cx(
                          'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200',
                          isActive ? 'bg-brand-500/15 text-brand-300' : 'text-mist-400 hover:text-mist-200 hover:bg-white/[0.03]',
                        )}>
                        <Icon name={n.icon} size={16} />
                        {n.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-edge/40">
              <button onClick={logout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-rose-300 hover:bg-rose-500/10 transition">
                <Icon name="logout" size={16} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-24 pt-5 sm:px-6 lg:pb-10 lg:pl-[276px] lg:pr-8 lg:pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 hidden items-center justify-between lg:flex">
            <div>
              <h1 className="text-lg font-semibold text-mist-50">
                {account?.name.split(' ')[0]}, <span className="text-brand-400">{org?.name}</span>
              </h1>
              <p className="text-[11px] text-mist-500">
                {org?.type} · {org?.city} · role: {account?.role.toLowerCase()}
              </p>
            </div>
          </div>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-edge/50 bg-panel/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] lg:hidden">
        {links.slice(0, 5).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}
            className={({ isActive }) => cx(
              'flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-brand-400' : 'text-mist-500',
            )}>
            <Icon name={n.icon} size={18} />
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
