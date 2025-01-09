import React, { useState } from 'react';

interface EditGameModalProps {
    game: {
        id: number;
        name: string;
        description?: string;
        year?: number;
    };
    onClose: () => void;
    onSave: (id: number, updates: any) => void;
}

const EditGameModal: React.FC<EditGameModalProps> = ({ game, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: game.name,
        description: game.description || '',
        year: game.year || new Date().getFullYear()
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(game.id, formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-dark-light rounded-lg p-6 max-w-lg w-full">
                <h3 className="text-xl font-bold mb-4">Edit Game</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="form-input w-full bg-dark border-gray-700"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="form-textarea w-full bg-dark border-gray-700"
                            rows={4}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Year</label>
                        <input
                            type="number"
                            value={formData.year}
                            onChange={e => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                            className="form-input w-full bg-dark border-gray-700"
                            min="1950"
                            max={new Date().getFullYear()}
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="submit"
                            className="btn bg-primary-500 hover:bg-primary-600 transition-colors flex-1"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn bg-gray-700 hover:bg-gray-600 transition-colors flex-1"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGameModal; 