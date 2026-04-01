import { Router } from "express";
import { metrics } from "../metrics/metrics.js";
import rateLimitMiddleware from "../middlewares/rateLimiter.middleware.js";
import express from "express";

const systemRouter = Router();

// Only parse JSON for system routes, keep proxy payloads purely as streams
systemRouter.use(express.json());

systemRouter.get(
  "/health",
  rateLimitMiddleware({
    limit: 25,
    windowInSeconds: 60,
    strategy: "sliding"
  }),
  (_req, res) => {
    res.json({ status: "ok" });
  }
);

systemRouter.get("/metrics", (_req, res) => {
  res.status(200).json({ metrics: metrics.getMetrics() });
});

export default systemRouter;
