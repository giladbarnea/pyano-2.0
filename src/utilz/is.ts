console.log('src/utilz/is.ts');

export function isString(obj): obj is string {
    return typeof obj === "string"
}

/**Has to be either {} or {foo:"bar"}. Not anything else.
 @example
 [
 {},
 { foo : 'bar' },
 { foo : undefined },
 { foo : null },
 ].map(isTMap).every(x=>x===true)
 // true

 [
 [],
 [1],
 new Boolean(),
 new Boolean(true),
 new Boolean(false),
 new Number(),
 new Number(0),
 new Number(1),
 new Set,
 new Set(),
 Error(),
 new Error,
 new Error(),
 0,
 '',
 1,
 '0',
 ' ',
 '1',
 ()=>{},
 Boolean(),
 Boolean,
 Function(),
 Function,
 Number,
 Set,
 function(){},
 new Function(),
 Number(),
 Error,
 false,
 true,
 null,
 undefined,
 ].map(isTMap).some(x=>x===true)
 // false
 * */
export function isTMap<T>(obj: TMap<T>): obj is TMap<T> {

    return {}.toString.call(obj) == '[object Object]'
}

/**
 @example
 [
 [],
 [1],
 new Boolean(),
 new Boolean(true),
 new Boolean(false),
 new Number(),
 new Number(0),
 new Number(1),
 new Set,
 new Set(),
 Error(),
 new Error,
 new Error(),
 {},
 { hi : 'bye' },
 ].map(isObject).every(x=>x===true)
 true

 [
 0,
 '',
 1,
 '0',
 ' ',
 '1',
 ()=>{},
 Boolean(),
 Boolean,
 Function(),
 Function,
 Number,
 Set,
 function(){},
 new Function(),
 Number(),
 Error,
 false,
 true,
 null,
 undefined,
 ].map(isObject).some(x=>x===true)
 false
 */
export function isObject(obj): boolean {
    return typeof obj === 'object' && !!obj;
}

/**
 @example
 [
 ()=>{},
 Boolean,
 Function(),
 Function,
 Number,
 Set,
 function(){},
 new Function(),
 Error,
 ].map(isFunction).every(x=>x===true)
 true

 [
 0,
 '',
 [],
 1,
 '0',
 ' ',
 '1',
 {},
 Boolean(),
 Number(),
 false,
 new Boolean(),
 new Boolean(true),
 new Boolean(false),
 new Number(0),
 new Number(),
 new Number(1),
 new Error(),
 new Error,
 Error(),
 new Set,
 new Set(),
 [1],
 true,
 null,
 { hi : 'bye' },
 undefined,
 ].map(isFunction).some(x=>x===true)
 false
 * */
export function isFunction(fn): fn is Function
export function isFunction<T extends Function>(fn: T): fn is T
export function isFunction(fn){
    let toStringed = {}.toString.call(fn);
    return !!fn && toStringed === '[object Function]'
}

export function isPrimitive(value) {
    return (typeof value !== 'object' && typeof value !== 'function') || value === null
}

export function isPromise(obj): obj is Promise<any> {
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
export function isError(obj): obj is Error {
    return obj instanceof Error
}

export function isRe(obj): obj is RegExp {
    if (!obj) {
        return false;
    }
    return obj["compile"] && typeof obj["compile"] === 'function'
}

/*** Same is Array.isArray?
 * Only `true` for `[]` and `[ 1 ]`*/
export function isArray<T>(obj): obj is Array<T> {
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
    return (typeof obj !== 'string' && Array.isArray(obj));
}

/**
 @example
 [
 [],
 {},
 ].map(isEmpty).every(x=>x===true)
 // true
 [
 0,
 1,
 '',
 ' ',
 '0',
 '1',
 ()=>{},
 Boolean,
 Boolean(),
 Function,
 Function(),
 Number,
 Number(),
 [ 1 ],
 false,
 function(){},
 new Boolean(),
 new Boolean(false),
 new Boolean(true),
 new Function(),
 new Number(0),
 new Number(1),
 new Number(),
 null,
 true,
 undefined,
 { hi : 'bye' },
 ].map(isEmpty).some(x=>x===true)
 // false
 * */
export function isEmpty(obj: any): boolean {
    try {
        return Object.keys(obj).length == 0 && (isTMap(obj) || isArray(obj))
    } catch {
        // when does this happen?
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
export function isEmptyArr(collection): boolean {
    return isArray(collection) && collection?.length === 0
}

// /**
//  @example
//  > [
//  .    {},
//  . ].map(isEmptyObj).every(x=>x===true)
//  true
//
//  > [
//  .    0,
//  .    '',
//  .    [],
//  .    1,
//  .    '0',
//  .    ' ',
//  .    ()=>{},
//  .    '1',
//  .    Boolean(),
//  .    Boolean,
//  .    Function(),
//  .    Function,
//  .    Number(),
//  .    Number,
//  .    false,
//  .    new Boolean(),
//  .    new Boolean(true),
//  .    new Boolean(false),
//  .    new Number(0),
//  .    new Number(),
//  .    new Number(1),
//  .    Set,
//  .    new Set,
//  .    new Set(),
//  .    Error,
//  .    Error(),
//  .    new Error,
//  .    new Error(),
//  .    [1],
//  .    function(){},
//  .    new Function(),
//  .    true,
//  .    null,
//  .    { hi : 'bye' },
//  .    undefined,
//  . ].map(isEmptyObj).some(x=>x===true)
//  false
//  * */
// function isEmptyObj(obj): boolean {
//     return isEmpty(obj) && !isArray(obj)
// }



