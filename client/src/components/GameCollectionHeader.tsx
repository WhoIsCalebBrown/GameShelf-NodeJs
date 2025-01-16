import React from 'react';
import {SortButton} from './SortButton';
import {GameCollectionHeaderProps} from '../types/props';


export const GameCollectionHeader: React.FC<GameCollectionHeaderProps> = ({
    searchTerm,
    setSearchTerm,
    sortConfig,
    onSort,
    groupUnplayed,
    setGroupUnplayed,
    onSteamImport
}) => {
    return (
        <div className="bg-dark-light rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search your collection..."
                        className="w-full px-4 py-3 pl-10 bg-dark rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="p-4 flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-2">
                    <SortButton field="name" label="Name" sortConfig={sortConfig} onSort={onSort} />
                    <SortButton field="status" label="Status" sortConfig={sortConfig} onSort={onSort} />
                    <SortButton field="year" label="Year" sortConfig={sortConfig} onSort={onSort} />
                    <SortButton field="last_played_at" label="Last Played" sortConfig={sortConfig} onSort={onSort} />
                    <SortButton field="playtime_minutes" label="Playtime" sortConfig={sortConfig} onSort={onSort} />
                </div>

                <div className="ml-auto flex gap-3">
                    <button
                        onClick={() => setGroupUnplayed(!groupUnplayed)}
                        className={`
                            px-4 py-2 rounded-lg font-medium flex items-center gap-2
                            ${groupUnplayed
                                ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' 
                                : 'bg-[#171a21] hover:text-white text-gray-300 hover:bg-indigo-700/60'
                            }
                            transition-all duration-200
                        `}
                    >
                        {groupUnplayed && (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        Group Unplayed
                    </button>

                    <button
                        onClick={onSteamImport}
                        className="px-4 py-2 rounded-lg font-medium bg-[#171a21] hover:bg-indigo-700/60 text-white transition-all duration-200 flex items-center gap-2"
                    >
                        <img
                            src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/english/sits_small.png"
                            alt="Steam"
                            className="h-5 w-5"
                        />
                        Import Steam Games
                    </button>
                </div>
            </div>
        </div>
    );
}; 
