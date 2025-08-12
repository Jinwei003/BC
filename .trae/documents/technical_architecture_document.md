# Blockchain-Based Protein Powder Verification System - Technical Architecture Document

## 1. Architecture Design

```mermaid
graph TD
    A[User Browser] --> B[React/Next.js Frontend]
    B --> C[Node.js/Express Backend]
    C --> D[MongoDB Atlas]
    C --> E[IPFS Network]
    C --> F[Local File System]
    C --> G[SHA-256 Hashing]
    B --> H[MetaMask Wallet]
    H --> I[Smart Contract]
    I --> J[Local Hardhat Node]
    
    subgraph "Frontend Layer"
        B
        H
    end
    
    subgraph "Backend Layer"
        C
        G
    end
    
    subgraph "Data Layer"
        D
        F
    end
    
    subgraph "Blockchain Layer"
        I
        J
    end
    
    subgraph "Decentralized Storage"
        E
    end
```

## 2. Technology Description

* Frontend: React\@18 + tailwindcss\@3 + vite + ethers.js\@6 + MetaMask SDK

* Backend: Node.js\@18 + Express\@4 + MongoDB driver + Hardhat + IPFS client + Multer + crypto (SHA-256)

* Database: MongoDB Atlas

* Blockchain: Solidity + Hardhat + Local Hardhat Node

* Storage: IPFS + Local File System

## 3. Route Definitions

| Route                  | Purpose                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------ |
| /                      | Homepage with three entry points: batch ID verification, MetaMask login, admin login |
| /merchant/register     | Merchant registration form and status display                                        |
| /merchant/dashboard    | Merchant dashboard for report uploads and batch management                           |
| /admin                 | Admin panel for merchant management and complaint review                             |
| /verify/:batchId       | Verification results page with detailed product information                          |
| /api/auth/wallet       | MetaMask wallet authentication and registration check                                |
| /api/auth/admin        | Admin username/password authentication                                               |
| /api/merchant/register | Merchant registration submission                                                     |
| /api/merchant/status   | Check merchant registration and approval status                                      |
| /api/upload/reports    | Report upload to IPFS and MongoDB                                                    |
| /api/verify/:batchId   | Batch ID verification and data retrieval                                             |
| /api/complaints        | Complaint submission and management                                                  |
| /api/admin/merchants   | Merchant approval/rejection and whitelist management                                 |

## 4. API Definitions

### 4.1 Core API

**Configuration:**

* MongoDB Connection: `mongodb+srv://admin:1234@protienv.kq9vyrh.mongodb.net/?retryWrites=true&w=majority&appName=protienv`

* Pinata API Key: `be49cae7c9ddb83b6498`

* Pinata API Secret: `b66c621f6144633bad00fcb7235345e293c6e3cb6b5bc8bae6af5d4caf63c70e`

