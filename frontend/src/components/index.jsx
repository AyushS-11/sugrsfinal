// ─── Colors / Helpers ─────────────────────────────────
export const PRIORITY_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
export const PRIORITY_BG = { High: '#fef2f2', Medium: '#fffbeb', Low: '#f0fdf4' };
export const STATUS_COLOR = { PENDING: '#6b7280', IN_PROGRESS: '#3b82f6', RESOLVED: '#10b981', SUBMITTED: '#8b5cf6' };
export const STATUS_BG = { PENDING: '#f3f4f6', IN_PROGRESS: '#eff6ff', RESOLVED: '#ecfdf5', SUBMITTED: '#f5f3ff' };
export const CAT_COLOR = { Waste: '#84cc16', Water: '#0ea5e9', Road: '#8b5cf6', Streetlight: '#f59e0b', Sanitation: '#ec4899', General: '#6b7280' };
export const CAT_ICON = { Waste: 'trash', Water: 'droplets', Road: 'road', Streetlight: 'lightbulb', Sanitation: 'shower', General: 'clipboard' };
export const CATEGORIES = ['Waste', 'Water', 'Road', 'Streetlight', 'Sanitation'];

// ─── Badge Components ──────────────────────────────────
export const StatusBadge = ({ status }) => (
    <span style={{ background: STATUS_BG[status] || '#f3f4f6', color: STATUS_COLOR[status] || '#6b7280', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {status?.replace(/_/g, ' ')}
    </span>
);

export const PriorityBadge = ({ priority }) => (
    <span style={{ background: PRIORITY_BG[priority] || '#f3f4f6', color: PRIORITY_COLOR[priority] || '#6b7280', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
        {priority}
    </span>
);

export const CategoryBadge = ({ category }) => (
    <span style={{ background: (CAT_COLOR[category] || '#6b7280') + '22', color: CAT_COLOR[category] || '#6b7280', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
        {category}
    </span>
);

// ─── Icon (inline SVG) ────────────────────────────────
const PATHS = {
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
    clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    log: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    mic: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>,
    map: <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    sun: <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>,
    moon: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
    cpu: <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></>,
    trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
    star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>,
    filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></>,
    chat: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
    send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
    spinner: <><path d="M21 12a9 9 0 1 1-6.219-8.56" /></>,
    loader: <><path d="M21 12a9 9 0 1 1-6.219-8.56" /></>,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    "map-pin": <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    "file-text": <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="12" y1="21" x2="8" y2="21" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>,
    droplets: <><path d="M7 16.3c2.2 0 4-1.8 4-4 0-3.3-4-8-4-8s-4 4.7-4 8c0 2.2 1.8 4 4 4z" /><path d="M17 16.3c2.2 0 4-1.8 4-4 0-3.3-4-8-4-8s-4 4.7-4 8c0 2.2 1.8 4 4 4z" /></>,
    road: <><rect x="3" y="11" width="18" height="2" /><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="17" x2="21" y2="17" /><line x1="7" y1="7" x2="7" y2="17" /><line x1="17" y1="7" x2="17" y2="17" /></>,
    lightbulb: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.19.33-.4.46-.62C16.45 12.02 17 10.59 17 9c0-2.76-2.24-5-5-5S7 6.24 7 9c0 1.59.55 3.02 1.45 4.38.13.22.28.43.46.62L12 11l3.09 3z" /></>,
    shower: <><path d="M4 4h7a4 4 0 0 1 4 4v12" /><path d="M14 15l-2 2" /><path d="M18 15l-2 2" /><path d="M14 19l-2 2" /><path d="M18 19l-2 2" /></>,
    bot: <><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></>,
    sparkles: <><path d="M12 3v3" /><path d="M12 18v3" /><path d="M3 12h3" /><path d="M18 12h3" /><path d="M5.6 5.6l2.2 2.2" /><path d="M16.2 16.2l2.2 2.2" /><path d="M5.6 18.4l2.2-2.2" /><path d="M16.2 7.8l2.2-2.2" /></>,
    award: <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
};

export const Icon = ({ name, size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {PATHS[name]}
    </svg>
);

// ─── Rating Stars ──────────────────────────────────────
export const RatingStars = ({ value, onChange, readonly = false }) => (
    <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(n => (
            <span key={n} onClick={() => !readonly && onChange?.(n)}
                style={{ cursor: readonly ? 'default' : 'pointer', transition: 'transform .15s', userSelect: 'none', transform: !readonly && n <= (value || 0) ? 'scale(1.1)' : 'scale(1)' }}>
                <Icon name="star" size={20} color={n <= (value || 0) ? '#f59e0b' : '#374151'} />
            </span>
        ))}
    </div>
);

// ─── Timeline ─────────────────────────────────────────
export const Timeline = ({ events }) => (
    <div style={{ position: 'relative', paddingLeft: 24 }}>
        <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, background: 'var(--border)', borderRadius: 2 }} />
        {(events || []).map((e, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: 14 }} className="animate-slide">
                <div style={{ position: 'absolute', left: -20, top: 3, width: 12, height: 12, borderRadius: '50%', background: i === (events.length - 1) ? '#6366f1' : '#10b981', border: '2px solid white', boxShadow: '0 0 0 2px var(--border)' }} />
                <div className="card" style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text)', marginBottom: 2 }}>{e.status?.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.note}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{e.date}</div>
                </div>
            </div>
        ))}
    </div>
);

// ─── Modal ─────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, wide = false }) => {
    if (!open) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, background: '#0009', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
            <div className="card animate-pop" style={{ maxWidth: wide ? 760 : 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 28, borderRadius: 20 }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>{title}</div>
                    <button onClick={onClose} style={{ border: 'none', background: 'var(--bg)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
                        <Icon name="x" size={16} color="var(--text-muted)" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

// ─── KPI Card ──────────────────────────────────────────
export const KPICard = ({ label, value, icon, color, sub }) => (
    <div className="card animate-fade" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, borderRadius: '50%', background: `${color}15` }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.5px', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ background: `${color}15`, padding: 8, borderRadius: 10 }}><Icon name={icon} size={18} color={color} /></div>
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
    </div>
);

// ─── Bar Chart (SVG) ──────────────────────────────────
export const BarChart = ({ data }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.value}</div>
                    <div style={{ width: '100%', background: d.color, borderRadius: '6px 6px 0 0', height: `${(d.value / max) * 80}px`, minHeight: 4, transition: 'height .6s ease' }} />
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</div>
                </div>
            ))}
        </div>
    );
};

