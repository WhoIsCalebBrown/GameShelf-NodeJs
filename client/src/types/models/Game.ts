import { GameStatus } from '../enums/gameStatus';

export interface Game {
    id: number;
    name: string;
    description?: string;
    year?: number;
    cover_url?: string;
    slug: string;
    igdb_id: number;
    is_competitive: boolean;
    status?: GameStatus;
    playtime_minutes?: number;
    completion_percentage?: number;
    last_played_at?: string | null;
    notes?: string;
    current_rank?: string;
    peak_rank?: string;
    is_favorite?: boolean;
}

export interface IGDBGame {
    id: number;
    name: string;
    summary?: string;
    first_release_date?: number;
    cover?: {
        url: string;
    };
    total_rating?: number;
    slug: string;
    genres?: Array<{
        id: number;
        name: string;
    }>;
    platforms?: Array<{
        id: number;
        name: string;
    }>;
    involved_companies?: Array<{
        company: {
            name: string;
        };
        developer: boolean;
        publisher: boolean;
    }>;
}

export interface SteamGame {
    id: number;
    name: string;
    description?: string;
    year?: number;
    igdb_id: number;
    slug: string;
    cover_url?: string;
    playtime_minutes?: number;
    last_played_at?: string;
    matched?: boolean;
}

export interface GameStats {
    total_games: number;
    total_playtime: number;
    average_completion: number;
    completed_games: number;
    in_progress_games: number;
} 