import axios from 'axios';

// Use environment variable for API base URL, fallback to /api for proxy
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({ baseURL });

// Auto-attach JWT token if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sugrs_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });

// Complaints
export const getComplaints = (citizenId) => api.get('/complaints', { params: citizenId ? { citizenId } : {} });
export const getComplaint = (id) => api.get(`/complaints/${id}`);
export const submitComplaint = (data) => api.post('/complaints', data);
export const createComplaint = submitComplaint; // alias
export const trackComplaint = (id) => api.get(`/complaints/${id}`);
export const updateStatus = (id, status, note) => api.patch(`/complaints/${id}/status`, { status, note });
export const updateComplaint = updateStatus; // alias
export const rateComplaint = (id, rating) => api.patch(`/complaints/${id}/rating`, { rating });
export const uploadImage = (id, file) => {
    const fd = new FormData(); fd.append('image', file);
    return api.post(`/complaints/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Officers
export const getOfficers = () => api.get('/officers');

// Analytics
export const getAnalytics = () => api.get('/analytics/overview');

// AI
export const classifyText = (text) => api.post('/ai/classify', { text });
export const chatAI = (message, history, stats, extracted_fields, selected_language = 'English', input_mode = 'text') =>
    api.post('/ai/chat', { message, history, stats, extracted_fields, selected_language, input_mode });

// Civic Community Hub
export const getCivicFeed = () => api.get('/civic/feed');
export const getCivicLeaderboard = () => api.get('/civic/leaderboard');
export const upvoteCivic = (id, citizenId) => api.post(`/civic/upvote/${id}`, { citizenId });
export const volunteerCivic = (id, citizenId, citizenName) => api.post(`/civic/volunteer/${id}`, { citizenId, citizenName });
export const resolveCivic = (id, citizenId, citizenName) => api.post(`/civic/resolve/${id}`, { citizenId, citizenName });
export const commentCivic = (id, citizenId, citizenName, text) => api.post(`/civic/comment/${id}`, { citizenId, citizenName, text });

// Analytics
export const getAccountability = () => api.get('/analytics/accountability');
export const getAnalyticsOverview = () => api.get('/analytics/overview');

// Feedback
export const getPublicFeedback = () => api.get('/feedback/public');
export const getFeedbackStats = () => api.get('/feedback/stats');
export const submitFeedback = (data) => api.post('/feedback', data);

export default api;
