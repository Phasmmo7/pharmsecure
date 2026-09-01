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
      <Card className="p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-panel2 text-mist-400"><Icon name="qricon" size={22} /></span>
        <p className="mt-3 text-sm font-bold text-mist-100">QR issuance is a manufacturer capability</p>
        <p className="mt-1 text-xs text-mist-500">Sign in as a Manufacturer · Quality Lead to issue unique batch identity codes.</p>
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
    const qr = await QRCode.toDataURL(serial, { width: 280, margin: 1, color: { dark: '#06120c', light: '#ffffff' } });
    setIssued({ code: serial, qr, count: rc.created.length, name: `${form.name} ${form.strength}` });
  }

  return (
    <div className="animate-fade-up grid gap-5 lg:grid-cols-3">
      <Card className="p-5 glow-sm lg:col-span-2">
        <h2 className="text-base font-bold tracking-tight text-mist-100">Issue a batch identity</h2>
        <p className="text-xs text-mist-500">Register a production batch and mint unique serial QRs — each live-verifiable against the SQLite ledger.</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button key={p.name} onClick={() => set({ ...p })} className={cx('rounded-full border px-3 py-1 text-xs font-medium transition', form.name === p.name ? 'border-brand-400 bg-brand-500/20 text-brand-200' : 'border-edge bg-panel2 text-mist-300 hover:border-brand-400/50')}>
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
          <Field label="Batch code" hint="becomes PS-{CODE}-NNN"><input value={form.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} className={inputCls} /></Field>
          <Field label="Expiry date"><input type="date" value={form.expiry} onChange={(e) => set({ expiry: e.target.value })} className={inputCls} /></Field>
          <Field label="Carton quantity"><input type="number" value={form.qty} onChange={(e) => set({ qty: e.target.value })} className={inputCls} /></Field>
          <Field label="Serials to mint"><input type="number" min={1} value={form.serialCount} onChange={(e) => set({ serialCount: e.target.value })} className={inputCls} /></Field>
        </div>

        <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-mist-200">
          <input type="checkbox" checked={form.coldChain} onChange={(e) => set({ coldChain: e.target.checked })} className="size-4 accent-brand-500" />
          Cold-chain shipment (2–8°C) — adds handling constraints to matching
        </label>

        <Button className="mt-5" onClick={submit} icon="qricon" size="lg" disabled={busy.issue}>{busy.issue ? 'Minting…' : 'Mint batch & generate QR'}</Button>
      </Card>

      <div className="space-y-5">
        {issued && (
          <Card className="p-5 text-center glow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-mist-400">New serial issued · {issued.count} minted</p>
            <div className="mx-auto mt-3 w-fit rounded-2xl border border-edge bg-white p-3 shadow-sm">
              <img src={issued.qr} alt="batch QR" className="size-44" />
            </div>
            <p className="mt-3 text-sm font-bold text-mist-100">{issued.name}</p>
            <p className="text-xs tabular-nums text-brand-300">{issued.code} …</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" icon="copy" onClick={() => { navigator.clipboard?.writeText(issued.code); }}>Copy code</Button>
              <Button size="sm" icon="scan" onClick={() => nav('/verify')}>Test in Verify</Button>
            </div>
            <p className="mt-3 text-[10px] text-mist-500">Ledger entry + audit record written automatically.</p>
          </Card>
        )}

        <Card className="p-5">
          <h4 className="text-sm font-bold text-mist-100">Judge demo deck</h4>
          <p className="mt-1 text-xs text-mist-500">11 live-verifiable QR cards. Scan any from the app camera — <span className="text-blue-300">genuine → Verified</span>, the red one → <span className="text-rose-300">High-Risk</span>.</p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {DECK.map(([code, name]) => {
              const fake = code === 'PS-DEMO-FAKE';
              return (
                <div key={code} className={cx('lift rounded-xl border p-2 text-center transition', fake ? 'border-rose-500/40 bg-rose-500/[.06]' : 'border-edge bg-panel2/60 hover:border-brand-400/50')}>
                  <img src={`${import.meta.env.BASE_URL}demo-qr/${code}.png`} alt={code} className="w-full rounded-lg bg-white p-1" />
                  <p className={cx('mt-1.5 truncate font-mono text-[9px]', fake ? 'text-rose-300' : 'text-mist-400')}>{code}</p>
                  <p className="truncate text-[9px] text-mist-500">{name}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" icon="copy" onClick={() => { window.open('/print.html', '_blank'); }}>Open printable deck</Button>
            <Button variant="ghost" size="sm" icon="audit" onClick={() => nav('/verify')}>Scan one now</Button>
          </div>
          <p className="mt-2 text-[10px] text-mist-500">PNGs also live in <code className="text-brand-300">/qr-codes</code> — print on A4 for the judges’ table.</p>
        </Card>
      </div>
    </div>
  );
}
