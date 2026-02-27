/**
 * SUGRS Civic Notification Intelligence Engine
 * Operating in Anti-Gravity Mode
 *
 * Determines when, how, and what to send for complaint status notifications.
 * Enforces: channel selection, anti-spam, message formatting, logging.
 * SMS Provider: Fast2SMS (India) — https://www.fast2sms.com
 */

const { store, save } = require('../db');
const axios = require('axios');

// ─── SMS Provider: Fast2SMS ───────────────────────────────────────────────────
const FAST2SMS_KEY = process.env.FAST2SMS_API_KEY;
const SMS_ENABLED = !!FAST2SMS_KEY;

if (SMS_ENABLED) {
    console.log('📱 Fast2SMS: Configured ✅');
} else {
    console.log('📱 Fast2SMS: No API key — running in SIMULATION mode');
}

/**
 * Actually dispatch an SMS via Fast2SMS.
 * Falls back to simulation (console log) if key is missing.
 *
 * @param {string} phone   - 10-digit Indian mobile number (no +91)
 * @param {string} message - SMS text (≤160 chars enforced by engine)
 * @returns {Object}       - { sent: bool, mode: 'real'|'simulated', response? }
 */
async function sendSMS(phone, message) {
    // ── Simulation mode: no API key ────────────────────────────────────────────
    if (!SMS_ENABLED) {
        console.log(`📱 [SMS SIMULATED] → ${phone || 'No phone'}: ${message}`);
        return { sent: true, mode: 'simulated' };
    }

    // ── No phone number on record ──────────────────────────────────────────────
    if (!phone || phone.length < 10) {
        console.log(`📱 [SMS SKIPPED] No valid phone number provided`);
        return { sent: false, mode: 'skipped', reason: 'no_phone' };
    }

    // ── Real dispatch via Fast2SMS ─────────────────────────────────────────────
    try {
        const cleanPhone = String(phone).replace(/\D/g, '').slice(-10); // sanitize to 10 digits
        const response = await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            {
                route: 'q',               // Quick transactional route
                message: message,
                language: 'english',
                flash: 0,
                numbers: cleanPhone,
            },
            {
                headers: {
                    authorization: FAST2SMS_KEY,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                },
                timeout: 8000,
            }
        );

        const success = response.data?.return === true;
        if (success) {
            console.log(`📱 [SMS SENT ✅] → ${cleanPhone} | RequestID: ${response.data?.request_id}`);
        } else {
            console.warn(`📱 [SMS FAILED] → ${cleanPhone} | Response:`, response.data);
        }

        return {
            sent: success,
            mode: 'real',
            requestId: response.data?.request_id,
            response: response.data,
        };
    } catch (err) {
        console.error(`📱 [SMS ERROR] → ${phone}: ${err.message}`);
        return { sent: false, mode: 'error', error: err.message };
    }
}

// ─── Status → Trigger Name Map ────────────────────────────────────────────────
const STATUS_TRIGGER = {
    PENDING: 'Submitted',
    SUBMITTED: 'Submitted',
    IN_PROGRESS: 'In Review',
    ASSIGNED: 'Assigned to Officer',
    ESCALATED: 'Escalated',
    RESOLVED: 'Resolved',
    REJECTED: 'Rejected',
};

// ─── Priority Level Logic ─────────────────────────────────────────────────────
const STATUS_NOTIFY_LEVEL = {
    PENDING: 'low',
    SUBMITTED: 'low',
    IN_PROGRESS: 'low',
    ASSIGNED: 'medium',
    ESCALATED: 'medium',
    RESOLVED: 'high',
    REJECTED: 'high',
};

function resolveNotifyLevel(status, complaintPriority) {
    const base = STATUS_NOTIFY_LEVEL[status] || 'low';
    if (complaintPriority === 'High' && base === 'low') return 'medium';
    return base;
}

// ─── Channel Selection ────────────────────────────────────────────────────────
function selectChannels(notifyLevel, smsOptIn = false) {
    if (notifyLevel === 'high') return { send_push: true, send_sms: true };
    if (notifyLevel === 'medium') return { send_push: true, send_sms: smsOptIn };
    return { send_push: true, send_sms: false };
}

