declare namespace Express {
    import { TenantConfig } from "../config/tenantConfig.ts";
    export interface Request {
        client?: TenantConfig
    }
}
