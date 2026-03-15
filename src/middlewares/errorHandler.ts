import { Request, Response, NextFunction } from "express";

export default function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    // console.error(err);
    if (res.headersSent) {
        return
    }

    res.status(500).json({
        error: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong"
    })
}