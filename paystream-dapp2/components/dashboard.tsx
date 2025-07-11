"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, Plus, RefreshCw, Wallet, TrendingUp, Clock } from "lucide-react"
import type { Stream } from "@/types/stream"
import { StreamCard } from "./stream-card"
import { StreamDetailsModal } from "./stream-details-modal"
import { CreateStreamForm } from "./create-stream-form"
import { useWallet } from "@/contexts/wallet-context"
import { useStreams } from "@/hooks/use-streams"
import { StreamCardIncoming } from "./incoming-stream"

export function Dashboard() {
  const { address, isConnected } = useWallet()
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const { streams, isFetching, refetch } = useStreams()

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      refetch()
    }, 30000)
    return () => clearInterval(interval)
  }, [isConnected, refetch])

  const formatAmount = (amount: string) => {
    return (Number.parseFloat(amount) / 1e9).toFixed(4)
  }

  const getTotalStats = () => {
    const userOutgoingStreams = streams.filter(stream => stream.payer === address)
    const userIncomingStreams = streams.filter(stream => stream.payee === address)

    const totalOutgoing = userOutgoingStreams.reduce((sum, stream) => sum + Number.parseFloat(stream.totalPaid), 0)
    const totalIncoming = userIncomingStreams.reduce((sum, stream) => sum + Number.parseFloat(stream.totalPaid), 0)
    const activeOutgoing = userOutgoingStreams.filter((s) => s.status === "active").length
    const activeIncoming = userIncomingStreams.filter((s) => s.status === "active").length

    return {
      totalOutgoing: formatAmount(totalOutgoing.toString()),
      totalIncoming: formatAmount(totalIncoming.toString()),
      activeOutgoing,
      activeIncoming,
      totalStreams: userOutgoingStreams.length + userIncomingStreams.length,
    }
  }

  const getDuePayments = () => {
    const now = Math.floor(Date.now() / 1000)
    const userStreams = streams.filter(stream =>
      stream.payer === address || stream.payee === address
    )
    return userStreams.filter(
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
          <Button variant="outline" onClick={refetch} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
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
          <TabsTrigger value="outgoing">My Streams ({streams.filter(s => s.payer === address).length})</TabsTrigger>
          <TabsTrigger value="incoming">Incoming ({streams.filter(s => s.payee === address).length})</TabsTrigger>
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
                <StreamCard
                  onUpdate={refetch}
                  onViewDetails={setSelectedStream}
                />
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
                <StreamCardIncoming
                  setShowCreateForm={setShowCreateForm}
                  onUpdate={refetch}
                  onViewDetails={setSelectedStream}
                />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StreamCard
                  onUpdate={refetch}
                  onViewDetails={setSelectedStream}
                />
              </div>
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
              <StreamCardIncoming
                setShowCreateForm={setShowCreateForm}
                onUpdate={refetch}
                onViewDetails={setSelectedStream}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stream Details Modal */}
      <StreamDetailsModal
        stream={selectedStream}
        isOpen={!!selectedStream}
        onClose={() => setSelectedStream(null)}
        userRole={selectedStream && streams.find((s: Stream) => s.id === selectedStream.id)?.payer === address ? "payer" : "payee"}
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
                  refetch()
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
