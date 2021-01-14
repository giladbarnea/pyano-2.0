// @ts-nocheck
///////////////////////////////////
// *** Typing
///////////////////////////////////
interface TMap<T = any> {
    [s: string]: T;

    [s: number]: T
}

interface SMap<T = any> {
    [s: string]: T;
}

interface NMap<T = any> {
    [s: number]: T;
}


interface RecMap<T = any> {
    [s: string]: T | RecMap<T>;

    [s: number]: T | RecMap<T>
}


type _EventName = keyof HTMLElementEventMap;
// TODO: I'm not sure what's the difference between EventName2Function and MapOfEventName2Function?
// EventName2Function<"click"> → function(event: MouseEvent) { }
type EventName2Function<E extends _EventName = _EventName> = {
    [P in _EventName]?: (event: HTMLElementEventMap[P]) => void;
}[E]
// e.g. { "mouseover" : MouseEvent, ... }
type MapOfEventName2Function = Partial<Record<_EventName, EventName2Function>>


/**
 * "a", "div"
 * @example
 * const foo = (tag: Tag) => document.createElement(tag);
 * foo("a") // HTMLAnchorElement
 * foo("BAD") // error
 */
export type Tag = Exclude<keyof HTMLElementTagNameMap, "object">;
/**
 * @example
 * const foo = (tag: _NotTag<"input">) => document.createElement(tag);
 * foo("a") // HTMLAnchorElement
 * foo("input") // error
 * foo("BAD") // error
 */
type _NotTag<T extends Tag> = Exclude<Tag, T>;
/**
 Accepts `Q`: a generic `QuerySelector`, and `T`: a specific `Tag`, such as `"img"`.
 If `T` was given, then type checking will fail for any tag that is not exactly `T`.
 @example
 const foo = <Q extends QuerySelector>(q: QueryOrPreciseTag<Q, "img">) => {}
 foo("img") // OK
 foo("div") // error
 foo("whatever") // OK
 @see QuerySelector
 */
type QueryOrPreciseTag<Q extends QuerySelector, T extends Tag> = Exclude<Q, QuerySelector<_NotTag<T>>>;
// /**
//  *"a", "div", "gilad".
//  *Tag2Element expects a tag and returns an HTMLElement.
//  *@example
//  *const baz = <K extends Tag | string>(query: K) => document.querySelector(query);
//  *baz("div") → HTMLDivElement
//  *baz("diva") → HTMLSelectElement | HTMLLegendElement | ...
//  */
// type Tag2Element<K extends Tag = Tag> = K extends Tag ? HTMLElementTagNameMap[K] : HTMLElementTagNameMap[Tag]
type _TagOrString = Tag | string;
/**
 * `"a"`, `"div"`, `"gilad"`.
 * QuerySelector expects a tag name (string) and returns a `Tag`.
 * @example
 * const foo = <K extends Tag | string>(query: QuerySelector<K>) => document.querySelector(query);
 * foo("a") // HTMLAnchorElement
 * foo("gilad") // HTMLSelectElement | HTMLLegendElement | ...
 * @see Tag
 */
export type QuerySelector<K extends _TagOrString = _TagOrString> = K extends Tag ? K : string;

// const foo = <K extends Tag>(tag: K) => document.createElement(tag);

// const baz = <K extends Tag | string>(query: K) => document.querySelector(query);

// const bar = <K extends Tag | string>(query: QuerySelector<K>) => document.querySelector(query);

/*
// Tag2BHE["a"] → Anchor
interface Tag2BHE {
    "img": Img,
    "a": Anchor,
    "input": Input,
    "div": Div,
    "p": Paragraph,
    "button": Button,
    "span": Span,
}
*/

// type BHETag = keyof Tag2BHE;
// type BHEHTMLElement =
//     HTMLAnchorElement |
//     HTMLInputElement |
//     HTMLImageElement |
//     HTMLParagraphElement |
//     HTMLDivElement |
//     HTMLButtonElement |
//     HTMLSpanElement;
//
// type StdBHEHTMLElement =
//     HTMLParagraphElement |
//     HTMLDivElement |
//     HTMLButtonElement |
//     HTMLSpanElement

/*type Element2Tag<T> =
    T extends HTMLInputElement ? "input"
        : T extends HTMLAnchorElement ? "a"
        : T extends HTMLImageElement ? "img"
            : Tag*/

/**
 * @example
 * const foo: Element2Tag<HTMLInputElement> = "input"  // ok
 * const bar: Element2Tag<HTMLInputElement> = "img"  // ERROR
 */
export type Element2Tag<T> = { [K in keyof HTMLElementTagNameMap]: HTMLElementTagNameMap[K] extends T ? K : never }[keyof HTMLElementTagNameMap]


// type MapValues<T> = { [K in keyof T]: T[K] }[keyof T];
// type HTMLElements = MapValues<HTMLElementTagNameMap>;

// HTMLDivElement, ...
// type Filter<T> = T extends HTMLElements ? T : never;
// type GenericFilter<T, U> = T extends U ? T : never;


// const what: Filter<HTMLInputElement, HTMLElements> = undefined;
// const what: Filter<HTMLInputElement> = undefined;
// const what: Element2Tag<HTMLAnchorElement> = undefined;


// type ChildrenObj = TMap<Tag2Element> | RecMap<Tag2Element>
// type ChildrenObj = TMap<QuerySelector> | RecMap<QuerySelector>
export type ChildrenObj = RecMap<QuerySelector | BetterHTMLElement | typeof BetterHTMLElement>
export type Enumerated<T> =
    T extends (infer U)[] ? [i: number, item: U][] // Array
        // TMaps
        : T extends SMap<(infer U)> ? [key: string, value: U][]
        : T extends NMap<(infer U)> ? [key: number, value: U][]
            : T extends TMap<(infer U)> ? [key: keyof T, value: U][]
                : T extends RecMap<(infer U)> ? [key: keyof T, value: U][]
                    // : T extends boolean ? never : any;
                    // : T extends infer U ? [key: string, value: U[keyof U]][]
                    : never;
type Returns<T> = (s: string) => T;
// type TReturnBoolean = (s: string) => boolean;

type NodeOrBHE = BetterHTMLElement | Node;
type ElementOrBHE = BetterHTMLElement | Element;

type Awaited<T> = T extends Promise<infer U> ? U : T;
// type Callable<T1, T2, F> = F extends (a1: T1, a2: T2) => infer R ? R : any;
// type Callable2<T1, F> = F extends (a1: T1, a2: HTMLElement) => infer R ? R : any;


/////////////////////////////////////////////////
/////////////// CSS /////////////////////////////
/////////////////////////////////////////////////

// TODO: https://www.npmjs.com/package/csstype
type OmittedCssProps = "animationDirection"
    | "animationFillMode"
    | "animationIterationCount"
    | "animationPlayState"
    | "animationTimingFunction"
    | "opacity"
    | "padding"
    | "paddingBottom"
    | "paddingLeft"
    | "paddingRight"
    | "paddingTop"
    | "preload"
    | "width"
type PartialCssStyleDeclaration = Omit<Partial<CSSStyleDeclaration>, OmittedCssProps>;

interface CssOptions extends PartialCssStyleDeclaration {
    animationDirection?: AnimationDirection;
    animationFillMode?: AnimationFillMode;
    animationIterationCount?: number;
    animationPlayState?: AnimationPlayState;
    animationTimingFunction?: AnimationTimingFunction;
    opacity?: string | number;
    padding?: string | number;
    paddingBottom?: string | number;
    paddingLeft?: string | number;
    paddingRight?: string | number;
    paddingTop?: string | number;
    preload?: "auto" | string;
    width?: string | number;
}


type CubicBezierFunction = [number, number, number, number];
type Jumpterm = 'jump-start' | 'jump-end' | 'jump-none' | 'jump-both' | 'start' | 'end';

/**Displays an animation iteration along n stops along the transition, displaying each stop for equal lengths of time.
 * For example, if n is 5,  there are 5 steps.
 * Whether the animation holds temporarily at 0%, 20%, 40%, 60% and 80%, on the 20%, 40%, 60%, 80% and 100%, or makes 5 stops between the 0% and 100% along the animation, or makes 5 stops including the 0% and 100% marks (on the 0%, 25%, 50%, 75%, and 100%) depends on which of the following jump terms is used*/
type StepsFunction = [number, Jumpterm];
type AnimationTimingFunction =
    'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'step-start'
    | 'step-end'
    | StepsFunction
    | CubicBezierFunction
type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';

interface TransformOptions {
    matrix?: [number, number, number, number, number, number],
    matrix3d?: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number],
    perspective?: string, // px
    rotate?: string, // deg
    rotate3d?: [number, number, number, string] // [,,,deg]
    rotateX?: string,
    rotateY?: string,
    rotateZ?: string,
    scale?: number, // 1.5
    scale3d?: [number, number, number],
    scaleX?: [number, number, number],
    scaleY?: [number, number, number],
    skew?: [string, string] // deg, deg
    skewX?: string,
    skewY?: string,
    translate?: [string, string], // px, px
    translate3d?: [string, string, string],
    translateX?: string,
    translateY?: string,
    translateZ?: string,


}

