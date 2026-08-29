import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildSeed } from '../src/lib/seed.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = join(__dirname, '..', 'data');
const DB_PATH = join(DATA_DIR, 'pharmsecure.db');

mkdirSync(DATA_DIR, { recursive: true });

export function openDb() {
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
  ensureSchema(db);
  if (trustRow(db) === 0) seed(db);
  return db;
}

function ensureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orgs (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
      city TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL, trust_score INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS batches (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, generic TEXT NOT NULL, form TEXT NOT NULL,
      strength TEXT NOT NULL, mfg_id TEXT NOT NULL, holder_id TEXT NOT NULL,
      expiry TEXT NOT NULL, stock INTEGER NOT NULL, daily_burn INTEGER NOT NULL,
      safety_buffer INTEGER NOT NULL, cold_chain INTEGER NOT NULL DEFAULT 0,
      serial_count INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS serials (
      code TEXT PRIMARY KEY, batch_id TEXT NOT NULL REFERENCES batches(id)
    );
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL, org_id TEXT NOT NULL,
      city TEXT NOT NULL, at TEXT NOT NULL, by TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY, org_id TEXT NOT NULL, medicine TEXT NOT NULL, qty INTEGER NOT NULL,
      urgency TEXT NOT NULL, created TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS transfers (
      id TEXT PRIMARY KEY, batch_id TEXT NOT NULL, medicine TEXT NOT NULL, name TEXT NOT NULL,
      qty INTEGER NOT NULL, from_org_id TEXT NOT NULL, to_org_id TEXT NOT NULL,
      status TEXT NOT NULL, distance_km REAL NOT NULL, proposed_by TEXT NOT NULL, created TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS custody (
      id INTEGER PRIMARY KEY AUTOINCREMENT, transfer_id TEXT NOT NULL,
      at TEXT NOT NULL, actor TEXT NOT NULL, action TEXT NOT NULL, note TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, actor TEXT NOT NULL,
      role TEXT NOT NULL, action TEXT NOT NULL, code TEXT NOT NULL,
      org TEXT NOT NULL, city TEXT NOT NULL, result TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, title TEXT NOT NULL,
      org_id TEXT NOT NULL, initials TEXT NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL
    );
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_scans_code ON scans(code);`);
}

function trustRow(db) {
  return db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
}

export function hashPassword(pw, salt = randomBytes(16).toString('hex')) {
  const h = scryptSync(pw, salt, 64).toString('hex');
  return { salt, hash: h };
}

export function verifyPassword(pw, salt, hash) {
  const got = scryptSync(pw, salt, 64);
  const want = Buffer.from(hash, 'hex');
  return got.length === want.length && timingSafeEqual(got, want);
}

function seed(db) {
  const s = buildSeed();
  const now = new Date().toISOString();

  const insOrg = db.prepare('INSERT INTO orgs VALUES (?,?,?,?,?,?,?)');
  Object.values(s.orgs).forEach((o) => insOrg.run(o.id, o.name, o.type, o.city, o.lat, o.lng, o.trustScore));

  const insBatch = db.prepare('INSERT INTO batches VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  Object.values(s.batches).forEach((b) => insBatch.run(
    b.id, b.name, b.generic, b.form, b.strength, b.mfgId, b.holderId,
    b.expiry, b.stock, b.dailyBurn, b.safetyBuffer, b.coldChain ? 1 : 0, b.serialCount, b.createdAt,
  ));

  const insSerial = db.prepare('INSERT INTO serials VALUES (?,?)');
  Object.keys(s.serials).forEach((code) => insSerial.run(code, s.serials[code].batchId));

  const insScan = db.prepare('INSERT INTO scans (code, org_id, city, at, by) VALUES (?,?,?,?,?)');
  Object.entries(s.serials).forEach(([code, sr]) => {
    sr.scans.forEach((sc) => insScan.run(code, sc.orgId, sc.city, sc.at, sc.by));
  });

  const insReq = db.prepare('INSERT INTO requests VALUES (?,?,?,?,?,?)');
  s.requests.forEach((r) => insReq.run(r.id, r.orgId, r.medicine, r.qty, r.urgency, r.created));

  const insTr = db.prepare('INSERT INTO transfers VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  s.transfers.forEach((t) => insTr.run(
    t.id, t.batchId, t.medicine, t.name, t.qty, t.fromOrgId, t.toOrgId,
    t.status, t.distanceKm, t.proposedBy, now,
  ));

  const insCust = db.prepare('INSERT INTO custody (transfer_id, at, actor, action, note) VALUES (?,?,?,?,?)');
  s.transfers.forEach((t) => t.custody.forEach((c) => insCust.run(t.id, c.at, c.actor, c.action, c.note || '')));

  const insAudit = db.prepare('INSERT INTO audits (at, actor, role, action, code, org, city, result) VALUES (?,?,?,?,?,?,?,?)');
  s.audits.forEach((a) => insAudit.run(a.at, a.actor, a.role, a.action, a.code, a.org, a.city, a.result));

  const demoUsers = [
    ['acc_admin', 'Pramod Mohanty', 'Hospital Admin', 'Quality & Ops Lead', 'org_citycare', 'PM'],
    ['acc_mfg', 'Riddhima Singh', 'Manufacturer', 'Quality Lead', 'org_sunrise', 'RS'],
    ['acc_clinic', 'Simran', 'Clinic Manager', 'Pharmacy In-charge', 'org_punecliw', 'S'],
    ['acc_ngo', 'Utsav', 'NGO Coordinator', 'Field Operations', 'org_thane', 'U'],
  ];
  const insUser = db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?,?,?)');
  demoUsers.forEach(([id, name, role, title, orgId, initials]) => {
    const { salt, hash } = hashPassword('pharmsecure123');
    insUser.run(id, name, role, title, orgId, initials, salt, hash);
  });

  db.exec(`CREATE INDEX IF NOT EXISTS idx_scans_code ON scans(code);`);
  console.log(`[db] seeded real database · users=${demoUsers.length} serials=${Object.keys(s.serials).length}`);
}