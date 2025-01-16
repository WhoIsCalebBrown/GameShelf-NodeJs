import React from 'react';
import { SortConfig } from '../types';

type SortField = 'name' | 'status' | 'year' | 'last_played_at' | 'playtime_minutes';

interface SortButtonProps {
    field: SortField;
    label: string;
    sortConfig: SortConfig;
    onSort: (field: SortField) => void;
}

export const SortButton = React.memo<SortButtonProps>(({field, label, sortConfig, onSort}) => (
    <button
        onClick={() => onSort(field)}
        className={`
            px-4 py-2 rounded-lg font-medium
            ${sortConfig.field === field
            ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' 
            : 'bg-[#171a21] hover:text-white text-gray-300 hover:bg-indigo-700/60'
        } 
            transition-all duration-200 flex items-center gap-2
            active:scale-95
        `}
    >
        {label}
        {sortConfig.field === field && (
            <span className="text-lg">
                {sortConfig.order === 'asc' ? '↑' : '↓'}
            </span>
        )}
    </button>
));

SortButton.displayName = 'SortButton'; 
