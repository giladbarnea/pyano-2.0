interface TMap<T = any> {
    [s: string]: T;
    [s: number]: T;
}
interface SMap<T = any> {
    [s: string]: T;
}
interface NMap<T = any> {
    [s: number]: T;
}
interface RecMap<T = any> {
    [s: string]: T | RecMap<T>;
    [s: number]: T | RecMap<T>;
}
declare type _EventName = keyof HTMLElementEventMap;
declare type EventName2Function<E extends _EventName = _EventName> = {
    [P in _EventName]?: (event: HTMLElementEventMap[P]) => void;
}[E];
/**
 * "a", "div"
 * @example
 * const foo = (tag: Tag) => document.createElement(tag);
 * foo("a") // HTMLAnchorElement
 * foo("BAD") // error
 */
export declare type Tag = Exclude<keyof HTMLElementTagNameMap, "object">;
/**
 * @example
 * const foo = (tag: _NotTag<"input">) => document.createElement(tag);
 * foo("a") // HTMLAnchorElement
 * foo("input") // error
 * foo("BAD") // error
 */
declare type _NotTag<T extends Tag> = Exclude<Tag, T>;
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
declare type QueryOrPreciseTag<Q extends QuerySelector, T extends Tag> = Exclude<Q, QuerySelector<_NotTag<T>>>;
declare type _TagOrString = Tag | string;
/**
 * `"a"`, `"div"`, `"gilad"`.
 * QuerySelector expects a tag name (string) and returns a `Tag`.
 * @example
 * const foo = <K extends Tag | string>(query: QuerySelector<K>) => document.querySelector(query);
 * foo("a") // HTMLAnchorElement
 * foo("gilad") // HTMLSelectElement | HTMLLegendElement | ...
 * @see Tag
 */
export declare type QuerySelector<K extends _TagOrString = _TagOrString> = K extends Tag ? K : string;
/**
 * @example
 * const foo: Element2Tag<HTMLInputElement> = "input"  // ok
 * const bar: Element2Tag<HTMLInputElement> = "img"  // ERROR
 */
export declare type Element2Tag<T> = {
    [K in keyof HTMLElementTagNameMap]: HTMLElementTagNameMap[K] extends T ? K : never;
}[keyof HTMLElementTagNameMap];
export declare type ChildrenObj = RecMap<QuerySelector | BetterHTMLElement | typeof BetterHTMLElement>;
export declare type Enumerated<T> = T extends (infer U)[] ? [i: number, item: U][] : T extends SMap<(infer U)> ? [key: string, value: U][] : T extends NMap<(infer U)> ? [key: number, value: U][] : T extends TMap<(infer U)> ? [key: keyof T, value: U][] : T extends RecMap<(infer U)> ? [key: keyof T, value: U][] : never;
declare type Returns<T> = (s: string) => T;
declare type NodeOrBHE = BetterHTMLElement | Node;
declare type ElementOrBHE = BetterHTMLElement | Element;
declare type OmittedCssProps = "animationDirection" | "animationFillMode" | "animationIterationCount" | "animationPlayState" | "animationTimingFunction" | "opacity" | "padding" | "paddingBottom" | "paddingLeft" | "paddingRight" | "paddingTop" | "preload" | "width";
declare type PartialCssStyleDeclaration = Omit<Partial<CSSStyleDeclaration>, OmittedCssProps>;
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
declare type CubicBezierFunction = [number, number, number, number];
declare type Jumpterm = 'jump-start' | 'jump-end' | 'jump-none' | 'jump-both' | 'start' | 'end';
/**Displays an animation iteration along n stops along the transition, displaying each stop for equal lengths of time.
 * For example, if n is 5,  there are 5 steps.
 * Whether the animation holds temporarily at 0%, 20%, 40%, 60% and 80%, on the 20%, 40%, 60%, 80% and 100%, or makes 5 stops between the 0% and 100% along the animation, or makes 5 stops including the 0% and 100% marks (on the 0%, 25%, 50%, 75%, and 100%) depends on which of the following jump terms is used*/
