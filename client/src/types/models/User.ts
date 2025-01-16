export interface User {
    id: number;
    username: string;
    email: string;
    steam_id?: string;
    created_at: string;
    updated_at: string;
    'https://hasura.io/jwt/claims': {
        'x-hasura-allowed-roles': string[];
        'x-hasura-default-role': string;
        'x-hasura-user-id': string;
    };
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

export interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
} 