import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { createVercelAiMcpClient } from '@corsair-dev/mcp';
import { corsair, corsairDb } from './corsair.mjs';
import { verifyCode, surplusAnalysis, matchRedistribution, dashboardStats } from '../src/lib/engines.js';
import { loadState, listAudits, listTransfers, listRequests } from './store.mjs';
import { openDb } from './db.mjs';

const pharmDb = openDb();

const corsairApi = corsair;

function getToolsForPharmsecure() {
  const tools = {};

  tools.verify_medicine = {
    description: 'Verify a medicine serial code for authenticity. Returns verdict, risk score, and breakdown.',
    parameters: { type: 'object', properties: { code: { type: 'string', description: 'Serial code like PS-DEMO-0001' } }, required: ['code'] },
  };

  tools.list_batches = {
    description: 'List all medicine batches with stock, expiry, and holder info.',
    parameters: { type: 'object', properties: {} },
  };

  tools.list_orgs = {
    description: 'List all organizations in the supply chain network.',
    parameters: { type: 'object', properties: {} },
  };

  tools.surplus_analysis = {
    description: 'Analyze surplus/expiry risk for all batches. Returns flagged batches with risk scores.',
    parameters: { type: 'object', properties: {} },
  };

  tools.match_redistribution = {
    description: 'Find best redistribution matches for a specific batch. Returns ranked recipients.',
    parameters: { type: 'object', properties: { batchId: { type: 'string', description: 'Batch ID to match' } }, required: ['batchId'] },
  };

  tools.list_audits = {
    description: 'List recent audit log entries (scans, transfers, QR issues, requests).',
    parameters: { type: 'object', properties: { limit: { type: 'number', description: 'Max entries to return' } } },
  };

  tools.list_transfers = {
    description: 'List all medicine transfers and their current status.',
    parameters: { type: 'object', properties: {} },
  };

  tools.list_requests = {
    description: 'List all pending medicine requests from organizations.',
    parameters: { type: 'object', properties: {} },
  };

  tools.get_stats = {
    description: 'Get dashboard statistics: verified count, rescued, at-risk, in-transit.',
    parameters: { type: 'object', properties: {} },
  };

  tools.notify_slack = {
    description: 'Send a notification message to a Slack channel about pharmaceutical alerts.',
    parameters: { type: 'object', properties: {
      channel: { type: 'string', description: 'Slack channel name or ID' },
      message: { type: 'string', description: 'Message to send' },
    }, required: ['channel', 'message'] },
  };

  tools.create_github_issue = {
    description: 'Create a GitHub issue for tracking pharmaceutical incidents or findings.',
    parameters: { type: 'object', properties: {
      repo: { type: 'string', description: 'Repository in owner/repo format' },
      title: { type: 'string', description: 'Issue title' },
      body: { type: 'string', description: 'Issue body/description' },
      labels: { type: 'array', items: { type: 'string' }, description: 'Labels to add' },
    }, required: ['repo', 'title', 'body'] },
  };

  tools.send_email = {
    description: 'Send an email report about pharmaceutical findings or alerts.',
    parameters: { type: 'object', properties: {
      to: { type: 'string', description: 'Recipient email address' },
      subject: { type: 'string', description: 'Email subject' },
      body: { type: 'string', description: 'Email body' },
    }, required: ['to', 'subject', 'body'] },
  };

  return tools;
}

