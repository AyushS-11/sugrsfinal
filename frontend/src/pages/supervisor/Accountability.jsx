import { getAccountability } from '../../api/client.js';
import { Icon } from '../../components/index.jsx';

const scoreColor = (s) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
const scoreBg = (s) => s >= 75 ? 'rgba(16,185,129,0.12)' : s >= 50 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)';
const ScoreIcon = ({ score, size = 12 }) => {
    const col = scoreColor(score);
    return <Icon name={score >= 75 ? "check" : score >= 50 ? "trending" : "alert"} size={size} color={col} />;
};
const scoreTier = (s) => s >= 75 ? 'Good' : s >= 50 ? 'Average' : 'Poor';

function AccountRow({ d, rank }) {
    const col = scoreColor(d.score);
    return (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '10px 14px', fontWeight: 800, color: '#6366f1', fontSize: 13 }}>#{rank + 1}</td>
            <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: 13 }}>{d.department}</td>
            <td style={{ padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 10, overflow: 'hidden', minWidth: 80 }}>
                        <div style={{ height: '100%', width: `${d.score}%`, background: col, borderRadius: 10, transition: 'width .6s ease' }} />
                    </div>
                    <span style={{ fontWeight: 900, fontSize: 14, color: col, minWidth: 34 }}>{d.score}</span>
                </div>
            </td>
            <td style={{ padding: '10px 14px', fontSize: 12, color: col, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ScoreIcon score={d.score} /> {scoreTier(d.score)}
            </td>
            <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{d.slaCompliance}%</td>
            <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{d.resolutionRate}%</td>
            <td style={{ padding: '10px 14px', fontSize: 12, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}>
                {d.avgRating ? <><Icon name="star" size={12} color="#fbbf24" /> {d.avgRating}</> : '—'}
            </td>
            <td style={{ padding: '10px 14px' }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: scoreBg(d.score), color: col, fontWeight: 700 }}>
                    {d.resolved}/{d.total}
                </span>
            </td>
        </tr>
    );
}

export default function AccountabilityPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getAccountability()
            .then(r => setData(r.data))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* Header */}
            <div className="card animate-fade" style={{ padding: 20 }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon name="trending" size={20} color="#6366f1" /> Public Accountability Score
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Department performance ranked by SLA Compliance (40%) + Resolution Rate (30%) + Citizen Rating (30%).
                </div>
            </div>

            {/* Summary KPIs */}
            {!loading && data.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                    {[
                        { label: 'Best Performer', value: data[0]?.department, sub: `Score: ${data[0]?.score}`, color: '#10b981' },
                        { label: 'Avg Score', value: Math.round(data.reduce((s, d) => s + d.score, 0) / data.length), sub: 'Across all departments', color: '#6366f1' },
                        { label: 'Needs Attention', value: data.filter(d => d.score < 50).length, sub: 'Below 50 threshold', color: '#ef4444' },
                    ].map(k => (
                        <div key={k.label} className="card animate-fade" style={{ padding: 20, textAlign: 'center' }}>
                            <div style={{ fontSize: 22, fontWeight: 900, color: k.color, marginBottom: 4 }}>{k.value}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{k.label}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{k.sub}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="card animate-fade" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <Icon name="loader" size={20} color="var(--text-muted)" /> Computing scores…
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>Error: {error}</div>
                ) : data.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                        No data yet. Complaints will populate scores automatically.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '.5px' }}>
                                    {['#', 'Department', 'Score (0–100)', 'Tier', 'SLA %', 'Resolution %', 'Avg Rating', 'Tickets'].map(h =>
                                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left' }}>{h}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((d, i) => <AccountRow key={d.department} d={d} rank={i} />)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
