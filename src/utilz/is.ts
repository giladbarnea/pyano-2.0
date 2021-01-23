console.debug('utilz/is.ts');

export function isString(obj): obj is string {
    return typeof obj === "string"
}

export function isTMap<T>(obj: TMap<T>): obj is TMap<T> {

    const tostring = ({}).toString.call(obj);
    const istmap = tostring === '[object Object]' || tostring === '[object Map]' || tostring === '[object WeakMap]';
    if (istmap) {
        // Object.create(Array) is true here but obviously isn't a TMap
        const proto = Object.getPrototypeOf(obj);
        if (proto === undefined && (global['DEVTOOLS'] || global['MID_TEST'])) {
            debugger;
        }
        const protostring = ({}).toString.call(proto);
        if (protostring === undefined && (global['DEVTOOLS'] || global['MID_TEST'])) {
            debugger;
        }
        const protoIsTMap = (protostring === '[object Object]' || protostring === '[object Map]' || protostring === '[object WeakMap]')
        if (protoIsTMap === undefined && (global['DEVTOOLS'] || global['MID_TEST'])) {
            debugger;
        }
        return protoIsTMap
    }
    return istmap
}

export function isNumber(obj): obj is number {
    return typeof obj === 'number'
}

export function isObject(obj): boolean {
    return typeof obj === 'object' && !!obj;
}

export function isFunction(fn): fn is Function
export function isFunction<T extends Function>(fn: T): fn is T
export function isFunction(fn) {
    let toStringed = {}.toString.call(fn);
    return !!fn && toStringed === '[object Function]'
}

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
export function isPrimitive(value) {
    const notAnObject = typeof value !== 'object';
    let isprimitive = (notAnObject && typeof value !== 'function') || value === null;
    return isprimitive
}

export function isPromise(obj): obj is Promise<any> {
    return {}.toString.call(obj) == "[object Promise]"
}

export function isError(obj): obj is Error {
    return obj instanceof Error
}

export function isRe(obj): obj is RegExp {
    if (!obj) {
        return false;
    }
    return obj["compile"] && typeof obj["compile"] === 'function'
}

/***Only `true` for `[]` and `[ 1 ]`*/
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
    const isarray = typeof obj !== 'string' && Array.isArray(obj);
    if (!isarray) {
        const protoIsArray = Array.isArray(Object.getPrototypeOf(obj));
        return protoIsArray
    }
    return isarray;
}


export function isEmpty(obj: any): boolean {

    try {
        const istmap = isTMap(obj);
        // Object.keys(map) returns empty arr but map.keys() doesn't
        const isempty = [...isFunction(obj['keys']) ? obj.keys() : Object.keys(obj)].length == 0 && (istmap || isArray(obj));
        if (isempty) {
            // isempty === true for e.g. Object.create({foo:"bar"}), which is obviously not empty.
            // But Object.create({foo:"bar"})'s PROTOTYPE is NOT empty (in other words, is consistent with reality)
            const proto = Object.getPrototypeOf(obj); // throws when obj is null or undefined, but won't pass 'isempty && istmap' in the first place

            // separate try/catch because don't want to return false on accident when this fails
            try {

                const isprotoempty = ([...isFunction(proto['keys']) ? proto.keys() : Object.keys(proto)].length === 0); // throws when obj is Object.create(null)
                return isprotoempty
            } catch (e) {
                // TypeError when obj is Object.create(null) "Cannot convert undefined or null to object" (can be tested: Object.getPrototypeOf(obj) === null)
                // TypeError when obj instanceof Map: "Method Map.prototype.keys called on incompatible receiver #<Map>"
                /*if ((global['DEVTOOLS'] || global['MID_TEST']) && proto !== null) {
                    console.log(`isEmpty.isEmpty() | proto: ${proto}`);
                    debugger;
                }*/
                return true; // reaching here means isempty === true
            }
        }

        return isempty
    } catch {
        // TypeError when obj is null, ...
        return false
    }


}

export function isEmptyArr(collection): boolean {
    return isArray(collection) && collection?.length === 0
}

function _isObjectCreateNull(obj): boolean {
    try {
        return Object.getPrototypeOf(obj) === null
    } catch {
        return false
    }
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



