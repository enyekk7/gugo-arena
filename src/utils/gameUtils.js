// Game utility functions
export const clamp = (v, min, max) => v < min ? min : v > max ? max : v;

// Game constants
export const GAME_CONSTANTS = {
  worldW: 5000,
  worldH: 5000,
  playerW: 64,
  playerH: 64,
  BOOM_SP: 6,
  BOOM_DM: 100,
  BOOM_RANGE: 300,
  ENEMY_SP: 1.2,
  MID_SP: 1.2 * 3,
  BULLET_SP: 4,
  dmgMap: { small: 100, large: 200, mid: 350, boss: 500 }
};

// Image URLs
export const GAME_IMAGES = {
  idleImg: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/Desain%20tanpa%20judul_20250803_014925_0000-WPPV0YMrVOIEiPDMKIxVqClvm15qqg.png?eJOn",
  walkImg: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/Desain%20tanpa%20judul_20250803_014914_0000-YgZFVu6u3HFFpUDfx7trnPVZVginZt.png?dpf1",
  boomerangImg: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_030931-PRSl6bP4p0YDgecFpWmqd5NXb5NVQm.png?nX2b",
  enemySmallImg: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_032848-6bsKK7YmUMkHX3TeuOwQZ1ozQeN5EO.png?hf8k",
  enemyLargeImg: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_033053-KzeBTMjBvYLjju7OXOORA79P6RkZH8.png?PSRE",
  enemyMidImg: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_044048-GlGxruWkPjqlStUIqe5LTmDLPhrsY0.png?tMca",
  enemyBossImg: "https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250803_044205-AQpicSP0tDEfXbLnfDEUugXxw1lA1Q.png?MvxV"
};

// Enemy spawn function
export const spawnEnemy = (type, world, enemies, posX, posY, dmgMap) => {
  const eEl = document.createElement('div');
  const hb = document.createElement('div');
  const hf = document.createElement('div');
  const size = { small: 32, large: 48, mid: 40, boss: 64 }[type];
  
  eEl.classList.add('enemy', type);
  hb.classList.add('enemy-hp-bar');
  hf.classList.add('enemy-hp-fill');
  hb.appendChild(hf);
  world.appendChild(eEl);
  world.appendChild(hb);
  
  const ang = Math.random() * 2 * Math.PI;
  const dist = 500 + Math.random() * 200;
  const enemy = {
    el: eEl, hb, hf, 
    x: posX + Math.cos(ang) * dist, 
    y: posY + Math.sin(ang) * dist,
    hp: dmgMap[type], type, size, lastShot: 0
  };
  
  enemies.push(enemy);
  return enemy;
};

// Check for special enemy spawns
export const checkSpecial = (score, enemies, spawnEnemy, posX, posY, dmgMap) => {
  if (score > 0 && score % 4 === 0 && !enemies.some(e => e.type === 'large')) {
    spawnEnemy('large', null, enemies, posX, posY, dmgMap);
  }
  if (score > 0 && score % 7 === 0 && !enemies.some(e => e.type === 'mid')) {
    spawnEnemy('mid', null, enemies, posX, posY, dmgMap);
  }
  if (score > 0 && score % 10 === 0 && !enemies.some(e => e.type === 'boss')) {
    spawnEnemy('boss', null, enemies, posX, posY, dmgMap);
  }
};

// Throw boomerang function
export const throwBoomerang = (enemies, posX, posY, world, BOOM_SP) => {
  let best = null, bd = Infinity;
  enemies.forEach(e => {
    const d = Math.hypot(e.x - posX, e.y - posY);
    if (e.hp > 0 && d < bd) {
      bd = d;
      best = e;
    }
  });
  if (!best) return null;
  
  const ang = Math.atan2(best.y - posY, best.x - posX);
  const bEl = document.createElement('div');
  bEl.classList.add('boomerang');
  world.appendChild(bEl);
  
  const boomerang = {
    el: bEl, x: posX, y: posY, 
    dx: Math.cos(ang) * BOOM_SP, 
    dy: Math.sin(ang) * BOOM_SP,
    traveled: 0, returning: false
  };
  
  return boomerang;
};

// Create splash effects
export const createHitSplash = (x, y, world) => {
  const s = document.createElement('div');
  s.className = 'splash hit';
  s.style.left = `${x - 10}px`;
  s.style.top = `${y - 10}px`;
  world.appendChild(s);
  s.addEventListener('animationend', () => s.remove());
};

export const createDeathSplash = (x, y, type, world) => {
  const s = document.createElement('div');
  s.className = `splash ${type}`;
  s.style.left = `${x - 15}px`;
  s.style.top = `${y - 15}px`;
  world.appendChild(s);
  s.addEventListener('animationend', () => s.remove());
}; 