declare namespace Express {
    export interface Request {
        client?: {
            key: string
            plan: string
        };
    }
}
