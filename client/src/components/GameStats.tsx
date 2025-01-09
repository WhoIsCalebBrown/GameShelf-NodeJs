import React from 'react';
import { Game } from '../types/game';

interface GameStatsProps {
    games: Game[];
}

const GameStats: React.FC<GameStatsProps> = ({ games }) => {
    const stats = {
        NOT_STARTED: games.filter(game => game.status === 'NOT_STARTED').length,
        IN_PROGRESS: games.filter(game => game.status === 'IN_PROGRESS').length,
        COMPLETED: games.filter(game => game.status === 'COMPLETED').length,
        ON_HOLD: games.filter(game => game.status === 'ON_HOLD').length,
        DROPPED: games.filter(game => game.status === 'DROPPED').length,
        WANT_TO_PLAY: games.filter(game => game.status === 'WANT_TO_PLAY').length
    };

    const maxCount = Math.max(...Object.values(stats), 1);
    const getHeight = (count: number) => `${(count / maxCount) * 200}px`;

    return (
        <div className="bg-dark p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold mb-4">Collection Stats</h3>
            
            <div className="grid grid-cols-6 gap-4 h-[250px] mb-8">
                {Object.entries(stats).map(([status, count]) => (
                    <div key={status} className="flex flex-col items-center justify-end">
                        <div className="text-sm mb-2">{count}</div>
                        <div 
                            style={{ height: getHeight(count) }}
                            className={`w-12 rounded-t-lg transition-all duration-500 ${
                                status === 'NOT_STARTED' ? 'bg-gray-500' :
                                status === 'IN_PROGRESS' ? 'bg-green-500' :
                                status === 'COMPLETED' ? 'bg-blue-500' :
                                status === 'ON_HOLD' ? 'bg-yellow-500' :
                                status === 'DROPPED' ? 'bg-red-500' :
                                'bg-purple-500'
                            }`}
                        />
                        <div className="text-xs mt-2 text-center text-gray-400">
                            {status.split('_').join(' ')}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full" />
                    <span className="text-sm">Not Started ({stats.NOT_STARTED})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm">In Progress ({stats.IN_PROGRESS})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm">Completed ({stats.COMPLETED})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span className="text-sm">On Hold ({stats.ON_HOLD})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-sm">Dropped ({stats.DROPPED})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span className="text-sm">Want to Play ({stats.WANT_TO_PLAY})</span>
                </div>
            </div>
        </div>
    );
};

export default GameStats; 