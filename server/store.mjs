import { randomUUID } from 'node:crypto';
import { surplusAnalysis, dashboardStats } from '../src/lib/engines.js';

export function loadState(db) {
  const orgs = {};
  db.prepare('SELECT * FROM orgs').all()
    .forEach((r) => { orgs[r.id] = { id: r.id, name: r.name, type: r.type, city: r.city, lat: r.lat, lng: r.lng, trustScore: r.trust_score }; });

  const batches = {};
  db.prepare('SELECT * FROM batches').all()
    .forEach((r) => {
      batches[r.id] = {
        id: r.id, name: r.name, generic: r.generic, form: r.form, strength: r.strength,
        mfgId: r.mfg_id, holderId: r.holder_id, expiry: r.expiry, stock: r.stock,
        dailyBurn: r.daily_burn, safetyBuffer: r.safety_buffer, coldChain: !!r.cold_chain,
        serialCount: r.serial_count, createdAt: r.created_at,
      };
    });

  const serials = {};
  const rows = db.prepare(`
    SELECT s.code, s.batch_id, sc.org_id, sc.city, sc.at, sc.by
    FROM serials s LEFT JOIN scans sc ON sc.code = s.code
    ORDER BY s.code, sc.at
  `).all();
  rows.forEach((r) => {
    if (!serials[r.code]) serials[r.code] = { batchId: r.batch_id, scans: [] };
    if (r.org_id) serials[r.code].scans.push({ orgId: r.org_id, city: r.city, at: r.at, by: r.by });
  });

  const requests = db.prepare('SELECT * FROM requests ORDER BY created DESC').all()
    .map((r) => ({ id: r.id, orgId: r.org_id, medicine: r.medicine, qty: r.qty, urgency: r.urgency, created: r.created }));
  const transfers = listTransfers(db);
  const audits = db.prepare('SELECT * FROM audits ORDER BY at DESC LIMIT 400').all()
    .map((r) => ({ id: r.id, at: r.at, actor: r.actor, role: r.role, action: r.action, code: r.code, org: r.org, city: r.city, result: r.result }));

  return { orgs, batches, serials, requests, transfers, audits };
}

export function statsSnapshot(st) {
  const s = dashboardStats(st);
  return {
    ...s,
    batchesAudited: Object.values(st.batches).length,
    totalStock: Object.values(st.batches).reduce((a, b) => a + b.stock, 0),
    orgCount: Object.keys(st.orgs).length,
    riskBoard: Object.values(st.batches)
      .map((b) => ({ ...surplusAnalysis(b), id: b.id, name: b.name, strength: b.strength, stock: b.stock, holderId: b.holderId }))
      .filter((b) => b.surplus || b.score >= 60)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6),
    riskQueue: Object.values(st.batches).map((b) => ({ ...surplusAnalysis(b), id: b.id, name: b.name, strength: b.strength, holderId: b.holderId }))
      .filter((b) => b.atRisk && b.surplus).sort((a, b) => b.score - a.score).slice(0, 6),
  };
}

export function saveScan(db, code, orgId, city, at, by) {
  db.prepare('INSERT INTO scans (code, org_id, city, at, by) VALUES (?,?,?,?,?)').run(code, orgId, city, at, by);
}

