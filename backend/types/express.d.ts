// Type declarations for Express and Socket.io with authentication extensions
// This file augments Express and Socket.io interfaces without interfering with module resolution

declare module 'express' {
    interface Request {
        /** Authenticated user object set by auth middleware */
        user?: {
            id: number;
            email: string;
            name?: string;
        };
    }
}

declare module 'socket.io' {
    interface Socket {
        userId?: string | number;
        username?: string;
        userRole?: string;
    }
}
