import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/auth';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await login(email, password);
            authLogin(response.token, response.user);
            navigate('/collection');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-darker py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Sign in to GameShelf
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Or{' '}
                        <Link to="/register" className="text-primary-500 hover:text-primary-400">
                            create a new account
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 text-red-500 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-dark placeholder-gray-500 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-dark placeholder-gray-500 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border-2 border-gray-700 text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                        <Link
                            to="/register"
                            className="group relative w-full flex justify-center py-2 px-4 border-2 border-gray-700 text-sm font-medium rounded-md text-primary-500 hover:bg-primary-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Register
                        </Link>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-dark text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <a
                            href="http://localhost:3001/auth/steam"
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#171a21] hover:bg-[#2a475e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c0f4]"
                        >
                            <img
                                src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/english/sits_small.png"
                                alt="Steam"
                                className="h-5 w-5 mr-2"
                            />
                            Sign in with Steam
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 