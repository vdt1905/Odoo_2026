import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('user'),
    isLoading: false,
    error: null,

    signup: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/signup`, { name, email, password });
            localStorage.setItem('user', JSON.stringify(response.data));
            set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error signing up', isLoading: false });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            localStorage.setItem('user', JSON.stringify(response.data));
            set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error logging in', isLoading: false });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
    },
}));

export default useAuthStore;
