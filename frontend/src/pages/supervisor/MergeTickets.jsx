import { useState, useEffect } from 'react';
import { getComplaints } from '../../api/client.js';
import api from '../../api/client.js';
import { Icon } from '../../components/index.jsx';

export default function MergeTicketsPage() {
    const [complaints, setComplaints] = useState([]);
    const [idA, setIdA] = useState('');
    const [idB, setIdB] = useState('');
    const [simResult, setSimResult] = useState(null);
    const [simLoading, setSimLoading] = useState(false);
    const [merged, setMerged] = useState([]);
    const [mergeMsg, setMergeMsg] = useState('');
    const [autoSuggestions, setAutoSuggestions] = useState([]);
    const [scanLoading, setScanLoading] = useState(false);

    useEffect(() => {
        getComplaints().then(r => setComplaints(r.data)).catch(() => { });
    }, []);

    const autoScan = async () => {
        setScanLoading(true);
        setAutoSuggestions([]);
        const open = complaints.filter(c => !c.isDuplicate && c.status !== 'RESOLVED' && !c.is_deleted);
        const found = [];
        for (let i = 0; i < open.length && found.length < 10; i++) {
            for (let j = i + 1; j < open.length && found.length < 10; j++) {
                try {
                    const r = await api.post('/analytics/similarity', { idA: open[i].id, idB: open[j].id });
                    if (r.data.isDuplicate) found.push(r.data);
                } catch { /* skip */ }
            }
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
            setAutoSuggestions(prev => prev.filter(s =>
                !(s.idA === parentId || s.idB === parentId || s.idA === duplicateId || s.idB === duplicateId)
            ));
            // Refresh complaints list
            getComplaints().then(r2 => setComplaints(r2.data)).catch(() => { });
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
            {/* Header card */}
            <div className="card animate-fade" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div>
                    <div style={{ fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="trending" size={20} color="#6366f1" /> Merge Tickets
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        Cluster semantically similar complaints to consolidate impact and avoid duplicated work.
                    </div>
                </div>
                <button onClick={autoScan} disabled={scanLoading || complaints.length === 0} style={{
                    padding: '10px 22px', borderRadius: 20, border: 'none', whiteSpace: 'nowrap',
                    background: '#6366f1', color: 'white', fontWeight: 700, fontSize: 13,
                    cursor: scanLoading ? 'wait' : 'pointer', opacity: scanLoading ? 0.7 : 1,
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8
                }}>
                    {scanLoading ? <><Icon name="loader" size={14} color="white" /> Scanning…</> : <><Icon name="search" size={14} color="white" /> Auto-Scan for Duplicates</>}
                </button>
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
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.titleA}</span>
                                    <span style={{ color: '#f59e0b', fontWeight: 800 }}>&harr;</span>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: '#6366f1' }}>{s.idB}</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.titleB}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: s.combined >= 50 ? '#10b981' : '#f59e0b' }}>
                                        {s.combined}% match
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => doMerge(s.idA, s.idB)} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: '#10b981', color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Merge {s.idB} &rarr; {s.idA}
                                    </button>
                                    <button onClick={() => doMerge(s.idB, s.idA)} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Merge {s.idA} &rarr; {s.idB}
                                    </button>
                                    <button onClick={() => setAutoSuggestions(p => p.filter((_, j) => j !== i))} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>&times;</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!scanLoading && autoSuggestions.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '8px 0' }}>
                    Click <strong>Auto-Scan</strong> to detect potential duplicate tickets across all open complaints.
                </div>
            )}

            {/* Manual check */}
            <div className="card animate-fade" style={{ padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="clipboard" size={16} color="#94a3b8" /> Manual Similarity Check
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 12 }}>
                    <input value={idA} onChange={e => setIdA(e.target.value.toUpperCase())} placeholder="Parent Ticket (e.g. TKT-4509)"
                        style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                    <input value={idB} onChange={e => setIdB(e.target.value.toUpperCase())} placeholder="Duplicate Ticket (e.g. TKT-7978)"
                        style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                    <button onClick={checkSimilarity} disabled={simLoading || !idA || !idB} style={{
                        padding: '10px 22px', borderRadius: 10, border: 'none', fontFamily: 'inherit',
                        background: '#6366f1', color: 'white', fontWeight: 700, fontSize: 13,
                        cursor: 'pointer', opacity: (!idA || !idB) ? 0.5 : 1,
                    }}>{simLoading ? '…' : 'Check'}</button>
                </div>

                {simResult && (
                    <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)', display: 'grid', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>{simResult.idA} &harr; {simResult.idB}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                    "{simResult.titleA}" vs "{simResult.titleB}"
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                    {simResult.categoryA} &rarr; {simResult.categoryB}
                                </div>
                            </div>
                            <span style={{
                                padding: '5px 16px', borderRadius: 20, fontWeight: 800, fontSize: 12,
                                background: simResult.isDuplicate ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                                color: simResult.isDuplicate ? '#10b981' : '#ef4444',
                            }}>{simResult.verdict}</span>
                        </div>

                        <div style={{ display: 'grid', gap: 6 }}>
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
                                <button onClick={() => doMerge(simResult.idA, simResult.idB)} style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', background: '#10b981', color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    Merge {simResult.idB} into {simResult.idA} (keep A)
                                </button>
                                <button onClick={() => doMerge(simResult.idB, simResult.idA)} style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    Merge {simResult.idA} into {simResult.idB} (keep B)
                                </button>
                            </div>
                        )}
                        {!simResult.isDuplicate && (
                            <div style={{ fontSize: 12, color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="alert" size={14} color="#f87171" /> Score below 25% — likely different issues. Force merge if needed:
                                <button onClick={() => doMerge(simResult.idA, simResult.idB)} style={{ marginLeft: 10, padding: '3px 12px', borderRadius: 8, border: '1px solid #f87171', background: 'transparent', color: '#f87171', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    Force merge
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {mergeMsg && (
                    <div style={{
                        marginTop: 12, padding: '10px 16px', borderRadius: 10, fontFamily: 'inherit',
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
