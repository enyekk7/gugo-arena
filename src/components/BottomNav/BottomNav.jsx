import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './BottomNav.module.css';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { 
      path: '/game', 
      icon: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250805_061345-vmq8xkSApCC0A6MHezTPw30z5eP3ox.png?Zq9R', 
      label: 'Play' 
    },
    { 
      path: '/shop', 
      icon: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250805_061251-Er2aiGiiEWi04uK5g4uyg8ZxN3vGPZ.png?lxfm', 
      label: 'Shop' 
    },
    { 
      path: '/skin', 
      icon: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250805_061144-b15ZbaP7ItluqfhVVfXOZTbV7pcfQJ.png?hlte', 
      label: 'Skin' 
    },
    { 
      path: '/profile', 
      icon: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250805_061220-OYEv7TwezHyB7WqLUwGgXV7EGITMOY.png?u40v', 
      label: 'Profile' 
    }
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
          onClick={() => handleNavClick(item.path)}
        >
          <img 
            src={item.icon} 
            alt={item.label} 
            className={styles.navIcon}
            onError={(e) => {
              console.log(`Failed to load icon for ${item.label}:`, e.target.src);
              // Fallback to emoji if image fails to load
              e.target.style.display = 'none';
              const fallbackSpan = e.target.nextSibling;
              if (fallbackSpan) {
                fallbackSpan.style.display = 'block';
              }
            }}
          />
          <span className={styles.navIconFallback} style={{ display: 'none' }}>
            {item.path === '/game' ? '🎮' : 
             item.path === '/shop' ? '🛒' : 
             item.path === '/skin' ? '🎨' : '👤'}
          </span>
          <span className={styles.navLabel}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav; 