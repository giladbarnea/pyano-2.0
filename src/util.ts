/**import * as util from "../util"
 * util.reloadPage();
 *
 * import {reloadPage} from "../util"*/
import { remote } from 'electron';
import type { WebContents } from 'electron';
import type { Enumerated } from "./bhe";
import { anyDefined, elem } from "./bhe";

// import * as swalert from "./swalert"
console.debug('util')

////////////////////////////////////////////////////
// ***          Python Builtins
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
    if (toStringed !== '[object String]' && toStringed !== '[object Function]') {
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

function isPromise(obj): obj is Promise<any> {
    return {}.toString.call(obj) == "[object Promise]"
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
    try {
        let toStringed = {}.toString.call(obj);
        return Object.keys(obj).length == 0 && toStringed !== '[object String]' && toStringed !== '[object Function]'
    } catch {
        return false
    }


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

/**Has to be either {} or {foo:"bar"}. Not anything else.
 @example
 > [
 .    {},
 .    { foo : 'bar' },
 .    { foo : undefined },
 .    { foo : null },
 . ].map(isDict).every(x=>x===true)
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
 . ].map(isDict).some(x=>x===true)
 false
 * */
function isDict<T>(obj: Dict<T>): obj is Dict<T> {

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
 */
function isObject(obj): boolean {
    return typeof obj === 'object' && !!obj;
}

function isPrimitive(value) {
    return (typeof value !== 'object' && typeof value !== 'function') || value === null
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

/**Writes screen capture (png) and exports full page to HTML for both main window WebContents and DevTools WebContents.*/
async function saveScreenshots() {
    console.debug('Saving screenshots...')
    const webContents = remote.getCurrentWebContents();
    myfs.createIfNotExists(SESSION_PATH_ABS);
    const screenshotsDir = path.join(SESSION_PATH_ABS, 'screenshots');
    myfs.createIfNotExists(screenshotsDir);

    async function _saveScreenshotOfWebContents(wc: WebContents, name: string) {
        if(!bool(wc)){
            console.warn(`saveScreenshots() | _saveScreenshotOfWebContents(wc: ${wc}, name: "${name}") | bad wc. Not saving ScreenshotOfWebContents`);
            return
        }
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
        console.log(`Saved screenshots of ${name} successfully`);
    }

    try {
        await _saveScreenshotOfWebContents(webContents, 'pyano_window')
    } catch (pyano_window_screenshot_error) {
        console.warn(`saveScreenshots() | _saveScreenshotOfWebContents(wc: ${webContents}, name: 'pyano_window') | 
        bad wc. Not saving ScreenshotOfWebContents.
        ${pyano_window_screenshot_error.toObj().toString()}`);
    }
    try {
        await _saveScreenshotOfWebContents(webContents.devToolsWebContents, 'devtools')
    } catch (devtools_window_screenshot_error) {
        console.warn(`saveScreenshots() | _saveScreenshotOfWebContents(wc: ${webContents}, name: 'devtools') | 
        bad wc. Not saving ScreenshotOfWebContents.
        ${devtools_window_screenshot_error.toObj().toString()}`);
    }
}

////////////////////////////////////////////////////
// ***          Error Handling
////////////////////////////////////////////////////
/**
 @example
 const myFunc = investigate(function myFunc(val: any): boolean { ... }
 */

function investigate<T extends (...args: any[]) => any>(fn: T, options?: { group: boolean }): T
function investigate<T extends (...args: any[]) => any>(thisArg: ThisParameterType<T>, fnname: string, descriptor: { value: T }): void
function investigate<Getter extends () => any, Setter extends (val: any) => any>(thisArg: ThisParameterType<Getter>, fnname: string, descriptor: { get: Getter, set: Setter }): void
function investigate<T extends (...args: any[]) => any>(fnOrThis, optionsOrFnName?, descriptor?) {
    const group: boolean = [...arguments].find(arg => isDict(arg) && arg.group)

    function _buildpatch(_this, _method: T, _arguments, _thisstr?) {
        const _argsWithValues = Object.fromEntries(zip(getFnArgNames(_method), _arguments));
        let _methNameAndSig;
        if (_thisstr) {
            // available when decorating class methods
            _methNameAndSig = `%c${_thisstr}.${_method.name}%c(${pftm(_argsWithValues)})`;
        } else {
            // not available when decorating static methods
            _methNameAndSig = `%c${_method.name}%c(${pftm(_argsWithValues)})`;
        }
        if (group) {
            console.group(_methNameAndSig, 'text-decoration: underline', 'text-decoration: unset');
        } else {
            console.debug(`entered ${_methNameAndSig}`, 'text-decoration: underline', 'text-decoration: unset');
        }
        let _applied = _method.apply(_this, _arguments);

        console.debug(`returning from ${_methNameAndSig} → ${pft(_applied)}`, 'text-decoration: underline', 'text-decoration: unset');

        if (group) {
            console.groupEnd()
        }
        return _applied;
    }

    let method;

    // * @within a class
    if (isString(optionsOrFnName)) {
        // class method

        const thisstr = pft(fnOrThis);
        const fnname: string = arguments[1];
        let descriptor = arguments[2];

        if (descriptor.value !== undefined) {
            method = descriptor.value;
            descriptor.value = function () {
                return _buildpatch(this, method, arguments, thisstr)
            };

        } else if (descriptor.get && descriptor.set) {
            // getter / setter
            const getter = descriptor.get;
            descriptor.get = function () {
                return _buildpatch(this, getter, arguments, thisstr)


            };
            const setter = descriptor.set;
            descriptor.set = function () {
                return _buildpatch(this, setter, arguments, thisstr)


            };
        } else {
            debugger;
        }
    } else {
        // * "manual" of static method
        method = fnOrThis;
        fnOrThis = function () {
            return _buildpatch(this, method, arguments)


        };
        return fnOrThis
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


/**Extracts useful information from an Error, and returns a tuple containing formatted data, to be printed right away.

 Calls Error.toObj() and 'stack-trace' lib.
 @param e - can have 'whilst' key and 'locals' key.
 */
function formatErr(e: Error & { whilst?: string, locals?: Dict<string> }): string[] {
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
        const prettyLocals = pft(locals);
        formattedItems.push('\n\nLOCALS:\n======\n', prettyLocals)
    }
    const prettyCallSites = pft(callsites);
    formattedItems.push(
        '\n\nCALL SITES:\n===========\n', prettyCallSites,

        // in DevTools, printing 'e' is enough for DevTools to print stack automagically,
        // but it's needed to be states explicitly for it to be written to log file
        '\n\nORIGINAL ERROR:\n===============\n', e.stack, '\n'
    );

    return formattedItems;
}

function onError(error: Error, versionsOrOptions?: { app: string; electron: string; os: string }, submitIssue?: (url: string, data: any) => void)
function onError(error: Error, versionsOrOptions?: { screenshots?: boolean, swal?: boolean })
function onError(error: Error, versionsOrOptions, submitIssue?) {
    /// screenshots and swal are true unless explicitly received { screenshots: false}
    const screenshots = versionsOrOptions?.screenshots !== false;
    if (screenshots) {
        saveScreenshots()
            // .then(() => console.debug('Saved screenshots successfully'))
            .catch((reason) => console.warn('Failed saving screenshots', reason));
    }

    // let formattedStrings;
    let errobj: ReturnType<Error["toObj"]>

    try {
        errobj = error.toObj();
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
    const swal = versionsOrOptions?.swal !== false;
    if (swal) {
        /*let endIndex;
        let localsIndex = formattedStrings.findIndex(line => line.includes('LOCALS'));
        if (localsIndex !== -1) {
            endIndex = localsIndex;
        } else {
            endIndex = formattedStrings.findIndex(line => line.includes('CALL SITES'))
        }
        const shortFormattedStrings = formattedStrings.slice(0, endIndex)*/
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
            swalert.big.error(...) ITSELF threw "${pftm(reason)}
            
            ${reason.stack}`)
        })
    }

    return false; // false means don't use elog, just do what's inside onError
}

////////////////////////////////////////////////////
// ***          Inspection
////////////////////////////////////////////////////
/**
 @example
 > function foo(bar, baz){
 .    const argnames = getFnArgNames(foo);
 .    return Object.fromEntries(zip(argnames, arguments));
 . }
 . foo('rab', 'zab')
 {bar:'rab', baz:'zab'}
 */
function getFnArgNames(func: Function): string[] {
    try {
        const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        const ARGUMENT_NAMES = /([^\s,]+)/g;
        const fnStr = func.toString().replace(STRIP_COMMENTS, '');
        let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if (result === null) {
            result = [];
        }
        return result;
    } catch (e) {
        debugger;
        return []

    }
}

function getMethodNames(obj) {
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
        e.whilst = `trying to execSync("${command}")`;
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
    if (!isString(obj)) {
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
    enumerate,
    equal,
    formatErr,
    getCurrentWindow,
    getFnArgNames,
    getMethodNames,
    hash,
    hasprops,
    ignoreErr,
    int,
    investigate,
    isArray,
    isDict,
    isEmpty,
    isEmptyArr,
    isEmptyObj,
    isError,
    isFunction,
    isObject,
    isPromise,
    isString,
    now,
    onError,
    range,
    reloadPage,
    round,
    safeExec,
    saveScreenshots,
    str,
    sum,
    wait,
    waitUntil,
    zip
}

