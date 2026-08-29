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
const FILTERS = [['all', 'All'], ['scan', 'Scans'], ['transfer', 'Transfers'], ['qr_issue', 'QR issues'], ['request', 'Requests']];

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
    <div className="animate-fade-up space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-mist-100">Audit trail</h2>
          <p className="text-xs text-mist-500">Immutable, compliance-ready log of every scan, match and transfer — chain-of-custody preserved.</p>
        </div>
        <Button variant="ghost" icon={downloaded ? 'check' : 'copy'} onClick={exportCsv}>{downloaded ? 'Exported' : 'Export CSV'}</Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(([k, l]) => (
          <Chip key={k} active={filter === k} onClick={() => setFilter(k)}>{l}</Chip>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="sticky top-0 bg-panel">
              <tr className="border-b border-edge text-[10px] font-bold uppercase tracking-wider text-mist-400">
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Organization / city</th>
                <th className="px-4 py-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {list.map((a) => (
                <tr key={a.id} className={a.result === 'High-Risk' ? 'bg-rose-500/5' : 'hover:bg-panel2/60'}>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-mist-500">{fmtDate(a.at)}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-mist-100">{a.actor}</p>
                    <p className="text-[10px] text-mist-500">{a.role}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-mist-200">
                      <Icon name={ACTION_ICON[a.action] || 'audit'} size={13} className="text-mist-500" />
                      {ACTION_LABEL[a.action] || a.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-mist-300">{a.code}</td>
                  <td className="px-4 py-3 text-xs text-mist-500">{a.org} · {a.city}</td>
                  <td className="px-4 py-3"><Pill label={a.result} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divide-y divide-edge md:hidden">
            {list.map((a) => (
              <div key={a.id} className="flex gap-3 px-4 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-panel2 text-mist-400"><Icon name={ACTION_ICON[a.action] || 'audit'} size={15} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-mist-100">{ACTION_LABEL[a.action] || a.action}</p>
                    <Pill label={a.result} className="shrink-0" />
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-mist-500">{a.code} · {a.org} · {a.city}</p>
                  <p className="text-[10px] text-mist-500">{a.actor} · {fmtDate(a.at)}</p>
                </div>
              </div>
            ))}
          </div>
          {list.length === 0 && <p className="px-4 py-10 text-center text-xs text-mist-500">Nothing matches this filter.</p>}
        </div>
      </Card>

      <Card className="flex flex-col gap-2 border-brand-500/30 bg-brand-500/10 p-4 text-[11px] text-mist-300 sm:flex-row sm:items-center sm:gap-3">
        <Icon name="shield" size={16} className="shrink-0 text-brand-300" />
        <p>Every event references an actor, organization and result. Transfers log a full chain-of-custody — audit-ready for hospital boards and compliance teams.</p>
      </Card>
    </div>
  );
}
