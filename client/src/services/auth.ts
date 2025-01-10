import { User } from '../types/user';

interface AuthResponse {
    token: string;
    user: User;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to login');
    }

    return response.json();
};

export const register = async (
    username: string,
    email: string,
    password: string
): Promise<AuthResponse> => {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register');
    }

    return response.json();
};

export const getCurrentUser = async (token: string): Promise<{ user: User }> => {
    const response = await fetch('/api/auth/me', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get user data');
    }

    return response.json();
}; 