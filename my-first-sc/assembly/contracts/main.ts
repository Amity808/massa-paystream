import {
  Address,
  Context,
  generateEvent,
  Storage,
  transferCoins
} from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';

// =====================================================================
// STORAGE KEYS
// =====================================================================

const ADMIN_KEY = "ADMIN";
const VERIFIERS_KEY = "VERIFIERS";
const COMPANIES_KEY = "COMPANIES";
const CARBON_CREDITS_KEY = "CARBON_CREDITS";
const PROJECTS_KEY = "PROJECTS";
const EMISSION_RECORDS_KEY = "EMISSION_RECORDS";
const TRANSACTIONS_KEY = "TRANSACTIONS";
const CERTIFICATES_KEY = "CERTIFICATES";

// Counters
const CREDIT_COUNTER_KEY = "CREDIT_COUNTER";
const EMISSION_COUNTER_KEY = "EMISSION_COUNTER";
const TRANSACTION_COUNTER_KEY = "TRANSACTION_COUNTER";

// Tracking keys
const COMPANY_EMISSIONS_KEY = "COMPANY_EMISSIONS";
const COMPANY_TRANSACTIONS_KEY = "COMPANY_TRANSACTIONS";
const PROJECT_CREDITS_KEY = "PROJECT_CREDITS";

// =====================================================================
// HELPER FUNCTIONS
// =====================================================================

function onlyAdmin(): void {
  const caller = Context.caller();
  assert(Storage.has(ADMIN_KEY), "No admin set");
  const admin = Storage.get(ADMIN_KEY);
  assert(caller.toString() === admin, "Only admin can call this function");
}

function onlyVerifier(): void {
  const caller = Context.caller();
  const verifierKey = VERIFIERS_KEY + "_" + caller.toString();
  assert(Storage.has(verifierKey), "Only verifiers can call this function");
}

function onlyRegisteredCompany(): void {
  const caller = Context.caller();
  const companyKey = COMPANIES_KEY + "_" + caller.toString();
  assert(Storage.has(companyKey), "Only registered companies can call this function");
}

function getNextId(counterKey: string): u64 {
  let counter: u64 = 1;
  if (Storage.has(counterKey)) {
    counter = <u64>parseInt(Storage.get(counterKey));
  }
  Storage.set(counterKey, (counter + 1).toString());
  return counter;
}

function addToTracking(trackingKey: string, id: u64): void {
  let ids = "";
  if (Storage.has(trackingKey)) {
    ids = Storage.get(trackingKey);
  }
  if (ids.length > 0) {
    ids += "," + id.toString();
  } else {
    ids = id.toString();
  }
  Storage.set(trackingKey, ids);
}

// =====================================================================
// CONSTRUCTOR AND ADMIN FUNCTIONS
// =====================================================================

export function constructor(binaryArgs: StaticArray<u8>): void {
  assert(Context.isDeployingContract());

  const args = new Args(binaryArgs);
  const adminAddress = args.nextString().expect("Admin address missing");

  Storage.set(ADMIN_KEY, adminAddress);

  // Initialize counters
  Storage.set(CREDIT_COUNTER_KEY, "1");
  Storage.set(EMISSION_COUNTER_KEY, "1");
  Storage.set(TRANSACTION_COUNTER_KEY, "1");

  generateEvent("Carbon Credit Platform initialized with admin: " + adminAddress);
}

export function setAdmin(binaryArgs: StaticArray<u8>): void {
  onlyAdmin();
  const args = new Args(binaryArgs);
  const newAdmin = args.nextString().expect("Admin address missing");
  Storage.set(ADMIN_KEY, newAdmin);
  generateEvent("Admin changed to: " + newAdmin);
}

