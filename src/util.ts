/**import * as util from "../util"
 * util.reloadPage();
 *
 * import {reloadPage} from "../util"*/
import { remote } from 'electron';
import type { Enumerated } from "./bhe";


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
 * const pointerOnMydiv = await waitUntil(() => mydiv.pointerHovering, 200, 10);*/
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

function isString(obj): obj is string {
    return typeof obj === "string"
}

function isArray<T>(obj): obj is Array<T> { // same as Array.isArray
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
    // / [ 1 ]             true
    // / []                true
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
    return typeof obj !== 'string' && (Array.isArray(obj) || typeof obj[Symbol.iterator] === 'function');
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
    return (toStringed === '[object Object]' || toStringed === '[object Array]') && Object.keys(obj).length == 0;
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
 .    function(){},
 .    new Function(),
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
 .    [1],
 .    true,
 .    null,
 .    { hi : 'bye' },
 .    undefined,
 . ].map(isFunction).some(x=>x===true)
 false
 * */
function isFunction(fn) {
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

// *  underscore.js
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
 .    function(){},
 .    new Function(),
 .    Number(),
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


function shallowProperty<T>(key: string): (obj: T) => T extends null ? undefined : T[keyof T] {
    return function (obj) {
        // == null true for undefined
        return obj == null ? void 0 : obj[key];
    };
}


function getLength(collection): number {
    return shallowProperty('length')(collection)
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

function* range(start: number, stop: number): Generator<number> {
    for (let i = start; i <= stop; i++) {
        yield i;
    }

}

/**Just the basename*/
async function takeScreenshot(dirname: string) {
    const webContents = remote.getCurrentWebContents();
    const image = await webContents.capturePage();
    myfs.createIfNotExists(SESSION_PATH_ABS);
    const dirnameAbs = path.join(SESSION_PATH_ABS, dirname);
    myfs.createIfNotExists(dirnameAbs);
    const files = { png: undefined, html: undefined };
    if (fs.existsSync(path.join(dirnameAbs, 'page.png'))) {
        files.png = `${dirnameAbs}/page__${new Date().human()}.png`
    } else {
        files.png = path.join(dirnameAbs, 'page.png');
    }
    fs.writeFileSync(files.png, image.toPNG());
    if (fs.existsSync(path.join(dirnameAbs, 'screenshot.html'))) {
        files.html = `${dirnameAbs}/screenshot__${new Date().human()}.html`
    } else {
        files.html = path.join(dirnameAbs, 'screenshot.html');
    }
    return await webContents.savePage(files.html, "HTMLComplete");
}

function ignoreErr(fn: (...args: any[]) => any) {
    try {
        fn();
    } catch (e) {
        console.warn(`IGNORED ERROR: `, e);
    }
}


function formatErr(e: Error): (string | Error | TMap<string>)[] {
    const { what, where, whilst } = e.toObj()
    const stackTrace = require('stack-trace');
    const callsites = stackTrace.parse(e);
    const formattedStrs: (string | Error | TMap<string>)[] = [
        `\nWHAT:\n=====\n`, what,
        '\n\nWHERE:\n=====\n', where
    ];

    if (whilst) {
        formattedStrs.push('\n\nWHILST:\n======\n', whilst)
    }

    formattedStrs.push(
        '\n\nCALL SITES:\n===========\n', ...callsites,
        '\n\nORIGINAL ERROR:\n===============\n', e
    );

    return formattedStrs;
}

function logErr(e: Error, handler?) {
    if (handler === undefined) {
        handler = console.error;
    }
    const formatted = formatErr(e);
    handler(...formatted)
}

export {
    all,
    any,
    bool,
    enumerate,
    formatErr,
    getCurrentWindow,
    ignoreErr,
    isArray,
    isEmpty,
    isEmptyArr,
    isEmptyObj,
    isFunction,
    isObject,
    isString,
    logErr,
    range,
    reloadPage,
    str,
    sum,
    takeScreenshot,
    wait,
    waitUntil
}

