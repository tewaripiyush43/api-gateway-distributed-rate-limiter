import client from "../../config/redis.js";
import RateLimitStrategy from "./rateLimitStrategy.js";
import crypto from "crypto";

export default class SlidingWindow implements RateLimitStrategy {
    async isRequestAllowed(
        identifier: string,
        limit: number,
        windowInSeconds: number
    ): Promise<boolean> {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const key = `sw:${identifier}`;

        try {
            const replies = await client.multi()
                .zRemRangeByScore(
                    key,
                    0,
                    nowInSeconds - windowInSeconds
                )
                .zAdd(key, {
                    score: nowInSeconds,
                    value: crypto.randomUUID()
                })
                .expire(key, windowInSeconds)
                .zCard(key)
                .exec();

            const count = replies[3] as unknown as number;
            return count <= limit;
        } catch (err) {
            // fail-open
            return true;
        }
    }
}