import { Game } from './game';

export interface User {
    id: number;
    username: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface GameProgress {
    id: number;
    user_id: number;
    game_id: number;
    playtime_minutes: number;
    completion_percentage: number;
    last_played_at: string | null;
    notes: string | null;
    current_rank: string | null;
    peak_rank: string | null;
    is_competitive: boolean;
    created_at: string;
    updated_at: string;
    game: Game;
    user: User;
}

export interface UserGameStats {
    total_games: number;
    total_playtime: number;
    average_completion: number;
    completed_games: number;
    in_progress_games: number;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ImportStatus {
    [key: number]: {
        status: 'pending' | 'importing' | 'success' | 'error';
        error?: string;
    };
}

export interface ImportProgress {
    stage: 'fetching' | 'matching' | 'importing' | 'complete';
    current: number;
    total: number;
    message: string;
}