async function executeTool(name, args, fetchFn) {
  switch (name) {
    case 'verify_medicine': {
      const st = loadState(pharmDb);
      return verifyCode(st, args.code, { orgId: 'acc_admin', at: new Date().toISOString(), by: 'AI Agent' });
    }
    case 'list_batches': {
      const st = loadState(pharmDb);
      return Object.values(st.batches).map(b => ({
        id: b.id, name: b.name, generic: b.generic, form: b.form,
        strength: b.strength, stock: b.stock, expiry: b.expiry,
        holderId: b.holderId, dailyBurn: b.dailyBurn,
      }));
    }
    case 'list_orgs': {
      const st = loadState(pharmDb);
      return st.orgs;
    }
    case 'surplus_analysis': {
      const st = loadState(pharmDb);
      const all = Object.values(st.batches).map(b => ({ ...b, ...surplusAnalysis(b) }));
      return all.filter(b => b.level !== 'Low').sort((a, b) => b.score - a.score).slice(0, 20);
    }
    case 'match_redistribution': {
      const st = loadState(pharmDb);
      return matchRedistribution(st, args.batchId);
    }
    case 'list_audits': {
      return listAudits(pharmDb, { sub: 'acc_admin' }).slice(0, args.limit || 20);
    }
    case 'list_transfers': {
      return listTransfers(pharmDb);
    }
    case 'list_requests': {
      return listRequests(pharmDb);
    }
    case 'get_stats': {
      const st = loadState(pharmDb);
      return dashboardStats(st);
    }
    case 'notify_slack': {
      try {
        const result = await corsairApi.slack.api.messages.post({
          channel: args.channel,
          text: args.message,
        });
        return { success: true, result };
      } catch (e) {
        return { success: false, error: e.message, hint: 'Connect Slack first via /api/corsair/connect?plugin=slack' };
      }
    }
    case 'create_github_issue': {
      try {
        const result = await corsairApi.github.api.issues.create({
          owner: args.repo.split('/')[0],
          repo: args.repo.split('/')[1],
          title: args.title,
          body: args.body,
          labels: args.labels || [],
        });
        return { success: true, result };
      } catch (e) {
        return { success: false, error: e.message, hint: 'Connect GitHub first via /api/corsair/connect?plugin=github' };
      }
    }
    case 'send_email': {
      try {
        const result = await corsairApi.gmail.api.messages.send({
          to: args.to,
          subject: args.subject,
          body: args.body,
        });
        return { success: true, result };
      } catch (e) {
        return { success: false, error: e.message, hint: 'Connect Gmail first via /api/corsair/connect?plugin=gmail' };
      }
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

export async function handleAgentChat(req, res) {
  const { message, history = [] } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Message required' });

  const tools = getToolsForPharmsecure();
  const systemPrompt = `You are PharmSecure AI Agent — an intelligent assistant for pharmaceutical supply chain security and medicine verification.

You have access to the PharmSecure database and can:
- Verify medicine serial codes for authenticity (counterfeit detection)
- Analyze surplus/expiry risk across the supply chain
- Find redistribution matches for at-risk batches
- View audit logs, transfers, and medicine requests
- Send notifications via Slack, create GitHub issues, or send emails (if connected)

When asked about medicine verification, always use verify_medicine with the code.
When asked about inventory or supply chain, use list_batches and surplus_analysis.
When asked about redistribution, use match_redistribution.
For notifications/alerts, use notify_slack, create_github_issue, or send_email.
Always provide clear, actionable insights. If a medicine is suspicious, highlight the risk factors.
Be concise but thorough. Use medical/pharmaceutical terminology accurately.

Available demo codes: PS-DEMO-0001 through PS-DEMO-0010 (genuine), PS-DEMO-FAKE (counterfeit).`;

  try {
    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
    if (ANTHROPIC_KEY) {
      const { text, toolCalls } = await generateText({
        model: anthropic('claude-sonnet-4-20250514'),
        system: systemPrompt,
        messages: [...history, { role: 'user', content: message }],
        tools: Object.fromEntries(
          Object.entries(tools).map(([name, def]) => [name, {
            description: def.description,
            parameters: def.parameters,
          }])
        ),
        maxSteps: 10,
        onStepFinish: async ({ toolCalls: calls }) => {
          for (const tc of calls || []) {
            tc.result = await executeTool(tc.toolName, tc.args);
          }
        },
      });

      return res.json({
        reply: text,
        toolCalls: toolCalls?.map(tc => ({ name: tc.toolName, args: tc.args, result: tc.result })) || [],
        agent: 'ai',
      });
    }

    return handleFallbackAgent(message, res);
  } catch (err) {
    console.error('[agent] Error:', err);
    return handleFallbackAgent(message, res);
  }
}

async function handleFallbackAgent(message, res) {
  const lower = message.toLowerCase();
  const st = loadState(pharmDb);

  if (lower.includes('verify') || lower.includes('scan') || /ps-demo-\d+/i.test(lower)) {
    const codeMatch = lower.match(/ps-demo-\d+|ps-demo-fake/i);
    if (codeMatch) {
      const result = verifyCode(st, codeMatch[0].toUpperCase(), { orgId: 'acc_admin', at: new Date().toISOString(), by: 'AI Agent' });
      const factors = (result.checks || []).map(f => `- ${f.label}: ${f.impact > 0 ? '+' : ''}${f.impact} (${f.detail})`).join('\n');
      return res.json({
        reply: `**Verification Result for ${result.code}:**\n\nVerdict: **${result.verdict}** (Risk Score: ${result.score})\n\n${result.summary}\n\n${factors ? 'Factors:\n' + factors : ''}`,
        agent: 'fallback',
      });
    }
    return res.json({ reply: 'Please provide a serial code to verify (e.g., PS-DEMO-0001).', agent: 'fallback' });
  }

  if (lower.includes('surplus') || lower.includes('risk') || lower.includes('expir')) {
    const all = Object.values(st.batches).map(b => ({ ...b, ...surplusAnalysis(b) }));
    const flagged = all.filter(b => b.level !== 'Low').sort((a, b) => b.score - a.score).slice(0, 5);
    return res.json({
      reply: `**Top Surplus/Expiry Risks:**\n\n${flagged.map(b => `- ${b.name} (${b.generic}): Score ${b.score}, Level ${b.level} — ${b.notes.join('; ')}`).join('\n')}`,
      agent: 'fallback',
    });
  }

  if (lower.includes('match') || lower.includes('redistribut')) {
    const batchIds = Object.keys(st.batches);
    if (batchIds.length) {
      const result = matchRedistribution(st, batchIds[0]);
      return res.json({
        reply: `**Top redistribution matches for ${batchIds[0]}:**\n\n${result.matches.map((m, i) => `${i + 1}. ${m.orgName} — Score ${m.score} (${m.distanceKm}km away)`).join('\n')}`,
        agent: 'fallback',
      });
    }
  }

  if (lower.includes('stat') || lower.includes('dashboard')) {
    const stats = dashboardStats(st);
    return res.json({
      reply: `**Dashboard Stats:**\n- At Risk Batches: ${stats.atRisk}\n- Pending Surplus: ${stats.pendingSurplus} units\n- Recovered: ${stats.recovered} units\n- Active Transfers: ${stats.activeTransfers}\n- Scans Today: ${stats.scansToday}\n- High-Risk Findings: ${stats.highRisk}\n- Audits Today: ${stats.auditsToday}`,
      agent: 'fallback',
    });
  }

  if (lower.includes('audit') || lower.includes('log')) {
    const audits = listAudits(pharmDb, { sub: 'acc_admin' }).slice(0, 5);
    return res.json({
      reply: `**Recent Audits:**\n${audits.map(a => `- ${a.action} by ${a.actor}: ${a.result}`).join('\n')}`,
      agent: 'fallback',
    });
  }

  if (lower.includes('transfer')) {
    const transfers = listTransfers(pharmDb);
    return res.json({
      reply: `**Active Transfers:** ${transfers.length}\n${transfers.slice(0, 3).map(t => `- ${t.name}: ${t.status}`).join('\n')}`,
      agent: 'fallback',
    });
  }

  if (lower.includes('request')) {
    const requests = listRequests(pharmDb);
    return res.json({
      reply: `**Pending Requests:** ${requests.length}\n${requests.slice(0, 3).map(r => `- ${r.medicine} (${r.qty} units, ${r.urgency})`).join('\n')}`,
      agent: 'fallback',
    });
  }

  if (lower.includes('slack') || lower.includes('notify') || lower.includes('alert')) {
    return res.json({
      reply: 'To send Slack notifications, connect your Slack workspace first. Use the **Integrations** panel on the AI Agent page to connect Slack, GitHub, or Gmail.',
      agent: 'fallback',
    });
  }

  if (lower.includes('help') || lower.includes('what can')) {
    return res.json({
      reply: `**PharmSecure AI Agent** can help you with:\n\n• **Verify medicine** — "Verify PS-DEMO-0001"\n• **Check surplus risks** — "Show surplus risks"\n• **Find redistribution matches** — "Find matches for BATCH-001"\n• **View dashboard stats** — "Show stats"\n• **Audit trail** — "Show recent audits"\n• **Transfers** — "List active transfers"\n• **Notifications** — "Notify Slack about suspicious batch"\n• **GitHub issues** — "Create issue for counterfeit found"\n\nFor AI-powered responses with live Corsair integrations, add your ANTHROPIC_API_KEY to .env`,
      agent: 'fallback',
    });
  }

  return res.json({
    reply: `I'm the PharmSecure AI Agent. I can help with medicine verification, surplus analysis, redistribution matching, and supply chain notifications.\n\nTry: "Verify PS-DEMO-0001" or "Show surplus risks" or type "help" for full options.`,
    agent: 'fallback',
  });
}

export async function handleMcpConnect(req, res) {
  const { plugin } = req.query || {};
  if (!plugin) return res.status(400).json({ error: 'plugin query param required (github, slack, gmail)' });

  try {
    const tenantId = req.user?.sub || 'default';
    const tenant = corsair.withTenant(tenantId);
    const link = await tenant.manage.connect.createLink({ plugin });
    res.json({ connectUrl: link.connectUrl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function handleMcpOperations(_req, res) {
  const operations = [
    { plugin: 'github', operations: ['repositories.list', 'issues.create', 'issues.list', 'pullRequests.list'] },
    { plugin: 'slack', operations: ['messages.post', 'channels.list', 'users.get'] },
    { plugin: 'gmail', operations: ['messages.send', 'messages.list', 'messages.get'] },
  ];
  res.json(operations);
}
