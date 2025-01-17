export interface IGDBGame {
    id: number;
    name: string;
    summary?: string;
    first_release_date?: number;
    cover?: {
        id: number;
        url: string;
    };
    slug: string;
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
        id: number;
        company: {
            id: number;
            name: string;
        };
        developer: boolean;
        publisher: boolean;
    }>;
    aggregated_rating?: number;
    aggregated_rating_count?: number;
    category?: number;
    status?: number;
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
        platform?: number;
        splitscreen?: boolean;
    }>;
    release_dates?: Array<{
        id: number;
        date: number;
        platform: number;
        region: number;
    }>;
    screenshots?: Array<{
        id: number;
        url: string;
    }>;
    similar_games?: Array<{
        id: number;
        name: string;
    }>;
    videos?: Array<{
        id: number;
        name: string;
        video_id: string;
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
        language: number;
        language_support_type: number;
    }>;
}

export interface GameMatch {
    id: number;
    igdb_id: number;
    cover?: {
        id: number;
        url: string;
    };
    cover_url?: string;
    first_release_date?: number;
    summary?: string;
    slug: string;
    year?: number | null;
    description?: string;
} 