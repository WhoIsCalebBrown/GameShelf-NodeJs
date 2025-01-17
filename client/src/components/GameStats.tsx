import React from 'react';
import { Game } from '../types';

const GameStats: React.FC<{ games: Game[], compact?: boolean }> = ({ games, compact = false }) => {
    // Collection Stats
    const totalGames = games.length;
    const totalPlaytime = games.reduce((total, game) => total + (game.playtime_minutes || 0), 0);
    const playtimeHours = Math.floor(totalPlaytime / 60);
    const playtimeMinutes = totalPlaytime % 60;
    const gamesWithCompletion = games.filter(game => game.completion_percentage !== null && game.completion_percentage !== undefined);
    const averageCompletion = gamesWithCompletion.length > 0
        ? Math.round(gamesWithCompletion.reduce((sum, game) => sum + (game.completion_percentage || 0), 0) / gamesWithCompletion.length)
        : 0;

    // Main Status Stats
    const notStartedGames = games.filter(game => game.status === 'not_started').length;
    const completedGames = games.filter(game => game.status === 'completed').length;

    // Active Gaming Stats
    const inProgressGames = games.filter(game => game.status === 'in_progress').length;
    const activeMultiplayerGames = games.filter(game => game.status === 'active_multiplayer').length;
    const casualRotationGames = games.filter(game => game.status === 'casual_rotation').length;
    const replayingGames = games.filter(game => game.status === 'replaying').length;

    // Archived Stats
    const onHoldGames = games.filter(game => game.status === 'on_hold').length;
    const abandonedGames = games.filter(game => game.status === 'abandoned').length;
    const retiredGames = games.filter(game => game.status === 'retired').length;

    const baseCardClasses = "bg-dark rounded-lg " + (compact ? "p-4" : "p-6");
    const baseTitleClasses = "font-semibold mb-4 " + (compact ? "text-base" : "text-lg");
    const baseNumberClasses = "font-bold " + (compact ? "text-2xl" : "text-3xl");
    const baseLabelClasses = "text-gray-400 " + (compact ? "text-xs" : "text-sm");

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Collection Overview */}
            <div className={baseCardClasses}>
                <h3 className={`${baseTitleClasses} text-primary-400`}>Collection Overview</h3>
                <div className="space-y-4">
                    <div className="border-b border-gray-700 pb-4">
                        <p className={`${baseLabelClasses} mb-1`}>Total Games</p>
                        <p className={baseNumberClasses}>{totalGames}</p>
                    </div>
                    <div className="border-b border-gray-700 pb-4">
                        <p className={`${baseLabelClasses} mb-1`}>Total Playtime</p>
                        <p className={baseNumberClasses}>
                            {playtimeHours}<span className={compact ? "text-lg" : "text-xl"} style={{ fontWeight: 'normal' }}>h </span>
                            {playtimeMinutes}<span className={compact ? "text-lg" : "text-xl"} style={{ fontWeight: 'normal' }}>m</span>
                        </p>
                    </div>
                    <div>
                        <p className={`${baseLabelClasses} mb-1`}>Average Completion</p>
                        <p className={baseNumberClasses}>{averageCompletion}%</p>
                    </div>
                </div>
            </div>

            {/* Progress Status */}
            <div className={baseCardClasses}>
                <h3 className={`${baseTitleClasses} text-blue-400`}>Progress Status</h3>
                <div className="space-y-4">
                    <div className="border-b border-gray-700 pb-4">
                        <p className={`${baseLabelClasses} mb-1`}>Not Started</p>
                        <p className={`${baseNumberClasses} text-gray-500`}>{notStartedGames}</p>
                    </div>
                    <div>
                        <p className={`${baseLabelClasses} mb-1`}>Completed</p>
                        <p className={`${baseNumberClasses} text-blue-500`}>{completedGames}</p>
                    </div>
                </div>
            </div>

            {/* Active Gaming */}
            <div className={baseCardClasses}>
                <h3 className={`${baseTitleClasses} text-purple-400`}>Active Gaming</h3>
                <div className="space-y-4">
                    <div className="border-b border-gray-700 pb-4">
                        <p className={`${baseLabelClasses} mb-1`}>In Progress</p>
                        <p className={`${baseNumberClasses} text-green-500`}>{inProgressGames}</p>
                    </div>
                    <div className="border-b border-gray-700 pb-4">
                        <p className={`${baseLabelClasses} mb-1`}>Active Multiplayer</p>
                        <p className={`${baseNumberClasses} text-purple-500`}>{activeMultiplayerGames}</p>
                    </div>
                    <div className="border-b border-gray-700 pb-4">
                        <p className={`${baseLabelClasses} mb-1`}>Casual Rotation</p>
                        <p className={`${baseNumberClasses} text-orange-500`}>{casualRotationGames}</p>
                    </div>
                    <div>
                        <p className={`${baseLabelClasses} mb-1`}>Replaying</p>
                        <p className={`${baseNumberClasses} text-cyan-500`}>{replayingGames}</p>
                    </div>
                </div>
            </div>

            {/* Archived Games */}
            <div className={baseCardClasses}>
                <h3 className={`${baseTitleClasses} text-gray-400`}>Archived Games</h3>
                <div className="space-y-4">
                    <div className="border-b border-gray-700 pb-4">
                        <p className={`${baseLabelClasses} mb-1`}>On Hold</p>
                        <p className={`${baseNumberClasses} text-yellow-500`}>{onHoldGames}</p>
                    </div>
                    <div className="border-b border-gray-700 pb-4">
                        <p className={`${baseLabelClasses} mb-1`}>Abandoned</p>
                        <p className={`${baseNumberClasses} text-red-500`}>{abandonedGames}</p>
                    </div>
                    <div>
                        <p className={`${baseLabelClasses} mb-1`}>Retired</p>
                        <p className={`${baseNumberClasses} text-gray-500`}>{retiredGames}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameStats; 