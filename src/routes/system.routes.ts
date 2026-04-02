import { Router } from "express";
import { metrics } from "../metrics/metrics.js";
import express from "express";
import { getSystemHealth } from "../services/health.service.js";

const systemRouter = Router();

// Only parse JSON for system routes, keep proxy payloads purely as streams
systemRouter.use(express.json());


systemRouter.get(
  "/health",
  async (_req, res) => {
    const health = await getSystemHealth();

    res.status(200).send(health);
  }
);

systemRouter.get("/metrics", (_req, res) => {
  res.status(200).json({ metrics: metrics.getMetrics() });
});

export default systemRouter;
