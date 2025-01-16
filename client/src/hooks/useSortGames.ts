import { useState, useCallback } from 'react';
import { Game, SortConfig } from '../types';

export const useSortGames = () => {
    const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
        const saved = localStorage.getItem('gameshelf-sort-config');
        return saved ? JSON.parse(saved) : {
            field: 'name',
            order: 'asc'
        };
    });

    const sortGames = useCallback((gamesArray: Game[]) => {
        return [...gamesArray].sort((a, b) => {
            if (sortConfig.field === 'name') {
                return sortConfig.order === 'asc' 
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            }
            if (sortConfig.field === 'status') {
                return sortConfig.order === 'asc'
                    ? (a.status || '').localeCompare(b.status || '')
                    : (b.status || '').localeCompare(a.status || '');
            }
            if (sortConfig.field === 'year') {
                const yearA = a.year || 0;
                const yearB = b.year || 0;
                return sortConfig.order === 'asc' ? yearA - yearB : yearB - yearA;
            }
            if (sortConfig.field === 'last_played_at') {
                const dateA = a.last_played_at ? new Date(a.last_played_at).getTime() : 0;
                const dateB = b.last_played_at ? new Date(b.last_played_at).getTime() : 0;
                return sortConfig.order === 'asc' ? dateA - dateB : dateB - dateA;
            }
            if (sortConfig.field === 'playtime_minutes') {
                const timeA = a.playtime_minutes || 0;
                const timeB = b.playtime_minutes || 0;
                return sortConfig.order === 'asc' ? timeA - timeB : timeB - timeA;
            }
            return 0;
        });
    }, [sortConfig]);

    return { sortConfig, setSortConfig, sortGames };
}; 
