export type GameStatus = 
    | 'NOT_STARTED'    // Haven't started yet
    | 'IN_PROGRESS'    // Currently playing
    | 'COMPLETED'      // Finished the game
    | 'ON_HOLD'        // Temporarily paused
    | 'DROPPED'        // Stopped playing, don't plan to continue
    | 'WANT_TO_PLAY';  // Interested in playing

// Add this type to match Hasura's enum name
export type HasuraGameStatus = GameStatus;

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