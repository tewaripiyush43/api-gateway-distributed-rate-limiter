import { Request, Response, NextFunction } from "express";
import { config, TenantConfig } from "../config/tenantConfig.js";
import { InvalidApiKeyError } from "../errors/InvalidApiKeyError.js";

export default function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];


    if (typeof apiKey !== 'string' || !config[apiKey]) {
        throw new InvalidApiKeyError("Invalid Api Key")
    }

    const tenatnConfig: TenantConfig = config[apiKey];

    req.client = tenatnConfig;
    next()
}