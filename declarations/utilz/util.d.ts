/// <reference types="../declarations/renderer" />
/// <reference types="../node_modules/electron" />
/// <reference types="node" />
import * as cp from 'child_process';
import * as is from './is';
/**
 @example
 > round(100.5)
 100
 > round(100.5, 0)
 100
 > round(100.5, 1)
 100.5
 > round(100.5, 2)
 100.5
 > round(100.50, 2)
 100.5
 > round(100.56, 2)
 100.56
 */
declare function round(n: number, d?: number): number;
declare function int(x: any, base?: string | number): number;
declare function str(val: any): any;
/**
 @example

 > [
 .    1,
 .    '0',
 .    ' ',
 .    true,
 .    'foo',
 .    { hi : 'bye' },
 .    ()=>{},
 .    function(){},
 .    Boolean,
 .    Boolean(true),
 .    Function,
 .    Function(),
 .    Number,
 .    Number(1),
 .    [0],
 .    [1],
 .    [[]],
 .    [false],
 .    [true],
 .    document.body,
 .    new Boolean(true),
 .    new Function,
 .    new Function(),
 .    new Number(1),
 . ].map(bool).every(x=>x===true)
 true

 > [
 .    0,
 .    '',
 .    [],     // unlike native
 .    {},       // unlike native
 .    false,
 .    null,
 .    undefined,
 .    Boolean(),
 .    Boolean(false),
 .    new Boolean,        // unlike native
 .    new Boolean(),      // unlike native
 .    new Boolean(false),     // unlike native
 .    Number(),       // unlike native
 .    Number(0),       // unlike native
 .    new Number,
 .    new Number(),       // unlike native
 .    new Number(0),
 .    new class{},       // unlike native
 . ].map(bool).some(x=>x===true)
 false
 */
declare function bool(val: any): boolean;
declare function enumerate<T>(obj: T): Enumerated<T>;
declare function any(...args: any[]): boolean;
declare function all(...args: any): boolean;
declare function sum(arr: any[]): number | undefined;
declare function range(start: number, stop: number): Generator<number>;
declare function zip(arr1: any, arr2: any): Generator<any[], void, unknown>;
declare function getCurrentWindow(): Electron.BrowserWindow;
declare function reloadPage(): void;
declare function editBigConfig(): void;
/**Writes screen capture (png) and exports full page to HTML for both main window WebContents and DevTools WebContents.*/
declare function saveScreenshots(): Promise<void>;
/**
 @example
 const myFunc = investigate([async] function myFunc(val: any): boolean { ... }
 */
declare function investigate<T extends (...args: any[]) => any>(fn: T, options?: {
    group: boolean;
}): T;
declare function investigate<T extends (...args: any[]) => any>(thisArg: ThisParameterType<T>, fnname: string, descriptor: {
    value: T;
}): void;
declare function investigate<Getter extends () => any, Setter extends (val: any) => any>(thisArg: ThisParameterType<Getter>, fnname: string, descriptor: {
    get: Getter;
    set: Setter;
}): void;
declare function ignoreErr(fn: (...args: any[]) => any): void;
/**
 * Safely does `console.error(err.toObj().toString())`.
 * @param options - If unpecified, both default to true but conditioned on cmd line args `--no-screenshots-on-error` and `--no-swal-on-error`.
 * This serves functionality around elog.catchErrors.
 * If specified true explicitly, bypass cmd line args `--no-screenshots-on-error` and `--no-swal-on-error`.
 * This serves functionality around calling onError programmaticly.
 */
declare function onError(error: Error, options?: {
    screenshots?: boolean;
    swal?: boolean;
}, submitIssue?: any): boolean;
/**
 https://nodejs.org/api/util.html#util_util_inspect_object_options
 maxArrayLength: null or Infinity to show all elements. Set to 0 or negative to show no elements. Default: 100
 maxStringLength: null or Infinity to show all elements. Set to 0 or negative to show no characters. Default: 10000.
 breakLength: default: 80
 Objects can define a [inspect](){ } or [util.inspect.custom](depth, options){ }
 */
declare function inspect(obj: any, options?: NodeJS.InspectOptions): string;
/**
 @example
 > function foo(bar, baz){
 .    const argnames = getFnArgNames(foo);
 .    return Object.fromEntries(zip(argnames, arguments));
 . }
 . foo('rab', 'zab')
 {bar:'rab', baz:'zab'}
 */
declare function getFnArgNames(func: Function): string[];
declare function getMethodNames(obj: any): Set<unknown>;
/**
 @example
 > const obj = { time: 5 };
 * if (hasprops(obj, "level")) {
 *     console.log(obj.level); // ok
 *     console.log(obj.bad); // err
 * } else {
 *     console.log(obj.level); // err
 *     console.log(obj.bad); // err
 * }
 * */
declare function hasprops<Obj extends Record<any, any>, Key extends string>(obj: Obj, ...keys: Key[]): boolean;
declare function safeExec(command: string, options?: cp.ExecSyncOptions): string | undefined;
declare function copy<T>(obj: T): T;
/**
 true if objects have the same CONTENT. This means that
 @example
 > equal( [1,2], [2,1] )
 true

 */
declare function equal(a: any, b: any): boolean;
/**
 * Returns ts (seconds since epoch).
 * @param decdigits - default 0. decdigits=1 for ts in 0.1s resolution, decdigits=3 for ts in ms resolution.
 *
 @example
 now() // → 1600000000
 now(0) // → 1600000000
 now(1) // → 1600000000.7
 now(3) // → 1600000000.789
 */
declare function now(decdigits?: number, kwargs?: {
    date?: Date;
    unix_ms?: number;
    unix_sec?: number;
}): number;
declare function hash(obj: any): number;
declare function wait(ms: number, honorSkipFade?: boolean): Promise<any>;
/**Check every `checkInterval` ms if `cond()` is truthy. If, within `timeout`, cond() is truthy, return `true`. Return `false` if time is out.
 * @example
 * // Give the user a 200ms chance to get her pointer over "mydiv". Continue immediately once she does, or after 200ms if she doesn't.
 * mydiv.pointerenter( () => mydiv.pointerHovering = true; )
 * const pointerOnMydiv = await waitUntil(() => mydiv.pointerHovering, 10, 200);*/
declare function waitUntil(cond: () => boolean, checkInterval?: number, timeout?: number): Promise<boolean>;
export { all, any, bool, copy, editBigConfig, enumerate, equal, getCurrentWindow, getFnArgNames, getMethodNames, hash, hasprops, ignoreErr, inspect, int, investigate, is, now, onError, range, reloadPage, round, safeExec, saveScreenshots, str, sum, wait, waitUntil, zip, };
