import { useState, useEffect } from 'react';
import { StatusBadge, PriorityBadge, CategoryBadge, Timeline, RatingStars, Icon } from '../components/index.jsx';
import { updateStatus, rateComplaint } from '../api/client.js';
import toast from 'react-hot-toast';

export default function ComplaintDetail({ complaint, role, onUpdated }) {
    const [status, setStatus] = useState(complaint?.status);
    const [rating, setRating] = useState(complaint?.rating || 0);
    const [slaTime, setSlaTime] = useState({ h: 0, m: 0, s: 0 });

    // Live SLA countdown
    useEffect(() => {
        if (complaint?.status === 'RESOLVED') return;
        const slaHours = { High: 24, Medium: 72, Low: 168 }[complaint?.priority] || 72;
        const created = new Date(complaint?.createdAt || Date.now());
        const deadline = new Date(created.getTime() + slaHours * 3600 * 1000);
        const tick = () => {
            const diff = deadline - Date.now();
            if (diff <= 0) { setSlaTime({ h: 0, m: 0, s: 0 }); return; }
            setSlaTime({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [complaint?.createdAt, complaint?.priority, complaint?.status]);

    if (!complaint) return null;
    const isBreached = slaTime.h === 0 && slaTime.m === 0 && slaTime.s === 0 && complaint.status !== 'RESOLVED';

    const handleStatusUpdate = async (s) => {
        try {
            const res = await updateStatus(complaint.id, s, `Status updated to ${s.replace('_', ' ')} by officer`);
            setStatus(s);
            onUpdated?.(res.data);
            toast.success('Status updated!');
        } catch { toast.error('Update failed'); }
    };

    const handleRate = async (v) => {
        setRating(v);
        try { await rateComplaint(complaint.id, v); toast.success('Rating saved!'); }
        catch { toast.error('Failed to save rating'); }
    };

    return (
        <div className="animate-fade">
            {/* Badges Row */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                <StatusBadge status={complaint.status} /> <PriorityBadge priority={complaint.priority} /> <CategoryBadge category={complaint.category} />
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>Filed: {complaint.createdAt || complaint.date}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{complaint.title}</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 18 }}>{complaint.description}</div>

            {/* Meta */}
            {(complaint.address || complaint.assignedTo) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                    {complaint.address && <div className="card" style={{ padding: '10px 14px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icon name="map-pin" size={10} color="var(--text-muted)" /> LOCATION
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text)' }}>{complaint.address}</div>
                    </div>}
                    {complaint.assignedTo && <div className="card" style={{ padding: '10px 14px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icon name="user" size={10} color="var(--text-muted)" /> ASSIGNED TO
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{complaint.assignedTo}</div>
                    </div>}
                </div>
            )}

            {/* Image */}
            {complaint.imageUrl && (
                <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="camera" size={12} color="var(--text-muted)" /> PHOTO EVIDENCE
                    </div>
                    <img src={complaint.imageUrl} alt="complaint" style={{ maxWidth: '100%', borderRadius: 12, maxHeight: 200, objectFit: 'cover' }} />
                </div>
            )}

            {/* Timeline */}
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>STATUS TIMELINE</div>
                <Timeline events={complaint.timeline || []} />
            </div>

            {/* Officer: Status Update + SLA */}
            {role === 'officer' && (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>UPDATE STATUS</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['PENDING', 'IN_PROGRESS', 'RESOLVED'].map(s => {
                                const colors = { PENDING: '#6b7280', IN_PROGRESS: '#3b82f6', RESOLVED: '#10b981' };
                                return (
                                    <button key={s} onClick={() => handleStatusUpdate(s)} style={{ flex: 1, padding: '10px 6px', border: `2px solid ${status === s ? colors[s] : 'var(--border)'}`, borderRadius: 10, background: status === s ? `${colors[s]}15` : 'var(--card)', color: status === s ? colors[s] : 'var(--text-muted)', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                                        {s.replace('_', ' ')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>SLA COUNTDOWN</div>
                            {isBreached && <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Icon name="alert" size={10} color="#ef4444" /> BREACHED
                            </span>}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {[['h', 'Hours'], ['m', 'Min'], ['s', 'Sec']].map(([k, u]) => (
                                <div key={k} style={{ flex: 1, background: 'var(--card)', borderRadius: 10, padding: 12, textAlign: 'center', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: isBreached ? '#ef4444' : complaint.priority === 'High' ? '#ef4444' : '#6366f1' }}>{String(slaTime[k]).padStart(2, '0')}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Citizen Rating */}
            {role === 'citizen' && complaint.status === 'RESOLVED' && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="star" size={14} color="#92400e" /> Rate this resolution
                    </div>
                    <RatingStars value={rating} onChange={handleRate} />
                </div>
            )}
        </div>
    );
}
