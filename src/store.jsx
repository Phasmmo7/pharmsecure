import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { surplusAnalysis } from './lib/engines.js';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export const ACCOUNTS = [
  { id: 'acc_admin', init: 'PM', name: 'Pramod Mohanty', role: 'Hospital Admin', title: 'CityCare Multispecialty Hospital', initials: 'PM' },
  { id: 'acc_mfg', init: 'RS', name: 'Riddhima Singh', role: 'Manufacturer', title: 'Sunrise Pharma', initials: 'RS' },
  { id: 'acc_clinic', init: 'S', name: 'Simran', role: 'Clinic Manager', title: 'GreenLeaf Clinic', initials: 'S' },
  { id: 'acc_ngo', init: 'U', name: 'Utsav', role: 'NGO Coordinator', title: 'Aarogya Seva', initials: 'U' },
];

export const ORG_TYPES = {
  HOSPITAL: 'Hospital',
  CLINIC: 'Clinic',
  NGO: 'NGO',
  PHARMACY: 'Pharmacy',
  MANUFACTURER: 'Manufacturer',
  DISTRIBUTOR: 'Distributor',
};

const TOKEN_KEY = 'ps.token';
const USER_KEY = 'ps.user';

async function req(path, { token, method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 401) throw new Error('session-expired');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

let setBusyRef = null;

export function StoreProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(USER_KEY) || 'null'));
  const [ready, setReady] = useState(!!user && !!localStorage.getItem(TOKEN_KEY));
  const [busyMap, setBusyMap] = useState({});
  const [audits, setAudits] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [orgs, setOrgs] = useState({});
  const mounted = useRef(false);

  const busy = useMemo(() => busyMap, [busyMap]);
  const mark = useCallback((k, on) => setBusyMap((m) => ({ ...m, [k]: on })), []);

  const refresh = useCallback(async (tk = token) => {
    if (!tk) return;
    const [aud, tr, rq, st, og] = await Promise.all([
      req('/audits', { token: tk }),
      req('/transfers', { token: tk }),
      req('/requests', { token: tk }),
      req('/stats', { token: tk }),
      req('/orgs', { token: tk }),
    ]);
    setAudits(aud); setTransfers(tr); setRequests(rq); setStats(st); setOrgs(og);
  }, [token]);

  useEffect(() => {
    if (!token) { setReady(true); return; }
    if (mounted.current) return;
    mounted.current = true;
    (async () => {
      try {
        const me = await req('/me', { token });
        setUser(me);
        localStorage.setItem(USER_KEY, JSON.stringify(me));
        await refresh(token);
        setReady(true);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setTokenState(''); setUser(null); setReady(true);
      }
    })();
  }, [token, refresh]);

  const login = useCallback(async (id, password = 'pharmsecure123') => {
    const r = await req('/auth/login', { method: 'POST', body: { id, password } });
    localStorage.setItem(TOKEN_KEY, r.token);
    localStorage.setItem(USER_KEY, JSON.stringify(r.user));
    setTokenState(r.token); setUser(r.user);
    await refresh(r.token);
    setReady(true);
    return r.user;
  }, [refresh]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY);
    setTokenState(''); setUser(null); setAudits([]); setTransfers([]); setRequests([]); setStats(null);
  }, []);

  const wrap = useCallback(async (k, fn) => {
    mark(k, true);
    try {
      const r = await fn();
      refresh().catch(() => {});
      return r;
    } finally { mark(k, false); }
  }, [mark, refresh]);

  const performScan = useCallback((code) => wrap('scan', () => req('/verify', { token, method: 'POST', body: { code } })), [wrap, token]);
  const loadBatches = useCallback(() => req('/batches', { token }), [token]);
  const matchFor = useCallback((batchId) => req(`/match/${batchId}`, { token }), [token]);
  const proposeTransfer = useCallback((batchId, toOrgId, qty, opts = {}) =>
    wrap('propose', () => req('/transfers', { token, method: 'POST', body: { batchId, toOrgId, qty, distanceKm: opts.distanceKm || 0 } })), [wrap, token]);
  const advanceTransfer = useCallback((id, action) => wrap('advance', () => req(`/transfers/${id}/advance`, { token, method: 'POST', body: { action } })), [wrap, token]);
  const addRequest = useCallback((form) => wrap('request', () => req('/requests', { token, method: 'POST', body: form })), [wrap, token]);
  const issueBatch = useCallback((batch) => wrap('issue', () => req('/batches', { token, method: 'POST', body: { batch } })), [wrap, token]);

  const org = useMemo(() => orgs[user?.orgId] || null, [orgs, user]);
  const can = useMemo(() => ({
    qr: user?.role === 'Manufacturer',
    match: user?.role === 'Hospital Admin',
    audits: user?.role === 'Hospital Admin' || user?.role === 'Manufacturer',
  }), [user]);

  useEffect(() => { setBusyRef = mark; return () => { setBusyRef = null; }; }, [mark]);

  const value = {
    account: user, user, org, orgs, can, busy, token, ready,
    audits, transfers, requests, stats,
    login, logout, performScan, loadBatches, matchFor,
    proposeTransfer, advanceTransfer, addRequest, issueBatch,
    helpers: { surplusAnalysis },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function showBusy(k) { setBusyRef?.(k, true); }