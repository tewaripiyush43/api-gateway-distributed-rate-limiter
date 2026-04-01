import { metrics } from "../metrics/metrics.js";
import { Request, Response, NextFunction } from "express"

export default function metricMiddleware(_req: Request, res: Response, next: NextFunction) {
    metrics.recordRequest();
    const start = performance.now();

    res.on("finish", () => {
        const latency = performance.now() - start;
        metrics.recordLatency(latency)

        if (res.statusCode === 429) {
            metrics.recordBlocked();
        }
    })

    next()
}