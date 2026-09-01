import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, Button, Pill, ScoreBar, Chip, Icon, fmtDate, cx, Reveal } from '../components/ui.jsx';

const SAMPLES = [
  { code: 'PS-DEMO-0001', label: 'Genuine QR' },
  { code: 'PS-DEMO-0002', label: 'Genuine QR' },
  { code: 'PS-DEMO-FAKE', label: 'Live counterfeit' },
];

const VERDICT_HERO = {
  Verified: { ring: 'ring-blue-500/30', bg: 'from-blue-500/10 to-transparent', chip: 'text-blue-300', icon: 'check', glow: 'shadow-blue-500/20' },
  Suspicious: { ring: 'ring-amber-400/30', bg: 'from-amber-400/10 to-transparent', chip: 'text-amber-300', icon: 'alert', glow: 'shadow-amber-400/20' },
  'High-Risk': { ring: 'ring-rose-500/30', bg: 'from-rose-500/10 to-transparent', chip: 'text-rose-300', icon: 'x', glow: 'shadow-rose-500/20' },
};

/* ── Decorative SVG Graphics ── */
function QRScannerGraphic() {
  return (
    <svg className="absolute -right-6 -top-6 opacity-[0.06] pointer-events-none" width="140" height="140" viewBox="0 0 140 140" fill="none">
      <rect x="30" y="30" width="80" height="80" rx="6" stroke="#60a5fa" strokeWidth="2" strokeDasharray="8 4"/>
      <rect x="40" y="40" width="20" height="20" rx="2" stroke="#3b82f6" strokeWidth="1.5"/>
      <rect x="80" y="40" width="20" height="20" rx="2" stroke="#3b82f6" strokeWidth="1.5"/>
      <rect x="40" y="80" width="20" height="20" rx="2" stroke="#3b82f6" strokeWidth="1.5"/>
      <rect x="80" y="80" width="8" height="8" rx="1" fill="#3b82f6" fillOpacity="0.3"/>
      <rect x="92" y="80" width="8" height="8" rx="1" fill="#3b82f6" fillOpacity="0.2"/>
      <rect x="80" y="92" width="8" height="8" rx="1" fill="#3b82f6" fillOpacity="0.2"/>
      <path d="M20 70H30M110 70H120M70 20V30M70 110V120" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="70" cy="70" r="12" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 4"/>
    </svg>
  );
}

function VerifiedShieldGraphic() {
  return (
    <svg className="absolute -right-4 -bottom-4 opacity-[0.06] pointer-events-none" width="100" height="100" viewBox="0 0 100 100" fill="none">
      <path d="M50 10L85 30V55C85 75 50 95 50 95C50 95 15 75 15 55V30L50 10Z" stroke="#60a5fa" strokeWidth="2"/>
      <path d="M38 52L47 61L63 42" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="50" cy="50" r="30" stroke="#60a5fa" strokeWidth="1" strokeDasharray="5 4" opacity="0.5"/>
    </svg>
  );
}

