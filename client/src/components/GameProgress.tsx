import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_USER_GAME_PROGRESS } from '../gql';
import { Game, GameProgress as GameProgressType } from '../types';

interface GameProgressProps {
    game: Game;
    progress?: GameProgressType;
    userId: number;
}

const GameProgress: React.FC<GameProgressProps> = ({ game, progress, userId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [playtime, setPlaytime] = useState(progress?.playtime_minutes || 0);
    const [completion, setCompletion] = useState(progress?.completion_percentage || 0);
    const [notes, setNotes] = useState(progress?.notes || '');

    const [updateProgress] = useMutation(UPDATE_USER_GAME_PROGRESS, {
        onCompleted: () => setIsEditing(false)
    });

    const handleSave = async () => {
        try {
            await updateProgress({
                variables: {
                    userId,
                    gameId: game.id,
                    playtime,
                    completion,
                    notes
                }
            });
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    return (
        <div className="mt-4 space-y-4">
            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">
                            Playtime (minutes)
                        </label>
                        <input
                            type="number"
                            value={playtime}
                            onChange={(e) => setPlaytime(Number(e.target.value))}
                            className="mt-1 block w-full rounded-md bg-dark border-gray-600 text-white"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400">
                            Completion (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={completion}
                            onChange={(e) => setCompletion(Number(e.target.value))}
                            className="mt-1 block w-full rounded-md bg-dark border-gray-600 text-white"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400">
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-1 block w-full rounded-md bg-dark border-gray-600 text-white"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1 rounded-md bg-gray-700 text-white hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-3 py-1 rounded-md bg-primary-500 text-white hover:bg-primary-600"
                        >
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-sm text-gray-400">Playtime</div>
                            <div>{Math.floor(playtime / 60)}h {playtime % 60}m</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Completion</div>
                            <div>{completion}%</div>
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1 rounded-md bg-gray-700 text-white hover:bg-gray-600"
                        >
                            Edit Progress
                        </button>
                    </div>
                    {notes && (
                        <div>
                            <div className="text-sm text-gray-400">Notes</div>
                            <div className="text-sm mt-1">{notes}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GameProgress; 