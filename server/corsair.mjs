import { createCorsair, toExpressHandler, managementHandler } from 'corsair';
import { createBaseMcpServer, createMcpRouter } from '@corsair-dev/mcp';
import { github } from '@corsair-dev/github';
import { slack } from '@corsair-dev/slack';
import { gmail } from '@corsair-dev/gmail';
import Database from 'better-sqlite3';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const corsairDbPath = join(dataDir, 'corsair.db');

function initCorsairDb() {
  const db = new Database(corsairDbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS corsair_integrations (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      name TEXT NOT NULL,
      config TEXT NOT NULL DEFAULT '{}',
      dek TEXT NULL
    );
    CREATE TABLE IF NOT EXISTS corsair_accounts (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      tenant_id TEXT NOT NULL,
      integration_id TEXT NOT NULL,
      config TEXT NOT NULL DEFAULT '{}',
      dek TEXT NULL,
      FOREIGN KEY (integration_id) REFERENCES corsair_integrations(id)
    );
    CREATE TABLE IF NOT EXISTS corsair_entities (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      account_id TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      version TEXT NOT NULL,
      data TEXT NOT NULL DEFAULT '{}',
      FOREIGN KEY (account_id) REFERENCES corsair_accounts(id)
    );
    CREATE TABLE IF NOT EXISTS corsair_events (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      account_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL DEFAULT '{}',
      status TEXT,
      FOREIGN KEY (account_id) REFERENCES corsair_accounts(id)
    );
    CREATE TABLE IF NOT EXISTS corsair_permissions (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      token TEXT NOT NULL,
      plugin TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      args TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      expires_at TEXT NOT NULL,
      error TEXT
    );
  `);
  return db;
}

const corsairDb = initCorsairDb();

const CORSAIR_KEK = process.env.CORSAIR_KEK || 'pharmsecure-demo-kek-32-chars-minimum!!';
const CORSAIR_API_KEY = process.env.CORSAIR_API_KEY || '';
const CORSAIR_SIGNING_SECRET = process.env.CORSAIR_SIGNING_SECRET || '';

const useHub = CORSAIR_API_KEY && CORSAIR_SIGNING_SECRET;

const corsair = createCorsair({
  plugins: [
    github(),
    slack(),
    gmail(),
  ],
  database: corsairDb,
  kek: CORSAIR_KEK,
  ...(useHub ? {
    hub: {
      projectApiKey: CORSAIR_API_KEY,
      signingSecret: CORSAIR_SIGNING_SECRET,
    },
  } : {}),
});

const mcpServer = createBaseMcpServer({ corsair });

const mcpRouter = createMcpRouter(() => mcpServer);

export { corsair, corsairDb, mcpServer, mcpRouter, managementHandler, toExpressHandler };
