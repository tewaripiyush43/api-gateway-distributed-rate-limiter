import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

export default function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
    let id = req.headers['x-request-id'];

    if (Array.isArray(id)) {
        id = id[0];
    }

    if (typeof id !== "string" || id.length > 100 || id.trim().length === 0) {
        id = randomUUID();
    }

    req.requestId = id;
    req.headers['x-request-id'] = id;
    res.setHeader("x-request-id", id);
    next();
}