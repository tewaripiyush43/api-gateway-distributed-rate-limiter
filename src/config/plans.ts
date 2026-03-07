export const PLAN_LIMITS: Record<string, { limit: number, windowInSeconds: number }> = {
    free: {
        limit: 20,
        windowInSeconds: 60
    },
    pro: {
        limit: 200,
        windowInSeconds: 60
    }
};