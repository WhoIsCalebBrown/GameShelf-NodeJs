import React from 'react';
import { IGDBGame } from '../types/models/Game';

interface GameSearchCardProps {
    game: IGDBGame;
    onAddGame: (game: IGDBGame) => Promise<void>;
}

const GameSearchCard: React.FC<GameSearchCardProps> = ({ game, onAddGame }) => {
    return (
        <div className="bg-dark rounded-lg shadow-lg overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all">
            <div className="relative aspect-video">
                <img
                    src={game.cover?.url?.replace('t_thumb', 't_cover_big')}
                    alt={game.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-1">{game.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{game.summary}</p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddGame(game);
                    }}
                    className="w-full px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                >
                    Add to Collection
                </button>
            </div>
        </div>
    );
};

export default GameSearchCard; 