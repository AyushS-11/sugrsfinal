import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/index.jsx';
import { chatAI, submitComplaint } from '../../api/client.js';
import toast from 'react-hot-toast';

const PAGE_BG = '#0a0e1a';
const GLASS = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, backdropFilter: 'blur(12px)' };
const LABEL = { fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '.6px', textTransform: 'uppercase' };

const EMPTY_FIELDS = { title: '', description: '', category: '', subcategory: '', location_text: '', latitude: '', longitude: '', severity: '', citizen_name: '', citizen_phone: '', citizen_email: '' };
const SEVERITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
const CATEGORY_ICONS = { roads: '🛣️', water: '💧', sanitation: '🗑️', electricity: '⚡', public_safety: '🚨', other: '📋' };

const LANGUAGES = [
    { code: 'English', label: 'EN' },
    { code: 'Hindi', label: 'हिं' },
    { code: 'Marathi', label: 'मरा' },
    { code: 'Tamil', label: 'தமி' },
    { code: 'Telugu', label: 'తెలు' },
    { code: 'Kannada', label: 'ಕನ್ನ' },
    { code: 'Bengali', label: 'বাং' },
    { code: 'Gujarati', label: 'ગુ' },
];

const QUICK_PROMPTS = [
    { label: '🛣️ Road issue', msg: 'There is a pothole on the road near my area.' },
    { label: '💧 Water problem', msg: 'There is no water supply in my area for 2 days.' },
    { label: '🗑️ Garbage issue', msg: 'Garbage has not been collected for a week in my locality.' },
    { label: '⚡ Power outage', msg: 'There is a frequent power cut in my colony.' },
    { label: '🔍 Track complaint', msg: 'I want to track my complaint.' },
    { label: '🗣️ Hindi', msg: 'मुझे शिकायत दर्ज करनी है।' },
];

const FIELD_LABELS = {
    title: 'Title', description: 'Description', category: 'Category', subcategory: 'Subcategory',
    location_text: 'Location', severity: 'Severity', citizen_name: 'Name', citizen_phone: 'Phone', citizen_email: 'Email',
};

function ProgressRing({ filled, total }) {
    const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
    const r = 22, circ = 2 * Math.PI * r, dash = circ - (pct / 100) * circ;
    return (
        <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
            <svg width={56} height={56} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={28} cy={28} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
                <circle cx={28} cy={28} r={r} fill="none" stroke={pct === 100 ? '#10b981' : '#6366f1'} strokeWidth={4}
                    strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: pct === 100 ? '#10b981' : '#a5b4fc' }}>{pct}%</div>
        </div>
    );
}

