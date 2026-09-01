import express from 'express';
import jwt from 'jsonwebtoken';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { openDb, verifyPassword } from './db.mjs';
import { loadState, saveScan, saveAudit, saveTransfer, updateStatusWithNote, addTransferCustody, listAudits, addRequest, listTransfers, listRequests, statsSnapshot, issueSerials } from './store.mjs';
import { verifyCode, matchRedistribution } from '../src/lib/engines.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;
const SECRET = process.env.PHARMSECURE_SECRET || 'pharmsecure-hack-demo-secret';
const DIST = join(__dirname, '..', 'dist');

const db = openDb();
const app = express();
app.use(express.json({ limit: '1mb' }));

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

function accFor(db, userId) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
}

app.get('/api/health', (_req, res) => res.json({ ok: true, db: 'sqlite', ts: Date.now() }));

app.post('/api/auth/login', (req, res) => {
  const { id, password } = req.body || {};
  const u = accFor(db, String(id || '').trim());
  if (!u || !verifyPassword(String(password || ''), u.salt, u.hash)) {
    return res.status(401).json({ error: 'Invalid account or password' });
  }
  const token = jwt.sign(
    { sub: u.id, name: u.name, role: u.role, orgId: u.org_id, title: u.title },
    SECRET, { expiresIn: '12h' },
  );
  res.json({ token, user: { id: u.id, name: u.name, role: u.role, title: u.title, orgId: u.org_id, initials: u.initials } });
});

app.get('/api/me', auth, (req, res) => {
  const u = accFor(db, req.user.sub);
  res.json({ id: u.id, name: u.name, role: u.role, title: u.title, orgId: u.org_id, initials: u.initials });
});

app.get('/api/batches', auth, (_req, res) => {
  const st = loadState(db);
  res.json(Object.values(st.batches).map((b) => {
    const { id, name, generic, form, strength, mfgId, holderId, expiry, stock, dailyBurn, safetyBuffer, coldChain, price, unit } = b;
    return { id, name, generic, form, strength, mfgId, holderId, expiry, stock, dailyBurn, safetyBuffer, coldChain, price, unit };
  }));
});

app.get('/api/orgs', auth, (_req, res) => {
  const st = loadState(db);
  res.json(st.orgs);
});

app.get('/api/match/:batchId', auth, (req, res) => {
  const st = loadState(db);
  const result = matchRedistribution(st, req.params.batchId);
  if (!result) return res.status(404).json({ error: 'Batch not found' });
  res.json({ batchId: req.params.batchId, ...result });
});

app.post('/api/verify', auth, (req, res) => {
  const { code } = req.body || {};
  const st = loadState(db);
  const u = accFor(db, req.user.sub);
  const orgId = (req.body && req.body.orgId) || u.org_id;
  const result = verifyCode(st, String(code || ''), { orgId, at: new Date().toISOString(), by: u.name });
  saveScan(db, result.code, orgId, st.orgs[orgId].city, new Date().toISOString(), u.name);
  saveAudit(db, {
    actor: u.name, role: u.role, action: 'scan', code: result.code,
    org: st.orgs[orgId].name, city: st.orgs[orgId].city, result: result.verdict,
  });
  res.json(result);
});

app.post('/api/transfers', auth, (req, res) => {
  const { batchId, toOrgId, qty, distanceKm } = req.body || {};
  const u = accFor(db, req.user.sub);
  const st = loadState(db);
  const batch = st.batches[batchId];
  if (!batch) return res.status(404).json({ error: 'Batch not found' });
  const to = st.orgs[toOrgId];
  if (!to) return res.status(404).json({ error: 'Recipient org not found' });
  if (batch.holderId !== u.org_id) return res.status(403).json({ error: 'Only the holder can propose a transfer' });

  const t = saveTransfer(db, { batchId, qty: Number(qty) || 1, fromOrgId: u.org_id, toOrgId, distanceKm: Number(distanceKm) || 0, proposedBy: u.name });
  addTransferCustody(db, t.id, new Date().toISOString(), u.name, 'Transfer proposed', 'Surplus flagged by expiry intelligence');
  saveAudit(db, {
    actor: u.name, role: u.role, action: 'transfer_propose', code: batch.name,
    org: batch ? st.orgs[u.org_id].name : u.name, city: st.orgs[u.org_id].city,
    result: `To ${to.name}`,
  });
  res.json(t);
});

app.post('/api/transfers/:id/advance', auth, (req, res) => {
  const { action } = req.body || {};
  const u = accFor(db, req.user.sub);
  const t = listTransfers(db).find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Transfer not found' });
  if (u.org_id !== t.to_org_id && u.org_id !== t.from_org_id)
    return res.status(403).json({ error: 'Not a party to this transfer' });
  const note = (req.body && req.body.note) || '';
  const labels = { accept: 'Accepted', dispatch: 'Packed & handed to courier', deliver: 'Delivered & verified' };
  const status = { accept: 'accepted', dispatch: 'in-transit', deliver: 'delivered' }[action];
  if (!status) return res.status(400).json({ error: 'Unknown action' });
  const next = updateStatusWithNote(db, t.id, status);
  addTransferCustody(db, t.id, new Date().toISOString(), u.name, labels[action], note || '');
  saveAudit(db, {
    actor: u.name, role: u.role, action: 'transfer_' + action, code: t.name,
    org: '', city: '', result: next,
  });
  res.json({ ...t, status: next });
});

app.get('/api/transfers', auth, (req, res) => res.json(listTransfers(db)));
app.get('/api/requests', auth, (_req, res) => res.json(listRequests(db)));

app.post('/api/requests', auth, (req, res) => {
  const { medicine, qty, urgency } = req.body || {};
  const u = accFor(db, req.user.sub);
  const r = addRequest(db, { orgId: u.org_id, medicine: String(medicine || ''), qty: Number(qty) || 1, urgency: String(urgency || 'high').toLowerCase() });
  saveAudit(db, {
    actor: u.name, role: u.role, action: 'request', code: r.medicine,
    org: '', city: '', result: 'Registered',
  });
  res.json(r);
});

app.post('/api/issue', auth, (req, res) => {
  const u = accFor(db, req.user.sub);
  if (u.role !== 'Manufacturer') return res.status(403).json({ error: 'QR issuance requires a Manufacturer account' });
  const { name, generic, form, strength, code, expiry, qty, serialCount, coldChain } = req.body || {};
  if (!code || !Number(serialCount)) return res.status(400).json({ error: 'Batch code and serial count required' });
  const rc = issueSerials(db, {
    mfgOrgId: u.org_id, name: name || 'Generic', generic: generic || '', form: form || 'Tablet',
    strength: strength || '', code, expiry: expiry || new Date(Date.now() + 180 * 86400000).toISOString(),
    qty: Number(qty) || Number(serialCount), serialCount: Number(serialCount), coldChain: !!coldChain,
  });
  saveAudit(db, { actor: u.name, role: u.role, action: 'qr_issue', code: String(code).toUpperCase(), org: '', city: '', result: `${rc.created.length} serials issued` });
  res.json(rc);
});

app.get('/api/audits', auth, (req, res) => res.json(listAudits(db, req.user)));

app.get('/api/stats', auth, (_req, res) => res.json(statsSnapshot(loadState(db))));

if (existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(join(DIST, 'index.html')));
}

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => console.log(`[api] PharmSecure on http://localhost:${PORT}`));