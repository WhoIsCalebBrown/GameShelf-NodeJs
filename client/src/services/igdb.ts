interface IGDBGame {
    id: number;
    name: string;
    summary: string;
    first_release_date?: number;
    cover?: {
        url: string;
    };
    slug: string;
}

export const searchgames = async (searchTerm: string): Promise<IGDBGame[]> => {
    try {
        const response = await fetch('/api/igdb/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ searchTerm })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('IGDB API Error:', errorText);
            throw new Error(`Failed to fetch games from IGDB: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        // Check if data is an array, if not return empty array
        const games: IGDBGame[] = Array.isArray(data) ? data : [];
        
        return games.map(game => ({
            ...game,
            cover: game.cover ? {
                url: game.cover.url.replace('t_thumb', 't_cover_big')
            } : undefined
        }));
    } catch (error) {
        console.error('Error searching IGDB:', error);
        throw error;
    }
};

export const getGameById = async (id: number): Promise<IGDBGame> => {
    try {
        const response = await fetch(`/api/igdb/game/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('IGDB API Error:', errorText);
            throw new Error(`Failed to fetch game from IGDB: ${response.status} ${response.statusText}`);
        }

        const game: IGDBGame = await response.json();
        return {
            ...game,
            cover: game.cover ? {
                url: game.cover.url.replace('t_thumb', 't_cover_big')
            } : undefined
        };
    } catch (error) {
        console.error('Error fetching game from IGDB:', error);
        throw error;
    }
};

export const getTrendinggames = async (): Promise<IGDBGame[]> => {
    try {
        const response = await fetch('/api/igdb/trending');

        if (!response.ok) {
            const errorText = await response.text();
            console.error('IGDB API Error:', errorText);
            throw new Error(`Failed to fetch trending games: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const games: IGDBGame[] = Array.isArray(data) ? data : [];
        
        return games.map(game => ({
            ...game,
            cover: game.cover ? {
                url: game.cover.url.replace('t_thumb', 't_cover_big')
            } : undefined
        }));
    } catch (error) {
        console.error('Error fetching trending games:', error);
        throw error;
    }
}; 