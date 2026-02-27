import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComplaints, getOfficers, getAnalytics } from '../../api/client.js';
import { useWebSocket, useAnimatedCounter } from '../../hooks/index.js';
import { useAuth } from '../../context/index.jsx';
import { KPICard, BarChart, PieChart, StatusBadge, Icon, CAT_COLOR, CATEGORIES } from '../../components/index.jsx';

export default function SupervisorDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [aRes, cRes, oRes] = await Promise.all([getAnalytics(), getComplaints(), getOfficers()]);
                setAnalytics(aRes.data);
                setComplaints(cRes.data);
                setOfficers(oRes.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const onWsMessage = useCallback((msg) => {
        if (msg.type === 'NEW_COMPLAINT') setComplaints(prev => [msg.data, ...prev.filter(c => c.id !== msg.data.id)]);
        if (msg.type === 'STATUS_UPDATE') setComplaints(prev => prev.map(c => c.id === msg.data.id ? msg.data : c));
    }, []);
    const { connected } = useWebSocket(onWsMessage);

    const total = useAnimatedCounter(analytics?.total || 0);
    const pending = useAnimatedCounter(analytics?.pending || 0);
    const resolved = useAnimatedCounter(analytics?.resolved || 0);
    const sla = useAnimatedCounter(analytics?.slaBreaches || 0);

    const cats = CATEGORIES.map(c => ({ label: c, value: complaints.filter(x => x.category === c).length, color: CAT_COLOR[c] }));
    const statuses = [
        { label: 'Pending', value: complaints.filter(c => c.status === 'PENDING').length, color: '#f59e0b' },
        { label: 'In Progress', value: complaints.filter(c => c.status === 'IN_PROGRESS').length, color: '#3b82f6' },
        { label: 'Resolved', value: complaints.filter(c => c.status === 'RESOLVED').length, color: '#10b981' },
    ];

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: 44, height: 44, border: '3px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading supervisor dashboard…</div>
        </div>
    );

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* Live Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className={`live-dot ${connected ? 'animate-pulse-dot' : ''}`} style={{ background: connected ? '#10b981' : '#6b7280' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: connected ? '#10b981' : 'var(--text-muted)' }}>{connected ? 'LIVE' : 'OFFLINE'}</span>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                <KPICard label="Total Complaints" value={total} icon="clipboard" color="#8b5cf6" sub="All time" />
                <KPICard label="Pending" value={pending} icon="clock" color="#f59e0b" sub="Needs action" />
                <KPICard label="Resolved" value={resolved} icon="check" color="#10b981" sub="Completed" />
                <KPICard label="SLA Breaches" value={sla} icon="alert" color="#ef4444" sub="Active" />
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="card animate-fade" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 16 }}>Complaints by Category</div>
                    <BarChart data={cats} />
                </div>
                <div className="card animate-fade" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 16 }}>Status Distribution</div>
                    <PieChart data={statuses} />
                </div>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                    { label: 'All Complaints', icon: 'file-text', to: '/supervisor/complaints', color: '#6366f1' },
                    { label: 'Officer Perf.', icon: 'user', to: '/supervisor/officers', color: '#0ea5e9' },
                    { label: 'Heatmap', icon: 'map', to: '/supervisor/heatmap', color: '#ec4899' },
                    { label: 'Escalations', icon: 'alert', to: '/supervisor/escalations', color: '#ef4444' },
                ].map(link => (
                    <div key={link.label} onClick={() => navigate(link.to)} className="card" style={{
                        padding: 20, textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = link.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: `${link.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <Icon name={link.icon} size={24} color={link.color} />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{link.label}</div>
                    </div>
                ))}
            </div>

            {/* Top Officers */}
            {officers.length > 0 && (
                <div className="card animate-fade" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="award" size={16} color="#fbbf24" /> Officer Leaderboard
                    </div>
                    {officers.sort((a, b) => b.score - a.score).slice(0, 3).map((o, i) => {
                        const rankColors = ['#fbbf24', '#94a3b8', '#cd7c2c'];
                        return (
                            <div key={o.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${rankColors[i] || '#6b7280'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: rankColors[i], fontSize: 14 }}>{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{o.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.department}</div>
                                </div>
                                <div style={{ background: '#f0fdf4', padding: '4px 12px', borderRadius: 20, fontWeight: 800, color: '#16a34a', fontSize: 13 }}>{o.score}/100</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
