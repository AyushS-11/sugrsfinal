const crypto = require('crypto');

/**
 * Generate a SHA-256 hash for an audit log entry.
 * hash = SHA256(complaint_id + action_type + data_snapshot + previous_hash + timestamp)
 */
function generateHash(complaintId, actionType, dataSnapshot, previousHash, timestamp) {
    const payload = String(complaintId) + String(actionType) + String(dataSnapshot) + String(previousHash) + String(timestamp);
    return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}

/**
 * Verify the integrity of the entire audit chain for a given complaint.
 * Re-computes every hash and checks it matches the stored hash.
 *
 * @param {string} complaintId
 * @param {Array} auditLogs - full auditLogs array from the store
 * @returns {{ valid: boolean, totalRecords: number, brokenAt?: number }}
 */
function verifyComplaintIntegrity(complaintId, auditLogs) {
    const entries = auditLogs
        .filter(e => e.complaint_id === complaintId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (entries.length === 0) {
        return { valid: true, totalRecords: 0 };
    }

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        // Verify previous_hash linkage
        const expectedPrev = i === 0 ? '0' : entries[i - 1].hash;
        if (entry.previous_hash !== expectedPrev) {
            return { valid: false, totalRecords: entries.length, brokenAt: i, reason: 'previous_hash mismatch' };
        }

        // Recompute hash and compare
        const recomputed = generateHash(
            entry.complaint_id,
            entry.action_type,
            entry.data_snapshot,
            entry.previous_hash,
            entry.timestamp
        );

        if (recomputed !== entry.hash) {
            return { valid: false, totalRecords: entries.length, brokenAt: i, reason: 'hash mismatch' };
        }
    }

    return { valid: true, totalRecords: entries.length };
}

module.exports = { generateHash, verifyComplaintIntegrity };
