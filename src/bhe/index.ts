import { bool, enumerate, isFunction, isObject, wait } from "../util";

const SVG_NS_URI = 'http://www.w3.org/2000/svg';

// TODO: make BetterHTMLElement<T>, for use in eg child[ren] function
// extends HTMLElement: https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/upgrade#Examples
class BetterHTMLElement {
    protected _htmlElement: HTMLElement;
    private readonly _isSvg: boolean = false;
    private readonly _listeners: TEventFunctionMap<TEvent> = {};
    private _cachedChildren: TMap<BetterHTMLElement> = {};
    protected _computedStyle: CSSStyleDeclaration = undefined;
    /*[Symbol.toPrimitive](hint) {
     console.log('from toPrimitive, hint: ', hint, '\nthis: ', this);
     return this._htmlElement;
     }
     
     valueOf() {
     console.log('from valueOf, this: ', this);
     return this;
     }
     
     toString() {
     console.log('from toString, this: ', this);
     return this;
     }
     */
    
    // TODO: query should also be a predicate function
    /**Create an element of `tag`. Optionally, set its `text` and / or `cls`*/
    constructor({ tag, text, cls }: { tag: QuerySelector, text?: string, cls?: string });
    /**Get an existing element by `id`. Optionally, set its `text`, `cls` or cache `children`*/
    constructor({ id, text, cls, children }: { id: string, text?: string, cls?: string, children?: ChildrenObj });
    /**Get an existing element by `query`. Optionally, set its `text`, `cls` or cache `children`*/
    constructor({ query, text, cls, children }: { query: QuerySelector, text?: string, cls?: string, children?: ChildrenObj });
    /**Wrap an existing HTMLElement. Optionally, set its `text`, `cls` or cache `children`*/
    constructor({ htmlElement, text, cls, children }: { htmlElement: HTMLElement, text?: string, cls?: string, children?: ChildrenObj });
    constructor(elemOptions) {
        const { tag, id, htmlElement, text, query, children, cls } = elemOptions;
        
        if ( [ tag, id, htmlElement, query ].filter(x => x !== undefined).length > 1 ) {
            throw new BadArgumentsAmountError(1, {
                tag,
                id,
                htmlElement,
                query
            })
            
        }
        if ( tag !== undefined && children !== undefined )
            throw new BadArgumentsAmountError(1, {
                tag,
                children
            }, '"children" and "tag" options are mutually exclusive, because tag implies creating a new element and children implies getting an existing one.');
        
        if ( tag !== undefined ) {
            if ( [ 'svg', 'path' ].includes(tag.toLowerCase()) ) {
                this._isSvg = true;
                this._htmlElement = document.createElementNS(SVG_NS_URI, tag);
                // this._htmlElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
            } else {
                this._htmlElement = document.createElement(tag);
            }
        } else if ( id !== undefined ) {
            this._htmlElement = document.getElementById(id);
            if ( !bool(this._htmlElement) )
                console.warn(`Elem constructor: tried to get element by id: "${id}", but no such element exists.`)
        } else if ( query !== undefined ) {
            this._htmlElement = document.querySelector(query);
            if ( !bool(this._htmlElement) )
                console.warn(`Elem constructor: tried to get element by query: "${query}", but no element found.`)
        } else if ( htmlElement !== undefined ) {
            this._htmlElement = htmlElement;
            if ( !bool(this._htmlElement) )
                console.warn(`Elem constructor: passed explicit htmlElement arg, but arg was falsey: ${htmlElement}`, htmlElement)
        } else {
            throw new BadArgumentsAmountError(1, {
                tag,
                id,
                htmlElement,
                query
            })
        }
        
        if ( text !== undefined )
            this.text(text);
        if ( cls !== undefined )
            this.class(cls);
        
        if ( children !== undefined )
            this.cacheChildren(children);
        
        // Object.assign(this, proxy);
        /*const that = this;
         return new Proxy(this, {
         get(target: BetterHTMLElement, p: string | number | symbol, receiver: any): any {
         // console.log('logging');
         // console.log('target: ', target,
         //     '\nthat: ', that,
         //     '\ntypeof(that): ', typeof (that),
         //     '\np: ', p,
         //     '\nreceiver: ', receiver,
         //     '\nthis: ', this);
         return that[p];
         }
         })
         */
    }
    
    /**Return the wrapped HTMLElement*/
    get e() {
        return this._htmlElement;
    }
    
