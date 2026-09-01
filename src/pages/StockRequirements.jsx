import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { Card, Pill, SectionTitle, Icon, fmtNum, cx } from '../components/ui.jsx';

export default function StockRequirements() {
  const { orgs, loadBatches, helpers, transfers } = useStore();
  const [batches, setBatches] = useState([]);
  const [q, setQ] = useState('');
  const [urgency, setUrgency] = useState('all');
  const [sort, setSort] = useState('days');

  useEffect(() => { loadBatches().then(setBatches).catch(() => {}); }, [loadBatches]);

  const rows = useMemo(() => {
    let list = (batches || []).map((b) => {
      const a = helpers.surplusAnalysis(b);
      const incoming = (transfers || []).filter((t) => t.batchId === b.id && t.status === 'in_transit');
      const incomingQty = incoming.reduce((s, t) => s + t.qty, 0);
      return { ...b, a, incomingQty, projected: b.stock + incomingQty - b.dailyBurn * 30 };
    });
    if (q) {
      const s = q.toLowerCase();
      list = list.filter((b) => (b.name + ' ' + b.generic + ' ' + b.strength).toLowerCase().includes(s));
    }
    if (urgency === 'critical') list = list.filter((b) => b.a.days < 15);
    if (urgency === 'surplus') list = list.filter((b) => b.a.surplus);
    if (urgency === 'shortage') list = list.filter((b) => !b.a.surplus && b.a.days > 0);
    if (sort === 'days') list.sort((a, b) => a.a.days - b.a.days);
    else if (sort === 'incoming') list.sort((a, b) => b.incomingQty - a.incomingQty);
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [batches, transfers, q, urgency, sort, helpers]);

  const totalShortage = rows.filter((b) => !b.a.surplus && b.a.days < 60).reduce((s, b) => s + Math.max(0, b.projected * -1), 0);

  return (
    <div className="space-y-5">
      <div className="border border-edge bg-panel px-6 py-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-300 mb-1">Supply Chain Intelligence</p>
            <h2 className="text-base font-semibold text-mist-50">Stock Requirements</h2>
            <p className="mt-0.5 text-[11px] text-mist-400">{rows.length} batches · {totalShortage > 0 ? <span className="text-rose-300">{fmtNum(totalShortage)} units projected shortage</span> : 'Sufficient stock'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] text-mist-500 uppercase tracking-wider">Days Until Shortage</p>
              <p className={cx('text-xl font-bold', totalShortage > 0 ? 'text-rose-300' : 'text-blue-300')}>{rows.length ? Math.min(...rows.filter((b) => !b.a.surplus).map((b) => b.a.days).filter((d) => d > 0)) : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-1">
          {[['all', 'All'], ['critical', 'Critical'], ['shortage', 'Shortage'], ['surplus', 'Surplus']].map(([k, l]) => (
            <button key={k} onClick={() => setUrgency(k)} className={cx(
              'px-3 py-1.5 text-[10px] font-semibold tracking-wide rounded-full transition-colors border',
              urgency === k ? 'border-brand-500/30 bg-brand-500/10 text-brand-300' : 'border-edge bg-panel2 text-mist-400 hover:border-brand-500/20',
            )}>{l}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="inputCls w-40" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-edge bg-panel2 px-3 py-2 text-xs font-medium text-mist-300 outline-none">
            <option value="days">Days Left</option>
            <option value="incoming">Incoming</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-edge">
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-mist-400">Medicine</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-mist-400">Stock</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-mist-400">Burn</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-mist-400">Days Left</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-mist-400">Incoming</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-mist-400">Projected (30d)</th>
                <th className="w-24 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-mist-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge/50">
              {rows.map((b) => (
                <tr key={b.id} className={cx('transition-colors hover:bg-panel2', b.a.days < 0 && 'bg-rose-500/5')}>
                  <td className="py-3 px-4">
                    <p className="text-[13px] font-medium text-mist-100">{b.name} {b.strength}</p>
                    <p className="text-[10px] text-mist-500 font-mono">{b.id.toUpperCase()} · {b.form}</p>
                  </td>
                  <td className="py-3 px-4 text-right text-[12px] text-mist-200">{fmtNum(b.stock)}</td>
                  <td className="py-3 px-4 text-right text-[12px] text-mist-400">{b.dailyBurn}/d</td>
                  <td className="py-3 px-4 text-right">
                    <span className={cx('text-[12px] font-semibold', b.a.days < 0 ? 'text-rose-300' : b.a.days <= 30 ? 'text-amber-300' : 'text-blue-300')}>{b.a.days}d</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {b.incomingQty > 0 ? (
                      <span className="text-[12px] text-brand-300 font-semibold">+{fmtNum(b.incomingQty)}</span>
                    ) : (
                      <span className="text-[12px] text-mist-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={cx('text-[12px] font-semibold', b.projected < 0 ? 'text-rose-300' : b.projected < b.dailyBurn * 15 ? 'text-amber-300' : 'text-mist-200')}>{fmtNum(b.projected)}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {b.a.days < 0 ? <Pill label="Expired" /> : b.a.surplus ? <Pill label="Surplus" /> : b.a.days <= 30 ? <Pill label="Critical" /> : <Pill label="OK" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="px-4 py-10 text-center text-[11px] text-mist-500">No batches match.</p>}
      </Card>
    </div>
  );
}
