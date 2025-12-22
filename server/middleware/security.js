/**
 * Security Middleware
 * Protects against NoSQL injection, malformed JSON, and invalid input attacks
 */

/**
 * Recursively sanitize object to remove MongoDB operators and dangerous patterns
 * Removes keys starting with $ or containing . to prevent NoSQL injection
 */
function sanitizeObject(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle primitive types
  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  // Handle objects - remove dangerous keys
  const sanitized = {};
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    
    // Skip keys that start with $ (MongoDB operators) or contain . (nested access)
    if (key.startsWith('$') || key.includes('.')) {
      console.warn(`⚠️ Blocked potentially malicious key: ${key}`);
      continue;
    }
    
    // Recursively sanitize nested objects
    sanitized[key] = sanitizeObject(obj[key]);
  }
  
  return sanitized;
}

/**
 * Middleware: Sanitize request body, query, and params
 * Removes MongoDB operators and dangerous patterns from all inputs
 */
export function sanitizeInputs(req, res, next) {
  try {
    // Sanitize body - try direct assignment first, fallback to property replacement
    if (req.body && typeof req.body === 'object') {
      try {
        const sanitizedBody = sanitizeObject(req.body);
        req.body = sanitizedBody;
      } catch (bodyError) {
        // If direct assignment fails, replace properties individually
        console.warn('⚠️ Direct body assignment failed, using property replacement');
        const sanitizedBody = sanitizeObject(req.body);
        for (const key in req.body) {
          delete req.body[key];
        }
        for (const key in sanitizedBody) {
          req.body[key] = sanitizedBody[key];
        }
      }
    }
    
    // Sanitize query (replace properties individually to avoid read-only getter issues)
    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery = sanitizeObject(req.query);
      // Clear existing properties
      for (const key in req.query) {
        delete req.query[key];
      }
      // Add sanitized properties
      for (const key in sanitizedQuery) {
        req.query[key] = sanitizedQuery[key];
      }
    }
    
    // Sanitize params (replace properties individually to avoid read-only getter issues)
    if (req.params && typeof req.params === 'object') {
      const sanitizedParams = sanitizeObject(req.params);
      // Clear existing properties
      for (const key in req.params) {
        delete req.params[key];
      }
      // Add sanitized properties
      for (const key in sanitizedParams) {
        req.params[key] = sanitizedParams[key];
      }
    }
    
    next();
  } catch (error) {
    console.error('❌ Error in sanitizeInputs:', error);
    return res.status(400).json({ error: 'Invalid input format' });
  }
}

/**
 * Middleware: Handle JSON parsing errors
 * Catches malformed JSON before it crashes the server
 */
export function jsonErrorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.warn('⚠️ Malformed JSON detected:', {
      ip: req.ip,
      path: req.path,
      error: err.message
    });
    return res.status(400).json({ 
      error: 'Invalid JSON format',
      message: 'Request body must be valid JSON'
    });
  }
  next(err);
}

/**
 * Validate that a value is a non-empty string
 */
export function isValidString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate that a value is a string within length limits
 */
export function isValidStringWithLength(value, minLength = 1, maxLength = 100) {
  if (!isValidString(value)) return false;
  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

/**
 * Validate authentication credentials
 * Ensures username and password are valid strings with proper length
 */
export function validateCredentials(username, password) {
  const errors = [];

  // Check if values exist and are strings
  if (!isValidString(username)) {
    errors.push('Username must be a non-empty string');
  } else if (!isValidStringWithLength(username, 3, 50)) {
    errors.push('Username must be between 3 and 50 characters');
  }

  if (!isValidString(password)) {
    errors.push('Password must be a non-empty string');
  } else if (!isValidStringWithLength(password, 1, 100)) {
    errors.push('Password must be between 1 and 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Middleware: Rate limit by IP for sensitive endpoints
 * Simple in-memory rate limiting (for production, use Redis)
 */
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

export function simpleRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      requestCounts.delete(key);
    }
  }
  
  // Check current IP
  const ipData = requestCounts.get(ip);
  
  if (!ipData) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return next();
  }
  
  if (now - ipData.timestamp > RATE_LIMIT_WINDOW) {
    // Reset window
    requestCounts.set(ip, { count: 1, timestamp: now });
    return next();
  }
  
  if (ipData.count >= MAX_REQUESTS) {
    console.warn(`⚠️ Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({ 
      error: 'Too many requests',
      message: 'Please try again later'
    });
  }
  
  ipData.count++;
  next();
}

/**
 * Global error handler
 * Catches all unhandled errors and returns safe error messages
 */
export function globalErrorHandler(err, req, res, next) {
  console.error('❌ Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'An error occurred processing your request',
    ...(isDevelopment && { stack: err.stack })
  });
}
