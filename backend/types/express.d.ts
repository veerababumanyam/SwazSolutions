// Type declarations for Express with authentication extensions
// This file augments the Express Request interface to include the user property

import 'express';

declare global {
    namespace Express {
        interface Request {
            /** Authenticated user object set by auth middleware */
            user?: {
                id: number;
                email: string;
                name?: string;
            };
        }
    }
}
