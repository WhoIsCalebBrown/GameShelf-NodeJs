import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_GAME_COLLECTION } from '../queries';
import { game_status, game_status_labels } from '../types/game';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CHART_COLORS = {
    'not_started': '#9CA3AF',  // gray-400
    'in_progress': '#10B981',  // green-500
    'completed': '#3B82F6',    // blue-500
    'abandoned': '#EF4444',    // red-500
    'on_hold': '#F59E0B',      // yellow-500
    'active_multiplayer': '#8B5CF6', // purple-500
    'casual_rotation': '#F97316', // orange-500
    'retired': '#6B7280',      // gray-500
    'replaying': '#06B6D4'     // cyan-500
};

const Home: React.FC = () => {
    const { user } = useAuth();
    const { loading, error, data } = useQuery(GET_GAME_COLLECTION, {
        variables: {
            userId: user?.id,
            orderBy: [{ status: 'asc' }]
        },
        skip: !user?.id
    });

    const getStatusCount = (status: game_status) => {
        if (!data?.game_progress) return 0;
        return data.game_progress.filter((progress: any) => progress.status === status).length;
    };


    const getChartData = () => {
        const statuses = Object.keys(game_status_labels) as game_status[];
        return statuses
            .map(status => ({
                name: game_status_labels[status],
                value: getStatusCount(status)
            }))
            .filter(item => item.value > 0); // Only show statuses with games
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-dark-darker to-dark">
                {/* Hero Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="text-center space-y-8">
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 text-transparent bg-clip-text">
                            Track Your Gaming Journey
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
                            GameShelf helps you organize, track, and discover games. Keep your gaming collection organized and never lose track of your progress again.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link 
                                to="/register" 
                                className="btn  bg-primary-500 hover:bg-primary-600 transition-all transform hover:scale-105 px-8 py-3 text-lg"
                            >
                                Get Started
                            </Link>
                            <Link 
                                to="/login" 
                                className="btn border-2 border-primary-500 hover:bg-primary-500/10 text-primary-500 transition-all transform hover:scale-105 px-8 py-3 text-lg"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-dark-light p-8 rounded-xl hover:bg-dark-lighter transition-all duration-300">
                            <div className="text-primary-500 text-3xl mb-4">📊</div>
                            <h3 className="text-xl font-bold mb-2">Track Progress</h3>
                            <p className="text-gray-400">
                                Keep track of your gaming progress, completion rates, and playtime for each game.
                            </p>
                        </div>
                        <div className="bg-dark-light p-8 rounded-xl hover:bg-dark-lighter transition-all duration-300">
                            <div className="text-primary-500 text-3xl mb-4">🎮</div>
                            <h3 className="text-xl font-bold mb-2">Organize Collection</h3>
                            <p className="text-gray-400">
                                Organize your games by status: playing, completed, on hold, or plan to play.
                            </p>
                        </div>
                        <div className="bg-dark-light p-8 rounded-xl hover:bg-dark-lighter transition-all duration-300">
                            <div className="text-primary-500 text-3xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold mb-2">Discover Games</h3>
                            <p className="text-gray-400">
                                Find new games to play through our integration with the IGDB database.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 rounded-2xl p-12 text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Gaming Journey?</h2>
                        <p className="text-xl text-gray-400 mb-8">
                            Join thousands of gamers who are already tracking their progress with GameShelf.
                        </p>
                        <Link 
                            to="/register" 
                            className="btn bg-primary-500 hover:bg-primary-600 transition-all transform hover:scale-105 px-8 py-3 text-lg"
                        >
                            Create Your Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const totalgames = data?.game_progress?.length || 0;
    const activeGames = getStatusCount('active_multiplayer');
    const inProgressGames = getStatusCount('in_progress');
    const casualGames = getStatusCount('casual_rotation');

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Welcome to GameShelf</h1>
                <p className="text-xl text-gray-400">Track, manage, and discover your video game collection</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-dark p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-primary-500">{totalgames}</h3>
                    <p className="text-gray-400">Total Games</p>
                </div>
                <div className="bg-dark p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-purple-500">{activeGames}</h3>
                    <p className="text-gray-400">Active Multiplayer</p>
                </div>
                <div className="bg-dark p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-green-500">{inProgressGames}</h3>
                    <p className="text-gray-400">In Progress</p>
                </div>
                <div className="bg-dark p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-orange-400">{casualGames}</h3>
                    <p className="text-gray-400">Casual Rotation</p>
                </div>
            </div>

            <div className="bg-dark p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Collection Overview</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={getChartData()}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={150}
                                label={({ name, percent }) => 
                                    `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                labelLine={false}
                            >
                                {getChartData().map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`}
                                        fill={CHART_COLORS[Object.keys(game_status_labels)[index] as game_status]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>


            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link 
                    to="/search" 
                    className="bg-dark p-8 rounded-lg hover:bg-dark-light transition-colors group"
                >
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-primary-500">Search games</h2>
                    <p className="text-gray-400">Search and add new games to your collection</p>
                </Link>
                <Link 
                    to="/collection" 
                    className="bg-dark p-8 rounded-lg hover:bg-dark-light transition-colors group"
                >
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-primary-500">My Collection</h2>
                    <p className="text-gray-400">View and manage your game collection</p>
                </Link>
            </div>
        </div>
    );
};

export default Home; 