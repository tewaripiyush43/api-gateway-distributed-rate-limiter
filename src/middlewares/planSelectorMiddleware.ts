import { planSelectorOptions } from "#types/PlanSelectorOptions.js";
import { Request, Response, NextFunction } from "express";
import rateLimitMiddleware from "./rateLimitMiddleware.js";
import { PLAN_LIMITS } from "../config/plans.js";

export default function planSelectorMiddleware(
    options: planSelectorOptions
) {
    const { strategy, identifier } = options;
    const freeLimiter = rateLimitMiddleware({
        limit: PLAN_LIMITS.free.limit,
        windowInSeconds: PLAN_LIMITS.free.windowInSeconds,
        strategy: strategy,
        identifier: identifier
    });

    const proLimiter = rateLimitMiddleware({
        limit: PLAN_LIMITS.pro.limit,
        windowInSeconds: PLAN_LIMITS.pro.windowInSeconds,
        strategy: strategy,
        identifier: identifier
    })

    const defaultLimiter = rateLimitMiddleware({
        limit: 50,
        windowInSeconds: 60,
        strategy: "sliding",
        identifier: identifier
    })

    return function (
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        if (req.client?.plan === "free") {
            freeLimiter(req, res, next);
        } else if (req.client?.plan === "pro") {
            proLimiter(req, res, next)
        } else {
            defaultLimiter(req, res, next)
        }
    }
}