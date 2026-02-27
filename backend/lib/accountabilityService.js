/**
 * SUGRS — Public Accountability Service
 * Computes per-department performance metrics and accountability scores.
 *
 * Score Formula (0–100):
 *   40% × SLA Compliance Rate
 *   30% × Resolution Rate
 *   30% × Citizen Rating (normalized 0–5 → 0–100)
 */

const { store } = require('../db');

const SLA_HOURS = 72; // Standard SLA = 72 hours

function daysBetween(dateA, dateB) {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return Math.max(0, (b - a) / (1000 * 60 * 60)); // returns hours
}

function computeAccountability() {
    const complaints = (store.complaints || []).filter(c => !c.is_deleted);

    // Group by department
    const deptMap = {};

    for (const c of complaints) {
        const dept = c.department || c.category || 'General';
        if (!deptMap[dept]) {
            deptMap[dept] = {
                department: dept,
                total: 0,
                resolved: 0,
                slaCompliant: 0,
                ratingSum: 0,
                ratingCount: 0,
                totalResolutionHours: 0,
            };
        }

        const d = deptMap[dept];
        d.total++;

        if (c.status === 'RESOLVED') {
            d.resolved++;

            // SLA compliance: resolved within SLA_HOURS
            const hours = daysBetween(c.createdAt, c.updatedAt);
            if (hours > 0 && hours <= SLA_HOURS) d.slaCompliant++;
            d.totalResolutionHours += hours;
        }

        if (c.rating != null && !isNaN(Number(c.rating))) {
            d.ratingSum += Number(c.rating);
            d.ratingCount++;
        }
    }

    // Build final array
    const results = Object.values(deptMap).map(d => {
        const resolutionRate = d.total > 0 ? d.resolved / d.total : 0;
        const slaCompliance = d.resolved > 0 ? (d.slaCompliant / d.resolved) * 100 : 0;
        const avgRating = d.ratingCount > 0 ? d.ratingSum / d.ratingCount : 0;
        const avgRatingNorm = (avgRating / 5) * 100; // 0–5 → 0–100
        const avgResolutionHrs = d.resolved > 0 ? d.totalResolutionHours / d.resolved : 0;

        const score = Math.round(
            0.4 * slaCompliance +
            0.3 * (resolutionRate * 100) +
            0.3 * avgRatingNorm
        );

        return {
            department: d.department,
            total: d.total,
            resolved: d.resolved,
            pending: d.total - d.resolved,
            slaCompliance: Math.round(slaCompliance),
            resolutionRate: Math.round(resolutionRate * 100),
            avgRating: avgRating > 0 ? Math.round(avgRating * 10) / 10 : null,
            avgResolutionHrs: Math.round(avgResolutionHrs),
            score: Math.min(100, Math.max(0, score)),
        };
    });

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
}

module.exports = { computeAccountability };
