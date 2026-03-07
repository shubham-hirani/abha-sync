import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { recordsApi } from '../services/api'
import { useAuth } from './AuthContext'

const RecordsContext = createContext(null)

export function RecordsProvider({ children }) {
    const { isAuthenticated } = useAuth()
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // ─── Fetch all records ────────────────────────────────────────────────────
    const fetchRecords = useCallback(async () => {
        if (!isAuthenticated) return
        setLoading(true)
        setError(null)
        try {
            const data = await recordsApi.list()
            setRecords(data.records || [])
        } catch (err) {
            setError(err.message || 'Failed to load records')
        } finally {
            setLoading(false)
        }
    }, [isAuthenticated])

    // Auto-fetch when user logs in
    useEffect(() => {
        if (isAuthenticated) {
            fetchRecords()
        } else {
            setRecords([])
        }
    }, [isAuthenticated, fetchRecords])

    // ─── Delete a record ─────────────────────────────────────────────────────
    const deleteRecord = useCallback(async (recordId) => {
        await recordsApi.delete(recordId)
        setRecords(prev => prev.filter(r => r.id !== recordId))
    }, [])

    // ─── Analyze a record ─────────────────────────────────────────────────────
    const analyzeRecord = useCallback(async (recordId) => {
        const updated = await recordsApi.analyze(recordId)
        setRecords(prev => prev.map(r => r.id === recordId ? updated : r))
        return updated
    }, [])

    // ─── Add a newly uploaded record ─────────────────────────────────────────
    const addRecord = useCallback((record) => {
        setRecords(prev => [record, ...prev])
    }, [])

    // ─── Update a record in state ─────────────────────────────────────────────
    const updateRecord = useCallback((record) => {
        setRecords(prev => prev.map(r => r.id === record.id ? record : r))
    }, [])

    const value = {
        records,
        loading,
        error,
        fetchRecords,
        deleteRecord,
        analyzeRecord,
        addRecord,
        updateRecord,
        totalRecords: records.length,
    }

    return (
        <RecordsContext.Provider value={value}>
            {children}
        </RecordsContext.Provider>
    )
}

export function useRecords() {
    const ctx = useContext(RecordsContext)
    if (!ctx) throw new Error('useRecords must be used inside <RecordsProvider>')
    return ctx
}

export default RecordsContext