export function addVerifier(binaryArgs: StaticArray<u8>): void {
  onlyAdmin();
  const args = new Args(binaryArgs);
  const verifier = args.nextString().expect("Verifier address missing");
  const role = args.nextString().expect("Role missing");

  const verifierKey = VERIFIERS_KEY + "_" + verifier;
  Storage.set(verifierKey, role);

  generateEvent("Verifier added: " + verifier + " with role: " + role);
}

export function removeVerifier(binaryArgs: StaticArray<u8>): void {
  onlyAdmin();
  const args = new Args(binaryArgs);
  const verifier = args.nextString().expect("Verifier address missing");
  const verifierKey = VERIFIERS_KEY + "_" + verifier;
  Storage.del(verifierKey);

  generateEvent("Verifier removed: " + verifier);
}

// =====================================================================
// COMPANY MANAGEMENT
// =====================================================================

export function registerCompany(binaryArgs: StaticArray<u8>): void {
  const caller = Context.caller();
  const args = new Args(binaryArgs);
  const businessName = args.nextString().expect("Business name missing");
  const registrationNumber = args.nextString().expect("Registration number missing");
  const industry = args.nextString().expect("Industry missing");
  const annualEmissions = args.nextU64().expect("Annual emissions missing");

  const companyKey = COMPANIES_KEY + "_" + caller.toString();
  assert(!Storage.has(companyKey), "Company already registered");

  // Store company data as pipe-separated string
  const companyData = businessName + "|" + registrationNumber + "|" + industry + "|" +
    annualEmissions.toString() + "|false|" + Context.timestamp().toString() +
    "|0|0|0"; // isVerified|registrationDate|totalOffsetsRequired|totalCreditsRetired|complianceTarget

  Storage.set(companyKey, companyData);

  generateEvent("Company registered: " + businessName + " by " + caller.toString());
}

export function verifyCompany(binaryArgs: StaticArray<u8>): void {
  onlyVerifier();
  const args = new Args(binaryArgs);
  const companyAddress = args.nextString().expect("Company address missing");
  const companyKey = COMPANIES_KEY + "_" + companyAddress;

  assert(Storage.has(companyKey), "Company not found");

  const companyData = Storage.get(companyKey);
  const parts = companyData.split("|");

  // Update verification status (index 4)
  const updatedData = parts[0] + "|" + parts[1] + "|" + parts[2] + "|" + parts[3] +
    "|true|" + parts[5] + "|" + parts[6] + "|" + parts[7] + "|" + parts[8];

  Storage.set(companyKey, updatedData);

  generateEvent("Company verified: " + companyAddress);
}

export function updateCompanyEmissions(binaryArgs: StaticArray<u8>): void {
  onlyRegisteredCompany();
  const caller = Context.caller();
  const args = new Args(binaryArgs);
  const newAnnualEmissions = args.nextU64().expect("Annual emissions missing");

  const companyKey = COMPANIES_KEY + "_" + caller.toString();
  const companyData = Storage.get(companyKey);
  const parts = companyData.split("|");

  // Update annual emissions (index 3)
  const updatedData = parts[0] + "|" + parts[1] + "|" + parts[2] + "|" +
    newAnnualEmissions.toString() + "|" + parts[4] + "|" + parts[5] +
    "|" + parts[6] + "|" + parts[7] + "|" + parts[8];

  Storage.set(companyKey, updatedData);

  generateEvent("Company emissions updated: " + caller.toString() + " to " + newAnnualEmissions.toString());
}

export function setComplianceTarget(binaryArgs: StaticArray<u8>): void {
  onlyRegisteredCompany();
  const caller = Context.caller();
  const args = new Args(binaryArgs);
  const offsetTarget = args.nextU64().expect("Offset target missing");

  const companyKey = COMPANIES_KEY + "_" + caller.toString();
  const companyData = Storage.get(companyKey);
  const parts = companyData.split("|");

  // Update compliance target (index 8)
  const updatedData = parts[0] + "|" + parts[1] + "|" + parts[2] + "|" + parts[3] +
    "|" + parts[4] + "|" + parts[5] + "|" + parts[6] + "|" + parts[7] +
    "|" + offsetTarget.toString();

  Storage.set(companyKey, updatedData);

  generateEvent("Compliance target set: " + caller.toString() + " target: " + offsetTarget.toString());
}

