import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_DATA } from '../queries';
import { Game, GameStatus } from '../types/game';

const Home: React.FC = () => {
    const { loading, error, data } = useQuery(GET_DATA);

    const getStatusCount = (status: GameStatus) => {
        if (!data?.games) return 0;
        return data.games.filter((game: Game) => game.status === status).length;
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const totalgames = data.games.length;
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