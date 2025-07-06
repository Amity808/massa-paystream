"use client"

import { useWallet } from "@/contexts/wallet-context"
import { WalletConnect } from "@/components/wallet-connect"
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  const { isConnected } = useWallet()

  return (
    <div className="min-h-screen bg-background">
      {!isConnected ? (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">PayStream</h1>
            <p className="text-xl text-muted-foreground mb-8">Decentralized recurring payments on Massa blockchain</p>
          </div>
          <WalletConnect />
        </div>
      ) : (
        <Dashboard />
      )}
    </div>
  )
}
