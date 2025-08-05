import { useState, useEffect } from 'react';
import { getOrCreateUser, getUserByWallet } from '../services/userService';

/**
 * Custom hook to manage wallet address and user data
 * @returns {Object} Wallet and user management functions and state
 */
export const useWallet = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Set wallet address and load user data
   * @param {string} address - The wallet address
   */
  const setWallet = async (address) => {
    if (!address) {
      setWalletAddress(null);
      setUserData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Setting wallet address:', address);
      setWalletAddress(address);

      // Get or create user data
      const user = await getOrCreateUser(address);
      setUserData(user);
      
      console.log('User data loaded:', user);
    } catch (err) {
      console.error('Error setting wallet:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh user data from Firebase
   */
  const refreshUserData = async () => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);

    try {
      const user = await getUserByWallet(walletAddress);
      setUserData(user);
      console.log('User data refreshed:', user);
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear wallet and user data
   */
  const clearWallet = () => {
    setWalletAddress(null);
    setUserData(null);
    setError(null);
  };

  // Load wallet address from localStorage on mount
  useEffect(() => {
    const storedWallet = localStorage.getItem('walletAddress');
    if (storedWallet) {
      setWallet(storedWallet);
    }
  }, []);

  // Save wallet address to localStorage when it changes
  useEffect(() => {
    if (walletAddress) {
      localStorage.setItem('walletAddress', walletAddress);
    } else {
      localStorage.removeItem('walletAddress');
    }
  }, [walletAddress]);

  return {
    walletAddress,
    userData,
    loading,
    error,
    setWallet,
    refreshUserData,
    clearWallet
  };
}; 