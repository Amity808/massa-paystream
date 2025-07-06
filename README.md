# PayStream - Decentralized Recurring Payments on Massa Blockchain

PayStream is a decentralized application (dApp) that enables automated recurring payments on the Massa blockchain. Users can create, manage, and execute payment streams with full control over their funds.

## 🌟 Features

### Frontend Features

- **Wallet Integration**: Seamless connection with Massa Station wallet
- **Dashboard**: Real-time overview of payment streams with statistics
- **Stream Management**: Create, pause, resume, and cancel payment streams
- **Payment Execution**: Manual and automated payment processing
- **Real-time Updates**: Auto-refresh functionality for live data
- **Responsive Design**: Modern UI built with Next.js and Tailwind CSS
- **Dark/Light Theme**: Theme toggle for better user experience

### Smart Contract Features

- **Stream Creation**: Create new payment streams with specified parameters
- **Payment Execution**: Automated payment processing based on intervals
- **Stream Control**: Pause, resume, and cancel streams
- **Security**: Role-based access control (only payer can modify streams)
- **Event Logging**: Comprehensive event tracking for transparency

## 🏗️ Project Structure

```
massa/
├── my-first-sc/                 # Smart Contract
│   ├── assembly/
│   │   ├── contracts/
│   │   │   └── main.ts         # Main smart contract logic
│   │   └── __tests__/
│   │       └── massa-example.spec.ts
│   ├── src/
│   │   ├── deploy.ts           # Deployment script
│   │   └── hello.ts            # Example script
│   └── package.json
└── paystream-dapp2/            # Frontend Application
    ├── app/                    # Next.js app directory
    ├── components/             # React components
    │   ├── ui/                # UI components (shadcn/ui)
    │   ├── stream-form/       # Stream creation forms
    │   └── dashboard.tsx      # Main dashboard
    ├── contexts/              # React contexts
    ├── hooks/                 # Custom React hooks
    ├── lib/                   # Utility libraries
    ├── types/                 # TypeScript type definitions
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16
- Massa Station wallet extension
- Access to Massa blockchain (testnet/mainnet)

### Frontend Setup

1. **Navigate to the frontend directory**:

   ```bash
   cd paystream-dapp2
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Smart Contract Setup

1. **Navigate to the smart contract directory**:

   ```bash
   cd my-first-sc
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Build the contract**:

   ```bash
   npm run build
   ```

4. **Deploy the contract**:

   ```bash
   npm run deploy
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

## 📋 Smart Contract Functions

### Core Functions

- **`constructor(binaryArgs)`**: Initializes the contract with stream length counter
- **`createStream(binaryArgs)`**: Creates a new payment stream
- **`executePayment(binaryArgs)`**: Executes payment for a specific stream
- **`pauseStream(binaryArgs)`**: Pauses an active stream (payer only)
- **`resumeStream(binaryArgs)`**: Resumes a paused stream (payer only)
- **`cancelStream(binaryArgs)`**: Cancels a stream (payer only)
- **`getStreamInfo(binaryArgs)`**: Retrieves stream information
- **`getStreamLength()`**: Returns total number of streams

### Stream Parameters

- **payer**: Address of the person making payments
- **payee**: Address of the person receiving payments
- **amount**: Payment amount in nanoMAS
- **interval**: Time interval between payments (in seconds)
- **status**: Stream status (active/paused/canceled)

## 🎯 Frontend Components

### Core Components

- **`Dashboard`**: Main application interface with statistics and stream management
- **`WalletConnect`**: Wallet connection component
- **`CreateStreamForm`**: Form for creating new payment streams
- **`StreamCard`**: Individual stream display component
- **`StreamDetailsModal`**: Detailed stream information modal

### Hooks

- **`useWallet`**: Wallet connection and state management
- **`useStreams`**: Stream data fetching and management
- **`useToast`**: Notification system

### Libraries

- **`massa-client.ts`**: Massa blockchain interaction utilities
- **`types.ts`**: TypeScript type definitions
- **`utils.ts`**: General utility functions

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=AS12SSapyf37tsZWgYH6zxSQbhyrsiXaJaje2QSkg6hMqHpvaMpsm
NEXT_PUBLIC_NETWORK=buildnet
```

### Contract Address

The deployed contract address is:

```
AS12SSapyf37tsZWgYH6zxSQbhyrsiXaJaje2QSkg6hMqHpvaMpsm
```

## 🛠️ Development

### Frontend Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Smart Contract Development

```bash
# Build contract
npm run build

# Run tests
npm test

# Deploy contract
npm run deploy

# Format code
npm run fmt
```

## 📱 Usage

### Creating a Stream

1. Connect your Massa Station wallet
2. Click "Create Stream" button
3. Fill in the required information:
   - **Payee Address**: Recipient's Massa address
   - **Amount**: Payment amount in MAS
   - **Interval**: Time between payments (hours/days/weeks)
4. Confirm the transaction

### Managing Streams

- **View**: All your streams are displayed on the dashboard
- **Pause**: Temporarily stop payments (payer only)
- **Resume**: Restart paused streams (payer only)
- **Cancel**: Permanently stop a stream (payer only)
- **Execute**: Manually trigger a payment

### Dashboard Features

- **Statistics**: Overview of total outgoing/incoming payments
- **Active Streams**: Count of active payment streams
- **Due Payments**: Number of payments ready to execute
- **Real-time Updates**: Auto-refresh every 30 seconds

## 🔒 Security Features

- **Role-based Access**: Only stream creators can modify their streams
- **Time-based Execution**: Payments only execute when due
- **Status Validation**: Operations check stream status before execution
- **Event Logging**: All operations generate blockchain events

## 🧪 Testing

### Frontend Testing

```bash
# Run tests (if configured)
npm test
```

### Smart Contract Testing

```bash
# Run AssemblyScript tests
npm test
```

## 🚀 Deployment

### Frontend Deployment

The frontend can be deployed to any static hosting service:

- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative static hosting
- **GitHub Pages**: Free hosting option

### Smart Contract Deployment

```bash
# Deploy to Massa blockchain
npm run deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the Massa documentation: https://docs.massa.net/
- Join the Massa community: https://t.me/massanetwork

## 🔗 Links

- **Massa Blockchain**: https://massa.net/
- **Massa Station**: https://station.massa.net/
- **Massa Documentation**: https://docs.massa.net/
- **AssemblyScript**: https://www.assemblyscript.org/

---

Built with ❤️ for the Massa ecosystem
