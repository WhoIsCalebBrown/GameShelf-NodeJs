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
    created_at: string;
    updated_at: string;
    game: Game;  // This will be populated by Hasura's relationships
    user: User;  // This will be populated by Hasura's relationships
}

export interface UserGameStats {
    total_games: number;
    total_playtime: number;
    average_completion: number;
    completed_games: number;
    in_progress_games: number;
}