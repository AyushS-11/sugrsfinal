import { createContext, useContext, useState, useEffect } from 'react';

// ─── Auth Context ──────────────────────────────────────
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('sugrs_user')); } catch { return null; }
    });

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('sugrs_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('sugrs_user');
    };

    return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

// ─── Theme Context ─────────────────────────────────────
const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
    const [dark, setDark] = useState(() => localStorage.getItem('sugrs_theme') === 'dark');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.setItem('sugrs_theme', dark ? 'dark' : 'light');
    }, [dark]);

    return <ThemeCtx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
