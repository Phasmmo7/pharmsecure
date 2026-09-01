import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Card, StatCard, Pill, ScoreBar, fmtNum, fmtDate, Icon, AnimatedNumber, cx, Reveal } from '../components/ui.jsx';

/* ── Decorative SVG Graphics ── */
function ScanGraphic() {
  return (
    <svg className="absolute -right-4 -top-4 opacity-[0.06] pointer-events-none" width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="20" y="20" width="80" height="80" rx="8" stroke="#60a5fa" strokeWidth="2" strokeDasharray="6 4"/>
      <path d="M40 60H80M60 40V80" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="60" cy="60" r="20" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4"/>
      <circle cx="60" cy="60" r="4" fill="#3b82f6" fillOpacity="0.3"/>
      <path d="M30 30L45 45M90 30L75 45M30 90L45 75M90 90L75 75" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function ShieldGraphic() {
  return (
    <svg className="absolute -right-2 -bottom-2 opacity-[0.05] pointer-events-none" width="100" height="100" viewBox="0 0 100 100" fill="none">
      <path d="M50 10L85 30V55C85 75 50 95 50 95C50 95 15 75 15 55V30L50 10Z" stroke="#60a5fa" strokeWidth="2"/>
      <path d="M50 25L72 37V55C72 68 50 82 50 82C50 82 28 68 28 55V37L50 25Z" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 3"/>
      <path d="M45 55H55M50 50V60" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function BoxGraphic() {
  return (
    <svg className="absolute -right-3 -top-3 opacity-[0.05] pointer-events-none" width="90" height="90" viewBox="0 0 90 90" fill="none">
      <rect x="15" y="30" width="60" height="45" rx="4" stroke="#60a5fa" strokeWidth="1.5"/>
      <path d="M15 42H75" stroke="#3b82f6" strokeWidth="1"/>
      <rect x="22" y="50" width="20" height="3" rx="1" fill="#3b82f6" fillOpacity="0.2"/>
      <rect x="22" y="56" width="14" height="2" rx="1" fill="#3b82f6" fillOpacity="0.15"/>
      <path d="M35 15V30M55 15V30" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="45" cy="65" r="6" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3"/>
    </svg>
  );
}

function TruckGraphic() {
  return (
    <svg className="absolute -right-2 -bottom-2 opacity-[0.05] pointer-events-none" width="100" height="70" viewBox="0 0 100 70" fill="none">
      <rect x="5" y="15" width="55" height="35" rx="4" stroke="#60a5fa" strokeWidth="1.5"/>
      <path d="M60 25H78L92 40V50H60V25Z" stroke="#3b82f6" strokeWidth="1.5"/>
      <circle cx="25" cy="55" r="7" stroke="#60a5fa" strokeWidth="1.5"/>
      <circle cx="25" cy="55" r="2" fill="#3b82f6" fillOpacity="0.3"/>
      <circle cx="78" cy="55" r="7" stroke="#3b82f6" strokeWidth="1.5"/>
      <circle cx="78" cy="55" r="2" fill="#3b82f6" fillOpacity="0.3"/>
      <path d="M15 25H45" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3"/>
    </svg>
  );
}

function ActivityGraphic() {
  return (
    <svg className="absolute -right-3 -top-3 opacity-[0.05] pointer-events-none" width="80" height="80" viewBox="0 0 80 80" fill="none">
      <path d="M10 40H20L30 20L40 55L50 30L60 40H70" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="30" cy="20" r="3" fill="#3b82f6" fillOpacity="0.3"/>
      <circle cx="40" cy="55" r="3" fill="#60a5fa" fillOpacity="0.3"/>
      <circle cx="50" cy="30" r="3" fill="#3b82f6" fillOpacity="0.3"/>
    </svg>
  );
}

function DNAHelixGraphic() {
  return (
    <svg className="absolute -right-4 bottom-0 opacity-[0.04] pointer-events-none" width="60" height="140" viewBox="0 0 60 140" fill="none">
      <path d="M15 5C15 5 45 35 45 70C45 105 15 135 15 135" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="5 4"/>
      <path d="M45 5C45 5 15 35 15 70C15 105 45 135 45 135" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5 4"/>
      {[25,45,65,85,105,125].map((y, i) => (
        <line key={i} x1="20" y1={y} x2="40" y2={y} stroke="#60a5fa" strokeWidth="1" opacity="0.5"/>
      ))}
    </svg>
  );
}

function PillGraphic() {
  return (
    <svg className="absolute -right-3 -bottom-3 opacity-[0.05] pointer-events-none" width="80" height="40" viewBox="0 0 80 40" fill="none">
      <rect x="5" y="5" width="70" height="30" rx="15" stroke="#60a5fa" strokeWidth="1.5"/>
      <path d="M40 5V35" stroke="#3b82f6" strokeWidth="1"/>
      <circle cx="25" cy="20" r="5" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 2"/>
      <circle cx="55" cy="20" r="5" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2"/>
    </svg>
  );
}

export default function Dashboard() {
  const { stats, audits, transfers } = useStore();
  const nav = useNavigate();

  const riskBoard = stats?.riskBoard || [];
  const activity = audits || [];
  const verdicts = (audits || []).reduce((acc, a) => { acc[a.result] = (acc[a.result] || 0) + 1; return acc; }, {});

  const s = stats || { pendingSurplus: 0, atRisk: 0, scansToday: 0, activeTransfers: 0, recovered: 0, highRisk: 0, batchesAudited: 0, totalStock: 0, orgCount: 0 };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Reveal delay={0}>
          <StatCard label="Verified" value={<AnimatedNumber value={s.scansToday} />} sub="+1.2% today" icon="scan" tone="brand" />
        </Reveal>
        <Reveal delay={80}>
          <StatCard label="Rescued" value={<AnimatedNumber value={s.recovered} />} sub="units recovered" icon="check" tone="brand" />
        </Reveal>
        <Reveal delay={160}>
          <StatCard label="At Risk" value={<AnimatedNumber value={s.atRisk} />} sub="batches flagged" icon="alert" tone="rose" />
        </Reveal>
        <Reveal delay={240}>
          <StatCard label="In Transit" value={<AnimatedNumber value={s.activeTransfers} />} sub="active transfers" icon="truck" tone="amber" />
        </Reveal>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Main Content (3 cols) */}
        <div className="space-y-5 lg:col-span-3">
          {/* Surplus Risk Board */}
          <Reveal delay={100}>
            <Card className="overflow-hidden relative">
              <ScanGraphic />
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-500/5">
                    <Icon name="box" size={16} className="text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-mist-50">Surplus Risk Board</h3>
                    <p className="text-[10px] text-mist-500">Batches requiring attention</p>
                  </div>
                </div>
                <button onClick={() => nav('/match')} className="text-[11px] font-bold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
                  View All <Icon name="arrow-right" size={12} />
                </button>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {riskBoard.map((b, i) => (
                  <button key={b.id} onClick={() => nav('/match?batch=' + b.id)}
                    className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-all duration-200 hover:bg-white/[0.02] group"
                    style={{ animationDelay: `${i * 50}ms` }}>
                    <div className={cx('w-1 h-10 shrink-0 rounded-full transition-all duration-300 group-hover:h-12', b.level === 'Critical' ? 'bg-gradient-to-b from-rose-500 to-rose-600' : b.level === 'High' ? 'bg-gradient-to-b from-amber-400 to-amber-500' : 'bg-gradient-to-b from-blue-400 to-blue-500')} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[13px] font-semibold text-mist-100 group-hover:text-brand-300 transition-colors">{b.name} {b.strength}</p>
                        <Pill label={b.level} />
                      </div>
                      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-mist-500">
                        <span className="flex items-center gap-1">
                          <Icon name="box" size={10} />
                          {b.surplus ? `${fmtNum(b.projectedSurplus)} surplus` : 'No surplus'}
                        </span>
                        <span className="text-mist-600">·</span>
                        <span className="flex items-center gap-1">
                          <Icon name="clock" size={10} />
                          {b.days}d to expiry
                        </span>
                        <span className="text-mist-600">·</span>
                        <span className="flex items-center gap-1">
                          <Icon name="inventory" size={10} />
                          {b.stock} stock
                        </span>
                      </div>
                    </div>
                    <div className="w-24 shrink-0 hidden sm:block">
                      <ScoreBar score={b.score} h="h-1.5" />
                    </div>
                  </button>
                ))}
                {riskBoard.length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <ShieldGraphic />
                    <div className="grid size-12 place-items-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mx-auto mb-3">
                      <Icon name="check-circle" size={22} className="text-brand-400" />
                    </div>
                    <p className="text-[12px] font-semibold text-mist-300">All clear</p>
                    <p className="text-[11px] text-mist-500 mt-0.5">No batches flagged for risk</p>
                  </div>
                )}
              </div>
            </Card>
          </Reveal>

          {/* Pipeline */}
          <Reveal delay={200}>
            <div className="relative">
              <DNAHelixGraphic />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-mist-400 mb-3 px-1">Pipeline</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { k: 'Detect', icon: 'scan', v: s.scansToday + s.highRisk, color: 'from-blue-500/15 to-blue-500/5', accent: 'text-blue-400' },
                  { k: 'Predict', icon: 'alert', v: s.atRisk, color: 'from-amber-400/15 to-amber-400/5', accent: 'text-amber-400' },
                  { k: 'Match', icon: 'arrows', v: (transfers || []).length, color: 'from-violet-500/15 to-violet-500/5', accent: 'text-violet-400' },
                  { k: 'Act', icon: 'truck', v: s.activeTransfers, color: 'from-rose-500/15 to-rose-500/5', accent: 'text-rose-400' },
                ].map((p, i) => (
                  <div key={p.k} className="relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
                    <div className="relative p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={cx('grid size-9 place-items-center rounded-xl bg-gradient-to-br', p.color)}>
                          <Icon name={p.icon} size={15} className={p.accent} />
                        </div>
                        <span className="text-[9px] font-bold text-mist-600">{i + 1}/4</span>
                      </div>
                      <p className="text-[11px] font-bold text-mist-400 uppercase tracking-wider">{p.k}</p>
                      <p className="text-2xl font-black text-mist-50 mt-1 tracking-tight">{p.v}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Authenticity Verdicts */}
          <Reveal delay={300}>
            <Card className="p-5 relative overflow-hidden">
              <PillGraphic />
              <div className="flex items-center gap-3 mb-5">
                <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-500/5">
                  <Icon name="shield" size={16} className="text-brand-400" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-mist-50">Authenticity Verdicts</h3>
                  <p className="text-[10px] text-mist-500">Scan result distribution</p>
                </div>
              </div>
              <div className="space-y-4">
                {[['Verified', 'from-blue-500 to-blue-400', 'text-blue-300'], ['Suspicious', 'from-amber-400 to-amber-300', 'text-amber-300'], ['High-Risk', 'from-rose-500 to-rose-400', 'text-rose-300']].map(([v, gradient, textColor]) => {
                  const n = verdicts[v] || 0;
                  const max = Math.max(1, n, ...Object.values(verdicts));
                  return (
                    <div key={v} className="flex items-center gap-3">
                      <span className={`w-20 text-[11px] font-bold ${textColor}`}>{v}</span>
                      <div className="h-2 flex-1 bg-white/[0.04] overflow-hidden rounded-full">
                        <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700 ease-out`} style={{ width: `${(n / max) * 100}%` }} />
                      </div>
                      <span className="w-8 text-right text-[12px] font-black tabular-nums text-mist-200">{n}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </Reveal>
        </div>

        {/* Right Sidebar (2 cols) */}
        <div className="space-y-5 lg:col-span-2">
          {/* Live Activity */}
          <Reveal delay={150}>
            <Card className="overflow-hidden relative">
              <ActivityGraphic />
              <div className="px-5 py-4 border-b border-white/[0.04]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-500/5">
                      <Icon name="activity" size={16} className="text-brand-400" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-mist-50">Live Activity</h3>
                      <p className="text-[10px] text-mist-500">Recent scan events</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 bg-blue-400 rounded-full animate-live" />
                    <span className="text-[9px] font-bold text-mist-500">LIVE</span>
                  </div>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto divide-y divide-white/[0.03]">
                {activity.slice(0, 6).map((a, i) => (
                  <div key={a.id} className="flex gap-3 px-5 py-3.5 transition-all duration-200 hover:bg-white/[0.02] group">
                    <div className="flex flex-col items-center pt-1.5">
                      <div className={cx('size-2 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-panel', a.result === 'High-Risk' ? 'bg-rose-500 ring-rose-500/30' : a.result === 'Verified' ? 'bg-blue-500 ring-blue-500/30' : 'bg-amber-400 ring-amber-400/30')} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-[12px] font-semibold text-mist-100 group-hover:text-brand-300 transition-colors">{a.actor}</p>
                        <span className="shrink-0 text-[9px] font-medium text-mist-500">{fmtDate(a.at)}</span>
                      </div>
                      <p className="text-[10px] text-mist-500 mt-0.5">{a.city} · {a.action?.replace(/_/g, ' ')}</p>
                      <div className="mt-1.5"><Pill label={a.result} /></div>
                    </div>
                  </div>
                ))}
                {activity.length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <div className="grid size-12 place-items-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mx-auto mb-3">
                      <Icon name="activity" size={22} className="text-mist-500" />
                    </div>
                    <p className="text-[12px] font-semibold text-mist-300">No activity yet</p>
                    <p className="text-[11px] text-mist-500 mt-0.5">Scans will appear here</p>
                  </div>
                )}
              </div>
            </Card>
          </Reveal>

          {/* Quick Actions */}
          <Reveal delay={250}>
            <div className="space-y-2.5 relative">
              <BoxGraphic />
              <button onClick={() => nav('/verify')} className="w-full group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-4 text-left hover:border-brand-500/20 hover:from-brand-500/[0.05] transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-500/5 shadow-lg shadow-brand-500/10">
                    <Icon name="scan" size={20} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-mist-100 group-hover:text-brand-300 transition-colors">Scan Medicine</p>
                    <p className="text-[11px] text-mist-500 mt-0.5">Verify authenticity in seconds</p>
                  </div>
                  <Icon name="arrow-right" size={16} className="ml-auto text-mist-600 group-hover:text-brand-400 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </button>
              <button onClick={() => nav('/emergency')} className="w-full group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-4 text-left hover:border-rose-500/20 hover:from-rose-500/[0.05] transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-rose-500/15 to-rose-500/5 shadow-lg shadow-rose-500/10">
                    <Icon name="truck" size={20} className="text-rose-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-mist-100 group-hover:text-rose-300 transition-colors">Emergency Transfer</p>
                    <p className="text-[11px] text-mist-500 mt-0.5">Rapid medicine redistribution</p>
                  </div>
                  <Icon name="arrow-right" size={16} className="ml-auto text-mist-600 group-hover:text-rose-400 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </button>
            </div>
          </Reveal>

          {/* Info Card */}
          <Reveal delay={350}>
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06]">
              <TruckGraphic />
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
              <div className="relative p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-500/5">
                    <Icon name="bolt" size={16} className="text-brand-400" />
                  </div>
                  <p className="text-[13px] font-bold text-mist-100">Why PharmSecure</p>
                </div>
                <p className="text-[11px] text-mist-400 leading-relaxed">
                  Counterfeit medicines cause 1M+ deaths/year. PharmSecure detects fakes and prevents genuine medicine from becoming waste.
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-black text-brand-400">1M+</p>
                    <p className="text-[9px] text-mist-500">lives saved</p>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <p className="text-lg font-black text-brand-400">30%</p>
                    <p className="text-[9px] text-mist-500">waste reduced</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
