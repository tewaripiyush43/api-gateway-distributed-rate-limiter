export class ServiceNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ServiceNotFoundError";
        Object.setPrototypeOf(this, ServiceNotFoundError.prototype);
    }
}
