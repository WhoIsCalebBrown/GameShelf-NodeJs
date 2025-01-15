import React, {useState} from 'react';
import {useQuery, useMutation, NetworkStatus} from '@apollo/client';
import {GET_DATA, DELETE_GAME, UPDATE_GAME_STATUS} from '../queries/queries';
import GameCard from './GameCard';
import {Game, game_status} from '../types/game';
import {SortConfig} from '../types/api';
import {SortButtonProps} from '../types/props';
import GameStats from './GameStats';
import SteamImport from './SteamImport';
import {useAuth} from '../context/AuthContext';

type SortField = 'name' | 'status' | 'year' | 'last_played_at' | 'playtime_minutes';

const GameCollection: React.FC = () => {
    const {user} = useAuth();
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: 'name',
        order: 'asc'
    });
    const [showSteamImport, setShowSteamImport] = useState(false);
    const [groupUnplayed, setGroupUnplayed] = useState(false);

    const {loading, error, data, networkStatus} = useQuery(GET_DATA, {
        variables: {
            userId: user?.id,
            orderBy: [{ status: 'asc' }]
        },
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
        skip: !user?.id
    });

    const [deleteGame] = useMutation(DELETE_GAME, {
        update(cache, {data: {delete_game_progress}}) {
            try {
                const existingData = cache.readQuery<{ game_progress: any[] }>({
                    query: GET_DATA,
                    variables: {
                        userId: user?.id,
                        orderBy: [{ status: 'asc' }]
                    }
                });

                if (existingData && delete_game_progress.affected_rows > 0) {
                    const deletedGameId = delete_game_progress.returning[0].game_id;
                    const updatedProgress = existingData.game_progress.filter(
                        progress => progress.game.id !== deletedGameId
                    );

                    cache.writeQuery({
                        query: GET_DATA,
                        variables: {
                            userId: user?.id,
                            orderBy: [{ status: 'asc' }]
                        },
                        data: {game_progress: updatedProgress}
                    });
                }
            } catch (error) {
                console.error('Error updating cache after deletion:', error);
            }
        },
        onError: (error) => {
            console.error('Error deleting game:', error);
        }
    });

    const [updateGameStatus] = useMutation(UPDATE_GAME_STATUS, {
        update(cache, {data: {update_game_progress}}) {
            const existingData = cache.readQuery<{ game_progress: any[] }>({
                query: GET_DATA,
                variables: {
                    userId: user?.id,
                    orderBy: [{ status: 'asc' }]
                }
            });
            if (existingData && update_game_progress.returning.length > 0) {
                const updatedProgress = existingData.game_progress.map(progress =>
                    progress.game.id === update_game_progress.returning[0].game_id
                        ? {...progress, status: update_game_progress.returning[0].status}
                        : progress
                );
                cache.writeQuery({
                    query: GET_DATA,
                    variables: {
                        userId: user?.id,
                        orderBy: [{ status: 'asc' }]
                    },
                    data: {game_progress: updatedProgress}
                });
            }
        }
    });

    const handleSort = (field: SortField) => {
        setSortConfig(prev => ({
            field,
            order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleDelete = async (gameId: number) => {
        if (!user?.id) return;

        try {
            const result = await deleteGame({
                variables: {
                    userId: user.id,
                    gameId
                }
            });

            if (!result.data?.delete_game_progress?.affected_rows) {
                throw new Error('Failed to delete game');
            }
        } catch (error) {
            console.error('Error deleting game:', error);
            // You might want to show this error to the user in a more user-friendly way
            alert('Failed to delete game. Please try again.');
        }
    };

    const handleStatusChange = async (gameId: number, newStatus: game_status) => {
        if (!user?.id) return;
        try {
            await updateGameStatus({
                variables: {
                    userId: user.id,
                    gameId,
                    status: newStatus
                }
            });
        } catch (error) {
            console.error('Error updating game status:', error);
        }
    };

    const handleSteamImport = () => {
        if (user?.steam_id) {
            // If user has steam_id, directly start import
            setShowSteamImport(true);
        } else {
            // Otherwise, show the input form
            setShowSteamImport(!showSteamImport);
        }
    };

    const SortButton: React.FC<SortButtonProps> = ({field, label}) => (
        <button
            onClick={() => handleSort(field)}
            className={`
                px-4 py-2 rounded-lg font-medium
                ${sortConfig.field === field
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-dark-light hover:bg-primary-500/20 text-gray-300'
            } 
                transition-all duration-200 flex items-center gap-2
            `}
        >
            {label}
            {sortConfig.field === field && (
                <span className="text-lg">
                    {sortConfig.order === 'asc' ? '↑' : '↓'}
                </span>
            )}
        </button>
    );

    const gameProgressList = data?.game_progress || [];
    const games = gameProgressList.map((progress: any) => ({
        ...progress.game,
        status: progress.status,
        playtime_minutes: progress.playtime_minutes,
        completion_percentage: progress.completion_percentage,
        last_played_at: progress.last_played_at,
        notes: progress.notes,
        current_rank: progress.current_rank,
        peak_rank: progress.peak_rank,
        is_favorite: progress.is_favorite
    }));

    // Memoize the sorted games to prevent unnecessary re-renders
    const sortedGames = React.useMemo(() => {
        const sortGames = (gamesArray: Game[]) => {
            return [...gamesArray].sort((a, b) => {
                if (sortConfig.field === 'name') {
                    return sortConfig.order === 'asc' 
                        ? a.name.localeCompare(b.name)
                        : b.name.localeCompare(a.name);
                }
                if (sortConfig.field === 'status') {
                    return sortConfig.order === 'asc'
                        ? a.status.localeCompare(b.status)
                        : b.status.localeCompare(a.status);
                }
                if (sortConfig.field === 'year') {
                    const yearA = a.year || 0;
                    const yearB = b.year || 0;
                    return sortConfig.order === 'asc' ? yearA - yearB : yearB - yearA;
                }
                if (sortConfig.field === 'last_played_at') {
                    const dateA = a.last_played_at ? new Date(a.last_played_at).getTime() : 0;
                    const dateB = b.last_played_at ? new Date(b.last_played_at).getTime() : 0;
                    return sortConfig.order === 'asc' ? dateA - dateB : dateB - dateA;
                }
                if (sortConfig.field === 'playtime_minutes') {
                    const timeA = a.playtime_minutes || 0;
                    const timeB = b.playtime_minutes || 0;
                    return sortConfig.order === 'asc' ? timeA - timeB : timeB - timeA;
                }
                return 0;
            });
        };

        const favoriteGames = sortGames(games.filter(game => game.is_favorite));
        const regularGames = sortGames(games.filter(game => !game.is_favorite));

        return { favoriteGames, regularGames };
    }, [games, sortConfig]);

    // Memoize GameStats to prevent re-renders when sorting changes
    const memoizedGameStats = React.useMemo(() => (
        <GameStats games={games} />
    ), [games]);

    // Split games into played and unplayed
    const { playedGames, neverPlayedGames } = React.useMemo(() => {
        if (!groupUnplayed) {
            return {
                playedGames: sortedGames.regularGames,
                neverPlayedGames: []
            };
        }

        return {
            playedGames: sortedGames.regularGames.filter(game => game.last_played_at !== null),
            neverPlayedGames: sortedGames.regularGames.filter(game => game.last_played_at === null)
        };
    }, [sortedGames.regularGames, groupUnplayed]);

    const showLoading = loading && networkStatus === NetworkStatus.loading;

    if (!user) {
        return (
            <div className="bg-dark p-8 rounded-lg">
                <div className="text-lg text-gray-400 text-center">
                    Please sign in to view your game collection.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-dark p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <h2 className="text-2xl font-bold">My Game Collection</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSteamImport}
                            className={`
                                px-4 py-2 rounded-lg font-medium
                                ${showSteamImport
                                ? 'bg-primary-500 text-white shadow-lg'
                                : 'bg-dark-light hover:bg-primary-500/20 text-gray-300'
                            } 
                                transition-all duration-200 flex items-center gap-2
                            `}
                        >
                            {showSteamImport ? 'Hide Steam Import' : 'Import from Steam'}
                        </button>
                        <label className="flex items-center gap-2 text-gray-300">
                            <input
                                type="checkbox"
                                checked={groupUnplayed}
                                onChange={(e) => setGroupUnplayed(e.target.checked)}
                                className="form-checkbox h-4 w-4 text-primary-500 rounded bg-dark-light border-gray-600 focus:ring-primary-500"
                            />
                            Group Unplayed Games
                        </label>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-gray-400 self-center mr-2">Sort by:</span>
                    <SortButton field="name" label="Name"/>
                    <SortButton field="status" label="Status"/>
                    <SortButton field="year" label="Release Date"/>
                    <SortButton field="last_played_at" label="Last Played"/>
                    <SortButton field="playtime_minutes" label="Playtime"/>
                </div>
            </div>

            {showSteamImport && (
                <SteamImport 
                    autoImport={!!user?.steam_id} 
                    defaultSteamId={user?.steam_id || ''} 
                />
            )}

            {memoizedGameStats}

            {showLoading ? (
                <div className="bg-dark p-8 rounded-lg">
                    <div className="animate-pulse flex items-center justify-center">
                        <div className="text-lg text-gray-400">Loading games...</div>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-dark p-8 rounded-lg">
                    <div className="text-red-500">Error: {error.message}</div>
                </div>
            ) : (
                <>
                    {/* Favorite Games Section */}
                    {sortedGames.favoriteGames.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-primary-400">Favorite Games</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {sortedGames.favoriteGames.map((game: Game) => (
                                    <div key={game.id} className="transition-all duration-300 ease-in-out">
                                        <GameCard
                                            game={game}
                                            onStatusChange={(status) => handleStatusChange(game.id, status)}
                                            onDelete={() => handleDelete(game.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Regular Games Section */}
                    <div className="space-y-4">
                        {(sortedGames.favoriteGames.length > 0 || groupUnplayed) && (
                            <h3 className="text-xl font-semibold">
                                {groupUnplayed ? 'Played Games' : 'All Games'}
                            </h3>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {playedGames.map((game: Game) => (
                                <div key={game.id} className="transition-all duration-300 ease-in-out">
                                    <GameCard
                                        game={game}
                                        onStatusChange={(status) => handleStatusChange(game.id, status)}
                                        onDelete={() => handleDelete(game.id)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Never Played Section - Shown when groupUnplayed is true */}
                        {groupUnplayed && neverPlayedGames.length > 0 && (
                            <>
                                <div className="relative my-12">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t-2 border-gray-700"></div>
                                    </div>
                                    <div className="relative flex justify-center my-28">
                                        <span className="px-6 py-2 bg-dark text-gray-200 text-xl font-semibold rounded-full border-2 border-gray-700">
                                            Never Played
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {neverPlayedGames.map((game: Game) => (
                                        <div key={game.id} className="transition-all duration-300 ease-in-out">
                                            <GameCard
                                                game={game}
                                                onStatusChange={(status) => handleStatusChange(game.id, status)}
                                                onDelete={() => handleDelete(game.id)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default GameCollection;