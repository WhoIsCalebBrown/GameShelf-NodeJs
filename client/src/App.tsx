import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './components/Home';
import GameSearch from './components/GameSearch';
import GameCollection from './components/GameCollection';
import Login from './components/Login';
import Register from './components/Register';
import SteamCallback from './components/SteamCallback';
import Stats from './pages/Stats';
import './animations.css';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-darker">
                <div className="text-lg text-gray-400">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
};

const Navigation: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-dark p-4 shadow-lg mb-8">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <a href="/" className="text-2xl font-bold hover:text-primary-500 transition-colors">
                        GameShelf
                    </a>
                    {user && (
                        <div className="flex gap-4">
                            <a 
                                href="/search" 
                                className="px-4 py-2 rounded-lg hover:bg-primary-500/20 transition-colors"
                            >
                                Search Games
                            </a>
                            <a 
                                href="/collection" 
                                className="px-4 py-2 rounded-lg hover:bg-primary-500/20 transition-colors"
                            >
                                My Collection
                            </a>
                            <a 
                                href="/stats" 
                                className="px-4 py-2 rounded-lg hover:bg-primary-500/20 transition-colors"
                            >
                                Stats
                            </a>
                        </div>
                    )}
                </div>
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">
                            Welcome, {user.username}
                        </span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <a 
                            href="/login" 
                            className="px-4 py-2 rounded-lg hover:bg-primary-500/20 transition-colors"
                        >
                            Sign In
                        </a>
                        <a 
                            href="/register" 
                            className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 transition-colors"
                        >
                            Create Account
                        </a>
                    </div>
                )}
            </div>
        </nav>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-dark-darker text-white">
                    <Navigation />
                    <main className="container mx-auto px-4">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/steam-callback" element={<SteamCallback />} />
                            <Route 
                                path="/search" 
                                element={
                                    <ProtectedRoute>
                                        <GameSearch />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/collection" 
                                element={
                                    <ProtectedRoute>
                                        <GameCollection />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/stats" 
                                element={
                                    <ProtectedRoute>
                                        <Stats />
                                    </ProtectedRoute>
                                } 
                            />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;
