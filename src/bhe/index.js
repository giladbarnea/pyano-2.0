"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SVG_NS_URI = 'http://www.w3.org/2000/svg';
class BetterHTMLElement {
    constructor(elemOptions) {
        this._isSvg = false;
        this._listeners = {};
        this._cachedChildren = {};
        const { tag, id, htmlElement, text, query, children, cls } = elemOptions;
        if ([tag, id, htmlElement, query].filter(x => x !== undefined).length > 1) {
            throw new BadArgumentsAmountError(1, {
                tag,
                id,
                htmlElement,
                query
            });
        }
        if (tag !== undefined && children !== undefined)
            throw new BadArgumentsAmountError(1, {
                tag,
                children
            }, '"children" and "tag" options are mutually exclusive, because tag implies creating a new element and children implies getting an existing one.');
        if (tag !== undefined) {
            if (['svg', 'path'].includes(tag.toLowerCase())) {
                this._isSvg = true;
                this._htmlElement = document.createElementNS(SVG_NS_URI, tag);
            }
            else {
                this._htmlElement = document.createElement(tag);
            }
        }
        else if (id !== undefined)
            this._htmlElement = document.getElementById(id);
        else if (query !== undefined)
            this._htmlElement = document.querySelector(query);
        else if (htmlElement !== undefined)
            this._htmlElement = htmlElement;
        else {
            throw new BadArgumentsAmountError(1, {
                tag,
                id,
                htmlElement,
                query
            });
        }
        if (text !== undefined)
            this.text(text);
        if (cls !== undefined)
            this.class(cls);
        if (children !== undefined)
            this.cacheChildren(children);
    }
    get e() {
        return this._htmlElement;
    }
    wrapSomethingElse(newHtmlElement) {
        this._cachedChildren = {};
        if (newHtmlElement instanceof BetterHTMLElement) {
            this._htmlElement.replaceWith(newHtmlElement.e);
            this._htmlElement = newHtmlElement.e;
            for (let [_key, _cachedChild] of enumerate(newHtmlElement._cachedChildren)) {
                this._cache(_key, _cachedChild);
            }
            if (Object.keys(this._cachedChildren).length
                !== Object.keys(newHtmlElement._cachedChildren).length
                ||
                    Object.values(this._cachedChildren).filter(v => v !== undefined).length
                        !== Object.values(newHtmlElement._cachedChildren).filter(v => v !== undefined).length) {
                console.warn(`wrapSomethingElse this._cachedChildren length !== newHtmlElement._cachedChildren.length`, {
                    this: this,
                    newHtmlElement
                });
            }
            this.on(Object.assign(Object.assign({}, this._listeners), newHtmlElement._listeners));
        }
        else {
            this.on(this._listeners);
            this._htmlElement.replaceWith(newHtmlElement);
            this._htmlElement = newHtmlElement;
        }
        return this;
    }
    html(html) {
        if (html === undefined) {
            return this.e.innerHTML;
        }
        else {
            this.e.innerHTML = html;
            return this;
        }
    }
    text(txt) {
        if (txt === undefined) {
            return this.e.innerText;
        }
        else {
            this.e.innerText = txt;
            return this;
        }
    }
    id(id) {
        if (id === undefined) {
            return this.e.id;
        }
        else {
            this.e.id = id;
            return this;
        }
    }
    css(css) {
        if (typeof css === 'string') {
            return this.e.style[css];
        }
        else {
            for (let [styleAttr, styleVal] of enumerate(css))
                this.e.style[styleAttr] = styleVal;
            return this;
        }
    }
    uncss(...removeProps) {
        let css = {};
        for (let prop of removeProps)
            css[prop] = '';
        return this.css(css);
    }
    is(element) {
        throw new Error("NOT IMPLEMENTED");
    }
    class(cls) {
        if (cls === undefined) {
            return Array.from(this.e.classList);
        }
        else if (isFunction(cls)) {
            return Array.from(this.e.classList).find(cls);
        }
        else {
            if (this._isSvg) {
                this.e.classList = [cls];
            }
            else {
                this.e.className = cls;
            }
            return this;
        }
    }
    addClass(cls, ...clses) {
        this.e.classList.add(cls);
        for (let c of clses)
            this.e.classList.add(c);
        return this;
    }
    removeClass(cls, ...clses) {
        if (isFunction(cls)) {
            this.e.classList.remove(this.class(cls));
            for (let c of clses)
                this.e.classList.remove(this.class(c));
        }
        else {
            this.e.classList.remove(cls);
            for (let c of clses)
                this.e.classList.remove(c);
        }
        return this;
    }
    replaceClass(oldToken, newToken) {
        if (isFunction(oldToken)) {
            this.e.classList.replace(this.class(oldToken), newToken);
        }
        else {
            this.e.classList.replace(oldToken, newToken);
        }
        return this;
    }
    toggleClass(cls, force) {
        if (isFunction(cls))
            this.e.classList.toggle(this.class(cls), force);
        else
            this.e.classList.toggle(cls, force);
        return this;
    }
    hasClass(cls) {
        if (isFunction(cls)) {
            return this.class(cls) !== undefined;
        }
        else {
            return this.e.classList.contains(cls);
        }
    }
    after(...nodes) {
        for (let node of nodes) {
            if (node instanceof BetterHTMLElement)
                this.e.after(node.e);
            else
                this.e.after(node);
        }
        return this;
    }
    insertAfter(node) {
        if (node instanceof BetterHTMLElement)
            node.e.after(this.e);
        else
            node.after(this.e);
        return this;
    }
    append(...nodes) {
        for (let node of nodes) {
            if (node instanceof BetterHTMLElement)
                this.e.append(node.e);
            else if (node instanceof Node)
                this.e.append(node);
            else if (Array.isArray(node))
                this.cacheAppend([node]);
            else
                this.cacheAppend(node);
        }
        return this;
    }
    appendTo(node) {
        if (node instanceof BetterHTMLElement)
            node.e.append(this.e);
        else
            node.append(this.e);
        return this;
    }
    before(...nodes) {
        for (let node of nodes) {
            if (node instanceof BetterHTMLElement)
                this.e.before(node.e);
            else
                this.e.before(node);
        }
        return this;
    }
    insertBefore(node) {
        if (node instanceof BetterHTMLElement)
            node.e.before(this.e);
        else
            node.before(this.e);
        return this;
    }
    replaceChild(newChild, oldChild) {
        this.e.replaceChild(newChild, oldChild);
        return this;
    }
    _cache(key, child) {
        this[key] = child;
        this._cachedChildren[key] = child;
    }
    cacheAppend(keyChildPairs) {
        const _cacheAppend = (_key, _child) => {
            this.append(_child);
            this._cache(_key, _child);
        };
        if (Array.isArray(keyChildPairs)) {
            for (let [key, child] of keyChildPairs)
                _cacheAppend(key, child);
        }
        else {
            for (let [key, child] of enumerate(keyChildPairs))
                _cacheAppend(key, child);
        }
        return this;
    }
    child(selector) {
        return new BetterHTMLElement({ htmlElement: this.e.querySelector(selector) });
    }
    children(selector) {
        let childrenVanilla;
        let childrenCollection;
        if (selector === undefined) {
            childrenCollection = this.e.children;
        }
        else {
            childrenCollection = this.e.querySelectorAll(selector);
        }
        childrenVanilla = Array.from(childrenCollection);
        const toElem = (c) => new BetterHTMLElement({ htmlElement: c });
        return childrenVanilla.map(toElem);
    }
    clone(deep) {
        return new BetterHTMLElement({ htmlElement: this.e.cloneNode(deep) });
    }
    cacheChildren(map) {
        for (let [key, value] of enumerate(map)) {
            let type = typeof value;
            if (isObject(value)) {
                if (value instanceof BetterHTMLElement) {
                    this._cache(key, value);
                }
                else {
                    let entries = Object.entries(value);
                    if (entries[1] !== undefined) {
                        console.warn(`cacheChildren() received recursive obj with more than 1 selector for a key. Using only 0th selector`, {
                            key,
                            "multiple selectors": entries.map(e => e[0]),
                            value,
                            this: this
                        });
                    }
                    let [selector, obj] = entries[0];
                    this._cache(key, this.child(selector));
                    this[key].cacheChildren(obj);
                }
            }
            else if (type === "string") {
                this._cache(key, this.child(value));
            }
            else {
                console.warn(`cacheChildren, bad value type: "${type}". key: "${key}", value: "${value}". map:`, map);
            }
        }
        return this;
    }
    empty() {
        while (this.e.firstChild)
            this.e.removeChild(this.e.firstChild);
        return this;
    }
    remove() {
        this.e.remove();
        return this;
    }
    find() {
        throw new Error("NOT IMPLEMENTED");
    }
    first() {
        throw new Error("NOT IMPLEMENTED");
    }
    last() {
        throw new Error("NOT IMPLEMENTED");
    }
    next() {
        throw new Error("NOT IMPLEMENTED");
    }
    not() {
        throw new Error("NOT IMPLEMENTED");
    }
    parent() {
        throw new Error("NOT IMPLEMENTED");
    }
    parents() {
        throw new Error("NOT IMPLEMENTED");
    }
    on(evTypeFnPairs, options) {
        for (let [evType, evFn] of enumerate(evTypeFnPairs)) {
            const _f = function _f(evt) {
                evFn(evt);
            };
            this.e.addEventListener(evType, _f, options);
            this._listeners[evType] = _f;
        }
        return this;
    }
    one(evType, listener, options) {
        const evTypeFnPairs = {};
        evTypeFnPairs[evType] = listener;
        options = options === undefined ? { once: true } : Object.assign(Object.assign({}, options), { once: true });
        return this.on(evTypeFnPairs, options);
    }
    blockListener(event) {
        let listener = this._listeners[event];
        if (listener === undefined) {
            return console.warn(`blockListener(event): this._listeners[event] is undefined. event:`, event);
        }
        this.e.removeEventListener(event, listener);
        return this;
    }
    unblockListener(event) {
        let listener = this._listeners[event];
        if (listener === undefined) {
            return console.warn(`unblockListener(event): this._listeners[event] is undefined. event:`, event);
        }
        this.e.addEventListener(event, listener);
        return this;
    }
    touchstart(fn, options) {
        this.e.addEventListener('touchstart', function _f(ev) {
            ev.preventDefault();
            fn(ev);
            if (options && options.once)
                this.removeEventListener('touchstart', _f);
        }, options);
        return this;
    }
    pointerenter(fn, options) {
        return this.on({ pointerenter: fn }, options);
    }
    pointerdown(fn, options) {
        let action;
        try {
            action = window.PointerEvent ? 'pointerdown' : 'mousedown';
        }
        catch (e) {
            action = 'mousedown';
        }
        const _f = function _f(ev) {
            ev.preventDefault();
            fn(ev);
            if (options && options.once)
                this.removeEventListener(action, _f);
        };
        this.e.addEventListener(action, _f, options);
        this._listeners.pointerdown = _f;
        return this;
    }
    click(fn, options) {
        if (fn === undefined) {
            this.e.click();
            return this;
        }
        else {
            return this.on({ click: fn }, options);
        }
    }
    blur(fn, options) {
        if (fn === undefined) {
            this.e.blur();
            return this;
        }
        else {
            return this.on({ blur: fn }, options);
        }
    }
    focus(fn, options) {
        if (fn === undefined) {
            this.e.focus();
            return this;
        }
        else {
            return this.on({ focus: fn }, options);
        }
    }
    change(fn, options) {
        return this.on({ change: fn }, options);
    }
    contextmenu(fn, options) {
        return this.on({ contextmenu: fn }, options);
    }
    dblclick(fn, options) {
        if (fn === undefined) {
            const dblclick = new MouseEvent('dblclick', {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });
            this.e.dispatchEvent(dblclick);
            return this;
        }
        else {
            return this.on({ dblclick: fn }, options);
        }
    }
    mouseenter(fn, options) {
        if (fn === undefined) {
            const mouseenter = new MouseEvent('mouseenter', {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });
            this.e.dispatchEvent(mouseenter);
            return this;
        }
        else {
            return this.on({ mouseenter: fn }, options);
        }
    }
    keydown(fn, options) {
        if (fn === undefined)
            throw new Error("NOT IMPLEMENTED");
        else
            return this.on({ keydown: fn }, options);
    }
    keyup() {
        throw new Error("NOT IMPLEMENTED");
    }
    keypress() {
        throw new Error("NOT IMPLEMENTED");
    }
    hover() {
        throw new Error("NOT IMPLEMENTED");
    }
    mousedown() {
        throw new Error("NOT IMPLEMENTED");
    }
    mouseleave() {
        throw new Error("NOT IMPLEMENTED");
    }
    mousemove() {
        throw new Error("NOT IMPLEMENTED");
    }
    mouseout(fn, options) {
        if (fn === undefined)
            throw new Error("NOT IMPLEMENTED");
        else
            return this.on({ mouseout: fn }, options);
    }
    mouseover(fn, options) {
        if (fn === undefined)
            throw new Error("NOT IMPLEMENTED");
        else
            return this.on({ mouseover: fn }, options);
    }
    mouseup() {
        throw new Error("NOT IMPLEMENTED");
    }
    transform(options) {
        let transform = '';
        for (let [k, v] of enumerate(options)) {
            transform += `${k}(${v}) `;
        }
        return new Promise(resolve => {
            this.on({
                transitionend: resolve
            }, { once: true });
            this.css({ transform });
        });
    }
    off(event) {
        this.e.removeEventListener(event, this._listeners[event]);
        return this;
    }
    allOff() {
        for (let event in this._listeners) {
            this.off(event);
        }
        return this;
    }
    attr(attrValPairs) {
        if (typeof attrValPairs === 'string') {
            return this.e.getAttribute(attrValPairs);
        }
        else {
            for (let [attr, val] of enumerate(attrValPairs))
                this.e.setAttribute(attr, val);
            return this;
        }
    }
    removeAttr(qualifiedName, ...qualifiedNames) {
        let _removeAttribute;
        if (this._isSvg)
            _removeAttribute = (qualifiedName) => this.e.removeAttributeNS(SVG_NS_URI, qualifiedName);
        else
            _removeAttribute = (qualifiedName) => this.e.removeAttribute(qualifiedName);
        _removeAttribute(qualifiedName);
        for (let qn of qualifiedNames)
            _removeAttribute(qn);
        return this;
    }
    data(key, parse = true) {
        const data = this.e.getAttribute(`data-${key}`);
        if (parse === true)
            return JSON.parse(data);
        else
            return data;
    }
    async fade(dur, to) {
        const styles = window.getComputedStyle(this.e);
        const transProp = styles.transitionProperty.split(', ');
        const indexOfOpacity = transProp.indexOf('opacity');
        if (indexOfOpacity !== -1) {
            const transDur = styles.transitionDuration.split(', ');
            const opacityTransDur = transDur[indexOfOpacity];
            const trans = styles.transition.split(', ');
            console.warn(`fade(${dur}, ${to}), opacityTransDur !== undefined. nullifying transition. SHOULD NOT WORK`);
            console.log(`trans:\t${trans}\ntransProp:\t${transProp}\nindexOfOpacity:\t${indexOfOpacity}\nopacityTransDur:\t${opacityTransDur}`);
            trans.splice(indexOfOpacity, 1, `opacity 0s`);
            console.log(`after, trans: ${trans}`);
            this.e.style.transition = trans.join(', ');
            this.css({ opacity: to });
            await wait(dur);
            return this;
        }
        if (dur == 0) {
            return this.css({ opacity: to });
        }
        const isFadeOut = to === 0;
        let opacity = parseFloat(this.e.style.opacity);
        if (opacity === undefined || isNaN(opacity)) {
            console.warn(`fade(${dur}, ${to}) htmlElement has NO opacity at all. recursing`, {
                opacity,
                this: this
            });
            return this.css({ opacity: Math.abs(1 - to) }).fade(dur, to);
        }
        else {
            if (isFadeOut ? opacity <= 0 : opacity > 1) {
                console.warn(`fade(${dur}, ${to}) opacity was beyond target opacity. returning this as is.`, {
                    opacity,
                    this: this
                });
                return this;
            }
        }
        let steps = 30;
        let opStep = 1 / steps;
        let everyms = dur / steps;
        if (everyms < 1) {
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
            if (reachedTo(opacity)) {
                if (isFadeOut === true)
                    opacity -= opStep;
                else
                    opacity += opStep;
                this.css({ opacity });
            }
            else {
                opacity = to;
                this.css({ opacity });
                clearInterval(interval);
            }
        }, everyms);
        await wait(dur);
        return this;
    }
    async fadeOut(dur) {
        return await this.fade(dur, 0);
    }
    async fadeIn(dur) {
        return await this.fade(dur, 1);
    }
}
class Div extends BetterHTMLElement {
    constructor({ id, text, cls } = {}) {
        super({ tag: 'div', text, cls });
        if (id !== undefined)
            this.id(id);
    }
}
class Paragraph extends BetterHTMLElement {
    constructor({ id, text, cls } = {}) {
        super({ tag: 'p', text, cls });
        if (id !== undefined)
            this.id(id);
    }
}
class Span extends BetterHTMLElement {
    constructor({ id, text, cls } = {}) {
        super({ tag: 'span', text, cls });
        if (id !== undefined)
            this.id(id);
    }
}
class Img extends BetterHTMLElement {
    constructor({ id, src, cls }) {
        super({ tag: 'img', cls });
        if (id !== undefined)
            this.id(id);
        if (src !== undefined)
            this._htmlElement.src = src;
    }
    src(src) {
        if (src === undefined) {
            return this._htmlElement.src;
        }
        else {
            this._htmlElement.src = src;
            return this;
        }
    }
}
class Anchor extends BetterHTMLElement {
    constructor({ id, text, cls, href } = {}) {
        super({ tag: 'a', text, cls });
        if (id !== undefined)
            this.id(id);
        if (href !== undefined)
            this.href(href);
    }
    href(val) {
        if (val === undefined)
            return this.attr('href');
        else
            return this.attr({ href: val });
    }
    target(val) {
        if (val === undefined)
            return this.attr('target');
        else
            return this.attr({ target: val });
    }
}
customElements.define('better-html-element', BetterHTMLElement);
customElements.define('better-div', Div, { extends: 'div' });
customElements.define('better-p', Paragraph, { extends: 'p' });
customElements.define('better-span', Span, { extends: 'span' });
customElements.define('better-img', Img, { extends: 'img' });
customElements.define('better-a', Anchor, { extends: 'a' });
function elem(elemOptions) {
    return new BetterHTMLElement(elemOptions);
}
exports.elem = elem;
function span({ id, text, cls } = {}) {
    return new Span({ id, text, cls });
}
exports.span = span;
function div({ id, text, cls } = {}) {
    return new Div({ id, text, cls });
}
exports.div = div;
function img({ id, src, cls } = {}) {
    return new Img({ id, src, cls });
}
exports.img = img;
function paragraph({ id, text, cls } = {}) {
    return new Paragraph({ id, text, cls });
}
exports.paragraph = paragraph;
function anchor({ id, text, cls, href } = {}) {
    return new Anchor({ id, text, cls, href });
}
exports.anchor = anchor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sVUFBVSxHQUFHLDRCQUE0QixDQUFDO0FBS2hELE1BQU0saUJBQWlCO0lBK0JuQixZQUFZLFdBQVc7UUE3Qk4sV0FBTSxHQUFZLEtBQUssQ0FBQztRQUN4QixlQUFVLEdBQThCLEVBQUUsQ0FBQztRQUNwRCxvQkFBZSxHQUE0QixFQUFFLENBQUM7UUE0QmxELE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxXQUFXLENBQUM7UUFFekUsSUFBSyxDQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFHO1lBQzNFLE1BQU0sSUFBSSx1QkFBdUIsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pDLEdBQUc7Z0JBQ0gsRUFBRTtnQkFDRixXQUFXO2dCQUNYLEtBQUs7YUFDUixDQUFDLENBQUE7U0FFTDtRQUNELElBQUssR0FBRyxLQUFLLFNBQVMsSUFBSSxRQUFRLEtBQUssU0FBUztZQUM1QyxNQUFNLElBQUksdUJBQXVCLENBQUMsQ0FBQyxFQUFFO2dCQUNqQyxHQUFHO2dCQUNILFFBQVE7YUFDWCxFQUFFLCtJQUErSSxDQUFDLENBQUM7UUFFeEosSUFBSyxHQUFHLEtBQUssU0FBUyxFQUFHO1lBQ3JCLElBQUssQ0FBRSxLQUFLLEVBQUUsTUFBTSxDQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFHO2dCQUNqRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDbkIsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENB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RUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBR3lDLHdCQUFNIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgU1ZHX05TX1VSSSA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG5cblxuLy8gVE9ETzogbWFrZSBCZXR0ZXJIVE1MRWxlbWVudDxUPiwgZm9yIHVzZSBpbiBlZyBjaGlsZFtyZW5dIGZ1bmN0aW9uXG4vLyBleHRlbmRzIEhUTUxFbGVtZW50OiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5L3VwZ3JhZGUjRXhhbXBsZXNcbmNsYXNzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgX2h0bWxFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9pc1N2ZzogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2xpc3RlbmVyczogVEV2ZW50RnVuY3Rpb25NYXA8VEV2ZW50PiA9IHt9O1xuICAgIHByaXZhdGUgX2NhY2hlZENoaWxkcmVuOiBUTWFwPEJldHRlckhUTUxFbGVtZW50PiA9IHt9O1xuICAgIFxuICAgIC8qW1N5bWJvbC50b1ByaW1pdGl2ZV0oaGludCkge1xuICAgICBjb25zb2xlLmxvZygnZnJvbSB0b1ByaW1pdGl2ZSwgaGludDogJywgaGludCwgJ1xcbnRoaXM6ICcsIHRoaXMpO1xuICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQ7XG4gICAgIH1cbiAgICAgXG4gICAgIHZhbHVlT2YoKSB7XG4gICAgIGNvbnNvbGUubG9nKCdmcm9tIHZhbHVlT2YsIHRoaXM6ICcsIHRoaXMpO1xuICAgICByZXR1cm4gdGhpcztcbiAgICAgfVxuICAgICBcbiAgICAgdG9TdHJpbmcoKSB7XG4gICAgIGNvbnNvbGUubG9nKCdmcm9tIHRvU3RyaW5nLCB0aGlzOiAnLCB0aGlzKTtcbiAgICAgcmV0dXJuIHRoaXM7XG4gICAgIH1cbiAgICAgKi9cbiAgICBcbiAgICAvLyBUT0RPOiBxdWVyeSBzaG91bGQgYWxzbyBiZSBhIHByZWRpY2F0ZSBmdW5jdGlvblxuICAgIC8qKkNyZWF0ZSBhbiBlbGVtZW50IG9mIGB0YWdgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCBhbmQgLyBvciBgY2xzYCovXG4gICAgY29uc3RydWN0b3IoeyB0YWcsIHRleHQsIGNscyB9OiB7IHRhZzogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nIH0pO1xuICAgIC8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBpZGAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCB0ZXh0LCBjbHMsIGNoaWxkcmVuIH06IHsgaWQ6IHN0cmluZywgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIC8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBxdWVyeWAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IHF1ZXJ5LCB0ZXh0LCBjbHMsIGNoaWxkcmVuIH06IHsgcXVlcnk6IFF1ZXJ5U2VsZWN0b3IsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICAvKipXcmFwIGFuIGV4aXN0aW5nIEhUTUxFbGVtZW50LiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBodG1sRWxlbWVudCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGh0bWxFbGVtZW50OiBIVE1MRWxlbWVudCwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIGNvbnN0cnVjdG9yKGVsZW1PcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHsgdGFnLCBpZCwgaHRtbEVsZW1lbnQsIHRleHQsIHF1ZXJ5LCBjaGlsZHJlbiwgY2xzIH0gPSBlbGVtT3B0aW9ucztcbiAgICAgICAgXG4gICAgICAgIGlmICggWyB0YWcsIGlkLCBodG1sRWxlbWVudCwgcXVlcnkgXS5maWx0ZXIoeCA9PiB4ICE9PSB1bmRlZmluZWQpLmxlbmd0aCA+IDEgKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFkQXJndW1lbnRzQW1vdW50RXJyb3IoMSwge1xuICAgICAgICAgICAgICAgIHRhZyxcbiAgICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgICBodG1sRWxlbWVudCxcbiAgICAgICAgICAgICAgICBxdWVyeVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGlmICggdGFnICE9PSB1bmRlZmluZWQgJiYgY2hpbGRyZW4gIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFkQXJndW1lbnRzQW1vdW50RXJyb3IoMSwge1xuICAgICAgICAgICAgICAgIHRhZyxcbiAgICAgICAgICAgICAgICBjaGlsZHJlblxuICAgICAgICAgICAgfSwgJ1wiY2hpbGRyZW5cIiBhbmQgXCJ0YWdcIiBvcHRpb25zIGFyZSBtdXR1YWxseSBleGNsdXNpdmUsIGJlY2F1c2UgdGFnIGltcGxpZXMgY3JlYXRpbmcgYSBuZXcgZWxlbWVudCBhbmQgY2hpbGRyZW4gaW1wbGllcyBnZXR0aW5nIGFuIGV4aXN0aW5nIG9uZS4nKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggdGFnICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBpZiAoIFsgJ3N2ZycsICdwYXRoJyBdLmluY2x1ZGVzKHRhZy50b0xvd2VyQ2FzZSgpKSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N2ZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TX1VSSSwgdGFnKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLl9odG1sRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3htbG5zJywgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIGlkICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgIGVsc2UgaWYgKCBxdWVyeSAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihxdWVyeSk7XG4gICAgICAgIGVsc2UgaWYgKCBodG1sRWxlbWVudCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gaHRtbEVsZW1lbnQ7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEJhZEFyZ3VtZW50c0Ftb3VudEVycm9yKDEsIHtcbiAgICAgICAgICAgICAgICB0YWcsXG4gICAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgICAgaHRtbEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgcXVlcnlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICggdGV4dCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMudGV4dCh0ZXh0KTtcbiAgICAgICAgaWYgKCBjbHMgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmNsYXNzKGNscyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIGNoaWxkcmVuICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5jYWNoZUNoaWxkcmVuKGNoaWxkcmVuKTtcbiAgICAgICAgXG4gICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcywgcHJveHkpO1xuICAgICAgICAvKmNvbnN0IHRoYXQgPSB0aGlzO1xuICAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh0aGlzLCB7XG4gICAgICAgICBnZXQodGFyZ2V0OiBCZXR0ZXJIVE1MRWxlbWVudCwgcDogc3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sLCByZWNlaXZlcjogYW55KTogYW55IHtcbiAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdsb2dnaW5nJyk7XG4gICAgICAgICAvLyBjb25zb2xlLmxvZygndGFyZ2V0OiAnLCB0YXJnZXQsXG4gICAgICAgICAvLyAgICAgJ1xcbnRoYXQ6ICcsIHRoYXQsXG4gICAgICAgICAvLyAgICAgJ1xcbnR5cGVvZih0aGF0KTogJywgdHlwZW9mICh0aGF0KSxcbiAgICAgICAgIC8vICAgICAnXFxucDogJywgcCxcbiAgICAgICAgIC8vICAgICAnXFxucmVjZWl2ZXI6ICcsIHJlY2VpdmVyLFxuICAgICAgICAgLy8gICAgICdcXG50aGlzOiAnLCB0aGlzKTtcbiAgICAgICAgIHJldHVybiB0aGF0W3BdO1xuICAgICAgICAgfVxuICAgICAgICAgfSlcbiAgICAgICAgICovXG4gICAgfVxuICAgIFxuICAgIC8qKlJldHVybiB0aGUgd3JhcHBlZCBIVE1MRWxlbWVudCovXG4gICAgZ2V0IGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9odG1sRWxlbWVudDtcbiAgICB9XG4gICAgXG4gICAgLyoqU2V0cyBgdGhpcy5faHRtbEVsZW1lbnRgIHRvIGBuZXdIdG1sRWxlbWVudC5faHRtbEVsZW1lbnRgLlxuICAgICAqIFJlc2V0cyBgdGhpcy5fY2FjaGVkQ2hpbGRyZW5gIGFuZCBjYWNoZXMgYG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbmAuXG4gICAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgZnJvbSBgbmV3SHRtbEVsZW1lbnQuX2xpc3RlbmVyc2AsIHdoaWxlIGtlZXBpbmcgYHRoaXMuX2xpc3RlbmVyc2AuKi9cbiAgICB3cmFwU29tZXRoaW5nRWxzZShuZXdIdG1sRWxlbWVudDogQmV0dGVySFRNTEVsZW1lbnQpOiB0aGlzXG4gICAgLyoqU2V0cyBgdGhpcy5faHRtbEVsZW1lbnRgIHRvIGBuZXdIdG1sRWxlbWVudGAuXG4gICAgICogS2VlcHMgYHRoaXMuX2xpc3RlbmVyc2AuXG4gICAgICogTk9URTogdGhpcyByZWluaXRpYWxpemVzIGB0aGlzLl9jYWNoZWRDaGlsZHJlbmAgYW5kIGFsbCBldmVudCBsaXN0ZW5lcnMgYmVsb25naW5nIHRvIGBuZXdIdG1sRWxlbWVudGAgYXJlIGxvc3QuIFBhc3MgYSBgQmV0dGVySFRNTEVsZW1lbnRgIHRvIGtlZXAgdGhlbS4qL1xuICAgIHdyYXBTb21ldGhpbmdFbHNlKG5ld0h0bWxFbGVtZW50OiBOb2RlKTogdGhpc1xuICAgIHdyYXBTb21ldGhpbmdFbHNlKG5ld0h0bWxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX2NhY2hlZENoaWxkcmVuID0ge307XG4gICAgICAgIGlmICggbmV3SHRtbEVsZW1lbnQgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnJlcGxhY2VXaXRoKG5ld0h0bWxFbGVtZW50LmUpO1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBuZXdIdG1sRWxlbWVudC5lO1xuICAgICAgICAgICAgZm9yICggbGV0IFsgX2tleSwgX2NhY2hlZENoaWxkIF0gb2YgZW51bWVyYXRlKG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbikgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoX2tleSBhcyBzdHJpbmcsIF9jYWNoZWRDaGlsZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh0aGlzLl9jYWNoZWRDaGlsZHJlbikubGVuZ3RoXG4gICAgICAgICAgICAgICAgIT09IE9iamVjdC5rZXlzKG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbikubGVuZ3RoXG4gICAgICAgICAgICAgICAgfHxcbiAgICAgICAgICAgICAgICBPYmplY3QudmFsdWVzKHRoaXMuX2NhY2hlZENoaWxkcmVuKS5maWx0ZXIodiA9PiB2ICE9PSB1bmRlZmluZWQpLmxlbmd0aFxuICAgICAgICAgICAgICAgICE9PSBPYmplY3QudmFsdWVzKG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbikuZmlsdGVyKHYgPT4gdiAhPT0gdW5kZWZpbmVkKS5sZW5ndGhcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgd3JhcFNvbWV0aGluZ0Vsc2UgdGhpcy5fY2FjaGVkQ2hpbGRyZW4gbGVuZ3RoICE9PSBuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW4ubGVuZ3RoYCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyA6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdIdG1sRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbih7IC4uLnRoaXMuX2xpc3RlbmVycywgLi4ubmV3SHRtbEVsZW1lbnQuX2xpc3RlbmVycywgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBObyB3YXkgdG8gZ2V0IG5ld0h0bWxFbGVtZW50IGV2ZW50IGxpc3RlbmVycyBiZXNpZGVzIGhhY2tpbmcgRWxlbWVudC5wcm90b3R5cGVcbiAgICAgICAgICAgIHRoaXMub24odGhpcy5fbGlzdGVuZXJzKTtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnJlcGxhY2VXaXRoKG5ld0h0bWxFbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gbmV3SHRtbEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvLyAqKiogIEJhc2ljXG4gICAgLyoqU2V0IHRoZSBlbGVtZW50J3MgaW5uZXJIVE1MKi9cbiAgICBodG1sKGh0bWw6IHN0cmluZyk6IHRoaXM7XG4gICAgLyoqR2V0IHRoZSBlbGVtZW50J3MgaW5uZXJIVE1MKi9cbiAgICBodG1sKCk6IHN0cmluZztcbiAgICBodG1sKGh0bWw/KSB7XG4gICAgICAgIGlmICggaHRtbCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5pbm5lckhUTUw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmUuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlNldCB0aGUgZWxlbWVudCdzIGlubmVyVGV4dCovXG4gICAgdGV4dCh0eHQ6IHN0cmluZyB8IG51bWJlcik6IHRoaXM7XG4gICAgLyoqR2V0IHRoZSBlbGVtZW50J3MgaW5uZXJUZXh0Ki9cbiAgICB0ZXh0KCk6IHN0cmluZztcbiAgICB0ZXh0KHR4dD8pIHtcbiAgICAgICAgaWYgKCB0eHQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuaW5uZXJUZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lLmlubmVyVGV4dCA9IHR4dDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvKipTZXQgdGhlIGlkIG9mIHRoZSBlbGVtZW50Ki9cbiAgICBpZChpZDogc3RyaW5nKTogdGhpcztcbiAgICAvKipHZXQgdGhlIGlkIG9mIHRoZSBlbGVtZW50Ki9cbiAgICBpZCgpOiBzdHJpbmc7XG4gICAgaWQoaWQ/KSB7XG4gICAgICAgIGlmICggaWQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuaWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmUuaWQgPSBpZDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKkZvciBlYWNoIGB7PHN0eWxlQXR0cj46IDxzdHlsZVZhbD59YCBwYWlyLCBzZXQgdGhlIGBzdHlsZVtzdHlsZUF0dHJdYCB0byBgc3R5bGVWYWxgLiovXG4gICAgY3NzKGNzczogUGFydGlhbDxDc3NPcHRpb25zPik6IHRoaXNcbiAgICAvKipHZXQgYHN0eWxlW2Nzc11gKi9cbiAgICBjc3MoY3NzOiBzdHJpbmcpOiBzdHJpbmdcbiAgICBjc3MoY3NzKSB7XG4gICAgICAgIGlmICggdHlwZW9mIGNzcyA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLnN0eWxlW2Nzc107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKCBsZXQgWyBzdHlsZUF0dHIsIHN0eWxlVmFsIF0gb2YgZW51bWVyYXRlKGNzcykgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5zdHlsZVs8c3RyaW5nPiBzdHlsZUF0dHJdID0gc3R5bGVWYWw7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipSZW1vdmUgdGhlIHZhbHVlIG9mIHRoZSBwYXNzZWQgc3R5bGUgcHJvcGVydGllcyovXG4gICAgdW5jc3MoLi4ucmVtb3ZlUHJvcHM6IChrZXlvZiBDc3NPcHRpb25zKVtdKTogdGhpcyB7XG4gICAgICAgIGxldCBjc3MgPSB7fTtcbiAgICAgICAgZm9yICggbGV0IHByb3Agb2YgcmVtb3ZlUHJvcHMgKVxuICAgICAgICAgICAgY3NzW3Byb3BdID0gJyc7XG4gICAgICAgIHJldHVybiB0aGlzLmNzcyhjc3MpO1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgaXMoZWxlbWVudDogQmV0dGVySFRNTEVsZW1lbnQpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9pcy9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpO1xuICAgIH1cbiAgICBcbiAgICAvKlxuICAgICBhbmltYXRlKG9wdHM6IEFuaW1hdGVPcHRpb25zKSB7XG4gICAgIC8vIHNlZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL0NTU19BbmltYXRpb25zL1RpcHNcbiAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICAgfVxuICAgICAqL1xuICAgIFxuICAgIC8vICoqKiAgQ2xhc3Nlc1xuICAgIC8qKmAuY2xhc3NOYW1lID0gY2xzYCovXG4gICAgY2xhc3MoY2xzOiBzdHJpbmcpOiB0aGlzO1xuICAgIC8qKlJldHVybiB0aGUgZmlyc3QgY2xhc3MgdGhhdCBtYXRjaGVzIGBjbHNgIHByZWRpY2F0ZS4qL1xuICAgIGNsYXNzKGNsczogVFJldHVybkJvb2xlYW4pOiBzdHJpbmc7XG4gICAgLyoqUmV0dXJuIGEgc3RyaW5nIGFycmF5IG9mIHRoZSBlbGVtZW50J3MgY2xhc3NlcyAobm90IGEgY2xhc3NMaXN0KSovXG4gICAgY2xhc3MoKTogc3RyaW5nW107XG4gICAgY2xhc3MoY2xzPykge1xuICAgICAgICBpZiAoIGNscyA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5lLmNsYXNzTGlzdCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIGlzRnVuY3Rpb24oY2xzKSApIHtcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuZS5jbGFzc0xpc3QpLmZpbmQoY2xzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICggdGhpcy5faXNTdmcgKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIC8vIG5vaW5zcGVjdGlvbiBKU0NvbnN0YW50UmVhc3NpZ25tZW50XG4gICAgICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdCA9IFsgY2xzIF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZS5jbGFzc05hbWUgPSBjbHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBhZGRDbGFzcyhjbHM6IHN0cmluZywgLi4uY2xzZXM6IHN0cmluZ1tdKTogdGhpcyB7XG4gICAgICAgIHRoaXMuZS5jbGFzc0xpc3QuYWRkKGNscyk7XG4gICAgICAgIGZvciAoIGxldCBjIG9mIGNsc2VzIClcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QuYWRkKGMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcmVtb3ZlQ2xhc3MoY2xzOiBUUmV0dXJuQm9vbGVhbiwgLi4uY2xzZXM6IFRSZXR1cm5Cb29sZWFuW10pOiB0aGlzO1xuICAgIHJlbW92ZUNsYXNzKGNsczogc3RyaW5nLCAuLi5jbHNlczogc3RyaW5nW10pOiB0aGlzO1xuICAgIHJlbW92ZUNsYXNzKGNscywgLi4uY2xzZXMpIHtcbiAgICAgICAgaWYgKCBpc0Z1bmN0aW9uKGNscykgKSB7XG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzKGNscykpO1xuICAgICAgICAgICAgZm9yICggbGV0IGMgb2YgPFRSZXR1cm5Cb29sZWFuW10+IGNsc2VzIClcbiAgICAgICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzKGMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QucmVtb3ZlKGNscyk7XG4gICAgICAgICAgICBmb3IgKCBsZXQgYyBvZiBjbHNlcyApXG4gICAgICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZW1vdmUoYyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHJlcGxhY2VDbGFzcyhvbGRUb2tlbjogVFJldHVybkJvb2xlYW4sIG5ld1Rva2VuOiBzdHJpbmcpOiB0aGlzO1xuICAgIHJlcGxhY2VDbGFzcyhvbGRUb2tlbjogc3RyaW5nLCBuZXdUb2tlbjogc3RyaW5nKTogdGhpc1xuICAgIHJlcGxhY2VDbGFzcyhvbGRUb2tlbiwgbmV3VG9rZW4pIHtcbiAgICAgICAgaWYgKCBpc0Z1bmN0aW9uKG9sZFRva2VuKSApIHtcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QucmVwbGFjZSh0aGlzLmNsYXNzKG9sZFRva2VuKSwgbmV3VG9rZW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZXBsYWNlKG9sZFRva2VuLCBuZXdUb2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHRvZ2dsZUNsYXNzKGNsczogVFJldHVybkJvb2xlYW4sIGZvcmNlPzogYm9vbGVhbik6IHRoaXNcbiAgICB0b2dnbGVDbGFzcyhjbHM6IHN0cmluZywgZm9yY2U/OiBib29sZWFuKTogdGhpc1xuICAgIHRvZ2dsZUNsYXNzKGNscywgZm9yY2UpIHtcbiAgICAgICAgaWYgKCBpc0Z1bmN0aW9uKGNscykgKVxuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC50b2dnbGUodGhpcy5jbGFzcyhjbHMpLCBmb3JjZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QudG9nZ2xlKGNscywgZm9yY2UpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqUmV0dXJucyBgdGhpcy5lLmNsYXNzTGlzdC5jb250YWlucyhjbHMpYCAqL1xuICAgIGhhc0NsYXNzKGNsczogc3RyaW5nKTogYm9vbGVhblxuICAgIC8qKlJldHVybnMgd2hldGhlciBgdGhpc2AgaGFzIGEgY2xhc3MgdGhhdCBtYXRjaGVzIHBhc3NlZCBmdW5jdGlvbiAqL1xuICAgIGhhc0NsYXNzKGNsczogVFJldHVybkJvb2xlYW4pOiBib29sZWFuXG4gICAgaGFzQ2xhc3MoY2xzKSB7XG4gICAgICAgIGlmICggaXNGdW5jdGlvbihjbHMpICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xhc3MoY2xzKSAhPT0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5jbGFzc0xpc3QuY29udGFpbnMoY2xzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyAqKiogIE5vZGVzXG4gICAgLyoqSW5zZXJ0IGF0IGxlYXN0IG9uZSBgbm9kZWAganVzdCBhZnRlciBgdGhpc2AuIEFueSBgbm9kZWAgY2FuIGJlIGVpdGhlciBgQmV0dGVySFRNTEVsZW1lbnRgcyBvciB2YW5pbGxhIGBOb2RlYC4qL1xuICAgIGFmdGVyKC4uLm5vZGVzOiBBcnJheTxCZXR0ZXJIVE1MRWxlbWVudCB8IE5vZGU+KTogdGhpcyB7XG4gICAgICAgIGZvciAoIGxldCBub2RlIG9mIG5vZGVzICkge1xuICAgICAgICAgICAgaWYgKCBub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5hZnRlcihub2RlLmUpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuZS5hZnRlcihub2RlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgLyppZiAobm9kZXNbMF0gaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudClcbiAgICAgICAgIGZvciAobGV0IGJoZSBvZiA8QmV0dGVySFRNTEVsZW1lbnRbXT5ub2RlcylcbiAgICAgICAgIHRoaXMuZS5hZnRlcihiaGUuZSk7XG4gICAgICAgICBlbHNlXG4gICAgICAgICBmb3IgKGxldCBub2RlIG9mIDwoc3RyaW5nIHwgTm9kZSlbXT5ub2RlcylcbiAgICAgICAgIHRoaXMuZS5hZnRlcihub2RlKTsgLy8gVE9ETzogdGVzdCB3aGF0IGhhcHBlbnMgd2hlbiBwYXNzZWQgc3RyaW5nc1xuICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAqL1xuICAgIH1cbiAgICBcbiAgICAvKipJbnNlcnQgYHRoaXNgIGp1c3QgYWZ0ZXIgYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9yIGEgdmFuaWxsYSBgTm9kZWAuKi9cbiAgICBpbnNlcnRBZnRlcihub2RlOiBCZXR0ZXJIVE1MRWxlbWVudCB8IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgIG5vZGUuZS5hZnRlcih0aGlzLmUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBub2RlLmFmdGVyKHRoaXMuZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipJbnNlcnQgYXQgbGVhc3Qgb25lIGBub2RlYCBhZnRlciB0aGUgbGFzdCBjaGlsZCBvZiBgdGhpc2AuXG4gICAgICogQW55IGBub2RlYCBjYW4gYmUgZWl0aGVyIGEgYEJldHRlckhUTUxFbGVtZW50YCwgYSB2YW5pbGxhIGBOb2RlYCxcbiAgICAgKiBhIGB7c29tZUtleTogQmV0dGVySFRNTEVsZW1lbnR9YCBwYWlycyBvYmplY3QsIG9yIGEgYFtzb21lS2V5LCBCZXR0ZXJIVE1MRWxlbWVudF1gIHR1cGxlLiovXG4gICAgYXBwZW5kKC4uLm5vZGVzOiBBcnJheTxCZXR0ZXJIVE1MRWxlbWVudCB8IE5vZGUgfCBUTWFwPEJldHRlckhUTUxFbGVtZW50PiB8IFsgc3RyaW5nLCBCZXR0ZXJIVE1MRWxlbWVudCBdPik6IHRoaXMge1xuICAgICAgICBmb3IgKCBsZXQgbm9kZSBvZiBub2RlcyApIHtcbiAgICAgICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgICAgICB0aGlzLmUuYXBwZW5kKG5vZGUuZSk7XG4gICAgICAgICAgICBlbHNlIGlmICggbm9kZSBpbnN0YW5jZW9mIE5vZGUgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5hcHBlbmQobm9kZSk7XG4gICAgICAgICAgICBlbHNlIGlmICggQXJyYXkuaXNBcnJheShub2RlKSApXG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZUFwcGVuZChbIG5vZGUgXSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZUFwcGVuZChub2RlKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAvKmlmIChub2Rlc1swXSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50KVxuICAgICAgICAgZm9yIChsZXQgYmhlIG9mIDxCZXR0ZXJIVE1MRWxlbWVudFtdPm5vZGVzKVxuICAgICAgICAgdGhpcy5lLmFwcGVuZChiaGUuZSk7XG4gICAgICAgICBlbHNlXG4gICAgICAgICBmb3IgKGxldCBub2RlIG9mIDwoc3RyaW5nIHwgTm9kZSlbXT5ub2RlcylcbiAgICAgICAgIHRoaXMuZS5hcHBlbmQobm9kZSk7IC8vIFRPRE86IHRlc3Qgd2hhdCBoYXBwZW5zIHdoZW4gcGFzc2VkIHN0cmluZ3NcbiAgICAgICAgIHJldHVybiB0aGlzOyovXG4gICAgfVxuICAgIFxuICAgIC8qKkFwcGVuZCBgdGhpc2AgdG8gYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9yIGEgdmFuaWxsYSBgTm9kZWAqL1xuICAgIGFwcGVuZFRvKG5vZGU6IEJldHRlckhUTUxFbGVtZW50IHwgSFRNTEVsZW1lbnQpOiB0aGlzIHtcbiAgICAgICAgaWYgKCBub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKVxuICAgICAgICAgICAgbm9kZS5lLmFwcGVuZCh0aGlzLmUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBub2RlLmFwcGVuZCh0aGlzLmUpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKkluc2VydCBhdCBsZWFzdCBvbmUgYG5vZGVgIGp1c3QgYmVmb3JlIGB0aGlzYC4gQW55IGBub2RlYCBjYW4gYmUgZWl0aGVyIGBCZXR0ZXJIVE1MRWxlbWVudGBzIG9yIHZhbmlsbGEgYE5vZGVgLiovXG4gICAgYmVmb3JlKC4uLm5vZGVzOiBBcnJheTxCZXR0ZXJIVE1MRWxlbWVudCB8IE5vZGU+KTogdGhpcyB7XG4gICAgICAgIGZvciAoIGxldCBub2RlIG9mIG5vZGVzICkge1xuICAgICAgICAgICAgaWYgKCBub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5iZWZvcmUobm9kZS5lKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmUuYmVmb3JlKG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAvKmlmIChub2Rlc1swXSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50KVxuICAgICAgICAgZm9yIChsZXQgYmhlIG9mIDxCZXR0ZXJIVE1MRWxlbWVudFtdPm5vZGVzKVxuICAgICAgICAgdGhpcy5lLmJlZm9yZShiaGUuZSk7XG4gICAgICAgICBlbHNlXG4gICAgICAgICBmb3IgKGxldCBub2RlIG9mIDwoc3RyaW5nIHwgTm9kZSlbXT5ub2RlcylcbiAgICAgICAgIHRoaXMuZS5iZWZvcmUobm9kZSk7IC8vIFRPRE86IHRlc3Qgd2hhdCBoYXBwZW5zIHdoZW4gcGFzc2VkIHN0cmluZ3NcbiAgICAgICAgIHJldHVybiB0aGlzOyovXG4gICAgfVxuICAgIFxuICAgIC8qKkluc2VydCBgdGhpc2AganVzdCBiZWZvcmUgYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9yIGEgdmFuaWxsYSBgTm9kZWBzLiovXG4gICAgaW5zZXJ0QmVmb3JlKG5vZGU6IEJldHRlckhUTUxFbGVtZW50IHwgSFRNTEVsZW1lbnQpOiB0aGlzIHtcbiAgICAgICAgaWYgKCBub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKVxuICAgICAgICAgICAgbm9kZS5lLmJlZm9yZSh0aGlzLmUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBub2RlLmJlZm9yZSh0aGlzLmUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ETzogaWYgYXBwZW5kIHN1cHBvcnRzIHN0cmluZ3MsIHNvIHNob3VsZCB0aGlzXG4gICAgcmVwbGFjZUNoaWxkKG5ld0NoaWxkOiBOb2RlLCBvbGRDaGlsZDogTm9kZSk6IHRoaXM7XG4gICAgcmVwbGFjZUNoaWxkKG5ld0NoaWxkOiBCZXR0ZXJIVE1MRWxlbWVudCwgb2xkQ2hpbGQ6IEJldHRlckhUTUxFbGVtZW50KTogdGhpcztcbiAgICByZXBsYWNlQ2hpbGQobmV3Q2hpbGQsIG9sZENoaWxkKSB7XG4gICAgICAgIHRoaXMuZS5yZXBsYWNlQ2hpbGQobmV3Q2hpbGQsIG9sZENoaWxkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgX2NhY2hlKGtleTogc3RyaW5nLCBjaGlsZDogQmV0dGVySFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGhpc1trZXldID0gY2hpbGQ7XG4gICAgICAgIHRoaXMuX2NhY2hlZENoaWxkcmVuW2tleV0gPSBjaGlsZDtcbiAgICB9XG4gICAgXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIGNoaWxkXWAgcGFpciwgYGFwcGVuZChjaGlsZClgIGFuZCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYC4gKi9cbiAgICBjYWNoZUFwcGVuZChrZXlDaGlsZFBhaXJzOiBUTWFwPEJldHRlckhUTUxFbGVtZW50Pik6IHRoaXNcbiAgICAvKipGb3IgZWFjaCBgW2tleSwgY2hpbGRdYCB0dXBsZSwgYGFwcGVuZChjaGlsZClgIGFuZCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYC4gKi9cbiAgICBjYWNoZUFwcGVuZChrZXlDaGlsZFBhaXJzOiBbIHN0cmluZywgQmV0dGVySFRNTEVsZW1lbnQgXVtdKTogdGhpc1xuICAgIGNhY2hlQXBwZW5kKGtleUNoaWxkUGFpcnMpIHtcbiAgICAgICAgY29uc3QgX2NhY2hlQXBwZW5kID0gKF9rZXk6IHN0cmluZywgX2NoaWxkOiBCZXR0ZXJIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hcHBlbmQoX2NoaWxkKTtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlKF9rZXksIF9jaGlsZCk7XG4gICAgICAgIH07XG4gICAgICAgIGlmICggQXJyYXkuaXNBcnJheShrZXlDaGlsZFBhaXJzKSApIHtcbiAgICAgICAgICAgIGZvciAoIGxldCBbIGtleSwgY2hpbGQgXSBvZiBrZXlDaGlsZFBhaXJzIClcbiAgICAgICAgICAgICAgICBfY2FjaGVBcHBlbmQoa2V5LCBjaGlsZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKCBsZXQgWyBrZXksIGNoaWxkIF0gb2YgZW51bWVyYXRlKGtleUNoaWxkUGFpcnMpIClcbiAgICAgICAgICAgICAgICBfY2FjaGVBcHBlbmQoa2V5LCBjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKkdldCBhIGNoaWxkIHdpdGggYHF1ZXJ5U2VsZWN0b3JgIGFuZCByZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9mIGl0Ki9cbiAgICBjaGlsZDxLIGV4dGVuZHMgSFRNTFRhZz4oc2VsZWN0b3I6IEspOiBCZXR0ZXJIVE1MRWxlbWVudDtcbiAgICAvKipHZXQgYSBjaGlsZCB3aXRoIGBxdWVyeVNlbGVjdG9yYCBhbmQgcmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBvZiBpdCovXG4gICAgY2hpbGQoc2VsZWN0b3I6IHN0cmluZyk6IEJldHRlckhUTUxFbGVtZW50O1xuICAgIGNoaWxkKHNlbGVjdG9yKSB7XG4gICAgICAgIHJldHVybiBuZXcgQmV0dGVySFRNTEVsZW1lbnQoeyBodG1sRWxlbWVudCA6IHRoaXMuZS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSB9KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqUmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBsaXN0IG9mIGFsbCBjaGlsZHJlbiAqL1xuICAgIGNoaWxkcmVuKCk6IEJldHRlckhUTUxFbGVtZW50W107XG4gICAgLyoqUmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBsaXN0IG9mIGFsbCBjaGlsZHJlbiBzZWxlY3RlZCBieSBgc2VsZWN0b3JgICovXG4gICAgY2hpbGRyZW48SyBleHRlbmRzIEhUTUxUYWc+KHNlbGVjdG9yOiBLKTogQmV0dGVySFRNTEVsZW1lbnRbXTtcbiAgICAvKipSZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIGxpc3Qgb2YgYWxsIGNoaWxkcmVuIHNlbGVjdGVkIGJ5IGBzZWxlY3RvcmAgKi9cbiAgICBjaGlsZHJlbihzZWxlY3Rvcjogc3RyaW5nIHwgSFRNTFRhZyk6IEJldHRlckhUTUxFbGVtZW50W107XG4gICAgY2hpbGRyZW4oc2VsZWN0b3I/KSB7XG4gICAgICAgIGxldCBjaGlsZHJlblZhbmlsbGE7XG4gICAgICAgIGxldCBjaGlsZHJlbkNvbGxlY3Rpb247XG4gICAgICAgIGlmICggc2VsZWN0b3IgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGNoaWxkcmVuQ29sbGVjdGlvbiA9IHRoaXMuZS5jaGlsZHJlbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoaWxkcmVuQ29sbGVjdGlvbiA9IHRoaXMuZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgfVxuICAgICAgICBjaGlsZHJlblZhbmlsbGEgPSA8SFRNTEVsZW1lbnRbXT4gQXJyYXkuZnJvbShjaGlsZHJlbkNvbGxlY3Rpb24pO1xuICAgICAgICBjb25zdCB0b0VsZW0gPSAoYzogSFRNTEVsZW1lbnQpID0+IG5ldyBCZXR0ZXJIVE1MRWxlbWVudCh7IGh0bWxFbGVtZW50IDogYyB9KTtcbiAgICAgICAgcmV0dXJuIGNoaWxkcmVuVmFuaWxsYS5tYXAodG9FbGVtKTtcbiAgICB9XG4gICAgXG4gICAgY2xvbmUoZGVlcD86IGJvb2xlYW4pOiBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIG5ldyBCZXR0ZXJIVE1MRWxlbWVudCh7IGh0bWxFbGVtZW50IDogdGhpcy5lLmNsb25lTm9kZShkZWVwKSB9KTtcbiAgICB9XG4gICAgXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIHNlbGVjdG9yXWAgcGFpciwgd2hlcmUgYHNlbGVjdG9yYCBpcyBlaXRoZXIgYW4gYEhUTUxUYWdgIG9yIGEgYHN0cmluZ2AsIGdldCBgdGhpcy5jaGlsZChzZWxlY3RvcilgLCBhbmQgc3RvcmUgaXQgaW4gYHRoaXNba2V5XWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgZGlyZWN0bHlcbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHsgaWQ6ICduYXZiYXInIH0pO1xuICAgICAqIG5hdmJhci5jYWNoZUNoaWxkcmVuKHsgaG9tZTogJy5uYXZiYXItaXRlbS1ob21lJywgYWJvdXQ6ICcubmF2YmFyLWl0ZW0tYWJvdXQnIH0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogbmF2YmFyLmFib3V0LmNzcyguLi4pO1xuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGluZGlyZWN0bHkgdGhyb3VnaCBgY2hpbGRyZW5gIGNvbnN0cnVjdG9yIG9wdGlvblxuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oeyBpZDogJ25hdmJhcicsIGNoaWxkcmVuOiB7IGhvbWU6ICcubmF2YmFyLWl0ZW0taG9tZScsIGFib3V0OiAnLm5hdmJhci1pdGVtLWFib3V0JyB9fSk7XG4gICAgICogbmF2YmFyLmhvbWUudG9nZ2xlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBuYXZiYXIuYWJvdXQuY3NzKC4uLik7XG4gICAgICogQHNlZSB0aGlzLmNoaWxkKi9cbiAgICBjYWNoZUNoaWxkcmVuKHF1ZXJ5TWFwOiBUTWFwPFF1ZXJ5U2VsZWN0b3I+KTogdGhpc1xuICAgIC8qKkZvciBlYWNoIGBba2V5LCBzZWxlY3Rvcl1gIHBhaXIsIHdoZXJlIGBzZWxlY3RvcmAgaXMgYSByZWN1cnNpdmUgYHtzdWJzZWxlY3Rvcjoga2V5U2VsZWN0b3JPYmp9YCBvYmplY3QsXG4gICAgICogZXh0cmFjdCBgdGhpcy5jaGlsZChzdWJzZWxlY3RvcilgLCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYCwgdGhlbiBjYWxsIGB0aGlzW2tleV0uY2FjaGVDaGlsZHJlbmAgcGFzc2luZyB0aGUgcmVjdXJzaXZlIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzaW5nIGBjYWNoZUNoaWxkcmVuYCBkaXJlY3RseVxuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oeyBpZDogJ25hdmJhcicgfSk7XG4gICAgICogbmF2YmFyLmNhY2hlQ2hpbGRyZW4oe1xuICAgICAqICAgICAgaG9tZToge1xuICAgICAqICAgICAgICAgICcubmF2YmFyLWl0ZW0taG9tZSc6IHtcbiAgICAgKiAgICAgICAgICAgICAgbmV3czogJy5uYXZiYXItc3ViaXRlbS1uZXdzLFxuICAgICAqICAgICAgICAgICAgICBzdXBwb3J0OiAnLm5hdmJhci1zdWJpdGVtLXN1cHBvcnQnXG4gICAgICogICAgICAgICAgfVxuICAgICAqICAgICAgfVxuICAgICAqICB9KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIG5hdmJhci5ob21lLm5ld3MuY3NzKC4uLik7XG4gICAgICogbmF2YmFyLmhvbWUuc3VwcG9ydC5wb2ludGVyZG93biguLi4pO1xuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGluZGlyZWN0bHkgdGhyb3VnaCBgY2hpbGRyZW5gIGNvbnN0cnVjdG9yIG9wdGlvblxuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oe3F1ZXJ5OiAnI25hdmJhcicsIGNoaWxkcmVuOiB7XG4gICAgICogICAgICBob21lOiB7XG4gICAgICogICAgICAgICAgJy5uYXZiYXItaXRlbS1ob21lJzoge1xuICAgICAqICAgICAgICAgICAgICBuZXdzOiAnLm5hdmJhci1zdWJpdGVtLW5ld3MsXG4gICAgICogICAgICAgICAgICAgIHN1cHBvcnQ6ICcubmF2YmFyLXN1Yml0ZW0tc3VwcG9ydCdcbiAgICAgKiAgICAgICAgICB9XG4gICAgICogICAgICB9XG4gICAgICogIH19KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIG5hdmJhci5ob21lLm5ld3MuY3NzKC4uLik7XG4gICAgICogbmF2YmFyLmhvbWUuc3VwcG9ydC5wb2ludGVyZG93biguLi4pO1xuICAgICAqIEBzZWUgdGhpcy5jaGlsZCovXG4gICAgY2FjaGVDaGlsZHJlbihyZWN1cnNpdmVRdWVyeU1hcDogVFJlY01hcDxRdWVyeVNlbGVjdG9yPik6IHRoaXNcbiAgICBjYWNoZUNoaWxkcmVuKGJoZU1hcDogVE1hcDxCZXR0ZXJIVE1MRWxlbWVudD4pOiB0aGlzXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIHNlbGVjdG9yXWAgcGFpciwgd2hlcmUgYHNlbGVjdG9yYCBpcyBhIGBCZXR0ZXJIVE1MRWxlbWVudGAsIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGRpcmVjdGx5XG4gICAgICogY29uc3QgaG9tZSA9IGVsZW0oeyBxdWVyeTogJy5uYXZiYXItaXRlbS1ob21lJyB9KTtcbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHsgaWQ6ICduYXZiYXInIH0pO1xuICAgICAqIG5hdmJhci5jYWNoZUNoaWxkcmVuKHsgaG9tZSB9KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGluZGlyZWN0bHkgdGhyb3VnaCBgY2hpbGRyZW5gIGNvbnN0cnVjdG9yIG9wdGlvblxuICAgICAqIGNvbnN0IGhvbWUgPSBlbGVtKHsgcXVlcnk6ICcubmF2YmFyLWl0ZW0taG9tZScgfSk7XG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7aWQ6ICduYXZiYXInLCBjaGlsZHJlbjogeyBob21lIH19KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIEBzZWUgdGhpcy5jaGlsZCovXG4gICAgXG4gICAgY2FjaGVDaGlsZHJlbihyZWN1cnNpdmVCSEVNYXA6IFRSZWNNYXA8QmV0dGVySFRNTEVsZW1lbnQ+KTogdGhpc1xuICAgIC8qKmtleTogc3RyaW5nLiB2YWx1ZTogZWl0aGVyIFwic2VsZWN0b3Igc3RyaW5nXCIgT1Ige1wic2VsZWN0b3Igc3RyaW5nXCI6IDxyZWN1cnNlIGRvd24+fSovXG4gICAgY2FjaGVDaGlsZHJlbihtYXApIHtcbiAgICAgICAgZm9yICggbGV0IFsga2V5LCB2YWx1ZSBdIG9mIGVudW1lcmF0ZShtYXApICkge1xuICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gICAgICAgICAgICBpZiAoIGlzT2JqZWN0KHZhbHVlKSApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHZhbHVlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlKGtleSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbGV0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyg8VE1hcDxRdWVyeVNlbGVjdG9yPiB8IFRSZWNNYXA8UXVlcnlTZWxlY3Rvcj4+dmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBlbnRyaWVzWzFdICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYGNhY2hlQ2hpbGRyZW4oKSByZWNlaXZlZCByZWN1cnNpdmUgb2JqIHdpdGggbW9yZSB0aGFuIDEgc2VsZWN0b3IgZm9yIGEga2V5LiBVc2luZyBvbmx5IDB0aCBzZWxlY3RvcmAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm11bHRpcGxlIHNlbGVjdG9yc1wiIDogZW50cmllcy5tYXAoZSA9PiBlWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBvbmx5IGZpcnN0IGJlY2F1c2UgMToxIGZvciBrZXk6c2VsZWN0b3IuXG4gICAgICAgICAgICAgICAgICAgIC8vIChpZSBjYW4ndCBkbyB7cmlnaHQ6IHsucmlnaHQ6IHsuLi59LCAucmlnaHQyOiB7Li4ufX0pXG4gICAgICAgICAgICAgICAgICAgIGxldCBbIHNlbGVjdG9yLCBvYmogXSA9IGVudHJpZXNbMF07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlKGtleSwgdGhpcy5jaGlsZChzZWxlY3RvcikpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2tleV0uY2FjaGVDaGlsZHJlbihvYmopXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShrZXksIHRoaXMuY2hpbGQodmFsdWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBjYWNoZUNoaWxkcmVuLCBiYWQgdmFsdWUgdHlwZTogXCIke3R5cGV9XCIuIGtleTogXCIke2tleX1cIiwgdmFsdWU6IFwiJHt2YWx1ZX1cIi4gbWFwOmAsIG1hcCwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqUmVtb3ZlIGFsbCBjaGlsZHJlbiBmcm9tIERPTSovXG4gICAgZW1wdHkoKTogdGhpcyB7XG4gICAgICAgIC8vIFRPRE86IGlzIHRoaXMgZmFzdGVyIHRoYW4gaW5uZXJIVE1MID0gXCJcIj9cbiAgICAgICAgd2hpbGUgKCB0aGlzLmUuZmlyc3RDaGlsZCApXG4gICAgICAgICAgICB0aGlzLmUucmVtb3ZlQ2hpbGQodGhpcy5lLmZpcnN0Q2hpbGQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqUmVtb3ZlIGVsZW1lbnQgZnJvbSBET00qL1xuICAgIHJlbW92ZSgpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lLnJlbW92ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ETzogcmVjdXJzaXZlbHkgeWllbGQgY2hpbGRyZW5cbiAgICAvLyAgKHVubGlrZSAuY2hpbGRyZW4oKSwgdGhpcyBkb2Vzbid0IHJldHVybiBvbmx5IHRoZSBmaXJzdCBsZXZlbClcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgZmluZCgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9maW5kL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZpcnN0KCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2ZpcnN0L1xuICAgICAgICAvLyB0aGlzLmUuZmlyc3RDaGlsZFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGxhc3QoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vbGFzdC9cbiAgICAgICAgLy8gdGhpcy5lLmxhc3RDaGlsZFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG5leHQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbm90KCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHBhcmVudCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBwYXJlbnRzKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLy8gKioqICBFdmVudHNcbiAgICBcbiAgICBvbihldlR5cGVGblBhaXJzOiBURXZlbnRGdW5jdGlvbk1hcDxURXZlbnQ+LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IFsgZXZUeXBlLCBldkZuIF0gb2YgZW51bWVyYXRlKGV2VHlwZUZuUGFpcnMpICkge1xuICAgICAgICAgICAgY29uc3QgX2YgPSBmdW5jdGlvbiBfZihldnQpIHtcbiAgICAgICAgICAgICAgICBldkZuKGV2dCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5lLmFkZEV2ZW50TGlzdGVuZXIoZXZUeXBlLCBfZiwgb3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbZXZUeXBlXSA9IF9mO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBvbmUoZXZUeXBlOiBURXZlbnQsIGxpc3RlbmVyOiBGdW5jdGlvblJlY2lldmVzRXZlbnQ8VEV2ZW50Piwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIGNvbnN0IGV2VHlwZUZuUGFpcnMgPSB7fTtcbiAgICAgICAgZXZUeXBlRm5QYWlyc1tldlR5cGVdID0gbGlzdGVuZXI7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zID09PSB1bmRlZmluZWQgPyB7IG9uY2UgOiB0cnVlIH0gOiB7IC4uLm9wdGlvbnMsIG9uY2UgOiB0cnVlIH07XG4gICAgICAgIHJldHVybiB0aGlzLm9uKGV2VHlwZUZuUGFpcnMsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICAvKipSZW1vdmUgYGV2ZW50YCBmcm9tIHdyYXBwZWQgZWxlbWVudCdzIGV2ZW50IGxpc3RlbmVycywgYnV0IGtlZXAgdGhlIHJlbW92ZWQgbGlzdGVuZXIgaW4gY2FjaGUuXG4gICAgICogVGhpcyBpcyB1c2VmdWwgZm9yIGxhdGVyIHVuYmxvY2tpbmcqL1xuICAgIGJsb2NrTGlzdGVuZXIoZXZlbnQ6IFRFdmVudCkge1xuICAgICAgICBsZXQgbGlzdGVuZXIgPSB0aGlzLl9saXN0ZW5lcnNbZXZlbnRdO1xuICAgICAgICBpZiAoIGxpc3RlbmVyID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKGBibG9ja0xpc3RlbmVyKGV2ZW50KTogdGhpcy5fbGlzdGVuZXJzW2V2ZW50XSBpcyB1bmRlZmluZWQuIGV2ZW50OmAsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgdW5ibG9ja0xpc3RlbmVyKGV2ZW50OiBURXZlbnQpIHtcbiAgICAgICAgbGV0IGxpc3RlbmVyID0gdGhpcy5fbGlzdGVuZXJzW2V2ZW50XTtcbiAgICAgICAgaWYgKCBsaXN0ZW5lciA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihgdW5ibG9ja0xpc3RlbmVyKGV2ZW50KTogdGhpcy5fbGlzdGVuZXJzW2V2ZW50XSBpcyB1bmRlZmluZWQuIGV2ZW50OmAsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmUuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLypcbiAgICAgQ2hyb25vbG9neTpcbiAgICAgbW91c2Vkb3duICAgdG91Y2hzdGFydFx0cG9pbnRlcmRvd25cbiAgICAgbW91c2VlbnRlclx0XHQgICAgICAgIHBvaW50ZXJlbnRlclxuICAgICBtb3VzZWxlYXZlXHRcdCAgICAgICAgcG9pbnRlcmxlYXZlXG4gICAgIG1vdXNlbW92ZVx0dG91Y2htb3ZlXHRwb2ludGVybW92ZVxuICAgICBtb3VzZW91dFx0XHQgICAgICAgIHBvaW50ZXJvdXRcbiAgICAgbW91c2VvdmVyXHRcdCAgICAgICAgcG9pbnRlcm92ZXJcbiAgICAgbW91c2V1cFx0ICAgIHRvdWNoZW5kICAgIHBvaW50ZXJ1cFxuICAgICAqL1xuICAgIC8qKiBBZGQgYSBgdG91Y2hzdGFydGAgZXZlbnQgbGlzdGVuZXIuIFRoaXMgaXMgdGhlIGZhc3QgYWx0ZXJuYXRpdmUgdG8gYGNsaWNrYCBsaXN0ZW5lcnMgZm9yIG1vYmlsZSAobm8gMzAwbXMgd2FpdCkuICovXG4gICAgdG91Y2hzdGFydChmbjogKGV2OiBUb3VjaEV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICB0aGlzLmUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uIF9mKGV2OiBUb3VjaEV2ZW50KSB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpOyAvLyBvdGhlcndpc2UgXCJ0b3VjaG1vdmVcIiBpcyB0cmlnZ2VyZWRcbiAgICAgICAgICAgIGZuKGV2KTtcbiAgICAgICAgICAgIGlmICggb3B0aW9ucyAmJiBvcHRpb25zLm9uY2UgKSAvLyBUT0RPOiBtYXliZSBuYXRpdmUgb3B0aW9ucy5vbmNlIGlzIGVub3VnaFxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIF9mKTtcbiAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICAgIC8vIFRPRE86IHRoaXMuX2xpc3RlbmVycywgb3IgdXNlIHRoaXMub24oXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBwb2ludGVyZW50ZXIoZm46IChldmVudDogUG9pbnRlckV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICByZXR1cm4gdGhpcy5vbih7IHBvaW50ZXJlbnRlciA6IGZuIH0sIG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICAvKiogQWRkIGEgYHBvaW50ZXJkb3duYCBldmVudCBsaXN0ZW5lciBpZiBicm93c2VyIHN1cHBvcnRzIGBwb2ludGVyZG93bmAsIGVsc2Ugc2VuZCBgbW91c2Vkb3duYCAoc2FmYXJpKS4gKi9cbiAgICBwb2ludGVyZG93bihmbjogKGV2ZW50OiBQb2ludGVyRXZlbnQgfCBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICBcbiAgICAgICAgbGV0IGFjdGlvbjtcbiAgICAgICAgLy8gVE9ETzogY2hlY2sgaWYgUG9pbnRlckV2ZW50IGV4aXN0cyBpbnN0ZWFkIG9mIHRyeS9jYXRjaFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYWN0aW9uID0gd2luZG93LlBvaW50ZXJFdmVudCA/ICdwb2ludGVyZG93bicgOiAnbW91c2Vkb3duJzsgLy8gc2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBwb2ludGVyZG93blxuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIGFjdGlvbiA9ICdtb3VzZWRvd24nXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgX2YgPSBmdW5jdGlvbiBfZihldjogUG9pbnRlckV2ZW50IHwgTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGZuKGV2KTtcbiAgICAgICAgICAgIGlmICggb3B0aW9ucyAmJiBvcHRpb25zLm9uY2UgKSAvLyBUT0RPOiBtYXliZSBuYXRpdmUgb3B0aW9ucy5vbmNlIGlzIGVub3VnaFxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihhY3Rpb24sIF9mKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5lLmFkZEV2ZW50TGlzdGVuZXIoYWN0aW9uLCBfZiwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVycy5wb2ludGVyZG93biA9IF9mO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBjbGljayBvZiB0aGUgZWxlbWVudC4gVXNlZnVsIGZvciBgPGE+YCBlbGVtZW50cy4qL1xuICAgIGNsaWNrKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYGNsaWNrYCBldmVudCBsaXN0ZW5lci4gWW91IHNob3VsZCBwcm9iYWJseSB1c2UgYHBvaW50ZXJkb3duKClgIGlmIG9uIGRlc2t0b3AsIG9yIGB0b3VjaHN0YXJ0KClgIGlmIG9uIG1vYmlsZS4qL1xuICAgIGNsaWNrKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBjbGljayhmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuZS5jbGljaygpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGNsaWNrIDogZm4gfSwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqQmx1ciAodW5mb2N1cykgdGhlIGVsZW1lbnQuKi9cbiAgICBibHVyKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYGJsdXJgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBibHVyKGZuOiAoZXZlbnQ6IEZvY3VzRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBibHVyKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgdGhpcy5lLmJsdXIoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBibHVyIDogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipGb2N1cyB0aGUgZWxlbWVudC4qL1xuICAgIGZvY3VzKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYGZvY3VzYCBldmVudCBsaXN0ZW5lciovXG4gICAgZm9jdXMoZm46IChldmVudDogRm9jdXNFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIGZvY3VzKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgdGhpcy5lLmZvY3VzKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgZm9jdXMgOiBmbiB9LCBvcHRpb25zKVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkFkZCBhIGBjaGFuZ2VgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBjaGFuZ2UoZm46IChldmVudDogRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uKHsgY2hhbmdlIDogZm4gfSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIC8qKkFkZCBhIGBjb250ZXh0bWVudWAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGNvbnRleHRtZW51KGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uKHsgY29udGV4dG1lbnUgOiBmbiB9LCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBkb3VibGUgY2xpY2sgb2YgdGhlIGVsZW1lbnQuKi9cbiAgICBkYmxjbGljaygpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBkYmxjbGlja2AgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGRibGNsaWNrKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBkYmxjbGljayhmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGNvbnN0IGRibGNsaWNrID0gbmV3IE1vdXNlRXZlbnQoJ2RibGNsaWNrJywge1xuICAgICAgICAgICAgICAgICd2aWV3JyA6IHdpbmRvdyxcbiAgICAgICAgICAgICAgICAnYnViYmxlcycgOiB0cnVlLFxuICAgICAgICAgICAgICAgICdjYW5jZWxhYmxlJyA6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5lLmRpc3BhdGNoRXZlbnQoZGJsY2xpY2spO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGRibGNsaWNrIDogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipTaW11bGF0ZSBhIG1vdXNlZW50ZXIgZXZlbnQgdG8gdGhlIGVsZW1lbnQuKi9cbiAgICBtb3VzZWVudGVyKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYG1vdXNlZW50ZXJgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBtb3VzZWVudGVyKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBtb3VzZWVudGVyKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgLy8gbW91c2VvdmVyOiBhbHNvIGNoaWxkIGVsZW1lbnRzXG4gICAgICAgIC8vIG1vdXNlZW50ZXI6IG9ubHkgYm91bmQgZWxlbWVudFxuICAgICAgICBcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgY29uc3QgbW91c2VlbnRlciA9IG5ldyBNb3VzZUV2ZW50KCdtb3VzZWVudGVyJywge1xuICAgICAgICAgICAgICAgICd2aWV3JyA6IHdpbmRvdyxcbiAgICAgICAgICAgICAgICAnYnViYmxlcycgOiB0cnVlLFxuICAgICAgICAgICAgICAgICdjYW5jZWxhYmxlJyA6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5lLmRpc3BhdGNoRXZlbnQobW91c2VlbnRlcik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgbW91c2VlbnRlciA6IGZuIH0sIG9wdGlvbnMpXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBrZXlkb3duIGV2ZW50IHRvIHRoZSBlbGVtZW50LiovXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGtleWRvd24oKTogdGhpcztcbiAgICAvKipBZGQgYSBga2V5ZG93bmAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGtleWRvd24oZm46IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIGtleWRvd24oZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsga2V5ZG93biA6IGZuIH0sIG9wdGlvbnMpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBrZXl1cCgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXl1cC9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBrZXlwcmVzcygpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXlwcmVzcy9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBob3ZlcigpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9ob3Zlci9cbiAgICAgICAgLy8gYmluZHMgdG8gYm90aCBtb3VzZWVudGVyIGFuZCBtb3VzZWxlYXZlXG4gICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE3NTg5NDIwL3doZW4tdG8tY2hvb3NlLW1vdXNlb3Zlci1hbmQtaG92ZXItZnVuY3Rpb25cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBtb3VzZWRvd24oKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbW91c2VsZWF2ZSgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXlwcmVzcy9cbiAgICAgICAgLy9tb3VzZWxlYXZlIGFuZCBtb3VzZW91dCBhcmUgc2ltaWxhciBidXQgZGlmZmVyIGluIHRoYXQgbW91c2VsZWF2ZSBkb2VzIG5vdCBidWJibGUgYW5kIG1vdXNlb3V0IGRvZXMuXG4gICAgICAgIC8vIFRoaXMgbWVhbnMgdGhhdCBtb3VzZWxlYXZlIGlzIGZpcmVkIHdoZW4gdGhlIHBvaW50ZXIgaGFzIGV4aXRlZCB0aGUgZWxlbWVudCBhbmQgYWxsIG9mIGl0cyBkZXNjZW5kYW50cyxcbiAgICAgICAgLy8gd2hlcmVhcyBtb3VzZW91dCBpcyBmaXJlZCB3aGVuIHRoZSBwb2ludGVyIGxlYXZlcyB0aGUgZWxlbWVudCBvciBsZWF2ZXMgb25lIG9mIHRoZSBlbGVtZW50J3MgZGVzY2VuZGFudHNcbiAgICAgICAgLy8gKGV2ZW4gaWYgdGhlIHBvaW50ZXIgaXMgc3RpbGwgd2l0aGluIHRoZSBlbGVtZW50KS5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBtb3VzZW1vdmUoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipTaW11bGF0ZSBhIG1vdXNlb3V0IGV2ZW50IHRvIHRoZSBlbGVtZW50LiovXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIG1vdXNlb3V0KCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYG1vdXNlb3V0YCBldmVudCBsaXN0ZW5lciovXG4gICAgbW91c2VvdXQoZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIG1vdXNlb3V0KGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgLy9tb3VzZWxlYXZlIGFuZCBtb3VzZW91dCBhcmUgc2ltaWxhciBidXQgZGlmZmVyIGluIHRoYXQgbW91c2VsZWF2ZSBkb2VzIG5vdCBidWJibGUgYW5kIG1vdXNlb3V0IGRvZXMuXG4gICAgICAgIC8vIFRoaXMgbWVhbnMgdGhhdCBtb3VzZWxlYXZlIGlzIGZpcmVkIHdoZW4gdGhlIHBvaW50ZXIgaGFzIGV4aXRlZCB0aGUgZWxlbWVudCBhbmQgYWxsIG9mIGl0cyBkZXNjZW5kYW50cyxcbiAgICAgICAgLy8gd2hlcmVhcyBtb3VzZW91dCBpcyBmaXJlZCB3aGVuIHRoZSBwb2ludGVyIGxlYXZlcyB0aGUgZWxlbWVudCBvciBsZWF2ZXMgb25lIG9mIHRoZSBlbGVtZW50J3MgZGVzY2VuZGFudHNcbiAgICAgICAgLy8gKGV2ZW4gaWYgdGhlIHBvaW50ZXIgaXMgc3RpbGwgd2l0aGluIHRoZSBlbGVtZW50KS5cbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IG1vdXNlb3V0IDogZm4gfSwgb3B0aW9ucylcbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBtb3VzZW92ZXIgZXZlbnQgdG8gdGhlIGVsZW1lbnQuKi9cbiAgICBtb3VzZW92ZXIoKTogdGhpcztcbiAgICAvKipBZGQgYSBgbW91c2VvdmVyYCBldmVudCBsaXN0ZW5lciovXG4gICAgbW91c2VvdmVyKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBtb3VzZW92ZXIoZm4/LCBvcHRpb25zPykge1xuICAgICAgICAvLyBtb3VzZW92ZXI6IGFsc28gY2hpbGQgZWxlbWVudHNcbiAgICAgICAgLy8gbW91c2VlbnRlcjogb25seSBib3VuZCBlbGVtZW50XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBtb3VzZW92ZXIgOiBmbiB9LCBvcHRpb25zKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbW91c2V1cCgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXlwcmVzcy9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIHRyYW5zZm9ybShvcHRpb25zOiBUcmFuc2Zvcm1PcHRpb25zKSB7XG4gICAgICAgIGxldCB0cmFuc2Zvcm06IHN0cmluZyA9ICcnO1xuICAgICAgICBmb3IgKCBsZXQgWyBrLCB2IF0gb2YgZW51bWVyYXRlKG9wdGlvbnMpICkge1xuICAgICAgICAgICAgdHJhbnNmb3JtICs9IGAke2t9KCR7dn0pIGBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uKHtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uZW5kIDogcmVzb2x2ZVxuICAgICAgICAgICAgfSwgeyBvbmNlIDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHRoaXMuY3NzKHsgdHJhbnNmb3JtIH0pXG4gICAgICAgIH0pXG4gICAgfVxuICAgIFxuICAgIC8qKiBSZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyIG9mIGBldmVudGAsIGlmIGV4aXN0cy4qL1xuICAgIG9mZihldmVudDogVEV2ZW50KTogdGhpcyB7XG4gICAgICAgIHRoaXMuZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCB0aGlzLl9saXN0ZW5lcnNbZXZlbnRdKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIGFsbE9mZigpOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IGV2ZW50IGluIHRoaXMuX2xpc3RlbmVycyApIHtcbiAgICAgICAgICAgIHRoaXMub2ZmKDxURXZlbnQ+IGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLy8gKioqICBBdHRyaWJ1dGVzXG4gICAgXG4gICAgLyoqIEZvciBlYWNoIGBbYXR0ciwgdmFsXWAgcGFpciwgYXBwbHkgYHNldEF0dHJpYnV0ZWAqL1xuICAgIGF0dHIoYXR0clZhbFBhaXJzOiBUTWFwPHN0cmluZz4pOiB0aGlzXG4gICAgLyoqIGFwcGx5IGBnZXRBdHRyaWJ1dGVgKi9cbiAgICBhdHRyKGF0dHJpYnV0ZU5hbWU6IHN0cmluZyk6IHN0cmluZ1xuICAgIGF0dHIoYXR0clZhbFBhaXJzKSB7XG4gICAgICAgIGlmICggdHlwZW9mIGF0dHJWYWxQYWlycyA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLmdldEF0dHJpYnV0ZShhdHRyVmFsUGFpcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICggbGV0IFsgYXR0ciwgdmFsIF0gb2YgZW51bWVyYXRlKGF0dHJWYWxQYWlycykgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5zZXRBdHRyaWJ1dGUoYXR0ciwgdmFsKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKiBgcmVtb3ZlQXR0cmlidXRlYCAqL1xuICAgIHJlbW92ZUF0dHIocXVhbGlmaWVkTmFtZTogc3RyaW5nLCAuLi5xdWFsaWZpZWROYW1lczogc3RyaW5nW10pOiB0aGlzIHtcbiAgICAgICAgbGV0IF9yZW1vdmVBdHRyaWJ1dGU7XG4gICAgICAgIGlmICggdGhpcy5faXNTdmcgKVxuICAgICAgICAgICAgX3JlbW92ZUF0dHJpYnV0ZSA9IChxdWFsaWZpZWROYW1lKSA9PiB0aGlzLmUucmVtb3ZlQXR0cmlidXRlTlMoU1ZHX05TX1VSSSwgcXVhbGlmaWVkTmFtZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUgPSAocXVhbGlmaWVkTmFtZSkgPT4gdGhpcy5lLnJlbW92ZUF0dHJpYnV0ZShxdWFsaWZpZWROYW1lKTtcbiAgICAgICAgXG4gICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUocXVhbGlmaWVkTmFtZSk7XG4gICAgICAgIGZvciAoIGxldCBxbiBvZiBxdWFsaWZpZWROYW1lcyApXG4gICAgICAgICAgICBfcmVtb3ZlQXR0cmlidXRlKHFuKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKmBnZXRBdHRyaWJ1dGUoYGRhdGEtJHtrZXl9YClgLiBKU09OLnBhcnNlIGl0IGJ5IGRlZmF1bHQuKi9cbiAgICBkYXRhKGtleTogc3RyaW5nLCBwYXJzZTogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcgfCBUTWFwPHN0cmluZz4ge1xuICAgICAgICAvLyBUT0RPOiBqcXVlcnkgZG9lc24ndCBhZmZlY3QgZGF0YS0qIGF0dHJzIGluIERPTS4gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9kYXRhL1xuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5lLmdldEF0dHJpYnV0ZShgZGF0YS0ke2tleX1gKTtcbiAgICAgICAgaWYgKCBwYXJzZSA9PT0gdHJ1ZSApXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICB9XG4gICAgXG4gICAgLy8gKiogIEZhZGVcbiAgICBhc3luYyBmYWRlKGR1cjogbnVtYmVyLCB0bzogMCB8IDEpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgY29uc3Qgc3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lKTtcbiAgICAgICAgY29uc3QgdHJhbnNQcm9wID0gc3R5bGVzLnRyYW5zaXRpb25Qcm9wZXJ0eS5zcGxpdCgnLCAnKTtcbiAgICAgICAgY29uc3QgaW5kZXhPZk9wYWNpdHkgPSB0cmFuc1Byb3AuaW5kZXhPZignb3BhY2l0eScpO1xuICAgICAgICAvLyBjc3Mgb3BhY2l0eTowID0+IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTogMHNcbiAgICAgICAgLy8gY3NzIG9wYWNpdHk6NTAwbXMgPT4gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldOiAwLjVzXG4gICAgICAgIC8vIGNzcyBOTyBvcGFjaXR5ID0+IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTogdW5kZWZpbmVkXG4gICAgICAgIGlmICggaW5kZXhPZk9wYWNpdHkgIT09IC0xICkge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNEdXIgPSBzdHlsZXMudHJhbnNpdGlvbkR1cmF0aW9uLnNwbGl0KCcsICcpO1xuICAgICAgICAgICAgY29uc3Qgb3BhY2l0eVRyYW5zRHVyID0gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldO1xuICAgICAgICAgICAgY29uc3QgdHJhbnMgPSBzdHlsZXMudHJhbnNpdGlvbi5zcGxpdCgnLCAnKTtcbiAgICAgICAgICAgIC8vIHRyYW5zaXRpb246IG9wYWNpdHkgd2FzIGRlZmluZWQgaW4gY3NzLlxuICAgICAgICAgICAgLy8gc2V0IHRyYW5zaXRpb24gdG8gZHVyLCBzZXQgb3BhY2l0eSB0byAwLCBsZWF2ZSB0aGUgYW5pbWF0aW9uIHRvIG5hdGl2ZSB0cmFuc2l0aW9uLCB3YWl0IGR1ciBhbmQgcmV0dXJuIHRoaXNcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgZmFkZSgke2R1cn0sICR7dG99KSwgb3BhY2l0eVRyYW5zRHVyICE9PSB1bmRlZmluZWQuIG51bGxpZnlpbmcgdHJhbnNpdGlvbi4gU0hPVUxEIE5PVCBXT1JLYCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgdHJhbnM6XFx0JHt0cmFuc31cXG50cmFuc1Byb3A6XFx0JHt0cmFuc1Byb3B9XFxuaW5kZXhPZk9wYWNpdHk6XFx0JHtpbmRleE9mT3BhY2l0eX1cXG5vcGFjaXR5VHJhbnNEdXI6XFx0JHtvcGFjaXR5VHJhbnNEdXJ9YCk7XG4gICAgICAgICAgICAvLyB0cmFucy5zcGxpY2UoaW5kZXhPZk9wYWNpdHksIDEsIGBvcGFjaXR5ICR7ZHVyIC8gMTAwMH1zYCk7XG4gICAgICAgICAgICB0cmFucy5zcGxpY2UoaW5kZXhPZk9wYWNpdHksIDEsIGBvcGFjaXR5IDBzYCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgYWZ0ZXIsIHRyYW5zOiAke3RyYW5zfWApO1xuICAgICAgICAgICAgdGhpcy5lLnN0eWxlLnRyYW5zaXRpb24gPSB0cmFucy5qb2luKCcsICcpO1xuICAgICAgICAgICAgdGhpcy5jc3MoeyBvcGFjaXR5IDogdG8gfSk7XG4gICAgICAgICAgICBhd2FpdCB3YWl0KGR1cik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICAvLyB0cmFuc2l0aW9uOiBvcGFjaXR5IHdhcyBOT1QgZGVmaW5lZCBpbiBjc3MuXG4gICAgICAgIGlmICggZHVyID09IDAgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jc3MoeyBvcGFjaXR5IDogdG8gfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXNGYWRlT3V0ID0gdG8gPT09IDA7XG4gICAgICAgIGxldCBvcGFjaXR5ID0gcGFyc2VGbG9hdCh0aGlzLmUuc3R5bGUub3BhY2l0eSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIG9wYWNpdHkgPT09IHVuZGVmaW5lZCB8fCBpc05hTihvcGFjaXR5KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgZmFkZSgke2R1cn0sICR7dG99KSBodG1sRWxlbWVudCBoYXMgTk8gb3BhY2l0eSBhdCBhbGwuIHJlY3Vyc2luZ2AsIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5LFxuICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNzcyh7IG9wYWNpdHkgOiBNYXRoLmFicygxIC0gdG8pIH0pLmZhZGUoZHVyLCB0bylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCBpc0ZhZGVPdXQgPyBvcGFjaXR5IDw9IDAgOiBvcGFjaXR5ID4gMSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYGZhZGUoJHtkdXJ9LCAke3RvfSkgb3BhY2l0eSB3YXMgYmV5b25kIHRhcmdldCBvcGFjaXR5LiByZXR1cm5pbmcgdGhpcyBhcyBpcy5gLCB7XG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxldCBzdGVwcyA9IDMwO1xuICAgICAgICBsZXQgb3BTdGVwID0gMSAvIHN0ZXBzO1xuICAgICAgICBsZXQgZXZlcnltcyA9IGR1ciAvIHN0ZXBzO1xuICAgICAgICBpZiAoIGV2ZXJ5bXMgPCAxICkge1xuICAgICAgICAgICAgZXZlcnltcyA9IDE7XG4gICAgICAgICAgICBzdGVwcyA9IGR1cjtcbiAgICAgICAgICAgIG9wU3RlcCA9IDEgLyBzdGVwcztcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgZmFkZSgke2R1cn0sICR7dG99KSBoYWQgb3BhY2l0eSwgbm8gdHJhbnNpdGlvbi4gKGdvb2QpIG9wYWNpdHk6ICR7b3BhY2l0eX1gLCB7XG4gICAgICAgICAgICBzdGVwcyxcbiAgICAgICAgICAgIG9wU3RlcCxcbiAgICAgICAgICAgIGV2ZXJ5bXNcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlYWNoZWRUbyA9IGlzRmFkZU91dCA/IChvcCkgPT4gb3AgLSBvcFN0ZXAgPiAwIDogKG9wKSA9PiBvcCArIG9wU3RlcCA8IDE7XG4gICAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCByZWFjaGVkVG8ob3BhY2l0eSkgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBpc0ZhZGVPdXQgPT09IHRydWUgKVxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5IC09IG9wU3RlcDtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHkgKz0gb3BTdGVwO1xuICAgICAgICAgICAgICAgIHRoaXMuY3NzKHsgb3BhY2l0eSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eSA9IHRvO1xuICAgICAgICAgICAgICAgIHRoaXMuY3NzKHsgb3BhY2l0eSB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZXZlcnltcyk7XG4gICAgICAgIGF3YWl0IHdhaXQoZHVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGZhZGVPdXQoZHVyOiBudW1iZXIpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZmFkZShkdXIsIDApO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBhc3luYyBmYWRlSW4oZHVyOiBudW1iZXIpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZmFkZShkdXIsIDEpO1xuICAgIH1cbiAgICBcbiAgICBcbn1cblxuY2xhc3MgRGl2IGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxEaXZFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhIERpdiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ2RpdicsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgIH1cbn1cblxuY2xhc3MgUGFyYWdyYXBoIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxQYXJhZ3JhcGhFbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxQYXJhZ3JhcGhFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhIFBhcmFncmFwaCBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ3AnLCB0ZXh0LCBjbHMgfSk7XG4gICAgICAgIGlmICggaWQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmlkKGlkKTtcbiAgICB9XG59XG5cbmNsYXNzIFNwYW4gZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTFNwYW5FbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxTcGFuRWxlbWVudDtcbiAgICBcbiAgICAvKipDcmVhdGUgYSBTcGFuIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCB0ZXh0LCBjbHMgfTogU3ViRWxlbUNvbnN0cnVjdG9yID0ge30pIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnc3BhbicsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBcbiAgICB9XG59XG5cbmNsYXNzIEltZyBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhbiBJbWcgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCBzcmMgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgc3JjLCBjbHMgfTogSW1nQ29uc3RydWN0b3IpIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnaW1nJywgY2xzIH0pO1xuICAgICAgICBpZiAoIGlkICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5pZChpZCk7XG4gICAgICAgIGlmICggc3JjICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuc3JjID0gc3JjO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgc3JjKHNyYzogc3RyaW5nKTogdGhpcztcbiAgICBzcmMoKTogc3RyaW5nO1xuICAgIHNyYyhzcmM/KSB7XG4gICAgICAgIGlmICggc3JjID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQuc3JjXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5zcmMgPSBzcmM7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZWFkb25seSBlOiBIVE1MSW1hZ2VFbGVtZW50O1xufVxuXG5jbGFzcyBBbmNob3IgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTEFuY2hvckVsZW1lbnQ7XG4gICAgcmVhZG9ubHkgZTogSFRNTEFuY2hvckVsZW1lbnQ7XG4gICAgXG4gICAgLyoqQ3JlYXRlIGFuIEFuY2hvciBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQsIGhyZWYgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzLCBocmVmIH06IEFuY2hvckNvbnN0cnVjdG9yID0ge30pIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnYScsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBpZiAoIGhyZWYgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmhyZWYoaHJlZilcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGhyZWYoKTogc3RyaW5nXG4gICAgaHJlZih2YWw6IHN0cmluZyk6IHRoaXNcbiAgICBocmVmKHZhbD8pIHtcbiAgICAgICAgaWYgKCB2YWwgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdocmVmJyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoeyBocmVmIDogdmFsIH0pXG4gICAgfVxuICAgIFxuICAgIHRhcmdldCgpOiBzdHJpbmdcbiAgICB0YXJnZXQodmFsOiBzdHJpbmcpOiB0aGlzXG4gICAgdGFyZ2V0KHZhbD8pIHtcbiAgICAgICAgaWYgKCB2YWwgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd0YXJnZXQnKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cih7IHRhcmdldCA6IHZhbCB9KVxuICAgIH1cbn1cblxuLypjbGFzcyBTdmcgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudHtcbiBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBTVkdFbGVtZW50O1xuIGNvbnN0cnVjdG9yKHtpZCwgY2xzLGh0bWxFbGVtZW50fTogU3ZnQ29uc3RydWN0b3IpIHtcbiBzdXBlcih7dGFnOiAnc3ZnJywgY2xzfSk7XG4gaWYgKGlkKVxuIHRoaXMuaWQoaWQpO1xuIGlmIChzcmMpXG4gdGhpcy5faHRtbEVsZW1lbnQuc3JjID0gc3JjO1xuIFxuIH1cbiB9XG4gKi9cbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWh0bWwtZWxlbWVudCcsIEJldHRlckhUTUxFbGVtZW50KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWRpdicsIERpdiwgeyBleHRlbmRzIDogJ2RpdicgfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1wJywgUGFyYWdyYXBoLCB7IGV4dGVuZHMgOiAncCcgfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1zcGFuJywgU3BhbiwgeyBleHRlbmRzIDogJ3NwYW4nIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItaW1nJywgSW1nLCB7IGV4dGVuZHMgOiAnaW1nJyB9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWEnLCBBbmNob3IsIHsgZXh0ZW5kcyA6ICdhJyB9KTtcblxuLy8gY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItc3ZnJywgU3ZnLCB7ZXh0ZW5kczogJ3N2Zyd9KTtcblxuLyoqQ3JlYXRlIGFuIGVsZW1lbnQgb2YgYHRhZ2AuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgIGFuZCAvIG9yIGBjbHNgKi9cbmZ1bmN0aW9uIGVsZW0oeyB0YWcsIHRleHQsIGNscyB9OiB7IHRhZzogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbi8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBpZGAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbmZ1bmN0aW9uIGVsZW0oeyBpZCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGlkOiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTogQmV0dGVySFRNTEVsZW1lbnQ7XG4vKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgcXVlcnlgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG5mdW5jdGlvbiBlbGVtKHsgcXVlcnksIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBxdWVyeTogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbi8qKldyYXAgYW4gZXhpc3RpbmcgSFRNTEVsZW1lbnQuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbmZ1bmN0aW9uIGVsZW0oeyBodG1sRWxlbWVudCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGh0bWxFbGVtZW50OiBIVE1MRWxlbWVudCwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbmZ1bmN0aW9uIGVsZW0oZWxlbU9wdGlvbnMpOiBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIG5ldyBCZXR0ZXJIVE1MRWxlbWVudChlbGVtT3B0aW9ucyk7XG59XG5cbi8qKkNyZWF0ZSBhbiBTcGFuIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbmZ1bmN0aW9uIHNwYW4oeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogU3BhbiB7XG4gICAgcmV0dXJuIG5ldyBTcGFuKHsgaWQsIHRleHQsIGNscyB9KTtcbn1cblxuLyoqQ3JlYXRlIGFuIERpdiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG5mdW5jdGlvbiBkaXYoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogRGl2IHtcbiAgICByZXR1cm4gbmV3IERpdih7IGlkLCB0ZXh0LCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhbiBJbWcgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCBzcmMgb3IgY2xzLiovXG5mdW5jdGlvbiBpbWcoeyBpZCwgc3JjLCBjbHMgfTogSW1nQ29uc3RydWN0b3IgPSB7fSk6IEltZyB7XG4gICAgcmV0dXJuIG5ldyBJbWcoeyBpZCwgc3JjLCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhIFBhcmFncmFwaCBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG5mdW5jdGlvbiBwYXJhZ3JhcGgoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogUGFyYWdyYXBoIHtcbiAgICByZXR1cm4gbmV3IFBhcmFncmFwaCh7IGlkLCB0ZXh0LCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhbiBBbmNob3IgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0LCBocmVmIG9yIGNscy4qL1xuZnVuY3Rpb24gYW5jaG9yKHsgaWQsIHRleHQsIGNscywgaHJlZiB9OiBBbmNob3JDb25zdHJ1Y3RvciA9IHt9KTogQW5jaG9yIHtcbiAgICByZXR1cm4gbmV3IEFuY2hvcih7IGlkLCB0ZXh0LCBjbHMsIGhyZWYgfSk7XG59XG5cblxuZXhwb3J0IHsgZWxlbSwgc3BhbiwgZGl2LCBpbWcsIHBhcmFncmFwaCwgYW5jaG9yIH1cbiJdfQ==