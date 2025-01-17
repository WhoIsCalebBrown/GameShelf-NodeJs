import { gql } from '@apollo/client';

export const GET_GAME_COLLECTION = gql`
    query GetGameCollection($userId: Int!, $orderBy: [game_progress_order_by!]) {
        game_progress(
            where: { user_id: { _eq: $userId } }
            order_by: $orderBy
        ) {
            id
            game_id
            user_id
            status
            playtime_minutes
            completion_percentage
            last_played_at
            notes
            current_rank
            peak_rank
            game {
                id
                name
                description
                year
                igdb_id
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
                first_release_date
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
                is_favorite
                is_competitive
            }
        }
    }
`; 