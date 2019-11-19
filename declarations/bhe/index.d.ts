declare class BetterHTMLElement {
    protected _htmlElement: HTMLElement;
    private readonly _isSvg;
    private readonly _listeners;
    private _cachedChildren;
    constructor({ tag, text, cls }: {
        tag: QuerySelector;
        text?: string;
        cls?: string;
    });
    constructor({ id, text, cls, children }: {
        id: string;
        text?: string;
        cls?: string;
        children?: ChildrenObj;
    });
    constructor({ query, text, cls, children }: {
        query: QuerySelector;
        text?: string;
        cls?: string;
        children?: ChildrenObj;
    });
    constructor({ htmlElement, text, cls, children }: {
        htmlElement: HTMLElement;
        text?: string;
        cls?: string;
        children?: ChildrenObj;
    });
    get e(): HTMLElement;
    wrapSomethingElse(newHtmlElement: BetterHTMLElement): this;
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
    is(element: BetterHTMLElement): void;
    class(cls: string): this;
    class(cls: TReturnBoolean): string;
    class(): string[];
    addClass(cls: string, ...clses: string[]): this;
    removeClass(cls: TReturnBoolean): this;
    removeClass(cls: string, ...clses: string[]): this;
    replaceClass(oldToken: TReturnBoolean, newToken: string): this;
    replaceClass(oldToken: string, newToken: string): this;
    toggleClass(cls: TReturnBoolean, force?: boolean): this;
    toggleClass(cls: string, force?: boolean): this;
    hasClass(cls: string): boolean;
    hasClass(cls: TReturnBoolean): boolean;
    after(...nodes: Array<BetterHTMLElement | Node>): this;
    insertAfter(node: BetterHTMLElement | HTMLElement): this;
    append(...nodes: Array<BetterHTMLElement | Node | TMap<BetterHTMLElement> | [string, BetterHTMLElement]>): this;
    appendTo(node: BetterHTMLElement | HTMLElement): this;
    before(...nodes: Array<BetterHTMLElement | Node>): this;
    insertBefore(node: BetterHTMLElement | HTMLElement): this;
    replaceChild(newChild: Node, oldChild: Node): this;
    replaceChild(newChild: BetterHTMLElement, oldChild: BetterHTMLElement): this;
    private _cache;
    cacheAppend(keyChildPairs: TMap<BetterHTMLElement>): this;
    cacheAppend(keyChildPairs: [string, BetterHTMLElement][]): this;
    child<K extends HTMLTag>(selector: K): BetterHTMLElement;
    child(selector: string): BetterHTMLElement;
    children(): BetterHTMLElement[];
    children<K extends HTMLTag>(selector: K): BetterHTMLElement[];
    children(selector: string | HTMLTag): BetterHTMLElement[];
    clone(deep?: boolean): BetterHTMLElement;
    cacheChildren(queryMap: TMap<QuerySelector>): this;
    cacheChildren(recursiveQueryMap: TRecMap<QuerySelector>): this;
    cacheChildren(bheMap: TMap<BetterHTMLElement>): this;
    cacheChildren(recursiveBHEMap: TRecMap<BetterHTMLElement>): this;
    empty(): this;
    remove(): this;
    find(): void;
    first(): void;
    last(): void;
    next(): void;
    not(): void;
    parent(): void;
    parents(): void;
    on(evTypeFnPairs: TEventFunctionMap<TEvent>, options?: AddEventListenerOptions): this;
    one(evType: TEvent, listener: FunctionRecievesEvent<TEvent>, options?: AddEventListenerOptions): this;
    blockListener(event: TEvent): void | this;
    unblockListener(event: TEvent): void | this;
    touchstart(fn: (ev: TouchEvent) => any, options?: AddEventListenerOptions): this;
    pointerenter(fn: (event: PointerEvent) => any, options?: AddEventListenerOptions): this;
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
    keydown(): this;
    keydown(fn: (event: KeyboardEvent) => any, options?: AddEventListenerOptions): this;
    keyup(): void;
    keypress(): void;
    hover(): void;
    mousedown(): void;
    mouseleave(): void;
    mousemove(): void;
    mouseout(): this;
    mouseout(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    mouseover(): this;
    mouseover(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    mouseup(): void;
    transform(options: TransformOptions): Promise<unknown>;
    off(event: TEvent): this;
    allOff(): this;
    attr(attrValPairs: TMap<string>): this;
    attr(attributeName: string): string;
    removeAttr(qualifiedName: string, ...qualifiedNames: string[]): this;
    data(key: string, parse?: boolean): string | TMap<string>;
    fade(dur: number, to: 0 | 1): Promise<this>;
    fadeOut(dur: number): Promise<this>;
    fadeIn(dur: number): Promise<this>;
}
declare class Div extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLDivElement;
    readonly e: HTMLDivElement;
    constructor({ id, text, cls }?: SubElemConstructor);
}
declare class Paragraph extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLParagraphElement;
    readonly e: HTMLParagraphElement;
    constructor({ id, text, cls }?: SubElemConstructor);
}
declare class Span extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLSpanElement;
    readonly e: HTMLSpanElement;
    constructor({ id, text, cls }?: SubElemConstructor);
}
declare class Img extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLImageElement;
    constructor({ id, src, cls }: ImgConstructor);
    src(src: string): this;
    src(): string;
    readonly e: HTMLImageElement;
}
declare class Anchor extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLAnchorElement;
    readonly e: HTMLAnchorElement;
    constructor({ id, text, cls, href }?: AnchorConstructor);
    href(): string;
    href(val: string): this;
    target(): string;
    target(val: string): this;
}
declare function elem({ tag, text, cls }: {
    tag: QuerySelector;
    text?: string;
    cls?: string;
}): BetterHTMLElement;
declare function elem({ id, text, cls, children }: {
    id: string;
    text?: string;
    cls?: string;
    children?: ChildrenObj;
}): BetterHTMLElement;
declare function elem({ query, text, cls, children }: {
    query: QuerySelector;
    text?: string;
    cls?: string;
    children?: ChildrenObj;
}): BetterHTMLElement;
declare function elem({ htmlElement, text, cls, children }: {
    htmlElement: HTMLElement;
    text?: string;
    cls?: string;
    children?: ChildrenObj;
}): BetterHTMLElement;
declare function span({ id, text, cls }?: SubElemConstructor): Span;
declare function div({ id, text, cls }?: SubElemConstructor): Div;
declare function img({ id, src, cls }?: ImgConstructor): Img;
declare function paragraph({ id, text, cls }?: SubElemConstructor): Paragraph;
declare function anchor({ id, text, cls, href }?: AnchorConstructor): Anchor;
export { elem, span, div, img, paragraph, anchor, BetterHTMLElement };
//# sourceMappingURL=index.d.ts.map