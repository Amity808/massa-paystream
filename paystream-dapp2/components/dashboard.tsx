"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, ArrowDownLeft, Plus, RefreshCw, Wallet, TrendingUp, Clock } from "lucide-react"
import type { Stream } from "@/types/stream"
import { StreamCard } from "./stream-card"
import { StreamDetailsModal } from "./stream-details-modal"
import { CreateStreamForm } from "./create-stream-form"
import { massaClient } from "@/lib/massa-client"
import { useWallet } from "@/contexts/wallet-context"
import { toast } from "@/hooks/use-toast"
import { PAYSTREAM_CONTRACT_ADDRESS } from "@/contract"
import { bytesToStr, SmartContract, JsonRpcProvider } from "@massalabs/massa-web3";


export function Dashboard() {
  const { address, isConnected } = useWallet()
  const [payerStreams, setPayerStreams] = useState<Stream[]>([])
  const [payeeStreams, setPayeeStreams] = useState<Stream[]>([])
  const [streamLength, setStreamLength] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const provider = JsonRpcProvider.buildnet();
  const payStreamContract = new SmartContract(provider, PAYSTREAM_CONTRACT_ADDRESS);




  const loadStreams = async () => {
    if (!address || !isConnected) return

    setIsLoading(true)
    try {
      // Call getStreamLength from the contract
      const streamLengthResult = await payStreamContract.read('getStreamLength');
      const streamLengthStr = bytesToStr(streamLengthResult.value);
      const streamLengthNum = parseInt(streamLengthStr);
      setStreamLength(streamLengthNum);

      console.log("Stream length result:", streamLengthStr, "as number:", streamLengthNum);

      const { payerStreams: pStreams, payeeStreams: peeStreams } = await massaClient.getUserStreams(address)
      setPayerStreams(pStreams)
      setPayeeStreams(peeStreams)
    } catch (error) {
      console.error("Failed to load streams:", error)
      toast({
        title: "Failed to Load Streams",
        description: "Could not fetch your payment streams",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStreams()
  }, [address, isConnected])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(loadStreams, 30000)
    return () => clearInterval(interval)
  }, [isConnected])

  const formatAmount = (amount: string) => {
    return (Number.parseFloat(amount) / 1e9).toFixed(4)
  }

  const getTotalStats = () => {
    const totalOutgoing = payerStreams.reduce((sum, stream) => sum + Number.parseFloat(stream.totalPaid), 0)
    const totalIncoming = payeeStreams.reduce((sum, stream) => sum + Number.parseFloat(stream.totalPaid), 0)
    const activeOutgoing = payerStreams.filter((s) => s.status === "active").length
    const activeIncoming = payeeStreams.filter((s) => s.status === "active").length

    return {
      totalOutgoing: formatAmount(totalOutgoing.toString()),
      totalIncoming: formatAmount(totalIncoming.toString()),
      activeOutgoing,
      activeIncoming,
      totalStreams: payerStreams.length + payeeStreams.length,
    }
  }

  const getDuePayments = () => {
    const now = Math.floor(Date.now() / 1000)
    return [...payerStreams, ...payeeStreams].filter(
      (stream) => stream.status === "active" && stream.nextPayment <= now,
    )
  }

  const stats = getTotalStats()
  const duePayments = getDuePayments()

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Please connect your Massa Station wallet to view your payment streams</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PayStream Dashboard</h1>
          <p className="text-muted-foreground">Manage your recurring payment streams</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadStreams} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Stream
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outgoing</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOutgoing} MAS</div>
            <p className="text-xs text-muted-foreground">{stats.activeOutgoing} active streams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incoming</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIncoming} MAS</div>
            <p className="text-xs text-muted-foreground">{stats.activeIncoming} active streams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStreams}</div>
            <p className="text-xs text-muted-foreground">All payment streams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Payments</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{duePayments.length}</div>
            <p className="text-xs text-muted-foreground">Payments ready to execute</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Streams (Contract)</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streamLength}</div>
            <p className="text-xs text-muted-foreground">Streams on blockchain</p>
          </CardContent>
        </Card>
      </div>

      {/* Due Payments Alert */}
      {duePayments.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Clock className="w-5 h-5" />
              Payments Due
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              You have {duePayments.length} payment(s) ready to be executed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {duePayments.slice(0, 3).map((stream) => (
                <Badge key={stream.id} variant="outline" className="text-orange-800 border-orange-300">
                  #{stream.id.slice(-8)} - {formatAmount(stream.amount)} MAS
                </Badge>
              ))}
              {duePayments.length > 3 && (
                <Badge variant="outline" className="text-orange-800 border-orange-300">
                  +{duePayments.length - 3} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="outgoing">My Streams ({payerStreams.length})</TabsTrigger>
          <TabsTrigger value="incoming">Incoming ({payeeStreams.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Outgoing Streams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-red-500" />
                  Recent Outgoing Streams
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : payerStreams.length > 0 ? (
                  <div className="space-y-3">
                    {payerStreams.slice(0, 3).map((stream) => (
                      <StreamCard
                        key={stream.id}
                        stream={stream}
                        userRole="payer"
                        onUpdate={loadStreams}
                        onViewDetails={setSelectedStream}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ArrowUpRight className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No outgoing streams yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      onClick={() => setShowCreateForm(true)}
                    >
                      Create your first stream
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Incoming Streams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5 text-green-500" />
                  Recent Incoming Streams
                </CardTitle>
              </CardHeader>
              <CardContent>
              <StreamCard
                      
                      // stream={stream}
                      userRole="payer"
                      onUpdate={loadStreams}
                      onViewDetails={setSelectedStream}
                    />
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : payeeStreams.length > 0 ? (
                  <div className="space-y-3">
                    {payeeStreams.slice(0, 3).map((stream) => (
                      <StreamCard
                        key={stream.id}
                        stream={stream}
                        userRole="payee"
                        onUpdate={loadStreams}
                        onViewDetails={setSelectedStream}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ArrowDownLeft className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No incoming streams yet</p>
                    <p className="text-sm">Streams will appear here when others send to you</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="outgoing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-red-500" />
                My Payment Streams
              </CardTitle>
              <CardDescription>Streams where you are the payer</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              ) : payerStreams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* {payerStreams.map((stream) => (
                    <StreamCard
                      key={stream.id}
                      stream={stream}
                      userRole="payer"
                      onUpdate={loadStreams}
                      onViewDetails={setSelectedStream}
                    />
                  ))} */}
                  <StreamCard
                      
                      // stream={stream}
                      userRole="payer"
                      onUpdate={loadStreams}
                      onViewDetails={setSelectedStream}
                    />
                </div>
              ) : (
                <div className="text-center py-12">
                  <ArrowUpRight className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No outgoing streams</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first payment stream to start sending recurring payments
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Stream
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-green-500" />
                Incoming Payment Streams
              </CardTitle>
              <CardDescription>Streams where you are the recipient</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              ) : payeeStreams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {payeeStreams.map((stream) => (
                    <StreamCard
                      key={stream.id}
                      stream={stream}
                      userRole="payee"
                      onUpdate={loadStreams}
                      onViewDetails={setSelectedStream}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ArrowDownLeft className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No incoming streams</h3>
                  <p className="text-muted-foreground mb-4">
                    Incoming payment streams will appear here when others create streams to your address
                  </p>
                  <div className="bg-muted p-4 rounded-lg max-w-md mx-auto">
                    <p className="text-sm text-muted-foreground mb-2">Your address:</p>
                    <code className="text-xs bg-background px-2 py-1 rounded border">{address}</code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stream Details Modal */}
      <StreamDetailsModal
        stream={selectedStream}
        isOpen={!!selectedStream}
        onClose={() => setSelectedStream(null)}
        userRole={selectedStream && payerStreams.find((s) => s.id === selectedStream.id) ? "payer" : "payee"}
      />

      {/* Create Stream Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Create New Stream</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  ×
                </Button>
              </div>
              <CreateStreamForm
                onSuccess={() => {
                  setShowCreateForm(false)
                  loadStreams()
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
