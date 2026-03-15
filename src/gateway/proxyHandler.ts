import { ENV } from "../config/env.js";
import { NextFunction, Request, Response } from "express";

export default async function proxyHandler(req: Request, res: Response, next: NextFunction) {
    const abortController = new AbortController();

    const timeoutId = setTimeout(() => {
        abortController.abort();
    }, 10000); // 10 seconds

    try {

        const incoming = req.originalUrl;
        const forwardPath = incoming.split("/proxy")[1] || "";
        const targetUrl = `${ENV.DOWNSTREAM_BASE_URL}${forwardPath}`
        // console.log(req.headers);

        const forbiddenHeaders: Set<string> = new Set([
            "connection",
            "host",
            "content-length",
            "transfer-encoding"
        ]);

        const headers: Record<string, string> = {};
        Object.entries(req.headers).forEach(([key, value]) => {
            if (!forbiddenHeaders.has(key.toLowerCase()) && value !== undefined) {
                headers[key] = Array.isArray(value) ? value.join(", ") : value;
            }
        })
        // console.log(headers);
        const options = {
            method: req.method,
            headers,
            body: req.method === 'GET' || req.method === "HEAD" ? undefined : JSON.stringify(req.body),
            signal: abortController.signal
        }

        const response = await fetch(targetUrl, options);

        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const data = await response.json();
            res.status(response.status).json(data);
        } else {
            const data = await response.text();
            res.status(response.status).send(data);
        }

    }
    catch (err: any) {
        if (err.name === "AbortError") {
            console.log("Fetch aborted due to timeout");
            res.status(504).json({
                error: "GATEWAY_TIMEOUT"
            })
        } else {
            next(err);
        }
    } finally {
        clearTimeout(timeoutId);
    }
}