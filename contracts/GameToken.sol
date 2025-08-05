// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GameToken {
    mapping(address => uint256) public userCoins;
    mapping(address => uint256) public userDeposits;
    
    event Deposit(address indexed user, uint256 ethAmount, uint256 coinsAdded);
    event Purchase(address indexed user, string itemName, uint256 price);
    
    // Rate: 1 ETH = 50,000 coins
    uint256 public constant ETH_TO_COINS_RATE = 50000;
    uint256 public constant MIN_DEPOSIT = 0.002 ether;
    
    function deposit() external payable {
        require(msg.value >= MIN_DEPOSIT, "Minimum deposit is 0.002 ETH");
        
        // Calculate coins based on ETH amount
        uint256 coinsToAdd = (msg.value * ETH_TO_COINS_RATE) / 1 ether;
        
        // Add coins to user's balance
        userCoins[msg.sender] += coinsToAdd;
        userDeposits[msg.sender] += msg.value;
        
        emit Deposit(msg.sender, msg.value, coinsToAdd);
    }
    
    function getBalance(address user) external view returns (uint256) {
        return userCoins[user];
    }
    
    function purchaseItem(string memory itemName, uint256 price) external {
        require(userCoins[msg.sender] >= price, "Insufficient coins");
        
        userCoins[msg.sender] -= price;
        
        emit Purchase(msg.sender, itemName, price);
    }
    
    // Function to withdraw ETH (admin only in real implementation)
    function withdraw() external {
        // This would be restricted to admin in production
        payable(msg.sender).transfer(address(this).balance);
    }
    
    // Get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
} 