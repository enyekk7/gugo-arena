import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { useAccount } from 'wagmi';
import LoginPage from './features/LoginPage';
import GugoArena from './features/GugoArena';
import GamePage from './features/GamePage';
import ShopPage from './features/ShopPage';
import SkinPage from './features/SkinPage';
import ProfilePage from './features/ProfilePage';
import BottomNav from './components/BottomNav';
import styles from './App.module.css';

const AppContent = () => {
  const { isConnected } = useAccount();
  const location = useLocation();
  const isGamePage = location.pathname === '/gugoarena';

  console.log('App Routing Status:', {
    isConnected,
    currentPath: location.pathname,
    shouldShowLogin: !isConnected
  });

  // Jika belum login, tampilkan halaman login
  if (!isConnected) {
    return <LoginPage />;
  }

  // Jika sudah login, tampilkan aplikasi utama
  return (
    <div className={styles.app}>
      <div className={styles.appContent}>
        <Routes>
          <Route path="/" element={<Navigate to="/game" replace />} />
          <Route path="/game" element={<GugoArena />} />
          <Route path="/gugoarena" element={<GamePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/skin" element={<SkinPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
      {!isGamePage && <BottomNav />}
    </div>
  );
};

const App = () => {
  return (
    <AbstractWalletProvider chain={abstractTestnet}>
      <Router>
        <AppContent />
      </Router>
    </AbstractWalletProvider>
  );
};

export default App; 