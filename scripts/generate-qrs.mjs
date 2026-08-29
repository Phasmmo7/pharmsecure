import QRCode from 'qrcode';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSeed } from '../src/lib/seed.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'qr-codes');
const PUBLIC_QR = join(__dirname, '..', 'public', 'demo-qr');
mkdirSync(OUT, { recursive: true });
mkdirSync(PUBLIC_QR, { recursive: true });

const s = buildSeed();
const DEMO = [
  ['PS-DEMO-0001', 'bat_met',  'Metformin 500 mg',             'Genuine'],
  ['PS-DEMO-0002', 'bat_amox', 'Amoxicillin 500 mg',           'Genuine'],
  ['PS-DEMO-0003', 'bat_sal',  'Salbutamol Inhaler 100 mcg',   'Genuine'],
  ['PS-DEMO-0004', 'bat_cef',  'Cefixime 200 mg',              'Genuine'],
  ['PS-DEMO-0005', 'bat_ond',  'Ondansetron 4 mg',             'Genuine'],
  ['PS-DEMO-0006', 'bat_cet',  'Cetirizine 10 mg',             'Genuine'],
  ['PS-DEMO-0007', 'bat_par',  'Paracetamol 500 mg',           'Genuine'],
  ['PS-DEMO-0008', 'bat_dex',  'Dextrose 5% 500 mL',           'Genuine'],
  ['PS-DEMO-0009', 'bat_ns',   'Normal Saline 500 mL',         'Genuine'],
  ['PS-DEMO-0010', 'bat_azm',  'Azithromycin 250 mg',          'Genuine'],
  ['PS-DEMO-FAKE', 'bat_amox', 'Amoxicillin 500 mg',           'COUNTERFEIT unit – expect High-Risk'],
];

const cards = [];
for (const [code, bid, name, tag] of DEMO) {
  const data = await QRCode.toDataURL(code, { margin: 2, width: 460, color: { dark: '#07120e', light: '#ffffff' } });
  const png = Buffer.from(data.split(',')[1], 'base64');
  writeFileSync(join(OUT, `${code}.png`), png);
  writeFileSync(join(PUBLIC_QR, `${code}.png`), png);
  cards.push({ code, name, tag, data, batch: s.batches[bid].name });
  console.log('qr', code, name);
}

const strip = 'data:image/png;base64,';
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>PharmSecure – Demo QR Deck</title>
<style>
  *{box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#0a0f0c;color:#e7f0e9;margin:0;padding:32px}
  h1{font-size:24px;font-weight:800;margin:0 0 4px}
  p.sub{color:#8aa096;margin:0 0 24px;font-size:13px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:16px}
  .card{background:#0f1713;border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:14px;text-align:center}
  .card img{width:160px;height:160px;background:#fff;border-radius:10px;padding:6px}
  .code{font-weight:700;margin:10px 0 2px;letter-spacing:.5px}
  .name{color:#b9c7bf;font-size:12px}
  .tag{display:inline-block;margin-top:8px;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700}
  .genuine{background:rgba(16,185,129,.14);color:#34d399}
  .fake{background:rgba(244,63,94,.16);color:#fb7185}
  .foot{margin-top:20px;color:#5f6f66;font-size:11px}
</style></head><body>
  <h1>PharmSecure &middot; Judge Demo QR Deck</h1>
  <p class="sub">Point the app camera at any card — the serial verifies live against the real ledger. Genuine one-time units: Verified · Red counterfeit card: High-Risk.</p>
  <div class="grid">
    ${cards.map((c) => `<div class="card">
      <img src="${c.data.slice(strip.length)}" alt="${c.code}">
      <div class="code">${c.code}</div><div class="name">${c.name}</div>
      <span class="tag ${c.tag.startsWith('COUNTERFEIT') ? 'fake' : 'genuine'}">${c.tag}</span>
    </div>`).join('')}
  </div>
  <div class="foot">Open http://localhost:4000 and sign in (Pramod Mohanty / password: pharmsecure123) → Verify → scan this screen.</div>
</body></html>`;

writeFileSync(join(OUT, 'print.html'), html);
writeFileSync(join(OUT, 'demo-codes.json'), JSON.stringify(cards.map((c) => ({ code: c.code, name: c.name, tag: c.tag })), null, 2));
writeFileSync(join(__dirname, '..', 'public', 'print.html'), html);
console.log('print.html + demo-codes.json written →', OUT);