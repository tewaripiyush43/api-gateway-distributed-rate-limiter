import "dotenv/config";
import app from "./app.js";
import client from "./config/redis.js";
import { ENV } from "./config/env.js";

const PORT = ENV.PORT || 9001;
let shuttingDown = false;

client.connect().catch((err: any) => {
    console.error("Redis connection error during startup:", err?.message || err);
});

client.on("ready", () => {
    console.log("Redis server is connected and ready");
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})

process.on("SIGTERM", shutdownHandler);
process.on("SIGINT", shutdownHandler);

function shutdownHandler() {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log("SIGTERM received, shutting down gracefully...");

    setTimeout(() => {
        console.error("Forcefully shutting down");
        process.exit(1);
    }, 10000);

    server.close(async () => {
        console.log("HTTP server is closed")

        try {
            await Promise.race([
                client.quit(),
                new Promise((_, resolve) => setTimeout(() => {
                    client.destroy();
                    resolve(null);
                }, 500))
            ]);
            console.log("Redis connection closed");
        } catch (err) {
            console.error(err);
        }
        process.exit(0);
    })
}