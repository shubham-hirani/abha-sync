/**
 * ABHA-Sync API Client
 * 
 * Centralized API layer for frontend → API Gateway communication.
 * Replaces mock data with real API calls.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('authToken');
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error?.message || `Request failed with status ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(`Network error: ${err.message}`, 0);
    }
  }

  // ═══════════════════════════════════
  //  AUTH
  // ═══════════════════════════════════

  async sendOtp({ mobile, abhaId }) {
    return this.request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, abhaId }),
    });
  }

  async verifyOtp({ mobile, abhaId, otp }) {
    const result = await this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, abhaId, otp }),
    });

    if (result.success && result.data.token) {
      this.setToken(result.data.token);
    }

    return result;
  }

  // ═══════════════════════════════════
  //  UPLOAD & RECORDS
  // ═══════════════════════════════════

  async uploadText(text, fileName = 'upload.txt', fileType = 'other') {
    return this.request('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ text, fileName, fileType }),
    });
  }

  async getRecords() {
    return this.request('/api/records');
  }

  async getRecord(id) {
    return this.request(`/api/records/${id}`);
  }

  // ═══════════════════════════════════
  //  CONSENT & ABHA
  // ═══════════════════════════════════

  async consentUpload(recordId, consents) {
    return this.request('/api/consent-upload', {
      method: 'POST',
      body: JSON.stringify({ recordId, consents }),
    });
  }

  // ═══════════════════════════════════
  //  REMINDERS
  // ═══════════════════════════════════

  async getReminders() {
    return this.request('/api/reminders');
  }

  async createReminder(reminder) {
    return this.request('/api/reminders', {
      method: 'POST',
      body: JSON.stringify(reminder),
    });
  }

  async updateReminder(id, data) {
    return this.request(`/api/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReminder(id) {
    return this.request(`/api/reminders/${id}`, {
      method: 'DELETE',
    });
  }

  // ═══════════════════════════════════
  //  HEALTH CHECK
  // ═══════════════════════════════════

  async healthCheck() {
    return this.request('/api/health');
  }
}

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Singleton instance
const api = new ApiClient(API_BASE_URL);

export { api as default, ApiError };
