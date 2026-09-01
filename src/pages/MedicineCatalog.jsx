import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { Card, Pill, Drawer, Button, SectionTitle, Icon, fmtNum, cx } from '../components/ui.jsx';

const FORMS = ['All', 'Tablet', 'Capsule', 'Injectable', 'IV Fluid', 'Inhaler', 'Syrup', 'Solution', 'Cream', 'Ointment', 'Drops', 'Suspension', 'Gargle'];

export default function MedicineCatalog() {
  const { orgs, loadBatches, helpers } = useStore();
  const [batches, setBatches] = useState([]);
  const [q, setQ] = useState('');
  const [formFilter, setFormFilter] = useState('All');
  const [sort, setSort] = useState('name');
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadBatches().then(setBatches).catch(() => {}); }, [loadBatches]);

  const rows = useMemo(() => {
    let list = batches || [];
    if (q) {
      const s = q.toLowerCase();
      list = list.filter((b) => (b.name + ' ' + b.generic + ' ' + b.strength + ' ' + b.form).toLowerCase().includes(s));
    }
    if (formFilter !== 'All') list = list.filter((b) => b.form === formFilter);
    if (sort === 'price') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'stock') list = [...list].sort((a, b) => b.stock - a.stock);
    else list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [batches, q, formFilter, sort]);

  const totalValue = rows.reduce((s, b) => s + b.price * b.stock, 0);
  const totalStock = rows.reduce((s, b) => s + b.stock, 0);

  return (
    <div className="space-y-5">
      <div className="border border-edge bg-panel px-6 py-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-400 mb-1">Pharmaceutical Database</p>
            <h2 className="text-base font-semibold text-mist-50">Medicine Catalog</h2>
            <p className="mt-0.5 text-[11px] text-mist-400">{rows.length} medicines · ₹{fmtNum(totalValue)} total value · {fmtNum(totalStock)} stock</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[9px] text-mist-500 uppercase tracking-wider">Avg Price</p>
              <p className="text-xl font-bold text-brand-300">₹{rows.length ? Math.round(totalValue / totalStock) || 0 : 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-1 flex-wrap">
          {FORMS.map((f) => (
            <button key={f} onClick={() => setFormFilter(f)} className={cx(
              'px-2.5 py-1 text-[10px] font-semibold tracking-wide rounded-full transition-colors border',
              formFilter === f ? 'border-brand-500/30 bg-brand-500/10 text-brand-300' : 'border-edge bg-panel2 text-mist-400 hover:border-brand-500/20',
            )}>{f}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="inputCls w-40" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-edge bg-panel2 px-3 py-2 text-xs font-medium text-mist-300 outline-none">
            <option value="name">Name</option>
            <option value="price">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="stock">Stock</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((b) => {
          const a = helpers.surplusAnalysis(b);
          return (
            <Card key={b.id} className="p-4 cursor-pointer hover:bg-panel2 transition-colors" onClick={() => setSelected({ ...b, a })}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[13px] font-semibold text-mist-100">{b.name}</p>
                  <p className="text-[10px] text-mist-500">{b.form} · {b.strength}</p>
                </div>
                <Pill label={a.level} />
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="border border-edge bg-panel2 p-1.5 rounded">
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-mist-500">STOCK</p>
                  <p className="text-[11px] font-semibold text-mist-100 mt-0.5">{fmtNum(b.stock)}</p>
                </div>
                <div className="border border-brand-500/20 bg-brand-500/5 p-1.5 rounded">
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-brand-400">PRICE</p>
                  <p className="text-[11px] font-semibold text-brand-300 mt-0.5">₹{b.price}</p>
                </div>
                <div className="border border-edge bg-panel2 p-1.5 rounded">
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-mist-500">VALUE</p>
                  <p className="text-[11px] font-semibold text-mist-100 mt-0.5">₹{fmtNum(b.price * b.stock)}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-mist-500">{orgs[b.holderId]?.name}</span>
                <span className={cx('text-[10px] font-semibold', a.days <= 30 ? 'text-amber-300' : 'text-mist-500')}>{a.days}d left</span>
              </div>
            </Card>
          );
        })}
        {rows.length === 0 && <Card className="col-span-full p-10 text-center text-xs text-mist-500">No medicines match this filter.</Card>}
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected ? (selected.name + ' ' + selected.strength) : ''} wide>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-brand-500/10 text-brand-300"><Icon name="beaker" size={16} /></span>
                <div>
                  <p className="text-[13px] font-semibold text-mist-100">{selected.name} {selected.strength}</p>
                  <p className="text-[10px] text-mist-500">{selected.generic} · {selected.form}</p>
                </div>
              </div>
              <Pill label={selected.a.level} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-edge bg-panel2 p-3 rounded">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-mist-500">Price/Unit</p>
                <p className="mt-1 text-xl font-bold text-brand-300">₹{selected.price}</p>
              </div>
              <div className="border border-edge bg-panel2 p-3 rounded">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-mist-500">Total Value</p>
                <p className="mt-1 text-xl font-bold text-mist-100">₹{fmtNum(selected.price * selected.stock)}</p>
              </div>
            </div>
            <div className="border border-edge bg-panel2 p-3 rounded grid grid-cols-3 gap-2 text-center">
              <div><p className="text-[8px] font-semibold uppercase tracking-wider text-mist-500">STOCK</p><p className="text-lg font-bold text-mist-100 mt-0.5">{fmtNum(selected.stock)}</p></div>
              <div><p className="text-[8px] font-semibold uppercase tracking-wider text-mist-500">BURN</p><p className="text-lg font-bold text-amber-300 mt-0.5">{selected.dailyBurn}</p></div>
              <div><p className="text-[8px] font-semibold uppercase tracking-wider text-mist-500">DAYS</p><p className={cx('text-lg font-bold mt-0.5', selected.a.days < 0 ? 'text-rose-300' : 'text-blue-300')}>{selected.a.days}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-edge bg-panel p-3 rounded">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-mist-500">Holder</p>
                <p className="mt-1 text-[11px] font-semibold text-mist-100">{orgs[selected.holderId]?.name}</p>
                <p className="text-[10px] text-mist-500">{orgs[selected.holderId]?.city}</p>
              </div>
              <div className="border border-edge bg-panel p-3 rounded">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-mist-500">Manufacturer</p>
                <p className="mt-1 text-[11px] font-semibold text-mist-100">{orgs[selected.mfgId]?.name}</p>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
