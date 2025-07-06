"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { WalletState } from "@/types/stream"
import { toast } from "@/hooks/use-toast"
// import { MassaLogo } from "@massalabs/react-ui-kit";
import { getWallets, WalletName } from "@massalabs/wallet-provider"
// import { ClientF}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  provider?: any;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<any>();
  const [userAddress, setUserAddress] = useState("")
  const [balance, setBalance] = useState("")
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const initProvider = useCallback(async () => {
    setIsConnecting(true);

    try {
      const walletList = await getWallets();
      const wallet = walletList.find(
        (provider) => provider.name() === WalletName.Bearby
      );

      if (!wallet) {
        console.log("No Massa Station wallet found");
        return;
      }

      const accounts = await wallet?.accounts();

      if (accounts.length === 0) {
        console.log("No accounts found in Massa Station wallet");
        return;
      }

      const provider = accounts[0];
      setProvider(provider);
      setUserAddress(await provider.address);
      setIsConnected(true);
      console.log('Connected to wallet:', await provider.address);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }, []);


  /**
   * Connect to wallet
   */
  const connect = async () => {
    await initProvider();
  };

  /**
   * Disconnect from wallet
   */
  const disconnect = async () => {
    disconnectWallet();
  };

  /**
   * Auto-connect if previously connected
   */
  useEffect(() => {
    // Auto-connect if wallet is available
    initProvider();
  }, [initProvider]);

  const disconnectWallet = () => {
    setProvider(undefined);
    setUserAddress("");
    setIsConnected(false);
    console.log('Disconnected from wallet');
  };


  const walletState: WalletState = {
    isConnected,
    address: userAddress || null,
    balance: balance || null,
    isLoading: isConnecting,
    error,
  }

  return (
    <WalletContext.Provider
      value={{
        ...walletState,
        connect,
        disconnect,
        provider,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
