# 🎮 GameShelf

A modern web application to track your video game collection, progress, and competitive stats.

## ✨ Features

### 📚 Game Collection Management
- 🔍 Search and add games from IGDB database
- 📊 Track game status:
  - 🆕 Not Started
  - ▶️ In Progress
  - ✅ Completed
  - ⏸️ On Hold
  - 🛑 Dropped
  - 💫 Want to Play
- 🔥 View trending games
- 🗑️ Delete games from collection

### 📈 Progress Tracking
- ⏱️ Track playtime (hours and minutes)
- 📊 Track completion percentage
- 📝 Add personal notes
- 📅 Record last played date

### 🏆 Competitive Game Features
- 🎯 Toggle games as competitive
- 🏅 Track current and peak ranks
- 🎮 Supports various ranking systems:

#### 🎖️ Standard Ranks
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
- Supports shorthand: "t500", "top500"

#### 📊 Letter Grade System
- S/S+ (Gold)
- A/A+ (Red)
- B/B+ (Purple)
- C/C+ (Blue)
- D/D+ (Green)
- F (Gray)

## 🚀 Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/GameShelf-NodeJS.git
cd GameShelf-NodeJS
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install
cd ../
# Install client dependencies
cd client
npm install
cd ../
```

3. Set up environment variables
Create a `.env` file in the root directory with:
```env
IGDB_CLIENT_ID=your_igdb_client_id
IGDB_CLIENT_SECRET=your_igdb_client_secret
HASURA_ADMIN_SECRET=your_hasura_admin_secret
```

4. Start the development servers and the client
```bash
# Start the Node.js server
npm run dev

## 🛠️ Tech Stack
- 🌐 Frontend: React with TypeScript
- 🖥️ Backend: Node.js
- 💾 Database: PostgreSQL with Hasura GraphQL
- 🎮 Game Data: IGDB API
- 🎨 Styling: Tailwind CSS

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 🙏 Acknowledgments
- [IGDB](https://www.igdb.com/) for their comprehensive video game database
- [Hasura](https://hasura.io/) for the GraphQL engine
- [TailwindCSS](https://tailwindcss.com/) for the styling system
