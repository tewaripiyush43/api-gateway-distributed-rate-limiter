import { Request } from "express"

export interface planSelectorOptions {
    strategy: "sliding" | "fixed",
    identifier: (req: Request) => string
}