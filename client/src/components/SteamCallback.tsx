import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SteamUsernameSetup from './SteamUsernameSetup';

const SteamCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [initialUser, setInitialUser] = useState<any>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);

    const handleAuth = useCallback(async () => {
        const token = searchParams.get('token');
        const steamId = searchParams.get('steamId');
        const error = searchParams.get('error');

        if (error) {
            console.error('Steam auth error:', error);
            navigate('/login?error=steam_auth_failed');
            return;
        }

        if (!token || !steamId) {
            navigate('/login');
            return;
        }

        try {

            const tokenParts = token.split('.');

            const tokenData = JSON.parse(atob(tokenParts[1]));

            // Include Hasura claims in the user object
            const user = {
                id: parseInt(tokenData.userId),
                username: tokenData.username,
                email: tokenData.email,
                steam_id: tokenData.steam_id,
                created_at: tokenData.created_at,
                updated_at: tokenData.updated_at,
                // Add Hasura claims
                'https://hasura.io/jwt/claims': tokenData['https://hasura.io/jwt/claims']
            };

            if (user.username && !user.username.startsWith('steam_')) {
                login(token, user);
                navigate('/collection');
                return;
            }
            setInitialUser(user);
            setAuthToken(token);
        } catch (error) {
            console.error('Error processing token:', error);
            console.error('Token contents:', token);
            navigate('/login?error=invalid_token');
        }
    }, [searchParams, login, navigate]);

    useEffect(() => {
        handleAuth();
    }, [handleAuth]);

    if (initialUser && authToken) {
        return <SteamUsernameSetup initialUser={initialUser} token={authToken} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-darker">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Processing Steam Login...</h2>
                <p className="text-gray-400">Please wait while we complete your sign in.</p>
            </div>
        </div>
    );
};

export default SteamCallback; 