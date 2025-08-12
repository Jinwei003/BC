import { v4 as uuidv4 } from 'uuid';
import SystemLog from '../models/SystemLog.js';

// Generate unique log ID
const generateLogId = () => {
  return `log_${Date.now()}_${uuidv4().slice(0, 8)}`;
};

// Extract IP address from request
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         'unknown';
};

// Determine risk level based on status code and other factors
const determineRiskLevel = (statusCode, suspicious = false) => {
  if (suspicious) return 'HIGH';
  if (statusCode >= 500) return 'MEDIUM';
  if (statusCode >= 400) return 'LOW';
  return 'LOW';
};

// Check for suspicious activity patterns
const checkSuspiciousActivity = (req, statusCode) => {
  const suspiciousPatterns = [
    // Multiple failed login attempts
    statusCode === 401 && req.path.includes('/auth/'),
    // SQL injection patterns
    req.url.includes("'") || req.url.includes('--') || req.url.includes(';'),
    // XSS patterns
    req.url.includes('<script>') || req.url.includes('</script>'),
    // Path traversal
    req.url.includes('../') || req.url.includes('..\\'),
    // Unusual user agents
    !req.headers['user-agent'] || req.headers['user-agent'].length < 10
  ];

  return suspiciousPatterns.some(pattern => pattern);
};

// Generic activity logger
export const logActivity = async (logData) => {
  try {
    const log = new SystemLog({
      logId: generateLogId(),
      timestamp: new Date(),
      level: logData.level || 'INFO',
      category: logData.category || 'SYSTEM',
      action: logData.action || 'UNKNOWN',
      message: logData.message || 'No message provided',
      userId: logData.userId,
      userType: logData.userType,
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent,
      endpoint: logData.endpoint,
      method: logData.method,
      statusCode: logData.statusCode,
      responseTime: logData.responseTime,
      details: logData.details,
      error: logData.error,
      metadata: logData.metadata || {},
      security: logData.security || {
        suspicious: false,
        riskLevel: 'LOW',
        blocked: false
      },
      performance: logData.performance,
      tags: logData.tags || [],
      retentionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days retention
    });

    await log.save();
  } catch (error) {
    console.error('Error saving system log:', error);
    // Don't throw error to avoid breaking the main application flow
  }
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  req.requestId = uuidv4();
  req.startTime = startTime;

  // Override res.json to capture response
  const originalJson = res.json;
  res.json = function(data) {
    res.responseData = data;
    return originalJson.call(this, data);
  };

  // Log request
  logActivity({
    level: 'INFO',
    category: 'API',
    action: 'REQUEST_RECEIVED',
    message: `${req.method} ${req.path}`,
    userId: req.user?.walletAddress || req.user?.id,
    userType: req.user?.role?.toUpperCase(),
    ipAddress: getClientIP(req),
    userAgent: req.headers['user-agent'],
    endpoint: req.path,
    method: req.method,
    metadata: {
      requestId: req.requestId,
      sessionId: req.sessionID
    }
  });

  next();
};

// Response logging middleware
export const responseLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const responseTime = Date.now() - req.startTime;
    const suspicious = checkSuspiciousActivity(req, res.statusCode);
    
    // Log response
    logActivity({
      level: res.statusCode >= 400 ? 'ERROR' : 'INFO',
      category: 'API',
      action: 'REQUEST_COMPLETED',
      message: `${req.method} ${req.path} - ${res.statusCode}`,
      userId: req.user?.walletAddress || req.user?.id,
      userType: req.user?.role?.toUpperCase(),
      ipAddress: getClientIP(req),
      userAgent: req.headers['user-agent'],
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      security: {
        suspicious,
        riskLevel: determineRiskLevel(res.statusCode, suspicious),
        blocked: false
      },
      metadata: {
        requestId: req.requestId,
        sessionId: req.sessionID
      }
    });

    return originalSend.call(this, data);
  };

  next();
};

// Authentication activity logger
export const logAuthActivity = (action, userId, userType, ipAddress, userAgent, success = true, error = null) => {
  logActivity({
    level: success ? 'INFO' : 'WARN',
    category: 'AUTH',
    action,
    message: `${action} ${success ? 'successful' : 'failed'} for ${userType}`,
    userId,
    userType: userType?.toUpperCase(),
    ipAddress,
    userAgent,
    security: {
      suspicious: !success,
      riskLevel: success ? 'LOW' : 'MEDIUM',
      blocked: false
    },
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : undefined
  });
};

// Blockchain activity logger
export const logBlockchainActivity = (action, userId, userType, transactionHash, batchId, ipAddress) => {
  logActivity({
    level: 'INFO',
    category: 'BLOCKCHAIN',
    action,
    message: `Blockchain ${action} for batch ${batchId}`,
    userId,
    userType: userType?.toUpperCase(),
    ipAddress,
    metadata: {
      transactionHash,
      batchId
    }
  });
};

// File upload activity logger
export const logFileActivity = (action, userId, userType, filename, fileHash, ipfsHash, ipAddress) => {
  logActivity({
    level: 'INFO',
    category: 'FILE_UPLOAD',
    action,
    message: `File ${action}: ${filename}`,
    userId,
    userType: userType?.toUpperCase(),
    ipAddress,
    metadata: {
      fileHash,
      ipfsHash
    }
  });
};

// Security incident logger
export const logSecurityIncident = (threatType, action, userId, userType, ipAddress, userAgent, blocked = false) => {
  logActivity({
    level: 'ERROR',
    category: 'SECURITY',
    action,
    message: `Security incident: ${threatType}`,
    userId,
    userType: userType?.toUpperCase(),
    ipAddress,
    userAgent,
    security: {
      suspicious: true,
      riskLevel: 'CRITICAL',
      threatType: threatType.toUpperCase(),
      blocked
    }
  });
};