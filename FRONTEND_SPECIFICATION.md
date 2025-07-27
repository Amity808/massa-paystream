# Carbon Credit Platform - Frontend Specification

## 🎯 **Project Overview**

Build a comprehensive **Carbon Credit Platform** frontend that interfaces with our Massa blockchain smart contract. This platform enables companies to track emissions, purchase carbon credits, and achieve ESG compliance through a modern, intuitive web interface.

## 🏗️ **Technical Stack Requirements**

- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Blockchain**: Massa blockchain integration via @massalabs/massa-web3
- **State Management**: React Context + Custom hooks
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Responsive**: Mobile-first design

## 👥 **User Roles & Access Control**

### 1. **Admin Dashboard** 🔧

- Platform-wide statistics and oversight
- User verification management
- System monitoring and analytics

### 2. **Company Dashboard** 🏢

- Emissions tracking and reporting
- Carbon credit purchases and retirements
- Compliance monitoring
- Certificate management

### 3. **Project Owner Dashboard** 🌱

- Project registration and management
- Carbon credit minting
- Revenue tracking
- Performance analytics

### 4. **Verifier Dashboard** ✅

- Project and company verification
- Emission record validation
- Compliance auditing

## 🎨 **Design Requirements**

### **Color Scheme**

- **Primary**: Green tones (#22c55e, #16a34a) for sustainability
- **Secondary**: Blue (#3b82f6) for trust and technology
- **Accent**: Orange (#f97316) for alerts and calls-to-action
- **Neutral**: Modern grays (#64748b, #94a3b8, #e2e8f0)
- **Success**: #10b981, **Warning**: #f59e0b, **Error**: #ef4444

### **Visual Style**

- Clean, modern design with plenty of white space
- Card-based layouts with subtle shadows
- Smooth animations and micro-interactions
- Professional typography (Inter or similar)
- Data-rich dashboards with intuitive charts

## 📱 **Core Pages & Components**

### **1. Landing Page** 🏠

```
Hero Section:
- "Accelerate Your Carbon Neutral Journey"
- Platform overview and value proposition
- CTA buttons: "Get Started" / "Learn More"

Features Section:
- Emissions Tracking
- Carbon Credit Marketplace
- Compliance Management
- Blockchain Transparency

Stats Section:
- Total credits issued
- Companies registered
- Tonnes of CO2 offset
- Active projects

Testimonials/Case Studies
Footer with links and contact info
```

### **2. Authentication** 🔐

```
Connect Wallet Page:
- Massa wallet connection (Station wallet)
- Role selection after connection
- Account creation flow
- Security information

Role Selection:
- Company Registration
- Project Owner Registration
- Request Verifier Access
- Admin Login
```

### **3. Company Dashboard** 🏢

#### **Main Dashboard**

```
Header:
- Company name and verification status badge
- Quick actions: "Record Emissions", "Buy Credits", "Generate Report"

Key Metrics Cards:
- Annual Emissions (with trend)
- Total Credits Retired
- Compliance Progress (circular progress bar)
- Current Carbon Footprint

Charts Section:
- Emissions over time (line chart)
- Emissions by scope (pie chart)
- Credits purchased vs retired (bar chart)
- Compliance timeline

Recent Activity Feed:
- Latest emissions recorded
- Recent credit purchases
- Certificates generated
- Compliance milestones
```

#### **Emissions Tracking Page**

```
Record New Emissions Form:
- Emission amount (tonnes CO2e)
- Scope selection (1, 2, 3)
- Source category dropdown
- Reporting period
- Supporting documentation upload
- Notes/description

Emissions History Table:
- Date, Amount, Scope, Source, Status
- Verification status indicators
- Filter and search functionality
- Export capabilities

Emissions Analytics:
- Monthly/yearly trends
- Scope breakdown
- Source analysis
- Benchmark comparisons
```

#### **Carbon Credits Marketplace**

```
Available Credits Grid:
- Credit cards showing:
  * Project name and type
  * Tonnage available
  * Price per tonne
  * Vintage year
  * Verification standard
  * Location
  * Project images

Filters Sidebar:
- Project type (forestry, renewable, etc.)
- Price range
- Location
- Vintage year
- Verification standard

Purchase Flow:
- Credit selection
- Quantity input
- Total cost calculation
- Payment confirmation
- Transaction success
```

#### **My Carbon Credits**

```
Owned Credits Table:
- Credit ID, Project, Tonnage, Vintage, Status
- Actions: Transfer, Retire, View Certificate

Retirement Interface:
- Select credits to retire
- Retirement reason
- Generate offset certificate
- Social sharing options

Transfer Interface:
- Recipient address input
- Credit selection
- Transfer confirmation
```

#### **Compliance Center**

```
Compliance Overview:
- Current compliance percentage
- Target vs actual offset
- Regulatory requirements
- Deadlines and milestones

Set Compliance Targets:
- Annual offset goals
- Regulatory compliance settings
- Automatic purchasing rules
- Notification preferences

Certificates Gallery:
- All generated certificates
- Download/share options
- Verification links
- Certificate authenticity checker
```

### **4. Project Owner Dashboard** 🌱

#### **Project Management**

```
My Projects Grid:
- Project cards with status indicators
- Quick stats: Credits issued, Revenue, Status
- Actions: View Details, Mint Credits, Update

Project Registration Form:
- Project basic information
- Location and mapping
- Project type and methodology
- Capacity and timeline
- Documentation upload
- Verification requirements
```

#### **Credit Minting Interface**

```
Mint New Credits Form:
- Project selection
- Tonnage per credit
- Vintage year
- Credit type
- Price setting
- Quantity to mint
- Verification documents

Minting History:
- All minted credits
- Status tracking
- Revenue analytics
- Market performance
```

#### **Revenue Analytics**

```
Revenue Dashboard:
- Total revenue earned
- Revenue by project
- Payment history
- Performance metrics

Market Analytics:
- Credit price trends
- Demand analysis
- Competitive positioning
- Sales forecasting
```

### **5. Admin Dashboard** 🔧

#### **Platform Overview**

```
System Statistics:
- Total users by role
- Platform transaction volume
- Revenue metrics
- Growth analytics

Real-time Activity:
- Recent registrations
- Live transactions
- System alerts
- User activity feed
```

#### **User Management**

```
User Directory:
- All registered users
- Verification status
- Activity levels
- Account management tools

Verification Queue:
- Pending verifications
- Review interface
- Approval/rejection tools
- Verification history
```

#### **Platform Analytics**

```
Comprehensive Reporting:
- Usage statistics
- Financial metrics
- Environmental impact
- Market trends
- Export capabilities
```

### **6. Verifier Dashboard** ✅

#### **Verification Queue**

```
Pending Reviews:
- Companies awaiting verification
- Projects needing approval
- Emission records to validate
- Priority indicators

Verification Interface:
- Document review
- Compliance checking
- Approval/rejection forms
- Comments and feedback
```

## 🔌 **Smart Contract Integration**

### **Required Functions Integration**

```typescript
// Company Management
-registerCompany() -
  updateCompanyEmissions() -
  setComplianceTarget() -
  getMyCompanyDashboard() -
  // Emissions Tracking
  recordEmissions() -
  verifyEmissionRecord() -
  getEmissionRecord() -
  // Project Management
  registerProject() -
  verifyProject() -
  getMyProjectDashboard() -
  // Carbon Credits
  mintCarbonCredits() -
  transferCredits() -
  retireCredits() -
  purchaseCredits() -
  getCreditDetails() -
  // Marketplace
  purchaseCredits() -
  getTransactionDetails() -
  // Certificates
  generateOffsetCertificate() -
  // Admin Functions
  addVerifier() -
  removeVerifier() -
  getPlatformStats();
```

### **Wallet Integration**

```typescript
// Massa Wallet Connection
- Connect/disconnect wallet
- Account switching
- Transaction signing
- Balance checking
- Network validation
```

## 📊 **Data Visualization Requirements**

### **Charts and Graphs**

- **Line Charts**: Emissions trends, compliance progress
- **Bar Charts**: Credits by type, monthly comparisons
- **Pie Charts**: Emissions by scope, project types
- **Area Charts**: Cumulative offsets over time
- **Gauge Charts**: Compliance percentage
- **Heatmaps**: Geographic project distribution

### **Interactive Elements**

- Hover tooltips with detailed information
- Drill-down capabilities
- Date range selectors
- Real-time data updates
- Export functionality

## 🎯 **Key Features to Implement**

### **Essential Features**

1. **Wallet Integration**: Seamless Massa wallet connection
2. **Role-based Access**: Different interfaces per user type
3. **Real-time Updates**: Live data from blockchain
4. **Responsive Design**: Works on all devices
5. **Data Export**: PDF reports, CSV downloads
6. **Search & Filters**: Easy data discovery
7. **Notifications**: Transaction alerts, deadlines
8. **Progress Tracking**: Visual compliance monitoring

### **Advanced Features**

1. **Carbon Calculator**: Automated emissions estimation
2. **API Integration**: External data sources
3. **Batch Operations**: Multiple credit handling
4. **Analytics Engine**: Predictive insights
5. **Social Features**: Share achievements
6. **Mobile App**: PWA capabilities
7. **Multi-language**: Internationalization
8. **Dark Mode**: Theme switching

## 🔄 **User Workflows**

### **Company Onboarding Flow**

```
1. Connect Wallet → 2. Register Company → 3. Upload Documents →
4. Wait for Verification → 5. Set Compliance Targets → 6. Start Recording Emissions
```

### **Carbon Offset Flow**

```
1. Record Emissions → 2. Browse Marketplace → 3. Select Credits →
4. Purchase → 5. Retire Credits → 6. Generate Certificate → 7. Share Achievement
```

### **Project Registration Flow**

```
1. Connect Wallet → 2. Register Project → 3. Upload Documentation →
4. Wait for Verification → 5. Mint Credits → 6. List on Marketplace
```

## 🚀 **Performance & UX Requirements**

### **Performance**

- Page load times < 3 seconds
- Smooth animations (60fps)
- Optimized bundle sizes
- Efficient data fetching
- Progressive loading

### **User Experience**

- Intuitive navigation
- Clear error messages
- Loading states
- Success confirmations
- Help tooltips
- Keyboard accessibility
- Screen reader support

## 📋 **Form Requirements**

### **Validation Rules**

- Real-time validation feedback
- Clear error messages
- Required field indicators
- Format validation (addresses, numbers)
- File upload validation

### **Form Types**

- Company registration
- Project registration
- Emissions recording
- Credit purchasing
- Target setting
- Certificate generation

## 🔐 **Security Considerations**

- Secure wallet integration
- Input sanitization
- XSS protection
- Transaction verification
- Error handling
- Rate limiting
- Audit trails

## 📱 **Mobile Responsiveness**

- Touch-friendly interfaces
- Optimized charts for mobile
- Collapsible navigation
- Swipe gestures
- Mobile-first design
- PWA capabilities

## 🎨 **Component Library**

Build reusable components:

- CreditCard
- EmissionChart
- ComplianceGauge
- ProjectCard
- TransactionTable
- DashboardWidget
- WalletConnect
- RoleSelector

---

## 🚀 **Getting Started Prompt for AI**

_"Build a modern, professional Carbon Credit Platform frontend using Next.js 14, TypeScript, and Tailwind CSS. Create a comprehensive dashboard system for companies to track emissions, purchase carbon credits, and achieve ESG compliance. Implement role-based access for Companies, Project Owners, Verifiers, and Admins. Include interactive charts, real-time blockchain data, and seamless Massa wallet integration. Focus on clean design, intuitive UX, and mobile responsiveness. Use the provided smart contract functions for all blockchain interactions."_

This specification provides everything needed to build a complete, professional carbon credit platform that leverages your Massa blockchain smart contract!
