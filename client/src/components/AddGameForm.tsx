import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_GAME, GET_DATA } from '../gql/queries.ts';

interface AddGameFormProps {
  onSuccess?: () => void;
}

const AddGameForm: React.FC<AddGameFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [igdbId, setIgdbId] = useState('');
  const [message, setMessage] = useState('');

  const [addGame] = useMutation(ADD_GAME, {
    refetchQueries: [{ query: GET_DATA }],
    onCompleted: () => {
      setName('');
      setDescription('');
      setYear('');
      setIgdbId('');
      setMessage('Game added successfully!');
      setTimeout(() => {
        setMessage('');
        onSuccess?.();
      }, 1500);
    },
    onError: (error) => {
      setMessage(`Error: ${error.message}`);
    }
  });

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !year.trim() || !igdbId.trim()) {
      setMessage('Please fill in all fields');
      return;
    }
    const yearInt = parseInt(year);
    const igdbIdInt = parseInt(igdbId);
    
    if (isNaN(yearInt) || yearInt < 1950 || yearInt > new Date().getFullYear()) {
      setMessage('Please enter a valid year between 1950 and present');
      return;
    }

    if (isNaN(igdbIdInt) || igdbIdInt < 1) {
      setMessage('Please enter a valid IGDB ID (positive number)');
      return;
    }

    const slug = generateSlug(name);
    
    addGame({ 
      variables: { 
        name, 
        description, 
        year: yearInt,
        igdb_id: igdbIdInt,
        slug
      } 
    });
  };

  return (
    <div className="p-6 text-left">
      <h2 className="text-2xl font-bold mb-6 text-center">Add New Game</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="name" className="form-label">
            Game Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter game name"
            className="form-input"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="year" className="form-label">
            Release Year:
          </label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Enter release year (e.g., 2023)"
            min="1950"
            max={new Date().getFullYear()}
            className="form-input"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="igdbId" className="form-label">
            IGDB ID:
          </label>
          <input
            type="number"
            id="igdbId"
            value={igdbId}
            onChange={(e) => setIgdbId(e.target.value)}
            placeholder="Enter IGDB ID (e.g., 1234)"
            min="1"
            className="form-input"
          />
          <small className="block mt-2 text-sm text-text-secondary">
            You can find the IGDB ID by searching for the game on{' '}
            <a 
              href="https://www.igdb.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              IGDB.com
            </a>
          </small>
        </div>
        <div className="mb-6">
          <label htmlFor="description" className="form-label">
            Description:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter game description"
            className="form-input min-h-[100px] resize-y"
          />
        </div>
        <button type="submit" className="btn btn-full">
          Add Game
        </button>
      </form>
      {message && (
        <div 
          className={`mt-4 p-4 rounded text-center ${
            message.includes('Error') 
              ? 'bg-red-500/10 text-red-500' 
              : 'bg-green-500/10 text-green-500'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default AddGameForm; 