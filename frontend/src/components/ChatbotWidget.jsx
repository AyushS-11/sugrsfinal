import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAI } from '../api/client.js';
import { Icon } from '../components/index.jsx';

const GLASS = { background: 'rgba(15,20,40,0.96)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, backdropFilter: 'blur(20px)' };
const EMPTY_FIELDS = { title: '', description: '', category: '', subcategory: '', location_text: '', severity: '', citizen_phone: '', citizen_email: '' };

const QUICK_PROMPTS = [
    { label: 'Road issue', msg: 'There is a pothole on the road near my area.', icon: 'road' },
    { label: 'Water problem', msg: 'No water supply in my area for 2 days.', icon: 'droplets' },
    { label: 'Garbage', msg: 'Garbage has not been collected for a week.', icon: 'trash' },
    { label: 'Feedback', msg: 'I want to share my feedback on a resolved complaint.', icon: 'star' },
];

export default function ChatbotWidget() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([{
        role: 'assistant',
        content: 'Namaste! I\'m the SUGRS AI Assistant.\n\nTell me your civic issue and I\'ll help you file a complaint — in any language!',
    }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [extractedFields, setExtractedFields] = useState({ ...EMPTY_FIELDS });
    const [readyToSubmit, setReadyToSubmit] = useState(false);
    const [hasNewMsg, setHasNewMsg] = useState(false);
    const bottomRef = useRef();
    const inputRef = useRef();

    // Pulse notification when closed
    useEffect(() => {
        if (!open && messages.length > 1) setHasNewMsg(true);
    }, [messages]);

    useEffect(() => {
        if (open) { setHasNewMsg(false); bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }
    }, [open, messages, loading]);

    const send = async (overrideMsg) => {
        const msg = (overrideMsg || input).trim();
        if (!msg || loading) return;
        const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setInput('');
        setLoading(true);
        try {
            const res = await chatAI(msg, history, {}, extractedFields);
            const data = res.data;
            if (data.extracted_fields) {
                setExtractedFields(prev => {
                    const merged = { ...prev };
                    for (const [k, v] of Object.entries(data.extracted_fields)) {
                        if (v && v.trim()) merged[k] = v.trim();
                    }
                    return merged;
                });
            }
            if (data.ready_to_submit) setReadyToSubmit(true);
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply || "I'm here to help!" }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Could not connect to AI. Please try again.' }]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <div
                onClick={() => setOpen(o => !o)}
                style={{
                    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
                    width: 60, height: 60, borderRadius: 20, cursor: 'pointer',
                    background: open ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #34d399)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, boxShadow: open ? '0 8px 32px #ef444455' : '0 8px 32px #10b98155',
                    transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
                    transform: open ? 'rotate(0deg)' : 'rotate(0deg)',
                }}
                title="Chat with SUGRS AI"
            >
                {open ? <Icon name="x" size={24} color="white" /> : <Icon name="bot" size={32} color="white" />}
                {/* Notification dot */}
                {hasNewMsg && !open && (
                    <div style={{
                        position: 'absolute', top: -4, right: -4, width: 14, height: 14,
                        borderRadius: '50%', background: '#ef4444', border: '2px solid #0a0e1a',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                )}
            </div>

            {/* Chat Panel */}
            <div style={{
                position: 'fixed', bottom: 100, right: 28, zIndex: 9998,
                width: 380, height: 560,
                ...GLASS,
                display: 'flex', flexDirection: 'column',
                transform: open ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(20px)',
                opacity: open ? 1 : 0,
                pointerEvents: open ? 'all' : 'none',
                transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
                transformOrigin: 'bottom right',
                overflow: 'hidden',
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                color: 'white',
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(52,211,153,0.06))',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px #10b98133' }}>
                            <Icon name="bot" size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 14 }}>SUGRS AI Assistant</div>
                            <div style={{ fontSize: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                Online • Multilingual
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/assistant')}
                        style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#94a3b8'; }}
                    >
                        Full View <Icon name="trending" size={10} />
                    </button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {messages.map((m, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                            {m.role === 'assistant' && (
                                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px #10b98133' }}>
                                    <Icon name="bot" size={14} color="white" />
                                </div>
                            )}
                            <div style={{
                                maxWidth: '80%', padding: '10px 14px', fontSize: 13, lineHeight: 1.65, fontWeight: 500, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                ...(m.role === 'user' ? {
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: 'white', boxShadow: '0 4px 16px #6366f133',
                                } : {
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                                    color: '#e2e8f0',
                                }),
                            }}>{m.content}</div>
                        </div>
                    ))}

                    {loading && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                            <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon name="bot" size={14} color="white" />
                            </div>
                            <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 4, alignItems: 'center' }}>
                                {[0, 0.2, 0.4].map((d, i) => (
                                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: `pulse 1s ${d}s ease-in-out infinite` }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ready to Submit */}
                    {readyToSubmit && (
                        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.08))', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 14, padding: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="check" size={14} color="#10b981" /> Ready to Submit!
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>All required information collected.</div>
                            <button onClick={() => navigate('/assistant')} style={{ width: '100%', padding: '9px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #10b981, #22c55e)', color: 'white', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px #10b98133', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <Icon name="sparkles" size={14} color="white" /> Go to Full Assistant & Submit
                            </button>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Quick Prompts */}
                <div style={{ padding: '8px 12px 4px', display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
                    {QUICK_PROMPTS.map(p => (
                        <button key={p.label} onClick={() => send(p.msg)} disabled={loading} style={{
                            padding: '4px 10px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: 11,
                            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', gap: 5
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#e2e8f0'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                            <Icon name={p.icon} size={10} color="#10b981" /> {p.label}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div style={{ padding: '8px 12px 14px', flexShrink: 0 }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14, padding: '8px 10px', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                            placeholder="Type in any language…"
                            style={{ flex: 1, border: 'none', background: 'transparent', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                        />
                        <button
                            onClick={() => send()}
                            disabled={!input.trim() || loading}
                            style={{
                                width: 32, height: 32, borderRadius: 10, border: 'none', flexShrink: 0,
                                background: input.trim() && !loading ? 'linear-gradient(135deg, #10b981, #34d399)' : 'rgba(255,255,255,0.06)',
                                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s',
                                boxShadow: input.trim() && !loading ? '0 4px 12px #10b98133' : 'none',
                            }}
                        >
                            {loading ? <Icon name="spinner" size={16} color="white" /> : <Icon name="send" size={16} color="white" />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
