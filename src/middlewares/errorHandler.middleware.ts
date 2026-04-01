import { Request, Response, NextFunction } from "express";
import { ServiceNotFoundError } from "../errors/ServiceNotFoundError.js";
import { InvalidApiKeyError } from "../errors/InvalidApiKeyError.js";
import { GatewayTimeoutError } from "../errors/GatewayTimeoutError.js";

export default function errorHandler(
    err: Error | any,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    if (res.headersSent) {
        return;
    }

    if (err instanceof ServiceNotFoundError) {
        res.status(404).json({ error: "SERVICE_NOT_FOUND", message: err.message });
        return;
    }

    if (err instanceof InvalidApiKeyError) {
        res.status(401).json({ error: "UNAUTHORIZED", message: err.message });
        return;
    }

    if (err instanceof GatewayTimeoutError) {
        res.status(504).json({ error: "GATEWAY_TIMEOUT", message: err.message });
        return;
    }

    // console.error(err);
    res.status(500).json({
        error: err.name ? err.name : "INTERNAL_SERVER_ERROR",
        message: err.message ? err.message : "Something went wrong"
    });
}