/**
 * Base API Client Wrapper
 * This handles common fetch logic such as attaching JWT tokens and error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const apiClient = async (endpoint, { method = 'GET', body, ...customConfig } = {}) => {
    // Attempt to get token from state or local storage
    const token = null; // Replace with actual token retrieval logic later

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...customConfig.headers,
    };

    const config = {
        method,
        ...customConfig,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await window.fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            // Handle HTTP errors
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `API Error: ${response.status}`);
        }

        // Return empty string if no content
        if (response.status === 204) return '';

        return await response.json();
    } catch (error) {
        console.error(`[API Client Error] ${method} ${endpoint}:`, error);
        throw error;
    }
};
