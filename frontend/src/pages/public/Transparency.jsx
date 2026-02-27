import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalytics } from '../../api/client.js';
import { BarChart, PieChart, Icon, CAT_COLOR, STATUS_COLOR } from '../../components/index.jsx';

const PAGE_BG = '#0a0e1a';
const GLASS = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, backdropFilter: 'blur(12px)' };

function KPI({ label, value, icon, color, sub }) {
    return (
        <div style={{ ...GLASS, padding: 24, position: 'relative', overflow: 'hidden', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + '55'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: color + '10' }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
            <div style={{ fontSize: 34, fontWeight: 900, background: `linear-gradient(135deg, ${color}, ${color}aa)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 4 }}>{value}</div>
            {sub && <div style={{ fontSize: 12, color: '#475569' }}>{sub}</div>}
        </div>
    );
}

export default function Transparency() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try { const res = await getAnalytics(); setData(res.data); }
            catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: PAGE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 50, height: 50, border: '3px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <div style={{ color: '#64748b', fontWeight: 600, fontSize: 15 }}>Loading transparency data…</div>
            </div>
        </div>
    );

    const cats = Object.entries(data?.categories || {}).map(([label, value]) => ({ label, value, color: CAT_COLOR[label] || '#6b7280' }));
    const statuses = [
        { label: 'Pending', value: data?.pending || 0, color: '#f59e0b' },
        { label: 'In Progress', value: data?.inProgress || 0, color: '#3b82f6' },
        { label: 'Resolved', value: data?.resolved || 0, color: '#10b981' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: "'DM Sans', sans-serif", color: 'white', position: 'relative', overflow: 'hidden' }}>
            {/* Background */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 25%, #8b5cf610 0%, transparent 55%), radial-gradient(ellipse at 75% 75%, #6366f110 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', top: '5%', left: '8%', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.02)', animation: 'spin 40s linear infinite' }} />

            {/* Header */}
            <div style={{ position: 'relative', zIndex: 2, padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div onClick={() => navigate('/')} style={{ width: 42, height: 42, borderRadius: 14, cursor: 'pointer', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px #8b5cf644' }}>
                        <Icon name="trending" size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: '-0.5px' }}>Transparency Dashboard</div>
                        <div style={{ fontSize: 12, color: '#475569' }}>Public analytics overview</div>
                    </div>
                </div>
                <button onClick={() => navigate('/')} style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
            </div>

            <div style={{ position: 'relative', zIndex: 2, maxWidth: 1120, margin: '0 auto', padding: '36px 24px' }}>
                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                    <KPI label="Total Complaints" value={data?.total || 0} color="#8b5cf6" sub="All time" />
                    <KPI label="Resolution Rate" value={`${data?.resolutionRate || 0}%`} color="#10b981" sub="Overall" />
                    <KPI label="SLA Breaches" value={data?.slaBreaches || 0} color="#ef4444" sub="Active" />
                    <KPI label="Avg Resolution" value={`${data?.avgResolutionDays || 0}d`} color="#0ea5e9" sub="Days" />
                </div>

                {/* Charts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                    <div style={{ ...GLASS, padding: 28 }}>
                        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Icon name="clipboard" size={18} color="#6366f1" /> Complaints by Category
                        </div>
                        <BarChart data={cats} />
                    </div>
                    <div style={{ ...GLASS, padding: 28 }}>
                        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Icon name="trending" size={18} color="#10b981" /> Status Distribution
                        </div>
                        <PieChart data={statuses} />
                    </div>
                </div>

                {/* Recent */}
                {data?.recent && data.recent.length > 0 && (
                    <div style={{ ...GLASS, padding: 28 }}>
                        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Icon name="clipboard" size={18} color="#94a3b8" /> Recent Complaints
                        </div>
                        <div style={{ display: 'grid', gap: 8 }}>
                            {data.recent.map(c => (
                                <div key={c.id} onClick={() => navigate(`/track?id=${c.id}`)} style={{
                                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                                    background: 'rgba(255,255,255,0.03)', borderRadius: 14, cursor: 'pointer',
                                    transition: 'all 0.2s', border: '1px solid transparent',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: '#a5b4fc', minWidth: 80 }}>{c.id}</span>
                                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: (STATUS_COLOR[c.status] || '#6b7280') + '22', color: STATUS_COLOR[c.status] || '#6b7280' }}>{c.status?.replace(/_/g, ' ')}</span>
                                    <span style={{ fontSize: 11, color: '#475569' }}>{c.createdAt}</span>
                                    <span style={{ color: '#475569', fontSize: 16 }}>›</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