* Pinata JWT: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxMTI2Y2UwOC0wZjg4LTQyZDktYTZhNC1mYWY4YzlkMjhmYjciLCJlbWFpbCI6ImppbndlaTEwMDAxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJiZTQ5Y2FlN2M5ZGRiODNiNjQ5OCIsInNjb3BlZEtleVNlY3JldCI6ImI2NmM2MjFmNjE0NDYzM2JhZDAwZmNiNzIzNTM0NWUyOTNjNmUzY2I2YjViYzhiYWU2YWY1ZDRjYWY2M2M3MGUiLCJleHAiOjE3ODYxMTUzODl9.if5pb4nRoQlB_JhcvWmRPV-SB4ttOhnL-PJ0QnVzIz0`

**Wallet Authentication and Registration Check**

```
POST /api/auth/wallet
```

Request:

| Param Name    | Param Type | isRequired | Description                      |
| ------------- | ---------- | ---------- | -------------------------------- |
| walletAddress | string     | true       | MetaMask wallet address          |
| signature     | string     | true       | Signed message for verification  |
| message       | string     | true       | Original message that was signed |

Response:

| Param Name         | Param Type | Description                                                               |
| ------------------ | ---------- | ------------------------------------------------------------------------- |
| success            | boolean    | Authentication status                                                     |
| registrationStatus | string     | Registration status: 'not\_registered', 'pending', 'approved', 'rejected' |
| isWhitelisted      | boolean    | Merchant whitelist status                                                 |
| token              | string     | JWT token for session                                                     |
| merchantData       | object     | Merchant information if registered                                        |

**Admin Authentication**

```
POST /api/auth/admin
```

Request:

| Param Name | Param Type | isRequired | Description             |
| ---------- | ---------- | ---------- | ----------------------- |
| username   | string     | true       | Admin username or email |
| password   | string     | true       | Admin password          |

Response:

| Param Name | Param Type | Description                 |
| ---------- | ---------- | --------------------------- |
| success    | boolean    | Authentication status       |
| token      | string     | JWT token for admin session |
| adminData  | object     | Admin profile information   |

**Merchant Registration**

```
POST /api/merchant/register
```

Request:

| Param Name    | Param Type | isRequired | Description              |
| ------------- | ---------- | ---------- | ------------------------ |
| walletAddress | string     | true       | MetaMask wallet address  |
| name          | string     | true       | Merchant full name       |
| organization  | string     | true       | Organization or lab name |
| email         | string     | true       | Contact email address    |

Response:

| Param Name | Param Type | Description                       |
| ---------- | ---------- | --------------------------------- |
| success    | boolean    | Registration status               |
| message    | string     | Registration confirmation message |
| merchantId | string     | Generated merchant ID             |

**Merchant Status Check**

```
GET /api/merchant/status/:walletAddress
```

Response:

| Param Name         | Param Type | Description                    |
| ------------------ | ---------- | ------------------------------ |
| success            | boolean    | Request status                 |
| registrationStatus | string     | Current registration status    |
| merchantData       | object     | Merchant information           |
| approvedAt         | string     | Approval timestamp if approved |
| rejectionReason    | string     | Rejection reason if rejected   |

**File Upload with IPFS and SHA-256 Hashing**

```
POST /api/upload/report
```

Request (multipart/form-data):

| Param Name    | Param Type | isRequired | Description                                     |
| ------------- | ---------- | ---------- | ----------------------------------------------- |
| batchId       | string     | true       | Generated batch ID                              |
| reportType    | string     | true       | Type: 'ingredient', 'process', 'authentication' |
| file          | File       | true       | PDF report file                                 |
| walletAddress | string     | true       | Merchant wallet address                         |

Response:

| Param Name | Param Type | Description                |
| ---------- | ---------- | -------------------------- |
| success    | boolean    | Upload status              |
| ipfsHash   | string     | IPFS hash of uploaded file |
| sha256Hash | string     | SHA-256 integrity hash     |
| mongoId    | string     | MongoDB document ID        |

**Batch Verification**

```
GET /api/verify/:batchId
```

Response:

| Param Name     | Param Type | Description                         |
| -------------- | ---------- | ----------------------------------- |
| success        | boolean    | Verification status                 |
| ingredientData | object     | Ingredient information from MongoDB |
| processData    | object     | Process test data from MongoDB      |
| authData       | object     | Authentication data from MongoDB    |
| ipfsHashes     | object     | IPFS hashes from smart contract     |

**Complaint Submission with Evidence Upload**

```
POST /api/complaints/submit
```

Request (multipart/form-data):

| Param Name    | Param Type | isRequired | Description                       |
| ------------- | ---------- | ---------- | --------------------------------- |
| batchId       | string     | true       | Batch ID being complained about   |
| complaintText | string     | true       | Complaint description             |
| evidence      | File\[]    | false      | Evidence files (images/documents) |
| userEmail     | string     | true       | Complainant email                 |

Response:

| Param Name    | Param Type | Description                                               |
| ------------- | ---------- | --------------------------------------------------------- |
| success       | boolean    | Submission status                                         |
| complaintId   | string     | Generated complaint ID                                    |
| evidencePaths | string\[]  | Local file paths for evidence (e.g., /uploads/image1.png) |

## 5. Server Architecture Diagram

```mermaid
graph TD
    A[Client Request] --> B[Express Router]
    B --> C[Authentication Middleware]
    C --> D[Controller Layer]
    D --> E[Service Layer]
    E --> F[Repository Layer]
    F --> G[(MongoDB)]
    F --> H[Local File System]
    E --> I[IPFS Service]
    E --> J[Smart Contract Service]
    E --> K[SHA-256 Hashing]
    J --> L[Hardhat Network]
    
    subgraph "Server Architecture"
        B
        C
        D
        E
        F
        K
    end
    
    subgraph "External Services"
        G
        H
        I
        L
    end
