import { SmartContract, Args, bytesToStr } from "@massalabs/massa-web3"
import type { UserRole } from "@/lib/types"

export const CARBON_CREDIT_CONTRACT_ADDRESS = "AS1YGnZa9trz13AdDyZx2Gj49xmt4UgKzwP3kZEn73rAPb2ar3NS"

export interface ContractInteractionResult {
  success: boolean
  data?: any
  error?: string
  txHash?: string
}

export class CarbonCreditContract {
  private contract: SmartContract
  private provider: any

  constructor(provider: any) {
    console.log("CarbonCreditContract constructor called with provider:", provider)
    console.log("Contract address:", CARBON_CREDIT_CONTRACT_ADDRESS)

    this.provider = provider

    try {
      this.contract = new SmartContract(provider, CARBON_CREDIT_CONTRACT_ADDRESS)
      console.log("SmartContract instance created successfully")
    } catch (error) {
      console.error("Failed to create SmartContract instance:", error)
      throw error
    }
  }

  // =====================================================================
  // CONTRACT CONNECTIVITY TEST
  // =====================================================================

  async testConnectivity(): Promise<ContractInteractionResult> {
    try {
      console.log("Testing contract connectivity with getPlatformStats...")
      const result = await this.contract.read('getPlatformStats')
      console.log("Connectivity test successful:", result)
      return { success: true, data: "Contract connectivity OK" }
    } catch (error) {
      console.error("Connectivity test failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connectivity test failed'
      }
    }
  }

  // =====================================================================
  // ROLE CHECKING FUNCTIONS
  // =====================================================================

  async checkUserRole(address: string): Promise<UserRole> {
    try {
      console.log("checkUserRole: Checking role for address:", address)

      // Check if user is a registered company
      try {
        const companyResult = await this.contract.read('getCompanyDetails', new Args().addString(address))
        if (companyResult.value && companyResult.value.length > 0) {
          const companyData = bytesToStr(companyResult.value)
          console.log("checkUserRole: Found company data:", companyData)
          if (companyData && companyData.trim().length > 0) {
            console.log("checkUserRole: User is a company")
            return 'company'
          }
        }
      } catch (error) {
        console.log("checkUserRole: Not a company:", error)
      }

      // Check if user is admin by trying to call admin-only function
      try {
        await this.contract.read('getPlatformStats')
        console.log("checkUserRole: User is admin")
        return 'admin'
      } catch (error) {
        console.log("checkUserRole: Not admin:", error)
      }

      // Check if user is verifier by trying verifier function
      try {
        // Try to call a verifier-only read function - this will fail if not verifier
        // We'll use a dummy address to test permissions
        await this.contract.read('verifyCompany', new Args().addString("dummy"))
        console.log("checkUserRole: User is verifier")
        return 'verifier'
      } catch (error) {
        console.log("checkUserRole: Not verifier:", error)
      }

      // Check if user has any projects (project owner)
      // For now, we'll skip this as it requires more complex logic

      console.log("checkUserRole: No role found")
      return null
    } catch (error) {
      console.error('checkUserRole: Error checking user role:', error)
      return null
    }
  }

  // =====================================================================
  // ADMIN FUNCTIONS
  // =====================================================================

  async addVerifier(verifierAddress: string, role: string): Promise<ContractInteractionResult> {
    try {
      const args = new Args()
        .addString(verifierAddress)
        .addString(role)

      const result = await this.contract.call('addVerifier', args, { coins: BigInt(10000000) })

      return {
        success: true,
        txHash: result.id,
        data: { verifierAddress, role }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add verifier'
      }
    }
  }

  async removeVerifier(verifierAddress: string): Promise<ContractInteractionResult> {
    try {
      const args = new Args().addString(verifierAddress)
      const result = await this.contract.call('removeVerifier', args, { coins: BigInt(10000000) })

      return {
        success: true,
        txHash: result.id,
        data: { verifierAddress }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove verifier'
      }
    }
  }