export function createBatch(db, b) {
  const id = 'bat_' + b.code.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.floor(Math.random() * 900 + 100);
  db.prepare('INSERT INTO batches (id, name, generic, form, strength, mfg_id, holder_id, expiry, stock, daily_burn, safety_buffer, cold_chain, serial_count, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, b.name, b.generic, b.form, b.strength, b.mfgId, b.holderId, b.expiry, b.stock, b.dailyBurn, b.safetyBuffer, b.coldChain ? 1 : 0, b.serialCount, new Date().toISOString());

  const serials = [];
  const insSerial = db.prepare('INSERT INTO serials VALUES (?,?)');
  for (let i = 1; i <= b.serialCount; i++) {
    const code = `PS-${b.code}-${String(i).padStart(3, '0')}`;
    insSerial.run(code, id);
    serials.push(code);
  }
  return { id, first: serials[0], serials };
}

export function saveAudit(db, a) {
  db.prepare('INSERT INTO audits (at, actor, role, action, code, org, city, result) VALUES (?,?,?,?,?,?,?,?)')
    .run(new Date().toISOString(), a.actor, a.role, a.action, a.code, a.org || '', a.city || '', a.result || '');
}

export function saveTransfer(db, { batchId, qty, fromOrgId, toOrgId, distanceKm, proposedBy }) {
  const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(batchId);
  const id = 'tr_' + randomUUID().slice(0, 8);
  db.prepare('INSERT INTO transfers VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, batchId, batch.name, `${batch.name} ${batch.strength}`, qty, fromOrgId, toOrgId, 'proposed', distanceKm, proposedBy, new Date().toISOString());
  return { id, batchId, medicine: batch.name, name: `${batch.name} ${batch.strength}`, qty, fromOrgId, toOrgId, status: 'proposed', distanceKm, proposedBy };
}

export function addTransferCustody(db, transferId, at, actor, action, note = '') {
  db.prepare('INSERT INTO custody (transfer_id, at, actor, action, note) VALUES (?,?,?,?,?)').run(transferId, at, actor, action, note);
}

export function updateStatusWithNote(db, id, status) {
  db.prepare('UPDATE transfers SET status = ? WHERE id = ?').run(status, id);
  return status;
}

export function listTransfers(db) {
  return db.prepare('SELECT * FROM transfers ORDER BY created DESC').all()
    .map((t) => ({
      id: t.id, batchId: t.batch_id, medicine: t.medicine, name: t.name, qty: t.qty,
      fromOrgId: t.from_org_id, toOrgId: t.to_org_id, status: t.status,
      distanceKm: t.distance_km, proposedBy: t.proposed_by, created: t.created,
      custody: db.prepare('SELECT at, actor, action, note FROM custody WHERE transfer_id = ? ORDER BY at').all(t.id),
    }));
}

export function listRequests(db) {
  return db.prepare('SELECT * FROM requests ORDER BY created DESC').all()
    .map((r) => ({ id: r.id, orgId: r.org_id, medicine: r.medicine, qty: r.qty, urgency: r.urgency, created: r.created }));
}

export function addRequest(db, { orgId, medicine, qty, urgency }) {
  const id = 'req_' + randomUUID().slice(0, 8);
  db.prepare('INSERT INTO requests VALUES (?,?,?,?,?,?)').run(id, orgId, medicine, qty, urgency, new Date().toISOString());
  return { id, orgId, medicine, qty, urgency };
}

export function listAudits(db) {
  return db.prepare('SELECT * FROM audits ORDER BY at DESC LIMIT 400').all()
    .map((r) => ({ id: r.id, at: r.at, actor: r.actor, role: r.role, action: r.action, code: r.code, org: r.org, city: r.city, result: r.result }));
}

export function listOrgs(db) {
  return db.prepare('SELECT * FROM orgs ORDER BY name').all()
    .map((r) => ({ id: r.id, name: r.name, type: r.type, city: r.city, lat: r.lat, lng: r.lng, trustScore: r.trust_score }));
}

export function issueSerials(db, { mfgOrgId, name, generic, form, strength, code, expiry, qty, serialCount, coldChain }) {
  const bid = 'bat_' + String(code).toLowerCase().replace(/[^a-z0-9]/g, '');
  const exists = db.prepare('SELECT id FROM batches WHERE id = ?').get(bid);
  if (!exists) {
    const first = db.prepare('SELECT * FROM orgs WHERE id = ?').get(mfgOrgId);
    db.prepare('INSERT INTO batches VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(
      bid, name, generic, form, strength, mfgOrgId, mfgOrgId,
      new Date(expiry).toISOString(), Number(qty), 0, 0, coldChain ? 1 : 0, Number(serialCount), new Date().toISOString(),
    );
  }
  const existing = db.prepare('SELECT code FROM serials WHERE batch_id = ?').all(bid).length;
  const start = existing + 1;
  const ins = db.prepare('INSERT OR REPLACE INTO serials VALUES (?,?)');
  const insScan = db.prepare('INSERT INTO scans (code, org_id, city, at, by) VALUES (?,?,?,?,?)');
  const orgRow = db.prepare('SELECT * FROM orgs WHERE id = ?').get(mfgOrgId);
  const created = [];
  for (let i = 0; i < Number(serialCount); i++) {
    const serial = `PS-${String(code).toUpperCase()}-${String(start + i).padStart(3, '0')}`;
    ins.run(serial, bid);
    insScan.run(serial, mfgOrgId, orgRow.city, new Date().toISOString(), orgRow.name);
    created.push(serial);
  }
  return { batchId: bid, created };
}