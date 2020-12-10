/// <reference types="../node_modules/electron" />
/// <reference types="../node_modules/@types/dom-mediacapture-record" />
interface Dict<T> {
    [s: string]: T;
    [s: number]: T;
}
interface String {
    endsWithAny(...args: string[]): boolean;
    human(): string;
    isdigit(): boolean;
    lower(): string;
    upper(): string;
    removeAll(removeValue: string | number | RegExp | Dict<string>, ...removeValues: (string | number | RegExp | Dict<string>)[]): string;
    replaceAll(searchValue: Dict<string>): string;
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
        whilst?: string;
        locals?: Dict<string>;
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
interface ILevel {
    notes: number;
    rhythm: boolean;
    tempo: number | null;
    trials: number;
}
declare const path: any;
declare const fs: any;
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
declare const util: any;
declare const elog: any;
declare function pft(val: unknown, options?: any): any;
declare function pftm(_val: unknown, _options?: any): any;
declare const myfs: any;
declare const store: any;
declare const swalert: any;
declare const remote: Electron.Remote;
declare const argvars: string[];
declare const DEBUG: boolean;
declare const DRYRUN: boolean;
declare const NOPYTHON: boolean;
declare const NOSCREENCAPTURE: boolean;
declare const AUTOEDITLOG: boolean;
declare const DEVTOOLS: boolean;
declare const table: any;
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
declare function __logGitStats(): void;
declare const __loglevels: {
    0: string;
    1: string;
    2: string;
    3: string;
};
declare function __writeConsoleMessageToLogFile(event: any, level: any, message: any, line: any, sourceId: any): void;
declare const TS0: any;
declare const BigConfig: any;
