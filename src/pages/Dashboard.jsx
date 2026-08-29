import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Card, SectionTitle, StatCard, Pill, ScoreBar, fmtNum, fmtDate, Icon, AnimatedNumber } from '../components/ui.jsx';

const ACTION_ICON = { scan: 'scan', qr_issue: 'qricon', match: 'arrows', request: 'handshake', transfer_propose: 'truck', transfer_deliver: 'check', transfer_accepted: 'check', 'transfer_in-transit': 'truck', transfer_dispatch: 'truck' };

export default function Dashboard() {
  const { stats, audits, transfers } = useStore();
  const nav = useNavigate();

  const riskBoard = stats?.riskBoard || [];
  const activity = audits || [];
  const verdicts = (audits || []).reduce((acc, a) => { acc[a.result] = (acc[a.result] || 0) + 1; return acc; }, {});

  const s = stats || {
    pendingSurplus: 0, atRisk: 0, scansToday: 0, activeTransfers: 0, recovered: 0, highRisk: 0,
    batchesAudited: 0, totalStock: 0, orgCount: 0,
  };

  const pipeline = [
    { k: 'Detect', icon: 'scan', v: s.scansToday + s.highRisk, sub: 'authenticity checks today' },
    { k: 'Predict', icon: 'beaker', v: s.atRisk, sub: 'batches at risk of expiry' },
    { k: 'Match', icon: 'arrows', v: (transfers || []).length, sub: 'redistributions matched' },
    { k: 'Act', icon: 'truck', v: s.activeTransfers, sub: 'transfers live right now' },
  ];

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <div className="border border-border-low bg-surface-panel p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Authorized Access Only</p>
            <h1 className="mt-1 text-3xl font-bold uppercase tracking-tight text-on-surface">Index: Protocol Zero</h1>
            <p className="mt-1 font-mono text-[11px] text-on-surface-variant">Record ID: PS-2024-882 · <span className="text-primary">{s.orgCount} facilities</span> connected</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] text-text-secondary">LIVE TIMESTAMP</p>
            <p className="font-mono text-xs text-primary" id="live-ts">{new Date().toISOString()}</p>
          </div>
        </div>
      </div>

      {/* Live Operations Ledger */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <StatCard label="Units Verified" value={<AnimatedNumber value={s.scansToday} />} sub="+1.2% Nominal" icon="scan" />
        <StatCard label="Units Rescued" value={<AnimatedNumber value={s.recovered} />} sub="+0.5% Nominal" icon="truck" tone="brand" />
        <StatCard label="Active Flags" value={<AnimatedNumber value={s.highRisk} />} sub="Critical Attention Required" icon="alert" tone="rose" />
      </div>

      {/* Primary Directives */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {pipeline.map((p, i) => (
          <div key={p.k} className="border border-border-low bg-surface-panel p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center border border-border-low bg-surface-high text-primary">
                <Icon name={p.icon} size={17} />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">{i + 1}. {p.k}</p>
                <p className="text-lg font-bold leading-tight text-on-surface">{p.v}</p>
                <p className="truncate font-mono text-[10px] text-text-secondary">{p.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Surplus Risk Board */}
          <SectionTitle title="Surplus Risk Board" sub="Stock − (Daily Burn × Days to Expiry) − Safety Buffer" />
          <Card className="border-border-low">
            {riskBoard.map((b) => (
              <button key={b.id} onClick={() => nav('/match?batch=' + b.id)} className="flex w-full items-center gap-3 border-b border-border-low px-4 py-3.5 text-left transition hover:bg-surface-high last:border-b-0">
                <span className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-on-surface">{b.name} {b.strength}</p>
                    <Pill label={b.level} className="shrink-0" />
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-text-secondary">
                    {b.surplus ? `${fmtNum(b.projectedSurplus)} units surplus · ` : 'No surplus · '}
                    {b.days} days to expiry · {b.stock} in stock
                  </p>
                </span>
                <span className="w-36 shrink-0"><ScoreBar score={b.score} /></span>
              </button>
            ))}
            {riskBoard.length === 0 && <p className="px-4 py-8 text-center font-mono text-xs text-text-secondary">No batches currently flagged for surplus.</p>}
          </Card>

          {/* Authenticity Verdicts */}
          <SectionTitle title="Authenticity Verdicts" sub="Distribution across the audit ledger" />
          <Card className="p-4">
            <div className="space-y-3">
              {[['Verified', 'primary'], ['Suspicious', 'tertiary'], ['High-Risk', 'error']].map(([v, tone]) => {
                const n = verdicts[v] || 0;
                const max = Math.max(1, n, ...Object.values(verdicts));
                return (
                  <div key={v} className="flex items-center gap-3">
                    <span className="w-24 font-mono text-[11px] text-on-surface-variant">{v}</span>
                    <div className="h-2 flex-1 bg-border-low">
                      <div className={`h-full ${tone === 'primary' ? 'bg-primary' : tone === 'tertiary' ? 'bg-tertiary' : 'bg-error'}`} style={{ width: `${(n / max) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-xs font-bold tabular-nums text-on-surface">{n}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Live Activity */}
        <div>
          <SectionTitle title="Live Activity" sub="Scans, matches and transfers" />
          <Card className="border-border-low">
            {activity.slice(0, 9).map((a) => (
              <div key={a.id} className="flex gap-3 border-b border-border-low px-4 py-3 last:border-b-0">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center border border-border-low bg-surface-high text-text-secondary">
                  <Icon name={ACTION_ICON[a.action] || 'audit'} size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-xs font-bold text-on-surface">{a.actor}</p>
                    <span className="shrink-0 font-mono text-[10px] text-text-secondary">{fmtDate(a.at)}</span>
                  </div>
                  <p className="truncate font-mono text-[11px] text-text-secondary">{a.city || '—'} · {a.result?.split('·')[0]}</p>
                </div>
              </div>
            ))}
            {activity.length === 0 && <p className="px-4 py-8 text-center font-mono text-xs text-text-secondary">No activity yet.</p>}
          </Card>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex flex-col gap-3 border border-primary bg-primary-container/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center border border-primary bg-primary-container text-on-primary"><Icon name="bolt" size={19} /></span>
          <div>
            <p className="text-sm font-bold text-on-surface">Why PharmSecure matters</p>
            <p className="max-w-xl text-xs leading-relaxed text-on-surface-variant">
              Counterfeit medicines cause over 1M deaths a year (WHO) while hospitals discard stock 30–60 days from expiry. PharmSecure doesn't just detect fakes — it prevents genuine medicine from becoming waste.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={() => nav('/verify')} className="border border-border-low bg-surface px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-primary hover:bg-primary-container/15 transition">Scan a medicine</button>
          <button onClick={() => nav('/match')} className="bg-primary-container px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-on-primary hover:bg-on-primary-container transition">Rescue surplus</button>
        </div>
      </div>
    </div>
  );
}
