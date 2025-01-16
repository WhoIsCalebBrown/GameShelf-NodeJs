import React, {useState, useEffect, useCallback} from 'react';
import {useAuth} from '../context/AuthContext';
import {importSteamLibrary} from '../services/steam';
import {useMutation} from '@apollo/client';
import {CREATE_BULK_GAMES, CREATE_BULK_GAME_PROGRESSES, GET_GAME_COLLECTION} from '../queries';

interface SteamImportProps {
    autoImport?: boolean;
    defaultSteamId?: string;
}

interface SteamGame {
    name: string;
    igdb_id: number;
    year?: number;
    description?: string;
    cover_url?: string;
    slug: string;
    playtime_minutes?: number;
    last_played_at?: string;
    matched?: boolean;
}

const SteamImport: React.FC<SteamImportProps> = ({autoImport = false, defaultSteamId = ''}) => {
    const {user} = useAuth();
    const [steamId, setSteamId] = useState(defaultSteamId);
    const [error, setError] = useState<string | null>(null);
    const [importProgress, setImportProgress] = useState({current: 0, total: 100});
    const [isImporting, setIsImporting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [availableGames, setAvailableGames] = useState<SteamGame[]>([]);
    const [selectedGames, setSelectedGames] = useState<Set<number>>(new Set());

    const [bulkAddGames] = useMutation(CREATE_BULK_GAMES);
    const [bulkAddGameProgress] = useMutation(CREATE_BULK_GAME_PROGRESSES, {
        refetchQueries: [
            {
                query: GET_GAME_COLLECTION,
                variables: {
                    userId: user?.id,
                    orderBy: [
                        { status: 'asc' },
                        { game: { name: 'asc' } },
                        { last_played_at: 'asc_nulls_last' },
                        { playtime_minutes: 'asc' }
                    ]
                }
            }
        ],
        awaitRefetchQueries: true
    });

    const handleFetchGames = useCallback(async () => {
        if (!user?.id) {
            setError('Please log in to import games');
            return;
        }

        if (!steamId) {
            setError('Please enter your Steam ID');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const games = await importSteamLibrary(steamId, (current, total) => {
                setImportProgress({current, total});
            });
            setAvailableGames(games);
        } catch (error) {
            console.error('Error fetching Steam library:', error);
            setError('Failed to fetch Steam library. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [user, steamId]);

    const handleImportSelected = async () => {
        if (selectedGames.size === 0) {
            setError('Please select at least one game to import');
            return;
        }

        setError(null);
        setIsImporting(true);
        setImportProgress({current: 0, total: selectedGames.size});

        try {
            // Filter selected games
            const gamesToImport = availableGames.filter(game => selectedGames.has(game.igdb_id));
            
            // Filter out duplicates by IGDB ID
            const uniqueGames = Array.from(
                new Map(gamesToImport.map(game => [game.igdb_id, game])).values()
            );
            
            // Prepare games data for bulk insert
            const gamesData = uniqueGames.map(game => ({
                name: game.name,
                igdb_id: game.igdb_id,
                year: game.year || null,
                description: game.description || 'No description available.',
                cover_url: game.cover_url || null,
                slug: game.slug
            }));

            // Bulk insert games
            const {data: gamesResult} = await bulkAddGames({
                variables: {
                    games: gamesData
                }
            });

            if (gamesResult?.insert_games?.returning) {
                // Map IGDB IDs to inserted game IDs
                const gameIdMap = new Map(
                    gamesResult.insert_games.returning.map(g => [g.igdb_id, g.id])
                );

                // Create a map to store the latest entry for each game
                const uniqueProgressMap = new Map();
                gamesToImport.forEach(game => {
                    const gameId = gameIdMap.get(game.igdb_id);
                    if (gameId) {
                        // Convert playtime to minutes, ensuring it's a valid number
                        const playtimeMinutes = Math.max(0, 
                            typeof game.playtime_minutes === 'number' ? game.playtime_minutes :
                            typeof game.playtime_minutes === 'string' ? parseInt(game.playtime_minutes, 10) : 0
                        );

                        // If we already have an entry for this game, update it only if the new entry has more playtime
                        const existingEntry = uniqueProgressMap.get(gameId);
                        const existingPlaytime = existingEntry?.playtime_minutes || 0;

                        console.log(`Client - Processing game: ${game.name}`);
                        console.log(`Last played at: ${game.last_played_at}`);

                        if (!existingEntry || playtimeMinutes > existingPlaytime) {
                            uniqueProgressMap.set(gameId, {
                                user_id: user.id,
                                game_id: gameId,
                                status: 'not_started',
                                playtime_minutes: playtimeMinutes,
                                last_played_at: game.last_played_at || null,
                                completion_percentage: 0
                            });
                        }
                    }
                });

                // Convert map values to array for the mutation
                const progressData = Array.from(uniqueProgressMap.values());

                // Bulk insert progress
                await bulkAddGameProgress({
                    variables: {
                        progresses: progressData
                    }
                });

                setImportProgress({current: selectedGames.size, total: selectedGames.size});
            }
        } catch (error) {
            console.error('Error importing selected games:', error);
            setError('Failed to import selected games. Please try again.');
        } finally {
            setIsImporting(false);
            setSelectedGames(new Set());
            setAvailableGames([]);
        }
    };

    const toggleGameSelection = (igdbId: number) => {
        setSelectedGames(prev => {
            const newSet = new Set(prev);
            if (newSet.has(igdbId)) {
                newSet.delete(igdbId);
            } else {
                newSet.add(igdbId);
            }
            return newSet;
        });
    };

    const toggleAllGames = () => {
        if (selectedGames.size === availableGames.length) {
            setSelectedGames(new Set());
        } else {
            setSelectedGames(new Set(availableGames.map(game => game.igdb_id)));
        }
    };

    useEffect(() => {
        if (autoImport && defaultSteamId && !isImporting) {
            handleFetchGames();
        }
    }, [autoImport, defaultSteamId, handleFetchGames, isImporting]);

    return (
        <div className="bg-dark p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-4">Import Games from Steam</h3>
            {!autoImport && (
                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        value={steamId}
                        onChange={(e) => setSteamId(e.target.value)}
                        placeholder="Enter your Steam ID"
                        className="flex-1 bg-dark-light text-white placeholder-gray-500 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                        onClick={handleFetchGames}
                        disabled={isLoading || !steamId}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50"
                    >
                        {isLoading ? 'Fetching...' : 'Fetch Games'}
                    </button>
                </div>
            )}
            {error && (
                <div className="text-red-500 mb-4">{error}</div>
            )}
            {isImporting && (
                <div className="space-y-2">
                    <div className="text-gray-300">
                        Importing games... {importProgress.current}/{importProgress.total}
                    </div>
                    <div className="w-full h-3 bg-dark-light rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-500 transition-all duration-300"
                            style={{width: `${(importProgress.current / importProgress.total) * 100}%`}}
                        />
                    </div>
                </div>
            )}
            {availableGames.length > 0 && !isImporting && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={toggleAllGames}
                            className="text-sm text-primary-500 hover:text-primary-400"
                        >
                            {selectedGames.size === availableGames.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <div className="text-sm text-gray-400">
                            Found {availableGames.length} games ({availableGames.filter(g => g.igdb_id).length} matched)
                        </div>
                        <button
                            onClick={handleImportSelected}
                            disabled={selectedGames.size === 0}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50"
                        >
                            Import Selected ({selectedGames.size})
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto p-2">
                        {availableGames.map((game, index) => (
                            <div
                                key={`${game.igdb_id || 'unmatched'}-${game.name}-${index}`}
                                className={`flex gap-4 p-4 rounded-lg ${game.igdb_id ? 'bg-dark-light' : 'bg-dark-lighter border border-red-900'}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedGames.has(game.igdb_id)}
                                    onChange={() => toggleGameSelection(game.igdb_id)}
                                    className="w-5 h-5 rounded border-gray-600 text-primary-500 focus:ring-primary-500"
                                    disabled={!game.igdb_id}
                                />
                                <div className="flex gap-4 flex-1">
                                    {game.cover_url ? (
                                        <img
                                            src={game.cover_url}
                                            alt={game.name}
                                            className="w-16 h-24 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-16 h-24 bg-dark flex items-center justify-center rounded">
                                            <span className="text-gray-600">No Image</span>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-medium mb-1">{game.name}</h4>
                                        <div className="space-y-1">
                                            {game.playtime_minutes !== undefined && (
                                                <p className="text-sm text-gray-400">
                                                    Playtime: {Math.round(game.playtime_minutes / 60)} hours
                                                </p>
                                            )}
                                            {game.last_played_at && (
                                                <p className="text-sm text-gray-400">
                                                    Last played: {new Date(game.last_played_at).toLocaleDateString()}
                                                </p>
                                            )}
                                            <div className={`text-sm ${game.igdb_id ? 'text-green-500' : 'text-red-500'}`}>
                                                {game.igdb_id ? 'Matched with IGDB' : 'No IGDB match found'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SteamImport; 