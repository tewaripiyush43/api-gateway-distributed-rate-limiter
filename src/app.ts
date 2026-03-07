import proxyHandler from "#gateway/proxyHandler.js";
import apiKeyMiddleware from "#middlewares/apiKeyMiddleware.js";
import planSelectorMiddleware from "#middlewares/planSelectorMiddleware.js";
import rateLimitMiddleware from "#middlewares/rateLimitMiddleware.js";
import express from "express";

const app = express();
app.use(express.json());

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

export default app;