  async getPlatformStats(): Promise<ContractInteractionResult> {
    try {
      const result = await this.contract.read('getPlatformStats')
      const statsData = bytesToStr(result.value)

      return {
        success: true,
        data: statsData
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get platform stats'
      }
    }
  }

  // =====================================================================
  // COMPANY FUNCTIONS
  // =====================================================================

  async registerCompany(
    businessName: string,
    registrationNumber: string,
    industry: string,
    annualEmissions: number
  ): Promise<ContractInteractionResult> {
    try {
      console.log("Preparing contract call with args:", { businessName, registrationNumber, industry, annualEmissions })

      const args = new Args()
        .addString(businessName)
        .addString(registrationNumber)
        .addString(industry)
        .addU64(BigInt(annualEmissions))

      console.log("Args prepared, calling contract function 'registerCompany'...")
      console.log("Contract address:", CARBON_CREDIT_CONTRACT_ADDRESS)

      // Add coins to the call (smart contracts on Massa may require gas/coins)
      const callOptions = { coins: BigInt(100000000) } // 0.1 MAS in nanoMAS
      console.log("Calling with options:", callOptions)

      const result = await this.contract.call('registerCompany', args, callOptions)

      console.log("Contract call successful:", result)

      return {
        success: true,
        txHash: result.id,
        data: { businessName, registrationNumber, industry, annualEmissions }
      }
    } catch (error) {
      console.error("Contract call failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register company'
      }
    }
  }

  async getCompanyDetails(address: string): Promise<ContractInteractionResult> {
    try {
      console.log("getCompanyDetails called with address:", address)
      const args = new Args().addString(address)
      console.log("Calling contract.read('getCompanyDetails', args)...")
      const result = await this.contract.read('getCompanyDetails', args)
      console.log("Contract read result:", result)
      const companyData = bytesToStr(result.value)
      console.log("Parsed company data string:", companyData)

      // Parse the pipe-separated data
      const parts = companyData.split('|')
      console.log("Split parts:", parts)
      const company = {
        businessName: parts[0]?.replace(/[\u0000*]/g, '').trim() || '', // Clean null characters
        registrationNumber: parts[1]?.trim() || '',
        industry: parts[2]?.trim() || '',
        annualEmissions: parts[3]?.trim() || '0',
        isVerified: parts[4]?.trim() === 'true',
        registrationDate: parts[5]?.trim() || '0',
        totalOffsetsRequired: parts[6]?.trim() || '0',
        totalCreditsRetired: parts[7]?.trim() || '0',
        complianceTarget: parts[8]?.trim() || '0'
      }

      console.log("Parsed company object:", company)

      return {
        success: true,
        data: company
      }
    } catch (error) {
      console.error("getCompanyDetails error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Company not found'
      }
    }
  }

  async getMyCompanyDashboard(): Promise<ContractInteractionResult> {
    try {
      const result = await this.contract.read('getMyCompanyDashboard')
      const dashboardData = bytesToStr(result.value)

      return {
        success: true,
        data: dashboardData
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get company dashboard'
      }
    }
  }

  // =====================================================================
  // PROJECT FUNCTIONS
  // =====================================================================

  async registerProject(
    projectId: string,
    projectName: string,
    projectType: string,
    location: string,
    totalCapacity: number
  ): Promise<ContractInteractionResult> {
    try {
      const args = new Args()
        .addString(projectId)
        .addString(projectName)
        .addString(projectType)
        .addString(location)
        .addU64(BigInt(totalCapacity))

      const result = await this.contract.call('registerProject', args, { coins: BigInt(100000000) })

      return {
        success: true,
        txHash: result.id,
        data: { projectId, projectName, projectType, location, totalCapacity }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register project'
      }
    }
  }

