import { Reference, StoreObject } from '@apollo/client';

export type game_status = 'not_started' | 'in_progress' | 'completed' | 'abandoned' | 'on_hold' | 'active_multiplayer' | 'casual_rotation' | 'retired' | 'replaying';

export const game_status_labels: Record<game_status, string> = {
    'not_started': 'Not Started',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'abandoned': 'Abandoned',
    'on_hold': 'On Hold',
    'active_multiplayer': 'Active Multiplayer',
    'casual_rotation': 'Casual Rotation',
    'retired': 'Retired',
    'replaying': 'Replaying'
};

export interface Game {
    id: number;
    name: string;
    description?: string;
    year?: number;
    cover_url?: string;
    slug: string;
    igdb_id: number;
    is_competitive: boolean;
    status?: game_status;
    playtime_minutes?: number;
    completion_percentage?: number;
    last_played_at?: string | null;
    notes?: string;
    current_rank?: string;
    peak_rank?: string;
    is_favorite?: boolean;
}

export interface GameProgress {
    id: number;
    user_id: number;
    game_id: number;
    game: Game;
    status: game_status;
    playtime_minutes: number;
    completion_percentage: number;
    last_played_at: string | null;
    notes: string | null;
    current_rank: string | null;
    peak_rank: string | null;
    is_favorite: boolean;
    __typename?: string;
}

export interface GameProgressRef extends StoreObject {
    id: number;
    game_id: number;
    game: Reference;
    status: game_status;
    playtime_minutes: number;
    completion_percentage: number;
    last_played_at: string | null;
    notes: string | null;
    current_rank: string | null;
    peak_rank: string | null;
    is_favorite: boolean;
    __typename?: string;
    [key: string]: number | string | boolean | null | Reference | undefined;  // More specific index signature
}

export interface GameProgressData {
    game_progress: GameProgress[];
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

export type GameStatus = game_status; 