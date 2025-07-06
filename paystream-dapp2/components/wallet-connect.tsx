"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Download, ExternalLink } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"

export function WalletConnect() {
  const { connect, isConnecting } = useWallet()
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    try {
      setError(null)
      await connect()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>
            Connect your Massa Station wallet to start managing payment streams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isConnecting ? "Connecting..." : "Connect Massa Station"}
            </Button>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Don't have Massa Station?
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a
                  href="https://station.massa.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>

              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a
                  href="https://docs.massa.net/learn/station"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Learn More
                </a>
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <Badge variant="secondary" className="mb-2">
              Testnet
            </Badge>
            <div>This dApp is currently running on Massa testnet</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
