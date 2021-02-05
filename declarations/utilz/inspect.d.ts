/// <reference types="node" />
/**
 @example
 const myFunc = investigate([async] function myFunc(val: any): boolean { ... }
 */
export declare function investigate<T extends (...args: any[]) => any>(fn: T, options?: {
    group: boolean;
}): T;
export declare function investigate<T extends (...args: any[]) => any>(thisArg: ThisParameterType<T>, fnname: string, descriptor: {
    value: T;
}): void;
export declare function investigate<Getter extends () => any, Setter extends (val: any) => any>(thisArg: ThisParameterType<Getter>, fnname: string, descriptor: {
    get: Getter;
    set: Setter;
}): void;
/**
 https://nodejs.org/api/util.html#util_util_inspect_object_options
 `maxArrayLength=100`: null or Infinity to show all elements. Set to 0 or negative to show no elements.
 `maxStringLength=10000`: null or Infinity to show all elements. Set to 0 or negative to show no characters.
 `breakLength=80`
 `showHidden=false`
 `compact=true`
 `depth=null`
 `getters=true`
 `showProxy=true`
 `colors=false`
 Objects can define a [inspect](){ } or [util.inspect.custom](depth, options){ }
 */
export declare function inspect(obj: any, options?: NodeJS.InspectOptions & {
    maxStringLength?: number | null;
}): string;
/**
 @example
 function foo(bar, baz){
    const argnames = getFnArgNames(foo);
    return Object.fromEntries(zip(argnames, arguments));
 }
 foo('rab', 'zab')  // {bar:'rab', baz:'zab'}
 */
export declare function getFnArgNames(func: Function): string[];
export declare function getMethodNames(obj: any): Set<unknown>;
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
export declare function hasprops<Obj extends Record<any, any>, Key extends string>(obj: Obj, ...keys: Key[]): boolean;
