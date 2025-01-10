import React, { useState } from 'react';
import { useQuery, useMutation, NetworkStatus } from '@apollo/client';
import { GET_DATA, DELETE_GAME, UPDATE_GAME_STATUS } from '../queries';
import GameCard from './GameCard';
import { Game, GameStatus } from '../types/game';
import GameStats from './GameStats';

type SortField = 'name' | 'status' | 'year';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    order: SortOrder;
}

interface DropdownMenuProps {
    onDelete: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
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
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-dark-light border border-gray-600 rounded-lg shadow-lg z-50">
                        <button
                            onClick={() => {
                                onDelete();
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700 transition-colors rounded-lg"
                        >
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const GameCollection: React.FC = () => {
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: 'name',
        order: 'asc'
    });

    const { loading, error, data, networkStatus } = useQuery(GET_DATA, {
        variables: {
            orderBy: { [sortConfig.field]: sortConfig.order }
        },
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true
    });

    const [deleteGame] = useMutation(DELETE_GAME, {
        update(cache, { data: { delete_Games_by_pk } }) {
            const existingData = cache.readQuery<{ Games: Game[] }>({
                query: GET_DATA,
                variables: { orderBy: { [sortConfig.field]: sortConfig.order } }
            });
            if (existingData) {
                const updatedGames = existingData.Games.filter(
                    game => game.id !== delete_Games_by_pk.id
                );
                cache.writeQuery({
                    query: GET_DATA,
                    variables: { orderBy: { [sortConfig.field]: sortConfig.order } },
                    data: { Games: updatedGames }
                });
            }
        },
        optimisticResponse: (vars) => ({
            delete_Games_by_pk: {
                id: vars.id,
                __typename: 'Games'
            }
        })
    });

    const [updateGameStatus] = useMutation(UPDATE_GAME_STATUS, {
        update(cache, { data: { update_Games_by_pk } }) {
            const existingData = cache.readQuery<{ Games: Game[] }>({ 
                query: GET_DATA,
                variables: { orderBy: { [sortConfig.field]: sortConfig.order } }
            });
            if (existingData) {
                const updatedGames = existingData.Games.map(game =>
                    game.id === update_Games_by_pk.id ? { ...game, ...update_Games_by_pk } : game
                );
                cache.writeQuery({
                    query: GET_DATA,
                    variables: { orderBy: { [sortConfig.field]: sortConfig.order } },
                    data: { Games: updatedGames }
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

    const handleDelete = async (id: number) => {
        try {
            await deleteGame({
                variables: { id }
            });
        } catch (error) {
            console.error('Error deleting game:', error);
        }
    };

    const handleStatusChange = async (gameId: number, newStatus: GameStatus) => {
        try {
            await updateGameStatus({
                variables: {
                    id: gameId,
                    status: newStatus
                },
                optimisticResponse: {
                    update_Games_by_pk: {
                        id: gameId,
                        status: newStatus,
                        __typename: 'Games'
                    }
                }
            });
        } catch (error) {
            console.error('Error updating game status:', error);
        }
    };

    const SortButton: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
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

    const games = data?.Games || [];

    const showLoading = loading && networkStatus === NetworkStatus.loading;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-dark p-4 rounded-lg">
                <h2 className="text-2xl font-bold">My Game Collection</h2>
                <div className="flex flex-wrap gap-3">
                    <span className="text-gray-400 self-center mr-2">Sort by:</span>
                    <SortButton field="name" label="Name" />
                    <SortButton field="status" label="Status" />
                    <SortButton field="year" label="Release Date" />
                </div>
            </div>
            
            <GameStats games={games} />
            
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
                                actions={
                                    <DropdownMenu onDelete={() => handleDelete(game.id)} />
                                }
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GameCollection; 