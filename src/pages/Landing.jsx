import { useEffect, useState } from 'react';
import { useStore, ACCOUNTS } from '../store.jsx';
import CapsuleLogo from '../components/CapsuleLogo.jsx';

const ROLE_ICONS = {
  'Hospital Admin': 'local_hospital',
  'Clinic Manager': 'medical_services',
  'NGO Coordinator': 'public',
  'Manufacturer': 'prescriptions',
};

export default function Landing() {
  const { login } = useStore();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('acc_admin');
  const [terminalId, setTerminalId] = useState('');
  const [passkey, setPasskey] = useState('');

  useEffect(() => { document.title = 'PharmSecure — Credential Verification'; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(selectedRole); setError('');
    try { await login(selectedRole, 'pharmsecure123'); }
    catch (e) { setError(e.message); }
    finally { setBusy(''); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border-low bg-surface-lowest px-8 py-4 flex items-center justify-start">
        <div className="flex items-center gap-3">
          <CapsuleLogo size={36} />
          <h1 className="font-bold uppercase tracking-tighter text-primary text-sm">
            PharmSecure Official Protocol
          </h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 md:px-8 py-12">
        <div className="w-full max-w-2xl border border-border-low bg-surface-lowest">
          {/* Form header */}
          <div className="w-full border-b-2 border-double border-outline px-8 py-6 text-center bg-surface-low">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant mb-2">FORM 104-A: AUTHORIZATION</h2>
            <h3 className="text-2xl font-bold uppercase text-primary tracking-tight">Credential Verification</h3>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col p-8 gap-8">
            {/* Role selector */}
            <div className="flex flex-col gap-4">
              <label className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-on-surface-variant">Select Operating Role</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ACCOUNTS.map((a) => (
                  <label key={a.id} className="cursor-pointer relative">
                    <input
                      type="radio"
                      name="role"
                      value={a.id}
                      checked={selectedRole === a.id}
                      onChange={() => setSelectedRole(a.id)}
                      className="sr-only role-radio"
                    />
                    <div className="border border-border-low p-4 bg-surface flex items-center gap-3 transition-colors">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'wght' 400" }}>
                        {ROLE_ICONS[a.role] || 'badge'}
                      </span>
                      <span className="font-mono text-[14px] text-on-surface">{a.role}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Input fields */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-on-surface-variant" htmlFor="terminal-id">Terminal ID / Auth Code</label>
                <input
                  className="bureaucratic-input"
                  id="terminal-id"
                  placeholder="e.g. 882-QX-990"
                  type="text"
                  value={terminalId}
                  onChange={(e) => setTerminalId(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-on-surface-variant" htmlFor="passkey">Security Passkey</label>
                <input
                  className="bureaucratic-input"
                  id="passkey"
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col md:flex-row items-center justify-between mt-4 pt-6 border-t border-outline">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-outline-variant mb-4 md:mb-0 w-full md:w-2/3">
                WARNING: UNAUTHORIZED ACCESS IS LOGGED AND PROHIBITED UNDER PHARMSECURE DIRECTIVE 44.A.
              </p>
              <button
                type="submit"
                disabled={!!busy}
                className="w-full md:w-auto bg-primary-container text-on-primary font-mono text-[12px] font-medium uppercase tracking-[0.1em] py-3 px-8 hover:bg-on-primary-container transition-colors border border-primary-container disabled:opacity-40"
              >
                {busy ? 'Initializing...' : 'Initialize Session'}
              </button>
            </div>

            {error && <p className="mt-2 text-center text-sm text-error">{error}</p>}
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-outline-variant bg-surface-dim px-8 py-8 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-outline">
            &copy; 2024 PharmSecure Official Protocol - Classified
          </span>
          <div className="flex flex-wrap gap-6 font-mono text-[11px] text-outline-variant">
            <a href="#" className="hover:text-primary transition-colors">Regulatory Compliance</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy Ledger</a>
            <a href="#" className="hover:text-primary transition-colors">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
