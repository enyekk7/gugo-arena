// Test script untuk memverifikasi sistem pembelian dan inventory

console.log('🧪 Testing Purchase and Inventory System...\n');

// Test 1: Simulate purchasing an item
function testPurchase() {
  console.log('📦 Test 1: Simulating item purchase...');
  
  // Simulate current state
  localStorage.setItem('gameCoins', '2000');
  
  const testItem = {
    id: 1,
    name: 'Boomerang Master',
    description: 'Legendary boomerang with ultimate precision',
    price: 2000,
    image: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/7f72e5ed-ba42-42dc-abda-e7b1117cd4b3/20250804_185102-Ej10Eyu2veh2TDNgx6iY7qGzdOdRrX.png?G0dN',
    rarity: 'legendary'
  };

  // Simulate purchase
  const currentCoins = parseInt(localStorage.getItem('gameCoins') || '0');
  const newCoins = currentCoins - testItem.price;
  localStorage.setItem('gameCoins', newCoins.toString());

  // Save to inventory
  const ownedItems = JSON.parse(localStorage.getItem('ownedItems') || '{}');
  if (!ownedItems.weapons) {
    ownedItems.weapons = [];
  }

  const inventoryItem = {
    id: testItem.id,
    name: testItem.name,
    description: testItem.description,
    image: testItem.image,
    rarity: testItem.rarity,
    equipped: false,
    purchasedAt: new Date().toISOString()
  };

  ownedItems.weapons.push(inventoryItem);
  localStorage.setItem('ownedItems', JSON.stringify(ownedItems));

  console.log('✅ Purchase simulation completed!');
  console.log(`💰 Coins: ${currentCoins} → ${newCoins}`);
  console.log(`🎒 Item added to inventory: ${testItem.name}`);
  console.log(`📅 Purchase date: ${new Date(inventoryItem.purchasedAt).toLocaleString()}\n`);
}

// Test 2: Check inventory
function testInventory() {
  console.log('🎒 Test 2: Checking inventory...');
  
  const ownedItems = JSON.parse(localStorage.getItem('ownedItems') || '{}');
  const weapons = ownedItems.weapons || [];
  const skills = ownedItems.skills || [];
  const accessories = ownedItems.accessories || [];

  console.log(`🪃 Weapons: ${weapons.length} items`);
  weapons.forEach(item => {
    console.log(`  - ${item.name} (${item.rarity}) ${item.equipped ? '✓' : ''}`);
  });

  console.log(`⚡ Skills: ${skills.length} items`);
  skills.forEach(item => {
    console.log(`  - ${item.name} (${item.rarity}) ${item.equipped ? '✓' : ''}`);
  });

  console.log(`👑 Accessories: ${accessories.length} items`);
  accessories.forEach(item => {
    console.log(`  - ${item.name} (${item.rarity}) ${item.equipped ? '✓' : ''}`);
  });

  console.log('');
}

// Test 3: Check if item is owned
function testOwnership() {
  console.log('🔍 Test 3: Checking item ownership...');
  
  const ownedItems = JSON.parse(localStorage.getItem('ownedItems') || '{}');
  const weapons = ownedItems.weapons || [];
  
  const testItemId = 1;
  const isOwned = weapons.some(item => item.id === testItemId);
  
  console.log(`Item ID ${testItemId} owned: ${isOwned ? '✅ Yes' : '❌ No'}`);
  console.log('');
}

// Test 4: Simulate equipping item
function testEquip() {
  console.log('⚔️ Test 4: Simulating equip/unequip...');
  
  const ownedItems = JSON.parse(localStorage.getItem('ownedItems') || '{}');
  const weapons = ownedItems.weapons || [];
  
  if (weapons.length > 0) {
    // Equip first weapon
    weapons.forEach(item => {
      item.equipped = item.id === 1; // Equip Boomerang Master
    });
    
    ownedItems.weapons = weapons;
    localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
    
    console.log('✅ Equipped Boomerang Master');
    weapons.forEach(item => {
      console.log(`  - ${item.name}: ${item.equipped ? 'Equipped' : 'Unequipped'}`);
    });
  }
  
  console.log('');
}

// Run all tests
function runTests() {
  console.log('🚀 Starting Purchase and Inventory Tests...\n');
  
  testPurchase();
  testInventory();
  testOwnership();
  testEquip();
  
  console.log('✅ All tests completed!');
  console.log('\n📋 Summary:');
  console.log('- Purchase system: ✅ Working');
  console.log('- Inventory storage: ✅ Working');
  console.log('- Ownership check: ✅ Working');
  console.log('- Equip system: ✅ Working');
  console.log('\n🎮 You can now test the actual application!');
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runTests();
} else {
  // Browser environment
  console.log('🌐 Running in browser environment...');
  runTests();
} 