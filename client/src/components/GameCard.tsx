import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_GAME_PROGRESS_STATUS, UPDATE_GAME_PROGRESS, UPDATE_GAME_COMPETITIVE_STATUS, UPDATE_GAME_PROGRESS_FAVORITE } from '../queries';
import { game_status, GameProgressRef } from '../types/game';
import { GameCardProps, DropdownMenuProps } from '../types/props';
import { useAuth } from '../context/AuthContext';
import { getRankColor, getPeakRankColor } from '../utils/rankColors';

const DropdownMenu: React.FC<DropdownMenuProps> = ({ onDelete, onEdit }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    setIsOpen(!isOpen);
                }}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
            </button>
            
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0" 
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            setIsOpen(false);
                        }}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-dark-light border border-gray-600 rounded-lg shadow-lg z-50">
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                onEdit();
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors rounded-t-lg"
                        >
                            Edit Progress
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                onDelete();
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700 transition-colors rounded-b-lg"
                        >
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const GameCard: React.FC<GameCardProps> = ({ game, onDelete }) => {
    const { user } = useAuth();
    const [localStatus, setLocalStatus] = useState<game_status | undefined>(game.status);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [isGameModalOpen, setIsGameModalOpen] = useState(false);
    const [playtimeHours, setPlaytimeHours] = useState(Math.floor((game.playtime_minutes || 0) / 60));
    const [playtimeMinutes, setPlaytimeMinutes] = useState((game.playtime_minutes || 0) % 60);
    const [completion, setCompletion] = useState(game.completion_percentage || 0);
    const [currentRank, setCurrentRank] = useState(game.current_rank || '');
    const [peakRank, setPeakRank] = useState(game.peak_rank || '');
    const [notes, setNotes] = useState(game.notes || '');
    const [lastPlayed, setLastPlayed] = useState(game.last_played_at ? new Date(game.last_played_at).toISOString().split('T')[0] : '');

    const [updateStatus] = useMutation(UPDATE_GAME_PROGRESS_STATUS, {
        optimisticResponse: ({ status }) => ({
            update_game_progress: {
                returning: [{
                    id: game.id,
                    status,
                    game_id: game.id,
                    __typename: 'game_progress'
                }],
                __typename: 'game_progress_mutation_response'
            }
        }),
        update(cache, { data }) {
            if (data?.update_game_progress?.returning?.[0]) {
                const updatedGame = data.update_game_progress.returning[0];
                cache.modify({
                    fields: {
                        game_progress(existingGames = [], { readField }) {
                            return existingGames.map((gameRef: GameProgressRef) => {
                                const gameId = readField('game_id', gameRef) || readField('id', readField('game', gameRef));
                                if (gameId === game.id) {
                                    return {
                                        ...gameRef,
                                        status: updatedGame.status
                                    };
                                }
                                return gameRef;
                            });
                        }
                    }
                });
            }
        }
    });

    const [updateProgress] = useMutation(UPDATE_GAME_PROGRESS, {
        optimisticResponse: ({ playtimeMinutes, completionPercentage, currentRank, peakRank, notes, lastPlayedAt }) => ({
            update_game_progress: {
                returning: [{
                    user_id: user?.id,
                    game_id: game.id,
                    status: game.status,
                    playtime_minutes: playtimeMinutes,
                    completion_percentage: completionPercentage,
                    current_rank: currentRank,
                    peak_rank: peakRank,
                    notes,
                    last_played_at: lastPlayedAt,
                    __typename: 'game_progress'
                }],
                __typename: 'game_progress_mutation_response'
            }
        }),
        update(cache, { data }) {
            if (data?.update_game_progress?.returning?.[0]) {
                const updatedGame = data.update_game_progress.returning[0];
                cache.modify({
                    fields: {
                        game_progress(existingGames = [], { readField }) {
                            return existingGames.map((gameRef: GameProgressRef) => {
                                const gameId = readField('game_id', gameRef) || readField('id', readField('game', gameRef));
                                if (gameId === game.id) {
                                    return {
                                        ...gameRef,
                                        playtime_minutes: updatedGame.playtime_minutes,
                                        completion_percentage: updatedGame.completion_percentage,
                                        current_rank: updatedGame.current_rank,
                                        peak_rank: updatedGame.peak_rank,
                                        notes: updatedGame.notes,
                                        last_played_at: updatedGame.last_played_at
                                    };
                                }
                                return gameRef;
                            });
                        }
                    }
                });
            }
        }
    });

    const [updateCompetitive] = useMutation(UPDATE_GAME_COMPETITIVE_STATUS, {
        optimisticResponse: ({ isCompetitive }) => ({
            update_games_by_pk: {
                id: game.id,
                is_competitive: isCompetitive,
                __typename: 'games'
            }
        }),
        update(cache, { data }) {
            if (data?.update_games_by_pk) {
                const updatedGame = data.update_games_by_pk;
                cache.modify({
                    fields: {
                        game_progress(existingGames = [], { readField, toReference }) {
                            return existingGames.map((gameRef: GameProgressRef) => {
                                const gameId = readField('game_id', gameRef) || readField('id', readField('game', gameRef));
                                if (gameId === game.id) {
                                    const gameField = readField('game', gameRef) as {
                                        id: number;
                                        name: string;
                                        description?: string;
                                        year?: number;
                                        cover_url?: string;
                                        slug: string;
                                        is_competitive: boolean;
                                        __typename: 'games';
                                    };
                                    return {
                                        ...gameRef,
                                        game: toReference({
                                            ...gameField,
                                            is_competitive: updatedGame.is_competitive,
                                            __typename: 'games'
                                        })
                                    };
                                }
                                return gameRef;
                            });
                        }
                    }
                });
            }
        }
    });

    const [updateFavorite] = useMutation(UPDATE_GAME_PROGRESS_FAVORITE, {
        optimisticResponse: ({ isFavorite }) => ({
            update_game_progress: {
                returning: [{
                    id: game.id,
                    is_favorite: isFavorite,
                    __typename: 'game_progress'
                }],
                __typename: 'game_progress_mutation_response'
            }
        }),
        update(cache, { data }) {
            if (data?.update_game_progress?.returning?.[0]) {
                const updatedGame = data.update_game_progress.returning[0];
                cache.modify({
                    fields: {
                        game_progress(existingGames = [], { readField }) {
                            return existingGames.map((gameRef: GameProgressRef) => {
                                const gameId = readField('game_id', gameRef) || readField('id', readField('game', gameRef));
                                if (gameId === game.id) {
                                    return {
                                        ...gameRef,
                                        is_favorite: updatedGame.is_favorite
                                    };
                                }
                                return gameRef;
                            });
                        }
                    }
                });
            }
        }
    });

    useEffect(() => {
        setLocalStatus(game.status);
        setPlaytimeHours(Math.floor((game.playtime_minutes || 0) / 60));
        setPlaytimeMinutes((game.playtime_minutes || 0) % 60);
        setCompletion(game.completion_percentage || 0);
        setCurrentRank(game.current_rank || '');
        setPeakRank(game.peak_rank || '');
        setNotes(game.notes || '');
        setLastPlayed(game.last_played_at ? new Date(game.last_played_at).toISOString().split('T')[0] : '');
    }, [game]);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation(); // Prevent card click
        const newStatus = e.target.value as game_status;
        try {
            await updateStatus({
                variables: {
                    userId: user?.id,
                    gameId: game.id,
                    status: newStatus
                }
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleProgressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const totalPlaytimeMinutes = (playtimeHours * 60) + playtimeMinutes;

        try {
            await updateProgress({
                variables: {
                    userId: user.id,
                    gameId: game.id,
                    playtimeMinutes: totalPlaytimeMinutes,
                    completionPercentage: completion,
                    currentRank: game.is_competitive ? currentRank : null,
                    peakRank: game.is_competitive ? peakRank : null,
                    notes,
                    lastPlayedAt: lastPlayed || null
                }
            });
            setIsProgressModalOpen(false);
        } catch (error) {
            console.error('Failed to update game progress:', error);
        }
    };

    const handleCompetitiveToggle = async () => {
        try {
            await updateCompetitive({
                variables: {
                    gameId: game.id,
                    isCompetitive: !game.is_competitive
                }
            });
        } catch (error) {
            console.error('Failed to update competitive status:', error);
        }
    };

    const handleFavoriteToggle = async () => {
        try {
            await updateFavorite({
                variables: {
                    userId: user?.id,
                    gameId: game.id,
                    isFavorite: !game.is_favorite
                }
            });
        } catch (error) {
            console.error('Failed to update favorite status:', error);
        }
    };

    const statusColors: Record<game_status, string> = {
        'not_started': 'text-gray-400',
        'in_progress': 'text-green-500',
        'completed': 'text-blue-500',
        'abandoned': 'text-red-500',
        'on_hold': 'text-yellow-500',
        'active_multiplayer': 'text-purple-500',
        'casual_rotation': 'text-orange-400',
        'retired': 'text-gray-500',
        'replaying': 'text-cyan-400'
    };


    const releaseYear = game.year;

    return (
        <>
            <div 
                className="bg-dark-light rounded-lg overflow-hidden h-[250px] flex transform transition-all duration-300 ease-in-out cursor-pointer hover:scale-[1.02]"
                onClick={() => setIsGameModalOpen(true)}
            >
                {/* Image Section - 2:3 aspect ratio */}
                <div className="w-[167px] h-full flex-shrink-0 relative bg-gray-700">
                    {/* Add favorite button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteToggle();
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-10"
                    >
                        <svg 
                            className={`w-6 h-6 ${game.is_favorite ? 'text-yellow-500' : 'text-gray-400'}`}
                            fill={game.is_favorite ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                        </svg>
                    </button>
                    {game.cover_url ? (
                        <img 
                            src={game.cover_url.replace('t_cover_big', 't_720p')}
                            alt={game.name}
                            className="w-full h-full object-cover object-center"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes('t_cover_big')) {
                                    target.src = game.cover_url!.replace('t_720p', 't_cover_big');
                                }
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 flex flex-col relative max-w-[500px]">
                    {/* Header Section */}
                    <div className="relative">
                        {/* Title */}
                        <div className="pr-20">
                            <h3 className="font-bold text-lg leading-tight min-h-[56px]">{game.name}</h3>
                        </div>
                        {/* Year and Actions - Absolute positioned */}
                        <div className="absolute top-0 right-0 flex items-center gap-2">
                            {releaseYear && (
                                <span className="text-sm text-text-secondary">
                                    {releaseYear}
                                </span>
                            )}
                            <DropdownMenu 
                                onDelete={onDelete || (() => {})}
                                onEdit={() => setIsProgressModalOpen(true)} 
                            />
                        </div>
                    </div>

                    {/* Status Selector */}
                    <select
                        value={localStatus || ''}
                        onChange={handleStatusChange}
                        onClick={(e) => e.stopPropagation()} // Prevent card click
                        className={`bg-dark/90 border border-gray-700 rounded-lg px-3 py-1.5 text-sm w-fit -mt-2 ${
                            statusColors[localStatus as game_status] || 'text-gray-400'
                        }`}
                    >
                        <option value="" className="text-gray-400">Set Status</option>
                        <option value="not_started" className="text-gray-400">Not Started</option>
                        <option value="in_progress" className="text-green-500">In Progress</option>
                        <option value="completed" className="text-blue-500">Completed</option>
                        <option value="abandoned" className="text-red-500">Abandoned</option>
                        <option value="on_hold" className="text-yellow-500">On Hold</option>
                        <option value="active_multiplayer" className="text-purple-500">Active Multiplayer</option>
                        <option value="casual_rotation" className="text-orange-400">Casual Rotation</option>
                        <option value="retired" className="text-gray-500">Retired</option>
                        <option value="replaying" className="text-cyan-400">Replaying</option>
                    </select>

                    {/* Description */}
                    <div className="mt-auto pt-3">
                        <div className="text-sm text-text-secondary line-clamp-6">
                            {game.description || 'No description available.'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Details Modal */}
            {isGameModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsGameModalOpen(false)}
                >
                    <div 
                        className="bg-dark-light rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col md:flex-row gap-6 p-6">
                            {/* Left Column - Image and Quick Stats */}
                            <div className="w-full md:w-1/3">
                                {game.cover_url ? (
                                    <img 
                                        src={game.cover_url.replace('t_cover_big', 't_720p')}
                                        alt={game.name}
                                        className="w-full rounded-lg shadow-lg"
                                    />
                                ) : (
                                    <div className="w-full aspect-[3/4] bg-gray-700 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-500">No Image</span>
                                    </div>
                                )}
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Status:</span>
                                        <span className={statusColors[localStatus as game_status]}>
                                            {localStatus?.replace(/_/g, ' ') || 'Not Set'}
                                        </span>
                                    </div>
                                    {playtimeHours > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Playtime:</span>
                                            <span>{playtimeHours}h {playtimeMinutes}m</span>
                                        </div>
                                    )}
                                    {completion > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Completion:</span>
                                            <span>{completion}%</span>
                                        </div>
                                    )}
                                    {lastPlayed && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Last Played:</span>
                                            <span>{new Date(lastPlayed).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    {game.is_competitive && (
                                        <>
                                            {currentRank && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Current Rank:</span>
                                                    <span className={getRankColor(currentRank)}>{currentRank}</span>
                                                </div>
                                            )}
                                            {peakRank && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Peak Rank:</span>
                                                    <span className={getPeakRankColor(peakRank)}>{peakRank}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-gray-400">Competitive:</span>
                                        <button
                                            onClick={handleCompetitiveToggle}
                                            className={`px-3 py-1 rounded-lg transition-colors ${
                                                game.is_competitive
                                                    ? 'bg-primary-500 hover:bg-primary-600'
                                                    : 'bg-gray-700 hover:bg-gray-600'
                                            }`}
                                        >
                                            {game.is_competitive ? 'Yes' : 'No'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Details */}
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-1">{game.name}</h2>
                                        <p className="text-gray-400">Released: {game.year}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsGameModalOpen(false)}
                                        className="text-gray-500 hover:text-white transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="prose prose-invert max-w-none">
                                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                                    <p className="text-gray-300">{game.description || 'No description available.'}</p>
                                </div>

                                {game.is_competitive && (currentRank || peakRank) && (
                                    <div className="prose prose-invert max-w-none">
                                        <h3 className="text-lg font-semibold mb-2">Competitive Stats</h3>
                                        <div className="space-y-2">
                                            {currentRank && (
                                                <p className="text-gray-300">
                                                    <span className="font-medium">Current Rank:</span>{' '}
                                                    <span className={getRankColor(currentRank)}>{currentRank}</span>
                                                </p>
                                            )}
                                            {peakRank && (
                                                <p className="text-gray-300">
                                                    <span className="font-medium">Peak Rank:</span>{' '}
                                                    <span className={getPeakRankColor(peakRank)}>{peakRank}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {notes && (
                                    <div className="prose prose-invert max-w-none">
                                        <h3 className="text-lg font-semibold mb-2">Notes</h3>
                                        <p className="text-gray-300">{notes}</p>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => {
                                            setIsGameModalOpen(false);
                                            setIsProgressModalOpen(true);
                                        }}
                                        className="btn bg-primary-500 hover:bg-primary-600 transition-colors px-4 py-2"
                                    >
                                        Update Progress
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Progress Modal */}
            {isProgressModalOpen && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
                    <div className="bg-dark-light rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Update Progress for {game.name}</h3>
                        <form onSubmit={handleProgressSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Playtime
                                </label>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500 mb-1">Hours</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={playtimeHours}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                setPlaytimeHours(value === '' ? 0 : Math.max(0, parseInt(value)));
                                            }}
                                            className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500 mb-1">Minutes</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={playtimeMinutes}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                const numValue = value === '' ? 0 : parseInt(value);
                                                if (numValue >= 60) {
                                                    setPlaytimeHours(h => h + Math.floor(numValue / 60));
                                                    setPlaytimeMinutes(numValue % 60);
                                                } else {
                                                    setPlaytimeMinutes(Math.max(0, numValue));
                                                }
                                            }}
                                            className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            max="59"
                                        />
                                    </div>
                                </div>
                            </div>

                            {game.is_competitive ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Current Rank
                                        </label>
                                        <input
                                            type="text"
                                            value={currentRank}
                                            onChange={(e) => setCurrentRank(e.target.value)}
                                            placeholder="e.g., Diamond 2, Global Elite, Top 500"
                                            className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Peak Rank
                                        </label>
                                        <input
                                            type="text"
                                            value={peakRank}
                                            onChange={(e) => setPeakRank(e.target.value)}
                                            placeholder="Highest rank achieved"
                                            className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Completion Percentage
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={completion}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            const numValue = value === '' ? 0 : parseInt(value);
                                            setCompletion(Math.min(100, Math.max(0, numValue)));
                                        }}
                                        className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Last Played
                                </label>
                                <input
                                    type="date"
                                    value={lastPlayed}
                                    onChange={(e) => setLastPlayed(e.target.value)}
                                    className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 min-h-[100px]"
                                    placeholder="Add your notes here..."
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg py-2"
                                >
                                    Save Progress
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsProgressModalOpen(false)}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default GameCard; 