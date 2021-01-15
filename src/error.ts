class BaseException extends Error {
    constructor(message?: string, options?: ErrorObj) {
        super(message);
        this.name = this.constructor.name;

        for (let [key, val] of util.enumerate(options)) {
            this[key] = val;
        }
    }
}

export class FileNotFoundError extends BaseException {
    constructor(message?: string, options?: ErrorObj) {
        super(message, options);

    }
}