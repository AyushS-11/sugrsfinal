import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/index.jsx';
import ChatbotWidget from '../components/ChatbotWidget.jsx';
import { getCivicFeed, getCivicLeaderboard, upvoteCivic, volunteerCivic, resolveCivic, commentCivic, getPublicFeedback, getFeedbackStats, submitFeedback } from '../api/client.js';
import api from '../api/client.js';

const FEATURES = [
    { icon: 'file-text', title: 'File Complaint', desc: 'Submit civic issues with AI-powered auto-classification, voice input, and GPS location.', color: '#6366f1', link: '/file' },
    { icon: 'search', title: 'Track Complaint', desc: 'Real-time status tracking with timeline updates and live SLA countdown.', color: '#0ea5e9', link: '/track' },
    { icon: 'chart', title: 'Transparency Dashboard', desc: 'View live public analytics — resolution rates, department performance, and more.', color: '#8b5cf6', link: '/transparency' },
    { icon: 'bot', title: 'AI Assistant', desc: 'Intelligent chatbot powered by Gemini to help with queries and complaint routing.', color: '#10b981', link: '/assistant' },
    { icon: 'star', title: 'Citizen Feedback', desc: 'Rate your experience with resolved complaints and help improve civic services.', color: '#f59e0b', link: '/feedback' },
    { icon: 'map', title: 'Heatmap Visualization', desc: 'Interactive complaint heatmap showing issue density across geographic regions.', color: '#ec4899', link: '/map' },
];

const STATS = [
    { value: '2.4K+', label: 'Complaints Filed' },
    { value: '89%', label: 'Resolution Rate' },
    { value: '<24h', label: 'Avg Response Time' },
    { value: '15+', label: 'Departments' },
];

const CAT_COLORS = { Waste: '#f59e0b', Water: '#0ea5e9', Road: '#8b5cf6', Streetlight: '#f97316', Sanitation: '#10b981', General: '#6366f1' };
const CAT_ICONS = { Waste: 'trash', Water: 'droplets', Road: 'road', Streetlight: 'lightbulb', Sanitation: 'shower', General: 'clipboard' };
const RANK_ICONS = ['award', 'award', 'award', 'star', 'star'];

/* ── STAR component ─────────────────────────────────────────────────────── */
function Stars({ rating, size = 18, interactive = false, onRate }) {
    const [hover, setHover] = useState(0);
    return (
        <div style={{ display: 'flex', gap: 3 }}>
            {[1, 2, 3, 4, 5].map(n => (
                <span key={n}
                    onClick={() => interactive && onRate?.(n)}
                    onMouseEnter={() => interactive && setHover(n)}
                    onMouseLeave={() => interactive && setHover(0)}
                    style={{
                        cursor: interactive ? 'pointer' : 'default',
                        transition: 'transform .1s',
                        transform: interactive && n <= hover ? 'scale(1.2)' : 'scale(1)',
                        display: 'inline-block',
                    }}>
                    <Icon name="star" size={size} color={n <= (hover || rating) ? '#fbbf24' : '#374151'} />
                </span>
            ))}
        </div>
    );
}

