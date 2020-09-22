/**import * as util from "../util"
 * util.reloadPage();
 *
 * import {reloadPage} from "../util"*/
import { remote } from 'electron';
import type { WebContents } from 'electron';
import type { Enumerated } from "./bhe";
import { anyDefined } from "./bhe";


////////////////////////////////////////////////////
// ***          Python Builtins
////////////////////////////////////////////////////
function round(n: number, d: number = 0) {
    const fr = 10 ** d;
    // @ts-ignore
    return parseInt(n * fr) / fr;
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
        || isEmptyObj(obj)
        || isEmptyArr(obj)
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
    if (isArray(obj)) {
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

/*let stuff = {
    '()=>{}': () => {
    }, 'function(){}': function () {
    }, 'Function': Function,
    'Function()': Function(),
    "new Function": new Function,
    "new Function()": new Function(),
    "Boolean": Boolean,
    "Boolean()": Boolean(),
    "Boolean(false)": Boolean(false),
    "Boolean(true)": Boolean(true),
    "new Boolean": new Boolean,
    "new Boolean()": new Boolean(),
    "new Boolean(true)": new Boolean(true),
    "new Boolean(false)": new Boolean(false),
    "true": true,
    "false": false,
    "Number": Number,
    "Number()": Number(),
    "Number(0)": Number(0),
    "Number(1)": Number(1),
    "new Number": new Number,
    "new Number()": new Number(),
    "new Number(0)": new Number(0),
    "new Number(1)": new Number(1),
    "0": 0,
    "1": 1,
    "''": '',
    "' '": ' ',
    "'foo'": 'foo',
    "'0'": '0',
    "'1'": '1',
    "{}": {},
    "{ hi : 'bye' }": { hi: 'bye' },
    "[]": [],
    "[ false ]": [false],
    "[ true ]": [true],
    "[ [] ]": [[]],
    "[ 0 ]": [0],
    "[ 1 ]": [1],
    "undefined": undefined,
    "null": null,
    "document.body": document.body,
    "new class{}": new class {
    },
    "new Timeline(...)": "PLACEHOLDER",
};*/


function notnot(obj) {
    // / 0                false
    // 1                  true
    // ()=>{}             true
    // function(){}       true
    // Function           true
    // Function()         true
    // new Function()     true
    // Boolean            true
    // /  Boolean()       false
    // new Boolean()      true
    // new Boolean(true)  true
    // new Boolean(false) true
    // true               true
    // /  false           false
    // Number             true
    // /  Number()        false
    // new Number()       true
    // new Number(0)      true
    // new Number(1)      true
    // / ''               false
    // ' '                true
    // '0'                true
    // '1'                true
    // {}                 true
    // { hi : 'bye' }     true
    // []                 true
    // [ 1 ]              true
    // /  undefined       false
    // /  null            false
    return !!obj;
}

////////////////////////////////////////////////////
// ***          is<Foo> Type Booleans
////////////////////////////////////////////////////
function isString(obj): obj is string {
    return typeof obj === "string"
}

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
function isError(obj): obj is Error {
    return obj instanceof Error
}

function isRe(obj): obj is RegExp {
    return obj["compile"] && typeof obj["compile"] === 'function'
}

/*** Same is Array.isArray?
 * Only `true` for `[]` and `[ 1 ]`*/
function isArray<T>(obj): obj is Array<T> {
    // 0                   false
    // 1                   false
    // ''                  false
    // ' '                 false
    // 'foo'               false
    // '0'                 false
    // '1'                 false
    // ()=>{}              false
    // Boolean             false
    // Boolean()           false
    // Function            false
    // Function()          false
    // Number              false
    // Number()            false
    /// [ 1 ]              true
    /// []                 true
    // false               false
    // function(){}        false
    // new Boolean()       false
    // new Boolean(false)  false
    // new Boolean(true)   false
    // new Function()      false
    // new Number(0)       false
    // new Number(1)       false
    // new Number()        false
    // null                false
    // true                false
    // undefined           false
    // { hi : 'bye' }      false
    // {}                  false
    if (!obj) {
        return false;
    }
    return typeof obj !== 'string' && Array.isArray(obj);
}

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
function isEmpty(obj: any): boolean {
    let toStringed = {}.toString.call(obj);
    return (toStringed === '[object Object]' || toStringed === '[object Array]' || toStringed === '[object Set]') && Object.keys(obj).length == 0;
}

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
function isEmptyArr(collection): boolean {
    return isArray(collection) && getLength(collection) === 0
}

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
function isEmptyObj(obj): boolean {
    return isEmpty(obj) && !isArray(obj)
}

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
function isFunction(fn): fn is Function {
    let toStringed = {}.toString.call(fn);
    return !!fn && toStringed === '[object Function]'
}

function isTMap<T>(obj: TMap<T>): obj is TMap<T> {
    // 0                   false
    // 1                   false
    // ''                  false
    // ' '                 false
    // '0'                 false
    // '1'                 false
    // ()=>{}              false
    // Boolean             false
    // Boolean()           false
    // Function            false
    // Function()          false
    // Number              false
    // Number()            false
    // [ 1 ]             false
    // []                false
    // false               false
    // function(){}        false
    // new Boolean()     false
    // new Boolean(false)false
    // new Boolean(true) false
    // new Function()      false
    // new Number(0)     false
    // new Number(1)     false
    // new Number()      false
    // null                false
    // true                false
    // undefined           false
    // / { hi : 'bye' }    true
    // / {}                true
    return {}.toString.call(obj) == '[object Object]'
}

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
 * */
function isObject(obj): boolean {
    return typeof obj === 'object' && !!obj;
}

/**Has to be an object (isObject) that's not an Array*/
function isDict(obj): boolean {
    if (!isObject(obj)) {
        return false;
    }
    return !isArray(obj);

}

////////////////////////////////////////////////////
// ***          underscore.js functions
////////////////////////////////////////////////////
function shallowProperty<T>(key: string): (obj: T) => T extends null ? undefined : T[keyof T] {
    return function (obj) {
        // == null true for undefined
        return obj == null ? void 0 : obj[key];
    };
}


function getLength(collection): number {
    return shallowProperty('length')(collection)
}

////////////////////////////////////////////////////
// ***          Electron Related
////////////////////////////////////////////////////
function getCurrentWindow() {
    let currentWindow = remote.getCurrentWindow();

    return currentWindow;
}

function reloadPage() {
    if (require("./Glob").default.BigConfig.dev.no_reload_on_submit()) {
        return
    }
    getCurrentWindow().reload();
}

async function saveScreenshots() {
    console.debug('Saving screenshots...')
    const webContents = remote.getCurrentWebContents();
    myfs.createIfNotExists(SESSION_PATH_ABS);
    const screenshotsDir = path.join(SESSION_PATH_ABS, 'screenshots');
    myfs.createIfNotExists(screenshotsDir);

    async function _saveScreenshotOfWebContents(wc: WebContents, name: string) {

        const image = await wc.capturePage();
        const savedir = path.join(screenshotsDir, name);
        myfs.createIfNotExists(savedir);
        let pngPath;
        if (fs.existsSync(path.join(savedir, 'page.png'))) {
            pngPath = path.join(savedir, `page__${new Date().human()}.png`)
        } else {
            pngPath = path.join(savedir, 'page.png');
        }
        fs.writeFileSync(pngPath, image.toPNG());
        let htmlPath;
        if (fs.existsSync(path.join(savedir, 'screenshot.html'))) {
            htmlPath = path.join(savedir, `screenshot__${new Date().human()}.html`)
        } else {
            htmlPath = path.join(savedir, 'screenshot.html');
        }
        await wc.savePage(htmlPath, "HTMLComplete");
    }

    await _saveScreenshotOfWebContents(webContents, 'maindir')
    await _saveScreenshotOfWebContents(webContents.devToolsWebContents, 'devtools')
}

////////////////////////////////////////////////////
// ***          Error Handling
////////////////////////////////////////////////////
function ignoreErr(fn: (...args: any[]) => any) {
    // TODO: where is this used? unnecessary with elog.catchErrors
    try {
        fn();
    } catch (e) {
        console.warn(`IGNORED ERROR: `, e);
    }
}

/**Extracts useful information from an Error, and returns a tuple containing formatted data, to be printed right away.

 * Calls Error.toObj() and 'stack-trace' lib.
 * @param e - can have 'whilst' key and 'locals' key.*/
function formatErr(e: Error & { whilst: string, locals: TMap<string> }): (string | Error | TMap<string>)[] {

    const { what, where, whilst, locals } = e.toObj();

    const stackTrace = require('stack-trace');
    const callsites = stackTrace.parse(e);

    const formattedItems: (string | Error | TMap<string>)[] = [
        `\nWHAT:\n=====\n`, what,
        '\n\nWHERE:\n=====\n', where
    ];

    if (whilst) {
        formattedItems.push('\n\nWHILST:\n======\n', whilst)
    }
    if (bool(locals) && anyDefined(locals)) {
        // anyDefined because { options: undefined } passes bool but shows up '{ }' when printed
        const prettyLocals = pfmt(locals);
        formattedItems.push('\n\nLOCALS:\n======\n', prettyLocals)
    }
    const prettyCallSites = pfmt(callsites);
    formattedItems.push(
        '\n\nCALL SITES:\n===========\n', prettyCallSites,

        // in DevTools, printing 'e' is enough for DevTools to print stack automagically,
        // but it's needed to be states explicitly for it to be written to log file
        '\n\nORIGINAL ERROR:\n===============\n', e.stack
    );

    return formattedItems;
}

////////////////////////////////////////////////////
// ***          Inspection
////////////////////////////////////////////////////
/**
 @example
 > function foo(bar, baz){
 .    const argnames = getFnArgNames(foo);
 .    return Object.fromEntries(zip(argnames, ...arguments));
 . }
 . foo('rab', 'zab')
 {bar:'rab', baz:'zab'}
 */
function getFnArgNames(func: Function): string[] {
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    const ARGUMENT_NAMES = /([^\s,]+)/g;
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null) {
        result = [];
    }
    return result;
}

function getMethodNames(obj) {
    // TODO: I'm not sure this works
    let properties = new Set();
    let currentObj = obj;
    do {
        Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
    // @ts-ignore
    return new Set([...properties.keys()].filter(item => isFunction(obj[item])))
}

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
function hasprops<Obj extends Record<any, any>, Key extends string>
(obj: Obj, ...keys: Key[]): boolean {
    // obj is Obj & Record<Key extends infer U ? U : Key, any> {
// function hasprops<Key extends string, U>(obj: Record<Key extends infer U ? U : Key, any>, ...keys: Key extends infer U ? U[] : Key[]): obj is Record<Key extends infer U ? U : Key, any> {
    try {
        const actualKeys = Object.keys(obj);
        for (let key of keys) {
            if (!actualKeys.includes(key)) {
                return false;
            }
        }
        return true;
    } catch (e) {
        // TypeError, e.g. null, undefined etc
        return false;
    }
}


////////////////////////////////////////////////////
// ***          Misc Helper Functions
////////////////////////////////////////////////////
const _decoder = new TextDecoder();
const { execSync: _execSync } = require('child_process');

function safeExec(command: string, options?) {
    try {
        const out = _decoder.decode(_execSync(command, options)).trim()
        return out;
    } catch (e) {
        e.whilst = `Trying to execSync("${command}")`;
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
    if (a == b) {
        return true;
    }
    if (isArray(a)) {
        if (!isArray(b)) {
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
    if (isObject(a)) {
        if (!isObject(b)) {
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
    return a == b;
}

/**
 * Returns ts (seconds since epoch).
 * @param digits - default 0. digits=1 for ts in 0.1s resolution, digits=3 for ts in ms resolution
 */
function now(digits?: number): number {
    let factor = 1000 / Math.pow(10, digits ?? 0)
    return Math.round(new Date().getTime() / factor)
}

function wait(ms: number, honorSkipFade = true): Promise<any> {
    if (honorSkipFade) {

        if (require('./Glob').default.skipFade) {
            console.warn(`skipFade!`);
            return;
        }
        // if ( Glob.skipFade ) return;
    }
    if (!bool(ms)) {
        console.warn(`util.wait(${ms})`)
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
    all,
    any,
    bool,
    copy,
    equal,
    enumerate,
    formatErr,
    getCurrentWindow,
    getFnArgNames,
    getMethodNames,
    ignoreErr,
    isArray,
    isError,
    isEmpty,
    isEmptyArr,
    isEmptyObj,
    isFunction,
    isObject,
    isString,
    now,
    range,
    reloadPage,
    safeExec,
    saveScreenshots,
    str,
    sum,
    wait,
    waitUntil,
    zip
}

