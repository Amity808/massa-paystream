"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Copy, ExternalLink, Loader2, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { toast } from "@/hooks/use-toast"
import { massaClient } from "@/lib/massa-client"

export function WalletConnect() {
  const { isConnected, address, balance, isLoading, connect, disconnect } = useWallet()

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const formatBalance = (balance: string | null) => {
    if (!balance) return "0"
    return (Number.parseFloat(balance) / 1e9).toFixed(4) // Convert from nanoMAS to MAS
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Check if Massa Station is available
  // const isMassaStationAvailable = massaClient.isMassaStationAvailable()

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <CardTitle>Connecting...</CardTitle>
          <CardDescription>Please wait while we connect to your Massa Station wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground">
            <p>This may take a few moments</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Massa Station not available
  // if (!isMassaStationAvailable) {
  //   return (
  //     <div className="w-full max-w-md mx-auto space-y-4">
  //       <Card>
  //         <CardHeader className="text-center">
  //           <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
  //             <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
  //           </div>
  //           <CardTitle>Install Massa Station</CardTitle>
  //           <CardDescription>You need to install Massa Station wallet to use PayStream</CardDescription>
  //         </CardHeader>
  //         <CardContent className="space-y-4">
  //           <Alert>
  //             <AlertTriangle className="h-4 w-4" />
  //             <AlertDescription>⚠️ Massa Station wallet is not installed</AlertDescription>
  //           </Alert>

  //           <a href="https://station.massa.net/" target="_blank" rel="noopener noreferrer" className="block w-full">
  //             <Button className="w-full" size="lg">
  //               <ExternalLink className="w-4 h-4 mr-2" />
  //               Install Massa Station
  //             </Button>
  //           </a>

  //           <div className="text-center text-sm text-muted-foreground">
  //             <p>After installation, refresh this page to connect your wallet</p>
  //           </div>
  //         </CardContent>
  //       </Card>

  //       <Alert>
  //         <Info className="h-4 w-4" />
  //         <AlertDescription>
  //           <strong>Demo Available:</strong> You can also try the demo version by clicking "Connect Wallet" to see how
  //           the app works.
  //         </AlertDescription>
  //       </Alert>
  //     </div>
  //   )
  // }

  // Not connected state
  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>Connect your Massa Station wallet to start using PayStream</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={connect} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Massa Station
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Make sure you have Massa Station installed and unlocked</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Connected state
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            Wallet Connected
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Address</label>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <code className="flex-1 text-sm">{formatAddress(address!)}</code>
            <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Balance</label>
          <div className="p-2 bg-muted rounded-md">
            <span className="text-lg font-semibold">{formatBalance(balance)} MAS</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Connection Type</label>
          <div className="p-2 bg-muted rounded-md">
            <span className="text-sm">Massa Station</span>
          </div>
        </div>

        <Button variant="outline" onClick={disconnect} className="w-full bg-transparent">
          Disconnect Wallet
        </Button>
      </CardContent>
    </Card>
  )
}
