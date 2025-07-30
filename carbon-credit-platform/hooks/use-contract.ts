// hooks/use-contract.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { useUser } from "@/contexts/user-context"
import { CarbonCreditContract, type ContractInteractionResult } from "@/lib/contract"
import { toast } from "@/hooks/use-toast"
import type { UserRole } from "@/lib/types"

export function useContract() {
  const { isConnected, provider, address } = useWallet()
  const { userRole, setUserRole } = useUser()
  const [contract, setContract] = useState<CarbonCreditContract | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize contract when wallet is connected
  useEffect(() => {
    if (isConnected && provider) {
      console.log("Initializing contract with provider:", provider)
      console.log("Provider type:", typeof provider)
      console.log("Provider methods:", Object.getOwnPropertyNames(provider))

      try {
        const contractInstance = new CarbonCreditContract(provider)
        setContract(contractInstance)
        console.log("Contract instance created successfully")
      } catch (error) {
        console.error("Failed to create contract instance:", error)
      }
    } else {
      console.log("No provider or not connected:", { isConnected, provider })
      setContract(null)
    }
  }, [isConnected, provider])

  // Enable automatic role detection from smart contract
  const detectUserRole = useCallback(async () => {
    if (!contract || !address || userRole) {
      console.log("detectUserRole: Skipping detection", { contract: !!contract, address, userRole })
      return
    }

    console.log("detectUserRole: Starting role detection for address:", address)
    try {
      const role = await contract.checkUserRole(address)
      console.log("detectUserRole: Contract returned role:", role)

      if (role) {
        console.log("detectUserRole: Setting user role to:", role)
        setUserRole(role)
      } else {
        console.log("detectUserRole: No role found in contract")
      }
    } catch (error) {
      console.error("detectUserRole: Error detecting user role:", error)
    }
  }, [contract, address, userRole, setUserRole])

  // Auto-detect role when contract and address are available
  useEffect(() => {
    if (contract && address && !userRole) {
      console.log("Auto-detecting user role...")
      detectUserRole()
    }
  }, [contract, address, userRole, detectUserRole])

  // =====================================================================
  // ROLE REGISTRATION FUNCTIONS
  // =====================================================================

  const registerAsCompany = useCallback(async (
    businessName: string,
    registrationNumber: string,
    industry: string,
    annualEmissions: number
  ): Promise<ContractInteractionResult> => {
    if (!contract) {
      toast({
        title: "Error",
        description: "Contract not initialized. Please ensure your wallet is connected.",
        variant: "destructive",
      })
      return { success: false, error: "Contract not initialized" }
    }

    console.log("Starting company registration:", { businessName, registrationNumber, industry, annualEmissions })
    setIsLoading(true)

    try {
      // Test contract connectivity first
      console.log("Testing contract connectivity...")
      const connectivityTest = await contract.testConnectivity()
      if (!connectivityTest.success) {
        throw new Error("Contract connectivity test failed: " + connectivityTest.error)
      }

      console.log("Calling contract.registerCompany...")
      const result = await contract.registerCompany(
        businessName,
        registrationNumber,
        industry,
        annualEmissions
      )

      console.log("Contract call result:", result)

      if (result.success) {
        setUserRole('company')
        toast({
          title: "Company Registered",
          description: `${businessName} has been successfully registered.`,
        })
        console.log("Registration successful, role set to 'company'")
      } else {
        console.error("Registration failed:", result.error)
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to register company",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      console.error("Exception during registration:", error)
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }

      toast({
        title: "Registration Failed",
        description: `Error: ${errorResult.error}`,
        variant: "destructive",
      })

      return errorResult
    } finally {
      setIsLoading(false)
      console.log("Registration process completed, loading set to false")
    }
  }, [contract, setUserRole])

  const registerAsProject = useCallback(async (
    projectId: string,
    projectName: string,
    projectType: string,
    location: string,
    totalCapacity: number
  ): Promise<ContractInteractionResult> => {
    if (!contract) {
      return { success: false, error: "Contract not initialized" }
    }

    setIsLoading(true)
    try {
      const result = await contract.registerProject(
        projectId,
        projectName,
        projectType,
        location,
        totalCapacity
      )

      if (result.success) {
        setUserRole('project')
        toast({
          title: "Project Registered",
          description: `${projectName} has been successfully registered.`,
        })
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to register project",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }

      toast({
        title: "Registration Failed",
        description: errorResult.error,
        variant: "destructive",
      })

      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [contract, setUserRole])

  // =====================================================================
  // ADMIN FUNCTIONS
  // =====================================================================

  const addVerifier = useCallback(async (
    verifierAddress: string,
    role: string
  ): Promise<ContractInteractionResult> => {
    if (!contract) {
      return { success: false, error: "Contract not initialized" }
    }

    if (userRole !== 'admin') {
      return { success: false, error: "Only admin can add verifiers" }
    }

    setIsLoading(true)
    try {
      const result = await contract.addVerifier(verifierAddress, role)

      if (result.success) {
        toast({
          title: "Verifier Added",
          description: `Verifier ${verifierAddress} has been added with role: ${role}`,
        })
      } else {
        toast({
          title: "Failed to Add Verifier",
          description: result.error || "Unknown error",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }

      toast({
        title: "Failed to Add Verifier",
        description: errorResult.error,
        variant: "destructive",
      })

      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [contract, userRole])

  const removeVerifier = useCallback(async (
    verifierAddress: string
  ): Promise<ContractInteractionResult> => {
    if (!contract) {
      return { success: false, error: "Contract not initialized" }
    }

    if (userRole !== 'admin') {
      return { success: false, error: "Only admin can remove verifiers" }
    }

    setIsLoading(true)
    try {
      const result = await contract.removeVerifier(verifierAddress)

      if (result.success) {
        toast({
          title: "Verifier Removed",
          description: `Verifier ${verifierAddress} has been removed`,
        })
      } else {
        toast({
          title: "Failed to Remove Verifier",
          description: result.error || "Unknown error",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }

      toast({
        title: "Failed to Remove Verifier",
        description: errorResult.error,
        variant: "destructive",
      })

      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [contract, userRole])

  // =====================================================================
  // VERIFIER FUNCTIONS
  // =====================================================================

  const verifyCompany = useCallback(async (
    companyAddress: string
  ): Promise<ContractInteractionResult> => {
    if (!contract) {
      return { success: false, error: "Contract not initialized" }
    }

    if (userRole !== 'verifier') {
      return { success: false, error: "Only verifiers can verify companies" }
    }

    setIsLoading(true)
    try {
      const result = await contract.verifyCompany(companyAddress)

      if (result.success) {
        toast({
          title: "Company Verified",
          description: `Company ${companyAddress} has been verified`,
        })
      } else {
        toast({
          title: "Failed to Verify Company",
          description: result.error || "Unknown error",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }

      toast({
        title: "Failed to Verify Company",
        description: errorResult.error,
        variant: "destructive",
      })

      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [contract, userRole])

  const verifyProject = useCallback(async (
    projectId: string,
    verificationBody: string
  ): Promise<ContractInteractionResult> => {
    if (!contract) {
      return { success: false, error: "Contract not initialized" }
    }

    if (userRole !== 'verifier') {
      return { success: false, error: "Only verifiers can verify projects" }
    }

    setIsLoading(true)
    try {
      const result = await contract.verifyProject(projectId, verificationBody)

      if (result.success) {
        toast({
          title: "Project Verified",
          description: `Project ${projectId} has been verified`,
        })
      } else {
        toast({
          title: "Failed to Verify Project",
          description: result.error || "Unknown error",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }

      toast({
        title: "Failed to Verify Project",
        description: errorResult.error,
        variant: "destructive",
      })

      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [contract, userRole])

  // =====================================================================
  // DATA FETCHING FUNCTIONS
  // =====================================================================

  const getCompanyDetails = useCallback(async (address: string) => {
    if (!contract) {
      console.log("getCompanyDetails: No contract available")
      return null
    }

    console.log("getCompanyDetails: Calling contract.getCompanyDetails with address:", address)
    try {
      const result = await contract.getCompanyDetails(address)
      console.log("getCompanyDetails: Contract result:", result)
      if (result.success) {
        console.log("getCompanyDetails: Returning data:", result.data)
        return result.data
      } else {
        console.log("getCompanyDetails: Contract call failed:", result.error)
        return null
      }
    } catch (error) {
      console.error('getCompanyDetails: Exception caught:', error)
      return null
    }
  }, [contract])

  const getProjectDetails = useCallback(async (projectId: string) => {
    if (!contract) return null

    try {
      const result = await contract.getProjectDetails(projectId)
      return result.success ? result.data : null
    } catch (error) {
      console.error('Error fetching project details:', error)
      return null
    }
  }, [contract])

  const getMyCompanyDashboard = useCallback(async () => {
    if (!contract) return null

    try {
      const result = await contract.getMyCompanyDashboard()
      return result.success ? result.data : null
    } catch (error) {
      console.error('Error fetching company dashboard:', error)
      return null
    }
  }, [contract])

  const getPlatformStats = useCallback(async () => {
    if (!contract) return null

    try {
      const result = await contract.getPlatformStats()
      return result.success ? result.data : null
    } catch (error) {
      console.error('Error fetching platform stats:', error)
      return null
    }
  }, [contract])

  // =====================================================================
  // EMISSIONS TRACKING FUNCTIONS
  // =====================================================================

  const recordEmissions = useCallback(async (
    emissionAmount: number,
    scope: string,
    emissionSource: string,
    reportingPeriod: number
  ): Promise<ContractInteractionResult> => {
    if (!contract) {
      return { success: false, error: "Contract not initialized" }
    }

    setIsLoading(true)
    try {
      const result = await contract.recordEmissions(emissionAmount, scope, emissionSource, reportingPeriod)

      if (result.success) {
        toast({
          title: "Emissions Recorded",
          description: `${emissionAmount} tons of CO2e emissions have been recorded successfully.`,
        })
      } else {
        toast({
          title: "Recording Failed",
          description: result.error || "Failed to record emissions",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }

      toast({
        title: "Recording Failed",
        description: errorResult.error,
        variant: "destructive",
      })

      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [contract])

  const getEmissionRecord = useCallback(async (recordId: number) => {
    if (!contract) return null

    try {
      const result = await contract.getEmissionRecord(recordId)
      return result.success ? result.data : null
    } catch (error) {
      console.error('Error fetching emission record:', error)
      return null
    }
  }, [contract])

  // =====================================================================
  // CARBON CREDIT FUNCTIONS
  // =====================================================================

  const mintCarbonCredits = useCallback(async (
    projectId: string,
    tonnageCO2: number,
    vintage: number,
    creditType: string,
    price: number,
    verificationStandard: string,
    quantity: number
  ): Promise<ContractInteractionResult> => {
    if (!contract) {
      return { success: false, error: "Contract not initialized" }
    }

    setIsLoading(true)
    try {
      const result = await contract.mintCarbonCredits(
        projectId, tonnageCO2, vintage, creditType, price, verificationStandard, quantity
      )

      if (result.success) {
        toast({
          title: "Credits Minted",
          description: `${quantity} carbon credits have been minted successfully.`,
        })
      } else {
        toast({
          title: "Minting Failed",
          description: result.error || "Failed to mint credits",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }

      toast({
        title: "Minting Failed",
        description: errorResult.error,
        variant: "destructive",
      })

      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [contract])

  const transferCredits = useCallback(async (
    to: string,
    creditIds: string[]
  ): Promise<ContractInteractionResult> => {
    if (!contract) {
      return { success: false, error: "Contract not initialized" }
    }

    setIsLoading(true)
    try {
      const result = await contract.transferCredits(to, creditIds)

      if (result.success) {
        toast({
          title: "Credits Transferred",
          description: `${creditIds.length} credits have been transferred successfully.`,
        })
      } else {
        toast({
          title: "Transfer Failed",
          description: result.error || "Failed to transfer credits",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }

      toast({
        title: "Transfer Failed",
        description: errorResult.error,
        variant: "destructive",
      })

      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [contract])

  const retireCredits = useCallback(async (
    creditIds: string[],
    retirementReason: string
  ): Promise<ContractInteractionResult> => {
    if (!contract) {
      return { success: false, error: "Contract not initialized" }
    }

    setIsLoading(true)
    try {
      const result = await contract.retireCredits(creditIds, retirementReason)

      if (result.success) {
        toast({
          title: "Credits Retired",
          description: `${creditIds.length} credits have been retired successfully.`,
        })
      } else {
        toast({
          title: "Retirement Failed",
          description: result.error || "Failed to retire credits",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }

      toast({
        title: "Retirement Failed",
        description: errorResult.error,
        variant: "destructive",
      })

      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [contract])

  const getCreditDetails = useCallback(async (creditId: number) => {
    if (!contract) return null

    try {
      const result = await contract.getCreditDetails(creditId)
      return result.success ? result.data : null
    } catch (error) {
      console.error('Error fetching credit details:', error)
      return null
    }
  }, [contract])

  // =====================================================================
  // MARKETPLACE FUNCTIONS
  // =====================================================================

  const purchaseCredits = useCallback(async (
    creditIds: string[],
    maxTotalPrice: number,
    purpose: string
  ): Promise<ContractInteractionResult> => {
    if (!contract) {
      return { success: false, error: "Contract not initialized" }
    }

    setIsLoading(true)
    try {
      const result = await contract.purchaseCredits(creditIds, maxTotalPrice, purpose)

      if (result.success) {
        toast({
          title: "Credits Purchased",
          description: `${creditIds.length} credits have been purchased successfully.`,
        })
      } else {
        toast({
          title: "Purchase Failed",
          description: result.error || "Failed to purchase credits",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }

      toast({
        title: "Purchase Failed",
        description: errorResult.error,
        variant: "destructive",
      })

      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [contract])

  const getTransactionDetails = useCallback(async (transactionId: number) => {
    if (!contract) return null

    try {
      const result = await contract.getTransactionDetails(transactionId)
      return result.success ? result.data : null
    } catch (error) {
      console.error('Error fetching transaction details:', error)
      return null
    }
  }, [contract])

  // =====================================================================
  // CERTIFICATE FUNCTIONS
  // =====================================================================

  const generateOffsetCertificate = useCallback(async (
    transactionId: number,
    certificateType: string
  ): Promise<ContractInteractionResult> => {
    if (!contract) {
      return { success: false, error: "Contract not initialized" }
    }

    setIsLoading(true)
    try {
      const result = await contract.generateOffsetCertificate(transactionId, certificateType)

      if (result.success) {
        toast({
          title: "Certificate Generated",
          description: "Offset certificate has been generated successfully.",
        })
      } else {
        toast({
          title: "Certificate Generation Failed",
          description: result.error || "Failed to generate certificate",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }

      toast({
        title: "Certificate Generation Failed",
        description: errorResult.error,
        variant: "destructive",
      })

      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [contract])

  // =====================================================================
  // COMPANY MANAGEMENT FUNCTIONS
  // =====================================================================

  const updateCompanyEmissions = useCallback(async (
    newAnnualEmissions: number
  ): Promise<ContractInteractionResult> => {
    if (!contract) {
      return { success: false, error: "Contract not initialized" }
    }

    setIsLoading(true)
    try {
      const result = await contract.updateCompanyEmissions(newAnnualEmissions)

      if (result.success) {
        toast({
          title: "Emissions Updated",
          description: "Company emissions have been updated successfully.",
        })
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update emissions",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }

      toast({
        title: "Update Failed",
        description: errorResult.error,
        variant: "destructive",
      })

      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [contract])

  const setComplianceTarget = useCallback(async (
    offsetTarget: number
  ): Promise<ContractInteractionResult> => {
    if (!contract) {
      return { success: false, error: "Contract not initialized" }
    }

    setIsLoading(true)
    try {
      const result = await contract.setComplianceTarget(offsetTarget)

      if (result.success) {
        toast({
          title: "Compliance Target Set",
          description: "Compliance target has been set successfully.",
        })
      } else {
        toast({
          title: "Setting Failed",
          description: result.error || "Failed to set compliance target",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }

      toast({
        title: "Setting Failed",
        description: errorResult.error,
        variant: "destructive",
      })

      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [contract])

  return {
    contract,
    isLoading,
    isContractReady: !!contract,

    // Role management
    detectUserRole,
    registerAsCompany,
    registerAsProject,

    // Admin functions
    addVerifier,
    removeVerifier,

    // Verifier functions
    verifyCompany,
    verifyProject,

    // Data fetching
    getCompanyDetails,
    getProjectDetails,
    getMyCompanyDashboard,
    getPlatformStats,

    // Emissions tracking
    recordEmissions,
    getEmissionRecord,

    // Carbon credit functions
    mintCarbonCredits,
    transferCredits,
    retireCredits,
    getCreditDetails,

    // Marketplace functions
    purchaseCredits,
    getTransactionDetails,

    // Certificate functions
    generateOffsetCertificate,

    // Company management
    updateCompanyEmissions,
    setComplianceTarget,
  }
}
