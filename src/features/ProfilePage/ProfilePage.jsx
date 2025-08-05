import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useGlobalWalletSignerAccount, useLoginWithAbstract, useAbstractClient } from '@abstract-foundation/agw-react';
import { parseEther } from 'viem/utils';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const signer = useGlobalWalletSignerAccount();
  const { login } = useLoginWithAbstract();
  const { data: client } = useAbstractClient();
  
  // Get wallet-specific localStorage keys
  const getWalletKey = (baseKey) => {
    return address ? `${baseKey}_${address.toLowerCase()}` : baseKey;
  };
  
  const [gameCoins, setGameCoins] = useState(() => {
    const saved = localStorage.getItem(getWalletKey('gameCoins'));
    return saved ? parseInt(saved, 10) : 1000;
  });
  
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedDepositOption, setSelectedDepositOption] = useState(null);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositMessage, setDepositMessage] = useState('');
  const [isAccountLoading, setIsAccountLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Save game coins to localStorage whenever it changes
  useEffect(() => {
    if (address && gameCoins !== undefined) {
      localStorage.setItem(getWalletKey('gameCoins'), gameCoins.toString());
      console.log(`ProfilePage: Saved coins for wallet ${address}: ${gameCoins}`);
    }
  }, [gameCoins, address]);

  // Reset data when wallet changes
  useEffect(() => {
    if (address) {
      // Load coins for this specific wallet
      const saved = localStorage.getItem(getWalletKey('gameCoins'));
      if (saved) {
        const coins = parseInt(saved, 10);
        setGameCoins(coins);
        console.log(`ProfilePage: Loaded coins for wallet ${address}: ${coins}`);
      } else {
        // New wallet, set default coins
        setGameCoins(1000);
        localStorage.setItem(getWalletKey('gameCoins'), '1000');
        console.log(`ProfilePage: Set default coins for new wallet ${address}: 1000`);
      }
    }
  }, [address]);

  // Load coins from backend when wallet changes
  useEffect(() => {
    const loadCoinsFromBackend = async () => {
      if (address) {
        try {
          const response = await fetch(`http://localhost:5000/api/players/${address}`);
          if (response.ok) {
            const player = await response.json();
            if (player.coins !== undefined) {
              setGameCoins(player.coins);
              localStorage.setItem(getWalletKey('gameCoins'), player.coins.toString());
              console.log(`ProfilePage: Loaded coins from backend: ${player.coins}`);
            }
          } else {
            console.log('Backend not available, using localStorage');
          }
        } catch (error) {
          console.log('Backend error, using localStorage:', error);
        }
      }
    };

    loadCoinsFromBackend();
  }, [address]);

  // Debug logging for wallet status
  useEffect(() => {
    console.log('ProfilePage Wallet Status:', {
      isConnected,
      address,
      signerStatus: signer.status,
      signerAddress: signer.address,
      client: !!client,
      walletKey: getWalletKey('gameCoins')
    });
  }, [isConnected, address, signer, client]);

  // Check if account is loading
  useEffect(() => {
    if (isConnected && !address) {
      setIsAccountLoading(true);
      // Wait for account to be populated
      const timer = setTimeout(() => {
        setIsAccountLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsAccountLoading(false);
    }
  }, [isConnected, address]);

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      disconnect();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleReconnect = async () => {
    try {
      console.log('Attempting to reconnect wallet...');
      setIsAccountLoading(true);
      await login();
      console.log('Reconnect successful');
    } catch (error) {
      console.error('Reconnect error:', error);
      setIsAccountLoading(false);
    }
  };

  const depositOptions = [
    {
      id: 'small',
      coins: 100,
      eth: '0.002',
      ethAmount: parseEther('0.002'),
      description: 'Starter Pack'
    },
    {
      id: 'medium',
      coins: 500,
      eth: '0.01',
      ethAmount: parseEther('0.01'),
      description: 'Popular Choice'
    },
    {
      id: 'large',
      coins: 1000,
      eth: '0.02',
      ethAmount: parseEther('0.02'),
      description: 'Best Value'
    }
  ];

  const handleDeposit = async () => {
    if (!address || !selectedDepositOption) {
      setDepositMessage('❌ Please select a deposit option.');
      setTimeout(() => setDepositMessage(''), 3000);
      return;
    }

    setIsDepositing(true);
    setIsProcessing(true);
    setDepositMessage('⏳ Processing deposit...');

    try {
      // Send transaction to blockchain
      const txHash = await client.sendTransaction({
        to: '0x67cAA12713e1D8593DCE7A4713bC8FeF1669d0c7',
        value: parseEther(selectedDepositOption.eth.toString())
      });

      console.log('Transaction sent:', txHash);

      // Try to record deposit in backend
      try {
        const response = await fetch(`http://localhost:5000/api/players/${address}/add-coins`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: selectedDepositOption.coins,
            ethAmount: selectedDepositOption.eth,
            txHash: txHash
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Deposit recorded in backend:', result.transaction);
          
          // Update coins from backend response
          if (result.player && result.player.coins !== undefined) {
            setGameCoins(result.player.coins);
            localStorage.setItem(getWalletKey('gameCoins'), result.player.coins.toString());
            console.log(`Updated coins from backend: ${result.player.coins}`);
          }

          setDepositMessage(`✅ Successfully deposited ${selectedDepositOption.coins} coins! Transaction: ${txHash.slice(0, 10)}...`);
          setTimeout(() => setDepositMessage(''), 5000);
        } else {
          console.log('Backend not available, using localStorage only');
          // Fallback: update coins locally
          setGameCoins(prev => prev + selectedDepositOption.coins);
          localStorage.setItem(getWalletKey('gameCoins'), (gameCoins + selectedDepositOption.coins).toString());
          setDepositMessage(`✅ Successfully deposited ${selectedDepositOption.coins} coins! (Local storage) Transaction: ${txHash.slice(0, 10)}...`);
          setTimeout(() => setDepositMessage(''), 5000);
        }
      } catch (error) {
        console.log('Backend error, using localStorage fallback:', error);
        // Fallback: update coins locally
        setGameCoins(prev => prev + selectedDepositOption.coins);
        localStorage.setItem(getWalletKey('gameCoins'), (gameCoins + selectedDepositOption.coins).toString());
        setDepositMessage(`✅ Successfully deposited ${selectedDepositOption.coins} coins! (Local storage) Transaction: ${txHash.slice(0, 10)}...`);
        setTimeout(() => setDepositMessage(''), 5000);
      }

      // Close modal
      setShowDepositModal(false);
      setSelectedDepositOption(null);
    } catch (error) {
      console.error('Error depositing:', error);
      setDepositMessage(`❌ ${error.message || 'Failed to deposit'}`);
      setTimeout(() => setDepositMessage(''), 3000);
    } finally {
      setIsDepositing(false);
      setIsProcessing(false);
    }
  };

  // Format wallet address for display
  const formatWalletAddress = (address) => {
    if (!address || typeof address !== 'string') return 'Not connected';
    if (address.length < 10) return 'Invalid address';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get connection status
  const getConnectionStatus = () => {
    if (!isConnected) return 'Disconnected';
    if (isAccountLoading) return 'Loading Account...';
    if (!address) return 'Connecting...';
    return 'Connected';
  };

  // Get connection status class
  const getConnectionStatusClass = () => {
    if (!isConnected) return styles.disconnected;
    if (isAccountLoading) return styles.connecting;
    if (!address) return styles.connecting;
    return styles.connected;
  };

  return (
    <div className={styles.profileContainer}>
      {/* Game Currency Display */}
      <div className={styles.currencyDisplay}>
        <div className={styles.coinIcon}>🪙</div>
        <span className={styles.coinAmount}>{gameCoins.toLocaleString()}</span>
        <button
          className={styles.depositButton}
          onClick={() => setShowDepositModal(true)}
          disabled={!isConnected || isAccountLoading || isProcessing}
        >
          {isProcessing ? '⏳ Processing...' : '💰 Deposit'}
        </button>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>💰 Deposit ETH</h3>
            <p>Convert your ETH to game coins</p>

            <div className={styles.depositOptions}>
              {depositOptions.map((option) => (
                <div
                  key={option.id}
                  className={`${styles.depositOption} ${selectedDepositOption?.id === option.id ? styles.selected : ''}`}
                  onClick={() => setSelectedDepositOption(option)}
                >
                  <div className={styles.optionHeader}>
                    <span className={styles.optionLabel}>{option.description}</span>
                    <span className={styles.optionBadge}>
                      {option.id === 'small' ? '🔥' : option.id === 'medium' ? '⚡' : '💎'}
                    </span>
                  </div>
                  <div className={styles.optionDetails}>
                    <div className={styles.ethAmount}>{option.eth} ETH</div>
                    <div className={styles.arrow}>→</div>
                    <div className={styles.coinAmount}>{option.coins} Coins</div>
                  </div>
                  <div className={styles.optionRate}>
                    Rate: 1 ETH = 50,000 Coins
                  </div>
                </div>
              ))}
            </div>

            {depositMessage && (
              <div className={styles.depositMessage}>
                {depositMessage}
              </div>
            )}

            <div className={styles.modalButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setShowDepositModal(false);
                  setDepositMessage('');
                  setSelectedDepositOption(null);
                }}
                disabled={isDepositing || isProcessing}
              >
                Cancel
              </button>
              {!address ? (
                <button
                  className={styles.confirmButton}
                  onClick={handleReconnect}
                  disabled={isDepositing || isAccountLoading || isProcessing}
                >
                  {isAccountLoading ? 'Loading...' : 'Reconnect Wallet'}
                </button>
              ) : (
                <button
                  className={styles.confirmButton}
                  onClick={handleDeposit}
                  disabled={isDepositing || !isConnected || !client || !selectedDepositOption || isProcessing}
                >
                  {isDepositing ? 'Memproses...' : isProcessing ? 'Processing...' : 'Confirm Deposit'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.profileContent}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            <span className={styles.avatarIcon}>👤</span>
          </div>
          <h1>Player Profile</h1>
          <p>Manage your account and view your stats</p>
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.infoCard}>
            <h3>📱 Account Info</h3>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Wallet Address</span>
              <span className={styles.infoValue}>
                {address ? formatWalletAddress(address) : 'Not connected'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Connection Status</span>
              <span className={`${styles.infoValue} ${styles.connectionStatus} ${getConnectionStatusClass()}`}>
                {getConnectionStatus()}
              </span>
            </div>
            {signer.status === "success" && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Signer EOA</span>
                <span className={styles.infoValue}>
                  {signer.address ? formatWalletAddress(signer.address) : 'Not available'}
                </span>
              </div>
            )}
            {address && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Full Address</span>
                <span className={styles.infoValue} style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                  {address}
                </span>
              </div>
            )}

          </div>


        </div>

        <div className={styles.logoutSection}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 