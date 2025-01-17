import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_GAME_COLLECTION } from '../gql';
import { useAuth } from '../context/AuthContext';
import GameStats from '../components/GameStats';
import { Game, GameProgress } from '../types';

const Stats: React.FC = () => {
    const { user } = useAuth();
    const { loading, error, data } = useQuery(GET_GAME_COLLECTION, {
        variables: {
            userId: user?.id,
            orderBy: [{ status: 'asc' }]
        },
        skip: !user?.id
    });

    const games: Game[] = useMemo(() => {
        if (!data?.game_progress) return [];
        return data.game_progress.map((progress: GameProgress) => ({
            ...progress.game,
            status: progress.status,
            playtime_minutes: progress.playtime_minutes,
            completion_percentage: progress.completion_percentage,
            last_played_at: progress.last_played_at,
            is_favorite: progress.is_favorite
        }));
    }, [data]);

    // Calculate time-based statistics
    const timeStats = useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        return {
            // Monthly stats
            gamesPlayedThisMonth: games.filter(game => {
                if (!game.last_played_at) return false;
                const playDate = new Date(game.last_played_at);
                return playDate.getMonth() === thisMonth && playDate.getFullYear() === thisYear;
            }).length,
            
            playtimeThisMonth: games.reduce((total, game) => {
                if (!game.last_played_at) return total;
                const playDate = new Date(game.last_played_at);
                if (playDate.getMonth() === thisMonth && playDate.getFullYear() === thisYear) {
                    return total + (game.playtime_minutes || 0);
                }
                return total;
            }, 0),

            // Yearly stats
            gamesPlayedThisYear: games.filter(game => {
                if (!game.last_played_at) return false;
                return new Date(game.last_played_at).getFullYear() === thisYear;
            }).length,

            playtimeThisYear: games.reduce((total, game) => {
                if (!game.last_played_at) return total;
                if (new Date(game.last_played_at).getFullYear() === thisYear) {
                    return total + (game.playtime_minutes || 0);
                }
                return total;
            }, 0),
        };
    }, [games]);

    // Calculate completion statistics
    const completionStats = useMemo(() => {
        const completedGames = games.filter(game => game.status === 'COMPLETED');
        const gamesWithCompletion = games.filter(game => 
            game.completion_percentage !== null && 
            game.completion_percentage !== undefined
        );

        return {
            totalCompleted: completedGames.length,
            averageCompletionTime: completedGames.length > 0
                ? Math.round(completedGames.reduce((sum, game) => sum + (game.playtime_minutes || 0), 0) / completedGames.length)
                : 0,
            gamesOver90Percent: gamesWithCompletion.filter(game => (game.completion_percentage || 0) >= 90).length,
            gamesOver75Percent: gamesWithCompletion.filter(game => (game.completion_percentage || 0) >= 75).length,
            gamesOver50Percent: gamesWithCompletion.filter(game => (game.completion_percentage || 0) >= 50).length,
            gamesUnder25Percent: gamesWithCompletion.filter(game => (game.completion_percentage || 0) < 25).length,
        };
    }, [games]);

    // Calculate activity patterns
    const activityStats = useMemo(() => {
        const gamesWithActivity = games.filter(game => game.last_played_at);
        const playDays = gamesWithActivity.map(game => new Date(game.last_played_at!).getDay());
        const playHours = gamesWithActivity.map(game => new Date(game.last_played_at!).getHours());

        // Count occurrences of each day and hour
        const dayFrequency = Array(7).fill(0);
        const hourFrequency = Array(24).fill(0);
        playDays.forEach(day => dayFrequency[day]++);
        playHours.forEach(hour => hourFrequency[hour]++);

        const mostActiveDay = dayFrequency.indexOf(Math.max(...dayFrequency));
        const mostActiveHour = hourFrequency.indexOf(Math.max(...hourFrequency));

        return {
            mostActiveDay: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][mostActiveDay],
            mostActiveHour: `${mostActiveHour}:00`,
            averageSessionLength: Math.round(games.reduce((sum, game) => sum + (game.playtime_minutes || 0), 0) / gamesWithActivity.length),
            totalSessions: gamesWithActivity.length,
        };
    }, [games]);

    // Calculate favorite genres and tags
    const genreStats = useMemo(() => {
        const genreCounts: { [key: string]: number } = {};
        games.forEach(game => {
            if (game.genres) {
                game.genres.forEach(genre => {
                    genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
                });
            }
        });

        return Object.entries(genreCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    }, [games]);

    if (!user) {
        return (
            <div className="bg-dark p-8 rounded-lg">
                <div className="text-lg text-gray-400 text-center">
                    Please sign in to view your stats.
                </div>
            </div>
        );
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="container mx-auto px-4 py-8 space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Game Collection Statistics</h1>
                <p className="text-gray-400 text-lg">Detailed overview of your gaming collection and progress</p>
            </div>
            
            {/* Main Stats Overview */}
            <GameStats games={games} />

            {/* Time-based Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-dark rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-6 text-primary-400">Time Analysis</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-300">Monthly Activity</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-400">Games Played</p>
                                    <p className="text-2xl font-bold text-primary-500">{timeStats.gamesPlayedThisMonth}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Total Playtime</p>
                                    <p className="text-2xl font-bold text-primary-500">
                                        {Math.floor(timeStats.playtimeThisMonth / 60)}h {timeStats.playtimeThisMonth % 60}m
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-300">Yearly Progress</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-400">Games Played</p>
                                    <p className="text-2xl font-bold text-blue-500">{timeStats.gamesPlayedThisYear}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Total Playtime</p>
                                    <p className="text-2xl font-bold text-blue-500">
                                        {Math.floor(timeStats.playtimeThisYear / 60)}h {timeStats.playtimeThisYear % 60}m
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Completion Analysis */}
                <div className="bg-dark rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-6 text-blue-400">Completion Analysis</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-400">Average Completion Time</p>
                            <p className="text-2xl font-bold text-blue-500">
                                {Math.floor(completionStats.averageCompletionTime / 60)}h {completionStats.averageCompletionTime % 60}m
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-400">90%+ Complete</p>
                                <p className="text-2xl font-bold text-green-500">{completionStats.gamesOver90Percent}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">75%+ Complete</p>
                                <p className="text-2xl font-bold text-green-400">{completionStats.gamesOver75Percent}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">50%+ Complete</p>
                                <p className="text-2xl font-bold text-yellow-500">{completionStats.gamesOver50Percent}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Under 25%</p>
                                <p className="text-2xl font-bold text-red-500">{completionStats.gamesUnder25Percent}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gaming Patterns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Activity Patterns */}
                <div className="bg-dark rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-6 text-purple-400">Gaming Patterns</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-400">Most Active Day</p>
                                <p className="text-2xl font-bold text-purple-500">{activityStats.mostActiveDay}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Peak Gaming Hour</p>
                                <p className="text-2xl font-bold text-purple-500">{activityStats.mostActiveHour}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-400">Avg. Session Length</p>
                                <p className="text-2xl font-bold text-purple-400">
                                    {Math.floor(activityStats.averageSessionLength / 60)}h {activityStats.averageSessionLength % 60}m
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Total Sessions</p>
                                <p className="text-2xl font-bold text-purple-400">{activityStats.totalSessions}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Genre Preferences */}
                <div className="bg-dark rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-6 text-orange-400">Top Genres</h2>
                    <div className="space-y-4">
                        {genreStats.map(([genre, count]) => (
                            <div key={genre} className="flex items-center justify-between">
                                <span className="text-gray-400">{genre}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-orange-500">{count}</span>
                                    <span className="text-sm text-gray-400">games</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-dark rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-primary-400">Recent Activity Timeline</h2>
                <div className="space-y-4">
                    {games
                        .filter(game => game.last_played_at)
                        .sort((a, b) => new Date(b.last_played_at!).getTime() - new Date(a.last_played_at!).getTime())
                        .slice(0, 10)
                        .map(game => (
                            <div key={game.id} className="flex items-center justify-between border-b border-gray-700 pb-4">
                                <div className="flex-1">
                                    <p className="font-semibold">{game.name}</p>
                                    <p className="text-sm text-gray-400">
                                        Last played: {new Date(game.last_played_at!).toLocaleDateString()} at{' '}
                                        {new Date(game.last_played_at!).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-primary-400">
                                        {Math.floor((game.playtime_minutes || 0) / 60)}h {(game.playtime_minutes || 0) % 60}m
                                    </p>
                                    {game.completion_percentage !== null && (
                                        <p className="text-sm text-gray-400">{game.completion_percentage}% complete</p>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default Stats; 