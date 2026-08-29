// ---- PharmSecure intelligence engines -------------------------------
// Pure, explainable scoring used by the mock backend layer.

const DAY = 24 * 60 * 60 * 1000;

export const nowISO = () => new Date().toISOString();
export const daysTo = (iso) => Math.ceil((new Date(iso).getTime() - Date.now()) / DAY);

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const toFixed = (n) => Math.round(n * 10) / 10;

// ---- Geospatial -------------------------------------------------------
export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180, la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return toFixed(2 * R * Math.asin(Math.sqrt(h)));
}

export const transitHrs = (km) => toFixed(km / 40);

// ---- Expiry / surplus intelligence ------------------------------------
// Risk formula (from the deck):  Stock - (Daily Burn x Days to Expiry) - Safety Buffer
export function surplusAnalysis(batch) {
  const days = daysTo(batch.expiry);
  if (days < 0) {
    return {
      days, projectedSurplus: 0, shares: { stock: batch.stock, burn: 0, buffer: 0, projected: 0 },
      score: 100, level: 'Expired', notes: ['Batch expired — redistribution window closed.'],
      atRisk: true, surplus: false,
    };
  }

  const burnFactor = batch.dailyBurn * days;
  const projected = Math.max(0, batch.stock - burnFactor - batch.safetyBuffer);
  const ratio = batch.stock > 0 ? projected / batch.stock : 0;
  const timeFactor = days < 75 ? (75 - days) / 75 : 0;
  const dayBoost = days <= 30 ? 30 : days <= 45 ? 12 : 0;

  let score;
  if (projected <= 0) {
    score = clamp(Math.round(10 + timeFactor * 15), 0, 30);
  } else {
    score = clamp(Math.round(8 + ratio * 60 + timeFactor * 55 + dayBoost + (batch.coldChain ? 5 : 0)), 0, 96);
  }

  const surplus = projected > 0 && days <= 60;
  const level = score >= 85 ? 'Critical' : score >= 60 ? 'High' : score >= 35 ? 'Medium' : 'Low';

  const notes = [];
  if (projected > 0 && days <= 60) notes.push(`${projected} units projected to expire — redistribute now.`);
  if (projected <= 0) notes.push('Consumption rate absorbs surplus — no action needed.');
  if (batch.coldChain) notes.push('Cold-chain product — requires 2–8°C during any transfer.');
  if (days <= 30 && projected > 0) notes.push('Window under 30 days — prioritise urgent matching.');

  return {
    days, projectedSurplus: projected,
    shares: { stock: batch.stock, burn: burnFactor, buffer: batch.safetyBuffer, projected },
    score, level, notes, atRisk: score >= 60, surplus,
  };
}

// ---- Authenticity verification ----------------------------------------
const U = 60; // unknown code penalty

export function verifyCode(state, code, scanContext) {
  const { orgs, batches, serials } = state;
  const raw = (code || '').trim().toUpperCase();
  const at = scanContext?.at || nowISO();

  const serial = serials[raw];
  const batch = serial ? batches[serial.batchId] : batches[raw] || null;
  const found = !!(serial || raw in batches);

  const checks = [];
  const issues = [];
  const greens = [];

  // registry presence
  if (found) {
    greens.push('Code registered in the trusted PharmSecure ledger.');
  } else {
    issues.push('Code not found in the trusted registry — may be unlicensed or counterfeited.');
  }

  // advance the scan (serial integrity)
  let scan = null;
  if (serial) {
    const org = orgs[scanContext.orgId] || orgs[Object.keys(orgs)[0]];
    scan = { orgId: org.id, city: org.city, at, by: scanContext.by || org.name };
    serial.scans.push(scan);
  }

  const scans = serial ? [...serial.scans] : [];

  // expiry
  if (batch) {
    const d = daysTo(batch.expiry);
    if (d < 0) {
      checks.push({ key: 'expiry', label: 'Batch expiry', impact: 35, detail: 'Expired ' + Math.abs(d) + ' days ago.' });
      issues.push('This batch has expired.');
    } else if (d <= 30) {
      checks.push({ key: 'expiry', label: 'Batch expiry', impact: 8, detail: d + ' days remaining.' });
      greens.push('Batch in-date (' + d + ' days left).');
    } else {
      greens.push('Batch in-date with ' + d + ' days remaining.');
    }
  }

  // duplicate / clone scans
  if (scans.length >= 3) {
    checks.push({ key: 'dup', label: 'Repeated scans', impact: 25, detail: sizeof(scans) + ' scans logged for this serial.' });
    issues.push('Serial scanned ' + sizeof(scans) + ' times — pattern matches cloned-code behaviour.');
  } else if (scans.length >= 2) {
    greens.push('Single scan history (no duplication pattern).');
  }

  // geo-mismatch (same serial, two cities within a short window)
  const sorted = [...scans].sort((x, y) => new Date(x.at) - new Date(y.at));
  let geoHit = null;
  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1], b = sorted[i];
    if (a.city !== b.city && new Date(b.at) - new Date(a.at) < 2 * 60 * 60 * 1000) {
      geoHit = { a, b };
      break;
    }
  }
  if (geoHit) {
    const mins = Math.round((new Date(geoHit.b.at) - new Date(geoHit.a.at)) / 60000);
    const orgA = orgs[geoHit.a.orgId];
    const orgB = orgs[geoHit.b.orgId];
    const locA = orgA ? `${orgA.name}, ${orgA.city}` : geoHit.a.city;
    const locB = orgB ? `${orgB.name}, ${orgB.city}` : geoHit.b.city;
    checks.push({ key: 'geo', label: 'Geo anomaly', impact: 40, detail: `${locA} → ${locB} in ${mins} min.` });
    issues.push(`Impossible travel: scanned at ${locA}, then ${locB} ${mins} min later.`);
  } else {
    greens.push('No geo-mismatch detected in scan history.');
  }

  // chain trust (scanning organization)
  if (scan) {
    const o = orgs[scan.orgId];
    if (o && o.trustScore < 60) {
      checks.push({ key: 'trust', label: 'Initiating org trust', impact: 6, detail: o.name + ' has trust ' + o.trustScore + '/100.' });
      issues.push('Low-trust initiator — flagged for manual review.');
    }
  }

  let score, verdict;
  if (!found) {
    score = U + (geoHit ? 25 : 0) + (batch ? 0 : 0);
    verdict = 'Suspicious';
  } else {
    score = clamp(5 + checks.reduce((s, c) => s + c.impact, 0), 0, 99);
    verdict = score >= 70 ? 'High-Risk' : score >= 40 ? 'Suspicious' : 'Verified';
  }
  score = clamp(score, 1, 99);

  const summary =
    verdict === 'Verified' ? 'Genuine medicine confirmed against ledger evidence.' :
    verdict === 'High-Risk' ? 'Strong counterfeit indicators — do not administer.' :
    'Indicators found — verify Batch Record or contact the manufacturer.';

  return { code: raw, found, verdict, score, batch, serial, foundScan: serializeScan(scan || null), checks, issues, greens, summary };
}

