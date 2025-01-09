import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_GAME_STATUS, GET_DATA } from '../queries';
import { Game, HasuraGameStatus } from '../types/game';

interface GameCardProps {
    game: Game;
    actions?: React.ReactNode;
    onStatusChange?: (status: HasuraGameStatus) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, actions }) => {
    const [localStatus, setLocalStatus] = useState(game.status);
    const [updateStatus] = useMutation(UPDATE_GAME_STATUS, {
        refetchQueries: [{ query: GET_DATA }]
    });

    // Update local state when prop changes
    useEffect(() => {
        setLocalStatus(game.status);
    }, [game.status]);

    const statusColors = {
        NOT_STARTED: 'text-gray-400',
        IN_PROGRESS: 'text-green-500',
        COMPLETED: 'text-blue-500',
        ON_HOLD: 'text-yellow-500',
        DROPPED: 'text-red-500',
        WANT_TO_PLAY: 'text-purple-500'
    };

    const handleStatusChange = async (newStatus: HasuraGameStatus) => {
        try {
            await updateStatus({
                variables: {
                    id: game.id,
                    status: newStatus
                }
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div className="bg-dark-light rounded-lg overflow-hidden h-[250px] flex">
            {/* Image Section - 2:3 aspect ratio */}
            <div className="w-[167px] h-full flex-shrink-0 relative bg-gray-700">
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
                {/* Title and Year on same line */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg truncate pr-4 flex-1">{game.name}</h3>
                    {game.year && (
                        <span className="text-sm text-text-secondary whitespace-nowrap">
                            {game.year}
                        </span>
                    )}
                </div>

                {/* Status Selector */}
                <select
                    value={localStatus || ''}
                    onChange={(e) => handleStatusChange(e.target.value as HasuraGameStatus)}
                    className={`mb-3 bg-dark/90 border border-gray-700 rounded-lg px-3 py-1.5 text-sm w-fit ${
                        statusColors[localStatus as HasuraGameStatus] || 'text-gray-400'
                    }`}
                >
                    <option value="">Set Status</option>
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="DROPPED">Dropped</option>
                    <option value="WANT_TO_PLAY">Want to Play</option>
                </select>

                {/* Description - Fill available space */}
                <div className="flex-1 overflow-hidden mb-4">
                    <div className="text-sm text-text-secondary line-clamp-4">
                        {game.description || 'No description available.'}
                    </div>
                </div>

                {/* Actions Section - Aligned with bottom of image */}
                {actions && (
                    <div className="flex gap-2 absolute bottom-4 left-4 right-4">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameCard; 