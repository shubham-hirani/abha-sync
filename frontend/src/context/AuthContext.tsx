import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../services/api";

interface User {
    user_id: string;
    supabase_uid: string;
    email: string;
    abha_number: string | null;
    preferred_language: string;
    consent_given: boolean;
    created_at: string | null;
    last_login: string | null;
}

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signup: (email: string, password: string, consentGiven?: boolean) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount, try to restore session from localStorage
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            authApi
                .getMe()
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const signup = useCallback(async (email: string, password: string, consentGiven = false) => {
        const res = await authApi.signup(email, password, consentGiven);
        const { access_token, refresh_token, user: userData } = res.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        setUser(userData);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await authApi.login(email, password);
        const { access_token, refresh_token, user: userData } = res.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated: !!user, isLoading, signup, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
