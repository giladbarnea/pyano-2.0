console.debug('utilz/inspect.ts')
import { is, zip } from "./util";

/**
 @example
 const myFunc = investigate([async] function myFunc(val: any): boolean { ... }
 */
export function investigate<T extends (...args: any[]) => any>(fn: T, options?: { group: boolean }): T
export function investigate<T extends (...args: any[]) => any>(thisArg: ThisParameterType<T>, fnname: string, descriptor: { value: T }): void
export function investigate<Getter extends () => any, Setter extends (val: any) => any>(thisArg: ThisParameterType<Getter>, fnname: string, descriptor: { get: Getter, set: Setter }): void
export function investigate<T extends (...args: any[]) => any>(fnOrThis, optionsOrFnName?, descriptor?) {
    const group: boolean = [...arguments].find(arg => is.isTMap(arg) && arg.group)

    function _buildpatch(_this, _method: T, _arguments, _thisstr?) {
        const _argsWithValues = Object.fromEntries(zip(getFnArgNames(_method), _arguments));
        let _methNameAndSig;
        if (_thisstr) {
            // available when decorating class methods
            _methNameAndSig = `%c${_thisstr}.${_method.name}%c(${pf(_argsWithValues)})`;
        } else {
            // not available when decorating static methods
            _methNameAndSig = `%c${_method.name}%c(${pf(_argsWithValues)})`;
        }
        if (group) {
            console.group(_methNameAndSig, 'text-decoration: underline', 'text-decoration: unset');
        } else {
            console.debug(`entered ${_methNameAndSig}`, 'text-decoration: underline', 'text-decoration: unset');
        }
        let _applied = _method.apply(_this, _arguments);

        console.debug(`returning from ${_methNameAndSig} → ${pf(_applied)}`, 'text-decoration: underline', 'text-decoration: unset');

        if (group) {
            console.groupEnd()
        }
        return _applied;
    }

    let method;

    // * @within a class
    if (is.isString(optionsOrFnName)) {
        // class method

        const thisstr = pf(fnOrThis);
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


/**
 https://nodejs.org/api/util.html#util_util_inspect_object_options
 maxArrayLength: null or Infinity to show all elements. Set to 0 or negative to show no elements. Default: 100
 maxStringLength: null or Infinity to show all elements. Set to 0 or negative to show no characters. Default: 10000.
 breakLength: default: 80
 Objects can define a [inspect](){ } or [util.inspect.custom](depth, options){ }
 */
export function inspect(obj, options?: NodeJS.InspectOptions): string {

    // return (global['nodeutil'] ?? require('util')).inspect(obj, {
    return nodeutil.inspect(obj, {
        showHidden: true,
        compact: false,
        depth: null,
        getters: true,
        showProxy: true,
        sorted: true,
        ...options
    } as NodeJS.InspectOptions)
}

/**
 @example
 function foo(bar, baz){
    const argnames = getFnArgNames(foo);
    return Object.fromEntries(zip(argnames, arguments));
 }
 foo('rab', 'zab')  // {bar:'rab', baz:'zab'}
 */
export function getFnArgNames(func: Function): string[] {
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

export function getMethodNames(obj) {
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
export function hasprops<Obj extends Record<any, any>, Key extends string>
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