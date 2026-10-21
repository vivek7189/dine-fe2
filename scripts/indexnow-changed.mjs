// After a deploy, tell Bing (and other IndexNow engines) which public pages changed in this push,
// so ChatGPT search / Copilot (which use Bing's index) pick up edits within days, not weeks.
// Usage: node scripts/indexnow-changed.mjs <beforeSha> <afterSha>. Never fails the job.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const HOST = 'www.dineopen.com';
const KEY = '69f6484d2a03432540418f29fb84633c';
const [before, after] = process.argv.slice(2);

const toUrl = (f) => {
  let m;
  if ((m = f.match(/^public\/hi\/blog\/(.+)\.html$/))) return `/hi/blog/${m[1]}`;
  if ((m = f.match(/^public\/(.+\.(html|txt))$/)) && !/^public\/(gcs-releases|android)\//.test(f)) return `/${m[1]}`;
  if ((m = f.match(/^src\/app\/(.+)\/[^/]+\.js$/))) {
    const route = m[1];
    if (/(^|\/)(\[|_|\(|api\/)/.test(route) || route.includes('/[')) return null; // dynamic, private or API
    return existsSync(`src/app/${route}/page.js`) ? `/${route}` : null; // only real pages
  }
  if (f === 'src/app/page.js') return '/';
  return null;
};

try {
  const range = before && !/^0+$/.test(before) ? `${before} ${after}` : `${after}~1 ${after}`;
  const files = execSync(`git diff --name-only --diff-filter=AM ${range}`, { encoding: 'utf8' }).split('\n').filter(Boolean);
  const urls = [...new Set(files.map(toUrl).filter(Boolean))].map((p) => `https://${HOST}${p}`).slice(0, 500);
  if (!urls.length) { console.log('IndexNow: no public pages changed'); process.exit(0); }
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
  });
  console.log(`IndexNow: ${res.status} for ${urls.length} URL(s)\n${urls.join('\n')}`);
} catch (e) {
  console.log('IndexNow skipped:', e.message);
}
