export type game_status = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED' | 'WANT_TO_PLAY';

export interface Game {
    id: number;
    igdb_id: number;
    name: string;
    cover_url: string;
    year: number;
    description: string;
    status?: game_status;
    playtime_minutes?: number;
    completion_percentage?: number;
    is_competitive?: boolean;
    current_rank?: string;
    peak_rank?: string;
    notes?: string;
    last_played_at?: string;
}

export type GameStatus = game_status; 