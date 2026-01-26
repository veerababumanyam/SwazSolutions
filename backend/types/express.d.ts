// Type declarations for Express and Socket.io with authentication extensions
// This file augments Express and Socket.io interfaces

import 'express';
import 'socket.io';

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

// Extend Socket.io Socket interface with custom properties
declare module 'socket.io' {
    interface Socket {
        userId?: string | number;
        username?: string;
        userRole?: string;
    }
}
