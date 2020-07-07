/// <reference types="./node_modules/electron" />
import { Enumerated } from "./bhe";
declare function str(val: any): any;
declare function bool(val: any): boolean;
declare function enumerate<T>(obj: T): Enumerated<T>;
declare function wait(ms: number, honorSkipFade?: boolean): Promise<any>;
declare function waitUntil(cond: () => boolean, checkInterval?: number, timeout?: number): Promise<boolean>;
declare function isString(obj: any): obj is string;
declare function isArray<T>(obj: any): obj is Array<T>;
declare function isObject(obj: any): boolean;
declare function any(...args: any[]): boolean;
declare function all(...args: any): boolean;
declare function sum(arr: any[]): number | undefined;
declare function getCurrentWindow(): Electron.BrowserWindow;
declare function reloadPage(): void;
declare function range(start: number, stop: number): Generator<number>;
declare function takeScreenshot(dirname: string): Promise<void>;
declare function ignoreErr(fn: (...args: any[]) => any): void;
export { all, any, bool, enumerate, getCurrentWindow, ignoreErr, isArray, isString, isObject, range, reloadPage, str, sum, takeScreenshot, wait, waitUntil };
//# sourceMappingURL=util.d.ts.map