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
        error: err.name ? err.name : "INTERNAL_SERVER_ERROR",
        message: err.message ? err.message : "Something went wrong"
    })
}