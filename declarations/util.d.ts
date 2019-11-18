/// <reference types="./node_modules/electron" />
declare function round(n: number, d?: number): number;
declare function float(str: string): number;
declare function int(x: any, base?: string | number | Function): number;
declare function bool(val: any): boolean;
declare function enumerate<T>(obj: T): Enumerated<T>;
declare function wait(ms: number): Promise<any>;
/**Check every `checkInterval` ms if `cond()` is truthy. If, within `timeout`, cond() is truthy, return `true`. Return `false` if time is out.
 * @example
 * // Give the user a 200ms chance to get her pointer over "mydiv". Continue immediately once she does, or after 200ms if she doesn't.
 * mydiv.pointerenter( () => mydiv.pointerHovering = true; )
 * const pointerOnMydiv = await waitUntil(() => mydiv.pointerHovering, 200, 10);*/
declare function waitUntil(cond: () => boolean, timeout?: number, checkInterval?: number): Promise<boolean>;
declare function isArray<T>(obj: any): obj is Array<T>;
declare function isEmptyArr(collection: any): boolean;
declare function isEmptyObj(obj: any): boolean;
declare function isFunction(fn: AnyFunction): fn is AnyFunction;
declare function isObject(obj: any): boolean;
declare function shallowProperty<T>(key: string): (obj: T) => T extends null ? undefined : T[keyof T];
declare function getLength(collection: any): number;
declare function any(collection: any): boolean;
declare function all(collection: any): boolean;
declare function getCurrentWindow(): Electron.BrowserWindow;
declare function reloadPage(): void;
//# sourceMappingURL=util.d.ts.map