# MongoDB Atlas Database Setup Guide

## Current Issue
Your application is currently using mock data because the MongoDB Atlas connection is failing with a DNS resolution error:
```
Error connecting to MongoDB: querySrv ENOTFOUND _mongodb._tcp.cluster0.qlhqe.mongodb.net
```

## Troubleshooting Steps

### 1. Check MongoDB Atlas Cluster Status
1. Log into your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Navigate to your cluster `cluster0.qlhqe.mongodb.net`
3. Verify the cluster is **running** and not paused
4. If paused, click "Resume" to restart it

### 2. Verify Network Access Settings
1. In MongoDB Atlas, go to **Security** → **Network Access**
2. Ensure your current IP address is whitelisted
3. For development, you can temporarily add `0.0.0.0/0` (allow all IPs)
4. Make sure the entry is **Active** (green status)

### 3. Check Database User Permissions
1. Go to **Security** → **Database Access**
2. Verify user `jinwei` exists and has proper permissions
3. Ensure the user has **Read and write to any database** or specific database permissions
4. Check that the password is correct (`jinwei123`)

### 4. Test Connection String
Your current connection string:
```
mongodb+srv://jinwei:jinwei123@cluster0.qlhqe.mongodb.net/protein_verification?retryWrites=true&w=majority&appName=Cluster0
```

### 5. Alternative Connection Methods

#### Option A: Get New Connection String
1. In MongoDB Atlas, click **Connect** on your cluster
2. Choose **Connect your application**
3. Select **Node.js** and version **4.1 or later**
4. Copy the new connection string
5. Replace the connection string in your `.env` file

#### Option B: Use Standard Connection (if SRV fails)
If the SRV record continues to fail, try a standard connection string:
```
mongodb://jinwei:jinwei123@cluster0-shard-00-00.qlhqe.mongodb.net:27017,cluster0-shard-00-01.qlhqe.mongodb.net:27017,cluster0-shard-00-02.qlhqe.mongodb.net:27017/protein_verification?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

## Once Connected: Populate Database

### 1. Run Database Seeding
Once your MongoDB connection is working, populate it with sample data:

```bash
npm run seed
```

This will create:
- **3 sample merchants** (2 approved, 1 pending)
- **3 sample batches** (2 verified, 1 unverified)

### 2. Verify Data in Admin Panel
1. Open your application: http://localhost:5173
2. Click **Admin Login**
3. Use credentials: `admin` / `admin123`
4. You should now see the real merchants and batches

### 3. Test Merchant Registration
1. Go to **Merchant Login** on homepage
2. Connect with MetaMask
3. Register a new merchant
4. Check the admin panel to see the new registration

## Current Application Status

✅ **Frontend**: Running at http://localhost:5173  
✅ **Backend**: Running at http://localhost:3004  
✅ **Blockchain**: Local Hardhat node running  
❌ **Database**: Using mock data (MongoDB Atlas connection failed)  

## Next Steps

1. **Fix MongoDB Atlas connection** using the troubleshooting steps above
2. **Run the seeding script**: `npm run seed`
3. **Test the complete flow** with real database data
4. **Verify admin panel** shows real merchants and batches

## Support

If you continue to have connection issues:
1. Check MongoDB Atlas service status
2. Try creating a new cluster
3. Contact MongoDB Atlas support
4. Consider using a local MongoDB instance for development

---

**Note**: The application will automatically switch from mock data to real database data once the MongoDB connection is successful.