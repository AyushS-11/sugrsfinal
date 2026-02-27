import { useState, useRef, useEffect } from 'react';
import { Icon } from '../components/index.jsx';
import { chatAI } from '../api/client.js';

export default function AIChat({ complaints }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I\'m the SUGRS AI assistant. Ask me anything about civic complaints, departments, or status updates!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef();

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'PENDING').length,
        inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
        resolved: complaints.filter(c => c.status === 'RESOLVED').length,
    };

    const send = async () => {
        const msg = input.trim();
        if (!msg || loading) return;
        const updated = [...messages, { role: 'user', content: msg }];
        setMessages(updated);
        setInput('');
        setLoading(true);
        try {
            const history = updated.slice(-6).map(m => ({ role: m.role, content: m.content }));
            const res = await chatAI(msg, history, stats);
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t connect to the AI engine. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button onClick={() => setOpen(o => !o)} style={{
                position: 'fixed', bottom: 28, right: 28, width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 32px #6366f144', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 300, transition: 'transform .2s'
            }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <Icon name={open ? 'x' : 'chat'} size={24} color="white" />
                {!open && <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, background: '#ef4444', borderRadius: '50%', fontSize: 10, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>AI</span>}
            </button>

            {/* Chat Panel */}
            {open && (
                <div className="animate-pop" style={{
                    position: 'fixed', bottom: 96, right: 28, width: 360, height: 520,
                    background: 'var(--card)', borderRadius: 20, boxShadow: '0 20px 60px #0003',
                    border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 300,
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffffff22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="activity" size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 14, color: 'white' }}>SUGRS AI Assistant</div>
                            <div style={{ fontSize: 11, color: '#ffffff99' }}>Powered by Gemini · Always online</div>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div className="live-dot animate-pulse-dot" />
                            <span style={{ fontSize: 10, color: '#ffffff99', fontWeight: 700 }}>LIVE</span>
                        </div>
                    </div>
                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{ maxWidth: '82%', padding: '10px 14px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', fontSize: 13, lineHeight: 1.5 }}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div className="chat-bubble-ai" style={{ padding: '10px 16px', borderRadius: '18px 18px 18px 4px', fontSize: 13 }}>
                                    <span style={{ animation: 'pulse 1s infinite' }}>●</span> <span style={{ margin: '0 2px', animation: 'pulse 1s .2s infinite' }}>●</span> <span style={{ animation: 'pulse 1s .4s infinite' }}>●</span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                    {/* Quick Prompts */}
                    <div style={{ padding: '0 12px 8px', display: 'flex', gap: 6, overflowX: 'auto' }}>
                        {[
                            { label: 'Show stats', icon: 'trending' },
                            { label: 'Water dept', icon: 'activity' },
                            { label: 'High priority', icon: 'alert' },
                            { label: 'Pending issues', icon: 'clock' }
                        ].map(p => (
                            <button key={p.label} onClick={() => { setInput(p.label); setTimeout(() => send(), 50); }} style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name={p.icon} size={10} color="var(--text-muted)" /> {p.label}
                            </button>
                        ))}
                    </div>
                    {/* Input */}
                    <div style={{ padding: '10px 16px 16px', display: 'flex', gap: 8, borderTop: '1px solid var(--border)' }}>
                        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                            placeholder="Ask anything…" className="input-base" style={{ flex: 1 }} />
                        <button onClick={send} disabled={!input.trim() || loading} className="btn-primary" style={{ padding: '10px 14px', flexShrink: 0 }}>
                            <Icon name="send" size={16} color="white" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
