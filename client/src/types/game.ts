export type game_status = 
    | 'not_started'
    | 'in_progress'
    | 'completed'
    | 'abandoned'
    | 'on_hold'
    | 'active_multiplayer'  // For competitive/multiplayer games you regularly play
    | 'casual_rotation'     // For party/casual games played occasionally
    | 'retired'            // For previously competitive games no longer actively played
    | 'replaying';

export const game_status_labels: Record<game_status, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    completed: 'Completed',
    abandoned: 'Abandoned',
    on_hold: 'On Hold',
    active_multiplayer: 'Active Multiplayer',
    casual_rotation: 'Casual Rotation',
    retired: 'Retired',
    replaying: 'Replaying'
};

export interface Game {
    id: number;
    name: string;
    description?: string;
    year?: number | null;
    igdb_id: number;
    slug: string;
    cover_url?: string;
    playtime_minutes?: number;
    last_played_at?: string;
    status?: game_status;
    completion_percentage?: number;
    is_competitive?: boolean;
    current_rank?: string;
    peak_rank?: string;
    notes?: string;
    is_favorite?: boolean;
    rtime_last_played?: number;
}

export interface IGDBGame {
    id: number;
    name: string;
    summary: string;
    first_release_date?: number;
    cover?: {
        url: string;
    };
    slug: string;
    rating?: number;
    total_rating?: number;
    game_modes?: Array<{
        id: number;
        name: string;
    }>;
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
    involved_companies?: Array<{
        company: {
            id: number;
            name: string;
        };
        developer: boolean;
        publisher: boolean;
    }>;
}

export interface SteamGame {
    appid: number;
    name: string;
    playtime_forever: number;
    img_icon_url?: string;
    has_community_visible_stats?: boolean;
    playtime_windows_forever?: number;
    playtime_mac_forever?: number;
    playtime_linux_forever?: number;
    last_played?: number;
}

export interface GameStats {
    total_games: number;
    total_playtime: number;
    average_completion: number;
    completed_games: number;
    in_progress_games: number;
}

export type GameStatus = game_status; 