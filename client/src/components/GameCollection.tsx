import React, {useState, useEffect} from 'react';
import {useQuery, useMutation, NetworkStatus} from '@apollo/client';
import {GET_GAME_COLLECTION, DELETE_GAME_PROGRESS, UPDATE_GAME_PROGRESS_STATUS} from '../queries';
import GameCard from './GameCard';
import {Game, game_status} from '../types/game';
import {SortConfig} from '../types/api';
import {SortButtonProps} from '../types/props';
import GameStats from './GameStats';
import SteamImport from './SteamImport';
import {useAuth} from '../context/AuthContext';
import '../animations.css';

type SortField = 'name' | 'status' | 'year' | 'last_played_at' | 'playtime_minutes';

interface GameProgress {
    game: Game;
    status: game_status;
    playtime_minutes: number;
    completion_percentage: number;
    last_played_at: string | null;
    notes: string;
    current_rank: string;
    peak_rank: string;
    is_favorite: boolean;
}

interface GameProgressData {
    game_progress: GameProgress[];
}

interface ExtendedSortButtonProps extends SortButtonProps {
    sortConfig: SortConfig;
    onSort: (field: SortField) => void;
}

const SortButton = React.memo<ExtendedSortButtonProps>(({field, label, sortConfig, onSort}) => (
    <button
        onClick={() => onSort(field)}
        className={`
            px-4 py-2 rounded-lg font-medium
            ${sortConfig.field === field
            ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' 
            : 'bg-[#171a21] hover:text-white text-gray-300 hover:bg-[#2a475e]'
        } 
            transition-all duration-200 flex items-center gap-2
            active:scale-95
        `}
    >
        {label}
        {sortConfig.field === field && (
            <span className="text-lg">
                {sortConfig.order === 'asc' ? '↑' : '↓'}
            </span>
        )}
    </button>
));

SortButton.displayName = 'SortButton';

