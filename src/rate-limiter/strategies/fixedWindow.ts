import client from "../../config/redis.js";
import RateLimitStrategy from "./rateLimitStrategy.js";

export default class FixedWindow implements RateLimitStrategy {
    async isRequestAllowed(
        identifier: string,
        limit: number,
        windowInSeconds: number
    ): Promise<boolean> {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const windowStart =
            Math.floor(nowInSeconds / windowInSeconds) * windowInSeconds;

        const key = `fw:${identifier}:${windowStart}`;

        try {
            const replies = await client.multi()
                .incr(key)
                .expire(key, windowInSeconds, 'NX')
                .exec();

            const count = replies[0] as unknown as number;

            if (count > limit) {
                return false;
            }

            return true;
        } catch (err) {
            return true;
        }
    }
}
