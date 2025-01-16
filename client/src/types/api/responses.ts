import { Game } from '../models/Game';

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