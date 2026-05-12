const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'src', 'app');
const ORIGINAL_CONFIG = path.join(ROOT, 'next.config.mjs');
const TAURI_CONFIG = path.join(ROOT, 'next.config.tauri.mjs');
const BACKUP_CONFIG = path.join(ROOT, 'next.config.mjs.backup');
const TEMP_DIR = path.join(ROOT, '.tauri-temp');

const KEEP_ROUTES = new Set(['(dashboard)', 'login', 'local-login']);
const ROOT_FILES = new Set(['layout.js', 'globals.css', 'not-found.js', 'favicon.ico', 'page.js', 'HomePageClient.js', 'page-metadata.js']);

// Tauri redirect page — replaces the website homepage so Tauri opens /loginds
const TAURI_HOME_PAGE = `'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function TauriHome() {
  const router = useRouter();
  useEffect(() => { router.replace('/login'); }, [router]);
  return (<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0f172a',color:'white',fontSize:18}}>Loading DineOpen POS...</div>);
}
`;

function log(msg) {
  console.log(`[build-tauri] ${msg}`);
}

function findDynamicRoutes(dir) {
  const results = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const fullPath = path.join(dir, entry.name);
        if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
          results.push(fullPath);
        } else {
          results.push(...findDynamicRoutes(fullPath));
        }
      }
    }
  } catch (e) {}
  return results;
}

