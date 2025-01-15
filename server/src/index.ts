import path from 'path';
import dotenv from 'dotenv';

// Load environment variables before any other imports
dotenv.config();

import express from 'express';
import igdbRoutes from './routes/igdb';
import authRoutes from './routes/auth';
import steamRoutes from './routes/auth/steam';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Routes
app.use('/api/igdb', igdbRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/steam', steamRoutes);

// Steam Authentication routes
app.use('/auth/steam', steamRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    // Debug log to verify environment variables
    console.log('Environment Check:', {
        hasuraEndpoint: process.env.REACT_APP_HASURA_ENDPOINT ? 'Set' : 'Not Set',
        hasuraAdminKey: process.env.REACT_APP_HASURA_ADMIN_KEY ? 'Set' : 'Not Set',
        steamApiKey: process.env.STEAM_API_KEY ? 'Set' : 'Not Set'
    });
}); 