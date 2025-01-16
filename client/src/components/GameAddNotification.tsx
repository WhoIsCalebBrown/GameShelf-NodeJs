import React, { useEffect } from 'react';
import { GameAddNotificationProps } from '../types/props';



const GameAddNotification: React.FC<GameAddNotificationProps> = ({ game, status, onClose }) => {
    useEffect(() => {
        if (status === 'success' || status === 'exists') {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [status, onClose]);

    if (!game || !status) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className={`
                transform transition-all duration-500 ease-out
                ${status === 'adding' ? 'translate-y-0' : (status === 'success' || status === 'exists') ? 'translate-y-0' : 'translate-y-full'}
                bg-dark-light rounded-lg shadow-2xl border border-gray-900/80 p-4 max-w-sm w-full bg-opacity-95
            `}>
                <div className="flex items-center gap-4">
                    {/* Game Image */}
                    <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                        {game.cover?.url ? (
                            <img 
                                src={game.cover.url.replace('//images.igdb.com', 'https://images.igdb.com')}
                                alt={game.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-dark flex items-center justify-center">
                                <span className="text-gray-500 text-sm">No Image</span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{game.name}</h4>
                        <p className="text-sm text-gray-400">
                            {status === 'adding' ? 'Adding to collection...' : 
                             status === 'exists' ? 'Already in collection!' :
                             'Added to collection!'}
                        </p>
                    </div>

                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                        {status === 'adding' ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
                        ) : status === 'exists' ? (
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameAddNotification; 