// =====================================================================
// EMISSIONS TRACKING
// =====================================================================

export function recordEmissions(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  onlyRegisteredCompany();
  const caller = Context.caller();
  const args = new Args(binaryArgs);
  const emissionAmount = args.nextU64().expect("Emission amount missing");
  const scope = args.nextString().expect("Scope missing");
  const emissionSource = args.nextString().expect("Emission source missing");
  const reportingPeriod = args.nextU64().expect("Reporting period missing");

  const recordId = getNextId(EMISSION_COUNTER_KEY);

  // Store emission record
  const emissionData = caller.toString() + "|" + emissionAmount.toString() + "|" +
    reportingPeriod.toString() + "|" + scope + "|" + emissionSource +
    "|" + Context.timestamp().toString() + "|false|"; // isVerified|verifiedBy

  const recordKey = EMISSION_RECORDS_KEY + "_" + recordId.toString();
  Storage.set(recordKey, emissionData);

  // Track for company
  const trackingKey = COMPANY_EMISSIONS_KEY + "_" + caller.toString();
  addToTracking(trackingKey, recordId);

  generateEvent("Emission recorded: " + recordId.toString() + " by " + caller.toString() + " amount: " + emissionAmount.toString());

  return new Args().add(recordId).serialize();
}

export function verifyEmissionRecord(binaryArgs: StaticArray<u8>): void {
  onlyVerifier();
  const args = new Args(binaryArgs);
  const recordId = args.nextU64().expect("Record ID missing");
  const isValid = args.nextBool().expect("Validation status missing");

  const recordKey = EMISSION_RECORDS_KEY + "_" + recordId.toString();
  assert(Storage.has(recordKey), "Emission record not found");

  const emissionData = Storage.get(recordKey);
  const parts = emissionData.split("|");

  // Update verification status
  const updatedData = parts[0] + "|" + parts[1] + "|" + parts[2] + "|" + parts[3] +
    "|" + parts[4] + "|" + parts[5] + "|" + isValid.toString() +
    "|" + Context.caller().toString();

  Storage.set(recordKey, updatedData);

  generateEvent("Emission record verified: " + recordId.toString() + " status: " + isValid.toString());
}

// =====================================================================
// PROJECT MANAGEMENT
// =====================================================================

export function registerProject(binaryArgs: StaticArray<u8>): void {
  const caller = Context.caller();
  const args = new Args(binaryArgs);
  const projectId = args.nextString().expect("Project ID missing");
  const projectName = args.nextString().expect("Project name missing");
  const projectType = args.nextString().expect("Project type missing");
  const location = args.nextString().expect("Location missing");
  const totalCapacity = args.nextU64().expect("Total capacity missing");

  const projectKey = PROJECTS_KEY + "_" + projectId;
  assert(!Storage.has(projectKey), "Project already exists");

  // Store project data
  const projectData = caller.toString() + "|" + projectName + "|" + projectType + "|" +
    location + "|" + totalCapacity.toString() + "|0|0|false||" +
    Context.timestamp().toString() + "|0|0";
  // creditsIssued|creditsRetired|isVerified|verificationBody|registrationDate|totalRevenue|activeCredits

  Storage.set(projectKey, projectData);

  generateEvent("Project registered: " + projectId + " by " + caller.toString());
}

