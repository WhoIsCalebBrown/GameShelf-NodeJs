import express from 'express';
import passport from 'passport';
import { Strategy as SteamStrategy } from 'passport-steam';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const router = express.Router();
const HASURA_ENDPOINT = process.env.REACT_APP_HASURA_ENDPOINT;
const HASURA_ADMIN_KEY = process.env.REACT_APP_HASURA_ADMIN_KEY;

if (!HASURA_ENDPOINT || !HASURA_ADMIN_KEY) {
    throw new Error('Missing required environment variables: REACT_APP_HASURA_ENDPOINT or REACT_APP_HASURA_ADMIN_KEY');
}

// Configure Steam Strategy
passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3001/auth/steam/return',
    realm: 'http://localhost:3001/',
    apiKey: process.env.STEAM_API_KEY as string
}, async (identifier: string, profile: any, done: any) => {
    try {
        const steamId = profile.id;
        const email = `steam_${steamId}@gameshelf.local`;

        // Check if user exists by email (which contains the Steam ID)
        const checkUserQuery = `
            query checkUser($email: String!) {
                users(where: {email: {_eq: $email}}) {
                    id
                    username
                    email
                    steam_id
                    created_at
                    updated_at
                }
            }
        `;

        const checkResponse = await fetch(HASURA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': HASURA_ADMIN_KEY
            },
            body: JSON.stringify({
                query: checkUserQuery,
                variables: { email }
            })
        });

        const checkData = await checkResponse.json();
        
        if (checkData.data.users.length > 0) {
            // User exists, return the user
            const existingUser = checkData.data.users[0];
            return done(null, existingUser);
        }

        // Create new user without a username (will be set later)
        const createUserMutation = `
            mutation createUser($email: String!, $username: String!, $steamId: String!) {
                insert_users_one(object: {
                    email: $email,
                    username: $username,
                    password_hash: "steam_auth",
                    steam_id: $steamId
                }) {
                    id
                    username
                    email
                    steam_id
                    created_at
                    updated_at
                }
            }
        `;

        const createResponse = await fetch(HASURA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': HASURA_ADMIN_KEY
            },
            body: JSON.stringify({
                query: createUserMutation,
                variables: { 
                    email,
                    username: `steam_${steamId}`,
                    steamId: steamId
                }
            })
        });

        const createData = await createResponse.json();
        
        if (createData.errors) {
            throw new Error(createData.errors[0].message);
        }

        const user = createData.data.insert_users_one;
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Session middleware
router.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport
router.use(passport.initialize());
router.use(passport.session());

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user: any, done) => {
    done(null, user);
});

// Route to initiate Steam authentication
router.get('/', passport.authenticate('steam'));

// Steam authentication callback route
router.get(
    '/return',
    passport.authenticate('steam', { failureRedirect: '/login' }),
    async (req: any, res) => {
        try {
            const user = req.user;
            // Extract Steam ID from email (format: steam_${steamId}@gameshelf.local)
            const steamId = user.email.split('_')[1].split('@')[0];
            
            // Create JWT token
            const token = jwt.sign(
                { 
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                    'https://hasura.io/jwt/claims': {
                        'x-hasura-allowed-roles': ['user'],
                        'x-hasura-default-role': 'user',
                        'x-hasura-user-id': user.id.toString()
                    }
                },
                process.env.JWT_SECRET || 'your-jwt-secret',
                { expiresIn: '7d' }
            );
            
            // Redirect to the frontend with the token and actual Steam ID
            res.redirect(`http://localhost:3000/steam-callback?token=${token}&steamId=${steamId}`);
        } catch (error) {
            console.error('Steam auth error:', error);
            res.redirect('http://localhost:3000/login?error=steam_auth_failed');
        }
    }
);

export default router; 