import { supabase } from '../supabaseClient';
import { CONFIG } from '../config/config';

export const apiFetch = async (endpoint, options = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(`${CONFIG.BACKEND_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'API request failed');
    }

    return response.json();
};

export const syncUserWithBackend = async (user) => {
    if (!user) return;
    
    try {
        await apiFetch('/users/', {
            method: 'POST',
            body: JSON.stringify({
                id: user.id,
                email: user.email,
                username: user.user_metadata?.username || user.email.split('@')[0],
            }),
        });
    } catch (err) {
        console.warn("User sync failed (might already exist):", err.message);
    }
};