export function verifyProject(binaryArgs: StaticArray<u8>): void {
  onlyVerifier();
  const args = new Args(binaryArgs);
  const projectId = args.nextString().expect("Project ID missing");
  const verificationBody = args.nextString().expect("Verification body missing");

  const projectKey = PROJECTS_KEY + "_" + projectId;
  assert(Storage.has(projectKey), "Project not found");

  const projectData = Storage.get(projectKey);
  const parts = projectData.split("|");

  // Update verification status (index 7)
  const updatedData = parts[0] + "|" + parts[1] + "|" + parts[2] + "|" + parts[3] +
    "|" + parts[4] + "|" + parts[5] + "|" + parts[6] + "|true|" +
    verificationBody + "|" + parts[9] + "|" + parts[10] + "|" + parts[11];

  Storage.set(projectKey, updatedData);

  generateEvent("Project verified: " + projectId + " by " + verificationBody);
}

// =====================================================================
// CARBON CREDIT FUNCTIONS
// =====================================================================

export function mintCarbonCredits(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const caller = Context.caller();
  const args = new Args(binaryArgs);
  const projectId = args.nextString().expect("Project ID missing");
  const tonnageCO2 = args.nextU64().expect("Tonnage CO2 missing");
  const vintage = args.nextU64().expect("Vintage missing");
  const creditType = args.nextString().expect("Credit type missing");
  const price = args.nextU64().expect("Price missing");
  const verificationStandard = args.nextString().expect("Verification standard missing");
  const quantity = args.nextU64().expect("Quantity missing");

  // Verify project exists and caller is owner
  const projectKey = PROJECTS_KEY + "_" + projectId;
  assert(Storage.has(projectKey), "Project not found");

  const projectData = Storage.get(projectKey);
  const projectParts = projectData.split("|");
  assert(projectParts[0] === caller.toString(), "Only project owner can mint credits");
  assert(projectParts[7] === "true", "Project must be verified to mint credits");

  let creditIds = "";

  for (let i: u64 = 0; i < quantity; i++) {
    const creditId = getNextId(CREDIT_COUNTER_KEY);

    // Store carbon credit data
    const creditData = tonnageCO2.toString() + "|" + projectId + "|" + caller.toString() +
      "|" + vintage.toString() + "|" + creditType + "|" + price.toString() +
      "|false|" + Context.timestamp().toString() + "|" + verificationStandard +
      "|" + caller.toString() + "|||"; // isRetired|creationDate|verificationStandard|currentOwner|retiredBy|retirementReason

    const creditKey = CARBON_CREDITS_KEY + "_" + creditId.toString();
    Storage.set(creditKey, creditData);

    if (creditIds.length > 0) {
      creditIds += "," + creditId.toString();
    } else {
      creditIds = creditId.toString();
    }

    // Track for project
    const trackingKey = PROJECT_CREDITS_KEY + "_" + projectId;
    addToTracking(trackingKey, creditId);
  }

  // Update project stats
  const currentIssued = <u64>parseInt(projectParts[5]);
  const currentActive = <u64>parseInt(projectParts[11]);
  const newIssued = currentIssued + (quantity * tonnageCO2);
  const newActive = currentActive + (quantity * tonnageCO2);

  const updatedProjectData = projectParts[0] + "|" + projectParts[1] + "|" + projectParts[2] +
    "|" + projectParts[3] + "|" + projectParts[4] + "|" + newIssued.toString() +
    "|" + projectParts[6] + "|" + projectParts[7] + "|" + projectParts[8] +
    "|" + projectParts[9] + "|" + projectParts[10] + "|" + newActive.toString();

  Storage.set(projectKey, updatedProjectData);

  generateEvent("Carbon credits minted: " + quantity.toString() + " credits for project " + projectId);

  return new Args().add(creditIds).serialize();
}

