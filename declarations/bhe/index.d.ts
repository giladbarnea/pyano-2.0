export interface TMap<T> {
    [s: string]: T;
    [s: number]: T;
}
export interface TRecMap<T> {
    [s: string]: T | TRecMap<T>;
    [s: number]: T | TRecMap<T>;
}
export declare type EventName = keyof HTMLElementEventMap;
export declare type EventName2Function<E extends EventName = EventName> = {
    [P in EventName]?: (event: HTMLElementEventMap[P]) => void;
}[E];
export declare type MapOfEventName2Function = Partial<Record<keyof HTMLElementEventMap, EventName2Function>>;
export declare type Tag = Exclude<keyof HTMLElementTagNameMap, "object">;
export declare type NotTag<T extends Tag> = Exclude<Tag, T>;
export declare type QueryOrPreciseTag<Q, T extends Tag> = Exclude<Q, QuerySelector<NotTag<T>>>;
export declare type TagOrString = Tag | string;
export declare type QuerySelector<K extends TagOrString = TagOrString> = K extends Tag ? K : string;
export declare type Element2Tag<T> = T extends HTMLInputElement ? "input" : T extends HTMLAnchorElement ? "a" : T extends HTMLImageElement ? "img" : Tag;
export declare type ChildrenObj = TRecMap<QuerySelector | BetterHTMLElement | typeof BetterHTMLElement>;
export declare type Enumerated<T> = T extends (infer U)[] ? [number, U][] : T extends TRecMap<(infer U)> ? [keyof T, U][] : T extends boolean ? never : any;
export declare type Returns<T> = (s: string) => T;
export declare type Awaited<T> = T extends Promise<infer U> ? U : T;
export declare type OmittedCssProps = "animationDirection" | "animationFillMode" | "animationIterationCount" | "animationPlayState" | "animationTimingFunction" | "opacity" | "padding" | "paddingBottom" | "paddingLeft" | "paddingRight" | "paddingTop" | "preload" | "width";
export declare type PartialCssStyleDeclaration = Omit<Partial<CSSStyleDeclaration>, OmittedCssProps>;
export interface CssOptions extends PartialCssStyleDeclaration {
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
export declare type CubicBezierFunction = [number, number, number, number];
export declare type Jumpterm = 'jump-start' | 'jump-end' | 'jump-none' | 'jump-both' | 'start' | 'end';
export declare type StepsFunction = [number, Jumpterm];
export declare type AnimationTimingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'step-start' | 'step-end' | StepsFunction | CubicBezierFunction;
export declare type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
export declare type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';
export interface TransformOptions {
    matrix?: [number, number, number, number, number, number];
    matrix3d?: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    perspective?: string;
    rotate?: string;
    rotate3d?: [number, number, number, string];
    rotateX?: string;
    rotateY?: string;
    rotateZ?: string;
    scale?: number;
    scale3d?: [number, number, number];
    scaleX?: [number, number, number];
    scaleY?: [number, number, number];
    skew?: [string, string];
    skewX?: string;
    skewY?: string;
    translate?: [string, string];
    translate3d?: [string, string, string];
    translateX?: string;
    translateY?: string;
    translateZ?: string;
}
export interface AnimateOptions {
    delay?: string;
    direction?: AnimationDirection;
    duration: string;
    fillMode?: AnimationFillMode;
    iterationCount?: number;
    name: string;
    playState?: AnimationPlayState;
    timingFunction?: AnimationTimingFunction;
}
export declare function enumerate<T>(obj: T): Enumerated<T>;
export declare function wait(ms: number): Promise<any>;
export declare function bool(val: any): boolean;
export declare function isArray<T>(obj: any): obj is Array<T>;
export declare function isEmptyArr(collection: any): boolean;
export declare function isEmptyObj(obj: any): boolean;
export declare function isFunction<F>(fn: F): fn is F;
export declare function isFunction(fn: (...args: any[]) => any): fn is (...args: any[]) => any;
export declare function anyDefined(obj: any): boolean;
export declare function anyTruthy(obj: any): boolean;
export declare function allUndefined(obj: any): boolean;
export declare function waitUntil(cond: () => boolean, checkInterval?: number, timeout?: number): Promise<boolean>;
export declare function isBHE<T extends BetterHTMLElement>(bhe: T, bheSubType: any): bhe is T;
export declare function isType<T>(arg: T): arg is T;
export declare function isTMap<T>(obj: TMap<T>): obj is TMap<T>;
export declare function isObject(obj: any): boolean;
export declare function shallowProperty<T>(key: string): (obj: T) => T extends null ? undefined : T[keyof T];
export declare function getLength(collection: any): number;
export declare function isArrayLike(collection: any): boolean;
export declare function extend(sup: any, child: any): any;
export declare function anyValue(obj: any): boolean;
export declare function equalsAny(obj: any, ...others: any[]): boolean;
export declare function noValue(obj: any): boolean;
export declare function getArgsFullRepr(argsWithValues: TMap<any>): string;
export declare function getArgsWithValues(passedArgs: TMap<any>): TMap<any>;
export declare function summary(argset: TMap<any>): string;
export declare class MutuallyExclusiveArgs extends Error {
    constructor(passedArgs: TMap<any>, details?: string);
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
    constructor({ tag, cls, setid, html }: {
        tag: Element2Tag<Generic>;
        cls?: string;
        setid?: string;
        html?: string;
    });
    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });
    constructor({ query, children }: {
        query: QuerySelector;
        children?: ChildrenObj;
    });
    constructor({ htmlElement, children }: {
        htmlElement: Generic;
        children?: ChildrenObj;
    });
    get e(): Generic;
    static wrapWithBHE(htmlElement: HTMLAnchorElement): Anchor;
    static wrapWithBHE<TInputType extends InputType = InputType, Generic extends FormishHTMLElement = FormishHTMLElement>(htmlElement: Generic): Input<TInputType, Generic>;
    static wrapWithBHE(htmlElement: HTMLImageElement): Img;
    static wrapWithBHE(htmlElement: HTMLParagraphElement): Paragraph;
    static wrapWithBHE(htmlElement: HTMLSpanElement): Span;
    static wrapWithBHE(htmlElement: HTMLButtonElement): Button;
    static wrapWithBHE(htmlElement: HTMLDivElement): Div;
    static wrapWithBHE(htmlElement: HTMLSelectElement): Div;
    static wrapWithBHE(htmlElement: HTMLElement): BetterHTMLElement;
    toString(): any;
    wrapSomethingElse<T extends HTMLElement>(newHtmlElement: BetterHTMLElement<T>): this;
    wrapSomethingElse(newHtmlElement: Node): this;
    html(html: string): this;
    html(): string;
    text(txt: string | number): this;
    text(): string;
    id(id: string): this;
    id(): string;
    css(css: Partial<CssOptions>): this;
    css(css: string): string;
    uncss(...removeProps: (keyof CssOptions)[]): this;
    class(cls: string): this;
    class(cls: Returns<boolean>): string;
    class(): string[];
    addClass(cls: string, ...clses: string[]): this;
    removeClass(cls: Returns<boolean>, ...clses: Returns<boolean>[]): this;
    removeClass(cls: string, clses?: string[]): this;
    replaceClass(oldToken: Returns<boolean>, newToken: string): this;
    replaceClass(oldToken: string, newToken: string): this;
    toggleClass(cls: Returns<boolean>, force?: boolean): this;
    toggleClass(cls: string, force?: boolean): this;
    hasClass(cls: string): boolean;
    hasClass(cls: Returns<boolean>): boolean;
    after(...nodes: Array<BetterHTMLElement | Node>): this;
    insertAfter(node: BetterHTMLElement | HTMLElement): this;
    append(...nodes: Array<BetterHTMLElement | Node | TMap<BetterHTMLElement> | [string, BetterHTMLElement]>): this;
    appendTo(node: BetterHTMLElement | HTMLElement): this;
    before(...nodes: Array<BetterHTMLElement | Node>): this;
    insertBefore(node: BetterHTMLElement | HTMLElement): this;
    replaceChild(newChild: Node, oldChild: Node): this;
    replaceChild(newChild: BetterHTMLElement, oldChild: BetterHTMLElement): this;
    cacheAppend(keyChildPairs: TMap<BetterHTMLElement>): this;
    cacheAppend(keyChildPairs: [string, BetterHTMLElement][]): this;
    _cls(): typeof BetterHTMLElement;
    child(selector: "img"): Img;
    child(selector: "a"): Anchor;
    child<TInputType extends InputType = InputType>(selector: "input"): Input<TInputType, HTMLInputElement>;
    child(selector: "select"): Input<undefined, HTMLSelectElement>;
    child(selector: "p"): Paragraph;
    child(selector: "span"): Span;
    child(selector: "button"): Button;
    child(selector: "div"): Div;
    child<T extends Tag>(selector: T): BetterHTMLElement<HTMLElementTagNameMap[T]>;
    child(selector: string): BetterHTMLElement;
    child<T extends typeof BetterHTMLElement>(selector: string, bheCls: T): T;
    children(): BetterHTMLElement[];
    children<K extends Tag>(selector: K): BetterHTMLElement[];
    children(selector: QuerySelector): BetterHTMLElement[];
    clone(deep?: boolean): BetterHTMLElement;
    cacheChildren(childrenObj: ChildrenObj): this;
    empty(): this;
    remove(): this;
    on(evTypeFnPairs: TMap<EventName2Function>, options?: AddEventListenerOptions): this;
    touchstart(fn: (ev: TouchEvent) => any, options?: AddEventListenerOptions): this;
    pointerdown(fn: (event: PointerEvent | MouseEvent) => any, options?: AddEventListenerOptions): this;
    click(): this;
    click(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    blur(): this;
    blur(fn: (event: FocusEvent) => any, options?: AddEventListenerOptions): this;
    focus(): this;
    focus(fn: (event: FocusEvent) => any, options?: AddEventListenerOptions): this;
    change(fn: (event: Event) => any, options?: AddEventListenerOptions): this;
    contextmenu(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    dblclick(): this;
    dblclick(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    mouseenter(): this;
    mouseenter(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    keydown(fn: (event: KeyboardEvent) => any, options?: AddEventListenerOptions): this;
    mouseout(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    mouseover(fn: (event: MouseEvent) => void, options?: AddEventListenerOptions): this;
    off(event: EventName): this;
    allOff(): this;
    attr(attrValPairs: TMap<string | boolean>): this;
    attr(attributeName: string): string;
    removeAttr(qualifiedName: string, ...qualifiedNames: string[]): this;
    getdata(key: string, parse?: boolean): string | TMap<string>;
    private _cache;
}
export declare class Div<Q extends QuerySelector = QuerySelector> extends BetterHTMLElement<HTMLDivElement> {
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
        query: QueryOrPreciseTag<Q, "div">;
        children?: ChildrenObj;
    });
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
interface Flashable {
    flashBad(): Promise<void>;
    flashGood(): Promise<void>;
}
export declare type FormishHTMLElement = HTMLButtonElement | HTMLInputElement | HTMLSelectElement;
export declare type InputType = "checkbox" | "number" | "radio" | "text" | "time" | "datetime-local";
export declare abstract class Form<Generic extends FormishHTMLElement> extends BetterHTMLElement<Generic> implements Flashable {
    get disabled(): boolean;
    disable(): this;
    enable(): this;
    toggleEnabled(on: null | undefined | 0): this;
    toggleEnabled(on: boolean): this;
    value(): any;
    value(val: undefined): any;
    value(val: null | ''): this;
    value(val: any): this;
    flashBad(): Promise<void>;
    flashGood(): Promise<void>;
    clear(): this;
    _beforeEvent(): this;
    _beforeEvent(thisArg: this): this;
    _onEventSuccess(ret: any): this;
    _onEventSuccess(ret: any, thisArg: this): this;
    _softErr(e: Error): Promise<this>;
    _softErr(e: Error, thisArg: this): Promise<this>;
    _softWarn(e: Error): Promise<this>;
    _softWarn(e: Error, thisArg: this): Promise<this>;
    _afterEvent(): this;
    _afterEvent(thisArg: this): this;
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
export declare class CheckboxInput extends Changable<"checkbox", HTMLInputElement> {
    constructor(opts: any);
    get checked(): boolean;
    check(): this;
    uncheck(): this;
    toggleChecked(on: null | undefined | 0): this;
    toggleChecked(on: boolean): this;
    value(): any;
    value(val: undefined): any;
    value(val: null | ''): this;
    value(val: any): this;
    clear(): this;
    _softErr(e: Error, thisArg?: this): Promise<this>;
}
export declare class Select extends Changable<undefined, HTMLSelectElement> {
    constructor(selectOpts: any);
    get selectedIndex(): number;
    set selectedIndex(val: number);
    get selected(): HTMLOptionElement;
    set selected(val: HTMLOptionElement);
    get options(): HTMLOptionElement[];
    item(index: number): HTMLOptionElement;
    value(): any;
    value(val: undefined): any;
    value(val: null | '' | boolean): this;
    value(val: HTMLOptionElement | number | any): this;
    clear(): this;
}
export declare function elem<T extends Tag>({ tag, cls, setid, html }: {
    tag: T;
    cls?: string;
    setid?: string;
    html?: string;
}): T extends Tag ? BetterHTMLElement<HTMLElementTagNameMap[T]> : never;
export declare function elem({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): BetterHTMLElement;
export declare function elem<Q extends QuerySelector>({ query, children }: {
    query: Q;
    children?: ChildrenObj;
}): Q extends Tag ? BetterHTMLElement<HTMLElementTagNameMap[Q]> : BetterHTMLElement;
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
//# sourceMappingURL=index.d.ts.map