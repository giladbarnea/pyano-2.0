/**import * as util from "../util"
 * util.reloadPage();
 *
 * import {reloadPage} from "../util"*/
import { remote } from 'electron';


function round(n: number, d: number = 0) {
    const fr = 10 ** d;
    // @ts-ignore
    return parseInt(n * fr) / fr;
}


function int(x, base?: string | number | Function): number {
    return parseInt(x, <number> base);
}

function str(val: any) {
    return val ? val.toString() : ""
}

function bool(val: any): boolean {
    // 0                    false
    // 1                    true
    // '0'                  true
    // '1'                  true
    // ' '                  true
    // ''                   false
    // 'foo'                true
    // ()=>{}               true
    // Boolean              true
    // Boolean()            false
    // Boolean(false)       false
    // Boolean(true)        true
    // Function             true
    // Function()           true
    // Number               true
    // Number(0)            false
    // Number(1)            true
    // Number()             false
    // [ 0 ]                true
    // [ 1 ]                true
    // [ [] ]               true
    // [ false ]            true
    // [ true ]             true
    // []                   false       unlike native
    // document.body        true
    // false                false
    // function(){}         true
    // new Boolean          false       unlike native
    // new Boolean()        false       unlike native
    // new Boolean(false)   false       unlike native
    // new Boolean(true)    true
    // new Function         true
    // new Function()       true
    // new Number           false       unlike native
    // new Number(0)        false       unlike native
    // new Number(1)        true
    // new Number()         false       unlike native
    // new Timeline(...)    true
    // new class{}          false       unlike native
    // null                 false
    // true                 true
    // undefined            false
    // { hi : 'bye' }       true
    // {}                   false       unlike native
    
    
    if ( !val )
        return false;
    const typeofval = typeof val;
    if ( typeofval !== 'object' ) {
        if ( typeofval === 'function' )
            return true;
        else
            return !!val;
    }
    // let keysLength = Object.keys(val).length;
    let toStringed = {}.toString.call(val);
    if ( toStringed === '[object Object]' || toStringed === '[object Array]' )
        return Object.keys(val).length !== 0;
    
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
    if ( isArray(obj) ) {
        let i: number = 0;
        for ( let x of obj ) {
            array.push([ i, x ]);
            i++;
        }
    } else {
        for ( let prop in obj ) {
            array.push([ prop, obj[prop] ]);
        }
    }
    return array as Enumerated<T>;
}

