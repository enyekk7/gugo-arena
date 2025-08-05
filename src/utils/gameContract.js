import { createPublicClient, createWalletClient, custom, http, parseEther } from 'viem';
import { abstractTestnet } from 'viem/chains';
import { eip712WalletActions } from 'viem/zksync';

// Game Token Contract ABI (simplified)
const GAME_TOKEN_ABI = [
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "itemName", "type": "string"},
      {"internalType": "uint256", "name": "price", "type": "uint256"}
    ],
    "name": "purchaseItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Contract address (you would deploy this to Abstract testnet)
const GAME_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual address

export class GameContract {
  constructor() {
    this.publicClient = null;
    this.walletClient = null;
    this.contract = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('Initializing GameContract...');
      
      // Create public client
      this.publicClient = createPublicClient({
        chain: abstractTestnet,
        transport: http()
      }).extend(eip712WalletActions());

      console.log('Public client created successfully');

      // Create wallet client if ethereum is available
      if (typeof window !== 'undefined' && window.ethereum) {
        console.log('Ethereum provider found, creating wallet client...');
        
        this.walletClient = createWalletClient({
          chain: abstractTestnet,
          transport: custom(window.ethereum),
        }).extend(eip712WalletActions());

        console.log('Wallet client created successfully');

        // Create contract instance
        this.contract = {
          address: GAME_TOKEN_ADDRESS,
          abi: GAME_TOKEN_ABI,
        };

        this.isInitialized = true;
        console.log('GameContract initialized successfully');
        return true;
      } else {
        console.warn('No ethereum provider found');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize GameContract:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async deposit(userAddress, ethAmount) {
    if (!this.isInitialized) {
      throw new Error('GameContract not initialized. Please call initialize() first.');
    }

    if (!this.walletClient || !this.contract) {
      throw new Error('Wallet client or contract not available');
    }

    if (!userAddress) {
      throw new Error('User address is required');
    }

    try {
      console.log(`Attempting deposit: ${ethAmount} ETH from ${userAddress}`);
      
      const hash = await this.walletClient.sendTransaction({
        account: userAddress,
        to: GAME_TOKEN_ADDRESS,
        value: parseEther(ethAmount.toString()),
        data: '0xd0e30db0', // deposit() function selector
      });

      console.log('Deposit transaction hash:', hash);
      return hash;
    } catch (error) {
      console.error('Deposit failed:', error);
      throw new Error(`Deposit failed: ${error.message}`);
    }
  }

  async getBalance(userAddress) {
    if (!this.isInitialized) {
      throw new Error('GameContract not initialized. Please call initialize() first.');
    }

    if (!this.publicClient || !this.contract) {
      throw new Error('Public client or contract not available');
    }

    if (!userAddress) {
      throw new Error('User address is required');
    }

    try {
      console.log(`Getting balance for address: ${userAddress}`);
      
      const balance = await this.publicClient.readContract({
        address: GAME_TOKEN_ADDRESS,
        abi: GAME_TOKEN_ABI,
        functionName: 'getBalance',
        args: [userAddress],
      });

      console.log('Contract balance:', balance.toString());
      return balance;
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async purchaseItem(userAddress, itemName, price) {
    if (!this.isInitialized) {
      throw new Error('GameContract not initialized. Please call initialize() first.');
    }

    if (!this.walletClient || !this.contract) {
      throw new Error('Wallet client or contract not available');
    }

    if (!userAddress) {
      throw new Error('User address is required');
    }

    try {
      console.log(`Attempting purchase: ${itemName} for ${price} coins`);
      
      const hash = await this.walletClient.sendTransaction({
        account: userAddress,
        to: GAME_TOKEN_ADDRESS,
        data: this.encodePurchaseData(itemName, price),
      });

      console.log('Purchase transaction hash:', hash);
      return hash;
    } catch (error) {
      console.error('Purchase failed:', error);
      throw new Error(`Purchase failed: ${error.message}`);
    }
  }

  encodePurchaseData(itemName, price) {
    // This is a simplified encoding - in production you'd use proper ABI encoding
    return '0x' + Buffer.from(itemName).toString('hex') + price.toString(16).padStart(64, '0');
  }

  async getEthBalance(userAddress) {
    if (!this.isInitialized) {
      throw new Error('GameContract not initialized. Please call initialize() first.');
    }

    if (!this.publicClient) {
      throw new Error('Public client not available');
    }

    if (!userAddress) {
      throw new Error('User address is required');
    }

    try {
      console.log(`Getting ETH balance for address: ${userAddress}`);
      
      const balance = await this.publicClient.getBalance({
        address: userAddress,
      });

      console.log('ETH balance:', balance.toString());
      return balance;
    } catch (error) {
      console.error('Failed to get ETH balance:', error);
      throw new Error(`Failed to get ETH balance: ${error.message}`);
    }
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasPublicClient: !!this.publicClient,
      hasWalletClient: !!this.walletClient,
      hasContract: !!this.contract,
      contractAddress: GAME_TOKEN_ADDRESS
    };
  }
}

// Export singleton instance
export const gameContract = new GameContract(); 