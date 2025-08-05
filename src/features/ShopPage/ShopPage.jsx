import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import styles from './ShopPage.module.css';

const ShopPage = () => {
  const { address, isConnected } = useAccount();
  const [activeCategory, setActiveCategory] = useState('weapons');
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [playerCoins, setPlayerCoins] = useState(0);
  const [isLoadingCoins, setIsLoadingCoins] = useState(true);

  // Get wallet-specific localStorage key
  const getWalletKey = (key) => {
    return address ? `${key}_${address.toLowerCase()}` : key;
  };

  // Load player coins from backend
  const loadPlayerCoins = async () => {
    if (!address) return;
    
    setIsLoadingCoins(true);
    try {
      const response = await fetch(`http://localhost:5000/api/players/${address}`);
      if (response.ok) {
        const player = await response.json();
        setPlayerCoins(player.coins || 0);
        localStorage.setItem(getWalletKey('gameCoins'), (player.coins || 0).toString());
        console.log(`ShopPage: Loaded coins from backend: ${player.coins}`);
      } else {
        console.log('Backend not available, using localStorage fallback');
        const saved = localStorage.getItem(getWalletKey('gameCoins'));
        const coins = saved ? parseInt(saved, 10) : 1000; // Default to 1000 like ProfilePage
        setPlayerCoins(coins);
        console.log(`ShopPage: Loaded coins from localStorage: ${coins}`);
      }
    } catch (error) {
      console.log('Backend error, using localStorage fallback:', error);
      const saved = localStorage.getItem(getWalletKey('gameCoins'));
      const coins = saved ? parseInt(saved, 10) : 1000; // Default to 1000 like ProfilePage
      setPlayerCoins(coins);
      console.log(`ShopPage: Loaded coins from localStorage fallback: ${coins}`);
    } finally {
      setIsLoadingCoins(false);
    }
  };

  // Load coins when wallet changes
  useEffect(() => {
    if (address) {
      loadPlayerCoins();
    } else {
      setPlayerCoins(0);
    }
  }, [address]);

  // Listen for localStorage changes (when coins are updated in ProfilePage)
  useEffect(() => {
    const handleStorageChange = () => {
      if (!address) return;
      
      const saved = localStorage.getItem(getWalletKey('gameCoins'));
      if (saved) {
        const coins = parseInt(saved, 10);
        setPlayerCoins(coins);
        console.log(`ShopPage: Updated coins from localStorage: ${coins}`);
      }
    };

    // Also listen for custom events from ProfilePage
    const handleCustomStorageChange = (event) => {
      if (event.detail && event.detail.key === getWalletKey('gameCoins')) {
        const coins = parseInt(event.detail.value, 10);
        setPlayerCoins(coins);
        console.log(`ShopPage: Updated coins from custom event: ${coins}`);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, [address]);

  // Debug logging for wallet status
  useEffect(() => {
    console.log('ShopPage Wallet Status:', {
      isConnected,
      address,
      playerCoins,
      walletKey: getWalletKey('gameCoins'),
      localStorageValue: localStorage.getItem(getWalletKey('gameCoins')),
      ownedItemsKey: getWalletKey('ownedItems'),
      ownedItemsValue: localStorage.getItem(getWalletKey('ownedItems'))
    });
  }, [isConnected, address, playerCoins]);

  // Check if item is already owned
  const isItemOwned = (itemId, category) => {
    if (!address) return false;
    const saved = localStorage.getItem(getWalletKey('ownedItems'));
    if (!saved) return false;
    
    const ownedItems = JSON.parse(saved);
    if (!ownedItems[category]) return false;
    
    return ownedItems[category].some(item => item.id === itemId);
  };

  // Save item to inventory
  const saveItemToInventory = (item, category) => {
    if (!address) return;
    
    const saved = localStorage.getItem(getWalletKey('ownedItems'));
    const ownedItems = saved ? JSON.parse(saved) : { weapons: [], skills: [], exclusive: [] };
    
    if (!ownedItems[category]) {
      ownedItems[category] = [];
    }
    
    // Check if item already exists
    const existingIndex = ownedItems[category].findIndex(existing => existing.id === item.id);
    if (existingIndex === -1) {
      // Add complete item information
      const itemToSave = {
        ...item,
        category: category,
        purchasedAt: new Date().toISOString(),
        equipped: false // Default to not equipped
      };
      
      ownedItems[category].push(itemToSave);
      localStorage.setItem(getWalletKey('ownedItems'), JSON.stringify(ownedItems));
      console.log(`Saved ${item.name} to inventory with complete info:`, itemToSave);
    } else {
      console.log(`Item ${item.name} already exists in inventory`);
    }
  };

  const handleBuy = async (item) => {
    if (!address) {
      setPurchaseMessage('❌ Please connect your wallet first.');
      setTimeout(() => setPurchaseMessage(''), 3000);
      return;
    }

    // Check if already owned
    if (isItemOwned(item.id, activeCategory)) {
      setPurchaseMessage('❌ You already own this item!');
      setTimeout(() => setPurchaseMessage(''), 3000);
      return;
    }

    // For free items, skip coin check
    if (item.price > 0 && playerCoins < item.price) {
      setPurchaseMessage(`❌ Insufficient coins! You have ${playerCoins} coins but need ${item.price} coins. Please deposit more ETH in your profile.`);
      setTimeout(() => setPurchaseMessage(''), 5000);
      return;
    }

    setIsProcessing(true);
    setPurchaseMessage('⏳ Processing purchase...');

    try {
      // For free items, skip backend purchase recording
      if (item.price > 0) {
        // First, try to record purchase in backend if available
        let backendSuccess = false;
        try {
          const response = await fetch(`http://localhost:5000/api/players/${address}/purchase`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              category: activeCategory,
              item: item,
              coinsSpent: item.price
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Purchase recorded in backend:', result.transaction);
            
            // Update coins from backend response
            if (result.player && result.player.coins !== undefined) {
              setPlayerCoins(result.player.coins);
              localStorage.setItem(getWalletKey('gameCoins'), result.player.coins.toString());
              console.log(`Updated coins from backend: ${result.player.coins}`);
              backendSuccess = true;
            }
          }
        } catch (backendError) {
          console.log('Backend not available, using localStorage only:', backendError);
        }

        // If backend failed or not available, use localStorage
        if (!backendSuccess) {
          // Deduct coins from localStorage
          const newCoins = playerCoins - item.price;
          setPlayerCoins(newCoins);
          localStorage.setItem(getWalletKey('gameCoins'), newCoins.toString());
          console.log(`Deducted ${item.price} coins. New balance: ${newCoins}`);
        }
      }

      // Save item to inventory
      saveItemToInventory(item, activeCategory);
      
      // Dispatch custom event to notify other components
      const ownedItems = JSON.parse(localStorage.getItem(getWalletKey('ownedItems')) || '{}');
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: {
          key: getWalletKey('ownedItems'),
          value: JSON.stringify(ownedItems)
        }
      }));
      
      const message = item.price > 0 
        ? `✅ Successfully purchased ${item.name}! Check your inventory.`
        : `✅ Successfully obtained ${item.name}! Check your inventory.`;
      setPurchaseMessage(message);
      setTimeout(() => setPurchaseMessage(''), 3000);
      
    } catch (error) {
      console.error('Error purchasing item:', error);
      setPurchaseMessage(`❌ ${error.message || 'Failed to purchase item'}`);
      setTimeout(() => setPurchaseMessage(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const shopItems = {
    weapons: [
      {
        id: 'elite-boomerang',
        name: 'Elite Boomerang',
        price: 500,
        rarity: 'rare',
        image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_030931-PRSl6bP4p0YDgecFpWmqd5NXb5NVQm.png?nX2b',
        emoji: '🪃',
        description: 'Enhanced boomerang with improved damage'
      },
      {
        id: 'boomerang-master',
        name: 'Boomerang Master',
        price: 1000,
        rarity: 'epic',
        image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/7f72e5ed-ba42-42dc-abda-e7b1117cd4b3/20250804_185102-Ej10Eyu2veh2TDNgx6iY7qGzdOdRrX.png?G0dN',
        emoji: '🪃',
        description: 'Master-level boomerang with special abilities'
      },
      {
        id: 'limited-boomerang',
        name: 'Limited Boomerang',
        price: 1500,
        rarity: 'legendary',
        image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/7f72e5ed-ba42-42dc-abda-e7b1117cd4b3/20250804_185341-5nIKrItfsuALDmkgHN88BO2hz7vG42.png?03OI',
        emoji: '🪃',
        description: 'Limited edition boomerang with unique properties'
      },
      {
        id: 'super-boomerang',
        name: 'Super Boomerang',
        price: 2000,
        rarity: 'mythic',
        image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/7f72e5ed-ba42-42dc-abda-e7b1117cd4b3/20250804_185219-taWAkhLpycooG08RBhpFF6SJeQOnex.png?q4zB',
        emoji: '🪃',
        description: 'Super powerful boomerang with ultimate damage'
      }
    ],
    skills: [
      {
        id: 'water-skill',
        name: 'Water Skill',
        price: 800,
        rarity: 'rare',
        image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/7f72e5ed-ba42-42dc-abda-e7b1117cd4b3/20250804_185813-rOX0PQVpgruPQnveM7XTPHzSgrraZW.png?FwfB',
        emoji: '💧',
        description: 'Water-based special ability'
      },
      {
        id: 'fire-skill',
        name: 'Fire Skill',
        price: 1200,
        rarity: 'epic',
        image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/7f72e5ed-ba42-42dc-abda-e7b1117cd4b3/20250804_185849-zqB2PBx5qOYFMYlBVcNTJPLKK4rfNg.png?jQeE',
        emoji: '🔥',
        description: 'Fire-based special ability'
      },
      {
        id: 'lightning-skill',
        name: 'Lightning Skill',
        price: 1800,
        rarity: 'legendary',
        image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/7f72e5ed-ba42-42dc-abda-e7b1117cd4b3/20250804_185918-XGi1vI5H3qRGb1GRvhRBwWv89YjTQR.png?YVhI',
        emoji: '⚡',
        description: 'Lightning-based special ability'
      }
    ],
    exclusive: [
      {
        id: 'bearish',
        name: 'Bearish',
        price: 2500,
        rarity: 'exclusive',
        image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250805_061441-NWoBP5DdXrs2Hmam8vPdBIg4osVYXd.png?ZJr3',
        emoji: '🐻',
        description: 'Exclusive bear-themed item with unique properties'
      }
    ]
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#9ca3af';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      case 'mythic': return '#ef4444';
      case 'exclusive': return '#ff6b35';
      default: return '#9ca3af';
    }
  };

  if (!address) {
    return (
      <div className={styles.shopContainer}>
        <div className={styles.shopContent}>
          <div className={styles.shopHeader}>
            <h1>Shop</h1>
            <p>Please connect your wallet to access the shop.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shopContainer}>
      <div className={styles.shopContent}>
        {/* Coin Display */}
        {address && (
          <div className={styles.currencyDisplay}>
            <span className={styles.coinIcon}>💰</span>
            <span className={styles.coinAmount}>
              {isLoadingCoins ? 'Loading...' : playerCoins.toLocaleString()}
            </span>
          </div>
        )}

        <div className={styles.shopHeader}>
          <h1>Shop</h1>
          {address && (
            <div className={styles.walletInfo}>
              <span>Wallet: {address.slice(0, 6)}...{address.slice(-4)}</span>
              <button 
                onClick={loadPlayerCoins}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  marginLeft: '10px',
                  cursor: 'pointer'
                }}
              >
                Refresh Coins
              </button>
            </div>
          )}
        </div>

        <div className={styles.categories}>
          <button
            className={`${styles.categoryButton} ${activeCategory === 'weapons' ? styles.active : ''}`}
            onClick={() => setActiveCategory('weapons')}
          >
            Weapons
          </button>
          <button
            className={`${styles.categoryButton} ${activeCategory === 'skills' ? styles.active : ''}`}
            onClick={() => setActiveCategory('skills')}
          >
            Skills
          </button>
          <button
            className={`${styles.categoryButton} ${activeCategory === 'exclusive' ? styles.active : ''}`}
            onClick={() => setActiveCategory('exclusive')}
          >
            Exclusive
          </button>
        </div>

        {purchaseMessage && (
          <div className={styles.purchaseMessage}>
            {purchaseMessage}
          </div>
        )}

        <div className={styles.itemsGrid}>
          {shopItems[activeCategory].length === 0 ? (
            <div className={styles.emptyCategory}>
              <p>No items available in this category.</p>
            </div>
          ) : (
            shopItems[activeCategory].map((item) => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemImage}>
                  <img src={item.image} alt={item.name} />
                  <div 
                    className={styles.itemRarity}
                    style={{ backgroundColor: getRarityColor(item.rarity) }}
                  >
                    {item.rarity.toUpperCase()}
                  </div>
                </div>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemDescription}>{item.description}</p>
                  <div className={styles.itemPrice}>
                    <span>{item.price === 0 ? '🆓 FREE' : `💰 ${item.price} coins`}</span>
                  </div>
                  <button
                    className={`${styles.buyButton} ${isItemOwned(item.id, activeCategory) ? styles.owned : ''}`}
                    onClick={() => handleBuy(item)}
                    disabled={isProcessing || isItemOwned(item.id, activeCategory)}
                  >
                    {isProcessing ? '⏳ Processing...' : 
                     isItemOwned(item.id, activeCategory) ? '✅ Owned' : 
                     item.price === 0 ? 'Get Free' : 'Buy'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;