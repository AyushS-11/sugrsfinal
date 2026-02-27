import { useState, useEffect, useCallback } from 'react';
import { KPICard, BarChart, PieChart, Modal, StatusBadge, PriorityBadge, CategoryBadge, Icon, CATEGORIES, CAT_COLOR, CriticalBadge, ImpactBadge } from '../components/index.jsx';
import ComplaintDetail from '../features/ComplaintDetail.jsx';
import Heatmap from '../features/Heatmap.jsx';
import Export from '../features/Export.jsx';
import { useAnimatedCounter } from '../hooks/index.js';
import { getAccountability } from '../api/client.js';
import api from '../api/client.js';

// ─── Score colour helper ──────────────────────────────────────────────────────
const scoreColor = (s) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
const scoreBg = (s) => s >= 75 ? 'rgba(16,185,129,0.12)' : s >= 50 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)';
const ScoreIcon = ({ score, size = 12 }) => {
    const col = scoreColor(score);
    return <Icon name={score >= 75 ? "check" : score >= 50 ? "trending" : "alert"} size={size} color={col} />;
};
const scoreTier = (s) => s >= 75 ? 'Good' : s >= 50 ? 'Average' : 'Poor';

// ─── Merge Tickets Panel ──────────────────────────────────────────
function MergePanel({ complaints }) {
    const [idA, setIdA] = useState('');
    const [idB, setIdB] = useState('');
    const [simResult, setSimResult] = useState(null);
    const [simLoading, setSimLoading] = useState(false);
    const [merged, setMerged] = useState([]);
    const [mergeMsg, setMergeMsg] = useState('');
    const [autoSuggestions, setAutoSuggestions] = useState([]);
    const [scanLoading, setScanLoading] = useState(false);

    // Auto-scan: find all pairs above threshold
    const autoScan = async () => {
        setScanLoading(true);
        setAutoSuggestions([]);
        const open = complaints.filter(c => !c.isDuplicate && c.status !== 'RESOLVED' && !c.is_deleted);
        const found = [];
        for (let i = 0; i < open.length; i++) {
            for (let j = i + 1; j < open.length; j++) {
                try {
                    const r = await api.post('/analytics/similarity', { idA: open[i].id, idB: open[j].id });
                    if (r.data.isDuplicate) found.push(r.data);
                } catch { /* skip */ }
            }
            if (found.length >= 10) break; // cap at 10 suggestions
        }
        setAutoSuggestions(found);
        setScanLoading(false);
    };

    const checkSimilarity = async () => {
        if (!idA.trim() || !idB.trim()) return;
        setSimLoading(true); setSimResult(null); setMergeMsg('');
        try {
            const r = await api.post('/analytics/similarity', { idA: idA.trim().toUpperCase(), idB: idB.trim().toUpperCase() });
            setSimResult(r.data);
        } catch (e) { setMergeMsg('Error: ' + (e.response?.data?.error || e.message)); }
        finally { setSimLoading(false); }
    };

    const doMerge = async (parentId, duplicateId) => {
        try {
            const r = await api.post('/analytics/merge', { parentId, duplicateId });
            setMerged(prev => [{ parentId, duplicateId, impactScore: r.data.parentImpactScore, at: new Date().toLocaleTimeString() }, ...prev]);
            setMergeMsg(r.data.message);
            setSimResult(null); setIdA(''); setIdB('');
            setAutoSuggestions(prev => prev.filter(s => !(s.idA === parentId || s.idB === parentId || s.idA === duplicateId || s.idB === duplicateId)));
        } catch (e) { setMergeMsg('Merge failed: ' + (e.response?.data?.error || e.message)); }
    };

    const scoreBar = (val, color) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 10, transition: 'width .5s' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color, minWidth: 30 }}>{val}%</span>
        </div>
    );

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* Header */}
            <div className="card animate-fade" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name="trending" size={18} color="#6366f1" /> Merge Tickets
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Cluster semantically similar complaints into one parent ticket to consolidate impact and avoid duplicated work.</div>
                    </div>
                    <button onClick={autoScan} disabled={scanLoading} style={{
                        padding: '8px 18px', borderRadius: 20, border: 'none',
                        background: '#6366f1', color: 'white', fontWeight: 700, fontSize: 12,
                        cursor: scanLoading ? 'wait' : 'pointer', opacity: scanLoading ? 0.7 : 1,
                        display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        {scanLoading ? <><Icon name="loader" size={14} color="white" /> Scanning…</> : <><Icon name="search" size={14} color="white" /> Auto-Scan for Duplicates</>}
                    </button>
                </div>
            </div>

            {/* Auto suggestions */}
            {autoSuggestions.length > 0 && (
                <div className="card animate-fade" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="sparkles" size={16} color="#f59e0b" /> {autoSuggestions.length} Suggested Duplicate Pair{autoSuggestions.length > 1 ? 's' : ''} Found
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                        {autoSuggestions.map((s, i) => (
                            <div key={i} style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.3)', display: 'grid', gap: 8 }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: '#6366f1' }}>{s.idA}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.titleA}</span>
                                    <span style={{ color: '#f59e0b', fontWeight: 800 }}>&harr;</span>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: '#6366f1' }}>{s.idB}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.titleB}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 800, color: s.combined >= 50 ? '#10b981' : '#f59e0b' }}>{s.combined}% match</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => doMerge(s.idA, s.idB)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', background: '#10b981', color: 'white', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                                        Merge {s.idB} &rarr; {s.idA}
                                    </button>
                                    <button onClick={() => doMerge(s.idB, s.idA)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                                        Merge {s.idA} &rarr; {s.idB}
                                    </button>
                                    <button onClick={() => setAutoSuggestions(p => p.filter((_, j) => j !== i))} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>&times;</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {scanLoading === false && autoSuggestions.length === 0 && complaints.length > 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '10px 0' }}>
                    Click <strong>Auto-Scan</strong> above to detect potential duplicate tickets.
                </div>
            )}

            {/* Manual check */}
            <div className="card animate-fade" style={{ padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="clipboard" size={16} color="#94a3b8" /> Manual Similarity Check
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 12 }}>
                    <input value={idA} onChange={e => setIdA(e.target.value.toUpperCase())} placeholder="Parent Ticket (e.g. TKT-4509)"
                        style={{ padding: '9px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                    <input value={idB} onChange={e => setIdB(e.target.value.toUpperCase())} placeholder="Duplicate Ticket (e.g. TKT-7978)"
                        style={{ padding: '9px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                    <button onClick={checkSimilarity} disabled={simLoading || !idA || !idB} style={{
                        padding: '9px 20px', borderRadius: 10, border: 'none',
                        background: '#6366f1', color: 'white', fontWeight: 700, fontSize: 13,
                        cursor: 'pointer', opacity: (!idA || !idB) ? 0.5 : 1,
                    }}>{simLoading ? '…' : 'Check'}</button>
                </div>

                {simResult && (
                    <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)', display: 'grid', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>{simResult.idA} &harr; {simResult.idB}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>"{simResult.titleA}" vs "{simResult.titleB}"</div>
                            </div>
                            <span style={{
                                padding: '4px 14px', borderRadius: 20, fontWeight: 800, fontSize: 12,
                                background: simResult.isDuplicate ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                                color: simResult.isDuplicate ? '#10b981' : '#ef4444',
                            }}>{simResult.verdict}</span>
                        </div>
                        <div style={{ display: 'grid', gap: 8 }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>Title Similarity</div>
                            {scoreBar(simResult.titleSim, '#6366f1')}
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginTop: 4 }}>Full Text Similarity</div>
                            {scoreBar(simResult.fullSim, '#3b82f6')}
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginTop: 4 }}>Combined Score (threshold: 25%)</div>
                            {scoreBar(simResult.combined, simResult.isDuplicate ? '#10b981' : '#f59e0b')}
                        </div>
                        <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                            {simResult.locBonus && <span style={{ padding: '2px 8px', borderRadius: 20, background: 'rgba(99,102,241,0.12)', color: '#818cf8', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="map-pin" size={10} color="#818cf8" /> Location match</span>}
                            {simResult.catBonus && <span style={{ padding: '2px 8px', borderRadius: 20, background: 'rgba(16,185,129,0.12)', color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="clipboard" size={10} color="#34d399" /> Same category</span>}
                        </div>
                        {simResult.isDuplicate && (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => doMerge(simResult.idA, simResult.idB)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', background: '#10b981', color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                    Merge {simResult.idB} into {simResult.idA} (keep A as parent)
                                </button>
                                <button onClick={() => doMerge(simResult.idB, simResult.idA)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                    Merge {simResult.idA} into {simResult.idB} (keep B as parent)
                                </button>
                            </div>
                        )}
                        {!simResult.isDuplicate && (
                            <div style={{ fontSize: 12, color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="alert" size={14} color="#f87171" /> Score is below 25% threshold — likely different issues. You can force merge:
                                <button onClick={() => doMerge(simResult.idA, simResult.idB)} style={{ marginLeft: 10, padding: '3px 12px', borderRadius: 8, border: '1px solid #f87171', background: 'transparent', color: '#f87171', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>Force merge anyway</button>
                            </div>
                        )}
                    </div>
                )}
                {mergeMsg && (
                    <div style={{
                        marginTop: 12, padding: '10px 16px', borderRadius: 10,
                        background: !mergeMsg.toLowerCase().includes('error') && !mergeMsg.toLowerCase().includes('fail') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: !mergeMsg.toLowerCase().includes('error') && !mergeMsg.toLowerCase().includes('fail') ? '#10b981' : '#ef4444', fontSize: 13, fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <Icon name={!mergeMsg.toLowerCase().includes('error') && !mergeMsg.toLowerCase().includes('fail') ? "check-circle" : "alert"} size={16} /> {mergeMsg}
                    </div>
                )}
            </div>

            {/* Merge history */}
            {merged.length > 0 && (
                <div className="card animate-fade" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="activity" size={16} color="#94a3b8" /> Merge History (this session)
                    </div>
                    {merged.map((m, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                            <span style={{ color: '#6366f1', fontWeight: 700 }}>{m.duplicateId}</span>
                            <span style={{ color: 'var(--text-muted)' }}>&rarr; merged into &rarr;</span>
                            <span style={{ color: '#6366f1', fontWeight: 700 }}>{m.parentId}</span>
                            <span style={{ marginLeft: 'auto', color: '#fb923c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Icon name="users" size={12} color="#fb923c" /> {m.impactScore} affected
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>{m.at}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Accountability Row ───────────────────────────────────────────────────────
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

// ─── Officer Card ─────────────────────────────────────────────────────────────
function OfficerCard({ o, rank }) {
    const rankColors = ['#fbbf24', '#94a3b8', '#cd7c2c'];
    return (
        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${rankColors[rank] || '#6b7280'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: rankColors[rank] || '#6b7280', fontSize: 15 }}>{rank + 1}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{o.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{o.department} Dept.</div>
            </div>
            <div style={{ textAlign: 'center', minWidth: 42 }}>
                <div style={{ fontWeight: 800, color: '#10b981', fontSize: 15 }}>{o.resolved}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Resolved</div>
            </div>
            <div style={{ textAlign: 'center', minWidth: 42 }}>
                <div style={{ fontWeight: 800, color: '#3b82f6', fontSize: 15 }}>{o.inProgress}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Active</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '6px 14px', borderRadius: 20 }}>
                <span style={{ fontWeight: 800, color: '#16a34a', fontSize: 14 }}>{o.score}</span>
                <span style={{ fontSize: 10, color: '#16a34a' }}>/100</span>
            </div>
        </div>
    );
}

export default function AdminDashboard({ complaints, officers, activeTab }) {
    const [sortBy, setSortBy] = useState('date');
    const [selected, setSelected] = useState(null);
    const [accountability, setAccountability] = useState([]);
    const [acctLoading, setAcctLoading] = useState(false);

    const total = useAnimatedCounter(complaints.length);
    const pending = useAnimatedCounter(complaints.filter(c => c.status === 'PENDING').length);
    const resolved = useAnimatedCounter(complaints.filter(c => c.status === 'RESOLVED').length);
    const criticals = complaints.filter(c => c.priority === 'CRITICAL' && c.status !== 'RESOLVED');
    const criticalCount = useAnimatedCounter(criticals.length);

    useEffect(() => {
        if (activeTab === 'accountability') {
            setAcctLoading(true);
            getAccountability()
                .then(r => setAccountability(r.data))
                .catch(() => { })
                .finally(() => setAcctLoading(false));
        }
    }, [activeTab]);

    const cats = CATEGORIES.map(c => ({ label: c, value: complaints.filter(x => x.category === c).length, color: CAT_COLOR[c] }));
    const statuses = [
        { label: 'Pending', value: complaints.filter(c => c.status === 'PENDING').length, color: '#f59e0b' },
        { label: 'In Progress', value: complaints.filter(c => c.status === 'IN_PROGRESS').length, color: '#3b82f6' },
        { label: 'Resolved', value: complaints.filter(c => c.status === 'RESOLVED').length, color: '#10b981' },
    ];

    const priorityOrder = { CRITICAL: 0, High: 1, Medium: 2, Low: 3 };
    const sorted = [...complaints].sort((a, b) => {
        if (sortBy === 'priority') return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return (b.createdAt || b.date || '').localeCompare(a.createdAt || a.date || '');
    });

    if (activeTab === 'heatmap') return <Heatmap complaints={complaints} />;
    if (activeTab === 'merge') return <MergePanel complaints={complaints} />;

    // ── Accountability Tab ──────────────────────────────────────────────────────
    if (activeTab === 'accountability') return (
        <div style={{ display: 'grid', gap: 20 }}>
            <div className="card animate-fade" style={{ padding: 20 }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="trending" size={18} color="#6366f1" /> Public Accountability Score
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                    Department performance ranked by SLA compliance (40%), Resolution Rate (30%), and Citizen Rating (30%).
                </div>
                {acctLoading ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Computing scores…</div>
                ) : accountability.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No data yet. Complaints will populate scores automatically.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '.5px' }}>
                                    {['#', 'Department', 'Score', 'Tier', 'SLA %', 'Resolved %', 'Avg Rating', 'Tickets'].map(h =>
                                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left' }}>{h}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {accountability.map((d, i) => <AccountRow key={d.department} d={d} rank={i} />)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    // ── Default Overview ────────────────────────────────────────────────────────
    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                <KPICard label="Total Complaints" value={total} icon="clipboard" color="#6366f1" sub="+3 this week" />
                <KPICard label="Pending" value={pending} icon="clock" color="#f59e0b" sub="Needs action" />
                <KPICard label="Resolved" value={resolved} icon="check" color="#10b981" sub="This month" />
                <KPICard label="Critical" value={criticalCount} icon="alert" color="#ef4444" sub="Immediate action" />
            </div>

            {/* ── Critical Issues Panel ─────────────────────────────────────── */}
            {criticals.length > 0 && (
                <div className="card animate-fade" style={{
                    padding: 20, borderLeft: '4px solid #ef4444',
                    background: 'rgba(239,68,68,0.04)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <CriticalBadge />
                        <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>Critical Issues Panel</span>
                        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#ef4444', fontWeight: 700 }}>
                            {criticals.length} active critical issue{criticals.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        {criticals.slice(0, 5).map(c => (
                            <div key={c.id} onClick={() => setSelected(c)} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 14px', borderRadius: 10,
                                background: 'rgba(239,68,68,0.07)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                cursor: 'pointer',
                            }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444' }}>{c.id}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: 'var(--text)' }}>{c.title}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.department}</span>
                                <StatusBadge status={c.status} />
                                {c.slaDeadline && (
                                    <span style={{ fontSize: 10, color: '#f87171', fontWeight: 700 }}>
                                        SLA: {new Date(c.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        ))}
                        {criticals.length > 5 && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 8 }}>
                                +{criticals.length - 5} more critical issues
                            </div>
                        )}
                    </div>
                </div>
            )}

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

            {/* Officer Leaderboard */}
            {officers.length > 0 && (
                <div className="card animate-fade" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="award" size={16} color="#fbbf24" /> Officer Leaderboard
                    </div>
                    {officers.map((o, i) => <OfficerCard key={o.id} o={o} rank={i} />)}
                </div>
            )}

            {/* All Complaints Table */}
            <div className="card animate-fade" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>All Complaints</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Export complaints={sorted} />
                        {['date', 'priority', 'status'].map(s => (
                            <button key={s} onClick={() => setSortBy(s)} style={{ padding: '5px 11px', borderRadius: 8, border: `1.5px solid ${sortBy === s ? '#6366f1' : 'var(--border)'}`, background: sortBy === s ? '#6366f1' : 'var(--card)', color: sortBy === s ? 'white' : 'var(--text-muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                {s[0].toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg)' }}>
                            {['ID', 'Title', 'Citizen', 'Category', 'Priority', 'Impact', 'Status', 'Date'].map(h => <th key={h}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {sorted.map(c => (
                                <tr key={c.id} className="table-row" onClick={() => setSelected(c)}
                                    style={c.priority === 'CRITICAL' ? { background: 'rgba(239,68,68,0.05)', borderLeft: '3px solid #ef4444' } : {}}>
                                    <td style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>{c.id}</td>
                                    <td style={{ maxWidth: 180 }}>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{c.title}</div>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{c.citizenName}</td>
                                    <td><CategoryBadge category={c.category} /></td>
                                    <td>
                                        {c.priority === 'CRITICAL'
                                            ? <CriticalBadge inline />
                                            : <PriorityBadge priority={c.priority} />
                                        }
                                    </td>
                                    <td><ImpactBadge score={c.impactScore} isDuplicate={c.isDuplicate} parentId={c.parentComplaintId} /></td>
                                    <td><StatusBadge status={c.status} /></td>
                                    <td style={{ color: 'var(--text-muted)' }}>{c.createdAt || c.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.id || ''}>
                {selected && <ComplaintDetail complaint={selected} role="admin" />}
            </Modal>
        </div>
    );
}
