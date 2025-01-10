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
        <div className="bg-dark-light rounded-lg overflow-hidden h-[250px] flex transform transition-all duration-300 ease-in-out">
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
                {/* Header Section */}
                <div className="relative">
                    {/* Title */}
                    <div className="pr-20">
                        <h3 className="font-bold text-lg leading-tight min-h-[56px]">{game.name}</h3>
                    </div>
                    {/* Year and Actions - Absolute positioned */}
                    <div className="absolute top-0 right-0 flex items-center gap-2">
                        {game.year && (
                            <span className="text-sm text-text-secondary">
                                {game.year}
                            </span>
                        )}
                        {actions && (
                            <div className="flex-shrink-0">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Selector */}
                <select
                    value={localStatus || ''}
                    onChange={(e) => handleStatusChange(e.target.value as HasuraGameStatus)}
                    className={`bg-dark/90 border border-gray-700 rounded-lg px-3 py-1.5 text-sm w-fit -mt-2 ${
                        statusColors[localStatus as HasuraGameStatus] || 'text-gray-400'
                    }`}
                >
                    <option value="" className="text-gray-400">Set Status</option>
                    <option value="NOT_STARTED" className="text-gray-400">Not Started</option>
                    <option value="IN_PROGRESS" className="text-green-500">In Progress</option>
                    <option value="COMPLETED" className="text-blue-500">Completed</option>
                    <option value="ON_HOLD" className="text-yellow-500">On Hold</option>
                    <option value="DROPPED" className="text-red-500">Dropped</option>
                    <option value="WANT_TO_PLAY" className="text-purple-500">Want to Play</option>
                </select>

                {/* Description - Pushed to bottom */}
                <div className="mt-auto pt-3">
                    <div className="text-sm text-text-secondary line-clamp-6">
                        {game.description || 'No description available.'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameCard; 