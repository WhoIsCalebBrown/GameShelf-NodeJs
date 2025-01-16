import { Reference, StoreObject } from '@apollo/client';
import { Game } from './Game';
import { User } from './User';
import { GameStatus } from '../enums/gameStatus';

export interface GameProgress {
    id: number;
    user_id: number;
    game_id: number;
    game: Game;
    user: User;
    status: GameStatus;
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
    status: GameStatus;
    playtime_minutes: number;
    completion_percentage: number;
    last_played_at: string | null;
    notes: string | null;
    current_rank: string | null;
    peak_rank: string | null;
    is_favorite: boolean;
    __typename?: string;
    [key: string]: number | string | boolean | null | Reference | undefined;
}

export interface GameProgressData {
    game_progress: GameProgress[];
} 