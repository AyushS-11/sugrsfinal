import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PAGE_BG = '#0a0e1a';
const GLASS = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, backdropFilter: 'blur(12px)' };
const LABEL = { fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6, letterSpacing: '.5px', textTransform: 'uppercase' };
const INPUT = {
    width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', fontSize: 14, fontWeight: 500,
    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
};

export default function Feedback() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ ticketId: '', rating: 0, comment: '', category: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!form.comment.trim()) return;
        setSubmitted(true);
        toast.success('Feedback submitted!');
    };

    if (submitted) return (
        <div style={{ minHeight: '100vh', background: PAGE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, #22c55e10 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', top: '15%', left: '10%', width: 350, height: 350, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)', animation: 'spin 28s linear infinite' }} />
            <div className="animate-fade" style={{ textAlign: 'center', padding: 40, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #22c55e, #4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 24px', boxShadow: '0 12px 40px #22c55e44' }}>💚</div>
                <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1.5px', color: 'white', marginBottom: 10 }}>Thank You!</h1>
                <p style={{ color: '#64748b', marginBottom: 32, fontSize: 15 }}>Your feedback helps us improve SUGRS for everyone.</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button onClick={() => navigate('/')} style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 24px #6366f144' }}>Back to Home</button>
                    <button onClick={() => { setSubmitted(false); setForm({ ticketId: '', rating: 0, comment: '', category: '' }); }} style={{ padding: '14px 28px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Submit Another</button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: "'DM Sans', sans-serif", color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, #22c55e08 0%, transparent 55%), radial-gradient(ellipse at 70% 50%, #6366f108 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.02)', animation: 'spin 25s linear infinite reverse' }} />

            {/* Header */}
            <div style={{ position: 'relative', zIndex: 2, padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div onClick={() => navigate('/')} style={{ width: 42, height: 42, borderRadius: 14, cursor: 'pointer', background: 'linear-gradient(135deg, #22c55e, #4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px #22c55e44' }}>
                        <Icon name="activity" size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: '-0.5px' }}>Submit Feedback</div>
                        <div style={{ fontSize: 12, color: '#475569' }}>Help us improve</div>
                    </div>
                </div>
                <button onClick={() => navigate('/')} style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
            </div>

            <div style={{ position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
                <div style={{ ...GLASS, padding: 32 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="activity" size={22} color="#10b981" />
                        </span>
                        <span style={{ background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Share Your Feedback</span>
                    </div>

                    {/* Ticket ID */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={LABEL}>TICKET ID (OPTIONAL)</label>
                        <input value={form.ticketId} onChange={e => setForm(f => ({ ...f, ticketId: e.target.value.toUpperCase() }))} placeholder="e.g. TKT-001" style={INPUT}
                            onFocus={e => e.target.style.borderColor = '#22c55e'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>

                    {/* Rating */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={LABEL}>OVERALL EXPERIENCE</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {[1, 2, 3, 4, 5].map(n => (
                                <button key={n} onClick={() => setForm(f => ({ ...f, rating: n }))} style={{
                                    width: 54, height: 54, borderRadius: 14,
                                    border: `2px solid ${form.rating >= n ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
                                    background: form.rating >= n ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)',
                                    fontSize: 24, cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: form.rating >= n ? '0 4px 16px #fbbf2433' : 'none',
                                    transform: form.rating >= n ? 'scale(1.05)' : 'scale(1)',
                                }}>
                                    {form.rating >= n ? '★' : '☆'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={LABEL}>FEEDBACK TYPE</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {['General', 'Service Quality', 'App Experience', 'Officer Conduct', 'Suggestion'].map(cat => (
                                <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))} style={{
                                    padding: '7px 16px', borderRadius: 20,
                                    border: `1.5px solid ${form.category === cat ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                                    background: form.category === cat ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
                                    color: form.category === cat ? '#4ade80' : '#94a3b8',
                                    fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                                }}>{cat}</button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div style={{ marginBottom: 28 }}>
                        <label style={LABEL}>YOUR FEEDBACK *</label>
                        <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="Tell us about your experience…" rows={5} style={{ ...INPUT, resize: 'vertical' }}
                            onFocus={e => e.target.style.borderColor = '#22c55e'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>

                    <button onClick={handleSubmit} disabled={!form.comment.trim()} style={{
                        width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                        background: form.comment.trim() ? 'linear-gradient(135deg, #22c55e, #4ade80)' : 'rgba(255,255,255,0.06)',
                        color: form.comment.trim() ? 'white' : '#475569',
                        fontWeight: 800, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit',
                        boxShadow: form.comment.trim() ? '0 8px 32px #22c55e44' : 'none', transition: 'all 0.2s',
                    }}>{submitting ? <><Icon name="loader" size={18} color="white" /> Submitting…</> : <><Icon name="send" size={18} color="white" /> Submit Feedback</>}</button>
                </div>
            </div>
        </div>
    );
}
