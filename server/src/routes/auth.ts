import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const HASURA_ENDPOINT = process.env.REACT_APP_HASURA_ENDPOINT;
const HASURA_ADMIN_KEY = process.env.REACT_APP_HASURA_ADMIN_KEY;

if (!HASURA_ENDPOINT || !HASURA_ADMIN_KEY) {
    throw new Error('Missing required environment variables: REACT_APP_HASURA_ENDPOINT or REACT_APP_HASURA_ADMIN_KEY');
}

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const checkUserQuery = `
            query checkUser($email: String!, $username: String!) {
                users(where: {_or: [{email: {_eq: $email}}, {username: {_eq: $username}}]}) {
                    id
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
                variables: { email, username }
            })
        });

        const checkData = await checkResponse.json();
        
        if (checkData.data.users.length > 0) {
            return res.status(400).json({
                error: 'User already exists with this email or username'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const createUserMutation = `
            mutation createUser($username: String!, $email: String!, $password_hash: String!) {
                insert_users_one(object: {
                    username: $username,
                    email: $email,
                    password_hash: $password_hash
                }) {
                    id
                    username
                    email
                    created_at
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
                variables: { username, email, password_hash: hashedPassword }
            })
        });

        const createData = await createResponse.json();
        
        if (createData.errors) {
            throw new Error(createData.errors[0].message);
        }

        const user = createData.data.insert_users_one;

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                username: user.username,
                'https://hasura.io/jwt/claims': {
                    'x-hasura-allowed-roles': ['user'],
                    'x-hasura-default-role': 'user',
                    'x-hasura-user-id': user.id.toString()
                }
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const findUserQuery = `
            query findUser($email: String!) {
                users(where: {email: {_eq: $email}}) {
                    id
                    username
                    email
                    password_hash
                    created_at
                }
            }
        `;

        const response = await fetch(HASURA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': HASURA_ADMIN_KEY
            },
            body: JSON.stringify({
                query: findUserQuery,
                variables: { email }
            })
        });

        const data = await response.json();
        const user = data.data.users[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                username: user.username,
                'https://hasura.io/jwt/claims': {
                    'x-hasura-allowed-roles': ['user'],
                    'x-hasura-default-role': 'user',
                    'x-hasura-user-id': user.id.toString()
                }
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        
        const findUserQuery = `
            query findUser($id: Int!) {
                users_by_pk(id: $id) {
                    id
                    username
                    email
                    created_at
                }
            }
        `;

        const response = await fetch(HASURA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': HASURA_ADMIN_KEY
            },
            body: JSON.stringify({
                query: findUserQuery,
                variables: { id: decoded.userId }
            })
        });

        const data = await response.json();
        const user = data.data.users_by_pk;

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router; 