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

  return (
    <div className="space-y-6">
      {/* Scanning Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Scanner section */}
        <section className="lg:col-span-8 border border-border-low bg-surface-panel p-4 flex flex-col">
          <header className="flex justify-between items-end border-b border-border-low pb-1 mb-4">
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-text-secondary">
              Task: Identity Verification
            </div>
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-primary">
              Terminal ID: {org?.id?.slice(-6) || '882-QX'}
            </div>
          </header>

          {/* Input area */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyCode(input)}
                placeholder="ENTER SERIAL CODE..."
                className="bureaucratic-input flex-1"
              />
              <Button onClick={() => { verifyCode(input); setInput(''); }} disabled={pending} className="shrink-0">
                {pending ? 'Verifying...' : 'Verify'}
              </Button>
              <Button onClick={() => { setResult(null); setCamError(false); setScanning((s) => !s); }} variant={scanning ? 'danger' : 'ghost'} className="shrink-0">
                {scanning ? 'Stop' : 'Camera'}
              </Button>
            </div>
          </div>

          {/* Camera / Viewfinder */}
          {scanning && (
            <div className="flex flex-col items-center justify-center relative flex-grow">
              <div className="absolute top-4 w-full text-center font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-text-secondary z-10">
                POSITION QR CODE WITHIN FRAME
              </div>
              <div className="relative w-full max-w-lg aspect-square border border-border-low bg-surface overflow-hidden">
                <div id="qr-reader" />
                <div className="absolute left-0 right-0 h-px bg-primary opacity-50 animate-scan" />
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary m-4" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary m-4" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary m-4" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary m-4" />
              </div>
              <div className="w-full max-w-lg border border-border-low bg-surface-high mt-4 p-3 flex justify-between items-center">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-text-secondary">SCAN STATUS:</span>
                <span className="font-mono text-[12px] text-primary flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary inline-block animate-live" />
                  AWAITING INPUT
                </span>
              </div>
            </div>
          )}

          {!scanning && !result && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined text-primary text-4xl mb-4" style={{ fontVariationSettings: "'wght' 200" }}>qr_code_scanner</span>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Scan or enter a serial to authenticate</p>
              <p className="mt-1 max-w-md text-xs text-text-secondary">
                The verification engine checks registry status, scan history, geo-consistency and expiry.
              </p>
            </div>
          )}

          {camError && !scanning && (
            <div className="mt-4 border border-secondary-container bg-secondary-container/10 p-3 font-mono text-[11px] text-tertiary">
              No camera available — use manual entry or a simulated scan below.
            </div>
          )}

          {/* Demo chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Live scan:</span>
            {SAMPLES.map((s) => (
              <Chip key={s.code} onClick={() => verifyCode(s.code)}>{s.label}</Chip>
            ))}
          </div>
        </section>

        {/* Scan History sidebar */}
        <aside className="lg:col-span-4 border border-border-low bg-surface-panel p-4">
          <div className="double-header pb-2 mb-6">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-text-secondary">
              Scan History Feed
            </h2>
          </div>

          {result ? (
            <div className="flex flex-col">
              {/* Status stamp */}
              <div className="mb-6 flex justify-center">
                <div className={cx(
                  'w-40 h-40 rounded-full flex items-center justify-center border-4 relative',
                  result.verdict === 'Verified' ? 'border-primary bg-primary-container/10' :
                  result.verdict === 'High-Risk' ? 'border-error bg-error-container/10' :
                  'border-tertiary bg-secondary-container/10'
                )}>
                  <div className="absolute inset-2 border-2 border-primary border-dashed rounded-full opacity-30" />
                  <div className="flex flex-col items-center z-10">
                    <span className={cx('text-4xl', result.verdict === 'Verified' ? 'text-primary' : result.verdict === 'High-Risk' ? 'text-error' : 'text-tertiary')}>
                      {result.verdict === 'Verified' ? '✓' : result.verdict === 'High-Risk' ? '✗' : '⚠'}
                    </span>
                    <span className={cx('stamp mt-2', result.verdict === 'Verified' ? 'stamp-verified' : result.verdict === 'High-Risk' ? 'stamp-rejected' : 'stamp-warning')}>
                      {result.verdict}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk score */}
              <div className="border border-border-low bg-surface p-4 mb-4">
                <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-secondary mb-1">Integrity Risk</div>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-primary">{result.score}<span className="text-sm text-text-secondary">/100</span></div>
                  <div className="flex-1"><ScoreBar score={result.score} /></div>
                </div>
              </div>

              {/* Metadata table */}
              <div className="border border-border-low">
                <div className="grid grid-cols-3 border-b border-border-low bg-surface-low">
                  <div className="p-2 border-r border-border-low font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-secondary">Property</div>
                  <div className="p-2 col-span-2 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-secondary">Value</div>
                </div>
                {result.found && b && (
                  <>
                    <div className="grid grid-cols-3 border-b border-border-low">
                      <div className="p-2 border-r border-border-low font-mono text-[11px] text-on-surface-variant">Medicine</div>
                      <div className="p-2 col-span-2 font-mono text-[12px] text-on-surface">{b.name} {b.strength}</div>
                    </div>
                    <div className="grid grid-cols-3 border-b border-border-low">
                      <div className="p-2 border-r border-border-low font-mono text-[11px] text-on-surface-variant">Manufacturer</div>
                      <div className="p-2 col-span-2 font-mono text-[12px] text-on-surface">{orgs[b.mfgId]?.name || '—'}</div>
                    </div>
                    <div className="grid grid-cols-3 border-b border-border-low">
                      <div className="p-2 border-r border-border-low font-mono text-[11px] text-on-surface-variant">Holder</div>
                      <div className="p-2 col-span-2 font-mono text-[12px] text-on-surface">{orgs[b.holderId]?.name || '—'}</div>
                    </div>
                    <div className="grid grid-cols-3 border-b border-border-low">
                      <div className="p-2 border-r border-border-low font-mono text-[11px] text-on-surface-variant">Expiry</div>
                      <div className="p-2 col-span-2 font-mono text-[12px] text-on-surface">{new Date(b.expiry).toLocaleDateString()}</div>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-3">
                  <div className="p-2 border-r border-border-low font-mono text-[11px] text-on-surface-variant">Code</div>
                  <div className="p-2 col-span-2 font-mono text-[12px] text-on-surface">{result.code}</div>
                </div>
              </div>

              {/* Audit flags */}
              {result.checks.length > 0 && (
                <div className="mt-4 border border-border-low bg-surface-low p-4">
                  <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-[14px]">flag</span>
                    Audit Flags
                  </h3>
                  <div className="space-y-2">
                    {result.checks.map((c) => (
                      <div key={c.key} className="flex items-center gap-3 border-l-2 border-border-low pl-3">
                        <span className="font-mono text-[11px] text-on-surface-variant w-32 shrink-0">{c.label}</span>
                        <div className="h-1 flex-1 bg-border-low">
                          <div className={cx('h-full', c.impact >= 20 ? 'bg-error' : c.impact >= 8 ? 'bg-tertiary' : 'bg-primary')} style={{ width: `${Math.min(100, c.impact * 2.5)}%` }} />
                        </div>
                        <span className="font-mono text-[10px] text-text-secondary">+{c.impact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues / Greens */}
              <div className="mt-4 space-y-2">
                {result.issues.map((s, i) => (
                  <p key={i} className="flex gap-2 border-l-2 border-error bg-error-container/10 px-3 py-2 font-mono text-[11px] text-error">
                    <span className="material-symbols-outlined text-[14px]">warning</span>{s}
                  </p>
                ))}
                {result.greens.map((s, i) => (
                  <p key={i} className="flex gap-2 border-l-2 border-primary bg-primary-container/10 px-3 py-2 font-mono text-[11px] text-primary">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>{s}
                  </p>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button variant="ghost" onClick={() => nav('/audits')} className="flex-1">Audit Trail</Button>
                <Button variant="ghost" onClick={() => setResult(null)} className="flex-1">Clear</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex justify-between items-center border-b border-border-low pb-2 mb-2 bg-surface-high px-2">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-secondary">TIMESTAMP</span>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-secondary">BATCH ID</span>
              </div>
              <div className="border-b border-border-low h-10 w-full opacity-50" />
              <div className="border-b border-border-low h-10 w-full opacity-50" />
              <div className="border-b border-border-low h-10 w-full opacity-50" />
              <div className="border-b border-border-low h-10 w-full opacity-50" />

              <div className="mt-8">
                <Button variant="ghost" onClick={() => setInput('')} className="w-full">
                  Manual Override
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
