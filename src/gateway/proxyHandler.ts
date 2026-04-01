import { ENV } from "../config/env.js";
import { NextFunction, Request, Response } from "express";
import { getDownstreamUrl } from "./downstreamUrlResolver.js";
import { GatewayTimeoutError } from "../errors/GatewayTimeoutError.js";

export default async function proxyHandler(req: Request, res: Response, next: NextFunction) {
    const abortController = new AbortController();

    const timeoutId = setTimeout(() => {
        abortController.abort();
    }, 10000); // 10 seconds

    try {
        const targetUrl = getDownstreamUrl(req.originalUrl, req.client!);
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

        // Stream raw body through to target natively
        const options: RequestInit = {
            method: req.method,
            headers,
            body: req.method === 'GET' || req.method === "HEAD" ? undefined : (req as any).readable ? req : undefined,
            signal: abortController.signal,
            // @ts-ignore Node 18+ allows duplex streams
            duplex: "half"
        }

        const response = await fetch(targetUrl, options);

        // Pipe downstream response to client
        res.status(response.status);
        response.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });

        if (response.body) {
            // Wait for stream to finish piping
            for await (const chunk of response.body as any) {
                res.write(chunk);
            }
            res.end();
        } else {
            res.end();
        }

    }
    catch (err: any) {
        if (err.name === "AbortError") {
            next(new GatewayTimeoutError("Downstream service timed out."));
        } else {
            next(err);
        }
    } finally {
        clearTimeout(timeoutId);
    }
}