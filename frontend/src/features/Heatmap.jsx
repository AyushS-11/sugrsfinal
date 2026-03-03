import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { CAT_COLOR, StatusBadge, Icon } from '../components/index.jsx';

export default function Heatmap({ complaints }) {
    const [filter, setFilter] = useState('All');
    const located = complaints.filter(c => c.lat && c.lng && (filter === 'All' || c.status === filter));

    const radiusMap = { High: 22, Medium: 14, Low: 8 };
    const statusColor = { PENDING: '#f59e0b', IN_PROGRESS: '#3b82f6', RESOLVED: '#10b981' };

    return (
        <div className="card animate-fade" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon name="map-pin" size={18} color="#6366f1" /> Complaint Heatmap
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['All', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map(s => (
                        <button key={s} onClick={() => setFilter(s)} style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${filter === s ? '#6366f1' : 'var(--border)'}`, background: filter === s ? '#6366f1' : 'var(--card)', color: filter === s ? 'white' : 'var(--text-muted)', fontWeight: 600, fontSize: 11, cursor: 'pointer' }}>
                            {s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <MapContainer center={[28.4595, 77.0266]} zoom={11} style={{ height: 420, width: '100%', borderRadius: 12 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                {located.map(c => (
                    <CircleMarker key={c.id} center={[c.lat, c.lng]}
                        radius={radiusMap[c.priority] || 12}
                        pathOptions={{ color: statusColor[c.status] || '#6366f1', fillColor: statusColor[c.status] || '#6366f1', fillOpacity: .65, weight: 2 }}>
                        <Popup>
                            <div style={{ minWidth: 180 }}>
                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{c.title}</div>
                                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{c.id} · {c.category}</div>
                                <StatusBadge status={c.status} />
                                {c.address && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="map-pin" size={10} color="#94a3b8" /> {c.address}</div>}
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>

            <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
                {[['#f59e0b', 'Pending'], ['#3b82f6', 'In Progress'], ['#10b981', 'Resolved']].map(([c, l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l}</span>
                    </div>
                ))}
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>Circle size = Priority (High/Medium/Low)</span>
            </div>
        </div>
    );
}
