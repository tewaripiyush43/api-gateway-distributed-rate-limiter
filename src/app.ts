import proxyRouter from "./routes/proxy.routes.js";
import systemRouter from "./routes/system.routes.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import metricMiddleware from "./middlewares/metrics.middleware.js";
import express from "express";

const app = express();

app.use(metricMiddleware);

app.use("/", systemRouter);
app.use("/proxy", proxyRouter);

app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Endpoint doesn't exist"
  })
})

app.use(errorHandler);

export default app;