```

## 6. Data Model

### 6.1 Data Model Definition

```mermaid
erDiagram
    MERCHANTS ||--o{ INGREDIENTS : uploads
    MERCHANTS ||--o{ TEST_PROCESSES : uploads
    MERCHANTS ||--o{ AUTHENTICATIONS : uploads
    MERCHANTS ||--o{ COMPLAINTS : reported
    INGREDIENTS ||--|| TEST_PROCESSES : batch_id
    TEST_PROCESSES ||--|| AUTHENTICATIONS : batch_id

    MERCHANTS {
        string wallet_address PK
        string name
        string organization
        string email
        string status
        datetime created_at
        datetime updated_at
    }
    INGREDIENTS {
        string id PK
        string batch_id
        string wallet_address FK
        string ipfs_hash
        string sha256_hash
        object ingredient_data
        datetime created_at
    }
    TEST_PROCESSES {
        string id PK
        string batch_id
        string wallet_address FK
        string ipfs_hash
        string sha256_hash
        object process_data
        datetime created_at
    }
    AUTHENTICATIONS {
        string id PK
        string batch_id
        string wallet_address FK
        string ipfs_hash
        string sha256_hash
        object auth_data
        datetime created_at
    }
    COMPLAINTS {
        string id PK
        string batch_id
        string merchant_wallet
        string user_email
        string complaint_text
        array evidence_paths
        string status
        datetime created_at
    }
    SYSTEM_LOGS {
        string id PK
        string action_type
        string user_wallet
        string batch_id
        object action_data
        datetime timestamp
    }
```

### 6.2 Data Definition Language

**MongoDB Collections Schema**

Merchants Collection (merchants)

```javascript
{
  _id: ObjectId,
  walletAddress: String, // Primary identifier
  name: String,
  organization: String,
  email: String,
  registrationStatus: String, // 'pending', 'approved', 'rejected'
  isWhitelisted: Boolean,
  isBlacklisted: Boolean,
  registeredAt: Date,
  approvedAt: Date,
  rejectedAt: Date,
  approvedBy: String, // Admin wallet/ID
  rejectionReason: String
}
```

Ingredients Collection (ingredients)

```javascript
{
  _id: ObjectId,
  batchId: String, // PROT-YYYYMMDD-X format
  walletAddress: String, // Merchant wallet
  ipfsHash: String, // IPFS hash from smart contract
  sha256Hash: String, // SHA-256 file integrity hash
  proteinType: String,
  purity: String,
  bcaa: String,
  fatContent: String,
  moisture: String,
  sweetener: String,
  createdAt: Date
}
```

Test Processes Collection (testProcesses)

```javascript
{
  _id: ObjectId,
  batchId: String,
  walletAddress: String,
  ipfsHash: String,
  sha256Hash: String, // SHA-256 file integrity hash
  process1: String,
  process2: String,
  additionalTests: String,
  createdAt: Date
}
```

Authentications Collection (authentications)

```javascript
{
  _id: ObjectId,
  batchId: String,
  walletAddress: String,
  ipfsHash: String,
  sha256Hash: String, // SHA-256 file integrity hash
  merchantWallet: String,
  labName: String,
  certId: String,
  documentHash: String,
  createdAt: Date
}
```

Complaints Collection (complaints)

```javascript
{
  _id: ObjectId,
  batchId: String,
  merchantWallet: String,
  userEmail: String,
  complaintText: String,
  evidencePaths: [String], // Local file paths like ["/uploads/image1.png", "/uploads/doc1.pdf"]
  status: String, // 'pending', 'reviewed', 'resolved'
  createdAt: Date
}
```

System Logs Collection (systemLogs)

```javascript
{
  _id: ObjectId,
  actionType: String, // 'upload', 'verification', 'complaint', 'admin_action'
  userWallet: String,
  batchId: String,
  actionData: Object, // Additional action-specific data
  timestamp: Date
}
```

**Smart Contract (Solidity)**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProteinVerification {
    struct ProteinReport {
        string ingredientIPFS;
        string processIPFS;
        string authenticationIPFS;
        address merchant;
        uint256 timestamp;
    }
    
    mapping(string => ProteinReport) public reports;
    mapping(address => bool) public whitelistedMerchants;
    address public admin;
    
    event ReportUploaded(string indexed batchID, address indexed merchant);
    event MerchantWhitelisted(address indexed merchant);
    event MerchantBlacklisted(address indexed merchant);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyWhitelisted() {
        require(whitelistedMerchants[msg.sender], "Merchant not whitelisted");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    function uploadReport(
        string memory batchID,
        string memory ingredientIPFS,
        string memory processIPFS,
        string memory authenticationIPFS
    ) external onlyWhitelisted {
        reports[batchID] = ProteinReport({
            ingredientIPFS: ingredientIPFS,
            processIPFS: processIPFS,
            authenticationIPFS: authenticationIPFS,
            merchant: msg.sender,
            timestamp: block.timestamp
        });
        
        emit ReportUploaded(batchID, msg.sender);
    }
    
    function getReport(string memory batchID) external view returns (ProteinReport memory) {
        return reports[batchID];
    }
    
    function whitelistMerchant(address merchant) external onlyAdmin {
        whitelistedMerchants[merchant] = true;
        emit MerchantWhitelisted(merchant);
    }
    
    function blacklistMerchant(address merchant) external onlyAdmin {
        whitelistedMerchants[merchant] = false;
        emit MerchantBlacklisted(merchant);
    }
}
```

**SHA-256 File Hashing Implementation**

```javascript
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');

// SHA-256 hashing function
function hashFileSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

// Multer configuration for local file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/') // Local uploads directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Usage in file upload endpoint
app.post('/api/upload/report', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const sha256Hash = hashFileSHA256(filePath);
    
    // Upload to IPFS using Pinata
    const ipfsHash = await uploadToIPFS(filePath);
    
    // Save to MongoDB with both hashes
    const reportData = {
      batchId: req.body.batchId,
      walletAddress: req.body.walletAddress,
      ipfsHash: ipfsHash,
      sha256Hash: sha256Hash,
      // ... other report data
      createdAt: new Date()
    };
    
    await db.collection(req.body.reportType + 's').insertOne(reportData);
    
    res.json({ success: true, ipfsHash, sha256Hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File integrity verification
function verifyFileIntegrity(filePath, expectedHash) {
  const currentHash = hashFileSHA256(filePath);
  return currentHash === expectedHash;
}
```

**Initial Sample Data**

```javascript
// Sample merchant registration
db.merchants.insertOne({
  walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  name: "Premium Protein Labs",
  organization: "PPL Inc.",
  email: "contact@premiumprotein.com",
  registrationStatus: "approved",
  isWhitelisted: true,
  isBlacklisted: false,
  registeredAt: new Date("2024-01-15"),
  approvedAt: new Date("2024-01-16"),
  approvedBy: "admin-001"
});

// Sample ingredient data with SHA-256 hash
db.ingredients.insertOne({
  batchId: "PROT-20241201-A",
  walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  ipfsHash: "QmX1Y2Z3...",
  sha256Hash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
  proteinType: "Whey Isolate",
  purity: "90%",
  bcaa: "25g per 100g",
  fatContent: "1g per 100g",
  moisture: "5%",
  sweetener: "Stevia",
  createdAt: new Date()
});

// Sample complaint with local file paths
db.complaints.insertOne({
  batchId: "PROT-20241201-A",
  merchantWallet: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  userEmail: "user@example.com",
  complaintText: "Product quality issues detected",
  evidencePaths: ["/uploads/evidence-1704123456789.jpg", "/uploads/report-1704123456790.pdf"],
  status: "pending",
  createdAt: new Date()
});
```

