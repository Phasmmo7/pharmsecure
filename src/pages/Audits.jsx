import { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { Card, Pill, Chip, Button, Icon, fmtDate } from '../components/ui.jsx';

const ACTION_LABEL = {
  scan: 'Authenticity scan', qr_issue: 'QR issued', match: 'Match ranked', request: 'Request broadcast',
  transfer_propose: 'Transfer proposed', transfer_accepted: 'Transfer accepted',
  transfer_dispatch: 'Transfer dispatched', transfer_deliver: 'Transfer delivered',
};
const ACTION_ICON = {
  scan: 'scan', qr_issue: 'qricon', match: 'arrows', request: 'handshake',
  transfer_propose: 'truck', transfer_accepted: 'check', transfer_dispatch: 'truck', transfer_deliver: 'check',
};
const FILTERS = [['all', 'All'], ['scan', 'Scans'], ['transfer', 'Transfers'], ['qr_issue', 'QR Issues'], ['request', 'Requests']];

function isTransfer(a) { return (a.action || '').startsWith('transfer'); }

export default function Audits() {
  const { audits, account, orgs } = useStore();
  const [filter, setFilter] = useState('all');
  const [downloaded, setDownloaded] = useState(false);

  const list = useMemo(() => {
    let l = [...(audits || [])];
    if (account?.role !== 'Hospital Admin' && account?.role !== 'Manufacturer') {
      l = l.filter((a) => a.org === (orgs[account?.orgId]?.name || '') || a.actor === account?.name);
    }
    if (filter === 'scan') l = l.filter((a) => a.action === 'scan');
    if (filter === 'transfer') l = l.filter(isTransfer);
    if (filter === 'qr_issue') l = l.filter((a) => a.action === 'qr_issue');
    if (filter === 'request') l = l.filter((a) => a.action === 'request');
    return l;
  }, [audits, filter, account, orgs]);

  const exportCsv = () => {
    const head = ['timestamp', 'actor', 'role', 'action', 'code', 'organization', 'city', 'result'];
    const rows = list.map((a) => [new Date(a.at).toISOString(), a.actor, a.role, a.action, a.code, a.org, a.city, a.result].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = '\uFEFF' + [head.join(','), ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const el = document.createElement('a');
    el.href = url; el.download = 'pharmsecure-audit.csv'; el.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="border border-border-low bg-surface-panel p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="double-header pb-2 mb-2">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Certified System Record — Secure Ledger</p>
            </div>
            <p className="font-mono text-[11px] text-on-surface-variant">Protocol ID: PS-8892-A · Generated: {new Date().toISOString()}</p>
          </div>
          <Button variant="ghost" icon={downloaded ? 'check' : 'copy'} onClick={exportCsv}>{downloaded ? 'Exported' : 'Export Certified PDF'}</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(([k, l]) => (
          <Chip key={k} active={filter === k} onClick={() => setFilter(k)}>{l}</Chip>
        ))}
      </div>

      {/* Desktop Table */}
      <Card className="overflow-hidden border-border-low">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="sticky top-0 bg-surface-panel">
              <tr className="border-b border-border-low bg-surface-low">
                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Timestamp</th>
                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Actor</th>
                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Action</th>
                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Code</th>
                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Organization / City</th>
                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-low">
              {list.map((a) => (
                <tr key={a.id} className={a.result === 'High-Risk' ? 'bg-error-container/5' : 'hover:bg-surface-high'}>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-text-secondary">{fmtDate(a.at)}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-bold text-on-surface">{a.actor}</p>
                    <p className="font-mono text-[10px] text-text-secondary">{a.role}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-on-surface-variant">
                      <Icon name={ACTION_ICON[a.action] || 'audit'} size={13} className="text-text-secondary" />
                      {ACTION_LABEL[a.action] || a.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-on-surface-variant">{a.code}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-text-secondary">{a.org} · {a.city}</td>
                  <td className="px-4 py-3"><Pill label={a.result} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divide-y divide-border-low md:hidden">
            {list.map((a) => (
              <div key={a.id} className="flex gap-3 px-4 py-3">
                <span className="grid size-8 shrink-0 place-items-center border border-border-low bg-surface-high text-text-secondary"><Icon name={ACTION_ICON[a.action] || 'audit'} size={15} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-bold text-on-surface">{ACTION_LABEL[a.action] || a.action}</p>
                    <Pill label={a.result} className="shrink-0" />
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-text-secondary">{a.code} · {a.org} · {a.city}</p>
                  <p className="font-mono text-[10px] text-text-secondary">{a.actor} · {fmtDate(a.at)}</p>
                </div>
              </div>
            ))}
          </div>
          {list.length === 0 && <p className="px-4 py-10 text-center font-mono text-xs text-text-secondary">Nothing matches this filter.</p>}
        </div>
      </Card>

      {/* End of Log */}
      <div className="flex items-center justify-between border border-border-low bg-surface-panel px-4 py-3">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">End of Log</span>
        <Button variant="ghost" size="sm" icon="copy" onClick={exportCsv}>Export Certified PDF</Button>
      </div>

      {/* Footer */}
      <div className="border border-border-low bg-surface-panel px-4 py-4 text-center">
        <p className="font-mono text-[10px] text-text-secondary">Every event references an actor, organization and result. Transfers log a full chain-of-custody — audit-ready for hospital boards and compliance teams.</p>
      </div>
    </div>
  );
}
