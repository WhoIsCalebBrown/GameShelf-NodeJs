import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';

const router = Router();
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const IGDB_ENDPOINT = 'https://api.igdb.com/v4';

// Add delay between API calls to respect rate limits
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Simple in-memory cache for game matches
interface IGDBMatch {
    id: number;
    name: string;
    summary?: string;
    cover?: {
        url?: string;
        image_id?: string;
    };
    first_release_date?: number;
    slug?: string;
    rating?: number;
    total_rating?: number;
    rating_count?: number;
    total_rating_count?: number;
    genres?: Array<{ id: number; name: string; }>;
    platforms?: Array<{ id: number; name: string; }>;
    themes?: Array<{ id: number; name: string; }>;
    game_modes?: Array<{ id: number; name: string; }>;
    involved_companies?: Array<{
        company: { name: string; };
        developer: boolean;
        publisher: boolean;
    }>;
    aggregated_rating?: number;
    aggregated_rating_count?: number;
    category?: number;
    storyline?: string;
    version_title?: string;
    version_parent?: number;
    franchises?: Array<{ id: number; name: string; }>;
    hypes?: number;
    follows?: number;
    url?: string;
    game_engines?: Array<{ id: number; name: string; }>;
    alternative_names?: Array<{ id: number; name: string; }>;
    collection?: { id: number; name: string; };
    dlcs?: Array<{ id: number; name: string; }>;
    expansions?: Array<{ id: number; name: string; }>;
    parent_game?: number;
    multiplayer_modes?: Array<{
        id: number;
        campaigncoop?: boolean;
        dropin?: boolean;
        lancoop?: boolean;
        offlinecoop?: boolean;
        offlinecoopmax?: number;
        offlinemax?: number;
        onlinecoop?: boolean;
        onlinecoopmax?: number;
        onlinemax?: number;
        splitscreen?: boolean;
    }>;
    release_dates?: Array<{
        id: number;
        date: number;
        platform: { id: number; name: string; };
        region: number;
    }>;
    screenshots?: Array<{
        id: number;
        image_id: string;
        url: string;
        width: number;
        height: number;
    }>;
    similar_games?: Array<{ id: number; name: string; }>;
    videos?: Array<{
        id: number;
        video_id: string;
        name: string;
    }>;
    websites?: Array<{
        id: number;
        url: string;
        category: number;
    }>;
    player_perspectives?: Array<{ id: number; name: string; }>;
    language_supports?: Array<{
        id: number;
        language: { id: number; name: string; };
        language_support_type: { id: number; name: string; };
    }>;
}

interface CachedMatch {
    igdb_id: number;
    cover_url: string | null;
    year: number | null;
    description: string | null;
    slug: string;
    matched: boolean;
    igdb_match: IGDBMatch | null;
}

const matchCache: Record<string, CachedMatch> = {};

interface SteamGame {
    name: string;
    appid: number;
    playtime_forever?: number;
    rtime_last_played?: number;
    release_date?: {
        coming_soon: boolean;
        date: string;
    };
}

