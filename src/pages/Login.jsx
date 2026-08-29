import { useStore, ACCOUNTS } from '../store.jsx';
import { Icon } from '../components/icons.jsx';
import { cx } from '../components/ui.jsx';

const ROLE_META = {
  'Hospital Admin': { icon: 'box', tag: 'Sees the full ledger · redistributes surplus', tone: 'brand' },
  'Clinic Manager': { icon: 'scan', tag: 'Verifies deliveries · places emergency requests', tone: 'emerald' },
  'NGO Coordinator': { icon: 'handshake', tag: 'Requests & receives surplus medicines', tone: 'amber' },
  'Manufacturer · Quality Lead': { icon: 'qricon', tag: 'Issues unique batch identity (QR) codes', tone: 'violet' },
};

const toneBg = {
  brand: 'bg-brand-50 text-brand-800 ring-brand-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
};

export default function Login() {
  const { login } = useStore();

  return (
    <div className="min-h-screen bg-ink-100 lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-950 p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-brand-700/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-brand-500/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M3 12h18" /></svg>
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight">PharmSecure</p>
            <p className="text-xs text-brand-300">CoBuild 1.0 · Team Coders</p>
          </div>
        </div>

        <div className="relative">
          <p className="text-4xl font-bold leading-tight tracking-tight">
            Verify. Rescue.<br />Connect. Save lives.
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-200">
            One intelligence layer for two critical decisions — authenticating medicines against counterfeits,
            and rescuing genuine surplus before it expires.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              ['3.2%', 'CDSCO spurious samples (23–24)'],
              ['20–25%', 'Estimated fake rate in India'],
              ['1M+', 'Deaths linked to fakes (WHO)'],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <p className="text-xl font-bold text-brand-300">{v}</p>
                <p className="mt-1 text-[10px] leading-snug text-brand-200/80">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-[11px] text-brand-300">
            <Icon name="check" size={13} /> Live prototype · React + Tailwind · intelligence engine in-browser
          </div>
        </div>

        <p className="relative text-[11px] text-brand-300/70">Detect → Predict → Match → Act</p>
      </div>

      {/* right: role selection */}
      <div className="flex min-h-screen flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Demo access</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900">Choose an organization to continue</h1>
          <p className="mt-1.5 text-sm text-ink-500">Role-based sessions — pick who you want to demo as. Data resets anytime from the header.</p>

          <div className="mt-7 space-y-3">
            {ACCOUNTS.map((a) => {
              const meta = ROLE_META[a.role];
              return (
                <button key={a.id} onClick={() => login(a.id)}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-ink-200/70 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md">
                  <span className={cx('grid size-11 shrink-0 place-items-center rounded-xl ring-1', toneBg[meta.tone])}>
                    <Icon name={meta.icon} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink-900">{a.name}</span>
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-600">{a.role}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-500">{a.title}</span>
                    <span className="mt-1 block text-[11px] text-ink-400">{meta.tag}</span>
                  </span>
                  <Icon name="arrows" size={16} className="text-ink-300 transition group-hover:text-brand-600" />
                </button>
              );
            })}
          </div>

          <p className="mt-7 rounded-xl bg-ink-50 px-4 py-3 text-[11px] leading-relaxed text-ink-500 ring-1 ring-inset ring-ink-100">
            PharmSecure solves two connected crises — <b className="text-ink-700">counterfeit medicines</b> with no
            verification path and <b className="text-ink-700">near-expiry surplus</b> discarded while clinics face shortages.
            Log in as any role to explore the live prototype.
          </p>
        </div>
      </div>
    </div>
  );
}