    /**Sets `this._htmlElement` to `newHtmlElement._htmlElement`.
     * Resets `this._cachedChildren` and caches `newHtmlElement._cachedChildren`.
     * Adds event listeners from `newHtmlElement._listeners`, while keeping `this._listeners`.*/
    wrapSomethingElse(newHtmlElement: BetterHTMLElement): this
    /**Sets `this._htmlElement` to `newHtmlElement`.
     * Keeps `this._listeners`.
     * NOTE: this reinitializes `this._cachedChildren` and all event listeners belonging to `newHtmlElement` are lost. Pass a `BetterHTMLElement` to keep them.*/
    wrapSomethingElse(newHtmlElement: Node): this
    wrapSomethingElse(newHtmlElement) {
        this._cachedChildren = {};
        if ( newHtmlElement instanceof BetterHTMLElement ) {
            this._htmlElement.replaceWith(newHtmlElement.e);
            this._htmlElement = newHtmlElement.e;
            for ( let [ _key, _cachedChild ] of enumerate(newHtmlElement._cachedChildren) ) {
                this._cache(_key as string, _cachedChild)
            }
            if (
                Object.keys(this._cachedChildren).length
                !== Object.keys(newHtmlElement._cachedChildren).length
                ||
                Object.values(this._cachedChildren).filter(v => v !== undefined).length
                !== Object.values(newHtmlElement._cachedChildren).filter(v => v !== undefined).length
            ) {
                console.warn(`wrapSomethingElse this._cachedChildren length !== newHtmlElement._cachedChildren.length`, {
                        this : this,
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
    
    // ***  Basic
    /**Set the element's innerHTML*/
    html(html: string): this;
    /**Get the element's innerHTML*/
    html(): string;
    html(html?) {
        if ( html === undefined ) {
            return this.e.innerHTML;
        } else {
            this.e.innerHTML = html;
            return this;
        }
    }
    
    /**Set the element's innerText*/
    text(txt: string | number): this;
    /**Get the element's innerText*/
    text(): string;
    text(txt?) {
        if ( txt === undefined ) {
            return this.e.innerText;
        } else {
            this.e.innerText = txt;
            return this;
        }
        
    }
    
    /**Set the id of the element*/
    id(id: string): this;
    /**Get the id of the element*/
    id(): string;
    id(id?) {
        if ( id === undefined ) {
            return this.e.id;
        } else {
            this.e.id = id;
            return this;
        }
    }
    
    /**For each `{<styleAttr>: <styleVal>}` pair, set the `style[styleAttr]` to `styleVal`.*/
    css(css: Partial<CssOptions>): this
    /**Get `style[css]`*/
    css(css: string): string
    css(css) {
        if ( typeof css === 'string' ) {
            return this.e.style[css];
        } else {
            for ( let [ styleAttr, styleVal ] of enumerate(css) )
                this.e.style[<string> styleAttr] = styleVal;
            return this;
        }
    }
    
    /**Remove the value of the passed style properties*/
    uncss(...removeProps: (keyof CssOptions)[]): this {
        let css = {};
        for ( let prop of removeProps )
            css[prop] = '';
        return this.css(css);
    }
    
    /**@deprecated*/
    is(element: BetterHTMLElement) {
        // https://api.jquery.com/is/
        throw new Error("NOT IMPLEMENTED");
    }
    
    /*
     animate(opts: AnimateOptions) {
     // see: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Tips
     throw new Error('Not implemented');
     }
     */
    
    // ***  Classes
    /**`.className = cls`*/
    class(cls: string): this;
    /**Return the first class that matches `cls` predicate.*/
    class(cls: TReturnBoolean): string;
    /**Return a string array of the element's classes (not a classList)*/
    class(): string[];
    class(cls?) {
        if ( cls === undefined ) {
            return Array.from(this.e.classList);
        } else if ( isFunction(cls) ) {
            return Array.from(this.e.classList).find(cls);
        } else {
            if ( this._isSvg ) {
                // @ts-ignore
                // noinspection JSConstantReassignment
                this.e.classList = [ cls ];
            } else {
                this.e.className = cls;
            }
            return this;
        }
    }
    
    addClass(cls: string, ...clses: string[]): this {
        this.e.classList.add(cls);
        for ( let c of clses )
            this.e.classList.add(c);
        return this;
    }
    
    removeClass(cls: TReturnBoolean): this;
    removeClass(cls: string, ...clses: string[]): this;
    removeClass(cls, ...clses) {
        if ( isFunction<boolean>(cls) ) {
            this.e.classList.remove(this.class(cls));
            if ( bool(clses) )
                console.warn('removeClass, cls is TReturnBoolean, got ...clses but shouldnt have')
            
        } else {
            this.e.classList.remove(cls);
            for ( let c of clses )
                this.e.classList.remove(c);
        }
        return this;
    }
    
    replaceClass(oldToken: TReturnBoolean, newToken: string): this;
    replaceClass(oldToken: string, newToken: string): this
    replaceClass(oldToken, newToken) {
        if ( isFunction<boolean>(oldToken) ) {
            this.e.classList.replace(this.class(oldToken), newToken);
        } else {
            this.e.classList.replace(oldToken, newToken);
        }
        return this;
    }
    
    toggleClass(cls: TReturnBoolean, force?: boolean): this
    toggleClass(cls: string, force?: boolean): this
    toggleClass(cls, force) {
        if ( isFunction<boolean>(cls) )
            this.e.classList.toggle(this.class(cls), force);
        else
            this.e.classList.toggle(cls, force);
        return this;
    }
    
    /**Returns `this.e.classList.contains(cls)` */
    hasClass(cls: string): boolean
    /**Returns whether `this` has a class that matches passed function */
    hasClass(cls: TReturnBoolean): boolean
    hasClass(cls) {
        if ( isFunction<boolean>(cls) ) {
            return this.class(cls) !== undefined;
        } else {
            return this.e.classList.contains(cls);
        }
    }
    
    // ***  Nodes
    /**Insert at least one `node` just after `this`. Any `node` can be either `BetterHTMLElement`s or vanilla `Node`.*/
    after(...nodes: Array<BetterHTMLElement | Node>): this {
        for ( let node of nodes ) {
            if ( node instanceof BetterHTMLElement )
                this.e.after(node.e);
            else
                this.e.after(node);
        }
        return this;
    }
    
    /**Insert `this` just after a `BetterHTMLElement` or a vanilla `Node`.*/
    insertAfter(node: BetterHTMLElement | HTMLElement): this {
        if ( node instanceof BetterHTMLElement )
            node.e.after(this.e);
        else
            node.after(this.e);
        return this;
    }
    
    /**Insert at least one `node` after the last child of `this`.
     * Any `node` can be either a `BetterHTMLElement`, a vanilla `Node`,
     * a `{someKey: BetterHTMLElement}` pairs object, or a `[someKey, BetterHTMLElement]` tuple.*/
    append(...nodes: Array<BetterHTMLElement | Node | TMap<BetterHTMLElement> | [ string, BetterHTMLElement ]>): this {
        for ( let node of nodes ) {
            if ( node instanceof BetterHTMLElement )
                this.e.append(node.e);
            else if ( node instanceof Node )
                this.e.append(node);
            else if ( Array.isArray(node) )
                this.cacheAppend([ node ]);
            else
                this.cacheAppend(node)
        }
        return this;
    }
    
    /**Append `this` to a `BetterHTMLElement` or a vanilla `Node`*/
    appendTo(node: BetterHTMLElement | HTMLElement): this {
        if ( node instanceof BetterHTMLElement )
            node.e.append(this.e);
        else
            node.append(this.e);
        
        return this;
    }
    
    /**Insert at least one `node` just before `this`. Any `node` can be either `BetterHTMLElement`s or vanilla `Node`.*/
    before(...nodes: Array<BetterHTMLElement | Node>): this {
        for ( let node of nodes ) {
            if ( node instanceof BetterHTMLElement )
                this.e.before(node.e);
            else
                this.e.before(node);
        }
        return this;
    }
    
    /**Insert `this` just before a `BetterHTMLElement` or a vanilla `Node`s.*/
    insertBefore(node: BetterHTMLElement | HTMLElement): this {
        if ( node instanceof BetterHTMLElement )
            node.e.before(this.e);
        else
            node.before(this.e);
        return this;
    }
    
    
    replaceChild(newChild: Node, oldChild: Node): this;
    replaceChild(newChild: BetterHTMLElement, oldChild: BetterHTMLElement): this;
    replaceChild(newChild, oldChild) {
        this.e.replaceChild(newChild, oldChild);
        return this;
    }
    
    private _cache(key: string, child: BetterHTMLElement) {
        this[key] = child;
        this._cachedChildren[key] = child;
    }
    
    /**For each `[key, child]` pair, `append(child)` and store it in `this[key]`. */
    cacheAppend(keyChildPairs: TMap<BetterHTMLElement>): this
    /**For each `[key, child]` tuple, `append(child)` and store it in `this[key]`. */
    cacheAppend(keyChildPairs: [ string, BetterHTMLElement ][]): this
    cacheAppend(keyChildPairs) {
        const _cacheAppend = (_key: string, _child: BetterHTMLElement) => {
            this.append(_child);
            this._cache(_key, _child);
        };
        if ( Array.isArray(keyChildPairs) ) {
            for ( let [ key, child ] of keyChildPairs )
                _cacheAppend(key, child);
        } else {
            for ( let [ key, child ] of enumerate(keyChildPairs) )
                _cacheAppend(key, child);
        }
        return this;
    }
    
    /**Get a child with `querySelector` and return a `BetterHTMLElement` of it*/
    child<K extends HTMLTag>(selector: K): BetterHTMLElement;
    /**Get a child with `querySelector` and return a `BetterHTMLElement` of it*/
    child(selector: string): BetterHTMLElement;
    child(selector) {
        return new BetterHTMLElement({ htmlElement : this.e.querySelector(selector) });
    }
    
    
    /**Return a `BetterHTMLElement` list of all children */
    children(): BetterHTMLElement[];
    /**Return a `BetterHTMLElement` list of all children selected by `selector` */
    children<K extends HTMLTag>(selector: K): BetterHTMLElement[];
    /**Return a `BetterHTMLElement` list of all children selected by `selector` */
    children(selector: string | HTMLTag): BetterHTMLElement[];
    children(selector?) {
        let childrenVanilla;
        let childrenCollection;
        if ( selector === undefined ) {
            childrenCollection = this.e.children;
        } else {
            childrenCollection = this.e.querySelectorAll(selector);
        }
        childrenVanilla = <HTMLElement[]> Array.from(childrenCollection);
        const toElem = (c: HTMLElement) => new BetterHTMLElement({ htmlElement : c });
        return childrenVanilla.map(toElem);
    }
    
    clone(deep?: boolean): BetterHTMLElement {
        // @ts-ignore
        return new BetterHTMLElement({ htmlElement : this.e.cloneNode(deep) });
    }
    
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
    cacheChildren(queryMap: TMap<QuerySelector>): this
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
    cacheChildren(recursiveQueryMap: TRecMap<QuerySelector>): this
    cacheChildren(bheMap: TMap<BetterHTMLElement>): this
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
    
    cacheChildren(recursiveBHEMap: TRecMap<BetterHTMLElement>): this
    /**key: string. value: either "selector string" OR {"selector string": <recurse down>}*/
    cacheChildren(map) {
        for ( let [ key, value ] of enumerate(map) ) {
            let type = typeof value;
            if ( isObject(value) ) {
                if ( value instanceof BetterHTMLElement ) {
                    this._cache(key, value)
                } else {
                    let entries = Object.entries(value);
                    if ( entries[1] !== undefined ) {
                        console.warn(
                            `cacheChildren() received recursive obj with more than 1 selector for a key. Using only 0th selector`, {
                                key,
                                "multiple selectors" : entries.map(e => e[0]),
                                value,
                                this : this
                            }
                        );
                    }
                    // only first because 1:1 for key:selector.
                    // (ie can't do {right: {.right: {...}, .right2: {...}})
                    let [ selector, obj ] = entries[0];
                    this._cache(key, this.child(selector));
                    this[key].cacheChildren(obj)
                }
            } else if ( type === "string" ) {
                this._cache(key, this.child(value));
            } else {
                console.warn(`cacheChildren, bad value type: "${type}". key: "${key}", value: "${value}". map:`, map,);
            }
        }
        return this;
        
    }
    
    /**Remove all children from DOM*/
    empty(): this {
        // TODO: is this faster than innerHTML = ""?
        while ( this.e.firstChild )
            this.e.removeChild(this.e.firstChild);
        return this;
    }
    
    /**Remove element from DOM*/
    remove(): this {
        this.e.remove();
        return this;
    }
    
    // TODO: recursively yield children
    //  (unlike .children(), this doesn't return only the first level)
    /**@deprecated*/
    find() {
        // https://api.jquery.com/find/
        throw new Error("NOT IMPLEMENTED")
    }
    
    /**@deprecated*/
    first() {
        // https://api.jquery.com/first/
        // this.e.firstChild
        throw new Error("NOT IMPLEMENTED")
    }
    
    /**@deprecated*/
    last() {
        // https://api.jquery.com/last/
        // this.e.lastChild
        throw new Error("NOT IMPLEMENTED")
    }
    
    /**@deprecated*/
    next() {
        throw new Error("NOT IMPLEMENTED")
    }
    
    /**@deprecated*/
    not() {
        throw new Error("NOT IMPLEMENTED")
    }
    
    /**@deprecated*/
    parent() {
        throw new Error("NOT IMPLEMENTED")
    }
    
    /**@deprecated*/
    parents() {
        throw new Error("NOT IMPLEMENTED")
    }
    
    
    // ***  Events
    
    on(evTypeFnPairs: TEventFunctionMap<TEvent>, options?: AddEventListenerOptions): this {
        for ( let [ evType, evFn ] of enumerate(evTypeFnPairs) ) {
            const _f = function _f(evt) {
                evFn(evt);
            };
            this.e.addEventListener(evType, _f, options);
            this._listeners[evType] = _f;
        }
        return this;
    }
    
    once(evType: TEvent, listener: FunctionRecievesEvent<TEvent>, options?: AddEventListenerOptions): this {
        const evTypeFnPairs = {};
        evTypeFnPairs[evType] = listener;
        options = options === undefined ? { once : true } : { ...options, once : true };
        return this.on(evTypeFnPairs, options);
    }
    
    /**Remove `event` from wrapped element's event listeners, but keep the removed listener in cache.
     * This is useful for later unblocking*/
    blockListener(event: TEvent) {
        let listener = this._listeners[event];
        if ( listener === undefined ) {
            // @ts-ignore
            return console.warn(`blockListener(event): this._listeners[event] is undefined. event:`, event);
        }
        this.e.removeEventListener(event, listener);
        return this;
    }
    
    unblockListener(event: TEvent) {
        let listener = this._listeners[event];
        if ( listener === undefined ) {
            // @ts-ignore
            return console.warn(`unblockListener(event): this._listeners[event] is undefined. event:`, event);
        }
        this.e.addEventListener(event, listener);
        return this;
    }
    
    /*
     Chronology:
     mousedown      touchstart	pointerdown
     mouseenter		            pointerenter
     mouseleave		            pointerleave
     mousemove      touchmove	pointermove
     mouseout		            pointerout
     mouseover		            pointerover
     mouseup	    touchend    pointerup
     */
    /** Add a `touchstart` event listener. This is the fast alternative to `click` listeners for mobile (no 300ms wait). */
    touchstart(fn: (ev: TouchEvent) => any, options?: AddEventListenerOptions): this {
        this.e.addEventListener('touchstart', function _f(ev: TouchEvent) {
            ev.preventDefault(); // otherwise "touchmove" is triggered
            fn(ev);
            if ( options && options.once ) // TODO: maybe native options.once is enough
                this.removeEventListener('touchstart', _f);
        }, options);
        // TODO: this._listeners, or use this.on(
        return this;
    }
    
    pointerenter(fn: (event: PointerEvent) => any, options?: AddEventListenerOptions): this {
        return this.on({ pointerenter : fn }, options);
    }
    
    /** Add a `pointerdown` event listener if browser supports `pointerdown`, else send `mousedown` (safari). */
    pointerdown(fn: (event: PointerEvent | MouseEvent) => any, options?: AddEventListenerOptions): this {
        
        let action;
        // TODO: check if PointerEvent exists and store in var outside class
        try {
            action = window.PointerEvent ? 'pointerdown' : 'mousedown'; // safari doesn't support pointerdown
        } catch ( e ) {
            action = 'mousedown'
        }
        const _f = function _f(ev: PointerEvent | MouseEvent): void {
            ev.preventDefault();
            fn(ev);
            if ( options && options.once ) // TODO: maybe native options.once is enough
                this.removeEventListener(action, _f);
        };
        this.e.addEventListener(action, _f, options);
        this._listeners.pointerdown = _f;
        return this;
    }
    
    /**Simulate a click of the element. Useful for `<a>` elements.*/
    click(): this;
    /**Add a `click` event listener. You should probably use `pointerdown()` if on desktop, or `touchstart()` if on mobile.*/
    click(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    click(fn?, options?) {
        if ( fn === undefined ) {
            this.e.click();
            return this;
        } else {
            return this.on({ click : fn }, options);
        }
    }
    
    /**Blur (unfocus) the element.*/
    blur(): this;
    /**Add a `blur` event listener*/
    blur(fn: (event: FocusEvent) => any, options?: AddEventListenerOptions): this;
    blur(fn?, options?) {
        if ( fn === undefined ) {
            this.e.blur();
            return this;
        } else {
            return this.on({ blur : fn }, options)
        }
    }
    
    /**Focus the element.*/
    focus(): this;
    /**Add a `focus` event listener*/
    focus(fn: (event: FocusEvent) => any, options?: AddEventListenerOptions): this;
    focus(fn?, options?) {
        if ( fn === undefined ) {
            this.e.focus();
            return this;
        } else {
            return this.on({ focus : fn }, options)
        }
    }
    
    
    /**Add a `change` event listener*/
    change(fn: (event: Event) => any, options?: AddEventListenerOptions): this {
        return this.on({ change : fn }, options);
    }
    
    /**Add a `contextmenu` event listener*/
    contextmenu(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this {
        return this.on({ contextmenu : fn }, options);
    }
    
    /**Simulate a double click of the element.*/
    dblclick(): this;
    /**Add a `dblclick` event listener*/
    dblclick(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    dblclick(fn?, options?) {
        if ( fn === undefined ) {
            const dblclick = new MouseEvent('dblclick', {
                'view' : window,
                'bubbles' : true,
                'cancelable' : true
            });
            this.e.dispatchEvent(dblclick);
            return this;
        } else {
            return this.on({ dblclick : fn }, options)
        }
    }
    
    /**Simulate a mouseenter event to the element.*/
    mouseenter(): this;
    /**Add a `mouseenter` event listener*/
    mouseenter(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    mouseenter(fn?, options?) {
        // mouseover: also child elements
        // mouseenter: only bound element
        
        if ( fn === undefined ) {
            const mouseenter = new MouseEvent('mouseenter', {
                'view' : window,
                'bubbles' : true,
                'cancelable' : true
            });
            this.e.dispatchEvent(mouseenter);
            return this;
        } else {
            return this.on({ mouseenter : fn }, options)
        }
    }
    
    /**Simulate a keydown event to the element.*/
    // @ts-ignore
    keydown(): this;
    /**Add a `keydown` event listener*/
    keydown(fn: (event: KeyboardEvent) => any, options?: AddEventListenerOptions): this;
    keydown(fn?, options?) {
        if ( fn === undefined ) throw new Error("NOT IMPLEMENTED");
        else
            return this.on({ keydown : fn }, options)
    }
    
    /**@deprecated*/
    keyup() {
        // https://api.jquery.com/keyup/
        throw new Error("NOT IMPLEMENTED")
    }
    
    /**@deprecated*/
    keypress() {
        // https://api.jquery.com/keypress/
        throw new Error("NOT IMPLEMENTED")
    }
    
    /**@deprecated*/
    hover() {
        // https://api.jquery.com/hover/
        // binds to both mouseenter and mouseleave
        // https://stackoverflow.com/questions/17589420/when-to-choose-mouseover-and-hover-function
        throw new Error("NOT IMPLEMENTED")
    }
    
    /**@deprecated*/
    mousedown() {
        // https://api.jquery.com/keypress/
        throw new Error("NOT IMPLEMENTED")
    }
    
    /**@deprecated*/
    mouseleave() {
        // https://api.jquery.com/keypress/
        //mouseleave and mouseout are similar but differ in that mouseleave does not bubble and mouseout does.
        // This means that mouseleave is fired when the pointer has exited the element and all of its descendants,
        // whereas mouseout is fired when the pointer leaves the element or leaves one of the element's descendants
        // (even if the pointer is still within the element).
        throw new Error("NOT IMPLEMENTED")
    }
    
    /**@deprecated*/
    mousemove() {
        // https://api.jquery.com/keypress/
        throw new Error("NOT IMPLEMENTED")
    }
    
    /**Simulate a mouseout event to the element.*/
    // @ts-ignore
    mouseout(): this;
    /**Add a `mouseout` event listener*/
    mouseout(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    mouseout(fn?, options?) {
        //mouseleave and mouseout are similar but differ in that mouseleave does not bubble and mouseout does.
        // This means that mouseleave is fired when the pointer has exited the element and all of its descendants,
        // whereas mouseout is fired when the pointer leaves the element or leaves one of the element's descendants
        // (even if the pointer is still within the element).
        if ( fn === undefined ) throw new Error("NOT IMPLEMENTED");
        else
            return this.on({ mouseout : fn }, options)
    }
    
    /**Simulate a mouseover event to the element.*/
    mouseover(): this;
    /**Add a `mouseover` event listener*/
    mouseover(fn: (event: MouseEvent) => any, options?: AddEventListenerOptions): this;
    mouseover(fn?, options?) {
        // mouseover: also child elements
        // mouseenter: only bound element
        if ( fn === undefined ) throw new Error("NOT IMPLEMENTED");
        else
            return this.on({ mouseover : fn }, options)
    }
    
    /**@deprecated*/
    mouseup() {
        // https://api.jquery.com/keypress/
        throw new Error("NOT IMPLEMENTED")
    }
    
    transform(options: TransformOptions) {
        let transform: string = '';
        for ( let [ k, v ] of enumerate(options) ) {
            transform += `${k}(${v}) `
        }
        return new Promise(resolve => {
            this.on({
                transitionend : resolve
            }, { once : true });
            this.css({ transform })
        })
    }
    
    /** Remove the event listener of `event`, if exists.*/
    off(event: TEvent): this {
        this.e.removeEventListener(event, this._listeners[event]);
        return this;
    }
    
    allOff(): this {
        for ( let event in this._listeners ) {
            this.off(<TEvent> event);
        }
        return this;
    }
    
    // ***  Attributes
    
    /** For each `[attr, val]` pair, apply `setAttribute`*/
    attr(attrValPairs: TMap<string | boolean>): this
    /** apply `getAttribute`*/
    attr(attributeName: string): string
    attr(attrValPairs) {
        if ( typeof attrValPairs === 'string' ) {
            return this.e.getAttribute(attrValPairs);
        } else {
            for ( let [ attr, val ] of enumerate(attrValPairs) )
                this.e.setAttribute(attr, val);
            return this;
        }
    }
    
    /** `removeAttribute` */
    removeAttr(qualifiedName: string, ...qualifiedNames: string[]): this {
        let _removeAttribute;
        if ( this._isSvg )
            _removeAttribute = (qualifiedName) => this.e.removeAttributeNS(SVG_NS_URI, qualifiedName);
        else
            _removeAttribute = (qualifiedName) => this.e.removeAttribute(qualifiedName);
        
        _removeAttribute(qualifiedName);
        for ( let qn of qualifiedNames )
            _removeAttribute(qn);
        return this;
    }
    
    /**`getAttribute(`data-${key}`)`. JSON.parse it by default.*/
    data(key: string, parse: boolean = true): string | TMap<string> {
        // TODO: jquery doesn't affect data-* attrs in DOM. https://api.jquery.com/data/
        const data = this.e.getAttribute(`data-${key}`);
        if ( parse === true )
            return JSON.parse(data);
        else
            return data
    }
    
    protected getOpacityTransitionDuration(): number {
        if ( !this._computedStyle ) {
            this._computedStyle = getComputedStyle(this.e);
        }
        
        const { transitionProperty, transitionDuration } = this._computedStyle;
        const transProp = transitionProperty.split(', ');
        const indexOfOpacity = transProp.indexOf('opacity');
        if ( indexOfOpacity !== -1 ) {
            const transDur = transitionDuration.split(', ');
            const opacityTransDur = transDur[indexOfOpacity];
            if ( opacityTransDur.includes('m') ) {
                return parseInt(opacityTransDur)
            } else {
                return parseFloat(opacityTransDur) * 1000
            }
        }
        console.warn(`getOpacityTransitionDuration() returning undefined`);
        return undefined;
    }
    
    // **  Fade
    async fade(dur: number, to: 0 | 1): Promise<this> {
        const styles = window.getComputedStyle(this.e);
        const transProp = styles.transitionProperty.split(', ');
        const indexOfOpacity = transProp.indexOf('opacity');
        // css opacity:0 => transDur[indexOfOpacity]: 0s
        // css opacity:500ms => transDur[indexOfOpacity]: 0.5s
        // css NO opacity => transDur[indexOfOpacity]: undefined
        if ( indexOfOpacity !== -1 ) {
            const transDur = styles.transitionDuration.split(', ');
            const opacityTransDur = transDur[indexOfOpacity];
            const trans = styles.transition.split(', ');
            // transition: opacity was defined in css.
            // set transition to dur, set opacity to 0, leave the animation to native transition, wait dur and return this
            console.warn(`fade(${dur}, ${to}), opacityTransDur !== undefined. nullifying transition. SHOULD NOT WORK`);
            console.log(`trans:\t${trans}\ntransProp:\t${transProp}\nindexOfOpacity:\t${indexOfOpacity}\nopacityTransDur:\t${opacityTransDur}`);
            // trans.splice(indexOfOpacity, 1, `opacity ${dur / 1000}s`);
            trans.splice(indexOfOpacity, 1, `opacity 0s`);
            console.log(`after, trans: ${trans}`);
            this.e.style.transition = trans.join(', ');
            this.css({ opacity : to });
            await wait(dur);
            return this;
        }
        // transition: opacity was NOT defined in css.
        if ( dur == 0 ) {
            return this.css({ opacity : to });
        }
        const isFadeOut = to === 0;
        let opacity = parseFloat(this.e.style.opacity);
        
        if ( opacity === undefined || isNaN(opacity) ) {
            console.warn(`fade(${dur}, ${to}) htmlElement has NO opacity at all. recursing`, {
                opacity,
                this : this
            });
            return this.css({ opacity : Math.abs(1 - to) }).fade(dur, to)
        } else {
            
            if ( isFadeOut ? opacity <= 0 : opacity > 1 ) {
                console.warn(`fade(${dur}, ${to}) opacity was beyond target opacity. returning this as is.`, {
                    opacity,
                    this : this
                });
                return this;
            }
        }
        
        let steps = 30;
        let opStep = 1 / steps;
        let everyms = dur / steps;
        if ( everyms < 1 ) {
            everyms = 1;
            steps = dur;
            opStep = 1 / steps;
        }
        console.log(`fade(${dur}, ${to}) had opacity, no transition. (good) opacity: ${opacity}`, {
            steps,
            opStep,
            everyms
        });
        const reachedTo = isFadeOut ? (op) => op - opStep > 0 : (op) => op + opStep < 1;
        const interval = setInterval(() => {
            if ( reachedTo(opacity) ) {
                if ( isFadeOut === true )
                    opacity -= opStep;
                else
                    opacity += opStep;
                this.css({ opacity });
            } else {
                opacity = to;
                this.css({ opacity });
                clearInterval(interval);
            }
        }, everyms);
        await wait(dur);
        return this;
    }
    
    async fadeOut(dur: number): Promise<this> {
        return await this.fade(dur, 0);
    }
    
    
    async fadeIn(dur: number): Promise<this> {
        return await this.fade(dur, 1);
    }
    
    
}

class Div extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLDivElement;
    readonly e: HTMLDivElement;
    
    /**Create a Div element. Optionally set its id, text or cls.*/
    constructor({ id, text, cls }: SubElemConstructor = {}) {
        super({ tag : 'div', text, cls });
        if ( id !== undefined )
            this.id(id);
    }
}

class Paragraph extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLParagraphElement;
    readonly e: HTMLParagraphElement;
    
    /**Create a Paragraph element. Optionally set its id, text or cls.*/
    constructor({ id, text, cls }: SubElemConstructor = {}) {
        super({ tag : 'p', text, cls });
        if ( id !== undefined )
            this.id(id);
    }
}

class Span extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLSpanElement;
    readonly e: HTMLSpanElement;
    
    /**Create a Span element. Optionally set its id, text or cls.*/
    constructor({ id, text, cls }: SubElemConstructor = {}) {
        super({ tag : 'span', text, cls });
        if ( id !== undefined )
            this.id(id);
        
    }
}

class Img extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLImageElement;
    
    /**Create an Img element. Optionally set its id, src or cls.*/
    constructor({ id, src, cls }: ImgConstructor) {
        super({ tag : 'img', cls });
        if ( id !== undefined )
            this.id(id);
        if ( src !== undefined )
            this._htmlElement.src = src;
        
    }
    
    src(src: string): this;
    src(): string;
    src(src?) {
        if ( src === undefined ) {
            return this._htmlElement.src
        } else {
            this._htmlElement.src = src;
            return this;
        }
    }
    
    readonly e: HTMLImageElement;
}

class Button extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLButtonElement;
    
    /**Create a Button element. Optionally set its id, cls, html or click function*/
    constructor({ id, cls, click, html }: ButtonConstructor) {
        super({ tag : 'button', cls });
        if ( id !== undefined )
            this.id(id);
        if ( click !== undefined )
            this.click(click);
        if ( html !== undefined )
            this.html(html);
        this.attr({ type : 'button' })
        
        
    }
    
    
    readonly e: HTMLButtonElement;
}

class Anchor extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLAnchorElement;
    readonly e: HTMLAnchorElement;
    
    /**Create an Anchor element. Optionally set its id, text, href or cls.*/
    constructor({ id, text, cls, href }: AnchorConstructor = {}) {
        super({ tag : 'a', text, cls });
        if ( id !== undefined )
            this.id(id);
        if ( href !== undefined )
            this.href(href)
        
    }
    
    href(): string
    href(val: string): this
    href(val?) {
        if ( val === undefined )
            return this.attr('href');
        else
            return this.attr({ href : val })
    }
    
    target(): string
    target(val: string): this
    target(val?) {
        if ( val === undefined )
            return this.attr('target');
        else
            return this.attr({ target : val })
    }
}

class Input extends BetterHTMLElement {
    protected readonly _htmlElement: HTMLInputElement;
    readonly e: HTMLInputElement;
    
    constructor({ id, text, cls, placeholder, type }: InputConstructor = {}) {
        super({ tag : 'input', text, cls });
        
        if ( id !== undefined )
            this.id(id);
        if ( placeholder !== undefined )
            this.attr({ placeholder, type : type ?? 'text' })
    }
    
    get placeholder(): string {
        return this.e.placeholder;
    }
    
    set placeholder(val: string) {
        this.e.placeholder = val;
    }
    
    get value(): string {
        return this.e.value;
    }
    
    set value(val: string) {
        this.e.value = val;
    }
}

class VisualBHE extends BetterHTMLElement {
    protected _opacTransDur: number;
    
    constructor(options) {
        super(options);
        this.setOpacTransDur();
    }
    
    setOpacTransDur(): VisualBHE {
        this._opacTransDur = this.getOpacityTransitionDuration();
        return this;
    }
    
    async display() {
        this.addClass('active');
        return await wait(this._opacTransDur, false);
    }
    
    async hide() {
        this.removeClass('active');
        return await wait(this._opacTransDur, false);
    }
}


/*class Svg extends BetterHTMLElement{
 protected readonly _htmlElement: SVGElement;
 constructor({id, cls,htmlElement}: SvgConstructor) {
 super({tag: 'svg', cls});
 if (id)
 this.id(id);
 if (src)
 this._htmlElement.src = src;
 
 }
 }
 */
customElements.define('better-html-element', BetterHTMLElement);
customElements.define('better-div', Div, { extends : 'div' });
customElements.define('better-p', Paragraph, { extends : 'p' });
customElements.define('better-span', Span, { extends : 'span' });
customElements.define('better-img', Img, { extends : 'img' });
customElements.define('better-a', Anchor, { extends : 'a' });
customElements.define('better-button', Button, { extends : 'button' });
customElements.define('better-input', Input, { extends : 'input' });

// customElements.define('better-svg', Svg, {extends: 'svg'});

/**Create an element of `tag`. Optionally, set its `text` and / or `cls`*/
function elem({ tag, text, cls }: { tag: QuerySelector, text?: string, cls?: string }): BetterHTMLElement;
/**Get an existing element by `id`. Optionally, set its `text`, `cls` or cache `children`*/
function elem({ id, text, cls, children }: { id: string, text?: string, cls?: string, children?: ChildrenObj }): BetterHTMLElement;
/**Get an existing element by `query`. Optionally, set its `text`, `cls` or cache `children`*/
function elem({ query, text, cls, children }: { query: QuerySelector, text?: string, cls?: string, children?: ChildrenObj }): BetterHTMLElement;
/**Wrap an existing HTMLElement. Optionally, set its `text`, `cls` or cache `children`*/
function elem({ htmlElement, text, cls, children }: { htmlElement: HTMLElement, text?: string, cls?: string, children?: ChildrenObj }): BetterHTMLElement;
function elem(elemOptions): BetterHTMLElement {
    return new BetterHTMLElement(elemOptions);
}

/**Create a Span element. Optionally set its id, text or cls.*/
function span({ id, text, cls }: SubElemConstructor = {}): Span {
    return new Span({ id, text, cls });
}

/**Create an Div element. Optionally set its id, text or cls.*/
function div({ id, text, cls }: SubElemConstructor = {}): Div {
    return new Div({ id, text, cls });
}

/**Create an Img element. Optionally set its id, src or cls.*/
function img({ id, src, cls }: ImgConstructor = {}): Img {
    return new Img({ id, src, cls });
}

/**Create a Button element. Optionally set its id, cls, html or click function*/
function button({ id, cls, click, html }: ButtonConstructor = {}): Button {
    return new Button({ id, cls, click, html });
}

/**Create a Paragraph element. Optionally set its id, text or cls.*/
function paragraph({ id, text, cls }: SubElemConstructor = {}): Paragraph {
    return new Paragraph({ id, text, cls });
}

/**Create an Anchor element. Optionally set its id, text, href or cls.*/
function anchor({ id, text, cls, href }: AnchorConstructor = {}): Anchor {
    return new Anchor({ id, text, cls, href });
}

/**Create an Input element. Optionally set its `id`, `text`, `cls`, `placeholder`, or `type`. `type` defaults to `text`.*/
function input({ id, text, cls, placeholder, type }: InputConstructor = {}): Input {
    return new Input({ id, text, cls, placeholder, type });
}


function visualbhe(elemOptions): VisualBHE {
    return new VisualBHE(elemOptions);
}

export { elem, span, div, img, paragraph, anchor, button, input, visualbhe, BetterHTMLElement, Div, Button, Span, Input, VisualBHE }
