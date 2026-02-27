import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getComplaint, updateStatus, uploadImage } from '../../api/client.js';
import { useAuth } from '../../context/index.jsx';
import { StatusBadge, PriorityBadge, CategoryBadge, Timeline, Icon } from '../../components/index.jsx';
import toast from 'react-hot-toast';

export default function ResolveComplaint() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [ticketId, setTicketId] = useState(searchParams.get('id') || '');
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState('');
    const [status, setStatus] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [updating, setUpdating] = useState(false);

    const loadComplaint = async (id) => {
        const qId = id || ticketId;
        if (!qId.trim()) return;
        setLoading(true);
        try {
            const res = await getComplaint(qId.trim());
            setComplaint(res.data);
            setStatus(res.data.status);
        } catch {
            toast.error('Complaint not found');
            setComplaint(null);
        } finally { setLoading(false); }
    };

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) { setTicketId(id); loadComplaint(id); }
    }, [searchParams]);

    const handleUpdate = async () => {
        if (!complaint) return;
        setUpdating(true);
        try {
            const res = await updateStatus(complaint.id, status, note || `Status updated by ${user?.name}`);
            if (proofFile) {
                try { await uploadImage(complaint.id, proofFile); } catch { }
            }
            setComplaint(res.data);
            toast.success('Complaint updated successfully!');
            setNote('');
            setProofFile(null);
        } catch { toast.error('Update failed'); }
        finally { setUpdating(false); }
    };

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* Search */}
            <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="trending" size={18} color="#0ea5e9" /> Resolve Complaint
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input value={ticketId} onChange={e => setTicketId(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && loadComplaint()}
                        placeholder="Enter Ticket ID (e.g. TKT-001)" className="input-base" style={{ flex: 1 }} />
                    <button className="btn-primary" onClick={() => loadComplaint()} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {loading ? <Icon name="loader" size={14} color="white" /> : 'Load'}
                    </button>
                </div>
            </div>

            {complaint && (
                <>
                    {/* Complaint Details */}
                    <div className="card animate-fade" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                            <span style={{ background: '#0ea5e915', color: '#0ea5e9', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>{complaint.id}</span>
                            <StatusBadge status={complaint.status} />
                            <PriorityBadge priority={complaint.priority} />
                            <CategoryBadge category={complaint.category} />
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>{complaint.title}</div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>{complaint.description}</div>
                        {complaint.address && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="map-pin" size={14} color="#94a3b8" /> {complaint.address}
                        </div>}
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Citizen: {complaint.citizenName} · Filed: {complaint.createdAt}</div>
                    </div>

                    {/* Timeline */}
                    <div className="card animate-fade" style={{ padding: 24 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name="activity" size={16} color="#94a3b8" /> Timeline
                        </div>
                        <Timeline events={complaint.timeline || []} />
                    </div>

                    {/* Update Form */}
                    <div className="card animate-fade" style={{ padding: 24 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name="loader" size={16} color="#3b82f6" /> Update Status
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>NEW STATUS</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {['PENDING', 'IN_PROGRESS', 'RESOLVED'].map(s => {
                                    const colors = { PENDING: '#f59e0b', IN_PROGRESS: '#3b82f6', RESOLVED: '#10b981' };
                                    return (
                                        <button key={s} onClick={() => setStatus(s)} style={{
                                            flex: 1, padding: '12px 6px',
                                            border: `2px solid ${status === s ? colors[s] : 'var(--border)'}`,
                                            borderRadius: 12, background: status === s ? `${colors[s]}15` : 'var(--card)',
                                            color: status === s ? colors[s] : 'var(--text-muted)',
                                            fontWeight: 700, fontSize: 12, cursor: 'pointer',
                                        }}>{s.replace('_', ' ')}</button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>RESOLUTION NOTE</label>
                            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add notes about the resolution…" rows={3} className="input-base" style={{ resize: 'vertical' }} />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="camera" size={12} color="var(--text-muted)" /> UPLOAD PROOF
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <input type="file" accept="image/*" onChange={e => setProofFile(e.target.files?.[0] || null)} style={{ fontSize: 13 }} />
                                {proofFile && <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>✓ {proofFile.name}</span>}
                            </div>
                        </div>

                        <button className="btn-primary" onClick={handleUpdate} disabled={updating} style={{ width: '100%', padding: 14, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {updating ? <><Icon name="loader" size={18} color="white" /> Updating…</> : <><Icon name="check" size={18} color="white" /> Submit Update</>}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
