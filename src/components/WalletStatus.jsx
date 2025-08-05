import React from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useGlobalWalletSignerAccount } from "@abstract-foundation/agw-react";
import styles from './WalletStatus.module.css';

const WalletStatus = () => {
  const { address, isConnected } = useAccount();
  const signer = useGlobalWalletSignerAccount();
  const { disconnect } = useDisconnect();

  console.log('WalletStatus Debug:', {
    isConnected,
    address,
    signerStatus: signer.status,
    signerAddress: signer.address,
    signerAccount: signer.account
  });

  if (!isConnected) {
    return (
      <div className={styles.walletStatus}>
        <p className={styles.statusText}>Tidak ada wallet terhubung.</p>
      </div>
    );
  }

  if (signer.status !== "success") {
    return (
      <div className={styles.walletStatus}>
        <p className={styles.statusText}>Memuat data signer…</p>
      </div>
    );
  }

  return (
    <div className={styles.walletStatus}>
      <div className={styles.walletInfo}>
        <p className={styles.statusText}>
          <strong>Connected Wallet:</strong> {address}
        </p>
        <p className={styles.statusText}>
          <strong>Signer EOA:</strong> {signer.address}
        </p>
        <button 
          className={styles.logoutButton}
          onClick={() => disconnect()}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default WalletStatus; 