import { useStore, ACCOUNTS } from '../store.jsx';
import { Icon } from '../components/icons.jsx';
import { cx } from '../components/ui.jsx';
import CapsuleLogo from '../components/CapsuleLogo.jsx';

const ROLE_META = {
  'Hospital Admin': { icon: 'local_hospital', tag: 'Sees the full ledger · redistributes surplus', tone: 'brand' },
  'Clinic Manager': { icon: 'medical_services', tag: 'Verifies deliveries · places emergency requests', tone: 'emerald' },
  'NGO Coordinator': { icon: 'public', tag: 'Requests & receives surplus medicines', tone: 'amber' },
  'Manufacturer': { icon: 'prescriptions', tag: 'Issues unique batch identity (QR) codes', tone: 'violet' },
};

const toneBg = {
  brand: 'border-primary bg-primary-container/15 text-primary',
  emerald: 'border-primary bg-primary-container/15 text-primary',
  amber: 'border-tertiary bg-secondary-container/15 text-tertiary',
  violet: 'border-[#c1c4e5] bg-[#363a54]/15 text-[#c1c4e5]',
};

export default function Login() {
  const { login } = useStore();

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-surface-lowest p-10 text-on-surface border-r border-border-low lg:flex">
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-primary-container/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <CapsuleLogo size={38} />
          <div>
            <p className="text-lg font-bold uppercase tracking-tight text-primary">PharmSecure</p>
            <p className="font-mono text-xs text-on-surface-variant">CoBuild 1.0 · Team Coders</p>
          </div>
        </div>

        <div className="relative">
          <p className="text-4xl font-bold uppercase leading-tight tracking-tight">
            Verify. Rescue.<br />Connect. Save lives.
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-on-surface-variant">
            One intelligence layer for two critical decisions — authenticating medicines against counterfeits,
            and rescuing genuine surplus before it expires.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              ['3.2%', 'CDSCO spurious samples (23-24)'],
              ['20-25%', 'Estimated fake rate in India'],
              ['1M+', 'Deaths linked to fakes (WHO)'],
            ].map(([v, l]) => (
              <div key={l} className="border border-border-low bg-surface-panel p-3">
                <p className="text-xl font-bold text-primary">{v}</p>
                <p className="mt-1 font-mono text-[10px] leading-snug text-on-surface-variant">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 font-mono text-[11px] text-primary">
            <Icon name="check" size={13} /> Live prototype · React + Tailwind · intelligence engine in-browser
          </div>
        </div>

        <p className="relative font-mono text-[11px] text-on-surface-variant">Detect - Predict - Match - Act</p>
      </div>

      {/* right: role selection */}
      <div className="flex min-h-screen flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Demo Access</p>
          <h1 className="mt-2 text-2xl font-bold uppercase tracking-tight text-on-surface">Choose an organization to continue</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">Role-based sessions — pick who you want to demo as.</p>

          <div className="mt-7 space-y-3">
            {ACCOUNTS.map((a) => {
              const meta = ROLE_META[a.role];
              return (
                <button key={a.id} onClick={() => login(a.id)}
                  className="group flex w-full items-center gap-4 border border-border-low bg-surface-panel p-4 text-left transition hover:border-primary hover:bg-surface-high">
                  <span className={cx('grid size-11 shrink-0 place-items-center border', toneBg[meta.tone])}>
                    <Icon name={meta.icon} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-bold text-on-surface">{a.name}</span>
                      <span className="border border-border-low bg-surface-high px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-secondary">{a.role}</span>
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] text-text-secondary">{a.title}</span>
                    <span className="mt-1 block font-mono text-[11px] text-on-surface-variant">{meta.tag}</span>
                  </span>
                  <Icon name="arrows" size={16} className="text-text-secondary transition group-hover:text-primary" />
                </button>
              );
            })}
          </div>

          <p className="mt-7 border border-border-low bg-surface-panel px-4 py-3 font-mono text-[11px] leading-relaxed text-on-surface-variant">
            PharmSecure solves two connected crises — <span className="font-bold text-on-surface">counterfeit medicines</span> with no
            verification path and <span className="font-bold text-on-surface">near-expiry surplus</span> discarded while clinics face shortages.
            Log in as any role to explore the live prototype.
          </p>
        </div>
      </div>
    </div>
  );
}
