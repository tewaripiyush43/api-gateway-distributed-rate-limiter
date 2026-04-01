import { Request, Response, NextFunction } from "express";
import { config, TenantConfig } from "../config/tenantConfig.js";

class InvalidApiKeyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidApiKeyError";

        Object.setPrototypeOf(this, InvalidApiKeyError);
    }

}

export default function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];


    if (typeof apiKey !== 'string' || !config[apiKey]) {
        throw new InvalidApiKeyError("Invalid Api Key")
    }

    const tenatnConfig: TenantConfig = config[apiKey];

    req.client = tenatnConfig;
    next()
}