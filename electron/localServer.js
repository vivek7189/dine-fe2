/**
 * localServer.js — makes the POS app ITS OWN server.
 *
 * When "server mode" is on, the POS Electron app boots an embedded PostgreSQL and
 * forks the REAL dine-backend (LOCAL_SERVER_MODE) on 127.0.0.1:3003. The renderer's
 * `preferLoopbackIfLocal()` then auto-routes the whole POS UI to this local backend,
 * so the machine is BOTH the server (hub) and a terminal — one app, not two.
 *
 *   POS UI  ──HTTP──▶  local dine-backend (:3003)  ──▶  embedded Postgres  (offline)
 *                                     │
 *                                     └── cloudSyncWorker ──▶ cloud Postgres (when online)
 *
 * This is a focused port of dine-backend/desktop-server/main.js's proven bootstrap
 * (embedded-postgres start, schema load, backend fork, watchdog, crash-respawn).
 * Backend code is reused verbatim — zero query rewrite. Additive: when server mode is
 * OFF (a plain terminal), none of this runs and the app behaves exactly as before.
 */
const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const { fork } = require('child_process');
const { pathToFileURL } = require('url');

const PG_PORT = 5433;
const PG_USER = 'dine_app';
const PG_PASSWORD = 'dineopen_local';
const BACKEND_PORT = 3003;

let pgInstance = null;
let backendProc = null;
let quitting = false;
let isRestarting = false;
let lastDbUrl = null;
let backendRestarts = 0;
let backendUpTimer = null;
let watchdogTimer = null;
let watchdogFails = 0;
let RESOLVED_PGDATA = null;
let logSink = (s) => { try { process.stdout.write(`[localServer] ${s}\n`); } catch (_) {} };

function log(line) {
  const s = String(line).replace(/\s+$/, '');
  if (s) logSink(s);
}

// ── Where the backend lives ──────────────────────────────────────────────────
// Packaged: resources/backend (bundled via electron-builder extraResources).
// Dev: the sibling dine-backend repo checkout.
function backendDir() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'backend')
    : path.join(__dirname, '..', '..', 'dine-backend');
}

// ── Stable data location (survives app uninstall) ────────────────────────────
function dataRoot() {
  const custom = (process.env.DINEOPEN_DATA_DIR || '').trim();
  const root = custom || path.join(os.homedir(), 'DineOpenServer');
  try { fs.mkdirSync(root, { recursive: true }); } catch (_) {}
  return root;
}
function configFile() { return path.join(dataRoot(), 'server-config.json'); }
function readConfig() { try { return JSON.parse(fs.readFileSync(configFile(), 'utf8')); } catch { return {}; } }
function writeConfig(patch) {
  const cfg = { ...readConfig(), ...patch };
  try { fs.writeFileSync(configFile(), JSON.stringify(cfg, null, 2)); } catch (_) {}
  return cfg;
}

/** Server mode: is this install acting as the local server/hub? Default OFF (plain terminal). */
function isServerModeEnabled() {
  if (process.env.DINE_LOCAL_SERVER === '0') return false;
  if (process.env.DINE_LOCAL_SERVER === '1') return true;
  const cfg = readConfig();
  return cfg.serverMode === true;
}
function setServerMode(on) { writeConfig({ serverMode: !!on }); }
// This terminal's number for multi-terminal order numbering (T1, T2, ...). Persisted so it
// survives restarts; passed to the backend as TERMINAL_PREFIX on next launch.
function getTerminalNumber() { const n = readConfig().terminalNumber; return n ? Number(n) : null; }
function setTerminalNumber(n) { writeConfig({ terminalNumber: (n && Number(n) > 0) ? Number(n) : null }); }

function pgDataDir() {
  if (RESOLVED_PGDATA) return RESOLVED_PGDATA;
  RESOLVED_PGDATA = path.join(dataRoot(), 'pgdata');
  return RESOLVED_PGDATA;
}

function lanIPs() {
  const out = [];
  const ifs = os.networkInterfaces();
  for (const name of Object.keys(ifs)) {
    for (const ni of ifs[name] || []) {
      if (ni.family === 'IPv4' && !ni.internal) out.push(ni.address);
    }
  }
  return out;
}

