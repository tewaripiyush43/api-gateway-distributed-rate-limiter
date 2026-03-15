import { createClient } from "redis";
import { ENV } from "./env.js";

const client = await createClient({
    url: ENV.REDIS_URL
});
client.on("error", () => { console.log("Error while connecting to redis"); process.exit(1) });

export default client;