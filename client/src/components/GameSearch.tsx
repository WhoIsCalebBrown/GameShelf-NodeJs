import React, { useState, useEffect } from 'react';
import { searchgames, getTrendinggames } from '../services/igdb';
import { useMutation } from '@apollo/client';
import { ADD_GAME, ADD_GAME_PROGRESS, GET_DATA } from '../queries';
import { useAuth } from '../context/AuthContext';

interface IGDBGame {
    id: number;
    name: string;
    summary: string;
    first_release_date?: number;
    cover?: {
        url: string;
    };
    slug: string;
}

interface GameCardProps {
    game: IGDBGame;
    onAddGame: (game: IGDBGame) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onAddGame }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-dark-light rounded-lg p-4 flex flex-col h-[400px] relative">
            <div className="flex gap-4 h-32 mb-4">
                {game.cover ? (
                    <img 
                        src={game.cover.url} 
                        alt={game.name}
                        className="w-24 h-32 object-cover rounded shadow-lg"
                    />
                ) : (
                    <div className="w-24 h-32 bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-2 truncate">{game.name}</h3>
                    {game.first_release_date && (
                        <p className="text-sm text-text-secondary mb-2">
                            {new Date(game.first_release_date * 1000).getFullYear()}
                        </p>
                    )}
                </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
                <div 
                    className={`text-sm text-text-secondary ${
                        isExpanded ? 'overflow-y-auto max-h-[160px]' : 'line-clamp-3'
                    }`}
                >
                    {game.summary || 'No description available.'}
                </div>
                {game.summary && game.summary.length > 140 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-primary-500 text-sm mt-2 hover:text-primary-400 transition-colors"
                    >
                        {isExpanded ? 'Show Less' : 'Read More'}
                    </button>
                )}
            </div>
            
            <div className="mt-4">
                <button 
                    onClick={() => onAddGame(game)}
                    className="btn w-full bg-primary-500 hover:bg-primary-600 transition-colors"
                >
                    Add to Collection
                </button>
            </div>
        </div>
    );
};

const GameSearch: React.FC = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<IGDBGame[]>([]);
    const [trendinggames, setTrendinggames] = useState<IGDBGame[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTrendingLoading, setIsTrendingLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTrendinggames = async () => {
            try {
                const games = await getTrendinggames();
                setTrendinggames(games);
            } catch (error) {
                console.error('Error loading trending games:', error);
            } finally {
                setIsTrendingLoading(false);
            }
        };

        loadTrendinggames();
    }, []);

    const [addGame] = useMutation(ADD_GAME);
    const [addGameProgress] = useMutation(ADD_GAME_PROGRESS, {
        update(cache, { data: { insert_game_progress_one } }) {
            const existingData = cache.readQuery<{ game_progress: any[] }>({
                query: GET_DATA,
                variables: { 
                    userId: user?.id,
                    orderBy: [{ status: 'asc' }]
                }
            });

            if (existingData) {
                cache.writeQuery({
                    query: GET_DATA,
                    variables: { 
                        userId: user?.id,
                        orderBy: [{ status: 'asc' }]
                    },
                    data: {
                        game_progress: [...existingData.game_progress, insert_game_progress_one]
                    }
                });
            }
        },
        onError: (error) => {
            setError(`Failed to add game progress: ${error.message}`);
        }
    });

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const results = await searchgames(searchTerm);
            setSearchResults(results);
        } catch (error) {
            setError('Failed to search games. Please try again.');
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddGame = async (game: IGDBGame) => {
        if (!user?.id) {
            setError('Please sign in to add games to your collection');
            return;
        }

        try {
            const coverUrl = game.cover 
                ? game.cover.url.replace('t_thumb', 't_cover_big')
                : null;

            // Convert Unix timestamp to ISO date string
            const year = game.first_release_date 
                ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];

            // First, add the game
            const { data: gameData } = await addGame({
                variables: {
                    name: game.name,
                    description: game.summary,
                    year: year,
                    igdb_id: game.id,
                    slug: game.slug,
                    cover_url: coverUrl
                }
            });

            // Then create the game progress
            await addGameProgress({
                variables: {
                    userId: user.id,
                    gameId: gameData.insert_games_one.id
                }
            });

            setSearchResults(results => results.filter(g => g.id !== game.id));
        } catch (error) {
            console.error('Error adding game:', error);
            setError(`Failed to add game: ${error.message}`);
        }
    };

    return (
        <div className="space-y-8">
            {/* Search Section */}
            <div className="bg-dark rounded-lg p-6 shadow-lg">
                <div className="flex gap-4 mb-6">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search for games..."
                        className="form-input flex-1 bg-dark-light border-gray-700 focus:border-primary-500 focus:ring-primary-500"
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="btn bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {error && (
                    <div className="text-red-500 mb-4 p-3 bg-red-500/10 rounded">
                        {error}
                    </div>
                )}

                {searchResults.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map(game => (
                            <GameCard 
                                key={game.id} 
                                game={game} 
                                onAddGame={handleAddGame}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Trending games Section */}
            <div className="bg-dark rounded-lg p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Trending games</h2>
                {isTrendingLoading ? (
                    <div className="animate-pulse flex items-center justify-center h-32">
                        <div className="text-lg text-gray-400">Loading trending games...</div>
                    </div>
                ) : trendinggames.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trendinggames.map(game => (
                            <GameCard 
                                key={game.id} 
                                game={game} 
                                onAddGame={handleAddGame}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-400 text-center py-8">
                        No trending games available at the moment.
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameSearch; 