export interface Stream {
  id: string
  payer: string
  payee: string
  amount: string
  interval: number
  nextPayment: number
  status: "active" | "paused" | "cancelled"
  createdAt: number
  totalPaid: string
  paymentsCount: number
}

export interface PaymentHistory {
  id: string
  streamId: string
  amount: string
  timestamp: number
  txHash: string
  status: "success" | "failed"
}

export interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  isLoading: boolean
  error: string | null
}

export interface CreateStreamParams {
  payee: string
  amount: string
  interval: number
  streamId?: string
}

export interface ContractCallResult {
  success: boolean
  txHash?: string
  error?: string
}
