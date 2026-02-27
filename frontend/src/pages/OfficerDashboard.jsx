import { useState } from 'react';
import { StatusBadge, PriorityBadge, CategoryBadge, Modal, Icon, CATEGORIES, CriticalBadge, ImpactBadge } from '../components/index.jsx';
import ComplaintDetail from '../features/ComplaintDetail.jsx';
import { updateStatus } from '../api/client.js';
import toast from 'react-hot-toast';

const PRIORITY_ORDER = { CRITICAL: 0, High: 1, Medium: 2, Low: 3 };

export default function OfficerDashboard({ complaints, setComplaints }) {
    const [filter, setFilter] = useState('All');
    const [selected, setSelected] = useState(null);

    // Sort: CRITICAL always first, then by filter
    const base = [...complaints].sort((a, b) =>
        (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4)
    );
    const filtered = base.filter(c =>
        filter === 'All' || c.category === filter || c.status === filter || (filter === 'CRITICAL' && c.priority === 'CRITICAL')
    );

    const criticalCount = complaints.filter(c => c.priority === 'CRITICAL' && c.status !== 'RESOLVED').length;

    const handleUpdated = (updated) => {
        setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
        setSelected(updated);
    };

    const quickUpdate = async (e, id, status) => {
        e.stopPropagation();
        try {
            const res = await updateStatus(id, status);
            handleUpdated(res.data);
            toast.success('Status updated!');
        } catch { toast.error('Failed'); }
    };

    const stats = [
        ['PENDING', 'clock', '#f59e0b', complaints.filter(c => c.status === 'PENDING').length],
        ['IN_PROGRESS', 'trending', '#3b82f6', complaints.filter(c => c.status === 'IN_PROGRESS').length],
        ['RESOLVED', 'check', '#10b981', complaints.filter(c => c.status === 'RESOLVED').length],
    ];

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* ── Critical Alert Banner ───────────────────────────────────── */}
            {criticalCount > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 20px',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1.5px solid rgba(239,68,68,0.35)',
                    borderRadius: 14,
                    animation: 'pulse 2s ease-in-out infinite',
                }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="alert" size={24} color="#ef4444" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, color: '#ef4444', fontSize: 14 }}>
                            {criticalCount} Critical Issue{criticalCount > 1 ? 's' : ''} Require Immediate Action
                        </div>
                        <div style={{ fontSize: 12, color: '#f87171' }}>
                            SLA deadline: 6 hours from submission. Prioritize these above all else.
                        </div>
                    </div>
                    <button onClick={() => setFilter('CRITICAL')} style={{
                        marginLeft: 'auto', padding: '6px 16px', borderRadius: 20,
                        background: '#ef4444', color: 'white', fontWeight: 700, fontSize: 12,
                        border: 'none', cursor: 'pointer',
                    }}>View All &rarr;</button>
                </div>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="animate-fade">
                {stats.map(([label, icon, color, val]) => (
                    <div key={label} className="card" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <Icon name={icon} size={20} color={color} />
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)' }}>{val}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.5px' }}>{label.replace('_', ' ')}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['All', 'CRITICAL', 'PENDING', 'IN_PROGRESS', ...CATEGORIES].map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} style={{
                        padding: '6px 14px', borderRadius: 20,
                        border: `1.5px solid ${filter === cat ? (cat === 'CRITICAL' ? '#ef4444' : '#6366f1') : 'var(--border)'}`,
                        background: filter === cat ? (cat === 'CRITICAL' ? '#ef4444' : '#6366f1') : 'var(--card)',
                        color: filter === cat ? 'white' : 'var(--text-muted)',
                        fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    }}>
                        {cat === 'CRITICAL' ? <><Icon name="alert" size={12} color={filter === 'CRITICAL' ? 'white' : '#ef4444'} /> CRITICAL</> : cat.replace('_', ' ')}
                        {cat === 'CRITICAL' && criticalCount > 0 && (
                            <span style={{ marginLeft: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: '0 6px', fontSize: 10 }}>
                                {criticalCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Queue Table */}
            <div className="card animate-fade" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>Complaint Queue</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} complaints</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg)' }}>
                            {['ID', 'Title', 'Category', 'Priority', 'Impact', 'Status', 'Quick Action'].map(h => <th key={h}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.id} className="table-row" onClick={() => setSelected(c)}
                                    style={c.priority === 'CRITICAL' ? {
                                        background: 'rgba(239,68,68,0.06)',
                                        borderLeft: '3px solid #ef4444',
                                        boxShadow: 'inset 0 0 0 1px rgba(239,68,68,0.15)',
                                    } : {}}>
                                    <td style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>{c.id}</td>
                                    <td style={{ maxWidth: 200 }}>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                                            {c.title}
                                        </div>
                                        {c.isDuplicate && c.parentComplaintId && (
                                            <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>↗ Merged: {c.parentComplaintId}</div>
                                        )}
                                    </td>
                                    <td><CategoryBadge category={c.category} /></td>
                                    <td>
                                        {c.priority === 'CRITICAL'
                                            ? <CriticalBadge inline />
                                            : <PriorityBadge priority={c.priority} />
                                        }
                                    </td>
                                    <td><ImpactBadge score={c.impactScore} isDuplicate={c.isDuplicate} parentId={c.parentComplaintId} /></td>
                                    <td><StatusBadge status={c.status} /></td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <select value={c.status} onChange={e => quickUpdate(e, c.id, e.target.value)} style={{
                                            border: '1.5px solid var(--border)', borderRadius: 8,
                                            padding: '5px 8px', fontSize: 11, cursor: 'pointer',
                                            background: 'var(--card)', color: 'var(--text)', outline: 'none',
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
                </div>
            </div>

            <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.id || ''}>
                {selected && <ComplaintDetail complaint={selected} role="officer" onUpdated={handleUpdated} />}
            </Modal>
        </div>
    );
}
