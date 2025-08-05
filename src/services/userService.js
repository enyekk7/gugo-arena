import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  increment,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection name for users
const USERS_COLLECTION = 'users';

/**
 * Get user data by wallet address
 * @param {string} walletAddress - The wallet address of the user
 * @returns {Promise<Object|null>} User data or null if not found
 */
export const getUserByWallet = async (walletAddress) => {
  try {
    const userDoc = doc(db, USERS_COLLECTION, walletAddress);
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      return {
        id: userSnapshot.id,
        ...userSnapshot.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by wallet:', error);
    throw error;
  }
};

/**
 * Create or initialize user data
 * @param {string} walletAddress - The wallet address of the user
 * @returns {Promise<Object>} Created user data
 */
export const createUser = async (walletAddress) => {
  try {
    const userData = {
      wallet: walletAddress,
      coins: 0,
      inventory: {
        skins: [],
        weapons: {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const userDoc = doc(db, USERS_COLLECTION, walletAddress);
    await setDoc(userDoc, userData);
    
    console.log('User created successfully:', walletAddress);
    return userData;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Get or create user data
 * @param {string} walletAddress - The wallet address of the user
 * @returns {Promise<Object>} User data
 */
export const getOrCreateUser = async (walletAddress) => {
  try {
    let user = await getUserByWallet(walletAddress);
    
    if (!user) {
      user = await createUser(walletAddress);
    }
    
    return user;
  } catch (error) {
    console.error('Error getting or creating user:', error);
    throw error;
  }
};

/**
 * Update user coins
 * @param {string} walletAddress - The wallet address of the user
 * @param {number} amount - Amount to add/subtract (use negative for subtraction)
 * @returns {Promise<void>}
 */
export const updateUserCoins = async (walletAddress, amount) => {
  try {
    const userDoc = doc(db, USERS_COLLECTION, walletAddress);
    await updateDoc(userDoc, {
      coins: increment(amount),
      updatedAt: new Date()
    });
    
    console.log(`Updated coins for ${walletAddress}: ${amount}`);
  } catch (error) {
    console.error('Error updating user coins:', error);
    throw error;
  }
};

/**
 * Add skin to user inventory
 * @param {string} walletAddress - The wallet address of the user
 * @param {string} skinId - The skin ID to add
 * @returns {Promise<void>}
 */
export const addSkinToInventory = async (walletAddress, skinId) => {
  try {
    const userDoc = doc(db, USERS_COLLECTION, walletAddress);
    await updateDoc(userDoc, {
      'inventory.skins': arrayUnion(skinId),
      updatedAt: new Date()
    });
    
    console.log(`Added skin ${skinId} to ${walletAddress}`);
  } catch (error) {
    console.error('Error adding skin to inventory:', error);
    throw error;
  }
};

/**
 * Add weapon to user inventory
 * @param {string} walletAddress - The wallet address of the user
 * @param {string} weaponName - The weapon name
 * @param {number} quantity - Quantity to add (default: 1)
 * @returns {Promise<void>}
 */
export const addWeaponToInventory = async (walletAddress, weaponName, quantity = 1) => {
  try {
    const userDoc = doc(db, USERS_COLLECTION, walletAddress);
    
    // Get current user data to check existing weapon quantity
    const userSnapshot = await getDoc(userDoc);
    const userData = userSnapshot.data();
    const currentQuantity = userData.inventory.weapons[weaponName] || 0;
    const newQuantity = currentQuantity + quantity;
    
    await updateDoc(userDoc, {
      [`inventory.weapons.${weaponName}`]: newQuantity,
      updatedAt: new Date()
    });
    
    console.log(`Added weapon ${weaponName} (${quantity}) to ${walletAddress}. Total: ${newQuantity}`);
  } catch (error) {
    console.error('Error adding weapon to inventory:', error);
    throw error;
  }
};

/**
 * Get user inventory
 * @param {string} walletAddress - The wallet address of the user
 * @returns {Promise<Object>} User inventory
 */
export const getUserInventory = async (walletAddress) => {
  try {
    const user = await getUserByWallet(walletAddress);
    return user ? user.inventory : null;
  } catch (error) {
    console.error('Error getting user inventory:', error);
    throw error;
  }
};

/**
 * Check if user has enough coins
 * @param {string} walletAddress - The wallet address of the user
 * @param {number} requiredCoins - Required coins amount
 * @returns {Promise<boolean>} True if user has enough coins
 */
export const hasEnoughCoins = async (walletAddress, requiredCoins) => {
  try {
    const user = await getUserByWallet(walletAddress);
    return user && user.coins >= requiredCoins;
  } catch (error) {
    console.error('Error checking coins:', error);
    throw error;
  }
}; 