#!/usr/bin/env node
/**
 * Writes the auto-update manifest for the OFFLINE "DineOpen POS Server" build
 * (server.yml on Windows, server-mac.yml on macOS) next to the built installers.
 *
 * Used ONLY by .github/workflows/build-unified.yml (v*-server tags). The normal online app's
 * build (build-electron.yml) publishes with electron-builder and gets latest.yml from it.
 *
 * Why: the offline build runs electron-builder with --publish never, which writes no update
 * manifest — so every offline release so far had no server.yml and the in-app "Check for
 * updates" could never find a new version. The installed app (allowPrerelease, version
 * x.y.z-server) looks in the newest `-server` GitHub release for `server.yml`
 * (`server-mac.yml` on mac). This writes it in electron-builder's own format.
 *
 * URLs are the names GitHub gives the uploaded assets: spaces become dots
 * ("DineOpen POS Server Setup 1.14.176-server.exe" → "DineOpen.POS.Server.Setup.1.14.176-server.exe").
 *
 * Usage: node scripts/write-server-update-manifest.js <dir> <win|mac> <version>
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const [dir, platform, version] = process.argv.slice(2);
if (!dir || !['win', 'mac'].includes(platform) || !version) {
  console.error('usage: write-server-update-manifest.js <dir> <win|mac> <version>');
  process.exit(1);
}
if (!/-server$/.test(version)) {
  console.error(`version must end in -server (got ${version}) — the installed app matches the "server" channel`);
  process.exit(1);
}

const sha512 = (file) => new Promise((resolve, reject) => {
  const h = crypto.createHash('sha512');
  fs.createReadStream(file).on('data', (d) => h.update(d)).on('error', reject).on('end', () => resolve(h.digest('base64')));
});
const assetName = (file) => path.basename(file).replace(/ /g, '.');

(async () => {
  const names = fs.readdirSync(dir).filter((n) => n.includes(version));
  const picked = platform === 'win'
    ? names.filter((n) => /\.exe$/i.test(n))
    // mac: the updater installs from the .zip (one per arch); the .dmg is listed like electron-builder does
    : [...names.filter((n) => /\.zip$/i.test(n)), ...names.filter((n) => /\.dmg$/i.test(n))];
  if (!picked.length) { console.error(`no ${platform} installer for ${version} in ${dir}`); process.exit(1); }

  const files = [];
  for (const n of picked) {
    const full = path.join(dir, n);
    const entry = { url: assetName(full), sha512: await sha512(full), size: fs.statSync(full).size };
    const bm = `${full}.blockmap`;
    if (fs.existsSync(bm)) entry.blockMapSize = fs.statSync(bm).size;
    files.push(entry);
  }
  const main = files[0];
  const lines = [`version: ${version}`, 'files:'];
  for (const f of files) {
    lines.push(`  - url: ${f.url}`, `    sha512: ${f.sha512}`, `    size: ${f.size}`);
    if (f.blockMapSize) lines.push(`    blockMapSize: ${f.blockMapSize}`);
  }
  lines.push(`path: ${main.url}`, `sha512: ${main.sha512}`, `releaseDate: '${new Date().toISOString()}'`, '');
  const out = path.join(dir, platform === 'win' ? 'server.yml' : 'server-mac.yml');
  fs.writeFileSync(out, lines.join('\n'));
  console.log(`wrote ${out}:\n${lines.join('\n')}`);
})().catch((e) => { console.error(e); process.exit(1); });
