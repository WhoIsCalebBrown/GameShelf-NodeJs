import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_DATA } from '../queries';
import { GameStatus } from '../types/game';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
    const { user } = useAuth();
    const { loading, error, data } = useQuery(GET_DATA, {
        variables: {
            userId: user?.id,
            orderBy: [{ status: 'asc' }]
        },
        skip: !user?.id
    });

    const getStatusCount = (status: GameStatus) => {
        if (!data?.game_progress) return 0;
        return data.game_progress.filter((progress: any) => progress.status === status).length;
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
    const playinggames = getStatusCount('IN_PROGRESS');
    const completedgames = getStatusCount('COMPLETED');
    const notStartedgames = getStatusCount('NOT_STARTED');

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Welcome to GameShelf</h1>
                <p className="text-xl text-gray-400">Track, manage, and discover your video game collection</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-dark p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-primary-500">{totalgames}</h3>
                    <p className="text-gray-400">Total games</p>
                </div>
                <div className="bg-dark p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-green-500">{playinggames}</h3>
                    <p className="text-gray-400">Currently Playing</p>
                </div>
                <div className="bg-dark p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-blue-500">{completedgames}</h3>
                    <p className="text-gray-400">Completed</p>
                </div>
                <div className="bg-dark p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-yellow-500">{notStartedgames}</h3>
                    <p className="text-gray-400">Not Started</p>
                </div>
            </div>

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