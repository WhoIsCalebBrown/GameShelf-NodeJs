import React, { useState, useEffect } from 'react';
import { searchgames, getTrendinggames } from '../services/igdb';
import { useMutation, useApolloClient } from '@apollo/client';
import { CREATE_GAME, CREATE_GAME_PROGRESS, GET_GAME_COLLECTION, CHECK_GAME_PROGRESS } from '../gql';
import { IGDBGame, GameProgressData } from '../types';
import { GameSearchProps } from '../types';
import { useAuth } from '../context/AuthContext';
import GameAddNotification from './GameAddNotification';

interface GameCardProps {
    game: IGDBGame;
    onAddGame: (game: IGDBGame) => Promise<void>;
}

const GameCard: React.FC<GameCardProps> = ({ game, onAddGame }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getDeveloper = () => {
        return game.involved_companies?.find(company => company.developer)?.company.name;
    };

    const getPublisher = () => {
        return game.involved_companies?.find(company => company.publisher)?.company.name;
    };

    return (
        <div className="bg-dark-light rounded-lg p-4 flex flex-col h-[500px] relative">
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
                    {game.total_rating && (
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-text-secondary">Rating:</span>
                            <span className={`text-sm ${
                                game.total_rating >= 80 ? 'text-green-500' :
                                game.total_rating >= 60 ? 'text-yellow-500' :
                                'text-red-500'
                            }`}>
                                {Math.round(game.total_rating)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Game Details */}
            <div className="flex-1 overflow-hidden space-y-4">
                {/* Description */}
                <div>
                    <div 
                        className={`text-sm text-text-secondary ${
                            isExpanded ? 'overflow-y-auto max-h-[120px]' : 'line-clamp-3'
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

                {/* Additional Info */}
                <div className="space-y-2 text-sm">
                    {/* Genres */}
                    {game.genres && game.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {game.genres.map(genre => (
                                <span 
                                    key={genre.id}
                                    className="px-2 py-1 bg-dark rounded-full text-xs text-gray-300"
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Platforms */}
                    {game.platforms && game.platforms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {game.platforms.map(platform => (
                                <span 
                                    key={platform.id}
                                    className="px-2 py-1 bg-primary-500/20 rounded-full text-xs text-primary-300"
                                >
                                    {platform.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Developer & Publisher */}
                    <div className="space-y-1">
                        {getDeveloper() && (
                            <p className="text-gray-400">
                                <span className="font-medium">Developer:</span> {getDeveloper()}
                            </p>
                        )}
                        {getPublisher() && (
                            <p className="text-gray-400">
                                <span className="font-medium">Publisher:</span> {getPublisher()}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Add to Collection Button */}
            <div className="mt-4">
                <button 
                    onClick={() => onAddGame(game)}
                    className="btn bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-50 min-w-[100px]"
                >
                    Add to Collection
                </button>
            </div>
        </div>
    );
};

const GameSearch: React.FC<GameSearchProps> = ({ onGameSelect }) => {
    const client = useApolloClient();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [unfilteredResults, setUnfilteredResults] = useState<IGDBGame[]>([]);
    const [searchResults, setSearchResults] = useState<IGDBGame[]>([]);
    const [trendinggames, setTrendinggames] = useState<IGDBGame[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTrendingLoading, setIsTrendingLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addingGame, setAddingGame] = useState<IGDBGame | null>(null);
    const [addStatus, setAddStatus] = useState<'adding' | 'success' | 'exists' | null>(null);

    // Advanced filter states
    const [showFilters, setShowFilters] = useState(false);
    const [yearRange, setYearRange] = useState({ min: 1970, max: new Date().getFullYear() });
    const [ratingRange, setRatingRange] = useState({ min: 0, max: 100 });
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);

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

    const [addGame] = useMutation(CREATE_GAME);
    const [addGameProgress] = useMutation(CREATE_GAME_PROGRESS, {
        variables: {
            userId: user?.id,
            status: 'not_started'
        },
        update(cache, { data: { insert_game_progress_one } }) {
            const existingData = cache.readQuery<GameProgressData>({
                query: GET_GAME_COLLECTION,
                variables: { 
                    userId: user?.id,
                    orderBy: [{ status: 'asc' }]
                }
            });

            if (existingData) {
                cache.writeQuery({
                    query: GET_GAME_COLLECTION,
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

    // Add new useEffect for filtering
    useEffect(() => {
        const applyFilters = () => {
            const filteredResults = unfilteredResults.filter(game => {
                // Year filter
                const gameYear = game.first_release_date 
                    ? new Date(game.first_release_date * 1000).getFullYear()
                    : null;
                if (gameYear && (gameYear < yearRange.min || gameYear > yearRange.max)) {
                    return false;
                }

                // Rating filter
                if (game.total_rating && (game.total_rating < ratingRange.min || game.total_rating > ratingRange.max)) {
                    return false;
                }

                // Genre filter
                if (selectedGenres.length > 0 && (!game.genres || !game.genres.some(genre => selectedGenres.includes(genre.id)))) {
                    return false;
                }

                // Platform filter
                if (selectedPlatforms.length > 0 && (!game.platforms || !game.platforms.some(platform => selectedPlatforms.includes(platform.id)))) {
                    return false;
                }

                return true;
            });

            setSearchResults(filteredResults);
        };

        applyFilters();
    }, [unfilteredResults, yearRange, ratingRange, selectedGenres, selectedPlatforms]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const results = await searchgames(searchTerm);
            setUnfilteredResults(results);
        } catch (error) {
            setError('Failed to search games. Please try again.');
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddGame = async (game: IGDBGame) => {
        if (!user?.id) return;
        
        setAddingGame(game);
        setAddStatus('adding');
        
        try {
            const { data: gameData } = await addGame({
                variables: {
                    name: game.name,
                    description: game.summary,
                    year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null,
                    cover_url: game.cover?.url.replace('t_thumb', 't_cover_big'),
                    slug: game.slug,
                    igdb_id: game.id
                }
            });

            // Check if the game exists in the user's game_progress
            const { data: progressData } = await client.query({
                query: CHECK_GAME_PROGRESS,
                variables: { 
                    userId: user.id,
                    gameId: gameData.insert_games_one.id
                },
                fetchPolicy: 'network-only' // Force a fresh check from the server
            });

            if (progressData.game_progress.length > 0) {
                setAddStatus('exists');
                return;
            }

            await addGameProgress({
                variables: {
                    userId: user.id,
                    gameId: gameData.insert_games_one.id,
                    status: 'not_started'
                }
            });

            setAddStatus('success');
            if (onGameSelect) {
                onGameSelect(gameData.insert_games_one);
            }
        } catch (error) {
            console.error('Error adding game:', error);
            setError(`Failed to add game: ${error.message}`);
            setAddingGame(null);
            setAddStatus(null);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Search Section */}
            <div className="bg-dark rounded-lg p-6 shadow-lg">
                <div className="space-y-4">
                    {/* Search input and button */}
                    <div className="flex gap-4">
                        <div className="flex-1 flex gap-4">
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
                                className="btn bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-50 min-w-[100px]"
                            >
                                {isLoading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn min-w-[120px] flex items-center justify-center gap-2 ${
                                showFilters 
                                    ? 'bg-gray-700 hover:bg-gray-600' 
                                    : 'bg-primary-500 hover:bg-primary-600'
                            }`}
                        >
                            <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" 
                                />
                            </svg>
                            {showFilters ? 'Hide Filters' : 'Filters'}
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="bg-dark-light p-4 rounded-lg space-y-4">
                            {/* Year Range Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Release Year Range</label>
                                <div className="flex gap-4">
                                    <input
                                        type="number"
                                        min="1970"
                                        max={yearRange.max}
                                        value={yearRange.min}
                                        onChange={(e) => setYearRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                                        className="form-input w-24 bg-dark border-gray-700"
                                    />
                                    <span className="text-gray-400">to</span>
                                    <input
                                        type="number"
                                        min={yearRange.min}
                                        max={new Date().getFullYear()}
                                        value={yearRange.max}
                                        onChange={(e) => setYearRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                                        className="form-input w-24 bg-dark border-gray-700"
                                    />
                                </div>
                            </div>

                            {/* Rating Range Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Rating Range (%)</label>
                                <div className="flex gap-4">
                                    <input
                                        type="number"
                                        min="0"
                                        max={ratingRange.max}
                                        value={ratingRange.min}
                                        onChange={(e) => setRatingRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                                        className="form-input w-24 bg-dark border-gray-700"
                                    />
                                    <span className="text-gray-400">to</span>
                                    <input
                                        type="number"
                                        min={ratingRange.min}
                                        max="100"
                                        value={ratingRange.max}
                                        onChange={(e) => setRatingRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                                        className="form-input w-24 bg-dark border-gray-700"
                                    />
                                </div>
                            </div>

                            {/* Genre Filter */}
                            {searchResults.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Genres</label>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from(new Set(searchResults.flatMap(game => game.genres || []))).map(genre => (
                                            <button
                                                key={genre.id}
                                                onClick={() => {
                                                    setSelectedGenres(prev => 
                                                        prev.includes(genre.id)
                                                            ? prev.filter(id => id !== genre.id)
                                                            : [...prev, genre.id]
                                                    );
                                                }}
                                                className={`px-3 py-1 rounded-full text-sm ${
                                                    selectedGenres.includes(genre.id)
                                                        ? 'bg-primary-500 text-white'
                                                        : 'bg-dark text-gray-400 hover:bg-dark-lighter'
                                                }`}
                                            >
                                                {genre.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Platform Filter */}
                            {searchResults.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Platforms</label>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from(new Set(searchResults.flatMap(game => game.platforms || []))).map(platform => (
                                            <button
                                                key={platform.id}
                                                onClick={() => {
                                                    setSelectedPlatforms(prev => 
                                                        prev.includes(platform.id)
                                                            ? prev.filter(id => id !== platform.id)
                                                            : [...prev, platform.id]
                                                    );
                                                }}
                                                className={`px-3 py-1 rounded-full text-sm ${
                                                    selectedPlatforms.includes(platform.id)
                                                        ? 'bg-primary-500 text-white'
                                                        : 'bg-dark text-gray-400 hover:bg-dark-lighter'
                                                }`}
                                            >
                                                {platform.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reset Filters Button */}
                            <button 
                                onClick={() => {
                                    setYearRange({ min: 1970, max: new Date().getFullYear() });
                                    setRatingRange({ min: 0, max: 100 });
                                    setSelectedGenres([]);
                                    setSelectedPlatforms([]);
                                }}
                                className="btn bg-gray-700 hover:bg-gray-600 text-sm"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="text-red-500 mb-4 p-3 bg-red-500/10 rounded">
                        {error}
                    </div>
                )}

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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

            {/* Trending Games Section */}
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

            <GameAddNotification
                game={addingGame}
                status={addStatus}
                onClose={() => {
                    setAddingGame(null);
                    setAddStatus(null);
                }}
            />
        </div>
    );
};

export default GameSearch; 