  async getProjectDetails(projectId: string): Promise<ContractInteractionResult> {
    try {
      const args = new Args().addString(projectId)
      const result = await this.contract.read('getProjectDetails', args)
      const projectData = bytesToStr(result.value)

      // Parse the pipe-separated data
      const parts = projectData.split('|')
      const project = {
        owner: parts[0],
        projectName: parts[1],
        projectType: parts[2],
        location: parts[3],
        totalCapacity: parts[4],
        creditsIssued: parts[5],
        creditsRetired: parts[6],
        isVerified: parts[7] === 'true',
        verificationBody: parts[8],
        registrationDate: parts[9],
        totalRevenue: parts[10],
        activeCredits: parts[11]
      }

      return {
        success: true,
        data: project
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Project not found'
      }
    }
  }

  // =====================================================================
  // VERIFIER FUNCTIONS
  // =====================================================================

  async verifyCompany(companyAddress: string): Promise<ContractInteractionResult> {
    try {
      const args = new Args().addString(companyAddress)
      const result = await this.contract.call('verifyCompany', args, { coins: BigInt(10000000) })

      return {
        success: true,
        txHash: result.id,
        data: { companyAddress }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify company'
      }
    }
  }

  async verifyProject(projectId: string, verificationBody: string): Promise<ContractInteractionResult> {
    try {
      const args = new Args()
        .addString(projectId)
        .addString(verificationBody)

      const result = await this.contract.call('verifyProject', args, { coins: BigInt(10000000) })

      return {
        success: true,
        txHash: result.id,
        data: { projectId, verificationBody }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify project'
      }
    }
  }

  // =====================================================================
  // EMISSIONS TRACKING FUNCTIONS
  // =====================================================================

  async recordEmissions(
    emissionAmount: number,
    scope: string,
    emissionSource: string,
    reportingPeriod: number
  ): Promise<ContractInteractionResult> {
    try {
      const args = new Args()
        .addU64(BigInt(emissionAmount))
        .addString(scope)
        .addString(emissionSource)
        .addU64(BigInt(reportingPeriod))

      const result = await this.contract.call('recordEmissions', args, { coins: BigInt(100000000) })

      return {
        success: true,
        txHash: result.id,
        data: { emissionAmount, scope, emissionSource, reportingPeriod }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record emissions'
      }
    }
  }

  async getEmissionRecord(recordId: number): Promise<ContractInteractionResult> {
    try {
      const args = new Args().addU64(BigInt(recordId))
      const result = await this.contract.read('getEmissionRecord', args)
      const emissionData = bytesToStr(result.value)

      // Parse the pipe-separated data
      const parts = emissionData.split('|')
      const emission = {
        companyAddress: parts[0],
        emissionAmount: parts[1],
        reportingPeriod: parts[2],
        scope: parts[3],
        emissionSource: parts[4],
        timestamp: parts[5],
        isVerified: parts[6] === 'true',
        verifiedBy: parts[7] || null
      }

      return {
        success: true,
        data: emission
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Emission record not found'
      }
    }
  }

  // =====================================================================
  // CARBON CREDIT FUNCTIONS
  // =====================================================================

  async mintCarbonCredits(
    projectId: string,
    tonnageCO2: number,
    vintage: number,
    creditType: string,
    price: number,
    verificationStandard: string,
    quantity: number
  ): Promise<ContractInteractionResult> {
    try {
      const args = new Args()
        .addString(projectId)
        .addU64(BigInt(tonnageCO2))
        .addU64(BigInt(vintage))
        .addString(creditType)
        .addU64(BigInt(price))
        .addString(verificationStandard)
        .addU64(BigInt(quantity))

      const result = await this.contract.call('mintCarbonCredits', args, { coins: BigInt(100000000) })

      return {
        success: true,
        txHash: result.id,
        data: { projectId, tonnageCO2, vintage, creditType, price, verificationStandard, quantity }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mint carbon credits'
      }
    }
  }

  async transferCredits(to: string, creditIds: string[]): Promise<ContractInteractionResult> {
    try {
      const args = new Args()
        .addString(to)
        .addString(creditIds.join(','))

      const result = await this.contract.call('transferCredits', args, { coins: BigInt(10000000) })

      return {
        success: true,
        txHash: result.id,
        data: { to, creditIds }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transfer credits'
      }
    }
  }

