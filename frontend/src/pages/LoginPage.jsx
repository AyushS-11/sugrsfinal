import { useState } from 'react';
import { login } from '../api/client.js';
import { useAuth } from '../context/index.jsx';
import toast from 'react-hot-toast';

const DEMO_USERS = [
    { role: 'citizen', label: 'Login as Citizen', sub: 'Report & track civic issues', color: '#6366f1', icon: '👤', bg: 'linear-gradient(135deg,#6366f1,#818cf8)', email: 'priya@sugrs.in', pass: 'citizen123' },
    { role: 'officer', label: 'Login as Officer', sub: 'Manage & resolve complaint queue', color: '#0ea5e9', icon: '🛡️', bg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', email: 'rajan@sugrs.in', pass: 'officer123' },
    { role: 'admin', label: 'Login as Admin', sub: 'System analytics & oversight', color: '#8b5cf6', icon: '⚙️', bg: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', email: 'admin@sugrs.in', pass: 'admin123' },
];

export default function LoginPage() {
    const { login: authLogin } = useAuth();
    const [loading, setLoading] = useState(null);

    const handleLogin = async (u) => {
        setLoading(u.role);
        try {
            const res = await login(u.email, u.pass);
            authLogin(res.data.user);
        } catch {
            toast.error('Login failed — is the backend running?');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans,Segoe UI,sans-serif', padding: 20, position: 'relative', overflow: 'hidden' }}>
            {/* Animated background */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%,#6366f118 0%,transparent 60%),radial-gradient(ellipse at 70% 50%,#8b5cf618 0%,transparent 60%)' }} />
            <div style={{ position: 'absolute', top: '8%', left: '4%', width: 400, height: 400, borderRadius: '50%', border: '1px solid #ffffff07', animation: 'spin 25s linear infinite' }} />
            <div style={{ position: 'absolute', bottom: '8%', right: '4%', width: 250, height: 250, borderRadius: '50%', border: '1px solid #ffffff07', animation: 'spin 18s linear infinite reverse' }} />

            <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }} className="animate-fade">
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 12px 40px #6366f155' }}>
                        <Icon name="trending" size={34} color="white" />
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-1.5px' }}>SUGRS</div>
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 5, lineHeight: 1.4 }}>Smart Urban Grievance &amp; Service Response System</div>
                </div>

                {/* Role Cards */}
                <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
                    {DEMO_USERS.map(u => (
                        <button key={u.role} onClick={() => handleLogin(u)} disabled={!!loading} style={{
                            padding: '18px 22px', borderRadius: 16, border: '1px solid #1e293b',
                            background: '#1e293b', cursor: loading ? 'wait' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 16, transition: 'all .2s', textAlign: 'left', width: '100%'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#262f45'; e.currentTarget.style.borderColor = u.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                            <div style={{ width: 52, height: 52, borderRadius: 15, background: u.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, boxShadow: `0 6px 20px ${u.color}44` }}>
                                {loading === u.role ? <div style={{ width: 22, height: 22, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : u.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: 15, color: 'white', marginBottom: 2 }}>{u.label}</div>
                                <div style={{ fontSize: 12, color: '#475569' }}>{u.sub}</div>
                            </div>
                            <div style={{ color: '#334155', fontSize: 22 }}>›</div>
                        </button>
                    ))}
                </div>

                {/* Demo credentials */}
                <div style={{ background: '#1e293b', borderRadius: 14, padding: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 10, letterSpacing: '.5px' }}>DEMO CREDENTIALS</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {DEMO_USERS.map(u => (
                            <div key={u.role} style={{ background: '#0f172a', borderRadius: 10, padding: '8px 10px' }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: u.color, marginBottom: 3 }}>{u.role.toUpperCase()}</div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>{u.email}</div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>{u.pass}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#334155' }}>Click any card to demo · No setup required</div>
            </div>
        </div>
    );
}
