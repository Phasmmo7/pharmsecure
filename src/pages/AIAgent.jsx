import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store.jsx';
import { Icon, Card, Button, Pill } from '../components/ui.jsx';

const SUGGESTIONS = [
  { label: 'Verify PS-DEMO-0001', icon: 'scan', color: 'emerald' },
  { label: 'Show surplus risks', icon: 'alert', color: 'amber' },
  { label: 'Dashboard stats', icon: 'home', color: 'blue' },
  { label: 'List active transfers', icon: 'truck', color: 'cyan' },
  { label: 'Recent audit trail', icon: 'audit', color: 'purple' },
  { label: 'Find redistribution matches', icon: 'arrows', color: 'rose' },
  { label: 'Help', icon: 'sparkle', color: 'brand' },
];

function parseMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-mist-100 font-semibold">$1</strong>')
    .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/[0.06] text-brand-300 text-[11px] font-mono">$1</code>')
    .replace(/\n- /g, '\n<span class="text-mist-500 mr-1">•</span> ')
    .replace(/\n(\d+)\. /g, '\n<span class="text-brand-400 font-semibold mr-1">$1.</span> ')
    .replace(/\n/g, '<br/>');
}

function ToolCallBadge({ name, result }) {
  const toolLabels = {
    verify_medicine: 'Verified Medicine',
    list_batches: 'Listed Batches',
    surplus_analysis: 'Surplus Analysis',
    match_redistribution: 'Matched Redistribution',
    list_audits: 'Listed Audits',
    list_transfers: 'Listed Transfers',
    list_requests: 'Listed Requests',
    get_stats: 'Got Stats',
    list_orgs: 'Listed Orgs',
    notify_slack: 'Slack Notification',
    create_github_issue: 'GitHub Issue',
    send_email: 'Email Sent',
  };

  return (
    <div className="mt-2 flex items-center gap-2 rounded-lg bg-brand-500/[0.08] border border-brand-500/[0.15] px-3 py-2">
      <div className="grid size-6 place-items-center rounded-md bg-brand-500/20">
        <Icon name="bolt" size={12} className="text-brand-400" />
      </div>
      <span className="text-[10px] font-medium text-brand-300">
        {toolLabels[name] || name}
      </span>
      {result && typeof result === 'object' && result.success === false && (
        <span className="ml-auto text-[9px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
          Connect first
        </span>
      )}
    </div>
  );
}

export default function AIAgent() {
  const { token } = useStore();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "I'm the **PharmSecure AI Agent**, powered by Corsair MCP. I can help you:\n\n• **Verify medicine** authenticity with risk analysis\n• **Analyze surplus** and expiry risks across the supply chain\n• **Find redistribution** matches for at-risk batches\n• **View audit trails**, transfers, and medicine requests\n• **Send notifications** via Slack, GitHub, or Gmail (when connected)\n\nTry asking me something, or pick a suggestion below.",
      toolCalls: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg, toolCalls: [] }]);
    setLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || data.error || 'No response',
          toolCalls: data.toolCalls || [],
          agent: data.agent,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message}`, toolCalls: [] },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative">
          <div className="absolute -inset-1 bg-brand-500/15 rounded-xl blur-md" />
          <div className="relative grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 border border-brand-500/20">
            <Icon name="sparkle" size={20} className="text-brand-400" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-mist-50">AI Agent</h1>
          <p className="text-[11px] text-mist-500">Corsair MCP-powered assistant for PharmSecure</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1">
            <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-300">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto rounded-2xl bg-gradient-to-b from-panel to-panel/80 border border-edge/50 p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-brand-500/20 border border-brand-500/30 text-mist-100'
                : 'bg-white/[0.03] border border-white/[0.06] text-mist-300'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="grid size-5 place-items-center rounded-md bg-brand-500/20">
                    <Icon name="sparkle" size={10} className="text-brand-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider">
                    PharmSecure Agent {msg.agent === 'ai' ? '• AI' : ''}
                  </span>
                </div>
              )}
              <div
                className="text-[12.5px] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
              />
              {msg.toolCalls?.map((tc, j) => (
                <ToolCallBadge key={j} name={tc.name} result={tc.result} />
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="size-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:0ms]" />
                  <div className="size-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:150ms]" />
                  <div className="size-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-[10px] text-mist-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => sendMessage(s.label)}
              className="flex items-center gap-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-mist-400 hover:bg-white/[0.06] hover:text-mist-200 hover:border-white/[0.1] transition-all duration-200"
            >
              <Icon name={s.icon} size={12} className={`text-${s.color}-400`} />
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about medicine verification, surplus risks, redistribution..."
            className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-[12.5px] text-mist-200 placeholder-mist-600 focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.05] transition-all duration-200"
            disabled={loading}
          />
        </div>
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="rounded-xl px-5 py-3 bg-brand-500 hover:bg-brand-400 text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon name="bolt" size={16} />
        </Button>
      </div>
    </div>
  );
}
