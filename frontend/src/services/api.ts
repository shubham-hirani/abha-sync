import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
                        refresh_token: refreshToken,
                    });
                    localStorage.setItem("access_token", data.access_token);
                    localStorage.setItem("refresh_token", data.refresh_token);
                    original.headers.Authorization = `Bearer ${data.access_token}`;
                    return api(original);
                } catch {
                    localStorage.clear();
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    sendOtp: (phone: string) =>
        api.post("/api/v1/auth/send-otp", { phone }),

    verifyOtp: (phone: string, token: string, consentGiven: boolean) =>
        api.post("/api/v1/auth/verify-otp", { phone, token, consent_given: consentGiven }),

    logout: () => api.post("/api/v1/auth/logout"),

    getMe: () => api.get("/api/v1/auth/me"),
};

export default api;
