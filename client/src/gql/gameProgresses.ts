import { gql } from '@apollo/client';

export const GET_GAME_COLLECTION = gql`
    query GetGameCollection($userId: Int!, $orderBy: [game_progress_order_by!]) {
        game_progress(
            where: { user_id: { _eq: $userId } }
            order_by: $orderBy
        ) {
            game {
                id
                name
                description
                year
                cover_url
                slug
                is_competitive
            }
            status
            playtime_minutes
            completion_percentage
            last_played_at
            notes
            current_rank
            peak_rank
            is_favorite
            user {
                id
                steam_id
            }
        }
    }
`;

export const CHECK_GAME_PROGRESS = gql`
    query CheckGameProgress($userId: Int!, $igdbId: Int!) {
        game_progress(where: {
            user_id: { _eq: $userId },
            game: { igdb_id: { _eq: $igdbId } }
        }) {
            id
            game_id
        }
    }
`;

export const CREATE_GAME_PROGRESS = gql`
    mutation CreateGameProgress(
        $userId: Int!,
        $gameId: Int!,
        $status: game_status!,
        $playtimeMinutes: Int = 0,
        $lastPlayed: timestamptz
    ) {
        insert_game_progress_one(
            object: {
                user_id: $userId,
                game_id: $gameId,
                status: $status,
                playtime_minutes: $playtimeMinutes,
                last_played_at: $lastPlayed,
                completion_percentage: 0
            },
            on_conflict: {
                constraint: game_progress_user_id_game_id_key,
                update_columns: [playtime_minutes, last_played_at]
            }
        ) {
            id
            status
            game_id
            game {
                id
                name
                description
                year
                igdb_id
                slug
                cover_url
            }
        }
    }
`;

export const DELETE_GAME_PROGRESS = gql`
    mutation DeleteGameProgress($userId: Int!, $gameId: Int!) {
        delete_game_progress(
            where: {
                user_id: { _eq: $userId },
                game_id: { _eq: $gameId }
            }
        ) {
            affected_rows
            returning {
                game_id
            }
        }
    }
`;

export const UPDATE_GAME_PROGRESS_STATUS = gql`
    mutation UpdateGameProgressStatus($userId: Int!, $gameId: Int!, $status: game_status!) {
        update_game_progress(
            where: {
                user_id: { _eq: $userId },
                game_id: { _eq: $gameId }
            },
            _set: { status: $status }
        ) {
            returning {
                id
                status
                game_id
            }
        }
    }
`;

export const UPDATE_GAME_PROGRESS = gql`
    mutation UpdateGameProgress(
        $userId: Int!,
        $gameId: Int!,
        $playtimeMinutes: Int,
        $completionPercentage: Int,
        $currentRank: String,
        $peakRank: String,
        $notes: String,
        $lastPlayedAt: timestamptz
    ) {
        update_game_progress(
            where: {
                user_id: { _eq: $userId },
                game_id: { _eq: $gameId }
            },
            _set: {
                playtime_minutes: $playtimeMinutes,
                completion_percentage: $completionPercentage,
                current_rank: $currentRank,
                peak_rank: $peakRank,
                notes: $notes,
                last_played_at: $lastPlayedAt
            }
        ) {
            returning {
                user_id
                game_id
                status
                playtime_minutes
                completion_percentage
                current_rank
                peak_rank
                notes
                last_played_at
            }
        }
    }
`;

export const UPDATE_GAME_PROGRESS_FAVORITE = gql`
    mutation UpdateGameProgressFavorite($userId: Int!, $gameId: Int!, $isFavorite: Boolean!) {
        update_game_progress(
            where: {
                user_id: { _eq: $userId },
                game_id: { _eq: $gameId }
            },
            _set: {
                is_favorite: $isFavorite
            }
        ) {
            returning {
                id
                is_favorite
            }
        }
    }
`;
