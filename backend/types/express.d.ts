// Type declarations for Express with authentication extensions
// This file augments the Express Request interface to include the user property

import 'express';
import { Router } from 'express';

// Re-export express types to avoid resolution issues
export { Router };

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
