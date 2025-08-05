const API_BASE_URL = 'http://localhost:5000/api';

export const playerService = {
  // Get player data by wallet address
  async getPlayer(wallet) {
    try {
      const response = await fetch(`${API_BASE_URL}/players/${wallet}`);
      if (!response.ok) {
        throw new Error('Failed to fetch player data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching player:', error);
      throw error;
    }
  },

  // Purchase item
  async purchaseItem(wallet, itemType, item) {
    try {
      const response = await fetch(`${API_BASE_URL}/players/${wallet}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemType, item }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to purchase item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error purchasing item:', error);
      throw error;
    }
  },

  // Equip/Unequip item
  async equipItem(wallet, itemType, itemId, equipped) {
    try {
      const response = await fetch(`${API_BASE_URL}/players/${wallet}/equip`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemType, itemId, equipped }),
      });

      if (!response.ok) {
        throw new Error('Failed to equip item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error equipping item:', error);
      throw error;
    }
  },

  // Update player stats
  async updateStats(wallet, stats) {
    try {
      const response = await fetch(`${API_BASE_URL}/players/${wallet}/stats`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stats),
      });

      if (!response.ok) {
        throw new Error('Failed to update stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating stats:', error);
      throw error;
    }
  },

  // Add coins (for deposit)
  async addCoins(wallet, amount) {
    try {
      const response = await fetch(`${API_BASE_URL}/players/${wallet}/add-coins`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error('Failed to add coins');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding coins:', error);
      throw error;
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}; 