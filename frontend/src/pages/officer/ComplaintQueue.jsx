import { useState, useEffect, useCallback } from 'react';
import { getComplaints, updateStatus } from '../../api/client.js';
import { useAuth } from '../../context/index.jsx';
import { useWebSocket } from '../../hooks/index.js';
import { StatusBadge, PriorityBadge, CategoryBadge, Modal, Icon, CATEGORIES } from '../../components/index.jsx';
import ComplaintDetail from '../../features/ComplaintDetail.jsx';
import toast from 'react-hot-toast';

export default function ComplaintQueue() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
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
        if (msg.type === 'NEW_COMPLAINT') setComplaints(prev => [msg.data, ...prev.filter(c => c.id !== msg.data.id)]);
        if (msg.type === 'STATUS_UPDATE') setComplaints(prev => prev.map(c => c.id === msg.data.id ? msg.data : c));
    }, []);
    useWebSocket(onWsMessage);

    const myComplaints = complaints.filter(c => c.assignedTo === user?.name);
    const filtered = myComplaints.filter(c => filter === 'All' || c.status === filter || c.category === filter);

    const handleUpdated = (updated) => {
        setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
        setSelected(updated);
    };

    const quickUpdate = async (e, id, status) => {
        e.stopPropagation();
        try {
            const res = await updateStatus(id, status, `Status updated to ${status.replace('_', ' ')} by ${user?.name}`);
            handleUpdated(res.data);
            toast.success('Status updated!');
        } catch { toast.error('Failed'); }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: 44, height: 44, border: '3px solid #0ea5e9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {[
                    { label: 'PENDING', icon: 'clock', color: '#f59e0b' },
                    { label: 'IN_PROGRESS', icon: 'trending', color: '#3b82f6' },
                    { label: 'RESOLVED', icon: 'check', color: '#10b981' }
                ].map(({ label, icon, color }) => (
                    <div key={label} className="card" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <Icon name={icon} size={20} color={color} />
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)' }}>{myComplaints.filter(c => c.status === label).length}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.5px' }}>{label.replace('_', ' ')}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['All', 'PENDING', 'IN_PROGRESS', ...CATEGORIES].map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} style={{
                        padding: '6px 14px', borderRadius: 20,
                        border: `1.5px solid ${filter === cat ? '#0ea5e9' : 'var(--border)'}`,
                        background: filter === cat ? '#0ea5e9' : 'var(--card)',
                        color: filter === cat ? 'white' : 'var(--text-muted)',
                        fontWeight: 600, fontSize: 12, cursor: 'pointer',
                    }}>{cat.replace('_', ' ')}</button>
                ))}
            </div>

            {/* Table */}
            <div className="card animate-fade" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>Complaint Queue</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} complaints</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg)' }}>
                            {['ID', 'Title', 'Category', 'Priority', 'Status', 'Quick Action'].map(h => <th key={h}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.id} className="table-row" onClick={() => setSelected(c)}>
                                    <td style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9' }}>{c.id}</td>
                                    <td style={{ maxWidth: 200 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{c.title}</div></td>
                                    <td><CategoryBadge category={c.category} /></td>
                                    <td><PriorityBadge priority={c.priority} /></td>
                                    <td><StatusBadge status={c.status} /></td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <select value={c.status} onChange={e => quickUpdate(e, c.id, e.target.value)} style={{
                                            border: '1.5px solid var(--border)', borderRadius: 8, padding: '5px 8px',
                                            fontSize: 11, cursor: 'pointer', background: 'var(--card)', color: 'var(--text)', outline: 'none',
                                        }}>
                                            <option value="PENDING">Pending</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="RESOLVED">Resolved</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No complaints in queue.</div>}
                </div>
            </div>

            <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.id || ''}>
                {selected && <ComplaintDetail complaint={selected} role="officer" onUpdated={handleUpdated} />}
            </Modal>
        </div>
    );
}