export function transferCredits(binaryArgs: StaticArray<u8>): void {
  const caller = Context.caller();
  const args = new Args(binaryArgs);
  const to = args.nextString().expect("Recipient address missing");
  const creditIdsStr = args.nextString().expect("Credit IDs missing");

  const creditIds = creditIdsStr.split(",");

  for (let i = 0; i < creditIds.length; i++) {
    const creditId = creditIds[i];
    const creditKey = CARBON_CREDITS_KEY + "_" + creditId;
    assert(Storage.has(creditKey), "Credit not found: " + creditId);

    const creditData = Storage.get(creditKey);
    const parts = creditData.split("|");

    assert(parts[9] === caller.toString(), "Only current owner can transfer");
    assert(parts[6] === "false", "Cannot transfer retired credits");

    // Update current owner (index 9)
    const updatedData = parts[0] + "|" + parts[1] + "|" + parts[2] + "|" + parts[3] +
      "|" + parts[4] + "|" + parts[5] + "|" + parts[6] + "|" + parts[7] +
      "|" + parts[8] + "|" + to + "|" + parts[10] + "|" + parts[11];

    Storage.set(creditKey, updatedData);
  }

  generateEvent("Credits transferred from " + caller.toString() + " to " + to);
}

export function retireCredits(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const caller = Context.caller();
  const args = new Args(binaryArgs);
  const creditIdsStr = args.nextString().expect("Credit IDs missing");
  const retirementReason = args.nextString().expect("Retirement reason missing");

  const creditIds = creditIdsStr.split(",");
  let totalTonnage: u64 = 0;
  let projectId = "";

  for (let i = 0; i < creditIds.length; i++) {
    const creditId = creditIds[i];
    const creditKey = CARBON_CREDITS_KEY + "_" + creditId;
    assert(Storage.has(creditKey), "Credit not found: " + creditId);

    const creditData = Storage.get(creditKey);
    const parts = creditData.split("|");

    assert(parts[9] === caller.toString(), "Only current owner can retire");
    assert(parts[6] === "false", "Credit already retired");

    // Mark as retired (index 6, 10, 11)
    const updatedData = parts[0] + "|" + parts[1] + "|" + parts[2] + "|" + parts[3] +
      "|" + parts[4] + "|" + parts[5] + "|true|" + parts[7] +
      "|" + parts[8] + "|" + parts[9] + "|" + caller.toString() +
      "|" + retirementReason;

    Storage.set(creditKey, updatedData);

    totalTonnage += <u64>parseInt(parts[0]);
    if (projectId === "") {
      projectId = parts[1];
    }
  }

  // Create transaction record
  const transactionId = getNextId(TRANSACTION_COUNTER_KEY);
  const transactionData = caller.toString() + "|" + caller.toString() + "|" + projectId +
    "|" + creditIdsStr + "|" + totalTonnage.toString() + "|0|" +
    Context.timestamp().toString() + "|" + retirementReason + "|";

  const transactionKey = TRANSACTIONS_KEY + "_" + transactionId.toString();
  Storage.set(transactionKey, transactionData);

  // Track for company
  const trackingKey = COMPANY_TRANSACTIONS_KEY + "_" + caller.toString();
  addToTracking(trackingKey, transactionId);

  // Update company total retired credits
  const companyKey = COMPANIES_KEY + "_" + caller.toString();
  if (Storage.has(companyKey)) {
    const companyData = Storage.get(companyKey);
    const companyParts = companyData.split("|");
    const currentRetired = <u64>parseInt(companyParts[7]);

    const updatedCompanyData = companyParts[0] + "|" + companyParts[1] + "|" + companyParts[2] +
      "|" + companyParts[3] + "|" + companyParts[4] + "|" + companyParts[5] +
      "|" + companyParts[6] + "|" + (currentRetired + totalTonnage).toString() +
      "|" + companyParts[8];

    Storage.set(companyKey, updatedCompanyData);
  }

  generateEvent("Credits retired: " + totalTonnage.toString() + " tonnes by " + caller.toString());

  return new Args().add(transactionId).serialize();
}

// =====================================================================
// MARKETPLACE FUNCTIONS
// =====================================================================