  async retireCredits(creditIds: string[], retirementReason: string): Promise<ContractInteractionResult> {
    try {
      const args = new Args()
        .addString(creditIds.join(','))
        .addString(retirementReason)

      const result = await this.contract.call('retireCredits', args, { coins: BigInt(10000000) })

      return {
        success: true,
        txHash: result.id,
        data: { creditIds, retirementReason }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retire credits'
      }
    }
  }

  async getCreditDetails(creditId: number): Promise<ContractInteractionResult> {
    try {
      const args = new Args().addU64(BigInt(creditId))
      const result = await this.contract.read('getCreditDetails', args)
      const creditData = bytesToStr(result.value)

      // Parse the pipe-separated data
      const parts = creditData.split('|')
      const credit = {
        tonnageCO2: parts[0],
        projectId: parts[1],
        issuer: parts[2],
        vintage: parts[3],
        creditType: parts[4],
        price: parts[5],
        isRetired: parts[6] === 'true',
        creationDate: parts[7],
        verificationStandard: parts[8],
        currentOwner: parts[9],
        retiredBy: parts[10] || null,
        retirementReason: parts[11] || null
      }

      return {
        success: true,
        data: credit
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Credit not found'
      }
    }
  }

  // =====================================================================
  // MARKETPLACE FUNCTIONS
  // =====================================================================

  async purchaseCredits(
    creditIds: string[],
    maxTotalPrice: number,
    purpose: string
  ): Promise<ContractInteractionResult> {
    try {
      const args = new Args()
        .addString(creditIds.join(','))
        .addU64(BigInt(maxTotalPrice))
        .addString(purpose)

      const result = await this.contract.call('purchaseCredits', args, { coins: BigInt(100000000) })

      return {
        success: true,
        txHash: result.id,
        data: { creditIds, maxTotalPrice, purpose }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to purchase credits'
      }
    }
  }

  async getTransactionDetails(transactionId: number): Promise<ContractInteractionResult> {
    try {
      const args = new Args().addU64(BigInt(transactionId))
      const result = await this.contract.read('getTransactionDetails', args)
      const transactionData = bytesToStr(result.value)

      // Parse the pipe-separated data
      const parts = transactionData.split('|')
      const transaction = {
        buyer: parts[0],
        seller: parts[1],
        projectId: parts[2],
        creditIds: parts[3],
        totalTonnage: parts[4],
        totalPrice: parts[5],
        timestamp: parts[6],
        purpose: parts[7]
      }

      return {
        success: true,
        data: transaction
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction not found'
      }
    }
  }

  // =====================================================================
  // CERTIFICATE FUNCTIONS
  // =====================================================================

  async generateOffsetCertificate(
    transactionId: number,
    certificateType: string
  ): Promise<ContractInteractionResult> {
    try {
      const args = new Args()
        .addU64(BigInt(transactionId))
        .addString(certificateType)

      const result = await this.contract.call('generateOffsetCertificate', args, { coins: BigInt(10000000) })

      return {
        success: true,
        txHash: result.id,
        data: { transactionId, certificateType }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate certificate'
      }
    }
  }

  // =====================================================================
  // COMPANY MANAGEMENT FUNCTIONS
  // =====================================================================

  async updateCompanyEmissions(newAnnualEmissions: number): Promise<ContractInteractionResult> {
    try {
      const args = new Args().addU64(BigInt(newAnnualEmissions))
      const result = await this.contract.call('updateCompanyEmissions', args, { coins: BigInt(10000000) })

      return {
        success: true,
        txHash: result.id,
        data: { newAnnualEmissions }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update company emissions'
      }
    }
  }

  async setComplianceTarget(offsetTarget: number): Promise<ContractInteractionResult> {
    try {
      const args = new Args().addU64(BigInt(offsetTarget))
      const result = await this.contract.call('setComplianceTarget', args, { coins: BigInt(10000000) })

      return {
        success: true,
        txHash: result.id,
        data: { offsetTarget }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set compliance target'
      }
    }
  }
}
