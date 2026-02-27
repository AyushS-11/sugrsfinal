import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComplaints } from '../../api/client.js';
import { StatusBadge, PriorityBadge, CategoryBadge, Modal, Timeline, Icon } from '../../components/index.jsx';

export default function Escalations() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await getComplaints();
                setComplaints(res.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    // Escalated = unresolved and older than 48 hours
    const now = Date.now();
    const escalated = complaints.filter(c => {
        if (c.status === 'RESOLVED') return false;
        const created = new Date(c.createdAt).getTime();
        return (now - created) > 48 * 3600 * 1000;
    }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // oldest first

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ width: 44, height: 44, border: '3px solid #ef4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* Summary */}
            <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, background: escalated.length > 0 ? '#fef2f2' : '#f0fdf4', borderColor: escalated.length > 0 ? '#fecaca' : '#bbf7d0' }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: escalated.length > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={escalated.length > 0 ? "alert" : "check"} size={32} color={escalated.length > 0 ? "#ef4444" : "#10b981"} />
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: escalated.length > 0 ? '#991b1b' : '#166534' }}>
                        {escalated.length > 0 ? `${escalated.length} Escalated Complaints` : 'No Escalations'}
                    </div>
                    <div style={{ fontSize: 13, color: escalated.length > 0 ? '#b91c1c' : '#15803d' }}>
                        {escalated.length > 0 ? 'These complaints have exceeded 48 hours without resolution.' : 'All complaints are within SLA timeline.'}
                    </div>
                </div>
            </div>

            {/* Escalation List */}
            {escalated.length > 0 && (
                <div className="card animate-fade" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="trending" size={16} color="#ef4444" />
                        <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>Escalation Queue</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg)' }}>
                            {['ID', 'Title', 'Priority', 'Status', 'Officer', 'Filed', 'Age'].map(h => <th key={h}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {escalated.map(c => {
                                const ageDays = Math.floor((now - new Date(c.createdAt).getTime()) / (24 * 3600 * 1000));
                                return (
                                    <tr key={c.id} className="table-row" onClick={() => setSelected(c)}>
                                        <td style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>{c.id}</td>
                                        <td style={{ maxWidth: 180 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{c.title}</div></td>
                                        <td><PriorityBadge priority={c.priority} /></td>
                                        <td><StatusBadge status={c.status} /></td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.assignedTo}</td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.createdAt}</td>
                                        <td>
                                            <span style={{
                                                background: ageDays > 5 ? '#fef2f2' : '#fffbeb',
                                                color: ageDays > 5 ? '#ef4444' : '#f59e0b',
                                                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                            }}>{ageDays}d ago</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail Modal */}
            {selected && (
                <Modal open={!!selected} onClose={() => setSelected(null)} title={`${selected?.id} — Escalation Details`}>
                    <div className="animate-fade">
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                            <StatusBadge status={selected.status} />
                            <PriorityBadge priority={selected.priority} />
                            <CategoryBadge category={selected.category} />
                            <span style={{ background: '#fef2f2', color: '#ef4444', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Icon name="alert" size={12} color="#ef4444" /> ESCALATED
                            </span>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>{selected.title}</div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>{selected.description}</div>
                        {selected.address && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="map-pin" size={14} color="#94a3b8" /> {selected.address}
                        </div>}
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Assigned to: {selected.assignedTo} · Filed: {selected.createdAt}</div>
                        <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>TIMELINE</div>
                            <Timeline events={selected.timeline || []} />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