interface MatchedGame extends SteamGame {
    igdb_id: number;
    cover_url: string | null;
    year: number | null;
    description: string | null;
    slug: string;
    matched: boolean;
    rating?: number | null;
    total_rating?: number | null;
    rating_count?: number | null;
    total_rating_count?: number | null;
    genres?: Array<{ id: number; name: string; }> | null;
    platforms?: Array<{ id: number; name: string; }> | null;
    themes?: Array<{ id: number; name: string; }> | null;
    game_modes?: Array<{ id: number; name: string; }> | null;
    involved_companies?: Array<{
        company: { name: string; };
        developer: boolean;
        publisher: boolean;
    }> | null;
    aggregated_rating?: number | null;
    aggregated_rating_count?: number | null;
    first_release_date?: string | null;
    category?: number | null;
    storyline?: string | null;
    version_title?: string | null;
    version_parent?: number | null;
    franchise?: string | null;
    franchise_id?: number | null;
    hypes?: number | null;
    follows?: number | null;
    url?: string | null;
    game_engines?: Array<{ id: number; name: string; }> | null;
    alternative_names?: Array<{ id: number; name: string; }> | null;
    collection?: { id: number; name: string; } | null;
    dlcs?: Array<{ id: number; name: string; }> | null;
    expansions?: Array<{ id: number; name: string; }> | null;
    parent_game?: number | null;
    game_bundle?: boolean | null;
    multiplayer_modes?: Array<{
        id: number;
        campaigncoop?: boolean;
        dropin?: boolean;
        lancoop?: boolean;
        offlinecoop?: boolean;
        offlinecoopmax?: number;
        offlinemax?: number;
        onlinecoop?: boolean;
        onlinecoopmax?: number;
        onlinemax?: number;
        splitscreen?: boolean;
    }> | null;
    release_dates?: Array<{
        id: number;
        date: number;
        platform: { id: number; name: string; };
        region: number;
    }> | null;
    screenshots?: Array<{
        id: number;
        image_id: string;
        url: string;
        width: number;
        height: number;
    }> | null;
    similar_games?: Array<{ id: number; name: string; }> | null;
    videos?: Array<{
        id: number;
        video_id: string;
        name: string;
    }> | null;
    websites?: Array<{
        id: number;
        url: string;
        category: number;
    }> | null;
    player_perspectives?: Array<{ id: number; name: string; }> | null;
    language_supports?: Array<{
        id: number;
        language: { id: number; name: string; };
        language_support_type: { id: number; name: string; };
    }> | null;
}

interface RequestWithGames extends Request {
    body: {
        games: SteamGame[];
    };
}

// Helper function to clean game names for better matching
function cleanGameName(name: string): string {
    // Store original name for logging
    const originalName = name;
    
    // First pass - basic cleaning
    let cleanedName = name
        .toLowerCase()
        // Remove trademark/copyright symbols
        .replace(/[™®©]/g, '')
        // Convert roman numerals to numbers
        .replace(/\biv\b/gi, '4')
        .replace(/\biii\b/gi, '3')
        .replace(/\bii\b/gi, '2')
        .replace(/\bi\b/gi, '1')
        // Standardize separators
        .replace(/[-_–—]/g, ' ')
        // Remove special characters but keep numbers
        .replace(/[^\w\s0-9]/g, ' ')
        // Clean up multiple spaces
        .replace(/\s+/g, ' ')
        .trim();

    // Remove common edition identifiers
    const editionPatterns = [
        'ultimate edition',
        'standard edition',
        'deluxe edition',
        'gold edition',
        'goty edition',
        'game of the year edition',
        'definitive edition',
        'enhanced edition',
        'complete edition',
        'collection edition',
        'anniversary edition',
        'remastered',
        'extended',
        'expanded'
    ];

    editionPatterns.forEach(pattern => {
        cleanedName = cleanedName.replace(new RegExp(`\\b${pattern}\\b`, 'gi'), '');
    });

    // Remove platform identifiers
    cleanedName = cleanedName.replace(/\b(pc|mac|linux|windows)\b/gi, '');

    // Remove years in parentheses
    cleanedName = cleanedName.replace(/\(\d{4}\)/g, '');

    // Clean up multiple spaces again
    cleanedName = cleanedName.replace(/\s+/g, ' ').trim();

    // Generate variations for search
    const variations = new Set<string>();
    
    // Add the main cleaned name
    variations.add(cleanedName);
    
    // Add version without numbers
    variations.add(cleanedName.replace(/\d+/g, '').trim());
    
    // If name has a colon or dash, add the part before it
    const baseName = cleanedName.split(/[\s-:]+/)[0].trim();
    if (baseName !== cleanedName) {
        variations.add(baseName);
    }

    // If it's a sequel (has a number at the end), add both with and without the number
    const sequelMatch = cleanedName.match(/^(.*?)\s*\d+$/);
    if (sequelMatch) {
        variations.add(sequelMatch[1].trim());
    }

    // Log all variations for debugging
    console.log('Original name:', originalName);
    console.log('Cleaned variations:', Array.from(variations));
    
    return Array.from(variations).join('|');
}

