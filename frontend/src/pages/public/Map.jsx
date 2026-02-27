import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { getComplaints } from '../../api/client.js';
import { StatusBadge, Icon } from '../../components/index.jsx';

const PAGE_BG = '#0a0e1a';
const GLASS = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, backdropFilter: 'blur(12px)' };

export default function MapPage() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        (async () => {
            try { const res = await getComplaints(); setComplaints(res.data); }
            catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const located = complaints.filter(c => c.lat && c.lng && (filter === 'All' || c.status === filter));
    const radiusMap = { High: 22, Medium: 14, Low: 8 };
    const statusColor = { PENDING: '#f59e0b', IN_PROGRESS: '#3b82f6', RESOLVED: '#10b981' };

    return (
        <div style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: "'DM Sans', sans-serif", color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 20%, #ec489910 0%, transparent 55%), radial-gradient(ellipse at 50% 80%, #6366f108 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.02)', animation: 'spin 45s linear infinite' }} />

            {/* Header */}
            <div style={{ position: 'relative', zIndex: 2, padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div onClick={() => navigate('/')} style={{ width: 42, height: 42, borderRadius: 14, cursor: 'pointer', background: 'linear-gradient(135deg, #ec4899, #f472b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px #ec489944' }}>
                        <Icon name="map-pin" size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: '-0.5px' }}>Complaint Map</div>
                        <div style={{ fontSize: 12, color: '#475569' }}>Geographic heatmap visualization</div>
                    </div>
                </div>
                <button onClick={() => navigate('/')} style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
            </div>

            <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
                {/* Filters */}
                <div style={{ ...GLASS, padding: 18, marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginRight: 8 }}>Filter:</span>
                        {['All', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map(s => (
                            <button key={s} onClick={() => setFilter(s)} style={{
                                padding: '6px 16px', borderRadius: 20,
                                border: `1.5px solid ${filter === s ? '#ec4899' : 'rgba(255,255,255,0.1)'}`,
                                background: filter === s ? 'linear-gradient(135deg, #ec4899, #f472b6)' : 'rgba(255,255,255,0.04)',
                                color: filter === s ? 'white' : '#94a3b8',
                                fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                            }}>{s.replace('_', ' ')}</button>
                        ))}
                        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#475569' }}>{located.length} complaints on map</span>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 100 }}>
                        <div style={{ width: 50, height: 50, border: '3px solid #ec4899', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                        <div style={{ color: '#64748b', fontWeight: 600, fontSize: 15 }}>Loading map data…</div>
                    </div>
                ) : (
                    <div style={{ ...GLASS, padding: 0, overflow: 'hidden' }}>
                        <MapContainer center={[28.4595, 77.0266]} zoom={11} style={{ height: 600, width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                            {located.map(c => (
                                <CircleMarker key={c.id} center={[c.lat, c.lng]}
                                    radius={radiusMap[c.priority] || 12}
                                    pathOptions={{ color: statusColor[c.status] || '#6366f1', fillColor: statusColor[c.status] || '#6366f1', fillOpacity: 0.65, weight: 2 }}>
                                    <Popup>
                                        <div style={{ minWidth: 200, fontFamily: "'DM Sans', sans-serif" }}>
                                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{c.title}</div>
                                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{c.id} · {c.category}</div>
                                            <StatusBadge status={c.status} />
                                            {c.address && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="map-pin" size={10} color="#94a3b8" /> {c.address}</div>}
                                            <button onClick={() => navigate(`/track?id=${c.id}`)} style={{ marginTop: 10, padding: '6px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', width: '100%' }}>Track &rarr;</button>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>
                )}

                {/* Legend */}
                <div style={{ display: 'flex', gap: 28, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {[['#f59e0b', 'Pending'], ['#3b82f6', 'In Progress'], ['#10b981', 'Resolved']].map(([c, l]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 14, height: 14, borderRadius: '50%', background: c, boxShadow: `0 2px 10px ${c}66` }} />
                            <span style={{ fontSize: 13, color: '#94a3b8' }}>{l}</span>
                        </div>
                    ))}
                    <span style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>Circle size = Priority</span>
                </div>
            </div>
        </div>
    );
}
