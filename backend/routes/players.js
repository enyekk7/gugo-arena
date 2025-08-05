const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// Get player data or create new player
router.get('/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    let player = await Player.findOne({ wallet });

    if (!player) {
      // Create new player with default items
      player = new Player({
        wallet,
        coins: 1000,
        inventory: {
          weapons: [
            {
              id: 'classic-boomerang',
              name: 'Classic Boomerang',
              description: 'Basic boomerang for beginners',
              image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_030931-PRSl6bP4p0YDgecFpWmqd5NXb5NVQm.png?nX2b',
              emoji: '🪃',
              rarity: 'common',
              equipped: true,
              purchasedAt: new Date()
            }
          ],
          skills: [],
          exclusive: []
        },
        stats: {
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          totalScore: 0
        },
        transactions: []
      });
      await player.save();
    }

    res.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Failed to fetch player data' });
  }
});

// Purchase item
router.post('/:wallet/purchase', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { category, item, coinsSpent } = req.body;

    let player = await Player.findOne({ wallet });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Check if player has enough coins
    if (player.coins < coinsSpent) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }

    // Deduct coins
    player.coins -= coinsSpent;

    // Add item to inventory
    const inventoryItem = {
      ...item,
      equipped: false,
      purchasedAt: new Date()
    };

    if (!player.inventory[category]) {
      player.inventory[category] = [];
    }
    player.inventory[category].push(inventoryItem);

    // Log transaction
    const transaction = {
      type: 'purchase',
      itemId: item.id,
      itemName: item.name,
      category: category,
      coinsSpent: coinsSpent,
      timestamp: new Date(),
      balanceAfter: player.coins
    };

    if (!player.transactions) {
      player.transactions = [];
    }
    player.transactions.push(transaction);

    await player.save();

    console.log(`Transaction logged for wallet ${wallet}:`, transaction);

    res.json({
      success: true,
      player: player,
      transaction: transaction
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

// Add coins (for deposits)
router.put('/:wallet/add-coins', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { amount, ethAmount, txHash } = req.body;

    let player = await Player.findOne({ wallet });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Add coins
    player.coins += amount;

    // Log transaction
    const transaction = {
      type: 'deposit',
      coinsAdded: amount,
      ethAmount: ethAmount,
      txHash: txHash,
      timestamp: new Date(),
      balanceAfter: player.coins
    };

    if (!player.transactions) {
      player.transactions = [];
    }
    player.transactions.push(transaction);

    await player.save();

    console.log(`Deposit logged for wallet ${wallet}:`, transaction);

    res.json({
      success: true,
      player: player,
      transaction: transaction
    });
  } catch (error) {
    console.error('Error adding coins:', error);
    res.status(500).json({ error: 'Failed to add coins' });
  }
});

// Equip item
router.put('/:wallet/equip', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { category, itemId } = req.body;

    let player = await Player.findOne({ wallet });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Unequip all items in category
    if (player.inventory[category]) {
      player.inventory[category].forEach(item => {
        item.equipped = false;
      });
    }

    // Equip selected item
    const itemToEquip = player.inventory[category]?.find(item => item.id === itemId);
    if (itemToEquip) {
      itemToEquip.equipped = true;
    }

    await player.save();

    res.json({
      success: true,
      player: player
    });
  } catch (error) {
    console.error('Error equipping item:', error);
    res.status(500).json({ error: 'Failed to equip item' });
  }
});

// Update stats
router.put('/:wallet/stats', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { gamesPlayed, wins, losses, totalScore } = req.body;

    let player = await Player.findOne({ wallet });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    player.stats = {
      gamesPlayed: gamesPlayed || player.stats.gamesPlayed,
      wins: wins || player.stats.wins,
      losses: losses || player.stats.losses,
      totalScore: totalScore || player.stats.totalScore
    };

    await player.save();

    res.json({
      success: true,
      player: player
    });
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

// Get transaction history
router.get('/:wallet/transactions', async (req, res) => {
  try {
    const { wallet } = req.params;
    let player = await Player.findOne({ wallet });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({
      transactions: player.transactions || []
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router; 