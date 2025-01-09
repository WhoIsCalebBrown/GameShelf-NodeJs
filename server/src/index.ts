import express from 'express';
import dotenv from 'dotenv';
import igdbRoutes from './routes/igdb';

dotenv.config();

// Debug log to verify environment variables
console.log('Environment Check:', {
    clientId: process.env.TWITCH_CLIENT_ID ? 'Set' : 'Not Set',
    accessToken: process.env.IGDB_ACCESS_SECRET ? 'Set' : 'Not Set'
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// IGDB routes
app.use('/api/igdb', igdbRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 