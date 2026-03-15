import { selectRateLimitStrategy } from "../rate-limiter/index.js";
import { Request, Response, NextFunction } from "express";
import { RateLimiterOptions } from "../types/RateLimiterOptions.js";

export default function rateLimitMiddleware(
    options: RateLimiterOptions
) {
    const {
        limit,
        windowInSeconds,
        strategy
    } = options;

    const rateLimiter = selectRateLimitStrategy(strategy);

    return async function (
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        const identifier = options.identifier?.(req) ?? req.ip ?? "UNKNOWN";
        const allowed = await rateLimiter.isRequestAllowed(identifier, limit, windowInSeconds);

        if (!allowed) {
            res.status(429)
                .set("Retry-After", String(windowInSeconds))
                .json({
                    error: "RATE_LIMITED",
                    message: "Too many requests"
                });
            return;
        }
        next();
    }
}