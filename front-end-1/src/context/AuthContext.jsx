import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, setTokens, clearTokens, getToken, getRefreshToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true) // true while we try to restore session
    const [error, setError] = useState(null)

    // ─── Restore session on mount ────────────────────────────────────────────
    useEffect(() => {
        const restore = async () => {
            const token = getToken()
            if (!token) {
                setLoading(false)
                return
            }
            try {
                const me = await authApi.me()
                setUser(me)
            } catch (_) {
                // Token may be expired — try refresh
                const refreshToken = getRefreshToken()
                if (refreshToken) {
                    try {
                        const data = await authApi.refresh(refreshToken)
                        setTokens(data.access_token, data.refresh_token)
                        setUser(data.user)
                    } catch (_) {
                        clearTokens()
                    }
                } else {
                    clearTokens()
                }
            } finally {
                setLoading(false)
            }
        }

        restore()
    }, [])

    // ─── Login ────────────────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        setError(null)
        const data = await authApi.login(email, password)
        setTokens(data.access_token, data.refresh_token)
        setUser(data.user)
        return data.user
    }, [])

    // ─── Signup ───────────────────────────────────────────────────────────────
    const signup = useCallback(async (email, password, consentGiven = false) => {
        setError(null)
        const data = await authApi.signup(email, password, consentGiven)
        setTokens(data.access_token, data.refresh_token)
        setUser(data.user)
        return data.user
    }, [])

    // ─── Logout ───────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        try {
            await authApi.logout()
        } catch (_) {
            // Ignore server errors on logout; we still clear local state
        } finally {
            clearTokens()
            setUser(null)
        }
    }, [])

    // ─── Refresh ─────────────────────────────────────────────────────────────
    const refreshSession = useCallback(async () => {
        const refreshToken = getRefreshToken()
        if (!refreshToken) throw new Error('No refresh token available')
        const data = await authApi.refresh(refreshToken)
        setTokens(data.access_token, data.refresh_token)
        setUser(data.user)
        return data.user
    }, [])

    const value = {
        user,
        loading,
        error,
        setError,
        login,
        signup,
        logout,
        refreshSession,
        isAuthenticated: !!user,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}

export default AuthContext
