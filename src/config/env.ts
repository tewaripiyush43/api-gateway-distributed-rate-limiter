function requireEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        console.error(`Missing required environment variable: ${name}`);
        process.exit(1);
    }

    return value;
}

export const ENV = {
    PORT: requireEnv("PORT"),
    DOWNSTREAM_BASE_URL: requireEnv("DOWNSTREAM_BASE_URL"),
    RATE_LIMIT_STRATEGY: requireEnv("RATE_LIMIT_STRATEGY"),
    REDIS_URL: requireEnv("REDIS_URL")
};