declare type StepsFunction = [number, Jumpterm];
declare type AnimationTimingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'step-start' | 'step-end' | StepsFunction | CubicBezierFunction;
declare type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
declare type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';
export declare function enumerate<T>(obj: T): Enumerated<T>;
export declare function wait(ms: number): Promise<any>;
export declare function bool(val: any): boolean;
export declare function copy<T>(obj: T): T;
/**
 `true` if objects have the same CONTENT. This means that order doesn't matter, but loose data structure does matter
 (i.e. if `a` an array, so should be `b`)
 @example
 > equal( [1,2], [2,1] )
 true

 */
export declare function equal(a: any, b: any): boolean;
export declare function isArray<T>(obj: any): obj is Array<T>;
export declare function isEmptyArr(collection: any): boolean;
export declare function isEmptyObj(obj: any): boolean;
export declare function isFunction<F extends Function>(fn: F): fn is F;
export declare function anyDefined(obj: Array<any> | TMap): boolean;
export declare function anyTruthy(obj: Array<any> | TMap): boolean;
export declare function allUndefined(obj: Array<any> | TMap): boolean;
export declare function prettyNode(node: NodeOrBHE): string;
export declare function isTMap<T>(obj: TMap<T>): obj is TMap<T>;
/**true for any non-primitive, including array, function*/
export declare function isObject(obj: any): boolean;
export declare function shallowProperty<T>(key: string): (obj: T) => T extends null ? undefined : T[keyof T];
export declare function getLength(collection: any): number;
export declare function getArgsFullRepr(argsWithValues: TMap<any>): string;
export declare function getArgsWithValues(passedArgs: TMap<any>): TMap<any>;
export declare function summary(argset: TMap<any>): string;
/**Prints what was expected and what was actually passed.*/
export declare class MutuallyExclusiveArgs extends Error {
    /**@param passedArgs - key:value pairs of argName:argValue, where each arg is mutually exclusive with all others*/
    constructor(passedArgs: TMap<any>, details?: string);
    /**@param passedArgs - Array of mutually exclusive sets of args, where an arg from one set means there can't be any args from the other sets.
     * Each set is key:value pairs of argName:argValue.*/
    constructor(passedArgs: TMap<any>[], details?: string);
}
export declare class NotEnoughArgs extends Error {
    constructor(expected: number | number[], passedArgs: TMap<any> | TMap<any>[], relation?: 'each' | 'either');
}
export declare class BHETypeError extends TypeError {
    constructor(options: {
        faultyValue: TMap<any>;
        expected?: any | any[];
        where?: string;
        message?: string;
    });
}
export declare class ValueError extends BHETypeError {
}
export declare class BetterHTMLElement<Generic extends HTMLElement = HTMLElement> {
    protected _htmlElement: Generic;
    private readonly _isSvg;
    private readonly _listeners;
    private _cachedChildren;
    /**Create an element of `tag`. Optionally, set its `cls` or `id`. */
    constructor({ tag, cls, setid, html }: {
        tag: Element2Tag<Generic>;
        cls?: string;
        setid?: string;
        html?: string;
    });
    /**Wrap an existing element by `byid`. Optionally cache existing `children`*/
    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });
    /**Wrap an existing element by `query`. Optionally cache existing `children`*/
    constructor({ query, children }: {
        query: QuerySelector;
        children?: ChildrenObj;
    });
    /**Wrap an existing HTMLElement. Optionally cache existing `children`*/
    constructor({ htmlElement, children }: {
        htmlElement: Generic;
        children?: ChildrenObj;
    });
    /**Return the wrapped HTMLElement*/
    get e(): Generic;
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
    toString(): any;
    /**Returns whether `this` and `otherNode` have the same properties.*/
    isEqualNode(otherNode: NodeOrBHE | null): boolean;
    /** Returns whether `this` and `otherNode` reference the same object*/
    isSameNode(otherNode: NodeOrBHE | null): boolean;
    /**Sets `this._htmlElement` to `newHtmlElement._htmlElement`.
     * Resets `this._cachedChildren` and caches `newHtmlElement._cachedChildren`.
     * Adds event listeners from `newHtmlElement._listeners`, while keeping `this._listeners`.*/
    wrapSomethingElse<T extends HTMLElement>(newHtmlElement: BetterHTMLElement<T>): this;
    /**Sets `this._htmlElement` to `newHtmlElement`.
     * Keeps `this._listeners`.
     * NOTE: this reinitializes `this._cachedChildren` and all event listeners belonging to `newHtmlElement` are lost. Pass a `BetterHTMLElement` to keep them.*/
    wrapSomethingElse(newHtmlElement: Node): this;
    /**Set the element's innerHTML*/
    html(html: string): this;
    /**Get the element's innerHTML*/
    html(): string;
    /**Set the element's innerText*/
    text(txt: string | number): this;
    /**Get the element's innerText*/
    text(): string;
    /**Set the id of the element*/
    id(id: string): this;
    /**Get the id of the element*/
    id(): string;
    /**For each `{<styleAttr>: <styleVal>}` pair, set the `style[styleAttr]` to `styleVal`.*/
    css(css: Partial<CssOptions>): this;
    /**Get `style[css]`*/
    css(css: string): string;
    /**Remove the value of the passed style properties*/
    uncss(...removeProps: (keyof CssOptions)[]): this;
    /**`.className = cls`*/
    class(cls: string): this;
    /**Return the first class that matches `cls` predicate.*/
    class(cls: Returns<boolean>): string;
    /**Return a string array of the element's classes (not a classList)*/
    class(): string[];
    addClass(cls: string, ...clses: string[]): this;
    removeClass(cls: Returns<boolean>, ...clses: Returns<boolean>[]): this;
    removeClass(cls: string, clses?: string[]): this;
    replaceClass(oldToken: Returns<boolean>, newToken: string): this;
    replaceClass(oldToken: string, newToken: string): this;
    toggleClass(cls: Returns<boolean>, force?: boolean): this;
    toggleClass(cls: string, force?: boolean): this;
    /**Returns `this._htmlElement.classList.contains(cls)` */
    hasClass(cls: string): boolean;
    /**Returns whether `this` has a class that matches passed function */
    hasClass(cls: Returns<boolean>): boolean;
    /**Insert `node`(s) just after `this`.
     * @see HTMLElement.after*/
    after(...nodes: Array<NodeOrBHE>): this;
    /**Insert `this` just after `node`.
     * @see HTMLElement.after*/
    insertAfter(node: ElementOrBHE): this;
    /**Insert `node`(s) after the last child of `this`.
     * Any `node` can be either a `BetterHTMLElement`, a vanilla `Node`,
     * a `{someKey: BetterHTMLElement}` pairs object, or a `[someKey, BetterHTMLElement]` tuple.*/
    append(...nodes: Array<NodeOrBHE | TMap<BetterHTMLElement> | [key: string, child: BetterHTMLElement]>): this;
    /**Append `this` to `node`.
     * @see HTMLElement.append*/
    appendTo(node: ElementOrBHE): this;
    /**Insert `node`(s) just before `this`.
     * @see HTMLElement.before*/
    before(...nodes: Array<NodeOrBHE>): this;
    /**Inserts `newChild` before `refChild` as a child of `this`.
     If `newChild` already exists in the document, it is moved from its current position to the new position.
     (That is, it will automatically be removed from its existing parent before appending it to the specified new parent.)*/
    insertBefore(newChild: NodeOrBHE, refChild: NodeOrBHE): this;
    removeChild<T extends HTMLElement>(oldChild: T | BetterHTMLElement<T>): BetterHTMLElement<T>;
    /**Inserts `nodes` before the first child of `this`*/
    prepend(...nodes: Array<NodeOrBHE>): this;
    /**Replaces `oldChild` with `newChild`, where parent is `this`.*/
    replaceChild(newChild: NodeOrBHE, oldChild: NodeOrBHE): this;
    /**Replaces `this` with `node`(s)*/
    replaceWith(...nodes: Array<NodeOrBHE>): this;
    insertAdjacentElement(position: InsertPosition, insertedElement: ElementOrBHE): BetterHTMLElement<HTMLElement>;
    /**For each `[key, child]` pair, `append(child)` and store it in `this[key]`. */
    cacheAppend(keyChildPairs: TMap<BetterHTMLElement>): this;
    /**For each `[key, child]` tuple, `append(child)` and store it in `this[key]`. */
    cacheAppend(keyChildPairs: [key: string, child: BetterHTMLElement][]): this;
    _cls(): typeof BetterHTMLElement;
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
    child<T extends typeof BetterHTMLElement>(selector: string, bheCtor: T): T;
    /**Return a `BetterHTMLElement` list of all children */
    children(): BetterHTMLElement[];
    /**Return a `BetterHTMLElement` list of all children selected by `selector` */
    children<K extends Tag>(selector: K): BetterHTMLElement[];
    /**Return a `BetterHTMLElement` list of all children selected by `selector` */
    children(selector: QuerySelector): BetterHTMLElement[];
    clone(deep?: boolean): BetterHTMLElement;
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
    cacheChildren(childrenObj: ChildrenObj): this;
    /**Remove all children from DOM*/
    empty(): this;
    /**Remove element from DOM*/
    remove(): this;
    on(evTypeFnPairs: SMap<EventName2Function>, options?: AddEventListenerOptions): this;
    /** Add a `touchstart` event listener. This is the fast alternative to `click` listeners for mobile (no 300ms wait). */
    touchstart(fn: (ev: TouchEvent) => any, options?: AddEventListenerOptions): this;
    /** Add a `pointerdown` event listener if browser supports `pointerdown`, else send `mousedown` (safari). */
    pointerdown(fn: (event: PointerEvent | MouseEvent) => any, options?: AddEventListenerOptions): this;
    /**Simulate a click of the element. Useful for `<a>` elements.*/
    click(): this;
    /**Add a `click` event listener. You should probably use `pointerdown()` if on desktop, or `touchstart()` if on mobile.*/
    click(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    /**Blur (unfocus) the element.*/
    blur(): this;
    /**Add a `blur` event listener*/
    blur(fn: (event: FocusEvent) => any, options?: AddEventListenerOptions): this;
    /**Focus the element.*/
    focus(): this;
    /**Add a `focus` event listener*/
    focus(fn: (event: FocusEvent) => any, options?: AddEventListenerOptions): this;
    /**Add a `change` event listener*/
    change(fn: (event: Event) => any, options?: AddEventListenerOptions): this;
    /**Add a `contextmenu` event listener*/
    contextmenu(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    /**Simulate a double click of the element.*/
    dblclick(): this;
    /**Add a `dblclick` event listener*/
    dblclick(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    /**Simulate a mouseenter event to the element.*/
    mouseenter(): this;
    /**Add a `mouseenter` event listener*/
    mouseenter(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    /**Add a `keydown` event listener*/
    keydown(fn: (event: KeyboardEvent) => any, options?: AddEventListenerOptions): this;
    /**Add a `mouseout` event listener*/
    mouseout(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    /**Add a `mouseover` event listener*/
    mouseover(fn: (event: MouseEvent) => void, options?: AddEventListenerOptions): this;
    /** Remove the event listener of `event`, if exists.*/
    off(event: keyof HTMLElementEventMap): this;
    /** Remove all event listeners in `_listeners`*/
    allOff(): this;
    /** apply `getAttribute`*/
    attr(attributeName: string): string;
    /** For each `[attr, val]` pair, apply `setAttribute`*/
    attr(attrValPairs: SMap<string | boolean | number>): this;
    /** `removeAttribute` */
    removeAttr(qualifiedName: string, ...qualifiedNames: string[]): this;
    /**`getAttribute(`data-${key}`)`. JSON.parse it by default.*/
    getdata(key: string, parse?: boolean): string | TMap<string>;
    private _cache;
}
export declare class Div<Q extends QuerySelector = QuerySelector> extends BetterHTMLElement<HTMLDivElement> {
    /**Create a HTMLDivElement. Optionally, set its `text`, `cls` or `id`. */
    constructor({ cls, setid, text }: {
        cls?: string;
        setid?: string;
        text?: string;
    });
    /**Create a HTMLDivElement. Optionally, set its `html`, `cls` or `id`. */
    constructor({ cls, setid, html }: {
        cls?: string;
        setid?: string;
        html?: string;
    });
    /**Wrap an existing element by `byid`. Optionally cache existing `children`*/
    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });
    /**Wrap an existing element by `query`. Optionally cache existing `children`*/
    constructor({ query, children }: {
        query: QueryOrPreciseTag<Q, "div">;
        children?: ChildrenObj;
    });
    /**Wrap an existing HTMLElement. Optionally cache existing `children`*/
    constructor({ htmlElement, children }: {
        htmlElement: HTMLDivElement;
        children?: ChildrenObj;
    });
}
export declare class Paragraph extends BetterHTMLElement<HTMLParagraphElement> {
    constructor(pOpts: any);
}
export declare class Span extends BetterHTMLElement<HTMLSpanElement> {
    constructor({ cls, setid, text }: {
        cls?: string;
        setid?: string;
        text?: string;
    });
    constructor({ cls, setid, html }: {
        cls?: string;
        setid?: string;
        html?: string;
    });
    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });
    constructor({ query, children }: {
        query: string;
        children?: ChildrenObj;
    });
    constructor({ htmlElement, children }: {
        htmlElement: HTMLSpanElement;
        children?: ChildrenObj;
    });
}
export declare class Img<Q extends QuerySelector = QuerySelector> extends BetterHTMLElement<HTMLImageElement> {
    constructor({ cls, setid, src }: {
        cls?: string;
        setid?: string;
        src?: string;
    });
    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });
    constructor({ query, children }: {
        query: QueryOrPreciseTag<Q, "img">;
        children?: ChildrenObj;
    });
    constructor({ htmlElement, children }: {
        htmlElement: HTMLImageElement;
        children?: ChildrenObj;
    });
    constructor();
    src(src: string): this;
    src(): string;
}
export declare class Anchor extends BetterHTMLElement<HTMLAnchorElement> {
    constructor({ setid, cls, text, html, href, target, byid, query, htmlElement, children }: {
        setid: any;
        cls: any;
        text: any;
        html: any;
        href: any;
        target: any;
        byid: any;
        query: any;
        htmlElement: any;
        children: any;
    });
    href(): string;
    href(val: string): this;
    target(): string;
    target(val: string): this;
}
declare type FormishHTMLElement = HTMLButtonElement | HTMLInputElement | HTMLSelectElement;
declare type InputType = "checkbox" | "number" | "radio" | "text" | "time" | "datetime-local";
declare abstract class Form<Generic extends FormishHTMLElement> extends BetterHTMLElement<Generic> {
    get disabled(): boolean;
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
    disable(): this;
    enable(): this;
    /**Disables.*/
    toggleEnabled(on: null | undefined | 0): this;
    /**Calls `enable()` or `disable()` accordingly. */
    toggleEnabled(on: boolean): this;
    /**Returns undefined if `_htmlElement.value` is null or undefined, otherwise returns `_htmlElement.value`*/
    value(): any;
    /**Returns undefined if `_htmlElement.value` is null or undefined, otherwise returns `_htmlElement.value`*/
    value(val: undefined): any;
    /**Resets `value`. */
    value(val: null | ''): this;
    /**Sets `value` */
    value(val: any): this;
    clear(): this;
    /**This hook is invoked before the function that is passed to an event listener (such as `click`) is called.*/
    _beforeEvent(thisArg?: this): this;
    /**When the function that is passed to an event listener (such as `click`) returns successfully, this hook is invoked.*/
    _onEventSuccess(thisArg?: this): this;
    /**When the function that is passed to an event listener (such as `click`) throws an error, this hook is invoked.
     * Logs shortly-formatted `error` to console.*/
    _onEventError(error: Error, thisArg?: this): Promise<this>;
    /**This hook is always invoked, regardless of whether the function passed to an event listener (such as `click`) succeeds or fails.*/
    _afterEvent(thisArg?: this): this;
    /**Used by event listeners, such as `click(fn)`, to wrap passed `fn`. Installs the following hooks:
     | Hook                        | When                                                                                                  |
     | :-------------------------- | :---------------------------------------------------------------------------------------------------- |
     | `this._beforeEvent()`       | Before calling `asyncFn(event)`                                                                       |
     | `this._onEventSuccess()`    | When `asyncFn(event)` has been awaited successfully                                                   |
     | `this._onEventError(error)` | When `asyncFn(event)` has thrown an error                                                             |
     | `this._afterEvent()`        | When an event listener is about to return, regardless of whether `asyncFn(event)` succeeded or failed |
     * */
    protected _wrapFnInEventHooks<F extends (event: Event) => Promise<any>>(asyncFn: F, event: Event): Promise<void>;
}
export declare class Button<Q extends QuerySelector = QuerySelector> extends Form<HTMLButtonElement> {
    constructor({ cls, setid, text, click }: {
        cls?: string;
        setid?: string;
        text?: string;
        click?: (event: MouseEvent) => any;
    });
    constructor({ cls, setid, html, click }: {
        cls?: string;
        setid?: string;
        html?: string;
        click?: (event: MouseEvent) => any;
    });
    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });
    constructor({ query, children }: {
        query: QueryOrPreciseTag<Q, "button">;
        children?: ChildrenObj;
    });
    constructor({ htmlElement, children }: {
        htmlElement: HTMLButtonElement;
        children?: ChildrenObj;
    });
    constructor();
    click(_fn?: (_event: MouseEvent) => Promise<any>): this;
}
export declare class Input<TInputType extends InputType, Generic extends FormishHTMLElement = HTMLInputElement, Q extends QuerySelector = QuerySelector> extends Form<Generic> {
    type: TInputType;
    constructor({ cls, setid, type }: {
        cls?: string;
        setid?: string;
        type?: TInputType;
    });
    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });
    constructor({ query, children }: {
        query: QueryOrPreciseTag<Q, "input">;
        children?: ChildrenObj;
    });
    constructor({ htmlElement, children }: {
        htmlElement: Generic;
        children?: ChildrenObj;
    });
    constructor();
}
export declare class TextInput<Q extends QuerySelector = QuerySelector> extends Input<"text"> {
    constructor({ cls, setid, placeholder }: {
        cls?: string;
        setid?: string;
        placeholder?: string;
    });
    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });
    constructor({ query, children }: {
        query: QueryOrPreciseTag<Q, "input">;
        children?: ChildrenObj;
    });
    constructor({ htmlElement, children }: {
        htmlElement: HTMLInputElement;
        children?: ChildrenObj;
    });
    constructor();
    placeholder(val: string): this;
    placeholder(): string;
    keydown(_fn: (_event: KeyboardEvent) => Promise<any>): this;
}
export declare class Changable<TInputType extends InputType, Generic extends FormishHTMLElement> extends Input<TInputType, Generic> {
    change(_fn: (_event: Event) => Promise<any>): this;
}
/**Patches Form's `value()` to set/get `_htmlElement.checked`, and `clear()` to uncheck. */
export declare class CheckboxInput extends Changable<"checkbox", HTMLInputElement> {
    constructor(opts: any);
    get checked(): boolean;
    check(): this;
    uncheck(): this;
    /**Disables.*/
    toggleChecked(on: null | undefined | 0): this;
    /**Calls `check()` or `uncheck()` accordingly. */
    toggleChecked(on: boolean): this;
    /**Returns undefined if `_htmlElement.value` is null or undefined, otherwise returns `_htmlElement.value`*/
    value(): any;
    /**Returns undefined if `_htmlElement.value` is null or undefined, otherwise returns `_htmlElement.value`*/
    value(val: undefined): any;
    /**Resets `value`. */
    value(val: null | ''): this;
    /**Sets `value` */
    value(val: any): this;
    clear(): this;
    _onEventError(e: Error, thisArg?: this): Promise<this>;
}
export declare class Select extends Changable<undefined, HTMLSelectElement> {
    constructor(selectOpts: any);
    get selectedIndex(): number;
    set selectedIndex(val: number);
    get selected(): HTMLOptionElement;
    /**@param val - Either a specific HTMLOptionElement, number (index).
     * Sets `this.selectedIndex`.
     * @see this.selectedIndex*/
    set selected(val: HTMLOptionElement);
    get options(): HTMLOptionElement[];
    item(index: number): HTMLOptionElement;
    /**Returns undefined if `this.selected.value` is null or undefined, otherwise returns `this.selected.value`*/
    value(): any;
    /**Returns undefined if `this.selected.value` is null or undefined, otherwise returns `this.selected.value`*/
    value(val: undefined): any;
    /**Resets `selected` to blank*/
    value(val: null | '' | boolean): this;
    /**Sets `selected` to `val` if finds a match */
    value(val: HTMLOptionElement | number | any): this;
    /**Sets `selected` to 0th element. Equivalent to `value(0)`.*/
    clear(): this;
}
/**Create an element of `create`. Optionally, set its `text` and / or `cls`*/
export declare function elem<T extends Tag>({ tag, cls, setid, html }: {
    tag: T;
    cls?: string;
    setid?: string;
    html?: string;
}): T extends Tag ? BetterHTMLElement<HTMLElementTagNameMap[T]> : never;
/**Get an existing element by `id`. Optionally, set its `text`, `cls` or cache `children`*/
export declare function elem({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): BetterHTMLElement;
/**Get an existing element by `query`. Optionally, set its `text`, `cls` or cache `children`*/
export declare function elem<Q extends QuerySelector>({ query, children }: {
    query: Q;
    children?: ChildrenObj;
}): Q extends Tag ? BetterHTMLElement<HTMLElementTagNameMap[Q]> : BetterHTMLElement;
/**Wrap an existing HTMLElement. Optionally, set its `text`, `cls` or cache `children`*/
export declare function elem<E extends HTMLElement>({ htmlElement, children }: {
    htmlElement: E;
    children?: ChildrenObj;
}): BetterHTMLElement<E>;
export declare function span({ cls, setid, text }: {
    cls?: string;
    setid?: string;
    text?: string;
}): Span;
export declare function span({ cls, setid, html }: {
    cls?: string;
    setid?: string;
    html?: string;
}): Span;
export declare function span({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): Span;
export declare function span<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "span">;
    children?: ChildrenObj;
}): Span;
export declare function span<E extends HTMLSpanElement>({ htmlElement, children }: {
    htmlElement: E;
    children?: ChildrenObj;
}): Span;
export declare function span(): Span;
/**Create a Div element, or wrap an existing one by passing htmlElement. Optionally set its id, text or cls.*/
export declare function div({ cls, setid, text }: {
    cls?: string;
    setid?: string;
    text?: string;
}): Div;
export declare function div({ cls, setid, html }: {
    cls?: string;
    setid?: string;
    html?: string;
}): Div;
export declare function div({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): Div;
export declare function div<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "div">;
    children?: ChildrenObj;
}): Div;
export declare function div({ htmlElement, children }: {
    htmlElement: HTMLDivElement;
    children?: ChildrenObj;
}): Div;
export declare function div(): Div;
export declare function button({ cls, setid, text }: {
    cls?: string;
    setid?: string;
    text?: string;
    click?: (event: MouseEvent) => any;
}): Button;
export declare function button({ cls, setid, html }: {
    cls?: string;
    setid?: string;
    html?: string;
    click?: (event: MouseEvent) => any;
}): Button;
export declare function button({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): Button;
export declare function button<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "button">;
    children?: ChildrenObj;
}): Button;
export declare function button({ htmlElement, children }: {
    htmlElement: HTMLButtonElement;
    children?: ChildrenObj;
}): Button;
export declare function button(): Button;
export declare function input<TInputType extends InputType, Generic extends FormishHTMLElement = HTMLInputElement>({ cls, setid, type, placeholder }: {
    cls?: string;
    setid?: string;
    type?: TInputType;
    placeholder?: string;
}): Input<TInputType, Generic>;
export declare function input<TInputType extends InputType = InputType, Generic extends FormishHTMLElement = HTMLInputElement>({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): Input<TInputType, Generic>;
export declare function input<Q extends QuerySelector, TInputType extends InputType = InputType, Generic extends FormishHTMLElement = HTMLInputElement>({ query, children }: {
    query: QueryOrPreciseTag<Q, "input">;
    children?: ChildrenObj;
}): Input<TInputType, Generic>;
export declare function input<TInputType extends InputType = InputType, Generic extends FormishHTMLElement = HTMLInputElement>({ htmlElement, children }: {
    htmlElement: Generic;
    children?: ChildrenObj;
}): Input<TInputType, Generic>;
export declare function input<TInputType extends InputType = InputType, Generic extends FormishHTMLElement = HTMLInputElement>(): Input<TInputType, Generic>;
export declare function select(selectOpts: any): Select;
/**Create an Img element, or wrap an existing one by passing htmlElement. Optionally set its id, src or cls.*/
export declare function img({ cls, setid, src }: {
    cls?: string;
    setid?: string;
    src?: string;
}): Img;
export declare function img({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): Img;
export declare function img<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "img">;
    children?: ChildrenObj;
}): Img;
export declare function img({ htmlElement, children }: {
    htmlElement: HTMLImageElement;
    children?: ChildrenObj;
}): Img;
export declare function img(): Img;
export declare function paragraph({ cls, setid, text }: {
    cls?: string;
    setid?: string;
    text?: string;
}): Paragraph;
export declare function paragraph({ cls, setid, html }: {
    cls?: string;
    setid?: string;
    html?: string;
}): Paragraph;
export declare function paragraph({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): Paragraph;
export declare function paragraph<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "p">;
    children?: ChildrenObj;
}): Paragraph;
export declare function paragraph({ htmlElement, children }: {
    htmlElement: HTMLParagraphElement;
    children?: ChildrenObj;
}): Paragraph;
export declare function paragraph(): Paragraph;
export declare function anchor({ cls, setid, href, target, text }: {
    cls?: string;
    setid?: string;
    href?: string;
    target?: string;
    text?: string;
}): Anchor;
export declare function anchor({ cls, setid, href, target, html }: {
    cls?: string;
    setid?: string;
    href?: string;
    target?: string;
    html?: string;
}): Anchor;
export declare function anchor({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): Anchor;
export declare function anchor<Q extends QuerySelector>({ query, children }: {
    query: QueryOrPreciseTag<Q, "a">;
    children?: ChildrenObj;
}): Anchor;
export declare function anchor({ htmlElement, children }: {
    htmlElement: HTMLAnchorElement;
    children?: ChildrenObj;
}): Anchor;
export declare function anchor(): Anchor;
export {};