export function purchaseCredits(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const caller = Context.caller();
  const args = new Args(binaryArgs);
  const creditIdsStr = args.nextString().expect("Credit IDs missing");
  const maxTotalPrice = args.nextU64().expect("Max total price missing");
  const purpose = args.nextString().expect("Purpose missing");

  const creditIds = creditIdsStr.split(",");
  let totalPrice: u64 = 0;
  let totalTonnage: u64 = 0;
  let seller = "";
  let projectId = "";

  // Calculate total price and verify ownership
  for (let i = 0; i < creditIds.length; i++) {
    const creditId = creditIds[i];
    const creditKey = CARBON_CREDITS_KEY + "_" + creditId;
    assert(Storage.has(creditKey), "Credit not found: " + creditId);

    const creditData = Storage.get(creditKey);
    const parts = creditData.split("|");

    assert(parts[6] === "false", "Cannot purchase retired credits");

    totalPrice += <u64>parseInt(parts[5]);
    totalTonnage += <u64>parseInt(parts[0]);

    if (i === 0) {
      seller = parts[9];
      projectId = parts[1];
    }

    // Transfer ownership (index 9)
    const updatedData = parts[0] + "|" + parts[1] + "|" + parts[2] + "|" + parts[3] +
      "|" + parts[4] + "|" + parts[5] + "|" + parts[6] + "|" + parts[7] +
      "|" + parts[8] + "|" + caller.toString() + "|" + parts[10] + "|" + parts[11];

    Storage.set(creditKey, updatedData);
  }

  assert(totalPrice <= maxTotalPrice, "Total price exceeds maximum");

  // Create transaction record
  const transactionId = getNextId(TRANSACTION_COUNTER_KEY);
  const transactionData = caller.toString() + "|" + seller + "|" + projectId +
    "|" + creditIdsStr + "|" + totalTonnage.toString() + "|" +
    totalPrice.toString() + "|" + Context.timestamp().toString() +
    "|" + purpose + "|";

  const transactionKey = TRANSACTIONS_KEY + "_" + transactionId.toString();
  Storage.set(transactionKey, transactionData);

  generateEvent("Credits purchased: " + totalTonnage.toString() + " tonnes for " + totalPrice.toString() + " by " + caller.toString());

  return new Args().add(transactionId).serialize();
}

// =====================================================================
// CERTIFICATE FUNCTIONS
// =====================================================================

export function generateOffsetCertificate(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const caller = Context.caller();
  const args = new Args(binaryArgs);
  const transactionId = args.nextU64().expect("Transaction ID missing");
  const certificateType = args.nextString().expect("Certificate type missing");

  const transactionKey = TRANSACTIONS_KEY + "_" + transactionId.toString();
  assert(Storage.has(transactionKey), "Transaction not found");

  const transactionData = Storage.get(transactionKey);
  const parts = transactionData.split("|");

  assert(parts[0] === caller.toString(), "Only buyer can generate certificate");

  const certificateId = "CERT_" + transactionId.toString() + "_" + Context.timestamp().toString();

  const certificateData = caller.toString() + "|" + parts[4] + "|" + parts[3] +
    "|" + certificateType + "|" + Context.timestamp().toString() +
    "|true|" + transactionId.toString();

  const certificateKey = CERTIFICATES_KEY + "_" + certificateId;
  Storage.set(certificateKey, certificateData);

  generateEvent("Certificate generated: " + certificateId + " for " + caller.toString());

  return new Args().add(certificateId).serialize();
}

// =====================================================================
// QUERY FUNCTIONS
// =====================================================================

export function getCompanyDetails(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const companyAddress = args.nextString().expect("Company address missing");
  const companyKey = COMPANIES_KEY + "_" + companyAddress;
  assert(Storage.has(companyKey), "Company not found");

  const companyData = Storage.get(companyKey);
  return new Args().add(companyData).serialize();
}

export function getProjectDetails(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const projectId = args.nextString().expect("Project ID missing");
  const projectKey = PROJECTS_KEY + "_" + projectId;
  assert(Storage.has(projectKey), "Project not found");

  const projectData = Storage.get(projectKey);
  return new Args().add(projectData).serialize();
}

