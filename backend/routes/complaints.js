const express = require('express');
const router = express.Router();
const { models: { Complaint, Timeline }, attachTimeline, addTimeline } = require('../db');
const { createAuditEntry } = require('../lib/auditService');
const { evaluateNotification } = require('../lib/notificationEngine');
const { detectDuplicate } = require('../lib/duplicateDetector');
const { detectCritical } = require('../lib/criticalDetector');
const { extractUser, requireAuth } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../uploads'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const ASSIGN_MAP = { Water: 'Rajan Mehta', Road: 'Suresh Nair', Streetlight: 'Neha Verma', Waste: 'Neha Verma', Sanitation: 'Neha Verma', General: 'Rajan Mehta' };

// GET all (optional ?citizenId filter)
router.get('/', async (req, res) => {
    try {
        const { citizenId } = req.query;
        let query = { is_deleted: false };
        if (citizenId) query.citizenId = citizenId;

        const complaints = await Complaint.find(query).sort({ createdAt: -1 });

        // Enrich with timeline
        const enriched = await Promise.all(complaints.map(c => attachTimeline(c)));
        res.json(enriched);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

// GET single
router.get('/:id', async (req, res) => {
    try {
        const c = await Complaint.findOne({ id: req.params.id, is_deleted: false });
        if (!c) return res.status(404).json({ error: 'Not found' });
        res.json(await attachTimeline(c));
    } catch (e) {
        res.status(500).json({ error: 'Database error' });
    }
});

// POST new complaint
router.post('/', extractUser, async (req, res) => {
    try {
        const { title, description, category, priority, address, lat, lng, citizenId, citizenName, phone } = req.body;
        const id = `TKT-${String(Math.floor(Math.random() * 9000) + 1000)}`;
        const date = new Date().toISOString().split('T')[0];
        const cat = category || 'General';

        const criticalResult = detectCritical(title || '', description || '');
        const finalPriority = criticalResult.isCritical ? 'CRITICAL' : (priority || 'Medium');

        const c = new Complaint({
            id, title, description, category: cat,
            priority: finalPriority,
            status: 'PENDING',
            citizenId, citizenName,
            phone: phone || null,
            assignedTo: ASSIGN_MAP[cat] || 'Rajan Mehta',
            department: cat,
            address: address || '',
            lat: lat || null, lng: lng || null,
            imageUrl: null, rating: null,
            is_deleted: false,
            isDuplicate: false,
            parentComplaintId: null,
            impactScore: 1,
            requiresImmediateAttention: criticalResult.requiresImmediateAttention,
            slaDeadline: criticalResult.slaDeadline,
            createdAt: date, updatedAt: date // explicitly setting for UI consistency
        });

        // Duplicate Detection
        const allOpen = await Complaint.find({ status: { $ne: 'RESOLVED' }, is_deleted: false });
        const dupResult = detectDuplicate(c.toObject(), allOpen);
        if (dupResult.isDuplicate && dupResult.parentId) {
            c.isDuplicate = true;
            c.parentComplaintId = dupResult.parentId;
            const parent = await Complaint.findOne({ id: dupResult.parentId });
            if (parent) {
                parent.impactScore = (parent.impactScore || 1) + 1;
                await parent.save();
            }
        }

        await c.save();
        await addTimeline(id, 'SUBMITTED', 'Complaint registered successfully', date);

        const actorId = req.user ? req.user.id : citizenId;
        const actorRole = req.user ? req.user.role : 'citizen';
        createAuditEntry(id, 'CREATE', actorId, actorRole, c.toObject());

        const enriched = await attachTimeline(c);
        global.broadcast({ type: 'NEW_COMPLAINT', data: enriched });
        evaluateNotification(c, 'SUBMITTED', { smsOptIn: false });

        res.status(201).json(enriched);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create complaint' });
    }
});

// PATCH status
router.patch('/:id/status', extractUser, async (req, res) => {
    try {
        const c = await Complaint.findOne({ id: req.params.id, is_deleted: false });
        if (!c) return res.status(404).json({ error: 'Not found' });

        const { status, note } = req.body;
        const date = new Date().toISOString().split('T')[0];

        c.status = status;
        c.updatedAt = date;
        await c.save();

        await addTimeline(c.id, status, note || `Status updated to ${status.replace('_', ' ')} by officer`, date);

        const actorId = req.user ? req.user.id : c.assignedTo;
        const actorRole = req.user ? req.user.role : 'officer';
        const actionType = status === 'RESOLVED' ? 'RESOLVE' : 'UPDATE';
        createAuditEntry(c.id, actionType, actorId, actorRole, c.toObject());

        const enriched = await attachTimeline(c);
        global.broadcast({ type: 'STATUS_UPDATE', data: enriched });
        evaluateNotification(c, status, { smsOptIn: c.smsOptIn || false, offNote: note || '' });

        res.json(enriched);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// PATCH rating
router.patch('/:id/rating', extractUser, async (req, res) => {
    try {
        const c = await Complaint.findOne({ id: req.params.id, is_deleted: false });
        if (!c) return res.status(404).json({ error: 'Not found' });

        c.rating = req.body.rating;
        await c.save();

        const actorId = req.user ? req.user.id : c.citizenId;
        const actorRole = req.user ? req.user.role : 'citizen';
        createAuditEntry(c.id, 'UPDATE', actorId, actorRole, c.toObject());

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to save rating' });
    }
});

// PUT /:id (Update complaint safely)
router.put('/:id', requireAuth(['officer', 'admin']), async (req, res) => {
    try {
        const c = await Complaint.findOne({ id: req.params.id, is_deleted: false });
        if (!c) return res.status(404).json({ error: 'Not found' });

        const { title, description, priority, category } = req.body;
        if (title) c.title = title;
        if (description) c.description = description;
        if (priority) c.priority = priority;
        if (category) {
            c.category = category;
            c.department = category;
            c.assignedTo = ASSIGN_MAP[category] || 'Rajan Mehta';
        }

        c.updatedAt = new Date().toISOString().split('T')[0];
        await c.save();

        createAuditEntry(c.id, 'UPDATE', req.user.id, req.user.role, c.toObject());
        res.json(await attachTimeline(c));
    } catch (e) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// PUT /:id/resolve
router.put('/:id/resolve', requireAuth(['officer', 'admin']), async (req, res) => {
    try {
        const c = await Complaint.findOne({ id: req.params.id, is_deleted: false });
        if (!c) return res.status(404).json({ error: 'Not found' });

        c.status = 'RESOLVED';
        const date = new Date().toISOString().split('T')[0];
        c.updatedAt = date;
        await c.save();

        await addTimeline(c.id, 'RESOLVED', 'Complaint marked resolved via secure endpoint', date);
        createAuditEntry(c.id, 'RESOLVE', req.user.id, req.user.role, c.toObject());

        evaluateNotification(c, 'RESOLVED', { smsOptIn: true });
        res.json(await attachTimeline(c));
    } catch (e) {
        res.status(500).json({ error: 'Resolution failed' });
    }
});

// PUT /:id/escalate
router.put('/:id/escalate', requireAuth(['officer', 'admin']), async (req, res) => {
    try {
        const c = await Complaint.findOne({ id: req.params.id, is_deleted: false });
        if (!c) return res.status(404).json({ error: 'Not found' });

        c.priority = 'High';
        const date = new Date().toISOString().split('T')[0];
        c.updatedAt = date;
        await c.save();

        await addTimeline(c.id, 'IN_PROGRESS', 'Complaint escalated to High priority', date);
        createAuditEntry(c.id, 'ESCALATE', req.user.id, req.user.role, c.toObject());

        evaluateNotification(c, 'ESCALATED', { smsOptIn: c.smsOptIn || false });
        res.json(await attachTimeline(c));
    } catch (e) {
        res.status(500).json({ error: 'Escalation failed' });
    }
});

// DELETE /:id (Soft Delete)
router.delete('/:id', requireAuth(['admin']), async (req, res) => {
    try {
        const c = await Complaint.findOne({ id: req.params.id, is_deleted: false });
        if (!c) return res.status(404).json({ error: 'Not found' });

        c.is_deleted = true;
        await c.save();

        createAuditEntry(c.id, 'DELETE', req.user.id, req.user.role, c.toObject());
        res.json({ message: 'Complaint deleted safely' });
    } catch (e) {
        res.status(500).json({ error: 'Deletion failed' });
    }
});

// POST image
router.post('/:id/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const c = await Complaint.findOne({ id: req.params.id, is_deleted: false });
        if (c) {
            c.imageUrl = `/uploads/${req.file.filename}`;
            await c.save();
            createAuditEntry(c.id, 'UPDATE', 'system', 'system', c.toObject());
        }
        res.json({ imageUrl: c?.imageUrl });
    } catch (e) {
        res.status(500).json({ error: 'Image upload failed' });
    }
});

module.exports = router;

module.exports = router;
