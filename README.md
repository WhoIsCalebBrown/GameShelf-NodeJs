# GameShelf

A modern web application for tracking and managing your video game collection. Built with React, TypeScript, and Hasura GraphQL.

## Features

- 🎮 Search and add games from IGDB database
- 📊 Track game completion status
- 📈 Visual statistics of your gaming progress
- 🖼️ Beautiful game cards with cover art
- 🔄 Real-time updates
- 📱 Responsive design

## Tech Stack

- **Frontend:**
  - React 18
  - TypeScript
  - Apollo Client
  - TailwindCSS
  - React Router

- **Backend:**
  - Node.js
  - Express
  - Hasura GraphQL
  - IGDB API

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- IGDB API credentials
- Hasura instance

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/GameShelf-NodeJS.git
cd GameShelf-NodeJS
```

2. Create `.env` files in both the root, client, and server directories using the provided templates:

```env
# server/.env
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_KEY=your_twitch_client_key
IGDB_ACCESS_SECRET=your_igdb_access_token

# client/.env
REACT_APP_HASURA_ENDPOINT=your_hasura_endpoint
REACT_APP_HASURA_ADMIN_KEY=your_hasura_admin_key
```

3. Install dependencies:
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

## Development

1. Start the development server:
```bash
# From the root directory
npm run dev
```

This will start both the client (React) and server (Node.js) in development mode.

- Client runs on: http://localhost:3000
- Server runs on: http://localhost:5000

## Building for Production

```bash
# Build the client
cd client && npm run build

# Build the server
cd ../server && npm run build
```

## Project Structure

```
GameShelf-NodeJS/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── types/        # TypeScript types
│   │   └── queries.ts    # GraphQL queries
│   └── public/
├── server/                # Node.js backend
│   └── src/
│       ├── routes/       # API routes
│       └── index.ts      # Server entry point
└── package.json          # Root package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [IGDB](https://www.igdb.com/) for their comprehensive video game database
- [Hasura](https://hasura.io/) for the GraphQL engine
- [TailwindCSS](https://tailwindcss.com/) for the styling system
