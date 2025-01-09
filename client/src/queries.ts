import { gql } from '@apollo/client';

export const GET_DATA = gql`
    query GetGames($orderBy: [Games_order_by!]) {
        Games(order_by: $orderBy) {
            id
            name
            description
            year
            igdb_id
            slug
            status
            cover_url
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
        insert_Games_one(object: {
            name: $name,
            description: $description,
            year: $year,
            igdb_id: $igdb_id,
            slug: $slug,
            cover_url: $cover_url
        }) {
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

export const DELETE_GAME = gql`
    mutation DeleteGame($id: Int!) {
        delete_Games_by_pk(id: $id) {
            id
        }
    }
`;

export const UPDATE_GAME = gql`
    mutation UpdateGame($id: Int!, $name: String!, $description: String, $year: Int!) {
        update_Games_by_pk(
            pk_columns: { id: $id },
            _set: {
                name: $name,
                description: $description,
                year: $year
            }
        ) {
            id
            name
            description
            year
        }
    }
`;

export const UPDATE_GAME_STATUS = gql`
    mutation UpdateGameStatus($id: Int!, $status: gamestatus!) {
        update_Games_by_pk(
            pk_columns: { id: $id },
            _set: { status: $status }
        ) {
            id
            status
        }
    }
`;