function wait(ms: number, acknowledgeSkipFade = true): Promise<any> {
    if ( acknowledgeSkipFade ) {
        
        if ( require('./Glob').default.skipFade ) {
            console.warn(`skipFade!`);
            return;
        }
        // if ( Glob.skipFade ) return;
    }
    if ( !bool(ms) ) {
        console.warn(`util.wait(${ms})`)
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**Check every `checkInterval` ms if `cond()` is truthy. If, within `timeout`, cond() is truthy, return `true`. Return `false` if time is out.
 * @example
 * // Give the user a 200ms chance to get her pointer over "mydiv". Continue immediately once she does, or after 200ms if she doesn't.
 * mydiv.pointerenter( () => mydiv.pointerHovering = true; )
 * const pointerOnMydiv = await waitUntil(() => mydiv.pointerHovering, 200, 10);*/
async function waitUntil(cond: FunctionReturns<boolean>, checkInterval: number = 20, timeout: number = Infinity): Promise<boolean> {
    if ( checkInterval <= 0 )
        throw new Error(`checkInterval <= 0. checkInterval: ${checkInterval}`);
    if ( checkInterval > timeout )
        throw new Error(`checkInterval > timeout (${checkInterval} > ${timeout}). Has to be lower than timeout.`);
    
    const loops = timeout / checkInterval;
    if ( loops == 1 )
        console.warn(`loops == 1, you probably didn't want this to happen`);
    let count = 0;
    while ( count < loops ) {
        if ( cond() ) {
            return true;
        }
        await wait(checkInterval, false);
        count++;
    }
    return false;
}

let stuff = {
    '()=>{}' : () => {
    }, 'function(){}' : function () {
    }, 'Function' : Function,
    'Function()' : Function(),
    "new Function" : new Function,
    "new Function()" : new Function(),
    "Boolean" : Boolean,
    "Boolean()" : Boolean(),
    "Boolean(false)" : Boolean(false),
    "Boolean(true)" : Boolean(true),
    "new Boolean" : new Boolean,
    "new Boolean()" : new Boolean(),
    "new Boolean(true)" : new Boolean(true),
    "new Boolean(false)" : new Boolean(false),
    "true" : true,
    "false" : false,
    "Number" : Number,
    "Number()" : Number(),
    "Number(0)" : Number(0),
    "Number(1)" : Number(1),
    "new Number" : new Number,
    "new Number()" : new Number(),
    "new Number(0)" : new Number(0),
    "new Number(1)" : new Number(1),
    "0" : 0,
    "1" : 1,
    "''" : '',
    "' '" : ' ',
    "'foo'" : 'foo',
    "'0'" : '0',
    "'1'" : '1',
    "{}" : {},
    "{ hi : 'bye' }" : { hi : 'bye' },
    "[]" : [],
    "[ false ]" : [ false ],
    "[ true ]" : [ true ],
    "[ [] ]" : [ [] ],
    "[ 0 ]" : [ 0 ],
    "[ 1 ]" : [ 1 ],
    "undefined" : undefined,
    "null" : null,
    "document.body" : document.body,
    "new class{}" : new class {
    },
    "new Timeline(...)" : "PLACEHOLDER",
};


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
    if ( !obj ) return false;
    return typeof obj !== 'string' && (Array.isArray(obj) || typeof obj[Symbol.iterator] === 'function');
}

function isEmpty(obj: any): boolean {
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
    // [ 1 ]               false
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
    // / {}                true
    let toStringed = {}.toString.call(obj);
    return (toStringed === '[object Object]' || toStringed === '[object Array]') && Object.keys(obj).length == 0;
}

function isEmptyArr(collection): boolean {
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
    // [ 1 ]               false
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
    return isArray(collection) && getLength(collection) === 0
}

function isEmptyObj(obj): boolean {
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
    // [ 1 ]               false
    // []                  false
    // false               false
    // function(){}        false
    // / new Boolean()     true
    // / new Boolean(false)true
    // / new Boolean(true) true
    // new Function()      false
    // / new Number(0)     true
    // / new Number(1)     true
    // / new Number()      true
    // null                false
    // true                false
    // undefined           false
    // { hi : 'bye' }      false
    // / {}                true
    return isObject(obj) && !isArray(obj) && Object.keys(obj).length === 0
}


function isFunction<T>(fn: FunctionReturns<T>): fn is FunctionReturns<T>
// function isFunction(fn: AnyFunction): fn is AnyFunction
function isFunction(fn) {
    // 0                   false
    // 1                   false
    // ''                  false
    // ' '                 false
    // '0'                 false
    // '1'                 false
    // / ()=>{}              true
    // / Boolean             true
    // Boolean()           false
    // / Function            true
    // / Function()          true
    // / Number              true
    // Number()            false
    // [ 1 ]               false
    // []                  false
    // false               false
    // / function(){}        true
    // new Boolean()       false
    // new Boolean(false)  false
    // new Boolean(true)   false
    // / new Function()      true
    // new Number(0)       false
    // new Number(1)       false
    // new Number()        false
    // null                false
    // true                false
    // undefined           false
    // { hi : 'bye' }      false
    // {}                  false
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
function isObject(obj): boolean {
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
    // / [ 1 ]             true
    // / []                true
    // false               false
    // function(){}        false
    // / new Boolean()     true
    // / new Boolean(false)true
    // / new Boolean(true) true
    // new Function()      false
    // / new Number(0)     true
    // / new Number(1)     true
    // / new Number()      true
    // null                false
    // true                false
    // undefined           false
    // / { hi : 'bye' }    true
    // / {}                true
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
    for ( let a of args ) {
        if ( bool(a) ) {
            return true;
        }
    }
    return false;
}


function all(...args: any): boolean {
    for ( let a of args ) {
        if ( !bool(a) ) {
            return false;
        }
    }
    return true;
}


function sum(arr: any[]): number | undefined {
    let sum = 0;
    let dirty = false;
    for ( let v of arr ) {
        let number = parseFloat(v);
        if ( !isNaN(number) ) {
            dirty = true;
            sum += number;
        }
        
    }
    return !dirty ? undefined : sum;
}

function getCurrentWindow() {
    return remote.getCurrentWindow();
}

function reloadPage() {
    if ( require("./Glob").default.BigConfig.dev.no_reload_on_submit() ) {
        return console.warn('reloadPage(), no_reload_on_submit()');
    }
    getCurrentWindow().reload();
}

function* range(start: number, stop: number): Generator<number> {
    for ( let i = start; i <= stop; i++ )
        yield i;
    
}

export {
    all,
    any,
    bool,
    enumerate,
    isArray,
    isFunction,
    isObject,
    getCurrentWindow,
    range,
    reloadPage,
    str,
    sum,
    wait,
    waitUntil
}

