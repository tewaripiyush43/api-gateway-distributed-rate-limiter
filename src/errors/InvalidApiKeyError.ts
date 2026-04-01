export class InvalidApiKeyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidApiKeyError";
        Object.setPrototypeOf(this, InvalidApiKeyError.prototype);
    }
}
