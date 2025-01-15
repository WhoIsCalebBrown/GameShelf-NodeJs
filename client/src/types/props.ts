import { Game, game_status } from './game';
import { GameProgress } from './user';
import React from 'react';

export interface GameCardProps {
    game: Game;
    actions?: React.ReactNode;
    onStatusChange?: (status: game_status) => void;
    onDelete?: () => void;
}

export interface GameProgressProps {
    game: Game;
    progress?: GameProgress;
    userId: number;
}

export interface EditGameModalProps {
    game: {
        id: number;
        name: string;
        description?: string;
        year?: number;
    };
    onClose: () => void;
    onSave: (id: number, updates: any) => void;
}

export interface DropdownMenuProps {
    onDelete: () => void;
    onEdit: () => void;
}

export interface SortButtonProps {
    field: 'name' | 'status' | 'year' | 'last_played_at' | 'playtime_minutes';
    label: string;
}

export interface ProtectedRouteProps {
    children: React.ReactNode;
}

export interface SteamImportProps {
    onComplete?: () => void;
}

export interface GameSearchProps {
    onGameSelect?: (game: Game) => void;
}

export interface GameStatsProps {
    games: Game[];
} 