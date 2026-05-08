const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getLocalDb } = require('./localDb');

let imageDir = null;

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

function initImageStore(userDataPath) {
  imageDir = path.join(userDataPath, 'dineopen-images');

  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  const subdirs = ['menu', 'restaurant', 'inventory', 'general'];
  for (const sub of subdirs) {
    const subPath = path.join(imageDir, sub);
    if (!fs.existsSync(subPath)) {
      fs.mkdirSync(subPath, { recursive: true });
    }
  }

  console.log('[ImageStore] Initialized at', imageDir);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getExtension(filename, mimeType) {
  if (filename) {
    const ext = path.extname(filename);
    if (ext) return ext;
  }
  const mimeMap = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
  };
  return mimeMap[mimeType] || '.jpg';
}

function extractBoundary(contentType) {
  if (!contentType) return null;
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^\s;]+))/);
  return match ? (match[1] || match[2]) : null;
}

function parseMultipart(buffer, boundary) {
  const parts = [];
  const str = buffer.toString('binary');
  const segments = str.split(`--${boundary}`);

  for (const segment of segments) {
    if (segment === '--\r\n' || segment === '--' || segment.trim() === '') continue;

    const headerEnd = segment.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;

    const headerStr = segment.slice(0, headerEnd);
    const body = segment.slice(headerEnd + 4);
    const cleanBody = body.endsWith('\r\n') ? body.slice(0, -2) : body;

    const headers = {};
    for (const line of headerStr.split('\r\n')) {
      if (!line.trim()) continue;
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        headers[line.slice(0, colonIdx).trim().toLowerCase()] = line.slice(colonIdx + 1).trim();
      }
    }

    const disposition = headers['content-disposition'] || '';
    const nameMatch = disposition.match(/name="([^"]+)"/);
    const filenameMatch = disposition.match(/filename="([^"]+)"/);

    parts.push({
      name: nameMatch ? nameMatch[1] : null,
      filename: filenameMatch ? filenameMatch[1] : null,
      contentType: headers['content-type'] || null,
      data: Buffer.from(cleanBody, 'binary'),
    });
  }

  return parts;
}

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

function saveImageLocally(imageBuffer, options = {}) {
  const {
    entityType = 'general',
    entityId = null,
    fieldName = 'image',
    originalName = 'image.jpg',
    mimeType = 'image/jpeg',
  } = options;

  const ext = getExtension(originalName, mimeType);
  const id = crypto.randomUUID();
  const filename = `${id}${ext}`;
  const subdir = ['menu', 'restaurant', 'inventory'].includes(entityType) ? entityType : 'general';
  const localPath = path.join(imageDir, subdir, filename);

  fs.writeFileSync(localPath, imageBuffer);

  const db = getLocalDb();
  db.prepare(
    `INSERT INTO image_queue (id, local_path, entity_type, entity_id, field_name, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`
  ).run(id, localPath, entityType, entityId, fieldName, Date.now());

  const localUrl = `local://images/${subdir}/${filename}`;

  console.log(`[ImageStore] Saved: ${localUrl} (${imageBuffer.length} bytes)`);

  return {
    id,
    localPath,
    localUrl,
    filename,
    size: imageBuffer.length,
    mimeType,
  };
}

function saveFormDataImage(bodyBuffer, contentType, options = {}) {
  const boundary = extractBoundary(contentType);
  if (!boundary) {
    throw new Error('No boundary found in Content-Type');
  }

  const parts = parseMultipart(bodyBuffer, boundary);
  const results = [];

  for (const part of parts) {
    if (part.filename) {
      const result = saveImageLocally(part.data, {
        entityType: options.entityType || 'general',
        entityId: options.entityId || null,
        fieldName: part.name || 'image',
        originalName: part.filename,
        mimeType: part.contentType || 'image/jpeg',
      });
      results.push(result);
    }
  }

  return results;
}

function resolveImagePath(localUrl) {
  if (!localUrl || !localUrl.startsWith('local://images/')) return null;
  const relativePath = localUrl.replace('local://images/', '');
  return path.join(imageDir, relativePath);
}

function getImageUrl(urlOrLocal) {
  if (!urlOrLocal) return null;
  if (urlOrLocal.startsWith('local://')) {
    const fsPath = resolveImagePath(urlOrLocal);
    if (fsPath && fs.existsSync(fsPath)) {
      return `file://${fsPath}`;
    }
    return null;
  }
  return urlOrLocal;
}

function getPendingImageUploads() {
  const db = getLocalDb();
  return db.prepare("SELECT * FROM image_queue WHERE status = 'pending' ORDER BY created_at ASC").all();
}

function markImageUploaded(id, cloudUrl) {
  const db = getLocalDb();
  db.prepare("UPDATE image_queue SET status = 'uploaded', cloud_url = ? WHERE id = ?").run(cloudUrl, id);
}

function cleanupOrphanedImages() {
  const db = getLocalDb();
  const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const uploaded = db.prepare(
    "SELECT id, local_path FROM image_queue WHERE status = 'uploaded' AND created_at < ?"
  ).all(cutoff);

  for (const img of uploaded) {
    try {
      if (fs.existsSync(img.local_path)) {
        fs.unlinkSync(img.local_path);
      }
      db.prepare('DELETE FROM image_queue WHERE id = ?').run(img.id);
    } catch (e) {
      console.error('[ImageStore] Cleanup error:', e.message);
    }
  }

  if (uploaded.length > 0) {
    console.log(`[ImageStore] Cleaned up ${uploaded.length} orphaned images`);
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  initImageStore,
  saveImageLocally,
  saveFormDataImage,
  resolveImagePath,
  getImageUrl,
  getPendingImageUploads,
  markImageUploaded,
  cleanupOrphanedImages,
};
