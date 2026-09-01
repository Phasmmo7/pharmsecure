import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Card, Pill, Chip, Button, SectionTitle, Field, inputCls, Icon, fmtNum, fmtDate, cx } from '../components/ui.jsx';

export default function Redistribution() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState('match');
  const selectedReq = params.get('batch');
  return (
    <div className="animate-fade-up space-y-4">
      <SectionTitle title="Smart redistribution" sub="Match near-expiry surplus with facilities that need it — ranked and explainable" />
      <div className="flex gap-1.5">
        {[['match', 'Find matches'], ['requests', 'Requests'], ['transfers', 'Live transfers']].map(([k, l]) => (
          <Chip key={k} active={tab === k} onClick={() => setTab(k)}>{l}</Chip>
        ))}
      </div>
      {tab === 'match' && <MatchTab preset={selectedReq} />}
      {tab === 'requests' && <RequestsTab />}
      {tab === 'transfers' && <TransfersTab />}
    </div>
  );
}

function MatchTab({ preset }) {
  const { orgs, loadBatches, proposeTransfer, busy, matchFor, helpers } = useStore();
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState('');
  const [qty, setQty] = useState({});
  const [toast, setToast] = useState(null);
  const [match, setMatch] = useState(null);

  useEffect(() => {
    loadBatches().then((b) => {
      setBatches(b);
      const cands = b.map((x) => ({ ...x, a: helpers.surplusAnalysis(x) })).filter((x) => x.a.surplus);
      const init = preset && cands.find((c) => c.id === preset) ? preset : cands[0]?.id || '';
      setBatchId(init);
    }).catch(() => {});
  }, [loadBatches, preset, helpers]);

  useEffect(() => {
    if (!batchId) { setMatch(null); return; }
    matchFor(batchId).then(setMatch).catch(() => {});
  }, [batchId, matchFor]);

  const candidates = (batches || []).map((b) => ({ ...b, a: helpers.surplusAnalysis(b) })).filter((b) => b.a.surplus);

  if (!match) {
    return <Card className="p-6 text-center text-xs text-mist-500">
      {batchId ? 'Computing matches…' : 'No surplus batches available right now.'}
    </Card>;
  }

  const holderOrg = batches.find((b) => b.id === batchId);
  const holder = orgs[holderOrg?.holderId];

  async function propose(orgId, distanceKm, defaultQty) {
    const q = Number(qty[orgId] || defaultQty);
    if (!q || q <= 0) return;
    await proposeTransfer(batchId, orgId, q, { distanceKm });
    setToast({ org: orgs[orgId].name, q });
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-mist-500">Surplus batch:</span>
            <select value={batchId} onChange={(e) => { setBatchId(e.target.value); setQty({}); }} className="rounded-xl border border-edge bg-panel2 px-3 py-2 text-sm font-semibold text-mist-100 outline-none">
              {candidates.map((b) => (
                <option key={b.id} value={b.id}>{b.name} {b.strength} — {fmtNum(b.a.projectedSurplus)}u / {b.a.days}d to expiry</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs text-mist-500">
            <Icon name="pin" size={13} /> {holder?.name}
            <Icon name="clock" size={13} /> {match.analysis.days} days left
          </div>
        </div>
      </Card>

      {toast && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 animate-fade-up">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-600 text-white"><Icon name="check" size={16} /></span>
          <div className="flex-1">
            <p className="text-sm font-bold text-mist-100">Transfer proposed — {fmtNum(toast.q)} units → {toast.org}</p>
            <p className="text-xs text-mist-400">Audit record written. Track it under Live transfers.</p>
          </div>
          <button onClick={() => setToast(null)} className="text-mist-400 hover:text-mist-100"><Icon name="x" size={16} /></button>
        </div>
      )}

      <p className="text-xs font-semibold text-mist-500">{match.matches.length} eligible recipients, ranked by weighted scoring</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {match.matches.map((mm) => (
          <Card key={mm.orgId} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-panel2 text-mist-300"><Icon name={mm.org.type === 'NGO' ? 'handshake' : 'box'} size={18} /></span>
                <div>
                  <p className="text-sm font-bold text-mist-100">{mm.org.name}</p>
                  <p className="text-[11px] text-mist-500">{mm.org.type} · {mm.org.city} · trust {mm.org.trustScore}/100</p>
                </div>
              </div>
              <Pill label={mm.total >= 70 ? 'High fit' : mm.total >= 50 ? 'Good fit' : 'Feasible'} />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300 ring-1 ring-inset ring-sky-500/30"><Icon name="pin" size={10} /> {mm.distanceKm} km · ~{mm.transitHr} hr</span>
              {mm.req && <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300 ring-1 ring-inset ring-amber-400/30"><Icon name="alert" size={10} /> {fmtNum(mm.req.qty)} requested · {mm.req.urgency}</span>}
              {mm.org.trustScore >= 75 && <Pill label="High trust" />}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
              {mm.breakdown.map((c) => (
                <div key={c.key}>
                  <div className="flex justify-between"><span className="text-mist-500">{c.label}</span><span className="font-bold tabular-nums text-mist-100">{c.share}</span></div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist-700/50"><div className="h-full rounded-full bg-brand-500" style={{ width: c.share + '%' }} /></div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-edge pt-3">
              <span className="text-xs font-bold text-mist-100">Match score <span className="text-lg">{mm.total}</span></span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist-700/50">
                <div className={cx('h-full rounded-full', mm.total >= 70 ? 'bg-blue-500' : mm.total >= 50 ? 'bg-brand-500' : 'bg-amber-400')} style={{ width: mm.total + '%' }} />
              </div>
              <div className="flex items-center gap-1.5">
                <input type="number" min={1} value={qty[mm.orgId] ?? (mm.req?.qty || Math.min(50, match.surplus))} onChange={(e) => setQty({ ...qty, [mm.orgId]: e.target.value })} className="w-20 rounded-lg border border-edge bg-panel2 px-2 py-1.5 text-xs text-mist-100 outline-none focus:border-brand-500" />
                <Button size="sm" onClick={() => propose(mm.orgId, mm.distanceKm, match.surplus)} icon="arrows" disabled={busy.propose}>{busy.propose ? '…' : 'Propose'}</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RequestsTab() {
  const { orgs, requests, account, addRequest, busy } = useStore();
  const [form, setForm] = useState({ medicine: '', qty: '', urgency: 'medium' });
  const [me, setMe] = useState(false);
  const list = useMemo(() => {
    const reqs = requests || [];
    return me ? reqs.filter((r) => r.orgId === account?.orgId) : reqs;
  }, [requests, me, account]);

  async function submit() {
    if (!form.medicine.trim() || !form.qty) return;
    await addRequest(form);
    setForm({ medicine: '', qty: '', urgency: 'medium' });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-1">
        <h4 className="text-sm font-bold text-mist-100">Request a medicine</h4>
        <p className="mt-0.5 text-xs text-mist-500">Your request feeds urgency + demand signals into the matching engine.</p>
        <div className="mt-4 space-y-3">
          <Field label="Medicine"><input value={form.medicine} onChange={(e) => setForm({ ...form, medicine: e.target.value })} placeholder="e.g. Amoxicillin" className={inputCls} /></Field>
          <Field label="Quantity needed"><input type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 200" className={inputCls} /></Field>
          <Field label="Urgency">
            <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })} className={inputCls}>
              <option value="high">High — patients waiting</option>
              <option value="medium">Medium — stock running low</option>
              <option value="low">Low — restocking</option>
            </select>
          </Field>
          <Button full onClick={submit} icon="handshake" disabled={busy.request}>{busy.request ? 'Broadcasting…' : 'Broadcast request'}</Button>
        </div>
      </Card>

      <div className="lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-mist-500">{list.length} open {list.length === 1 ? 'request' : 'requests'}</p>
          <Chip onClick={() => setMe(!me)} active={me}>My org only</Chip>
        </div>
        <div className="space-y-2.5">
          {list.map((r) => (
            <Card key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className={cx('grid size-9 shrink-0 place-items-center rounded-xl', r.urgency === 'high' ? 'bg-rose-500/15 text-rose-300' : r.urgency === 'medium' ? 'bg-amber-400/15 text-amber-300' : 'bg-brand-500/15 text-brand-300')}>
                <Icon name="alert" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-mist-100">{r.medicine} <span className="text-xs font-normal text-mist-500">· {fmtNum(r.qty)} units</span></p>
                <p className="text-[11px] text-mist-500">{orgs[r.orgId]?.name} · {orgs[r.orgId]?.city} · {fmtDate(r.created)}</p>
              </div>
              <Pill label={r.urgency === 'high' ? 'High' : r.urgency === 'medium' ? 'Medium' : 'Low'} />
            </Card>
          ))}
          {list.length === 0 && <Card className="p-6 text-center text-xs text-mist-500">No open requests.</Card>}
        </div>
      </div>
    </div>
  );
}

function TransfersTab() {
  const { orgs, transfers, advanceTransfer, busy, account } = useStore();
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-3">
      {(transfers || []).map((t) => {
        const from = orgs[t.fromOrgId], to = orgs[t.toOrgId];
        const isParty = account && (account.orgId === t.fromOrgId || account.orgId === t.toOrgId);
        return (
          <Card key={t.id} className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300"><Icon name="truck" size={18} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-mist-100">{t.medicine} <span className="font-normal text-mist-500">· {fmtNum(t.qty)} units</span></p>
                <p className="text-[11px] text-mist-500">{from?.name} → {to?.name} · {t.distanceKm} km · proposed by {t.proposedBy}</p>
              </div>
              <div className="flex items-center gap-2">
                <Pill label={t.status === 'in-transit' ? 'In transit' : t.status === 'delivered' ? 'Delivered' : t.status === 'accepted' ? 'Accepted' : 'Proposed'} />
                {isParty && t.status !== 'delivered' && (
                  <Button size="sm" variant={t.status === 'proposed' ? 'soft' : 'primary'} onClick={() => advanceTransfer(t.id, t.status === 'proposed' ? 'accept' : t.status === 'accepted' ? 'dispatch' : 'deliver')} icon="bolt" disabled={busy.advance}>
                    {t.status === 'proposed' ? 'Accept' : t.status === 'accepted' ? 'Dispatch' : 'Deliver'}
                  </Button>
                )}
                <button onClick={() => setOpen(open === t.id ? null : t.id)} className="grid size-8 place-items-center rounded-lg text-mist-400 hover:bg-edge"><Icon name={open === t.id ? 'x' : 'audit'} size={15} /></button>
              </div>
            </div>
            {open === t.id && (
              <div className="mt-4 border-t border-edge pt-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-mist-400">Chain of custody</p>
                <div className="space-y-2">
                  {(t.custody || []).map((c, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30"><Icon name="check" size={10} /></span>
                      <div>
                        <p className="text-xs font-semibold text-mist-100">{c.action} — {c.actor}</p>
                        <p className="text-[10px] text-mist-500">{fmtDate(c.at)} {c.note && `· ${c.note}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 rounded-lg bg-panel2 px-3 py-2 text-[10px] text-mist-500">Compliance-ready transfer log · chain-of-custody preserved for every redistribution.</p>
              </div>
            )}
          </Card>
        );
      })}
      {(transfers || []).length === 0 && <Card className="p-6 text-center text-xs text-mist-500">No transfers yet — propose one from the Match tab.</Card>}
    </div>
  );
}
