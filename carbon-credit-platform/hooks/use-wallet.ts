// // hooks/use-wallet.ts
// "use client"

// import { useState, useCallback, createContext, useContext, type ReactNode, useEffect } from "react"
// import { getWallets, WalletName } from "@massalabs/wallet-provider"

// interface WalletContextType {
//   isConnected: boolean
//   address: string | null
//   connectWallet: () => Promise<void>
//   disconnectWallet: () => void
//   provider?: any
//   loading: boolean
//   error: string | null
//   balance?: string
// }

// const WalletContext = createContext<WalletContextType | undefined>(undefined)

// export const WalletProvider = ({ children }: { children: ReactNode }) => {
//   const [provider, setProvider] = useState<any>()
//   const [address, setAddress] = useState<string | null>(null)
//   const [balance, setBalance] = useState<string>("")
//   const [loading, setLoading] = useState(false)
//   const [isConnected, setIsConnected] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const initProvider = useCallback(async () => {
//     setLoading(true)
//     setError(null)

//     try {
//       const walletList = await getWallets()
//       const wallet = walletList.find(
//         (provider) => provider.name() === WalletName.Bearby
//       )

//       if (!wallet) {
//         console.log("No Massa Station wallet found")
//         // Fallback to mock for development
//         await new Promise((resolve) => setTimeout(resolve, 1000))
//         const mockAddress = "AU1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF"
//         setAddress(mockAddress)
//         setIsConnected(true)
//         setBalance("100.0")
//         console.log("Using mock wallet for development:", mockAddress)
//         return
//       }

//       const accounts = await wallet.accounts()

//       if (accounts.length === 0) {
//         console.log("No accounts found in Massa Station wallet")
//         return
//       }

//       const account = accounts[0]
//       setProvider(account)
//       setAddress(await account.address)
//       setIsConnected(true)
//       console.log('Connected to Massa wallet:', await account.address)

//       // Get balance if possible
//       try {
//         const balanceInfo = await account.balance()
//         setBalance(balanceInfo?.toString() || "0")
//       } catch (balanceError) {
//         console.log("Could not fetch balance:", balanceError)
//         setBalance("0")
//       }

//     } catch (error) {
//       console.error('Error connecting to wallet:', error)
//       setError(error instanceof Error ? error.message : "Failed to connect to Massa wallet")
      
//       // Fallback to mock for development
//       console.warn("Massa Station not available, using mock wallet for development")
//       await new Promise((resolve) => setTimeout(resolve, 1000))
//       const mockAddress = "AU1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF"
//       setAddress(mockAddress)
//       setIsConnected(true)
//       setBalance("100.0")
//       console.log("Mock Massa Wallet Connected:", mockAddress)
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   const connectWallet = async () => {
//     await initProvider()
//   }

//   const disconnectWallet = useCallback(() => {
//     setProvider(undefined)
//     setAddress(null)
//     setBalance("")
//     setIsConnected(false)
//     setError(null)
//     console.log('Disconnected from Massa wallet')
//   }, [])

//   useEffect(() => {
//     const wasConnected = localStorage.getItem('massa_wallet_connected')
//     if (wasConnected === 'true') {
//       initProvider()
//     }
//   }, [initProvider])

//   useEffect(() => {
//     if (isConnected) {
//       localStorage.setItem('massa_wallet_connected', 'true')
//     } else {
//       localStorage.removeItem('massa_wallet_connected')
//     }
//   }, [isConnected])

//   const value = {
//     isConnected,
//     address,
//     connectWallet,
//     disconnectWallet,
//     provider,
//     loading,
//     error,
//     balance,
//   }

//   return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
// }

// export const useWallet = () => {
//   const context = useContext(WalletContext)
//   if (context === undefined) {
//     throw new Error("useWallet must be used within a WalletProvider")
//   }
//   return context
// }
