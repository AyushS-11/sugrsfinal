import { useState, useEffect } from 'react';
import { getOfficers, getComplaints } from '../../api/client.js';
import { Icon } from '../../components/index.jsx';

export default function Officers() {
    const [officers, setOfficers] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [oRes, cRes] = await Promise.all([getOfficers(), getComplaints()]);
                setOfficers(oRes.data);
                setComplaints(cRes.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ width: 44, height: 44, border: '3px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    const ranked = [...officers].sort((a, b) => b.score - a.score);
    const rankColors = ['#fbbf24', '#94a3b8', '#cd7c2c'];

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)' }}>{officers.length}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL OFFICERS</div>
                </div>
                <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#10b981' }}>{officers.reduce((s, o) => s + o.resolved, 0)}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL RESOLVED</div>
                </div>
                <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#6366f1' }}>{Math.round(officers.reduce((s, o) => s + o.score, 0) / officers.length)}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>AVG SCORE</div>
                </div>
            </div>

            {/* Officer Cards */}
            <div style={{ display: 'grid', gap: 14 }}>
                {ranked.map((o, i) => {
                    const totalAssigned = o.resolved + o.inProgress + o.pending;
                    const resolveRate = totalAssigned ? Math.round((o.resolved / totalAssigned) * 100) : 0;
                    return (
                        <div key={o.id} className="card animate-fade" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 14,
                                    background: `${rankColors[i] || '#6b7280'}22`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 900, fontSize: 20, color: rankColors[i] || '#6b7280',
                                }}>{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{o.name}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{o.department} Department · ID: {o.id}</div>
                                </div>
                                <div style={{ background: '#f0fdf4', padding: '8px 18px', borderRadius: 20, textAlign: 'center' }}>
                                    <div style={{ fontWeight: 900, color: '#16a34a', fontSize: 20 }}>{o.score}</div>
                                    <div style={{ fontSize: 9, color: '#16a34a', fontWeight: 600 }}>SCORE</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
                                {[
                                    ['Assigned', totalAssigned, '#6366f1'],
                                    ['Resolved', o.resolved, '#10b981'],
                                    ['In Progress', o.inProgress, '#3b82f6'],
                                    ['Pending', o.pending, '#f59e0b'],
                                ].map(([label, val, color]) => (
                                    <div key={label} style={{ background: 'var(--bg)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                                        <div style={{ fontWeight: 800, fontSize: 18, color }}>{val}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Progress Bar */}
                            <div style={{ marginTop: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                                    <span>Resolution Rate</span>
                                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{resolveRate}%</span>
                                </div>
                                <div className="sla-bar">
                                    <div className="sla-fill" style={{ width: `${resolveRate}%`, background: 'linear-gradient(90deg, #10b981, #22c55e)' }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
