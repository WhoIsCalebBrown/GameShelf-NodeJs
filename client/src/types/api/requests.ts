export interface SortConfig {
    field: 'name' | 'status' | 'year' | 'last_played_at' | 'playtime_minutes';
    order: 'asc' | 'desc';
}

export interface OrderBy {
    [field: string]: 'asc' | 'desc';
}

export interface QueryVariables {
    userId?: number;
    gameId?: number;
    status?: string;
    orderBy?: OrderBy[];
    [key: string]: number | string | OrderBy[] | undefined | null;
} 