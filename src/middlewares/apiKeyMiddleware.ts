import { Request, Response, NextFunction } from "express";
import { API_KEYS } from "#config/apiKeys.js";

export default function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];


    if (typeof apiKey !== 'string' || !API_KEYS[apiKey]) {
        return next()
    }
    req.client = {
        key: apiKey,
        plan: API_KEYS[apiKey].plan
    }
    next()
}