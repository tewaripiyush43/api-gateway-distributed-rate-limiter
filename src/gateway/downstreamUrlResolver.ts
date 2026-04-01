import { TenantConfig } from "../config/tenantConfig.js";
import { ServiceNotFoundError } from "../errors/ServiceNotFoundError.js";

export function getDownstreamUrl(incomingUrl: string, tenantConfig: TenantConfig): string {
    const proxyIndex = incomingUrl.indexOf("/proxy");
    if (proxyIndex === -1) {
        throw new Error("Invalid proxy URL.");
    }

    const forwardPath = incomingUrl.substring(proxyIndex + 6);
    const service = forwardPath.split("/")[1];

    if (!service || !tenantConfig.services[service]) {
        throw new ServiceNotFoundError(`Service '${service}' does not exist.`);
    }

    const remainingPath = forwardPath.substring(service.length + 1);

    const downstreamUrl = tenantConfig.baseUrl + tenantConfig.services[service].path + remainingPath;
    console.log(`[Proxy] Forwarding to: ${downstreamUrl}`);
    return downstreamUrl;
}
