const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  wallet: {
    type: String,
    required: true,
    unique: true
  },
  coins: {
    type: Number,
    default: 1000
  },
  inventory: {
    weapons: [{
      id: String,
      name: String,
      description: String,
      image: String,
      emoji: String,
      rarity: String,
      equipped: {
        type: Boolean,
        default: false
      },
      purchasedAt: {
        type: Date,
        default: Date.now
      }
    }],
    skills: [{
      id: String,
      name: String,
      description: String,
      image: String,
      emoji: String,
      rarity: String,
      equipped: {
        type: Boolean,
        default: false
      },
      purchasedAt: {
        type: Date,
        default: Date.now
      }
    }],
    exclusive: [{
      id: String,
      name: String,
      description: String,
      image: String,
      emoji: String,
      rarity: String,
      equipped: {
        type: Boolean,
        default: false
      },
      purchasedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  stats: {
    gamesPlayed: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    },
    totalScore: {
      type: Number,
      default: 0
    }
  },
  transactions: [{
    type: {
      type: String,
      enum: ['purchase', 'deposit'],
      required: true
    },
    itemId: String,
    itemName: String,
    category: String,
    coinsSpent: Number,
    coinsAdded: Number,
    ethAmount: String,
    txHash: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    balanceAfter: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Player', playerSchema); 