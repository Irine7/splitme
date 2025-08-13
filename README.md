# SplitMe - Expense Sharing Application

SplitMe is a decentralized blockchain-based web application for conveniently sharing expenses between friends, colleagues, or family members. The application allows you to create groups (splits), add participants, and track who owes money to whom.

![SplitMe App](https://via.placeholder.com/800x400?text=SplitMe+App)

## Features

- **Decentralized Data Storage**: All group and expense data is stored on the blockchain
- **Expense Categories**: Convenient categorization of expenses (food, transport, entertainment, etc.)
- **Participant Management**: Adding and removing participants in groups
- **Expense History**: View history of all expenses
- **Debt Calculation**: Automatic calculation of who owes what and how much
- **Debt Settlement**: Marking debts as settled between participants
- **Dark Theme**: Support for light and dark interface themes

## Tech Stack

### Smart Contracts
- Solidity
- Hardhat
- Ethers.js

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Wagmi (for blockchain interaction)
- Zustand (for state management)

## Installation and Setup

### Prerequisites

- Node.js (version 20.x or higher)
- pnpm (version 10.x or higher)
- MetaMask or other Ethereum wallet

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/splitme.git
   cd splitme
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   Create a `.env` file in the project root with the following variables:
   ```
   MORPH_HOLESKY_URL=https://rpc-holesky.morphl2.io
   PRIVATE_KEY=your_private_key
   ```

### Launching Smart Contracts

1. Compile contracts:
   ```bash
   npx hardhat compile
   ```

2. Deploy contracts to the test network:
   ```bash
   npx hardhat run scripts/deploy.js --network morphHolesky
   ```

3. After deployment, update the contract addresses in the file `frontend/src/constants/contracts.ts`

### Launching the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   pnpm install
   ```

3. Launch the application in development mode:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Using the Application

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the upper right corner
2. Select your wallet (MetaMask, WalletConnect, etc.)
3. Confirm the connection in your wallet

### Creating a New Split

1. On the main page, click the "Create Split" button
2. Enter the split name
3. Select an expense category
4. Add participants by entering their Ethereum addresses
5. Enter the total expense amount
6. Click "Create Split" to create the group

### Viewing Splits

1. Go to the "My Splits" tab to view your groups
2. Click on any split to view detailed information
3. In the split details, you will see all participants and their debt amounts

### Expense History

1. Go to the "History" tab to view the history of all expenses
2. Click on any expense to view detailed information
3. Use filters to search for specific expenses

## Project Structure

```
splitme/
├── contracts/              # Smart contracts
│   ├── SplitMe.sol         # Main application contract
│   ├── ExpenseToken.sol    # Token for settlements
│   └── scripts/            # Deployment scripts
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── app/            # Application pages (Next.js)
│   │   ├── components/     # React components
│   │   ├── constants/      # Constants (contract addresses, etc.)
│   │   ├── hooks/          # Custom hooks
│   │   ├── stores/         # State stores (Zustand)
│   │   └── utils/          # Helper functions
│   └── public/             # Static files
└── hardhat.config.js       # Hardhat configuration
```

## Deployed Contracts

Current contract addresses in the Morph Holesky Testnet network:

- ExpenseToken: `0x9444126e1331845278197CEBEC6f2C6Ab1B9B469`
- SplitMe: `0xDb8Fda1b6fb96530b3FbFD2bf1F8F0721Cea036C`

## Development

### Adding New Features

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-new-feature
   ```

2. Make changes to the code

3. Test your changes:
   ```bash
   # For smart contracts
   npx hardhat test
   
   # For frontend
   cd frontend && pnpm dev
   ```

4. Create a pull request to the main branch

### Testing

For testing smart contracts:
```bash
npx hardhat test
```

## License

MIT

## Authors

- Your Name - [GitHub](https://github.com/yourusername)

## Acknowledgements

- [Morph Network](https://www.morphl2.io/) - for providing the test network
- [shadcn/ui](https://ui.shadcn.com/) - for user interface components
- [Wagmi](https://wagmi.sh/) - for blockchain interaction tools
