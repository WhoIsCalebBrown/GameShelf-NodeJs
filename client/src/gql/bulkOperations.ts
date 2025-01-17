import { gql } from '@apollo/client';

export const CREATE_BULK_GAMES = gql`
    mutation CreateBulkGames($games: [games_insert_input!]!) {
        insert_games(
            objects: $games,
            on_conflict: {
                constraint: games_igdb_id_key,
                update_columns: [
                    name, description, year, slug, cover_url,
                    rating, total_rating, rating_count, total_rating_count,
                    genres, platforms, themes, game_modes, involved_companies,
                    aggregated_rating, aggregated_rating_count, category,
                    storyline, version_title, version_parent, franchise, franchise_id,
                    hypes, follows, total_follows, url, game_engines,
                    alternative_names, collection, dlcs, expansions, parent_game,
                    game_bundle, multiplayer_modes, release_dates, screenshots,
                    similar_games, videos, websites, player_perspectives,
                    language_supports
                ]
            }
        ) {
            returning {
                id
                igdb_id
                name
                description
                year
                slug
                cover_url
                rating
                total_rating
                rating_count
                total_rating_count
                genres
                platforms
                themes
                game_modes
                involved_companies
                aggregated_rating
                aggregated_rating_count
                category
                status
                storyline
                version_title
                version_parent
                franchise
                franchise_id
                hypes
                follows
                total_follows
                url
                game_engines
                alternative_names
                collection
                dlcs
                expansions
                parent_game
                game_bundle
                multiplayer_modes
                release_dates
                screenshots
                similar_games
                videos
                websites
                player_perspectives
                language_supports
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