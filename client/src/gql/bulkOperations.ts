import { gql } from '@apollo/client';

export const CREATE_BULK_GAMES = gql`
    mutation CreateBulkGames($games: [games_insert_input!]!) {
        insert_games(
            objects: $games,
            on_conflict: {
                constraint: games_igdb_id_key,
                update_columns: [name, description, year, slug, cover_url]
            }
        ) {
            returning {
                id
                igdb_id
                name
            }
        }
    }
`;

export const CREATE_BULK_GAME_PROGRESSES = gql`
    mutation CreateBulkGameProgresses($progresses: [game_progress_insert_input!]!) {
        insert_game_progress(
            objects: $progresses,
            on_conflict: {
                constraint: game_progress_user_id_game_id_key,
                update_columns: [playtime_minutes, last_played_at]
            }
        ) {
            returning {
                id
                game_id
                user_id
            }
        }
    }
`; 