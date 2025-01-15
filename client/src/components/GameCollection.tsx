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

type SortField = 'name' | 'status' | 'year';

const GameCollection: React.FC = () => {
    const {user} = useAuth();
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: 'name',
        order: 'asc'
    });
    const [showSteamImport, setShowSteamImport] = useState(false);

    const {loading, error, data, networkStatus} = useQuery(GET_DATA, {
        variables: {
            userId: user?.id,
            orderBy: sortConfig.field === 'status'
                ? [{status: sortConfig.order}]
                : [{game: {[sortConfig.field]: sortConfig.order}}]
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
                        orderBy: sortConfig.field === 'status'
                            ? [{status: sortConfig.order}]
                            : [{game: {[sortConfig.field]: sortConfig.order}}]
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
                            orderBy: sortConfig.field === 'status'
                                ? [{status: sortConfig.order}]
                                : [{game: {[sortConfig.field]: sortConfig.order}}]
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
                    orderBy: sortConfig.field === 'status'
                        ? [{status: sortConfig.order}]
                        : [{game: {[sortConfig.field]: sortConfig.order}}]
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
                        orderBy: sortConfig.field === 'status'
                            ? [{status: sortConfig.order}]
                            : [{game: {[sortConfig.field]: sortConfig.order}}]
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
        peak_rank: progress.peak_rank
    }));

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
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-dark p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <h2 className="text-2xl font-bold">My Game Collection</h2>
                    <button
                        onClick={() => setShowSteamImport(!showSteamImport)}
                        className={`
                            px-4 py-2 rounded-lg font-medium 'bg-primary-500 text-white shadow-lg'
                            ${showSteamImport
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-dark-light hover:bg-primary-500/20 text-gray-300'
                        } 
                            transition-all duration-200 flex items-center gap-2
                        `}
                    >
                        {showSteamImport ? 'Hide Steam Import' : 'Import from Steam'}
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-gray-400 self-center mr-2">Sort by:</span>
                    <SortButton field="name" label="Name"/>
                    <SortButton field="status" label="Status"/>
                    <SortButton field="year" label="Release Date"/>

                </div>
            </div>

            {showSteamImport && <SteamImport/>}

            <GameStats games={games}/>

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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-[1600px] mx-auto">
                    {games.map((game: Game) => (
                        <div key={game.id} className="transition-all duration-300 ease-in-out">
                            <GameCard
                                game={game}
                                onStatusChange={(status) => handleStatusChange(game.id, status)}
                                onDelete={() => handleDelete(game.id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GameCollection;