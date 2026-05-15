const path = require('path');
const fs = require('fs');

const VERSIONS_DIR = path.join(__dirname, '../data/versions');

function ensureDir() {
  if (!fs.existsSync(VERSIONS_DIR)) {
    fs.mkdirSync(VERSIONS_DIR, { recursive: true });
  }
}

function saveVersion(postId, content, metadata = {}) {
  ensureDir();
  const version = {
    postId,
    content,
    metadata,
    version: Date.now(),
    savedAt: new Date().toISOString(),
  };
  const filename = `${postId}_${version.version}.json`;
  fs.writeFileSync(path.join(VERSIONS_DIR, filename), JSON.stringify(version, null, 2));
  return version;
}

function listVersions(postId) {
  ensureDir();
  const files = fs.readdirSync(VERSIONS_DIR)
    .filter(f => f.startsWith(postId))
    .sort()
    .reverse();

  return files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(VERSIONS_DIR, f), 'utf-8'));
    return {
      version: data.version,
      savedAt: data.savedAt,
      preview: (data.content || '').slice(0, 200),
      metadata: data.metadata,
    };
  });
}

function rollback(postId, targetVersion) {
  const versions = listVersions(postId);
  const target = versions.find(v => v.version === targetVersion);
  if (!target) return null;

  const filepath = path.join(VERSIONS_DIR, `${postId}_${targetVersion}.json`);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  return data.content;
}

function getLatestVersion(postId) {
  const versions = listVersions(postId);
  return versions.length > 0 ? versions[0] : null;
}

function cleanupOldVersions(postId, keepCount = 10) {
  const versions = listVersions(postId);
  if (versions.length <= keepCount) return;

  const toDelete = versions.slice(keepCount);
  for (const v of toDelete) {
    const filepath = path.join(VERSIONS_DIR, `${postId}_${v.version}.json`);
    try { fs.unlinkSync(filepath); } catch {}
  }
}

module.exports = { saveVersion, listVersions, rollback, getLatestVersion, cleanupOldVersions };
