import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/client.js';
import { useAuth } from '../../context/index.jsx';
import toast from 'react-hot-toast';

export default function AuthLogin({ role = 'officer' }) {
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const isOfficer = role === 'officer';
    const accent = isOfficer ? '#0ea5e9' : '#8b5cf6';
    const gradient = isOfficer ? 'linear-gradient(135deg, #0ea5e9, #38bdf8)' : 'linear-gradient(135deg, #8b5cf6, #a78bfa)';
    const icon = isOfficer ? '🛡️' : '⚙️';
    const title = isOfficer ? 'Officer Login' : 'Supervisor Login';
    const sub = isOfficer ? 'Manage & resolve complaint queue' : 'System analytics & oversight';
    const demoEmail = isOfficer ? 'rajan@sugrs.in' : 'admin@sugrs.in';
    const demoPass = isOfficer ? 'officer123' : 'admin123';

    const handleLogin = async (e) => {
        e?.preventDefault();
        if (!email || !password) return;
        setLoading(true);
        try {
            const res = await login(email, password);
            const userData = res.data.user;
            const token = res.data.token;
            localStorage.setItem('sugrs_token', token);
            authLogin(userData);
            toast.success(`Welcome, ${userData.name}!`);
            navigate(isOfficer ? '/officer/dashboard' : '/supervisor/dashboard');
        } catch (e) {
            const msg = e.response?.data?.error || 'Login failed — is the backend running?';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDemo = () => {
        setEmail(demoEmail);
        setPassword(demoPass);
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#0f172a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: 20,
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Background */}
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 30% 50%,${accent}18 0%,transparent 60%),radial-gradient(ellipse at 70% 50%,${accent}10 0%,transparent 60%)` }} />
            <div style={{ position: 'absolute', top: '10%', left: '5%', width: 380, height: 380, borderRadius: '50%', border: '1px solid #ffffff07', animation: 'spin 25s linear infinite' }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 250, height: 250, borderRadius: '50%', border: '1px solid #ffffff07', animation: 'spin 18s linear infinite reverse' }} />

            <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }} className="animate-fade">
                {/* Back */}
                <button onClick={() => navigate('/')} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                    borderRadius: 8, border: '1px solid #1e293b', background: 'transparent',
                    color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 28, fontFamily: 'inherit',
                }}>← Back to Home</button>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 18, background: gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 30, margin: '0 auto 16px', boxShadow: `0 12px 40px ${accent}55`,
                    }}>{icon}</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>{title}</div>
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{sub}</div>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} style={{ display: 'grid', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, letterSpacing: '.5px' }}>EMAIL</label>
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            style={{
                                width: '100%', padding: '14px 16px', borderRadius: 12,
                                border: '1.5px solid #1e293b', background: '#1e293b',
                                color: 'white', fontSize: 14, fontWeight: 500,
                                outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = accent}
                            onBlur={e => e.currentTarget.style.borderColor = '#1e293b'}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, letterSpacing: '.5px' }}>PASSWORD</label>
                        <input
                            type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            style={{
                                width: '100%', padding: '14px 16px', borderRadius: 12,
                                border: '1.5px solid #1e293b', background: '#1e293b',
                                color: 'white', fontSize: 14, fontWeight: 500,
                                outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = accent}
                            onBlur={e => e.currentTarget.style.borderColor = '#1e293b'}
                        />
                    </div>
                    <button type="submit" disabled={loading || !email || !password} style={{
                        padding: '14px', borderRadius: 12, border: 'none',
                        background: gradient, color: 'white', fontWeight: 800,
                        fontSize: 15, cursor: loading ? 'wait' : 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.2s',
                        boxShadow: `0 6px 20px ${accent}44`,
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {loading ? <><Icon name="loader" size={14} color="white" /> Logging in…</> : `Login as ${isOfficer ? 'Officer' : 'Supervisor'}`}
                    </button>
                </form>

                {/* Demo Credentials */}
                <div style={{ background: '#1e293b', borderRadius: 14, padding: 16, marginTop: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 10, letterSpacing: '.5px' }}>DEMO CREDENTIALS</div>
                    <div style={{ background: '#0f172a', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Email: <span style={{ color: accent }}>{demoEmail}</span></div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Password: <span style={{ color: accent }}>{demoPass}</span></div>
                    </div>
                    <button onClick={handleDemo} style={{
                        width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${accent}44`,
                        background: `${accent}10`, color: accent, fontSize: 12,
                        fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    }}>Auto-fill Demo Credentials</button>
                </div>

                <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#334155' }}>
                    {isOfficer ? 'Supervisor? ' : 'Officer? '}
                    <span onClick={() => navigate(isOfficer ? '/supervisor/login' : '/officer/login')} style={{ color: accent, cursor: 'pointer', fontWeight: 700 }}>
                        {isOfficer ? 'Supervisor Login &rarr;' : 'Officer Login &rarr;'}
                    </span>
                </div>
            </div>
        </div>
    );
}
