# 🚀 Gugo Arena Backend Documentation

## 📋 Overview

Backend system for the Gugo Arena game that uses MongoDB to store player data, inventory, and game statistics.
## 🏗️ Architecture

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   └── Player.js            # Player data schema
├── routes/
│   └── players.js           # API endpoints
└── server.js                # Express server
```

## 🗄️ Database Schema

### Player Model
```javascript
{
  wallet: String,           // Wallet address (unique)
  coins: Number,            // Game currency (default: 1000)
  inventory: {
    weapons: [Item],         // Owned weapons
    skills: [Item],          // Owned skills  
    exclusive: [Item]        // Owned exclusive items
  },
  stats: {
    gamesPlayed: Number,     // Total games played
    wins: Number,           // Total wins
    losses: Number,         // Total losses
    totalScore: Number      // Total score
  },
  createdAt: Date,          // Account creation date
  lastLogin: Date           // Last login timestamp
}
```

### Item Schema
```javascript
{
  id: Number,               // Item ID
  name: String,             // Item name
  description: String,      // Item description
  image: String,            // Image URL (optional)
  emoji: String,            // Emoji fallback (optional)
  rarity: String,           // common, uncommon, rare, epic, legendary
  equipped: Boolean,        // Is currently equipped
  purchasedAt: Date         // Purchase timestamp
}
```

## 🔌 API Endpoints

### Base URL: `http://localhost:5000/api`

### 1. Health Check
```
GET /health
```
**Response:**
```json
{
  "message": "Gugo Arena Backend is running!"
}
```

### 2. Get Player Data
```
GET /players/:wallet
```
**Parameters:**
- `wallet`: Wallet address

**Response:**
```json
{
  "wallet": "0x123...",
  "coins": 1500,
  "inventory": {
    "weapons": [...],
    "skills": [...],
    "exclusive": [...]
  },
  "stats": {
    "gamesPlayed": 10,
    "wins": 7,
    "losses": 3,
    "totalScore": 2500
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": "2024-01-01T12:00:00.000Z"
}
```

### 3. Purchase Item
```
POST /players/:wallet/purchase
```
**Parameters:**
- `wallet`: Wallet address

**Body:**
```json
{
  "itemType": "weapons|skills|exclusive",
  "item": {
    "id": 1,
    "name": "Boomerang Master",
    "description": "Legendary boomerang",
    "price": 2000,
    "image": "https://...",
    "rarity": "legendary"
  }
}
```

**Response:** Updated player data

### 4. Equip/Unequip Item
```
PUT /players/:wallet/equip
```
**Parameters:**
- `wallet`: Wallet address

**Body:**
```json
{
  "itemType": "weapons|skills|exclusive",
  "itemId": 1,
  "equipped": true
}
```

**Response:** Updated player data

### 5. Update Player Stats
```
PUT /players/:wallet/stats
```
**Parameters:**
- `wallet`: Wallet address

**Body:**
```json
{
  "gamesPlayed": 15,
  "wins": 10,
  "losses": 5,
  "totalScore": 3000
}
```

**Response:** Updated player data

### 6. Add Coins (Deposit)
```
PUT /players/:wallet/add-coins
```
**Parameters:**
- `wallet`: Wallet address

**Body:**
```json
{
  "amount": 100
}
```

**Response:** Updated player data

## 🎮 Game Integration

### Default Items for New Players
Setiap pemain baru akan otomatis mendapatkan:
- **Classic Boomerang** (Common) - Equipped by default
- **Elite Boomerang** (Uncommon) - Unequipped

### Shop Items Available

#### Weapons (Boomerangs)
1. **Boomerang Master** (2000 coins) - Legendary
2. **Limited Boomerang** (1500 coins) - Epic
3. **Super Boomerang** (1200 coins) - Rare

#### Skills
1. **Water Skill** (800 coins) - Rare
2. **Fire Skill** (1000 coins) - Epic
3. **Lightning Skill** (1200 coins) - Legendary

#### Exclusive
1. **Dragon Armor** (3000 coins) - Legendary
2. **Phoenix Wings** (2500 coins) - Epic
3. **Crystal Crown** (4000 coins) - Legendary
4. **Shadow Cloak** (2800 coins) - Epic
5. **Golden Aura** (3500 coins) - Legendary
6. **Diamond Sword** (5000 coins) - Legendary

## 🔧 Setup & Installation

### 1. Install Dependencies
```bash
npm install express mongoose cors dotenv
npm install concurrently --save-dev
```

### 2. Environment Variables
Create `.env` file:
```env
MONGODB_URI=mongodb+srv://enyek7:Ferdika.77@cluster0.ayiycsa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
```

### 3. Run Development Server
```bash
# Run backend only
npm run server

# Run both frontend and backend
npm run dev
```

## 🚀 Production Deployment

### 1. Build Frontend
```bash
npm run build
```

### 2. Deploy Backend
```bash
# Install PM2 for process management
npm install -g pm2

# Start backend with PM2
pm2 start backend/server.js --name "gugo-arena-backend"

# Save PM2 configuration
pm2 save
```

## 🔍 Error Handling

### Common Error Responses

#### 400 - Bad Request
```json
{
  "message": "Insufficient coins"
}
```

#### 404 - Not Found
```json
{
  "message": "Player not found"
}
```

#### 500 - Server Error
```json
{
  "message": "Server error"
}
```

## 📊 Database Operations

### Create New Player
```javascript
const player = new Player({
  wallet: "0x123...",
  coins: 1000,
  inventory: {
    weapons: [defaultWeapons],
    skills: [],
    exclusive: []
  }
});
await player.save();
```

### Find Player
```javascript
const player = await Player.findOne({ wallet: "0x123..." });
```

### Update Player
```javascript
await Player.findOneAndUpdate(
  { wallet: "0x123..." },
  { $inc: { coins: 100 } }
);
```

## 🔐 Security Considerations

1. **Input Validation**: Semua input divalidasi sebelum disimpan
2. **Error Handling**: Comprehensive error handling untuk semua endpoints
3. **CORS**: Configured untuk frontend domain
4. **Rate Limiting**: Consider implementing rate limiting for production

## 📈 Performance Optimization

1. **Indexing**: MongoDB indexes on wallet address
2. **Connection Pooling**: Mongoose connection pooling
3. **Caching**: Consider Redis for frequently accessed data
4. **Compression**: Enable gzip compression

## 🧪 Testing

### Test API Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Get player data
curl http://localhost:5000/api/players/0x123...

# Purchase item
curl -X POST http://localhost:5000/api/players/0x123.../purchase \
  -H "Content-Type: application/json" \
  -d '{"itemType":"weapons","item":{"id":1,"name":"Test","price":100}}'
```

## 📝 Changelog

### v1.0.0
- ✅ Basic player management
- ✅ Inventory system
- ✅ Shop integration
- ✅ Equipment system
- ✅ Stats tracking
- ✅ MongoDB integration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

Untuk pertanyaan atau masalah teknis, silakan buat issue di repository atau hubungi tim development. 
