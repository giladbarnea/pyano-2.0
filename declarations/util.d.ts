declare function int(x: any, base?: string | number | Function): number;
declare function str(val: any): any;
declare function bool(val: any): boolean;
declare function enumerate<T>(obj: T): Enumerated<T>;
declare function wait(ms: number, acknowledgeSkipFade?: boolean): Promise<any>;
declare function waitUntil(cond: FunctionReturns<boolean>, timeout?: number, checkInterval?: number): Promise<boolean>;
declare function isFunction<T>(fn: FunctionReturns<T>): fn is FunctionReturns<T>;
declare function isFunction(fn: AnyFunction): fn is AnyFunction;
declare function isObject(obj: any): boolean;
declare function any(collection: any[]): boolean;
declare function all(arr: any[]): boolean;
declare function sum(arr: any[]): number | undefined;
declare function reloadPage(): void;
export { any, all, bool, reloadPage, int, enumerate, isFunction, isObject, wait, sum, str, waitUntil };
//# sourceMappingURL=util.d.ts.map