/**
 * Optional Blockchain Service — Stub
 *
 * This service provides a hook for storing audit hashes on a blockchain.
 * Currently a no-op stub. Replace the implementation when a blockchain
 * backend (e.g. Hyperledger, Ethereum, Polygon) is available.
 *
 * The system works fully without blockchain; this is purely additive.
 */

const BLOCKCHAIN_ENABLED = false;

/**
 * Store an audit hash on the blockchain.
 * @param {string} hash - SHA-256 hash to store
 * @param {object} metadata - optional metadata (complaintId, actionType, timestamp)
 * @returns {Promise<{ success: boolean, txId?: string }>}
 */
async function storeHashOnBlockchain(hash, metadata = {}) {
    if (!BLOCKCHAIN_ENABLED) {
        // Blockchain not configured — silently succeed
        return { success: true, txId: null, message: 'Blockchain not configured — skipped' };
    }

    try {
        // ─── Replace this block with actual blockchain SDK calls ───
        // Example (Ethereum):
        //   const tx = await contract.methods.storeHash(hash).send({ from: account });
        //   return { success: true, txId: tx.transactionHash };
        //
        // Example (Hyperledger Fabric):
        //   const result = await contract.submitTransaction('storeHash', hash, JSON.stringify(metadata));
        //   return { success: true, txId: result.toString() };

        console.log(`[Blockchain] Would store hash: ${hash.substring(0, 16)}...`);
        return { success: true, txId: `stub-${Date.now()}` };
    } catch (err) {
        console.error('[Blockchain] Failed to store hash:', err.message);
        return { success: false, error: err.message };
    }
}

module.exports = { storeHashOnBlockchain, BLOCKCHAIN_ENABLED };
