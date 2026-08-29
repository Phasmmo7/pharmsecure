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
    <div className="animate-fade-up space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Rescuable surplus" value={<AnimatedNumber value={s.pendingSurplus} />} sub="units forecast to expire" icon="droplet" />
        <StatCard label="Batches at risk" value={<AnimatedNumber value={s.atRisk} />} sub="flagged by expiry intelligence" icon="alert" tone="amber" />
        <StatCard label="Checks today" value={<AnimatedNumber value={s.scansToday} />} sub="authenticity verifications" icon="scan" />
        <StatCard label="Transfers live" value={<AnimatedNumber value={s.activeTransfers} />} sub={`${fmtNum(s.recovered)} units recovered`} icon="truck" tone="violet" />
      </div>

      <Card className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
        {pipeline.map((p, i) => (
          <div key={p.k} className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300"><Icon name={p.icon} size={17} /></span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mist-400">{i + 1}. {p.k}</p>
              <p className="text-lg font-bold leading-tight text-mist-100">{p.v}</p>
              <p className="truncate text-[10px] text-mist-500">{p.sub}</p>
            </div>
          </div>
        ))}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionTitle title="Surplus Risk Board" sub="Stock − (Daily Burn × Days to Expiry) − Safety Buffer" />
          <Card className="divide-y divide-edge">
            {riskBoard.map((b) => (
              <button key={b.id} onClick={() => nav('/match?batch=' + b.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-brand-500/5">
                <span className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-mist-100">{b.name} {b.strength}</p>
                    <Pill label={b.level} className="shrink-0" />
                  </div>
                  <p className="mt-0.5 text-[11px] text-mist-500">
                    {b.surplus ? `${fmtNum(b.projectedSurplus)} units surplus · ` : 'No surplus · '}
                    {b.days} days to expiry · {b.stock} in stock
                  </p>
                </span>
                <span className="w-36 shrink-0"><ScoreBar score={b.score} /></span>
              </button>
            ))}
            {riskBoard.length === 0 && <p className="px-4 py-8 text-center text-xs text-mist-500">No batches currently flagged for surplus.</p>}
          </Card>

          <SectionTitle title="Authenticity verdicts" sub="distribution across the audit ledger" />
          <Card className="p-4">
            <div className="space-y-3">
              {[['Verified', 'emerald'], ['Suspicious', 'amber'], ['High-Risk', 'rose']].map(([v, tone]) => {
                const n = verdicts[v] || 0;
                const max = Math.max(1, n, ...Object.values(verdicts));
                return (
                  <div key={v} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-medium text-mist-300">{v}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-mist-700/50">
                      <div className={`h-full rounded-full ${tone === 'emerald' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${(n / max) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs font-bold tabular-nums text-mist-200">{n}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div>
          <SectionTitle title="Live activity" sub="scans, matches and transfers" />
          <Card className="divide-y divide-edge">
            {activity.slice(0, 9).map((a) => (
              <div key={a.id} className="flex gap-3 px-4 py-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-panel2 text-mist-400">
                  <Icon name={ACTION_ICON[a.action] || 'audit'} size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-mist-100">{a.actor}</p>
                    <span className="shrink-0 text-[10px] text-mist-500">{fmtDate(a.at)}</span>
                  </div>
                  <p className="truncate text-[11px] text-mist-500">{a.city || '—'} · {a.result?.split('·')[0]}</p>
                </div>
              </div>
            ))}
            {activity.length === 0 && <p className="px-4 py-8 text-center text-xs text-mist-500">No activity yet.</p>}
          </Card>
        </div>
      </div>

      <Card className="flex flex-col gap-3 border-brand-500/30 bg-gradient-to-r from-brand-500/10 to-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-void glow"><Icon name="bolt" size={19} /></span>
          <div>
            <p className="text-sm font-bold text-mist-100">Why PharmSecure matters</p>
            <p className="max-w-xl text-xs leading-relaxed text-mist-400">
              Counterfeit medicines cause over 1M deaths a year (WHO) while hospitals discard stock 30–60 days from expiry. PharmSecure doesn't just detect fakes — it prevents genuine medicine from becoming waste.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={() => nav('/verify')} className="rounded-xl bg-panel2 px-4 py-2 text-xs font-bold text-brand-200 ring-1 ring-inset ring-brand-500/40 hover:bg-brand-500/10">Scan a medicine</button>
          <button onClick={() => nav('/match')} className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-void hover:bg-brand-400">Rescue surplus</button>
        </div>
      </Card>
    </div>
  );
}