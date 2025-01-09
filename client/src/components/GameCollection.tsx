import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_DATA, DELETE_GAME, UPDATE_GAME } from '../queries';
import GameCard from './GameCard';
import EditGameModal from './EditGameModal';
import { Game, GameUpdate } from '../types/game';
import GameStats from './GameStats';

type SortField = 'name' | 'status' | 'year';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    order: SortOrder;
}

const GameCollection: React.FC = () => {
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: 'name',
        order: 'asc'
    });

    const [localGames, setLocalGames] = useState<Game[]>([]);
    const { loading, error, data } = useQuery(GET_DATA, {
        variables: {
            orderBy: { [sortConfig.field]: sortConfig.order }
        },
        pollInterval: 1000,
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
        onCompleted: (data) => setLocalGames(data.Games)
    });

    const [deleteGame] = useMutation(DELETE_GAME, {
        refetchQueries: [{
            query: GET_DATA,
            variables: {
                orderBy: { [sortConfig.field]: sortConfig.order }
            }
        }],
        awaitRefetchQueries: true
    });
    const [updateGame] = useMutation(UPDATE_GAME, {
        refetchQueries: [{ query: GET_DATA }]
    });

    const [editingGame, setEditingGame] = React.useState<Game | null>(null);

    const handleSort = (field: SortField) => {
        setSortConfig(prev => ({
            field,
            order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
        }));
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const handleDelete = async (id: number) => {
        try {
            await deleteGame({
                variables: { id },
                optimisticResponse: {
                    delete_Games_by_pk: {
                        id: id,
                        __typename: 'Games'
                    }
                }
            });
        } catch (error) {
            console.error('Error deleting game:', error);
        }
    };

    const handleEdit = (game: Game) => {
        setEditingGame(game);
    };

    const handleUpdate = async (id: number, updates: GameUpdate) => {
        try {
            await updateGame({
                variables: {
                    id,
                    ...updates
                }
            });
            setEditingGame(null);
        } catch (error) {
            console.error('Error updating game:', error);
        }
    };

    const updateLocalGameStatus = (gameId: number, newStatus: HasuraGameStatus) => {
        setLocalGames(prev => prev.map(game => 
            game.id === gameId ? { ...game, status: newStatus } : game
        ));
    };

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
            
            <GameStats games={localGames} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-1 gap-y-4 max-w-[1600px] mx-auto">
                {localGames.map((game: Game) => (
                    <GameCard
                        key={game.id}
                        game={game}
                        onStatusChange={(status) => updateLocalGameStatus(game.id, status)}
                        actions={
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(game)}
                                    className="btn bg-primary-500 hover:bg-primary-600 transition-colors flex-1"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(game.id)}
                                    className="btn bg-red-500 hover:bg-red-600 transition-colors flex-1"
                                >
                                    Delete
                                </button>
                            </div>
                        }
                    />
                ))}
            </div>

            {editingGame && (
                <EditGameModal
                    game={editingGame}
                    onClose={() => setEditingGame(null)}
                    onSave={handleUpdate}
                />
            )}
        </div>
    );
};

export default GameCollection; 