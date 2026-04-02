import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach token from localStorage as fallback
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if not already on auth pages
            if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ============================================================
// AUTH API
// ============================================================
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
};

// ============================================================
// USER API
// ============================================================
export const userAPI = {
    getProfile: (id) => api.get(`/users/${id}`),
    updateProfile: (data) => api.put('/users/profile', data),
    getHistory: () => api.get('/users/history'),
    updateHistory: (storyId) => api.post('/users/history', { storyId }),
    getFavourites: () => api.get('/users/favourites'),
    addFavourite: (storyId) => api.post('/users/favourites', { storyId }),
    removeFavourite: (storyId) => api.delete(`/users/favourites/${storyId}`),
};

// ============================================================
// STORY API
// ============================================================
export const storyAPI = {
    getAll: (params) => api.get('/stories', { params }),
    getById: (id) => api.get(`/stories/${id}`),
    create: (data) => api.post('/stories', data),
    update: (id, data) => api.put(`/stories/${id}`, data),
    delete: (id) => api.delete(`/stories/${id}`),
    getComments: (id) => api.get(`/stories/${id}/comments`),
    addComment: (id, data) => api.post(`/stories/${id}/comments`, data),
};

// ============================================================
// CHAPTER API
// ============================================================
export const chapterAPI = {
    getAll: (storyId) => api.get(`/stories/${storyId}/chapters`),
    getById: (storyId, chapterId) => api.get(`/stories/${storyId}/chapters/${chapterId}`),
    create: (storyId, data) => api.post(`/stories/${storyId}/chapters`, data),
    update: (storyId, chapterId, data) => api.put(`/stories/${storyId}/chapters/${chapterId}`, data),
    delete: (storyId, chapterId) => api.delete(`/stories/${storyId}/chapters/${chapterId}`),
};

export default api;
