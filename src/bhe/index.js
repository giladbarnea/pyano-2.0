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
        console.warn('fade, should NOT use');
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
        console.warn('fadeOut, should NOT use');
        return await this.fade(dur, 0);
    }
    async fadeIn(dur) {
        console.warn('fadeIn, should NOT use');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtDQUFzRTtBQUV0RSxNQUFNLFVBQVUsR0FBRyw0QkFBNEIsQ0FBQztBQUloRCxNQUFNLGlCQUFpQjtJQStCbkIsWUFBWSxXQUFXO1FBN0JOLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFDeEIsZUFBVSxHQUE4QixFQUFFLENBQUM7UUFDcEQsb0JBQWUsR0FBNEIsRUFBRSxDQUFDO1FBNEJsRCxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsV0FBVyxDQUFDO1FBRXpFLElBQUssQ0FBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRztZQUMzRSxNQUFNLElBQUksdUJBQXVCLENBQUMsQ0FBQyxFQUFFO2dCQUNqQyxHQUFHO2dCQUNILEVBQUU7Z0JBQ0YsV0FBVztnQkFDWCxLQUFLO2FBQ1IsQ0FBQyxDQUFBO1NBRUw7UUFDRCxJQUFLLEdBQUcsS0FBSyxTQUFTLElBQUksUUFBUSxLQUFLLFNBQVM7WUFDNUMsTUFBTSxJQUFJLHVCQUF1QixDQUFDLENBQUMsRUFBRTtnQkFDakMsR0FBRztnQkFDSCxRQUFRO2FBQ1gsRUFBRSwrSUFBK0ksQ0FBQyxDQUFDO1FBRXhKLElBQUssR0FBRyxLQUFLLFNBQVMsRUFBRztZQUNyQixJQUFLLENBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRztnQkFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxZQUFZ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LDhCQUFTO0FBTHhDLFNBQVMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxLQUF3QixFQUFFO0lBQzNELE9BQU8sSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFHeUMsd0JBQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBib29sLCBlbnVtZXJhdGUsIGlzRnVuY3Rpb24sIGlzT2JqZWN0LCB3YWl0IH0gZnJvbSBcIi4uL3V0aWxcIjtcblxuY29uc3QgU1ZHX05TX1VSSSA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG5cbi8vIFRPRE86IG1ha2UgQmV0dGVySFRNTEVsZW1lbnQ8VD4sIGZvciB1c2UgaW4gZWcgY2hpbGRbcmVuXSBmdW5jdGlvblxuLy8gZXh0ZW5kcyBIVE1MRWxlbWVudDogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUVsZW1lbnRSZWdpc3RyeS91cGdyYWRlI0V4YW1wbGVzXG5jbGFzcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIF9odG1sRWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfaXNTdmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9saXN0ZW5lcnM6IFRFdmVudEZ1bmN0aW9uTWFwPFRFdmVudD4gPSB7fTtcbiAgICBwcml2YXRlIF9jYWNoZWRDaGlsZHJlbjogVE1hcDxCZXR0ZXJIVE1MRWxlbWVudD4gPSB7fTtcbiAgICBcbiAgICAvKltTeW1ib2wudG9QcmltaXRpdmVdKGhpbnQpIHtcbiAgICAgY29uc29sZS5sb2coJ2Zyb20gdG9QcmltaXRpdmUsIGhpbnQ6ICcsIGhpbnQsICdcXG50aGlzOiAnLCB0aGlzKTtcbiAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50O1xuICAgICB9XG4gICAgIFxuICAgICB2YWx1ZU9mKCkge1xuICAgICBjb25zb2xlLmxvZygnZnJvbSB2YWx1ZU9mLCB0aGlzOiAnLCB0aGlzKTtcbiAgICAgcmV0dXJuIHRoaXM7XG4gICAgIH1cbiAgICAgXG4gICAgIHRvU3RyaW5nKCkge1xuICAgICBjb25zb2xlLmxvZygnZnJvbSB0b1N0cmluZywgdGhpczogJywgdGhpcyk7XG4gICAgIHJldHVybiB0aGlzO1xuICAgICB9XG4gICAgICovXG4gICAgXG4gICAgLy8gVE9ETzogcXVlcnkgc2hvdWxkIGFsc28gYmUgYSBwcmVkaWNhdGUgZnVuY3Rpb25cbiAgICAvKipDcmVhdGUgYW4gZWxlbWVudCBvZiBgdGFnYC4gT3B0aW9uYWxseSwgc2V0IGl0cyBgdGV4dGAgYW5kIC8gb3IgYGNsc2AqL1xuICAgIGNvbnN0cnVjdG9yKHsgdGFnLCB0ZXh0LCBjbHMgfTogeyB0YWc6IFF1ZXJ5U2VsZWN0b3IsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZyB9KTtcbiAgICAvKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgaWRgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGlkOiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICAvKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgcXVlcnlgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBxdWVyeSwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IHF1ZXJ5OiBRdWVyeVNlbGVjdG9yLCB0ZXh0Pzogc3RyaW5nLCBjbHM/OiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk7XG4gICAgLyoqV3JhcCBhbiBleGlzdGluZyBIVE1MRWxlbWVudC4gT3B0aW9uYWxseSwgc2V0IGl0cyBgdGV4dGAsIGBjbHNgIG9yIGNhY2hlIGBjaGlsZHJlbmAqL1xuICAgIGNvbnN0cnVjdG9yKHsgaHRtbEVsZW1lbnQsIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBodG1sRWxlbWVudDogSFRNTEVsZW1lbnQsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICBjb25zdHJ1Y3RvcihlbGVtT3B0aW9ucykge1xuICAgICAgICBjb25zdCB7IHRhZywgaWQsIGh0bWxFbGVtZW50LCB0ZXh0LCBxdWVyeSwgY2hpbGRyZW4sIGNscyB9ID0gZWxlbU9wdGlvbnM7XG4gICAgICAgIFxuICAgICAgICBpZiAoIFsgdGFnLCBpZCwgaHRtbEVsZW1lbnQsIHF1ZXJ5IF0uZmlsdGVyKHggPT4geCAhPT0gdW5kZWZpbmVkKS5sZW5ndGggPiAxICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEJhZEFyZ3VtZW50c0Ftb3VudEVycm9yKDEsIHtcbiAgICAgICAgICAgICAgICB0YWcsXG4gICAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgICAgaHRtbEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgcXVlcnlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHRhZyAhPT0gdW5kZWZpbmVkICYmIGNoaWxkcmVuICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEJhZEFyZ3VtZW50c0Ftb3VudEVycm9yKDEsIHtcbiAgICAgICAgICAgICAgICB0YWcsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5cbiAgICAgICAgICAgIH0sICdcImNoaWxkcmVuXCIgYW5kIFwidGFnXCIgb3B0aW9ucyBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlLCBiZWNhdXNlIHRhZyBpbXBsaWVzIGNyZWF0aW5nIGEgbmV3IGVsZW1lbnQgYW5kIGNoaWxkcmVuIGltcGxpZXMgZ2V0dGluZyBhbiBleGlzdGluZyBvbmUuJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIHRhZyAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgaWYgKCBbICdzdmcnLCAncGF0aCcgXS5pbmNsdWRlcyh0YWcudG9Mb3dlckNhc2UoKSkgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNTdmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OU19VUkksIHRhZyk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5faHRtbEVsZW1lbnQuc2V0QXR0cmlidXRlKCd4bWxucycsIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgICAgICBlbHNlIGlmICggcXVlcnkgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocXVlcnkpO1xuICAgICAgICBlbHNlIGlmICggaHRtbEVsZW1lbnQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGh0bWxFbGVtZW50O1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBCYWRBcmd1bWVudHNBbW91bnRFcnJvcigxLCB7XG4gICAgICAgICAgICAgICAgdGFnLFxuICAgICAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgICAgIGh0bWxFbGVtZW50LFxuICAgICAgICAgICAgICAgIHF1ZXJ5XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIHRleHQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLnRleHQodGV4dCk7XG4gICAgICAgIGlmICggY2xzICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5jbGFzcyhjbHMpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBjaGlsZHJlbiAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuY2FjaGVDaGlsZHJlbihjaGlsZHJlbik7XG4gICAgICAgIFxuICAgICAgICAvLyBPYmplY3QuYXNzaWduKHRoaXMsIHByb3h5KTtcbiAgICAgICAgLypjb25zdCB0aGF0ID0gdGhpcztcbiAgICAgICAgIHJldHVybiBuZXcgUHJveHkodGhpcywge1xuICAgICAgICAgZ2V0KHRhcmdldDogQmV0dGVySFRNTEVsZW1lbnQsIHA6IHN0cmluZyB8IG51bWJlciB8IHN5bWJvbCwgcmVjZWl2ZXI6IGFueSk6IGFueSB7XG4gICAgICAgICAvLyBjb25zb2xlLmxvZygnbG9nZ2luZycpO1xuICAgICAgICAgLy8gY29uc29sZS5sb2coJ3RhcmdldDogJywgdGFyZ2V0LFxuICAgICAgICAgLy8gICAgICdcXG50aGF0OiAnLCB0aGF0LFxuICAgICAgICAgLy8gICAgICdcXG50eXBlb2YodGhhdCk6ICcsIHR5cGVvZiAodGhhdCksXG4gICAgICAgICAvLyAgICAgJ1xcbnA6ICcsIHAsXG4gICAgICAgICAvLyAgICAgJ1xcbnJlY2VpdmVyOiAnLCByZWNlaXZlcixcbiAgICAgICAgIC8vICAgICAnXFxudGhpczogJywgdGhpcyk7XG4gICAgICAgICByZXR1cm4gdGhhdFtwXTtcbiAgICAgICAgIH1cbiAgICAgICAgIH0pXG4gICAgICAgICAqL1xuICAgIH1cbiAgICBcbiAgICAvKipSZXR1cm4gdGhlIHdyYXBwZWQgSFRNTEVsZW1lbnQqL1xuICAgIGdldCBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQ7XG4gICAgfVxuICAgIFxuICAgIC8qKlNldHMgYHRoaXMuX2h0bWxFbGVtZW50YCB0byBgbmV3SHRtbEVsZW1lbnQuX2h0bWxFbGVtZW50YC5cbiAgICAgKiBSZXNldHMgYHRoaXMuX2NhY2hlZENoaWxkcmVuYCBhbmQgY2FjaGVzIGBuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW5gLlxuICAgICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIGZyb20gYG5ld0h0bWxFbGVtZW50Ll9saXN0ZW5lcnNgLCB3aGlsZSBrZWVwaW5nIGB0aGlzLl9saXN0ZW5lcnNgLiovXG4gICAgd3JhcFNvbWV0aGluZ0Vsc2UobmV3SHRtbEVsZW1lbnQ6IEJldHRlckhUTUxFbGVtZW50KTogdGhpc1xuICAgIC8qKlNldHMgYHRoaXMuX2h0bWxFbGVtZW50YCB0byBgbmV3SHRtbEVsZW1lbnRgLlxuICAgICAqIEtlZXBzIGB0aGlzLl9saXN0ZW5lcnNgLlxuICAgICAqIE5PVEU6IHRoaXMgcmVpbml0aWFsaXplcyBgdGhpcy5fY2FjaGVkQ2hpbGRyZW5gIGFuZCBhbGwgZXZlbnQgbGlzdGVuZXJzIGJlbG9uZ2luZyB0byBgbmV3SHRtbEVsZW1lbnRgIGFyZSBsb3N0LiBQYXNzIGEgYEJldHRlckhUTUxFbGVtZW50YCB0byBrZWVwIHRoZW0uKi9cbiAgICB3cmFwU29tZXRoaW5nRWxzZShuZXdIdG1sRWxlbWVudDogTm9kZSk6IHRoaXNcbiAgICB3cmFwU29tZXRoaW5nRWxzZShuZXdIdG1sRWxlbWVudCkge1xuICAgICAgICB0aGlzLl9jYWNoZWRDaGlsZHJlbiA9IHt9O1xuICAgICAgICBpZiAoIG5ld0h0bWxFbGVtZW50IGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5yZXBsYWNlV2l0aChuZXdIdG1sRWxlbWVudC5lKTtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gbmV3SHRtbEVsZW1lbnQuZTtcbiAgICAgICAgICAgIGZvciAoIGxldCBbIF9rZXksIF9jYWNoZWRDaGlsZCBdIG9mIGVudW1lcmF0ZShuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW4pICkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlKF9rZXkgYXMgc3RyaW5nLCBfY2FjaGVkQ2hpbGQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXModGhpcy5fY2FjaGVkQ2hpbGRyZW4pLmxlbmd0aFxuICAgICAgICAgICAgICAgICE9PSBPYmplY3Qua2V5cyhuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW4pLmxlbmd0aFxuICAgICAgICAgICAgICAgIHx8XG4gICAgICAgICAgICAgICAgT2JqZWN0LnZhbHVlcyh0aGlzLl9jYWNoZWRDaGlsZHJlbikuZmlsdGVyKHYgPT4gdiAhPT0gdW5kZWZpbmVkKS5sZW5ndGhcbiAgICAgICAgICAgICAgICAhPT0gT2JqZWN0LnZhbHVlcyhuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW4pLmZpbHRlcih2ID0+IHYgIT09IHVuZGVmaW5lZCkubGVuZ3RoXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHdyYXBTb21ldGhpbmdFbHNlIHRoaXMuX2NhY2hlZENoaWxkcmVuIGxlbmd0aCAhPT0gbmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuLmxlbmd0aGAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3SHRtbEVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub24oeyAuLi50aGlzLl9saXN0ZW5lcnMsIC4uLm5ld0h0bWxFbGVtZW50Ll9saXN0ZW5lcnMsIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm8gd2F5IHRvIGdldCBuZXdIdG1sRWxlbWVudCBldmVudCBsaXN0ZW5lcnMgYmVzaWRlcyBoYWNraW5nIEVsZW1lbnQucHJvdG90eXBlXG4gICAgICAgICAgICB0aGlzLm9uKHRoaXMuX2xpc3RlbmVycyk7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5yZXBsYWNlV2l0aChuZXdIdG1sRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IG5ld0h0bWxFbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLy8gKioqICBCYXNpY1xuICAgIC8qKlNldCB0aGUgZWxlbWVudCdzIGlubmVySFRNTCovXG4gICAgaHRtbChodG1sOiBzdHJpbmcpOiB0aGlzO1xuICAgIC8qKkdldCB0aGUgZWxlbWVudCdzIGlubmVySFRNTCovXG4gICAgaHRtbCgpOiBzdHJpbmc7XG4gICAgaHRtbChodG1sPykge1xuICAgICAgICBpZiAoIGh0bWwgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuaW5uZXJIVE1MO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipTZXQgdGhlIGVsZW1lbnQncyBpbm5lclRleHQqL1xuICAgIHRleHQodHh0OiBzdHJpbmcgfCBudW1iZXIpOiB0aGlzO1xuICAgIC8qKkdldCB0aGUgZWxlbWVudCdzIGlubmVyVGV4dCovXG4gICAgdGV4dCgpOiBzdHJpbmc7XG4gICAgdGV4dCh0eHQ/KSB7XG4gICAgICAgIGlmICggdHh0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLmlubmVyVGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZS5pbm5lclRleHQgPSB0eHQ7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqU2V0IHRoZSBpZCBvZiB0aGUgZWxlbWVudCovXG4gICAgaWQoaWQ6IHN0cmluZyk6IHRoaXM7XG4gICAgLyoqR2V0IHRoZSBpZCBvZiB0aGUgZWxlbWVudCovXG4gICAgaWQoKTogc3RyaW5nO1xuICAgIGlkKGlkPykge1xuICAgICAgICBpZiAoIGlkID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLmlkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lLmlkID0gaWQ7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipGb3IgZWFjaCBgezxzdHlsZUF0dHI+OiA8c3R5bGVWYWw+fWAgcGFpciwgc2V0IHRoZSBgc3R5bGVbc3R5bGVBdHRyXWAgdG8gYHN0eWxlVmFsYC4qL1xuICAgIGNzcyhjc3M6IFBhcnRpYWw8Q3NzT3B0aW9ucz4pOiB0aGlzXG4gICAgLyoqR2V0IGBzdHlsZVtjc3NdYCovXG4gICAgY3NzKGNzczogc3RyaW5nKTogc3RyaW5nXG4gICAgY3NzKGNzcykge1xuICAgICAgICBpZiAoIHR5cGVvZiBjc3MgPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5zdHlsZVtjc3NdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICggbGV0IFsgc3R5bGVBdHRyLCBzdHlsZVZhbCBdIG9mIGVudW1lcmF0ZShjc3MpIClcbiAgICAgICAgICAgICAgICB0aGlzLmUuc3R5bGVbPHN0cmluZz4gc3R5bGVBdHRyXSA9IHN0eWxlVmFsO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqUmVtb3ZlIHRoZSB2YWx1ZSBvZiB0aGUgcGFzc2VkIHN0eWxlIHByb3BlcnRpZXMqL1xuICAgIHVuY3NzKC4uLnJlbW92ZVByb3BzOiAoa2V5b2YgQ3NzT3B0aW9ucylbXSk6IHRoaXMge1xuICAgICAgICBsZXQgY3NzID0ge307XG4gICAgICAgIGZvciAoIGxldCBwcm9wIG9mIHJlbW92ZVByb3BzIClcbiAgICAgICAgICAgIGNzc1twcm9wXSA9ICcnO1xuICAgICAgICByZXR1cm4gdGhpcy5jc3MoY3NzKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGlzKGVsZW1lbnQ6IEJldHRlckhUTUxFbGVtZW50KSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vaXMvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKTtcbiAgICB9XG4gICAgXG4gICAgLypcbiAgICAgYW5pbWF0ZShvcHRzOiBBbmltYXRlT3B0aW9ucykge1xuICAgICAvLyBzZWU6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9DU1NfQW5pbWF0aW9ucy9UaXBzXG4gICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgIH1cbiAgICAgKi9cbiAgICBcbiAgICAvLyAqKiogIENsYXNzZXNcbiAgICAvKipgLmNsYXNzTmFtZSA9IGNsc2AqL1xuICAgIGNsYXNzKGNsczogc3RyaW5nKTogdGhpcztcbiAgICAvKipSZXR1cm4gdGhlIGZpcnN0IGNsYXNzIHRoYXQgbWF0Y2hlcyBgY2xzYCBwcmVkaWNhdGUuKi9cbiAgICBjbGFzcyhjbHM6IFRSZXR1cm5Cb29sZWFuKTogc3RyaW5nO1xuICAgIC8qKlJldHVybiBhIHN0cmluZyBhcnJheSBvZiB0aGUgZWxlbWVudCdzIGNsYXNzZXMgKG5vdCBhIGNsYXNzTGlzdCkqL1xuICAgIGNsYXNzKCk6IHN0cmluZ1tdO1xuICAgIGNsYXNzKGNscz8pIHtcbiAgICAgICAgaWYgKCBjbHMgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuZS5jbGFzc0xpc3QpO1xuICAgICAgICB9IGVsc2UgaWYgKCBpc0Z1bmN0aW9uKGNscykgKSB7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmUuY2xhc3NMaXN0KS5maW5kKGNscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIHRoaXMuX2lzU3ZnICkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNDb25zdGFudFJlYXNzaWdubWVudFxuICAgICAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QgPSBbIGNscyBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmUuY2xhc3NOYW1lID0gY2xzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYWRkQ2xhc3MoY2xzOiBzdHJpbmcsIC4uLmNsc2VzOiBzdHJpbmdbXSk6IHRoaXMge1xuICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LmFkZChjbHMpO1xuICAgICAgICBmb3IgKCBsZXQgYyBvZiBjbHNlcyApXG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LmFkZChjKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHJlbW92ZUNsYXNzKGNsczogVFJldHVybkJvb2xlYW4pOiB0aGlzO1xuICAgIHJlbW92ZUNsYXNzKGNsczogc3RyaW5nLCAuLi5jbHNlczogc3RyaW5nW10pOiB0aGlzO1xuICAgIHJlbW92ZUNsYXNzKGNscywgLi4uY2xzZXMpIHtcbiAgICAgICAgaWYgKCBpc0Z1bmN0aW9uPGJvb2xlYW4+KGNscykgKSB7XG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzKGNscykpO1xuICAgICAgICAgICAgaWYgKCBib29sKGNsc2VzKSApXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdyZW1vdmVDbGFzcywgY2xzIGlzIFRSZXR1cm5Cb29sZWFuLCBnb3QgLi4uY2xzZXMgYnV0IHNob3VsZG50IGhhdmUnKVxuICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnJlbW92ZShjbHMpO1xuICAgICAgICAgICAgZm9yICggbGV0IGMgb2YgY2xzZXMgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QucmVtb3ZlKGMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICByZXBsYWNlQ2xhc3Mob2xkVG9rZW46IFRSZXR1cm5Cb29sZWFuLCBuZXdUb2tlbjogc3RyaW5nKTogdGhpcztcbiAgICByZXBsYWNlQ2xhc3Mob2xkVG9rZW46IHN0cmluZywgbmV3VG9rZW46IHN0cmluZyk6IHRoaXNcbiAgICByZXBsYWNlQ2xhc3Mob2xkVG9rZW4sIG5ld1Rva2VuKSB7XG4gICAgICAgIGlmICggaXNGdW5jdGlvbjxib29sZWFuPihvbGRUb2tlbikgKSB7XG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnJlcGxhY2UodGhpcy5jbGFzcyhvbGRUb2tlbiksIG5ld1Rva2VuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QucmVwbGFjZShvbGRUb2tlbiwgbmV3VG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICB0b2dnbGVDbGFzcyhjbHM6IFRSZXR1cm5Cb29sZWFuLCBmb3JjZT86IGJvb2xlYW4pOiB0aGlzXG4gICAgdG9nZ2xlQ2xhc3MoY2xzOiBzdHJpbmcsIGZvcmNlPzogYm9vbGVhbik6IHRoaXNcbiAgICB0b2dnbGVDbGFzcyhjbHMsIGZvcmNlKSB7XG4gICAgICAgIGlmICggaXNGdW5jdGlvbjxib29sZWFuPihjbHMpIClcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuY2xhc3MoY2xzKSwgZm9yY2UpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnRvZ2dsZShjbHMsIGZvcmNlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKlJldHVybnMgYHRoaXMuZS5jbGFzc0xpc3QuY29udGFpbnMoY2xzKWAgKi9cbiAgICBoYXNDbGFzcyhjbHM6IHN0cmluZyk6IGJvb2xlYW5cbiAgICAvKipSZXR1cm5zIHdoZXRoZXIgYHRoaXNgIGhhcyBhIGNsYXNzIHRoYXQgbWF0Y2hlcyBwYXNzZWQgZnVuY3Rpb24gKi9cbiAgICBoYXNDbGFzcyhjbHM6IFRSZXR1cm5Cb29sZWFuKTogYm9vbGVhblxuICAgIGhhc0NsYXNzKGNscykge1xuICAgICAgICBpZiAoIGlzRnVuY3Rpb248Ym9vbGVhbj4oY2xzKSApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsYXNzKGNscykgIT09IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuY2xhc3NMaXN0LmNvbnRhaW5zKGNscyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gKioqICBOb2Rlc1xuICAgIC8qKkluc2VydCBhdCBsZWFzdCBvbmUgYG5vZGVgIGp1c3QgYWZ0ZXIgYHRoaXNgLiBBbnkgYG5vZGVgIGNhbiBiZSBlaXRoZXIgYEJldHRlckhUTUxFbGVtZW50YHMgb3IgdmFuaWxsYSBgTm9kZWAuKi9cbiAgICBhZnRlciguLi5ub2RlczogQXJyYXk8QmV0dGVySFRNTEVsZW1lbnQgfCBOb2RlPik6IHRoaXMge1xuICAgICAgICBmb3IgKCBsZXQgbm9kZSBvZiBub2RlcyApIHtcbiAgICAgICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgICAgICB0aGlzLmUuYWZ0ZXIobm9kZS5lKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmUuYWZ0ZXIobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIC8qaWYgKG5vZGVzWzBdIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQpXG4gICAgICAgICBmb3IgKGxldCBiaGUgb2YgPEJldHRlckhUTUxFbGVtZW50W10+bm9kZXMpXG4gICAgICAgICB0aGlzLmUuYWZ0ZXIoYmhlLmUpO1xuICAgICAgICAgZWxzZVxuICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiA8KHN0cmluZyB8IE5vZGUpW10+bm9kZXMpXG4gICAgICAgICB0aGlzLmUuYWZ0ZXIobm9kZSk7IC8vIFRPRE86IHRlc3Qgd2hhdCBoYXBwZW5zIHdoZW4gcGFzc2VkIHN0cmluZ3NcbiAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgKi9cbiAgICB9XG4gICAgXG4gICAgLyoqSW5zZXJ0IGB0aGlzYCBqdXN0IGFmdGVyIGEgYEJldHRlckhUTUxFbGVtZW50YCBvciBhIHZhbmlsbGEgYE5vZGVgLiovXG4gICAgaW5zZXJ0QWZ0ZXIobm9kZTogQmV0dGVySFRNTEVsZW1lbnQgfCBIVE1MRWxlbWVudCk6IHRoaXMge1xuICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICBub2RlLmUuYWZ0ZXIodGhpcy5lKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbm9kZS5hZnRlcih0aGlzLmUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqSW5zZXJ0IGF0IGxlYXN0IG9uZSBgbm9kZWAgYWZ0ZXIgdGhlIGxhc3QgY2hpbGQgb2YgYHRoaXNgLlxuICAgICAqIEFueSBgbm9kZWAgY2FuIGJlIGVpdGhlciBhIGBCZXR0ZXJIVE1MRWxlbWVudGAsIGEgdmFuaWxsYSBgTm9kZWAsXG4gICAgICogYSBge3NvbWVLZXk6IEJldHRlckhUTUxFbGVtZW50fWAgcGFpcnMgb2JqZWN0LCBvciBhIGBbc29tZUtleSwgQmV0dGVySFRNTEVsZW1lbnRdYCB0dXBsZS4qL1xuICAgIGFwcGVuZCguLi5ub2RlczogQXJyYXk8QmV0dGVySFRNTEVsZW1lbnQgfCBOb2RlIHwgVE1hcDxCZXR0ZXJIVE1MRWxlbWVudD4gfCBbIHN0cmluZywgQmV0dGVySFRNTEVsZW1lbnQgXT4pOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IG5vZGUgb2Ygbm9kZXMgKSB7XG4gICAgICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICAgICAgdGhpcy5lLmFwcGVuZChub2RlLmUpO1xuICAgICAgICAgICAgZWxzZSBpZiAoIG5vZGUgaW5zdGFuY2VvZiBOb2RlIClcbiAgICAgICAgICAgICAgICB0aGlzLmUuYXBwZW5kKG5vZGUpO1xuICAgICAgICAgICAgZWxzZSBpZiAoIEFycmF5LmlzQXJyYXkobm9kZSkgKVxuICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVBcHBlbmQoWyBub2RlIF0pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVBcHBlbmQobm9kZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgLyppZiAobm9kZXNbMF0gaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudClcbiAgICAgICAgIGZvciAobGV0IGJoZSBvZiA8QmV0dGVySFRNTEVsZW1lbnRbXT5ub2RlcylcbiAgICAgICAgIHRoaXMuZS5hcHBlbmQoYmhlLmUpO1xuICAgICAgICAgZWxzZVxuICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiA8KHN0cmluZyB8IE5vZGUpW10+bm9kZXMpXG4gICAgICAgICB0aGlzLmUuYXBwZW5kKG5vZGUpOyAvLyBUT0RPOiB0ZXN0IHdoYXQgaGFwcGVucyB3aGVuIHBhc3NlZCBzdHJpbmdzXG4gICAgICAgICByZXR1cm4gdGhpczsqL1xuICAgIH1cbiAgICBcbiAgICAvKipBcHBlbmQgYHRoaXNgIHRvIGEgYEJldHRlckhUTUxFbGVtZW50YCBvciBhIHZhbmlsbGEgYE5vZGVgKi9cbiAgICBhcHBlbmRUbyhub2RlOiBCZXR0ZXJIVE1MRWxlbWVudCB8IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgIG5vZGUuZS5hcHBlbmQodGhpcy5lKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbm9kZS5hcHBlbmQodGhpcy5lKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipJbnNlcnQgYXQgbGVhc3Qgb25lIGBub2RlYCBqdXN0IGJlZm9yZSBgdGhpc2AuIEFueSBgbm9kZWAgY2FuIGJlIGVpdGhlciBgQmV0dGVySFRNTEVsZW1lbnRgcyBvciB2YW5pbGxhIGBOb2RlYC4qL1xuICAgIGJlZm9yZSguLi5ub2RlczogQXJyYXk8QmV0dGVySFRNTEVsZW1lbnQgfCBOb2RlPik6IHRoaXMge1xuICAgICAgICBmb3IgKCBsZXQgbm9kZSBvZiBub2RlcyApIHtcbiAgICAgICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgICAgICB0aGlzLmUuYmVmb3JlKG5vZGUuZSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5lLmJlZm9yZShub2RlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgLyppZiAobm9kZXNbMF0gaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudClcbiAgICAgICAgIGZvciAobGV0IGJoZSBvZiA8QmV0dGVySFRNTEVsZW1lbnRbXT5ub2RlcylcbiAgICAgICAgIHRoaXMuZS5iZWZvcmUoYmhlLmUpO1xuICAgICAgICAgZWxzZVxuICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiA8KHN0cmluZyB8IE5vZGUpW10+bm9kZXMpXG4gICAgICAgICB0aGlzLmUuYmVmb3JlKG5vZGUpOyAvLyBUT0RPOiB0ZXN0IHdoYXQgaGFwcGVucyB3aGVuIHBhc3NlZCBzdHJpbmdzXG4gICAgICAgICByZXR1cm4gdGhpczsqL1xuICAgIH1cbiAgICBcbiAgICAvKipJbnNlcnQgYHRoaXNgIGp1c3QgYmVmb3JlIGEgYEJldHRlckhUTUxFbGVtZW50YCBvciBhIHZhbmlsbGEgYE5vZGVgcy4qL1xuICAgIGluc2VydEJlZm9yZShub2RlOiBCZXR0ZXJIVE1MRWxlbWVudCB8IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgIG5vZGUuZS5iZWZvcmUodGhpcy5lKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbm9kZS5iZWZvcmUodGhpcy5lKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE86IGlmIGFwcGVuZCBzdXBwb3J0cyBzdHJpbmdzLCBzbyBzaG91bGQgdGhpc1xuICAgIHJlcGxhY2VDaGlsZChuZXdDaGlsZDogTm9kZSwgb2xkQ2hpbGQ6IE5vZGUpOiB0aGlzO1xuICAgIHJlcGxhY2VDaGlsZChuZXdDaGlsZDogQmV0dGVySFRNTEVsZW1lbnQsIG9sZENoaWxkOiBCZXR0ZXJIVE1MRWxlbWVudCk6IHRoaXM7XG4gICAgcmVwbGFjZUNoaWxkKG5ld0NoaWxkLCBvbGRDaGlsZCkge1xuICAgICAgICB0aGlzLmUucmVwbGFjZUNoaWxkKG5ld0NoaWxkLCBvbGRDaGlsZCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIF9jYWNoZShrZXk6IHN0cmluZywgY2hpbGQ6IEJldHRlckhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXNba2V5XSA9IGNoaWxkO1xuICAgICAgICB0aGlzLl9jYWNoZWRDaGlsZHJlbltrZXldID0gY2hpbGQ7XG4gICAgfVxuICAgIFxuICAgIC8qKkZvciBlYWNoIGBba2V5LCBjaGlsZF1gIHBhaXIsIGBhcHBlbmQoY2hpbGQpYCBhbmQgc3RvcmUgaXQgaW4gYHRoaXNba2V5XWAuICovXG4gICAgY2FjaGVBcHBlbmQoa2V5Q2hpbGRQYWlyczogVE1hcDxCZXR0ZXJIVE1MRWxlbWVudD4pOiB0aGlzXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIGNoaWxkXWAgdHVwbGUsIGBhcHBlbmQoY2hpbGQpYCBhbmQgc3RvcmUgaXQgaW4gYHRoaXNba2V5XWAuICovXG4gICAgY2FjaGVBcHBlbmQoa2V5Q2hpbGRQYWlyczogWyBzdHJpbmcsIEJldHRlckhUTUxFbGVtZW50IF1bXSk6IHRoaXNcbiAgICBjYWNoZUFwcGVuZChrZXlDaGlsZFBhaXJzKSB7XG4gICAgICAgIGNvbnN0IF9jYWNoZUFwcGVuZCA9IChfa2V5OiBzdHJpbmcsIF9jaGlsZDogQmV0dGVySFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kKF9jaGlsZCk7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZShfa2V5LCBfY2hpbGQpO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoa2V5Q2hpbGRQYWlycykgKSB7XG4gICAgICAgICAgICBmb3IgKCBsZXQgWyBrZXksIGNoaWxkIF0gb2Yga2V5Q2hpbGRQYWlycyApXG4gICAgICAgICAgICAgICAgX2NhY2hlQXBwZW5kKGtleSwgY2hpbGQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICggbGV0IFsga2V5LCBjaGlsZCBdIG9mIGVudW1lcmF0ZShrZXlDaGlsZFBhaXJzKSApXG4gICAgICAgICAgICAgICAgX2NhY2hlQXBwZW5kKGtleSwgY2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipHZXQgYSBjaGlsZCB3aXRoIGBxdWVyeVNlbGVjdG9yYCBhbmQgcmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBvZiBpdCovXG4gICAgY2hpbGQ8SyBleHRlbmRzIEhUTUxUYWc+KHNlbGVjdG9yOiBLKTogQmV0dGVySFRNTEVsZW1lbnQ7XG4gICAgLyoqR2V0IGEgY2hpbGQgd2l0aCBgcXVlcnlTZWxlY3RvcmAgYW5kIHJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgb2YgaXQqL1xuICAgIGNoaWxkKHNlbGVjdG9yOiBzdHJpbmcpOiBCZXR0ZXJIVE1MRWxlbWVudDtcbiAgICBjaGlsZChzZWxlY3Rvcikge1xuICAgICAgICByZXR1cm4gbmV3IEJldHRlckhUTUxFbGVtZW50KHsgaHRtbEVsZW1lbnQgOiB0aGlzLmUucXVlcnlTZWxlY3RvcihzZWxlY3RvcikgfSk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKlJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgbGlzdCBvZiBhbGwgY2hpbGRyZW4gKi9cbiAgICBjaGlsZHJlbigpOiBCZXR0ZXJIVE1MRWxlbWVudFtdO1xuICAgIC8qKlJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgbGlzdCBvZiBhbGwgY2hpbGRyZW4gc2VsZWN0ZWQgYnkgYHNlbGVjdG9yYCAqL1xuICAgIGNoaWxkcmVuPEsgZXh0ZW5kcyBIVE1MVGFnPihzZWxlY3RvcjogSyk6IEJldHRlckhUTUxFbGVtZW50W107XG4gICAgLyoqUmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBsaXN0IG9mIGFsbCBjaGlsZHJlbiBzZWxlY3RlZCBieSBgc2VsZWN0b3JgICovXG4gICAgY2hpbGRyZW4oc2VsZWN0b3I6IHN0cmluZyB8IEhUTUxUYWcpOiBCZXR0ZXJIVE1MRWxlbWVudFtdO1xuICAgIGNoaWxkcmVuKHNlbGVjdG9yPykge1xuICAgICAgICBsZXQgY2hpbGRyZW5WYW5pbGxhO1xuICAgICAgICBsZXQgY2hpbGRyZW5Db2xsZWN0aW9uO1xuICAgICAgICBpZiAoIHNlbGVjdG9yID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBjaGlsZHJlbkNvbGxlY3Rpb24gPSB0aGlzLmUuY2hpbGRyZW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGlsZHJlbkNvbGxlY3Rpb24gPSB0aGlzLmUucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGRyZW5WYW5pbGxhID0gPEhUTUxFbGVtZW50W10+IEFycmF5LmZyb20oY2hpbGRyZW5Db2xsZWN0aW9uKTtcbiAgICAgICAgY29uc3QgdG9FbGVtID0gKGM6IEhUTUxFbGVtZW50KSA9PiBuZXcgQmV0dGVySFRNTEVsZW1lbnQoeyBodG1sRWxlbWVudCA6IGMgfSk7XG4gICAgICAgIHJldHVybiBjaGlsZHJlblZhbmlsbGEubWFwKHRvRWxlbSk7XG4gICAgfVxuICAgIFxuICAgIGNsb25lKGRlZXA/OiBib29sZWFuKTogQmV0dGVySFRNTEVsZW1lbnQge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBuZXcgQmV0dGVySFRNTEVsZW1lbnQoeyBodG1sRWxlbWVudCA6IHRoaXMuZS5jbG9uZU5vZGUoZGVlcCkgfSk7XG4gICAgfVxuICAgIFxuICAgIC8qKkZvciBlYWNoIGBba2V5LCBzZWxlY3Rvcl1gIHBhaXIsIHdoZXJlIGBzZWxlY3RvcmAgaXMgZWl0aGVyIGFuIGBIVE1MVGFnYCBvciBhIGBzdHJpbmdgLCBnZXQgYHRoaXMuY2hpbGQoc2VsZWN0b3IpYCwgYW5kIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGRpcmVjdGx5XG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7IGlkOiAnbmF2YmFyJyB9KTtcbiAgICAgKiBuYXZiYXIuY2FjaGVDaGlsZHJlbih7IGhvbWU6ICcubmF2YmFyLWl0ZW0taG9tZScsIGFib3V0OiAnLm5hdmJhci1pdGVtLWFib3V0JyB9KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIG5hdmJhci5hYm91dC5jc3MoLi4uKTtcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzaW5nIGBjYWNoZUNoaWxkcmVuYCBpbmRpcmVjdGx5IHRocm91Z2ggYGNoaWxkcmVuYCBjb25zdHJ1Y3RvciBvcHRpb25cbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHsgaWQ6ICduYXZiYXInLCBjaGlsZHJlbjogeyBob21lOiAnLm5hdmJhci1pdGVtLWhvbWUnLCBhYm91dDogJy5uYXZiYXItaXRlbS1hYm91dCcgfX0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogbmF2YmFyLmFib3V0LmNzcyguLi4pO1xuICAgICAqIEBzZWUgdGhpcy5jaGlsZCovXG4gICAgY2FjaGVDaGlsZHJlbihxdWVyeU1hcDogVE1hcDxRdWVyeVNlbGVjdG9yPik6IHRoaXNcbiAgICAvKipGb3IgZWFjaCBgW2tleSwgc2VsZWN0b3JdYCBwYWlyLCB3aGVyZSBgc2VsZWN0b3JgIGlzIGEgcmVjdXJzaXZlIGB7c3Vic2VsZWN0b3I6IGtleVNlbGVjdG9yT2JqfWAgb2JqZWN0LFxuICAgICAqIGV4dHJhY3QgYHRoaXMuY2hpbGQoc3Vic2VsZWN0b3IpYCwgc3RvcmUgaXQgaW4gYHRoaXNba2V5XWAsIHRoZW4gY2FsbCBgdGhpc1trZXldLmNhY2hlQ2hpbGRyZW5gIHBhc3NpbmcgdGhlIHJlY3Vyc2l2ZSBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgZGlyZWN0bHlcbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHsgaWQ6ICduYXZiYXInIH0pO1xuICAgICAqIG5hdmJhci5jYWNoZUNoaWxkcmVuKHtcbiAgICAgKiAgICAgIGhvbWU6IHtcbiAgICAgKiAgICAgICAgICAnLm5hdmJhci1pdGVtLWhvbWUnOiB7XG4gICAgICogICAgICAgICAgICAgIG5ld3M6ICcubmF2YmFyLXN1Yml0ZW0tbmV3cyxcbiAgICAgKiAgICAgICAgICAgICAgc3VwcG9ydDogJy5uYXZiYXItc3ViaXRlbS1zdXBwb3J0J1xuICAgICAqICAgICAgICAgIH1cbiAgICAgKiAgICAgIH1cbiAgICAgKiAgfSk7XG4gICAgICogbmF2YmFyLmhvbWUudG9nZ2xlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBuYXZiYXIuaG9tZS5uZXdzLmNzcyguLi4pO1xuICAgICAqIG5hdmJhci5ob21lLnN1cHBvcnQucG9pbnRlcmRvd24oLi4uKTtcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzaW5nIGBjYWNoZUNoaWxkcmVuYCBpbmRpcmVjdGx5IHRocm91Z2ggYGNoaWxkcmVuYCBjb25zdHJ1Y3RvciBvcHRpb25cbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHtxdWVyeTogJyNuYXZiYXInLCBjaGlsZHJlbjoge1xuICAgICAqICAgICAgaG9tZToge1xuICAgICAqICAgICAgICAgICcubmF2YmFyLWl0ZW0taG9tZSc6IHtcbiAgICAgKiAgICAgICAgICAgICAgbmV3czogJy5uYXZiYXItc3ViaXRlbS1uZXdzLFxuICAgICAqICAgICAgICAgICAgICBzdXBwb3J0OiAnLm5hdmJhci1zdWJpdGVtLXN1cHBvcnQnXG4gICAgICogICAgICAgICAgfVxuICAgICAqICAgICAgfVxuICAgICAqICB9fSk7XG4gICAgICogbmF2YmFyLmhvbWUudG9nZ2xlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBuYXZiYXIuaG9tZS5uZXdzLmNzcyguLi4pO1xuICAgICAqIG5hdmJhci5ob21lLnN1cHBvcnQucG9pbnRlcmRvd24oLi4uKTtcbiAgICAgKiBAc2VlIHRoaXMuY2hpbGQqL1xuICAgIGNhY2hlQ2hpbGRyZW4ocmVjdXJzaXZlUXVlcnlNYXA6IFRSZWNNYXA8UXVlcnlTZWxlY3Rvcj4pOiB0aGlzXG4gICAgY2FjaGVDaGlsZHJlbihiaGVNYXA6IFRNYXA8QmV0dGVySFRNTEVsZW1lbnQ+KTogdGhpc1xuICAgIC8qKkZvciBlYWNoIGBba2V5LCBzZWxlY3Rvcl1gIHBhaXIsIHdoZXJlIGBzZWxlY3RvcmAgaXMgYSBgQmV0dGVySFRNTEVsZW1lbnRgLCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzaW5nIGBjYWNoZUNoaWxkcmVuYCBkaXJlY3RseVxuICAgICAqIGNvbnN0IGhvbWUgPSBlbGVtKHsgcXVlcnk6ICcubmF2YmFyLWl0ZW0taG9tZScgfSk7XG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7IGlkOiAnbmF2YmFyJyB9KTtcbiAgICAgKiBuYXZiYXIuY2FjaGVDaGlsZHJlbih7IGhvbWUgfSk7XG4gICAgICogbmF2YmFyLmhvbWUudG9nZ2xlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzaW5nIGBjYWNoZUNoaWxkcmVuYCBpbmRpcmVjdGx5IHRocm91Z2ggYGNoaWxkcmVuYCBjb25zdHJ1Y3RvciBvcHRpb25cbiAgICAgKiBjb25zdCBob21lID0gZWxlbSh7IHF1ZXJ5OiAnLm5hdmJhci1pdGVtLWhvbWUnIH0pO1xuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oe2lkOiAnbmF2YmFyJywgY2hpbGRyZW46IHsgaG9tZSB9fSk7XG4gICAgICogbmF2YmFyLmhvbWUudG9nZ2xlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBAc2VlIHRoaXMuY2hpbGQqL1xuICAgIFxuICAgIGNhY2hlQ2hpbGRyZW4ocmVjdXJzaXZlQkhFTWFwOiBUUmVjTWFwPEJldHRlckhUTUxFbGVtZW50Pik6IHRoaXNcbiAgICAvKiprZXk6IHN0cmluZy4gdmFsdWU6IGVpdGhlciBcInNlbGVjdG9yIHN0cmluZ1wiIE9SIHtcInNlbGVjdG9yIHN0cmluZ1wiOiA8cmVjdXJzZSBkb3duPn0qL1xuICAgIGNhY2hlQ2hpbGRyZW4obWFwKSB7XG4gICAgICAgIGZvciAoIGxldCBbIGtleSwgdmFsdWUgXSBvZiBlbnVtZXJhdGUobWFwKSApIHtcbiAgICAgICAgICAgIGxldCB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICAgICAgICAgICAgaWYgKCBpc09iamVjdCh2YWx1ZSkgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCB2YWx1ZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50ICkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShrZXksIHZhbHVlKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGxldCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoPFRNYXA8UXVlcnlTZWxlY3Rvcj4gfCBUUmVjTWFwPFF1ZXJ5U2VsZWN0b3I+PnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICggZW50cmllc1sxXSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBjYWNoZUNoaWxkcmVuKCkgcmVjZWl2ZWQgcmVjdXJzaXZlIG9iaiB3aXRoIG1vcmUgdGhhbiAxIHNlbGVjdG9yIGZvciBhIGtleS4gVXNpbmcgb25seSAwdGggc2VsZWN0b3JgLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtdWx0aXBsZSBzZWxlY3RvcnNcIiA6IGVudHJpZXMubWFwKGUgPT4gZVswXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzIDogdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gb25seSBmaXJzdCBiZWNhdXNlIDE6MSBmb3Iga2V5OnNlbGVjdG9yLlxuICAgICAgICAgICAgICAgICAgICAvLyAoaWUgY2FuJ3QgZG8ge3JpZ2h0OiB7LnJpZ2h0OiB7Li4ufSwgLnJpZ2h0Mjogey4uLn19KVxuICAgICAgICAgICAgICAgICAgICBsZXQgWyBzZWxlY3Rvciwgb2JqIF0gPSBlbnRyaWVzWzBdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShrZXksIHRoaXMuY2hpbGQoc2VsZWN0b3IpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpc1trZXldLmNhY2hlQ2hpbGRyZW4ob2JqKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHR5cGUgPT09IFwic3RyaW5nXCIgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoa2V5LCB0aGlzLmNoaWxkKHZhbHVlKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgY2FjaGVDaGlsZHJlbiwgYmFkIHZhbHVlIHR5cGU6IFwiJHt0eXBlfVwiLiBrZXk6IFwiJHtrZXl9XCIsIHZhbHVlOiBcIiR7dmFsdWV9XCIuIG1hcDpgLCBtYXAsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qKlJlbW92ZSBhbGwgY2hpbGRyZW4gZnJvbSBET00qL1xuICAgIGVtcHR5KCk6IHRoaXMge1xuICAgICAgICAvLyBUT0RPOiBpcyB0aGlzIGZhc3RlciB0aGFuIGlubmVySFRNTCA9IFwiXCI/XG4gICAgICAgIHdoaWxlICggdGhpcy5lLmZpcnN0Q2hpbGQgKVxuICAgICAgICAgICAgdGhpcy5lLnJlbW92ZUNoaWxkKHRoaXMuZS5maXJzdENoaWxkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKlJlbW92ZSBlbGVtZW50IGZyb20gRE9NKi9cbiAgICByZW1vdmUoKTogdGhpcyB7XG4gICAgICAgIHRoaXMuZS5yZW1vdmUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE86IHJlY3Vyc2l2ZWx5IHlpZWxkIGNoaWxkcmVuXG4gICAgLy8gICh1bmxpa2UgLmNoaWxkcmVuKCksIHRoaXMgZG9lc24ndCByZXR1cm4gb25seSB0aGUgZmlyc3QgbGV2ZWwpXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZpbmQoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vZmluZC9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBmaXJzdCgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9maXJzdC9cbiAgICAgICAgLy8gdGhpcy5lLmZpcnN0Q2hpbGRcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBsYXN0KCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2xhc3QvXG4gICAgICAgIC8vIHRoaXMuZS5sYXN0Q2hpbGRcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBuZXh0KCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG5vdCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBwYXJlbnQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgcGFyZW50cygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8vICoqKiAgRXZlbnRzXG4gICAgXG4gICAgb24oZXZUeXBlRm5QYWlyczogVEV2ZW50RnVuY3Rpb25NYXA8VEV2ZW50Piwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIGZvciAoIGxldCBbIGV2VHlwZSwgZXZGbiBdIG9mIGVudW1lcmF0ZShldlR5cGVGblBhaXJzKSApIHtcbiAgICAgICAgICAgIGNvbnN0IF9mID0gZnVuY3Rpb24gX2YoZXZ0KSB7XG4gICAgICAgICAgICAgICAgZXZGbihldnQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuZS5hZGRFdmVudExpc3RlbmVyKGV2VHlwZSwgX2YsIG9wdGlvbnMpO1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzW2V2VHlwZV0gPSBfZjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgb25lKGV2VHlwZTogVEV2ZW50LCBsaXN0ZW5lcjogRnVuY3Rpb25SZWNpZXZlc0V2ZW50PFRFdmVudD4sIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICBjb25zdCBldlR5cGVGblBhaXJzID0ge307XG4gICAgICAgIGV2VHlwZUZuUGFpcnNbZXZUeXBlXSA9IGxpc3RlbmVyO1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyA9PT0gdW5kZWZpbmVkID8geyBvbmNlIDogdHJ1ZSB9IDogeyAuLi5vcHRpb25zLCBvbmNlIDogdHJ1ZSB9O1xuICAgICAgICByZXR1cm4gdGhpcy5vbihldlR5cGVGblBhaXJzLCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgLyoqUmVtb3ZlIGBldmVudGAgZnJvbSB3cmFwcGVkIGVsZW1lbnQncyBldmVudCBsaXN0ZW5lcnMsIGJ1dCBrZWVwIHRoZSByZW1vdmVkIGxpc3RlbmVyIGluIGNhY2hlLlxuICAgICAqIFRoaXMgaXMgdXNlZnVsIGZvciBsYXRlciB1bmJsb2NraW5nKi9cbiAgICBibG9ja0xpc3RlbmVyKGV2ZW50OiBURXZlbnQpIHtcbiAgICAgICAgbGV0IGxpc3RlbmVyID0gdGhpcy5fbGlzdGVuZXJzW2V2ZW50XTtcbiAgICAgICAgaWYgKCBsaXN0ZW5lciA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihgYmxvY2tMaXN0ZW5lcihldmVudCk6IHRoaXMuX2xpc3RlbmVyc1tldmVudF0gaXMgdW5kZWZpbmVkLiBldmVudDpgLCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHVuYmxvY2tMaXN0ZW5lcihldmVudDogVEV2ZW50KSB7XG4gICAgICAgIGxldCBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tldmVudF07XG4gICAgICAgIGlmICggbGlzdGVuZXIgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oYHVuYmxvY2tMaXN0ZW5lcihldmVudCk6IHRoaXMuX2xpc3RlbmVyc1tldmVudF0gaXMgdW5kZWZpbmVkLiBldmVudDpgLCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qXG4gICAgIENocm9ub2xvZ3k6XG4gICAgIG1vdXNlZG93biAgIHRvdWNoc3RhcnRcdHBvaW50ZXJkb3duXG4gICAgIG1vdXNlZW50ZXJcdFx0ICAgICAgICBwb2ludGVyZW50ZXJcbiAgICAgbW91c2VsZWF2ZVx0XHQgICAgICAgIHBvaW50ZXJsZWF2ZVxuICAgICBtb3VzZW1vdmVcdHRvdWNobW92ZVx0cG9pbnRlcm1vdmVcbiAgICAgbW91c2VvdXRcdFx0ICAgICAgICBwb2ludGVyb3V0XG4gICAgIG1vdXNlb3Zlclx0XHQgICAgICAgIHBvaW50ZXJvdmVyXG4gICAgIG1vdXNldXBcdCAgICB0b3VjaGVuZCAgICBwb2ludGVydXBcbiAgICAgKi9cbiAgICAvKiogQWRkIGEgYHRvdWNoc3RhcnRgIGV2ZW50IGxpc3RlbmVyLiBUaGlzIGlzIHRoZSBmYXN0IGFsdGVybmF0aXZlIHRvIGBjbGlja2AgbGlzdGVuZXJzIGZvciBtb2JpbGUgKG5vIDMwMG1zIHdhaXQpLiAqL1xuICAgIHRvdWNoc3RhcnQoZm46IChldjogVG91Y2hFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbiBfZihldjogVG91Y2hFdmVudCkge1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTsgLy8gb3RoZXJ3aXNlIFwidG91Y2htb3ZlXCIgaXMgdHJpZ2dlcmVkXG4gICAgICAgICAgICBmbihldik7XG4gICAgICAgICAgICBpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5vbmNlICkgLy8gVE9ETzogbWF5YmUgbmF0aXZlIG9wdGlvbnMub25jZSBpcyBlbm91Z2hcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBfZik7XG4gICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICAvLyBUT0RPOiB0aGlzLl9saXN0ZW5lcnMsIG9yIHVzZSB0aGlzLm9uKFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcG9pbnRlcmVudGVyKGZuOiAoZXZlbnQ6IFBvaW50ZXJFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub24oeyBwb2ludGVyZW50ZXIgOiBmbiB9LCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgLyoqIEFkZCBhIGBwb2ludGVyZG93bmAgZXZlbnQgbGlzdGVuZXIgaWYgYnJvd3NlciBzdXBwb3J0cyBgcG9pbnRlcmRvd25gLCBlbHNlIHNlbmQgYG1vdXNlZG93bmAgKHNhZmFyaSkuICovXG4gICAgcG9pbnRlcmRvd24oZm46IChldmVudDogUG9pbnRlckV2ZW50IHwgTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgXG4gICAgICAgIGxldCBhY3Rpb247XG4gICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIFBvaW50ZXJFdmVudCBleGlzdHMgaW5zdGVhZCBvZiB0cnkvY2F0Y2hcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGFjdGlvbiA9IHdpbmRvdy5Qb2ludGVyRXZlbnQgPyAncG9pbnRlcmRvd24nIDogJ21vdXNlZG93bic7IC8vIHNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgcG9pbnRlcmRvd25cbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICBhY3Rpb24gPSAnbW91c2Vkb3duJ1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IF9mID0gZnVuY3Rpb24gX2YoZXY6IFBvaW50ZXJFdmVudCB8IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBmbihldik7XG4gICAgICAgICAgICBpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5vbmNlICkgLy8gVE9ETzogbWF5YmUgbmF0aXZlIG9wdGlvbnMub25jZSBpcyBlbm91Z2hcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoYWN0aW9uLCBfZik7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZS5hZGRFdmVudExpc3RlbmVyKGFjdGlvbiwgX2YsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMucG9pbnRlcmRvd24gPSBfZjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEgY2xpY2sgb2YgdGhlIGVsZW1lbnQuIFVzZWZ1bCBmb3IgYDxhPmAgZWxlbWVudHMuKi9cbiAgICBjbGljaygpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBjbGlja2AgZXZlbnQgbGlzdGVuZXIuIFlvdSBzaG91bGQgcHJvYmFibHkgdXNlIGBwb2ludGVyZG93bigpYCBpZiBvbiBkZXNrdG9wLCBvciBgdG91Y2hzdGFydCgpYCBpZiBvbiBtb2JpbGUuKi9cbiAgICBjbGljayhmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgY2xpY2soZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLmUuY2xpY2soKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBjbGljayA6IGZuIH0sIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKkJsdXIgKHVuZm9jdXMpIHRoZSBlbGVtZW50LiovXG4gICAgYmx1cigpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBibHVyYCBldmVudCBsaXN0ZW5lciovXG4gICAgYmx1cihmbjogKGV2ZW50OiBGb2N1c0V2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgYmx1cihmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuZS5ibHVyKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgYmx1ciA6IGZuIH0sIG9wdGlvbnMpXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqRm9jdXMgdGhlIGVsZW1lbnQuKi9cbiAgICBmb2N1cygpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBmb2N1c2AgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGZvY3VzKGZuOiAoZXZlbnQ6IEZvY3VzRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBmb2N1cyhmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuZS5mb2N1cygpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGZvY3VzIDogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipBZGQgYSBgY2hhbmdlYCBldmVudCBsaXN0ZW5lciovXG4gICAgY2hhbmdlKGZuOiAoZXZlbnQ6IEV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICByZXR1cm4gdGhpcy5vbih7IGNoYW5nZSA6IGZuIH0sIG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICAvKipBZGQgYSBgY29udGV4dG1lbnVgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBjb250ZXh0bWVudShmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICByZXR1cm4gdGhpcy5vbih7IGNvbnRleHRtZW51IDogZm4gfSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEgZG91YmxlIGNsaWNrIG9mIHRoZSBlbGVtZW50LiovXG4gICAgZGJsY2xpY2soKTogdGhpcztcbiAgICAvKipBZGQgYSBgZGJsY2xpY2tgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBkYmxjbGljayhmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgZGJsY2xpY2soZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBjb25zdCBkYmxjbGljayA9IG5ldyBNb3VzZUV2ZW50KCdkYmxjbGljaycsIHtcbiAgICAgICAgICAgICAgICAndmlldycgOiB3aW5kb3csXG4gICAgICAgICAgICAgICAgJ2J1YmJsZXMnIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnY2FuY2VsYWJsZScgOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZS5kaXNwYXRjaEV2ZW50KGRibGNsaWNrKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBkYmxjbGljayA6IGZuIH0sIG9wdGlvbnMpXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBtb3VzZWVudGVyIGV2ZW50IHRvIHRoZSBlbGVtZW50LiovXG4gICAgbW91c2VlbnRlcigpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBtb3VzZWVudGVyYCBldmVudCBsaXN0ZW5lciovXG4gICAgbW91c2VlbnRlcihmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgbW91c2VlbnRlcihmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIC8vIG1vdXNlb3ZlcjogYWxzbyBjaGlsZCBlbGVtZW50c1xuICAgICAgICAvLyBtb3VzZWVudGVyOiBvbmx5IGJvdW5kIGVsZW1lbnRcbiAgICAgICAgXG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGNvbnN0IG1vdXNlZW50ZXIgPSBuZXcgTW91c2VFdmVudCgnbW91c2VlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAndmlldycgOiB3aW5kb3csXG4gICAgICAgICAgICAgICAgJ2J1YmJsZXMnIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnY2FuY2VsYWJsZScgOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZS5kaXNwYXRjaEV2ZW50KG1vdXNlZW50ZXIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IG1vdXNlZW50ZXIgOiBmbiB9LCBvcHRpb25zKVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEga2V5ZG93biBldmVudCB0byB0aGUgZWxlbWVudC4qL1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBrZXlkb3duKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYGtleWRvd25gIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBrZXlkb3duKGZuOiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBrZXlkb3duKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGtleWRvd24gOiBmbiB9LCBvcHRpb25zKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAga2V5dXAoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5dXAvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAga2V5cHJlc3MoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgaG92ZXIoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vaG92ZXIvXG4gICAgICAgIC8vIGJpbmRzIHRvIGJvdGggbW91c2VlbnRlciBhbmQgbW91c2VsZWF2ZVxuICAgICAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNzU4OTQyMC93aGVuLXRvLWNob29zZS1tb3VzZW92ZXItYW5kLWhvdmVyLWZ1bmN0aW9uXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbW91c2Vkb3duKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2tleXByZXNzL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG1vdXNlbGVhdmUoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIC8vbW91c2VsZWF2ZSBhbmQgbW91c2VvdXQgYXJlIHNpbWlsYXIgYnV0IGRpZmZlciBpbiB0aGF0IG1vdXNlbGVhdmUgZG9lcyBub3QgYnViYmxlIGFuZCBtb3VzZW91dCBkb2VzLlxuICAgICAgICAvLyBUaGlzIG1lYW5zIHRoYXQgbW91c2VsZWF2ZSBpcyBmaXJlZCB3aGVuIHRoZSBwb2ludGVyIGhhcyBleGl0ZWQgdGhlIGVsZW1lbnQgYW5kIGFsbCBvZiBpdHMgZGVzY2VuZGFudHMsXG4gICAgICAgIC8vIHdoZXJlYXMgbW91c2VvdXQgaXMgZmlyZWQgd2hlbiB0aGUgcG9pbnRlciBsZWF2ZXMgdGhlIGVsZW1lbnQgb3IgbGVhdmVzIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRlc2NlbmRhbnRzXG4gICAgICAgIC8vIChldmVuIGlmIHRoZSBwb2ludGVyIGlzIHN0aWxsIHdpdGhpbiB0aGUgZWxlbWVudCkuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbW91c2Vtb3ZlKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2tleXByZXNzL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBtb3VzZW91dCBldmVudCB0byB0aGUgZWxlbWVudC4qL1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBtb3VzZW91dCgpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBtb3VzZW91dGAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIG1vdXNlb3V0KGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBtb3VzZW91dChmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIC8vbW91c2VsZWF2ZSBhbmQgbW91c2VvdXQgYXJlIHNpbWlsYXIgYnV0IGRpZmZlciBpbiB0aGF0IG1vdXNlbGVhdmUgZG9lcyBub3QgYnViYmxlIGFuZCBtb3VzZW91dCBkb2VzLlxuICAgICAgICAvLyBUaGlzIG1lYW5zIHRoYXQgbW91c2VsZWF2ZSBpcyBmaXJlZCB3aGVuIHRoZSBwb2ludGVyIGhhcyBleGl0ZWQgdGhlIGVsZW1lbnQgYW5kIGFsbCBvZiBpdHMgZGVzY2VuZGFudHMsXG4gICAgICAgIC8vIHdoZXJlYXMgbW91c2VvdXQgaXMgZmlyZWQgd2hlbiB0aGUgcG9pbnRlciBsZWF2ZXMgdGhlIGVsZW1lbnQgb3IgbGVhdmVzIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRlc2NlbmRhbnRzXG4gICAgICAgIC8vIChldmVuIGlmIHRoZSBwb2ludGVyIGlzIHN0aWxsIHdpdGhpbiB0aGUgZWxlbWVudCkuXG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBtb3VzZW91dCA6IGZuIH0sIG9wdGlvbnMpXG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEgbW91c2VvdmVyIGV2ZW50IHRvIHRoZSBlbGVtZW50LiovXG4gICAgbW91c2VvdmVyKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYG1vdXNlb3ZlcmAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIG1vdXNlb3ZlcihmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgbW91c2VvdmVyKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgLy8gbW91c2VvdmVyOiBhbHNvIGNoaWxkIGVsZW1lbnRzXG4gICAgICAgIC8vIG1vdXNlZW50ZXI6IG9ubHkgYm91bmQgZWxlbWVudFxuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgbW91c2VvdmVyIDogZm4gfSwgb3B0aW9ucylcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG1vdXNldXAoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICB0cmFuc2Zvcm0ob3B0aW9uczogVHJhbnNmb3JtT3B0aW9ucykge1xuICAgICAgICBsZXQgdHJhbnNmb3JtOiBzdHJpbmcgPSAnJztcbiAgICAgICAgZm9yICggbGV0IFsgaywgdiBdIG9mIGVudW1lcmF0ZShvcHRpb25zKSApIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybSArPSBgJHtrfSgke3Z9KSBgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbih7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbmVuZCA6IHJlc29sdmVcbiAgICAgICAgICAgIH0sIHsgb25jZSA6IHRydWUgfSk7XG4gICAgICAgICAgICB0aGlzLmNzcyh7IHRyYW5zZm9ybSB9KVxuICAgICAgICB9KVxuICAgIH1cbiAgICBcbiAgICAvKiogUmVtb3ZlIHRoZSBldmVudCBsaXN0ZW5lciBvZiBgZXZlbnRgLCBpZiBleGlzdHMuKi9cbiAgICBvZmYoZXZlbnQ6IFRFdmVudCk6IHRoaXMge1xuICAgICAgICB0aGlzLmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcy5fbGlzdGVuZXJzW2V2ZW50XSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBhbGxPZmYoKTogdGhpcyB7XG4gICAgICAgIGZvciAoIGxldCBldmVudCBpbiB0aGlzLl9saXN0ZW5lcnMgKSB7XG4gICAgICAgICAgICB0aGlzLm9mZig8VEV2ZW50PiBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8vICoqKiAgQXR0cmlidXRlc1xuICAgIFxuICAgIC8qKiBGb3IgZWFjaCBgW2F0dHIsIHZhbF1gIHBhaXIsIGFwcGx5IGBzZXRBdHRyaWJ1dGVgKi9cbiAgICBhdHRyKGF0dHJWYWxQYWlyczogVE1hcDxzdHJpbmc+KTogdGhpc1xuICAgIC8qKiBhcHBseSBgZ2V0QXR0cmlidXRlYCovXG4gICAgYXR0cihhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpOiBzdHJpbmdcbiAgICBhdHRyKGF0dHJWYWxQYWlycykge1xuICAgICAgICBpZiAoIHR5cGVvZiBhdHRyVmFsUGFpcnMgPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5nZXRBdHRyaWJ1dGUoYXR0clZhbFBhaXJzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoIGxldCBbIGF0dHIsIHZhbCBdIG9mIGVudW1lcmF0ZShhdHRyVmFsUGFpcnMpIClcbiAgICAgICAgICAgICAgICB0aGlzLmUuc2V0QXR0cmlidXRlKGF0dHIsIHZhbCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKiogYHJlbW92ZUF0dHJpYnV0ZWAgKi9cbiAgICByZW1vdmVBdHRyKHF1YWxpZmllZE5hbWU6IHN0cmluZywgLi4ucXVhbGlmaWVkTmFtZXM6IHN0cmluZ1tdKTogdGhpcyB7XG4gICAgICAgIGxldCBfcmVtb3ZlQXR0cmlidXRlO1xuICAgICAgICBpZiAoIHRoaXMuX2lzU3ZnIClcbiAgICAgICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUgPSAocXVhbGlmaWVkTmFtZSkgPT4gdGhpcy5lLnJlbW92ZUF0dHJpYnV0ZU5TKFNWR19OU19VUkksIHF1YWxpZmllZE5hbWUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBfcmVtb3ZlQXR0cmlidXRlID0gKHF1YWxpZmllZE5hbWUpID0+IHRoaXMuZS5yZW1vdmVBdHRyaWJ1dGUocXVhbGlmaWVkTmFtZSk7XG4gICAgICAgIFxuICAgICAgICBfcmVtb3ZlQXR0cmlidXRlKHF1YWxpZmllZE5hbWUpO1xuICAgICAgICBmb3IgKCBsZXQgcW4gb2YgcXVhbGlmaWVkTmFtZXMgKVxuICAgICAgICAgICAgX3JlbW92ZUF0dHJpYnV0ZShxbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipgZ2V0QXR0cmlidXRlKGBkYXRhLSR7a2V5fWApYC4gSlNPTi5wYXJzZSBpdCBieSBkZWZhdWx0LiovXG4gICAgZGF0YShrZXk6IHN0cmluZywgcGFyc2U6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHwgVE1hcDxzdHJpbmc+IHtcbiAgICAgICAgLy8gVE9ETzoganF1ZXJ5IGRvZXNuJ3QgYWZmZWN0IGRhdGEtKiBhdHRycyBpbiBET00uIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vZGF0YS9cbiAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuZS5nZXRBdHRyaWJ1dGUoYGRhdGEtJHtrZXl9YCk7XG4gICAgICAgIGlmICggcGFyc2UgPT09IHRydWUgKVxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBkYXRhXG4gICAgfVxuICAgIFxuICAgIC8vICoqICBGYWRlXG4gICAgYXN5bmMgZmFkZShkdXI6IG51bWJlciwgdG86IDAgfCAxKTogUHJvbWlzZTx0aGlzPiB7XG4gICAgICAgIGNvbnNvbGUud2FybignZmFkZSwgc2hvdWxkIE5PVCB1c2UnKTtcbiAgICAgICAgY29uc3Qgc3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lKTtcbiAgICAgICAgY29uc3QgdHJhbnNQcm9wID0gc3R5bGVzLnRyYW5zaXRpb25Qcm9wZXJ0eS5zcGxpdCgnLCAnKTtcbiAgICAgICAgY29uc3QgaW5kZXhPZk9wYWNpdHkgPSB0cmFuc1Byb3AuaW5kZXhPZignb3BhY2l0eScpO1xuICAgICAgICAvLyBjc3Mgb3BhY2l0eTowID0+IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTogMHNcbiAgICAgICAgLy8gY3NzIG9wYWNpdHk6NTAwbXMgPT4gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldOiAwLjVzXG4gICAgICAgIC8vIGNzcyBOTyBvcGFjaXR5ID0+IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTogdW5kZWZpbmVkXG4gICAgICAgIGlmICggaW5kZXhPZk9wYWNpdHkgIT09IC0xICkge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNEdXIgPSBzdHlsZXMudHJhbnNpdGlvbkR1cmF0aW9uLnNwbGl0KCcsICcpO1xuICAgICAgICAgICAgY29uc3Qgb3BhY2l0eVRyYW5zRHVyID0gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldO1xuICAgICAgICAgICAgY29uc3QgdHJhbnMgPSBzdHlsZXMudHJhbnNpdGlvbi5zcGxpdCgnLCAnKTtcbiAgICAgICAgICAgIC8vIHRyYW5zaXRpb246IG9wYWNpdHkgd2FzIGRlZmluZWQgaW4gY3NzLlxuICAgICAgICAgICAgLy8gc2V0IHRyYW5zaXRpb24gdG8gZHVyLCBzZXQgb3BhY2l0eSB0byAwLCBsZWF2ZSB0aGUgYW5pbWF0aW9uIHRvIG5hdGl2ZSB0cmFuc2l0aW9uLCB3YWl0IGR1ciBhbmQgcmV0dXJuIHRoaXNcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgZmFkZSgke2R1cn0sICR7dG99KSwgb3BhY2l0eVRyYW5zRHVyICE9PSB1bmRlZmluZWQuIG51bGxpZnlpbmcgdHJhbnNpdGlvbi4gU0hPVUxEIE5PVCBXT1JLYCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgdHJhbnM6XFx0JHt0cmFuc31cXG50cmFuc1Byb3A6XFx0JHt0cmFuc1Byb3B9XFxuaW5kZXhPZk9wYWNpdHk6XFx0JHtpbmRleE9mT3BhY2l0eX1cXG5vcGFjaXR5VHJhbnNEdXI6XFx0JHtvcGFjaXR5VHJhbnNEdXJ9YCk7XG4gICAgICAgICAgICAvLyB0cmFucy5zcGxpY2UoaW5kZXhPZk9wYWNpdHksIDEsIGBvcGFjaXR5ICR7ZHVyIC8gMTAwMH1zYCk7XG4gICAgICAgICAgICB0cmFucy5zcGxpY2UoaW5kZXhPZk9wYWNpdHksIDEsIGBvcGFjaXR5IDBzYCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgYWZ0ZXIsIHRyYW5zOiAke3RyYW5zfWApO1xuICAgICAgICAgICAgdGhpcy5lLnN0eWxlLnRyYW5zaXRpb24gPSB0cmFucy5qb2luKCcsICcpO1xuICAgICAgICAgICAgdGhpcy5jc3MoeyBvcGFjaXR5IDogdG8gfSk7XG4gICAgICAgICAgICBhd2FpdCB3YWl0KGR1cik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICAvLyB0cmFuc2l0aW9uOiBvcGFjaXR5IHdhcyBOT1QgZGVmaW5lZCBpbiBjc3MuXG4gICAgICAgIGlmICggZHVyID09IDAgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jc3MoeyBvcGFjaXR5IDogdG8gfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXNGYWRlT3V0ID0gdG8gPT09IDA7XG4gICAgICAgIGxldCBvcGFjaXR5ID0gcGFyc2VGbG9hdCh0aGlzLmUuc3R5bGUub3BhY2l0eSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIG9wYWNpdHkgPT09IHVuZGVmaW5lZCB8fCBpc05hTihvcGFjaXR5KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgZmFkZSgke2R1cn0sICR7dG99KSBodG1sRWxlbWVudCBoYXMgTk8gb3BhY2l0eSBhdCBhbGwuIHJlY3Vyc2luZ2AsIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5LFxuICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNzcyh7IG9wYWNpdHkgOiBNYXRoLmFicygxIC0gdG8pIH0pLmZhZGUoZHVyLCB0bylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCBpc0ZhZGVPdXQgPyBvcGFjaXR5IDw9IDAgOiBvcGFjaXR5ID4gMSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYGZhZGUoJHtkdXJ9LCAke3RvfSkgb3BhY2l0eSB3YXMgYmV5b25kIHRhcmdldCBvcGFjaXR5LiByZXR1cm5pbmcgdGhpcyBhcyBpcy5gLCB7XG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxldCBzdGVwcyA9IDMwO1xuICAgICAgICBsZXQgb3BTdGVwID0gMSAvIHN0ZXBzO1xuICAgICAgICBsZXQgZXZlcnltcyA9IGR1ciAvIHN0ZXBzO1xuICAgICAgICBpZiAoIGV2ZXJ5bXMgPCAxICkge1xuICAgICAgICAgICAgZXZlcnltcyA9IDE7XG4gICAgICAgICAgICBzdGVwcyA9IGR1cjtcbiAgICAgICAgICAgIG9wU3RlcCA9IDEgLyBzdGVwcztcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgZmFkZSgke2R1cn0sICR7dG99KSBoYWQgb3BhY2l0eSwgbm8gdHJhbnNpdGlvbi4gKGdvb2QpIG9wYWNpdHk6ICR7b3BhY2l0eX1gLCB7XG4gICAgICAgICAgICBzdGVwcyxcbiAgICAgICAgICAgIG9wU3RlcCxcbiAgICAgICAgICAgIGV2ZXJ5bXNcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlYWNoZWRUbyA9IGlzRmFkZU91dCA/IChvcCkgPT4gb3AgLSBvcFN0ZXAgPiAwIDogKG9wKSA9PiBvcCArIG9wU3RlcCA8IDE7XG4gICAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCByZWFjaGVkVG8ob3BhY2l0eSkgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBpc0ZhZGVPdXQgPT09IHRydWUgKVxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5IC09IG9wU3RlcDtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHkgKz0gb3BTdGVwO1xuICAgICAgICAgICAgICAgIHRoaXMuY3NzKHsgb3BhY2l0eSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eSA9IHRvO1xuICAgICAgICAgICAgICAgIHRoaXMuY3NzKHsgb3BhY2l0eSB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZXZlcnltcyk7XG4gICAgICAgIGF3YWl0IHdhaXQoZHVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGZhZGVPdXQoZHVyOiBudW1iZXIpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgY29uc29sZS53YXJuKCdmYWRlT3V0LCBzaG91bGQgTk9UIHVzZScpO1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5mYWRlKGR1ciwgMCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGFzeW5jIGZhZGVJbihkdXI6IG51bWJlcik6IFByb21pc2U8dGhpcz4ge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2ZhZGVJbiwgc2hvdWxkIE5PVCB1c2UnKTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZmFkZShkdXIsIDEpO1xuICAgIH1cbiAgICBcbiAgICBcbn1cblxuY2xhc3MgRGl2IGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxEaXZFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhIERpdiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ2RpdicsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgIH1cbn1cblxuY2xhc3MgUGFyYWdyYXBoIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxQYXJhZ3JhcGhFbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxQYXJhZ3JhcGhFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhIFBhcmFncmFwaCBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ3AnLCB0ZXh0LCBjbHMgfSk7XG4gICAgICAgIGlmICggaWQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmlkKGlkKTtcbiAgICB9XG59XG5cbmNsYXNzIFNwYW4gZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTFNwYW5FbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxTcGFuRWxlbWVudDtcbiAgICBcbiAgICAvKipDcmVhdGUgYSBTcGFuIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCB0ZXh0LCBjbHMgfTogU3ViRWxlbUNvbnN0cnVjdG9yID0ge30pIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnc3BhbicsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBcbiAgICB9XG59XG5cbmNsYXNzIEltZyBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhbiBJbWcgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCBzcmMgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgc3JjLCBjbHMgfTogSW1nQ29uc3RydWN0b3IpIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnaW1nJywgY2xzIH0pO1xuICAgICAgICBpZiAoIGlkICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5pZChpZCk7XG4gICAgICAgIGlmICggc3JjICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuc3JjID0gc3JjO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgc3JjKHNyYzogc3RyaW5nKTogdGhpcztcbiAgICBzcmMoKTogc3RyaW5nO1xuICAgIHNyYyhzcmM/KSB7XG4gICAgICAgIGlmICggc3JjID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQuc3JjXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5zcmMgPSBzcmM7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZWFkb25seSBlOiBIVE1MSW1hZ2VFbGVtZW50O1xufVxuXG5jbGFzcyBBbmNob3IgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTEFuY2hvckVsZW1lbnQ7XG4gICAgcmVhZG9ubHkgZTogSFRNTEFuY2hvckVsZW1lbnQ7XG4gICAgXG4gICAgLyoqQ3JlYXRlIGFuIEFuY2hvciBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQsIGhyZWYgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzLCBocmVmIH06IEFuY2hvckNvbnN0cnVjdG9yID0ge30pIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnYScsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBpZiAoIGhyZWYgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmhyZWYoaHJlZilcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGhyZWYoKTogc3RyaW5nXG4gICAgaHJlZih2YWw6IHN0cmluZyk6IHRoaXNcbiAgICBocmVmKHZhbD8pIHtcbiAgICAgICAgaWYgKCB2YWwgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdocmVmJyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoeyBocmVmIDogdmFsIH0pXG4gICAgfVxuICAgIFxuICAgIHRhcmdldCgpOiBzdHJpbmdcbiAgICB0YXJnZXQodmFsOiBzdHJpbmcpOiB0aGlzXG4gICAgdGFyZ2V0KHZhbD8pIHtcbiAgICAgICAgaWYgKCB2YWwgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd0YXJnZXQnKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cih7IHRhcmdldCA6IHZhbCB9KVxuICAgIH1cbn1cblxuLypjbGFzcyBTdmcgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudHtcbiBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBTVkdFbGVtZW50O1xuIGNvbnN0cnVjdG9yKHtpZCwgY2xzLGh0bWxFbGVtZW50fTogU3ZnQ29uc3RydWN0b3IpIHtcbiBzdXBlcih7dGFnOiAnc3ZnJywgY2xzfSk7XG4gaWYgKGlkKVxuIHRoaXMuaWQoaWQpO1xuIGlmIChzcmMpXG4gdGhpcy5faHRtbEVsZW1lbnQuc3JjID0gc3JjO1xuIFxuIH1cbiB9XG4gKi9cbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWh0bWwtZWxlbWVudCcsIEJldHRlckhUTUxFbGVtZW50KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWRpdicsIERpdiwgeyBleHRlbmRzIDogJ2RpdicgfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1wJywgUGFyYWdyYXBoLCB7IGV4dGVuZHMgOiAncCcgfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1zcGFuJywgU3BhbiwgeyBleHRlbmRzIDogJ3NwYW4nIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItaW1nJywgSW1nLCB7IGV4dGVuZHMgOiAnaW1nJyB9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWEnLCBBbmNob3IsIHsgZXh0ZW5kcyA6ICdhJyB9KTtcblxuLy8gY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItc3ZnJywgU3ZnLCB7ZXh0ZW5kczogJ3N2Zyd9KTtcblxuLyoqQ3JlYXRlIGFuIGVsZW1lbnQgb2YgYHRhZ2AuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgIGFuZCAvIG9yIGBjbHNgKi9cbmZ1bmN0aW9uIGVsZW0oeyB0YWcsIHRleHQsIGNscyB9OiB7IHRhZzogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbi8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBpZGAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbmZ1bmN0aW9uIGVsZW0oeyBpZCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGlkOiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTogQmV0dGVySFRNTEVsZW1lbnQ7XG4vKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgcXVlcnlgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG5mdW5jdGlvbiBlbGVtKHsgcXVlcnksIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBxdWVyeTogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbi8qKldyYXAgYW4gZXhpc3RpbmcgSFRNTEVsZW1lbnQuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbmZ1bmN0aW9uIGVsZW0oeyBodG1sRWxlbWVudCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGh0bWxFbGVtZW50OiBIVE1MRWxlbWVudCwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbmZ1bmN0aW9uIGVsZW0oZWxlbU9wdGlvbnMpOiBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIG5ldyBCZXR0ZXJIVE1MRWxlbWVudChlbGVtT3B0aW9ucyk7XG59XG5cbi8qKkNyZWF0ZSBhbiBTcGFuIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbmZ1bmN0aW9uIHNwYW4oeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogU3BhbiB7XG4gICAgcmV0dXJuIG5ldyBTcGFuKHsgaWQsIHRleHQsIGNscyB9KTtcbn1cblxuLyoqQ3JlYXRlIGFuIERpdiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG5mdW5jdGlvbiBkaXYoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogRGl2IHtcbiAgICByZXR1cm4gbmV3IERpdih7IGlkLCB0ZXh0LCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhbiBJbWcgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCBzcmMgb3IgY2xzLiovXG5mdW5jdGlvbiBpbWcoeyBpZCwgc3JjLCBjbHMgfTogSW1nQ29uc3RydWN0b3IgPSB7fSk6IEltZyB7XG4gICAgcmV0dXJuIG5ldyBJbWcoeyBpZCwgc3JjLCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhIFBhcmFncmFwaCBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG5mdW5jdGlvbiBwYXJhZ3JhcGgoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogUGFyYWdyYXBoIHtcbiAgICByZXR1cm4gbmV3IFBhcmFncmFwaCh7IGlkLCB0ZXh0LCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhbiBBbmNob3IgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0LCBocmVmIG9yIGNscy4qL1xuZnVuY3Rpb24gYW5jaG9yKHsgaWQsIHRleHQsIGNscywgaHJlZiB9OiBBbmNob3JDb25zdHJ1Y3RvciA9IHt9KTogQW5jaG9yIHtcbiAgICByZXR1cm4gbmV3IEFuY2hvcih7IGlkLCB0ZXh0LCBjbHMsIGhyZWYgfSk7XG59XG5cblxuZXhwb3J0IHsgZWxlbSwgc3BhbiwgZGl2LCBpbWcsIHBhcmFncmFwaCwgYW5jaG9yLCBCZXR0ZXJIVE1MRWxlbWVudCB9XG4iXX0=