"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
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
        else if (id !== undefined) {
            this._htmlElement = document.getElementById(id);
            if (!util_1.bool(this._htmlElement))
                console.warn(`Elem constructor: tried to get element by id: "${id}", but no such element exists.`);
        }
        else if (query !== undefined) {
            this._htmlElement = document.querySelector(query);
            if (!util_1.bool(this._htmlElement))
                console.warn(`Elem constructor: tried to get element by query: "${query}", but no element found.`);
        }
        else if (htmlElement !== undefined) {
            this._htmlElement = htmlElement;
            if (!util_1.bool(this._htmlElement))
                console.warn(`Elem constructor: passed explicit htmlElement arg, but arg was falsey: ${htmlElement}`, htmlElement);
        }
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
            for (let [_key, _cachedChild] of util_1.enumerate(newHtmlElement._cachedChildren)) {
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
            for (let [styleAttr, styleVal] of util_1.enumerate(css))
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
        else if (util_1.isFunction(cls)) {
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
        if (util_1.isFunction(cls)) {
            this.e.classList.remove(this.class(cls));
            if (util_1.bool(clses))
                console.warn('removeClass, cls is TReturnBoolean, got ...clses but shouldnt have');
        }
        else {
            this.e.classList.remove(cls);
            for (let c of clses)
                this.e.classList.remove(c);
        }
        return this;
    }
    replaceClass(oldToken, newToken) {
        if (util_1.isFunction(oldToken)) {
            this.e.classList.replace(this.class(oldToken), newToken);
        }
        else {
            this.e.classList.replace(oldToken, newToken);
        }
        return this;
    }
    toggleClass(cls, force) {
        if (util_1.isFunction(cls))
            this.e.classList.toggle(this.class(cls), force);
        else
            this.e.classList.toggle(cls, force);
        return this;
    }
    hasClass(cls) {
        if (util_1.isFunction(cls)) {
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
            for (let [key, child] of util_1.enumerate(keyChildPairs))
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
        for (let [key, value] of util_1.enumerate(map)) {
            let type = typeof value;
            if (util_1.isObject(value)) {
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
        for (let [evType, evFn] of util_1.enumerate(evTypeFnPairs)) {
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
        for (let [k, v] of util_1.enumerate(options)) {
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
            for (let [attr, val] of util_1.enumerate(attrValPairs))
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
            await util_1.wait(dur);
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
        await util_1.wait(dur);
        return this;
    }
    async fadeOut(dur) {
        return await this.fade(dur, 0);
    }
    async fadeIn(dur) {
        return await this.fade(dur, 1);
    }
}
exports.BetterHTMLElement = BetterHTMLElement;
class Div extends BetterHTMLElement {
    constructor({ id, text, cls } = {}) {
        super({ tag: 'div', text, cls });
        if (id !== undefined)
            this.id(id);
    }
}
exports.Div = Div;
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
exports.Span = Span;
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
class Button extends BetterHTMLElement {
    constructor({ id, cls, click, html }) {
        super({ tag: 'button', cls });
        if (id !== undefined)
            this.id(id);
        if (click !== undefined)
            this.click(click);
        if (html !== undefined)
            this.html(html);
    }
}
exports.Button = Button;
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
customElements.define('better-button', Button, { extends: 'button' });
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
function button({ id, cls, click, html } = {}) {
    return new Button({ id, cls, click, html });
}
exports.button = button;
function paragraph({ id, text, cls } = {}) {
    return new Paragraph({ id, text, cls });
}
exports.paragraph = paragraph;
function anchor({ id, text, cls, href } = {}) {
    return new Anchor({ id, text, cls, href });
}
exports.anchor = anchor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtDQUFzRTtBQUV0RSxNQUFNLFVBQVUsR0FBRyw0QkFBNEIsQ0FBQztBQUloRCxNQUFNLGlCQUFpQjtJQStCbkIsWUFBWSxXQUFXO1FBN0JOLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFDeEIsZUFBVSxHQUE4QixFQUFFLENBQUM7UUFDcEQsb0JBQWUsR0FBNEIsRUFBRSxDQUFDO1FBNEJsRCxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsV0FBVyxDQUFDO1FBRXpFLElBQUssQ0FBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRztZQUMzRSxNQUFNLElBQUksdUJBQXVCLENBQUMsQ0FBQyxFQUFFO2dCQUNqQyxHQUFHO2dCQUNILEVBQUU7Z0JBQ0YsV0FBVztnQkFDWCxLQUFLO2FBQ1IsQ0FBQyxDQUFBO1NBRUw7UUFDRCxJQUFLLEdBQUcsS0FBSyxTQUFTLElBQUksUUFBUSxLQUFLLFNBQVM7WUFDNUMsTUFBTSxJQUFJLHVCQUF1QixDQUFDLENBQUMsRUFBRTtnQkFDakMsR0FBRztnQkFDSCxRQUFRO2FBQ1gsRUFBRSwrSUFBK0ksQ0FBQyxDQUFDO1FBRXhKLElBQUssR0FBRyxLQUFLLFNBQVMsRUFBRztZQUNyQixJQUFLLENBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRztnQkFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxZQUFZ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QUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQXdCLEVBQUU7SUFDM0QsT0FBTyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUd5Qyx3QkFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJvb2wsIGVudW1lcmF0ZSwgaXNGdW5jdGlvbiwgaXNPYmplY3QsIHdhaXQgfSBmcm9tIFwiLi4vdXRpbFwiO1xuXG5jb25zdCBTVkdfTlNfVVJJID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJztcblxuLy8gVE9ETzogbWFrZSBCZXR0ZXJIVE1MRWxlbWVudDxUPiwgZm9yIHVzZSBpbiBlZyBjaGlsZFtyZW5dIGZ1bmN0aW9uXG4vLyBleHRlbmRzIEhUTUxFbGVtZW50OiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5L3VwZ3JhZGUjRXhhbXBsZXNcbmNsYXNzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgX2h0bWxFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9pc1N2ZzogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2xpc3RlbmVyczogVEV2ZW50RnVuY3Rpb25NYXA8VEV2ZW50PiA9IHt9O1xuICAgIHByaXZhdGUgX2NhY2hlZENoaWxkcmVuOiBUTWFwPEJldHRlckhUTUxFbGVtZW50PiA9IHt9O1xuICAgIFxuICAgIC8qW1N5bWJvbC50b1ByaW1pdGl2ZV0oaGludCkge1xuICAgICBjb25zb2xlLmxvZygnZnJvbSB0b1ByaW1pdGl2ZSwgaGludDogJywgaGludCwgJ1xcbnRoaXM6ICcsIHRoaXMpO1xuICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQ7XG4gICAgIH1cbiAgICAgXG4gICAgIHZhbHVlT2YoKSB7XG4gICAgIGNvbnNvbGUubG9nKCdmcm9tIHZhbHVlT2YsIHRoaXM6ICcsIHRoaXMpO1xuICAgICByZXR1cm4gdGhpcztcbiAgICAgfVxuICAgICBcbiAgICAgdG9TdHJpbmcoKSB7XG4gICAgIGNvbnNvbGUubG9nKCdmcm9tIHRvU3RyaW5nLCB0aGlzOiAnLCB0aGlzKTtcbiAgICAgcmV0dXJuIHRoaXM7XG4gICAgIH1cbiAgICAgKi9cbiAgICBcbiAgICAvLyBUT0RPOiBxdWVyeSBzaG91bGQgYWxzbyBiZSBhIHByZWRpY2F0ZSBmdW5jdGlvblxuICAgIC8qKkNyZWF0ZSBhbiBlbGVtZW50IG9mIGB0YWdgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCBhbmQgLyBvciBgY2xzYCovXG4gICAgY29uc3RydWN0b3IoeyB0YWcsIHRleHQsIGNscyB9OiB7IHRhZzogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nIH0pO1xuICAgIC8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBpZGAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCB0ZXh0LCBjbHMsIGNoaWxkcmVuIH06IHsgaWQ6IHN0cmluZywgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIC8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBxdWVyeWAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IHF1ZXJ5LCB0ZXh0LCBjbHMsIGNoaWxkcmVuIH06IHsgcXVlcnk6IFF1ZXJ5U2VsZWN0b3IsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICAvKipXcmFwIGFuIGV4aXN0aW5nIEhUTUxFbGVtZW50LiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBodG1sRWxlbWVudCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGh0bWxFbGVtZW50OiBIVE1MRWxlbWVudCwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIGNvbnN0cnVjdG9yKGVsZW1PcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHsgdGFnLCBpZCwgaHRtbEVsZW1lbnQsIHRleHQsIHF1ZXJ5LCBjaGlsZHJlbiwgY2xzIH0gPSBlbGVtT3B0aW9ucztcbiAgICAgICAgXG4gICAgICAgIGlmICggWyB0YWcsIGlkLCBodG1sRWxlbWVudCwgcXVlcnkgXS5maWx0ZXIoeCA9PiB4ICE9PSB1bmRlZmluZWQpLmxlbmd0aCA+IDEgKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFkQXJndW1lbnRzQW1vdW50RXJyb3IoMSwge1xuICAgICAgICAgICAgICAgIHRhZyxcbiAgICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgICBodG1sRWxlbWVudCxcbiAgICAgICAgICAgICAgICBxdWVyeVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGlmICggdGFnICE9PSB1bmRlZmluZWQgJiYgY2hpbGRyZW4gIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFkQXJndW1lbnRzQW1vdW50RXJyb3IoMSwge1xuICAgICAgICAgICAgICAgIHRhZyxcbiAgICAgICAgICAgICAgICBjaGlsZHJlblxuICAgICAgICAgICAgfSwgJ1wiY2hpbGRyZW5cIiBhbmQgXCJ0YWdcIiBvcHRpb25zIGFyZSBtdXR1YWxseSBleGNsdXNpdmUsIGJlY2F1c2UgdGFnIGltcGxpZXMgY3JlYXRpbmcgYSBuZXcgZWxlbWVudCBhbmQgY2hpbGRyZW4gaW1wbGllcyBnZXR0aW5nIGFuIGV4aXN0aW5nIG9uZS4nKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggdGFnICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBpZiAoIFsgJ3N2ZycsICdwYXRoJyBdLmluY2x1ZGVzKHRhZy50b0xvd2VyQ2FzZSgpKSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N2ZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TX1VSSSwgdGFnKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLl9odG1sRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3htbG5zJywgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIGlkICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgICAgICAgIGlmICggIWJvb2wodGhpcy5faHRtbEVsZW1lbnQpIClcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEVsZW0gY29uc3RydWN0b3I6IHRyaWVkIHRvIGdldCBlbGVtZW50IGJ5IGlkOiBcIiR7aWR9XCIsIGJ1dCBubyBzdWNoIGVsZW1lbnQgZXhpc3RzLmApXG4gICAgICAgIH0gZWxzZSBpZiAoIHF1ZXJ5ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocXVlcnkpO1xuICAgICAgICAgICAgaWYgKCAhYm9vbCh0aGlzLl9odG1sRWxlbWVudCkgKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRWxlbSBjb25zdHJ1Y3RvcjogdHJpZWQgdG8gZ2V0IGVsZW1lbnQgYnkgcXVlcnk6IFwiJHtxdWVyeX1cIiwgYnV0IG5vIGVsZW1lbnQgZm91bmQuYClcbiAgICAgICAgfSBlbHNlIGlmICggaHRtbEVsZW1lbnQgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gaHRtbEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoICFib29sKHRoaXMuX2h0bWxFbGVtZW50KSApXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFbGVtIGNvbnN0cnVjdG9yOiBwYXNzZWQgZXhwbGljaXQgaHRtbEVsZW1lbnQgYXJnLCBidXQgYXJnIHdhcyBmYWxzZXk6ICR7aHRtbEVsZW1lbnR9YCwgaHRtbEVsZW1lbnQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFkQXJndW1lbnRzQW1vdW50RXJyb3IoMSwge1xuICAgICAgICAgICAgICAgIHRhZyxcbiAgICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgICBodG1sRWxlbWVudCxcbiAgICAgICAgICAgICAgICBxdWVyeVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCB0ZXh0ICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy50ZXh0KHRleHQpO1xuICAgICAgICBpZiAoIGNscyAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuY2xhc3MoY2xzKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggY2hpbGRyZW4gIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmNhY2hlQ2hpbGRyZW4oY2hpbGRyZW4pO1xuICAgICAgICBcbiAgICAgICAgLy8gT2JqZWN0LmFzc2lnbih0aGlzLCBwcm94eSk7XG4gICAgICAgIC8qY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgICAgICByZXR1cm4gbmV3IFByb3h5KHRoaXMsIHtcbiAgICAgICAgIGdldCh0YXJnZXQ6IEJldHRlckhUTUxFbGVtZW50LCBwOiBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2wsIHJlY2VpdmVyOiBhbnkpOiBhbnkge1xuICAgICAgICAgLy8gY29uc29sZS5sb2coJ2xvZ2dpbmcnKTtcbiAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd0YXJnZXQ6ICcsIHRhcmdldCxcbiAgICAgICAgIC8vICAgICAnXFxudGhhdDogJywgdGhhdCxcbiAgICAgICAgIC8vICAgICAnXFxudHlwZW9mKHRoYXQpOiAnLCB0eXBlb2YgKHRoYXQpLFxuICAgICAgICAgLy8gICAgICdcXG5wOiAnLCBwLFxuICAgICAgICAgLy8gICAgICdcXG5yZWNlaXZlcjogJywgcmVjZWl2ZXIsXG4gICAgICAgICAvLyAgICAgJ1xcbnRoaXM6ICcsIHRoaXMpO1xuICAgICAgICAgcmV0dXJuIHRoYXRbcF07XG4gICAgICAgICB9XG4gICAgICAgICB9KVxuICAgICAgICAgKi9cbiAgICB9XG4gICAgXG4gICAgLyoqUmV0dXJuIHRoZSB3cmFwcGVkIEhUTUxFbGVtZW50Ki9cbiAgICBnZXQgZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50O1xuICAgIH1cbiAgICBcbiAgICAvKipTZXRzIGB0aGlzLl9odG1sRWxlbWVudGAgdG8gYG5ld0h0bWxFbGVtZW50Ll9odG1sRWxlbWVudGAuXG4gICAgICogUmVzZXRzIGB0aGlzLl9jYWNoZWRDaGlsZHJlbmAgYW5kIGNhY2hlcyBgbmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuYC5cbiAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyBmcm9tIGBuZXdIdG1sRWxlbWVudC5fbGlzdGVuZXJzYCwgd2hpbGUga2VlcGluZyBgdGhpcy5fbGlzdGVuZXJzYC4qL1xuICAgIHdyYXBTb21ldGhpbmdFbHNlKG5ld0h0bWxFbGVtZW50OiBCZXR0ZXJIVE1MRWxlbWVudCk6IHRoaXNcbiAgICAvKipTZXRzIGB0aGlzLl9odG1sRWxlbWVudGAgdG8gYG5ld0h0bWxFbGVtZW50YC5cbiAgICAgKiBLZWVwcyBgdGhpcy5fbGlzdGVuZXJzYC5cbiAgICAgKiBOT1RFOiB0aGlzIHJlaW5pdGlhbGl6ZXMgYHRoaXMuX2NhY2hlZENoaWxkcmVuYCBhbmQgYWxsIGV2ZW50IGxpc3RlbmVycyBiZWxvbmdpbmcgdG8gYG5ld0h0bWxFbGVtZW50YCBhcmUgbG9zdC4gUGFzcyBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgdG8ga2VlcCB0aGVtLiovXG4gICAgd3JhcFNvbWV0aGluZ0Vsc2UobmV3SHRtbEVsZW1lbnQ6IE5vZGUpOiB0aGlzXG4gICAgd3JhcFNvbWV0aGluZ0Vsc2UobmV3SHRtbEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fY2FjaGVkQ2hpbGRyZW4gPSB7fTtcbiAgICAgICAgaWYgKCBuZXdIdG1sRWxlbWVudCBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50ICkge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQucmVwbGFjZVdpdGgobmV3SHRtbEVsZW1lbnQuZSk7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IG5ld0h0bWxFbGVtZW50LmU7XG4gICAgICAgICAgICBmb3IgKCBsZXQgWyBfa2V5LCBfY2FjaGVkQ2hpbGQgXSBvZiBlbnVtZXJhdGUobmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuKSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShfa2V5IGFzIHN0cmluZywgX2NhY2hlZENoaWxkKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuX2NhY2hlZENoaWxkcmVuKS5sZW5ndGhcbiAgICAgICAgICAgICAgICAhPT0gT2JqZWN0LmtleXMobmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuKS5sZW5ndGhcbiAgICAgICAgICAgICAgICB8fFxuICAgICAgICAgICAgICAgIE9iamVjdC52YWx1ZXModGhpcy5fY2FjaGVkQ2hpbGRyZW4pLmZpbHRlcih2ID0+IHYgIT09IHVuZGVmaW5lZCkubGVuZ3RoXG4gICAgICAgICAgICAgICAgIT09IE9iamVjdC52YWx1ZXMobmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuKS5maWx0ZXIodiA9PiB2ICE9PSB1bmRlZmluZWQpLmxlbmd0aFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGB3cmFwU29tZXRoaW5nRWxzZSB0aGlzLl9jYWNoZWRDaGlsZHJlbiBsZW5ndGggIT09IG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbi5sZW5ndGhgLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzIDogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0h0bWxFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9uKHsgLi4udGhpcy5fbGlzdGVuZXJzLCAuLi5uZXdIdG1sRWxlbWVudC5fbGlzdGVuZXJzLCB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5vIHdheSB0byBnZXQgbmV3SHRtbEVsZW1lbnQgZXZlbnQgbGlzdGVuZXJzIGJlc2lkZXMgaGFja2luZyBFbGVtZW50LnByb3RvdHlwZVxuICAgICAgICAgICAgdGhpcy5vbih0aGlzLl9saXN0ZW5lcnMpO1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQucmVwbGFjZVdpdGgobmV3SHRtbEVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBuZXdIdG1sRWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8vICoqKiAgQmFzaWNcbiAgICAvKipTZXQgdGhlIGVsZW1lbnQncyBpbm5lckhUTUwqL1xuICAgIGh0bWwoaHRtbDogc3RyaW5nKTogdGhpcztcbiAgICAvKipHZXQgdGhlIGVsZW1lbnQncyBpbm5lckhUTUwqL1xuICAgIGh0bWwoKTogc3RyaW5nO1xuICAgIGh0bWwoaHRtbD8pIHtcbiAgICAgICAgaWYgKCBodG1sID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLmlubmVySFRNTDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqU2V0IHRoZSBlbGVtZW50J3MgaW5uZXJUZXh0Ki9cbiAgICB0ZXh0KHR4dDogc3RyaW5nIHwgbnVtYmVyKTogdGhpcztcbiAgICAvKipHZXQgdGhlIGVsZW1lbnQncyBpbm5lclRleHQqL1xuICAgIHRleHQoKTogc3RyaW5nO1xuICAgIHRleHQodHh0Pykge1xuICAgICAgICBpZiAoIHR4dCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5pbm5lclRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmUuaW5uZXJUZXh0ID0gdHh0O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qKlNldCB0aGUgaWQgb2YgdGhlIGVsZW1lbnQqL1xuICAgIGlkKGlkOiBzdHJpbmcpOiB0aGlzO1xuICAgIC8qKkdldCB0aGUgaWQgb2YgdGhlIGVsZW1lbnQqL1xuICAgIGlkKCk6IHN0cmluZztcbiAgICBpZChpZD8pIHtcbiAgICAgICAgaWYgKCBpZCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5pZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZS5pZCA9IGlkO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqRm9yIGVhY2ggYHs8c3R5bGVBdHRyPjogPHN0eWxlVmFsPn1gIHBhaXIsIHNldCB0aGUgYHN0eWxlW3N0eWxlQXR0cl1gIHRvIGBzdHlsZVZhbGAuKi9cbiAgICBjc3MoY3NzOiBQYXJ0aWFsPENzc09wdGlvbnM+KTogdGhpc1xuICAgIC8qKkdldCBgc3R5bGVbY3NzXWAqL1xuICAgIGNzcyhjc3M6IHN0cmluZyk6IHN0cmluZ1xuICAgIGNzcyhjc3MpIHtcbiAgICAgICAgaWYgKCB0eXBlb2YgY3NzID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuc3R5bGVbY3NzXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoIGxldCBbIHN0eWxlQXR0ciwgc3R5bGVWYWwgXSBvZiBlbnVtZXJhdGUoY3NzKSApXG4gICAgICAgICAgICAgICAgdGhpcy5lLnN0eWxlWzxzdHJpbmc+IHN0eWxlQXR0cl0gPSBzdHlsZVZhbDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlJlbW92ZSB0aGUgdmFsdWUgb2YgdGhlIHBhc3NlZCBzdHlsZSBwcm9wZXJ0aWVzKi9cbiAgICB1bmNzcyguLi5yZW1vdmVQcm9wczogKGtleW9mIENzc09wdGlvbnMpW10pOiB0aGlzIHtcbiAgICAgICAgbGV0IGNzcyA9IHt9O1xuICAgICAgICBmb3IgKCBsZXQgcHJvcCBvZiByZW1vdmVQcm9wcyApXG4gICAgICAgICAgICBjc3NbcHJvcF0gPSAnJztcbiAgICAgICAgcmV0dXJuIHRoaXMuY3NzKGNzcyk7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBpcyhlbGVtZW50OiBCZXR0ZXJIVE1MRWxlbWVudCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2lzL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIik7XG4gICAgfVxuICAgIFxuICAgIC8qXG4gICAgIGFuaW1hdGUob3B0czogQW5pbWF0ZU9wdGlvbnMpIHtcbiAgICAgLy8gc2VlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvQ1NTX0FuaW1hdGlvbnMvVGlwc1xuICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgICB9XG4gICAgICovXG4gICAgXG4gICAgLy8gKioqICBDbGFzc2VzXG4gICAgLyoqYC5jbGFzc05hbWUgPSBjbHNgKi9cbiAgICBjbGFzcyhjbHM6IHN0cmluZyk6IHRoaXM7XG4gICAgLyoqUmV0dXJuIHRoZSBmaXJzdCBjbGFzcyB0aGF0IG1hdGNoZXMgYGNsc2AgcHJlZGljYXRlLiovXG4gICAgY2xhc3MoY2xzOiBUUmV0dXJuQm9vbGVhbik6IHN0cmluZztcbiAgICAvKipSZXR1cm4gYSBzdHJpbmcgYXJyYXkgb2YgdGhlIGVsZW1lbnQncyBjbGFzc2VzIChub3QgYSBjbGFzc0xpc3QpKi9cbiAgICBjbGFzcygpOiBzdHJpbmdbXTtcbiAgICBjbGFzcyhjbHM/KSB7XG4gICAgICAgIGlmICggY2xzID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmUuY2xhc3NMaXN0KTtcbiAgICAgICAgfSBlbHNlIGlmICggaXNGdW5jdGlvbihjbHMpICkge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5lLmNsYXNzTGlzdCkuZmluZChjbHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCB0aGlzLl9pc1N2ZyApIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgLy8gbm9pbnNwZWN0aW9uIEpTQ29uc3RhbnRSZWFzc2lnbm1lbnRcbiAgICAgICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0ID0gWyBjbHMgXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lLmNsYXNzTmFtZSA9IGNscztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGFkZENsYXNzKGNsczogc3RyaW5nLCAuLi5jbHNlczogc3RyaW5nW10pOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5hZGQoY2xzKTtcbiAgICAgICAgZm9yICggbGV0IGMgb2YgY2xzZXMgKVxuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5hZGQoYyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICByZW1vdmVDbGFzcyhjbHM6IFRSZXR1cm5Cb29sZWFuKTogdGhpcztcbiAgICByZW1vdmVDbGFzcyhjbHM6IHN0cmluZywgLi4uY2xzZXM6IHN0cmluZ1tdKTogdGhpcztcbiAgICByZW1vdmVDbGFzcyhjbHMsIC4uLmNsc2VzKSB7XG4gICAgICAgIGlmICggaXNGdW5jdGlvbjxib29sZWFuPihjbHMpICkge1xuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzcyhjbHMpKTtcbiAgICAgICAgICAgIGlmICggYm9vbChjbHNlcykgKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybigncmVtb3ZlQ2xhc3MsIGNscyBpcyBUUmV0dXJuQm9vbGVhbiwgZ290IC4uLmNsc2VzIGJ1dCBzaG91bGRudCBoYXZlJylcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZW1vdmUoY2xzKTtcbiAgICAgICAgICAgIGZvciAoIGxldCBjIG9mIGNsc2VzIClcbiAgICAgICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcmVwbGFjZUNsYXNzKG9sZFRva2VuOiBUUmV0dXJuQm9vbGVhbiwgbmV3VG9rZW46IHN0cmluZyk6IHRoaXM7XG4gICAgcmVwbGFjZUNsYXNzKG9sZFRva2VuOiBzdHJpbmcsIG5ld1Rva2VuOiBzdHJpbmcpOiB0aGlzXG4gICAgcmVwbGFjZUNsYXNzKG9sZFRva2VuLCBuZXdUb2tlbikge1xuICAgICAgICBpZiAoIGlzRnVuY3Rpb248Ym9vbGVhbj4ob2xkVG9rZW4pICkge1xuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZXBsYWNlKHRoaXMuY2xhc3Mob2xkVG9rZW4pLCBuZXdUb2tlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnJlcGxhY2Uob2xkVG9rZW4sIG5ld1Rva2VuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgdG9nZ2xlQ2xhc3MoY2xzOiBUUmV0dXJuQm9vbGVhbiwgZm9yY2U/OiBib29sZWFuKTogdGhpc1xuICAgIHRvZ2dsZUNsYXNzKGNsczogc3RyaW5nLCBmb3JjZT86IGJvb2xlYW4pOiB0aGlzXG4gICAgdG9nZ2xlQ2xhc3MoY2xzLCBmb3JjZSkge1xuICAgICAgICBpZiAoIGlzRnVuY3Rpb248Ym9vbGVhbj4oY2xzKSApXG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLmNsYXNzKGNscyksIGZvcmNlKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC50b2dnbGUoY2xzLCBmb3JjZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipSZXR1cm5zIGB0aGlzLmUuY2xhc3NMaXN0LmNvbnRhaW5zKGNscylgICovXG4gICAgaGFzQ2xhc3MoY2xzOiBzdHJpbmcpOiBib29sZWFuXG4gICAgLyoqUmV0dXJucyB3aGV0aGVyIGB0aGlzYCBoYXMgYSBjbGFzcyB0aGF0IG1hdGNoZXMgcGFzc2VkIGZ1bmN0aW9uICovXG4gICAgaGFzQ2xhc3MoY2xzOiBUUmV0dXJuQm9vbGVhbik6IGJvb2xlYW5cbiAgICBoYXNDbGFzcyhjbHMpIHtcbiAgICAgICAgaWYgKCBpc0Z1bmN0aW9uPGJvb2xlYW4+KGNscykgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbGFzcyhjbHMpICE9PSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLmNsYXNzTGlzdC5jb250YWlucyhjbHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vICoqKiAgTm9kZXNcbiAgICAvKipJbnNlcnQgYXQgbGVhc3Qgb25lIGBub2RlYCBqdXN0IGFmdGVyIGB0aGlzYC4gQW55IGBub2RlYCBjYW4gYmUgZWl0aGVyIGBCZXR0ZXJIVE1MRWxlbWVudGBzIG9yIHZhbmlsbGEgYE5vZGVgLiovXG4gICAgYWZ0ZXIoLi4ubm9kZXM6IEFycmF5PEJldHRlckhUTUxFbGVtZW50IHwgTm9kZT4pOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IG5vZGUgb2Ygbm9kZXMgKSB7XG4gICAgICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICAgICAgdGhpcy5lLmFmdGVyKG5vZGUuZSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5lLmFmdGVyKG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipJbnNlcnQgYHRoaXNgIGp1c3QgYWZ0ZXIgYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9yIGEgdmFuaWxsYSBgTm9kZWAuKi9cbiAgICBpbnNlcnRBZnRlcihub2RlOiBCZXR0ZXJIVE1MRWxlbWVudCB8IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgIG5vZGUuZS5hZnRlcih0aGlzLmUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBub2RlLmFmdGVyKHRoaXMuZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipJbnNlcnQgYXQgbGVhc3Qgb25lIGBub2RlYCBhZnRlciB0aGUgbGFzdCBjaGlsZCBvZiBgdGhpc2AuXG4gICAgICogQW55IGBub2RlYCBjYW4gYmUgZWl0aGVyIGEgYEJldHRlckhUTUxFbGVtZW50YCwgYSB2YW5pbGxhIGBOb2RlYCxcbiAgICAgKiBhIGB7c29tZUtleTogQmV0dGVySFRNTEVsZW1lbnR9YCBwYWlycyBvYmplY3QsIG9yIGEgYFtzb21lS2V5LCBCZXR0ZXJIVE1MRWxlbWVudF1gIHR1cGxlLiovXG4gICAgYXBwZW5kKC4uLm5vZGVzOiBBcnJheTxCZXR0ZXJIVE1MRWxlbWVudCB8IE5vZGUgfCBUTWFwPEJldHRlckhUTUxFbGVtZW50PiB8IFsgc3RyaW5nLCBCZXR0ZXJIVE1MRWxlbWVudCBdPik6IHRoaXMge1xuICAgICAgICBmb3IgKCBsZXQgbm9kZSBvZiBub2RlcyApIHtcbiAgICAgICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgICAgICB0aGlzLmUuYXBwZW5kKG5vZGUuZSk7XG4gICAgICAgICAgICBlbHNlIGlmICggbm9kZSBpbnN0YW5jZW9mIE5vZGUgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5hcHBlbmQobm9kZSk7XG4gICAgICAgICAgICBlbHNlIGlmICggQXJyYXkuaXNBcnJheShub2RlKSApXG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZUFwcGVuZChbIG5vZGUgXSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZUFwcGVuZChub2RlKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipBcHBlbmQgYHRoaXNgIHRvIGEgYEJldHRlckhUTUxFbGVtZW50YCBvciBhIHZhbmlsbGEgYE5vZGVgKi9cbiAgICBhcHBlbmRUbyhub2RlOiBCZXR0ZXJIVE1MRWxlbWVudCB8IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgIG5vZGUuZS5hcHBlbmQodGhpcy5lKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbm9kZS5hcHBlbmQodGhpcy5lKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipJbnNlcnQgYXQgbGVhc3Qgb25lIGBub2RlYCBqdXN0IGJlZm9yZSBgdGhpc2AuIEFueSBgbm9kZWAgY2FuIGJlIGVpdGhlciBgQmV0dGVySFRNTEVsZW1lbnRgcyBvciB2YW5pbGxhIGBOb2RlYC4qL1xuICAgIGJlZm9yZSguLi5ub2RlczogQXJyYXk8QmV0dGVySFRNTEVsZW1lbnQgfCBOb2RlPik6IHRoaXMge1xuICAgICAgICBmb3IgKCBsZXQgbm9kZSBvZiBub2RlcyApIHtcbiAgICAgICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgICAgICB0aGlzLmUuYmVmb3JlKG5vZGUuZSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5lLmJlZm9yZShub2RlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqSW5zZXJ0IGB0aGlzYCBqdXN0IGJlZm9yZSBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgb3IgYSB2YW5pbGxhIGBOb2RlYHMuKi9cbiAgICBpbnNlcnRCZWZvcmUobm9kZTogQmV0dGVySFRNTEVsZW1lbnQgfCBIVE1MRWxlbWVudCk6IHRoaXMge1xuICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICBub2RlLmUuYmVmb3JlKHRoaXMuZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5vZGUuYmVmb3JlKHRoaXMuZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICByZXBsYWNlQ2hpbGQobmV3Q2hpbGQ6IE5vZGUsIG9sZENoaWxkOiBOb2RlKTogdGhpcztcbiAgICByZXBsYWNlQ2hpbGQobmV3Q2hpbGQ6IEJldHRlckhUTUxFbGVtZW50LCBvbGRDaGlsZDogQmV0dGVySFRNTEVsZW1lbnQpOiB0aGlzO1xuICAgIHJlcGxhY2VDaGlsZChuZXdDaGlsZCwgb2xkQ2hpbGQpIHtcbiAgICAgICAgdGhpcy5lLnJlcGxhY2VDaGlsZChuZXdDaGlsZCwgb2xkQ2hpbGQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBfY2FjaGUoa2V5OiBzdHJpbmcsIGNoaWxkOiBCZXR0ZXJIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzW2tleV0gPSBjaGlsZDtcbiAgICAgICAgdGhpcy5fY2FjaGVkQ2hpbGRyZW5ba2V5XSA9IGNoaWxkO1xuICAgIH1cbiAgICBcbiAgICAvKipGb3IgZWFjaCBgW2tleSwgY2hpbGRdYCBwYWlyLCBgYXBwZW5kKGNoaWxkKWAgYW5kIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLiAqL1xuICAgIGNhY2hlQXBwZW5kKGtleUNoaWxkUGFpcnM6IFRNYXA8QmV0dGVySFRNTEVsZW1lbnQ+KTogdGhpc1xuICAgIC8qKkZvciBlYWNoIGBba2V5LCBjaGlsZF1gIHR1cGxlLCBgYXBwZW5kKGNoaWxkKWAgYW5kIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLiAqL1xuICAgIGNhY2hlQXBwZW5kKGtleUNoaWxkUGFpcnM6IFsgc3RyaW5nLCBCZXR0ZXJIVE1MRWxlbWVudCBdW10pOiB0aGlzXG4gICAgY2FjaGVBcHBlbmQoa2V5Q2hpbGRQYWlycykge1xuICAgICAgICBjb25zdCBfY2FjaGVBcHBlbmQgPSAoX2tleTogc3RyaW5nLCBfY2hpbGQ6IEJldHRlckhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFwcGVuZChfY2hpbGQpO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGUoX2tleSwgX2NoaWxkKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCBBcnJheS5pc0FycmF5KGtleUNoaWxkUGFpcnMpICkge1xuICAgICAgICAgICAgZm9yICggbGV0IFsga2V5LCBjaGlsZCBdIG9mIGtleUNoaWxkUGFpcnMgKVxuICAgICAgICAgICAgICAgIF9jYWNoZUFwcGVuZChrZXksIGNoaWxkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoIGxldCBbIGtleSwgY2hpbGQgXSBvZiBlbnVtZXJhdGUoa2V5Q2hpbGRQYWlycykgKVxuICAgICAgICAgICAgICAgIF9jYWNoZUFwcGVuZChrZXksIGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqR2V0IGEgY2hpbGQgd2l0aCBgcXVlcnlTZWxlY3RvcmAgYW5kIHJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgb2YgaXQqL1xuICAgIGNoaWxkPEsgZXh0ZW5kcyBIVE1MVGFnPihzZWxlY3RvcjogSyk6IEJldHRlckhUTUxFbGVtZW50O1xuICAgIC8qKkdldCBhIGNoaWxkIHdpdGggYHF1ZXJ5U2VsZWN0b3JgIGFuZCByZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9mIGl0Ki9cbiAgICBjaGlsZChzZWxlY3Rvcjogc3RyaW5nKTogQmV0dGVySFRNTEVsZW1lbnQ7XG4gICAgY2hpbGQoc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCZXR0ZXJIVE1MRWxlbWVudCh7IGh0bWxFbGVtZW50IDogdGhpcy5lLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpIH0pO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipSZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIGxpc3Qgb2YgYWxsIGNoaWxkcmVuICovXG4gICAgY2hpbGRyZW4oKTogQmV0dGVySFRNTEVsZW1lbnRbXTtcbiAgICAvKipSZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIGxpc3Qgb2YgYWxsIGNoaWxkcmVuIHNlbGVjdGVkIGJ5IGBzZWxlY3RvcmAgKi9cbiAgICBjaGlsZHJlbjxLIGV4dGVuZHMgSFRNTFRhZz4oc2VsZWN0b3I6IEspOiBCZXR0ZXJIVE1MRWxlbWVudFtdO1xuICAgIC8qKlJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgbGlzdCBvZiBhbGwgY2hpbGRyZW4gc2VsZWN0ZWQgYnkgYHNlbGVjdG9yYCAqL1xuICAgIGNoaWxkcmVuKHNlbGVjdG9yOiBzdHJpbmcgfCBIVE1MVGFnKTogQmV0dGVySFRNTEVsZW1lbnRbXTtcbiAgICBjaGlsZHJlbihzZWxlY3Rvcj8pIHtcbiAgICAgICAgbGV0IGNoaWxkcmVuVmFuaWxsYTtcbiAgICAgICAgbGV0IGNoaWxkcmVuQ29sbGVjdGlvbjtcbiAgICAgICAgaWYgKCBzZWxlY3RvciA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgY2hpbGRyZW5Db2xsZWN0aW9uID0gdGhpcy5lLmNoaWxkcmVuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hpbGRyZW5Db2xsZWN0aW9uID0gdGhpcy5lLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkcmVuVmFuaWxsYSA9IDxIVE1MRWxlbWVudFtdPiBBcnJheS5mcm9tKGNoaWxkcmVuQ29sbGVjdGlvbik7XG4gICAgICAgIGNvbnN0IHRvRWxlbSA9IChjOiBIVE1MRWxlbWVudCkgPT4gbmV3IEJldHRlckhUTUxFbGVtZW50KHsgaHRtbEVsZW1lbnQgOiBjIH0pO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW5WYW5pbGxhLm1hcCh0b0VsZW0pO1xuICAgIH1cbiAgICBcbiAgICBjbG9uZShkZWVwPzogYm9vbGVhbik6IEJldHRlckhUTUxFbGVtZW50IHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gbmV3IEJldHRlckhUTUxFbGVtZW50KHsgaHRtbEVsZW1lbnQgOiB0aGlzLmUuY2xvbmVOb2RlKGRlZXApIH0pO1xuICAgIH1cbiAgICBcbiAgICAvKipGb3IgZWFjaCBgW2tleSwgc2VsZWN0b3JdYCBwYWlyLCB3aGVyZSBgc2VsZWN0b3JgIGlzIGVpdGhlciBhbiBgSFRNTFRhZ2Agb3IgYSBgc3RyaW5nYCwgZ2V0IGB0aGlzLmNoaWxkKHNlbGVjdG9yKWAsIGFuZCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzaW5nIGBjYWNoZUNoaWxkcmVuYCBkaXJlY3RseVxuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oeyBpZDogJ25hdmJhcicgfSk7XG4gICAgICogbmF2YmFyLmNhY2hlQ2hpbGRyZW4oeyBob21lOiAnLm5hdmJhci1pdGVtLWhvbWUnLCBhYm91dDogJy5uYXZiYXItaXRlbS1hYm91dCcgfSk7XG4gICAgICogbmF2YmFyLmhvbWUudG9nZ2xlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBuYXZiYXIuYWJvdXQuY3NzKC4uLik7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgaW5kaXJlY3RseSB0aHJvdWdoIGBjaGlsZHJlbmAgY29uc3RydWN0b3Igb3B0aW9uXG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7IGlkOiAnbmF2YmFyJywgY2hpbGRyZW46IHsgaG9tZTogJy5uYXZiYXItaXRlbS1ob21lJywgYWJvdXQ6ICcubmF2YmFyLWl0ZW0tYWJvdXQnIH19KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIG5hdmJhci5hYm91dC5jc3MoLi4uKTtcbiAgICAgKiBAc2VlIHRoaXMuY2hpbGQqL1xuICAgIGNhY2hlQ2hpbGRyZW4ocXVlcnlNYXA6IFRNYXA8UXVlcnlTZWxlY3Rvcj4pOiB0aGlzXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIHNlbGVjdG9yXWAgcGFpciwgd2hlcmUgYHNlbGVjdG9yYCBpcyBhIHJlY3Vyc2l2ZSBge3N1YnNlbGVjdG9yOiBrZXlTZWxlY3Rvck9ian1gIG9iamVjdCxcbiAgICAgKiBleHRyYWN0IGB0aGlzLmNoaWxkKHN1YnNlbGVjdG9yKWAsIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLCB0aGVuIGNhbGwgYHRoaXNba2V5XS5jYWNoZUNoaWxkcmVuYCBwYXNzaW5nIHRoZSByZWN1cnNpdmUgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGRpcmVjdGx5XG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7IGlkOiAnbmF2YmFyJyB9KTtcbiAgICAgKiBuYXZiYXIuY2FjaGVDaGlsZHJlbih7XG4gICAgICogICAgICBob21lOiB7XG4gICAgICogICAgICAgICAgJy5uYXZiYXItaXRlbS1ob21lJzoge1xuICAgICAqICAgICAgICAgICAgICBuZXdzOiAnLm5hdmJhci1zdWJpdGVtLW5ld3MsXG4gICAgICogICAgICAgICAgICAgIHN1cHBvcnQ6ICcubmF2YmFyLXN1Yml0ZW0tc3VwcG9ydCdcbiAgICAgKiAgICAgICAgICB9XG4gICAgICogICAgICB9XG4gICAgICogIH0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogbmF2YmFyLmhvbWUubmV3cy5jc3MoLi4uKTtcbiAgICAgKiBuYXZiYXIuaG9tZS5zdXBwb3J0LnBvaW50ZXJkb3duKC4uLik7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgaW5kaXJlY3RseSB0aHJvdWdoIGBjaGlsZHJlbmAgY29uc3RydWN0b3Igb3B0aW9uXG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7cXVlcnk6ICcjbmF2YmFyJywgY2hpbGRyZW46IHtcbiAgICAgKiAgICAgIGhvbWU6IHtcbiAgICAgKiAgICAgICAgICAnLm5hdmJhci1pdGVtLWhvbWUnOiB7XG4gICAgICogICAgICAgICAgICAgIG5ld3M6ICcubmF2YmFyLXN1Yml0ZW0tbmV3cyxcbiAgICAgKiAgICAgICAgICAgICAgc3VwcG9ydDogJy5uYXZiYXItc3ViaXRlbS1zdXBwb3J0J1xuICAgICAqICAgICAgICAgIH1cbiAgICAgKiAgICAgIH1cbiAgICAgKiAgfX0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogbmF2YmFyLmhvbWUubmV3cy5jc3MoLi4uKTtcbiAgICAgKiBuYXZiYXIuaG9tZS5zdXBwb3J0LnBvaW50ZXJkb3duKC4uLik7XG4gICAgICogQHNlZSB0aGlzLmNoaWxkKi9cbiAgICBjYWNoZUNoaWxkcmVuKHJlY3Vyc2l2ZVF1ZXJ5TWFwOiBUUmVjTWFwPFF1ZXJ5U2VsZWN0b3I+KTogdGhpc1xuICAgIGNhY2hlQ2hpbGRyZW4oYmhlTWFwOiBUTWFwPEJldHRlckhUTUxFbGVtZW50Pik6IHRoaXNcbiAgICAvKipGb3IgZWFjaCBgW2tleSwgc2VsZWN0b3JdYCBwYWlyLCB3aGVyZSBgc2VsZWN0b3JgIGlzIGEgYEJldHRlckhUTUxFbGVtZW50YCwgc3RvcmUgaXQgaW4gYHRoaXNba2V5XWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgZGlyZWN0bHlcbiAgICAgKiBjb25zdCBob21lID0gZWxlbSh7IHF1ZXJ5OiAnLm5hdmJhci1pdGVtLWhvbWUnIH0pO1xuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oeyBpZDogJ25hdmJhcicgfSk7XG4gICAgICogbmF2YmFyLmNhY2hlQ2hpbGRyZW4oeyBob21lIH0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgaW5kaXJlY3RseSB0aHJvdWdoIGBjaGlsZHJlbmAgY29uc3RydWN0b3Igb3B0aW9uXG4gICAgICogY29uc3QgaG9tZSA9IGVsZW0oeyBxdWVyeTogJy5uYXZiYXItaXRlbS1ob21lJyB9KTtcbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHtpZDogJ25hdmJhcicsIGNoaWxkcmVuOiB7IGhvbWUgfX0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogQHNlZSB0aGlzLmNoaWxkKi9cbiAgICBcbiAgICBjYWNoZUNoaWxkcmVuKHJlY3Vyc2l2ZUJIRU1hcDogVFJlY01hcDxCZXR0ZXJIVE1MRWxlbWVudD4pOiB0aGlzXG4gICAgLyoqa2V5OiBzdHJpbmcuIHZhbHVlOiBlaXRoZXIgXCJzZWxlY3RvciBzdHJpbmdcIiBPUiB7XCJzZWxlY3RvciBzdHJpbmdcIjogPHJlY3Vyc2UgZG93bj59Ki9cbiAgICBjYWNoZUNoaWxkcmVuKG1hcCkge1xuICAgICAgICBmb3IgKCBsZXQgWyBrZXksIHZhbHVlIF0gb2YgZW51bWVyYXRlKG1hcCkgKSB7XG4gICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgICAgICAgICAgIGlmICggaXNPYmplY3QodmFsdWUpICkge1xuICAgICAgICAgICAgICAgIGlmICggdmFsdWUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoa2V5LCB2YWx1ZSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBlbnRyaWVzWzFdICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYGNhY2hlQ2hpbGRyZW4oKSByZWNlaXZlZCByZWN1cnNpdmUgb2JqIHdpdGggbW9yZSB0aGFuIDEgc2VsZWN0b3IgZm9yIGEga2V5LiBVc2luZyBvbmx5IDB0aCBzZWxlY3RvcmAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm11bHRpcGxlIHNlbGVjdG9yc1wiIDogZW50cmllcy5tYXAoZSA9PiBlWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBvbmx5IGZpcnN0IGJlY2F1c2UgMToxIGZvciBrZXk6c2VsZWN0b3IuXG4gICAgICAgICAgICAgICAgICAgIC8vIChpZSBjYW4ndCBkbyB7cmlnaHQ6IHsucmlnaHQ6IHsuLi59LCAucmlnaHQyOiB7Li4ufX0pXG4gICAgICAgICAgICAgICAgICAgIGxldCBbIHNlbGVjdG9yLCBvYmogXSA9IGVudHJpZXNbMF07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlKGtleSwgdGhpcy5jaGlsZChzZWxlY3RvcikpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2tleV0uY2FjaGVDaGlsZHJlbihvYmopXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShrZXksIHRoaXMuY2hpbGQodmFsdWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBjYWNoZUNoaWxkcmVuLCBiYWQgdmFsdWUgdHlwZTogXCIke3R5cGV9XCIuIGtleTogXCIke2tleX1cIiwgdmFsdWU6IFwiJHt2YWx1ZX1cIi4gbWFwOmAsIG1hcCwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqUmVtb3ZlIGFsbCBjaGlsZHJlbiBmcm9tIERPTSovXG4gICAgZW1wdHkoKTogdGhpcyB7XG4gICAgICAgIC8vIFRPRE86IGlzIHRoaXMgZmFzdGVyIHRoYW4gaW5uZXJIVE1MID0gXCJcIj9cbiAgICAgICAgd2hpbGUgKCB0aGlzLmUuZmlyc3RDaGlsZCApXG4gICAgICAgICAgICB0aGlzLmUucmVtb3ZlQ2hpbGQodGhpcy5lLmZpcnN0Q2hpbGQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqUmVtb3ZlIGVsZW1lbnQgZnJvbSBET00qL1xuICAgIHJlbW92ZSgpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lLnJlbW92ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ETzogcmVjdXJzaXZlbHkgeWllbGQgY2hpbGRyZW5cbiAgICAvLyAgKHVubGlrZSAuY2hpbGRyZW4oKSwgdGhpcyBkb2Vzbid0IHJldHVybiBvbmx5IHRoZSBmaXJzdCBsZXZlbClcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgZmluZCgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9maW5kL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZpcnN0KCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2ZpcnN0L1xuICAgICAgICAvLyB0aGlzLmUuZmlyc3RDaGlsZFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGxhc3QoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vbGFzdC9cbiAgICAgICAgLy8gdGhpcy5lLmxhc3RDaGlsZFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG5leHQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbm90KCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHBhcmVudCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBwYXJlbnRzKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLy8gKioqICBFdmVudHNcbiAgICBcbiAgICBvbihldlR5cGVGblBhaXJzOiBURXZlbnRGdW5jdGlvbk1hcDxURXZlbnQ+LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IFsgZXZUeXBlLCBldkZuIF0gb2YgZW51bWVyYXRlKGV2VHlwZUZuUGFpcnMpICkge1xuICAgICAgICAgICAgY29uc3QgX2YgPSBmdW5jdGlvbiBfZihldnQpIHtcbiAgICAgICAgICAgICAgICBldkZuKGV2dCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5lLmFkZEV2ZW50TGlzdGVuZXIoZXZUeXBlLCBfZiwgb3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbZXZUeXBlXSA9IF9mO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBvbmUoZXZUeXBlOiBURXZlbnQsIGxpc3RlbmVyOiBGdW5jdGlvblJlY2lldmVzRXZlbnQ8VEV2ZW50Piwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIGNvbnN0IGV2VHlwZUZuUGFpcnMgPSB7fTtcbiAgICAgICAgZXZUeXBlRm5QYWlyc1tldlR5cGVdID0gbGlzdGVuZXI7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zID09PSB1bmRlZmluZWQgPyB7IG9uY2UgOiB0cnVlIH0gOiB7IC4uLm9wdGlvbnMsIG9uY2UgOiB0cnVlIH07XG4gICAgICAgIHJldHVybiB0aGlzLm9uKGV2VHlwZUZuUGFpcnMsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICAvKipSZW1vdmUgYGV2ZW50YCBmcm9tIHdyYXBwZWQgZWxlbWVudCdzIGV2ZW50IGxpc3RlbmVycywgYnV0IGtlZXAgdGhlIHJlbW92ZWQgbGlzdGVuZXIgaW4gY2FjaGUuXG4gICAgICogVGhpcyBpcyB1c2VmdWwgZm9yIGxhdGVyIHVuYmxvY2tpbmcqL1xuICAgIGJsb2NrTGlzdGVuZXIoZXZlbnQ6IFRFdmVudCkge1xuICAgICAgICBsZXQgbGlzdGVuZXIgPSB0aGlzLl9saXN0ZW5lcnNbZXZlbnRdO1xuICAgICAgICBpZiAoIGxpc3RlbmVyID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKGBibG9ja0xpc3RlbmVyKGV2ZW50KTogdGhpcy5fbGlzdGVuZXJzW2V2ZW50XSBpcyB1bmRlZmluZWQuIGV2ZW50OmAsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgdW5ibG9ja0xpc3RlbmVyKGV2ZW50OiBURXZlbnQpIHtcbiAgICAgICAgbGV0IGxpc3RlbmVyID0gdGhpcy5fbGlzdGVuZXJzW2V2ZW50XTtcbiAgICAgICAgaWYgKCBsaXN0ZW5lciA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihgdW5ibG9ja0xpc3RlbmVyKGV2ZW50KTogdGhpcy5fbGlzdGVuZXJzW2V2ZW50XSBpcyB1bmRlZmluZWQuIGV2ZW50OmAsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmUuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLypcbiAgICAgQ2hyb25vbG9neTpcbiAgICAgbW91c2Vkb3duICAgICAgdG91Y2hzdGFydFx0cG9pbnRlcmRvd25cbiAgICAgbW91c2VlbnRlclx0XHQgICAgICAgICAgICBwb2ludGVyZW50ZXJcbiAgICAgbW91c2VsZWF2ZVx0XHQgICAgICAgICAgICBwb2ludGVybGVhdmVcbiAgICAgbW91c2Vtb3ZlICAgICAgdG91Y2htb3ZlXHRwb2ludGVybW92ZVxuICAgICBtb3VzZW91dFx0XHQgICAgICAgICAgICBwb2ludGVyb3V0XG4gICAgIG1vdXNlb3Zlclx0XHQgICAgICAgICAgICBwb2ludGVyb3ZlclxuICAgICBtb3VzZXVwXHQgICAgdG91Y2hlbmQgICAgcG9pbnRlcnVwXG4gICAgICovXG4gICAgLyoqIEFkZCBhIGB0b3VjaHN0YXJ0YCBldmVudCBsaXN0ZW5lci4gVGhpcyBpcyB0aGUgZmFzdCBhbHRlcm5hdGl2ZSB0byBgY2xpY2tgIGxpc3RlbmVycyBmb3IgbW9iaWxlIChubyAzMDBtcyB3YWl0KS4gKi9cbiAgICB0b3VjaHN0YXJ0KGZuOiAoZXY6IFRvdWNoRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIHRoaXMuZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24gX2YoZXY6IFRvdWNoRXZlbnQpIHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7IC8vIG90aGVyd2lzZSBcInRvdWNobW92ZVwiIGlzIHRyaWdnZXJlZFxuICAgICAgICAgICAgZm4oZXYpO1xuICAgICAgICAgICAgaWYgKCBvcHRpb25zICYmIG9wdGlvbnMub25jZSApIC8vIFRPRE86IG1heWJlIG5hdGl2ZSBvcHRpb25zLm9uY2UgaXMgZW5vdWdoXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgX2YpO1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgLy8gVE9ETzogdGhpcy5fbGlzdGVuZXJzLCBvciB1c2UgdGhpcy5vbihcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHBvaW50ZXJlbnRlcihmbjogKGV2ZW50OiBQb2ludGVyRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uKHsgcG9pbnRlcmVudGVyIDogZm4gfSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIC8qKiBBZGQgYSBgcG9pbnRlcmRvd25gIGV2ZW50IGxpc3RlbmVyIGlmIGJyb3dzZXIgc3VwcG9ydHMgYHBvaW50ZXJkb3duYCwgZWxzZSBzZW5kIGBtb3VzZWRvd25gIChzYWZhcmkpLiAqL1xuICAgIHBvaW50ZXJkb3duKGZuOiAoZXZlbnQ6IFBvaW50ZXJFdmVudCB8IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIFxuICAgICAgICBsZXQgYWN0aW9uO1xuICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBQb2ludGVyRXZlbnQgZXhpc3RzIGFuZCBzdG9yZSBpbiB2YXIgb3V0c2lkZSBjbGFzc1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYWN0aW9uID0gd2luZG93LlBvaW50ZXJFdmVudCA/ICdwb2ludGVyZG93bicgOiAnbW91c2Vkb3duJzsgLy8gc2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBwb2ludGVyZG93blxuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIGFjdGlvbiA9ICdtb3VzZWRvd24nXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgX2YgPSBmdW5jdGlvbiBfZihldjogUG9pbnRlckV2ZW50IHwgTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGZuKGV2KTtcbiAgICAgICAgICAgIGlmICggb3B0aW9ucyAmJiBvcHRpb25zLm9uY2UgKSAvLyBUT0RPOiBtYXliZSBuYXRpdmUgb3B0aW9ucy5vbmNlIGlzIGVub3VnaFxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihhY3Rpb24sIF9mKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5lLmFkZEV2ZW50TGlzdGVuZXIoYWN0aW9uLCBfZiwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVycy5wb2ludGVyZG93biA9IF9mO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBjbGljayBvZiB0aGUgZWxlbWVudC4gVXNlZnVsIGZvciBgPGE+YCBlbGVtZW50cy4qL1xuICAgIGNsaWNrKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYGNsaWNrYCBldmVudCBsaXN0ZW5lci4gWW91IHNob3VsZCBwcm9iYWJseSB1c2UgYHBvaW50ZXJkb3duKClgIGlmIG9uIGRlc2t0b3AsIG9yIGB0b3VjaHN0YXJ0KClgIGlmIG9uIG1vYmlsZS4qL1xuICAgIGNsaWNrKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBjbGljayhmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuZS5jbGljaygpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGNsaWNrIDogZm4gfSwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqQmx1ciAodW5mb2N1cykgdGhlIGVsZW1lbnQuKi9cbiAgICBibHVyKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYGJsdXJgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBibHVyKGZuOiAoZXZlbnQ6IEZvY3VzRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBibHVyKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgdGhpcy5lLmJsdXIoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBibHVyIDogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipGb2N1cyB0aGUgZWxlbWVudC4qL1xuICAgIGZvY3VzKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYGZvY3VzYCBldmVudCBsaXN0ZW5lciovXG4gICAgZm9jdXMoZm46IChldmVudDogRm9jdXNFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIGZvY3VzKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgdGhpcy5lLmZvY3VzKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgZm9jdXMgOiBmbiB9LCBvcHRpb25zKVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkFkZCBhIGBjaGFuZ2VgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBjaGFuZ2UoZm46IChldmVudDogRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uKHsgY2hhbmdlIDogZm4gfSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIC8qKkFkZCBhIGBjb250ZXh0bWVudWAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGNvbnRleHRtZW51KGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uKHsgY29udGV4dG1lbnUgOiBmbiB9LCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBkb3VibGUgY2xpY2sgb2YgdGhlIGVsZW1lbnQuKi9cbiAgICBkYmxjbGljaygpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBkYmxjbGlja2AgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGRibGNsaWNrKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBkYmxjbGljayhmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGNvbnN0IGRibGNsaWNrID0gbmV3IE1vdXNlRXZlbnQoJ2RibGNsaWNrJywge1xuICAgICAgICAgICAgICAgICd2aWV3JyA6IHdpbmRvdyxcbiAgICAgICAgICAgICAgICAnYnViYmxlcycgOiB0cnVlLFxuICAgICAgICAgICAgICAgICdjYW5jZWxhYmxlJyA6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5lLmRpc3BhdGNoRXZlbnQoZGJsY2xpY2spO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGRibGNsaWNrIDogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipTaW11bGF0ZSBhIG1vdXNlZW50ZXIgZXZlbnQgdG8gdGhlIGVsZW1lbnQuKi9cbiAgICBtb3VzZWVudGVyKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYG1vdXNlZW50ZXJgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBtb3VzZWVudGVyKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBtb3VzZWVudGVyKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgLy8gbW91c2VvdmVyOiBhbHNvIGNoaWxkIGVsZW1lbnRzXG4gICAgICAgIC8vIG1vdXNlZW50ZXI6IG9ubHkgYm91bmQgZWxlbWVudFxuICAgICAgICBcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgY29uc3QgbW91c2VlbnRlciA9IG5ldyBNb3VzZUV2ZW50KCdtb3VzZWVudGVyJywge1xuICAgICAgICAgICAgICAgICd2aWV3JyA6IHdpbmRvdyxcbiAgICAgICAgICAgICAgICAnYnViYmxlcycgOiB0cnVlLFxuICAgICAgICAgICAgICAgICdjYW5jZWxhYmxlJyA6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5lLmRpc3BhdGNoRXZlbnQobW91c2VlbnRlcik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgbW91c2VlbnRlciA6IGZuIH0sIG9wdGlvbnMpXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBrZXlkb3duIGV2ZW50IHRvIHRoZSBlbGVtZW50LiovXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGtleWRvd24oKTogdGhpcztcbiAgICAvKipBZGQgYSBga2V5ZG93bmAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGtleWRvd24oZm46IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIGtleWRvd24oZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsga2V5ZG93biA6IGZuIH0sIG9wdGlvbnMpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBrZXl1cCgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXl1cC9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBrZXlwcmVzcygpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXlwcmVzcy9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBob3ZlcigpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9ob3Zlci9cbiAgICAgICAgLy8gYmluZHMgdG8gYm90aCBtb3VzZWVudGVyIGFuZCBtb3VzZWxlYXZlXG4gICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE3NTg5NDIwL3doZW4tdG8tY2hvb3NlLW1vdXNlb3Zlci1hbmQtaG92ZXItZnVuY3Rpb25cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBtb3VzZWRvd24oKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbW91c2VsZWF2ZSgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXlwcmVzcy9cbiAgICAgICAgLy9tb3VzZWxlYXZlIGFuZCBtb3VzZW91dCBhcmUgc2ltaWxhciBidXQgZGlmZmVyIGluIHRoYXQgbW91c2VsZWF2ZSBkb2VzIG5vdCBidWJibGUgYW5kIG1vdXNlb3V0IGRvZXMuXG4gICAgICAgIC8vIFRoaXMgbWVhbnMgdGhhdCBtb3VzZWxlYXZlIGlzIGZpcmVkIHdoZW4gdGhlIHBvaW50ZXIgaGFzIGV4aXRlZCB0aGUgZWxlbWVudCBhbmQgYWxsIG9mIGl0cyBkZXNjZW5kYW50cyxcbiAgICAgICAgLy8gd2hlcmVhcyBtb3VzZW91dCBpcyBmaXJlZCB3aGVuIHRoZSBwb2ludGVyIGxlYXZlcyB0aGUgZWxlbWVudCBvciBsZWF2ZXMgb25lIG9mIHRoZSBlbGVtZW50J3MgZGVzY2VuZGFudHNcbiAgICAgICAgLy8gKGV2ZW4gaWYgdGhlIHBvaW50ZXIgaXMgc3RpbGwgd2l0aGluIHRoZSBlbGVtZW50KS5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBtb3VzZW1vdmUoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipTaW11bGF0ZSBhIG1vdXNlb3V0IGV2ZW50IHRvIHRoZSBlbGVtZW50LiovXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIG1vdXNlb3V0KCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYG1vdXNlb3V0YCBldmVudCBsaXN0ZW5lciovXG4gICAgbW91c2VvdXQoZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIG1vdXNlb3V0KGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgLy9tb3VzZWxlYXZlIGFuZCBtb3VzZW91dCBhcmUgc2ltaWxhciBidXQgZGlmZmVyIGluIHRoYXQgbW91c2VsZWF2ZSBkb2VzIG5vdCBidWJibGUgYW5kIG1vdXNlb3V0IGRvZXMuXG4gICAgICAgIC8vIFRoaXMgbWVhbnMgdGhhdCBtb3VzZWxlYXZlIGlzIGZpcmVkIHdoZW4gdGhlIHBvaW50ZXIgaGFzIGV4aXRlZCB0aGUgZWxlbWVudCBhbmQgYWxsIG9mIGl0cyBkZXNjZW5kYW50cyxcbiAgICAgICAgLy8gd2hlcmVhcyBtb3VzZW91dCBpcyBmaXJlZCB3aGVuIHRoZSBwb2ludGVyIGxlYXZlcyB0aGUgZWxlbWVudCBvciBsZWF2ZXMgb25lIG9mIHRoZSBlbGVtZW50J3MgZGVzY2VuZGFudHNcbiAgICAgICAgLy8gKGV2ZW4gaWYgdGhlIHBvaW50ZXIgaXMgc3RpbGwgd2l0aGluIHRoZSBlbGVtZW50KS5cbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IG1vdXNlb3V0IDogZm4gfSwgb3B0aW9ucylcbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBtb3VzZW92ZXIgZXZlbnQgdG8gdGhlIGVsZW1lbnQuKi9cbiAgICBtb3VzZW92ZXIoKTogdGhpcztcbiAgICAvKipBZGQgYSBgbW91c2VvdmVyYCBldmVudCBsaXN0ZW5lciovXG4gICAgbW91c2VvdmVyKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBtb3VzZW92ZXIoZm4/LCBvcHRpb25zPykge1xuICAgICAgICAvLyBtb3VzZW92ZXI6IGFsc28gY2hpbGQgZWxlbWVudHNcbiAgICAgICAgLy8gbW91c2VlbnRlcjogb25seSBib3VuZCBlbGVtZW50XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBtb3VzZW92ZXIgOiBmbiB9LCBvcHRpb25zKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbW91c2V1cCgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXlwcmVzcy9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIHRyYW5zZm9ybShvcHRpb25zOiBUcmFuc2Zvcm1PcHRpb25zKSB7XG4gICAgICAgIGxldCB0cmFuc2Zvcm06IHN0cmluZyA9ICcnO1xuICAgICAgICBmb3IgKCBsZXQgWyBrLCB2IF0gb2YgZW51bWVyYXRlKG9wdGlvbnMpICkge1xuICAgICAgICAgICAgdHJhbnNmb3JtICs9IGAke2t9KCR7dn0pIGBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uKHtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uZW5kIDogcmVzb2x2ZVxuICAgICAgICAgICAgfSwgeyBvbmNlIDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHRoaXMuY3NzKHsgdHJhbnNmb3JtIH0pXG4gICAgICAgIH0pXG4gICAgfVxuICAgIFxuICAgIC8qKiBSZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyIG9mIGBldmVudGAsIGlmIGV4aXN0cy4qL1xuICAgIG9mZihldmVudDogVEV2ZW50KTogdGhpcyB7XG4gICAgICAgIHRoaXMuZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCB0aGlzLl9saXN0ZW5lcnNbZXZlbnRdKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIGFsbE9mZigpOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IGV2ZW50IGluIHRoaXMuX2xpc3RlbmVycyApIHtcbiAgICAgICAgICAgIHRoaXMub2ZmKDxURXZlbnQ+IGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLy8gKioqICBBdHRyaWJ1dGVzXG4gICAgXG4gICAgLyoqIEZvciBlYWNoIGBbYXR0ciwgdmFsXWAgcGFpciwgYXBwbHkgYHNldEF0dHJpYnV0ZWAqL1xuICAgIGF0dHIoYXR0clZhbFBhaXJzOiBUTWFwPHN0cmluZyB8IGJvb2xlYW4+KTogdGhpc1xuICAgIC8qKiBhcHBseSBgZ2V0QXR0cmlidXRlYCovXG4gICAgYXR0cihhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpOiBzdHJpbmdcbiAgICBhdHRyKGF0dHJWYWxQYWlycykge1xuICAgICAgICBpZiAoIHR5cGVvZiBhdHRyVmFsUGFpcnMgPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5nZXRBdHRyaWJ1dGUoYXR0clZhbFBhaXJzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoIGxldCBbIGF0dHIsIHZhbCBdIG9mIGVudW1lcmF0ZShhdHRyVmFsUGFpcnMpIClcbiAgICAgICAgICAgICAgICB0aGlzLmUuc2V0QXR0cmlidXRlKGF0dHIsIHZhbCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKiogYHJlbW92ZUF0dHJpYnV0ZWAgKi9cbiAgICByZW1vdmVBdHRyKHF1YWxpZmllZE5hbWU6IHN0cmluZywgLi4ucXVhbGlmaWVkTmFtZXM6IHN0cmluZ1tdKTogdGhpcyB7XG4gICAgICAgIGxldCBfcmVtb3ZlQXR0cmlidXRlO1xuICAgICAgICBpZiAoIHRoaXMuX2lzU3ZnIClcbiAgICAgICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUgPSAocXVhbGlmaWVkTmFtZSkgPT4gdGhpcy5lLnJlbW92ZUF0dHJpYnV0ZU5TKFNWR19OU19VUkksIHF1YWxpZmllZE5hbWUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBfcmVtb3ZlQXR0cmlidXRlID0gKHF1YWxpZmllZE5hbWUpID0+IHRoaXMuZS5yZW1vdmVBdHRyaWJ1dGUocXVhbGlmaWVkTmFtZSk7XG4gICAgICAgIFxuICAgICAgICBfcmVtb3ZlQXR0cmlidXRlKHF1YWxpZmllZE5hbWUpO1xuICAgICAgICBmb3IgKCBsZXQgcW4gb2YgcXVhbGlmaWVkTmFtZXMgKVxuICAgICAgICAgICAgX3JlbW92ZUF0dHJpYnV0ZShxbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipgZ2V0QXR0cmlidXRlKGBkYXRhLSR7a2V5fWApYC4gSlNPTi5wYXJzZSBpdCBieSBkZWZhdWx0LiovXG4gICAgZGF0YShrZXk6IHN0cmluZywgcGFyc2U6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHwgVE1hcDxzdHJpbmc+IHtcbiAgICAgICAgLy8gVE9ETzoganF1ZXJ5IGRvZXNuJ3QgYWZmZWN0IGRhdGEtKiBhdHRycyBpbiBET00uIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vZGF0YS9cbiAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuZS5nZXRBdHRyaWJ1dGUoYGRhdGEtJHtrZXl9YCk7XG4gICAgICAgIGlmICggcGFyc2UgPT09IHRydWUgKVxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBkYXRhXG4gICAgfVxuICAgIFxuICAgIC8vICoqICBGYWRlXG4gICAgYXN5bmMgZmFkZShkdXI6IG51bWJlciwgdG86IDAgfCAxKTogUHJvbWlzZTx0aGlzPiB7XG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuZSk7XG4gICAgICAgIGNvbnN0IHRyYW5zUHJvcCA9IHN0eWxlcy50cmFuc2l0aW9uUHJvcGVydHkuc3BsaXQoJywgJyk7XG4gICAgICAgIGNvbnN0IGluZGV4T2ZPcGFjaXR5ID0gdHJhbnNQcm9wLmluZGV4T2YoJ29wYWNpdHknKTtcbiAgICAgICAgLy8gY3NzIG9wYWNpdHk6MCA9PiB0cmFuc0R1cltpbmRleE9mT3BhY2l0eV06IDBzXG4gICAgICAgIC8vIGNzcyBvcGFjaXR5OjUwMG1zID0+IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTogMC41c1xuICAgICAgICAvLyBjc3MgTk8gb3BhY2l0eSA9PiB0cmFuc0R1cltpbmRleE9mT3BhY2l0eV06IHVuZGVmaW5lZFxuICAgICAgICBpZiAoIGluZGV4T2ZPcGFjaXR5ICE9PSAtMSApIHtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zRHVyID0gc3R5bGVzLnRyYW5zaXRpb25EdXJhdGlvbi5zcGxpdCgnLCAnKTtcbiAgICAgICAgICAgIGNvbnN0IG9wYWNpdHlUcmFuc0R1ciA9IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zID0gc3R5bGVzLnRyYW5zaXRpb24uc3BsaXQoJywgJyk7XG4gICAgICAgICAgICAvLyB0cmFuc2l0aW9uOiBvcGFjaXR5IHdhcyBkZWZpbmVkIGluIGNzcy5cbiAgICAgICAgICAgIC8vIHNldCB0cmFuc2l0aW9uIHRvIGR1ciwgc2V0IG9wYWNpdHkgdG8gMCwgbGVhdmUgdGhlIGFuaW1hdGlvbiB0byBuYXRpdmUgdHJhbnNpdGlvbiwgd2FpdCBkdXIgYW5kIHJldHVybiB0aGlzXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGZhZGUoJHtkdXJ9LCAke3RvfSksIG9wYWNpdHlUcmFuc0R1ciAhPT0gdW5kZWZpbmVkLiBudWxsaWZ5aW5nIHRyYW5zaXRpb24uIFNIT1VMRCBOT1QgV09SS2ApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYHRyYW5zOlxcdCR7dHJhbnN9XFxudHJhbnNQcm9wOlxcdCR7dHJhbnNQcm9wfVxcbmluZGV4T2ZPcGFjaXR5OlxcdCR7aW5kZXhPZk9wYWNpdHl9XFxub3BhY2l0eVRyYW5zRHVyOlxcdCR7b3BhY2l0eVRyYW5zRHVyfWApO1xuICAgICAgICAgICAgLy8gdHJhbnMuc3BsaWNlKGluZGV4T2ZPcGFjaXR5LCAxLCBgb3BhY2l0eSAke2R1ciAvIDEwMDB9c2ApO1xuICAgICAgICAgICAgdHJhbnMuc3BsaWNlKGluZGV4T2ZPcGFjaXR5LCAxLCBgb3BhY2l0eSAwc2ApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYGFmdGVyLCB0cmFuczogJHt0cmFuc31gKTtcbiAgICAgICAgICAgIHRoaXMuZS5zdHlsZS50cmFuc2l0aW9uID0gdHJhbnMuam9pbignLCAnKTtcbiAgICAgICAgICAgIHRoaXMuY3NzKHsgb3BhY2l0eSA6IHRvIH0pO1xuICAgICAgICAgICAgYXdhaXQgd2FpdChkdXIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdHJhbnNpdGlvbjogb3BhY2l0eSB3YXMgTk9UIGRlZmluZWQgaW4gY3NzLlxuICAgICAgICBpZiAoIGR1ciA9PSAwICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3NzKHsgb3BhY2l0eSA6IHRvIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlzRmFkZU91dCA9IHRvID09PSAwO1xuICAgICAgICBsZXQgb3BhY2l0eSA9IHBhcnNlRmxvYXQodGhpcy5lLnN0eWxlLm9wYWNpdHkpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBvcGFjaXR5ID09PSB1bmRlZmluZWQgfHwgaXNOYU4ob3BhY2l0eSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGZhZGUoJHtkdXJ9LCAke3RvfSkgaHRtbEVsZW1lbnQgaGFzIE5PIG9wYWNpdHkgYXQgYWxsLiByZWN1cnNpbmdgLCB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eSxcbiAgICAgICAgICAgICAgICB0aGlzIDogdGhpc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jc3MoeyBvcGFjaXR5IDogTWF0aC5hYnMoMSAtIHRvKSB9KS5mYWRlKGR1ciwgdG8pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICggaXNGYWRlT3V0ID8gb3BhY2l0eSA8PSAwIDogb3BhY2l0eSA+IDEgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBmYWRlKCR7ZHVyfSwgJHt0b30pIG9wYWNpdHkgd2FzIGJleW9uZCB0YXJnZXQgb3BhY2l0eS4gcmV0dXJuaW5nIHRoaXMgYXMgaXMuYCwge1xuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5LFxuICAgICAgICAgICAgICAgICAgICB0aGlzIDogdGhpc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgc3RlcHMgPSAzMDtcbiAgICAgICAgbGV0IG9wU3RlcCA9IDEgLyBzdGVwcztcbiAgICAgICAgbGV0IGV2ZXJ5bXMgPSBkdXIgLyBzdGVwcztcbiAgICAgICAgaWYgKCBldmVyeW1zIDwgMSApIHtcbiAgICAgICAgICAgIGV2ZXJ5bXMgPSAxO1xuICAgICAgICAgICAgc3RlcHMgPSBkdXI7XG4gICAgICAgICAgICBvcFN0ZXAgPSAxIC8gc3RlcHM7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYGZhZGUoJHtkdXJ9LCAke3RvfSkgaGFkIG9wYWNpdHksIG5vIHRyYW5zaXRpb24uIChnb29kKSBvcGFjaXR5OiAke29wYWNpdHl9YCwge1xuICAgICAgICAgICAgc3RlcHMsXG4gICAgICAgICAgICBvcFN0ZXAsXG4gICAgICAgICAgICBldmVyeW1zXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZWFjaGVkVG8gPSBpc0ZhZGVPdXQgPyAob3ApID0+IG9wIC0gb3BTdGVwID4gMCA6IChvcCkgPT4gb3AgKyBvcFN0ZXAgPCAxO1xuICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICggcmVhY2hlZFRvKG9wYWNpdHkpICkge1xuICAgICAgICAgICAgICAgIGlmICggaXNGYWRlT3V0ID09PSB0cnVlIClcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eSAtPSBvcFN0ZXA7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5ICs9IG9wU3RlcDtcbiAgICAgICAgICAgICAgICB0aGlzLmNzcyh7IG9wYWNpdHkgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wYWNpdHkgPSB0bztcbiAgICAgICAgICAgICAgICB0aGlzLmNzcyh7IG9wYWNpdHkgfSk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGV2ZXJ5bXMpO1xuICAgICAgICBhd2FpdCB3YWl0KGR1cik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBhc3luYyBmYWRlT3V0KGR1cjogbnVtYmVyKTogUHJvbWlzZTx0aGlzPiB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZhZGUoZHVyLCAwKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgYXN5bmMgZmFkZUluKGR1cjogbnVtYmVyKTogUHJvbWlzZTx0aGlzPiB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZhZGUoZHVyLCAxKTtcbiAgICB9XG4gICAgXG4gICAgXG59XG5cbmNsYXNzIERpdiBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBIVE1MRGl2RWxlbWVudDtcbiAgICByZWFkb25seSBlOiBIVE1MRGl2RWxlbWVudDtcbiAgICBcbiAgICAvKipDcmVhdGUgYSBEaXYgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0IG9yIGNscy4qL1xuICAgIGNvbnN0cnVjdG9yKHsgaWQsIHRleHQsIGNscyB9OiBTdWJFbGVtQ29uc3RydWN0b3IgPSB7fSkge1xuICAgICAgICBzdXBlcih7IHRhZyA6ICdkaXYnLCB0ZXh0LCBjbHMgfSk7XG4gICAgICAgIGlmICggaWQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmlkKGlkKTtcbiAgICB9XG59XG5cbmNsYXNzIFBhcmFncmFwaCBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBIVE1MUGFyYWdyYXBoRWxlbWVudDtcbiAgICByZWFkb25seSBlOiBIVE1MUGFyYWdyYXBoRWxlbWVudDtcbiAgICBcbiAgICAvKipDcmVhdGUgYSBQYXJhZ3JhcGggZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0IG9yIGNscy4qL1xuICAgIGNvbnN0cnVjdG9yKHsgaWQsIHRleHQsIGNscyB9OiBTdWJFbGVtQ29uc3RydWN0b3IgPSB7fSkge1xuICAgICAgICBzdXBlcih7IHRhZyA6ICdwJywgdGV4dCwgY2xzIH0pO1xuICAgICAgICBpZiAoIGlkICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5pZChpZCk7XG4gICAgfVxufVxuXG5jbGFzcyBTcGFuIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxTcGFuRWxlbWVudDtcbiAgICByZWFkb25seSBlOiBIVE1MU3BhbkVsZW1lbnQ7XG4gICAgXG4gICAgLyoqQ3JlYXRlIGEgU3BhbiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ3NwYW4nLCB0ZXh0LCBjbHMgfSk7XG4gICAgICAgIGlmICggaWQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmlkKGlkKTtcbiAgICAgICAgXG4gICAgfVxufVxuXG5jbGFzcyBJbWcgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTEltYWdlRWxlbWVudDtcbiAgICBcbiAgICAvKipDcmVhdGUgYW4gSW1nIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgc3JjIG9yIGNscy4qL1xuICAgIGNvbnN0cnVjdG9yKHsgaWQsIHNyYywgY2xzIH06IEltZ0NvbnN0cnVjdG9yKSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ2ltZycsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBpZiAoIHNyYyAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnNyYyA9IHNyYztcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHNyYyhzcmM6IHN0cmluZyk6IHRoaXM7XG4gICAgc3JjKCk6IHN0cmluZztcbiAgICBzcmMoc3JjPykge1xuICAgICAgICBpZiAoIHNyYyA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50LnNyY1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuc3JjID0gc3JjO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmVhZG9ubHkgZTogSFRNTEltYWdlRWxlbWVudDtcbn1cblxuY2xhc3MgQnV0dG9uIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxCdXR0b25FbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhIEJ1dHRvbiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIGNscywgaHRtbCBvciBjbGljayBmdW5jdGlvbiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgY2xzLCBjbGljaywgaHRtbCB9OiBCdXR0b25Db25zdHJ1Y3Rvcikge1xuICAgICAgICBzdXBlcih7IHRhZyA6ICdidXR0b24nLCBjbHMgfSk7XG4gICAgICAgIGlmICggaWQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmlkKGlkKTtcbiAgICAgICAgaWYgKCBjbGljayAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuY2xpY2soY2xpY2spO1xuICAgICAgICBpZiAoIGh0bWwgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmh0bWwoaHRtbCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcmVhZG9ubHkgZTogSFRNTEJ1dHRvbkVsZW1lbnQ7XG59XG5cbmNsYXNzIEFuY2hvciBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBIVE1MQW5jaG9yRWxlbWVudDtcbiAgICByZWFkb25seSBlOiBIVE1MQW5jaG9yRWxlbWVudDtcbiAgICBcbiAgICAvKipDcmVhdGUgYW4gQW5jaG9yIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCwgaHJlZiBvciBjbHMuKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCB0ZXh0LCBjbHMsIGhyZWYgfTogQW5jaG9yQ29uc3RydWN0b3IgPSB7fSkge1xuICAgICAgICBzdXBlcih7IHRhZyA6ICdhJywgdGV4dCwgY2xzIH0pO1xuICAgICAgICBpZiAoIGlkICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5pZChpZCk7XG4gICAgICAgIGlmICggaHJlZiAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaHJlZihocmVmKVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgaHJlZigpOiBzdHJpbmdcbiAgICBocmVmKHZhbDogc3RyaW5nKTogdGhpc1xuICAgIGhyZWYodmFsPykge1xuICAgICAgICBpZiAoIHZhbCA9PT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ2hyZWYnKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cih7IGhyZWYgOiB2YWwgfSlcbiAgICB9XG4gICAgXG4gICAgdGFyZ2V0KCk6IHN0cmluZ1xuICAgIHRhcmdldCh2YWw6IHN0cmluZyk6IHRoaXNcbiAgICB0YXJnZXQodmFsPykge1xuICAgICAgICBpZiAoIHZhbCA9PT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3RhcmdldCcpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKHsgdGFyZ2V0IDogdmFsIH0pXG4gICAgfVxufVxuXG4vKmNsYXNzIFN2ZyBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50e1xuIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IFNWR0VsZW1lbnQ7XG4gY29uc3RydWN0b3Ioe2lkLCBjbHMsaHRtbEVsZW1lbnR9OiBTdmdDb25zdHJ1Y3Rvcikge1xuIHN1cGVyKHt0YWc6ICdzdmcnLCBjbHN9KTtcbiBpZiAoaWQpXG4gdGhpcy5pZChpZCk7XG4gaWYgKHNyYylcbiB0aGlzLl9odG1sRWxlbWVudC5zcmMgPSBzcmM7XG4gXG4gfVxuIH1cbiAqL1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItaHRtbC1lbGVtZW50JywgQmV0dGVySFRNTEVsZW1lbnQpO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItZGl2JywgRGl2LCB7IGV4dGVuZHMgOiAnZGl2JyB9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLXAnLCBQYXJhZ3JhcGgsIHsgZXh0ZW5kcyA6ICdwJyB9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLXNwYW4nLCBTcGFuLCB7IGV4dGVuZHMgOiAnc3BhbicgfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1pbWcnLCBJbWcsIHsgZXh0ZW5kcyA6ICdpbWcnIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItYScsIEFuY2hvciwgeyBleHRlbmRzIDogJ2EnIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItYnV0dG9uJywgQnV0dG9uLCB7IGV4dGVuZHMgOiAnYnV0dG9uJyB9KTtcblxuLy8gY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItc3ZnJywgU3ZnLCB7ZXh0ZW5kczogJ3N2Zyd9KTtcblxuLyoqQ3JlYXRlIGFuIGVsZW1lbnQgb2YgYHRhZ2AuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgIGFuZCAvIG9yIGBjbHNgKi9cbmZ1bmN0aW9uIGVsZW0oeyB0YWcsIHRleHQsIGNscyB9OiB7IHRhZzogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbi8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBpZGAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbmZ1bmN0aW9uIGVsZW0oeyBpZCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGlkOiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTogQmV0dGVySFRNTEVsZW1lbnQ7XG4vKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgcXVlcnlgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG5mdW5jdGlvbiBlbGVtKHsgcXVlcnksIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBxdWVyeTogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbi8qKldyYXAgYW4gZXhpc3RpbmcgSFRNTEVsZW1lbnQuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbmZ1bmN0aW9uIGVsZW0oeyBodG1sRWxlbWVudCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGh0bWxFbGVtZW50OiBIVE1MRWxlbWVudCwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbmZ1bmN0aW9uIGVsZW0oZWxlbU9wdGlvbnMpOiBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIG5ldyBCZXR0ZXJIVE1MRWxlbWVudChlbGVtT3B0aW9ucyk7XG59XG5cbi8qKkNyZWF0ZSBhbiBTcGFuIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbmZ1bmN0aW9uIHNwYW4oeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogU3BhbiB7XG4gICAgcmV0dXJuIG5ldyBTcGFuKHsgaWQsIHRleHQsIGNscyB9KTtcbn1cblxuLyoqQ3JlYXRlIGFuIERpdiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG5mdW5jdGlvbiBkaXYoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogRGl2IHtcbiAgICByZXR1cm4gbmV3IERpdih7IGlkLCB0ZXh0LCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhbiBJbWcgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCBzcmMgb3IgY2xzLiovXG5mdW5jdGlvbiBpbWcoeyBpZCwgc3JjLCBjbHMgfTogSW1nQ29uc3RydWN0b3IgPSB7fSk6IEltZyB7XG4gICAgcmV0dXJuIG5ldyBJbWcoeyBpZCwgc3JjLCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhIEJ1dHRvbiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIGNscywgaHRtbCBvciBjbGljayBmdW5jdGlvbiovXG5mdW5jdGlvbiBidXR0b24oeyBpZCwgY2xzLCBjbGljaywgaHRtbCB9OiBCdXR0b25Db25zdHJ1Y3RvciA9IHt9KTogQnV0dG9uIHtcbiAgICByZXR1cm4gbmV3IEJ1dHRvbih7IGlkLCBjbHMsIGNsaWNrLCBodG1sIH0pO1xufVxuXG4vKipDcmVhdGUgYSBQYXJhZ3JhcGggZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0IG9yIGNscy4qL1xuZnVuY3Rpb24gcGFyYWdyYXBoKHsgaWQsIHRleHQsIGNscyB9OiBTdWJFbGVtQ29uc3RydWN0b3IgPSB7fSk6IFBhcmFncmFwaCB7XG4gICAgcmV0dXJuIG5ldyBQYXJhZ3JhcGgoeyBpZCwgdGV4dCwgY2xzIH0pO1xufVxuXG4vKipDcmVhdGUgYW4gQW5jaG9yIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCwgaHJlZiBvciBjbHMuKi9cbmZ1bmN0aW9uIGFuY2hvcih7IGlkLCB0ZXh0LCBjbHMsIGhyZWYgfTogQW5jaG9yQ29uc3RydWN0b3IgPSB7fSk6IEFuY2hvciB7XG4gICAgcmV0dXJuIG5ldyBBbmNob3IoeyBpZCwgdGV4dCwgY2xzLCBocmVmIH0pO1xufVxuXG5cbmV4cG9ydCB7IGVsZW0sIHNwYW4sIGRpdiwgaW1nLCBwYXJhZ3JhcGgsIGFuY2hvciwgYnV0dG9uLCBCZXR0ZXJIVE1MRWxlbWVudCwgRGl2LCBCdXR0b24sIFNwYW4gfVxuIl19