// Helper function to check if a game name indicates it's not a real game
function isNonGame(name: string): boolean {
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
}

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
async function searchIGDB(query: string): Promise<IGDBMatch[]> {
    try {
        // Add all the fields we want to retrieve
        const fullQuery = `${query}
            fields 
                name,
                          summary,
                          first_release_date,
                          cover.*,
                          slug,
                          id,
                          rating,
                          total_rating,
                          rating_count,
                          total_rating_count,
                          genres.*,
                          platforms.*,
                          themes.*,
                game_modes.*,
                          involved_companies.company.name,
                          involved_companies.developer,
                          involved_companies.publisher,
                          aggregated_rating,
                          aggregated_rating_count,
                          category,
                          storyline,
                          version_title,
                          version_parent,
                franchises.*,
                          hypes,
                          follows,
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
                language_supports.*;`;

        console.log('IGDB Query:', fullQuery);

        const response = await fetch(`${IGDB_ENDPOINT}/games`, {
            method: 'POST',
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID || '',
                'Authorization': `Bearer ${process.env.IGDB_ACCESS_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'text/plain'
            },
            body: fullQuery
            });

            if (!response.ok) {
                const errorText = await response.text();
            console.error('IGDB API Error:', errorText);
                throw new Error(`IGDB API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
        console.log('IGDB Response:', JSON.stringify(data, null, 2));
        return data as IGDBMatch[];
        } catch (error) {
        console.error('Error searching IGDB:', error);
        return [];
    }
}

// Add return type to the function
async function matchGames(games: SteamGame[]): Promise<MatchedGame[]> {
    const results: MatchedGame[] = [];
    const batchSize = 5;

    for (let i = 0; i < games.length; i += batchSize) {
        const batch = games.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(async (game) => {
            const match = await findMatch(game.name, game);
            const igdbMatch = match?.igdb_match;

            if (!igdbMatch) {
                console.log(`No IGDB match found for: ${game.name}`);
                return {
                    ...game,
                    igdb_id: 0,
                    cover_url: null,
                    year: null,
                    description: null,
                    slug: '',
                    matched: false
                } as MatchedGame;
            }

            // Log the full IGDB match data for debugging
            console.log(`IGDB match data for ${game.name}:`, JSON.stringify(igdbMatch, null, 2));

            const matchedGame: MatchedGame = {
                ...game,
                igdb_id: igdbMatch.id,
                cover_url: match?.cover_url ?? null,
                year: match?.year ?? null,
                description: igdbMatch.summary ?? null,
                slug: igdbMatch.slug ?? '',
                matched: true,
                
                // Basic ratings
                rating: igdbMatch.rating ?? null,
                total_rating: igdbMatch.total_rating ?? null,
                rating_count: igdbMatch.rating_count ?? null,
                total_rating_count: igdbMatch.total_rating_count ?? null,
                
                // Arrays of objects
                genres: igdbMatch.genres ?? null,
                platforms: igdbMatch.platforms ?? null,
                themes: igdbMatch.themes ?? null,
                game_modes: igdbMatch.game_modes ?? null,
                
                // Company information
                involved_companies: igdbMatch.involved_companies ?? null,
                
                // Additional ratings
                aggregated_rating: igdbMatch.aggregated_rating ?? null,
                aggregated_rating_count: igdbMatch.aggregated_rating_count ?? null,
                
                // Release information
                first_release_date: igdbMatch.first_release_date ? new Date(igdbMatch.first_release_date * 1000).toISOString() : null,
                category: igdbMatch.category ?? null,
                
                // Text fields
                storyline: igdbMatch.storyline ?? null,
                version_title: igdbMatch.version_title ?? null,
                version_parent: igdbMatch.version_parent ?? null,
                
                // Franchise information
                franchise: igdbMatch.franchises?.[0]?.name ?? null,
                franchise_id: igdbMatch.franchises?.[0]?.id ?? null,
                
                // Social metrics
                hypes: igdbMatch.hypes ?? null,
                follows: igdbMatch.follows ?? null,
                
                // URLs and external links
                url: igdbMatch.url ?? null,
                
                // Additional game information
                game_engines: igdbMatch.game_engines ?? null,
                alternative_names: igdbMatch.alternative_names ?? null,
                collection: igdbMatch.collection ?? null,
                dlcs: igdbMatch.dlcs ?? null,
                expansions: igdbMatch.expansions ?? null,
                parent_game: igdbMatch.parent_game ?? null,
                game_bundle: igdbMatch.category === 3,
                
                // Gameplay information
                multiplayer_modes: igdbMatch.multiplayer_modes ?? null,
                release_dates: igdbMatch.release_dates ?? null,
                
                // Media
                screenshots: igdbMatch.screenshots?.map(s => ({
                    ...s,
                    url: s.url ? (s.url.startsWith('http') ? s.url : `https:${s.url}`) : s.image_id
                })) ?? null,
                similar_games: igdbMatch.similar_games ?? null,
                videos: igdbMatch.videos ?? null,
                websites: igdbMatch.websites ?? null,
                
                // Additional details
                player_perspectives: igdbMatch.player_perspectives ?? null,
                language_supports: igdbMatch.language_supports ?? null
            };

            // Log the final matched game object for debugging
            console.log(`Final matched game data for ${game.name}:`, JSON.stringify(matchedGame, null, 2));

            return matchedGame;
        }));
        
        results.push(...batchResults);
        if (i + batchSize < games.length) {
            await delay(1000);
        }
    }
    
    return results;
}

// Fix the route handler
router.post('/match', async (req: RequestWithGames, res: Response) => {
    try {
        const { games } = req.body;
        if (!Array.isArray(games)) {
            throw new Error('Invalid request: games must be an array');
        }
        const matches = await matchGames(games);
        res.json(matches);
    } catch (error) {
        console.error('Error matching games:', error);
        res.status(500).json({ error: 'Failed to match games' });
    }
});

interface SteamGameDetails {
    success: boolean;
    data?: {
        release_date?: {
            coming_soon: boolean;
            date: string;
        };
        name: string;
        steam_appid: number;
        type: string;
    };
}

// Helper function to get Steam game details including release date
async function getSteamGameDetails(appId: number): Promise<SteamGameDetails | null> {
    try {
        const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
        const data = await response.json();
        return data[appId] as SteamGameDetails;
    } catch (error) {
        console.error(`Error fetching Steam game details for ${appId}:`, error);
        return null;
    }
}

async function findMatch(gameName: string, steamGame?: SteamGame): Promise<CachedMatch | null> {
    try {
        const cleanedNames = cleanGameName(gameName).split('|');
        console.log('Searching for game:', gameName);
        console.log('Cleaned names:', cleanedNames);
                    
                    // Check cache first
        if (matchCache[gameName]) {
            console.log('Cache hit for:', gameName);
                        return {
                ...matchCache[gameName],
                matched: true
            };
        }

        // Get Steam release date if available
        let steamReleaseDate: Date | null = null;
        if (steamGame?.appid) {
            const steamDetails = await getSteamGameDetails(steamGame.appid);
            if (steamDetails?.success && steamDetails?.data?.release_date?.date) {
                steamReleaseDate = new Date(steamDetails.data.release_date.date);
                console.log('Steam release date:', steamReleaseDate);
            }
        }

        let allMatches: IGDBMatch[] = [];
        
        // Try each name variation
        for (const cleanedName of cleanedNames) {
            // Skip empty variations
            if (!cleanedName.trim()) continue;

            const searchQuery = `search "${cleanedName}";
                where (category = (0,2,4,8,9) | category = null);
                limit 5;`;

            const matches = await searchIGDB(searchQuery);
            allMatches.push(...matches);
            
            // If we found matches, no need to try other variations
            if (matches.length > 0) break;
            
            // Add delay between queries
            await delay(250);
        }

        // Remove duplicates based on IGDB ID
        allMatches = Array.from(new Map(allMatches.map(m => [m.id, m])).values());

        console.log('Total matches found:', allMatches.length);
        let bestMatch: IGDBMatch | null = null;

        if (allMatches.length > 0) {
            // Score each match based on multiple criteria
            const scoredMatches = allMatches.map(match => {
                let score = 0;
                const matchName = match.name.toLowerCase();
                
                // Check against all name variations
                for (const cleanedName of cleanedNames) {
                    // Exact match gets highest score
                    if (matchName === cleanedName) {
                        score += 100;
                        break;
                    }
                    // Partial matches
                    if (matchName.includes(cleanedName) || cleanedName.includes(matchName)) {
                        score += 50;
                    }
                }
                
                // Release date matching (if available)
                if (steamReleaseDate && match.first_release_date) {
                    const igdbDate = new Date(match.first_release_date * 1000);
                    const dateDiff = Math.abs(steamReleaseDate.getTime() - igdbDate.getTime());
                    const daysDiff = dateDiff / (1000 * 60 * 60 * 24);
                    
                    // If release dates are within 7 days
                    if (daysDiff <= 7) {
                        score += 100;  // Strong indicator it's the same game
                    }
                    // If release dates are within 30 days
                    else if (daysDiff <= 30) {
                        score += 50;
                    }
                    // If release dates are in the same year
                    else if (steamReleaseDate.getFullYear() === igdbDate.getFullYear()) {
                        score += 25;
                    }
                }
                
                // Prefer games with cover art
                if (match.cover?.url) {
                    score += 10;
                }
                
                // Prefer games with more complete data
                if (match.summary) score += 5;
                if (match.rating) score += 5;
                if (match.genres?.length) score += 5;
                
                // Prefer newer games
                if (match.first_release_date) {
                    const year = new Date(match.first_release_date * 1000).getFullYear();
                    if (year >= 2020) score += 20;
                    else if (year >= 2010) score += 15;
                    else if (year >= 2000) score += 10;
                }
                
                return { match, score };
            });

            // Sort by score and get the best match
            scoredMatches.sort((a, b) => b.score - a.score);
            console.log('Scored matches:', scoredMatches.map(m => ({
                name: m.match.name,
                score: m.score,
                year: m.match.first_release_date ? new Date(m.match.first_release_date * 1000).getFullYear() : null
            })));
            
            // Only use matches with a minimum score
            bestMatch = scoredMatches[0].score >= 40 ? scoredMatches[0].match : null;
        }

        // Transform cover URL to get the big version
        let coverUrl: string | null = null;
        if (bestMatch?.cover?.url) {
            coverUrl = bestMatch.cover.url.replace(/t_[a-zA-Z_]+/, 't_cover_big');
            if (!coverUrl.startsWith('http')) {
                coverUrl = `https:${coverUrl}`;
            }
        }

        const result: CachedMatch = {
            igdb_id: bestMatch?.id || 0,
            cover_url: coverUrl,
            year: bestMatch?.first_release_date ? new Date(bestMatch.first_release_date * 1000).getFullYear() : null,
            description: bestMatch?.summary || null,
            slug: bestMatch?.slug || gameName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            matched: !!bestMatch,
            igdb_match: bestMatch
        };

        // Only cache if we found a good match (score > 50)
        if (bestMatch) {
            matchCache[gameName] = result;
        }

        return result;
    } catch (error) {
        console.error(`Error finding match for game ${gameName}:`, error);
        return null;
    }
}

export default router; 