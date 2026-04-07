import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            loading: true,

            setUser: (user) => set({
                user: user ? {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || user.name || '사용자',
                    role: user.role || 'individual',
                    businessInfo: user.businessInfo || null,
                } : null,
                isAuthenticated: !!user,
                loading: false
            }),

            setLoading: (loading) => set({ loading }),

            logout: () => set({ user: null, isAuthenticated: false, loading: false }),
        }),
        {
            name: 'flooring-auth-storage'
        }
    )
);
