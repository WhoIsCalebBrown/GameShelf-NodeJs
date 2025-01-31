import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const IGDB_ENDPOINT = 'https://api.igdb.com/v4';

const GAME_FIELDS = `
    fields name,
          summary,
          first_release_date,
          cover.*,
          slug,
          id,
          rating,
          total_rating,
          rating_count,
          total_rating_count,
          game_modes.*,
          genres.*,
          platforms.*,
          themes.*,
          involved_companies.company.name,
          involved_companies.developer,
          involved_companies.publisher,
          aggregated_rating,
          aggregated_rating_count,
          category,
          storyline,
          version_title,
          version_parent,
          follows,
          hypes,
          url,
          game_engines.*,
          alternative_names.*,
          collection.*,
          dlcs.*,
          expansions.*,
          parent_game,
          multiplayer_modes.*,
          release_dates.*,
          screenshots.*,
          similar_games.*,
          videos.*,
          websites.*,
          player_perspectives.*,
          language_supports.language.*,
          language_supports.language_support_type.*;
`;

router.post('/search', async (req, res) => {
    try {
        const { searchTerm } = req.body;
        console.log('Searching for:', searchTerm);

        const response = await fetch(`${IGDB_ENDPOINT}/games`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': process.env.TWITCH_CLIENT_ID!,
                'Authorization': `Bearer ${process.env.IGDB_ACCESS_SECRET}`,
                'Content-Type': 'text/plain'
            },
            body: `
                search "${searchTerm}";
                ${GAME_FIELDS}
                limit 20;
            `
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('IGDB API Error Response:', errorText);
            throw new Error(`IGDB API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        res.json(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error('Detailed Error:', error);
        res.status(500).json({ 
            error: 'Failed to search games',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.get('/trending', async (req, res) => {
    try {
        // First, get the popularity primitives
        const popularityResponse = await fetch(`${IGDB_ENDPOINT}/popularity_primitives`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': process.env.TWITCH_CLIENT_ID!,
                'Authorization': `Bearer ${process.env.IGDB_ACCESS_SECRET}`,
                'Content-Type': 'text/plain'
            },
            body: `
                fields game_id,value;
                sort value desc;
                limit 100;
            `
        });

        if (!popularityResponse.ok) {
            const errorText = await popularityResponse.text();
            console.error('IGDB API Error Response:', errorText);
            throw new Error(`IGDB API error: ${popularityResponse.status} - ${errorText}`);
        }

        const primitives = await popularityResponse.json();
        const gameIds = primitives.map((game: { game_id: number }) => game.game_id);
        const gameIdsString = gameIds.join(',');

        // Then, get the actual game data for these IDs, focusing on AAA games
        const gamesResponse = await fetch(`${IGDB_ENDPOINT}/games`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': process.env.TWITCH_CLIENT_ID!,
                'Authorization': `Bearer ${process.env.IGDB_ACCESS_SECRET}`,
                'Content-Type': 'text/plain'
            },
            body: `
                ${GAME_FIELDS}
                where id = (${gameIdsString}) & 
                      category = 0 &
                      total_rating >= 75;
                limit 50;
            `
        });

        if (!gamesResponse.ok) {
            const errorText = await gamesResponse.text();
            console.error('IGDB API Error Response:', errorText);
            throw new Error(`IGDB API error: ${gamesResponse.status} - ${errorText}`);
        }

        const games = await gamesResponse.json();
        
        // Create a map of game IDs to their popularity rank
        const popularityOrder = primitives.map((game: { game_id: number }) => game.game_id);

        // Sort games based on their position in the popularity array and limit to 15
        const sortedgames = Array.isArray(games) ? 
            games
                .sort((a: { id: number }, b: { id: number }) => 
                    popularityOrder.indexOf(a.id) - popularityOrder.indexOf(b.id)
                )
                .slice(0, 15) : [];

        res.json(sortedgames);
    } catch (error) {
        console.error('Detailed Error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch trending games',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router; 