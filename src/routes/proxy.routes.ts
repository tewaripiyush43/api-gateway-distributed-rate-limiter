import { Router } from "express";
import proxyHandler from "../gateway/proxyHandler.js";
import apiKeyMiddleware from "../middlewares/apiKey.middleware.js";
import planSelectorMiddleware from "../middlewares/planSelector.middleware.js";
import rateLimitMiddleware from "../middlewares/rateLimiter.middleware.js";

const proxyRouter = Router();

// Global 500 limit across all proxy requests
proxyRouter.use(
  rateLimitMiddleware({
    limit: 500,
    windowInSeconds: 60,
    strategy: "fixed",
    identifier: () => "GLOBAL"
  })
);

// Require API Key
proxyRouter.use(apiKeyMiddleware);

// Apply plan-specific rate limits
proxyRouter.use(planSelectorMiddleware({
  strategy: "sliding",
  identifier: (req) => req.client?.key ?? req.ip ?? "UNKNOWN"
}));

// Route everything directly through the proxy handler
proxyRouter.use("/", proxyHandler);

export default proxyRouter;
