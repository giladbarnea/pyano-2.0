/// <reference types="../node_modules/electron" />
/// <reference types="../node_modules/@types/dom-mediacapture-record" />
interface TMap<T = any> {
    [s: string]: T;
    [s: number]: T;
}
interface SMap<T = any> {
    [s: string]: T;
}
interface NMap<T = any> {
    [s: number]: T;
}
interface RecMap<T = any> {
    [s: string]: T | RecMap<T>;
    [s: number]: T | RecMap<T>;
}
declare type Enumerated<T> = T extends (infer U)[] ? [i: number, item: U][] : T extends SMap<(infer U)> ? [key: string, value: U][] : T extends NMap<(infer U)> ? [key: number, value: U][] : T extends TMap<(infer U)> ? [key: keyof T, value: U][] : T extends RecMap<(infer U)> ? [key: keyof T, value: U][] : never;
interface Object {
    keys<T>(): Array<keyof T>;
    /**Gets value of `key` and deletes it from instance.*/
    pop(key: PropertyKey, defualt?: any): any;
}
interface String {
    endsWithAny(...args: string[]): boolean;
    human(): string;
    isdigit(): boolean;
    lower(): string;
    upper(): string;
    removeAll(removeValue: string | number | RegExp | TMap<string>, ...removeValues: (string | number | RegExp | TMap<string>)[]): string;
    /**Replaces everything*/
    replaceAll(searchValue: TMap<string>): string;
    /**Replaces everything*/
    replaceAll(searchValue: string | number | RegExp, replaceValue: string): string;
    title(): string;
    partition(val: string): [string, string, string];
    upTo(searchString: string, searchFromEnd?: boolean): string;
}
interface Array<T> {
    _lowerAll: T[];
    /**Also caches _lowerAll*/
    lowerAll(): T[];
    count(item: T): number;
    count(predicate: (item: T) => boolean): number;
    lazy(fn: (item: T) => T): IterableIterator<T>;
}
interface Number {
    human(letters?: boolean): string;
}
interface Date {
    /**"31-12-2020_23-40-50-789"*/
    human(format: 'DD-MM-YYYY_HH-mm-ss-fff'): string;
    /**"31-12-2020_23-40-50"*/
    human(format: 'DD-MM-YYYY_HH-mm-ss'): string;
    /**"2020-12-31_23-40-50-789"*/
    human(format: 'YYYY-MM-DD_HH-mm-ss-fff'): string;
    /**"2020-12-31_23-40-50"*/
    human(format: 'YYYY-MM-DD_HH-mm-ss'): string;
    /**"2020-12-31_23-40-50"*/
    human(): string;
}
interface Error {
    toObj(): {
        original_error: Error;
        /**'ReferenceError: formattedStrings is not defined'*/
        what: string;
        /**'at startIfReady (/home/gilad/Code/scratches/pyano-2.0-versions-playground/dist/pages/New/index.js:50:23)'*/
        where: string;
        callsites: any[];
        stack: string;
        code?: string;
        when?: string;
        locals?: TMap<string>;
        /**A pretty-formatted verbose string*/
        toString(): string;
        toNiceHtml(): string;
    };
}
interface Callsite {
    typeName: string;
    functionName: string;
    methodName: string;
    fileName: string;
    lineNumber: string;
    columnNumber: string;
    function: string;
    evalOrigin: string;
    topLevel: boolean;
    eval: boolean;
    native: boolean;
    constructor: boolean;
    getTypeName(): string;
    getFunctionName(): string;
    getMethodName(): string;
    getFileName(): string;
    getLineNumber(): number;
    getColumnNumber(): number;
    getFunction(): any;
    getEvalOrigin(): any;
    isNative(): boolean;
    isEval(): boolean;
    isTopLevel(): boolean;
    isConstructor(): boolean;
}
interface Console {
    orig: Partial<Console>;
    title(...args: any[]): any;
}
declare const path: any;
declare const fs: any;
declare const util: {
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
    round(n: number, d?: number): number;
    int(x: any, base?: string | number): number;
    str(val: any): any;
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
    bool(val: any): boolean;
    enumerate<T>(obj: T): Enumerated<T>;
    any(...args: any[]): boolean;
    all(...args: any): boolean;
    sum(arr: any[]): number | undefined;
    range(start: number, stop: number): Generator<number>;
    zip(arr1: any, arr2: any): Generator<any[], void, unknown>;
    isString(obj: any): obj is string;
    isPromise(obj: any): obj is Promise<any>;
    /**
     @example
     > [
     .    Error(),
     .    new Error,
     .    new Error(),
     . ].map(isError).every(x=>x===true)
     true

     > [
     .    0,
     .    '',
     .    [],
     .    1,
     .    '0',
     .    ' ',
     .    ()=>{},
     .    '1',
     .    Boolean(),
     .    Boolean,
     .    Function(),
     .    Function,
     .    Number(),
     .    Number,
     .    false,
     .    new Boolean(),
     .    new Boolean(true),
     .    new Boolean(false),
     .    new Number(0),
     .    new Number(),
     .    new Number(1),
     .    Error,
     .    [1],
     .    function(){},
     .    new Function(),
     .    true,
     .    null,
     .    { hi : 'bye' },
     .    undefined,
     . ].map(isError).some(x=>x===true)
     false
     * */
    isError(obj: any): obj is Error;
    /*** Same is Array.isArray?
     * Only `true` for `[]` and `[ 1 ]`*/
    isArray<T>(obj: any): obj is Array<T>;
    /**
     @example
     > [
     .    [],
     .    {},
     . ].map(isEmpty).every(x=>x===true)
     true
     > [
     .    0,
     .    1,
     .    '',
     .    ' ',
     .    '0',
     .    '1',
     .    ()=>{},
     .    Boolean,
     .    Boolean(),
     .    Function,
     .    Function(),
     .    Number,
     .    Number(),
     .    [ 1 ],
     .    false,
     .    function(){},
     .    new Boolean(),
     .    new Boolean(false),
     .    new Boolean(true),
     .    new Function(),
     .    new Number(0),
     .    new Number(1),
     .    new Number(),
     .    null,
     .    true,
     .    undefined,
     .    { hi : 'bye' },
     . ].map(isEmpty).some(x=>x===true)
     false
     * */
    isEmpty(obj: any): boolean;
    /**
     * @example
     * > isEmptyArr([])
     * true
     > [
     .    0,
     .    '',
     .    1,
     .    '0',
     .    ' ',
     .    ()=>{},
     .    '1',
     .    Boolean(),
     .    Boolean,
     .    Function(),
     .    Function,
     .    Number(),
     .    Number,
     .    false,
     .    [ 1 ],
     .    new Boolean(),
     .    function(){},
     .    new Boolean(true),
     .    new Boolean(false),
     .    new Number(0),
     .    new Function(),
     .    new Number(),
     .    new Number(1),
     .    Set,
     .    new Set,
     .    new Set(),
     .    true,
     .    null,
     .    { hi : 'bye' },
     .    undefined,
     .    {},
     . ].map(isEmptyArr).some(x=>x===true)
     false
     * */
    isEmptyArr(collection: any): boolean;
    /**
     @example
     > [
     .    {},
     . ].map(isEmptyObj).every(x=>x===true)
     true

     > [
     .    0,
     .    '',
     .    [],
     .    1,
     .    '0',
     .    ' ',
     .    ()=>{},
     .    '1',
     .    Boolean(),
     .    Boolean,
     .    Function(),
     .    Function,
     .    Number(),
     .    Number,
     .    false,
     .    new Boolean(),
     .    new Boolean(true),
     .    new Boolean(false),
     .    new Number(0),
     .    new Number(),
     .    new Number(1),
     .    Set,
     .    new Set,
     .    new Set(),
     .    Error,
     .    Error(),
     .    new Error,
     .    new Error(),
     .    [1],
     .    function(){},
     .    new Function(),
     .    true,
     .    null,
     .    { hi : 'bye' },
     .    undefined,
     . ].map(isEmptyObj).some(x=>x===true)
     false
     * */
    isEmptyObj(obj: any): boolean;
    /**
     @example
     > [
     .    ()=>{},
     .    Boolean,
     .    Function(),
     .    Function,
     .    Number,
     .    Set,
     .    function(){},
     .    new Function(),
     .    Error,
     . ].map(isFunction).every(x=>x===true)
     true

     > [
     .    0,
     .    '',
     .    [],
     .    1,
     .    '0',
     .    ' ',
     .    '1',
     .    {},
     .    Boolean(),
     .    Number(),
     .    false,
     .    new Boolean(),
     .    new Boolean(true),
     .    new Boolean(false),
     .    new Number(0),
     .    new Number(),
     .    new Number(1),
     .    new Error(),
     .    new Error,
     .    Error(),
     .    new Set,
     .    new Set(),
     .    [1],
     .    true,
     .    null,
     .    { hi : 'bye' },
     .    undefined,
     . ].map(isFunction).some(x=>x===true)
     false
     * */
    isFunction(fn: any): fn is Function;
    /**Has to be either {} or {foo:"bar"}. Not anything else.
     @example
     > [
     .    {},
     .    { foo : 'bar' },
     .    { foo : undefined },
     .    { foo : null },
     . ].map(isTMap).every(x=>x===true)
     true

     > [
     .    [],
     .    [1],
     .    new Boolean(),
     .    new Boolean(true),
     .    new Boolean(false),
     .    new Number(),
     .    new Number(0),
     .    new Number(1),
     .    new Set,
     .    new Set(),
     .    Error(),
     .    new Error,
     .    new Error(),
     .    0,
     .    '',
     .    1,
     .    '0',
     .    ' ',
     .    '1',
     .    ()=>{},
     .    Boolean(),
     .    Boolean,
     .    Function(),
     .    Function,
     .    Number,
     .    Set,
     .    function(){},
     .    new Function(),
     .    Number(),
     .    Error,
     .    false,
     .    true,
     .    null,
     .    undefined,
     . ].map(isTMap).some(x=>x===true)
     false
     * */
    isTMap<T>(obj: TMap<T>): obj is TMap<T>;
    /**
     @example
     > [
     .    [],
     .    [1],
     .    new Boolean(),
     .    new Boolean(true),
     .    new Boolean(false),
     .    new Number(),
     .    new Number(0),
     .    new Number(1),
     .    new Set,
     .    new Set(),
     .    Error(),
     .    new Error,
     .    new Error(),
     .    {},
     .    { hi : 'bye' },
     . ].map(isObject).every(x=>x===true)
     true

     > [
     .    0,
     .    '',
     .    1,
     .    '0',
     .    ' ',
     .    '1',
     .    ()=>{},
     .    Boolean(),
     .    Boolean,
     .    Function(),
     .    Function,
     .    Number,
     .    Set,
     .    function(){},
     .    new Function(),
     .    Number(),
     .    Error,
     .    false,
     .    true,
     .    null,
     .    undefined,
     . ].map(isObject).some(x=>x===true)
     false
     */
    isObject(obj: any): boolean;
    isPrimitive(value: any): boolean;
    getCurrentWindow(): Electron.BrowserWindow;
    reloadPage(): void;
    editBigConfig(): void;
    /**Writes screen capture (png) and exports full page to HTML for both main window WebContents and DevTools WebContents.*/
    saveScreenshots(): Promise<void>;
    /**
     @example
     const myFunc = investigate([async] function myFunc(val: any): boolean { ... }
     */
    investigate<T extends (...args: any[]) => any>(fn: T, options?: {
        group: boolean;
    }): T;
    investigate<T extends (...args: any[]) => any>(thisArg: ThisParameterType<T>, fnname: string, descriptor: {
        value: T;
    }): void;
    investigate<Getter extends () => any, Setter extends (val: any) => any>(thisArg: ThisParameterType<Getter>, fnname: string, descriptor: {
        get: Getter;
        set: Setter;
    }): void;
    ignoreErr(fn: (...args: any[]) => any): void;
    /**Extracts useful information from an Error, and returns a tuple containing formatted data, to be printed right away.

     Calls Error.toObj() and 'stack-trace' lib.
     @param e - can have 'whilst' key and 'locals' key.
     */
    /**
     * Safely does `console.error(err.toObj().toString())`.
     * @param options - If unpecified, both default to true but conditioned on cmd line args `--no-screenshots-on-error` and `--no-swal-on-error`.
     * This serves functionality around elog.catchErrors.
     * If specified true explicitly, bypass cmd line args `--no-screenshots-on-error` and `--no-swal-on-error`.
     * This serves functionality around calling onError programmaticly.
     */
    onError(error: Error, options?: {
        screenshots?: boolean;
        swal?: boolean;
    }, submitIssue?: any): boolean;
    /**
     @example
     > function foo(bar, baz){
 .    const argnames = getFnArgNames(foo);
 .    return Object.fromEntries(zip(argnames, arguments));
 . }
     . foo('rab', 'zab')
     {bar:'rab', baz:'zab'}
     */
    getFnArgNames(func: Function): string[];
    getMethodNames(obj: any): Set<unknown>;
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
    hasprops<Obj extends Record<any, any>, Key extends string>(obj: Obj, ...keys: Key[]): boolean;
    safeExec(command: string, options?: any): string | undefined;
    copy<T>(obj: T): T;
    /**
     true if objects have the same CONTENT. This means that
     @example
     > equal( [1,2], [2,1] )
     true

     */
    equal(a: any, b: any): boolean;
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
    now(decdigits?: number, kwargs?: {
        date?: Date;
        unix_ms?: number;
        unix_sec?: number;
    }): number;
    hash(obj: any): number;
    wait(ms: number, honorSkipFade?: boolean): Promise<any>;
    /**Check every `checkInterval` ms if `cond()` is truthy. If, within `timeout`, cond() is truthy, return `true`. Return `false` if time is out.
     * @example
     * // Give the user a 200ms chance to get her pointer over "mydiv". Continue immediately once she does, or after 200ms if she doesn't.
     * mydiv.pointerenter( () => mydiv.pointerHovering = true; )
     * const pointerOnMydiv = await waitUntil(() => mydiv.pointerHovering, 10, 200);*/
    waitUntil(cond: () => boolean, checkInterval?: number, timeout?: number): Promise<boolean>;
};
declare const nodeutil: any;
declare const _pft: any;
declare namespace pftns {
    export type Colors = {
        comment: {
            close: string;
            open: string;
        };
        content: {
            close: string;
            open: string;
        };
        prop: {
            close: string;
            open: string;
        };
        tag: {
            close: string;
            open: string;
        };
        value: {
            close: string;
            open: string;
        };
    };
    type Indent = (arg0: string) => string;
    export type Refs = Array<unknown>;
    type Print = (arg0: unknown) => string;
    export type Theme = {
        comment: string;
        content: string;
        prop: string;
        tag: string;
        value: string;
    };
    type ThemeReceived = {
        comment?: string;
        content?: string;
        prop?: string;
        tag?: string;
        value?: string;
    };
    export type Options = {
        callToJSON: boolean;
        escapeRegex: boolean;
        escapeString: boolean;
        highlight: boolean;
        indent: number;
        maxDepth: number;
        min: boolean;
        plugins: Plugins;
        printFunctionName: boolean;
        theme: Theme;
    };
    export type OptionsReceived = {
        callToJSON?: boolean;
        escapeRegex?: boolean;
        escapeString?: boolean;
        highlight?: boolean;
        indent?: number;
        maxDepth?: number;
        min?: boolean;
        plugins?: Plugins;
        printFunctionName?: boolean;
        theme?: ThemeReceived;
    };
    export type Config = {
        callToJSON: boolean;
        colors: Colors;
        escapeRegex: boolean;
        escapeString: boolean;
        indent: string;
        maxDepth: number;
        min: boolean;
        plugins: Plugins;
        printFunctionName: boolean;
        spacingInner: string;
        spacingOuter: string;
    };
    export type Printer = (val: unknown, config: Config, indentation: string, depth: number, refs: Refs, hasCalledToJSON?: boolean) => string;
    type Test = (arg0: any) => boolean;
    export type NewPlugin = {
        serialize: (val: any, config: Config, indentation: string, depth: number, refs: Refs, printer: Printer) => string;
        test: Test;
    };
    type PluginOptions = {
        edgeSpacing: string;
        min: boolean;
        spacing: string;
    };
    export type OldPlugin = {
        print: (val: unknown, print: Print, indent: Indent, options: PluginOptions, colors: Colors) => string;
        test: Test;
    };
    export type Plugin = NewPlugin | OldPlugin;
    export type Plugins = Array<Plugin>;
    export {};
}
declare const __pft_fn_plugin: pftns.Plugin;
declare const __pft_callsite_plugin: pftns.Plugin;
declare const __pft_class_plugin: pftns.Plugin;
declare const __pft_plugins: pftns.Plugin[];
declare function pff(val: unknown, options?: any): any;
declare function pf(_val: unknown, _options?: any): any;
/**Calls original `console` methods, pretty-formatting each arg, coloring and prefixing the output with [LEVEL]. */
declare function __generic_format(level: 'debug' | 'log' | 'title' | 'warn', ...args: any[]): void;
declare const title: (...args: any[]) => any;
/**Calls `__generic_format('title')`.
 * @see __generic_format*/
