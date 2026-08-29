import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, Button, Pill, ScoreBar, Chip, Icon, fmtDate, cx } from '../components/ui.jsx';

const SAMPLES = [
  { code: 'PS-DEMO-0001', label: 'Genuine QR' },
  { code: 'PS-DEMO-0002', label: 'Genuine QR' },
  { code: 'PS-DEMO-FAKE', label: 'Live counterfeit' },
];

const VERDICT_HERO = {
  Verified: { ring: 'ring-emerald-500/30', bg: 'from-emerald-500/15 to-panel2', chip: 'text-emerald-300', icon: 'check' },
  Suspicious: { ring: 'ring-amber-400/30', bg: 'from-amber-400/15 to-panel2', chip: 'text-amber-300', icon: 'alert' },
  'High-Risk': { ring: 'ring-rose-500/30', bg: 'from-rose-500/15 to-panel2', chip: 'text-rose-300', icon: 'x' },
};

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
    <div className="animate-fade-up space-y-6">
      <Card className="p-5 glow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight text-mist-100">Verify a medicine</h2>
            <p className="text-xs text-mist-500">Point the camera at a printed QR, type a code, or run a live scan ({org?.city}).</p>
          </div>
          <Pill label={org?.name.split(' ').slice(-1)[0] + ' terminal'} className="hidden sm:inline-flex" />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && verifyCode(input)}
            placeholder="Type a serial (e.g. PS-DEMO-0001)"
            className="w-full rounded-xl border border-edge bg-panel2 px-4 py-2.5 text-sm uppercase text-mist-100 outline-none placeholder:text-mist-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
          />
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
          <p className="mt-2 rounded-lg bg-amber-400/10 px-3 py-2 text-[11px] text-amber-300 ring-1 ring-inset ring-amber-400/30">
            No camera available — use manual entry or a simulated scan below.
          </p>
        )}

        {scanning && (
          <div className="mt-4 max-w-sm">
            <div className="relative">
              <div id="qr-reader" />
              <div className="scanline" />
            </div>
            <p className="mt-2 text-center text-[11px] text-mist-500">Point at a batch QR code...</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-mist-400">Live scan:</span>
          {SAMPLES.map((s) => (
            <Chip key={s.code} onClick={() => verifyCode(s.code)}>{s.label}</Chip>
          ))}
        </div>
      </Card>

      {result && (
        <div className={cx('overflow-hidden rounded-2xl bg-gradient-to-br ring-1 animate-fade-up', hero.bg, hero.ring)}>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className={cx('grid size-14 shrink-0 place-items-center rounded-2xl ring-1', {
                Verified: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
                Suspicious: 'bg-amber-400/15 text-amber-300 ring-amber-400/30',
                'High-Risk': 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
              }[result.verdict])}>
                <Icon name={hero.icon} size={26} />
              </span>
              <div>
                <p className={cx('text-[11px] font-bold uppercase tracking-widest', hero.chip)}>{result.verdict}</p>
                <h3 className="text-xl font-bold tracking-tight text-mist-100">{result.found ? (b?.name || 'Medicine') : 'Unregistered code'}</h3>
                <p className="mt-0.5 text-xs text-mist-500">{result.code} · scanned at {org?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:flex-col sm:items-end">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-mist-400">Risk score</p>
                <p className={cx('text-3xl font-black tabular-nums', result.score >= 70 ? 'text-rose-300' : result.score >= 40 ? 'text-amber-300' : 'text-emerald-300')}>{result.score}<span className="text-sm font-semibold text-mist-500">/100</span></p>
              </div>
              <Button variant={result.verdict === 'High-Risk' ? 'danger' : 'primary'} size="sm" icon="audit">Recorded to audit</Button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h4 className="text-sm font-bold text-mist-100">Explainable risk breakdown</h4>
            <p className="mt-0.5 text-xs text-mist-500">{result.summary}</p>
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-mist-300">
                <span>Composite risk</span><span>{result.score}/100</span>
              </div>
              <ScoreBar score={result.score} />
            </div>
            {result.checks.length > 0 && (
              <div className="mt-4 space-y-2.5">
                {result.checks.map((c) => (
                  <div key={c.key} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-xs font-medium text-mist-300">{c.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist-700/50">
                      <div className={cx('h-full rounded-full', c.impact >= 20 ? 'bg-rose-400' : c.impact >= 8 ? 'bg-amber-400' : 'bg-emerald-400')} style={{ width: `${Math.min(100, c.impact * 2.5)}%` }} />
                    </div>
                    <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-mist-500">+{c.impact} pts</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 space-y-2">
              {result.issues.map((s, i) => (
                <p key={i} className="flex gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-inset ring-rose-500/30"><Icon name="x" size={14} className="mt-0.5 shrink-0" />{s}</p>
              ))}
              {result.greens.map((s, i) => (
                <p key={i} className="flex gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 ring-1 ring-inset ring-emerald-500/30"><Icon name="check" size={14} className="mt-0.5 shrink-0" />{s}</p>
              ))}
            </div>
          </Card>
          <div className="space-y-6">
            {b && (
              <Card className="p-5">
                <h4 className="text-sm font-bold text-mist-100">Batch record</h4>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <Info label="Medicine" value={`${b.name} ${b.strength}`} />
                  <Info label="Generic" value={b.generic} />
                  <Info label="Manufacturer" value={orgs[b.mfgId]?.name || '—'} />
                  <Info label="Current holder" value={orgs[b.holderId]?.name || '—'} />
                  <Info label="Form" value={b.form} />
                  <Info label="Expiry" value={new Date(b.expiry).toLocaleDateString()} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {b.coldChain && <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300 ring-1 ring-inset ring-sky-500/30">Cold chain 2-8C</span>}
                  <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold text-brand-300 ring-1 ring-inset ring-brand-500/30">Serial-linked identity</span>
                </div>
              </Card>
            )}
            {result.serial && (
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-mist-100">Scan history & geo timeline</h4>
                  <span className="text-[10px] font-semibold text-mist-500">{result.serial.scans.length} scans</span>
                </div>
                <div className="mt-4 space-y-0">
                  {result.serial.scans.slice().reverse().map((s, i, arr) => {
                    const prev = arr[i + 1];
                    const mismatch = prev && prev.city !== s.city;
                    const currOrg = orgs[s.orgId];
                    const prevOrg = prev ? orgs[prev.orgId] : null;
                    return (
                      <div key={i} className="relative flex gap-3 pb-4">
                        {i < arr.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px bg-edge" />}
                        <span className={cx('relative z-10 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ring-1', mismatch ? 'bg-rose-500/15 text-rose-300 ring-rose-500/30' : 'bg-brand-500/15 text-brand-300 ring-brand-500/30')}>
                          <Icon name={mismatch ? 'alert' : 'pin'} size={11} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-mist-100">{currOrg?.name || s.by}</p>
                              <p className="text-[10px] text-mist-500">{currOrg?.type || ''} · {s.city}</p>
                            </div>
                            <span className="shrink-0 text-[10px] text-mist-500">{new Date(s.at).toLocaleString()}</span>
                          </div>
                          {mismatch && (
                            <div className="mt-2 rounded-lg bg-rose-500/10 px-3 py-2 ring-1 ring-inset ring-rose-500/30">
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
            )}
            {!b && (
              <Card className="p-5">
                <h4 className="text-sm font-bold text-mist-100">What happens next?</h4>
                <p className="mt-2 text-xs leading-relaxed text-mist-500">This code has no match in the trusted registry. Do not administer. Report the packaging to the nearest wholesaler or the CDSCO helpline.</p>
              </Card>
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => nav('/audits')} icon="audit">View audit trail</Button>
              <Button variant="ghost" onClick={() => setResult(null)} icon="reset">Clear result</Button>
            </div>
          </div>
        </div>
      )}

      {!result && (
        <Card className="p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-500/15 text-brand-300"><Icon name="scan" size={24} /></span>
          <p className="mt-3 text-sm font-bold text-mist-100">Scan or enter a serial to authenticate</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-mist-500">
            The verification engine checks registry status, scan history, geo-consistency and expiry — and returns a transparent, weighted risk score instead of a black box.
          </p>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-panel2/70 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-mist-400">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-mist-100">{value}</p>
    </div>
  );
}
