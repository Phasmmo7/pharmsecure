import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { useStore } from '../store.jsx';
import { Card, Button, Field, inputCls, Icon, cx, fmtNum } from '../components/ui.jsx';

const PRESETS = [
  { name: 'Amoxicillin', generic: 'Amoxicillin', form: 'Capsule', strength: '500 mg' },
  { name: 'Metformin', generic: 'Metformin HCl', form: 'Tablet', strength: '500 mg' },
  { name: 'Insulin Glargine', generic: 'Insulin Glargine', form: 'Injectable', strength: '100 IU/mL', cold: true },
  { name: 'Azithromycin', generic: 'Azithromycin', form: 'Tablet', strength: '250 mg' },
  { name: 'Salbutamol', generic: 'Salbutamol', form: 'Inhaler', strength: '100 mcg/puff' },
];

const DECK = [
  ['PS-DEMO-0001', 'Metformin 500 mg'], ['PS-DEMO-0002', 'Amoxicillin 500 mg'], ['PS-DEMO-0003', 'Salbutamol 100 mcg'],
  ['PS-DEMO-0004', 'Cefixime 200 mg'], ['PS-DEMO-0005', 'Ondansetron 4 mg'], ['PS-DEMO-0006', 'Cetirizine 10 mg'],
  ['PS-DEMO-0007', 'Paracetamol 500 mg'], ['PS-DEMO-0008', 'Dextrose 5% 500 mL'], ['PS-DEMO-0009', 'Normal Saline 500 mL'],
  ['PS-DEMO-0010', 'Azithromycin 250 mg'], ['PS-DEMO-FAKE', 'Amoxicillin 500 mg'],
];

const inN = (d) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);

export default function QRStudio() {
  const { account, org, can, issueBatch, busy } = useStore();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: 'Amoxicillin', generic: 'Amoxicillin', form: 'Capsule', strength: '500 mg',
    code: 'AMOX-2701', expiry: inN(180), qty: 500, serialCount: 50, coldChain: false,
  });
  const [issued, setIssued] = useState(null);

  if (!can?.qr) {
    return (
      <Card className="p-8 text-center border-border-low">
        <span className="mx-auto grid size-12 place-items-center border border-border-low bg-surface-high text-text-secondary"><Icon name="qricon" size={22} /></span>
        <p className="mt-3 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">QR issuance is a manufacturer capability</p>
        <p className="mt-1 font-mono text-[11px] text-text-secondary">Sign in as a Manufacturer to issue unique batch identity codes.</p>
      </Card>
    );
  }

  function set(p) { setForm((f) => ({ ...f, ...p })); }

  async function submit() {
    const rc = await issueBatch({
      name: form.name, generic: form.generic, form: form.form, strength: form.strength,
      code: form.code, expiry: new Date(form.expiry).toISOString(), qty: form.qty,
      serialCount: form.serialCount, coldChain: form.coldChain,
    });
    const serial = rc.created[0];
    const qr = await QRCode.toDataURL(serial, { width: 280, margin: 1, color: { dark: '#0e0e0e', light: '#ffffff' } });
    setIssued({ code: serial, qr, count: rc.created.length, name: `${form.name} ${form.strength}` });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-2 border-border-low">
        <div className="double-header pb-2 mb-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Manufacturer Terminal — Batch Identity Issuance</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button key={p.name} onClick={() => set({ ...p })} className={cx('border px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.1em] transition', form.name === p.name ? 'border-primary bg-primary-container/20 text-primary' : 'border-border-low bg-surface text-text-secondary hover:border-primary')}>
              {p.name}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Medicine"><input value={form.name} onChange={(e) => set({ name: e.target.value })} className={inputCls} /></Field>
          <Field label="Generic"><input value={form.generic} onChange={(e) => set({ generic: e.target.value })} className={inputCls} /></Field>
          <Field label="Strength"><input value={form.strength} onChange={(e) => set({ strength: e.target.value })} className={inputCls} /></Field>
          <Field label="Form">
            <select value={form.form} onChange={(e) => set({ form: e.target.value })} className={inputCls}>
              {['Tablet', 'Capsule', 'Injectable', 'Inhaler', 'IV Fluid', 'Syrup'].map((f) => <option key={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Batch Code" hint="becomes PS-{CODE}-NNN"><input value={form.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} className={inputCls} /></Field>
          <Field label="Expiry Date"><input type="date" value={form.expiry} onChange={(e) => set({ expiry: e.target.value })} className={inputCls} /></Field>
          <Field label="Carton Quantity"><input type="number" value={form.qty} onChange={(e) => set({ qty: e.target.value })} className={inputCls} /></Field>
          <Field label="Serials to Mint"><input type="number" min={1} value={form.serialCount} onChange={(e) => set({ serialCount: e.target.value })} className={inputCls} /></Field>
        </div>

        <label className="mt-3 flex items-center gap-2 font-mono text-[11px] text-on-surface-variant">
          <input type="checkbox" checked={form.coldChain} onChange={(e) => set({ coldChain: e.target.checked })} className="accent-primary" />
          Cold-chain shipment (2-8C) — adds handling constraints to matching
        </label>

        <Button className="mt-5" onClick={submit} disabled={busy.issue}>{busy.issue ? 'Minting...' : 'Mint Batch & Generate QR'}</Button>
      </Card>

      <div className="space-y-5">
        {issued && (
          <Card className="p-5 text-center border-border-low">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">New serial issued · {issued.count} minted</p>
            <div className="mx-auto mt-3 w-fit border border-border-low bg-white p-3">
              <img src={issued.qr} alt="batch QR" className="size-44" />
            </div>
            <p className="mt-3 text-sm font-bold text-on-surface">{issued.name}</p>
            <p className="font-mono text-[12px] text-primary">{issued.code}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard?.writeText(issued.code); }}>Copy Code</Button>
              <Button size="sm" onClick={() => nav('/verify')}>Test in Verify</Button>
            </div>
            <p className="mt-3 font-mono text-[10px] text-text-secondary">Ledger entry + audit record written automatically.</p>
          </Card>
        )}

        <Card className="p-5 border-border-low">
          <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Judge Demo Deck</h4>
          <p className="mt-1 font-mono text-[11px] text-text-secondary">11 live-verifiable QR cards. Scan any from the app camera — genuine goes Verified, the red one goes High-Risk.</p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {DECK.map(([code, name]) => {
              const fake = code === 'PS-DEMO-FAKE';
              return (
                <div key={code} className={cx('border p-2 text-center transition', fake ? 'border-error bg-error-container/10' : 'border-border-low bg-surface-high hover:border-primary')}>
                  <img src={`${import.meta.env.BASE_URL}demo-qr/${code}.png`} alt={code} className="w-full bg-white p-1" />
                  <p className={cx('mt-1.5 truncate font-mono text-[9px]', fake ? 'text-error' : 'text-text-secondary')}>{code}</p>
                  <p className="truncate text-[9px] text-text-secondary">{name}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => { window.open('/print.html', '_blank'); }}>Open Printable Deck</Button>
            <Button variant="ghost" size="sm" onClick={() => nav('/verify')}>Scan One Now</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
