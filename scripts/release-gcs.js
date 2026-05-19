#!/usr/bin/env node

/**
 * Release to GCS script
 *
 * What it does:
 * 1. Builds the Electron app locally (.dmg on Mac, .exe on Windows)
 * 2. Copies all release files (installer + yml + blockmap) to gcs-releases/ folder
 * 3. Uploads everything in gcs-releases/ to the GCS bucket (dineopen-releases)
 *
 * Usage:
 *   npm run release:gcs          — build + upload
 *   npm run release:gcs:upload   — upload only (skip build, just upload whatever is in gcs-releases/)
 *
 * For Windows .exe:
 *   Build on a Windows machine, then manually copy the .exe, latest.yml, and .blockmap
 *   into the gcs-releases/ folder. Then run `npm run release:gcs:upload` to upload everything.
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

// Step 1: Build (unless --upload-only)
if (!skipBuild) {
  console.log('=== Building Electron app ===');
  run('npm run electron:build');
}

// Step 2: Copy release files from dist-electron/ to gcs-releases/
if (!skipBuild) {
  console.log('\n=== Copying release files to gcs-releases/ ===');
  ensureDir(RELEASES_DIR);

  if (!fs.existsSync(DIST_DIR)) {
    console.error('ERROR: dist-electron/ not found. Build may have failed.');
    process.exit(1);
  }

  const files = fs.readdirSync(DIST_DIR);

  // Files we care about: .dmg, .exe, .blockmap, latest.yml, latest-mac.yml, latest-linux.yml
  const releasePatterns = [/\.dmg$/, /\.exe$/, /\.blockmap$/, /^latest.*\.yml$/];

  let copied = 0;
  for (const file of files) {
    if (releasePatterns.some(p => p.test(file))) {
      const src = path.join(DIST_DIR, file);
      const dest = path.join(RELEASES_DIR, file);
      // Only copy files, not directories
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
        console.log(`  Copied: ${file}`);
        copied++;
      }
    }
  }
  console.log(`  ${copied} file(s) copied to gcs-releases/`);
}

// Step 3: Upload everything in gcs-releases/ to GCS
console.log('\n=== Uploading to GCS ===');

const uploadFiles = fs.readdirSync(RELEASES_DIR).filter(f => {
  return fs.statSync(path.join(RELEASES_DIR, f)).isFile();
});

if (uploadFiles.length === 0) {
  console.error('ERROR: No files found in gcs-releases/ to upload.');
  process.exit(1);
}

console.log('Files to upload:');
uploadFiles.forEach(f => console.log(`  - ${f}`));

// Upload all files
run(`gsutil -m cp "${RELEASES_DIR}"/* ${BUCKET}/`);

console.log('\n=== Done! ===');
console.log(`Uploaded ${uploadFiles.length} file(s) to ${BUCKET}`);
console.log('\nPublic URLs:');
uploadFiles.forEach(f => {
  console.log(`  https://storage.googleapis.com/dineopen-releases/${encodeURIComponent(f)}`);
});
