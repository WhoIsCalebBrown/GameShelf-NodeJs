import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/user';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            try {
                // Verify token is still valid
                const tokenData = JSON.parse(atob(savedToken.split('.')[1]));
                const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
                
                if (expirationTime > Date.now()) {
                    setToken(savedToken);
                    setUser(JSON.parse(savedUser));
                } else {
                    // Token expired, clear storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Error parsing saved auth data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }, []);

    const login = useCallback((newToken: string, newUser: User) => {
        try {
            if (!newToken || !newUser || !newUser.id) {
                throw new Error('Invalid login data');
            }

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));
            setToken(newToken);
            setUser(newUser);
        } catch (error) {
            console.error('Error during login:', error);
            logout();
        }
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 