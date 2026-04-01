import "dotenv/config";
import app from "./app.js";
import client from "./config/redis.js";
import { ENV } from "./config/env.js";

const PORT = ENV.PORT || 9001;
let shuttingDown = false;

await client.connect()
console.log("Redis server is connected")

const server = app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})

// process.on("SIGTERM", shutdownHandler);
// process.on("SIGINT", shutdownHandler);

function shutdownHandler() {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log("SIGTERM received, shutting down gracefully...");

    server.close(async () => {
        console.log("HTTP server is closed")

        try {
            await client.quit();
            console.log("Redis connection closed");
        } catch (err) {
            console.error(err);
        }
        setTimeout(() => {
            console.error("Forcefully shutting down");
            process.exit(1);
        }, 10000);
    })
}