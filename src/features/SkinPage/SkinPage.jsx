import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import styles from './SkinPage.module.css';

const SkinPage = () => {
  const { address, isConnected } = useAccount();
  const [activeCategory, setActiveCategory] = useState('weapons');
  const [equippedItems, setEquippedItems] = useState({
    weapons: null,
    skills: null,
    exclusive: null
  });

  // Get wallet-specific localStorage keys
  const getWalletKey = (baseKey) => {
    return address ? `${baseKey}_${address.toLowerCase()}` : baseKey;
  };

  // Load owned items from localStorage
  const [ownedItems, setOwnedItems] = useState(() => {
    if (!address) {
      return {
        weapons: [
          {
            id: 'classic-boomerang',
            name: 'Classic Boomerang',
            description: 'Basic boomerang for beginners',
            rarity: 'common',
            equipped: true,
            image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_030931-PRSl6bP4p0YDgecFpWmqd5NXb5NVQm.png?nX2b',
            emoji: '🪃',
            category: 'weapons',
            purchasedAt: new Date().toISOString()
          }
        ],
        skills: [],
        exclusive: []
      };
    }

    const stored = localStorage.getItem(getWalletKey('ownedItems'));
    if (stored) {
      try {
        const items = JSON.parse(stored);
        // Ensure all categories exist
        const defaultStructure = {
          weapons: [],
          skills: [],
          exclusive: []
        };
        
        const mergedItems = {
          ...defaultStructure,
          ...items
        };
        
        // Ensure at least one weapon is equipped
        if (mergedItems.weapons && mergedItems.weapons.length > 0) {
          const hasEquipped = mergedItems.weapons.some(item => item.equipped);
          if (!hasEquipped) {
            mergedItems.weapons[0].equipped = true;
          }
        }
        
        // Ensure Gugo character is available for all players
        if (!mergedItems.exclusive || mergedItems.exclusive.length === 0) {
          mergedItems.exclusive = [
            {
              id: 'gugo',
              name: 'Gugo',
              description: 'Default character - Free for all players',
              rarity: 'exclusive',
              equipped: true,
              image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/Desain%20tanpa%20judul_20250803_014925_0000-WPPV0YMrVOIEiPDMKIxVqClvm15qqg.png?eJOn',
              emoji: '👤',
              category: 'exclusive',
              purchasedAt: new Date().toISOString()
            }
          ];
        } else {
          // Check if Gugo exists, if not add it
          const hasGugo = mergedItems.exclusive.some(item => item.id === 'gugo');
          if (!hasGugo) {
            mergedItems.exclusive.push({
              id: 'gugo',
              name: 'Gugo',
              description: 'Default character - Free for all players',
              rarity: 'exclusive',
              equipped: false,
              image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/Desain%20tanpa%20judul_20250803_014925_0000-WPPV0YMrVOIEiPDMKIxVqClvm15qqg.png?eJOn',
              emoji: '👤',
              category: 'exclusive',
              purchasedAt: new Date().toISOString()
            });
          }
        }
        
        return mergedItems;
      } catch (error) {
        console.error('Error parsing ownedItems:', error);
      }
    }
    
    // Default items for new account
    return {
      weapons: [
        {
          id: 'classic-boomerang',
          name: 'Classic Boomerang',
          description: 'Basic boomerang for beginners',
          rarity: 'common',
          equipped: true,
          image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_030931-PRSl6bP4p0YDgecFpWmqd5NXb5NVQm.png?nX2b',
          emoji: '🪃',
          category: 'weapons',
          purchasedAt: new Date().toISOString()
        }
      ],
      skills: [],
      exclusive: [
        {
          id: 'gugo',
          name: 'Gugo',
          description: 'Default character - Free for all players',
          rarity: 'exclusive',
          equipped: true,
          image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/Desain%20tanpa%20judul_20250803_014925_0000-WPPV0YMrVOIEiPDMKIxVqClvm15qqg.png?eJOn',
          emoji: '👤',
          category: 'exclusive',
          purchasedAt: new Date().toISOString()
        }
      ]
    };
  });

  // Save owned items to localStorage whenever it changes
  useEffect(() => {
    if (address) {
      localStorage.setItem(getWalletKey('ownedItems'), JSON.stringify(ownedItems));
      console.log(`Saved ownedItems for wallet ${address}:`, ownedItems);
    }
  }, [ownedItems, address]);

  // Update equipped items state when ownedItems changes
  useEffect(() => {
    const newEquippedItems = {
      weapons: ownedItems.weapons?.find(item => item.equipped)?.id || null,
      skills: ownedItems.skills?.find(item => item.equipped)?.id || null,
      exclusive: ownedItems.exclusive?.find(item => item.equipped)?.id || null
    };
    setEquippedItems(newEquippedItems);
    console.log('Updated equipped items:', newEquippedItems);
  }, [ownedItems]);

  // Listen for changes in localStorage (when items are purchased)
  useEffect(() => {
    const handleStorageChange = () => {
      if (!address) return;
      
      const stored = localStorage.getItem(getWalletKey('ownedItems'));
      if (stored) {
        try {
          const items = JSON.parse(stored);
          setOwnedItems(items);
          console.log('SkinPage: Updated inventory from localStorage:', items);
        } catch (error) {
          console.error('Error parsing ownedItems from storage:', error);
        }
      }
    };

    // Also listen for custom events from ShopPage
    const handleCustomStorageChange = (event) => {
      if (event.detail && event.detail.key === getWalletKey('ownedItems')) {
        try {
          const items = JSON.parse(event.detail.value);
          setOwnedItems(items);
          console.log('SkinPage: Updated inventory from custom event:', items);
        } catch (error) {
          console.error('Error parsing ownedItems from custom event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, [address]);

  // Reset data when wallet changes
  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(getWalletKey('ownedItems'));
      if (stored) {
        try {
          const items = JSON.parse(stored);
          setOwnedItems(items);
        } catch (error) {
          console.error('Error parsing ownedItems for new wallet:', error);
          // Set default items for new wallet
          setOwnedItems({
            weapons: [
              {
                id: 'classic-boomerang',
                name: 'Classic Boomerang',
                description: 'Basic boomerang for beginners',
                rarity: 'common',
                equipped: true,
                image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_030931-PRSl6bP4p0YDgecFpWmqd5NXb5NVQm.png?nX2b',
                emoji: '🪃',
                category: 'weapons',
                purchasedAt: new Date().toISOString()
              }
            ],
            skills: [],
            exclusive: []
          });
        }
      } else {
        // New wallet, set default items
        setOwnedItems({
          weapons: [
            {
              id: 'classic-boomerang',
              name: 'Classic Boomerang',
              description: 'Basic boomerang for beginners',
              rarity: 'common',
              equipped: true,
              image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_030931-PRSl6bP4p0YDgecFpWmqd5NXb5NVQm.png?nX2b',
              emoji: '🪃',
              category: 'weapons',
              purchasedAt: new Date().toISOString()
            }
          ],
          skills: [],
          exclusive: []
        });
      }
    }
  }, [address]);

  const handleEquip = (itemId, category) => {
    console.log(`Equipping ${itemId} in ${category}`);
    
    setOwnedItems(prev => {
      // Ensure the category exists and is an array
      if (!prev[category] || !Array.isArray(prev[category])) {
        console.warn(`Category ${category} is not available or not an array`);
        return prev;
      }
      
      const updated = {
        ...prev,
        [category]: prev[category].map(item => ({
          ...item,
          equipped: item.id === itemId
        }))
      };
      
      console.log('Updated ownedItems:', updated);
      
      // Dispatch custom event to notify GamePage about equipment change
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: {
          key: getWalletKey('ownedItems'),
          value: JSON.stringify(updated)
        }
      }));
      
      return updated;
    });
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#9ca3af';
      case 'uncommon': return '#22c55e';
      case 'rare': return '#3b82f6';
      case 'epic': return '#a855f7';
      case 'legendary': return '#f59e0b';
      case 'exclusive': return '#ff6b35';
      default: return '#9ca3af';
    }
  };

  const getRarityText = (rarity) => {
    switch (rarity) {
      case 'common': return 'Common';
      case 'uncommon': return 'Uncommon';
      case 'rare': return 'Rare';
      case 'epic': return 'Epic';
      case 'legendary': return 'Legendary';
      case 'exclusive': return 'Exclusive';
      default: return 'Common';
    }
  };

  // Get category display name
  const getCategoryDisplayName = (category) => {
    switch (category) {
      case 'weapons': return 'Weapons';
      case 'skills': return 'Skills';
      case 'exclusive': return 'Exclusive';
      default: return category;
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'weapons': return '🪃';
      case 'skills': return '⚡';
      case 'exclusive': return '👑';
      default: return '🎯';
    }
  };

  return (
    <div className={styles.skinContainer}>
      <div className={styles.skinContent}>
        <div className={styles.skinHeader}>
          <h1>🎒 Inventory</h1>
          <p>Manage your owned weapons, skills, and exclusive items</p>
          {address && (
            <div className={styles.walletInfo}>
              <span>Wallet: {address.slice(0, 6)}...{address.slice(-4)}</span>
            </div>
          )}
        </div>

        <div className={styles.categories}>
          <button
            className={`${styles.categoryButton} ${activeCategory === 'weapons' ? styles.active : ''}`}
            onClick={() => setActiveCategory('weapons')}
          >
            ⚔️ Weapons ({ownedItems.weapons?.length || 0})
          </button>
          <button
            className={`${styles.categoryButton} ${activeCategory === 'skills' ? styles.active : ''}`}
            onClick={() => setActiveCategory('skills')}
          >
            🎯 Skills ({ownedItems.skills?.length || 0})
          </button>
          <button
            className={`${styles.categoryButton} ${activeCategory === 'exclusive' ? styles.active : ''}`}
            onClick={() => setActiveCategory('exclusive')}
          >
            👑 Exclusive ({ownedItems.exclusive?.length || 0})
          </button>
        </div>

        <div className={styles.itemsGrid}>
          {(!ownedItems[activeCategory] || !Array.isArray(ownedItems[activeCategory]) || ownedItems[activeCategory].length === 0) ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>{getCategoryIcon(activeCategory)}</div>
              <h3>No {getCategoryDisplayName(activeCategory)} owned</h3>
              <p>Purchase items from the shop to see them here</p>
            </div>
          ) : (
            ownedItems[activeCategory].map((item) => (
              <div 
                key={item.id} 
                className={`${styles.itemCard} ${item.equipped ? styles.equipped : ''}`}
              >
                <div className={styles.itemImageContainer}>
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className={styles.itemImage}
                      onError={(e) => {
                        console.log(`Failed to load image for ${item.name}:`, e.target.src);
                        e.target.style.display = 'none';
                        const emojiElement = e.target.nextSibling;
                        if (emojiElement) {
                          emojiElement.style.display = 'block';
                        }
                      }}
                      onLoad={(e) => {
                        console.log(`Successfully loaded image for ${item.name}:`, e.target.src);
                        const emojiElement = e.target.nextSibling;
                        if (emojiElement) {
                          emojiElement.style.display = 'none';
                        }
                      }}
                    />
                  ) : null}
                  <div className={styles.itemEmoji} style={{ display: item.image ? 'none' : 'block' }}>
                    {item.emoji || getCategoryIcon(activeCategory)}
                  </div>
                </div>
                
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemDescription}>{item.description}</div>
                  
                  <div 
                    className={styles.itemRarity}
                    style={{ color: getRarityColor(item.rarity) }}
                  >
                    {getRarityText(item.rarity)}
                  </div>

                  {item.purchasedAt && (
                    <div className={styles.itemDate}>
                      Purchased: {new Date(item.purchasedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className={styles.itemStatus}>
                  {item.equipped ? (
                    <span className={styles.equippedBadge}>✓ Equipped</span>
                  ) : (
                    <button
                      className={styles.equipButton}
                      onClick={() => handleEquip(item.id, activeCategory)}
                    >
                      Equip
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SkinPage; 