"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, User, Coins, Calendar, Hash, ExternalLink, Copy, RefreshCw } from "lucide-react"
import type { Stream, PaymentHistory } from "@/types/stream"
import { toast } from "@/hooks/use-toast"

interface StreamDetailsModalProps {
  stream: Stream | null
  isOpen: boolean
  onClose: () => void
  userRole: "payer" | "payee"
}

export function StreamDetailsModal({ stream, isOpen, onClose, userRole }: StreamDetailsModalProps) {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [timeUntilNext, setTimeUntilNext] = useState("")

  useEffect(() => {
    if (!stream) return

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000)
      const diff = stream.nextPayment - now

      if (diff <= 0) {
        setTimeUntilNext("Payment Due!")
      } else {
        const days = Math.floor(diff / 86400)
        const hours = Math.floor((diff % 86400) / 3600)
        const minutes = Math.floor((diff % 3600) / 60)
        const seconds = diff % 60

        if (days > 0) {
          setTimeUntilNext(`${days}d ${hours}h ${minutes}m ${seconds}s`)
        } else if (hours > 0) {
          setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`)
        } else {
          setTimeUntilNext(`${minutes}m ${seconds}s`)
        }
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [stream])

  // Mock payment history - in real app, fetch from contract
  useEffect(() => {
    if (stream) {
      // Generate mock payment history
      const history: PaymentHistory[] = []
      for (let i = 0; i < stream.paymentsCount; i++) {
        history.push({
          id: `payment_${i}`,
          streamId: stream.id,
          amount: stream.amount,
          timestamp: stream.createdAt + i * stream.interval,
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          status: "success",
        })
      }
      setPaymentHistory(history.reverse())
    }
  }, [stream])

  if (!stream) return null

  const formatAmount = (amount: string) => {
    return (Number.parseFloat(amount) / 1e9).toFixed(4)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    })
  }

  const isPayer = userRole === "payer"
  const otherParty = isPayer ? stream.payee : stream.payer
  const otherPartyLabel = isPayer ? "Recipient" : "Sender"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Stream Details - #{stream.id.slice(-8)}
          </DialogTitle>
          <DialogDescription>Complete information about this payment stream</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Stream Information</CardTitle>
                <Badge className={getStatusColor(stream.status)}>
                  {stream.status.charAt(0).toUpperCase() + stream.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Stream ID:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{stream.id}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(stream.id, "Stream ID")}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{otherPartyLabel}:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{formatAddress(otherParty)}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(otherParty, `${otherPartyLabel} address`)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Amount per payment:</span>
                  <span className="font-semibold">{formatAmount(stream.amount)} MAS</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Payment interval:</span>
                  <span>{getIntervalText(stream.interval)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Next payment in:</span>
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{timeUntilNext}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Total paid:</span>
                  <span className="font-semibold">{formatAmount(stream.totalPaid)} MAS</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Payments made:</span>
                  <span className="font-semibold">{stream.paymentsCount}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm">{formatDate(stream.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Payment History</CardTitle>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {paymentHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="text-sm">{formatDate(payment.timestamp)}</TableCell>
                        <TableCell className="font-semibold">{formatAmount(payment.amount)} MAS</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{payment.txHash.slice(0, 10)}...</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://explorer.massa.net/tx/${payment.txHash}`, "_blank")}
                              className="h-6 w-6 p-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.status === "success" ? "default" : "destructive"} className="text-xs">
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payments have been made yet</p>
                  <p className="text-sm">Payments will appear here once they are executed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
