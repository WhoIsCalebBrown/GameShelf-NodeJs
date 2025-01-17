import { gql } from '@apollo/client';

export const CREATE_GAME = gql`
    mutation CreateGame(
        $name: String!,
        $description: String,
        $first_release_date: timestamptz,
        $year: Int,
        $igdb_id: Int!,
        $slug: String!,
        $cover_url: String,
        $rating: numeric,
        $total_rating: numeric,
        $rating_count: Int,
        $total_rating_count: Int,
        $aggregated_rating: numeric,
        $aggregated_rating_count: Int,
        $genres: jsonb,
        $platforms: jsonb,
        $themes: jsonb,
        $game_modes: jsonb,
        $involved_companies: jsonb,
        $category: Int,
        $storyline: String,
        $version_title: String,
        $version_parent: Int,
        $franchise: String,
        $franchise_id: Int,
        $hypes: Int,
        $follows: Int,
        $total_follows: Int,
        $url: String,
        $game_engines: jsonb,
        $alternative_names: jsonb,
        $collection: jsonb,
        $dlcs: jsonb,
        $expansions: jsonb,
        $parent_game: Int,
        $game_bundle: Boolean,
        $multiplayer_modes: jsonb,
        $release_dates: jsonb,
        $screenshots: jsonb,
        $similar_games: jsonb,
        $videos: jsonb,
        $websites: jsonb,
        $player_perspectives: jsonb,
        $language_supports: jsonb
    ) {
        insert_games_one(
            object: {
                name: $name,
                description: $description,
                first_release_date: $first_release_date,
                year: $year,
                igdb_id: $igdb_id,
                slug: $slug,
                cover_url: $cover_url,
                rating: $rating,
                total_rating: $total_rating,
                rating_count: $rating_count,
                total_rating_count: $total_rating_count,
                aggregated_rating: $aggregated_rating,
                aggregated_rating_count: $aggregated_rating_count,
                genres: $genres,
                platforms: $platforms,
                themes: $themes,
                game_modes: $game_modes,
                involved_companies: $involved_companies,
                category: $category,
                storyline: $storyline,
                version_title: $version_title,
                version_parent: $version_parent,
                franchise: $franchise,
                franchise_id: $franchise_id,
                hypes: $hypes,
                follows: $follows,
                total_follows: $total_follows,
                url: $url,
                game_engines: $game_engines,
                alternative_names: $alternative_names,
                collection: $collection,
                dlcs: $dlcs,
                expansions: $expansions,
                parent_game: $parent_game,
                game_bundle: $game_bundle,
                multiplayer_modes: $multiplayer_modes,
                release_dates: $release_dates,
                screenshots: $screenshots,
                similar_games: $similar_games,
                videos: $videos,
                websites: $websites,
                player_perspectives: $player_perspectives,
                language_supports: $language_supports
            },
            on_conflict: {
                update_columns: [
                    name, description, first_release_date, year, slug, cover_url,
                    rating, total_rating, rating_count, total_rating_count,
                    aggregated_rating, aggregated_rating_count, genres,
                    platforms, themes, game_modes, involved_companies, category,
                    storyline, version_title, version_parent, franchise,
                    franchise_id, hypes, follows, total_follows, url,
                    game_engines, alternative_names, collection, dlcs,
                    expansions, parent_game, game_bundle, multiplayer_modes,
                    release_dates, screenshots, similar_games, videos,
                    websites, player_perspectives, language_supports
                ],
                constraint: games_igdb_id_key
            }
        ) {
            id
            name
            description
            first_release_date
            year
            igdb_id
            slug
            cover_url
            rating
            total_rating
            rating_count
            total_rating_count
            aggregated_rating
            aggregated_rating_count
            genres
            platforms
            themes
            game_modes
            involved_companies
            category
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
`;

export const UPDATE_GAME_COMPETITIVE_STATUS = gql`
    mutation UpdateGameCompetitiveStatus($gameId: Int!, $isCompetitive: Boolean!) {
        update_games_by_pk(
            pk_columns: { id: $gameId },
            _set: { is_competitive: $isCompetitive }
        ) {
            id
            is_competitive
        }
    }
`; 