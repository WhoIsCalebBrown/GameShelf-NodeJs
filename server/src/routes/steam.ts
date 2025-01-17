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
    rtime_last_played?: number;
    last_played_at?: string;
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
            }).map((game: SteamGame) => {
                // Log timestamp conversion
                console.log(`Processing game: ${game.name}`);
                console.log(`Original rtime_last_played: ${game.rtime_last_played}`);
                const lastPlayedAt = game.rtime_last_played ? new Date(game.rtime_last_played * 1000).toISOString() : null;
                console.log(`Converted last_played_at: ${lastPlayedAt}`);
                
                return {
                    ...game,
                    // Steam provides playtime in minutes
                    playtime_minutes: game.playtime_forever || 0,
                    // Convert rtime_last_played Unix timestamp to ISO string
                    last_played_at: lastPlayedAt
                };
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
                          status,
                          storyline,
                          version_title,
                          version_parent,
                          franchise,
                          franchise_id,
                          hypes,
                          follows,
                          total_follows,
                          url,
                          game_engines.*,
                          alternative_names.*,
                          collection.*,
                          dlcs.*,
                          expansions.*,
                          parent_game,
                          game_bundle,
                          multiplayer_modes.*,
                          release_dates.*,
                          screenshots.*,
                          similar_games.*,
                          videos.*,
                          websites.*,
                          player_perspectives.*,
                          language_supports.*;
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

// Match Steam games with IGDB data
router.post('/match', async (req, res) => {
    try {
        const { games } = req.body;
        if (!Array.isArray(games)) {
            throw new Error('Invalid request: games must be an array');
        }

        const results = [];
        const batchSize = 5; // Process 5 games at a time to respect rate limits

        for (let i = 0; i < games.length; i += batchSize) {
            const batch = games.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(async (game) => {
                try {
                    const cleanedName = cleanGameName(game.name);
                    
                    // Check cache first
                    if (matchCache[cleanedName]) {
                        return {
                            ...game,
                            ...matchCache[cleanedName]
                        };
                    }

                    // Search IGDB
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

                    const result = {
                        ...game,
                        igdb_id: bestMatch?.id || 0,
                        cover_url: bestMatch?.cover?.url?.replace('t_thumb', 't_cover_big') || '',
                        year: bestMatch?.first_release_date ? new Date(bestMatch.first_release_date * 1000).getFullYear() : null,
                        description: bestMatch?.summary || `No description available for ${game.name}`,
                        slug: bestMatch?.slug || game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        playtime_minutes: game.playtime_forever || 0,
                        last_played_at: game.rtime_last_played ? new Date(game.rtime_last_played * 1000).toISOString() : null,
                        rating: bestMatch?.rating,
                        total_rating: bestMatch?.total_rating,
                        rating_count: bestMatch?.rating_count,
                        total_rating_count: bestMatch?.total_rating_count,
                        genres: bestMatch?.genres,
                        platforms: bestMatch?.platforms,
                        themes: bestMatch?.themes,
                        game_modes: bestMatch?.game_modes,
                        involved_companies: bestMatch?.involved_companies,
                        aggregated_rating: bestMatch?.aggregated_rating,
                        aggregated_rating_count: bestMatch?.aggregated_rating_count,
                        category: bestMatch?.category,
                        status: bestMatch?.status,
                        storyline: bestMatch?.storyline,
                        version_title: bestMatch?.version_title,
                        version_parent: bestMatch?.version_parent,
                        franchise: bestMatch?.franchise,
                        franchise_id: bestMatch?.franchise_id,
                        hypes: bestMatch?.hypes,
                        follows: bestMatch?.follows,
                        total_follows: bestMatch?.total_follows,
                        url: bestMatch?.url,
                        game_engines: bestMatch?.game_engines,
                        alternative_names: bestMatch?.alternative_names,
                        collection: bestMatch?.collection,
                        dlcs: bestMatch?.dlcs,
                        expansions: bestMatch?.expansions,
                        parent_game: bestMatch?.parent_game,
                        game_bundle: bestMatch?.game_bundle,
                        multiplayer_modes: bestMatch?.multiplayer_modes,
                        release_dates: bestMatch?.release_dates,
                        screenshots: bestMatch?.screenshots,
                        similar_games: bestMatch?.similar_games,
                        videos: bestMatch?.videos,
                        websites: bestMatch?.websites,
                        player_perspectives: bestMatch?.player_perspectives,
                        language_supports: bestMatch?.language_supports
                    };

                    console.log(`Match endpoint - Game: ${game.name}`);
                    console.log(`Original rtime_last_played: ${game.rtime_last_played}`);
                    console.log(`Converted last_played_at: ${result.last_played_at}`);

                    // Cache the match
                    if (bestMatch) {
                        matchCache[cleanedName] = {
                            igdb_id: bestMatch.id,
                            cover_url: bestMatch.cover?.url?.replace('t_thumb', 't_cover_big'),
                            year: bestMatch.first_release_date ? new Date(bestMatch.first_release_date * 1000).getFullYear() : null,
                            description: bestMatch.summary,
                            slug: bestMatch.slug
                        };
                    }

                    return result;
                } catch (error) {
                    console.error(`Error matching game ${game.name}:`, error);
                    return {
                        ...game,
                        igdb_id: 0,
                        cover_url: '',
                        year: null,
                        description: `No description available for ${game.name}`,
                        slug: game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        playtime_minutes: game.playtime_forever || 0,
                        last_played_at: game.rtime_last_played ? new Date(game.rtime_last_played * 1000).toISOString() : null
                    };
                }
            }));

            results.push(...batchResults);
            if (i + batchSize < games.length) {
                await delay(1000); // Wait 1 second between batches
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Error matching games:', error);
        res.status(500).json({ 
            error: 'Failed to match games with IGDB',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router; 