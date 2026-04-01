type ServiceConfig = {
    path: string
}

export type TenantConfig = {
    plan: string,
    name: string,
    baseUrl: string,
    services: Record<string, ServiceConfig>
}

export const config: Record<string, TenantConfig> = {
    "api-key-1": {
        plan: "free",
        name: "abc",
        baseUrl: "http://localhost:9000",
        services: {
            "user": { path: "/user-service" },
            "dummy": { path: "/dummy" }
        }
    }
}