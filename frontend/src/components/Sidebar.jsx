import { useAuth, useTheme } from '../context/index.jsx';
import { Icon } from './index.jsx';

const TABS = {
    citizen: [
        { id: 'dashboard', label: 'Dashboard', icon: 'home' },
        { id: 'complaints', label: 'My Complaints', icon: 'clipboard' },
    ],
    officer: [
        { id: 'dashboard', label: 'Dashboard', icon: 'home' },
        { id: 'queue', label: 'Complaint Queue', icon: 'clipboard' },
        { id: 'resolved', label: 'Resolved', icon: 'check' },
    ],
    admin: [
        { id: 'dashboard', label: 'Dashboard', icon: 'home' },
        { id: 'analytics', label: 'Analytics', icon: 'chart' },
        { id: 'accountability', label: 'Accountability', icon: 'check' },
        { id: 'merge', label: 'Merge Tickets', icon: 'log' },
        { id: 'complaints', label: 'All Complaints', icon: 'clipboard' },
        { id: 'officers', label: 'Officers', icon: 'users' },
        { id: 'heatmap', label: 'Heatmap', icon: 'map' },
        { id: 'escalations', label: 'Escalation Log', icon: 'alert' },
    ],
};

const ROLE_CFG = {
    citizen: { color: '#6366f1', label: 'Citizen Portal', name: 'Priya Sharma', sub: 'Citizen #C001' },
    officer: { color: '#0ea5e9', label: 'Officer Console', name: 'Rajan Mehta', sub: 'Water Dept.' },
    admin: { color: '#8b5cf6', label: 'Admin Panel', name: 'System Admin', sub: 'All Departments' },
};

export default function Sidebar({ activeTab, setActiveTab }) {
    const { user, logout } = useAuth();
    const { dark, toggle } = useTheme();
    const role = user?.role;
    const cfg = ROLE_CFG[role] || ROLE_CFG.citizen;

    return (
        <div style={{ width: 220, background: 'var(--sidebar)', minHeight: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            {/* Logo */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${cfg.color},${cfg.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="activity" size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 13, color: 'white' }}>SUGRS</div>
                        <div style={{ fontSize: 10, color: '#475569' }}>{cfg.label}</div>
                    </div>
                </div>
                {/* User Card */}
                <div style={{ background: 'var(--sidebar-item)', borderRadius: 12, padding: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${cfg.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                        {(user?.name || cfg.name)[0]}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'white' }}>{user?.name || cfg.name}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{user?.department ? `${user.department} Dept.` : cfg.sub}</div>
                </div>
            </div>
            {/* Nav */}
            <div style={{ flex: 1, padding: '16px 10px' }}>
                {(TABS[role] || []).map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        borderRadius: 10, border: 'none', background: activeTab === tab.id ? cfg.color : 'transparent',
                        color: activeTab === tab.id ? 'white' : '#64748b', fontWeight: 600, fontSize: 13,
                        cursor: 'pointer', marginBottom: 3, textAlign: 'left', transition: 'all .15s'
                    }}>
                        <Icon name={tab.icon} size={15} color={activeTab === tab.id ? 'white' : '#64748b'} />
                        {tab.label}
                    </button>
                ))}
            </div>
            {/* Bottom */}
            <div style={{ padding: '0 10px 16px' }}>
                <button onClick={toggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 4 }}>
                    <Icon name={dark ? 'sun' : 'moon'} size={15} color="#64748b" />
                    {dark ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    <Icon name="logout" size={15} color="#64748b" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