const sizeof = (a) => a.length;
const serializeScan = (s) => (s ? { orgId: s.orgId, city: s.city, at: s.at, by: s.by } : null);

// ---- Redistribution matching ------------------------------------------
const W = { dist: 0.35, urgency: 0.30, demand: 0.20, trust: 0.15 };

export function matchRedistribution(state, batchId) {
  const { orgs, batches, requests } = state;
  const batch = batches[batchId];
  const holder = orgs[batch.holderId];
  const a = surplusAnalysis(batch);
  const surplus = a.projectedSurplus > 0 ? a.projectedSurplus : Math.ceil(batch.stock * 0.3);

  const matches = Object.keys(orgs)
    .map((id) => orgs[id])
    .filter((o) => o.type !== 'Manufacturer' && o.type !== 'Distributor' && o.type !== 'Hospital' && o.id !== holder.id)
    .map((o) => {
      const req = requests.find((r) => r.orgId === o.id && matchesMedicine(r.medicine, batch));
      const km = haversineKm(holder, o);
      const dist = clamp(Math.round(100 * (1 - km / 300)), 5, 100);

      const urgency = req ? (req.urgency === 'high' ? 100 : req.urgency === 'medium' ? 65 : 35) : 40;
      const demand = req ? clamp(Math.round((Math.min(req.qty, surplus) / Math.max(surplus, 1)) * 60 + 40), 0, 100) : 25;
      const trust = o.trustScore;

      const total = Math.round(W.dist * dist + W.urgency * urgency + W.demand * demand + W.trust * trust);
      return {
        org: o, orgId: o.id, distanceKm: km, transitHr: transitHrs(km),
        scores: { dist, urgency, demand, trust }, total,
        req: req || null,
        reason: [],
      };
    })
    .filter((m) => m.scores.urgency >= 40 || m.req)
    .sort((p, q) => q.total - p.total);

  // human-readable explanation & contribution share
  matches.forEach((m) => {
    const parts = [];
    if (m.req) parts.push(`${m.req.qty} units requested (urgency: ${m.req.urgency})`);
    if (m.distanceKm < 40) parts.push(`nearby at ${m.distanceKm} km`);
    if (m.scores.trust >= 75) parts.push(`high trust (${m.org.trustScore})`);
    const shares = Object.keys(W).map((k) => ({ key: k, label: labels[k], share: Math.round(W[k] * m.scores[k]) }));
    m.breakdown = shares;
    m.reason = parts;
  });

  return { surplus, analysis: surplusAnalysis(batch), matches };
}

const labels = { dist: 'Proximity', urgency: 'Urgency', demand: 'Demand', trust: 'Trust' };

export function matchesMedicine(reqName, batch) {
  const a = (reqName || '').toLowerCase();
  const b = (batch.name + ' ' + batch.generic).toLowerCase();
  return a.split(' ').some((w) => w.length > 3 && b.includes(w));
}

// stats used on dashboard
export function dashboardStats(state) {
  const batches = Object.values(state.batches).map(surplusAnalysis);
  const atRisk = batches.filter((b) => b.atRisk);
  const surplusTotal = batches.reduce((s, b) => s + b.projectedSurplus, 0);
  const auditsToday = state.audits.filter((a) => Date.now() - new Date(a.at).getTime() < DAY).length;
  const scansToday = state.audits.filter((a) => a.action === 'scan' && Date.now() - new Date(a.at).getTime() < DAY).length;
  const highRisk = state.audits.filter((a) => a.result === 'High-Risk').length;
  const active = state.transfers.filter((t) => t.status === 'in-transit' || t.status === 'accepted').length;
  return {
    pendingSurplus: surplusTotal, atRisk: atRisk.length,
    recovered: state.transfers.reduce((s, t) => s + (t.status === 'delivered' ? t.qty : 0), 0),
    scansToday, highRisk, activeTransfers: active, auditsToday,
  };
}