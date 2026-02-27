import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { getComplaints, getOfficers } from '../../api/client.js';
import { useWebSocket } from '../../hooks/index.js';
import { useAuth } from '../../context/index.jsx';
import { KPICard, StatusBadge, PriorityBadge, CategoryBadge, Modal, Icon } from '../../components/index.jsx';
import ComplaintDetail from '../../features/ComplaintDetail.jsx';
import { useAnimatedCounter } from '../../hooks/index.js';

export default function OfficerDashboard() {
    const { user } = useAuth();
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

    const onWsMessage = useCallback((msg) => {
        if (msg.type === 'NEW_COMPLAINT') {
            setComplaints(prev => [msg.data, ...prev.filter(c => c.id !== msg.data.id)]);
        }
        if (msg.type === 'STATUS_UPDATE') {
            setComplaints(prev => prev.map(c => c.id === msg.data.id ? msg.data : c));
        }
    }, []);
    const { connected } = useWebSocket(onWsMessage);

    const myComplaints = complaints.filter(c => c.assignedTo === user?.name);
    const pending = myComplaints.filter(c => c.status === 'PENDING').length;
    const inProgress = myComplaints.filter(c => c.status === 'IN_PROGRESS').length;
    const resolved = myComplaints.filter(c => c.status === 'RESOLVED').length;

    const pendingCount = useAnimatedCounter(pending);
    const inProgressCount = useAnimatedCounter(inProgress);
    const resolvedCount = useAnimatedCounter(resolved);
    const totalCount = useAnimatedCounter(myComplaints.length);

    const handleUpdated = (updated) => {
        setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
        setSelected(updated);
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: 44, height: 44, border: '3px solid #0ea5e9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading dashboard…</div>
        </div>
    );

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                <KPICard label="My Complaints" value={totalCount} icon="clipboard" color="#0ea5e9" sub="Total assigned" />
                <KPICard label="Pending" value={pendingCount} icon="clock" color="#f59e0b" sub="Needs action" />
                <KPICard label="In Progress" value={inProgressCount} icon="trending" color="#3b82f6" sub="Being resolved" />
                <KPICard label="Resolved" value={resolvedCount} icon="check" color="#10b981" sub="Completed" />
            </div>

            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className={`live-dot ${connected ? 'animate-pulse-dot' : ''}`} style={{ background: connected ? '#10b981' : '#6b7280' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: connected ? '#10b981' : 'var(--text-muted)' }}>{connected ? 'LIVE' : 'OFFLINE'}</span>
                <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{myComplaints.length} total complaints</span>
            </div>

            {/* Recent Complaints */}
            <div className="card animate-fade" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>
                        <Icon name="clipboard" size={16} color="#0ea5e9" /> Recent Assigned Complaints
                    </div>
                    <button className="btn-ghost" onClick={() => navigate('/officer/queue')} style={{ fontSize: 11 }}>View All &rarr;</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg)' }}>
                            {['ID', 'Title', 'Category', 'Priority', 'Status', 'Date'].map(h => <th key={h}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {myComplaints.slice(0, 5).map(c => (
                                <tr key={c.id} className="table-row" onClick={() => setSelected(c)}>
                                    <td style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9' }}>{c.id}</td>
                                    <td style={{ maxWidth: 200 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{c.title}</div></td>
                                    <td><CategoryBadge category={c.category} /></td>
                                    <td><PriorityBadge priority={c.priority} /></td>
                                    <td><StatusBadge status={c.status} /></td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.createdAt}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.id || ''}>
                {selected && <ComplaintDetail complaint={selected} role="officer" onUpdated={handleUpdated} />}
            </Modal>
        </div>
    );
}
