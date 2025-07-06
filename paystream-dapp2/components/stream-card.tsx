"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Clock, User, Coins, Calendar, MoreHorizontal, Eye, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Stream } from "@/types/stream"
import { toast } from "@/hooks/use-toast"
import { useWallet } from "@/contexts/wallet-context"
import { PAYSTREAM_CONTRACT_ADDRESS } from "@/contract"
import { SmartContract, Args, bytesToStr } from "@massalabs/massa-web3"

interface StreamCardProps {
  userRole: "payer" | "payee"
  onUpdate?: () => void
  onViewDetails?: (stream: Stream) => void
}

export function StreamCard({ userRole, onUpdate, onViewDetails }: StreamCardProps) {
  const { address, provider } = useWallet()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [streams, setStreams] = useState<Stream[]>([])
  const [isFetching, setIsFetching] = useState(true)

  // Fetch all stream data
  const fetchStreamData = async () => {

    if (!provider) {
      console.log("No provider available")
      setIsFetching(false)
      return
    }

    try {
      setIsFetching(true)
      console.log("Creating SmartContract instance...")

      // Create smart contract instance
      const payStreamContract = new SmartContract(provider, PAYSTREAM_CONTRACT_ADDRESS)
      console.log("SmartContract created, getting stream length...")

      // Get total number of streams
      const streamLengthResult = await payStreamContract.read('getStreamLength')
      const streamLengthStr = bytesToStr(streamLengthResult.value)
      const streamLengthNum = parseInt(streamLengthStr)
      console.log("Total streams:", streamLengthNum)

      const allStreams: Stream[] = []
      // const newSt = 3

      // Loop through all streams
      console.log("Starting loop, total streams:", streamLengthNum)
      for (let i = 0; i < streamLengthNum; i++) {
        console.log(`Processing stream ${i}/${streamLengthNum}`)
        try {
          // Prepare arguments for getStreamInfo function
          const args = new Args().addString(i.toString())
          console.log(i, "stream ID")
          // Call the smart contract to get stream info
          const result = await payStreamContract.read('getStreamInfo', args)
          const streamData = new Args(result.value)
          console.log(streamData, "data")

          // Check if the stream data is valid (not empty)
          if (streamData.serialized.length === 0) {
            console.log(`Stream ${i} is empty, skipping...`)
            continue
          }

          // Parse the returned data with validation
          const payer = streamData.nextString()
          if (!payer || payer === "") {
            console.log(`Stream ${i} has invalid payer, skipping...`)
            continue
          }

          const payee = streamData.nextString()
          if (!payee || payee === "") {
            console.log(`Stream ${i} has invalid payee, skipping...`)
            continue
          }

          const amount = streamData.nextString()
          if (!amount || amount === "") {
            console.log(`Stream ${i} has invalid amount, skipping...`)
            continue
          }

          const interval = streamData.nextU64()

          // The status and nextPaymentAt seem to be combined, let's handle this differently
          const statusAndNextPayment = streamData.nextString()

          // Split the combined string
          const cleanStatus = statusAndNextPayment.replace(/\0/g, '').split(/\d+/)[0].trim()
          const nextPaymentMatch = statusAndNextPayment.match(/\d+/)
          const nextPaymentAt = nextPaymentMatch ? BigInt(nextPaymentMatch[0]) : BigInt(0)

          // Validate the stream data
          if (cleanStatus !== "active" && cleanStatus !== "paused" && cleanStatus !== "cancelled") {
            console.log(`Stream ${i} has invalid status: ${cleanStatus}, skipping...`)
            continue
          }

          // Create stream object
          const streamInfo: Stream = {
            id: i.toString(),
            payer,
            payee,
            amount,
            interval: Number(interval),
            nextPayment: Number(nextPaymentAt),
            status: cleanStatus as "active" | "paused" | "cancelled",
            createdAt: Math.floor(Date.now() / 1000), // Using current time as fallback
            totalPaid: "0", // This would need to be fetched separately
            paymentsCount: 0, // This would need to be fetched separately
          }

          console.log(streamInfo)

          allStreams.push(streamInfo)
          console.log(`Fetched stream ${i}:`, streamInfo)
        } catch (error) {
          console.error(`Error fetching stream ${i}:`, error)
          // Continue with next stream even if one fails
        }
      }

      setStreams(allStreams)
      console.log("All streams fetched:", allStreams)
    } catch (error) {
      console.error("Error fetching stream data:", error)
      toast({
        title: "Failed to Fetch Stream",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchStreamData()
  }, [provider])
  console.log(streams, "streams res")

  const formatAmount = (amount: string) => {
    return (Number.parseFloat(amount) / 1e9).toFixed(4)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getIntervalText = (interval: number) => {
    if (interval >= 2592000) return `${Math.floor(interval / 2592000)} month(s)`
    if (interval >= 604800) return `${Math.floor(interval / 604800)} week(s)`
    if (interval >= 86400) return `${Math.floor(interval / 86400)} day(s)`
    if (interval >= 3600) return `${Math.floor(interval / 3600)} hour(s)`
    return `${Math.floor(interval / 60)} minute(s)`
  }

  const getTimeUntilNext = (nextPayment: number) => {
    const now = Math.floor(Date.now() / 1000)
    const diff = nextPayment - now

    if (diff <= 0) return "Due now"

    if (diff >= 86400) return `${Math.floor(diff / 86400)}d ${Math.floor((diff % 86400) / 3600)}h`
    if (diff >= 3600) return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`
    return `${Math.floor(diff / 60)}m`
  }

  const canExecutePayment = (stream: Stream) => {
    const now = Math.floor(Date.now() / 1000)
    return stream.status === "active" && stream.nextPayment <= now
  }

  const handleAction = async (action: string, streamId: string) => {
    if (!provider) return

    setIsLoading(action)

    try {
      // Create smart contract instance
      const payStreamContract = new SmartContract(provider, PAYSTREAM_CONTRACT_ADDRESS)

      let result
      const args = new Args().addString(streamId)

      switch (action) {
        case "execute":
          result = await payStreamContract.call('executePayment', args)
          break
        case "pause":
          result = await payStreamContract.call('pauseStream', args)
          break
        case "resume":
          result = await payStreamContract.call('resumeStream', args)
          break
        case "cancel":
          result = await payStreamContract.call('cancelStream', args)
          break
        default:
          throw new Error("Invalid action")
      }

      toast({
        title: "Action Successful",
        description: `Stream ${action}d successfully.`,
      })

      // Refresh stream data
      await fetchStreamData()
      onUpdate?.()
    } catch (error) {
      console.error(`Error ${action}ing stream:`, error)
      toast({
        title: "Action Failed",
        description: error instanceof Error ? error.message : `Failed to ${action} stream`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  if (isFetching) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="w-full">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading stream data...</span>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!streams || streams.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <span className="text-muted-foreground">No streams available</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {streams.map((stream) => {
        const isPayer = userRole === "payer"
        const otherParty = isPayer ? stream.payee : stream.payer
        const otherPartyLabel = isPayer ? "Recipient" : "Sender"

        return (
          <Card key={stream.id} className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">Stream #{stream.id}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(stream.status)}>
                      {stream.status.charAt(0).toUpperCase() + stream.status.slice(1)}
                    </Badge>
                    {canExecutePayment(stream) && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Payment Due
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails?.(stream)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="w-3 h-3" />
                    {otherPartyLabel}
                  </div>
                  <p className="font-mono text-xs">{formatAddress(otherParty)}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Coins className="w-3 h-3" />
                    Amount
                  </div>
                  <p className="font-semibold">{formatAmount(stream.amount)} MAS</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Interval
                  </div>
                  <p>{getIntervalText(stream.interval)}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Next Payment
                  </div>
                  <p>{getTimeUntilNext(stream.nextPayment)}</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Total Paid: {formatAmount(stream.totalPaid)} MAS</span>
                  <span>Payments: {stream.paymentsCount}</span>
                </div>

                <div className="flex gap-2">
                  {canExecutePayment(stream) && (
                    <Button
                      size="sm"
                      onClick={() => handleAction("execute", stream.id)}
                      disabled={isLoading === "execute"}
                      className="flex-1"
                    >
                      {isLoading === "execute" ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3 mr-1" />
                      )}
                      Execute Payment
                    </Button>
                  )}

                  {isPayer && stream.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction("pause", stream.id)}
                      disabled={isLoading === "pause"}
                    >
                      {isLoading === "pause" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pause className="w-3 h-3" />}
                    </Button>
                  )}

                  {isPayer && stream.status === "paused" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction("resume", stream.id)}
                      disabled={isLoading === "resume"}
                    >
                      {isLoading === "resume" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    </Button>
                  )}

                  {isPayer && stream.status !== "cancelled" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction("cancel", stream.id)}
                      disabled={isLoading === "cancel"}
                      className="text-red-600 hover:text-red-700"
                    >
                      {isLoading === "cancel" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
