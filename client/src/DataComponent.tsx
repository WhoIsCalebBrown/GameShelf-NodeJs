import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_DATA, UPDATE_GAME_STATUS } from './queries';
import { useAuth } from './context/AuthContext';
import { game_status } from './types/game';

const LoadingSpinner = () => <p className="text-center">Loading...</p>;
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-red-500 text-center">Error: {message}</p>
);

interface Game {
    id: string;
    name: string;
    description: string;
    year: number;
    igdb_id: number;
    slug: string;
    status: game_status;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'NOT_STARTED': return 'bg-gray-500';
        case 'IN_PROGRESS': return 'bg-green-500';
        case 'COMPLETED': return 'bg-blue-500';
        case 'ON_HOLD': return 'bg-yellow-500';
        case 'DROPPED': return 'bg-red-500';
        case 'WANT_TO_PLAY': return 'bg-purple-500';
        default: return 'bg-gray-500';
    }
};

const getStatusText = (status: string) => {
    return status.replace(/_/g, ' ');
};

const GAME_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'WANT_TO_PLAY'] as const;


const GameModal: React.FC<{ game: Game; onClose: () => void }> = ({ game, onClose }) => {
    const { user } = useAuth();
    const [updateStatus] = useMutation(UPDATE_GAME_STATUS, {
        refetchQueries: [{ 
            query: GET_DATA,
            variables: {
                userId: user?.id,
                orderBy: [{ status: 'asc' }]
            }
        }],
        onError: (error) => {
            console.error('Error updating game status:', error);
            alert(`Failed to update game status: ${error.message}`);
        }
    });

    const handleStatusChange = async (newStatus: game_status) => {
        console.log('Attempting to update status:', { gameId: game.id, newStatus });
        try {
            const numericId = parseInt(game.id);
            if (isNaN(numericId)) {
                throw new Error('Invalid game ID');
            }
            const result = await updateStatus({
                variables: {
                    userId: user?.id,
                    gameId: numericId,
                    status: newStatus
                }
            });
            console.log('Update result:', result);
        } catch (error) {
            console.error('Error updating game status:', error);
            alert(`Failed to update game status: ${error.message}`);
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div 
            className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="w-11/12 max-w-2xl bg-dark rounded-lg shadow-xl overflow-y-auto animate-modal-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">{game.name}</h2>
                    <p className="text-text-secondary mb-6 leading-relaxed">{game.description}</p>
                    <div className="border-t border-dark-border pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-text-secondary font-bold">Release Year:</span>
                            <span>{game.year}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-text-secondary font-bold">IGDB ID:</span>
                            <span>
                                <a 
                                    href={`https://www.igdb.com/games/${game.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    {game.igdb_id}
                                </a>
                            </span>
                        </div>
                        <div className="mb-6">
                            <span className="text-text-secondary font-bold block mb-2">Status:</span>
                            <div className="grid grid-cols-2 gap-2">
                                {GAME_STATUSES.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(status as game_status)}
                                        className={`px-4 py-2 rounded transition-all ${
                                            game.status === status 
                                                ? `${getStatusColor(status)} text-white` 
                                                : 'bg-dark-light hover:bg-dark-border'
                                        }`}
                                    >
                                        {getStatusText(status)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button 
                            className="btn btn-full"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GameCard: React.FC<{ game: Game; isExpanded: boolean; onClick: () => void }> = ({ 
    game, 
    isExpanded, 
    onClick 
}) => {
    return (
        <>
            <div 
                className="bg-dark rounded-lg overflow-hidden shadow-md transition-transform hover:-translate-y-1 cursor-pointer"
                onClick={onClick}
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold">{game.name}</h2>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(game.status)} text-white ml-2`}>
                            {getStatusText(game.status)}
                        </span>
                    </div>
                    <p className="text-text-secondary mb-4 leading-relaxed">{game.description}</p>
                    <div className="text-center">
                        <button 
                            className="btn"
                            onClick={onClick}
                        >
                            View Details
                        </button>
                    </div>
                </div>
            </div>
            {isExpanded && <GameModal game={game} onClose={onClick} />}
        </>
    );
};

const DataComponent: React.FC = () => {
    const { loading, error, data } = useQuery(GET_DATA);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && expandedId) {
                setExpandedId(null);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [expandedId]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error.message} />;
    
    const games = data?.games;
    if (!games?.length) return <p className="text-center">No games available</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
            {games.map((game: Game) => (
                <GameCard
                    key={game.id}
                    game={game}
                    isExpanded={expandedId === game.id}
                    onClick={() => setExpandedId(expandedId === game.id ? null : game.id)}
                />
            ))}
        </div>
    );
};

export default DataComponent;