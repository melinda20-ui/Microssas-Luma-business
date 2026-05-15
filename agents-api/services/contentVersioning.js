const { db } = require('../config/db');

function saveVersion(postId, content, metadata = {}) {
    const maxVer = db.prepare("SELECT COALESCE(MAX(version), 0) as mv FROM content_versions WHERE post_id = ?").get(postId);
    const version = maxVer.mv + 1;
    db.prepare(
        "INSERT INTO content_versions (post_id, content, metadata, version) VALUES (?, ?, ?, ?)"
    ).run(postId, content, JSON.stringify(metadata), version);
    return { postId, content, metadata, version, savedAt: new Date().toISOString() };
}

function listVersions(postId) {
    return db.prepare(
        "SELECT version, saved_at as savedAt, metadata, substr(content, 1, 200) as preview FROM content_versions WHERE post_id = ? ORDER BY version DESC"
    ).all(postId).map(r => ({
        ...r,
        metadata: JSON.parse(r.metadata || '{}'),
    }));
}

function rollback(postId, targetVersion) {
    const row = db.prepare("SELECT content FROM content_versions WHERE post_id = ? AND version = ?").get(postId, targetVersion);
    return row ? row.content : null;
}

function getLatestVersion(postId) {
    const row = db.prepare(
        "SELECT version, saved_at as savedAt, metadata, substr(content, 1, 200) as preview FROM content_versions WHERE post_id = ? ORDER BY version DESC LIMIT 1"
    ).get(postId);
    if (!row) return null;
    return { ...row, metadata: JSON.parse(row.metadata || '{}') };
}

function cleanupOldVersions(postId, keepCount = 10) {
    db.prepare(`
        DELETE FROM content_versions WHERE post_id = ? AND version NOT IN (
            SELECT version FROM content_versions WHERE post_id = ? ORDER BY version DESC LIMIT ?
        )
    `).run(postId, postId, keepCount);
}

module.exports = { saveVersion, listVersions, rollback, getLatestVersion, cleanupOldVersions };