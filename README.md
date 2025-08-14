# 🛡️ ProteinVerify – Blockchain-Based Protein Powder Verification System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.14.0-yellow)](https://hardhat.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.10.0-green)](https://www.mongodb.com/)

## 🏭 Industry Focus

**Industry:** Food & Beverage / Health Supplements  
**Use Case:** Ensuring the authenticity and integrity of protein powder products through blockchain technology.

## 📋 Problem Statement & Solution

In the health supplement industry, counterfeit and low-quality protein powders are a growing concern, posing serious health risks to consumers and damaging brand trust. Traditional verification systems are either non-transparent or easy to manipulate.

**ProteinVerify** is a decentralized, blockchain-powered platform that allows merchants to upload detailed product verification reports (ingredient info, lab tests, certifications), which are later approved by an admin before being immutably recorded on the blockchain. Consumers can verify any product using a Batch ID, and view its SHA-256 hash, IPFS storage reference, and on-chain proof of authenticity.

This system ensures **transparency**, **traceability**, and **trust**, while giving administrators full control over what data gets published to the blockchain.

## 🚀 Tech Stack

### Frontend

- **React 18.3.1** - Modern UI library
- **TypeScript 5.8.3** - Type-safe development
- **Vite 6.3.5** - Fast build tool and dev server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **React Router DOM 7.3.0** - Client-side routing
- **Zustand 5.0.3** - State management
- **Lucide React** - Icon library

### Backend

- **Node.js 22.17.0** - JavaScript runtime
- **Express 4.21.2** - Web application framework
- **TypeScript** - Type-safe server development
- **MongoDB 6.10.0** - NoSQL database
- **Mongoose 8.17.0** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

### Blockchain

- **Hardhat 2.14.0** - Ethereum development environment
- **Ethers.js 6.4.0** - Ethereum library
- **Solidity** - Smart contract language
- **MetaMask SDK** - Wallet integration

### Storage & Security

- **IPFS (Pinata 2.4.9)** - Decentralized file storage
- **SHA-256 Hashing** - Data integrity verification
- **JWT Authentication** - Secure API access
- **CORS Protection** - Cross-origin security

### Development Tools

- **ESLint** - Code linting
- **Nodemon** - Development server auto-restart
- **Concurrently** - Run multiple commands
- **TypeChain** - TypeScript bindings for smart contracts

## ✨ System Features by Role

### 🏪 Merchant Features

- **Account Registration** - Create merchant accounts with wallet integration
- **Product Report Upload** - Submit detailed verification reports
- **Dashboard Analytics** - View submission status and history
- **File Upload** - Attach lab reports, certifications, and images
- **MetaMask Integration** - Secure wallet-based authentication

### 👨‍💼 Admin Features

- **Report Review System** - Approve or reject merchant submissions
- **Blockchain Publishing** - Push approved data to smart contracts
- **User Management** - Manage merchant accounts and permissions
- **Data Validation** - Verify report authenticity before blockchain storage
- **Audit Trail** - Complete history of all admin actions

### 👥 Public User Features

- **Product Verification** - Verify products using Batch ID
- **Blockchain Proof** - View on-chain verification data
- **IPFS Access** - Access original documents via IPFS hashes
- **SHA-256 Verification** - Verify data integrity
- **Report Issues** - Submit complaints about products
- **Transparency Dashboard** - View public verification statistics

## 📁 Project Structure

```
ProteinVerify/
├── 📁 api/                     # Backend Express server
│   ├── 📁 config/              # Database configuration
│   ├── 📁 middleware/          # Authentication & logging
│   ├── 📁 models/              # MongoDB schemas
│   ├── 📁 routes/              # API endpoints
│   ├── 📁 utils/               # Blockchain & IPFS utilities
│   ├── 📄 app.ts               # Express app configuration
│   └── 📄 server.ts            # Server entry point
├── 📁 contracts/               # Smart contracts
│   └── 📄 ProteinVerification.sol
├── 📁 src/                     # Frontend React app
│   ├── 📁 components/          # Reusable UI components
│   ├── 📁 pages/               # Application pages
│   ├── 📁 hooks/               # Custom React hooks
│   ├── 📁 lib/                 # Utility functions
│   ├── 📄 App.tsx              # Main app component
│   └── 📄 main.tsx             # React entry point
├── 📁 scripts/                 # Database & utility scripts
├── 📁 ignition/                # Hardhat deployment scripts
├── 📄 hardhat.config.cjs       # Hardhat configuration
├── 📄 package.json             # Dependencies & scripts
├── 📄 vite.config.ts           # Vite configuration
└── 📄 README.md                # This file
```

