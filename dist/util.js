Object.defineProperty(exports, "__esModule", { value: true });
exports.zip = exports.waitUntil = exports.wait = exports.sum = exports.str = exports.saveScreenshots = exports.safeExec = exports.reloadPage = exports.range = exports.now = exports.isString = exports.isObject = exports.isFunction = exports.isEmptyObj = exports.isEmptyArr = exports.isEmpty = exports.isError = exports.isArray = exports.ignoreErr = exports.getMethodNames = exports.getFnArgNames = exports.getCurrentWindow = exports.formatErr = exports.enumerate = exports.equal = exports.copy = exports.bool = exports.any = exports.all = void 0;
/**import * as util from "../util"
 * util.reloadPage();
 *
 * import {reloadPage} from "../util"*/
const electron_1 = require("electron");
const bhe_1 = require("./bhe");
////////////////////////////////////////////////////
// ***          Python Builtins
////////////////////////////////////////////////////
function round(n, d = 0) {
    const fr = 10 ** d;
    // @ts-ignore
    return parseInt(n * fr) / fr;
}
function int(x, base) {
    return parseInt(x, base);
}
function str(val) {
    return val ? val.toString() : "";
}
exports.str = str;
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
function bool(val) {
    if (!val) {
        return false;
    }
    const typeofval = typeof val;
    if (typeofval !== 'object') {
        if (typeofval === 'function') {
            return true;
        }
        else {
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
exports.bool = bool;
function enumerate(obj) {
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
    if (obj === undefined
        || isEmptyObj(obj)
        || isEmptyArr(obj)
        // @ts-ignore
        || obj === "") {
        return [];
    }
    if (obj === null
        || typeofObj === "boolean"
        || typeofObj === "number"
        || typeofObj === "function") {
        throw new TypeError(`${typeofObj} object is not iterable`);
    }
    let array = [];
    if (isArray(obj)) {
        let i = 0;
        for (let x of obj) {
            array.push([i, x]);
            i++;
        }
    }
    else {
        for (let prop in obj) {
            array.push([prop, obj[prop]]);
        }
    }
    return array;
}
exports.enumerate = enumerate;
function any(...args) {
    for (let a of args) {
        if (bool(a)) {
            return true;
        }
    }
    return false;
}
exports.any = any;
function all(...args) {
    for (let a of args) {
        if (!bool(a)) {
            return false;
        }
    }
    return true;
}
exports.all = all;
function sum(arr) {
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
exports.sum = sum;
function* range(start, stop) {
    for (let i = start; i <= stop; i++) {
        yield i;
    }
}
exports.range = range;
function* zip(arr1, arr2) {
    for (let i = 0; i < arr1.length; i++) {
        try {
            yield [arr1[i], arr2[i]];
        }
        catch (e) {
            return;
        }
    }
}
exports.zip = zip;
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
function isString(obj) {
    return typeof obj === "string";
}
exports.isString = isString;
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
function isError(obj) {
    return obj instanceof Error;
}
exports.isError = isError;
function isRe(obj) {
    return obj["compile"] && typeof obj["compile"] === 'function';
}
/*** Same is Array.isArray?
 * Only `true` for `[]` and `[ 1 ]`*/
function isArray(obj) {
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
exports.isArray = isArray;
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
function isEmpty(obj) {
    let toStringed = {}.toString.call(obj);
    return (toStringed === '[object Object]' || toStringed === '[object Array]' || toStringed === '[object Set]') && Object.keys(obj).length == 0;
}
exports.isEmpty = isEmpty;
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
function isEmptyArr(collection) {
    return isArray(collection) && getLength(collection) === 0;
}
exports.isEmptyArr = isEmptyArr;
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
function isEmptyObj(obj) {
    return isEmpty(obj) && !isArray(obj);
}
exports.isEmptyObj = isEmptyObj;
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
function isFunction(fn) {
    let toStringed = {}.toString.call(fn);
    return !!fn && toStringed === '[object Function]';
}
exports.isFunction = isFunction;
function isTMap(obj) {
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
    return {}.toString.call(obj) == '[object Object]';
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
function isObject(obj) {
    return typeof obj === 'object' && !!obj;
}
exports.isObject = isObject;
/**Has to be an object (isObject) that's not an Array*/
function isDict(obj) {
    if (!isObject(obj)) {
        return false;
    }
    return !isArray(obj);
}
////////////////////////////////////////////////////
// ***          underscore.js functions
////////////////////////////////////////////////////
function shallowProperty(key) {
    return function (obj) {
        // == null true for undefined
        return obj == null ? void 0 : obj[key];
    };
}
function getLength(collection) {
    return shallowProperty('length')(collection);
}
////////////////////////////////////////////////////
// ***          Electron Related
////////////////////////////////////////////////////
function getCurrentWindow() {
    let currentWindow = electron_1.remote.getCurrentWindow();
    return currentWindow;
}
exports.getCurrentWindow = getCurrentWindow;
function reloadPage() {
    if (require("./Glob").default.BigConfig.dev.no_reload_on_submit()) {
        return;
    }
    getCurrentWindow().reload();
}
exports.reloadPage = reloadPage;
async function saveScreenshots() {
    console.debug('Saving screenshots...');
    const webContents = electron_1.remote.getCurrentWebContents();
    myfs.createIfNotExists(SESSION_PATH_ABS);
    const screenshotsDir = path.join(SESSION_PATH_ABS, 'screenshots');
    myfs.createIfNotExists(screenshotsDir);
    async function _saveScreenshotOfWebContents(wc, name) {
        const image = await wc.capturePage();
        const savedir = path.join(screenshotsDir, name);
        myfs.createIfNotExists(savedir);
        let pngPath;
        if (fs.existsSync(path.join(savedir, 'page.png'))) {
            pngPath = path.join(savedir, `page__${new Date().human()}.png`);
        }
        else {
            pngPath = path.join(savedir, 'page.png');
        }
        fs.writeFileSync(pngPath, image.toPNG());
        let htmlPath;
        if (fs.existsSync(path.join(savedir, 'screenshot.html'))) {
            htmlPath = path.join(savedir, `screenshot__${new Date().human()}.html`);
        }
        else {
            htmlPath = path.join(savedir, 'screenshot.html');
        }
        await wc.savePage(htmlPath, "HTMLComplete");
    }
    await _saveScreenshotOfWebContents(webContents, 'maindir');
    await _saveScreenshotOfWebContents(webContents.devToolsWebContents, 'devtools');
}
exports.saveScreenshots = saveScreenshots;
////////////////////////////////////////////////////
// ***          Error Handling
////////////////////////////////////////////////////
function ignoreErr(fn) {
    // TODO: where is this used? unnecessary with elog.catchErrors
    try {
        fn();
    }
    catch (e) {
        console.warn(`IGNORED ERROR: `, e);
    }
}
exports.ignoreErr = ignoreErr;
/**Extracts useful information from an Error, and returns a tuple containing formatted data, to be printed right away.

 * Calls Error.toObj() and 'stack-trace' lib.
 * @param e - can have 'whilst' key and 'locals' key.*/
function formatErr(e) {
    const { what, where, whilst, locals } = e.toObj();
    const stackTrace = require('stack-trace');
    const callsites = stackTrace.parse(e);
    const formattedItems = [
        `\nWHAT:\n=====\n`, what,
        '\n\nWHERE:\n=====\n', where
    ];
    if (whilst) {
        formattedItems.push('\n\nWHILST:\n======\n', whilst);
    }
    if (bool(locals) && bhe_1.anyDefined(locals)) {
        // anyDefined because { options: undefined } passes bool but shows up '{ }' when printed
        const prettyLocals = pfmt(locals);
        formattedItems.push('\n\nLOCALS:\n======\n', prettyLocals);
    }
    const prettyCallSites = pfmt(callsites);
    formattedItems.push('\n\nCALL SITES:\n===========\n', prettyCallSites, 
    // in DevTools, printing 'e' is enough for DevTools to print stack automagically,
    // but it's needed to be states explicitly for it to be written to log file
    '\n\nORIGINAL ERROR:\n===============\n', e.stack);
    return formattedItems;
}
exports.formatErr = formatErr;
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
function getFnArgNames(func) {
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    const ARGUMENT_NAMES = /([^\s,]+)/g;
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null) {
        result = [];
    }
    return result;
}
exports.getFnArgNames = getFnArgNames;
function getMethodNames(obj) {
    // TODO: I'm not sure this works
    let properties = new Set();
    let currentObj = obj;
    do {
        Object.getOwnPropertyNames(currentObj).map(item => properties.add(item));
    } while ((currentObj = Object.getPrototypeOf(currentObj)));
    // @ts-ignore
    return new Set([...properties.keys()].filter(item => isFunction(obj[item])));
}
exports.getMethodNames = getMethodNames;
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
function hasprops(obj, ...keys) {
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
    }
    catch (e) {
        // TypeError, e.g. null, undefined etc
        return false;
    }
}
////////////////////////////////////////////////////
// ***          Misc Helper Functions
////////////////////////////////////////////////////
const _decoder = new TextDecoder();
const { execSync: _execSync } = require('child_process');
function safeExec(command, options) {
    try {
        const out = _decoder.decode(_execSync(command, options)).trim();
        return out;
    }
    catch (e) {
        e.whilst = `Trying to execSync("${command}")`;
        e.locals = { options };
        console.error(e);
    }
}
exports.safeExec = safeExec;
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
function curry(func) {
    return function curried(...args) {
        if (args.length >= func.length) {
            return func.apply(this, args);
        }
        else {
            return function (...args2) {
                return curried.apply(this, args.concat(args2));
            };
        }
    };
}
function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}
exports.copy = copy;
/**
 true if objects have the same CONTENT. This means that
 @example
 > equal( [1,2], [2,1] )
 true

 */
function equal(a, b) {
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
exports.equal = equal;
/**
 * Returns ts (seconds since epoch).
 * @param digits - default 0. digits=1 for ts in 0.1s resolution, digits=3 for ts in ms resolution
 */
function now(digits) {
    let factor = 1000 / Math.pow(10, digits ?? 0);
    return Math.round(new Date().getTime() / factor);
}
exports.now = now;
function wait(ms, honorSkipFade = true) {
    if (honorSkipFade) {
        if (require('./Glob').default.skipFade) {
            console.warn(`skipFade!`);
            return;
        }
        // if ( Glob.skipFade ) return;
    }
    if (!bool(ms)) {
        console.warn(`util.wait(${ms})`);
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.wait = wait;
/**Check every `checkInterval` ms if `cond()` is truthy. If, within `timeout`, cond() is truthy, return `true`. Return `false` if time is out.
 * @example
 * // Give the user a 200ms chance to get her pointer over "mydiv". Continue immediately once she does, or after 200ms if she doesn't.
 * mydiv.pointerenter( () => mydiv.pointerHovering = true; )
 * const pointerOnMydiv = await waitUntil(() => mydiv.pointerHovering, 10, 200);*/
async function waitUntil(cond, checkInterval = 20, timeout = Infinity) {
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
exports.waitUntil = waitUntil;