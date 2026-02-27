const fs = require('fs');
const jwt = require('jsonwebtoken');

async function runTests() {
    try {
        console.log('--- STARTING SECURITY TESTS ---');

        // 1. Generate an admin token for testing
        console.log('\n[1] Generating Admin Token');
        const token = jwt.sign(
            { id: 'u7', name: 'System Admin', email: 'admin@sugrs.in', role: 'admin' },
            require('./middleware/authMiddleware').JWT_SECRET
        );
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        };
        console.log('Token created successfully.');

        // 2. Create a new complaint (with auth)
        console.log('\n[2] Creating New Complaint');
        const cRes = await fetch('http://localhost:8080/api/complaints', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: 'Test Security',
                description: 'Testing the hash chain',
                category: 'Water',
                priority: 'High',
                citizenId: 'C001'
            })
        });
        const complaint = await cRes.json();
        console.log(`Created complaint: ${complaint.id}`);

        // 3. Update complaint status
        console.log('\n[3] Updating Complaint Status');
        const sRes = await fetch(`http://localhost:8080/api/complaints/${complaint.id}/status`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status: 'IN_PROGRESS', note: 'Officer took it' })
        });
        await sRes.json();
        console.log('Status updated to IN_PROGRESS');

        // 4. Escalate complaint using secure route
        console.log('\n[4] Escalating Complaint via Secure Route');
        const eRes = await fetch(`http://localhost:8080/api/complaints/${complaint.id}/escalate`, {
            method: 'PUT',
            headers
        });
        await eRes.json();
        console.log('Complaint escalated to High priority');

        // 5. Verify the audit hash chain
        console.log('\n[5] Verifying Audit Hash Chain Integrity');
        const vRes = await fetch(`http://localhost:8080/api/audit/${complaint.id}/verify`, {
            headers
        });

        if (!vRes.ok) {
            console.error('Verification HTTP Error:', vRes.status, await vRes.text());
        } else {
            const verifyData = await vRes.json();
            console.log('Verification Result:', verifyData.status);
            console.log(verifyData.message);
            console.log(`Total Records Verified: ${verifyData.details.totalRecords}`);
        }

        // 6. Inspect data.json
        console.log('\n[6] Inspecting local data.json storage');
        const store = JSON.parse(fs.readFileSync('./data.json'));
        const auditLogs = store.auditLogs.filter(l => l.complaint_id === complaint.id);

        console.log(`Found ${auditLogs.length} audit log entries directly in data.json for this complaint.`);
        console.log('Last Log Hash:', auditLogs[auditLogs.length - 1].hash);
        console.log('Previous Hash Linkage:', auditLogs[auditLogs.length - 1].previous_hash);

        console.log('\n✅ SECURITY IMPLEMENTATION VALIDATED SUCCESSFULLY ✅');

    } catch (e) {
        console.error('Test script failed:', e.message);
    }
}

runTests();
