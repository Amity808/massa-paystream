# 🤖 AI Frontend Building Prompt

## 🎯 **Main Prompt**

Build a modern, professional **Carbon Credit Platform** frontend using **Next.js 14**, **TypeScript**, and **Tailwind CSS**. Create a comprehensive dashboard system for companies to track emissions, purchase carbon credits, and achieve ESG compliance. Implement role-based access for **Companies**, **Project Owners**, **Verifiers**, and **Admins**. Include interactive charts, real-time blockchain data, and seamless **Massa wallet integration**. Focus on clean design, intuitive UX, and mobile responsiveness. Use the provided smart contract functions for all blockchain interactions.

## 📋 **Detailed Requirements**

### **Technical Stack**

- Framework: Next.js 14+ with TypeScript
- Styling: Tailwind CSS + shadcn/ui components
- Blockchain: Massa blockchain integration via @massalabs/massa-web3
- State Management: React Context + Custom hooks
- Charts: Recharts for data visualization
- Forms: React Hook Form with Zod validation
- Icons: Lucide React

### **Core Features to Build**

#### **1. Landing Page**

- Hero section: "Accelerate Your Carbon Neutral Journey"
- Features showcase: Emissions tracking, marketplace, compliance
- Live platform statistics
- Call-to-action buttons

#### **2. Authentication System**

- Massa wallet connection (Station wallet)
- Role selection after connection
- Account registration flows

#### **3. Company Dashboard**

- **Main Dashboard**: Key metrics cards, emissions charts, compliance progress
- **Emissions Tracking**: Record new emissions, history table, analytics
- **Carbon Marketplace**: Browse/purchase credits, filters, transaction flow
- **My Credits**: Owned credits table, retirement interface, transfers
- **Compliance Center**: Progress tracking, target setting, certificates

#### **4. Project Owner Dashboard**

- **Project Management**: Project grid, registration form, status tracking
- **Credit Minting**: Mint new credits interface, minting history
- **Revenue Analytics**: Earnings dashboard, market performance

#### **5. Admin Dashboard**

- **Platform Overview**: System statistics, real-time activity
- **User Management**: User directory, verification queue
- **Analytics**: Comprehensive reporting and metrics

#### **6. Verifier Dashboard**

- **Verification Queue**: Pending reviews, approval interface
- **Review Tools**: Document validation, compliance checking

### **Smart Contract Integration**

Integrate these functions from our Massa smart contract:

```typescript
// Company Functions
registerCompany();
updateCompanyEmissions();
setComplianceTarget();
getMyCompanyDashboard();

// Emissions
recordEmissions();
verifyEmissionRecord();
getEmissionRecord();

// Projects
registerProject();
verifyProject();
getMyProjectDashboard();

// Carbon Credits
mintCarbonCredits();
transferCredits();
retireCredits();
purchaseCredits();
getCreditDetails();

// Certificates
generateOffsetCertificate();

// Admin
addVerifier();
removeVerifier();
getPlatformStats();
```

### **Design Requirements**

#### **Color Scheme**

- Primary: Green tones (#22c55e, #16a34a) for sustainability
- Secondary: Blue (#3b82f6) for trust
- Accent: Orange (#f97316) for CTAs
- Success: #10b981, Warning: #f59e0b, Error: #ef4444

#### **Visual Style**

- Clean, modern design with card-based layouts
- Professional typography (Inter font)
- Smooth animations and micro-interactions
- Data-rich dashboards with intuitive charts

### **Key User Flows**

#### **Company Onboarding**

1. Connect Wallet → 2. Register Company → 3. Upload Documents → 4. Wait for Verification → 5. Set Targets → 6. Start Tracking

#### **Carbon Offsetting**

1. Record Emissions → 2. Browse Marketplace → 3. Purchase Credits → 4. Retire Credits → 5. Generate Certificate

#### **Project Registration**

1. Connect Wallet → 2. Register Project → 3. Upload Docs → 4. Get Verified → 5. Mint Credits → 6. List on Marketplace

### **Charts & Data Visualization**

- Line charts for emissions trends
- Pie charts for emissions by scope
- Bar charts for credit comparisons
- Gauge charts for compliance progress
- Interactive tooltips and drill-downs

### **Essential Components to Build**

- CreditCard component
- EmissionChart component
- ComplianceGauge component
- ProjectCard component
- TransactionTable component
- DashboardWidget component
- WalletConnect component
- RoleSelector component

## 🚀 **Getting Started**

1. **Set up Next.js project** with TypeScript and Tailwind
2. **Install dependencies**: shadcn/ui, @massalabs/massa-web3, recharts
3. **Create the folder structure** for pages and components
4. **Implement wallet connection** first
5. **Build role-based routing** system
6. **Create dashboards** for each user type
7. **Integrate smart contract** functions
8. **Add charts and analytics**
9. **Implement responsive design**
10. **Add error handling and loading states**

## 📁 **File Structure**

```
src/
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   │   ├── company/
│   │   ├── project/
│   │   ├── admin/
│   │   └── verifier/
│   └── marketplace/
├── components/
│   ├── ui/ (shadcn components)
│   ├── charts/
│   ├── forms/
│   └── dashboard/
├── contexts/
│   ├── WalletContext.tsx
│   └── UserContext.tsx
├── hooks/
│   ├── useContract.ts
│   └── useWallet.ts
└── lib/
    ├── contract.ts
    └── utils.ts
```

## 🎯 **Success Criteria**

✅ All 4 user role dashboards working  
✅ Complete emissions tracking system  
✅ Functional carbon credit marketplace  
✅ Compliance monitoring with charts  
✅ Certificate generation  
✅ Mobile-responsive design  
✅ Massa wallet integration  
✅ Real-time blockchain data  
✅ Professional, modern UI

---

**Reference**: Use `FRONTEND_SPECIFICATION.md` for complete detailed requirements and `my-first-sc/assembly/contracts/main.ts` for smart contract functions.
