import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComplaints } from '../../api/client.js';
import { StatusBadge, PriorityBadge, CategoryBadge, CATEGORIES } from '../../components/index.jsx';

const PAGE_BG = '#0a0e1a';
const GLASS = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, backdropFilter: 'blur(12px)' };

export default function Reports() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [sortBy, setSortBy] = useState('date');
    const [search, setSearch] = useState('');

    useEffect(() => {
        (async () => {
            try { const res = await getComplaints(); setComplaints(res.data); }
            catch (e) { console.error(e); }
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

    return (
        <div style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: "'DM Sans', sans-serif", color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 30%, #f59e0b08 0%, transparent 55%), radial-gradient(ellipse at 80% 60%, #6366f108 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', top: '8%', right: '4%', width: 380, height: 380, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.02)', animation: 'spin 32s linear infinite' }} />

            {/* Header */}
            <div style={{ position: 'relative', zIndex: 2, padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div onClick={() => navigate('/')} style={{ width: 42, height: 42, borderRadius: 14, cursor: 'pointer', background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px #f59e0b44' }}>
                        <Icon name="clipboard" size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: '-0.5px' }}>Public Reports</div>
                        <div style={{ fontSize: 12, color: '#475569' }}>Browse all filed complaints</div>
                    </div>
                </div>
                <button onClick={() => navigate('/')} style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
            </div>

            <div style={{ position: 'relative', zIndex: 2, maxWidth: 1140, margin: '0 auto', padding: '32px 24px' }}>
                {/* Search & Filters */}
                <div style={{ ...GLASS, padding: 22, marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: 220 }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                                    <Icon name="search" size={14} color="var(--text-muted)" />
                                </div>
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints…"
                                    className="input-base" style={{ paddingLeft: 40, width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                                    onFocus={e => e.target.style.borderColor = '#f59e0b'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {['All', 'PENDING', 'IN_PROGRESS', 'RESOLVED', ...CATEGORIES].map(f => (
                                <button key={f} onClick={() => setFilter(f)} style={{
                                    padding: '6px 14px', borderRadius: 20,
                                    border: `1.5px solid ${filter === f ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                                    background: filter === f ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : 'rgba(255,255,255,0.04)',
                                    color: filter === f ? '#0f172a' : '#94a3b8',
                                    fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                                }}>{f.replace('_', ' ')}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sort */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Sort by:</span>
                    {['date', 'priority', 'status'].map(s => (
                        <button key={s} onClick={() => setSortBy(s)} style={{
                            padding: '5px 14px', borderRadius: 8,
                            border: `1.5px solid ${sortBy === s ? '#a5b4fc' : 'rgba(255,255,255,0.08)'}`,
                            background: sortBy === s ? 'rgba(165,180,252,0.1)' : 'transparent',
                            color: sortBy === s ? '#a5b4fc' : '#64748b',
                            fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: '#475569' }}>{filtered.length} complaints</span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{ width: 50, height: 50, border: '3px solid #f59e0b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                    </div>
                ) : (
                    <div style={{ ...GLASS, overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr>
                                    {['ID', 'Title', 'Category', 'Priority', 'Status', 'Date', ''].map(h => (
                                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '.5px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody>
                                    {filtered.map(c => (
                                        <tr key={c.id} onClick={() => navigate(`/track?id=${c.id}`)} style={{ cursor: 'pointer', transition: 'background 0.15s', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '14px 16px', fontSize: 12, fontWeight: 800, color: '#a5b4fc' }}>{c.id}</td>
                                            <td style={{ padding: '14px 16px', maxWidth: 220 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>{c.title}</div></td>
                                            <td style={{ padding: '14px 16px' }}><CategoryBadge category={c.category} /></td>
                                            <td style={{ padding: '14px 16px' }}><PriorityBadge priority={c.priority} /></td>
                                            <td style={{ padding: '14px 16px' }}><StatusBadge status={c.status} /></td>
                                            <td style={{ padding: '14px 16px', color: '#475569', fontSize: 12 }}>{c.createdAt}</td>
                                            <td style={{ padding: '14px 16px', color: '#475569', fontSize: 16 }}>›</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && <div style={{ padding: 50, textAlign: 'center', color: '#475569', fontSize: 15 }}>No complaints match your filter.</div>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
