#!/usr/bin/env node

/**
 * Release to GCS script
 *
 * Workflow:
 * 1. Push a git tag (v1.8.0) → GitHub Actions builds Windows .exe
 * 2. Download the exe artifact from GitHub Actions → put files in gcs-releases/
 * 3. On your Mac, run: npm run release:gcs
 *    - Builds .dmg locally
 *    - Copies .dmg + latest-mac.yml + blockmap to gcs-releases/
 *    - Uploads everything in gcs-releases/ (exe + dmg + yml files) to GCS
 *
 * Usage:
 *   npm run release:gcs          — build .dmg locally + upload all files to GCS
 *   npm run release:gcs:upload   — upload only (skip build, just upload whatever is in gcs-releases/)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUCKET = 'gs://dineopen-releases';
const RELEASES_DIR = path.join(__dirname, '..', 'gcs-releases');
const DIST_DIR = path.join(__dirname, '..', 'dist-electron');

const skipBuild = process.argv.includes('--upload-only');

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', cwd: path.join(__dirname, '..'), ...opts });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(RELEASES_DIR);

// Step 1: Check if Windows exe files are already in gcs-releases/
const existingFiles = fs.existsSync(RELEASES_DIR)
  ? fs.readdirSync(RELEASES_DIR).filter(f => fs.statSync(path.join(RELEASES_DIR, f)).isFile())
  : [];

const hasExe = existingFiles.some(f => /\.exe$/.test(f));
const hasLatestYml = existingFiles.some(f => f === 'latest.yml');

if (hasExe && hasLatestYml) {
  console.log('=== Windows files found in gcs-releases/ ===');
  existingFiles.filter(f => /\.exe|latest\.yml|\.exe\.blockmap/.test(f))
    .forEach(f => console.log(`  ✓ ${f}`));
} else if (!skipBuild) {
  console.log('=== WARNING: No Windows .exe files in gcs-releases/ ===');
  console.log('  Download the exe artifact from GitHub Actions and put these files in gcs-releases/:');
  console.log('    - DineOpen-POS-{version}-setup.exe');
  console.log('    - DineOpen-POS-{version}-setup.exe.blockmap');
  console.log('    - latest.yml');
  console.log('');
  console.log('  Continuing with Mac build only...\n');
}

// Step 2: Build .dmg locally (unless --upload-only)
if (!skipBuild) {
  console.log('=== Building Mac .dmg locally ===');
  run('npm run electron:build');

  console.log('\n=== Copying Mac release files to gcs-releases/ ===');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('ERROR: dist-electron/ not found. Build may have failed.');
    process.exit(1);
  }

  const distFiles = fs.readdirSync(DIST_DIR);

  // Copy .dmg, .blockmap, and latest-mac.yml from dist-electron/ to gcs-releases/
  const macPatterns = [/\.dmg$/, /\.dmg\.blockmap$/, /\.zip$/, /\.zip\.blockmap$/, /^latest-mac\.yml$/];

  let copied = 0;
  for (const file of distFiles) {
    if (macPatterns.some(p => p.test(file))) {
      const src = path.join(DIST_DIR, file);
      const dest = path.join(RELEASES_DIR, file);
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
        console.log(`  Copied: ${file}`);
        copied++;
      }
    }
  }
  console.log(`  ${copied} Mac file(s) copied to gcs-releases/`);
}

// Step 3: Validate before upload
console.log('\n=== Validating gcs-releases/ ===');

const uploadFiles = fs.readdirSync(RELEASES_DIR).filter(f => {
  return fs.statSync(path.join(RELEASES_DIR, f)).isFile();
});

if (uploadFiles.length === 0) {
  console.error('ERROR: No files found in gcs-releases/ to upload.');
  process.exit(1);
}

const finalHasExe = uploadFiles.some(f => /\.exe$/.test(f));
const finalHasDmg = uploadFiles.some(f => /\.dmg$/.test(f));
const finalHasLatestYml = uploadFiles.some(f => f === 'latest.yml');
const finalHasLatestMacYml = uploadFiles.some(f => f === 'latest-mac.yml');

console.log(`  Windows .exe:       ${finalHasExe ? '✓' : '✗ MISSING'}`);
console.log(`  latest.yml:         ${finalHasLatestYml ? '✓' : '✗ MISSING (auto-update for Windows won\'t work)'}`);
console.log(`  Mac .dmg:           ${finalHasDmg ? '✓' : '✗ MISSING'}`);
console.log(`  latest-mac.yml:     ${finalHasLatestMacYml ? '✓' : '✗ MISSING (auto-update for Mac won\'t work)'}`);

console.log('\nFiles to upload:');
uploadFiles.forEach(f => console.log(`  - ${f}`));

// Step 4: Upload everything to GCS
console.log('\n=== Uploading to GCS ===');
run(`gsutil -m cp "${RELEASES_DIR}"/* ${BUCKET}/`);

console.log('\n=== Done! ===');
console.log(`Uploaded ${uploadFiles.length} file(s) to ${BUCKET}`);
console.log('\nPublic URLs:');
uploadFiles.forEach(f => {
  console.log(`  https://storage.googleapis.com/dineopen-releases/${encodeURIComponent(f)}`);
});

if (!finalHasExe || !finalHasDmg) {
  console.log('\n⚠️  Some platform files were missing. Auto-update will only work for platforms that were uploaded.');
}