function run() {
  // Track everything we move: [{src, dest}]
  const moved = [];
  let configBackedUp = false;
  let buildSuccess = false;

  try {
    fs.mkdirSync(TEMP_DIR, { recursive: true });

    // 1. Backup next.config.mjs
    log('Backing up next.config.mjs...');
    fs.copyFileSync(ORIGINAL_CONFIG, BACKUP_CONFIG);
    configBackedUp = true;
    fs.copyFileSync(TAURI_CONFIG, ORIGINAL_CONFIG);

    // 2. Move middleware
    const mwSrc = path.join(ROOT, 'src', 'middleware.js');
    if (fs.existsSync(mwSrc)) {
      const mwDest = path.join(TEMP_DIR, 'middleware.js');
      log('Moving middleware.js...');
      fs.renameSync(mwSrc, mwDest);
      moved.push({ src: mwSrc, dest: mwDest });
    }

    // 3. Move non-POS directories
    for (const entry of fs.readdirSync(APP_DIR, { withFileTypes: true })) {
      if (entry.isDirectory() && !KEEP_ROUTES.has(entry.name)) {
        const src = path.join(APP_DIR, entry.name);
        const dest = path.join(TEMP_DIR, 'pages', entry.name);
        fs.mkdirSync(path.join(TEMP_DIR, 'pages'), { recursive: true });
        fs.renameSync(src, dest);
        moved.push({ src, dest });
      }
    }
    log('Excluded non-POS directories');

    // 4. Move non-POS root files
    for (const entry of fs.readdirSync(APP_DIR, { withFileTypes: true })) {
      if (entry.isFile() && !ROOT_FILES.has(entry.name)) {
        const src = path.join(APP_DIR, entry.name);
        const dest = path.join(TEMP_DIR, 'files', entry.name);
        fs.mkdirSync(path.join(TEMP_DIR, 'files'), { recursive: true });
        fs.renameSync(src, dest);
        moved.push({ src, dest });
      }
    }

    // 5. Move dynamic [param] routes
    const dynamicRoutes = findDynamicRoutes(path.join(APP_DIR, '(dashboard)'));
    for (const routePath of dynamicRoutes) {
      const rel = path.relative(path.join(APP_DIR, '(dashboard)'), routePath);
      const dest = path.join(TEMP_DIR, 'dynamic', rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.renameSync(routePath, dest);
      moved.push({ src: routePath, dest });
      log(`Excluded dynamic: (dashboard)/${rel}`);
    }

    // 6. Swap root page.js with Tauri redirect (opens /login instead of homepage)
    const rootPageSrc = path.join(APP_DIR, 'page.js');
    const rootPageBackup = path.join(TEMP_DIR, 'page.js.original');
    const homeClientSrc = path.join(APP_DIR, 'HomePageClient.js');
    const homeClientBackup = path.join(TEMP_DIR, 'HomePageClient.js.original');
    if (fs.existsSync(rootPageSrc)) {
      log('Swapping root page.js with Tauri redirect...');
      fs.copyFileSync(rootPageSrc, rootPageBackup);
      fs.writeFileSync(rootPageSrc, TAURI_HOME_PAGE);
      moved.push({ src: rootPageSrc, dest: rootPageBackup, isSwap: true });
    }
    if (fs.existsSync(homeClientSrc)) {
      fs.copyFileSync(homeClientSrc, homeClientBackup);
      fs.writeFileSync(homeClientSrc, '// Excluded for Tauri build\nexport default function HomePageClient() { return null; }\n');
      moved.push({ src: homeClientSrc, dest: homeClientBackup, isSwap: true });
    }

    // 7. Build
    log('Running next build (static export)...');
    execSync('npx next build', {
      cwd: ROOT,
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://dine-backend-lake.vercel.app',
      },
    });

    // 8. Fix missing HTML files — Next.js 15 app router with 'use client' pages
    //    generates server HTML in .next/server/app/ but doesn't always copy them
    //    to /out during static export. Copy any missing HTML files.
    const serverAppDir = path.join(ROOT, '.next', 'server', 'app');
    const outDir = path.join(ROOT, 'out');
    if (fs.existsSync(serverAppDir) && fs.existsSync(outDir)) {
      let copied = 0;
      const serverHtmlFiles = fs.readdirSync(serverAppDir).filter(f => f.endsWith('.html') && !f.startsWith('_'));
      for (const htmlFile of serverHtmlFiles) {
        const pageName = htmlFile.replace('.html', '');
        const outHtml = path.join(outDir, htmlFile);
        const outDirIndex = path.join(outDir, pageName, 'index.html');
        // Copy as both flat file and directory/index.html for compatibility
        if (!fs.existsSync(outHtml) && !fs.existsSync(outDirIndex)) {
          const src = path.join(serverAppDir, htmlFile);
          if (pageName === 'index') {
            fs.copyFileSync(src, path.join(outDir, 'index.html'));
          } else {
            fs.mkdirSync(path.join(outDir, pageName), { recursive: true });
            fs.copyFileSync(src, outDirIndex);
            fs.copyFileSync(src, outHtml);
          }
          copied++;
        }
      }
      // Also handle subdirectory pages (e.g., invoice/dashboard)
      const walkServerApp = (dir, rel = '') => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          if (entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('(')) {
            walkServerApp(path.join(dir, entry.name), path.join(rel, entry.name));
          } else if (entry.isFile() && entry.name.endsWith('.html') && !entry.name.startsWith('_')) {
            const pageName = entry.name.replace('.html', '');
            const outPath = rel ? path.join(outDir, rel, entry.name) : path.join(outDir, entry.name);
            if (!fs.existsSync(outPath)) {
              fs.mkdirSync(path.dirname(outPath), { recursive: true });
              fs.copyFileSync(path.join(dir, entry.name), outPath);
              copied++;
            }
          }
        }
      };
      walkServerApp(serverAppDir);
      if (copied > 0) log(`Copied ${copied} missing HTML files from .next/server/app/ to /out`);
    }

    buildSuccess = true;
    log('Static export complete! Output in /out directory.');
  } catch (error) {
    console.error('[build-tauri] Build failed:', error.message);
  }

  // RESTORE everything
  log(`Restoring ${moved.length} moved items...`);
  for (let i = moved.length - 1; i >= 0; i--) {
    const { src, dest, isSwap } = moved[i];
    try {
      fs.mkdirSync(path.dirname(src), { recursive: true });
      if (isSwap) {
        // For swapped files, copy backup back over the modified file
        fs.copyFileSync(dest, src);
        fs.unlinkSync(dest);
      } else {
        fs.renameSync(dest, src);
      }
    } catch (e) {
      console.error(`[build-tauri] FAILED to restore: ${src}: ${e.message}`);
    }
  }

  // Restore next.config.mjs
  if (configBackedUp && fs.existsSync(BACKUP_CONFIG)) {
    log('Restoring next.config.mjs...');
    fs.copyFileSync(BACKUP_CONFIG, ORIGINAL_CONFIG);
    fs.unlinkSync(BACKUP_CONFIG);
  }

  // Clean temp dir
  try { fs.rmSync(TEMP_DIR, { recursive: true, force: true }); } catch (e) {}

  // Verify restore
  const mwExists = fs.existsSync(path.join(ROOT, 'src', 'middleware.js'));
  const vsExists = fs.existsSync(path.join(APP_DIR, 'vs'));
  const configOk = fs.readFileSync(ORIGINAL_CONFIG, 'utf8').includes('Service Worker');
  log(`Verify: middleware=${mwExists}, vs=${vsExists}, config=${configOk}`);

  if (!mwExists || !vsExists || !configOk) {
    console.error('[build-tauri] WARNING: Some files may not have been restored! Run: git checkout -- src/app/ src/middleware.js next.config.mjs');
  }

  log('Done.');
  if (!buildSuccess) process.exit(1);
}

run();
