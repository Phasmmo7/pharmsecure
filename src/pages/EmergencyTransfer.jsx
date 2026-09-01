import { useEffect, useMemo, useState } from 'react';
import { useStore, ORG_TYPES } from '../store.jsx';
import { Card, Pill, Drawer, Button, Field, inputCls, SectionTitle, Icon, fmtNum, fmtDate, cx } from '../components/ui.jsx';

export default function EmergencyTransfer() {
  const { orgs, batches, helpers, addTransfer, loadBatches } = useStore();
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadBatches(); }, [loadBatches]);

  const batchesAtRisk = useMemo(() => {
    return (batches || []).filter((b) => helpers.surplusAnalysis(b).atRisk).sort((a, b) => helpers.surplusAnalysis(a).days - helpers.surplusAnalysis(b).days);
  }, [batches, helpers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const f = Object.fromEntries(fd);
    await addTransfer({
      batchId: f.batchId,
      qty: +f.qty,
      fromOrgId: f.fromOrgId,
      toOrgId: f.toOrgId,
      reason: f.reason,
      urgency: 'emergency',
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="border border-edge bg-panel px-6 py-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-300 mb-1">Critical Stock Alerts</p>
            <h2 className="text-base font-semibold text-mist-50">Emergency Transfer</h2>
            <p className="mt-0.5 text-[11px] text-mist-400">{batchesAtRisk.length} batches at critical risk requiring immediate action</p>
          </div>
          <Button onClick={() => setShowForm(true)} icon="plus" size="sm">New Transfer</Button>
        </div>
      </div>

      <div className="space-y-3">
        {batchesAtRisk.map((b) => {
          const a = helpers.surplusAnalysis(b);
          return (
            <Card key={b.id} className="p-4 border-l-2 border-l-rose-500 hover:bg-panel2 transition-colors cursor-pointer" onClick={() => setSelected({ ...b, a })}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-rose-500/10 text-rose-300">
                    <Icon name="alert" size={16} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-mist-100">{b.name} {b.strength}</p>
                    <p className="text-[10px] text-mist-500 font-mono">{b.id.toUpperCase()} · {b.form} · {fmtNum(b.stock)} units</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={cx('text-lg font-bold', a.days < 0 ? 'text-rose-300' : 'text-amber-300')}>{a.days}d</span>
                  <p className="text-[9px] text-mist-500">exp {fmtDate(b.expiry)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-mist-400">{a.projectedSurplus > 0 ? `${fmtNum(a.projectedSurplus)} surplus` : 'No surplus'}</span>
                <Button onClick={(e) => { e.stopPropagation(); setSelected({ ...b, a }); setShowForm(true); }} icon="truck" size="sm" variant="soft">Transfer</Button>
              </div>
            </Card>
          );
        })}
        {batchesAtRisk.length === 0 && (
          <Card className="p-10 text-center border border-edge">
            <span className="grid size-12 place-items-center rounded-lg bg-blue-500/10 text-blue-300 mx-auto mb-2"><Icon name="check" size={22} /></span>
            <p className="text-sm font-semibold text-mist-100">No Critical Batches</p>
            <p className="text-[11px] text-mist-500 mt-1">All stock levels are within safe range</p>
          </Card>
        )}
      </div>

      <Drawer open={showForm} onClose={() => setShowForm(false)} title="Emergency Transfer Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Batch ID" name="batchId">
            <input name="batchId" list="batch-list" className={cx(inputCls, 'font-mono')} defaultValue={selected?.id || ''} placeholder="Enter batch ID" />
          </Field>
          <datalist id="batch-list">
            {(batches || []).map((b) => <option key={b.id} value={b.id}>{b.name} {b.strength} ({fmtNum(b.stock)} units)</option>)}
          </datalist>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity" name="qty">
              <input name="qty" type="number" className={inputCls} defaultValue={selected?.a?.projectedSurplus || 0} />
            </Field>
            <div>
              <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-mist-400">Urgency</span>
              <div className="flex items-center gap-2 p-3 rounded-lg border border-rose-500/30 bg-rose-500/5">
                <Icon name="alert" size={14} className="text-rose-300" />
                <span className="text-[11px] font-semibold text-rose-300">Emergency</span>
              </div>
            </div>
          </div>
          <Field label="From Organization" name="fromOrgId">
            <select name="fromOrgId" className={inputCls}>
              <option value="">Select source</option>
              {Object.values(orgs).filter((o) => o.type === ORG_TYPES.HOSPITAL || o.type === ORG_TYPES.CLINIC || o.type === ORG_TYPES.NGO).map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </Field>
          <Field label="To Organization" name="toOrgId">
            <select name="toOrgId" className={inputCls}>
              <option value="">Select destination</option>
              {Object.values(orgs).filter((o) => o.type === ORG_TYPES.HOSPITAL || o.type === ORG_TYPES.CLINIC).map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Reason for Transfer" name="reason">
            <textarea name="reason" rows={3} className={inputCls} placeholder="Brief description of the emergency..." />
          </Field>
          <Button type="submit" icon="truck" className="w-full">Submit Emergency Transfer</Button>
        </form>
      </Drawer>

      <Drawer open={!!selected && !showForm} onClose={() => setSelected(null)} title={selected ? (selected.name + ' ' + selected.strength) : ''}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-rose-500/10 text-rose-300"><Icon name="alert" size={16} /></span>
                <div>
                  <p className="text-[13px] font-semibold text-mist-100">{selected.name} {selected.strength}</p>
                  <p className="text-[10px] text-mist-500 font-mono">{selected.id.toUpperCase()} · {selected.form}</p>
                </div>
              </div>
              <Pill label={selected.a.level} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-edge bg-panel2 p-3 rounded">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-mist-500">Stock</p>
                <p className="mt-1 text-xl font-bold text-mist-100">{fmtNum(selected.stock)}</p>
              </div>
              <div className="border border-edge bg-panel2 p-3 rounded">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-mist-500">Days Left</p>
                <p className={cx('mt-1 text-xl font-bold', selected.a.days < 0 ? 'text-rose-300' : 'text-amber-300')}>{selected.a.days}d</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)} icon="truck" className="w-full">Initiate Transfer</Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
