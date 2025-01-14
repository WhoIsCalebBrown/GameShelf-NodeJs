import React from 'react';
import { Link } from 'react-router-dom';
import DataComponent from './DataComponent.tsx';
import GameStats from './GameStats';
import GameSearch from './GameSearch';

const games: React.FC = () => {
  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <Link to="/" className="text-primary hover:underline mr-8">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold">Your games Collection</h1>
      </div>
      
      <div className="mb-8">
        <GameSearch />
      </div>
      <div className="mb-8">
        <GameStats games={[]} />
      </div>

      <div className="mt-8">
        <DataComponent />
      </div>
    </div>
  );
};

export default games; 