export default function Assistant() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([{
        role: 'assistant',
        content: 'Namaste! I\'m the SUGRS AI Assistant.\n\nI can help you file a civic complaint in your preferred language. Select your language above, then tell me your issue!',
    }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [extractedFields, setExtractedFields] = useState({ ...EMPTY_FIELDS });
    const [readyToSubmit, setReadyToSubmit] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [inputMode, setInputMode] = useState('text'); // 'text' | 'voice'

    // Voice state
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    // New state for upgraded response fields
    const [duplicateCheck, setDuplicateCheck] = useState(null);
    const [notificationTriggers, setNotificationTriggers] = useState(null);
    const [feedbackDisplay, setFeedbackDisplay] = useState(null);
    const [upvoteRec, setUpvoteRec] = useState(null);
    const [voiceMeta, setVoiceMeta] = useState(null);

    const bottomRef = useRef();
    const inputRef = useRef();

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

    // Initialize Web Speech API
    useEffect(() => {
        // Check for all possible browser prefixes for Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = false; // Set to false to only get final words and avoid double typing

            recognitionRef.current.onresult = (e) => {
                const transcript = Array.from(e.results)
                    .map(result => result[0].transcript)
                    .join('');

                // For simplicity, just set input to the newly transcribed text 
                // (continuous=true means it keeps appending in the results array)
                setInput(transcript);
            };

            recognitionRef.current.onerror = (e) => {
                console.error("Speech recognition error:", e.error);
                setIsListening(false);
                setInputMode('text');
                if (e.error === 'not-allowed') toast.error("Microphone access denied.");
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                setInputMode('text');
            };
        }
    }, []);

    // Update speech recognition language when user changes dropdown
    useEffect(() => {
        if (recognitionRef.current) {
            const langMap = {
                'English': 'en-IN', 'Hindi': 'hi-IN', 'Marathi': 'mr-IN',
                'Tamil': 'ta-IN', 'Telugu': 'te-IN', 'Kannada': 'kn-IN',
                'Bengali': 'bn-IN', 'Gujarati': 'gu-IN'
            };
            recognitionRef.current.lang = langMap[selectedLanguage] || 'en-IN';
        }
    }, [selectedLanguage]);

    const toggleVoiceMode = () => {
        if (!recognitionRef.current) {
            toast.error("Voice input requires Google Chrome, Edge, or Safari.");
            return;
        }
        if (inputMode === 'text') {
            try {
                setInputMode('voice');
                setIsListening(true);
                setInput(''); // Clear input for new dictation
                recognitionRef.current.start();
                toast.success(`Listening in ${selectedLanguage}...`);
            } catch (e) {
                console.error(e);
            }
        } else {
            setInputMode('text');
            setIsListening(false);
            recognitionRef.current.stop();
        }
    };

    const filledCount = Object.values(extractedFields).filter(v => v && v.trim()).length;
    const totalFields = Object.keys(EMPTY_FIELDS).length;
    const requiredFilled = ['title', 'description', 'category', 'location_text', 'severity'].filter(k => extractedFields[k]?.trim()).length;

    const send = async (overrideMsg) => {
        const msg = (overrideMsg || input).trim();
        if (!msg || loading) return;
        const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setInput('');
        setLoading(true);
        try {
            const res = await chatAI(msg, history, {}, extractedFields, selectedLanguage, inputMode);
            const data = res.data;

            if (data.extracted_fields) {
                setExtractedFields(prev => {
                    const merged = { ...prev };
                    for (const [k, v] of Object.entries(data.extracted_fields)) {
                        if (v && String(v).trim()) merged[k] = String(v).trim();
                    }
                    return merged;
                });
            }

            // Enforce 5 fields locally
            const requiredFilled = Object.keys(EMPTY_FIELDS).filter(k =>
                ['title', 'description', 'category', 'location_text', 'severity'].includes(k) && data.extracted_fields && data.extracted_fields[k] && data.extracted_fields[k].trim()
            ).length;

            if (data.ready_to_submit && requiredFilled >= 5) {
                setReadyToSubmit(true);
            } else {
                setReadyToSubmit(false);
            }

            if (data.duplicate_check) setDuplicateCheck(data.duplicate_check);
            if (data.notification_triggers) setNotificationTriggers(data.notification_triggers);
            if (data.feedback_display) setFeedbackDisplay(data.feedback_display);
            if (data.upvote_recommendation) setUpvoteRec(data.upvote_recommendation);
            if (data.voice_metadata) setVoiceMeta(data.voice_metadata);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.reply || "I'm here to help! Please describe your issue.",
            }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Could not connect to AI. Please try again.' }]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                title: extractedFields.title || 'Civic Complaint',
                description: extractedFields.description || '',
                category: extractedFields.category || 'other',
                address: extractedFields.location_text || '',
                phone: extractedFields.citizen_phone || '',
                priority: ['critical', 'high'].includes(extractedFields.severity) ? 'High' : extractedFields.severity === 'medium' ? 'Medium' : 'Low',
                lat: extractedFields.latitude || null,
                lng: extractedFields.longitude || null,
                citizenId: 'PUBLIC', citizenName: extractedFields.citizen_name || 'Anonymous Citizen',
            };
            const res = await submitComplaint(payload);
            setSubmitted(res.data.id);
            toast.success('Complaint submitted successfully!');
        } catch {
            toast.error('Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Success Screen ─── */
    if (submitted) return (
        <div style={{ minHeight: '100vh', background: PAGE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, #10b98118 0%, transparent 60%)' }} />
            <div className="animate-fade" style={{ textAlign: 'center', padding: 40, maxWidth: 520, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #10b981, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 40px #10b98144' }}>
                    <Icon name="check" size={40} color="white" />
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1.5px', color: 'white', marginBottom: 10 }}>Complaint Submitted!</h1>
                <p style={{ color: '#64748b', marginBottom: 24, fontSize: 15 }}>Your ticket ID is</p>
                <div style={{ ...GLASS, padding: '18px 40px', display: 'inline-block', borderColor: '#10b98144', marginBottom: 28 }}>
                    <span style={{ fontSize: 34, fontWeight: 900, letterSpacing: 3, background: 'linear-gradient(135deg, #10b981, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{submitted}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button onClick={() => navigate(`/track?id=${submitted}`)} style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Track Complaint</button>
                    <button onClick={() => navigate('/')} style={{ padding: '14px 28px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Back to Home</button>
                </div>
            </div>
        </div>
    );

    /* ── Main Layout ─── */
    return (
        <div style={{ minHeight: '100vh', height: '100vh', background: PAGE_BG, fontFamily: "'DM Sans', sans-serif", color: 'white', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 25%, #6366f108 0%, transparent 50%), radial-gradient(ellipse at 75% 75%, #10b98108 0%, transparent 50%)' }} />

            {/* Header */}
            <div style={{ position: 'relative', zIndex: 2, padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div onClick={() => navigate('/')} style={{ width: 40, height: 40, borderRadius: 13, cursor: 'pointer', background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px #10b98144' }}>
                        <Icon name="activity" size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: '-0.5px' }}>SUGRS AI Assistant</div>
                        <div style={{ fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                            Anti-Gravity Mode • Powered by Gemini
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        </div>
                    </div>
                </div>

                {/* Language Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {LANGUAGES.map(l => (
                        <button key={l.code} onClick={() => setSelectedLanguage(l.code)} style={{
                            padding: '3px 8px', borderRadius: 7, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                            background: selectedLanguage === l.code ? 'linear-gradient(135deg, #10b981, #34d399)' : 'rgba(255,255,255,0.05)',
                            border: selectedLanguage === l.code ? 'none' : '1px solid rgba(255,255,255,0.08)',
                            color: selectedLanguage === l.code ? 'white' : '#64748b',
                            boxShadow: selectedLanguage === l.code ? '0 2px 10px #10b98133' : 'none',
                        }}>{l.label}</button>
                    ))}

                    {/* Removed Voice/Text Toggle from here */}

                    <button onClick={() => navigate('/')} style={{ padding: '6px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
                </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, position: 'relative', zIndex: 2, display: 'flex', overflow: 'hidden' }}>

                {/* Chat Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {messages.map((m, i) => (
                            <div key={i} className="animate-fade" style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                {m.role === 'assistant' && (
                                    <div style={{ width: 28, height: 28, borderRadius: 9, background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 9, marginTop: 2, boxShadow: '0 3px 10px #10b98133' }}>
                                        <Icon name="activity" size={14} color="white" />
                                    </div>
                                )}
                                <div style={{
                                    maxWidth: '72%', padding: '13px 17px',
                                    borderRadius: m.role === 'user' ? '17px 17px 4px 17px' : '17px 17px 17px 4px',
                                    fontSize: 14, lineHeight: 1.75, fontWeight: 500, whiteSpace: 'pre-wrap',
                                    ...(m.role === 'user' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', boxShadow: '0 5px 18px #6366f133' } : { ...GLASS, color: '#e2e8f0' }),
                                }}>{m.content}</div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 9, background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon name="activity" size={14} color="white" />
                                </div>
                                <div style={{ ...GLASS, padding: '13px 18px', borderRadius: '17px 17px 17px 4px', display: 'flex', gap: 5, alignItems: 'center' }}>
                                    {[0, 0.2, 0.4].map((d, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: `pulse 1s ${d}s ease-in-out infinite` }} />)}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Quick Prompts */}
                    <div style={{ padding: '0 28px 10px', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                        {QUICK_PROMPTS.map(p => (
                            <button key={p.label} onClick={() => send(p.msg)} disabled={loading} style={{
                                padding: '6px 14px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)',
                                background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: 11, fontWeight: 600,
                                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: 'inherit',
                                display: 'flex', alignItems: 'center', gap: 6
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                            >
                                <Icon name={p.icon} size={10} color="inherit" />
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Bar */}
                    <div style={{ padding: '0 28px 20px' }}>
                        <div style={{ ...GLASS, padding: '10px 12px', display: 'flex', gap: 9, alignItems: 'center' }}>
                            {isListening && <Icon name="loader" size={16} color="#ef4444" className="animate-pulse" />}
                            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        if (isListening) toggleVoiceMode(); // stop listening before sending
                                        send();
                                    }
                                }}
                                placeholder={isListening ? `Listening in ${selectedLanguage}...` : `Type in ${selectedLanguage}…`}
                                style={{ flex: 1, padding: '9px 0', border: 'none', background: 'transparent', color: '#e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />

                            <button onClick={toggleVoiceMode} title="Toggle voice mode" style={{
                                padding: '10px', borderRadius: 11, flexShrink: 0,
                                border: `1px solid ${isListening ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                background: isListening ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                                color: isListening ? '#f87171' : '#94a3b8', fontSize: 16, cursor: 'pointer', transition: 'all 0.2s',
                                animation: isListening ? 'pulse 1.5s infinite' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Icon name="mic" size={16} color="inherit" />
                            </button>

                            <button onClick={() => {
                                if (isListening) toggleVoiceMode();
                                send();
                            }} disabled={!input.trim() || loading} style={{
                                padding: '10px 14px', borderRadius: 11, border: 'none', flexShrink: 0,
                                background: input.trim() && !loading ? 'linear-gradient(135deg, #10b981, #34d399)' : 'rgba(255,255,255,0.06)',
                                color: input.trim() && !loading ? 'white' : '#475569',
                                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                                boxShadow: input.trim() && !loading ? '0 5px 18px #10b98144' : 'none', transition: 'all 0.2s',
                            }}>
                                <Icon name="send" size={16} color={input.trim() && !loading ? 'white' : '#475569'} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div style={{ width: 310, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Progress Ring */}
                    <div style={{ ...GLASS, padding: 16, display: 'flex', alignItems: 'center', gap: 13 }}>
                        <ProgressRing filled={filledCount} total={totalFields} />
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 13 }}>Form Progress</div>
                            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{filledCount}/{totalFields} fields • {requiredFilled}/5 required</div>
                            <div style={{ fontSize: 10, color: '#334155', marginTop: 4 }}>Lang: <span style={{ color: '#10b981', fontWeight: 700 }}>{selectedLanguage}</span> • Mode: <span style={{ color: '#a5b4fc', fontWeight: 700 }}>{inputMode}</span></div>
                        </div>
                    </div>

                    {/* Duplicate Detection Card */}
                    {duplicateCheck && duplicateCheck.is_duplicate && (
                        <div className="animate-fade" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, padding: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#f59e0b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="alert" size={14} color="#f59e0b" /> Possible Duplicate
                            </div>
                            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
                                Similarity: <strong style={{ color: '#fbbf24' }}>{duplicateCheck.similarity_score}%</strong><br />
                                Cluster: <code style={{ fontSize: 10, color: '#d1d5db', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 4 }}>{duplicateCheck.cluster_id}</code>
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>You can still submit or upvote the existing complaint instead.</div>
                        </div>
                    )}

                    {/* Notification Triggers */}
                    {notificationTriggers && (notificationTriggers.send_push || notificationTriggers.send_sms) && (
                        <div className="animate-fade" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 14, padding: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#ef4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="alert" size={14} color="#ef4444" /> Alert Triggers
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {notificationTriggers.send_push && <span style={{ padding: '3px 9px', borderRadius: 12, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', fontSize: 10, fontWeight: 700, color: '#a5b4fc' }}>📲 Push</span>}
                                {notificationTriggers.send_sms && <span style={{ padding: '3px 9px', borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', fontSize: 10, fontWeight: 700, color: '#34d399' }}>📩 SMS</span>}
                                <span style={{ padding: '3px 9px', borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 10, fontWeight: 700, color: '#f87171' }}>{notificationTriggers.priority_level?.toUpperCase()}</span>
                            </div>
                        </div>
                    )}

                    {/* Public Visibility */}
                    {upvoteRec && (
                        <div style={{ ...GLASS, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', letterSpacing: '.5px' }}>PUBLIC UPVOTES</div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: upvoteRec.allow_public_upvote ? '#10b981' : '#ef4444', marginTop: 3 }}>
                                    {upvoteRec.allow_public_upvote ? <><Icon name="check" size={12} color="#10b981" /> Enabled</> : <><Icon name="x" size={12} color="#475569" /> Disabled</>}
                                </div>
                            </div>
                            <span style={{ padding: '3px 9px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>{upvoteRec.visibility}</span>
                        </div>
                    )}

                    {/* Feedback Display */}
                    {feedbackDisplay && (
                        <div style={{ ...GLASS, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', letterSpacing: '.5px' }}>MAIN PAGE</div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: feedbackDisplay.show_on_main_page ? '#10b981' : '#475569', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {feedbackDisplay.show_on_main_page ? <><Icon name="check" size={12} color="#10b981" /> Will be shown</> : <><Icon name="x" size={12} color="#475569" /> Hidden</>}
                                </div>
                            </div>
                            <span style={{
                                padding: '3px 9px', borderRadius: 10, fontSize: 10, fontWeight: 800,
                                background: feedbackDisplay.highlight_level === 'urgent' ? 'rgba(239,68,68,0.15)' : feedbackDisplay.highlight_level === 'trending' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                                color: feedbackDisplay.highlight_level === 'urgent' ? '#f87171' : feedbackDisplay.highlight_level === 'trending' ? '#fbbf24' : '#64748b',
                            }}>{feedbackDisplay.highlight_level?.toUpperCase()}</span>
                        </div>
                    )}

                    {/* Voice Confidence */}
                    {voiceMeta && inputMode === 'voice' && (
                        <div style={{ ...GLASS, padding: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', letterSpacing: '.5px', marginBottom: 6 }}>🎤 VOICE CONFIDENCE</div>
                            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                                <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #6366f1, #a5b4fc)', width: `${(voiceMeta.confidence_score || 0) * 100}%`, transition: 'width 0.5s ease' }} />
                            </div>
                            <div style={{ fontSize: 11, color: '#a5b4fc', marginTop: 4, fontWeight: 700 }}>{Math.round((voiceMeta.confidence_score || 0) * 100)}%</div>
                        </div>
                    )}

                    {/* Ready to Submit Banner */}
                    {readyToSubmit && (
                        <div className="animate-fade" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(52,211,153,0.08))', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 16, padding: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#10b981', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="check-circle" size={16} color="#10b981" /> Ready to Submit!
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, lineHeight: 1.5 }}>All required information collected. File it officially now.</div>
                            <button onClick={handleSubmit} disabled={submitting} style={{
                                width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                                background: submitting ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #10b981, #22c55e)',
                                color: submitting ? '#64748b' : 'white', fontWeight: 800, fontSize: 13,
                                cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit',
                                boxShadow: submitting ? 'none' : '0 6px 20px #10b98144', transition: 'all 0.2s',
                            }}>{submitting ? '⏳ Submitting…' : '🚀 Submit Complaint'}</button>
                            <button onClick={() => navigate('/file')} style={{ width: '100%', padding: '8px', marginTop: 7, borderRadius: 11, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                                Edit in Full Form →
                            </button>
                        </div>
                    )}

                    {/* Extracted Fields */}
                    <div style={{ ...GLASS, padding: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
                            EXTRACTED FIELDS
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {Object.entries(FIELD_LABELS).map(([key, label]) => {
                                const val = extractedFields[key];
                                if (!val) return (
                                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 11px', borderRadius: 9, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.05)' }}>
                                        <span style={{ ...LABEL, fontSize: 9, flex: 1 }}>{label}</span>
                                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)' }}>—</span>
                                    </div>
                                );
                                const color = key === 'severity' ? SEVERITY_COLORS[val] : key === 'category' ? '#a5b4fc' : null;
                                return (
                                    <div key={key} className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '9px 11px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: `1px solid ${color ? `${color}33` : 'rgba(255,255,255,0.08)'}` }}>
                                        <span style={{ ...LABEL, fontSize: 9, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {label}
                                        </span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: color || '#e2e8f0', wordBreak: 'break-word' }}>{val}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tips */}
                    <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 13, padding: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#a5b4fc', marginBottom: 9 }}>💡 TIPS</div>
                        <ul style={{ fontSize: 11, color: '#64748b', lineHeight: 1.7, margin: 0, paddingLeft: 15 }}>
                            <li>Select your language above</li>
                            <li>Mention the exact street or landmark</li>
                            <li>Describe severity (high/critical)</li>
                            <li>Enable 🎤 voice mode if using speech</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}