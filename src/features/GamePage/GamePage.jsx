import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import styles from './GamePage.module.css';

const GamePage = () => {
  const navigate = useNavigate();
  const gameRef = useRef(null);
  const { address } = useAccount();
  const audioRef = useRef(null);

  // Get wallet-specific localStorage key
  const getWalletKey = (key) => {
    return address ? `${key}_${address.toLowerCase()}` : key;
  };

  useEffect(() => {
    // Initialize background music
    const initBackgroundMusic = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/exploration-chiptune-rpg-adventure-theme-336428-1-qak1f7ww_llpjO8Ly-Q0hVpgKHzi9cQULDVwIiUqfaFcgzZw.mp3?b4lA');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
        
        // Start playing when user interacts
        const startMusic = () => {
          audioRef.current.play().catch(error => {
            console.log('Background music autoplay blocked:', error);
          });
          document.removeEventListener('click', startMusic);
          document.removeEventListener('keydown', startMusic);
        };
        
        document.addEventListener('click', startMusic);
        document.addEventListener('keydown', startMusic);
      }
    };

    initBackgroundMusic();

    // Get equipped boomerang from localStorage
    const getEquippedBoomerang = () => {
      try {
        const ownedItems = localStorage.getItem(getWalletKey('ownedItems'));
        if (ownedItems) {
          const items = JSON.parse(ownedItems);
          const equippedWeapon = items.weapons?.find(item => item.equipped);
          return equippedWeapon?.image || 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_030931-PRSl6bP4p0YDgecFpWmqd5NXb5NVQm.png?nX2b';
        }
      } catch (error) {
        console.error('Error getting equipped boomerang:', error);
      }
      return 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_030931-PRSl6bP4p0YDgecFpWmqd5NXb5NVQm.png?nX2b';
    };

    // Get equipped skill from localStorage
    const getEquippedSkill = () => {
      try {
        const ownedItems = localStorage.getItem(getWalletKey('ownedItems'));
        if (ownedItems) {
          const items = JSON.parse(ownedItems);
          const equippedSkill = items.skills?.find(item => item.equipped);
          return equippedSkill?.id || null;
        }
      } catch (error) {
        console.error('Error getting equipped skill:', error);
      }
      return null;
    };

    const equippedBoomerangUrl = getEquippedBoomerang();
    const equippedSkillId = getEquippedSkill();
    console.log('GamePage: Using boomerang URL:', equippedBoomerangUrl);
    console.log('GamePage: Equipped skill:', equippedSkillId);
    console.log('GamePage: Wallet address:', address);
    console.log('GamePage: Wallet key:', getWalletKey('ownedItems'));

    // Listen for equipment changes from SkinPage
    const handleEquipmentChange = () => {
      console.log('GamePage: Equipment changed, reloading game...');
      // Reload the page to apply new equipment
      window.location.reload();
    };

    // Listen for localStorage changes
    const handleStorageChange = () => {
      if (!address) return;
      
      const stored = localStorage.getItem(getWalletKey('ownedItems'));
      if (stored) {
        try {
          const items = JSON.parse(stored);
          const equippedWeapon = items.weapons?.find(item => item.equipped);
          if (equippedWeapon) {
            console.log('GamePage: New equipped weapon detected:', equippedWeapon.name);
            handleEquipmentChange();
          }
        } catch (error) {
          console.error('Error parsing ownedItems from storage:', error);
        }
      }
    };

    // Listen for custom events from SkinPage
    const handleCustomStorageChange = (event) => {
      if (event.detail && event.detail.key === getWalletKey('ownedItems')) {
        try {
          const items = JSON.parse(event.detail.value);
          const equippedWeapon = items.weapons?.find(item => item.equipped);
          if (equippedWeapon) {
            console.log('GamePage: New equipped weapon from custom event:', equippedWeapon.name);
            handleEquipmentChange();
          }
        } catch (error) {
          console.error('Error parsing ownedItems from custom event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange);
    
    // Add original CSS for dynamic classes
    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0 }
      body { background: #000; overflow: hidden; touch-action: none; font-family: sans-serif; color: #fff }
      #camera { position: relative; width: 100vw; height: 100vh; overflow: hidden }
      #world {
        position: absolute; top: 0; left: 0;
        width: 5000px; height: 5000px;
        background: #222;
        background-image:
          repeating-linear-gradient(0deg, transparent, transparent 38px, #444 38px, #444 40px),
          repeating-linear-gradient(90deg, transparent, transparent 38px, #444 38px, #444 40px);
        background-size: 40px 40px;
        will-change: transform;
      }
      #player {
        position: absolute; width: 64px; height: 64px;
        background-size: cover; background-repeat: no-repeat;
        transform-origin: center;
      }
      .boomerang {
        position: absolute; width: 40px; height: 40px;
        background-image: url("${equippedBoomerangUrl}");
        background-size: contain; background-repeat: no-repeat;
        transform-origin: center;
      }
      .enemy-bullet {
        position: absolute; width: 12px; height: 12px;
        background: orange; border-radius: 50%;
      }
      @keyframes breathe { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.1) } }
      .enemy { position: absolute; transform-origin: center; animation: breathe 2s ease-in-out infinite }
      .enemy.small { width: 32px; height: 32px; background-image: url("https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_032848-6bsKK7YmUMkHX3TeuOwQZ1ozQeN5EO.png?hf8k"); background-size: contain; background-repeat: no-repeat; }
      .enemy.large { width: 48px; height: 48px; background-image: url("https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_033053-KzeBTMjBvYLjju7OXOORA79P6RkZH8.png?PSRE"); background-size: contain; background-repeat: no-repeat; }
      .enemy.mid { width: 40px; height: 40px; background-image: url("https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_044048-GlGxruWkPjqlStUIqe5LTmDLPhrsY0.png?tMca"); background-size: contain; background-repeat: no-repeat; }
      .enemy.boss { width: 64px; height: 64px; background-image: url("https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_044205-AQpicSP0tDEfXbLnfDEUugXxw1lA1Q.png?MvxV"); background-size: contain; background-repeat: no-repeat; }
      .enemy-hp-bar { position: absolute; width: 32px; height: 4px; background: #555; border: 1px solid #333; }
      .enemy-hp-fill { width: 100%; height: 100%; background: lime; }
      #hp-bar { position: fixed; bottom: 20px; left: 20px; width: 150px; height: 15px; background: #555; border: 1px solid #888; z-index: 1000; }
      #hp-fill { width: 100%; height: 100%; background: lime }
      #boomerang-indicator { position: fixed; bottom: 45px; left: 20px; display: flex; gap: 5px; z-index: 1000; }
      .boomerang-icon { width: 20px; height: 20px; background-image: url("${equippedBoomerangUrl}"); background-size: contain; background-repeat: no-repeat; opacity: 0.3; }
      .boomerang-icon.active { opacity: 1; }
      #score { position: fixed; top: 10px; right: 10px; font-size: 18px; }
      #skill-indicator { 
        position: fixed; bottom: 45px; right: 20px; 
        background: rgba(0, 0, 0, 0.7); 
        padding: 8px 12px; 
        border-radius: 8px; 
        font-size: 12px; 
        z-index: 1000; 
        color: white;
      }
      #attack-btn {
        position: fixed; bottom: 20px; right: 20px;
        width: 60px; height: 60px; background: #f90;
        border-radius: 50%; display: flex;
        align-items: center; justify-content: center;
        font-size: 24px; cursor: pointer;
      }
      .splash {
        position: absolute; width: 30px; height: 30px; border-radius: 50%; pointer-events: none;
        animation: splash-death 0.5s ease-out forwards;
      }
      @keyframes splash-death { 0% { transform: scale(0.5); opacity: 1 } 100% { transform: scale(2); opacity: 0 } }
      .splash.small { background: #aaffaa }
      .splash.large { background: #550055 }
      .splash.mid { background: #cc88ff }
      .splash.boss { background: orange }
      .splash.hit {
        width: 20px; height: 20px; background: rgba(173, 216, 230, 0.8);
        animation: splash-hit 0.3s ease-out forwards;
      }
      @keyframes splash-hit { 0% { transform: scale(0.5); opacity: 1 } 100% { transform: scale(1.5); opacity: 0 } }
      
      /* Skill Effects CSS */
      .water-bubble {
        position: absolute; width: 20px; height: 20px;
        background: radial-gradient(circle, #87CEEB, #4682B4);
        border-radius: 50%; pointer-events: none;
        animation: water-bubble-float 2s linear forwards;
        box-shadow: 0 0 10px rgba(135, 206, 235, 0.8);
      }
      @keyframes water-bubble-float {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      
      .fire-aura {
        position: absolute; width: 80px; height: 80px;
        background: radial-gradient(circle, rgba(255, 69, 0, 0.9), rgba(255, 0, 0, 0.6), rgba(255, 165, 0, 0.4));
        border-radius: 50%; pointer-events: none;
        animation: fire-aura-pulse 3s ease-in-out;
        box-shadow: 0 0 20px rgba(255, 69, 0, 0.8);
        z-index: 100;
      }
      @keyframes fire-aura-pulse {
        0%, 100% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.3); opacity: 1; }
      }
      
      .lightning-bolt {
        position: absolute; width: 8px; height: 40px;
        background: linear-gradient(to bottom, #FFD700, #FFA500, #FF4500);
        border-radius: 2px; pointer-events: none;
        animation: lightning-strike 0.5s ease-out forwards;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
        z-index: 150;
      }
      @keyframes lightning-strike {
        0% { transform: scaleY(0); opacity: 1; }
        50% { transform: scaleY(1); opacity: 1; }
        100% { transform: scaleY(0); opacity: 0; }
      }
      
      #game-over-overlay {
        display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.8); z-index: 2000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
      }
      #game-over-overlay h1 { color: #f33; font-size: 48px; margin-bottom: 20px; }
      #play-again-btn { padding: 10px 20px; font-size: 24px; border: none; background: #f90; color: #000; border-radius: 5px; cursor: pointer; }
    `;
    document.head.appendChild(style);

    const game = gameRef.current;
    if (!game) return;

    const clamp = (v, min, max) => v < min ? min : v > max ? max : v;
    
    // Helper function to safely reduce HP
    const reduceHP = (damage) => {
      const oldHP = playerHP;
      playerHP = Math.max(0, playerHP - damage); // Ensure HP never goes below 0
      hpFill.style.width = (playerHP / maxHP * 100) + '%';
      console.log(`HP reduced: ${oldHP} → ${playerHP}/${maxHP} (damage: ${damage})`);
      
      // Additional safety check - ensure HP never goes below 0
      if (playerHP < 0) {
        playerHP = 0;
        hpFill.style.width = '0%';
        console.log('Emergency HP fix: HP was negative, set to 0');
      }
      
      return playerHP;
    };
    
    // Helper function to check if game should end
    const checkGameOver = () => {
      if (playerHP <= 0 && !gameOver) {
        gameOver = true;
        overlay.style.display = 'flex';
        console.log('Game Over triggered - HP reached 0 or below');
        return true;
      }
      return false;
    };

    const playerEl = game.querySelector('#player'),
          world = game.querySelector('#world'),
          scoreEl = game.querySelector('#score'),
          hpFill = game.querySelector('#hp-fill'),
          attackBtn = game.querySelector('#attack-btn'),
          overlay = game.querySelector('#game-over-overlay'),
          playAgain = game.querySelector('#play-again-btn'),
          boomerangIndicator = game.querySelector('#boomerang-indicator');

    if (!playerEl || !world || !scoreEl || !hpFill || !attackBtn || !overlay || !playAgain || !boomerangIndicator) {
      console.error('Required game elements not found');
      return;
    }

    // Create skill indicator
    const skillIndicator = document.createElement('div');
    skillIndicator.id = 'skill-indicator';
    skillIndicator.innerHTML = 'No Skill Equipped';
    game.appendChild(skillIndicator);

    function updateSkillIndicator() {
      if (!equippedSkillId) {
        skillIndicator.innerHTML = 'No Skill Equipped';
        return;
      }

      const now = Date.now();
      let status = '';

      switch (equippedSkillId) {
        case 'water-skill':
          const waterCooldown = Math.max(0, WATER_SKILL_COOLDOWN - (now - lastWaterSkillTime));
          status = `Water Skill: ${Math.ceil(waterCooldown / 1000)}s`;
          break;
        case 'fire-skill':
          const fireCooldown = Math.max(0, FIRE_SKILL_COOLDOWN - (now - lastFireSkillTime));
          const auraStatus = fireAuraActive ? ' (AURA ACTIVE)' : '';
          status = `Fire Skill: ${Math.ceil(fireCooldown / 1000)}s${auraStatus}`;
          break;
        case 'lightning-skill':
          const lightningCooldown = Math.max(0, LIGHTNING_SKILL_COOLDOWN - (now - lastLightningSkillTime));
          status = `Lightning Skill: ${Math.ceil(lightningCooldown / 1000)}s`;
          break;
        default:
          status = 'Unknown Skill';
      }

      skillIndicator.innerHTML = status;
    }

    // Character system
    const getCharacterImages = () => {
      // Check if any exclusive character is equipped
      const ownedItems = localStorage.getItem(getWalletKey('ownedItems'));
      if (ownedItems) {
        try {
          const items = JSON.parse(ownedItems);
          const equippedExclusive = items.exclusive?.find(item => item.equipped);
          
          if (equippedExclusive) {
            if (equippedExclusive.id === 'bearish') {
              return {
                idle: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250805_061441-NWoBP5DdXrs2Hmam8vPdBIg4osVYXd.png?ZJr3",
                walk: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250805_061507-Ig6hgaM1noAxjdTpolvDXqgZ9w10XC.png?osgP"
              };
            } else if (equippedExclusive.id === 'gugo') {
              // Gugo uses default character images
              return {
                idle: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/Desain%20tanpa%20judul_20250803_014925_0000-WPPV0YMrVOIEiPDMKIxVqClvm15qqg.png?eJOn",
                walk: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/Desain%20tanpa%20judul_20250803_014914_0000-YgZFVu6u3HFFpUDfx7trnPVZVginZt.png?dpf1"
              };
            }
          }
        } catch (error) {
          console.error('Error parsing ownedItems for character:', error);
        }
      }
      
      // Default character (same as Gugo)
      return {
        idle: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/Desain%20tanpa%20judul_20250803_014925_0000-WPPV0YMrVOIEiPDMKIxVqClvm15qqg.png?eJOn",
        walk: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/Desain%20tanpa%20judul_20250803_014914_0000-YgZFVu6u3HFFpUDfx7trnPVZVginZt.png?dpf1"
      };
    };

    const updateCharacterImages = () => {
      const newCharacterImages = getCharacterImages();
      idleImg = newCharacterImages.idle;
      walkImg = newCharacterImages.walk;
      
      // Update player image immediately
      if (playerEl) {
        const sp = Math.hypot(velX, velY);
        if (sp > 0.5) {
          playerEl.style.backgroundImage = `url('${frame ? walkImg : idleImg}')`;
        } else {
          playerEl.style.backgroundImage = `url('${idleImg}')`;
        }
      }
      console.log('Character images updated');
    };

    let characterImages = getCharacterImages();
    let idleImg = characterImages.idle;
    let walkImg = characterImages.walk;

    const worldW = 5000, worldH = 5000, playerW = 64, playerH = 64;
    const BOOM_SP = 6, BOOM_DM = 100, BOOM_RANGE = 300;
    const ENEMY_SP = 1.2, MID_SP = ENEMY_SP * 3, BULLET_SP = 4;
    const dmgMap = { small: 100, large: 200, mid: 300, boss: 500 };

    let posX, posY, velX = 0, velY = 0, camX, camY;
    let frame, flip = 1;
    let playerHP, maxHP, score;
    let booms, enemies, bullets;
    let lastDamageTime, damageCooldown;
    let gameOver;
    let boomerangCount = 5;
    let maxBoomerangs = 5;
    const keys = {};

    // Skill System Variables
    let skillEffects = [];
    let lastWaterSkillTime = 0;
    let lastFireSkillTime = 0;
    let lastLightningSkillTime = 0;
    let fireAuraActive = false;
    let fireAuraStartTime = 0;
    const WATER_SKILL_COOLDOWN = 5000; // 5 seconds
    const FIRE_SKILL_COOLDOWN = 20000; // 20 seconds
    const LIGHTNING_SKILL_COOLDOWN = 10000; // 10 seconds
    const FIRE_AURA_DURATION = 3000; // 3 seconds

    // Listen for character changes
    const handleCharacterChange = () => {
      updateCharacterImages();
    };

    // Listen for custom events from SkinPage
    const handleCustomCharacterChange = (event) => {
      if (event.detail && event.detail.key === getWalletKey('ownedItems')) {
        try {
          const items = JSON.parse(event.detail.value);
          const equippedExclusive = items.exclusive?.find(item => item.equipped);
          if (equippedExclusive && (equippedExclusive.id === 'bearish' || equippedExclusive.id === 'gugo')) {
            console.log(`${equippedExclusive.id} character equipped, updating images...`);
            handleCharacterChange();
          }
        } catch (error) {
          console.error('Error parsing ownedItems from custom event:', error);
        }
      }
    };

    function updateBoomerangIndicator() {
      const icons = boomerangIndicator.querySelectorAll('.boomerang-icon');
      icons.forEach((icon, index) => {
        if (index < boomerangCount) {
          icon.classList.add('active');
        } else {
          icon.classList.remove('active');
        }
      });
    }

    // Skill Functions
    function createWaterBubble(x, y, targetX, targetY) {
      const bubble = document.createElement('div');
      bubble.className = 'water-bubble';
      bubble.style.left = x + 'px';
      bubble.style.top = y + 'px';
      world.appendChild(bubble);
      
      // Calculate direction to target
      const dx = targetX - x;
      const dy = targetY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const speed = 3;
      
      let currentX = x;
      let currentY = y;
      let hitEnemy = false;
      
      const moveBubble = () => {
        if (hitEnemy) return;
        
        if (distance > 0) {
          currentX += (dx / distance) * speed;
          currentY += (dy / distance) * speed;
          bubble.style.left = currentX + 'px';
          bubble.style.top = currentY + 'px';
          
          // Check collision with enemies
          enemies.forEach(enemy => {
            const d2 = Math.hypot(currentX - enemy.x, currentY - enemy.y);
            if (d2 < 20 && !hitEnemy) {
              hitEnemy = true;
              enemy.hp -= 50; // Water bubble damage
              createHitSplash(currentX, currentY);
              bubble.remove();
              
              // Check if enemy dies
              if (enemy.hp <= 0) {
                createDeathSplash(enemy.x, enemy.y, enemy.type);
                enemy.el.remove();
                enemy.hb.remove();
                score += 100;
              }
              return;
            }
          });
          
          if (currentX < 0 || currentY < 0 || currentX > worldW || currentY > worldH) {
            bubble.remove();
          } else if (!hitEnemy) {
            requestAnimationFrame(moveBubble);
          }
        }
      };
      moveBubble();
      
      // Remove bubble after animation
      setTimeout(() => bubble.remove(), 2000);
    }

    function activateFireAura() {
      if (fireAuraActive) return;
      
      fireAuraActive = true;
      fireAuraStartTime = Date.now();
      
      // Create multiple aura layers for better visual effect
      const aura1 = document.createElement('div');
      aura1.className = 'fire-aura';
      aura1.style.left = (posX - 40) + 'px';
      aura1.style.top = (posY - 40) + 'px';
      world.appendChild(aura1);
      
      const aura2 = document.createElement('div');
      aura2.className = 'fire-aura';
      aura2.style.left = (posX - 35) + 'px';
      aura2.style.top = (posY - 35) + 'px';
      aura2.style.width = '70px';
      aura2.style.height = '70px';
      world.appendChild(aura2);
      
      // Remove auras after duration
      setTimeout(() => {
        aura1.remove();
        aura2.remove();
        fireAuraActive = false;
      }, FIRE_AURA_DURATION);
    }

    function createLightningBolt(x, y) {
      // Create multiple lightning bolts for better visual effect
      for (let i = 0; i < 5; i++) {
        const bolt = document.createElement('div');
        bolt.className = 'lightning-bolt';
        bolt.style.left = (x + (i - 2) * 10) + 'px';
        bolt.style.top = y + 'px';
        world.appendChild(bolt);
        
        // Lightning damage to all enemies in range
        enemies.forEach(enemy => {
          const d2 = Math.hypot(x - enemy.x, y - enemy.y);
          if (d2 < 200) { // Lightning range
            enemy.hp -= 200; // Lightning damage increased to 200
            createHitSplash(enemy.x, enemy.y);
            
            // Check if enemy dies
            if (enemy.hp <= 0) {
              createDeathSplash(enemy.x, enemy.y, enemy.type);
              enemy.el.remove();
              enemy.hb.remove();
              score += 100;
            }
          }
        });
        
        // Remove bolt after animation
        setTimeout(() => bolt.remove(), 500);
      }
    }

    function updateSkills() {
      const now = Date.now();
      
      // Water Skill - Every 5 seconds, shoot 3 bubbles at nearest enemies
      if (equippedSkillId === 'water-skill' && now - lastWaterSkillTime > WATER_SKILL_COOLDOWN) {
        const nearestEnemies = enemies
          .sort((a, b) => Math.hypot(posX - a.x, posY - a.y) - Math.hypot(posX - b.x, posY - b.y))
          .slice(0, 3);
        
        nearestEnemies.forEach(enemy => {
          createWaterBubble(posX + 32, posY + 32, enemy.x, enemy.y);
        });
        
        lastWaterSkillTime = now;
      }
      
      // Fire Skill - Every 20 seconds, activate fire aura for 3 seconds
      if (equippedSkillId === 'fire-skill' && now - lastFireSkillTime > FIRE_SKILL_COOLDOWN) {
        activateFireAura();
        lastFireSkillTime = now;
      }
      
      // Lightning Skill - Every 10 seconds, lightning strike
      if (equippedSkillId === 'lightning-skill' && now - lastLightningSkillTime > LIGHTNING_SKILL_COOLDOWN) {
        createLightningBolt(posX + 32, posY + 32);
        lastLightningSkillTime = now;
      }
    }

    function initGame() {
      posX = 2500; posY = 2500; velX = 0; velY = 0; camX = posX; camY = posY;
      frame = 0; flip = 1;
      playerHP = 1000; maxHP = 1000; score = 0;
      booms = []; enemies = []; bullets = [];
      lastDamageTime = 0; damageCooldown = 1000;
      gameOver = false;
      boomerangCount = 5;
      scoreEl.textContent = 'Score: 0';
      hpFill.style.width = '100%';
      playerEl.style.left = posX + 'px'; playerEl.style.top = posY + 'px';
      playerEl.style.backgroundImage = `url('${idleImg}')`;
      world.style.transform = `translate(${window.innerWidth / 2 - posX}px,${window.innerHeight / 2 - posY}px)`;
      overlay.style.display = 'none';
      game.querySelectorAll('.enemy, .enemy-hp-bar, .boomerang, .enemy-bullet').forEach(el => el.remove());
      for (let i = 0; i < 8; i++) spawnEnemy('small');
      velX = velY = 0;
      updateBoomerangIndicator();
      updateSkillIndicator(); // Initialize skill indicator
      console.log('Game initialized with 1000 HP');
      
      // Safety check - ensure HP is properly set
      if (playerHP !== 1000) {
        console.warn('HP initialization issue detected, fixing...');
        playerHP = 1000;
        hpFill.style.width = '100%';
      }
    }

    function spawnEnemy(type) {
      const eEl = document.createElement('div'), hb = document.createElement('div'), hf = document.createElement('div'), size = { small: 32, large: 48, mid: 40, boss: 64 }[type];
      eEl.classList.add('enemy', type); hb.classList.add('enemy-hp-bar'); hf.classList.add('enemy-hp-fill');
      hb.appendChild(hf); world.appendChild(eEl); world.appendChild(hb);
      const ang = Math.random() * 2 * Math.PI, dist = 500 + Math.random() * 200;
      enemies.push({ el: eEl, hb, hf, x: posX + Math.cos(ang) * dist, y: posY + Math.sin(ang) * dist, hp: dmgMap[type], type, size, lastShot: 0 });
    }

    function checkSpecial() {
      if (score > 0 && score % 4 === 0 && !enemies.some(e => e.type === 'large')) spawnEnemy('large');
      if (score > 0 && score % 7 === 0 && !enemies.some(e => e.type === 'mid')) spawnEnemy('mid');
      if (score > 0 && score % 10 === 0 && !enemies.some(e => e.type === 'boss')) spawnEnemy('boss');
    }

    function handleAttack() {
      if (boomerangCount <= 0) return; // Can't attack if no boomerangs available
      
      let best = null, bd = Infinity;
      enemies.forEach(e => {
        const d = Math.hypot(e.x - posX, e.y - posY);
        if (e.hp > 0 && d < bd) { bd = d; best = e; }
      });
      if (!best) return;
      
      const ang = Math.atan2(best.y - posY, best.x - posX), bEl = document.createElement('div');
      bEl.classList.add('boomerang'); world.appendChild(bEl);
      booms.push({ el: bEl, x: posX, y: posY, dx: Math.cos(ang) * BOOM_SP, dy: Math.sin(ang) * BOOM_SP, traveled: 0, returning: false });
      
      // Decrease boomerang count and update indicator
      boomerangCount--;
      updateBoomerangIndicator();
    }

    function createHitSplash(x, y) {
      const s = document.createElement('div'); s.className = 'splash hit'; s.style.left = `${x - 10}px`; s.style.top = `${y - 10}px`; world.appendChild(s); s.addEventListener('animationend', () => s.remove());
    }

    function createDeathSplash(x, y, type) {
      const s = document.createElement('div'); s.className = `splash ${type}`; s.style.left = `${x - 15}px`; s.style.top = `${y - 15}px`; world.appendChild(s); s.addEventListener('animationend', () => s.remove());
    }

    // Keyboard input
    const handleKeyDown = (e) => {
      keys[e.key] = true;
      if (e.key === ' ') handleAttack();
      updateVelocity();
    };

    const handleKeyUp = (e) => {
      keys[e.key] = false;
      updateVelocity();
    };

    function updateVelocity() {
      velX = velY = 0;
      if (keys['ArrowLeft'] || keys['a']) { velX = -3; flip = -1; }
      if (keys['ArrowRight'] || keys['d']) { velX = 3; flip = 1; }
      if (keys['ArrowUp'] || keys['w']) velY = -3;
      if (keys['ArrowDown'] || keys['s']) velY = 3;
      playerEl.style.transform = `scaleX(${flip})`;
    }

    function loop() {
      if (!gameOver) {
        // Safety check - ensure game over only happens when HP is truly 0
        if (playerHP <= 0 && !gameOver) {
          gameOver = true;
          overlay.style.display = 'flex';
          console.log('Safety check: Game Over triggered - HP reached 0');
          return;
        }
        
        posX = clamp(posX + velX, 0, worldW - playerW);
        posY = clamp(posY + velY, 0, worldH - playerH);
        playerEl.style.left = posX + 'px'; playerEl.style.top = posY + 'px';
        hpFill.style.width = (playerHP / maxHP * 100) + '%';

        checkSpecial();
        updateSkills(); // Call updateSkills here
        updateSkillIndicator(); // Update skill indicator

        enemies = enemies.filter(e => {
          // Enemy movement
          if (e.hp <= 0) return false;
          const dx = posX - e.x, dy = posY - e.y, d = Math.hypot(dx, dy);
          const spType = { small: ENEMY_SP, large: ENEMY_SP, mid: MID_SP, boss: ENEMY_SP }[e.type];
          if (d > 1) { 
            e.x += dx / d * spType; 
            e.y += dy / d * spType; 
          }
          e.el.style.left = e.x + 'px'; 
          e.el.style.top = e.y + 'px';
          e.hb.style.left = (e.x + (e.size - 32) / 2) + 'px'; 
          e.hb.style.top = (e.y - 6) + 'px';
          e.hf.style.width = (e.hp / dmgMap[e.type] * 100) + '%';

          // Boss shooting
          if (e.type === 'boss' && Date.now() - e.lastShot > 3000) {
            e.lastShot = Date.now(); 
            const angB = Math.atan2(posY - e.y, posX - e.x), bl = document.createElement('div');
            bl.classList.add('enemy-bullet'); 
            world.appendChild(bl);
            bullets.push({ el: bl, x: e.x, y: e.y, dx: Math.cos(angB) * BULLET_SP, dy: Math.sin(angB) * BULLET_SP });
          }

          // Check collision with player
          const d2 = Math.hypot(e.x - posX, e.y - posY);
          if (d2 < e.size / 2 + playerW / 2) {
            // Fire aura damage - if fire aura is active, enemy takes 100 damage
            if (fireAuraActive && equippedSkillId === 'fire-skill') {
              e.hp -= 100; // Fire aura damage
              createHitSplash(e.x, e.y);
              if (e.hp <= 0) {
                createDeathSplash(e.x, e.y, e.type);
                e.el.remove();
                e.hb.remove();
                score += 100;
                return false;
              }
            }
            
            // Normal collision damage
            const now = Date.now();
            if (now - lastDamageTime > damageCooldown) {
              const damage = dmgMap[e.type];
              reduceHP(damage);
              lastDamageTime = now;
              
              // Check for game over after damage
              if (checkGameOver()) {
                return; // Stop processing if game over
              }
            }
          }
          
          // Remove enemies that go off screen
          if (e.x < -100 || e.y < -100 || e.x > worldW + 100 || e.y > worldH + 100) {
            e.el.remove();
            e.hb.remove();
            return false;
          }
          
          return true;
        });

        booms = booms.filter(b => {
          if (!b) return false;
          if (!b.returning) {
            b.x += b.dx; b.y += b.dy; b.traveled += Math.hypot(b.dx, b.dy);
            if (b.traveled >= BOOM_RANGE) b.returning = true;
          } else {
            const dx = posX - b.x, dy = posY - b.y, d = Math.hypot(dx, dy);
            if (d < 8) { b.el.remove(); return false; }
            b.x += dx / d * BOOM_SP; b.y += dy / d * BOOM_SP;
          }
          b.el.style.left = b.x + 'px'; b.el.style.top = b.y + 'px'; let hit = false;
          enemies.forEach(e => {
            if (Math.hypot(e.x - b.x, e.y - b.y) < e.size / 2) {
              if (e.hp > BOOM_DM) createHitSplash(b.x, b.y); else createDeathSplash(e.x + e.size / 2, e.y + e.size / 2, e.type);
              e.hp -= BOOM_DM;
              if (e.hp <= 0) { e.el.remove(); e.hb.remove(); score++; scoreEl.textContent = 'Score: ' + score; }
              b.el.remove(); hit = true;
            }
          }); return !hit;
        });

        bullets = bullets.filter(bl => {
          bl.x += bl.dx; bl.y += bl.dy; bl.el.style.left = bl.x + 'px'; bl.el.style.top = bl.y + 'px';
          const d2 = Math.hypot(bl.x - posX, bl.y - posY);
          if (d2 < 16) { 
            createDeathSplash(bl.x, bl.y, 'boss'); 
            const bulletDamage = 50;
            reduceHP(bulletDamage);
            bl.el.remove(); 
            
            // Check for game over after bullet damage
            if (checkGameOver()) {
              return false; // Stop processing if game over
            }
            return false; 
          }
          if (bl.x < 0 || bl.y < 0 || bl.x > worldW || bl.y > worldH) { bl.el.remove(); return false; }
          return true;
        });

        camX += (posX - camX) * 0.1; camY += (posY - camY) * 0.1;
        const vw = window.innerWidth, vh = window.innerHeight;
        camX = clamp(camX, vw / 2, worldW - vw / 2); camY = clamp(camY, vh / 2, worldH - vh / 2);
        world.style.transform = `translate(${vw / 2 - camX}px,${vh / 2 - camY}px)`;
      }
      requestAnimationFrame(loop);
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    attackBtn.addEventListener('click', handleAttack);
    playAgain.addEventListener('click', initGame);
    
    // Listen for character changes
    window.addEventListener('localStorageChange', handleCustomCharacterChange);

    // Animation frame for walking
    const walkingInterval = setInterval(() => {
      const sp = Math.hypot(velX, velY);
      if (sp > 0.5) { frame ^= 1; playerEl.style.backgroundImage = `url('${frame ? walkImg : idleImg}')`; }
      else playerEl.style.backgroundImage = `url('${idleImg}')`;
    }, 200);

    // Enemy spawn interval
    const spawnInterval = setInterval(() => {
      if (!gameOver) spawnEnemy('small');
    }, 1000);

    // Boomerang regeneration interval
    const boomerangRegenInterval = setInterval(() => {
      if (!gameOver && boomerangCount < maxBoomerangs) {
        boomerangCount++;
        updateBoomerangIndicator();
      }
    }, 500);

    // Initialize and start game
    initGame();
    requestAnimationFrame(loop);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      attackBtn.removeEventListener('click', handleAttack);
      playAgain.removeEventListener('click', initGame);
      window.removeEventListener('localStorageChange', handleCustomCharacterChange);
      clearInterval(walkingInterval);
      clearInterval(spawnInterval);
      clearInterval(boomerangRegenInterval);
      document.head.removeChild(style);
      
      // Cleanup background music
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [address]); // Add address to dependency array

  const handleBackToArena = () => {
    navigate('/game');
  };

  return (
    <div className={styles.gameContainer}>
      <button className={styles.backButton} onClick={handleBackToArena}>
        ← Back to Arena
      </button>
      
      <div ref={gameRef} className={styles.gameWrapper}>
        <div id="camera" className={styles.camera}>
          <div id="world" className={styles.world}>
            <div id="player" className={styles.player}></div>
          </div>
          <div id="score" className={styles.score}>Score: 0</div>
          <div id="boomerang-indicator" className={styles.boomerangIndicator}>
            <div className="boomerang-icon active"></div>
            <div className="boomerang-icon active"></div>
            <div className="boomerang-icon active"></div>
            <div className="boomerang-icon active"></div>
            <div className="boomerang-icon active"></div>
          </div>
          <div id="hp-bar" className={styles.hpBar}>
            <div id="hp-fill" className={styles.hpFill}></div>
          </div>
          <div id="attack-btn" className={styles.attackBtn}>🪃</div>
        </div>

        <div id="game-over-overlay" className={styles.gameOverOverlay}>
          <h1>Game Over</h1>
          <button id="play-again-btn" className={styles.playAgainBtn}>Play Again</button>
        </div>
      </div>
    </div>
  );
};

export default GamePage; 