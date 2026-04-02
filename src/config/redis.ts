import { createClient } from "redis";
import { ENV } from "./env.js";

const client = createClient({
    url: ENV.REDIS_URL,
    disableOfflineQueue: true
});
client.on("error", (err) => { console.log("Redis connection error:", err.message); });

export default client;