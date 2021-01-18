export declare function isString(obj: any): obj is string;
export declare function isTMap<T>(obj: TMap<T>): obj is TMap<T>;
export declare function isNumber(obj: any): obj is number;
export declare function isObject(obj: any): boolean;
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
export declare function isError(obj: any): obj is Error;
export declare function isRe(obj: any): obj is RegExp;
/***Only `true` for `[]` and `[ 1 ]`*/
export declare function isArray<T>(obj: any): obj is Array<T>;
export declare function isEmpty(obj: any): boolean;
export declare function isEmptyArr(collection: any): boolean;
