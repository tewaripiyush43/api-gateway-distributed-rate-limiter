import redisClient from "../config/redis.js";

export enum healthStatus {
  UP = "UP",
  DOWN = "DOWN"
}

export type healthResponse = {
  gateway: {
    status: healthStatus;
  };
  redis: {
    status: healthStatus;
    statusCode: number;
  };
  timestamp: Date;
};

export async function getSystemHealth(): Promise<healthResponse> {
  const response: healthResponse = {
    gateway: { status: healthStatus.UP },
    redis: { status: healthStatus.UP, statusCode: 200 },
    timestamp: new Date()
  };

  try {
    const pingResult = await Promise.race([
        redisClient.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 1000))
    ]);
    if (pingResult !== "PONG") {
      response.redis.status = healthStatus.DOWN;
      response.redis.statusCode = 503;
    }
  } catch (error) {
    response.redis.status = healthStatus.DOWN;
    response.redis.statusCode = 500;
  }

  return response;
}
