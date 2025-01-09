// Load environment variables from root .env
const config = {
    HASURA_ENDPOINT: process.env.REACT_APP_HASURA_ENDPOINT,
    HASURA_ADMIN_KEY: process.env.REACT_APP_HASURA_ADMIN_KEY,
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    IGDB_ACCESS_SECRET: process.env.IGDB_ACCESS_SECRET
};

export default config; 