/* ── FEEDBACK SECTION ───────────────────────────────────────────────────── */
function FeedbackSection() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState(null);
    const [ticketId, setTicketId] = useState('');
    const [complaintInfo, setComplaint] = useState(null);
    const [lookupErr, setLookupErr] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formErr, setFormErr] = useState('');
    const scrollRef = useRef();

    useEffect(() => {
        Promise.all([getPublicFeedback(), getFeedbackStats()])
            .then(([fr, sr]) => { setFeedbacks(fr.data || []); setStats(sr.data); })
            .catch(() => { });
    }, [submitted]);

    // CSS-based ticker for better performance
    const tickerAnim = `
        @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
    `;

    const lookupComplaint = async () => {
        if (!ticketId.trim()) return;
        setLookupLoading(true); setLookupErr(''); setComplaint(null); setRating(0);
        try {
            const r = await api.get(`/complaints/${ticketId.trim().toUpperCase()}`);
            if (r.data.status !== 'RESOLVED') {
                setLookupErr(`This complaint is ${r.data.status?.replace('_', ' ')} — feedback is only for resolved issues.`);
            } else {
                setComplaint(r.data);
            }
        } catch {
            setLookupErr('Complaint not found. Check the ticket ID.');
        }
        setLookupLoading(false);
    };

    const doSubmit = async () => {
        if (!complaintInfo || rating === 0) { setFormErr('Please select a rating.'); return; }
        setSubmitting(true); setFormErr('');
        try {
            await submitFeedback({ complaintId: complaintInfo.id, rating, comment, citizenName: name || 'Anonymous Citizen' });
            setSubmitted(true);
            setTimeout(() => { setSubmitted(false); setComplaint(null); setTicketId(''); setRating(0); setComment(''); setName(''); }, 3500);
        } catch (e) {
            setFormErr(e.response?.data?.error || 'Submission failed. Try again.');
        }
        setSubmitting(false);
    };

    const doubled = [...feedbacks, ...feedbacks]; // infinite scroll duplicate

    return (
        <section style={{ padding: '80px 40px', background: 'linear-gradient(180deg, rgba(99,102,241,0.03) 0%, rgba(139,92,246,0.06) 100%)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', padding: '6px 18px', borderRadius: 20, marginBottom: 16 }}>
                        <Icon name="star" size={14} color="#fbbf24" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', letterSpacing: '.5px', textTransform: 'uppercase' }}>Citizen Reviews</span>
                    </div>
                    <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-1px', marginBottom: 10 }}>What Citizens Are Saying</h2>
                    <p style={{ color: '#475569', fontSize: 15 }}>Real feedback from resolved civic complaints — your voice shapes better governance.</p>
                </div>

                {/* Aggregate stats */}
                {stats && stats.total > 0 && (
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 48, fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>{stats.avg}</div>
                            <Stars rating={Math.round(stats.avg)} size={16} />
                            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{stats.total} ratings</div>
                        </div>
                        <div style={{ display: 'grid', gap: 4, flex: '0 0 200px' }}>
                            {[5, 4, 3, 2, 1].map(r => (
                                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 11, color: '#64748b', minWidth: 8 }}>{r}</span>
                                    <Icon name="star" size={12} color="#fbbf24" />
                                    <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${stats.total ? (stats.dist[r - 1] / stats.total) * 100 : 0}%`, background: r >= 4 ? '#10b981' : r === 3 ? '#f59e0b' : '#ef4444', borderRadius: 10, transition: 'width .6s' }} />
                                    </div>
                                    <span style={{ fontSize: 10, color: '#475569', minWidth: 18 }}>{stats.dist[r - 1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Scrolling reviews ticker */}
                <style>{tickerAnim}</style>
                {feedbacks.length > 0 ? (
                    <div style={{ overflow: 'hidden', marginBottom: 48 }}>
                        <div style={{
                            display: 'flex', gap: 16, width: 'max-content',
                            animation: 'ticker 40s linear infinite',
                            paddingBottom: 6
                        }}
                            onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
                            onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}>
                            {doubled.map((f, i) => (
                                <div key={i} style={{ flexShrink: 0, width: 280, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <Stars rating={f.rating} size={14} />
                                        <span style={{ fontSize: 10, color: '#475569' }}>{f.complaintCategory || ''}</span>
                                    </div>
                                    {f.comment && <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, marginBottom: 10, fontStyle: 'italic' }}>"{f.comment.slice(0, 110)}{f.comment.length > 110 ? '…' : ''}"</p>}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{f.citizenName}</div>
                                        <div style={{ fontSize: 10, color: '#374151' }}>{f.complaintId}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#374151', fontSize: 13, marginBottom: 40, padding: '20px 0' }}>No public reviews yet — be the first!</div>
                )}

                {/* Submit feedback form */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
                    <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="file-text" size={18} color="#6366f1" /> Share Your Experience
                    </div>
                    <p style={{ color: '#475569', fontSize: 13, marginBottom: 24 }}>Rate the resolution of your complaint after it's been marked Resolved.</p>

                    {submitted ? (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <div style={{ width: 60, height: 60, borderRadius: 20, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <Icon name="check" size={32} color="#10b981" />
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 18, color: '#10b981' }}>Thank you for your feedback!</div>
                            <div style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>Your review helps improve civic services.</div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 16 }}>
                            {/* Ticket lookup */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
                                <input
                                    value={ticketId}
                                    onChange={e => { setTicketId(e.target.value.toUpperCase()); setComplaint(null); setLookupErr(''); }}
                                    onKeyDown={e => e.key === 'Enter' && lookupComplaint()}
                                    placeholder="Enter your Ticket ID (e.g. TKT-4509)"
                                    style={{ padding: '12px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                                />
                                <button onClick={lookupComplaint} disabled={lookupLoading || !ticketId.trim()} style={{ padding: '12px 22px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', opacity: !ticketId.trim() ? 0.5 : 1 }}>
                                    {lookupLoading ? '…' : 'Find'}
                                </button>
                            </div>

                            {lookupErr && <div style={{ color: '#f87171', fontSize: 13, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)' }}><Icon name="alert" size={14} color="#f87171" /> {lookupErr}</div>}

                            {/* Complaint found */}
                            {complaintInfo && (
                                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}><Icon name="check" size={14} color="#10b981" /> {complaintInfo.title}</div>
                                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.15)', padding: '2px 10px', borderRadius: 20 }}>RESOLVED</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#475569' }}>{complaintInfo.category} · {complaintInfo.address?.slice(0, 60)}</div>
                                </div>
                            )}

                            {/* Rating & comment */}
                            {complaintInfo && (
                                <>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 10 }}>YOUR RATING *</div>
                                        <Stars rating={rating} size={32} interactive onRate={setRating} />
                                        {rating > 0 && <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{['', '😤 Very Dissatisfied', '😕 Dissatisfied', '😐 Neutral', '😊 Satisfied', '🤩 Very Satisfied'][rating]}</div>}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)"
                                            style={{ padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                                        <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Comment (optional)"
                                            style={{ padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <button onClick={doSubmit} disabled={submitting || rating === 0} style={{ padding: '13px 0', borderRadius: 12, border: 'none', background: rating > 0 ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(255,255,255,0.08)', color: rating > 0 ? 'white' : '#475569', fontWeight: 800, fontSize: 14, cursor: rating > 0 ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <Icon name="star" size={16} color={rating > 0 ? 'white' : '#475569'} /> {submitting ? 'Submitting…' : 'Submit Feedback'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

// ─── CIVIC COMMUNITY SECTION COMPONENT ─────────────────────────────────
function CivicCommunityHub() {
    const [feed, setFeed] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState(null);
    const [commentText, setCommentText] = useState({});
    const [actionDone, setActionDone] = useState({});
    const [toast, setToast] = useState(null);

    // Anonymous citizen ID stored in localStorage
    const [anonId] = useState(() => {
        let id = localStorage.getItem('sugrs_civic_id');
        if (!id) { id = 'ANON-' + Math.random().toString(36).substr(2, 8).toUpperCase(); localStorage.setItem('sugrs_civic_id', id); }
        return id;
    });
    const anonName = 'Anonymous Citizen';

    const showToast = (msg, pts) => {
        setToast({ msg, pts });
        setTimeout(() => setToast(null), 2500);
    };

    const refresh = async () => {
        try {
            const [feedRes, lbRes] = await Promise.all([getCivicFeed(), getCivicLeaderboard()]);
            setFeed(feedRes.data || []);
            setLeaderboard(lbRes.data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { refresh(); }, []);

    const doAction = async (type, id, pts) => {
        const key = `${id}_${type}`;
        if (actionDone[key]) return;

        // Optimistic UI update
        setActionDone(prev => ({ ...prev, [key]: true }));
        setFeed(prev => prev.map(c => {
            if (c.id !== id) return c;
            if (type === 'upvote') return { ...c, upvoteCount: (c.upvoteCount || 0) + 1 };
            if (type === 'volunteer') return { ...c, civicVolunteers: [...(c.civicVolunteers || []), { citizenId: anonId }] };
            if (type === 'resolve') return { ...c, civicResolvedBy: anonId };
            return c;
        }));

        try {
            if (type === 'upvote') await upvoteCivic(id, anonId);
            else if (type === 'volunteer') await volunteerCivic(id, anonId, anonName);
            else if (type === 'resolve') await resolveCivic(id, anonId, anonName);
            showToast(`${pts} Civic Points earned!`, pts);
            // Non-blocking refresh for source of truth
            refresh();
        } catch {
            showToast('Action failed or already performed!', 0);
            refresh(); // Rollback if needed
        }
    };

    const doComment = async (id) => {
        const text = (commentText[id] || '').trim();
        if (!text) return;

        // Optimistic UI update
        const tempId = 'temp-' + Date.now();
        setFeed(prev => prev.map(c => {
            if (c.id !== id) return c;
            return {
                ...c,
                civicComments: [...(c.civicComments || []), { id: tempId, citizenName: anonName, text, createdAt: new Date().toISOString() }]
            };
        }));
        setCommentText(prev => ({ ...prev, [id]: '' }));

        try {
            await commentCivic(id, anonId, anonName, text);
            showToast('2 Civic Points for your tip!', 2);
            refresh();
        } catch {
            showToast('Failed to post tip.', 0);
            refresh();
        }
    };

    const top = leaderboard[0];

    return (
        <section style={{ padding: '80px 40px', maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
                    background: toast.pts > 0 ? 'linear-gradient(135deg,#10b981,#34d399)' : 'rgba(30,41,59,0.95)',
                    color: 'white', padding: '14px 22px', borderRadius: 16, fontWeight: 700, fontSize: 14,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.4)', animation: 'fadeInUp 0.3s ease',
                    display: 'flex', alignItems: 'center', gap: 10
                }}>
                    <Icon name={toast.pts > 0 ? "sparkles" : "alert"} size={18} color="white" /> {toast.msg}
                </div>
            )}

            {/* Section Header */}
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981', letterSpacing: '2px', marginBottom: 12, textTransform: 'uppercase' }}>Citizen Community</div>
                <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 14 }}>
                    Citizens Helping{' '}
                    <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Citizens</span>
                </h2>
                <p style={{ color: '#475569', fontSize: 15, maxWidth: 520, margin: '0 auto' }}>
                    Volunteer to help, leave tips, or mark issues as resolved. Earn <strong style={{ color: '#10b981' }}>Civic Points</strong> and climb the leaderboard!
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 28, alignItems: 'start' }}>

                {/* ─── LEFT: LEADERBOARD ─── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Hero Greeting */}
                    {top && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.06))',
                            border: '1px solid rgba(16,185,129,0.3)', borderRadius: 22, padding: 22, textAlign: 'center',
                        }}>
                            <div style={{ width: 60, height: 60, borderRadius: 20, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                <Icon name="award" size={32} color="#10b981" />
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#10b981', letterSpacing: '1.5px', marginBottom: 6 }}>COMMUNITY HERO</div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: 'white', marginBottom: 4 }}>{top.name}</div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: 'rgba(16,185,129,0.15)', borderRadius: 20, padding: '5px 16px', marginTop: 4,
                            }}>
                                <Icon name="star" size={14} color="#34d399" />
                                <span style={{ fontSize: 16, fontWeight: 900, color: '#34d399' }}>{top.points}</span>
                                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Civic Points</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#475569', marginTop: 10, lineHeight: 1.5 }}>
                                Thank you for making our city better!
                            </div>
                        </div>
                    )}

                    {/* Leaderboard Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 20, padding: 20,
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', marginBottom: 16 }}>🏆 TOP CIVIC CONTRIBUTORS</div>
                        {loading ? (
                            <div style={{ color: '#334155', fontSize: 13, textAlign: 'center', padding: 20 }}>Loading...</div>
                        ) : leaderboard.length === 0 ? (
                            <div style={{ color: '#334155', fontSize: 13, textAlign: 'center', padding: 20 }}>Be the first to earn Civic Points!</div>
                        ) : leaderboard.map((c, i) => (
                            <div key={c.citizenId} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                                borderRadius: 12, marginBottom: 6,
                                background: i === 0 ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                                border: i === 0 ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                                transition: 'all 0.2s',
                            }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: i < 3 ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon name={RANK_ICONS[i] || 'star'} size={14} color={i === 0 ? '#10b981' : '#64748b'} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? '#34d399' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                                    <div style={{ fontSize: 10, color: '#475569' }}>Rank #{i + 1}</div>
                                </div>
                                <div style={{
                                    fontSize: 13, fontWeight: 900, color: '#10b981',
                                    background: 'rgba(16,185,129,0.12)', borderRadius: 8, padding: '4px 10px', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', gap: 4
                                }}>
                                    <Icon name="star" size={12} color="#10b981" /> {c.points}
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: 16, padding: '12px', background: 'rgba(99,102,241,0.06)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.15)' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', marginBottom: 8 }}>💡 How to Earn Points</div>
                            {[['🙋 Volunteer to help', '+3'], ['✅ Citizen resolve', '+10'], ['💬 Post a tip', '+2'], ['👍 Upvote issue', '+1']].map(([a, p]) => (
                                <div key={a} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                                    <span>{a}</span><span style={{ color: '#10b981', fontWeight: 700 }}>{p}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── RIGHT: FEED ─── */}
                <div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 60, color: '#334155', fontSize: 15 }}>Loading community feed...</div>
                    ) : feed.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 60, color: '#334155', fontSize: 15 }}>No active complaints in the community feed yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxHeight: 680, overflowY: 'auto', paddingRight: 4 }}>
                            {feed.slice(0, 8).map(c => {
                                const catColor = CAT_COLORS[c.category] || '#6366f1';
                                const isExpanded = expandedCard === c.id;
                                return (
                                    <div key={c.id} style={{
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                        borderRadius: 20, padding: 22, transition: 'border-color 0.2s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = catColor + '44'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                                    >
                                        {/* Card Header */}
                                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 13, background: catColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                                                <Icon name={CAT_ICONS[c.category] || 'clipboard'} size={20} color={catColor} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                                    <span style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                                                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: catColor + '18', color: catColor, flexShrink: 0 }}>{c.category}</span>
                                                </div>
                                                <div style={{ fontSize: 11, color: '#475569', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                                    <span><Icon name="map-pin" size={10} color="#475569" /> {c.address || 'Location not set'}</span>
                                                    <span><Icon name="user" size={10} color="#475569" /> {c.citizenName}</span>
                                                    <span><Icon name="calendar" size={10} color="#475569" /> {c.createdAt}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {c.description}
                                        </p>

                                        {/* Status Badges */}
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                                            {c.civicResolvedBy && (
                                                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Icon name="check" size={10} color="#34d399" /> Citizen Resolved
                                                </span>
                                            )}
                                            {c.civicVolunteers && c.civicVolunteers.length > 0 && (
                                                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Icon name="users" size={10} color="#a5b4fc" /> {c.civicVolunteers.length} Volunteer{c.civicVolunteers.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {c.civicComments && c.civicComments.length > 0 && (
                                                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Icon name="chat" size={10} color="#fbbf24" /> {c.civicComments.length} Tip{c.civicComments.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: isExpanded ? 16 : 0 }}>
                                            {[
                                                { type: 'upvote', label: `Upvote (${c.upvoteCount || 0})`, pts: 1, color: '#6366f1', icon: 'thumbs-up' },
                                                { type: 'volunteer', label: 'Volunteer', pts: 3, color: '#8b5cf6', icon: 'user-plus' },
                                                { type: 'resolve', label: 'I Fixed This', pts: 10, color: '#10b981', icon: 'check-circle' },
                                            ].map(({ type, label, pts, color, icon }) => {
                                                const key = `${c.id}_${type}`;
                                                const done = !!actionDone[key];
                                                return (
                                                    <button key={type} onClick={() => doAction(type, c.id, pts)} disabled={done} style={{
                                                        padding: '7px 14px', borderRadius: 10, border: `1px solid ${done ? 'rgba(255,255,255,0.05)' : color + '44'}`,
                                                        background: done ? 'rgba(255,255,255,0.03)' : color + '12',
                                                        color: done ? '#334155' : color, fontSize: 11, fontWeight: 700,
                                                        cursor: done ? 'default' : 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                                                        display: 'flex', alignItems: 'center', gap: 4
                                                    }}>
                                                        <Icon name={done ? 'check' : icon} size={12} color={done ? '#334155' : color} /> {done ? 'Done' : label}
                                                    </button>
                                                );
                                            })}
                                            <button onClick={() => setExpandedCard(isExpanded ? null : c.id)} style={{
                                                padding: '7px 14px', borderRadius: 10, border: `1px solid ${isExpanded ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                                background: isExpanded ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
                                                color: isExpanded ? '#fbbf24' : '#64748b', fontSize: 11, fontWeight: 700,
                                                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                                                display: 'flex', alignItems: 'center', gap: 6
                                            }}>
                                                <Icon name="chat" size={12} color={isExpanded ? '#fbbf24' : '#64748b'} /> Tips {isExpanded ? '▲' : '▼'}
                                            </button>
                                        </div>

                                        {/* Expanded Tips Section */}
                                        {isExpanded && (
                                            <div style={{ marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                                                {/* Existing comments */}
                                                {c.civicComments && c.civicComments.length > 0 && (
                                                    <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        {c.civicComments.map(cm => (
                                                            <div key={cm.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <div style={{ fontSize: 11, color: '#475569', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                    <Icon name="user" size={10} color="#475569" /> {cm.citizenName} • {new Date(cm.createdAt).toLocaleDateString()}
                                                                </div>
                                                                <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{cm.text}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {/* New comment */}
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <input
                                                        value={commentText[c.id] || ''}
                                                        onChange={e => setCommentText(prev => ({ ...prev, [c.id]: e.target.value }))}
                                                        onKeyDown={e => e.key === 'Enter' && doComment(c.id)}
                                                        placeholder="Share a tip or solution..."
                                                        style={{
                                                            flex: 1, padding: '9px 14px', borderRadius: 10,
                                                            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
                                                            color: '#e2e8f0', fontSize: 12, outline: 'none', fontFamily: 'inherit',
                                                        }}
                                                    />
                                                    <button onClick={() => doComment(c.id)} style={{
                                                        padding: '9px 16px', borderRadius: 10, border: 'none',
                                                        background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                                                        color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                                                        display: 'flex', alignItems: 'center', gap: 6
                                                    }}>
                                                        <Icon name="sparkles" size={12} color="white" /> Post
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: 'white', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
            {/* Navbar */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                background: scrolled ? 'rgba(10,14,26,0.92)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
                transition: 'all 0.3s ease', padding: '0 40px', height: 70,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 20px #6366f144'
                    }}>
                        <Icon name="home" size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.5px' }}>SUGRS</div>
                        <div style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.5px' }}>Grievance Redressal</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => navigate('/officer/login')} style={{
                        padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                        background: 'transparent', color: '#94a3b8', fontWeight: 600, fontSize: 13,
                        cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#94a3b8'; }}
                    >Officer Login</button>
                    <button onClick={() => navigate('/supervisor/login')} style={{
                        padding: '8px 18px', borderRadius: 10, border: 'none',
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        transition: 'all 0.2s', fontFamily: 'inherit',
                        boxShadow: '0 4px 16px #6366f144',
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >Supervisor Login</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden', padding: '100px 40px 60px',
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 40%, #6366f115 0%, transparent 55%), radial-gradient(ellipse at 75% 60%, #8b5cf615 0%, transparent 55%), radial-gradient(ellipse at 50% 20%, #0ea5e910 0%, transparent 50%)' }} />
                <div style={{ position: 'absolute', top: '10%', left: '5%', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)', animation: 'spin 30s linear infinite' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)', animation: 'spin 22s linear infinite reverse' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.02)', animation: 'spin 40s linear infinite' }} />

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 860 }}>
                    <div className="animate-fade" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: 50, padding: '6px 18px 6px 8px', marginBottom: 28,
                    }}>
                        <span style={{ background: '#6366f1', color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>NEW</span>
                        <span style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 500 }}>AI-Powered Grievance Resolution</span>
                    </div>

                    <h1 className="animate-fade" style={{
                        fontSize: 'clamp(36px, 5.5vw, 68px)', fontWeight: 900, lineHeight: 1.08,
                        letterSpacing: '-2.5px', marginBottom: 24,
                        background: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 40%, #818cf8 70%, #6366f1 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Smart Unified Grievance<br />Redressal System
                    </h1>

                    <p className="animate-fade" style={{
                        fontSize: 'clamp(15px, 1.5vw, 19px)', color: '#64748b', lineHeight: 1.7,
                        maxWidth: 600, margin: '0 auto 40px', fontWeight: 400,
                    }}>
                        A transparent, AI-driven platform for fast civic grievance resolution.
                        File complaints, track progress in real-time, and hold departments accountable —
                        all without needing to create an account.
                    </p>

                    <div className="animate-fade" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
                        <button onClick={() => navigate('/file')} style={{
                            padding: '16px 36px', borderRadius: 14, border: 'none',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer',
                            boxShadow: '0 8px 32px #6366f155', transition: 'all 0.2s', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', gap: 8
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 40px #6366f166'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px #6366f155'; }}
                        >
                            <Icon name="file-text" size={18} color="white" /> File Complaint
                        </button>
                        <button onClick={() => navigate('/track')} style={{
                            padding: '16px 36px', borderRadius: 14,
                            border: '1.5px solid rgba(255,255,255,0.12)',
                            background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)',
                            color: 'white', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                            transition: 'all 0.2s', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', gap: 8
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <Icon name="search" size={18} color="white" /> Track Complaint
                        </button>
                    </div>

                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2,
                        background: 'rgba(255,255,255,0.04)', borderRadius: 18,
                        border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
                    }}>
                        {STATS.map((stat, i) => (
                            <div key={i} style={{
                                padding: '24px 16px', textAlign: 'center',
                                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                            }}>
                                <div style={{ fontSize: 28, fontWeight: 900, color: '#a5b4fc', marginBottom: 4 }}>{stat.value}</div>
                                <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: '80px 40px 100px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#6366f1', letterSpacing: '2px', marginBottom: 12, textTransform: 'uppercase' }}>Features</div>
                    <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 16 }}>
                        Everything you need for<br />
                        <span style={{ background: 'linear-gradient(135deg, #6366f1, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>efficient grievance resolution</span>
                    </h2>
                    <p style={{ color: '#475569', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>Powerful tools designed for citizens, officers, and administrators to manage civic issues effectively.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                    {FEATURES.map((f, i) => (
                        <div key={i} onClick={() => navigate(f.link)} style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 20, padding: 30, cursor: 'pointer',
                            transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + '55'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${f.color}15`; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: f.color + '08' }} />
                            <div style={{
                                width: 52, height: 52, borderRadius: 14,
                                background: f.color + '18', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: 26, marginBottom: 18,
                            }}><Icon name={f.icon} size={24} color={f.color} /></div>
                            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'white' }}>{f.title}</div>
                            <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Civic Community Hub ─── */}
            <div style={{ background: 'rgba(16,185,129,0.03)', borderTop: '1px solid rgba(16,185,129,0.08)', borderBottom: '1px solid rgba(16,185,129,0.08)' }}>
                <CivicCommunityHub />
            </div>

            {/* ─── Citizen Feedback Section ─── */}
            <FeedbackSection />

            {/* CTA Section */}
            <section style={{
                padding: '80px 40px', textAlign: 'center',
                background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.06) 100%)',
            }}>
                <div style={{ maxWidth: 580, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', marginBottom: 16 }}>Ready to raise your voice?</h2>
                    <p style={{ color: '#475569', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
                        No account needed. File a civic complaint in under 2 minutes and let AI route it to the right department.
                    </p>
                    <button onClick={() => navigate('/file')} style={{
                        padding: '16px 40px', borderRadius: 14, border: 'none',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer',
                        boxShadow: '0 8px 32px #6366f155', transition: 'all 0.2s', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    ><Icon name="file-text" size={18} color="white" /> Get Started — File a Complaint</button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '30px 40px', borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                color: '#334155', fontSize: 13,
            }}>
                <div>© 2025 SUGRS — Smart Unified Grievance Redressal System</div>
                <div style={{ display: 'flex', gap: 24 }}>
                    <span onClick={() => navigate('/transparency')} style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                        onMouseLeave={e => e.currentTarget.style.color = '#334155'}>Transparency</span>
                    <span onClick={() => navigate('/reports')} style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                        onMouseLeave={e => e.currentTarget.style.color = '#334155'}>Reports</span>
                    <span onClick={() => navigate('/map')} style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                        onMouseLeave={e => e.currentTarget.style.color = '#334155'}>Map</span>
                </div>
            </footer>

            {/* Floating AI Chatbot Widget */}
            <ChatbotWidget />
        </div>
    );
}

