import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Card, Pill, ScoreBar, Drawer, SectionTitle, Chip, fmtNum, Button, Icon } from '../components/ui.jsx';

const TABS = [['all', 'All batches'], ['atrisk', 'At risk'], ['surplus', 'Surplus'], ['expired', 'Expired']];

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

  return (
    <div className="animate-fade-up space-y-4">
      <SectionTitle title="Inventory ledger" sub="One live ledger driving verification, expiry and redistribution" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map(([k, label]) => (
            <Chip key={k} active={tab === k} onClick={() => setTab(k)}>{label} <span className="opacity-60">{counts[k] ?? 0}</span></Chip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search medicines…"
            className="w-full rounded-xl border border-edge bg-panel2 px-3.5 py-2 text-sm text-mist-100 outline-none placeholder:text-mist-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 sm:w-56"
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-edge bg-panel2 px-3 py-2 text-xs font-semibold text-mist-300 outline-none">
            <option value="risk">Sort: risk</option>
            <option value="days">Sort: expiry</option>
            <option value="stock">Sort: stock</option>
          </select>
        </div>
      </div>

      <Card className="hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-edge text-[10px] font-bold uppercase tracking-wider text-mist-400">
              <th className="px-4 py-3">Medicine</th>
              <th className="px-4 py-3">Holder</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Burn/day</th>
              <th className="px-4 py-3 text-right">Days</th>
              <th className="px-4 py-3 text-right">Projected surplus</th>
              <th className="w-40 px-4 py-3">Surplus risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {rows.map((b) => (
              <tr key={b.id} onClick={() => setSelected(b)} className="cursor-pointer transition hover:bg-brand-500/5">
                <td className="px-4 py-3">
                  <p className="font-semibold text-mist-100">{b.name} <span className="font-normal text-mist-500">{b.strength}</span></p>
                  <p className="text-[11px] text-mist-500">{b.id.toUpperCase()}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-mist-200">{orgs[b.holderId]?.name}</p>
                  <p className="text-[11px] text-mist-500">{orgs[b.holderId]?.city}</p>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-mist-200">{fmtNum(b.stock)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-mist-300">{b.dailyBurn}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span className={b.a.days < 0 ? 'text-rose-300' : b.a.days <= 30 ? 'text-amber-300' : 'text-mist-200'}>{b.a.days}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span className={b.a.projectedSurplus > 0 ? 'font-bold text-brand-300' : 'text-mist-500'}>{b.a.projectedSurplus > 0 ? fmtNum(b.a.projectedSurplus) : '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ScoreBar score={b.a.score} h="h-1.5" showLabel={false} />
                    <Pill label={b.a.level} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-4 py-10 text-center text-xs text-mist-500">No batches match this filter.</p>}
      </Card>

      <div className="space-y-3 md:hidden">
        {rows.map((b) => (
          <Card key={b.id} className="p-4" onClick={() => setSelected(b)}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-mist-100">{b.name} <span className="font-normal text-mist-500">{b.strength}</span></p>
                <p className="text-[11px] text-mist-500">{orgs[b.holderId]?.name} · {fmtNum(b.stock)} units</p>
              </div>
              <Pill label={b.a.level} />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1"><ScoreBar score={b.a.score} h="h-1.5" /></div>
              <span className="text-[11px] text-mist-500">{b.a.days}d left</span>
            </div>
            {b.a.surplus && (
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold text-brand-300">
                <Icon name="droplet" size={11} /> {fmtNum(b.a.projectedSurplus)} units surplus
              </p>
            )}
          </Card>
        ))}
        {rows.length === 0 && <p className="py-10 text-center text-xs text-mist-500">No batches match this filter.</p>}
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
          <span className={a.projectedSurplus > 0 ? 'grid size-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300' : 'grid size-10 place-items-center rounded-xl bg-panel2 text-mist-400'}>
            <Icon name={a.days < 0 ? 'alert' : 'box'} size={19} />
          </span>
          <div>
            <p className="text-sm font-bold text-mist-100">{b.name} {b.strength}</p>
            <p className="text-xs text-mist-500">{b.id.toUpperCase()} · {b.form}</p>
          </div>
        </div>
        <Pill label={a.level} />
      </div>

      <div className="rounded-xl bg-panel2/80 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-mist-400">Surplus formula</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-mist-200">
          {formula.map((f, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {f.op && <span className="text-mist-500">{f.op}</span>}
              <span className="rounded-md bg-panel px-2 py-1 ring-1 ring-edge">
                {f.label === 'Days to expiry' ? `${f.value} d` : fmtNum(f.value)}
              </span>
            </span>
          ))}
          <span className="text-mist-500">=</span>
          <span className={a.projectedSurplus > 0 ? 'rounded-md bg-brand-500 px-2 py-1 text-void' : 'rounded-md bg-mist-700 px-2 py-1 text-mist-200'}>
            {fmtNum(a.projectedSurplus)} projected surplus
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="text-mist-400">Risk score</span>
          <ScoreBar score={a.score} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-mist-200">Intelligence notes</p>
        <ul className="space-y-1.5">
          {a.notes.map((n, i) => (
            <li key={i} className="flex gap-2 rounded-lg bg-brand-500/10 px-3 py-2 text-xs text-mist-200"><Icon name="bolt" size={13} className="mt-0.5 shrink-0 text-brand-300" />{n}</li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-edge px-3 py-2">
          <p className="text-[10px] font-semibold uppercase text-mist-400">Holder</p>
          <p className="mt-0.5 font-semibold text-mist-100">{holder?.name}</p>
          <p className="text-[11px] text-mist-500">{holder?.city} · {holder?.type}</p>
        </div>
        <div className="rounded-lg border border-edge px-3 py-2">
          <p className="text-[10px] font-semibold uppercase text-mist-400">Manufacturer</p>
          <p className="mt-0.5 font-semibold text-mist-100">{mfg?.name}</p>
          <p className="text-[11px] text-mist-500">trust {mfg?.trustScore}/100</p>
        </div>
      </div>

      {a.surplus && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-brand-500/25 to-emerald-500/10 p-4">
          <div>
            <p className="text-xs font-bold text-mist-100">Rescuable surplus — {fmtNum(a.projectedSurplus)} units</p>
            <p className="text-[11px] text-mist-400">Rank nearby clinics, NGOs and pharmacies by proximity, urgency, demand and trust.</p>
          </div>
          <Button onClick={onMatch} icon="arrows" className="shrink-0 bg-brand-500 text-void hover:bg-brand-400">Find matches</Button>
        </div>
      )}
    </div>
  );
}
