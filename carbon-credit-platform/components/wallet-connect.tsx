// components/wallet-connect.tsx
"use client"

import { useWallet } from "@/hooks/use-wallet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Wallet } from "lucide-react"

export default function WalletConnect() {
  const { isConnected, address, connectWallet, disconnectWallet, loading, error } = useWallet()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-green-500" />
          Connect Massa Wallet
        </CardTitle>
        <CardDescription>
          {isConnected ? `Connected: ${address}` : "Connect your Massa Station wallet to continue."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <Button onClick={disconnectWallet} className="w-full" variant="destructive">
            Disconnect Wallet
          </Button>
        ) : (
          <Button
            onClick={connectWallet}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
            {loading ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
        {error && <p className="text-error text-sm mt-2">{error}</p>}
      </CardContent>
    </Card>
  )
}
