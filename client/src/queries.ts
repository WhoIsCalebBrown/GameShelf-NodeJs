import { gql } from '@apollo/client';

export const GET_DATA = gql`
    query GetUserGames($userId: Int!, $orderBy: [game_progress_order_by!]) {
        game_progress(
            where: { user_id: { _eq: $userId } }
            order_by: $orderBy
        ) {
            id
            status
            playtime_minutes
            completion_percentage
            last_played_at
            notes
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

export const ADD_GAME = gql`
    mutation AddGame(
        $name: String!, 
        $description: String, 
        $year: Int!, 
        $igdb_id: Int!, 
        $slug: String!,
        $cover_url: String
    ) {
        insert_games_one(
            object: {
                name: $name,
                description: $description,
                year: $year,
                igdb_id: $igdb_id,
                slug: $slug,
                cover_url: $cover_url
            },
            on_conflict: {
                constraint: Games_pkey,
                update_columns: [name, description, year, slug, cover_url]
            }
        ) {
            id
            name
            description
            year
            igdb_id
            slug
            cover_url
        }
    }
`;

export const ADD_GAME_PROGRESS = gql`
    mutation AddGameProgress(
        $userId: Int!,
        $gameId: Int!
    ) {
        insert_game_progress_one(
            object: {
                user_id: $userId,
                game_id: $gameId,
                status: "NOT_STARTED",
                playtime_minutes: 0,
                completion_percentage: 0
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

export const DELETE_GAME = gql`
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

export const UPDATE_GAME_STATUS = gql`
    mutation UpdateGameStatus($userId: Int!, $gameId: Int!, $status: game_status!) {
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