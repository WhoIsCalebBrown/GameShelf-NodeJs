import React from 'react';
import { Game } from '../types/game';

const GameStats: React.FC<{ games: Game[] }> = ({ games }) => {
    const totalGames = games.length;
    const notStartedGames = games.filter(game => game.status === 'not_started').length;
    const inProgressGames = games.filter(game => game.status === 'in_progress').length;
    const completedGames = games.filter(game => game.status === 'completed').length;
    const onHoldGames = games.filter(game => game.status === 'on_hold').length;
    const abandonedGames = games.filter(game => game.status === 'abandoned').length;
    const activeMultiplayerGames = games.filter(game => game.status === 'active_multiplayer').length;
    const casualRotationGames = games.filter(game => game.status === 'casual_rotation').length;
    const retiredGames = games.filter(game => game.status === 'retired').length;
    const replayingGames = games.filter(game => game.status === 'replaying').length;

    const totalPlaytime = games.reduce((total, game) => total + (game.playtime_minutes || 0), 0);
    const playtimeHours = Math.floor(totalPlaytime / 60);
    const playtimeMinutes = totalPlaytime % 60;

    const gamesWithCompletion = games.filter(game => game.completion_percentage !== null && game.completion_percentage !== undefined);
    const averageCompletion = gamesWithCompletion.length > 0
        ? Math.round(gamesWithCompletion.reduce((sum, game) => sum + (game.completion_percentage || 0), 0) / gamesWithCompletion.length)
        : 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-dark p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Collection Stats</h3>
                <div className="space-y-1">
                    <p className="text-sm text-gray-400">Total Games: <span className="text-white">{totalGames}</span></p>
                    <p className="text-sm text-gray-400">Total Playtime: <span className="text-white">{playtimeHours}h {playtimeMinutes}m</span></p>
                    <p className="text-sm text-gray-400">Average Completion: <span className="text-white">{averageCompletion}%</span></p>
                </div>
            </div>

            <div className="bg-dark p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Progress Stats</h3>
                <div className="space-y-1">
                    <p className="text-sm text-gray-400">Not Started: <span className="text-white">{notStartedGames}</span></p>
                    <p className="text-sm text-gray-400">In Progress: <span className="text-white">{inProgressGames}</span></p>
                    <p className="text-sm text-gray-400">Completed: <span className="text-white">{completedGames}</span></p>
                    <p className="text-sm text-gray-400">On Hold: <span className="text-white">{onHoldGames}</span></p>
                </div>
            </div>

            <div className="bg-dark p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Active Games</h3>
                <div className="space-y-1">
                    <p className="text-sm text-gray-400">Active Multiplayer: <span className="text-white">{activeMultiplayerGames}</span></p>
                    <p className="text-sm text-gray-400">Casual Rotation: <span className="text-white">{casualRotationGames}</span></p>
                    <p className="text-sm text-gray-400">Replaying: <span className="text-white">{replayingGames}</span></p>
                </div>
            </div>

            <div className="bg-dark p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Other Stats</h3>
                <div className="space-y-1">
                    <p className="text-sm text-gray-400">Abandoned: <span className="text-white">{abandonedGames}</span></p>
                    <p className="text-sm text-gray-400">Retired: <span className="text-white">{retiredGames}</span></p>
                </div>
            </div>
        </div>
    );
};

export default GameStats; 