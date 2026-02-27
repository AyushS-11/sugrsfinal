/**
 * SUGRS — Critical Issue Auto-Flagging
 *
 * Scans complaint title + description for emergency-level keywords.
 * If a match is found, auto-escalates to priority=CRITICAL with a 6-hour SLA.
 */

const CRITICAL_KEYWORDS = [
    'fire', 'burning', 'explosion', 'explode',
    'accident', 'collision', 'crash',
    'gas leak', 'gas pipe', 'lpg leak',
    'electric shock', 'electrocution', 'exposed wire', 'live wire',
    'burst pipe', 'water burst', 'main burst',
    'flooding', 'flood', 'submerged', 'inundated',
    'collapse', 'collapsed', 'building collapse', 'wall collapse',
    'death', 'died', 'fatality', 'casualty',
    'sewage overflow', 'sewage burst',
    'toxic', 'chemical spill',
];

const SLA_HOURS = 6; // Critical SLA = 6 hours

/**
 * Analyse complaint text for critical emergency signals.
 *
 * @param {string} title       - Complaint title
 * @param {string} description - Complaint description
 * @returns {{ isCritical: boolean, matchedKeyword: string|null, priority: string, slaDeadline: string|null, requiresImmediateAttention: boolean }}
 */
function detectCritical(title = '', description = '') {
    const text = (title + ' ' + description).toLowerCase();

    for (const keyword of CRITICAL_KEYWORDS) {
        if (text.includes(keyword)) {
            const slaDeadline = new Date(Date.now() + SLA_HOURS * 60 * 60 * 1000).toISOString();
            return {
                isCritical: true,
                matchedKeyword: keyword,
                priority: 'CRITICAL',
                slaDeadline,
                requiresImmediateAttention: true,
            };
        }
    }

    return {
        isCritical: false,
        matchedKeyword: null,
        priority: null,
        slaDeadline: null,
        requiresImmediateAttention: false,
    };
}

module.exports = { detectCritical, CRITICAL_KEYWORDS };
