import { useState, useEffect } from 'react';
import { useStore } from '../store.jsx';
import { Icon, Card, Button, Pill } from '../components/ui.jsx';

const INTEGRATIONS = [
  {
    id: 'github',
    name: 'GitHub',
    icon: 'audit',
    color: 'emerald',
    description: 'Create issues, track incidents, and manage code repositories for pharmaceutical audits.',
    capabilities: ['Create issues for counterfeit findings', 'Track audit reports', 'Manage supply chain code'],
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: 'bolt',
    color: 'purple',
    description: 'Send real-time alerts and notifications about suspicious medicines and supply chain events.',
    capabilities: ['Alert teams about suspicious batches', 'Daily surplus risk digests', 'Emergency transfer notifications'],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    icon: 'copy',
    color: 'blue',
    description: 'Send email reports and alerts to stakeholders about pharmaceutical findings.',
    capabilities: ['Verification report emails', 'Audit summary delivery', 'Stakeholder notifications'],
  },
];

function IntegrationCard({ integration, status, onConnect }) {
  const isConnected = status?.[integration.id] || false;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`grid size-10 place-items-center rounded-xl bg-${integration.color}-500/15 border border-${integration.color}-500/20`}>
              <Icon name={integration.icon} size={18} className={`text-${integration.color}-400`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-mist-100">{integration.name}</h3>
              <p className="text-[10px] text-mist-500">via Corsair MCP</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`size-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-mist-600'}`} />
            <span className={`text-[10px] font-medium ${isConnected ? 'text-emerald-400' : 'text-mist-500'}`}>
              {isConnected ? 'Connected' : 'Not connected'}
            </span>
          </div>
        </div>

        <p className="text-[11.5px] text-mist-400 leading-relaxed mb-4">{integration.description}</p>

        <div className="space-y-1.5 mb-4">
          {integration.capabilities.map((cap) => (
            <div key={cap} className="flex items-center gap-2 text-[10.5px] text-mist-500">
              <Icon name="check" size={10} className="text-emerald-400 shrink-0" />
              {cap}
            </div>
          ))}
        </div>

        <Button
          onClick={() => onConnect(integration.id)}
          className={`w-full rounded-xl py-2.5 text-[11px] font-semibold ${
            isConnected
              ? 'bg-white/[0.04] border border-white/[0.06] text-mist-300 hover:bg-white/[0.07]'
              : `bg-${integration.color}-500/15 border border-${integration.color}-500/25 text-${integration.color}-300 hover:bg-${integration.color}-500/25`
          }`}
        >
          {isConnected ? 'Manage Connection' : `Connect ${integration.name}`}
        </Button>
      </div>
    </Card>
  );
}

