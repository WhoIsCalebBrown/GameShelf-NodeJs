import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const IGDB_ENDPOINT = 'https://api.igdb.com/v4';

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
                fields name,summary,first_release_date,cover.*,slug,id;
                limit 10;
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

export default router; 