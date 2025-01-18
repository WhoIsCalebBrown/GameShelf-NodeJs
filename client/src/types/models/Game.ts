import { GameStatus } from '../enums/gameStatus';

export interface Game {
    id: number;
    name: string;
    description?: string;
    year?: number;
    cover_url?: string;
    slug: string;
    igdb_id: number;
    is_competitive: boolean;
    status?: GameStatus;
    playtime_minutes?: number;
    completion_percentage?: number;
    last_played_at?: string | null;
    notes?: string;
    current_rank?: string;
    peak_rank?: string;
    is_favorite?: boolean;
    genres?: Array<{ id: number; name: string; }>;
}

export interface IGDBGame {
    id: number;
    name: string;
    summary?: string;
    storyline?: string;
    first_release_date?: number;
    cover?: {
        url: string;
        image_id?: string;
        width?: number;
        height?: number;
    };
    total_rating?: number;
    rating?: number;
    rating_count?: number;
    total_rating_count?: number;
    aggregated_rating?: number;
    aggregated_rating_count?: number;
    category?: number;
    slug: string;
    version_title?: string;
    version_parent?: number;
    franchise?: string;
    franchise_id?: number;
    hypes?: number;
    follows?: number;
    total_follows?: number;
    url?: string;
    game_engines?: Array<{
        id: number;
        name: string;
    }>;
    alternative_names?: Array<{
        id: number;
        name: string;
    }>;
    collection?: {
        id: number;
        name: string;
    };
    dlcs?: Array<{
        id: number;
        name: string;
    }>;
    expansions?: Array<{
        id: number;
        name: string;
    }>;
    parent_game?: number;
    game_bundle?: boolean;
    multiplayer_modes?: Array<{
        id: number;
        campaigncoop?: boolean;
        dropin?: boolean;
        lancoop?: boolean;
        offlinecoop?: boolean;
        offlinecoopmax?: number;
        offlinemax?: number;
        onlinecoop?: boolean;
        onlinecoopmax?: number;
        onlinemax?: number;
        splitscreen?: boolean;
    }>;
    release_dates?: Array<{
        id: number;
        date: number;
        platform: {
            id: number;
            name: string;
        };
        region: number;
    }>;
    screenshots?: Array<{
        id: number;
        image_id: string;
        url: string;
        width: number;
        height: number;
    }>;
    similar_games?: Array<{
        id: number;
        name: string;
    }>;
    videos?: Array<{
        id: number;
        video_id: string;
        name: string;
    }>;
    websites?: Array<{
        id: number;
        url: string;
        category: number;
    }>;
    player_perspectives?: Array<{
        id: number;
        name: string;
    }>;
    language_supports?: Array<{
        id: number;
        language: {
            id: number;
            name: string;
        };
        language_support_type: {
            id: number;
            name: string;
        };
    }>;
    genres?: Array<{
        id: number;
        name: string;
    }>;
    platforms?: Array<{
        id: number;
        name: string;
    }>;
    involved_companies?: Array<{
        company: {
            name: string;
        };
        developer: boolean;
        publisher: boolean;
    }>;
    game_modes?: Array<{
        id: number;
        name: string;
    }>;
    themes?: Array<{
        id: number;
        name: string;
    }>;
}

export interface SteamGame {
    id: number;
    name: string;
    description?: string;
    year?: number;
    igdb_id: number;
    slug: string;
    cover_url?: string;
    playtime_minutes?: number;
    last_played_at?: string;
    matched?: boolean;
    rating?: number;
    total_rating?: number;
    rating_count?: number;
    total_rating_count?: number;
    genres?: Array<{
        id: number;
        name: string;
    }>;
    platforms?: Array<{
        id: number;
        name: string;
    }>;
    themes?: Array<{
        id: number;
        name: string;
    }>;
    game_modes?: Array<{
        id: number;
        name: string;
    }>;
    involved_companies?: Array<{
        company: {
            name: string;
        };
        developer: boolean;
        publisher: boolean;
    }>;
    aggregated_rating?: number;
    aggregated_rating_count?: number;
    category?: number;
    storyline?: string;
    version_title?: string;
    version_parent?: number;
    franchise?: string;
    franchise_id?: number;
    hypes?: number;
    follows?: number;
    total_follows?: number;
    url?: string;
    game_engines?: Array<{
        id: number;
        name: string;
    }>;
    alternative_names?: Array<{
        id: number;
        name: string;
    }>;
    collection?: {
        id: number;
        name: string;
    };
    dlcs?: Array<{
        id: number;
        name: string;
    }>;
    expansions?: Array<{
        id: number;
        name: string;
    }>;
    parent_game?: number;
    game_bundle?: boolean;
    multiplayer_modes?: Array<{
        id: number;
        campaigncoop?: boolean;
        dropin?: boolean;
        lancoop?: boolean;
        offlinecoop?: boolean;
        offlinecoopmax?: number;
        offlinemax?: number;
        onlinecoop?: boolean;
        onlinecoopmax?: number;
        onlinemax?: number;
        splitscreen?: boolean;
    }>;
    release_dates?: Array<{
        id: number;
        date: number;
        platform: {
            id: number;
            name: string;
        };
        region: number;
    }>;
    screenshots?: Array<{
        id: number;
        image_id: string;
        url: string;
        width: number;
        height: number;
    }>;
    similar_games?: Array<{
        id: number;
        name: string;
    }>;
    videos?: Array<{
        id: number;
        video_id: string;
        name: string;
    }>;
    websites?: Array<{
        id: number;
        url: string;
        category: number;
    }>;
    player_perspectives?: Array<{
        id: number;
        name: string;
    }>;
    language_supports?: Array<{
        id: number;
        language: {
            id: number;
            name: string;
        };
        language_support_type: {
            id: number;
            name: string;
        };
    }>;
}

export interface GameStats {
    total_games: number;
    total_playtime: number;
    average_completion: number;
    completed_games: number;
    in_progress_games: number;
} 