// ─── Message Builder ──────────────────────────────────────────────────────────
function buildMessages(complaint, status, offNote) {
    const id = complaint.id;
    const trigger = STATUS_TRIGGER[status] || status.replace('_', ' ');

    let title = '', message = '', sms_text = '';

    switch (status) {
        case 'PENDING':
        case 'SUBMITTED':
            title = `✅ Complaint Submitted — ${id}`;
            message = `Your complaint "${complaint.title}" (${id}) has been successfully submitted and is in queue for review.`;
            sms_text = `SUGRS: Your complaint ${id} is submitted. Track at sugrs.in/track?id=${id}`;
            break;
        case 'IN_PROGRESS':
            title = `🔍 Complaint Under Review — ${id}`;
            message = `Your complaint "${complaint.title}" (${id}) is now being reviewed by our team. We'll update you shortly.`;
            sms_text = `SUGRS: Complaint ${id} is under review. Status: In Progress.`;
            break;
        case 'ASSIGNED':
            title = `👤 Officer Assigned — ${id}`;
            message = `Officer ${complaint.assignedTo || 'our team'} has been assigned to "${complaint.title}" (${id}). Work will begin soon.`;
            sms_text = `SUGRS: Complaint ${id} assigned to officer. Expected action within 24-48 hrs.`;
            break;
        case 'ESCALATED':
            title = `⚠️ Complaint Escalated — ${id}`;
            message = `Your complaint "${complaint.title}" (${id}) has been escalated to High priority. A senior officer will handle this immediately.`;
            sms_text = `SUGRS: Complaint ${id} ESCALATED to high priority. Immediate action initiated.`;
            break;
        case 'RESOLVED':
            title = `🎉 Complaint Resolved — ${id}`;
            message = `Great news! Your complaint "${complaint.title}" (${id}) has been resolved. Thank you for helping make our city better! Please rate your experience.`;
            sms_text = `SUGRS: Complaint ${id} is RESOLVED. Thank you for your civic participation! Rate: sugrs.in/track?id=${id}`;
            break;
        case 'REJECTED': {
            const reason = offNote || 'Does not meet submission criteria';
            title = `❌ Complaint Rejected — ${id}`;
            message = `Complaint "${complaint.title}" (${id}) was rejected. Reason: ${reason}. You may re-submit with additional details or contact support.`;
            sms_text = `SUGRS: Complaint ${id} rejected. Reason: ${reason.substring(0, 60)}. Re-submit at sugrs.in/file`;
            break;
        }
        default:
            title = `📢 Update on Complaint ${id}`;
            message = `Your complaint "${complaint.title}" (${id}) has a new update: ${trigger}.`;
            sms_text = `SUGRS: Complaint ${id} update — ${trigger}. Check: sugrs.in/track?id=${id}`;
    }

    // Enforce SMS 160-char limit
    if (sms_text.length > 160) sms_text = sms_text.substring(0, 157) + '...';
    return { title, message, sms_text };
}

// ─── Anti-Spam Guard ──────────────────────────────────────────────────────────
function checkAntiSpam(citizenId, complaintId, status) {
    if (!store.notificationLog) store.notificationLog = [];

    const now = Date.now();
    const WINDOW = 24 * 60 * 60 * 1000;
    const MAX_PER_DAY = 3;

    const duplicate = store.notificationLog.find(
        n => n.complaintId === complaintId && n.status === status
    );
    if (duplicate) return { allowed: false, reason: 'duplicate_status' };

    const recentForCitizen = store.notificationLog.filter(
        n => n.citizenId === citizenId && (now - new Date(n.sentAt).getTime()) < WINDOW
    );
    if (recentForCitizen.length >= MAX_PER_DAY) {
        const notifyLevel = STATUS_NOTIFY_LEVEL[status] || 'low';
        if (notifyLevel !== 'high') return { allowed: false, reason: 'frequency_cap' };
    }

    return { allowed: true };
}

// ─── Log Notification ─────────────────────────────────────────────────────────
function logNotification(citizenId, complaintId, status, channels, messages, smsResult = null) {
    if (!store.notificationLog) store.notificationLog = [];
    if (!store._notifSeq) store._notifSeq = 1;

    const entry = {
        id: store._notifSeq++,
        citizenId,
        complaintId,
        status,
        channels,
        title: messages.title,
        message: messages.message,
        sms_text: messages.sms_text,
        smsResult,
        sentAt: new Date().toISOString(),
    };

    store.notificationLog.push(entry);
    save();
    return entry;
}

// ─── Main Engine Function ─────────────────────────────────────────────────────
async function evaluateNotification(complaint, newStatus, options = {}) {
    const { smsOptIn = false, offNote = '' } = options;
    const citizenId = complaint.citizenId;

    // 1) Anti-spam
    const spamCheck = checkAntiSpam(citizenId, complaint.id, newStatus);
    if (!spamCheck.allowed) {
        console.log(`[NOTIFY] Skipped ${complaint.id} → ${newStatus}: ${spamCheck.reason}`);
        return { skipped: true, reason: spamCheck.reason };
    }

    // 2) Notification level
    const notifyLevel = resolveNotifyLevel(newStatus, complaint.priority);

    // 3) Channel selection
    const channels = selectChannels(notifyLevel, smsOptIn);

    // 4) Build messages
    const messages = buildMessages(complaint, newStatus, offNote);

    // 5) Dispatch SMS (real or simulated)
    let smsResult = null;
    if (channels.send_sms) {
        smsResult = await sendSMS(complaint.phone || complaint.citizenPhone, messages.sms_text);
    }

    // 6) Compose payload
    const payload = {
        send_push: channels.send_push,
        send_sms: channels.send_sms,
        priority_level: notifyLevel,
        title: messages.title,
        message: messages.message,
        sms_text: messages.sms_text,
        sms_delivery: smsResult,
    };

    // 7) Log
    const logEntry = logNotification(citizenId, complaint.id, newStatus, channels, messages, smsResult);

    // 8) WebSocket broadcast (push notification to active browser sessions)
    if (typeof global.broadcast === 'function') {
        global.broadcast({ type: 'NOTIFICATION', citizenId, payload, logId: logEntry.id });
    }

    const smsMode = smsResult ? `SMS:${smsResult.mode}(${smsResult.sent ? '✅' : '❌'})` : 'SMS:off';
    console.log(`[NOTIFY] ✅ ${complaint.id} → ${newStatus} | Level: ${notifyLevel} | Push: ${channels.send_push} | ${smsMode}`);
    return { dispatched: true, payload, logId: logEntry.id };
}

module.exports = { evaluateNotification, buildMessages, resolveNotifyLevel, selectChannels, sendSMS };
