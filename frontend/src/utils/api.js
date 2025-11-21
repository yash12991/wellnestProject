// API Configuration
// Use Vite's import.meta.env in the browser. Avoid using process.env which isn't available in the browser runtime.
const fallbackOrigin = (typeof window !== 'undefined' && window.location) ? `${window.location.protocol}//${window.location.host}` : '';
export const API_URL = import.meta.env.VITE_API_URL || (window.__env && window.__env.VITE_API_URL) || "http://localhost:5000"||fallbackOrigin;

// Helpful debug: show which backend URL the client will use. This will appear in the browser console.
if (typeof window !== 'undefined' && window.console && process.env.NODE_ENV !== 'test') {
    // Use console.info so it's visible but not noisy in production logs.
    console.info('[API] Resolved API_URL ->', API_URL);
}

// API Endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        REGISTER: `${API_URL}/v1/api/auth/register`,
        LOGIN: `${API_URL}/v1/api/auth/login`,
        VERIFY_OTP: `${API_URL}/v1/api/auth/verify-otp`,
        RESEND_OTP: `${API_URL}/v1/api/auth/resend-otp`,
        COMPLETE_ONBOARDING: `${API_URL}/v1/api/auth/complete-onboarding`,
        PROFILE: `${API_URL}/v1/api/auth/profile`,
        UPDATE_PROFILE: `${API_URL}/v1/api/auth/update-profile`,
        CHANGE_PASSWORD: `${API_URL}/v1/api/auth/change-password`,
        DELETE_ACCOUNT: `${API_URL}/v1/api/auth/delete-account`,
    },

    // Meal plan endpoints
    MEALPLAN: {
        LATEST: (userId) => `${API_URL}/v1/api/mealplan/latest/${userId}`,
        SAVE: `${API_URL}/v1/api/mealplan/save`,
        EMAIL: `${API_URL}/v1/api/mealplan/email`,
    },

    // Message endpoints
    MESSAGE: {
        MEALPLAN: (userId) => `${API_URL}/v1/api/message/mealplan/${userId}`,
    },

    // Chat endpoints
    CHAT: {
        SESSION: `${API_URL}/v1/api/chat/session`,
        HISTORY: (sessionId) => `${API_URL}/v1/api/chat/history/${sessionId}`,
        MESSAGE: `${API_URL}/v1/api/chat/message`,
        NEW_SESSION: `${API_URL}/v1/api/chat/session/new`,
        USER_CONTEXT: (userId) => `${API_URL}/v1/api/chat/user-context/${userId}`,
    }
};

export default API_URL;