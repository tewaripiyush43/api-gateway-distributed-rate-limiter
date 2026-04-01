export class GatewayTimeoutError extends Error {
    constructor(message: string = "Gateway Timeout") {
        super(message);
        this.name = "GatewayTimeoutError";
        Object.setPrototypeOf(this, GatewayTimeoutError.prototype);
    }
}