// ─── Pie Chart (SVG) ──────────────────────────────────
export const PieChart = ({ data }) => {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    let offset = 0;
    const r = 70, cx = 90, cy = 90;
    const slices = data.map((d, i) => {
        const pct = d.value / total, dash = pct * 2 * Math.PI * r, gap = 2 * Math.PI * r - dash;
        const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={20}
            strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray .6s ease' }} />;
        offset += dash; return el;
    });
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <svg width={180} height={180}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={20} />
                {slices}
                <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text)" style={{ fontSize: 22, fontWeight: 900 }}>{total}</text>
                <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: 11 }}>Total</text>
            </svg>
            <div style={{ display: 'grid', gap: 8 }}>
                {data.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', marginLeft: 'auto', paddingLeft: 8 }}>{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── AI Preview Card ───────────────────────────────────
export const AIPreviewCard = ({ classification, visible, analyzing = false }) => {
    if (!visible || !classification) return (
        <div style={{
            border: '2px dashed rgba(99,102,241,0.25)', borderRadius: 16, padding: 24, textAlign: 'center',
            color: '#64748b', fontSize: 14, background: 'rgba(255,255,255,0.03)',
        }}>
            <div style={{ background: 'rgba(99,102,241,0.1)', width: 50, height: 50, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Icon name="bot" size={28} color="#6366f1" />
            </div>
            <div style={{ fontWeight: 700, marginBottom: 4, color: '#94a3b8' }}>AI Classification</div>
            <div style={{ fontSize: 12 }}>Start typing your description to see live AI analysis</div>
        </div>
    );
    const catColor = CAT_COLOR[classification.category] || '#6b7280';
    const conf = typeof classification.confidence === 'number' ? classification.confidence : 85;
    return (
        <div className="animate-pop" style={{
            padding: 18, borderRadius: 16,
            border: `2px solid ${catColor}44`,
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ background: 'rgba(99,102,241,0.15)', padding: 6, borderRadius: 8 }}>
                    <Icon name="bot" size={18} color="#818cf8" />
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 12, color: '#e2e8f0', letterSpacing: '.5px' }}>AI CLASSIFICATION</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Auto-detected via Gemini</div>
                </div>
                <span style={{
                    marginLeft: 'auto', fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                    background: analyzing ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)',
                    color: analyzing ? '#fbbf24' : '#818cf8',
                    animation: analyzing ? 'pulse 1s ease-in-out infinite' : 'none',
                }}>
                    {analyzing ? <><Icon name="loader" size={10} color="white" /> ANALYZING</> : '✓ LIVE'}
                </span>
            </div>

            {/* Category + Priority */}
            <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '.5px' }}>CATEGORY</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: catColor }}>
                        <Icon name={CAT_ICON[classification.category] || 'clipboard'} size={14} color={catColor} /> {classification.category}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '.5px' }}>PRIORITY</span>
                    <span style={{
                        fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                        background: classification.priority === 'High' ? 'rgba(239,68,68,0.15)' : classification.priority === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
                        color: classification.priority === 'High' ? '#f87171' : classification.priority === 'Medium' ? '#fbbf24' : '#4ade80',
                    }}>
                        {classification.priority}
                    </span>
                </div>

                {/* Confidence Bar */}
                <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '.5px' }}>CONFIDENCE</span>
                        <span style={{ fontSize: 12, fontWeight: 900, color: '#a5b4fc' }}>{conf}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 10, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: 10, width: `${conf}%`,
                            background: `linear-gradient(90deg, #6366f1, #8b5cf6)`,
                            transition: 'width 0.6s ease',
                        }} />
                    </div>
                </div>

                {/* Reasoning */}
                {classification.reasoning && (
                    <div style={{
                        fontSize: 11, color: '#475569', padding: '8px 12px',
                        background: 'rgba(99,102,241,0.06)', borderRadius: 10,
                        border: '1px solid rgba(99,102,241,0.15)',
                        lineHeight: 1.5, fontStyle: 'italic', display: 'flex', gap: 6,
                    }}>
                        <Icon name="info" size={12} color="#6366f1" /> {classification.reasoning}
                    </div>
                )}

                {/* AI Summary */}
                {classification.summary && (
                    <div style={{
                        fontSize: 11, color: '#94a3b8', padding: '8px 12px',
                        background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.06)',
                        lineHeight: 1.5, display: 'flex', gap: 6,
                    }}>
                        <Icon name="clipboard" size={12} color="#94a3b8" /> {classification.summary}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Critical Badge ─────────────────────────────────────────────────────────
export const CriticalBadge = ({ inline = false }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'rgba(239,68,68,0.15)', color: '#ef4444',
        border: '1.5px solid rgba(239,68,68,0.5)',
        borderRadius: 20, padding: inline ? '2px 8px' : '4px 12px',
        fontSize: inline ? 10 : 11, fontWeight: 800, letterSpacing: '.3px',
        animation: 'pulse 1.4s ease-in-out infinite',
        whiteSpace: 'nowrap',
    }}>
        <Icon name="alert" size={inline ? 10 : 12} color="#ef4444" /> CRITICAL
    </span>
);

// ─── Impact Score Badge ─────────────────────────────────────────────────────
export const ImpactBadge = ({ score, isDuplicate, parentId }) => {
    if (!score || score <= 1) return null;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'rgba(249,115,22,0.15)', color: '#fb923c',
                border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: 20, padding: '2px 8px',
                fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap',
            }}>
                <Icon name="users" size={10} color="#fb923c" /> {score} affected
            </span>
            {isDuplicate && parentId && (
                <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>
                    ↗ {parentId}
                </span>
            )}
        </div>
    );
};
