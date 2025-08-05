import React, { useState } from 'react';
import { useLoginWithAbstract } from '@abstract-foundation/agw-react';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const { login, isLoading } = useLoginWithAbstract();
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    try {
      setLoginError('');
      console.log('Starting Abstract wallet login...');
      await login();
      console.log('Login successful');
      // Routing akan otomatis ditangani oleh App.jsx
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed. Please try again.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginContent}>
        <div className={styles.logo}>
          <img 
            src="https://lqy3lriiybxcejon.public.blob.vercel-storage.com/4af034ca-b69e-4c18-afc7-44d7d6bc944d/20250805_094206-oNlEe8gZyNQ7gIM9CYVCe92PWuzJ59.png?oTgT" 
            alt="Gugo Arena Logo" 
            className={styles.logoImage}
          />
          <h1>Gugo Arena</h1>
        </div>
        
        <div className={styles.loginForm}>
          <h2>Welcome to Gugo Arena</h2>
          <p>Connect your Abstract Global Wallet to start playing</p>
          
          {loginError && (
            <div className={styles.errorMessage}>
              {loginError}
            </div>
          )}
          
          <button 
            className={styles.loginButton}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? '🔄 Connecting...' : '🔗 Connect with AGW'}
          </button>
          

        </div>
      </div>
    </div>
  );
};

export default LoginPage; 