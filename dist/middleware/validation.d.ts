import { Request, Response, NextFunction } from 'express';
export declare class ValidationError extends Error {
    errors: string[];
    constructor(errors: string[]);
}
export declare function validateRequest(validationFn: (body: any) => string[]): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare function validateQuery(validationFn: (query: any) => string[]): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare function validateParams(validationFn: (params: any) => string[]): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare function sanitizeInput(req: Request, res: Response, next: NextFunction): void;
export declare function validateJSON(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
declare class RateLimiter {
    private requests;
    private windowMs;
    private maxRequests;
    constructor(windowMs?: number, maxRequests?: number);
    middleware(): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    private cleanup;
}
export declare const generalRateLimit: RateLimiter;
export declare const strictRateLimit: RateLimiter;
export declare const tripValidation: {
    create: (body: any) => string[];
    update: (body: any) => string[];
};
export declare const queryValidation: {
    userId: (query: any) => string[];
};
export declare const paramValidation: {
    tripId: (params: any) => string[];
};
export declare const demoValidation: {
    trafficScenario: (body: any) => string[];
};
export declare function handleValidationError(error: Error, req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=validation.d.ts.map