async function loadEmbeddedPostgres() {
  // embedded-postgres is ESM-only; load via dynamic import() from the bundled backend.
  const entry = path.join(backendDir(), 'node_modules', 'embedded-postgres', 'dist', 'index.js');
  const M = await import(pathToFileURL(entry).href);
  return M.default || M;
}

async function startPostgres() {
  const EmbeddedPostgres = await loadEmbeddedPostgres();
  const dataDir = pgDataDir();
  const first = !fs.existsSync(dataDir);

  log(`🐘 Starting database (${first ? 'first-time setup' : 'existing data'})…`);
  pgInstance = new EmbeddedPostgres({
    databaseDir: dataDir, user: PG_USER, password: PG_PASSWORD, port: PG_PORT, persistent: true,
  });
  if (first) await pgInstance.initialise();
  await pgInstance.start();
  try { await pgInstance.createDatabase('dine'); } catch (_) {}

  const connString = `postgresql://${PG_USER}:${PG_PASSWORD}@127.0.0.1:${PG_PORT}/dine`;

  if (first) {
    const schemaFile = path.join(backendDir(), 'scripts', 'offline-schema.sql');
    if (fs.existsSync(schemaFile)) {
      try {
        const { Client } = require(path.join(backendDir(), 'node_modules', 'pg'));
        const c = new Client({ connectionString: connString });
        await c.connect();
        // Strip psql meta-commands (\restrict/\connect) that node-postgres can't parse.
        const sql = fs.readFileSync(schemaFile, 'utf8').split('\n').filter((l) => !/^\s*\\/.test(l)).join('\n');
        await c.query(sql);
        await c.end();
        log('📐 Database schema loaded.');
      } catch (e) { log(`⚠️ Schema load: ${e.message}`); }
    } else {
      log('ℹ️ No bundled schema — tables created lazily / while provisioning online.');
    }
  }
  log('🐘 Database ready.');
  return connString;
}

