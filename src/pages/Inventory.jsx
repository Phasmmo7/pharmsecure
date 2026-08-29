import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Card, Pill, ScoreBar, Drawer, SectionTitle, Chip, fmtNum, Button, Icon } from '../components/ui.jsx';

const TABS = [['all', 'All Schedules'], ['atrisk', 'Critical Only'], ['surplus', 'Near Expiry'], ['expired', 'Expired']];

export default function Inventory() {
  const { orgs, loadBatches, helpers } = useStore();
  const nav = useNavigate();
  const [batches, setBatches] = useState([]);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all');
  const [sort, setSort] = useState('risk');
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadBatches().then(setBatches).catch(() => {}); }, [loadBatches]);

  const rows = useMemo(() => {
    let list = (batches || []).map((b) => ({ ...b, a: helpers.surplusAnalysis(b) }));
    if (q) {
      const s = q.toLowerCase();
      list = list.filter((b) => (b.name + ' ' + b.generic + ' ' + b.strength + ' ' + b.id).toLowerCase().includes(s));
    }
    if (tab === 'atrisk') list = list.filter((b) => b.a.atRisk);
    if (tab === 'surplus') list = list.filter((b) => b.a.surplus);
    if (tab === 'expired') list = list.filter((b) => b.a.level === 'Expired');
    const key = sort === 'days' ? 'days' : sort === 'stock' ? 'stock' : 'score';
    return list.sort((x, y) => (key === 'days' ? x.a.days - y.a.days : key === 'stock' ? y.stock - x.stock : y.a.score - x.a.score));
  }, [batches, q, tab, sort, helpers]);

  const counts = useMemo(() => {
    const all = (batches || []).map((b) => helpers.surplusAnalysis(b));
    return {
      all: all.length,
      atrisk: all.filter((b) => b.atRisk).length,
      surplus: all.filter((b) => b.surplus).length,
      expired: all.filter((b) => b.level === 'Expired').length,
    };
  }, [batches, helpers]);

  const totalUnits = rows.reduce((s, b) => s + b.stock, 0);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between border border-border-low bg-surface-panel p-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Inventory Manifest — Classified</p>
          <h1 className="mt-1 text-xl font-bold uppercase tracking-tight text-on-surface">Stock Ledger</h1>
          <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant">Sector 7 Depot · Operational</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-mono text-[10px] text-text-secondary">TOTAL UNITS</p>
            <p className="text-lg font-bold text-primary">{fmtNum(totalUnits)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map(([k, label]) => (
            <Chip key={k} active={tab === k} onClick={() => setTab(k)}>{label} <span className="opacity-60">{counts[k] ?? 0}</span></Chip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="QUERY LEDGER..."
            className="bureaucratic-input sm:w-56"
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-border-low bg-surface px-3 py-2 font-mono text-[11px] text-text-secondary outline-none">
            <option value="risk">Sort: Risk</option>
            <option value="days">Sort: Expiry</option>
            <option value="stock">Sort: Stock</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <Card className="hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-low bg-surface-low">
              <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Medicine</th>
              <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Holder</th>
              <th className="px-4 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Stock</th>
              <th className="px-4 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Burn/day</th>
              <th className="px-4 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Days</th>
              <th className="px-4 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Surplus</th>
              <th className="w-40 px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-low">
            {rows.map((b) => (
              <tr key={b.id} onClick={() => setSelected(b)} className="cursor-pointer transition hover:bg-surface-high">
                <td className="px-4 py-3">
                  <p className="font-bold text-on-surface">{b.name} <span className="font-normal text-on-surface-variant">{b.strength}</span></p>
                  <p className="font-mono text-[11px] text-text-secondary">{b.id.toUpperCase()}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-on-surface-variant">{orgs[b.holderId]?.name}</p>
                  <p className="font-mono text-[11px] text-text-secondary">{orgs[b.holderId]?.city}</p>
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-on-surface">{fmtNum(b.stock)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-on-surface-variant">{b.dailyBurn}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  <span className={b.a.days < 0 ? 'text-error' : b.a.days <= 30 ? 'text-tertiary' : 'text-on-surface'}>{b.a.days}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  <span className={b.a.projectedSurplus > 0 ? 'font-bold text-primary' : 'text-text-secondary'}>{b.a.projectedSurplus > 0 ? fmtNum(b.a.projectedSurplus) : '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ScoreBar score={b.a.score} h="h-1" showLabel={false} />
                    <Pill label={b.a.level} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-4 py-10 text-center font-mono text-xs text-text-secondary">No batches match this filter.</p>}
      </Card>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((b) => (
          <Card key={b.id} className="p-4 border-border-low" onClick={() => setSelected(b)}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-on-surface">{b.name} <span className="font-normal text-on-surface-variant">{b.strength}</span></p>
                <p className="font-mono text-[11px] text-text-secondary">{orgs[b.holderId]?.name} · {fmtNum(b.stock)} units</p>
              </div>
              <Pill label={b.a.level} />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1"><ScoreBar score={b.a.score} h="h-1" /></div>
              <span className="font-mono text-[11px] text-text-secondary">{b.a.days}d left</span>
            </div>
            {b.a.surplus && (
              <p className="mt-2 inline-flex items-center gap-1 border border-primary bg-primary-container/15 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-primary">
                <Icon name="droplet" size={11} /> {fmtNum(b.a.projectedSurplus)} units surplus
              </p>
            )}
          </Card>
        ))}
        {rows.length === 0 && <p className="py-10 text-center font-mono text-xs text-text-secondary">No batches match this filter.</p>}
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.name} ${selected.strength}` : ''} wide>
        {selected && <BatchDetail b={selected} analysis={selected.a} onMatch={() => { const id = selected.id; setSelected(null); nav('/match?batch=' + id); }} holder={orgs[selected.holderId]} mfg={orgs[selected.mfgId]} />}
      </Drawer>
    </div>
  );
}

function BatchDetail({ b, analysis: a, holder, mfg, onMatch }) {
  const formula = [
    { label: 'Current stock', value: b.stock, op: null },
    { label: 'Daily burn', value: b.dailyBurn, op: '×' },
    { label: 'Days to expiry', value: a.days, op: '×' },
    { label: 'Safety buffer', value: b.safetyBuffer, op: '−' },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={a.projectedSurplus > 0 ? 'grid size-10 place-items-center border border-primary bg-primary-container/15 text-primary' : 'grid size-10 place-items-center border border-border-low bg-surface-high text-text-secondary'}>
            <Icon name={a.days < 0 ? 'alert' : 'box'} size={19} />
          </span>
          <div>
            <p className="text-sm font-bold text-on-surface">{b.name} {b.strength}</p>
            <p className="font-mono text-[11px] text-text-secondary">{b.id.toUpperCase()} · {b.form}</p>
          </div>
        </div>
        <Pill label={a.level} />
      </div>

      <div className="border border-border-low bg-surface p-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Surplus Formula</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-on-surface">
          {formula.map((f, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {f.op && <span className="text-text-secondary">{f.op}</span>}
              <span className="border border-border-low bg-surface-high px-2 py-1 font-mono text-[11px]">
                {f.label === 'Days to expiry' ? `${f.value} d` : fmtNum(f.value)}
              </span>
            </span>
          ))}
          <span className="text-text-secondary">=</span>
          <span className={a.projectedSurplus > 0 ? 'bg-primary-container px-2 py-1 font-mono text-[11px] text-on-primary' : 'border border-border-low bg-surface-high px-2 py-1 font-mono text-[11px] text-on-surface-variant'}>
            {fmtNum(a.projectedSurplus)} projected surplus
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="font-mono text-text-secondary">Risk score</span>
          <ScoreBar score={a.score} />
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">Intelligence Notes</p>
        <ul className="space-y-1.5">
          {a.notes.map((n, i) => (
            <li key={i} className="flex gap-2 border-l-2 border-primary bg-primary-container/10 px-3 py-2 font-mono text-[11px] text-on-surface"><Icon name="bolt" size={13} className="mt-0.5 shrink-0 text-primary" />{n}</li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border border-border-low px-3 py-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary">Holder</p>
          <p className="mt-0.5 text-xs font-bold text-on-surface">{holder?.name}</p>
          <p className="font-mono text-[11px] text-text-secondary">{holder?.city} · {holder?.type}</p>
        </div>
        <div className="border border-border-low px-3 py-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary">Manufacturer</p>
          <p className="mt-0.5 text-xs font-bold text-on-surface">{mfg?.name}</p>
          <p className="font-mono text-[11px] text-text-secondary">trust {mfg?.trustScore}/100</p>
        </div>
      </div>

      {a.surplus && (
        <div className="flex items-center justify-between gap-3 border border-primary bg-primary-container/15 p-4">
          <div>
            <p className="text-xs font-bold text-on-surface">Rescuable surplus — {fmtNum(a.projectedSurplus)} units</p>
            <p className="font-mono text-[11px] text-on-surface-variant">Rank nearby clinics, NGOs and pharmacies by proximity, urgency, demand and trust.</p>
          </div>
          <Button onClick={onMatch} icon="arrows" className="shrink-0">Find matches</Button>
        </div>
      )}
    </div>
  );
}
