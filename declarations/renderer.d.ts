/// <reference types="../node_modules/electron" />
/// <reference types="node" />
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
declare type Enumerated<T> = T extends (infer U)[] ? [i: number, item: U][] : T extends Object ? [key: keyof T, value: T[keyof T]][] : never;
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
interface ErrorObj {
    original_error: Error;
    /** 'ReferenceError: formattedStrings is not defined'*/
    what: string;
    /**'at Object.<anonymous> (/home/gilad/Code/pyano-2.0-electron-11/dist/python.js:15:11)'*/
    where: string;
    callsites: any[];
    stack: string;
    /**Unix time of moment of creation or `ErrorObj`, or given for `toObj({ts})`*/
    ts: number;
    code?: string;
    /**Can be given externally for `toObj({when})`. Isn't generated internally.*/
    when?: string;
    locals?: TMap<string>;
    /**A pretty-formatted verbose string*/
    toString(): string;
    toNiceHtml(): string;
}
interface Error {
    toObj(options?: Partial<ErrorObj>): ErrorObj;
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
    important(...args: any[]): any;
    good(...args: any[]): any;
    title(...args: any[]): any;
    python(...args: any[]): any;
}
declare const path: any;
declare const fs: any;
declare const util: {
    app: {
        getCurrentWindow(): Electron.BrowserWindow;
        reloadPage(): void;
        openBigConfigInEditor(): void;
        /**Writes screen capture (png) and exports full page to HTML for both main window WebContents and DevTools WebContents.*/
        saveScreenshots(): Promise<void>;
    };
    inspect: {
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
        /**
         https://nodejs.org/api/util.html#util_util_inspect_object_options
         maxArrayLength: null or Infinity to show all elements. Set to 0 or negative to show no elements. Default: 100
         maxStringLength: null or Infinity to show all elements. Set to 0 or negative to show no characters. Default: 10000.
         breakLength: default: 80
         Objects can define a [inspect](){ } or [util.inspect.custom](depth, options){ }
         */
        inspect(obj: any, options?: NodeJS.InspectOptions): string;
        /**
         @example
         function foo(bar, baz){
    const argnames = getFnArgNames(foo);
    return Object.fromEntries(zip(argnames, arguments));
 }
         foo('rab', 'zab')  // {bar:'rab', baz:'zab'}
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
    };
    is: {
        isNumber(obj: any): obj is number;
        isString(obj: any): obj is string;
        isTMap<T>(obj: TMap<T>): obj is TMap<T>;
        isObject(obj: any): boolean;
        isFunction(fn: any): fn is Function;
        isFunction<T extends Function>(fn: T): fn is T;
        /**Note:
         nodeutil.isNumber(new Number(5)) // false
         nodeutil.isNumber(Number(5)) // true

         new Number(5) === 5 // false
         Number(5) === 5 // true

         Object.getPrototypeOf(new Number(5)).constructor // [Function: Number]
         Object.getPrototypeOf(Number(5)).constructor // [Function: Number]
         Object.getPrototypeOf(5).constructor // [Function: Number]

         typeof Number(5) // 'number'
         typeof new Number(5) // 'object'

         isPrimitive(Number(5)) // true
         isPrimitive(new Number(5)) // false

         ¯\_(ツ)_/¯
         */
        isPrimitive(value: any): boolean;
        isPromise(obj: any): obj is Promise<any>;
        isError(obj: any): obj is Error;
        isRe(obj: any): obj is RegExp;
        /***Only `true` for `[]` and `[ 1 ]`*/
        isArray<T>(obj: any): obj is Array<T>;
        isEmpty(obj: any): boolean;
        isEmptyArr(collection: any): boolean;
    };
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
    ignoreErr(fn: (...args: any[]) => any): void;
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
    tryCatch<T>(fn: () => Promise<T>, when: string): Promise<T | false>;
    wait(ms: number, honorSkipFade?: boolean): Promise<any>;
    /**Check every `checkInterval` ms if `cond()` is truthy. If, within `timeout`, cond() is truthy, return `true`. Return `false` if time is out.
     * @example
     * // Give the user a 200ms chance to get her pointer over "mydiv". Continue immediately once she does, or after 200ms if she doesn't.
     * mydiv.pointerenter( () => mydiv.pointerHovering = true; )
     * const pointerOnMydiv = await waitUntil(() => mydiv.pointerHovering, 10, 200);*/
    waitUntil(cond: () => boolean, checkInterval?: number, timeout?: number): Promise<boolean>;
};
declare const nodeutil: any;
declare namespace pftns {
    type Colors = {
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
    type Refs = Array<unknown>;
    type Print = (arg0: unknown) => string;
    type Theme = {
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
    type Options = {
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
    type OptionsReceived = {
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
    type Config = {
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
    type Printer = (val: unknown, config: Config, indentation: string, depth: number, refs: Refs, hasCalledToJSON?: boolean) => string;
    type Test = (arg0: any) => boolean;
    type NewPlugin = {
        serialize: (val: any, config: Config, indentation: string, depth: number, refs: Refs, printer: Printer) => string;
        test: Test;
    };
    type PluginOptions = {
        edgeSpacing: string;
        min: boolean;
        spacing: string;
    };
    type OldPlugin = {
        print: (val: unknown, print: Print, indent: Indent, options: PluginOptions, colors: Colors) => string;
        test: Test;
    };
    type Plugin = NewPlugin | OldPlugin;
    type Plugins = Array<Plugin>;
}
declare const _pft: any;
declare const __pft_fn_plugin: pftns.Plugin;
declare const __pft_callsite_plugin: pftns.Plugin;
declare const __pft_class_plugin: pftns.Plugin;
declare const __pft_plugins: pftns.Plugin[];
declare function pff(val: unknown, options?: pftns.OptionsReceived): any;
/**`min:true`*/
declare function pf(_val: unknown, _options?: Omit<pftns.OptionsReceived, "min">): any;
/**Calls original `console` methods, pretty-formatting each arg, coloring and prefixing the output with [LEVEL]. */
declare function __generic_format(level: 'debug' | 'log' | 'title' | 'warn', ...args: any[]): void;
/**Like `console.title`: Just prefixes with [TITLE] and does bold white for first arg. No pretty-formatting.
 * @see ptitle*/
declare const title: (...args: any[]) => any;
/**Calls `__generic_format('title')`.
 * @see __generic_format*/
declare function ptitle(...args: any[]): void;
/**Like `console.debug`: Just prefixes with [DEBUG] and does grey for first arg. No pretty-formatting.
 * @see pdebug*/
declare const debug: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
};
/**Calls `__generic_format('debug')`.
 * @see __generic_format*/
declare function pdebug(...args: any[]): void;
/**Like `console.log`: Just prefixes with [LOG]. No pretty-formatting.
 * @see plog*/
declare const log: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
};
/**Calls `__generic_format('log')`.
 * @see __generic_format*/
declare function plog(...args: any[]): void;
/**Like `console.warn`: Just prefixes with [WARN]. No pretty-formatting.
 * @see pwarn*/
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
