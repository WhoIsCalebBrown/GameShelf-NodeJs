import { Game } from '../types/game';

interface ImportProgress {
    stage: 'fetching' | 'matching' | 'complete';
    current: number;
    total: number;
    message?: string;
}

// Calculate estimated time in seconds based on game count
const calculateEstimatedTime = (gameCount: number): number => {
    return Math.ceil(gameCount / 5) ; // Games divided by 4 plus 5 seconds
};

export const importSteamLibrary = async (
    steamId: string,
    onProgress?: (progress: ImportProgress) => void
): Promise<Game[]> => {
    try {
        // Fetch Steam library
        onProgress?.({
            stage: 'fetching',
            current: 0,
            total: 100,
            message: 'Fetching Steam library...'
        });

        const response = await fetch(`/api/steam/library/${steamId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch Steam library');
        }

        const data = await response.json();
        const steamGames = data.response?.games || [];
        const estimatedSeconds = calculateEstimatedTime(steamGames.length);
        const startTime = Date.now();
        let progressInterval: ReturnType<typeof setInterval> | null = null;

        // Start progress updates
        progressInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            const remainingSeconds = Math.max(0, estimatedSeconds - elapsedSeconds);
            const progress = Math.min(100, (elapsedSeconds / estimatedSeconds) * 100);
            
            onProgress?.({
                stage: 'matching',
                current: Math.floor(progress),
                total: 100,
                message: remainingSeconds > 0 
                    ? `Matching games... ${remainingSeconds}s remaining`
                    : 'Almost done...'
            });
        }, 100); // Update every 100ms for smooth progress

        // Match games with IGDB
        onProgress?.({
            stage: 'matching',
            current: 0,
            total: 100,
            message: `Estimated time: ${estimatedSeconds} seconds`
        });

        const matchResponse = await fetch('/api/steam/match', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ games: steamGames })
        });

        if (!matchResponse.ok) {
            if (progressInterval) clearInterval(progressInterval);
            throw new Error('Failed to match games with IGDB');
        }

        // Set up event source for progress updates
        const reader = matchResponse.body?.getReader();
        const decoder = new TextDecoder();
        let matches: any[] = [];
        let buffer = '';

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    if (progressInterval) clearInterval(progressInterval);
                    break;
                }

                const chunk = decoder.decode(value);
                buffer += chunk;

                // Process complete SSE messages
                const messages = buffer.split('\n\n');
                buffer = messages.pop() || '';

                for (const message of messages) {
                    if (message.startsWith('data: ')) {
                        try {
                            const jsonStr = message.slice(6);
                            const data = JSON.parse(jsonStr);
                            if (data.matches) {
                                matches = data.matches;
                                // When we get the final matches, show complete
                                if (progressInterval) clearInterval(progressInterval);
                                onProgress?.({
                                    stage: 'complete',
                                    current: 100,
                                    total: 100,
                                    message: 'Import complete!'
                                });
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }
        } else {
            if (progressInterval) clearInterval(progressInterval);
            const data = await matchResponse.json();
            matches = data.matches;
        }

        // Convert playtime from minutes to hours and minutes
        return matches.map((game: any) => ({
            ...game,
            id: game.appid,
            playtime_minutes: game.playtime_forever
        }));
    } catch (error) {
        console.error('Steam import error:', error);
        throw error;
    }
};

export const exportToSteamFormat = (games: Game[]): string => {
    return JSON.stringify(games, null, 2);
}; 