export declare function isString(obj: any): obj is string;
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
export declare function isTMap<T>(obj: TMap<T>): obj is TMap<T>;
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
export declare function isObject(obj: any): boolean;
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
export declare function isFunction(fn: any): fn is Function;
export declare function isFunction<T extends Function>(fn: T): fn is T;
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
export declare function isPrimitive(value: any): boolean;
export declare function isPromise(obj: any): obj is Promise<any>;
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
export declare function isError(obj: any): obj is Error;
export declare function isRe(obj: any): obj is RegExp;
/*** Same is Array.isArray?
 * Only `true` for `[]` and `[ 1 ]`*/
export declare function isArray<T>(obj: any): obj is Array<T>;
export declare function isEmpty(obj: any): boolean;
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
export declare function isEmptyArr(collection: any): boolean;