export function getCreditDetails(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const creditId = args.nextU64().expect("Credit ID missing");
  const creditKey = CARBON_CREDITS_KEY + "_" + creditId.toString();
  assert(Storage.has(creditKey), "Credit not found");

  const creditData = Storage.get(creditKey);
  return new Args().add(creditData).serialize();
}

export function getTransactionDetails(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const transactionId = args.nextU64().expect("Transaction ID missing");
  const transactionKey = TRANSACTIONS_KEY + "_" + transactionId.toString();
  assert(Storage.has(transactionKey), "Transaction not found");

  const transactionData = Storage.get(transactionKey);
  return new Args().add(transactionData).serialize();
}

export function getEmissionRecord(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const recordId = args.nextU64().expect("Record ID missing");
  const recordKey = EMISSION_RECORDS_KEY + "_" + recordId.toString();
  assert(Storage.has(recordKey), "Emission record not found");

  const recordData = Storage.get(recordKey);
  return new Args().add(recordData).serialize();
}

// =====================================================================
// DASHBOARD FUNCTIONS
// =====================================================================

export function getMyCompanyDashboard(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  onlyRegisteredCompany();
  const caller = Context.caller();

  const companyKey = COMPANIES_KEY + "_" + caller.toString();
  const companyData = Storage.get(companyKey);
  const parts = companyData.split("|");

  const businessName = parts[0];
  const annualEmissions = parts[3];
  const isVerified = parts[4];
  const totalCreditsRetired = parts[7];
  const complianceTarget = parts[8];

  let compliancePercentage: u64 = 0;
  const target = <u64>parseInt(complianceTarget);
  const retired = <u64>parseInt(totalCreditsRetired);

  if (target > 0) {
    compliancePercentage = (retired * 100) / target;
  }

  const dashboardData = "Company: " + businessName +
    "|Annual Emissions: " + annualEmissions +
    "|Total Offsets: " + totalCreditsRetired +
    "|Compliance Target: " + complianceTarget +
    "|Compliance %: " + compliancePercentage.toString() +
    "|Verified: " + isVerified;

  return new Args().add(dashboardData).serialize();
}

export function getMyProjectDashboard(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const caller = Context.caller();
  const args = new Args(binaryArgs);
  const projectId = args.nextString().expect("Project ID missing");

  const projectKey = PROJECTS_KEY + "_" + projectId;
  assert(Storage.has(projectKey), "Project not found");

  const projectData = Storage.get(projectKey);
  const parts = projectData.split("|");

  assert(parts[0] === caller.toString(), "Only project owner can view dashboard");

  const dashboardData = "Project: " + parts[1] +
    "|Type: " + parts[2] +
    "|Total Capacity: " + parts[4] +
    "|Credits Issued: " + parts[5] +
    "|Credits Retired: " + parts[6] +
    "|Active Credits: " + parts[11] +
    "|Total Revenue: " + parts[10] +
    "|Verified: " + parts[7];

  return new Args().add(dashboardData).serialize();
}

// =====================================================================
// ADMIN FUNCTIONS
// =====================================================================

export function getPlatformStats(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  onlyAdmin();

  let totalCreditsIssued: u64 = 0;
  let totalTransactions: u64 = 0;

  if (Storage.has(CREDIT_COUNTER_KEY)) {
    totalCreditsIssued = <u64>parseInt(Storage.get(CREDIT_COUNTER_KEY)) - 1;
  }

  if (Storage.has(TRANSACTION_COUNTER_KEY)) {
    totalTransactions = <u64>parseInt(Storage.get(TRANSACTION_COUNTER_KEY)) - 1;
  }

  const statsData = "Credits Issued: " + totalCreditsIssued.toString() +
    "|Total Transactions: " + totalTransactions.toString();

  return new Args().add(statsData).serialize();
}