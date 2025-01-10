-- Create enum for game status
CREATE TYPE game_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    igdb_id INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    summary TEXT,
    cover_url TEXT,
    first_release_date TIMESTAMP WITH TIME ZONE,
    slug TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_progress table for tracking user progress
CREATE TABLE game_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    status game_status DEFAULT 'NOT_STARTED',
    playtime_minutes INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
    last_played_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_games_igdb_id ON games(igdb_id);
CREATE INDEX idx_game_progress_user_id ON game_progress(user_id);
CREATE INDEX idx_game_progress_game_id ON game_progress(game_id);
CREATE INDEX idx_game_progress_status ON game_progress(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_progress_updated_at
    BEFORE UPDATE ON game_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 