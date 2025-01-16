# 🎮 GameShelf

GameShelf is a modern web application for tracking your video game collection, progress, and gaming achievements. Built with React, TypeScript, and GraphQL, it offers a seamless way to manage your gaming library.

## ✨ Features

- 📚 **Game Collection Management**: Track and organize your video games
- 📈 **Progress Tracking**: Monitor completion rates, playtime, and gaming status
- 🎮 **Steam Integration**: Import your Steam library automatically
- 🏆 **Competitive Game Stats**: Track ranks and competitive progress
- 🎯 **Rich Game Details**: View comprehensive game information from IGDB
- 📱 **Responsive Design**: Modern UI that works on desktop and mobile

### 🎖️ Supported Ranking Systems

#### 📊 Standard Ranks
- Iron
- Bronze (br)
- Silver (silv)
- Gold
- Platinum (plat)
- Diamond (dia)
- Ascendant
- Immortal (imm)
- Radiant (rad)
- Champion (champ)
- Grand Champion (gc)
- Master (mas)
- Grandmaster (gm)
- Legend (leg)

#### 🎯 Overwatch SR System
- Bronze (1-1499 SR)
- Silver (1500-1999 SR)
- Gold (2000-2499 SR)
- Platinum (2500-2999 SR)
- Diamond (3000-3499 SR)
- Master (3500-3999 SR)
- Grandmaster (4000-4899 SR)
- Top 500 (4900+ SR)

#### 📊 Letter Grade System
- S/S+ (Gold)
- A/A+ (Red)
- B/B+ (Purple)
- C/C+ (Blue)
- D/D+ (Green)
- F (Gray)

## 🛠️ Tech Stack

- 🌐 Frontend: React + TypeScript
- 🎨 Styling: TailwindCSS
- 💾 State Management: Apollo Client
- 📡 API: GraphQL with Hasura
- 🔒 Authentication: Custom auth system
- 🎮 Game Data: IGDB API
- 🚂 Steam Integration: Steam Web API

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/GameShelf-NodeJS.git
   cd GameShelf-NodeJS
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys and configuration values.

4. Start the development server:
   ```bash
   npm run dev
   ```

## ⚙️ Environment Variables

- `VITE_HASURA_GRAPHQL_URL`: Your Hasura GraphQL endpoint
- `VITE_HASURA_ADMIN_SECRET`: Hasura admin secret
- `VITE_IGDB_CLIENT_ID`: IGDB API client ID
- `VITE_IGDB_ACCESS_TOKEN`: IGDB API access token

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
