'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Initial check: Get user from localStorage or just wait for middleware to handle redirects.
        // For a more robust solution, we could call an /api/auth/me endpoint here.
        const storedUser = localStorage.getItem('couture_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse stored user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setUser(data.user);
                localStorage.setItem('couture_user', JSON.stringify(data.user));
                router.push('/');
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Login failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    };

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        localStorage.removeItem('couture_user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
