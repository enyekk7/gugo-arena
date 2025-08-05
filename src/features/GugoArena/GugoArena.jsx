import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GugoArena.module.css';

const GugoArena = () => {
  const navigate = useNavigate();

  // Add class to body to prevent scrolling
  useEffect(() => {
    document.body.classList.add('game-page');
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('game-page');
    };
  }, []);

  const handlePlayGame = () => {
    navigate('/gugoarena');
  };

  return (
    <div className={styles.arenaContainer}>
      <div className={styles.arenaContent}>
        <img 
          src="https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250805_062151-f63z3qBSKbpXKoD6h9y7yqPOFwC8iX.png?7ilM"
          alt="Arena Logo"
          className={styles.arenaLogo}
          onError={(e) => {
            console.log('Failed to load arena logo:', e.target.src);
            // Fallback to text if image fails to load
            e.target.style.display = 'none';
            const fallbackText = e.target.nextSibling;
            if (fallbackText) {
              fallbackText.style.display = 'block';
            }
          }}
        />
        <h1 className={styles.arenaTitleFallback} style={{ display: 'none' }}>🎮 Arena</h1>
        <div className={styles.arenaIcon}>⚔️</div>
        <h2>Battle Arena</h2>
        <p>Prepare for epic battles in the arena!</p>
        <button className={styles.playButton} onClick={handlePlayGame}>
          🎯 Play Game
        </button>
      </div>
    </div>
  );
};

export default GugoArena; 