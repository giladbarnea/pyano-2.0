/// <reference types="../declarations/renderer" />
declare class BaseException extends Error {
    constructor(message?: string, options?: ErrorObj);
}
export declare class FileNotFoundError extends BaseException {
    constructor(message?: string, options?: ErrorObj);
}
export {};
