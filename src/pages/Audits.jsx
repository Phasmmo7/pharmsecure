import { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { Card, Pill, Chip, Button, Icon, fmtDate, cx, Reveal } from '../components/ui.jsx';

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

/* ── Decorative SVG Graphics ── */
function AuditLogGraphic() {
  return (
    <svg className="absolute -right-4 -top-4 opacity-[0.05] pointer-events-none" width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="20" y="15" width="80" height="90" rx="6" stroke="#60a5fa" strokeWidth="1.5"/>
      <rect x="28" y="25" width="40" height="3" rx="1" fill="#3b82f6" fillOpacity="0.2"/>
      <rect x="28" y="33" width="30" height="2" rx="1" fill="#3b82f6" fillOpacity="0.15"/>
      <path d="M28 45H92M28 55H82M28 65H88M28 75H72M28 85H78" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 3"/>
      <circle cx="85" cy="85" r="15" stroke="#3b82f6" strokeWidth="1.5"/>
      <path d="M80 85H90M85 80V90" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function ComplianceGraphic() {
  return (
    <svg className="absolute -right-3 -bottom-3 opacity-[0.05] pointer-events-none" width="80" height="80" viewBox="0 0 80 80" fill="none">
      <path d="M40 8L68 22V42C68 58 40 72 40 72C40 72 12 58 12 42V22L40 8Z" stroke="#60a5fa" strokeWidth="1.5"/>
      <path d="M32 40L38 46L50 32" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="40" cy="40" r="22" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 4" opacity="0.5"/>
    </svg>
  );
}

function TableGraphic() {
  return (
    <svg className="absolute -right-2 -top-2 opacity-[0.04] pointer-events-none" width="70" height="70" viewBox="0 0 70 70" fill="none">
      <rect x="10" y="10" width="50" height="50" rx="4" stroke="#60a5fa" strokeWidth="1.5"/>
      <path d="M10 22H60M10 34H60M10 46H60M25 10V60M45 10V60" stroke="#60a5fa" strokeWidth="0.5" opacity="0.5"/>
      <circle cx="18" cy="16" r="3" fill="#3b82f6" fillOpacity="0.2"/>
      <circle cx="35" cy="16" r="3" fill="#3b82f6" fillOpacity="0.15"/>
      <circle cx="52" cy="16" r="3" fill="#3b82f6" fillOpacity="0.1"/>
    </svg>
  );
}

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
    <div className="space-y-5">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-500/5">
              <Icon name="audit" size={18} className="text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-mist-100">Audit Trail</h2>
              <p className="text-[11px] text-mist-400">Immutable, compliance-ready log of every scan, match and transfer</p>
            </div>
          </div>
          <Button variant="ghost" icon={downloaded ? 'check' : 'copy'} onClick={exportCsv}>{downloaded ? 'Exported' : 'Export CSV'}</Button>
        </div>
      </Reveal>

      <Reveal delay={50}>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(([k, l]) => (
            <Chip key={k} active={filter === k} onClick={() => setFilter(k)}>{l}</Chip>
          ))}
        </div>
      </Reveal>

      <Reveal delay={100}>
        <Card className="overflow-hidden relative">
          <TableGraphic />
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="sticky top-0 bg-panel/95 backdrop-blur-sm">
                <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-[0.15em] text-mist-400">
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Organization / city</th>
                  <th className="px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {list.map((a) => (
                  <tr key={a.id} className={cx('transition-colors', a.result === 'High-Risk' ? 'bg-rose-500/5' : 'hover:bg-white/[0.02]')}>
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

            <div className="divide-y divide-white/[0.03] md:hidden">
              {list.map((a) => (
                <div key={a.id} className="flex gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/[0.03] border border-white/[0.06] text-mist-400"><Icon name={ACTION_ICON[a.action] || 'audit'} size={15} /></span>
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
            {list.length === 0 && (
              <div className="px-4 py-12 text-center">
                <AuditLogGraphic />
                <div className="grid size-12 place-items-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mx-auto mb-3">
                  <Icon name="audit" size={22} className="text-mist-500" />
                </div>
                <p className="text-[12px] font-semibold text-mist-300">Nothing matches this filter</p>
                <p className="text-[11px] text-mist-500 mt-0.5">Try a different filter or check back later</p>
              </div>
            )}
          </div>
        </Card>
      </Reveal>

      <Reveal delay={150}>
        <Card className="relative overflow-hidden p-5">
          <ComplianceGraphic />
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-500/5">
              <Icon name="shield" size={16} className="text-brand-400" />
            </div>
            <p className="text-[12px] text-mist-300 leading-relaxed">Every event references an actor, organization and result. Transfers log a full chain-of-custody — audit-ready for hospital boards and compliance teams.</p>
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
