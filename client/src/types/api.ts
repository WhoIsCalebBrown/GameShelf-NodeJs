import { Game } from './game';

export interface APIResponse<T> {
    data: T;
    error?: string;
}

export interface SearchResponse {
    games: Game[];
    total: number;
}

export interface GraphQLResponse<T> {
    data: T;
    errors?: Array<{
        message: string;
        locations: Array<{
            line: number;
            column: number;
        }>;
        path: string[];
    }>;
}

export interface SortConfig {
    field: 'name' | 'status' | 'year' | 'last_played_at' | 'playtime_minutes';
    order: 'asc' | 'desc';
}

export interface QueryVariables {
    userId?: number;
    gameId?: number;
    status?: string;
    orderBy?: any[];
    [key: string]: any;
} 