function WorkflowCard({ title, description, icon, steps, status }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
      <div className="relative p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="grid size-8 place-items-center rounded-lg bg-brand-500/15 border border-brand-500/20">
            <Icon name={icon} size={14} className="text-brand-400" />
          </div>
          <div>
            <h4 className="text-[12px] font-semibold text-mist-100">{title}</h4>
            <p className="text-[10px] text-mist-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="rounded-md bg-white/[0.04] border border-white/[0.06] px-2 py-1 text-[9px] text-mist-400">
                {step}
              </div>
              {i < steps.length - 1 && <Icon name="chevron-right" size={10} className="text-mist-600 mx-0.5" />}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function Integrations() {
  const { token } = useStore();
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/corsair/status', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  async function handleConnect(plugin) {
    try {
      const res = await fetch(`/api/agent/connect?plugin=${plugin}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.connectUrl) {
        window.open(data.connectUrl, '_blank');
      }
    } catch {
      alert(`To connect ${plugin}, add your API credentials to the .env file and restart the server.`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute -inset-1 bg-brand-500/15 rounded-xl blur-md" />
          <div className="relative grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 border border-brand-500/20">
            <Icon name="plug" size={20} className="text-brand-400" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-mist-50">Integrations</h1>
          <p className="text-[11px] text-mist-500">Powered by Corsair — Connect external services to PharmSecure</p>
        </div>
        <div className="ml-auto">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-1.5">
            <Icon name="plug" size={12} className="text-brand-400" />
            <span className="text-[10px] font-medium text-mist-400">
              MCP Endpoint: <code className="text-brand-300">/mcp</code>
            </span>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-brand-500/[0.08] to-brand-600/[0.05] border-brand-500/20">
        <div className="relative p-4 flex items-center gap-4">
          <div className="grid size-10 place-items-center rounded-xl bg-brand-500/20">
            <Icon name="sparkle" size={18} className="text-brand-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-[12px] font-semibold text-mist-100">Corsair MCP Integration Active</h3>
            <p className="text-[10.5px] text-mist-400">
              Your PharmSecure instance is connected to Corsair's integration layer. The AI Agent can use these tools
              to interact with GitHub, Slack, and Gmail. Connect services below to unlock full capabilities.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`size-2.5 rounded-full ${status.corsair ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[10px] font-medium text-mist-300">
              {status.corsair ? 'Hub Connected' : 'Self-Hosted'}
            </span>
          </div>
        </div>
      </Card>

      {/* Integration Cards */}
      <div>
        <h2 className="text-[13px] font-semibold text-mist-200 mb-3">Service Connections</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INTEGRATIONS.map((int) => (
            <IntegrationCard
              key={int.id}
              integration={int}
              status={status}
              onConnect={handleConnect}
            />
          ))}
        </div>
      </div>

      {/* Workflow Automations */}
      <div>
        <h2 className="text-[13px] font-semibold text-mist-200 mb-3">Workflow Automations</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <WorkflowCard
            title="Counterfeit Alert Pipeline"
            description="Auto-notify on suspicious finds"
            icon="alert"
            steps={['AI detects suspicious', 'Slack alert sent', 'GitHub issue created']}
            status="ready"
          />
          <WorkflowCard
            title="Expiry Risk Digest"
            description="Daily surplus risk reports"
            icon="clock"
            steps={['Analyze surplus', 'Generate digest', 'Email stakeholders']}
            status="ready"
          />
          <WorkflowCard
            title="Transfer Orchestrator"
            description="Automated redistribution flow"
            icon="arrows"
            steps={['Match found', 'Notify recipient', 'Track delivery']}
            status="ready"
          />
          <WorkflowCard
            title="Audit Compliance"
            description="Auto-log and report findings"
            icon="audit"
            steps={['Event detected', 'Audit logged', 'Report generated']}
            status="ready"
          />
        </div>
      </div>

      {/* MCP Tools Reference */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
        <div className="relative p-5">
          <h2 className="text-[13px] font-semibold text-mist-200 mb-3">MCP Tools Available</h2>
          <p className="text-[10.5px] text-mist-500 mb-4">
            These tools are exposed via the MCP endpoint at <code className="text-brand-300">/mcp</code> and available to the AI Agent.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'verify_medicine', desc: 'Verify medicine serial codes' },
              { name: 'list_batches', desc: 'List all medicine batches' },
              { name: 'surplus_analysis', desc: 'Analyze surplus/expiry risks' },
              { name: 'match_redistribution', desc: 'Find redistribution matches' },
              { name: 'list_audits', desc: 'View audit log entries' },
              { name: 'list_transfers', desc: 'List active transfers' },
              { name: 'list_requests', desc: 'View medicine requests' },
              { name: 'get_stats', desc: 'Get dashboard statistics' },
              { name: 'list_orgs', desc: 'List supply chain organizations' },
              { name: 'notify_slack', desc: 'Send Slack notifications' },
              { name: 'create_github_issue', desc: 'Create GitHub issues' },
              { name: 'send_email', desc: 'Send email reports' },
            ].map((tool) => (
              <div key={tool.name} className="flex items-center gap-2 rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                <Icon name="bolt" size={10} className="text-brand-400 shrink-0" />
                <div>
                  <code className="text-[10px] text-brand-300 font-mono">{tool.name}</code>
                  <p className="text-[9px] text-mist-500">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