declare function ptitle(...args: any[]): void;
declare const debug: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
};
/**Calls `__generic_format('debug')`.
 * @see __generic_format*/
declare function pdebug(...args: any[]): void;
declare const log: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
};
/**Calls `__generic_format('log')`.
 * @see __generic_format*/
declare function plog(...args: any[]): void;
declare const warn: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
};
/**Calls `__generic_format('warn')`.
 * @see __generic_format*/
declare function pwarn(...args: any[]): void;
declare const elog: any;
declare const myfs: any;
declare const store: any;
declare const remote: Electron.Remote;
declare const argvars: string[];
declare const DEVTOOLS: boolean;
declare let EDITBIGCONF: string;
declare let EDITLOG: string;
declare const NOCONSOLELOGTOFILE: boolean;
declare const NOSCREENCAPTURE: boolean;
declare const NOSCREENSHOTSONERROR: boolean;
declare const NOSWALONERROR: boolean;
declare const DEBUG: boolean;
declare const DRYRUN: boolean;
declare const NOPYTHON: boolean;
declare const _table: any;
declare function table(title: string, data: any): any;
declare let ROOT_PATH_ABS: string;
declare let SRC_PATH_ABS: string;
declare const ERRORS_PATH_ABS: any;
declare const SESSION_PATH_ABS: any;
declare const SALAMANDER_PATH_ABS: any;
declare const EXPERIMENTS_PATH_ABS: any;
declare const TRUTHS_PATH_ABS: any;
declare const CONFIGS_PATH_ABS: any;
declare const SUBJECTS_PATH_ABS: any;
declare let RECORD_START_TS: any;
declare let MEDIA_RECORDER: MediaRecorder;
declare const __logfilepath: any;
declare function __print_git_stats(): void;
declare const __loglevels: {
    0: string;
    1: string;
    2: string;
    3: string;
};
declare function __writeConsoleMessageToLogFile(event: any, level: any, message: any, line: any, sourceId: any): void;
declare const TS0: number;
declare const BigConfig: any;
