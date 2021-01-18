console.debug('utilz/util.ts')

import { elem } from "bhe";
import swalert from "swalert";

import * as cp from 'child_process';
// import * as is, { isArray, isEmpty, isObject, isString, isTMap } from 'util/is';
import * as is from './is';
import * as inspect from './inspect';
import * as app from './app';

////////////////////////////////////////////////////
// *** Python Builtins
////////////////////////////////////////////////////
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
function round(n: number, d: number = 0): number {
    const fr = 10 ** d;
    // @ts-ignore
    return parseInt((n + Number.EPSILON) * fr) / fr;
}

function int(x, base?: string | number): number {
    return parseInt(x, <number>base);
}

function str(val: any) {
    return val ? val.toString() : ""
}

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
function bool(val: any): boolean {

    if (!val) {
        return false;
    }
    const typeofval = typeof val;
    if (typeofval !== 'object') {
        if (typeofval === 'function') {
            return true;
        } else {
            return !!val;
        }
    }
    // let keysLength = Object.keys(val).length;
    let toStringed = {}.toString.call(val);
    if (toStringed === '[object Object]' || toStringed === '[object Array]') {
        return Object.keys(val).length !== 0;
    }

    // Boolean, Number, HTMLElement...
    return !!val.valueOf();
}

function enumerate<T>(obj: T): Enumerated<T> {
    // undefined    []
    // {}           []
    // []           []
    // ""           []
    // number       TypeError
    // null         TypeError
    // boolean      TypeError
    // Function     TypeError
    // "foo"        [ [0, "f"], [1, "o"], [2, "o"] ]
    // [ "foo" ]    [ [0, "foo"] ]
    // [ 10 ]       [ [0, 10] ]
    // { a: "foo" } [ ["a", "foo"] ]
    // // ()=>{}    ?
    let typeofObj = typeof obj;
    if (
        obj === undefined
        || is.isEmpty(obj)
        // || isEmptyArr(obj)
        // @ts-ignore
        || obj === ""
    ) {
        return [] as Enumerated<T>;
    }

    if (
        obj === null
        || typeofObj === "boolean"
        || typeofObj === "number"
        || typeofObj === "function"
    ) {
        throw new TypeError(`${typeofObj} object is not iterable`);
    }
    let array = [];
    if (is.isArray(obj)) {
        let i: number = 0;
        for (let x of obj) {
            array.push([i, x]);
            i++;
        }
    } else {
        for (let prop in obj) {
            array.push([prop, obj[prop]]);
        }
    }
    return array as Enumerated<T>;
}

function any(...args: any[]): boolean {
    for (let a of args) {
        if (bool(a)) {
            return true;
        }
    }
    return false;
}


function all(...args: any): boolean {
    for (let a of args) {
        if (!bool(a)) {
            return false;
        }
    }
    return true;
}

function sum(arr: any[]): number | undefined {
    let sum = 0;
    let dirty = false;
    for (let v of arr) {
        let number = parseFloat(v);
        if (!isNaN(number)) {
            dirty = true;
            sum += number;
        }

    }
    return !dirty ? undefined : sum;
}

function* range(start: number, stop: number): Generator<number> {
    for (let i = start; i <= stop; i++) {
        yield i;
    }

}

function* zip(arr1, arr2) {
    for (let i = 0; i < arr1.length; i++) {
        try {
            yield [arr1[i], arr2[i]]
        } catch (e) {
            return
        }
    }
}


/*


////////////////////////////////////////////////////
// *** underscore.js functions
////////////////////////////////////////////////////
function shallowProperty<T>(key: string): (obj: T) => T extends null ? undefined : T[keyof T] {
    return function (obj) {
        // == null true for undefined
        return obj == null ? void 0 : obj[key];
    };
}


function getLength(collection): number {

    return shallowProperty('length')(collection)
}*/


////////////////////////////////////////////////////
// *** Error Handling
////////////////////////////////////////////////////

async function tryCatch<T>(fn: () => Promise<T>, when: string): Promise<T | false> {
    try {
        const rv = await fn();
        return rv;
    } catch (e) {
        e.when = when;
        util.onError(e, { swal: true });
        return false;
        /*const errobj = (<Error>e).toObj();

        console.error()
        await swalert.big.error({
            title: `An error has occurred when ${when}`,
            html: errobj.toNiceHtml(),
        });
        return false;*/
    }
}

function suppressErr(fn) {
    try {
        return fn()
    } catch (e) {
        return undefined
    }
}

function ignoreErr(fn: (...args: any[]) => any) {
    // TODO: where is this used? unnecessary with elog.catchErrors
    try {
        fn();
    } catch (e) {
        console.warn(`IGNORED ERROR: `, e);
    }
}


