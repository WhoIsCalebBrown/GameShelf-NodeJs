import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const IGDB_ENDPOINT = 'https://api.igdb.com/v4';

// Add delay between API calls to respect rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple in-memory cache for game matches
const matchCache: { [key: string]: any } = {};

interface SteamGame {
    appid: number;
    name: string;
    playtime_forever: number;
    img_icon_url?: string;
    has_community_visible_stats?: boolean;
    playtime_windows_forever?: number;
    playtime_mac_forever?: number;
    playtime_linux_forever?: number;
    last_played?: number;
}

// Helper function to clean game names for better matching
const cleanGameName = (name: string): string => {
    return name
        .toLowerCase()
        // Remove trademark/copyright symbols
        .replace(/[™®©]/g, '')
        // Remove DLC indicators
        .replace(/dlc|season pass|content pack|expansion/gi, '')
        // Remove platform identifiers
        .replace(/(pc|mac|linux|windows)/gi, '')
        // Remove edition identifiers
        .replace(/(standard|deluxe|gold|goty|definitive|enhanced|complete|collection|edition)/gi, '')
        // Remove year in parentheses
        .replace(/\(\d{4}\)/g, '')
        // Remove special characters and extra spaces
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

// Helper function to check if a game name indicates it's not a real game
const isNonGame = (name: string): boolean => {
    const lowerName = name.toLowerCase();
    
    // Common patterns for non-games
    const nonGamePatterns = [
        'test server',
        'test client',
        'public test',
        'beta',
        'tutorial',
        'server',
        'dedicated server',
        'sdk',
        'tool',
        'editor',
        'benchmark',
        'companion',
        'extender',
        'engine',
        'launcher',
        'configuration',
        'software',
        'wallpaper',
        '3dmark',
        'precision x1',
        'script extender',
        'controller companion'
    ];

    // Check if name contains any non-game patterns
    return nonGamePatterns.some(pattern => lowerName.includes(pattern));
};

// Get user's Steam library
router.get('/library/:steamId', async (req, res) => {
    try {
        const { steamId } = req.params;
        
        if (!STEAM_API_KEY) {
            throw new Error('Steam API key not configured');
        }

        const response = await fetch(
            `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&format=json&include_appinfo=1&include_played_free_games=1`
        );

        if (!response.ok) {
            throw new Error(`Steam API error: ${response.status}`);
        }

        const data = await response.json();

        // Filter out DLCs and non-games
        if (data.response && Array.isArray(data.response.games)) {
            data.response.games = data.response.games.filter((game: SteamGame) => {
                const name = game.name.toLowerCase();
                
                // Check for DLC indicators
                const isDLC = name.includes('dlc') ||
                            name.includes('season pass') ||
                            name.includes('content pack') ||
                            name.includes('expansion');

                // Return true only if it's not a DLC and not a non-game
                return !isDLC && !isNonGame(game.name);
            });
        }

        res.json(data);
    } catch (error) {
        console.error('Steam API Error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch Steam library',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Helper function to search IGDB with retries
async function searchIGDB(query: string, retries = 2): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(`${IGDB_ENDPOINT}/games`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Client-ID': process.env.TWITCH_CLIENT_ID!,
                    'Authorization': `Bearer ${process.env.IGDB_ACCESS_SECRET}`,
                    'Content-Type': 'text/plain'
                },
                body: `
                    ${query}
                    fields name,
                          summary,
                          first_release_date,
                          cover.*,
                          slug,
                          id;
                `
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`IGDB API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (i === retries - 1) throw error;
            // If we get a rate limit error, wait longer
            const waitTime = (error as Error)?.message?.includes('429') ? 2000 : 500;
            await delay(waitTime);
        }
    }
}

// Process a batch of games
async function processBatch(games: SteamGame[], startIdx: number, onProgress?: (current: number) => void): Promise<any[]> {
    const results: any[] = [];
    const batchPromises = games.map(async (game, index) => {
        try {
            // Check cache first
            const cleanedName = cleanGameName(game.name);
            if (matchCache[cleanedName]) {
                onProgress?.(startIdx + index + 1);
                return {
                    index: startIdx + games.indexOf(game),
                    result: {
                        ...game,
                        ...matchCache[cleanedName]
                    }
                };
            }

            // Try exact match first
            const matches = await searchIGDB(`search "${cleanedName}"; limit 5;`);
            let bestMatch = null;

            if (matches && matches.length > 0) {
                // Try to find an exact match first
                bestMatch = matches.find((match: any) => 
                    cleanGameName(match.name) === cleanedName
                );

                // If no exact match, try partial match
                if (!bestMatch) {
                    bestMatch = matches.find((match: any) => {
                        const matchName = cleanGameName(match.name);
                        return matchName.includes(cleanedName) || cleanedName.includes(matchName);
                    });
                }

                // If still no match, take the first result
                if (!bestMatch) {
                    bestMatch = matches[0];
                }
            }

            let result;
            if (bestMatch) {
                result = {
                    ...game,
                    igdb_id: bestMatch.id,
                    cover_url: bestMatch.cover?.url?.replace('t_thumb', 't_cover_big'),
                    year: bestMatch.first_release_date ? new Date(bestMatch.first_release_date * 1000).getFullYear() : null,
                    description: bestMatch.summary,
                    slug: bestMatch.slug,
                    playtime_minutes: game.playtime_forever || 0,
                    last_played: game.last_played ? new Date(game.last_played * 1000).toISOString() : null
                };
                // Cache the match
                matchCache[cleanedName] = {
                    igdb_id: bestMatch.id,
                    cover_url: bestMatch.cover?.url?.replace('t_thumb', 't_cover_big'),
                    year: bestMatch.first_release_date ? new Date(bestMatch.first_release_date * 1000).getFullYear() : null,
                    description: bestMatch.summary,
                    slug: bestMatch.slug,
                    playtime_minutes: game.playtime_forever || 0,
                    last_played: game.last_played ? new Date(game.last_played * 1000).toISOString() : null
                };
            } else {
                result = {
                    ...game,
                    igdb_id: 0,
                    cover_url: '',
                    year: null,
                    description: `No description available for ${game.name}`,
                    slug: game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    playtime_minutes: game.playtime_forever || 0,
                    last_played: game.last_played ? new Date(game.last_played * 1000).toISOString() : null
                };
            }

            onProgress?.(startIdx + index + 1);
            return {
                index: startIdx + games.indexOf(game),
                result
            };
        } catch (error) {
            console.error(`Error matching game ${game.name}:`, error);
            onProgress?.(startIdx + index + 1);
            return {
                index: startIdx + games.indexOf(game),
                result: {
                    ...game,
                    igdb_id: 0,
                    cover_url: '',
                    year: null,
                    description: `No description available for ${game.name}`,
                    slug: game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    playtime_minutes: game.playtime_forever || 0,
                    last_played: game.last_played ? new Date(game.last_played * 1000).toISOString() : null
                }
            };
        }
    });

    const batchResults = await Promise.all(batchPromises);
    return batchResults;
}

// Match Steam games with IGDB database
router.post('/match', async (req, res) => {
    try {
        const { games } = req.body;
        const BATCH_SIZE = 5; // Process 5 games at a time
        const results: any[] = new Array(games.length);
        const unmatchedGames: string[] = [];

        // Set up SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Process games in batches
        for (let i = 0; i < games.length; i += BATCH_SIZE) {
            const batch = games.slice(i, i + BATCH_SIZE);
            const batchResults = await processBatch(batch, i, (current) => {
                // Send progress event
                const progressData = JSON.stringify({ current, total: games.length });
                res.write(`data: ${progressData}\n\n`);
            });
            
            // Place results in the correct order
            batchResults.forEach(({ index, result }) => {
                results[index] = result;
                if (result.igdb_id === 0) {
                    unmatchedGames.push(result.name);
                }
            });

            // Add a small delay between batches
            if (i + BATCH_SIZE < games.length) {
                await delay(1000);
            }
        }

        // Log summary of unmatched games
        if (unmatchedGames.length > 0) {
            console.log('\n📊 Matching Summary:');
            console.log(`✅ Matched: ${games.length - unmatchedGames.length} games`);
            console.log(`❌ Unmatched: ${unmatchedGames.length} games`);
            console.log('\n❌ Unmatched Games List:');
            unmatchedGames.forEach(name => console.log(`  - ${name}`));
            console.log('\n');
        }

        // Send final results event
        const finalData = JSON.stringify({ matches: results });
        res.write(`data: ${finalData}\n\n`);
        
        // End the response
        res.end();
    } catch (error) {
        console.error('Game matching error:', error);
        // Only send error if headers haven't been sent
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Failed to match games with IGDB',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
});

export default router; 