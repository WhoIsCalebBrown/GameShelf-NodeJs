import { Game } from '../types';

export interface SteamGame {
    appid: number;
    name: string;
    playtime_forever: number;
    img_icon_url?: string;
    has_community_visible_stats?: boolean;
    playtime_windows_forever?: number;
    playtime_mac_forever?: number;
    playtime_linux_forever?: number;
    last_played?: number;
    last_played_at?: string;
    playtime_minutes?: number;
}

export interface SteamLibraryResponse {
    response: {
        games: SteamGame[];
    };
}

// Add new interfaces for progress updates
export interface ProgressUpdate {
    type: 'progress' | 'match' | 'complete';
    message: string;
    current?: number;
    total?: number;
    game?: string;
    matched?: boolean;
    matchedCount?: number;
    totalCount?: number;
}

export async function importSteamLibrary(
    steamId: string, 
    userId: string,
    onProgress?: (current: number, total: number) => void,
    onUpdate?: (update: ProgressUpdate) => void
): Promise<Game[]> {
    try {
        // Set up SSE connection
        const eventSource = new EventSource(`http://localhost:3001/api/steam/progress/${userId}`);
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onUpdate?.(data);
        };

        // Fetch Steam library
        const response = await fetch(`http://localhost:3001/api/steam/library/${steamId}`);
        if (!response.ok) {
            eventSource.close();
            const errorData = await response.json();
            throw new Error(errorData.details || 'Failed to fetch Steam library');
        }

        const data: SteamLibraryResponse = await response.json();
        if (!data.response?.games) {
            eventSource.close();
            throw new Error('No games found in Steam library');
        }

        // Match games with IGDB
        const matchResponse = await fetch('http://localhost:3001/api/steam/match', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                games: data.response.games,
                userId 
            }),
        });

        if (!matchResponse.ok) {
            eventSource.close();
            const errorData = await matchResponse.json();
            throw new Error(errorData.details || 'Failed to match games with IGDB');
        }

        const matchedGames = await matchResponse.json();
        eventSource.close();
        return matchedGames;
    } catch (error) {
        console.error('Steam import error:', error);
        throw error;
    }
}

export function exportToSteamFormat(games: Game[]): string {
    return JSON.stringify(games, null, 2);
} 