function BatchRecordGraphic() {
  return (
    <svg className="absolute -right-3 -top-3 opacity-[0.05] pointer-events-none" width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="15" y="10" width="50" height="60" rx="4" stroke="#60a5fa" strokeWidth="1.5"/>
      <rect x="22" y="18" width="36" height="3" rx="1" fill="#3b82f6" fillOpacity="0.2"/>
      <rect x="22" y="26" width="28" height="2" rx="1" fill="#3b82f6" fillOpacity="0.15"/>
      <rect x="22" y="33" width="20" height="2" rx="1" fill="#3b82f6" fillOpacity="0.1"/>
      <path d="M22 45H58M22 52H48M22 59H42" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3"/>
      <circle cx="55" cy="55" r="10" stroke="#3b82f6" strokeWidth="1.5"/>
      <path d="M52 55H58M55 52V58" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function TimelineGraphic() {
  return (
    <svg className="absolute -right-3 -bottom-3 opacity-[0.05] pointer-events-none" width="60" height="100" viewBox="0 0 60 100" fill="none">
      <line x1="30" y1="10" x2="30" y2="90" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 4"/>
      <circle cx="30" cy="20" r="5" stroke="#3b82f6" strokeWidth="1.5"/>
      <circle cx="30" cy="50" r="5" stroke="#60a5fa" strokeWidth="1.5"/>
      <circle cx="30" cy="80" r="5" stroke="#3b82f6" strokeWidth="1.5"/>
      <path d="M38 20H50M38 50H48M38 80H45" stroke="#60a5fa" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

export default function Verify() {
  const { orgs, org, token } = useStore();
  const nav = useNavigate();
  const [input, setInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState(false);
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(false);
  const scannerRef = useRef(null);
  const decodedRef = useRef(null);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const verifyCode = useCallback(async (code) => {
    const c = (code || '').trim();
    if (!c) return;
    setPending(true);
    setCamError(false);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ code: c.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verify failed');
      setResult(data);
    } catch (e) {
      console.error('Verify error:', e);
      setCamError(true);
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/[?&]code=([^&]+)/);
    if (match) {
      const code = decodeURIComponent(match[1]);
      setInput('');
      verifyCode(code);
      window.history.replaceState({}, '', '#/verify');
    }
  }, []);

  function startCamera() {
    setCamError(false);
    setResult(null);
    setScanning(true);
  }

  function stopCamera() {
    setScanning(false);
    try {
      const sc = scannerRef.current;
      if (sc) {
        sc.stop().catch(() => {});
        scannerRef.current = null;
      }
    } catch (e) { /* ignore */ }
    const el = document.getElementById('qr-reader');
    if (el) el.innerHTML = '';
  }

  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;

    (async () => {
      try {
        const devices = await Html5Qrcode.getCameras().catch(() => []);
        if (!devices || devices.length === 0) throw new Error('no camera');
        if (cancelled) return;

        const el = document.getElementById('qr-reader');
        if (!el) throw new Error('reader element not found');
        el.innerHTML = '';

        const sc = new Html5Qrcode('qr-reader', false);
        scannerRef.current = sc;
        await sc.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decoded) => {
            if (decodedRef.current) return;
            decodedRef.current = decoded;
            setScanning(false);
            try {
              const sc = scannerRef.current;
              if (sc) {
                sc.stop().catch(() => {});
                scannerRef.current = null;
              }
            } catch (e) { /* ignore */ }
            const el = document.getElementById('qr-reader');
            if (el) el.innerHTML = '';
            verifyCode(decoded);
          },
          () => {},
        );
      } catch (e) {
        console.error('Camera error:', e);
        if (!cancelled) {
          setScanning(false);
          setCamError(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        const sc = scannerRef.current;
        if (sc) {
          sc.stop().catch(() => {});
          scannerRef.current = null;
        }
      } catch (e) { /* ignore */ }
      const el = document.getElementById('qr-reader');
      if (el) el.innerHTML = '';
    };
  }, [scanning]);

  const b = result?.batch;
  const hero = VERDICT_HERO[result?.verdict] || VERDICT_HERO.Verified;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Reveal>
        <Card className="p-6 relative overflow-hidden">
          <QRScannerGraphic />
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-500/5">
                <Icon name="scan" size={18} className="text-brand-400" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-mist-50">Verify a Medicine</h2>
                <p className="text-[11px] text-mist-400">Point camera at QR, type a code, or run a simulated scan</p>
              </div>
            </div>
            <Pill label={org?.name.split(' ').slice(-1)[0] + ' terminal'} className="hidden sm:inline-flex" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 group">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-500/0 via-brand-500/5 to-brand-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative flex items-center bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 focus-within:border-brand-500/40 focus-within:bg-white/[0.05] transition-all duration-200">
                <Icon name="qricon" size={16} className="text-mist-500 group-focus-within:text-brand-400 transition-colors mr-3 shrink-0" />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && verifyCode(input)}
                  placeholder="Type a serial (e.g. PS-DEMO-0001)"
                  className="w-full bg-transparent text-[13px] font-mono uppercase text-mist-100 outline-none placeholder:text-mist-600"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { verifyCode(input); setInput(''); }} icon="scan" disabled={pending} className="flex-1 sm:flex-none">
                {pending ? 'Verifying...' : 'Verify'}
              </Button>
              <Button onClick={() => { setResult(null); setCamError(false); setScanning((s) => !s); }} variant={scanning ? 'ghost' : 'soft'} icon="camera" className="flex-1 sm:flex-none">
                {scanning ? 'Stop camera' : 'Camera'}
              </Button>
            </div>
          </div>

          {camError && !scanning && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-400/10 border border-amber-400/20 px-4 py-2.5">
              <Icon name="alert" size={14} className="text-amber-400 shrink-0" />
              <p className="text-[11px] text-amber-300">No camera available — use manual entry or a simulated scan below.</p>
            </div>
          )}

          {scanning && (
            <div className="mt-5 max-w-sm mx-auto">
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]">
                <div id="qr-reader" />
                <div className="scanline" />
              </div>
              <p className="mt-3 text-center text-[11px] text-mist-500 flex items-center justify-center gap-2">
                <div className="size-1.5 bg-blue-400 rounded-full animate-live" />
                Point at a batch QR code...
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-mist-500">Quick scan:</span>
            {SAMPLES.map((s) => (
              <Chip key={s.code} onClick={() => verifyCode(s.code)}>{s.label}</Chip>
            ))}
          </div>
        </Card>
      </Reveal>

      {/* Result Hero */}
      {result && (
        <Reveal>
          <div className={cx('relative rounded-2xl overflow-hidden border border-white/[0.06]', 'animate-scale-in')}>
            <VerifiedShieldGraphic />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
            <div className={cx('relative bg-gradient-to-br p-6', hero.bg)}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  <div className={cx('grid size-16 shrink-0 place-items-center rounded-2xl ring-1 shadow-lg', {
                    Verified: 'bg-blue-500/15 text-blue-300 ring-blue-500/30 shadow-blue-500/20',
                    Suspicious: 'bg-amber-400/15 text-amber-300 ring-amber-400/30 shadow-amber-400/20',
                    'High-Risk': 'bg-rose-500/15 text-rose-300 ring-rose-500/30 shadow-rose-500/20',
                  }[result.verdict])}>
                    <Icon name={hero.icon} size={28} />
                  </div>
                  <div>
                    <p className={cx('text-[11px] font-bold uppercase tracking-[0.2em]', hero.chip)}>{result.verdict}</p>
                    <h3 className="text-xl font-black tracking-tight text-mist-100 mt-0.5">{result.found ? (b?.name || 'Medicine') : 'Unregistered code'}</h3>
                    <p className="mt-1 text-xs text-mist-500">{result.code} · scanned at {org?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mist-400">Risk Score</p>
                    <p className={cx('text-4xl font-black tabular-nums mt-0.5', result.score >= 70 ? 'text-rose-300' : result.score >= 40 ? 'text-amber-300' : 'text-blue-300')}>{result.score}<span className="text-sm font-bold text-mist-500">/100</span></p>
                  </div>
                  <Button variant={result.verdict === 'High-Risk' ? 'danger' : 'primary'} size="sm" icon="audit">Recorded to audit</Button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* Result Details */}
      {result && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal delay={100}>
            <Card className="p-5 relative overflow-hidden">
              <TimelineGraphic />
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-500/5">
                  <Icon name="audit" size={16} className="text-brand-400" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-mist-50">Risk Breakdown</h4>
                  <p className="text-[10px] text-mist-500">{result.summary}</p>
                </div>
              </div>
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-mist-300">
                  <span>Composite risk</span><span>{result.score}/100</span>
                </div>
                <ScoreBar score={result.score} />
              </div>
              {result.checks.length > 0 && (
                <div className="space-y-3">
                  {result.checks.map((c) => (
                    <div key={c.key} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-[11px] font-bold text-mist-300">{c.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                        <div className={cx('h-full rounded-full transition-all duration-500', c.impact >= 20 ? 'bg-gradient-to-r from-rose-500 to-rose-400' : c.impact >= 8 ? 'bg-gradient-to-r from-amber-400 to-amber-300' : 'bg-gradient-to-r from-blue-500 to-blue-400')} style={{ width: `${Math.min(100, c.impact * 2.5)}%` }} />
                      </div>
                      <span className="w-16 shrink-0 text-right text-[11px] font-bold tabular-nums text-mist-500">+{c.impact} pts</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-5 space-y-2">
                {result.issues.map((s, i) => (
                  <div key={i} className="flex gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3.5 py-2.5">
                    <Icon name="x" size={14} className="mt-0.5 shrink-0 text-rose-400" />
                    <p className="text-[11px] font-medium text-rose-300">{s}</p>
                  </div>
                ))}
                {result.greens.map((s, i) => (
                  <div key={i} className="flex gap-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 px-3.5 py-2.5">
                    <Icon name="check" size={14} className="mt-0.5 shrink-0 text-blue-400" />
                    <p className="text-[11px] font-medium text-blue-300">{s}</p>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          <div className="space-y-5">
            {b && (
              <Reveal delay={150}>
                <Card className="p-5 relative overflow-hidden">
                  <BatchRecordGraphic />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-500/5">
                      <Icon name="box" size={16} className="text-brand-400" />
                    </div>
                    <h4 className="text-[13px] font-bold text-mist-50">Batch Record</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Info label="Medicine" value={`${b.name} ${b.strength}`} />
                    <Info label="Generic" value={b.generic} />
                    <Info label="Manufacturer" value={orgs[b.mfgId]?.name || '—'} />
                    <Info label="Current holder" value={orgs[b.holderId]?.name || '—'} />
                    <Info label="Form" value={b.form} />
                    <Info label="Expiry" value={new Date(b.expiry).toLocaleDateString()} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {b.coldChain && <span className="rounded-full bg-sky-500/15 px-2.5 py-1 text-[10px] font-bold text-sky-300 ring-1 ring-inset ring-sky-500/30">Cold chain 2-8C</span>}
                    <span className="rounded-full bg-brand-500/15 px-2.5 py-1 text-[10px] font-bold text-brand-300 ring-1 ring-inset ring-brand-500/30">Serial-linked identity</span>
                  </div>
                </Card>
              </Reveal>
            )}
            {result.serial && (
              <Reveal delay={200}>
                <Card className="p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-500/5">
                        <Icon name="audit" size={16} className="text-brand-400" />
                      </div>
                      <h4 className="text-[13px] font-bold text-mist-50">Scan History</h4>
                    </div>
                    <span className="text-[10px] font-bold text-mist-500">{result.serial.scans.length} scans</span>
                  </div>
                  <div className="space-y-0">
                    {result.serial.scans.slice().reverse().map((s, i, arr) => {
                      const prev = arr[i + 1];
                      const mismatch = prev && prev.city !== s.city;
                      const currOrg = orgs[s.orgId];
                      const prevOrg = prev ? orgs[prev.orgId] : null;
                      return (
                        <div key={i} className="relative flex gap-3 pb-4">
                          {i < arr.length - 1 && <span className="absolute left-[11px] top-6 h-full w-px bg-white/[0.06]" />}
                          <span className={cx('relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ring-1', mismatch ? 'bg-rose-500/15 text-rose-300 ring-rose-500/30' : 'bg-brand-500/15 text-brand-300 ring-brand-500/30')}>
                            <Icon name={mismatch ? 'alert' : 'pin'} size={12} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-[12px] font-bold text-mist-100">{currOrg?.name || s.by}</p>
                                <p className="text-[10px] text-mist-500">{currOrg?.type || ''} · {s.city}</p>
                              </div>
                              <span className="shrink-0 text-[10px] font-medium text-mist-500">{new Date(s.at).toLocaleString()}</span>
                            </div>
                            {mismatch && (
                              <div className="mt-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-2.5">
                                <p className="text-[11px] font-bold text-rose-300">Geo-anomaly detected</p>
                                <p className="mt-1 text-[10px] text-rose-200/80">Previous: <span className="font-semibold">{prevOrg?.name || prev?.by}</span> ({prev?.city})</p>
                                <p className="text-[10px] text-rose-200/80">Current: <span className="font-semibold">{currOrg?.name || s.by}</span> ({s.city})</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </Reveal>
            )}
            {!b && (
              <Reveal delay={200}>
                <Card className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400/15 to-amber-400/5">
                      <Icon name="alert" size={16} className="text-amber-400" />
                    </div>
                    <h4 className="text-[13px] font-bold text-mist-50">What happens next?</h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-mist-400">This code has no match in the trusted registry. Do not administer. Report the packaging to the nearest wholesaler or the CDSCO helpline.</p>
                </Card>
              </Reveal>
            )}
            <Reveal delay={250}>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => nav('/audits')} icon="audit">View audit trail</Button>
                <Button variant="ghost" onClick={() => setResult(null)} icon="reset">Clear result</Button>
              </div>
            </Reveal>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && (
        <Reveal delay={100}>
          <Card className="p-8 text-center relative overflow-hidden">
            <QRScannerGraphic />
            <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/15 to-brand-500/5 mx-auto mb-4 shadow-lg shadow-brand-500/10">
              <Icon name="scan" size={28} className="text-brand-400" />
            </div>
            <p className="text-sm font-bold text-mist-100">Scan or enter a serial to authenticate</p>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-mist-400">
              The verification engine checks registry status, scan history, geo-consistency and expiry — and returns a transparent, weighted risk score instead of a black box.
            </p>
            <div className="mt-5 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="size-8 place-items-center rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <Icon name="shield" size={14} className="text-brand-400" />
                </div>
                <span className="text-[10px] font-bold text-mist-500">Registry Check</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-8 place-items-center rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <Icon name="pin" size={14} className="text-brand-400" />
                </div>
                <span className="text-[10px] font-bold text-mist-500">Geo-Verify</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-8 place-items-center rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <Icon name="clock" size={14} className="text-brand-400" />
                </div>
                <span className="text-[10px] font-bold text-mist-500">Expiry Check</span>
              </div>
            </div>
          </Card>
        </Reveal>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-mist-500">{label}</p>
      <p className="mt-0.5 text-[12px] font-semibold text-mist-100">{value}</p>
    </div>
  );
}
