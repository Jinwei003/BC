// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProteinVerification {
    struct BatchData {
        string ingredientsHash;
        string testProcessHash;
        string authenticationHash;
        address merchant;
        uint256 timestamp;
        bool exists;
    }
    
    mapping(string => BatchData) public batches;
    mapping(address => bool) public authorizedMerchants;
    address public admin;
    
    event BatchCreated(
        string indexed batchId,
        string ingredientsHash,
        string testProcessHash,
        string authenticationHash,
        address indexed merchant,
        uint256 timestamp
    );
    
    event MerchantAuthorized(address indexed merchant);
    event MerchantRevoked(address indexed merchant);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyAuthorizedMerchant() {
        require(authorizedMerchants[msg.sender], "Only authorized merchants can perform this action");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        authorizedMerchants[msg.sender] = true;
    }
    
    function authorizeMerchant(address merchant) external onlyAdmin {
        authorizedMerchants[merchant] = true;
        emit MerchantAuthorized(merchant);
    }
    
    function revokeMerchant(address merchant) external onlyAdmin {
        authorizedMerchants[merchant] = false;
        emit MerchantRevoked(merchant);
    }
    
    function createBatch(
        string memory batchId,
        string memory ingredientsHash,
        string memory testProcessHash,
        string memory authenticationHash
    ) external onlyAuthorizedMerchant {
        require(!batches[batchId].exists, "Batch already exists");
        require(bytes(batchId).length > 0, "Batch ID cannot be empty");
        require(bytes(ingredientsHash).length > 0, "Ingredients hash cannot be empty");
        require(bytes(testProcessHash).length > 0, "Test process hash cannot be empty");
        require(bytes(authenticationHash).length > 0, "Authentication hash cannot be empty");
        
        batches[batchId] = BatchData({
            ingredientsHash: ingredientsHash,
            testProcessHash: testProcessHash,
            authenticationHash: authenticationHash,
            merchant: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        emit BatchCreated(
            batchId,
            ingredientsHash,
            testProcessHash,
            authenticationHash,
            msg.sender,
            block.timestamp
        );
    }
    
    function getBatch(string memory batchId) external view returns (
        string memory ingredientsHash,
        string memory testProcessHash,
        string memory authenticationHash,
        address merchant,
        uint256 timestamp,
        bool exists
    ) {
        BatchData memory batch = batches[batchId];
        return (
            batch.ingredientsHash,
            batch.testProcessHash,
            batch.authenticationHash,
            batch.merchant,
            batch.timestamp,
            batch.exists
        );
    }
    
    function isMerchantAuthorized(address merchant) external view returns (bool) {
        return authorizedMerchants[merchant];
    }
    
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "New admin cannot be zero address");
        admin = newAdmin;
    }
}