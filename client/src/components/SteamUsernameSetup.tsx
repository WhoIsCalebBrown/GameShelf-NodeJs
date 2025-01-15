import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const UPDATE_USERNAME = gql`
    mutation UpdateUsername($userId: Int!, $username: String!) {
        update_users_by_pk(
            pk_columns: { id: $userId }
            _set: { username: $username }
        ) {
            id
            username
            email
            created_at
            updated_at
        }
    }
`;

interface SteamUsernameSetupProps {
    initialUser: {
        id: number;
        email: string;
        created_at: string;
        updated_at: string;
        'https://hasura.io/jwt/claims'?: {
            'x-hasura-allowed-roles': string[];
            'x-hasura-default-role': string;
            'x-hasura-user-id': string;
        };
    };
    token: string;
}

const SteamUsernameSetup: React.FC<SteamUsernameSetupProps> = ({ initialUser, token }) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const [updateUsername] = useMutation(UPDATE_USERNAME);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username.trim()) {
            setError('Username is required');
            return;
        }

        try {
            // Update username in the database
            const { data } = await updateUsername({
                variables: {
                    userId: initialUser.id,
                    username: username.trim()
                }
            });

            if (data?.update_users_by_pk) {
                // Create the complete user object with the updated data
                const updatedUser = {
                    ...initialUser,
                    ...data.update_users_by_pk,
                    // Preserve Hasura claims
                    'https://hasura.io/jwt/claims': initialUser['https://hasura.io/jwt/claims']
                };

                console.log('Logging in with updated user:', updatedUser);

                // Log in with the complete user object
                login(token, updatedUser);
                navigate('/collection');
            } else {
                setError('Failed to update username');
            }
        } catch (err) {
            console.error('Error updating username:', err);
            setError('Failed to update username. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-darker">
            <div className="bg-dark p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">Choose Your Username</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-dark-lighter border border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-black placeholder-gray-500"
                            placeholder="Enter your desired username"
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SteamUsernameSetup; 