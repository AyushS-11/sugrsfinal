import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Icon, AIPreviewCard, CATEGORIES } from '../components/index.jsx';
import { useSpeechInput } from '../hooks/index.js';
import { classifyText, submitComplaint, uploadImage } from '../api/client.js';
import { useAuth } from '../context/index.jsx';
import toast from 'react-hot-toast';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

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

export default function ComplaintForm({ onSubmit, onClose }) {
    const { user } = useAuth();
    const [form, setForm] = useState({ title: '', description: '', category: '', address: '' });
    const [classification, setClassification] = useState(null);
    const [position, setPosition] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(null);
    const timerRef = useRef();
    const { listening, start, stop, supported } = useSpeechInput(useCallback(text => {
        setForm(f => ({ ...f, description: text }));
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => doClassify(text), 400);
    }, []));

    const doClassify = async (text) => {
        if (!text || text.length < 10) return;
        try { const r = await classifyText(text); setClassification(r.data); } catch { }
    };

    const handleDesc = (v) => {
        setForm(f => ({ ...f, description: v }));
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => doClassify(v), 400);
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
            const payload = {
                ...form,
                category: form.category || classification?.category || 'General',
                priority: classification?.priority || 'Medium',
                lat: position?.[0] || null,
                lng: position?.[1] || null,
                citizenId: user?.citizenId || 'C001',
                citizenName: user?.name || 'Citizen',
            };
            const res = await submitComplaint(payload);
            const newC = res.data;
            if (imageFile) {
                try { await uploadImage(newC.id, imageFile); } catch { }
            }
            setSubmitted(newC.id);
            onSubmit?.(newC);
        } catch (e) {
            toast.error('Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) return (
        <div style={{ textAlign: 'center', padding: '20px 0' }} className="animate-fade">
            <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 8 }}>Complaint Submitted!</div>
            <div style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Your ticket ID is</div>
            <div style={{ background: '#f0fdf4', border: '2px solid #22c55e', borderRadius: 12, padding: '14px 28px', display: 'inline-block', fontSize: 24, fontWeight: 900, color: '#16a34a', letterSpacing: 2, marginBottom: 20 }}>{submitted}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Save this ID to track your complaint status</div>
            <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
    );

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
            <div style={{ display: 'grid', gap: 14 }}>
                <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>COMPLAINT TITLE *</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Brief title of the issue" className="input-base" />
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>DESCRIPTION *</label>
                        {supported && (
                            <button onClick={listening ? stop : start} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, border: 'none', background: listening ? '#ef4444' : '#6366f1', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                <Icon name="mic" size={12} color="white" />
                                {listening ? '● STOP' : 'VOICE INPUT'}
                            </button>
                        )}
                    </div>
                    {listening && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 10px', marginBottom: 8, fontSize: 12, color: '#ef4444' }}>🎙️ Listening… speak your complaint</div>}
                    <textarea value={form.description} onChange={e => handleDesc(e.target.value)} placeholder="Describe the issue in detail. AI will classify automatically…" rows={4} className="input-base" style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>CATEGORY</label>
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-base">
                            <option value="">Auto-detect by AI</option>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>ADDRESS</label>
                        <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street, Area, City" className="input-base" />
                    </div>
                </div>
                {/* Map Picker */}
                <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        📍 LOCATION PIN {position && <span style={{ color: '#10b981' }}>✓ Pinned ({position[0].toFixed(4)}, {position[1].toFixed(4)})</span>}
                    </label>
                    <MapContainer center={[28.4595, 77.0266]} zoom={12} style={{ height: 180, width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapPicker position={position} setPosition={setPosition} setAddress={v => setForm(f => ({ ...f, address: v }))} />
                    </MapContainer>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>📌 Click map to pin exact location (auto-fills address)</div>
                </div>
                {/* Image Upload */}
                <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>📸 ATTACH PHOTO</label>
                    <div className={`drop-zone ${isDragging ? 'active' : ''}`} style={{ borderRadius: 10, padding: 16, textAlign: 'center', cursor: 'pointer', position: 'relative' }}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleImageDrop}
                        onClick={() => document.getElementById('img-input').click()}>
                        {imagePreview ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img src={imagePreview} alt="preview" style={{ maxHeight: 100, borderRadius: 8, maxWidth: '100%' }} />
                                <button onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }} style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', border: 'none', borderRadius: '50%', width: 20, height: 20, color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                <div style={{ fontSize: 24, marginBottom: 4 }}>📸</div>
                                Drag & drop or click to upload
                            </div>
                        )}
                        <input id="img-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageDrop} />
                    </div>
                </div>
                <button className="btn-primary" onClick={handleSubmit} disabled={!form.title || !form.description || submitting} style={{ padding: 14, fontSize: 15 }}>
                    {submitting ? '⏳ Submitting…' : '🚀 Submit Complaint'}
                </button>
            </div>
            <AIPreviewCard classification={classification} visible={true} />
        </div>
    );
}
