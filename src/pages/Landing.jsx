import { useEffect, useState } from 'react';
import { useStore, ACCOUNTS } from '../store.jsx';
import { Icon, cx, AnimatedNumber, Reveal } from '../components/ui.jsx';
import CapsuleLogo from '../components/CapsuleLogo.jsx';

function BrandMark({ size = 64 }) {
  return (
    <span className="relative grid place-items-center" style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-2xl bg-brand-500/20 blur-xl animate-floata" />
      <span className="relative grid place-items-center rounded-2xl bg-gradient-to-br from-brand-400/10 to-brand-500/10 shadow-[0_0_36px_-4px_rgba(34,211,238,.65)]"
        style={{ width: size * 0.72, height: size * 0.72 }}>
        <CapsuleLogo size={size * 0.6} />
      </span>
    </span>
  );
}

function LiveScanVisual() {
  const steps = [
    { t: 'Counterfeits flagged', n: 1240, s: 'Ledger-checks today', c: 'text-rose-300' },
    { t: 'Tablets rescued', n: 44800, s: 'Across partner network', c: 'text-brand-300' },
    { t: 'Facilities connected', n: 320, s: 'Hospitals · clinics · NGOs', c: 'text-emerald-300' },
  ];
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-edge/50 bg-panel2/60 p-2 glow">
        <svg className="h-full w-full" viewBox="0 0 240 240" fill="none">
          <circle cx="120" cy="120" r="112" stroke="rgba(34,211,238,.12)" strokeWidth="1" strokeDasharray="3 5" />
          <path d="M20 40 H220" stroke="rgba(34,211,238,.1)" strokeWidth="1" />
          <path d="M20 200 H220" stroke="rgba(34,211,238,.1)" strokeWidth="1" />
          <circle cx="120" cy="120" r="6" fill="#22d3ee" />
          {[
            { x: 46, y: 60, r: 16, o: 0 }, { x: 200, y: 52, r: 22, o: 2 }, { x: 190, y: 120, r: 14, o: 1 },
            { x: 210, y: 168, r: 20, o: 3 }, { x: 64, y: 184, r: 18, o: 4 }, { x: 120, y: 40, r: 12, o: 5 },
          ].map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={i === 1 ? '#fb7185' : 'rgba(34,211,238,.22)'} style={{ animation: `floatY ${6 + n.o}s ease-in-out infinite` }} />
          ))}
          <line x1="120" y1="120" x2="46" y2="60" stroke="rgba(34,211,238,.15)" strokeWidth="1" />
          <line x1="120" y1="120" x2="200" y2="52" stroke="rgba(248,113,113,.25)" strokeWidth="1" strokeDasharray="2 3" />
          <line x1="120" y1="120" x2="190" y2="120" stroke="rgba(34,211,238,.15)" strokeWidth="1" />
          <line x1="120" y1="120" x2="210" y2="168" stroke="rgba(34,211,238,.15)" strokeWidth="1" />
          <line x1="120" y1="120" x2="64" y2="184" stroke="rgba(34,211,238,.15)" strokeWidth="1" />
          <circle cx="200" cy="52" r="34" stroke="rgba(248,113,113,.4)" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>
        <div className="scanline" />
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-emerald-500/25 bg-void/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-live" /> Live scan
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {steps.map((s, i) => (
          <div key={s.t} className="animate-fade-up flex items-center justify-between rounded-2xl border border-edge/50 bg-panel/60 px-4 py-3 backdrop-blur-sm"
            style={{ animationDelay: `${400 + i * 140}ms` }}>
            <div className="text-xs text-mist-400">
              <p className="font-bold text-mist-100 tracking-wide">{s.t}</p>
              <p className="text-[10px] text-mist-400">{s.s}</p>
            </div>
            <span className={cx('text-2xl font-bold tabular-nums', s.c)}><AnimatedNumber value={s.n} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PILLARS = [
  { icon: 'scan', title: 'Verify in seconds', desc: 'Scan the QR on any pack. An explainable risk score tells you if it is genuine, cloned or counterfeited — with the exact evidence behind it.' },
  { icon: 'arrows', title: 'Rescue surplus', desc: 'Near-expiry stock is matched to nearby clinics and NGOs before it expires. Zero waste, lives saved.' },
  { icon: 'audit', title: 'Immutable audit trail', desc: 'Every scan, transfer and hand-off is recorded with chain of custody — compliance-ready in one export.' },
  { icon: 'qricon', title: 'Manufacturer QR studio', desc: 'Mint scannable batch identities straight from the factory and watch them flow through the network.' },
];

export default function Landing() {
  const { login } = useStore();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'PharmSecure — Verify · Rescue · Connect'; }, []);

  const choose = async (acc) => {
    setBusy(acc.id); setError('');
    try { await login(acc.id, 'pharmsecure123'); }
    catch (e) { setError(e.message); }
    finally { setBusy(''); }
  };

  return (
    <div className="relative min-h-screen">
      <div className="aurora" />
      <div className="grid-overlay" />

      <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <BrandMark size={34} />
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-mist-50">Pharm<span className="text-brand-300">Secure</span></p>
            <p className="text-[10px] font-semibold text-mist-400 tracking-wide">Verify · Rescue · Connect</p>
          </div>
        </div>
        <button onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
          className="rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-2 text-sm font-bold text-brand-300 transition hover:bg-brand-500/20 glow-sm">
          Enter the network →
        </button>
      </header>

      <section className="relative z-10 grid items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-6 lg:py-16">
        <div className="max-w-xl">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-edge/60 bg-panel/50 px-3 py-1 text-[11px] font-bold text-mist-300 tracking-wide backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-rose-400 animate-live" />
            320M counterfeit medicines trade yearly — we can stop them
          </div>

          <h1 className="animate-fade-up mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-[3.5rem]" style={{ animationDelay: '60ms' }}>
            <span className="text-mist-50">Scan a box.</span><br />
            <span className="text-gradient">Know it's real.</span><br />
            <span className="text-mist-50">Rescue what's left.</span>
          </h1>

          <p className="animate-fade-up mt-5 max-w-md text-base leading-relaxed text-mist-300" style={{ animationDelay: '140ms' }}>
            PharmSecure connects manufacturers, hospitals, clinics and NGOs on one trusted ledger — counterfeits get flagged in one scan, and near-expiry medicine is matched to the people who need it before it goes to waste.
          </p>

          <div className="animate-fade-up mt-7 flex flex-wrap items-center gap-3" style={{ animationDelay: '220ms' }}>
            <button onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-shine rounded-2xl bg-gradient-to-r from-brand-400 to-brand-500 px-7 py-3.5 text-sm font-black tracking-wide text-void shadow-[0_0_28px_-4px_rgba(34,211,238,.55)] transition hover:brightness-110">
              Launch the live demo
            </button>
            <a href="#how" className="rounded-2xl border border-edge/60 bg-panel/50 px-6 py-3.5 text-sm font-bold text-mist-200 tracking-wide transition hover:border-brand-400/40 hover:text-brand-300">
              How it works
            </a>
          </div>

          <div className="animate-fade-up mt-8 flex gap-8" style={{ animationDelay: '300ms' }}>
            {[['1240+', 'counterfeits flagged'], ['44.8k', 'tablets rescued'], ['320', 'facilities']].map(([n, l]) => (
              <div key={l}>
                <p className="text-2xl font-black text-brand-300">{n}</p>
                <p className="text-xs text-mist-400 tracking-wide">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '180ms' }}>
          <LiveScanVisual />
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <h2 className="text-center text-2xl font-black tracking-tight text-mist-50 sm:text-3xl">One ledger. Four superpowers.</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-mist-300">Purpose-built for the last mile of Indian pharma distribution.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <div className="rounded-2xl border border-edge/50 bg-panel/60 p-5 backdrop-blur-sm lift">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/25"><Icon name={p.icon} size={19} /></span>
                <h3 className="mt-4 text-base font-bold text-mist-50 tracking-wide">{p.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-mist-300">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="roles" className="relative z-10 mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <div className="rounded-3xl border border-edge/50 bg-panel/60 p-6 backdrop-blur-md glow sm:p-8">
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight text-mist-50">Demo in 4 roles</h2>
            <p className="mt-1 text-sm text-mist-300">Each account lands on the same live ledger — pick who you are today.</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ACCOUNTS.map((a, i) => (
              <Reveal key={a.id} delay={i * 60}>
                <button onClick={() => choose(a)} disabled={!!busy}
                  className="group flex flex-col items-center rounded-2xl border border-edge/50 bg-panel2/50 p-5 text-center transition hover:-translate-y-1 hover:border-brand-400/50 hover:bg-panel2">
                  <span className="grid size-12 place-items-center rounded-full bg-brand-500/20 text-sm font-black text-brand-300 ring-1 ring-brand-500/25">{a.initials}</span>
                  <p className="mt-3 text-sm font-bold text-mist-50 tracking-wide">{a.name}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-300">{a.role}</p>
                  <p className="mt-1 text-[11px] text-mist-400">{a.title}</p>
                  <span className="mt-3 text-[11px] font-bold text-mist-400 group-hover:text-brand-300 transition">
                    {busy === a.id ? 'Signing in…' : 'Enter →'}
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
          {error && <p className="mt-4 text-center text-sm text-rose-300">{error}</p>}
        </div>
      </section>

      <footer className="relative z-10 border-t border-edge/50 px-6 py-8 text-center text-xs text-mist-400 tracking-wide">
        PharmSecure · Team Coders · CoBuild 1.0 · Built on a real SQLite ledger you can scan against
      </footer>
    </div>
  );
}