/*function formatErr(e: Error & { whilst?: string, locals?: TMap<string> }): string[] {
    const where = e.stack.slice(this.stack.search(/(?<=\s)at/), this.stack.search(/(?<=at\s.*)\n/));
    // const what = this.message;
    // const whilst = this.whilst;
    // const locals = this.locals;
    // const { what, where, whilst, locals } = e.toObj();

    const stackTrace = require('stack-trace');
    const callsites = stackTrace.parse(e);
    const lastframe = callsites[0];
    const lines = `${fs.readFileSync(lastframe.fileName)}`.split('\n');

    let code = '';
    for (let linenum of [lastframe.lineNumber - 2, lastframe.lineNumber - 1, lastframe.lineNumber]) {
        // 0-based, so responsible line is lastframe.lineNumber - 1
        let line = lines[linenum];
        if (!bool(line)) {
            continue
        }
        if (linenum == lastframe.lineNumber - 1) {
            code += `→   ${line}\n`
        } else {
            code += `\t${line}\n`
        }

    }


    const formattedItems: string[] = [
        `\nWHAT:\n=====\n`, `${e.name}: ${e.message}`,
        '\n\nWHERE:\n=====\n', where,
    ];
    if (bool(code)) {
        formattedItems.push('\n\nCODE:\n=====\n', code)
    }

    if (whilst) {
        formattedItems.push('\n\nWHILST:\n======\n', whilst)
    }
    if (bool(locals) && anyDefined(locals)) {
        // anyDefined because { options: undefined } passes bool but shows up '{ }' when printed
        const prettyLocals = pf(locals);
        formattedItems.push('\n\nLOCALS:\n======\n', prettyLocals)
    }
    const prettyCallSites = pf(callsites);
    formattedItems.push(
        '\n\nCALL SITES:\n===========\n', prettyCallSites,

        // in DevTools, printing 'e' is enough for DevTools to print stack automagically,
        // but it's needed to be states explicitly for it to be written to log file
        '\n\nORIGINAL ERROR:\n===============\n', e.stack, '\n'
    );

    return formattedItems;
}*/

// function onError(error: Error, versions?: { app: string; electron: string; os: string }, submitIssue?: (url: string, data: any) => void): boolean
// function onError(error: Error, options?: { screenshots?: boolean, swal?: boolean }): boolean
/**
 * Safely does `console.error(err.toObj().toString())`.
 * @param options - If unpecified, both default to true but conditioned on cmd line args `--no-screenshots-on-error` and `--no-swal-on-error`.
 * This serves functionality around elog.catchErrors.
 * If specified true explicitly, bypass cmd line args `--no-screenshots-on-error` and `--no-swal-on-error`.
 * This serves functionality around calling onError programmaticly.
 */
function onError(error: Error, options?: { screenshots?: boolean, swal?: boolean }, submitIssue?): boolean {
    const TS = now();
    const screenshots = options?.screenshots === true || (NOSCREENSHOTSONERROR === false && options?.screenshots !== false);
    if (screenshots) {
        app.saveScreenshots()
            // .then(() => console.debug('Saved screenshots successfully'))
            .catch((reason) => console.warn('Failed saving screenshots', reason));
    }

    // let formattedStrings;
    let errobj: ErrorObj

    try {
        errobj = error.toObj({});
        // formattedStrings = formatErr(error)
    } catch (toObjError) {
        if (DEVTOOLS) {
            debugger;
        }
        console.error(`bad: onError(error: ${error?.name}: "${error?.message}") | error.toObj() ITSELF threw ${toObjError?.name}: "${toObjError?.message}"
        onError(error):
        ---------------
        ${error?.stack}
        
        toObjError:
        ----------
        ${toObjError?.stack}
        `);
        return false;
    }
    console.error(errobj.toString());
    // explicitly true, or if not explicitly true, then when no --no-swal-on-error
    const swal = options?.swal === true || (NOSWALONERROR === false && options?.swal !== false);
    if (swal) {

        swalert.big.error({
            title: `Whoops!`,
            html: errobj.toNiceHtml(),
            willOpen(popup: HTMLElement) {
                elem({ htmlElement: popup })
                    .child('.swal2-content')
                    .css({
                        justifyContent: "start",
                        textAlign: "left",
                    }).children()[0].before(
                    elem({ tag: 'style' })
                        .html("h4{margin-block:inherit}")
                )
            }
        }).catch(reason => {
            if (DEVTOOLS) {
                debugger;
            }
            console.error(`bad: onError(error: ${error?.name}: "${error?.message}")
            swalert.big.error(...) ITSELF threw "${pf(reason)}
            
            ${reason.stack}`)
        })
    }

    return false; // false means don't use elog, just do what's inside onError
}


////////////////////////////////////////////////////
// *** Misc Helper Functions
////////////////////////////////////////////////////
const _decoder = new TextDecoder();


function safeExec(command: string, options?: cp.ExecSyncOptions): string | undefined {
    try {
        const out = _decoder.decode(cp.execSync(command, options)).trim()
        return out;
    } catch (e) {
        e.when = `trying to execSync("${command}")`;
        e.locals = { options }
        console.error(e)
    }
}

