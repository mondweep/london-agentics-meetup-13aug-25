// Validation middleware for API endpoints
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

// Custom validation error class
export class ValidationError extends Error {
  public errors: string[];

  constructor(errors: string[]) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// Request validation middleware
export function validateRequest(validationFn: (body: any) => string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationFn(req.body);
      
      if (errors.length > 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: `Validation failed: ${errors.join(', ')}`,
          message: 'Please check your input data'
        };
        return res.status(400).json(response);
      }

      next();
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Validation error occurred',
        message: error instanceof Error ? error.message : 'Unknown validation error'
      };
      return res.status(400).json(response);
    }
  };
}

// Query parameter validation
export function validateQuery(validationFn: (query: any) => string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationFn(req.query);
      
      if (errors.length > 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: `Query validation failed: ${errors.join(', ')}`,
          message: 'Please check your query parameters'
        };
        return res.status(400).json(response);
      }

      next();
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Query validation error occurred',
        message: error instanceof Error ? error.message : 'Unknown validation error'
      };
      return res.status(400).json(response);
    }
  };
}

// Parameter validation
export function validateParams(validationFn: (params: any) => string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationFn(req.params);
      
      if (errors.length > 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: `Parameter validation failed: ${errors.join(', ')}`,
          message: 'Please check your URL parameters'
        };
        return res.status(400).json(response);
      }

      next();
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Parameter validation error occurred',
        message: error instanceof Error ? error.message : 'Unknown validation error'
      };
      return res.status(400).json(response);
    }
  };
}

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Basic HTML/script tag removal
  function sanitizeString(str: string): string {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim();
  }

  function sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
}

// JSON validation middleware
export function validateJSON(req: Request, res: Response, next: NextFunction) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.headers['content-type']?.includes('application/json')) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid Content-Type',
        message: 'Expected application/json content type'
      };
      return res.status(400).json(response);
    }

    // Check if body is valid JSON (Express should have already parsed it)
    if (req.body === undefined && req.headers['content-length'] !== '0') {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      };
      return res.status(400).json(response);
    }
  }

  next();
}

// Rate limiting middleware (simple in-memory implementation)
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = req.ip || 'unknown';
      const now = Date.now();
      
      // Get request timestamps for this IP
      const requests = this.requests.get(key) || [];
      
      // Remove old requests outside the window
      const validRequests = requests.filter(timestamp => 
        now - timestamp < this.windowMs
      );
      
      // Check if limit exceeded
      if (validRequests.length >= this.maxRequests) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${Math.ceil(this.windowMs / 1000 / 60)} minutes.`
        };
        return res.status(429).json(response);
      }
      
      // Add current request
      validRequests.push(now);
      this.requests.set(key, validRequests);
      
      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': this.maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, this.maxRequests - validRequests.length).toString(),
        'X-RateLimit-Reset': new Date(now + this.windowMs).toISOString()
      });
      
      next();
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => 
        now - timestamp < this.windowMs
      );
      
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

// Create rate limiter instances
export const generalRateLimit = new RateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const strictRateLimit = new RateLimiter(5 * 60 * 1000, 10);    // 10 requests per 5 minutes

// Validation functions for specific endpoints
export const tripValidation = {
  create: (body: any): string[] => {
    const errors: string[] = [];
    
    if (!body.userId || typeof body.userId !== 'string') {
      errors.push('User ID is required');
    }
    
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      errors.push('Trip name is required');
    }
    
    if (!body.origin) {
      errors.push('Origin location is required');
    } else {
      if (typeof body.origin.latitude !== 'number' || 
          typeof body.origin.longitude !== 'number') {
        errors.push('Origin coordinates are required and must be numbers');
      }
      if (!body.origin.address || typeof body.origin.address !== 'string') {
        errors.push('Origin address is required');
      }
    }
    
    if (!body.destination) {
      errors.push('Destination location is required');
    } else {
      if (typeof body.destination.latitude !== 'number' || 
          typeof body.destination.longitude !== 'number') {
        errors.push('Destination coordinates are required and must be numbers');
      }
      if (!body.destination.address || typeof body.destination.address !== 'string') {
        errors.push('Destination address is required');
      }
    }
    
    if (!body.schedule) {
      errors.push('Schedule is required');
    } else {
      if (!Array.isArray(body.schedule.days) || body.schedule.days.length === 0) {
        errors.push('At least one day must be selected');
      }
      if (!body.schedule.windowStart || !body.schedule.windowEnd) {
        errors.push('Departure window times are required');
      }
    }
    
    if (!body.alertThreshold) {
      errors.push('Alert threshold is required');
    } else {
      if (!body.alertThreshold.type || 
          !['MINUTES', 'PERCENTAGE'].includes(body.alertThreshold.type)) {
        errors.push('Alert threshold type must be MINUTES or PERCENTAGE');
      }
      if (typeof body.alertThreshold.value !== 'number' || 
          body.alertThreshold.value <= 0) {
        errors.push('Alert threshold must be greater than 0');
      }
    }
    
    return errors;
  },

  update: (body: any): string[] => {
    const errors: string[] = [];
    
    // For updates, fields are optional but must be valid if provided
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
      errors.push('Trip name must be a non-empty string');
    }
    
    if (body.alertThreshold !== undefined) {
      if (!body.alertThreshold.type || 
          !['MINUTES', 'PERCENTAGE'].includes(body.alertThreshold.type)) {
        errors.push('Alert threshold type must be MINUTES or PERCENTAGE');
      }
      if (typeof body.alertThreshold.value !== 'number' || 
          body.alertThreshold.value <= 0) {
        errors.push('Alert threshold must be greater than 0');
      }
    }
    
    return errors;
  }
};

export const queryValidation = {
  userId: (query: any): string[] => {
    const errors: string[] = [];
    
    if (!query.userId || typeof query.userId !== 'string') {
      errors.push('userId query parameter is required');
    }
    
    return errors;
  }
};

export const paramValidation = {
  tripId: (params: any): string[] => {
    const errors: string[] = [];
    
    if (!params.id || typeof params.id !== 'string') {
      errors.push('Trip ID parameter is required');
    }
    
    return errors;
  }
};

export const demoValidation = {
  trafficScenario: (body: any): string[] => {
    const errors: string[] = [];
    
    if (!body.route || typeof body.route !== 'string' || body.route.trim() === '') {
      errors.push('Route name is required for traffic scenario');
    }
    
    if (typeof body.severity !== 'number' || body.severity < 0 || body.severity > 1) {
      errors.push('Severity must be a number between 0 and 1');
    }
    
    if (!body.reason || typeof body.reason !== 'string' || body.reason.trim() === '') {
      errors.push('Reason is required for traffic scenario');
    }
    
    return errors;
  }
};

// Error handling middleware for validation errors
export function handleValidationError(error: Error, req: Request, res: Response, next: NextFunction) {
  if (error instanceof ValidationError) {
    const response: ApiResponse<null> = {
      success: false,
      error: error.message,
      message: `Validation errors: ${error.errors.join(', ')}`
    };
    return res.status(400).json(response);
  }
  
  next(error);
}