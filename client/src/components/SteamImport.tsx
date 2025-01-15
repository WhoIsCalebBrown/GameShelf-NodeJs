import React, {useState} from 'react';
import {useMutation} from '@apollo/client';
import {BULK_ADD_GAMES, BULK_ADD_GAME_PROGRESS} from '../queries/queries.ts';
import {useAuth} from '../context/AuthContext';
import {importSteamLibrary, exportToSteamFormat} from '../services/steam';
import {Game} from '../types/game';

interface ImportStatus {
    [key: number]: {
        status: 'pending' | 'importing' | 'success' | 'error';
        error?: string;
    };
}

interface ImportProgress {
    stage: 'fetching' | 'matching' | 'importing' | 'complete';
    current: number;
    total: number;
    message: string;
}

const SteamImport: React.FC = () => {
    const {user} = useAuth();
    const [steamId, setSteamId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [importedGames, setImportedGames] = useState<Game[]>([]);
    const [selectedGames, setSelectedGames] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [showUnmatched, setShowUnmatched] = useState(false);
    const [importStatus, setImportStatus] = useState<ImportStatus>({});
    const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
    const [bulkAddGames] = useMutation(BULK_ADD_GAMES);
    const [bulkAddGameProgress] = useMutation(BULK_ADD_GAME_PROGRESS);

    const handleImport = async () => {
        if (!steamId.trim()) {
            setError('Please enter a Steam ID');
            return;
        }

        setIsLoading(true);
        setError(null);
        setImportProgress({
            stage: 'fetching',
            current: 0,
            total: 100,
            message: 'Fetching Steam library...'
        });

        try {
            const games = await importSteamLibrary(steamId, (progress) => {
                if (progress.stage === 'matching') {
                    setImportProgress({
                        stage: 'matching',
                        current: progress.current,
                        total: progress.total,
                        message: `Matching games with IGDB (${progress.current}/${progress.total})...`
                    });
                }
            });

            setImportProgress({
                stage: 'complete',
                current: 100,
                total: 100,
                message: 'Import complete!'
            });

            setImportedGames(games);
            // Only auto-select matched games
            setSelectedGames(new Set(games.filter(game => game.igdb_id !== 0).map(game => game.id)));

            // Clear progress after a short delay
            setTimeout(() => {
                setImportProgress(null);
            }, 2000);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to import Steam library');
            setImportProgress(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkImport = async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        const selectedGamesList = importedGames.filter(game => selectedGames.has(game.id));

        // Initialize status
        const initialStatus: ImportStatus = {};
        selectedGamesList.forEach(game => {
            initialStatus[game.id] = {status: 'pending'};
        });
        setImportStatus(initialStatus);

        // Set up progress
        setImportProgress({
            stage: 'importing',
            current: 0,
            total: selectedGamesList.length,
            message: `Adding games to collection (0/${selectedGamesList.length})...`
        });


        try {
            // Bulk insert games
            const { data: gameData } = await bulkAddGames({
                variables: {
                    games: selectedGamesList
                        .filter((game, index, self) =>
                            index === self.findIndex(g => g.igdb_id === game.igdb_id)
                        )
                        .map(game => ({
                            name: game.name,
                            description: game.description || 'No description available',
                            year: game.year,
                            igdb_id: game.igdb_id,
                            slug: game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            cover_url: game.cover_url
                        }))
                }
            });

            // Update progress halfway
            setImportProgress({
                stage: 'importing',
                current: Math.floor(selectedGamesList.length / 2),
                total: selectedGamesList.length,
                message: `Adding game progress...`
            });

            // Bulk insert progress records
            await bulkAddGameProgress({
                variables: {
                    progresses: gameData.insert_games.returning.map(game => ({
                        user_id: user.id,
                        game_id: game.id,
                        status: "NOT_STARTED",
                        playtime_minutes: selectedGamesList.find(g => g.igdb_id === game.igdb_id)?.playtime_minutes || 0,
                        last_played_at: selectedGamesList.find(g => g.igdb_id === game.igdb_id)?.rtime_last_played ?
                            new Date(selectedGamesList.find(g => g.igdb_id === game.igdb_id)!.rtime_last_played * 1000).toISOString().replace('Z', '+00:00') :
                            null
                    }))
                },
                refetchQueries: ['GetUserGames']
            });

            // Update all statuses to success
            const successStatus: ImportStatus = {};
            selectedGamesList.forEach(game => {
                successStatus[game.id] = {status: 'success'};
            });
            setImportStatus(successStatus);

            // Show completion
            setImportProgress({
                stage: 'complete',
                current: selectedGamesList.length,
                total: selectedGamesList.length,
                message: 'Import complete!'
            });


            // Clear everything after delay
            setTimeout(() => {
                setImportedGames([]);
                setSelectedGames(new Set());
                setImportStatus({});
                setImportProgress(null);
            }, 2000);

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add games to collection');
            console.log(error.message);
            // Update all statuses to error
            const errorStatus: ImportStatus = {};
            selectedGamesList.forEach(game => {
                errorStatus[game.id] = {
                    status: 'error',
                    error: 'Bulk import failed'
                };
            });
            setImportStatus(errorStatus);
            setImportProgress(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        if (!importedGames.length) return;

        const jsonStr = exportToSteamFormat(importedGames);
        const blob = new Blob([jsonStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gameshelf-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedGames(new Set(filteredGames.map(game => game.id)));
        } else {
            setSelectedGames(new Set());
        }
    };

    const filteredGames = importedGames.filter(game => {
        const nameMatches = game.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatusOk = showUnmatched ? game.igdb_id === 0 : true;
        return nameMatches && matchStatusOk;
    });

    const matchedGames = importedGames.filter(game => game.igdb_id !== 0);
    const unmatchedGames = importedGames.filter(game => game.igdb_id === 0);
    const allSelected = filteredGames.length > 0 &&
        filteredGames.every(game => selectedGames.has(game.id));

    return (
        <div className="bg-dark p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Steam Import/Export</h2>

            <div className="space-y-4">
                {error && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-md">
                        {error}
                    </div>
                )}

                <div className="flex gap-4">
                    <input
                        type="text"
                        value={steamId}
                        onChange={(e) => setSteamId(e.target.value)}
                        placeholder="Enter Steam ID"
                        className="flex-1 bg-dark-light border border-gray-700 rounded-lg px-4 py-2"
                    />
                    <button
                        onClick={handleImport}
                        disabled={isLoading}
                        className="btn px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Importing...' : 'Import from Steam'}
                    </button>
                </div>

                {importProgress && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>{importProgress.message}</span>
                            <span>{importProgress.current}/{importProgress.total}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-700">
                            <div
                                className={`h-full transition-all duration-300 rounded-full ${
                                    importProgress.stage === 'complete'
                                        ? 'bg-green-500'
                                        : 'bg-blue-500'
                                }`}
                                style={{
                                    width: `${(importProgress.current / importProgress.total) * 100}%`,
                                    transition: 'width 0.3s ease-in-out'
                                }}
                            />
                        </div>
                    </div>
                )}

                {importedGames.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Imported Games ({selectedGames.size} selected)
                                </h3>
                                <p className="text-sm text-gray-400">
                                    ✅ Matched: {matchedGames.length} games |
                                    ❌ Unmatched: {unmatchedGames.length} games
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleBulkImport}
                                    disabled={isLoading || selectedGames.size === 0}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg disabled:opacity-50"
                                >
                                    Add to Collection
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
                                >
                                    Export
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-5 h-5"
                                />
                                <span className="text-sm text-gray-400">Select All</span>
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search games..."
                                className="flex-1 bg-dark-light border border-gray-700 rounded-lg px-4 py-2"
                            />
                            <button
                                onClick={() => setShowUnmatched(!showUnmatched)}
                                className={`px-4 py-2 rounded-lg border ${
                                    showUnmatched
                                        ? 'bg-red-500/10 text-red-500 border-red-500'
                                        : 'bg-dark-light text-gray-400 border-gray-700'
                                }`}
                            >
                                {showUnmatched ? 'Show All Games' : 'Show Unmatched'}
                            </button>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto
                                        scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800
                                        hover:scrollbar-thumb-gray-600">
                            {filteredGames.map(game => (
                                <div
                                    key={game.id}
                                    className={`flex items-center gap-4 p-3 rounded-lg ${
                                        game.igdb_id === 0
                                            ? 'bg-red-500/10 border border-red-500/20'
                                            : 'bg-dark-light'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedGames.has(game.id)}
                                        onChange={(e) => {
                                            const newSelected = new Set(selectedGames);
                                            if (e.target.checked) {
                                                newSelected.add(game.id);
                                            } else {
                                                newSelected.delete(game.id);
                                            }
                                            setSelectedGames(newSelected);
                                        }}
                                        className="w-5 h-5"
                                        disabled={importStatus[game.id]?.status === 'importing'}
                                    />
                                    {game.cover_url ? (
                                        <img
                                            src={game.cover_url}
                                            alt={game.name}
                                            className="w-16 h-20 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-16 h-20 bg-dark flex items-center justify-center rounded">
                                            <span className="text-gray-500">No Cover</span>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium">{game.name}</h4>
                                            {game.igdb_id === 0 && (
                                                <span
                                                    className="text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                                                    No IGDB Match
                                                </span>
                                            )}
                                            {importStatus[game.id] && (
                                                <div className="flex items-center gap-2">
                                                    {importStatus[game.id].status === 'pending' && (
                                                        <span
                                                            className="text-xs text-gray-400 bg-gray-400/10 px-2 py-0.5 rounded">
                                                            Pending
                                                        </span>
                                                    )}
                                                    {importStatus[game.id].status === 'importing' && (
                                                        <span
                                                            className="text-xs text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                                                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                                        stroke="currentColor" strokeWidth="4"
                                                                        fill="none"/>
                                                                <path className="opacity-75" fill="currentColor"
                                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                            </svg>
                                                            Importing
                                                        </span>
                                                    )}
                                                    {importStatus[game.id].status === 'success' && (
                                                        <span
                                                            className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                                                            <svg className="h-3 w-3" viewBox="0 0 20 20"
                                                                 fill="currentColor">
                                                                <path fillRule="evenodd"
                                                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                      clipRule="evenodd"/>
                                                            </svg>
                                                            Added
                                                        </span>
                                                    )}
                                                    {importStatus[game.id].status === 'error' && (
                                                        <span
                                                            className="text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                                                            <svg className="h-3 w-3" viewBox="0 0 20 20"
                                                                 fill="currentColor">
                                                                <path fillRule="evenodd"
                                                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                                      clipRule="evenodd"/>
                                                            </svg>
                                                            Failed
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {game.year > 0 && (
                                            <p className="text-sm text-gray-400">
                                                Released: {game.year}
                                            </p>
                                        )}
                                        {game.playtime_minutes > 0 && (
                                            <p className="text-sm text-gray-400">
                                                Playtime: {Math.floor(game.playtime_minutes / 60)}h {game.playtime_minutes % 60}m
                                            </p>
                                        )}
                                        {game.last_played && (
                                            <p className="text-sm text-gray-400">
                                                Last played: {new Date(game.last_played).toLocaleDateString()}
                                            </p>
                                        )}
                                        {game.description && (
                                            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                                                {game.description}
                                            </p>
                                        )}
                                        {importStatus[game.id]?.error && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {importStatus[game.id].error}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SteamImport; 