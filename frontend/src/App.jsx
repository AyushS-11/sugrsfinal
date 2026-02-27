import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, ThemeProvider } from './context/index.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';

// Public Pages
import FileComplaint from './pages/public/FileComplaint.jsx';
import TrackComplaint from './pages/public/TrackComplaint.jsx';
import Transparency from './pages/public/Transparency.jsx';
import Reports from './pages/public/Reports.jsx';
import MapPage from './pages/public/Map.jsx';
import Assistant from './pages/public/Assistant.jsx';
import Feedback from './pages/public/Feedback.jsx';

// Auth
import AuthLogin from './pages/auth/AuthLogin.jsx';

// Protected Layout
import DashboardLayout from './components/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard.jsx';
import ComplaintQueue from './pages/officer/ComplaintQueue.jsx';
import ResolveComplaint from './pages/officer/ResolveComplaint.jsx';

// Supervisor Pages
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard.jsx';
import Analytics from './pages/supervisor/Analytics.jsx';
import AllComplaints from './pages/supervisor/AllComplaints.jsx';
import Officers from './pages/supervisor/Officers.jsx';
import SupervisorHeatmap from './pages/supervisor/Heatmap.jsx';
import Escalations from './pages/supervisor/Escalations.jsx';
import AccountabilityPage from './pages/supervisor/Accountability.jsx';
import MergeTicketsPage from './pages/supervisor/MergeTickets.jsx';

function AppRoutes() {
    return (
        <Routes>
            {/* ─── PUBLIC ROUTES (No Auth Required) ─── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/file" element={<FileComplaint />} />
            <Route path="/track" element={<TrackComplaint />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/feedback" element={<Feedback />} />

            {/* ─── AUTH ROUTES ─── */}
            <Route path="/officer/login" element={<AuthLogin role="officer" />} />
            <Route path="/supervisor/login" element={<AuthLogin role="supervisor" />} />

            {/* ─── OFFICER PROTECTED ROUTES ─── */}
            <Route path="/officer" element={
                <ProtectedRoute allowedRoles={['officer']}>
                    <DashboardLayout />
                </ProtectedRoute>
            }>
                <Route path="dashboard" element={<OfficerDashboard />} />
                <Route path="queue" element={<ComplaintQueue />} />
                <Route path="resolve" element={<ResolveComplaint />} />
                <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* ─── SUPERVISOR PROTECTED ROUTES ─── */}
            <Route path="/supervisor" element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                    <DashboardLayout />
                </ProtectedRoute>
            }>
                <Route path="dashboard" element={<SupervisorDashboard />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="accountability" element={<AccountabilityPage />} />
                <Route path="merge" element={<MergeTicketsPage />} />
                <Route path="complaints" element={<AllComplaints />} />
                <Route path="officers" element={<Officers />} />
                <Route path="heatmap" element={<SupervisorHeatmap />} />
                <Route path="escalations" element={<Escalations />} />
                <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* ─── CATCH ALL ─── */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function Root() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <AppRoutes />
                    <Toaster position="top-right" toastOptions={{
                        style: { background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)' }
                    }} />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}
