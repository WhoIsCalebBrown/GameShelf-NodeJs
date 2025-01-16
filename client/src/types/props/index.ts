import { Game } from '../models/Game';
import { GameProgress } from '../models/GameProgress';
import { GameStatus } from '../enums/gameStatus';
import React from 'react';

export interface GameCardProps {
    game: Game;
    actions?: React.ReactNode;
    onStatusChange?: (status: GameStatus) => void;
    onDelete?: () => void;
}

export interface GameProgressProps {
    game: Game;
    progress?: GameProgress;
    userId: number;
}

export interface GameUpdates {
    name?: string;
    description?: string;
    year?: number;
}

export interface EditGameModalProps {
    game: {
        id: number;
        name: string;
        description?: string;
        year?: number;
    };
    onClose: () => void;
    onSave: (id: number, updates: GameUpdates) => void;
}

export interface DropdownMenuProps {
    onDelete: () => void;
    onEdit: () => void;
}

export interface SortButtonProps {
    field: 'name' | 'status' | 'year' | 'last_played_at' | 'playtime_minutes';
    label: string;
    className?: string;
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