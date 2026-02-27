import { useState, useEffect } from 'react';
import { getAnalytics, getComplaints } from '../../api/client.js';
import { KPICard, BarChart, PieChart, Icon, CAT_COLOR, CATEGORIES } from '../../components/index.jsx';
import { useAnimatedCounter } from '../../hooks/index.js';

export default function Analytics() {
    const [analytics, setAnalytics] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [aRes, cRes] = await Promise.all([getAnalytics(), getComplaints()]);
                setAnalytics(aRes.data);
                setComplaints(cRes.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const total = useAnimatedCounter(analytics?.total || 0);
    const rate = useAnimatedCounter(analytics?.resolutionRate || 0);
    const sla = useAnimatedCounter(analytics?.slaBreaches || 0);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ width: 44, height: 44, border: '3px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    const cats = CATEGORIES.map(c => ({ label: c, value: complaints.filter(x => x.category === c).length, color: CAT_COLOR[c] }));
    const statuses = [
        { label: 'Pending', value: complaints.filter(c => c.status === 'PENDING').length, color: '#f59e0b' },
        { label: 'In Progress', value: complaints.filter(c => c.status === 'IN_PROGRESS').length, color: '#3b82f6' },
        { label: 'Resolved', value: complaints.filter(c => c.status === 'RESOLVED').length, color: '#10b981' },
    ];

    const priorities = [
        { label: 'High', value: complaints.filter(c => c.priority === 'High').length, color: '#ef4444' },
        { label: 'Medium', value: complaints.filter(c => c.priority === 'Medium').length, color: '#f59e0b' },
        { label: 'Low', value: complaints.filter(c => c.priority === 'Low').length, color: '#22c55e' },
    ];

    // Department load
    const depts = {};
    complaints.forEach(c => { depts[c.department || c.category] = (depts[c.department || c.category] || 0) + 1; });
    const deptData = Object.entries(depts).map(([label, value]) => ({ label, value, color: CAT_COLOR[label] || '#6b7280' }));

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                <KPICard label="Total Complaints" value={total} icon="clipboard" color="#8b5cf6" sub="All time" />
                <KPICard label="Resolution Rate" value={`${rate}%`} icon="trending" color="#10b981" sub="Overall" />
                <KPICard label="SLA Breaches" value={sla} icon="alert" color="#ef4444" sub="Active" />
                <KPICard label="Avg Resolution" value={`${analytics?.avgResolutionDays || 0}d`} icon="clock" color="#0ea5e9" sub="Days" />
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="card animate-fade" style={{ padding: 24 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="clipboard" size={16} color="#6366f1" /> Category Breakdown
                    </div>
                    <BarChart data={cats} />
                </div>
                <div className="card animate-fade" style={{ padding: 24 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="trending" size={16} color="#10b981" /> Status Distribution
                    </div>
                    <PieChart data={statuses} />
                </div>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="card animate-fade" style={{ padding: 24 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="alert" size={16} color="#ef4444" /> Priority Distribution
                    </div>
                    <PieChart data={priorities} />
                </div>
                <div className="card animate-fade" style={{ padding: 24 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="clipboard" size={16} color="#0ea5e9" /> Department Load
                    </div>
                    <BarChart data={deptData} />
                </div>
            </div>

            {/* Performance Summary */}
            <div className="card animate-fade" style={{ padding: 24 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="activity" size={16} color="#8b5cf6" /> Performance Summary
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {[
                        { label: 'Fastest Resolution', value: '2 hours', sub: 'Water Dept.', color: '#10b981' },
                        { label: 'Most Complaints', value: cats.sort((a, b) => b.value - a.value)[0]?.label || 'N/A', sub: `${cats.sort((a, b) => b.value - a.value)[0]?.value || 0} total`, color: '#f59e0b' },
                        { label: 'Highest Priority', value: `${complaints.filter(c => c.priority === 'High').length}`, sub: 'High priority issues', color: '#ef4444' },
                    ].map(item => (
                        <div key={item.label} style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '.5px' }}>{item.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: item.color, marginBottom: 4 }}>{item.value}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sub}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