## 🔄 Data Flow

### 1. **Merchant Submission Flow**

```
Merchant → Upload Report → Admin Review → Approval → Blockchain Storage → IPFS Hash → Public Verification
```

### 2. **Verification Process**

```
Consumer → Enter Batch ID → Query Blockchain → Retrieve IPFS Data → Display Verification Results
```

### 3. **Security Layer**

```
Data → SHA-256 Hash → IPFS Storage → Smart Contract → Immutable Record → Public Verification
```

## 🛠️ Local Development Setup

### Prerequisites

- **Node.js 18+** installed
- **MongoDB** running locally or MongoDB Atlas account
- **MetaMask** browser extension
- **Git** for version control

### 1. 📥 Clone Repository

```bash
git clone <repository-url>
cd ProteinVerify
```

### 2. 📦 Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. 🔧 Environment Setup

Before running the project, you must rename the provided env.txt file to .env, otherwise the backend will crash due to missing environment variables.

Steps:
	1.	Locate the env.txt file in the root directory of the project.
	2.	Rename it to .env (make sure there is no .txt extension left).
	3.	Then run the usual setup commands:
```bash
npm install
npm run dev
```

### 4. 🗄️ Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# Seed the database with sample data
npm run seed

# Test database connection
npm run test-db
```

### 5. ⛓️ Blockchain Setup

```bash
# Start local Hardhat network (Terminal 1)
npx hardhat node

# Deploy smart contracts (Terminal 2)
npx hardhat ignition deploy ignition/modules/ProteinVerification.js --network localhost
```

### 6. 🚀 Start Development Servers

```bash
# Start both frontend and backend (Terminal 3)
npm run dev

# Or start individually:
npm run client:dev  # Frontend only (http://localhost:5173)
npm run server:dev  # Backend only (http://localhost:3004)
```

### 7. 🔗 MetaMask Configuration

1. Install MetaMask browser extension
2. Add local Hardhat network:
   - **Network Name:** Hardhat Local
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH
3. Import test accounts from Hardhat console

## 🌐 Application URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3004
- **Hardhat Network:** http://127.0.0.1:8545

## 📱 Available Scripts

```bash
npm run dev          # Start both frontend and backend
npm run client:dev   # Start frontend only
npm run server:dev   # Start backend only
npm run build        # Build for production
npm run check        # TypeScript type checking
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
npm run test-db      # Test database connection
```

## 🔐 Security Features

- **Wallet-based Authentication** - MetaMask integration for secure login
- **JWT Token Security** - Stateless authentication
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Server-side data validation
- **File Upload Security** - Secure file handling with Multer
- **Blockchain Immutability** - Tamper-proof data storage

## 🎯 Key Benefits

- ✅ **Transparency** - All verification data publicly accessible
- ✅ **Immutability** - Blockchain ensures data cannot be altered
- ✅ **Decentralization** - No single point of failure
- ✅ **Traceability** - Complete audit trail from source to consumer
- ✅ **Trust** - Cryptographic proof of authenticity
- ✅ **Scalability** - IPFS for efficient file storage

## Workload Matrix

| Task / Module                  | Lee Jin Wei | Lim Poh Keat  | Mouhab Moqbel Mohammed Haidarah  | Muhammad Ali  |                    
| ------------------------------ | --------------- | ---------- | ---------- | ---------- | 
| Frontend (Next.js)             | 50%             | 50%        | 0%         | 0%         | 
| Database (Backend)             | 50%             | 0%         | 50%        | 0%         | 
| Hashing Verified Portal        | 100%            | 0%         | 0%         | 0%         | 
| Smart Contract (Hardhat)       | 50%             | 0%         | 0%         | 50%        | 
| Integration & Testing          | 100%            | 0%         | 0%         | 0%         | 




