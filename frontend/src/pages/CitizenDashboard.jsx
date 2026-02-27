import { useState, useMemo } from 'react';
import { useAuth } from '../context/index.jsx';
import { StatusBadge, CategoryBadge, Modal, RatingStars, Icon, CAT_EMOJI, CAT_COLOR, KPICard } from '../components/index.jsx';
import ComplaintForm from '../features/ComplaintForm.jsx';
import ComplaintDetail from '../features/ComplaintDetail.jsx';
import toast from 'react-hot-toast';

export default function CitizenDashboard({ complaints, setComplaints }) {
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState(null);
    const [trackId, setTrackId] = useState('');
    const [tracked, setTracked] = useState(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    const myComplaints = useMemo(() =>
        complaints.filter(c => c.citizenId === user?.citizenId),
        [complaints, user]
    );

    const filteredComplaints = useMemo(() => {
        if (!searchQuery) return myComplaints;
        const q = searchQuery.toLowerCase();
        return myComplaints.filter(c =>
            c.title.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q)
        );
    }, [myComplaints, searchQuery]);

    const stats = useMemo(() => ({
        total: myComplaints.length,
        pending: myComplaints.filter(c => c.status === 'PENDING').length,
        resolved: myComplaints.filter(c => c.status === 'RESOLVED').length,
        inProgress: myComplaints.filter(c => c.status === 'IN_PROGRESS').length
    }), [myComplaints]);

    const handleTrack = () => {
        if (!trackId.trim()) return;
        const c = complaints.find(x => x.id === trackId.trim().toUpperCase());
        setTracked(c || null);
        if (c) {
            toast.success('Complaint found!');
        } else {
            toast.error('No complaint found with that ID');
        }
    };

    const handleNewComplaint = (newC) => {
        setComplaints(prev => [newC, ...prev]);
        setShowForm(false);
        toast.success(`Complaint ${newC.id} submitted!`);
    };

    const handleUpdated = (updated) => {
        setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
        setSelected(updated);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>

            {/* Main Content Area */}
            <div style={{ display: 'grid', gap: 32 }}>

                {/* Hero Section */}
                <div style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    borderRadius: 32,
                    padding: '48px 40px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.25)'
                }} className="animate-fade">
                    {/* Abstract background shapes */}
                    <div style={{ position: 'absolute', top: -120, right: -120, width: 340, height: 340, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', filter: 'blur(60px)' }} />
                    <div style={{ position: 'absolute', bottom: -80, left: -80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.4)', filter: 'blur(50px)' }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.15em', opacity: 0.8, marginBottom: 12, textTransform: 'uppercase' }}>Citizen Portal</div>
                                <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
                                <p style={{ opacity: 0.9, fontSize: 17, maxWidth: 420, lineHeight: 1.6, fontWeight: 500 }}>
                                    Your voice matters. Report issues in your community and we'll help get them resolved.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowForm(true)}
                                style={{
                                    background: 'white',
                                    color: '#4f46e5',
                                    border: 'none',
                                    borderRadius: 20,
                                    padding: '18px 32px',
                                    fontWeight: 800,
                                    fontSize: 16,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 25px 30px -5px rgba(0, 0, 0, 0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)';
                                }}
                            >
                                <Icon name="plus" size={22} color="#4f46e5" /> Report Issue
                            </button>
                        </div>

                        {/* Quick Stats Grid (Glassmorphism) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 40 }}>
                            {[
                                { label: 'Active Reports', value: stats.total - stats.resolved, icon: 'clock' },
                                { label: 'Resolved', value: stats.resolved, icon: 'check' },
                                { label: 'Total Filed', value: stats.total, icon: 'clipboard' }
                            ].map((s, i) => (
                                <div key={i} style={{
                                    background: 'rgba(255, 255, 255, 0.12)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: 24,
                                    padding: '20px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 20,
                                    transition: 'background 0.3s'
                                }}>
                                    <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: 12, borderRadius: 16 }}>
                                        <Icon name={s.icon} size={24} color="white" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                                        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', marginTop: 4, letterSpacing: '0.05em' }}>{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Complaint Feed */}
                <div style={{ display: 'grid', gap: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>My Recent Reports</h2>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <Icon name="search" size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    placeholder="Search by ID, title or category..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="input-base"
                                    style={{
                                        paddingLeft: 44,
                                        width: 300,
                                        height: 48,
                                        borderRadius: 16,
                                        border: '1px solid var(--border)',
                                        fontSize: 14,
                                        background: 'var(--card)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {filteredComplaints.length === 0 ? (
                        <div style={{
                            background: 'var(--card)',
                            border: '2px dashed var(--border)',
                            borderRadius: 32,
                            padding: '80px 40px',
                            textAlign: 'center'
                        }} className="animate-fade">
                            <div style={{ fontSize: 72, marginBottom: 24 }}>📪</div>
                            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>No reports found</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 340, margin: '0 auto', lineHeight: 1.6 }}>
                                {searchQuery ? "We couldn't find any reports matching your search. Try a different keyword." : "You haven't reported any issues yet. Click 'Report Issue' to get started."}
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{ marginTop: 20, background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 16 }}>
                            {filteredComplaints.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => setSelected(c)}
                                    style={{
                                        background: 'var(--card)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 24,
                                        padding: 24,
                                        display: 'flex',
                                        gap: 24,
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                    }}
                                    className="animate-slide"
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.borderColor = '#6366f166';
                                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                                    }}
                                >
                                    <div style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 20,
                                        background: `${CAT_COLOR[c.category] || '#6366f1'}12`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 32,
                                        flexShrink: 0,
                                        border: `1px solid ${CAT_COLOR[c.category] || '#6366f1'}22`
                                    }}>
                                        <Icon name="clipboard" size={14} color="#94a3b8" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <h3 style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.01em' }}>{c.title}</h3>
                                            <StatusBadge status={c.status} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', family: 'monospace' }}>#{c.id}</span>
                                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.createdAt || c.date}</span>
                                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                                            <CategoryBadge category={c.category} />
                                        </div>
                                    </div>
                                    {c.status === 'RESOLVED' && c.rating && (
                                        <div style={{ marginLeft: 'auto', textAlign: 'right', paddingRight: 12 }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Rating</div>
                                            <RatingStars value={c.rating} readonly />
                                        </div>
                                    )}
                                    <div style={{ color: 'var(--border)', marginLeft: 10, opacity: 0.5 }}>
                                        <Icon name="check" size={24} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'grid', gap: 32, position: 'sticky', top: 24 }}>

                {/* Track by Ticket ID Card */}
                <div className="card animate-fade" style={{ padding: 28, borderRadius: 32, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ background: '#4f46e512', color: '#4f46e5', padding: 10, borderRadius: 14, border: '1px solid #4f46e522' }}>
                            <Icon name="search" size={20} />
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>Track Progress</h3>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                        Enter a ticket ID to view the latest updates and resolution timeline.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <input
                            value={trackId}
                            onChange={e => setTrackId(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleTrack()}
                            placeholder="e.g. TKT-001"
                            className="input-base"
                            style={{ borderRadius: 16, height: 52, padding: '0 18px', fontSize: 15 }}
                        />
                        <button
                            onClick={handleTrack}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                borderRadius: 16,
                                height: 52,
                                fontSize: 15,
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                            }}
                        >
                            Track Ticket
                        </button>
                    </div>

                    {tracked !== undefined && tracked !== null && (
                        <div
                            style={{
                                marginTop: 24,
                                padding: 20,
                                background: 'var(--bg)',
                                borderRadius: 20,
                                border: '1px solid var(--border)',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
                            }}
                            onClick={() => setSelected(tracked)}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#6366f1';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <StatusBadge status={tracked.status} />
                                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', opacity: 0.8 }}>{tracked.id}</span>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>{tracked.title}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLOR[tracked.category] || '#6366f1' }} />
                                {tracked.category} Category
                            </div>
                        </div>
                    )}
                </div>

                {/* Helpful Tips Card */}
                <div className="card animate-fade" style={{
                    padding: 28,
                    borderRadius: 32,
                    background: 'linear-gradient(to bottom right, var(--card), var(--bg))',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ background: '#f59e0b12', color: '#f59e0b', padding: 10, borderRadius: 14, border: '1px solid #f59e0b22' }}>
                            <Icon name="alert" size={20} />
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>Reporting Tips</h3>
                    </div>
                    <ul style={{ display: 'grid', gap: 18, padding: 0, listStyle: 'none' }}>
                        {[
                            { text: 'Be specific with descriptions', icon: 'check', color: '#10b981' },
                            { text: 'Upload clear photos of the issue', icon: 'image', color: '#3b82f6' },
                            { text: 'Verify the location accurately', icon: 'pin', color: '#ef4444' }
                        ].map((tip, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                <div style={{ marginTop: 2 }}><Icon name={tip.icon} size={16} color={tip.color} /></div>
                                <span style={{ fontWeight: 500 }}>{tip.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Statistics Card */}
                <KPICard
                    label="Resolution Effectiveness"
                    value={stats.total ? `${Math.round((stats.resolved / stats.total) * 100)}%` : '0%'}
                    icon="trending"
                    color="#10b981"
                    sub="Overall resolved reports"
                />

            </div>

            <Modal open={showForm} onClose={() => setShowForm(false)} title="📝 Report New Issue" wide>
                <ComplaintForm onSubmit={handleNewComplaint} onClose={() => setShowForm(false)} />
            </Modal>

            <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.id || 'Report Details'}>
                {selected && <ComplaintDetail complaint={selected} role="citizen" onUpdated={handleUpdated} />}
            </Modal>
        </div>
    );
}
