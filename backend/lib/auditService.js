const { store, save } = require('../db');
const { generateHash } = require('./hashUtils');
const { storeHashOnBlockchain } = require('./blockchainService');

/**
 * Create a hash-chained audit log entry for a complaint action.
 *
 * @param {string} complaintId
 * @param {string} actionType  - CREATE | UPDATE | RESOLVE | ESCALATE | DELETE
 * @param {string} performedBy - user id or name of actor
 * @param {string} role        - citizen | officer | supervisor | admin
 * @param {object} complaintData - full complaint object snapshot
 * @returns {object} the created audit entry
 */
function createAuditEntry(complaintId, actionType, performedBy, role, complaintData) {
    // Ensure auditLogs array exists
    if (!store.auditLogs) { store.auditLogs = []; }
    if (!store._auditSeq) { store._auditSeq = 1; }

    // Get previous hash for this complaint's chain
    const chainEntries = store.auditLogs
        .filter(e => e.complaint_id === complaintId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const previousHash = chainEntries.length > 0
        ? chainEntries[chainEntries.length - 1].hash
        : '0'; // genesis — no previous record

    const timestamp = new Date().toISOString();
    const dataSnapshot = JSON.stringify(complaintData);

    const hash = generateHash(complaintId, actionType, dataSnapshot, previousHash, timestamp);

    const entry = {
        id: `AUD-${store._auditSeq++}`,
        complaint_id: complaintId,
        action_type: actionType,
        performed_by: performedBy,
        role: role,
        data_snapshot: dataSnapshot,
        hash: hash,
        previous_hash: previousHash,
        timestamp: timestamp,
    };

    store.auditLogs.push(entry);
    save();

    // Fire-and-forget blockchain storage (optional, never blocks)
    storeHashOnBlockchain(hash, {
        complaintId,
        actionType,
        timestamp,
    }).catch(() => { /* swallow — blockchain is optional */ });

    return entry;
}

/**
 * Get all audit entries for a complaint, sorted chronologically.
 */
function getAuditTrail(complaintId) {
    if (!store.auditLogs) return [];
    return store.auditLogs
        .filter(e => e.complaint_id === complaintId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

module.exports = { createAuditEntry, getAuditTrail };