const GameCollection: React.FC = () => {
    const {user} = useAuth();
    const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
        const saved = localStorage.getItem('gameshelf-sort-config');
        return saved ? JSON.parse(saved) : {
            field: 'name',
            order: 'asc'
        };
    });
    const [showSteamImport, setShowSteamImport] = useState(false);
    const [groupUnplayed, setGroupUnplayed] = useState(() => {
        return localStorage.getItem('gameshelf-group-unplayed') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('gameshelf-sort-config', JSON.stringify(sortConfig));
    }, [sortConfig]);

    useEffect(() => {
        localStorage.setItem('gameshelf-group-unplayed', String(groupUnplayed));
    }, [groupUnplayed]);

    const {loading, error, data, networkStatus} = useQuery(GET_GAME_COLLECTION, {
        variables: {
            userId: user?.id,
            orderBy: [{ status: 'asc' }]
        },
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
        skip: !user?.id
    });

    const [deleteGame] = useMutation(DELETE_GAME_PROGRESS, {
        update(cache, {data: {delete_game_progress}}) {
            try {
                const existingData = cache.readQuery<{ game_progress: { game: { id: string } }[] }>({
                    query: GET_GAME_COLLECTION,
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
                        query: GET_GAME_COLLECTION,
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
        }
    });

    const [updateGameStatus] = useMutation(UPDATE_GAME_PROGRESS_STATUS, {
        update(cache, {data: {update_game_progress}}) {
            const existingData = cache.readQuery<GameProgressData>({
                query: GET_GAME_COLLECTION,
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
                    query: GET_GAME_COLLECTION,
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
            order: prev.field === field 
                ? prev.order === 'asc' ? 'desc' : 'asc'
                : (field === 'last_played_at' || field === 'playtime_minutes') ? 'desc' : 'asc'
        }));
    };

    const handleDelete = async (gameId: number) => {
        if (!user?.id) return;
        try {
            await deleteGame({
                variables: {
                    userId: user.id,
                    gameId
                }
            });
        } catch (error) {
            console.error('Error deleting game:', error);
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
            setShowSteamImport(true);
        } else {
            setShowSteamImport(!showSteamImport);
        }
    };

    const games = React.useMemo(() => {
        const gameProgressList = data?.game_progress || [];
        return gameProgressList.map((progress: GameProgress) => ({
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
    }, [data?.game_progress]);

    const sortGames = React.useCallback((gamesArray: Game[]) => {
        return [...gamesArray].sort((a, b) => {
            if (sortConfig.field === 'name') {
                return sortConfig.order === 'asc' 
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            }
            if (sortConfig.field === 'status') {
                return sortConfig.order === 'asc'
                    ? (a.status || '').localeCompare(b.status || '')
                    : (b.status || '').localeCompare(a.status || '');
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
    }, [sortConfig]);

    const sortedGames = React.useMemo(() => {
        const favoriteGames = sortGames(games.filter(game => game.is_favorite));
        const regularGames = sortGames(games.filter(game => !game.is_favorite));
        return { favoriteGames, regularGames };
    }, [games, sortGames]);

    const memoizedGameStats = React.useMemo(() => (
        <GameStats games={games} />
    ), [games]);

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
        <div className="space-y-6 bg-dark p-8 rounded-lg">
            <div className="flex flex-wrap gap-4 items-center bg-dark-light p-2 rounded-lg">
                <SortButton field="name" label="Name" sortConfig={sortConfig} onSort={handleSort} />
                <SortButton field="status" label="Status" sortConfig={sortConfig} onSort={handleSort} />
                <SortButton field="year" label="Year" sortConfig={sortConfig} onSort={handleSort} />
                <SortButton field="last_played_at" label="Last Played" sortConfig={sortConfig} onSort={handleSort} />
                <SortButton field="playtime_minutes" label="Playtime" sortConfig={sortConfig} onSort={handleSort} />
                
                <div className="ml-auto flex gap-4 items-center">
                    <button
                        onClick={() => setGroupUnplayed(!groupUnplayed)}
                        className={`
                            px-4 py-2 rounded-lg font-medium
                            ${groupUnplayed
                              ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' 
                              : 'bg-dark-light hover:bg-primary-500/20 hover:text-white text-gray-300 hover:bg-[#2a475e]'
                            }
                            transition-colors
                        `}
                    >
                        Group Unplayed
                    </button>

                    <button
                        onClick={handleSteamImport}
                        className="px-4 py-2 rounded-lg font-medium bg-[#171a21] hover:bg-[#2a475e] text-white transition-colors flex items-center gap-2"
                    >
                        <img
                            src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/english/sits_small.png"
                            alt="Steam"
                            className="h-5 w-5"
                        />
                        Import Steam Games
                    </button>
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
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                    <p className="mt-2 text-gray-400">Loading your games...</p>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
                    Error loading games. Please try again later.
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
                                            onDelete={() => handleDelete(game.id)}
                                            onStatusChange={(status) => handleStatusChange(game.id, status)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Regular Games Section */}
                    <div className="space-y-4">
                        {(sortedGames.favoriteGames.length > 0 || groupUnplayed) && (
                            <h3 className="text-xl font-semibold my-10">
                                {groupUnplayed ? 'Played Games' : 'All Games'}
                            </h3>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {playedGames.map((game: Game) => (
                                <div key={game.id} className="transition-all duration-300 ease-in-out">
                                    <GameCard
                                        game={game}
                                        onDelete={() => handleDelete(game.id)}
                                        onStatusChange={(status) => handleStatusChange(game.id, status)}
                                    />
                                </div>
                            ))}
                        </div>

                        {groupUnplayed && neverPlayedGames.length > 0 && (
                            <>
                                <div className="my-10">
                                    <h3 className="text-xl font-semibold">Never Played</h3>
                                </div> 
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {neverPlayedGames.map((game: Game) => (
                                        <div key={game.id} className="transition-all duration-300 ease-in-out">
                                            <GameCard
                                                game={game}
                                                onDelete={() => handleDelete(game.id)}
                                                onStatusChange={(status) => handleStatusChange(game.id, status)}
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