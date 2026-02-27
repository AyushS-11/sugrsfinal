import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComplaints } from '../../api/client.js';
import { StatusBadge, PriorityBadge, CategoryBadge, Modal, Icon, CATEGORIES } from '../../components/index.jsx';
import ComplaintDetail from '../../features/ComplaintDetail.jsx';
import Export from '../../features/Export.jsx';

export default function AllComplaints() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [sortBy, setSortBy] = useState('date');
    const [search, setSearch] = useState('');
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

    const filtered = complaints
        .filter(c => filter === 'All' || c.status === filter || c.category === filter)
        .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'priority') return ['High', 'Medium', 'Low'].indexOf(a.priority) - ['High', 'Medium', 'Low'].indexOf(b.priority);
            if (sortBy === 'status') return a.status.localeCompare(b.status);
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        });

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ width: 44, height: 44, border: '3px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* Search and Filters */}
            <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }}>
                            <Icon name="search" size={16} />
                        </div>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or ID…" className="input-base" style={{ paddingLeft: 40 }} />
                    </div>
                    <Export complaints={filtered} />
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['All', 'PENDING', 'IN_PROGRESS', 'RESOLVED', ...CATEGORIES].map(f => (
                            <button key={f} onClick={() => setFilter(f)} style={{
                                padding: '5px 12px', borderRadius: 20,
                                border: `1.5px solid ${filter === f ? '#8b5cf6' : 'var(--border)'}`,
                                background: filter === f ? '#8b5cf6' : 'var(--card)',
                                color: filter === f ? 'white' : 'var(--text-muted)',
                                fontWeight: 600, fontSize: 11, cursor: 'pointer',
                            }}>{f.replace('_', ' ')}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sort */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</span>
                {['date', 'priority', 'status'].map(s => (
                    <button key={s} onClick={() => setSortBy(s)} style={{
                        padding: '4px 12px', borderRadius: 8,
                        border: `1.5px solid ${sortBy === s ? '#8b5cf6' : 'var(--border)'}`,
                        background: sortBy === s ? '#8b5cf6' : 'var(--card)',
                        color: sortBy === s ? 'white' : 'var(--text-muted)',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} complaints</span>
            </div>

            {/* Table */}
            <div className="card animate-fade" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: 'var(--bg)' }}>
                        {['ID', 'Title', 'Citizen', 'Category', 'Priority', 'Status', 'Officer', 'Date'].map(h => <th key={h}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                        {filtered.map(c => (
                            <tr key={c.id} className="table-row" onClick={() => setSelected(c)}>
                                <td style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6' }}>{c.id}</td>
                                <td style={{ maxWidth: 180 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{c.title}</div></td>
                                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.citizenName}</td>
                                <td><CategoryBadge category={c.category} /></td>
                                <td><PriorityBadge priority={c.priority} /></td>
                                <td><StatusBadge status={c.status} /></td>
                                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.assignedTo}</td>
                                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.createdAt}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No complaints match your filter.</div>}
            </div>

            <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.id || ''} wide>
                {selected && <ComplaintDetail complaint={selected} role="admin" />}
            </Modal>
        </div>
    );
}
