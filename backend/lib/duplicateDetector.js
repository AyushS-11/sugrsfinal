/**
 * SUGRS — Duplicate Complaint Detector (v2)
 *
 * Changes from v1:
 * - Category no longer a hard gate — used as a bonus (+0.15)
 * - Threshold lowered to 0.25 for short/paraphrased descriptions
 * - Title-only similarity counted separately (high weight)
 * - Address bonus preserved
 * - expose simulateSimilarity() for admin tools
 */

const SIMILARITY_THRESHOLD = 0.25; // 25% combined score triggers duplicate
const MIN_WORD_LEN = 3;            // shorter words accepted for city names etc.

function tokenize(text) {
    if (!text) return new Set();
    return new Set(
        text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length >= MIN_WORD_LEN)
    );
}

function jaccardSimilarity(setA, setB) {
    if (setA.size === 0 && setB.size === 0) return 0;
    const intersection = [...setA].filter(w => setB.has(w)).length;
    const union = new Set([...setA, ...setB]).size;
    return union > 0 ? intersection / union : 0;
}

function addressOverlap(addrA, addrB) {
    if (!addrA || !addrB) return false;
    const a = addrA.toLowerCase().trim();
    const b = addrB.toLowerCase().trim();
    if (a.includes(b) || b.includes(a)) return true;
    const wordsA = a.split(/[\s,]+/).filter(w => w.length >= 3);
    return wordsA.some(w => b.includes(w));
}

/**
 * Compute similarity score between two complaints.
 * Exposed publicly for admin simulation and testing.
 */
function computeSimilarity(a, b) {
    const aFull = tokenize((a.title || '') + ' ' + (a.description || ''));
    const bFull = tokenize((b.title || '') + ' ' + (b.description || ''));
    const aTitle = tokenize(a.title || '');
    const bTitle = tokenize(b.title || '');

    const fullSim = jaccardSimilarity(aFull, bFull);       // full text
    const titleSim = jaccardSimilarity(aTitle, bTitle);     // title only (high signal)
    const locBonus = addressOverlap(a.address, b.address) ? 0.15 : 0;
    const catBonus = (a.category === b.category) ? 0.10 : 0; // bonus, not gate

    // Weighted: title contributes more (0.5 weight) than full-text (0.4)
    const combined = (titleSim * 0.5) + (fullSim * 0.4) + locBonus + catBonus;

    return {
        fullSim: Math.round(fullSim * 100),
        titleSim: Math.round(titleSim * 100),
        locBonus: locBonus > 0,
        catBonus: catBonus > 0,
        combined: Math.round(combined * 100),
        isDuplicate: combined >= SIMILARITY_THRESHOLD,
    };
}

/**
 * Scan all open complaints to find the best duplicate match for a new complaint.
 *
 * @param {Object} newComplaint  - The complaint being submitted
 * @param {Array}  existing      - All existing complaints from store
 * @returns {{ isDuplicate, parentId, similarityScore }}
 */
function detectDuplicate(newComplaint, existing) {
    let bestScore = 0;
    let bestParentId = null;

    for (const c of existing) {
        if (c.is_deleted || c.status === 'RESOLVED' || c.id === newComplaint.id) continue;

        const { combined } = computeSimilarity(newComplaint, c);
        const score = combined / 100;

        if (score > bestScore) {
            bestScore = score;
            // Chain duplicates back to the root parent
            bestParentId = c.isDuplicate ? (c.parentComplaintId || c.id) : c.id;
        }
    }

    return {
        isDuplicate: bestScore >= SIMILARITY_THRESHOLD,
        parentId: bestScore >= SIMILARITY_THRESHOLD ? bestParentId : null,
        similarityScore: Math.round(bestScore * 100),
    };
}

module.exports = { detectDuplicate, computeSimilarity, SIMILARITY_THRESHOLD };
