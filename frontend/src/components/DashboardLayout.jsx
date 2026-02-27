import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from "../context";
import { useWebSocket } from '../hooks';
import { Icon } from "./index.jsx";
import AIChat from "../features/AIChat.jsx";
import { getComplaints } from '../api/client.js';

const OFFICER_TABS = [
    { id: '/officer/dashboard', label: 'Dashboard', icon: 'home' },
    { id: '/officer/queue', label: 'Complaint Queue', icon: 'clipboard' },
    { id: '/officer/resolve', label: 'Resolve', icon: 'check' },
];

const SUPERVISOR_TABS = [
    { id: '/supervisor/dashboard', label: 'Dashboard', icon: 'home' },
    { id: '/supervisor/analytics', label: 'Analytics', icon: 'chart' },
    { id: '/supervisor/accountability', label: 'Accountability', icon: 'check' },
    { id: '/supervisor/merge', label: 'Merge Tickets', icon: 'log' },
    { id: '/supervisor/complaints', label: 'All Complaints', icon: 'clipboard' },
    { id: '/supervisor/officers', label: 'Officers', icon: 'users' },
    { id: '/supervisor/heatmap', label: 'Heatmap', icon: 'map' },
    { id: '/supervisor/escalations', label: 'Escalations', icon: 'alert' },
];

const ROLE_CFG = {
    officer: { color: '#0ea5e9', label: 'Officer Console', gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' },
    supervisor: { color: '#8b5cf6', label: 'Supervisor Panel', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
};

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const { dark, toggle } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);

    // Map admin → supervisor role for UI
    const role = user?.role === 'admin' ? 'supervisor' : user?.role;
    const tabs = role === 'officer' ? OFFICER_TABS : SUPERVISOR_TABS;
    const cfg = ROLE_CFG[role] || ROLE_CFG.officer;

    useEffect(() => {
        (async () => {
            try {
                const res = await getComplaints();
                setComplaints(res.data);
            } catch { }
        })();
    }, []);

    const onWsMessage = useCallback((msg) => {
        if (msg.type === 'NEW_COMPLAINT') setComplaints(prev => [msg.data, ...prev.filter(c => c.id !== msg.data.id)]);
        if (msg.type === 'STATUS_UPDATE') setComplaints(prev => prev.map(c => c.id === msg.data.id ? msg.data : c));
    }, []);
    const { connected } = useWebSocket(onWsMessage);

    const handleLogout = () => {
        localStorage.removeItem('sugrs_token');
        logout();
        navigate('/');
    };

    // Current tab label
    const activeTab = tabs.find(t => location.pathname === t.id) || tabs[0];
    const topLabel = activeTab?.label || 'Dashboard';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Sidebar */}
            <div style={{ width: 220, background: 'var(--sidebar)', minHeight: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                {/* Logo */}
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="trending" size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 13, color: 'white' }}>SUGRS</div>
                            <div style={{ fontSize: 10, color: '#475569' }}>{cfg.label}</div>
                        </div>
                    </div>
                    {/* User Card */}
                    <div style={{ background: 'var(--sidebar-item)', borderRadius: 12, padding: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${cfg.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                            {(user?.name || 'U')[0]}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'white' }}>{user?.name || 'User'}</div>
                        <div style={{ fontSize: 11, color: '#475569' }}>{user?.department ? `${user.department} Dept.` : role === 'supervisor' ? 'All Departments' : ''}</div>
                    </div>
                </div>
                {/* Nav */}
                <div style={{ flex: 1, padding: '16px 10px' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => navigate(tab.id)} style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                            borderRadius: 10, border: 'none',
                            background: location.pathname === tab.id ? cfg.color : 'transparent',
                            color: location.pathname === tab.id ? 'white' : '#64748b',
                            fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 3,
                            textAlign: 'left', transition: 'all .15s', fontFamily: 'inherit',
                        }}>
                            <Icon name={tab.icon} size={15} color={location.pathname === tab.id ? 'white' : '#64748b'} />
                            {tab.label}
                        </button>
                    ))}
                </div>
                {/* Bottom */}
                <div style={{ padding: '0 10px 16px' }}>
                    <button onClick={toggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 4, fontFamily: 'inherit' }}>
                        <Icon name={dark ? 'sun' : 'moon'} size={15} color="#64748b" />
                        {dark ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Icon name="logout" size={15} color="#64748b" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Topbar */}
                <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', textTransform: 'capitalize' }}>{topLabel}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div className={`live-dot ${connected ? 'animate-pulse-dot' : ''}`} style={{ background: connected ? '#10b981' : '#6b7280' }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: connected ? '#10b981' : 'var(--text-muted)' }}>{connected ? 'LIVE' : 'OFFLINE'}</span>
                        </div>
                        <div style={{ background: `${cfg.color}15`, color: cfg.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                            {role}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{user?.name}</span>
                    </div>
                </div>
                {/* Content */}
                <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
                    <Outlet />
                </div>
            </div>

            {/* AI Chatbot */}
            <AIChat complaints={complaints} />
        </div>
    );
}
