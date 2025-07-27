// lib/types.ts

export type UserRole = "company" | "project" | "verifier" | "admin" | null

export interface CarbonCredit {
  id: string
  projectId: string
  amount: number // in tons of CO2e
  pricePerTon: number // in USD
  vintageYear: number
  status: "available" | "sold" | "retired"
  verifier: string
  description: string
  imageUrl?: string
}

export interface EmissionRecord {
  id: string
  companyId: string
  date: string
  scope1: number // Direct emissions
  scope2: number // Indirect from purchased energy
  scope3: number // Other indirect emissions
  total: number
  verified: boolean
}

export interface Project {
  id: string
  ownerId: string
  name: string
  description: string
  location: string
  status: "pending" | "verified" | "active" | "completed"
  creditsMinted: number
  imageUrl?: string
}

export interface User {
  address: string
  role: UserRole
  name?: string
  email?: string
  companyName?: string
  projectId?: string
}

export interface Transaction {
  id: string
  type: "purchase" | "retirement" | "transfer" | "mint" | "emission record"
  date: string
  amount: number // credits or emissions
  unit: "credits" | "tons CO2e"
  from: string // wallet address or entity name
  to: string // wallet address or entity name
  status: "completed" | "pending" | "failed"
  details?: string
}
