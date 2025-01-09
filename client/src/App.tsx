import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import GameSearch from './components/GameSearch';
import GameCollection from './components/GameCollection';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-dark-darker text-white">
        <nav className="bg-dark p-4 shadow-lg mb-8">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold hover:text-primary-500 transition-colors">
              GameShelf
            </Link>
            <div className="flex gap-4">
              <Link 
                to="/search" 
                className="px-4 py-2 rounded-lg hover:bg-primary-500/20 transition-colors"
              >
                Search Games
              </Link>
              <Link 
                to="/collection" 
                className="px-4 py-2 rounded-lg hover:bg-primary-500/20 transition-colors"
              >
                My Collection
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<GameSearch />} />
            <Route path="/collection" element={<GameCollection />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
