import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getComplaint } from '../../api/client.js';
import { StatusBadge, PriorityBadge, CategoryBadge, Timeline, Icon } from '../../components/index.jsx';
import toast from 'react-hot-toast';

const PAGE_BG = '#0a0e1a';
const GLASS = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, backdropFilter: 'blur(12px)' };
const INPUT = { width: '100%', padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 14, outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit' };

export default function TrackComplaint() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [ticketId, setTicketId] = useState(searchParams.get('id') || '');
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) { setTicketId(id); handleTrack(id); }
    }, [searchParams]);

    const handleTrack = async (id) => {
        const queryId = id || ticketId;
        if (!queryId.trim()) return;
        setLoading(true); setSearched(true);
        try { const res = await getComplaint(queryId.trim()); setComplaint(res.data); }
        catch { setComplaint(null); toast.error('Complaint not found.'); }
        finally { setLoading(false); }
    };

    const statusSteps = [
        { label: 'SUBMITTED', icon: 'file-text' },
        { label: 'AUTO_ANALYSIS', icon: 'bot' },
        { label: 'ASSIGNED', icon: 'user' },
        { label: 'IN_PROGRESS', icon: 'trending' },
        { label: 'RESOLVED', icon: 'check' },
    ];
    const activeIdx = complaint ? statusSteps.findIndex(step => step.label === complaint.status) : -1;

    return (
        <div style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: "'DM Sans', sans-serif", color: 'white', position: 'relative', overflow: 'hidden' }}>
            {/* Background */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 30%, #0ea5e910 0%, transparent 55%), radial-gradient(ellipse at 70% 70%, #6366f110 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', bottom: '5%', left: '3%', width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)', animation: 'spin 28s linear infinite' }} />
            <div style={{ position: 'absolute', top: '10%', right: '5%', width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)', animation: 'spin 20s linear infinite reverse' }} />

            {/* Header */}
            <div style={{ position: 'relative', zIndex: 2, padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div onClick={() => navigate('/')} style={{ width: 42, height: 42, borderRadius: 14, cursor: 'pointer', background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px #0ea5e944' }}>
                        <Icon name="search" size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: '-0.5px' }}>Track Complaint</div>
                        <div style={{ fontSize: 12, color: '#475569' }}>Real-time status updates</div>
                    </div>
                </div>
                <button onClick={() => navigate('/')} style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
            </div>

            <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
                {/* Search */}
                <div style={{ ...GLASS, padding: 28, marginBottom: 28 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="search" size={16} color="white" />
                        </span>
                        Enter Complaint ID
                    </div>
                    <div style={{ position: 'relative', display: 'flex', gap: 12 }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }}>
                                <Icon name="search" size={18} />
                            </div>
                            <input
                                value={ticketId}
                                onChange={e => setTicketId(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleTrack()}
                                placeholder="Enter Ticket ID (e.g. TICK-1234)"
                                style={{ ...INPUT, paddingLeft: 44 }}
                                onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                        <button
                            onClick={() => handleTrack()}
                            disabled={loading || !ticketId.trim()}
                            style={{
                                padding: '0 24px', borderRadius: 14, border: 'none',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                                boxShadow: '0 8px 24px #6366f133'
                            }}
                        >
                            {loading ? 'Searching…' : <><Icon name="search" size={16} color="white" /> Track</>}
                        </button>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: 50 }}>
                        <div style={{ width: 50, height: 50, border: '3px solid #0ea5e9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                        <div style={{ color: '#64748b', fontWeight: 600, fontSize: 15 }}>Looking up complaint…</div>
                    </div>
                )}

                {/* Not found */}
                {!loading && searched && !complaint && (
                    <div className="animate-fade" style={{ ...GLASS, padding: 50, textAlign: 'center' }}>
                        <div style={{ marginBottom: 16 }}>
                            <Icon name="search" size={56} color="#475569" />
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 10 }}>Complaint Not Found</div>
                        <div style={{ color: '#475569', fontSize: 15 }}>Please check the ticket ID and try again.</div>
                    </div>
                )}

                {/* Result */}
                {!loading && complaint && (
                    <div className="animate-fade" style={{ display: 'grid', gap: 20 }}>
                        {/* Status Progress */}
                        <div style={{ ...GLASS, padding: 28 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Icon name="activity" size={18} color="#94a3b8" /> Status Progress
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', margin: '0 24px 16px' }}>
                                {/* Track line */}
                                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.06)', transform: 'translateY(-50%)', borderRadius: 4 }} />
                                <div style={{ position: 'absolute', top: '50%', left: 0, height: 4, background: 'linear-gradient(90deg, #8b5cf6, #0ea5e9, #10b981)', transform: 'translateY(-50%)', width: `${Math.max(0, activeIdx / (statusSteps.length - 1)) * 100}%`, transition: 'width 0.8s ease', borderRadius: 4 }} />
                                {statusSteps.map((s, i) => {
                                    const isActive = activeIdx >= i;
                                    return (
                                        <div key={i} style={{ flex: 1, position: 'relative', textAlign: 'center' }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: '50%',
                                                background: isActive ? 'linear-gradient(135deg, #10b981, #34d399)' : 'rgba(255,255,255,0.05)',
                                                border: `2px solid ${isActive ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                margin: '0 auto 10px', position: 'relative', zIndex: 1,
                                                boxShadow: isActive ? '0 0 20px rgba(16,185,129,0.2)' : 'none',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}>
                                                <Icon name={isActive ? "check" : s.icon} size={18} color={isActive ? "white" : "#475569"} />
                                            </div>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: isActive ? '#e2e8f0' : '#475569', marginTop: 8, whiteSpace: 'nowrap', letterSpacing: '.3px' }}>{s.label.replace('_', ' ')}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Complaint Info */}
                        <div style={{ ...GLASS, padding: 28 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '2px 10px', borderRadius: 20 }}>TICKET #{complaint.id}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 10px', borderRadius: 20 }}>{complaint.status.replace('_', ' ')}</span>
                                    </div>
                                    <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>{complaint.title}</h2>
                                </div>
                            </div>
                            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.8, marginBottom: 18 }}>{complaint.description}</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, marginBottom: 4 }}>CATEGORY</div>
                                    <div style={{ fontSize: 13, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Icon name="clipboard" size={14} color="#6366f1" /> {complaint.category}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, marginBottom: 4 }}>LOCATION</div>
                                    <div style={{ fontSize: 13, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <Icon name="map-pin" size={14} color="#6366f1" /> {complaint.address || 'Global'}
                                    </div>
                                </div>
                                {complaint.assignedTo && (
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 4, letterSpacing: '.5px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Icon name="user" size={10} color="#475569" /> ASSIGNED TO
                                        </div>
                                        <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 700 }}>{complaint.assignedTo}</div>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'grid', gap: 12 }}>
                                <div style={{ padding: 16, borderRadius: 14, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Icon name="lightbulb" size={18} color="#60a5fa" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 13, color: '#60a5fa', marginBottom: 4 }}>RESOLUTION TIP</div>
                                        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>Most {complaint.category} issues are resolved within 48 hours of assignment. You can check the department details for more precise SLAs.</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div style={{ ...GLASS, padding: 28 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Icon name="clock" size={18} color="#94a3b8" /> Status Timeline
                            </div>
                            <Timeline events={complaint.timeline || []} />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => navigate('/file')} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#e2e8f0'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8'; }}
                            >📝 File New Complaint</button>
                            <button onClick={() => navigate('/feedback')} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#e2e8f0'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8'; }}
                            ><Icon name="activity" size={14} color="white" /> Submit Feedback</button>
                        </div>
                    </div>
                )}

                {/* Tips (when no search) */}
                {!searched && (
                    <div className="animate-fade" style={{ ...GLASS, padding: 28 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Icon name="search" size={18} color="#6366f1" /> Quick Tips
                        </div>
                        <div style={{ display: 'grid', gap: 10 }}>
                            {[
                                { icon: 'clipboard', text: 'Your ticket ID was given when you filed the complaint (e.g., TKT-001)' },
                                { icon: 'chat', text: 'Check your email or SMS for the ticket reference number' },
                                { icon: 'activity', text: 'Status updates are real-time — check back anytime for live progress' },
                            ].map((tip, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ flexShrink: 0 }}>
                                        <Icon name={tip.icon} size={20} color="#6366f1" />
                                    </span>
                                    <span style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{tip.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
