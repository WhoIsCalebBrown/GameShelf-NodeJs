export type game_status = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED' | 'WANT_TO_PLAY';

export interface Game {
    rtime_last_played: number;
    id: number;
    name: string;
    description?: string;
    year?: number | null;
    igdb_id: number;
    slug: string;
    cover_url?: string;
    playtime_minutes?: number;
    last_played?: string;
}

export type GameStatus = game_status; 