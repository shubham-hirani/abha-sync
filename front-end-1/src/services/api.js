/**
 * ABHA-Sync API Service
 * Central fetch wrapper for all backend communication.
 */

const BASE_URL = import.meta.env.VITE_API_URL || ''

// ─── Token Helpers ─────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem('access_token')
export const getRefreshToken = () => localStorage.getItem('refresh_token')

export const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken)
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
}

export const clearTokens = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    // Remove legacy key from old mock auth
    localStorage.removeItem('isLoggedIn')
}

// ─── Core Request ──────────────────────────────────────────────────────────

/**
 * @param {string} method - HTTP verb
 * @param {string} path   - API path (e.g. '/api/v1/auth/login')
 * @param {object|null} body     - JSON body
 * @param {FormData|null} formData - multipart body (takes precedence over body)
 * @param {boolean} skipAuth  - when true, omit Authorization header
 */
async function apiRequest(method, path, body = null, formData = null, skipAuth = false) {
    const headers = {}

    if (!formData) {
        headers['Content-Type'] = 'application/json'
    }

    if (!skipAuth) {
        const token = getToken()
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }
    }

    const options = {
        method,
        headers,
    }

    if (formData) {
        options.body = formData
    } else if (body) {
        options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${path}`, options)

    if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
            const errData = await response.json()
            if (errData.detail) {
                errorMessage = typeof errData.detail === 'string'
                    ? errData.detail
                    : JSON.stringify(errData.detail)
            }
        } catch (_) {
            // ignore JSON parse errors on error responses
        }
        throw new Error(errorMessage)
    }

    // Some endpoints return empty body (204 / 200 with no content)
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
        return response.json()
    }
    return null
}

// ─── Auth API ──────────────────────────────────────────────────────────────

export const authApi = {
    /**
     * Register a new user.
     * @param {string} email
     * @param {string} password
     * @param {boolean} consentGiven
     * @returns {Promise<AuthResponse>}
     */
    signup(email, password, consentGiven = false) {
        return apiRequest('POST', '/api/v1/auth/signup', {
            email,
            password,
            consent_given: consentGiven,
        }, null, true)
    },

    /**
     * Authenticate with email/password.
     * @returns {Promise<AuthResponse>}
     */
    login(email, password) {
        return apiRequest('POST', '/api/v1/auth/login', { email, password }, null, true)
    },

    /**
     * Refresh session using a refresh token.
     * @returns {Promise<AuthResponse>}
     */
    refresh(refreshToken) {
        return apiRequest('POST', '/api/v1/auth/refresh', { refresh_token: refreshToken }, null, true)
    },

    /**
     * Logout (invalidates all sessions server-side).
     * @returns {Promise<MessageResponse>}
     */
    logout() {
        return apiRequest('POST', '/api/v1/auth/logout')
    },

    /**
     * Get the current authenticated user's profile.
     * @returns {Promise<UserOut>}
     */
    me() {
        return apiRequest('GET', '/api/v1/auth/me')
    },
}

// ─── Records API ───────────────────────────────────────────────────────────

export const recordsApi = {
    /**
     * List all records for the authenticated user.
     * @returns {Promise<RecordListResponse>}
     */
    list() {
        return apiRequest('GET', '/api/v1/records')
    },

    /**
     * Get a single record's metadata.
     * @returns {Promise<RecordOut>}
     */
    get(recordId) {
        return apiRequest('GET', `/api/v1/records/${recordId}`)
    },

    /**
     * Upload a medical record file.
     * @param {File} file
     * @param {string} recordType
     * @param {string} notes
     * @returns {Promise<RecordOut>}
     */
    upload(file, recordType = 'record', notes = '') {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('record_type', recordType)
        formData.append('notes', notes)
        return apiRequest('POST', '/api/v1/records/upload', null, formData)
    },

    /**
     * Trigger AI analysis on an existing record.
     * Returns cached result if already analyzed.
     * @returns {Promise<RecordOut>}
     */
    analyze(recordId) {
        return apiRequest('POST', `/api/v1/records/${recordId}/analyze`)
    },

    /**
     * Delete a record (removes from S3 + DB).
     * @returns {Promise<RecordDeleteResponse>}
     */
    delete(recordId) {
        return apiRequest('DELETE', `/api/v1/records/${recordId}`)
    },

    /**
     * Build a URL to stream the record file through the backend proxy.
     * Uses token as query param so <img> / <object> tags can authenticate.
     * @param {string} recordId
     * @returns {string}
     */
    fileUrl(recordId) {
        const token = getToken()
        return `${BASE_URL}/api/v1/records/${recordId}/file?token=${encodeURIComponent(token)}`
    },
}

// ─── Health ────────────────────────────────────────────────────────────────

export const healthApi = {
    check() {
        return apiRequest('GET', '/health', null, null, true)
    },
}
