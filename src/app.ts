import proxyHandler from "./gateway/proxyHandler.js";
import { metrics } from "./metrics/metrics.js";
import apiKeyMiddleware from "./middlewares/apiKeyMiddleware.js";
import errorHandler from "./middlewares/errorHandler.js";
import metricMiddleware from "./middlewares/metricmiddleware.js";
import planSelectorMiddleware from "./middlewares/planSelectorMiddleware.js";
import rateLimitMiddleware from "./middlewares/rateLimitMiddleware.js";
import express from "express";

const app = express();
app.use(express.json());

app.use(metricMiddleware);

app.get(
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

app.get("/metrics", (req, res) => {
  res.status(200).json({ metrics: metrics.getMetrics() })
})

app.use(apiKeyMiddleware);

app.use(
  rateLimitMiddleware({
    limit: 500,
    windowInSeconds: 60,
    strategy: "fixed",
    identifier: () => "GLOBAL"
  })
);

app.use(planSelectorMiddleware({
  strategy: "sliding",
  identifier: (req) => req.client?.key ?? req.ip ?? "UNKNOWN"
}))

app.use("/proxy", proxyHandler);

app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Endpoint doesn't exist"
  })
})

app.use(errorHandler);

export default app;