interface AnimateOptions {
    delay?: string;
    direction?: AnimationDirection;
    duration: string;
    fillMode?: AnimationFillMode;
    iterationCount?: number;
    name: string;
    playState?: AnimationPlayState;
    /** Also accepts:
     * cubic-bezier(p1, p2, p3, p4)
     * 'ease' == 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
     * 'linear' == 'cubic-bezier(0.0, 0.0, 1.0, 1.0)'
     * 'ease-in' == 'cubic-bezier(0.42, 0, 1.0, 1.0)'
     * 'ease-out' == 'cubic-bezier(0, 0, 0.58, 1.0)'
     * 'ease-in-out' == 'cubic-bezier(0.42, 0, 0.58, 1.0)'
     * */
    timingFunction?: AnimationTimingFunction;
}
///////////////////////////////////
// *** Util
///////////////////////////////////
export function enumerate<T>(obj: T): Enumerated<T> {
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
        throw new TypeError(`enumerate(obj) | obj (${typeofObj}) is not iterable (${obj})`);
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

export function wait(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function bool(val: any): boolean {
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

export function copy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}

/**
 `true` if objects have the same CONTENT. This means that order doesn't matter, but loose data structure does matter
 (i.e. if `a` an array, so should be `b`)
 @example
 > equal( [1,2], [2,1] )
 true

 */
export function equal(a, b): boolean {
    if (a === b) {
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
    if (isObject(a)) { // I think it's ok to check if object and not to check if TMap
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
    return a === b;
}

export function isArray<T>(obj): obj is Array<T> {
    // same as Array.isArray
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

export function isEmptyArr(collection): boolean {
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

export function isEmptyObj(obj): boolean {
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


export function isFunction<F extends Function>(fn: F): fn is F {
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

export function anyDefined(obj: Array<any> | TMap): boolean {
    let array;
    if (isTMap(obj)) {
        array = Object.values(obj);
    } else if (isArray(obj)) {
        array = obj;
    } else {
        throw new TypeError(`anyDefined(obj): expected array or dict-like, got ${typeof obj}: ${obj}`);
    }
    return array.filter(x => x !== undefined).length > 0;
}

export function anyTruthy(obj: Array<any> | TMap): boolean {
    let array;
    if (isTMap(obj)) {
        array = Object.values(obj);
    } else if (isArray(obj)) {
        array = obj;
    } else {
        throw new TypeError(`anyTruthy(obj): expected array or dict-like, got ${typeof obj}: ${obj}`);
    }
    return array.filter(x => bool(x)).length > 0;
}

export function allUndefined(obj: Array<any> | TMap): boolean {
    let array;
    if (isTMap(obj)) {
        array = Object.values(obj)
    } else if (isArray(obj)) {
        array = obj;
    } else {
        throw new TypeError(`allUndefined(obj): expected array or dict-like, got ${typeof obj}: ${obj}`);
    }
    return array.filter(x => x !== undefined).length === 0
}


export function prettyNode(node: NodeOrBHE): string {
    if (!node) { // undefined, ...
        return `${node}`
    }
    if (node instanceof BetterHTMLElement) {
        return node.toString();
    }
    let ret = '';
    let str = `${node}`;
    let type = str.match(/\[object (\w+)\]/)[1] ?? typeof node;
    let cls;
    let id;
    let tag;

    // maybe node is Element, try getting more information
    if (node instanceof Element) {
        cls = node.className;
        id = node.id;
        tag = node.tagName;
    }
    if (tag) {
        ret += `${tag} (${type})`;
    } else {
        ret += type;
    }
    if (id) {
        ret += ` #${id}`
    }
    if (cls) {
        ret += `.${cls}`
    }
    return ret;
}

// /**Check every `checkInterval` ms if `cond()` is truthy. If, within `timeout`, cond() is truthy, return `true`. Return `false` if time is out.
//  * @example
//  * // Give the user a 200ms chance to get her pointer over "mydiv". Continue immediately once she does, or after 200ms if she doesn't.
//  * mydiv.pointerenter( () => mydiv.pointerHovering = true; )
//  * const pointerOnMydiv = await waitUntil(() => mydiv.pointerHovering, 200, 10);*/
// async function waitUntil(cond: () => boolean, checkInterval: number = 20, timeout: number = Infinity): Promise<boolean> {
//     if (checkInterval <= 0) {
//         throw new Error(`checkInterval <= 0. checkInterval: ${checkInterval}`);
//     }
//     if (checkInterval > timeout) {
//         throw new Error(`checkInterval > timeout (${checkInterval} > ${timeout}). checkInterval has to be lower than timeout.`);
//     }
//
//     const loops = timeout / checkInterval;
//     if (loops <= 1) {
//         console.warn(`loops <= 1, you probably didn't want this to happen`);
//     }
//     let count = 0;
//     while (count < loops) {
//         if (cond()) {
//             return true;
//         }
//         await wait(checkInterval);
//         count++;
//     }
//     return false;
// }

/*function isHTMLInputElement(el: HTMLInputElement): el is HTMLInputElement {
    return (el instanceof HTMLInputElement)
}

export function isHTMLButtonElement(el: HTMLButtonElement): el is HTMLButtonElement {
    return (el instanceof HTMLButtonElement)
}*/

// function isBHE<T extends BetterHTMLElement>(bhe: T, bheSubType): bhe is T {
//     return (bhe instanceof bheSubType)
// }

// function isType<T>(arg: T): arg is T {
//     return true
// }

export function isTMap<T>(obj: TMap<T>): obj is TMap<T> {
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
/**true for any non-primitive, including array, function*/
export function isObject(obj): boolean {
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

export function shallowProperty<T>(key: string): (obj: T) => T extends null ? undefined : T[keyof T] {
    return function (obj) {
        return obj == null ? void 0 : obj[key];
    };
}


export function getLength(collection): number {
    return shallowProperty('length')(collection)
}


///////////////////////////////////
// *** Exceptions
///////////////////////////////////
export function getArgsFullRepr(argsWithValues: TMap<any>): string {
    return Object.entries(argsWithValues)
        // @ts-ignore
        .flatMap(([argname, argval]) => `${argname} (${typeof argval}): ${isObject(argval) ? `{${getArgsFullRepr(argval)}}` : argval}`)
        .join('", "');
}

export function getArgsWithValues(passedArgs: TMap<any>) {
    const argsWithValues: TMap<any> = {};
    for (let [argname, argval] of Object.entries(passedArgs)) {
        if (argval !== undefined) {
            argsWithValues[argname] = argval;
        }
    }
    return argsWithValues;
}

export function summary(argset: TMap<any>): string {
    const argsWithValues = getArgsWithValues(argset);
    const argsFullRepr: string = getArgsFullRepr(argsWithValues);
    let argNames = Object.keys(argset);
    return `${argNames.length} args (${argNames}); ${Object.keys(argsWithValues).length} had value: "${argsFullRepr}".\n`;
}

/**Prints what was expected and what was actually passed.*/
export class MutuallyExclusiveArgs extends Error {
    /**@param passedArgs - key:value pairs of argName:argValue, where each arg is mutually exclusive with all others*/
    constructor(passedArgs: TMap<any>, details?: string)
    /**@param passedArgs - Array of mutually exclusive sets of args, where an arg from one set means there can't be any args from the other sets.
     * Each set is key:value pairs of argName:argValue.*/
    constructor(passedArgs: TMap<any>[], details?: string)
    /**Either a argName:argValue map or an array of such maps, to indicate mutually exclusive sets of args.*/
    constructor(passedArgs, details?: string) {
        let message = `Didn't receive exactly one arg`;
        if (isArray(passedArgs)) {
            message += ` from the following mutually exclusive sets of args.\n`;
            for (let [i, argset] of enumerate(passedArgs)) {
                message += `Out of set #${i + 1}, which consists of ${summary(argset)}`
            }
        } else {
            message += ` from the following mutually exclusive set of args.\nOut of ${summary(passedArgs)}`
        }

        if (details) {
            message += `Details: ${details}`
        }
        super(message);
    }


}


export class NotEnoughArgs extends Error {
    constructor(expected: number | number[], passedArgs: TMap<any> | TMap<any>[], relation?: 'each' | 'either') {
        let message;
        if (isArray(expected)) {
            let [min, max] = expected;
            if (max === undefined) {
                message = `Didn't receive enough args: expected at least ${min}`
            } else {
                message = `Didn't receive enough args: expected between ${min} and ${max}`
            }
        } else {
            message = `Didn't receive enough args: expected exactly ${expected}`;
        }

        if (isArray(passedArgs)) {
            message += ` from ${relation} set of arguments.\n`;
            for (let [i, argset] of enumerate(passedArgs)) {
                message += `Out of set #${i + 1}, which consists of ${summary(argset)}`
            }

        } else {
            message += ` from the following set of args.\nOut of ${summary(passedArgs)}`;
        }

        super(message);
    }
}

export class BHETypeError extends TypeError {

    constructor(options: { faultyValue: TMap<any>, expected?: any | any[], where?: string, message?: string }) {
        let { faultyValue, expected, where, message } = options;
        const repr = getArgsFullRepr(faultyValue);
        let msg = '';
        if (where) {
            msg += `${where} | `
        }
        msg += `Got ${repr}. `;
        if (expected) {
            if (isArray(expected)) {
                expected = expected.join(" | ")
            }
            msg += ` Expected: ${expected}. `
        }
        if (message) {
            msg += `Details:\n${message}`
        }
        super(msg);
    }
}

export class ValueError extends BHETypeError {

}///////////////////////////////////
// *** Main Content
///////////////////////////////////
const SVG_NS_URI = 'http://www.w3.org/2000/svg';

export class BetterHTMLElement<Generic extends HTMLElement = HTMLElement> {
    protected _htmlElement: Generic;
    private readonly _isSvg: boolean = false;
    private readonly _listeners: MapOfEventName2Function = {};
    private _cachedChildren: TMap<BetterHTMLElement | BetterHTMLElement[]> = {};

    /**Create an element of `tag`. Optionally, set its `cls` or `id`. */
    constructor({ tag, cls, setid, html }: { tag: Element2Tag<Generic>, cls?: string, setid?: string, html?: string });
    /**Wrap an existing element by `byid`. Optionally cache existing `children`*/
    constructor({ byid, children }: { byid: string, children?: ChildrenObj });
    /**Wrap an existing element by `query`. Optionally cache existing `children`*/
    constructor({ query, children }: { query: QuerySelector, children?: ChildrenObj });
    /**Wrap an existing HTMLElement. Optionally cache existing `children`*/
    constructor({ htmlElement, children }: { htmlElement: Generic; children?: ChildrenObj });
    constructor(elemOptions) {
        let {
            tag, cls, setid, html, // create new
            htmlElement, byid, query, children // wrap existing
        } = elemOptions;

        // *** Argument Errors
        // ** wrapping args: assert max one (or none if creating new)
        if ([tag, byid, query, htmlElement].filter(x => x !== undefined).length > 1) {
            throw new MutuallyExclusiveArgs({
                byid, query, htmlElement, tag
            }, 'Either wrap an existing element by passing one of `byid` / `query` / `htmlElement`, or create a new one by passing `tag`.')
        }
        // ** creating new elem args: assert creators and wrappers not mixed
        // * if creating new with either `tag` / `setid` , no meaning to either children, byid, htmlElement, or query
        if (anyDefined([tag, cls, setid]) && anyDefined([children, byid, htmlElement, query])) {
            throw new MutuallyExclusiveArgs([
                { tag, cls, setid },
                { children, byid, htmlElement, query }
            ], `Can't have args from both sets`)
        }
        if (allUndefined([tag, byid, htmlElement, query])) {
            throw new NotEnoughArgs(1, { tag, byid, htmlElement, query }, 'either');
        }


        // ** tag (CREATE element)
        if (tag !== undefined) {
            if (['svg', 'path'].includes(tag.toLowerCase())) {
                this._isSvg = true;
                this._htmlElement = document.createElementNS(SVG_NS_URI, tag);
            } else {
                this._htmlElement = document.createElement(tag) as Generic;
            }

        } else { // ** wrap EXISTING element
            // * byid
            if (byid !== undefined) {
                if (byid.startsWith('#')) {
                    console.warn(`param 'byid' starts with '#', stripping it: ${byid}`);
                    byid = byid.substr(1);
                }
                this._htmlElement = document.getElementById(byid) as Generic;
            } else {
                // * query
                if (query !== undefined) {
                    this._htmlElement = document.querySelector(query) as Generic;
                } else {
                    // * htmlElement
                    if (htmlElement !== undefined) {
                        this._htmlElement = htmlElement;
                    }
                }
            }
        }
        if (!bool(this._htmlElement)) {
            throw new Error(`${this} constructor ended up with no 'this._htmlElement'. Passed options: ${summary(elemOptions)}`)
        }
        if (cls !== undefined) {
            this.class(cls);
        }
        if (html !== undefined) {
            this.html(html);
        }
        if (children !== undefined) {
            this.cacheChildren(children);
        }
        if (setid !== undefined) {
            this.id(setid);
        }


    }

    /**Return the wrapped HTMLElement*/
    get e() {
        return this._htmlElement;
    }

    /**Constructs a specific BetterHTMLElement based on given `htmlElement`'s tag.*/
    static wrapWithBHE<TInputType extends InputType = InputType, Generic extends FormishHTMLElement = FormishHTMLElement>(htmlElement: Generic): Input<TInputType, Generic>;
    static wrapWithBHE(htmlElement: HTMLAnchorElement): Anchor;
    static wrapWithBHE(htmlElement: HTMLImageElement): Img;
    static wrapWithBHE(htmlElement: HTMLParagraphElement): Paragraph;
    static wrapWithBHE(htmlElement: HTMLSpanElement): Span;
    static wrapWithBHE(htmlElement: HTMLButtonElement): Button;
    static wrapWithBHE(htmlElement: HTMLDivElement): Div;
    static wrapWithBHE(htmlElement: HTMLSelectElement): Select;
    static wrapWithBHE(htmlElement: HTMLElement): BetterHTMLElement;
    static wrapWithBHE(htmlElement: Element): BetterHTMLElement;
    static wrapWithBHE(element) {
        const tag = element.tagName.toLowerCase() as Element2Tag<typeof element>;
        // const tag = element.tagName.toLowerCase() as Tag;
        if (tag === 'div') {
            return div({ htmlElement: element });
        } else if (tag === 'a') {
            return anchor({ htmlElement: element });
        } else if (tag === 'p') {
            return paragraph({ htmlElement: element });
        } else if (tag === 'img') {
            return img({ htmlElement: element });
        } else if (tag === 'input') {
            if (element.type === "text") {
                return new TextInput({ htmlElement: element });
            } else if (element.type === "checkbox") {
                return new CheckboxInput({ htmlElement: element });
            } else {
                return input({ htmlElement: element });
            }
        } else if (tag === 'button') {
            return button({ htmlElement: element });
        } else if (tag === 'span') {
            return span({ htmlElement: element });
        } else if (tag === 'select') {
            return select({ htmlElement: element });
        } else {
            return elem({ htmlElement: element });
        }
    }

    toString() {
        const proto = Object.getPrototypeOf(this);
        const protoStr = proto.constructor.toString();
        let str = protoStr.substring(6, protoStr.indexOf('{') - 1);

        let tag = this._htmlElement?.tagName;
        let id = this.id();
        let classList = this._htmlElement?.classList;
        if (anyTruthy([id, classList, tag])) {
            str += ` (`;
            if (tag) {
                str += `<${tag.toLowerCase()}>`
            }
            if (id) {
                str += `#${id}`
            }
            if (classList) {
                str += `.${classList}`
            }
            str += `)`;
        }
        return str
    }

    /**Returns whether `this` and `otherNode` have the same properties.*/
    isEqualNode(otherNode: NodeOrBHE | null): boolean {
        try {
            return this._htmlElement.isEqualNode(otherNode['_htmlElement'] ?? otherNode);
        } catch (err) {
            console.warn(`${this}.isEqualNode(${prettyNode(otherNode)}) raised a ${err?.name}: ${err?.message}`)
            return false
        }
    }

    /** Returns whether `this` and `otherNode` reference the same object*/
    isSameNode(otherNode: NodeOrBHE | null): boolean {
        try {
            return this._htmlElement.isSameNode(otherNode['_htmlElement'] ?? otherNode);
        } catch (err) {
            console.warn(`${this}.isSameNode(${prettyNode(otherNode)}) raised a ${err?.name}: ${err?.message}`)
            return false
        }
    }

    /**Sets `this._htmlElement` to `newHtmlElement._htmlElement`.
     * Resets `this._cachedChildren` and caches `newHtmlElement._cachedChildren`.
     * Adds event listeners from `newHtmlElement._listeners`, while keeping `this._listeners`.*/
    wrapSomethingElse<T extends HTMLElement>(newHtmlElement: BetterHTMLElement<T>): this
    /**Sets `this._htmlElement` to `newHtmlElement`.
     * Keeps `this._listeners`.
     * NOTE: this reinitializes `this._cachedChildren` and all event listeners belonging to `newHtmlElement` are lost. Pass a `BetterHTMLElement` to keep them.*/
    wrapSomethingElse(newHtmlElement: Node): this
    wrapSomethingElse(newHtmlElement) {
        this._cachedChildren = {};
        if (newHtmlElement instanceof BetterHTMLElement) {
            this._htmlElement.replaceWith(newHtmlElement._htmlElement);
            this._htmlElement = newHtmlElement._htmlElement;
            for (let [_key, _cachedChild] of enumerate(newHtmlElement._cachedChildren)) {
                this._cache(_key, _cachedChild)
            }
            if (
                Object.keys(this._cachedChildren).length
                !== Object.keys(newHtmlElement._cachedChildren).length
                ||
                Object.values(this._cachedChildren).filter(v => v !== undefined).length
                !== Object.values(newHtmlElement._cachedChildren).filter(v => v !== undefined).length
            ) {
                console.warn(`wrapSomethingElse this._cachedChildren length !== newHtmlElement._cachedChildren.length`, {
                        this: this,
                        newHtmlElement
                    }
                )
            }
            this.on({ ...this._listeners, ...newHtmlElement._listeners, });
        } else {
            // No way to get newHtmlElement event listeners besides hacking Element.prototype
            this.on(this._listeners);
            this._htmlElement.replaceWith(newHtmlElement);
            this._htmlElement = newHtmlElement;
        }

        return this;
    }

    // *** Basic
    /**Set the element's innerHTML*/
    html(html: string): this;
    /**Get the element's innerHTML*/
    html(): string;
    html(html?) {
        if (html === undefined) {
            return this._htmlElement.innerHTML;
        } else {
            this._htmlElement.innerHTML = html;
            return this;
        }
    }

    /**Set the element's innerText*/
    text(txt: string | number): this;
    /**Get the element's innerText*/
    text(): string;
    text(txt?) {
        if (txt === undefined) {
            return this._htmlElement.innerText;
        } else {
            this._htmlElement.innerText = txt;
            return this;
        }

    }

    /**Set the id of the element*/
    id(id: string): this;
    /**Get the id of the element*/
    id(): string;
    id(id?) {
        if (id === undefined) {
            return this._htmlElement?.id;
        } else {
            this._htmlElement.id = id;
            return this;
        }
    }

    /**For each `{<styleAttr>: <styleVal>}` pair, set the `style[styleAttr]` to `styleVal`.*/
    css(css: Partial<CssOptions>): this
    /**Get `style[css]`*/
    css(css: string): string
    css(css) {
        if (typeof css === 'string') {
            return this._htmlElement.style[css];
        } else {
            for (let [styleAttr, styleVal] of enumerate(css)) {
                this._htmlElement.style[<string>styleAttr] = styleVal;
            }
            return this;
        }
    }

    /**Remove the value of the passed style properties*/
    uncss(...removeProps: (keyof CssOptions)[]): this {
        let css = {};
        for (let prop of removeProps) {
            css[prop] = '';
        }
        return this.css(css);
    }


    // *** Classes
    /**`.className = cls`*/
    class(cls: string): this;
    /**Return the first class that matches `cls` predicate.*/
    class(cls: Returns<boolean>): string;
    /**Return a string array of the element's classes (not a classList)*/
    class(): string[];
    class(cls?) {
        if (cls === undefined) {
            return Array.from(this._htmlElement.classList);
        } else if (isFunction(cls)) {
            return Array.from(this._htmlElement.classList).find(cls);
        } else {
            if (this._isSvg) {
                // @ts-ignore
                // noinspection JSConstantReassignment
                this._htmlElement.classList = [cls];
            } else {
                this._htmlElement.className = cls;
            }
            return this;
        }
    }

    addClass(cls: string, ...clses: string[]): this {
        this._htmlElement.classList.add(cls);
        for (let c of clses) {
            this._htmlElement.classList.add(c);
        }
        return this;
    }

    removeClass(cls: Returns<boolean>, ...clses: Returns<boolean>[]): this;
    removeClass(cls: string, clses?: string[]): this;
    removeClass(cls, ...clses) {
        if (isFunction<Returns<boolean>>(cls)) {
            this._htmlElement.classList.remove(this.class(cls));
            for (let c of <Returns<boolean>[]>clses) {
                this._htmlElement.classList.remove(this.class(c));
            }
        } else {
            this._htmlElement.classList.remove(cls);
            for (let c of clses) {
                this._htmlElement.classList.remove(c);
            }
        }
        return this;
    }

    replaceClass(oldToken: Returns<boolean>, newToken: string): this;
    replaceClass(oldToken: string, newToken: string): this
    replaceClass(oldToken, newToken) {
        if (isFunction<Returns<boolean>>(oldToken)) {
            this._htmlElement.classList.replace(this.class(oldToken), newToken);
        } else {
            this._htmlElement.classList.replace(oldToken, newToken);
        }
        return this;
    }

    toggleClass(cls: Returns<boolean>, force?: boolean): this
    toggleClass(cls: string, force?: boolean): this
    toggleClass(cls, force) {
        if (isFunction<Returns<boolean>>(cls)) {
            this._htmlElement.classList.toggle(this.class(cls), force);
        } else {
            this._htmlElement.classList.toggle(cls, force);
        }
        return this;
    }

    /**Returns `this._htmlElement.classList.contains(cls)` */
    hasClass(cls: string): boolean
    /**Returns whether `this` has a class that matches passed function */
    hasClass(cls: Returns<boolean>): boolean
    hasClass(cls) {
        if (isFunction(cls)) {
            return this.class(cls) !== undefined;
        } else {
            return this._htmlElement.classList.contains(cls);
        }
    }

    // *** Nodes
    /**Insert `node`(s) just after `this`.
     * @see HTMLElement.after*/
    after(...nodes: Array<NodeOrBHE>): this {
        this._htmlElement.after(...nodes.map(node => node['_htmlElement'] ?? node))
        return this;
    }

    /**Insert `this` just after `node`.
     * @see HTMLElement.after*/
    insertAfter(node: ElementOrBHE): this {
        (node['_htmlElement'] ?? node).after(this._htmlElement);
        // if (node instanceof BetterHTMLElement) {
        //     node._htmlElement.after(this._htmlElement);
        // } else {
        //     node.after(this._htmlElement);
        // }
        return this;
    }

    /**Insert `node`(s) after the last child of `this`.
     * Any `node` can be either a `BetterHTMLElement`, a vanilla `Node`,
     * a `{someKey: BetterHTMLElement}` pairs object, or a `[someKey, BetterHTMLElement]` tuple.*/
    append(...nodes: Array<NodeOrBHE | TMap<BetterHTMLElement> | [key: string, child: BetterHTMLElement]>): this {
        for (let node of nodes) {
            if (node instanceof BetterHTMLElement) {
                this._htmlElement.append(node._htmlElement);
                continue;
            }
            if (node instanceof Node) {
                this._htmlElement.append(node);
                continue;
            }
            console.warn(`${this} .append(...nodes) | node is not BHE nor Node: ${node} (${typeof node}). calling cacheAppend ??`)
            // this use of cacheAppend is intentional! I think!
            if (Array.isArray(node)) {
                this.cacheAppend([node]);
            } else {
                this.cacheAppend(node)
            }


        }
        return this;

    }

    /**Append `this` to `node`.
     * @see HTMLElement.append*/
    appendTo(node: ElementOrBHE): this {
        (node['_htmlElement'] ?? node).append(this._htmlElement);
        // if (node instanceof BetterHTMLElement) {
        //     node._htmlElement.append(this._htmlElement);
        // } else {
        //     node.append(this._htmlElement);
        // }

        return this;
    }

    /**Insert `node`(s) just before `this`.
     * @see HTMLElement.before*/
    before(...nodes: Array<NodeOrBHE>): this {
        this._htmlElement.before(...nodes.map(node => node['_htmlElement'] ?? node))
        return this;
    }

    /**Inserts `newChild` before `refChild` as a child of `this`.
     If `newChild` already exists in the document, it is moved from its current position to the new position.
     (That is, it will automatically be removed from its existing parent before appending it to the specified new parent.)*/
    insertBefore(newChild: NodeOrBHE, refChild: NodeOrBHE): this {
        this._htmlElement.insertBefore(newChild['_htmlElement'] ?? newChild, refChild['_htmlElement'] ?? refChild)
        return this;
    }


    // removeChild<T extends HTMLElement>(oldChild: T): BetterHTMLElement<T>;
    // removeChild<T extends BetterHTMLElement>(oldChild: T): T;
    removeChild<T extends HTMLElement>(oldChild: T | BetterHTMLElement<T>): BetterHTMLElement<T> {
        const removed: T = this._htmlElement.removeChild(oldChild['_htmlElement'] ?? oldChild);
        const bheRemoved = this._cls().wrapWithBHE(removed) as BetterHTMLElement<T>;
        return bheRemoved;
    }

    /**Inserts `nodes` before the first child of `this`*/
    prepend(...nodes: Array<NodeOrBHE>): this {
        this._htmlElement.prepend(...nodes.map(node => node['_htmlElement'] ?? node));
        return this;
    }

    /**Replaces `oldChild` with `newChild`, where parent is `this`.*/
    replaceChild(newChild: NodeOrBHE, oldChild: NodeOrBHE): this {
        this._htmlElement.replaceChild(newChild['_htmlElement'] ?? newChild, oldChild['_htmlElement'] ?? oldChild);
        return this;
    }

    /**Replaces `this` with `node`(s)*/
    replaceWith(...nodes: Array<NodeOrBHE>): this {
        this._htmlElement.replaceWith(...nodes.map(node => node['_htmlElement'] ?? node));
        return this;
    }

    insertAdjacentElement(position: InsertPosition, insertedElement: ElementOrBHE) {
        const ret = this._htmlElement.insertAdjacentElement(position, insertedElement['_htmlElement'] ?? insertedElement);
        const bheRet = this._cls().wrapWithBHE(ret);
        return bheRet;
    }


    /**For each `[key, child]` pair, `append(child)` and store it in `this[key]`. */
    cacheAppend(keyChildPairs: TMap<BetterHTMLElement>): this

    /**For each `[key, child]` tuple, `append(child)` and store it in `this[key]`. */
    cacheAppend(keyChildPairs: [key: string, child: BetterHTMLElement][]): this

    cacheAppend(keyChildPairs) {
        const _cacheAppend = (_key: PropertyKey, _child: BetterHTMLElement) => {
            this.append(_child);
            this._cache(_key, _child);
        };
        if (Array.isArray(keyChildPairs)) {
            for (let [key, child] of keyChildPairs) {
                _cacheAppend(key, child);
            }
        } else {
            // keyChildPairs = keyChildPairs as TMap<BetterHTMLElement>;
            for (let [key, child] of enumerate(<TMap<BetterHTMLElement>>keyChildPairs)) {
                _cacheAppend(key, child);
            }
        }
        return this;
    }

    _cls() {
        return BetterHTMLElement
    }

    child(selector: "img"): Img;
    child(selector: "a"): Anchor;
    child<TInputType extends InputType = InputType>(selector: "input"): Input<TInputType>;
    child(selector: "select"): Input<undefined, HTMLSelectElement>;
    child(selector: "p"): Paragraph;
    child(selector: "span"): Span;
    child(selector: "button"): Button;
    child(selector: "div"): Div;
    child<T extends Tag>(selector: T): BetterHTMLElement<HTMLElementTagNameMap[T]>;
    child(selector: string): BetterHTMLElement;
    child<T extends typeof BetterHTMLElement>(selector: string, bheCtor: T): T; // bheCtor is used in cacheChildren
    child(selector, bheCtor?) {
        const htmlElement = this._htmlElement.querySelector(selector) as HTMLElement;
        if (htmlElement === null) {
            console.warn(`${this}.child(${selector}): no child. returning undefined`);
            return undefined;
        }
        let bhe;
        if (bheCtor === undefined) {
            bhe = this._cls().wrapWithBHE(htmlElement);
        } else {
            bhe = new bheCtor({ htmlElement });
        }
        return bhe;
    }

    /**Return a `BetterHTMLElement` list of all children */
    children(): BetterHTMLElement[];

    /**Return a `BetterHTMLElement` list of all children selected by `selector` */
    children<K extends Tag>(selector: K): BetterHTMLElement[];

    /**Return a `BetterHTMLElement` list of all children selected by `selector` */
    children(selector: QuerySelector): BetterHTMLElement[];

    children(selector?) {
        let childrenVanilla;
        let childrenCollection;
        if (selector === undefined) {
            childrenCollection = this._htmlElement.children;
        } else {
            childrenCollection = this._htmlElement.querySelectorAll(selector);
        }

        childrenVanilla = Array.from(childrenCollection);

        return childrenVanilla.map(this._cls().wrapWithBHE);
    }

    clone(deep?: boolean): BetterHTMLElement {
        console.warn(`${this}.clone() doesnt return a matching BHE subtype, but a regular BHE`);
        // TODO: return new this()?
        return new BetterHTMLElement({ htmlElement: this._htmlElement.cloneNode(deep) as HTMLElement });
    }

    /**
     * Stores existing child nodes in `this` as BHE's so they can be accessed via e.g. `navbar.home.class('selected')`.
     * @example
     * navbar.cacheChildren({ 'home': 'button.home' })
     * // or
     * maindiv.cacheChildren({ 'welcome': paragraph({ 'query': 'p.welcome' }) })
     * // `childrenObj` can be recursive and mixed, e.g.
     * navbar.cacheChildren({
     *      home: {
     *          'li.navbar-item-home': {
     *              thumbnail: 'img.home-thumbnail',
     *              expand: button({ byid: 'home_expand' })
     *          }
     *      }
     *  });
     * navbar.home.class("selected");
     * navbar.home.thumbnail.css(...);
     * navbar.home.expand.click( e => {...} )
     * @see this.child*/
    cacheChildren(childrenObj: ChildrenObj): this {
        for (let [key, value] of enumerate(childrenObj)) {
            let type = typeof value;
            if (isObject(value)) { // don't use with isTMap
                if (value instanceof BetterHTMLElement) {
                    // { "myimg": img(...) }
                    this._cache(key, value)
                } else if (value instanceof HTMLElement) {
                    const bhe = this._cls().wrapWithBHE(value)
                    this._cache(key, bhe);
                } else {
                    // { "mydiv": {
                    //      "myimg": img(...),
                    //      "myinput": input(...)
                    //   }
                    // }
                    let entries = Object.entries(value);
                    if (entries[1] !== undefined) {
                        console.warn(
                            `${this}.cacheChildren() received recursive obj with more than 1 selector for a key. Using only 0th selector`, {
                                key,
                                entries,
                                value,
                                this: this
                            }
                        );
                    }
                    let [selector, obj] = entries[0];
                    if (isFunction(obj)) {
                        // bhe constructor
                        let bhe = this.child(selector, obj);
                        this._cache(key, bhe);
                    } else {
                        this._cache(key, this.child(selector));
                        this[key].cacheChildren(obj);
                    }
                }
            } else if (type === "string") {

                let match = /<(\w+)>$/.exec(value as string); // <option>

                if (match) {
                    // { "options": "<option>" }
                    let tagName = match[1] as Tag;

                    // const htmlElements = [...this._htmlElement.getElementsByTagName(tagName)] as HTMLElementTagNameMap[typeof tagName][];
                    const htmlElements = Array.from(this._htmlElement.getElementsByTagName(tagName)) as Array<HTMLElementTagNameMap[typeof tagName]>;
                    let bhes = [];
                    for (let htmlElement of htmlElements) {
                        bhes.push(this._cls().wrapWithBHE(htmlElement));
                    }
                    this._cache(key, bhes);
                } else {
                    // { "myinput": "input[type=checkbox]" }
                    this._cache(key, this.child(value as string));
                }
            } else {
                console.warn(`${this}.cacheChildren(), bad value: ${value} (${type}). key: "${key}", childrenObj:`, childrenObj,);
            }
        }
        return this;

    }

    /**Remove all children from DOM*/
    empty(): this {

        while (this._htmlElement.firstChild) {
            this._htmlElement.removeChild(this._htmlElement.firstChild);
        }
        return this;
    }

    /**Remove element from DOM*/
    remove(): this {
        this._htmlElement.remove();
        return this;
    }


    // *** Events
    on(evTypeFnPairs: SMap<EventName2Function>, options?: AddEventListenerOptions): this {
        // const foo = evTypeFnPairs["abort"];
        for (let [evType, evFn] of enumerate(evTypeFnPairs)) {
            const _f = function _f(evt) {
                evFn(evt);
            };
            this._htmlElement.addEventListener(evType, _f, options);
            this._listeners[evType] = _f;
        }
        return this;
    }

    /*
    Chronology:
	mousedown   touchstart	pointerdown
	mouseenter		        pointerenter
	mouseleave		        pointerleave
	mousemove	touchmove	pointermove
	mouseout		        pointerout
	mouseover		        pointerover
	mouseup	    touchend    pointerup
	*/
    /** Add a `touchstart` event listener. This is the fast alternative to `click` listeners for mobile (no 300ms wait). */
    touchstart(fn: (ev: TouchEvent) => any, options?: AddEventListenerOptions): this {
        this._htmlElement.addEventListener('touchstart', function _f(ev: TouchEvent) {
            ev.preventDefault(); // otherwise "touchmove" is triggered
            fn(ev);
            if (options && options.once) // TODO: maybe native options.once is enough
            {
                this.removeEventListener('touchstart', _f);
            }
        }, options);
        // TODO: this._listeners, or use this.on(
        return this;
    }

    /** Add a `pointerdown` event listener if browser supports `pointerdown`, else send `mousedown` (safari). */
    pointerdown(fn: (event: PointerEvent | MouseEvent) => any, options?: AddEventListenerOptions): this {

        let action;
        try {
            // TODO: check if PointerEvent exists instead of try/catch
            // @ts-ignore
            action = window.PointerEvent ? 'pointerdown' : 'mousedown'; // safari doesn't support pointerdown
        } catch (e) {
            action = 'mousedown'
        }
        const _f = function _f(ev: PointerEvent | MouseEvent): void {
            ev.preventDefault();
            fn(ev);
            if (options && options.once) // TODO: maybe native options.once is enough
            {
                this.removeEventListener(action, _f);
            }
        };
        this._htmlElement.addEventListener(action, _f, options);
        this._listeners.pointerdown = _f;
        return this;
    }

    /**Simulate a click of the element. Useful for `<a>` elements.*/
    click(): this;

    /**Add a `click` event listener. You should probably use `pointerdown()` if on desktop, or `touchstart()` if on mobile.*/
    click(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;

    click(fn?, options?) {
        if (fn === undefined) {
            this._htmlElement.click();
            return this;
        } else {
            return this.on({ click: fn }, options);
        }
    }

    /**Blur (unfocus) the element.*/
    blur(): this;

    /**Add a `blur` event listener*/
    blur(fn: (event: FocusEvent) => any, options?: AddEventListenerOptions): this;

    blur(fn?, options?) {
        if (fn === undefined) {
            this._htmlElement.blur();
            return this;
        } else {
            return this.on({ blur: fn }, options)
        }
    }

    /**Focus the element.*/
    focus(): this;

    /**Add a `focus` event listener*/
    focus(fn: (event: FocusEvent) => any, options?: AddEventListenerOptions): this;

    focus(fn?, options?) {
        if (fn === undefined) {
            this._htmlElement.focus();
            return this;
        } else {
            return this.on({ focus: fn }, options)
        }
    }

    /**Add a `change` event listener*/
    change(fn: (event: Event) => any, options?: AddEventListenerOptions): this {
        return this.on({ change: fn }, options);
    }

    /**Add a `contextmenu` event listener*/
    contextmenu(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this {
        return this.on({ contextmenu: fn }, options);
    }

    /**Simulate a double click of the element.*/
    dblclick(): this;

    /**Add a `dblclick` event listener*/
    dblclick(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;

    dblclick(fn?, options?) {
        if (fn === undefined) {
            const dblclick = new MouseEvent('dblclick', {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });
            this._htmlElement.dispatchEvent(dblclick);
            return this;
        } else {
            return this.on({ dblclick: fn }, options)
        }
    }

    /**Simulate a mouseenter event to the element.*/
    mouseenter(): this;

    /**Add a `mouseenter` event listener*/
    mouseenter(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;

    mouseenter(fn?, options?) {
        // mouseover: also child elements
        // mouseenter: only bound element

        if (fn === undefined) {
            const mouseenter = new MouseEvent('mouseenter', {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });
            this._htmlElement.dispatchEvent(mouseenter);
            return this;
        } else {
            return this.on({ mouseenter: fn }, options)
        }
    }

    /**Add a `keydown` event listener*/
    keydown(fn: (event: KeyboardEvent) => any, options?: AddEventListenerOptions): this {
        return this.on({ keydown: fn }, options)
    }

    /**Add a `mouseout` event listener*/
    mouseout(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this {
        //mouseleave and mouseout are similar but differ in that mouseleave does not bubble and mouseout does.
        // This means that mouseleave is fired when the pointer has exited the element and all of its descendants,
        // whereas mouseout is fired when the pointer leaves the element or leaves one of the element's descendants
        // (even if the pointer is still within the element).
        return this.on({ mouseout: fn }, options)
    }

    /**Add a `mouseover` event listener*/
    mouseover(fn: (event: MouseEvent) => void, options?: AddEventListenerOptions): this {
        // mouseover: also child elements
        // mouseenter: only bound element
        // return this.on({mouseover: fn}, options)
        return this.on({ mouseover: fn })
    }

    /** Remove the event listener of `event`, if exists.*/
    off(event: keyof HTMLElementEventMap): this {
        // TODO: Should remove listener from this._listeners?
        this._htmlElement.removeEventListener(event, this._listeners[event]);
        return this;
    }

    /** Remove all event listeners in `_listeners`*/
    allOff(): this {

        for (let i = 0; i < Object.keys(this._listeners).length; i++) {
            let event = this._listeners[i];
            this.off(event);
        }

        return this;
    }

    // *** Attributes

    /** apply `getAttribute`*/
    attr(attributeName: string): string
    /** For each `[attr, val]` pair, apply `setAttribute`*/
    attr(attrValPairs: SMap<string | boolean | number>): this
    attr(attrValPairs) {
        if (typeof attrValPairs === 'string') {
            return this._htmlElement.getAttribute(attrValPairs);
        } else {
            for (let [attr, val] of enumerate(attrValPairs as SMap)) {
                this._htmlElement.setAttribute(attr, <string>val);
            }
            return this;
        }
    }


    /** `removeAttribute` */
    removeAttr(qualifiedName: string, ...qualifiedNames: string[]): this {
        let _removeAttribute;
        if (this._isSvg) {
            _removeAttribute = (qualifiedName) => this._htmlElement.removeAttributeNS(SVG_NS_URI, qualifiedName);
        } else {
            _removeAttribute = (qualifiedName) => this._htmlElement.removeAttribute(qualifiedName);
        }

        _removeAttribute(qualifiedName);
        for (let qn of qualifiedNames) {
            _removeAttribute(qn);
        }
        return this;
    }

    /**`getAttribute(`data-${key}`)`. JSON.parse it by default.*/
    getdata(key: string, parse: boolean = true): string | TMap<string> {
        // TODO: jquery doesn't affect data-* attrs in DOM. https://api.jquery.com/data/
        const data = this._htmlElement.getAttribute(`data-${key}`);

        if (parse === true) {
            return JSON.parse(data);
        } else {
            return data
        }
    }

    private _cache(key, child: BetterHTMLElement | BetterHTMLElement[]): void {
        if (!child) {
            console.warn(`${this}._cache(key: "${key}") | 'child' is ${child} (${typeof child}). Not caching anything.`);
            return
        }
        const oldchild = this._cachedChildren[key];
        if (oldchild !== undefined) {
            const warnmsgs = [`${this}._cache() | Overwriting this._cachedChildren[${key}]!`,
                `old child: ${oldchild}`,
                `new child: ${child}`,
            ];
            const oldchildIsArray = Array.isArray(oldchild);
            const childIsArray = Array.isArray(child);
            if (oldchildIsArray && childIsArray) {
                warnmsgs.push(`equal(oldchild, child): ${equal(oldchild, child)}`)

            } else if (oldchildIsArray === childIsArray) { // neither is an array
                warnmsgs.push(
                    `oldchild == child: ${oldchild == child}`,
                    // @ts-ignore
                    `oldchild.isEqualNode(child): ${oldchild.isEqualNode(child)}`, `oldchild.isSameNode(child): ${oldchild.isSameNode(child)}`,
                )
            }
            console.warn(...warnmsgs);
        }
        this[key] = child;
        this._cachedChildren[key] = child;
    }


}

export class Div<Q extends QuerySelector = QuerySelector> extends BetterHTMLElement<HTMLDivElement> {
    /**Create a HTMLDivElement. Optionally, set its `text`, `cls` or `id`. */
    constructor({ cls, setid, text }: { cls?: string, setid?: string, text?: string });
    /**Create a HTMLDivElement. Optionally, set its `html`, `cls` or `id`. */
    constructor({ cls, setid, html }: { cls?: string, setid?: string, html?: string });
    /**Wrap an existing element by `byid`. Optionally cache existing `children`*/
    constructor({ byid, children }: { byid: string, children?: ChildrenObj });
    /**Wrap an existing element by `query`. Optionally cache existing `children`*/
    constructor({ query, children }: { query: QueryOrPreciseTag<Q, "div">, children?: ChildrenObj });
    /**Wrap an existing HTMLElement. Optionally cache existing `children`*/
    constructor({ htmlElement, children }: { htmlElement: HTMLDivElement; children?: ChildrenObj });
    constructor(divOpts) {
        const { setid, cls, text, html, byid, query, htmlElement, children } = divOpts;
        if (text !== undefined && html !== undefined) {
            throw new MutuallyExclusiveArgs({ text, html })
        }
        if (htmlElement !== undefined) {
            super({ htmlElement, children });
        } else if (byid !== undefined) {
            super({ byid, children });
        } else if (query !== undefined) {
            super({ query, children });
        } else {
            super({ tag: "div", setid, cls, html });
            if (text !== undefined) {
                this.text(text);
            }

        }
    }

}

export class Paragraph extends BetterHTMLElement<HTMLParagraphElement> {

    constructor(pOpts) {
        // if (noValue(arguments[0])) {
        //     throw new NotEnoughArgs([1], arguments[0])
        // }
        const { setid, cls, text, html, byid, query, htmlElement, children } = pOpts;
        if (text !== undefined && html !== undefined) {
            throw new MutuallyExclusiveArgs({ text, html })
        }
        if (htmlElement !== undefined) {
            super({ htmlElement, children });
        } else if (byid !== undefined) {
            super({ byid, children });
        } else if (query !== undefined) {
            super({ query, children });
        } else {
            super({ tag: "p", setid, cls, html });
            if (text !== undefined) {
                this.text(text);
            }
        }
    }
}

export class Span extends BetterHTMLElement<HTMLSpanElement> {


    constructor({ cls, setid, text }: { cls?: string, setid?: string, text?: string })
    constructor({ cls, setid, html }: { cls?: string, setid?: string, html?: string })
    constructor({ byid, children }: { byid: string, children?: ChildrenObj })
    constructor({ query, children }: {
        query: string,
        children?: ChildrenObj
    })
    constructor({ htmlElement, children }: {
        htmlElement: HTMLSpanElement;
        children?: ChildrenObj
    })
    constructor(spanOpts) {
        const { setid, cls, text, html, byid, query, htmlElement, children } = spanOpts;
        if (text !== undefined && html !== undefined) {
            throw new MutuallyExclusiveArgs({ text, html })
        }
        if (htmlElement !== undefined) {
            super({ htmlElement, children });
        } else if (byid !== undefined) {
            super({ byid, children });
        } else if (query !== undefined) {
            super({ query, children });
        } else {
            super({ tag: "span", setid, cls, html });
            if (text !== undefined) {
                this.text(text);
            }
        }

    }
}

export class Img<Q extends QuerySelector = QuerySelector> extends BetterHTMLElement<HTMLImageElement> {


    constructor({ cls, setid, src }: {
        cls?: string, setid?: string,
        src?: string
    });
    constructor({ byid, children }: {
        byid: string, children?: ChildrenObj
    });
    constructor({ query, children }: {
        query: QueryOrPreciseTag<Q, "img">,
        children?: ChildrenObj
    });
    constructor({ htmlElement, children }: {
        htmlElement: HTMLImageElement;
        children?: ChildrenObj
    })
    constructor();
    constructor(imgOpts?) {
        const { cls, setid, src, byid, query, htmlElement, children } = imgOpts;
        if (htmlElement !== undefined) {
            super({ htmlElement, children });
        } else if (byid !== undefined) {
            super({ byid, children });
        } else if (query !== undefined) {
            super({ query, children });
        } else {
            super({ tag: "img", setid, cls });
            if (src !== undefined) {
                this.src(src);
            }
        }

    }

    src(src: string): this;
    src(): string;
    src(src?) {
        if (src === undefined) {
            return this._htmlElement.src
        } else {
            this._htmlElement.src = src;
            return this;
        }
    }


}

export class Anchor extends BetterHTMLElement<HTMLAnchorElement> {


    constructor({ setid, cls, text, html, href, target, byid, query, htmlElement, children }) {
        if (text !== undefined && html !== undefined) {
            throw new MutuallyExclusiveArgs({ text, html })
        }
        if (htmlElement !== undefined) {
            super({ htmlElement, children });
        } else if (byid !== undefined) {
            super({ byid, children });
        } else if (query !== undefined) {
            super({ query, children });
        } else {
            super({ tag: "a", setid, cls, html });
            if (text !== undefined) {
                this.text(text);
            }
            if (href !== undefined) {
                this.href(href);
            }
            if (target !== undefined) {
                this.target(target);
            }
        }

    }

    href(): string
    href(val: string): this
    href(val?) {
        if (val === undefined) {
            return this.attr('href');
        } else {
            return this.attr({ href: val })
        }
    }

    target(): string
    target(val: string): this
    target(val?) {
        if (val === undefined) {
            return this.attr('target');
        } else {
            return this.attr({ target: val })
        }
    }
}


type FormishHTMLElement = HTMLButtonElement | HTMLInputElement | HTMLSelectElement;
type InputType = "checkbox" | "number" | "radio" | "text" | "time" | "datetime-local"

abstract class Form<Generic extends FormishHTMLElement>
    extends BetterHTMLElement<Generic> {
    get disabled(): boolean {
        return this._htmlElement.disabled;
    }

    /**
     Button < Input
     Select - Input: add(), item(), length, namedItem(), options, remove(), selectedIndex, selectedOptions, ITERATOR
     Select - Button: add() autocomplete item() length multiple namedItem() options remove() required selectedIndex selectedOptions size ITERATOR
     Button - Select: formAction formEnctype formMethod formNoValidate formTarget

     Input uniques:
     accept checked defaultChecked defaultValue dirName files indeterminate list max maxLength min minLength pattern placeholder readOnly select() selectionDirection selectionEnd selectionStart setRangeText() setSelectionRange() src step stepDown() stepUp() useMap valueAsDate valueAsNumber

     Select uniques:
     add() item() length namedItem() options remove() selectedIndex selectedOptions ITERATOR

     Shared among Button, Select and Input: (or Button and Select, same)
     checkValidity() disabled form labels name reportValidity() setCustomValidity() type validationMessage validity value willValidate

     Shared ammong Selecct and Input:
     autocomplete checkValidity() disabled form labels multiple name reportValidity() required setCustomValidity() type validationMessage validity value willValidate

     */
    disable(): this {
        this._htmlElement.disabled = true;
        return this;
    }

    enable(): this {
        this._htmlElement.disabled = false;
        return this;
    }

    /**Disables.*/
    toggleEnabled(on: null | undefined | 0): this
    /**Calls `enable()` or `disable()` accordingly. */
    toggleEnabled(on: boolean): this
    /**Enables if `on` is truthy, otherwise disables.
     Errors if `on` is non-primitive (object, array).*/
    toggleEnabled(on): this {
        if (isObject(on)) {
            this._onEventError(new BHETypeError({ faultyValue: { on }, expected: "primitive", where: "toggleEnabled()" }));
            return this
        }
        if (bool(on)) {
            return this.enable()
        } else {
            return this.disable()
        }
    }

    /**Returns undefined if `_htmlElement.value` is null or undefined, otherwise returns `_htmlElement.value`*/
    value(): any;
    /**Returns undefined if `_htmlElement.value` is null or undefined, otherwise returns `_htmlElement.value`*/
    value(val: undefined): any;
    /**Resets `value`. */
    value(val: null | ''): this;
    /**Sets `value` */
    value(val: any): this;
    value(val?) {
        if (val === undefined) {
            return this._htmlElement.value ?? undefined;
        } else {
            if (isObject(val)) {
                this._onEventError(new BHETypeError({ faultyValue: { val }, expected: "primitive", where: "value()" }));
                return this;
            }
            this._htmlElement.value = val;
            return this;
        }
    }


    clear(): this {
        return this.value(null)
    }


    // ** Event Hooks
    /**This hook is invoked before the function that is passed to an event listener (such as `click`) is called.*/
    _beforeEvent(thisArg?: this): this {
        let self = thisArg ?? this;
        if (!self) {
            console.warn(`_beforeEvent(thisArg?): this is ${this} and thisArg is ${thisArg}. This probably means _beforeEvent() was used statically and thisArg wasn't given.`)
        }
        return self.disable()
    }

    /**When the function that is passed to an event listener (such as `click`) returns successfully, this hook is invoked.*/
    _onEventSuccess(thisArg?: this): this {
        let self = thisArg ?? this;
        if (!self) {
            console.warn(`_onEventSuccess(thisArg?): this is ${this} and thisArg is ${thisArg}. This probably means _onEventSuccess() was used statically and thisArg wasn't given.`)
        }
        return self
    }

    /**When the function that is passed to an event listener (such as `click`) throws an error, this hook is invoked.
     * Logs shortly-formatted `error` to console.*/
    async _onEventError(error: Error, thisArg?: this): Promise<this> {
        console.error(`${error.name}:\n${error.message}`);
        let self = thisArg ?? this;
        if (!self) {
            console.warn(`_onEventError(e: Error, thisArg?): this is ${this} and thisArg is ${thisArg}. This probably means _onEventError() was used statically and thisArg wasn't given.`)
        }
        return self
    }


    /**This hook is always invoked, regardless of whether the function passed to an event listener (such as `click`) succeeds or fails.*/
    _afterEvent(thisArg?: this): this {
        let self = thisArg ?? this;
        if (!self) {
            console.warn(`_afterEvent(e: Error, thisArg?): this is ${this} and thisArg is ${thisArg}. This probably means _afterEvent() was used statically and thisArg wasn't given.`)
        }
        return self.enable();
    }

    /**Used by event listeners, such as `click(fn)`, to wrap passed `fn`. Installs the following hooks:
     | Hook                        | When                                                                                                  |
     | :-------------------------- | :---------------------------------------------------------------------------------------------------- |
     | `this._beforeEvent()`       | Before calling `asyncFn(event)`                                                                       |
     | `this._onEventSuccess()`    | When `asyncFn(event)` has been awaited successfully                                                   |
     | `this._onEventError(error)` | When `asyncFn(event)` has thrown an error                                                             |
     | `this._afterEvent()`        | When an event listener is about to return, regardless of whether `asyncFn(event)` succeeded or failed |
     * */
    protected async _wrapFnInEventHooks<F extends (event: Event) => Promise<any>>(asyncFn: F, event: Event): Promise<void> {
        try {
            this._beforeEvent();
            const returnval = await asyncFn(event);
            await this._onEventSuccess(returnval);

        } catch (e) {
            await this._onEventError(e);

        } finally {
            this._afterEvent();
        }
    }
}


export class Button<Q extends QuerySelector = QuerySelector> extends Form<HTMLButtonElement> {
    constructor({ cls, setid, text, click }: {
        cls?: string, setid?: string, text?: string, click?: (event: MouseEvent) => any
    });
    constructor({ cls, setid, html, click }: {
        cls?: string, setid?: string, html?: string, click?: (event: MouseEvent) => any
    });
    constructor({ byid, children }: {
        byid: string, children?: ChildrenObj
    });
    constructor({ query, children }: {
        query: QueryOrPreciseTag<Q, "button">,
        children?: ChildrenObj
    })
    constructor({ htmlElement, children }: {
        htmlElement: HTMLButtonElement;
        children?: ChildrenObj
    })
    constructor();
    constructor(buttonOpts?) {
        const { setid, cls, text, html, byid, query, htmlElement, children, click } = buttonOpts;
        if (text !== undefined && html !== undefined) {
            throw new MutuallyExclusiveArgs({ text, html })
        }
        if (htmlElement !== undefined) {
            super({ htmlElement, children });
        } else if (byid !== undefined) {
            super({ byid, children });
        } else if (query !== undefined) {
            super({ query, children });
        } else {
            super({ tag: "button", setid, cls, html });
            if (text !== undefined) {
                this.text(text);
            }
            if (click !== undefined) {
                this.click(click);
            }

        }

    }

    click(_fn?: (_event: MouseEvent) => Promise<any>): this {
        if (_fn) {
            const fn = async (event) => {
                await this._wrapFnInEventHooks(_fn, event);
            };

            return super.click(fn);
        }
        return super.click()
    }


}

export class Input<TInputType extends InputType,
    Generic extends FormishHTMLElement = HTMLInputElement,
    Q extends QuerySelector = QuerySelector>
    extends Form<Generic> {
    type: TInputType;

    constructor({ cls, setid, type }: {
        cls?: string, setid?: string,
        type?: TInputType
    });

    constructor({ byid, children }: { byid: string, children?: ChildrenObj });
    constructor({ query, children }: {
        query: QueryOrPreciseTag<Q, "input">,
        children?: ChildrenObj
    });

    constructor({ htmlElement, children }: {
        htmlElement: Generic;
        children?: ChildrenObj
    });

    constructor();
    constructor(inputOpts?) {
        const { setid, cls, type, byid, query, htmlElement, children } = inputOpts;


        if (htmlElement !== undefined) {
            super({ htmlElement, children });
        } else if (byid !== undefined) {
            super({ byid, children });
        } else if (query !== undefined) {
            super({ query, children });
        } else {
            super({ tag: "input" as Element2Tag<Generic>, cls, setid });
            if (type !== undefined) {
                // @ts-ignore
                // noinspection JSConstantReassignment
                this._htmlElement.type = type;
            }
        }


    }


}

export class TextInput<Q extends QuerySelector = QuerySelector> extends Input<"text"> {
    constructor({ cls, setid, placeholder }: {
        cls?: string, setid?: string,
        placeholder?: string
    });

    constructor({ byid, children }: { byid: string, children?: ChildrenObj });
    constructor({ query, children }: {
        query: QueryOrPreciseTag<Q, "input">,
        children?: ChildrenObj
    });

    constructor({ htmlElement, children }: {
        htmlElement: HTMLInputElement;
        children?: ChildrenObj
    });

    constructor();
    constructor(opts?) {
        opts.type = 'text';
        super(opts);
        const { placeholder } = opts;
        if (placeholder !== undefined) {
            this.placeholder(placeholder);
        }
    }

    placeholder(val: string): this;
    placeholder(): string;
    placeholder(val?) {
        if (val === undefined) {
            return this._htmlElement.placeholder;
        } else {
            this._htmlElement.placeholder = val;
            return this;
        }

    }


    keydown(_fn: (_event: KeyboardEvent) => Promise<any>): this {
        const fn = async (event) => {
            await this._wrapFnInEventHooks(_fn, event);
        };
        return super.keydown(fn);
    }
}

export class Changable<TInputType extends InputType, Generic extends FormishHTMLElement> extends Input<TInputType, Generic> {
    change(_fn: (_event: Event) => Promise<any>): this {

        const fn = async (event) => {
            await this._wrapFnInEventHooks(_fn, event);
        };
        return super.change(fn);
    }
}

/**Patches Form's `value()` to set/get `_htmlElement.checked`, and `clear()` to uncheck. */
export class CheckboxInput extends Changable<"checkbox", HTMLInputElement> {
    constructor(opts) {
        opts.type = 'checkbox';
        super(opts);
    }

    get checked(): boolean {
        return this._htmlElement.checked;
    }


    check(): this {
        this._htmlElement.checked = true;
        return this;
    }

    uncheck(): this {
        this._htmlElement.checked = false;
        return this;
    }


    /**Disables.*/
    toggleChecked(on: null | undefined | 0): this
    /**Calls `check()` or `uncheck()` accordingly. */
    toggleChecked(on: boolean): this

    /**checks on if `on` is truthy, otherwise unchecks.
     Errors if `on` is non-primitive (object, array).*/
    toggleChecked(on) {
        if (isObject(on)) {
            this._onEventError(new BHETypeError({ faultyValue: { on }, expected: "primitive", where: "toggleChecked()" }));
            return this
        }
        if (bool(on)) {
            return this.check()
        } else {
            return this.uncheck()
        }
    }

    /**Returns undefined if `_htmlElement.value` is null or undefined, otherwise returns `_htmlElement.value`*/
    value(): any;
    /**Returns undefined if `_htmlElement.value` is null or undefined, otherwise returns `_htmlElement.value`*/
    value(val: undefined): any;
    /**Resets `value`. */
    value(val: null | ''): this;
    /**Sets `value` */
    value(val: any): this;
    value(val?) {
        if (val === undefined) {
            return this._htmlElement.checked ?? undefined;
        } else {
            if (isObject(val)) {
                this._onEventError(new BHETypeError({ faultyValue: { val }, expected: "primitive", where: "value()" }));
            }
            this._htmlElement.checked = val;
            return this;
        }
    }

    clear() {
        return this.uncheck();
    }

    async _onEventError(e: Error, thisArg?: this): Promise<this> {
        this.toggleChecked(!this.checked);
        return super._onEventError(e);
    }
}


export class Select extends Changable<undefined, HTMLSelectElement> {

    // Select uniques:
    // add() item() length namedItem() options remove() selectedIndex selectedOptions ITERATOR
    constructor(selectOpts) {
        super(selectOpts);
    }

    get selectedIndex(): number {
        return this._htmlElement.selectedIndex
    }

    set selectedIndex(val: number) {
        this._htmlElement.selectedIndex = val
    }

    get selected(): HTMLOptionElement {
        return this.item(this.selectedIndex)
    }

    /**@param val - Either a specific HTMLOptionElement, number (index).
     * Sets `this.selectedIndex`.
     * @see this.selectedIndex*/
    set selected(val) {
        if (val instanceof HTMLOptionElement) {
            let index = this.options.findIndex(o => o === val);
            if (index === -1) {
                console.warn(`set selected(val): given val was not found in this.options.\n val: ${prettyNode(val)}\nthis.options (${this.options.length}): ${this.options.map(prettyNode)}`)
            }
            this.selectedIndex = index;
        } else if (typeof val === 'number') {
            this.selectedIndex = val
        } else {
            this.selectedIndex = this.options.findIndex(o => o.value === val);
        }

    }

    get options(): HTMLOptionElement[] {
        return [...this._htmlElement.options as unknown as Array<HTMLOptionElement>]
    }

    item(index: number): HTMLOptionElement {
        return this._htmlElement.item(index) as HTMLOptionElement
    }

    /**Returns undefined if `this.selected.value` is null or undefined, otherwise returns `this.selected.value`*/
    value(): any;
    /**Returns undefined if `this.selected.value` is null or undefined, otherwise returns `this.selected.value`*/
    value(val: undefined): any;
    /**Resets `selected` to blank*/
    value(val: null | '' | boolean): this;
    /**Sets `selected` to `val` if finds a match */
    value(val: HTMLOptionElement | number | any): this;
    value(val?) {
        if (val === undefined) {
            return this.selected.value ?? undefined;
        } else {
            this.selected = val;
            return this;
        }
    }

    /**Sets `selected` to 0th element. Equivalent to `value(0)`.*/
    clear() {
        this.selectedIndex = 0;
        return this;
    }


    /*[Symbol.iterator]() {
        let options = this.options;
        let currentIndex = 0;
        return {
            next() {
                currentIndex += 1;
                return {
                    value: undefined,
                    done: true
                };

            }
        }
    }*/
}


/*customElements.define('better-html-element', BetterHTMLElement);
customElements.define('better-div', Div, {extends: 'div'});
customElements.define('better-input', Input, {extends: 'input'});
customElements.define('better-p', Paragraph, {extends: 'p'});
customElements.define('better-span', Span, {extends: 'span'});
customElements.define('better-img', Img, {extends: 'img'});
customElements.define('better-a', Anchor, {extends: 'a'});*/

// customElements.define('better-svg', Svg, {extends: 'svg'});

/**Create an element of `create`. Optionally, set its `text` and / or `cls`*/
export function elem<T extends Tag>({ tag, cls, setid, html }: { tag: T, cls?: string, setid?: string, html?: string }):
    T extends Tag ? BetterHTMLElement<HTMLElementTagNameMap[T]> : never;
/**Get an existing element by `id`. Optionally, set its `text`, `cls` or cache `children`*/
export function elem({ byid, children }: { byid: string, children?: ChildrenObj }):
    BetterHTMLElement;
/**Get an existing element by `query`. Optionally, set its `text`, `cls` or cache `children`*/
export function elem<Q extends QuerySelector>({ query, children }: { query: Q, children?: ChildrenObj }):
    Q extends Tag ? BetterHTMLElement<HTMLElementTagNameMap[Q]> : BetterHTMLElement;
/**Wrap an existing HTMLElement. Optionally, set its `text`, `cls` or cache `children`*/
export function elem<E extends HTMLElement>({ htmlElement, children }: { htmlElement: E; children?: ChildrenObj }):
    BetterHTMLElement<E>;

export function elem(elemOptions) {
    return new BetterHTMLElement(elemOptions);
}


export function span({ cls, setid, text }: { cls?: string, setid?: string, text?: string }): Span;
export function span({ cls, setid, html }: { cls?: string, setid?: string, html?: string }): Span;
export function span({ byid, children }: { byid: string, children?: ChildrenObj }): Span;
export function span<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "span">,
    children?: ChildrenObj
}): Span;
export function span<E extends HTMLSpanElement>({ htmlElement, children }: {
    htmlElement: E;
    children?: ChildrenObj
}): Span;
export function span(): Span
export function span(spanOpts?): Span {
    if (!bool(spanOpts)) {
        spanOpts = {}
    }
    return new Span(spanOpts)
}

/**Create a Div element, or wrap an existing one by passing htmlElement. Optionally set its id, text or cls.*/
export function div({ cls, setid, text }: {
    cls?: string, setid?: string, text?: string
}): Div;
export function div({ cls, setid, html }: {
    cls?: string, setid?: string, html?: string
}): Div;
export function div({ byid, children }: {
    byid: string, children?: ChildrenObj
}): Div;
export function div<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "div">,
    children?: ChildrenObj
}): Div;
export function div({ htmlElement, children }: {
    htmlElement: HTMLDivElement;
    children?: ChildrenObj
}): Div;
export function div(): Div
export function div(divOpts?): Div {
    if (!bool(divOpts)) {
        divOpts = {}
    }
    return new Div(divOpts)
}


export function button({ cls, setid, text }: {
    cls?: string, setid?: string, text?: string, click?: (event: MouseEvent) => any
}): Button;
export function button({ cls, setid, html }: {
    cls?: string, setid?: string, html?: string, click?: (event: MouseEvent) => any
}): Button;
export function button({ byid, children }: {
    byid: string, children?: ChildrenObj
}): Button;
export function button<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "button">,
    children?: ChildrenObj
}): Button;
export function button({ htmlElement, children }: {
    htmlElement: HTMLButtonElement;
    children?: ChildrenObj
}): Button;
export function button(): Button
export function button(buttonOpts?): Button {
    if (!bool(buttonOpts)) {
        buttonOpts = {}
    }
    return new Button(buttonOpts)
}


export function input<TInputType extends InputType, Generic extends FormishHTMLElement = HTMLInputElement>({ cls, setid, type, placeholder }: {
    cls?: string, setid?: string,
    type?: TInputType,
    placeholder?: string
}): Input<TInputType, Generic>;
export function input<TInputType extends InputType = InputType, Generic extends FormishHTMLElement = HTMLInputElement>({ byid, children }: { byid: string, children?: ChildrenObj }): Input<TInputType, Generic>;
export function input<Q extends QuerySelector, TInputType extends InputType = InputType, Generic extends FormishHTMLElement = HTMLInputElement>({ query, children }: {
    query: QueryOrPreciseTag<Q, "input">,
    children?: ChildrenObj
}): Input<TInputType, Generic>;
export function input<TInputType extends InputType = InputType, Generic extends FormishHTMLElement = HTMLInputElement>({ htmlElement, children }: {
    htmlElement: Generic;
    children?: ChildrenObj
}): Input<TInputType, Generic>;
export function input<TInputType extends InputType = InputType, Generic extends FormishHTMLElement = HTMLInputElement>(): Input<TInputType, Generic>
export function input(inputOpts?) {
    if (!bool(inputOpts)) {
        inputOpts = {}
    }
    return new Input(inputOpts)
}

export function select(selectOpts): Select {
    if (!bool(selectOpts)) {
        selectOpts = {}
    }
    return new Select(selectOpts)
}

/**Create an Img element, or wrap an existing one by passing htmlElement. Optionally set its id, src or cls.*/
export function img({ cls, setid, src }: {
    cls?: string, setid?: string,
    src?: string
}): Img;
export function img({ byid, children }: {
    byid: string, children?: ChildrenObj
}): Img;
export function img<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "img">,
    children?: ChildrenObj
}): Img;
export function img({ htmlElement, children }: {
    htmlElement: HTMLImageElement;
    children?: ChildrenObj
}): Img;
export function img(): Img
export function img(imgOpts?): Img {
    if (!bool(imgOpts)) {
        imgOpts = {}
    }
    return new Img(imgOpts)
}


export function paragraph({ cls, setid, text }: { cls?: string, setid?: string, text?: string }): Paragraph;
export function paragraph({ cls, setid, html }: { cls?: string, setid?: string, html?: string }): Paragraph;
export function paragraph({ byid, children }: { byid: string, children?: ChildrenObj }): Paragraph;
export function paragraph<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "p">,
    children?: ChildrenObj
}): Paragraph;
export function paragraph({ htmlElement, children }: {
    htmlElement: HTMLParagraphElement;
    children?: ChildrenObj
}): Paragraph;
export function paragraph(): Paragraph
export function paragraph(pOpts?): Paragraph {
    if (!bool(pOpts)) {
        pOpts = {}
    }
    return new Paragraph(pOpts)
}

export function anchor({ cls, setid, href, target, text }: {
    cls?: string,
    setid?: string,
    href?: string
    target?: string,
    text?: string,
}): Anchor;
export function anchor({ cls, setid, href, target, html }: {
    cls?: string,
    setid?: string,
    href?: string
    target?: string,
    html?: string,
}): Anchor;
export function anchor({ byid, children }: {
    byid: string, children?: ChildrenObj
}): Anchor;
export function anchor<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "a">,
    children?: ChildrenObj
}): Anchor;
export function anchor({ htmlElement, children }: {
    htmlElement: HTMLAnchorElement;
    children?: ChildrenObj
}): Anchor;
export function anchor(): Anchor
export function anchor(anchorOpts?): Anchor {
    if (!bool(anchorOpts)) {
        anchorOpts = {}
    }
    return new Anchor(anchorOpts)
}



