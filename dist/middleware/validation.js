"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoValidation = exports.paramValidation = exports.queryValidation = exports.tripValidation = exports.strictRateLimit = exports.generalRateLimit = exports.ValidationError = void 0;
exports.validateRequest = validateRequest;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
exports.sanitizeInput = sanitizeInput;
exports.validateJSON = validateJSON;
exports.handleValidationError = handleValidationError;
class ValidationError extends Error {
    constructor(errors) {
        super('Validation failed');
        this.name = 'ValidationError';
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
function validateRequest(validationFn) {
    return (req, res, next) => {
        try {
            const errors = validationFn(req.body);
            if (errors.length > 0) {
                const response = {
                    success: false,
                    error: `Validation failed: ${errors.join(', ')}`,
                    message: 'Please check your input data'
                };
                return res.status(400).json(response);
            }
            next();
        }
        catch (error) {
            const response = {
                success: false,
                error: 'Validation error occurred',
                message: error instanceof Error ? error.message : 'Unknown validation error'
            };
            return res.status(400).json(response);
        }
    };
}
function validateQuery(validationFn) {
    return (req, res, next) => {
        try {
            const errors = validationFn(req.query);
            if (errors.length > 0) {
                const response = {
                    success: false,
                    error: `Query validation failed: ${errors.join(', ')}`,
                    message: 'Please check your query parameters'
                };
                return res.status(400).json(response);
            }
            next();
        }
        catch (error) {
            const response = {
                success: false,
                error: 'Query validation error occurred',
                message: error instanceof Error ? error.message : 'Unknown validation error'
            };
            return res.status(400).json(response);
        }
    };
}
function validateParams(validationFn) {
    return (req, res, next) => {
        try {
            const errors = validationFn(req.params);
            if (errors.length > 0) {
                const response = {
                    success: false,
                    error: `Parameter validation failed: ${errors.join(', ')}`,
                    message: 'Please check your URL parameters'
                };
                return res.status(400).json(response);
            }
            next();
        }
        catch (error) {
            const response = {
                success: false,
                error: 'Parameter validation error occurred',
                message: error instanceof Error ? error.message : 'Unknown validation error'
            };
            return res.status(400).json(response);
        }
    };
}
function sanitizeInput(req, res, next) {
    function sanitizeString(str) {
        if (typeof str !== 'string')
            return str;
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim();
    }
    function sanitizeObject(obj) {
        if (obj === null || obj === undefined)
            return obj;
        if (typeof obj === 'string') {
            return sanitizeString(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        if (typeof obj === 'object') {
            const sanitized = {};
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
function validateJSON(req, res, next) {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (!req.headers['content-type']?.includes('application/json')) {
            const response = {
                success: false,
                error: 'Invalid Content-Type',
                message: 'Expected application/json content type'
            };
            return res.status(400).json(response);
        }
        if (req.body === undefined && req.headers['content-length'] !== '0') {
            const response = {
                success: false,
                error: 'Invalid JSON',
                message: 'Request body must be valid JSON'
            };
            return res.status(400).json(response);
        }
    }
    next();
}
class RateLimiter {
    constructor(windowMs = 15 * 60 * 1000, maxRequests = 100) {
        this.requests = new Map();
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
        setInterval(() => this.cleanup(), 60 * 1000);
    }
    middleware() {
        return (req, res, next) => {
            const key = req.ip || 'unknown';
            const now = Date.now();
            const requests = this.requests.get(key) || [];
            const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
            if (validRequests.length >= this.maxRequests) {
                const response = {
                    success: false,
                    error: 'Rate limit exceeded',
                    message: `Too many requests. Please try again in ${Math.ceil(this.windowMs / 1000 / 60)} minutes.`
                };
                return res.status(429).json(response);
            }
            validRequests.push(now);
            this.requests.set(key, validRequests);
            res.set({
                'X-RateLimit-Limit': this.maxRequests.toString(),
                'X-RateLimit-Remaining': Math.max(0, this.maxRequests - validRequests.length).toString(),
                'X-RateLimit-Reset': new Date(now + this.windowMs).toISOString()
            });
            next();
        };
    }
    cleanup() {
        const now = Date.now();
        for (const [key, requests] of this.requests.entries()) {
            const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
            if (validRequests.length === 0) {
                this.requests.delete(key);
            }
            else {
                this.requests.set(key, validRequests);
            }
        }
    }
}
exports.generalRateLimit = new RateLimiter(15 * 60 * 1000, 100);
exports.strictRateLimit = new RateLimiter(5 * 60 * 1000, 10);
exports.tripValidation = {
    create: (body) => {
        const errors = [];
        if (!body.userId || typeof body.userId !== 'string') {
            errors.push('User ID is required');
        }
        if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
            errors.push('Trip name is required');
        }
        if (!body.origin) {
            errors.push('Origin location is required');
        }
        else {
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
        }
        else {
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
        }
        else {
            if (!Array.isArray(body.schedule.days) || body.schedule.days.length === 0) {
                errors.push('At least one day must be selected');
            }
            if (!body.schedule.windowStart || !body.schedule.windowEnd) {
                errors.push('Departure window times are required');
            }
        }
        if (!body.alertThreshold) {
            errors.push('Alert threshold is required');
        }
        else {
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
    update: (body) => {
        const errors = [];
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
exports.queryValidation = {
    userId: (query) => {
        const errors = [];
        if (!query.userId || typeof query.userId !== 'string') {
            errors.push('userId query parameter is required');
        }
        return errors;
    }
};
exports.paramValidation = {
    tripId: (params) => {
        const errors = [];
        if (!params.id || typeof params.id !== 'string') {
            errors.push('Trip ID parameter is required');
        }
        return errors;
    }
};
exports.demoValidation = {
    trafficScenario: (body) => {
        const errors = [];
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
function handleValidationError(error, req, res, next) {
    if (error instanceof ValidationError) {
        const response = {
            success: false,
            error: error.message,
            message: `Validation errors: ${error.errors.join(', ')}`
        };
        return res.status(400).json(response);
    }
    next(error);
}
//# sourceMappingURL=validation.js.map