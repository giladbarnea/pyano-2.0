declare class BetterHTMLElement {
    protected _htmlElement: HTMLElement;
    private readonly _isSvg;
    private readonly _listeners;
    private _cachedChildren;
    /**Create an element of `tag`. Optionally, set its `text` and / or `cls`*/
    constructor({ tag, text, cls }: {
        tag: QuerySelector;
        text?: string;
        cls?: string;
    });
    /**Get an existing element by `id`. Optionally, set its `text`, `cls` or cache `children`*/
    constructor({ id, text, cls, children }: {
        id: string;
        text?: string;
        cls?: string;
        children?: ChildrenObj;
    });
    /**Get an existing element by `query`. Optionally, set its `text`, `cls` or cache `children`*/
    constructor({ query, text, cls, children }: {
        query: QuerySelector;
        text?: string;
        cls?: string;
        children?: ChildrenObj;
    });
    /**Wrap an existing HTMLElement. Optionally, set its `text`, `cls` or cache `children`*/
    constructor({ htmlElement, text, cls, children }: {
        htmlElement: HTMLElement;
        text?: string;
        cls?: string;
        children?: ChildrenObj;
    });
    /**Return the wrapped HTMLElement*/
    get e(): HTMLElement;
    /**Sets `this._htmlElement` to `newHtmlElement._htmlElement`.
     * Resets `this._cachedChildren` and caches `newHtmlElement._cachedChildren`.
     * Adds event listeners from `newHtmlElement._listeners`, while keeping `this._listeners`.*/
    wrapSomethingElse(newHtmlElement: BetterHTMLElement): this;
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
    /**@deprecated*/
    is(element: BetterHTMLElement): void;
    /**`.className = cls`*/
    class(cls: string): this;
    /**Return the first class that matches `cls` predicate.*/
    class(cls: TReturnBoolean): string;
    /**Return a string array of the element's classes (not a classList)*/
    class(): string[];
    addClass(cls: string, ...clses: string[]): this;
    removeClass(cls: TReturnBoolean, ...clses: TReturnBoolean[]): this;
    removeClass(cls: string, ...clses: string[]): this;
    replaceClass(oldToken: TReturnBoolean, newToken: string): this;
    replaceClass(oldToken: string, newToken: string): this;
    toggleClass(cls: TReturnBoolean, force?: boolean): this;
    toggleClass(cls: string, force?: boolean): this;
    /**Returns `this.e.classList.contains(cls)` */
    hasClass(cls: string): boolean;
    /**Returns whether `this` has a class that matches passed function */
    hasClass(cls: TReturnBoolean): boolean;
    /**Insert at least one `node` just after `this`. Any `node` can be either `BetterHTMLElement`s or vanilla `Node`.*/
    after(...nodes: Array<BetterHTMLElement | Node>): this;
    /**Insert `this` just after a `BetterHTMLElement` or a vanilla `Node`.*/
    insertAfter(node: BetterHTMLElement | HTMLElement): this;
    /**Insert at least one `node` after the last child of `this`.
     * Any `node` can be either a `BetterHTMLElement`, a vanilla `Node`,
     * a `{someKey: BetterHTMLElement}` pairs object, or a `[someKey, BetterHTMLElement]` tuple.*/
    append(...nodes: Array<BetterHTMLElement | Node | TMap<BetterHTMLElement> | [string, BetterHTMLElement]>): this;
    /**Append `this` to a `BetterHTMLElement` or a vanilla `Node`*/
    appendTo(node: BetterHTMLElement | HTMLElement): this;
    /**Insert at least one `node` just before `this`. Any `node` can be either `BetterHTMLElement`s or vanilla `Node`.*/
    before(...nodes: Array<BetterHTMLElement | Node>): this;
    /**Insert `this` just before a `BetterHTMLElement` or a vanilla `Node`s.*/
    insertBefore(node: BetterHTMLElement | HTMLElement): this;
    replaceChild(newChild: Node, oldChild: Node): this;
    replaceChild(newChild: BetterHTMLElement, oldChild: BetterHTMLElement): this;
    private _cache;
    /**For each `[key, child]` pair, `append(child)` and store it in `this[key]`. */
    cacheAppend(keyChildPairs: TMap<BetterHTMLElement>): this;
    /**For each `[key, child]` tuple, `append(child)` and store it in `this[key]`. */
    cacheAppend(keyChildPairs: [string, BetterHTMLElement][]): this;
    /**Get a child with `querySelector` and return a `BetterHTMLElement` of it*/
    child<K extends HTMLTag>(selector: K): BetterHTMLElement;
    /**Get a child with `querySelector` and return a `BetterHTMLElement` of it*/
    child(selector: string): BetterHTMLElement;
    /**Return a `BetterHTMLElement` list of all children */
    children(): BetterHTMLElement[];
    /**Return a `BetterHTMLElement` list of all children selected by `selector` */
    children<K extends HTMLTag>(selector: K): BetterHTMLElement[];
    /**Return a `BetterHTMLElement` list of all children selected by `selector` */
    children(selector: string | HTMLTag): BetterHTMLElement[];
    clone(deep?: boolean): BetterHTMLElement;
    /**For each `[key, selector]` pair, where `selector` is either an `HTMLTag` or a `string`, get `this.child(selector)`, and store it in `this[key]`.
     * @example
     * // Using `cacheChildren` directly
     * const navbar = elem({ id: 'navbar' });
     * navbar.cacheChildren({ home: '.navbar-item-home', about: '.navbar-item-about' });
     * navbar.home.toggleClass("selected");
     * navbar.about.css(...);
     * @example
     * // Using `cacheChildren` indirectly through `children` constructor option
     * const navbar = elem({ id: 'navbar', children: { home: '.navbar-item-home', about: '.navbar-item-about' }});
     * navbar.home.toggleClass("selected");
     * navbar.about.css(...);
     * @see this.child*/
    cacheChildren(queryMap: TMap<QuerySelector>): this;
    /**For each `[key, selector]` pair, where `selector` is a recursive `{subselector: keySelectorObj}` object,
     * extract `this.child(subselector)`, store it in `this[key]`, then call `this[key].cacheChildren` passing the recursive object.
     * @example
     * // Using `cacheChildren` directly
     * const navbar = elem({ id: 'navbar' });
     * navbar.cacheChildren({
     *      home: {
     *          '.navbar-item-home': {
     *              news: '.navbar-subitem-news,
     *              support: '.navbar-subitem-support'
     *          }
     *      }
     *  });
     * navbar.home.toggleClass("selected");
     * navbar.home.news.css(...);
     * navbar.home.support.pointerdown(...);
     * @example
     * // Using `cacheChildren` indirectly through `children` constructor option
     * const navbar = elem({query: '#navbar', children: {
     *      home: {
     *          '.navbar-item-home': {
     *              news: '.navbar-subitem-news,
     *              support: '.navbar-subitem-support'
     *          }
     *      }
     *  }});
     * navbar.home.toggleClass("selected");
     * navbar.home.news.css(...);
     * navbar.home.support.pointerdown(...);
     * @see this.child*/
    cacheChildren(recursiveQueryMap: TRecMap<QuerySelector>): this;
    cacheChildren(bheMap: TMap<BetterHTMLElement>): this;
    /**For each `[key, selector]` pair, where `selector` is a `BetterHTMLElement`, store it in `this[key]`.
     * @example
     * // Using `cacheChildren` directly
     * const home = elem({ query: '.navbar-item-home' });
     * const navbar = elem({ id: 'navbar' });
     * navbar.cacheChildren({ home });
     * navbar.home.toggleClass("selected");
     * @example
     * // Using `cacheChildren` indirectly through `children` constructor option
     * const home = elem({ query: '.navbar-item-home' });
     * const navbar = elem({id: 'navbar', children: { home }});
     * navbar.home.toggleClass("selected");
     * @see this.child*/
    cacheChildren(recursiveBHEMap: TRecMap<BetterHTMLElement>): this;
    /**Remove all children from DOM*/
    empty(): this;
    /**Remove element from DOM*/
    remove(): this;
    /**@deprecated*/
    find(): void;
    /**@deprecated*/
    first(): void;
    /**@deprecated*/
    last(): void;
    /**@deprecated*/
    next(): void;
    /**@deprecated*/
    not(): void;
    /**@deprecated*/
    parent(): void;
    /**@deprecated*/
    parents(): void;
    on(evTypeFnPairs: TEventFunctionMap<TEvent>, options?: AddEventListenerOptions): this;
    one(evType: TEvent, listener: FunctionRecievesEvent<TEvent>, options?: AddEventListenerOptions): this;
    /**Remove `event` from wrapped element's event listeners, but keep the removed listener in cache.
     * This is useful for later unblocking*/
    blockListener(event: TEvent): void | this;
    unblockListener(event: TEvent): void | this;
    /** Add a `touchstart` event listener. This is the fast alternative to `click` listeners for mobile (no 300ms wait). */
    touchstart(fn: (ev: TouchEvent) => any, options?: AddEventListenerOptions): this;
    pointerenter(fn: (event: PointerEvent) => any, options?: AddEventListenerOptions): this;
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
    /**Simulate a keydown event to the element.*/
    keydown(): this;
    /**Add a `keydown` event listener*/
    keydown(fn: (event: KeyboardEvent) => any, options?: AddEventListenerOptions): this;
    /**@deprecated*/
    keyup(): void;
    /**@deprecated*/
    keypress(): void;
    /**@deprecated*/
    hover(): void;
    /**@deprecated*/
    mousedown(): void;
    /**@deprecated*/
    mouseleave(): void;
    /**@deprecated*/
    mousemove(): void;
    /**Simulate a mouseout event to the element.*/
    mouseout(): this;
    /**Add a `mouseout` event listener*/
    mouseout(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    /**Simulate a mouseover event to the element.*/
    mouseover(): this;
    /**Add a `mouseover` event listener*/
    mouseover(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    /**@deprecated*/
    mouseup(): void;
    transform(options: TransformOptions): Promise<unknown>;
    /** Remove the event listener of `event`, if exists.*/
    off(event: TEvent): this;
    allOff(): this;
    /** For each `[attr, val]` pair, apply `setAttribute`*/
    attr(attrValPairs: TMap<string>): this;
    /** apply `getAttribute`*/
    attr(attributeName: string): string;
    /** `removeAttribute` */
    removeAttr(qualifiedName: string, ...qualifiedNames: string[]): this;
    /**`getAttribute(`data-${key}`)`. JSON.parse it by default.*/
    data(key: string, parse?: boolean): string | TMap<string>;
    fade(dur: number, to: 0 | 1): Promise<this>;
    fadeOut(dur: number): Promise<this>;
    fadeIn(dur: number): Promise<this>;
}
declare class Div extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLDivElement;
    readonly e: HTMLDivElement;
    /**Create a Div element. Optionally set its id, text or cls.*/
    constructor({ id, text, cls }?: SubElemConstructor);
}
declare class Paragraph extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLParagraphElement;
    readonly e: HTMLParagraphElement;
    /**Create a Paragraph element. Optionally set its id, text or cls.*/
    constructor({ id, text, cls }?: SubElemConstructor);
}
declare class Span extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLSpanElement;
    readonly e: HTMLSpanElement;
    /**Create a Span element. Optionally set its id, text or cls.*/
    constructor({ id, text, cls }?: SubElemConstructor);
}
declare class Img extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLImageElement;
    /**Create an Img element. Optionally set its id, src or cls.*/
    constructor({ id, src, cls }: ImgConstructor);
    src(src: string): this;
    src(): string;
    readonly e: HTMLImageElement;
}
declare class Anchor extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLAnchorElement;
    readonly e: HTMLAnchorElement;
    /**Create an Anchor element. Optionally set its id, text, href or cls.*/
    constructor({ id, text, cls, href }?: AnchorConstructor);
    href(): string;
    href(val: string): this;
    target(): string;
    target(val: string): this;
}
/**Create an element of `tag`. Optionally, set its `text` and / or `cls`*/
declare function elem({ tag, text, cls }: {
    tag: QuerySelector;
    text?: string;
    cls?: string;
}): BetterHTMLElement;
/**Get an existing element by `id`. Optionally, set its `text`, `cls` or cache `children`*/
declare function elem({ id, text, cls, children }: {
    id: string;
    text?: string;
    cls?: string;
    children?: ChildrenObj;
}): BetterHTMLElement;
/**Get an existing element by `query`. Optionally, set its `text`, `cls` or cache `children`*/
declare function elem({ query, text, cls, children }: {
    query: QuerySelector;
    text?: string;
    cls?: string;
    children?: ChildrenObj;
}): BetterHTMLElement;
/**Wrap an existing HTMLElement. Optionally, set its `text`, `cls` or cache `children`*/
declare function elem({ htmlElement, text, cls, children }: {
    htmlElement: HTMLElement;
    text?: string;
    cls?: string;
    children?: ChildrenObj;
}): BetterHTMLElement;
/**Create an Span element. Optionally set its id, text or cls.*/
declare function span({ id, text, cls }?: SubElemConstructor): Span;
/**Create an Div element. Optionally set its id, text or cls.*/
declare function div({ id, text, cls }?: SubElemConstructor): Div;
/**Create an Img element. Optionally set its id, src or cls.*/
declare function img({ id, src, cls }?: ImgConstructor): Img;
/**Create a Paragraph element. Optionally set its id, text or cls.*/
declare function paragraph({ id, text, cls }?: SubElemConstructor): Paragraph;
/**Create an Anchor element. Optionally set its id, text, href or cls.*/
declare function anchor({ id, text, cls, href }?: AnchorConstructor): Anchor;
export { elem, span, div, img, paragraph, anchor };
//# sourceMappingURL=index.d.ts.map