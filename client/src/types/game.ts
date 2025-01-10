export type GameStatus = 
    | 'NOT_STARTED'    // Haven't started yet
    | 'IN_PROGRESS'    // Currently playing
    | 'COMPLETED'      // Finished the game
    | 'ON_HOLD'        // Temporarily paused
    | 'DROPPED'        // Stopped playing, don't plan to continue
    | 'WANT_TO_PLAY';  // Interested in playing

// This type must match the Hasura enum type exactly
export type game_status = GameStatus;
// Use this type for Hasura operations
export type HasuraGameStatus = game_status;

export interface Game {
    id: number;
    name: string;
    description?: string;
    year?: number;
    igdb_id?: number;
    slug?: string;
    status?: HasuraGameStatus;  // Use the Hasura-specific type here
    cover_url?: string;
}

export interface GameUpdate {
    name: string;
    description?: string;
    year: number;
    status?: GameStatus;
} 