import { Navigate } from 'react-router-dom';
import { useAuth } from "../context";

/**
 * ProtectedRoute — Wraps routes requiring authentication.
 * Only allows access if user is logged in with the correct role.
 * Redirects to the appropriate login page otherwise.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user } = useAuth();

    if (!user) {
        // Not logged in — redirect to landing
        return <Navigate to="/" replace />;
    }

    // Map 'admin' role to 'supervisor' for permission checks
    const userRole = user.role === 'admin' ? 'supervisor' : user.role;

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // Logged in but wrong role — redirect to their dashboard
        if (userRole === 'officer') return <Navigate to="/officer/dashboard" replace />;
        if (userRole === 'supervisor') return <Navigate to="/supervisor/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
}
