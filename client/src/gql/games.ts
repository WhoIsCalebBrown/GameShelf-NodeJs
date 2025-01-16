import { gql } from '@apollo/client';

export const CREATE_GAME = gql`
    mutation CreateGame(
        $name: String!,
        $description: String,
        $year: Int,
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
                update_columns: [name, description, year, slug, cover_url],
                constraint: games_igdb_id_key}
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