function startBackend(databaseUrl) {
  const entry = path.join(backendDir(), 'index.js');

  // Operator overrides (cloud DB URL, sync mode, JWT secret, real API keys) from
  // userData/.env.local — anything there wins over the offline placeholders below.
  try {
    const dotenv = require(path.join(backendDir(), 'node_modules', 'dotenv'));
    const cfg = path.join(app.getPath('userData'), '.env.local');
    if (fs.existsSync(cfg)) { dotenv.config({ path: cfg }); log('⚙️  Loaded .env.local'); }
  } catch (_) {}

  const P = (k, v) => (process.env[k] && process.env[k].length ? process.env[k] : v);
  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    PORT: String(BACKEND_PORT),
    NODE_ENV: 'production',
    ELECTRON_RUN_AS_NODE: '1',
    LOCAL_SERVER_MODE: 'true',
    // Toast-style multi-terminal numbering: this terminal's prefix (T1, T2, ...) so its
    // order numbers never collide with another terminal's. Set once per terminal in setup
    // (config.terminalNumber). Empty on a single-terminal shop → plain numbers.
    TERMINAL_PREFIX: P('TERMINAL_PREFIX', (() => { const n = readConfig().terminalNumber; return n ? `T${n}` : ''; })()),
    OFFLINE_SYNC_EVENTS: P('OFFLINE_SYNC_EVENTS', 'true'), // enable M1-M4 event log locally
    // API-based cloud sync (hub → cloud). The worker reads its sync token + restaurant from the
    // hub's server-config.json (SYNC_CONFIG_PATH) so a freshly-issued token is picked up without a
    // restart; CLOUD_API_URL is the GCP backend. Dormant until a token is written to that config.
    CLOUD_API_URL: P('CLOUD_API_URL', 'https://34-93-129-104.sslip.io'),
    SYNC_CONFIG_PATH: configFile(),
    LOCAL_UPLOAD_DIR: P('LOCAL_UPLOAD_DIR', path.join(dataRoot(), 'uploads')),
    JWT_SECRET: P('JWT_SECRET', 'dineopen-offline-local-secret'),
    // Offline placeholders so eager-init SDKs don't crash the server; real values win.
    OPENAI_API_KEY: P('OPENAI_API_KEY', 'sk-offline-placeholder'),
    GODADY_EMAIL: P('GODADY_EMAIL', 'offline@example.com'),
    GODADY_PA: P('GODADY_PA', 'offline'),
    RAZORPAY_KEY_ID: P('RAZORPAY_KEY_ID', 'rzp_offline'),
    RAZORPAY_KEY_SECRET: P('RAZORPAY_KEY_SECRET', 'offline'),
    PINECONE_API_KEY: P('PINECONE_API_KEY', 'offline'),
    TWILIO_ACCOUNT_SID: P('TWILIO_ACCOUNT_SID', 'AC00000000000000000000000000000000'),
    TWILIO_AUTH_TOKEN: P('TWILIO_AUTH_TOKEN', 'offline'),
  };
  lastDbUrl = databaseUrl;
  backendProc = fork(entry, [], { cwd: backendDir(), env, stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
  backendProc.stdout.on('data', (d) => log(d));
  backendProc.stderr.on('data', (d) => log(d));

  if (backendUpTimer) clearTimeout(backendUpTimer);
  backendUpTimer = setTimeout(() => { backendRestarts = 0; }, 60000);

  backendProc.on('exit', (code) => {
    backendProc = null;
    if (quitting || isRestarting) return;
    const delay = Math.min(30000, 2000 * Math.pow(2, backendRestarts));
    backendRestarts++;
    log(`❌ Backend exited (${code}). ↻ Auto-restarting in ${Math.round(delay / 1000)}s (attempt ${backendRestarts})…`);
    setTimeout(() => { if (!quitting && lastDbUrl) startBackend(lastDbUrl); }, delay);
  });
  log(`🚀 Local backend started on port ${BACKEND_PORT}.`);
}

// ── Watchdog: bounce the backend if health fails ─────────────────────────────
function pingHealth() {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port: BACKEND_PORT, path: '/api/health', timeout: 4000 }, (res) => {
      res.resume(); resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}
function startWatchdog() {
  if (watchdogTimer) clearInterval(watchdogTimer);
  watchdogFails = 0;
  watchdogTimer = setInterval(async () => {
    if (quitting || isRestarting || !backendProc) return;
    const ok = await pingHealth();
    if (ok) { watchdogFails = 0; return; }
    watchdogFails++;
    log(`🩺 Health check failed (${watchdogFails}).`);
    if (watchdogFails === 3) {
      try { isRestarting = true; backendProc.kill(); } catch (_) {}
      setTimeout(() => { isRestarting = false; if (!backendProc && lastDbUrl && !quitting) startBackend(lastDbUrl); }, 2000);
    }
  }, 20000);
}

/** Wait until the local backend answers /api/health (or time out). */
async function waitForHealthy(timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await pingHealth()) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

/**
 * Boot the embedded PG + local backend. Resolves once healthy (or after a timeout;
 * the watchdog keeps trying either way). Safe to call once at app startup.
 */
async function startLocalServer({ onLog } = {}) {
  if (onLog) logSink = onLog;
  if (backendProc) return { alreadyRunning: true, port: BACKEND_PORT, ips: lanIPs() };
  quitting = false;
  const dbUrl = await startPostgres();
  startBackend(dbUrl);
  startWatchdog();
  const healthy = await waitForHealthy();
  log(healthy ? '✅ Local server healthy.' : '⚠️ Local server not healthy yet (watchdog will keep trying).');
  return { healthy, port: BACKEND_PORT, ips: lanIPs(), dataDir: pgDataDir() };
}

async function stopLocalServer() {
  quitting = true;
  if (watchdogTimer) { clearInterval(watchdogTimer); watchdogTimer = null; }
  try { if (backendProc) { backendProc.kill(); backendProc = null; } } catch (_) {}
  try { if (pgInstance) { await pgInstance.stop(); pgInstance = null; } } catch (_) {}
  log('🛑 Local server stopped.');
}

module.exports = {
  startLocalServer,
  stopLocalServer,
  isServerModeEnabled,
  setServerMode,
  getTerminalNumber,
  setTerminalNumber,
  pingHealth,
  lanIPs,
  BACKEND_PORT,
};
