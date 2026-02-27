import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Icon, AIPreviewCard, CATEGORIES } from '../../components/index.jsx';
import { useSpeechInput } from '../../hooks/index.js';
import { classifyText, submitComplaint, uploadImage } from '../../api/client.js';
import api from '../../api/client.js';
import toast from 'react-hot-toast';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

function MapPicker({ position, setPosition, setAddress }) {
    useMapEvents({
        async click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            try {
                const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`);
                const d = await r.json();
                setAddress(d.display_name?.split(',').slice(0, 3).join(', ') || '');
            } catch { }
        }
    });
    return position ? <Marker position={position} /> : null;
}

/* ── Shared Styles ─────────────────────────────────────── */
const PAGE_BG = '#0a0e1a';
const GLASS = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, backdropFilter: 'blur(12px)' };
const LABEL = { fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6, letterSpacing: '.5px', textTransform: 'uppercase' };
const INPUT = {
    width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', fontSize: 14, fontWeight: 500,
    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
};
const SECTION_TITLE = { fontSize: 15, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 };

export default function FileComplaint() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', description: '', category: '', address: '', name: '', phone: '' });
    const [classification, setClassification] = useState(null);
    const [position, setPosition] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(null);
    const [geoLoading, setGeoLoading] = useState(false);
    const [detectingAddr, setDetectingAddr] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    // ── Duplicate cluster detection state
    const [similarTickets, setSimilarTickets] = useState([]);
    const [clusterDismissed, setClusterDismissed] = useState(false);
    const [scanningDups, setScanningDups] = useState(false);
    const timerRef = useRef();
    const dupTimerRef = useRef();

    const { listening, start, stop, supported } = useSpeechInput(useCallback(text => {
        setForm(f => ({ ...f, description: text }));
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => doClassify(text), 400);
    }, []));

    useEffect(() => {
        if ('geolocation' in navigator) {
            setGeoLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition([latitude, longitude]);
                    try {
                        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                        const d = await r.json();
                        setForm(f => ({ ...f, address: d.display_name?.split(',').slice(0, 3).join(', ') || '' }));
                    } catch { }
                    setGeoLoading(false);
                },
                () => setGeoLoading(false),
                { timeout: 5000 }
            );
        }
    }, []);

    const doClassify = async (text) => {
        if (!text || text.length < 8) { setClassification(null); return; }
        setAnalyzing(true);
        try {
            const r = await classifyText(text);
            setClassification(r.data);
        } catch { /* silent fail — keyword fallback on backend */ }
        finally { setAnalyzing(false); }
    };
    const detectLocation = async () => {
        if (!('geolocation' in navigator)) return toast.error('Geolocation not supported.');
        setDetectingAddr(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);
                try {
                    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                    const d = await r.json();
                    const addr = d.display_name?.split(',').slice(0, 3).join(', ') || '';
                    setForm(f => ({ ...f, address: addr }));
                    toast.success('Location detected!');
                } catch { toast.error('Could not reverse-geocode location.'); }
                finally { setDetectingAddr(false); }
            },
            (err) => { toast.error('Location access denied.'); setDetectingAddr(false); },
            { timeout: 8000, enableHighAccuracy: true }
        );
    };
    /* ── Live duplicate scanner ── triggered 700ms after user stops typing */
    const doFindSimilar = useCallback(async (title, description, category, address) => {
        if ((title + description).trim().length < 10) { setSimilarTickets([]); return; }
        setScanningDups(true);
        try {
            const r = await api.post('/analytics/find-similar', { title, description, category, address });
            setSimilarTickets(r.data || []);
            if (r.data?.length > 0) setClusterDismissed(false); // re-show if new results
        } catch { /* silent */ }
        finally { setScanningDups(false); }
    }, []);

    const handleDesc = (v) => {
        setForm(f => ({ ...f, description: v }));
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => doClassify(v), 400);
        // duplicate scan on 700ms separate timer
        clearTimeout(dupTimerRef.current);
        dupTimerRef.current = setTimeout(() =>
            doFindSimilar(form.title, v, form.category, form.address), 700
        );
    };
    const handleTitle = (v) => {
        setForm(f => ({ ...f, title: v }));
        clearTimeout(dupTimerRef.current);
        dupTimerRef.current = setTimeout(() =>
            doFindSimilar(v, form.description, form.category, form.address), 700
        );
    };
    const handleImageDrop = (e) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer?.files[0] || e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
    };
    const handleSubmit = async () => {
        if (!form.title || !form.description) return;
        setSubmitting(true);
        try {
            const payload = { ...form, category: form.category || classification?.category || 'General', priority: classification?.priority || 'Medium', lat: position?.[0] || null, lng: position?.[1] || null, citizenId: 'PUBLIC', citizenName: form.name || 'Anonymous Citizen' };
            const res = await submitComplaint(payload);
            if (imageFile) { try { await uploadImage(res.data.id, imageFile); } catch { } }
            setSubmitted(res.data.id);
        } catch { toast.error('Failed to submit. Please try again.'); }
        finally { setSubmitting(false); }
    };

    /* ── Success Screen ────────────────────────────────────── */
    if (submitted) return (
        <div style={{ minHeight: '100vh', background: PAGE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, #10b98118 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', top: '15%', left: '10%', width: 350, height: 350, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)', animation: 'spin 30s linear infinite' }} />
            <div className="animate-fade" style={{ textAlign: 'center', padding: 40, maxWidth: 520, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #10b981, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 40px #10b98144' }}>
                    <Icon name="check" size={40} color="white" />
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1.5px', color: 'white', marginBottom: 10 }}>Complaint Submitted!</h1>
                <p style={{ color: '#64748b', marginBottom: 24, fontSize: 15 }}>Your ticket ID is</p>
                <div style={{ ...GLASS, padding: '18px 40px', display: 'inline-block', borderColor: '#10b98144', marginBottom: 28 }}>
                    <span style={{ fontSize: 34, fontWeight: 900, letterSpacing: 3, background: 'linear-gradient(135deg, #10b981, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{submitted}</span>
                </div>
                <p style={{ color: '#475569', fontSize: 13, marginBottom: 32 }}>Save this ID to track your complaint status</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button onClick={() => navigate(`/track?id=${submitted}`)} style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 24px #6366f144' }}>Track Complaint</button>
                    <button onClick={() => navigate('/')} style={{ padding: '14px 28px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Back to Home</button>
                </div>
            </div>
        </div>
    );

    /* ── Main Form ─────────────────────────────────────────── */
    return (
        <div style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: "'DM Sans', sans-serif", color: 'white', position: 'relative', overflow: 'hidden' }}>
            {/* Background Effects */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 30%, #6366f110 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, #8b5cf610 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', top: '5%', right: '3%', width: 450, height: 450, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)', animation: 'spin 35s linear infinite' }} />

            {/* Header */}
            <div style={{ position: 'relative', zIndex: 2, padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div onClick={() => navigate('/')} style={{ width: 42, height: 42, borderRadius: 14, cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px #6366f144' }}>
                        <Icon name="file-text" size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: '-0.5px' }}>File a Complaint</div>
                        <div style={{ fontSize: 12, color: '#475569' }}>AI-powered civic issue reporting</div>
                    </div>
                </div>
                <button onClick={() => navigate('/')} style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: 1000, margin: '0 auto', padding: '36px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 28 }}>
                    <div style={{ display: 'grid', gap: 20 }}>
                        {/* Citizen Info */}
                        <div style={{ ...GLASS, padding: 24 }}>
                            <div style={{ ...SECTION_TITLE, color: 'white' }}>
                                <Icon name="user" size={18} color="#6366f1" /> Your Information <span style={{ fontSize: 11, color: '#475569', fontWeight: 500, fontStyle: 'italic', marginLeft: 6 }}>(optional)</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div><label style={LABEL}>NAME</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" style={INPUT} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} /></div>
                                <div><label style={LABEL}>PHONE</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone number" style={INPUT} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} /></div>
                            </div>
                        </div>

                        {/* Complaint Details */}
                        <div style={{ ...GLASS, padding: 24 }}>
                            <div style={{ ...SECTION_TITLE, color: 'white' }}>
                                <Icon name="file-text" size={18} color="#6366f1" /> Complaint Details
                            </div>
                            <div style={{ display: 'grid', gap: 16 }}>
                                <div><label style={LABEL}>COMPLAINT TITLE *</label><input value={form.title} onChange={e => handleTitle(e.target.value)} placeholder="Brief title of the issue" style={INPUT} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} /></div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <label style={{ ...LABEL, marginBottom: 0 }}>DESCRIPTION *</label>
                                        {supported && (
                                            <button onClick={listening ? stop : start} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, border: 'none', background: listening ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', boxShadow: listening ? '0 4px 12px #ef444444' : '0 4px 12px #6366f144' }}>
                                                <Icon name="mic" size={12} color="white" />{listening ? '● STOP' : 'VOICE INPUT'}
                                            </button>
                                        )}
                                    </div>
                                    {listening && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '8px 12px', marginBottom: 8, fontSize: 12, color: '#f87171', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="mic" size={12} color="#f87171" /> Listening… speak your complaint</div>}
                                    <textarea value={form.description} onChange={e => handleDesc(e.target.value)} placeholder="Describe the issue in detail. AI will auto-classify…" rows={4} style={{ ...INPUT, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />

                                    {/* ── Live Duplicate Cluster Panel ── */}
                                    {scanningDups && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginTop: 8, fontSize: 12, color: '#818cf8' }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: 'pulse 1s infinite' }} />
                                            Scanning for similar complaints…
                                        </div>
                                    )}
                                    {!clusterDismissed && similarTickets.length > 0 && (
                                        <div style={{ marginTop: 8, borderRadius: 14, border: '1.5px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.07)', overflow: 'hidden' }}>
                                            {/* Header */}
                                            <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ background: 'rgba(245,158,11,0.15)', padding: 6, borderRadius: 8 }}>
                                                        <Icon name="bell" size={16} color="#fbbf24" />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: 13, color: '#fbbf24' }}>
                                                            {similarTickets.length} Similar Complaint{similarTickets.length > 1 ? 's' : ''} Already Exist
                                                        </div>
                                                        <div style={{ fontSize: 11, color: '#92400e', marginTop: 1 }}>
                                                            Your issue may already be tracked. You can still submit — it will be clustered with existing tickets.
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => setClusterDismissed(true)} style={{ background: 'transparent', border: 'none', color: '#92400e', cursor: 'pointer', padding: '2px 6px', borderRadius: 6, display: 'flex', alignItems: 'center' }}>
                                                    <Icon name="x" size={16} color="#92400e" />
                                                </button>
                                            </div>
                                            {/* Ticket list */}
                                            <div style={{ padding: '10px 16px', display: 'grid', gap: 8 }}>
                                                {similarTickets.map(t => (
                                                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'rgba(0,0,0,0.2)' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                                                <span style={{ fontSize: 10, fontWeight: 800, color: '#6366f1', background: 'rgba(99,102,241,0.15)', padding: '2px 7px', borderRadius: 20 }}>{t.id}</span>
                                                                <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>{t.title}</span>
                                                                {t.locBonus && <span style={{ fontSize: 9, color: '#818cf8', background: 'rgba(99,102,241,0.12)', padding: '1px 6px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="pin" size={8} /> Nearby</span>}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                                                                    <div style={{ height: '100%', width: `${t.similarity}%`, background: t.similarity >= 50 ? '#10b981' : '#f59e0b', borderRadius: 10 }} />
                                                                </div>
                                                                <span style={{ fontSize: 10, fontWeight: 700, color: t.similarity >= 50 ? '#10b981' : '#f59e0b', minWidth: 30 }}>{t.similarity}%</span>
                                                                <span style={{ fontSize: 10, color: '#64748b' }}>{t.category}</span>
                                                                <span style={{ fontSize: 10, color: t.status === 'IN_PROGRESS' ? '#3b82f6' : '#64748b' }}>{t.status?.replace('_', ' ')}</span>
                                                                {t.impactScore > 1 && <span style={{ fontSize: 10, color: '#fb923c', display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="users" size={10} /> {t.impactScore} affected</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Footer action */}
                                            <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(245,158,11,0.2)', display: 'flex', gap: 8 }}>
                                                <button onClick={() => setClusterDismissed(true)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: '1px solid rgba(245,158,11,0.4)', background: 'transparent', color: '#fbbf24', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                                                    Continue Anyway — My issue is different
                                                </button>
                                                <a href={`/track?id=${similarTickets[0].id}`} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', background: 'rgba(245,158,11,0.25)', color: '#fbbf24', fontWeight: 700, fontSize: 12, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Icon name="search" size={14} color="#92400e" /> Track Existing Ticket {similarTickets[0].id}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div><label style={LABEL}>CATEGORY</label><select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...INPUT, cursor: 'pointer' }}><option value="" style={{ background: '#1e293b' }}>Auto-detect by AI</option>{CATEGORIES.map(c => <option key={c} style={{ background: '#1e293b' }}>{c}</option>)}</select></div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                            <label style={{ ...LABEL, marginBottom: 0 }}>ADDRESS</label>
                                            <button
                                                type="button"
                                                onClick={detectLocation}
                                                disabled={detectingAddr}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 5,
                                                    padding: '5px 12px', borderRadius: 20, border: 'none',
                                                    background: detectingAddr
                                                        ? 'rgba(255,255,255,0.08)'
                                                        : 'linear-gradient(135deg, #10b981, #34d399)',
                                                    color: detectingAddr ? '#64748b' : 'white',
                                                    fontSize: 11, fontWeight: 700, cursor: detectingAddr ? 'wait' : 'pointer',
                                                    boxShadow: detectingAddr ? 'none' : '0 4px 12px #10b98144',
                                                    transition: 'all 0.2s', fontFamily: 'inherit',
                                                }}
                                            >
                                                {detectingAddr
                                                    ? <><span style={{ display: 'inline-block', width: 10, height: 10, border: '2px solid #64748b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Detecting…</>
                                                    : <><Icon name="pin" size={12} /> Detect</>
                                                }
                                            </button>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                value={form.address}
                                                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                                placeholder="Street, Area, City — or click Detect"
                                                style={{ ...INPUT, paddingRight: form.address ? 36 : 16 }}
                                                onFocus={e => e.target.style.borderColor = '#6366f1'}
                                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                            />
                                            {form.address && (
                                                <button
                                                    type="button"
                                                    onClick={() => setForm(f => ({ ...f, address: '' }))}
                                                    style={{
                                                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                                        background: 'none', border: 'none', color: '#475569',
                                                        fontSize: 16, cursor: 'pointer', lineHeight: 1, padding: '2px 4px',
                                                    }}
                                                >×</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ ...GLASS, padding: 24 }}>
                            <div style={{ ...SECTION_TITLE, color: 'white' }}>
                                <Icon name="pin" size={18} color="#6366f1" /> Location
                                {position && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600, background: 'rgba(16,185,129,0.12)', padding: '3px 10px', borderRadius: 20, marginLeft: 10 }}>✓ Detected</span>}
                                {geoLoading && <span style={{ fontSize: 11, color: '#a5b4fc', marginLeft: 8 }}>Detecting…</span>}
                            </div>
                            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <MapContainer center={position || [28.4595, 77.0266]} zoom={12} style={{ height: 210, width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <MapPicker position={position} setPosition={setPosition} setAddress={v => setForm(f => ({ ...f, address: v }))} />
                                </MapContainer>
                            </div>
                            <div style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>📌 Click map to pin exact location — auto-fills address</div>
                        </div>

                        {/* Image Upload */}
                        <div style={{ ...GLASS, padding: 24 }}>
                            <div style={{ ...SECTION_TITLE, color: 'white' }}><Icon name="image" size={18} color="#6366f1" /> Attach Photo</div>
                            <div style={{ border: `2px dashed ${isDragging ? '#6366f1' : 'rgba(255,255,255,0.1)'}`, borderRadius: 14, padding: 24, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: isDragging ? 'rgba(99,102,241,0.06)' : 'transparent' }}
                                onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleImageDrop} onClick={() => document.getElementById('public-img-input').click()}>
                                {imagePreview ? (
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <img src={imagePreview} alt="preview" style={{ maxHeight: 130, borderRadius: 12, maxWidth: '100%' }} />
                                        <button onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }} style={{ position: 'absolute', top: -8, right: -8, background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: '50%', width: 24, height: 24, color: 'white', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px #ef444444' }}>×</button>
                                    </div>
                                ) : (
                                    <div style={{ color: '#64748b', fontSize: 14 }}>
                                        <div style={{ background: 'rgba(255,255,255,0.04)', width: 50, height: 50, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                            <Icon name="image" size={24} color="#64748b" />
                                        </div>
                                        Drag & drop or click to upload
                                    </div>
                                )}
                                <input id="public-img-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageDrop} />
                            </div>
                        </div>

                        {/* Submit */}
                        <button onClick={handleSubmit} disabled={!form.title || !form.description || submitting} style={{
                            padding: '16px', borderRadius: 14, border: 'none', width: '100%',
                            background: (!form.title || !form.description) ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: (!form.title || !form.description) ? '#475569' : 'white',
                            fontWeight: 800, fontSize: 16, cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit',
                            boxShadow: (form.title && form.description) ? '0 8px 32px #6366f144' : 'none', transition: 'all 0.2s',
                        }}>{submitting ? <><Icon name="loader" size={18} color="white" /> Submitting…</> : <><Icon name="sparkles" size={18} color="white" /> Submit Complaint</>}</button>
                    </div>

                    {/* AI Preview */}
                    <div style={{ position: 'sticky', top: 100, alignSelf: 'start' }}>
                        <div style={{ ...GLASS, padding: 20 }}>
                            <AIPreviewCard classification={classification} visible={true} analyzing={analyzing} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
