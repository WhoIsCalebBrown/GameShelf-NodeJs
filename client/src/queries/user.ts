import { gql } from '@apollo/client';

export const GET_USER = gql`
    query GetUser($userId: Int!) {
        users_by_pk(id: $userId) {
            id
            username
            email
            steam_id
            created_at
            updated_at
        }
    }
`;

export const GET_USER_GAME_PROGRESS = gql`
    query GetUserGameProgress($userId: Int!) {
        game_progress(where: { user_id: { _eq: $userId } }) {
            id
            playtime_minutes
            completion_percentage
            last_played_at
            notes
            game {
                id
                name
                cover_url
                status
                year
            }
        }
    }
`;

export const UPDATE_GAME_PROGRESS = gql`
    mutation UpdateGameProgress(
        $userId: Int!,
        $gameId: Int!,
        $playtime: Int!,
        $completion: Int!,
        $notes: String
    ) {
        insert_game_progress_one(
            object: {
                user_id: $userId,
                game_id: $gameId,
                playtime_minutes: $playtime,
                completion_percentage: $completion,
                notes: $notes,
                last_played_at: "now()"
            },
            on_conflict: {
                constraint: game_progress_user_id_game_id_key,
                update_columns: [playtime_minutes, completion_percentage, notes, last_played_at]
            }
        ) {
            id
            playtime_minutes
            completion_percentage
            last_played_at
            notes
        }
    }
`;

export const GET_USER_STATS = gql`
    query GetUserStats($userId: Int!) {
        users_by_pk(id: $userId) {
            id
            game_progress_aggregate {
                aggregate {
                    count
                    avg {
                        completion_percentage
                        playtime_minutes
                    }
                }
            }
            game_progress(where: { game: { status: { _eq: "COMPLETED" } } }) {
                id
            }
            game_progress(where: { game: { status: { _eq: "IN_PROGRESS" } } }) {
                id
            }
        }
    }
`; 