/*
function serialize(obj: any): string {
    if (hasprops(obj, '__esModule')) {

        const methods = getMethodNames(obj);
        const serialized = serialize(methods);
        return

    }
    if (obj === undefined) {
        return 'undefined'
    }
    if (obj === null) {
        return 'null'
    }
    if (isFunction(obj)) {
        return obj.toString()
    }
    if (Array.isArray(obj)) {
        if (getLength(obj) === 0) {
            // empty
            return `[]`
        }
        const serializedarr = [];
        for (let x of obj) {
            let serialized = serialize(x);
            serializedarr.push(serialized);
        }
        return `[${serializedarr}]`
    }
}
*/

function curry(func: Function): Function {

    return function curried(...args) {
        if (args.length >= func.length) {
            return func.apply(this, args);
        } else {
            return function (...args2) {
                return curried.apply(this, args.concat(args2));
            }
        }
    };

}

function copy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}

/**
 true if objects have the same CONTENT. This means that
 @example
 > equal( [1,2], [2,1] )
 true

 */
function equal(a, b): boolean {
    if (a === b) {
        return true;
    }
    if (is.isArray(a)) {
        if (!is.isArray(b)) {
            return false;
        }
        if (a.length != b.length) {
            return false;
        }
        const a_sorted = copy(a).sort();
        const b_sorted = copy(b).sort();
        // a.sort();
        // b.sort();
        for (let i = 0; i < a_sorted.length; i++) {
            if (!equal(a_sorted[i], b_sorted[i])) {
                return false;
            }
        }
        return true;
    }
    if (is.isObject(a)) { // I think it's ok to check if object and not to check if TMap
        if (!is.isObject(b)) {
            return false;
        }
        const a_keys = Object.keys(a);
        const b_keys = Object.keys(b);
        if (a_keys.length != b_keys.length) {
            return false;
        }
        const a_keys_sorted = copy(a_keys).sort();
        const b_keys_sorted = copy(b_keys).sort();

        for (let i = 0; i < a_keys_sorted.length; i++) {
            if (!equal(a_keys_sorted[i], b_keys_sorted[i])) {
                return false;
            }
            if (!equal(a[a_keys_sorted[i]], b[b_keys_sorted[i]])) {
                return false;
            }
        }
        return true;
    }
    return a === b;
}

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
function now(decdigits?: number, kwargs?: { date?: Date, unix_ms?: number, unix_sec?: number }): number {
    let ts;
    if (kwargs) {
        if (kwargs.date) {
            ts = kwargs.date.getTime() / 1000;
        } else if (kwargs.unix_ms) {
            ts = kwargs.unix_ms / 1000;
        } else if (kwargs.unix_sec) {
            ts = kwargs.unix_sec;
        }
    } else {
        ts = new Date().getTime() / 1000;
    }
    // factor is 0 if decdigits is unspecified
    return round(ts, decdigits ?? 0)
}

function hash(obj: any): number {
    if (!is.isString(obj)) {
        obj = `${obj}`;
    }
    let hash = 0;
    if (obj.length == 0) {
        return hash;
    }
    for (let i = 0; i < obj.length; i++) {
        let char = obj.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function wait(ms: number, honorSkipFade = false): Promise<any> {
    if (honorSkipFade) {

        // if (require('./Glob').default.skipFade) {
        if (require('../Glob').default.skipFade) {
            console.warn(`skipFade!`);
            return;
        }
        // if ( Glob.skipFade ) return;
    }
    // if (!bool(ms)) {
    if (!ms && !is.isNumber(ms)) {
        console.warn(`util.wait(${ms}); defaulting to ms = 0`)
        ms = 0
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**Check every `checkInterval` ms if `cond()` is truthy. If, within `timeout`, cond() is truthy, return `true`. Return `false` if time is out.
 * @example
 * // Give the user a 200ms chance to get her pointer over "mydiv". Continue immediately once she does, or after 200ms if she doesn't.
 * mydiv.pointerenter( () => mydiv.pointerHovering = true; )
 * const pointerOnMydiv = await waitUntil(() => mydiv.pointerHovering, 10, 200);*/
async function waitUntil(cond: () => boolean, checkInterval: number = 20, timeout: number = Infinity): Promise<boolean> {
    if (checkInterval <= 0) {
        throw new Error(`checkInterval <= 0. checkInterval: ${checkInterval}`);
    }
    if (checkInterval > timeout) {
        throw new Error(`checkInterval > timeout (${checkInterval} > ${timeout}). checkInterval has to be lower than timeout.`);
    }

    const loops = timeout / checkInterval;

    if (loops <= 1) {
        console.warn(`loops <= 1, you probably didn't want this to happen`);
    }
    let count = 0;
    while (count < loops) {
        if (cond()) {
            return true;
        }
        await wait(checkInterval, false);
        count++;
    }
    return false;
}

export {
    app,
    all,
    any,
    bool,
    copy,
    enumerate,
    equal,
    hash,
    ignoreErr,
    inspect,
    int,
    is,
    now,
    onError,
    range,
    round,
    safeExec,
    str,
    sum,
    tryCatch,
    wait,
    waitUntil,
    zip,
}

