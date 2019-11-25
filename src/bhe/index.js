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
class Input extends BetterHTMLElement {
    constructor({ id, text, cls, placeholder, type } = {}) {
        super({ tag: 'input', text, cls });
        if (id !== undefined)
            this.id(id);
        if (placeholder !== undefined)
            this.attr({ placeholder, type: (type !== null && type !== void 0 ? type : 'text') });
    }
    get value() {
        return this.e.value;
    }
    set value(val) {
        this.e.value = val;
    }
}
exports.Input = Input;
customElements.define('better-html-element', BetterHTMLElement);
customElements.define('better-div', Div, { extends: 'div' });
customElements.define('better-p', Paragraph, { extends: 'p' });
customElements.define('better-span', Span, { extends: 'span' });
customElements.define('better-img', Img, { extends: 'img' });
customElements.define('better-a', Anchor, { extends: 'a' });
customElements.define('better-button', Button, { extends: 'button' });
customElements.define('better-input', Input, { extends: 'input' });
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
function input({ id, text, cls, placeholder, type } = {}) {
    return new Input({ id, text, cls, placeholder, type });
}
exports.input = input;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtDQUFzRTtBQUV0RSxNQUFNLFVBQVUsR0FBRyw0QkFBNEIsQ0FBQztBQUloRCxNQUFNLGlCQUFpQjtJQStCbkIsWUFBWSxXQUFXO1FBN0JOLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFDeEIsZUFBVSxHQUE4QixFQUFFLENBQUM7UUFDcEQsb0JBQWUsR0FBNEIsRUFBRSxDQUFDO1FBNEJsRCxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsV0FBVyxDQUFDO1FBRXpFLElBQUssQ0FBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRztZQUMzRSxNQUFNLElBQUksdUJBQXVCLENBQUMsQ0FBQyxFQUFFO2dCQUNqQyxHQUFHO2dCQUNILEVBQUU7Z0JBQ0YsV0FBVztnQkFDWCxLQUFLO2FBQ1IsQ0FBQyxDQUFBO1NBRUw7UUFDRCxJQUFLLEdBQUcsS0FBSyxTQUFTLElBQUksUUFBUSxLQUFLLFNBQVM7WUFDNUMsTUFBTSxJQUFJLHVCQUF1QixDQUFDLENBQUMsRUFBRTtnQkFDakMsR0FBRztnQkFDSCxRQUFRO2FBQ1gsRUFBRSwrSUFBK0ksQ0FBQyxDQUFDO1FBRXhKLElBQUssR0FBRyxLQUFLLFNBQVMsRUFBRztZQUNyQixJQUFLLENBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRztnQkFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxZQUFZ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QUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUMzRCxDQUFDO0FBRXlELHNCQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYm9vbCwgZW51bWVyYXRlLCBpc0Z1bmN0aW9uLCBpc09iamVjdCwgd2FpdCB9IGZyb20gXCIuLi91dGlsXCI7XG5cbmNvbnN0IFNWR19OU19VUkkgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuXG4vLyBUT0RPOiBtYWtlIEJldHRlckhUTUxFbGVtZW50PFQ+LCBmb3IgdXNlIGluIGVnIGNoaWxkW3Jlbl0gZnVuY3Rpb25cbi8vIGV4dGVuZHMgSFRNTEVsZW1lbnQ6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FbGVtZW50UmVnaXN0cnkvdXBncmFkZSNFeGFtcGxlc1xuY2xhc3MgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCBfaHRtbEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2lzU3ZnOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfbGlzdGVuZXJzOiBURXZlbnRGdW5jdGlvbk1hcDxURXZlbnQ+ID0ge307XG4gICAgcHJpdmF0ZSBfY2FjaGVkQ2hpbGRyZW46IFRNYXA8QmV0dGVySFRNTEVsZW1lbnQ+ID0ge307XG4gICAgXG4gICAgLypbU3ltYm9sLnRvUHJpbWl0aXZlXShoaW50KSB7XG4gICAgIGNvbnNvbGUubG9nKCdmcm9tIHRvUHJpbWl0aXZlLCBoaW50OiAnLCBoaW50LCAnXFxudGhpczogJywgdGhpcyk7XG4gICAgIHJldHVybiB0aGlzLl9odG1sRWxlbWVudDtcbiAgICAgfVxuICAgICBcbiAgICAgdmFsdWVPZigpIHtcbiAgICAgY29uc29sZS5sb2coJ2Zyb20gdmFsdWVPZiwgdGhpczogJywgdGhpcyk7XG4gICAgIHJldHVybiB0aGlzO1xuICAgICB9XG4gICAgIFxuICAgICB0b1N0cmluZygpIHtcbiAgICAgY29uc29sZS5sb2coJ2Zyb20gdG9TdHJpbmcsIHRoaXM6ICcsIHRoaXMpO1xuICAgICByZXR1cm4gdGhpcztcbiAgICAgfVxuICAgICAqL1xuICAgIFxuICAgIC8vIFRPRE86IHF1ZXJ5IHNob3VsZCBhbHNvIGJlIGEgcHJlZGljYXRlIGZ1bmN0aW9uXG4gICAgLyoqQ3JlYXRlIGFuIGVsZW1lbnQgb2YgYHRhZ2AuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgIGFuZCAvIG9yIGBjbHNgKi9cbiAgICBjb25zdHJ1Y3Rvcih7IHRhZywgdGV4dCwgY2xzIH06IHsgdGFnOiBRdWVyeVNlbGVjdG9yLCB0ZXh0Pzogc3RyaW5nLCBjbHM/OiBzdHJpbmcgfSk7XG4gICAgLyoqR2V0IGFuIGV4aXN0aW5nIGVsZW1lbnQgYnkgYGlkYC4gT3B0aW9uYWxseSwgc2V0IGl0cyBgdGV4dGAsIGBjbHNgIG9yIGNhY2hlIGBjaGlsZHJlbmAqL1xuICAgIGNvbnN0cnVjdG9yKHsgaWQsIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBpZDogc3RyaW5nLCB0ZXh0Pzogc3RyaW5nLCBjbHM/OiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk7XG4gICAgLyoqR2V0IGFuIGV4aXN0aW5nIGVsZW1lbnQgYnkgYHF1ZXJ5YC4gT3B0aW9uYWxseSwgc2V0IGl0cyBgdGV4dGAsIGBjbHNgIG9yIGNhY2hlIGBjaGlsZHJlbmAqL1xuICAgIGNvbnN0cnVjdG9yKHsgcXVlcnksIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBxdWVyeTogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIC8qKldyYXAgYW4gZXhpc3RpbmcgSFRNTEVsZW1lbnQuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGh0bWxFbGVtZW50LCB0ZXh0LCBjbHMsIGNoaWxkcmVuIH06IHsgaHRtbEVsZW1lbnQ6IEhUTUxFbGVtZW50LCB0ZXh0Pzogc3RyaW5nLCBjbHM/OiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk7XG4gICAgY29uc3RydWN0b3IoZWxlbU9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgeyB0YWcsIGlkLCBodG1sRWxlbWVudCwgdGV4dCwgcXVlcnksIGNoaWxkcmVuLCBjbHMgfSA9IGVsZW1PcHRpb25zO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBbIHRhZywgaWQsIGh0bWxFbGVtZW50LCBxdWVyeSBdLmZpbHRlcih4ID0+IHggIT09IHVuZGVmaW5lZCkubGVuZ3RoID4gMSApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBCYWRBcmd1bWVudHNBbW91bnRFcnJvcigxLCB7XG4gICAgICAgICAgICAgICAgdGFnLFxuICAgICAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgICAgIGh0bWxFbGVtZW50LFxuICAgICAgICAgICAgICAgIHF1ZXJ5XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgaWYgKCB0YWcgIT09IHVuZGVmaW5lZCAmJiBjaGlsZHJlbiAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRocm93IG5ldyBCYWRBcmd1bWVudHNBbW91bnRFcnJvcigxLCB7XG4gICAgICAgICAgICAgICAgdGFnLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuXG4gICAgICAgICAgICB9LCAnXCJjaGlsZHJlblwiIGFuZCBcInRhZ1wiIG9wdGlvbnMgYXJlIG11dHVhbGx5IGV4Y2x1c2l2ZSwgYmVjYXVzZSB0YWcgaW1wbGllcyBjcmVhdGluZyBhIG5ldyBlbGVtZW50IGFuZCBjaGlsZHJlbiBpbXBsaWVzIGdldHRpbmcgYW4gZXhpc3Rpbmcgb25lLicpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCB0YWcgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGlmICggWyAnc3ZnJywgJ3BhdGgnIF0uaW5jbHVkZXModGFnLnRvTG93ZXJDYXNlKCkpICkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzU3ZnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlNfVVJJLCB0YWcpO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuX2h0bWxFbGVtZW50LnNldEF0dHJpYnV0ZSgneG1sbnMnLCBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICggaWQgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgICAgICAgICAgaWYgKCAhYm9vbCh0aGlzLl9odG1sRWxlbWVudCkgKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRWxlbSBjb25zdHJ1Y3RvcjogdHJpZWQgdG8gZ2V0IGVsZW1lbnQgYnkgaWQ6IFwiJHtpZH1cIiwgYnV0IG5vIHN1Y2ggZWxlbWVudCBleGlzdHMuYClcbiAgICAgICAgfSBlbHNlIGlmICggcXVlcnkgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihxdWVyeSk7XG4gICAgICAgICAgICBpZiAoICFib29sKHRoaXMuX2h0bWxFbGVtZW50KSApXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFbGVtIGNvbnN0cnVjdG9yOiB0cmllZCB0byBnZXQgZWxlbWVudCBieSBxdWVyeTogXCIke3F1ZXJ5fVwiLCBidXQgbm8gZWxlbWVudCBmb3VuZC5gKVxuICAgICAgICB9IGVsc2UgaWYgKCBodG1sRWxlbWVudCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBodG1sRWxlbWVudDtcbiAgICAgICAgICAgIGlmICggIWJvb2wodGhpcy5faHRtbEVsZW1lbnQpIClcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEVsZW0gY29uc3RydWN0b3I6IHBhc3NlZCBleHBsaWNpdCBodG1sRWxlbWVudCBhcmcsIGJ1dCBhcmcgd2FzIGZhbHNleTogJHtodG1sRWxlbWVudH1gLCBodG1sRWxlbWVudClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBCYWRBcmd1bWVudHNBbW91bnRFcnJvcigxLCB7XG4gICAgICAgICAgICAgICAgdGFnLFxuICAgICAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgICAgIGh0bWxFbGVtZW50LFxuICAgICAgICAgICAgICAgIHF1ZXJ5XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIHRleHQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLnRleHQodGV4dCk7XG4gICAgICAgIGlmICggY2xzICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5jbGFzcyhjbHMpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBjaGlsZHJlbiAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuY2FjaGVDaGlsZHJlbihjaGlsZHJlbik7XG4gICAgICAgIFxuICAgICAgICAvLyBPYmplY3QuYXNzaWduKHRoaXMsIHByb3h5KTtcbiAgICAgICAgLypjb25zdCB0aGF0ID0gdGhpcztcbiAgICAgICAgIHJldHVybiBuZXcgUHJveHkodGhpcywge1xuICAgICAgICAgZ2V0KHRhcmdldDogQmV0dGVySFRNTEVsZW1lbnQsIHA6IHN0cmluZyB8IG51bWJlciB8IHN5bWJvbCwgcmVjZWl2ZXI6IGFueSk6IGFueSB7XG4gICAgICAgICAvLyBjb25zb2xlLmxvZygnbG9nZ2luZycpO1xuICAgICAgICAgLy8gY29uc29sZS5sb2coJ3RhcmdldDogJywgdGFyZ2V0LFxuICAgICAgICAgLy8gICAgICdcXG50aGF0OiAnLCB0aGF0LFxuICAgICAgICAgLy8gICAgICdcXG50eXBlb2YodGhhdCk6ICcsIHR5cGVvZiAodGhhdCksXG4gICAgICAgICAvLyAgICAgJ1xcbnA6ICcsIHAsXG4gICAgICAgICAvLyAgICAgJ1xcbnJlY2VpdmVyOiAnLCByZWNlaXZlcixcbiAgICAgICAgIC8vICAgICAnXFxudGhpczogJywgdGhpcyk7XG4gICAgICAgICByZXR1cm4gdGhhdFtwXTtcbiAgICAgICAgIH1cbiAgICAgICAgIH0pXG4gICAgICAgICAqL1xuICAgIH1cbiAgICBcbiAgICAvKipSZXR1cm4gdGhlIHdyYXBwZWQgSFRNTEVsZW1lbnQqL1xuICAgIGdldCBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQ7XG4gICAgfVxuICAgIFxuICAgIC8qKlNldHMgYHRoaXMuX2h0bWxFbGVtZW50YCB0byBgbmV3SHRtbEVsZW1lbnQuX2h0bWxFbGVtZW50YC5cbiAgICAgKiBSZXNldHMgYHRoaXMuX2NhY2hlZENoaWxkcmVuYCBhbmQgY2FjaGVzIGBuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW5gLlxuICAgICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIGZyb20gYG5ld0h0bWxFbGVtZW50Ll9saXN0ZW5lcnNgLCB3aGlsZSBrZWVwaW5nIGB0aGlzLl9saXN0ZW5lcnNgLiovXG4gICAgd3JhcFNvbWV0aGluZ0Vsc2UobmV3SHRtbEVsZW1lbnQ6IEJldHRlckhUTUxFbGVtZW50KTogdGhpc1xuICAgIC8qKlNldHMgYHRoaXMuX2h0bWxFbGVtZW50YCB0byBgbmV3SHRtbEVsZW1lbnRgLlxuICAgICAqIEtlZXBzIGB0aGlzLl9saXN0ZW5lcnNgLlxuICAgICAqIE5PVEU6IHRoaXMgcmVpbml0aWFsaXplcyBgdGhpcy5fY2FjaGVkQ2hpbGRyZW5gIGFuZCBhbGwgZXZlbnQgbGlzdGVuZXJzIGJlbG9uZ2luZyB0byBgbmV3SHRtbEVsZW1lbnRgIGFyZSBsb3N0LiBQYXNzIGEgYEJldHRlckhUTUxFbGVtZW50YCB0byBrZWVwIHRoZW0uKi9cbiAgICB3cmFwU29tZXRoaW5nRWxzZShuZXdIdG1sRWxlbWVudDogTm9kZSk6IHRoaXNcbiAgICB3cmFwU29tZXRoaW5nRWxzZShuZXdIdG1sRWxlbWVudCkge1xuICAgICAgICB0aGlzLl9jYWNoZWRDaGlsZHJlbiA9IHt9O1xuICAgICAgICBpZiAoIG5ld0h0bWxFbGVtZW50IGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5yZXBsYWNlV2l0aChuZXdIdG1sRWxlbWVudC5lKTtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gbmV3SHRtbEVsZW1lbnQuZTtcbiAgICAgICAgICAgIGZvciAoIGxldCBbIF9rZXksIF9jYWNoZWRDaGlsZCBdIG9mIGVudW1lcmF0ZShuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW4pICkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlKF9rZXkgYXMgc3RyaW5nLCBfY2FjaGVkQ2hpbGQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXModGhpcy5fY2FjaGVkQ2hpbGRyZW4pLmxlbmd0aFxuICAgICAgICAgICAgICAgICE9PSBPYmplY3Qua2V5cyhuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW4pLmxlbmd0aFxuICAgICAgICAgICAgICAgIHx8XG4gICAgICAgICAgICAgICAgT2JqZWN0LnZhbHVlcyh0aGlzLl9jYWNoZWRDaGlsZHJlbikuZmlsdGVyKHYgPT4gdiAhPT0gdW5kZWZpbmVkKS5sZW5ndGhcbiAgICAgICAgICAgICAgICAhPT0gT2JqZWN0LnZhbHVlcyhuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW4pLmZpbHRlcih2ID0+IHYgIT09IHVuZGVmaW5lZCkubGVuZ3RoXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHdyYXBTb21ldGhpbmdFbHNlIHRoaXMuX2NhY2hlZENoaWxkcmVuIGxlbmd0aCAhPT0gbmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuLmxlbmd0aGAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3SHRtbEVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub24oeyAuLi50aGlzLl9saXN0ZW5lcnMsIC4uLm5ld0h0bWxFbGVtZW50Ll9saXN0ZW5lcnMsIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm8gd2F5IHRvIGdldCBuZXdIdG1sRWxlbWVudCBldmVudCBsaXN0ZW5lcnMgYmVzaWRlcyBoYWNraW5nIEVsZW1lbnQucHJvdG90eXBlXG4gICAgICAgICAgICB0aGlzLm9uKHRoaXMuX2xpc3RlbmVycyk7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5yZXBsYWNlV2l0aChuZXdIdG1sRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IG5ld0h0bWxFbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLy8gKioqICBCYXNpY1xuICAgIC8qKlNldCB0aGUgZWxlbWVudCdzIGlubmVySFRNTCovXG4gICAgaHRtbChodG1sOiBzdHJpbmcpOiB0aGlzO1xuICAgIC8qKkdldCB0aGUgZWxlbWVudCdzIGlubmVySFRNTCovXG4gICAgaHRtbCgpOiBzdHJpbmc7XG4gICAgaHRtbChodG1sPykge1xuICAgICAgICBpZiAoIGh0bWwgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuaW5uZXJIVE1MO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipTZXQgdGhlIGVsZW1lbnQncyBpbm5lclRleHQqL1xuICAgIHRleHQodHh0OiBzdHJpbmcgfCBudW1iZXIpOiB0aGlzO1xuICAgIC8qKkdldCB0aGUgZWxlbWVudCdzIGlubmVyVGV4dCovXG4gICAgdGV4dCgpOiBzdHJpbmc7XG4gICAgdGV4dCh0eHQ/KSB7XG4gICAgICAgIGlmICggdHh0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLmlubmVyVGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZS5pbm5lclRleHQgPSB0eHQ7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqU2V0IHRoZSBpZCBvZiB0aGUgZWxlbWVudCovXG4gICAgaWQoaWQ6IHN0cmluZyk6IHRoaXM7XG4gICAgLyoqR2V0IHRoZSBpZCBvZiB0aGUgZWxlbWVudCovXG4gICAgaWQoKTogc3RyaW5nO1xuICAgIGlkKGlkPykge1xuICAgICAgICBpZiAoIGlkID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLmlkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lLmlkID0gaWQ7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipGb3IgZWFjaCBgezxzdHlsZUF0dHI+OiA8c3R5bGVWYWw+fWAgcGFpciwgc2V0IHRoZSBgc3R5bGVbc3R5bGVBdHRyXWAgdG8gYHN0eWxlVmFsYC4qL1xuICAgIGNzcyhjc3M6IFBhcnRpYWw8Q3NzT3B0aW9ucz4pOiB0aGlzXG4gICAgLyoqR2V0IGBzdHlsZVtjc3NdYCovXG4gICAgY3NzKGNzczogc3RyaW5nKTogc3RyaW5nXG4gICAgY3NzKGNzcykge1xuICAgICAgICBpZiAoIHR5cGVvZiBjc3MgPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5zdHlsZVtjc3NdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICggbGV0IFsgc3R5bGVBdHRyLCBzdHlsZVZhbCBdIG9mIGVudW1lcmF0ZShjc3MpIClcbiAgICAgICAgICAgICAgICB0aGlzLmUuc3R5bGVbPHN0cmluZz4gc3R5bGVBdHRyXSA9IHN0eWxlVmFsO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqUmVtb3ZlIHRoZSB2YWx1ZSBvZiB0aGUgcGFzc2VkIHN0eWxlIHByb3BlcnRpZXMqL1xuICAgIHVuY3NzKC4uLnJlbW92ZVByb3BzOiAoa2V5b2YgQ3NzT3B0aW9ucylbXSk6IHRoaXMge1xuICAgICAgICBsZXQgY3NzID0ge307XG4gICAgICAgIGZvciAoIGxldCBwcm9wIG9mIHJlbW92ZVByb3BzIClcbiAgICAgICAgICAgIGNzc1twcm9wXSA9ICcnO1xuICAgICAgICByZXR1cm4gdGhpcy5jc3MoY3NzKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGlzKGVsZW1lbnQ6IEJldHRlckhUTUxFbGVtZW50KSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vaXMvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKTtcbiAgICB9XG4gICAgXG4gICAgLypcbiAgICAgYW5pbWF0ZShvcHRzOiBBbmltYXRlT3B0aW9ucykge1xuICAgICAvLyBzZWU6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9DU1NfQW5pbWF0aW9ucy9UaXBzXG4gICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgIH1cbiAgICAgKi9cbiAgICBcbiAgICAvLyAqKiogIENsYXNzZXNcbiAgICAvKipgLmNsYXNzTmFtZSA9IGNsc2AqL1xuICAgIGNsYXNzKGNsczogc3RyaW5nKTogdGhpcztcbiAgICAvKipSZXR1cm4gdGhlIGZpcnN0IGNsYXNzIHRoYXQgbWF0Y2hlcyBgY2xzYCBwcmVkaWNhdGUuKi9cbiAgICBjbGFzcyhjbHM6IFRSZXR1cm5Cb29sZWFuKTogc3RyaW5nO1xuICAgIC8qKlJldHVybiBhIHN0cmluZyBhcnJheSBvZiB0aGUgZWxlbWVudCdzIGNsYXNzZXMgKG5vdCBhIGNsYXNzTGlzdCkqL1xuICAgIGNsYXNzKCk6IHN0cmluZ1tdO1xuICAgIGNsYXNzKGNscz8pIHtcbiAgICAgICAgaWYgKCBjbHMgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuZS5jbGFzc0xpc3QpO1xuICAgICAgICB9IGVsc2UgaWYgKCBpc0Z1bmN0aW9uKGNscykgKSB7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmUuY2xhc3NMaXN0KS5maW5kKGNscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIHRoaXMuX2lzU3ZnICkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNDb25zdGFudFJlYXNzaWdubWVudFxuICAgICAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QgPSBbIGNscyBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmUuY2xhc3NOYW1lID0gY2xzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYWRkQ2xhc3MoY2xzOiBzdHJpbmcsIC4uLmNsc2VzOiBzdHJpbmdbXSk6IHRoaXMge1xuICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LmFkZChjbHMpO1xuICAgICAgICBmb3IgKCBsZXQgYyBvZiBjbHNlcyApXG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LmFkZChjKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHJlbW92ZUNsYXNzKGNsczogVFJldHVybkJvb2xlYW4pOiB0aGlzO1xuICAgIHJlbW92ZUNsYXNzKGNsczogc3RyaW5nLCAuLi5jbHNlczogc3RyaW5nW10pOiB0aGlzO1xuICAgIHJlbW92ZUNsYXNzKGNscywgLi4uY2xzZXMpIHtcbiAgICAgICAgaWYgKCBpc0Z1bmN0aW9uPGJvb2xlYW4+KGNscykgKSB7XG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzKGNscykpO1xuICAgICAgICAgICAgaWYgKCBib29sKGNsc2VzKSApXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdyZW1vdmVDbGFzcywgY2xzIGlzIFRSZXR1cm5Cb29sZWFuLCBnb3QgLi4uY2xzZXMgYnV0IHNob3VsZG50IGhhdmUnKVxuICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnJlbW92ZShjbHMpO1xuICAgICAgICAgICAgZm9yICggbGV0IGMgb2YgY2xzZXMgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QucmVtb3ZlKGMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICByZXBsYWNlQ2xhc3Mob2xkVG9rZW46IFRSZXR1cm5Cb29sZWFuLCBuZXdUb2tlbjogc3RyaW5nKTogdGhpcztcbiAgICByZXBsYWNlQ2xhc3Mob2xkVG9rZW46IHN0cmluZywgbmV3VG9rZW46IHN0cmluZyk6IHRoaXNcbiAgICByZXBsYWNlQ2xhc3Mob2xkVG9rZW4sIG5ld1Rva2VuKSB7XG4gICAgICAgIGlmICggaXNGdW5jdGlvbjxib29sZWFuPihvbGRUb2tlbikgKSB7XG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnJlcGxhY2UodGhpcy5jbGFzcyhvbGRUb2tlbiksIG5ld1Rva2VuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QucmVwbGFjZShvbGRUb2tlbiwgbmV3VG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICB0b2dnbGVDbGFzcyhjbHM6IFRSZXR1cm5Cb29sZWFuLCBmb3JjZT86IGJvb2xlYW4pOiB0aGlzXG4gICAgdG9nZ2xlQ2xhc3MoY2xzOiBzdHJpbmcsIGZvcmNlPzogYm9vbGVhbik6IHRoaXNcbiAgICB0b2dnbGVDbGFzcyhjbHMsIGZvcmNlKSB7XG4gICAgICAgIGlmICggaXNGdW5jdGlvbjxib29sZWFuPihjbHMpIClcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuY2xhc3MoY2xzKSwgZm9yY2UpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnRvZ2dsZShjbHMsIGZvcmNlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKlJldHVybnMgYHRoaXMuZS5jbGFzc0xpc3QuY29udGFpbnMoY2xzKWAgKi9cbiAgICBoYXNDbGFzcyhjbHM6IHN0cmluZyk6IGJvb2xlYW5cbiAgICAvKipSZXR1cm5zIHdoZXRoZXIgYHRoaXNgIGhhcyBhIGNsYXNzIHRoYXQgbWF0Y2hlcyBwYXNzZWQgZnVuY3Rpb24gKi9cbiAgICBoYXNDbGFzcyhjbHM6IFRSZXR1cm5Cb29sZWFuKTogYm9vbGVhblxuICAgIGhhc0NsYXNzKGNscykge1xuICAgICAgICBpZiAoIGlzRnVuY3Rpb248Ym9vbGVhbj4oY2xzKSApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsYXNzKGNscykgIT09IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuY2xhc3NMaXN0LmNvbnRhaW5zKGNscyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gKioqICBOb2Rlc1xuICAgIC8qKkluc2VydCBhdCBsZWFzdCBvbmUgYG5vZGVgIGp1c3QgYWZ0ZXIgYHRoaXNgLiBBbnkgYG5vZGVgIGNhbiBiZSBlaXRoZXIgYEJldHRlckhUTUxFbGVtZW50YHMgb3IgdmFuaWxsYSBgTm9kZWAuKi9cbiAgICBhZnRlciguLi5ub2RlczogQXJyYXk8QmV0dGVySFRNTEVsZW1lbnQgfCBOb2RlPik6IHRoaXMge1xuICAgICAgICBmb3IgKCBsZXQgbm9kZSBvZiBub2RlcyApIHtcbiAgICAgICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgICAgICB0aGlzLmUuYWZ0ZXIobm9kZS5lKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmUuYWZ0ZXIobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKkluc2VydCBgdGhpc2AganVzdCBhZnRlciBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgb3IgYSB2YW5pbGxhIGBOb2RlYC4qL1xuICAgIGluc2VydEFmdGVyKG5vZGU6IEJldHRlckhUTUxFbGVtZW50IHwgSFRNTEVsZW1lbnQpOiB0aGlzIHtcbiAgICAgICAgaWYgKCBub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKVxuICAgICAgICAgICAgbm9kZS5lLmFmdGVyKHRoaXMuZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5vZGUuYWZ0ZXIodGhpcy5lKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKkluc2VydCBhdCBsZWFzdCBvbmUgYG5vZGVgIGFmdGVyIHRoZSBsYXN0IGNoaWxkIG9mIGB0aGlzYC5cbiAgICAgKiBBbnkgYG5vZGVgIGNhbiBiZSBlaXRoZXIgYSBgQmV0dGVySFRNTEVsZW1lbnRgLCBhIHZhbmlsbGEgYE5vZGVgLFxuICAgICAqIGEgYHtzb21lS2V5OiBCZXR0ZXJIVE1MRWxlbWVudH1gIHBhaXJzIG9iamVjdCwgb3IgYSBgW3NvbWVLZXksIEJldHRlckhUTUxFbGVtZW50XWAgdHVwbGUuKi9cbiAgICBhcHBlbmQoLi4ubm9kZXM6IEFycmF5PEJldHRlckhUTUxFbGVtZW50IHwgTm9kZSB8IFRNYXA8QmV0dGVySFRNTEVsZW1lbnQ+IHwgWyBzdHJpbmcsIEJldHRlckhUTUxFbGVtZW50IF0+KTogdGhpcyB7XG4gICAgICAgIGZvciAoIGxldCBub2RlIG9mIG5vZGVzICkge1xuICAgICAgICAgICAgaWYgKCBub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5hcHBlbmQobm9kZS5lKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKCBub2RlIGluc3RhbmNlb2YgTm9kZSApXG4gICAgICAgICAgICAgICAgdGhpcy5lLmFwcGVuZChub2RlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKCBBcnJheS5pc0FycmF5KG5vZGUpIClcbiAgICAgICAgICAgICAgICB0aGlzLmNhY2hlQXBwZW5kKFsgbm9kZSBdKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmNhY2hlQXBwZW5kKG5vZGUpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKkFwcGVuZCBgdGhpc2AgdG8gYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9yIGEgdmFuaWxsYSBgTm9kZWAqL1xuICAgIGFwcGVuZFRvKG5vZGU6IEJldHRlckhUTUxFbGVtZW50IHwgSFRNTEVsZW1lbnQpOiB0aGlzIHtcbiAgICAgICAgaWYgKCBub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKVxuICAgICAgICAgICAgbm9kZS5lLmFwcGVuZCh0aGlzLmUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBub2RlLmFwcGVuZCh0aGlzLmUpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKkluc2VydCBhdCBsZWFzdCBvbmUgYG5vZGVgIGp1c3QgYmVmb3JlIGB0aGlzYC4gQW55IGBub2RlYCBjYW4gYmUgZWl0aGVyIGBCZXR0ZXJIVE1MRWxlbWVudGBzIG9yIHZhbmlsbGEgYE5vZGVgLiovXG4gICAgYmVmb3JlKC4uLm5vZGVzOiBBcnJheTxCZXR0ZXJIVE1MRWxlbWVudCB8IE5vZGU+KTogdGhpcyB7XG4gICAgICAgIGZvciAoIGxldCBub2RlIG9mIG5vZGVzICkge1xuICAgICAgICAgICAgaWYgKCBub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5iZWZvcmUobm9kZS5lKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmUuYmVmb3JlKG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipJbnNlcnQgYHRoaXNgIGp1c3QgYmVmb3JlIGEgYEJldHRlckhUTUxFbGVtZW50YCBvciBhIHZhbmlsbGEgYE5vZGVgcy4qL1xuICAgIGluc2VydEJlZm9yZShub2RlOiBCZXR0ZXJIVE1MRWxlbWVudCB8IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgIG5vZGUuZS5iZWZvcmUodGhpcy5lKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbm9kZS5iZWZvcmUodGhpcy5lKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIHJlcGxhY2VDaGlsZChuZXdDaGlsZDogTm9kZSwgb2xkQ2hpbGQ6IE5vZGUpOiB0aGlzO1xuICAgIHJlcGxhY2VDaGlsZChuZXdDaGlsZDogQmV0dGVySFRNTEVsZW1lbnQsIG9sZENoaWxkOiBCZXR0ZXJIVE1MRWxlbWVudCk6IHRoaXM7XG4gICAgcmVwbGFjZUNoaWxkKG5ld0NoaWxkLCBvbGRDaGlsZCkge1xuICAgICAgICB0aGlzLmUucmVwbGFjZUNoaWxkKG5ld0NoaWxkLCBvbGRDaGlsZCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIF9jYWNoZShrZXk6IHN0cmluZywgY2hpbGQ6IEJldHRlckhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXNba2V5XSA9IGNoaWxkO1xuICAgICAgICB0aGlzLl9jYWNoZWRDaGlsZHJlbltrZXldID0gY2hpbGQ7XG4gICAgfVxuICAgIFxuICAgIC8qKkZvciBlYWNoIGBba2V5LCBjaGlsZF1gIHBhaXIsIGBhcHBlbmQoY2hpbGQpYCBhbmQgc3RvcmUgaXQgaW4gYHRoaXNba2V5XWAuICovXG4gICAgY2FjaGVBcHBlbmQoa2V5Q2hpbGRQYWlyczogVE1hcDxCZXR0ZXJIVE1MRWxlbWVudD4pOiB0aGlzXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIGNoaWxkXWAgdHVwbGUsIGBhcHBlbmQoY2hpbGQpYCBhbmQgc3RvcmUgaXQgaW4gYHRoaXNba2V5XWAuICovXG4gICAgY2FjaGVBcHBlbmQoa2V5Q2hpbGRQYWlyczogWyBzdHJpbmcsIEJldHRlckhUTUxFbGVtZW50IF1bXSk6IHRoaXNcbiAgICBjYWNoZUFwcGVuZChrZXlDaGlsZFBhaXJzKSB7XG4gICAgICAgIGNvbnN0IF9jYWNoZUFwcGVuZCA9IChfa2V5OiBzdHJpbmcsIF9jaGlsZDogQmV0dGVySFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kKF9jaGlsZCk7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZShfa2V5LCBfY2hpbGQpO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoa2V5Q2hpbGRQYWlycykgKSB7XG4gICAgICAgICAgICBmb3IgKCBsZXQgWyBrZXksIGNoaWxkIF0gb2Yga2V5Q2hpbGRQYWlycyApXG4gICAgICAgICAgICAgICAgX2NhY2hlQXBwZW5kKGtleSwgY2hpbGQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICggbGV0IFsga2V5LCBjaGlsZCBdIG9mIGVudW1lcmF0ZShrZXlDaGlsZFBhaXJzKSApXG4gICAgICAgICAgICAgICAgX2NhY2hlQXBwZW5kKGtleSwgY2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipHZXQgYSBjaGlsZCB3aXRoIGBxdWVyeVNlbGVjdG9yYCBhbmQgcmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBvZiBpdCovXG4gICAgY2hpbGQ8SyBleHRlbmRzIEhUTUxUYWc+KHNlbGVjdG9yOiBLKTogQmV0dGVySFRNTEVsZW1lbnQ7XG4gICAgLyoqR2V0IGEgY2hpbGQgd2l0aCBgcXVlcnlTZWxlY3RvcmAgYW5kIHJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgb2YgaXQqL1xuICAgIGNoaWxkKHNlbGVjdG9yOiBzdHJpbmcpOiBCZXR0ZXJIVE1MRWxlbWVudDtcbiAgICBjaGlsZChzZWxlY3Rvcikge1xuICAgICAgICByZXR1cm4gbmV3IEJldHRlckhUTUxFbGVtZW50KHsgaHRtbEVsZW1lbnQgOiB0aGlzLmUucXVlcnlTZWxlY3RvcihzZWxlY3RvcikgfSk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKlJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgbGlzdCBvZiBhbGwgY2hpbGRyZW4gKi9cbiAgICBjaGlsZHJlbigpOiBCZXR0ZXJIVE1MRWxlbWVudFtdO1xuICAgIC8qKlJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgbGlzdCBvZiBhbGwgY2hpbGRyZW4gc2VsZWN0ZWQgYnkgYHNlbGVjdG9yYCAqL1xuICAgIGNoaWxkcmVuPEsgZXh0ZW5kcyBIVE1MVGFnPihzZWxlY3RvcjogSyk6IEJldHRlckhUTUxFbGVtZW50W107XG4gICAgLyoqUmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBsaXN0IG9mIGFsbCBjaGlsZHJlbiBzZWxlY3RlZCBieSBgc2VsZWN0b3JgICovXG4gICAgY2hpbGRyZW4oc2VsZWN0b3I6IHN0cmluZyB8IEhUTUxUYWcpOiBCZXR0ZXJIVE1MRWxlbWVudFtdO1xuICAgIGNoaWxkcmVuKHNlbGVjdG9yPykge1xuICAgICAgICBsZXQgY2hpbGRyZW5WYW5pbGxhO1xuICAgICAgICBsZXQgY2hpbGRyZW5Db2xsZWN0aW9uO1xuICAgICAgICBpZiAoIHNlbGVjdG9yID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBjaGlsZHJlbkNvbGxlY3Rpb24gPSB0aGlzLmUuY2hpbGRyZW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGlsZHJlbkNvbGxlY3Rpb24gPSB0aGlzLmUucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGRyZW5WYW5pbGxhID0gPEhUTUxFbGVtZW50W10+IEFycmF5LmZyb20oY2hpbGRyZW5Db2xsZWN0aW9uKTtcbiAgICAgICAgY29uc3QgdG9FbGVtID0gKGM6IEhUTUxFbGVtZW50KSA9PiBuZXcgQmV0dGVySFRNTEVsZW1lbnQoeyBodG1sRWxlbWVudCA6IGMgfSk7XG4gICAgICAgIHJldHVybiBjaGlsZHJlblZhbmlsbGEubWFwKHRvRWxlbSk7XG4gICAgfVxuICAgIFxuICAgIGNsb25lKGRlZXA/OiBib29sZWFuKTogQmV0dGVySFRNTEVsZW1lbnQge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBuZXcgQmV0dGVySFRNTEVsZW1lbnQoeyBodG1sRWxlbWVudCA6IHRoaXMuZS5jbG9uZU5vZGUoZGVlcCkgfSk7XG4gICAgfVxuICAgIFxuICAgIC8qKkZvciBlYWNoIGBba2V5LCBzZWxlY3Rvcl1gIHBhaXIsIHdoZXJlIGBzZWxlY3RvcmAgaXMgZWl0aGVyIGFuIGBIVE1MVGFnYCBvciBhIGBzdHJpbmdgLCBnZXQgYHRoaXMuY2hpbGQoc2VsZWN0b3IpYCwgYW5kIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGRpcmVjdGx5XG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7IGlkOiAnbmF2YmFyJyB9KTtcbiAgICAgKiBuYXZiYXIuY2FjaGVDaGlsZHJlbih7IGhvbWU6ICcubmF2YmFyLWl0ZW0taG9tZScsIGFib3V0OiAnLm5hdmJhci1pdGVtLWFib3V0JyB9KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIG5hdmJhci5hYm91dC5jc3MoLi4uKTtcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzaW5nIGBjYWNoZUNoaWxkcmVuYCBpbmRpcmVjdGx5IHRocm91Z2ggYGNoaWxkcmVuYCBjb25zdHJ1Y3RvciBvcHRpb25cbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHsgaWQ6ICduYXZiYXInLCBjaGlsZHJlbjogeyBob21lOiAnLm5hdmJhci1pdGVtLWhvbWUnLCBhYm91dDogJy5uYXZiYXItaXRlbS1hYm91dCcgfX0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogbmF2YmFyLmFib3V0LmNzcyguLi4pO1xuICAgICAqIEBzZWUgdGhpcy5jaGlsZCovXG4gICAgY2FjaGVDaGlsZHJlbihxdWVyeU1hcDogVE1hcDxRdWVyeVNlbGVjdG9yPik6IHRoaXNcbiAgICAvKipGb3IgZWFjaCBgW2tleSwgc2VsZWN0b3JdYCBwYWlyLCB3aGVyZSBgc2VsZWN0b3JgIGlzIGEgcmVjdXJzaXZlIGB7c3Vic2VsZWN0b3I6IGtleVNlbGVjdG9yT2JqfWAgb2JqZWN0LFxuICAgICAqIGV4dHJhY3QgYHRoaXMuY2hpbGQoc3Vic2VsZWN0b3IpYCwgc3RvcmUgaXQgaW4gYHRoaXNba2V5XWAsIHRoZW4gY2FsbCBgdGhpc1trZXldLmNhY2hlQ2hpbGRyZW5gIHBhc3NpbmcgdGhlIHJlY3Vyc2l2ZSBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgZGlyZWN0bHlcbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHsgaWQ6ICduYXZiYXInIH0pO1xuICAgICAqIG5hdmJhci5jYWNoZUNoaWxkcmVuKHtcbiAgICAgKiAgICAgIGhvbWU6IHtcbiAgICAgKiAgICAgICAgICAnLm5hdmJhci1pdGVtLWhvbWUnOiB7XG4gICAgICogICAgICAgICAgICAgIG5ld3M6ICcubmF2YmFyLXN1Yml0ZW0tbmV3cyxcbiAgICAgKiAgICAgICAgICAgICAgc3VwcG9ydDogJy5uYXZiYXItc3ViaXRlbS1zdXBwb3J0J1xuICAgICAqICAgICAgICAgIH1cbiAgICAgKiAgICAgIH1cbiAgICAgKiAgfSk7XG4gICAgICogbmF2YmFyLmhvbWUudG9nZ2xlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBuYXZiYXIuaG9tZS5uZXdzLmNzcyguLi4pO1xuICAgICAqIG5hdmJhci5ob21lLnN1cHBvcnQucG9pbnRlcmRvd24oLi4uKTtcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzaW5nIGBjYWNoZUNoaWxkcmVuYCBpbmRpcmVjdGx5IHRocm91Z2ggYGNoaWxkcmVuYCBjb25zdHJ1Y3RvciBvcHRpb25cbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHtxdWVyeTogJyNuYXZiYXInLCBjaGlsZHJlbjoge1xuICAgICAqICAgICAgaG9tZToge1xuICAgICAqICAgICAgICAgICcubmF2YmFyLWl0ZW0taG9tZSc6IHtcbiAgICAgKiAgICAgICAgICAgICAgbmV3czogJy5uYXZiYXItc3ViaXRlbS1uZXdzLFxuICAgICAqICAgICAgICAgICAgICBzdXBwb3J0OiAnLm5hdmJhci1zdWJpdGVtLXN1cHBvcnQnXG4gICAgICogICAgICAgICAgfVxuICAgICAqICAgICAgfVxuICAgICAqICB9fSk7XG4gICAgICogbmF2YmFyLmhvbWUudG9nZ2xlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBuYXZiYXIuaG9tZS5uZXdzLmNzcyguLi4pO1xuICAgICAqIG5hdmJhci5ob21lLnN1cHBvcnQucG9pbnRlcmRvd24oLi4uKTtcbiAgICAgKiBAc2VlIHRoaXMuY2hpbGQqL1xuICAgIGNhY2hlQ2hpbGRyZW4ocmVjdXJzaXZlUXVlcnlNYXA6IFRSZWNNYXA8UXVlcnlTZWxlY3Rvcj4pOiB0aGlzXG4gICAgY2FjaGVDaGlsZHJlbihiaGVNYXA6IFRNYXA8QmV0dGVySFRNTEVsZW1lbnQ+KTogdGhpc1xuICAgIC8qKkZvciBlYWNoIGBba2V5LCBzZWxlY3Rvcl1gIHBhaXIsIHdoZXJlIGBzZWxlY3RvcmAgaXMgYSBgQmV0dGVySFRNTEVsZW1lbnRgLCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzaW5nIGBjYWNoZUNoaWxkcmVuYCBkaXJlY3RseVxuICAgICAqIGNvbnN0IGhvbWUgPSBlbGVtKHsgcXVlcnk6ICcubmF2YmFyLWl0ZW0taG9tZScgfSk7XG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7IGlkOiAnbmF2YmFyJyB9KTtcbiAgICAgKiBuYXZiYXIuY2FjaGVDaGlsZHJlbih7IGhvbWUgfSk7XG4gICAgICogbmF2YmFyLmhvbWUudG9nZ2xlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzaW5nIGBjYWNoZUNoaWxkcmVuYCBpbmRpcmVjdGx5IHRocm91Z2ggYGNoaWxkcmVuYCBjb25zdHJ1Y3RvciBvcHRpb25cbiAgICAgKiBjb25zdCBob21lID0gZWxlbSh7IHF1ZXJ5OiAnLm5hdmJhci1pdGVtLWhvbWUnIH0pO1xuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oe2lkOiAnbmF2YmFyJywgY2hpbGRyZW46IHsgaG9tZSB9fSk7XG4gICAgICogbmF2YmFyLmhvbWUudG9nZ2xlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBAc2VlIHRoaXMuY2hpbGQqL1xuICAgIFxuICAgIGNhY2hlQ2hpbGRyZW4ocmVjdXJzaXZlQkhFTWFwOiBUUmVjTWFwPEJldHRlckhUTUxFbGVtZW50Pik6IHRoaXNcbiAgICAvKiprZXk6IHN0cmluZy4gdmFsdWU6IGVpdGhlciBcInNlbGVjdG9yIHN0cmluZ1wiIE9SIHtcInNlbGVjdG9yIHN0cmluZ1wiOiA8cmVjdXJzZSBkb3duPn0qL1xuICAgIGNhY2hlQ2hpbGRyZW4obWFwKSB7XG4gICAgICAgIGZvciAoIGxldCBbIGtleSwgdmFsdWUgXSBvZiBlbnVtZXJhdGUobWFwKSApIHtcbiAgICAgICAgICAgIGxldCB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICAgICAgICAgICAgaWYgKCBpc09iamVjdCh2YWx1ZSkgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCB2YWx1ZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50ICkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShrZXksIHZhbHVlKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXModmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGVudHJpZXNbMV0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgY2FjaGVDaGlsZHJlbigpIHJlY2VpdmVkIHJlY3Vyc2l2ZSBvYmogd2l0aCBtb3JlIHRoYW4gMSBzZWxlY3RvciBmb3IgYSBrZXkuIFVzaW5nIG9ubHkgMHRoIHNlbGVjdG9yYCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibXVsdGlwbGUgc2VsZWN0b3JzXCIgOiBlbnRyaWVzLm1hcChlID0+IGVbMF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyA6IHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIG9ubHkgZmlyc3QgYmVjYXVzZSAxOjEgZm9yIGtleTpzZWxlY3Rvci5cbiAgICAgICAgICAgICAgICAgICAgLy8gKGllIGNhbid0IGRvIHtyaWdodDogey5yaWdodDogey4uLn0sIC5yaWdodDI6IHsuLi59fSlcbiAgICAgICAgICAgICAgICAgICAgbGV0IFsgc2VsZWN0b3IsIG9iaiBdID0gZW50cmllc1swXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoa2V5LCB0aGlzLmNoaWxkKHNlbGVjdG9yKSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNba2V5XS5jYWNoZUNoaWxkcmVuKG9iailcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB0eXBlID09PSBcInN0cmluZ1wiICkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlKGtleSwgdGhpcy5jaGlsZCh2YWx1ZSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYGNhY2hlQ2hpbGRyZW4sIGJhZCB2YWx1ZSB0eXBlOiBcIiR7dHlwZX1cIi4ga2V5OiBcIiR7a2V5fVwiLCB2YWx1ZTogXCIke3ZhbHVlfVwiLiBtYXA6YCwgbWFwLCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvKipSZW1vdmUgYWxsIGNoaWxkcmVuIGZyb20gRE9NKi9cbiAgICBlbXB0eSgpOiB0aGlzIHtcbiAgICAgICAgLy8gVE9ETzogaXMgdGhpcyBmYXN0ZXIgdGhhbiBpbm5lckhUTUwgPSBcIlwiP1xuICAgICAgICB3aGlsZSAoIHRoaXMuZS5maXJzdENoaWxkIClcbiAgICAgICAgICAgIHRoaXMuZS5yZW1vdmVDaGlsZCh0aGlzLmUuZmlyc3RDaGlsZCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipSZW1vdmUgZWxlbWVudCBmcm9tIERPTSovXG4gICAgcmVtb3ZlKCk6IHRoaXMge1xuICAgICAgICB0aGlzLmUucmVtb3ZlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvLyBUT0RPOiByZWN1cnNpdmVseSB5aWVsZCBjaGlsZHJlblxuICAgIC8vICAodW5saWtlIC5jaGlsZHJlbigpLCB0aGlzIGRvZXNuJ3QgcmV0dXJuIG9ubHkgdGhlIGZpcnN0IGxldmVsKVxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBmaW5kKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2ZpbmQvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgZmlyc3QoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vZmlyc3QvXG4gICAgICAgIC8vIHRoaXMuZS5maXJzdENoaWxkXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbGFzdCgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9sYXN0L1xuICAgICAgICAvLyB0aGlzLmUubGFzdENoaWxkXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbmV4dCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBub3QoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgcGFyZW50KCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHBhcmVudHMoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICBcbiAgICAvLyAqKiogIEV2ZW50c1xuICAgIFxuICAgIG9uKGV2VHlwZUZuUGFpcnM6IFRFdmVudEZ1bmN0aW9uTWFwPFRFdmVudD4sIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICBmb3IgKCBsZXQgWyBldlR5cGUsIGV2Rm4gXSBvZiBlbnVtZXJhdGUoZXZUeXBlRm5QYWlycykgKSB7XG4gICAgICAgICAgICBjb25zdCBfZiA9IGZ1bmN0aW9uIF9mKGV2dCkge1xuICAgICAgICAgICAgICAgIGV2Rm4oZXZ0KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLmUuYWRkRXZlbnRMaXN0ZW5lcihldlR5cGUsIF9mLCBvcHRpb25zKTtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1tldlR5cGVdID0gX2Y7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIG9uZShldlR5cGU6IFRFdmVudCwgbGlzdGVuZXI6IEZ1bmN0aW9uUmVjaWV2ZXNFdmVudDxURXZlbnQ+LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgY29uc3QgZXZUeXBlRm5QYWlycyA9IHt9O1xuICAgICAgICBldlR5cGVGblBhaXJzW2V2VHlwZV0gPSBsaXN0ZW5lcjtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPT09IHVuZGVmaW5lZCA/IHsgb25jZSA6IHRydWUgfSA6IHsgLi4ub3B0aW9ucywgb25jZSA6IHRydWUgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMub24oZXZUeXBlRm5QYWlycywgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlJlbW92ZSBgZXZlbnRgIGZyb20gd3JhcHBlZCBlbGVtZW50J3MgZXZlbnQgbGlzdGVuZXJzLCBidXQga2VlcCB0aGUgcmVtb3ZlZCBsaXN0ZW5lciBpbiBjYWNoZS5cbiAgICAgKiBUaGlzIGlzIHVzZWZ1bCBmb3IgbGF0ZXIgdW5ibG9ja2luZyovXG4gICAgYmxvY2tMaXN0ZW5lcihldmVudDogVEV2ZW50KSB7XG4gICAgICAgIGxldCBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tldmVudF07XG4gICAgICAgIGlmICggbGlzdGVuZXIgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oYGJsb2NrTGlzdGVuZXIoZXZlbnQpOiB0aGlzLl9saXN0ZW5lcnNbZXZlbnRdIGlzIHVuZGVmaW5lZC4gZXZlbnQ6YCwgZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICB1bmJsb2NrTGlzdGVuZXIoZXZlbnQ6IFRFdmVudCkge1xuICAgICAgICBsZXQgbGlzdGVuZXIgPSB0aGlzLl9saXN0ZW5lcnNbZXZlbnRdO1xuICAgICAgICBpZiAoIGxpc3RlbmVyID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKGB1bmJsb2NrTGlzdGVuZXIoZXZlbnQpOiB0aGlzLl9saXN0ZW5lcnNbZXZlbnRdIGlzIHVuZGVmaW5lZC4gZXZlbnQ6YCwgZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKlxuICAgICBDaHJvbm9sb2d5OlxuICAgICBtb3VzZWRvd24gICAgICB0b3VjaHN0YXJ0XHRwb2ludGVyZG93blxuICAgICBtb3VzZWVudGVyXHRcdCAgICAgICAgICAgIHBvaW50ZXJlbnRlclxuICAgICBtb3VzZWxlYXZlXHRcdCAgICAgICAgICAgIHBvaW50ZXJsZWF2ZVxuICAgICBtb3VzZW1vdmUgICAgICB0b3VjaG1vdmVcdHBvaW50ZXJtb3ZlXG4gICAgIG1vdXNlb3V0XHRcdCAgICAgICAgICAgIHBvaW50ZXJvdXRcbiAgICAgbW91c2VvdmVyXHRcdCAgICAgICAgICAgIHBvaW50ZXJvdmVyXG4gICAgIG1vdXNldXBcdCAgICB0b3VjaGVuZCAgICBwb2ludGVydXBcbiAgICAgKi9cbiAgICAvKiogQWRkIGEgYHRvdWNoc3RhcnRgIGV2ZW50IGxpc3RlbmVyLiBUaGlzIGlzIHRoZSBmYXN0IGFsdGVybmF0aXZlIHRvIGBjbGlja2AgbGlzdGVuZXJzIGZvciBtb2JpbGUgKG5vIDMwMG1zIHdhaXQpLiAqL1xuICAgIHRvdWNoc3RhcnQoZm46IChldjogVG91Y2hFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbiBfZihldjogVG91Y2hFdmVudCkge1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTsgLy8gb3RoZXJ3aXNlIFwidG91Y2htb3ZlXCIgaXMgdHJpZ2dlcmVkXG4gICAgICAgICAgICBmbihldik7XG4gICAgICAgICAgICBpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5vbmNlICkgLy8gVE9ETzogbWF5YmUgbmF0aXZlIG9wdGlvbnMub25jZSBpcyBlbm91Z2hcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBfZik7XG4gICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICAvLyBUT0RPOiB0aGlzLl9saXN0ZW5lcnMsIG9yIHVzZSB0aGlzLm9uKFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcG9pbnRlcmVudGVyKGZuOiAoZXZlbnQ6IFBvaW50ZXJFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub24oeyBwb2ludGVyZW50ZXIgOiBmbiB9LCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgLyoqIEFkZCBhIGBwb2ludGVyZG93bmAgZXZlbnQgbGlzdGVuZXIgaWYgYnJvd3NlciBzdXBwb3J0cyBgcG9pbnRlcmRvd25gLCBlbHNlIHNlbmQgYG1vdXNlZG93bmAgKHNhZmFyaSkuICovXG4gICAgcG9pbnRlcmRvd24oZm46IChldmVudDogUG9pbnRlckV2ZW50IHwgTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgXG4gICAgICAgIGxldCBhY3Rpb247XG4gICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIFBvaW50ZXJFdmVudCBleGlzdHMgYW5kIHN0b3JlIGluIHZhciBvdXRzaWRlIGNsYXNzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhY3Rpb24gPSB3aW5kb3cuUG9pbnRlckV2ZW50ID8gJ3BvaW50ZXJkb3duJyA6ICdtb3VzZWRvd24nOyAvLyBzYWZhcmkgZG9lc24ndCBzdXBwb3J0IHBvaW50ZXJkb3duXG4gICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgYWN0aW9uID0gJ21vdXNlZG93bidcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBfZiA9IGZ1bmN0aW9uIF9mKGV2OiBQb2ludGVyRXZlbnQgfCBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZm4oZXYpO1xuICAgICAgICAgICAgaWYgKCBvcHRpb25zICYmIG9wdGlvbnMub25jZSApIC8vIFRPRE86IG1heWJlIG5hdGl2ZSBvcHRpb25zLm9uY2UgaXMgZW5vdWdoXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGFjdGlvbiwgX2YpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmUuYWRkRXZlbnRMaXN0ZW5lcihhY3Rpb24sIF9mLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzLnBvaW50ZXJkb3duID0gX2Y7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipTaW11bGF0ZSBhIGNsaWNrIG9mIHRoZSBlbGVtZW50LiBVc2VmdWwgZm9yIGA8YT5gIGVsZW1lbnRzLiovXG4gICAgY2xpY2soKTogdGhpcztcbiAgICAvKipBZGQgYSBgY2xpY2tgIGV2ZW50IGxpc3RlbmVyLiBZb3Ugc2hvdWxkIHByb2JhYmx5IHVzZSBgcG9pbnRlcmRvd24oKWAgaWYgb24gZGVza3RvcCwgb3IgYHRvdWNoc3RhcnQoKWAgaWYgb24gbW9iaWxlLiovXG4gICAgY2xpY2soZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIGNsaWNrKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgdGhpcy5lLmNsaWNrKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgY2xpY2sgOiBmbiB9LCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipCbHVyICh1bmZvY3VzKSB0aGUgZWxlbWVudC4qL1xuICAgIGJsdXIoKTogdGhpcztcbiAgICAvKipBZGQgYSBgYmx1cmAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGJsdXIoZm46IChldmVudDogRm9jdXNFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIGJsdXIoZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLmUuYmx1cigpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGJsdXIgOiBmbiB9LCBvcHRpb25zKVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKkZvY3VzIHRoZSBlbGVtZW50LiovXG4gICAgZm9jdXMoKTogdGhpcztcbiAgICAvKipBZGQgYSBgZm9jdXNgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBmb2N1cyhmbjogKGV2ZW50OiBGb2N1c0V2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgZm9jdXMoZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLmUuZm9jdXMoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBmb2N1cyA6IGZuIH0sIG9wdGlvbnMpXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQWRkIGEgYGNoYW5nZWAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGNoYW5nZShmbjogKGV2ZW50OiBFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub24oeyBjaGFuZ2UgOiBmbiB9LCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQWRkIGEgYGNvbnRleHRtZW51YCBldmVudCBsaXN0ZW5lciovXG4gICAgY29udGV4dG1lbnUoZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub24oeyBjb250ZXh0bWVudSA6IGZuIH0sIG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICAvKipTaW11bGF0ZSBhIGRvdWJsZSBjbGljayBvZiB0aGUgZWxlbWVudC4qL1xuICAgIGRibGNsaWNrKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYGRibGNsaWNrYCBldmVudCBsaXN0ZW5lciovXG4gICAgZGJsY2xpY2soZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIGRibGNsaWNrKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgY29uc3QgZGJsY2xpY2sgPSBuZXcgTW91c2VFdmVudCgnZGJsY2xpY2snLCB7XG4gICAgICAgICAgICAgICAgJ3ZpZXcnIDogd2luZG93LFxuICAgICAgICAgICAgICAgICdidWJibGVzJyA6IHRydWUsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbGFibGUnIDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmUuZGlzcGF0Y2hFdmVudChkYmxjbGljayk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgZGJsY2xpY2sgOiBmbiB9LCBvcHRpb25zKVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEgbW91c2VlbnRlciBldmVudCB0byB0aGUgZWxlbWVudC4qL1xuICAgIG1vdXNlZW50ZXIoKTogdGhpcztcbiAgICAvKipBZGQgYSBgbW91c2VlbnRlcmAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIG1vdXNlZW50ZXIoZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIG1vdXNlZW50ZXIoZm4/LCBvcHRpb25zPykge1xuICAgICAgICAvLyBtb3VzZW92ZXI6IGFsc28gY2hpbGQgZWxlbWVudHNcbiAgICAgICAgLy8gbW91c2VlbnRlcjogb25seSBib3VuZCBlbGVtZW50XG4gICAgICAgIFxuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBjb25zdCBtb3VzZWVudGVyID0gbmV3IE1vdXNlRXZlbnQoJ21vdXNlZW50ZXInLCB7XG4gICAgICAgICAgICAgICAgJ3ZpZXcnIDogd2luZG93LFxuICAgICAgICAgICAgICAgICdidWJibGVzJyA6IHRydWUsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbGFibGUnIDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmUuZGlzcGF0Y2hFdmVudChtb3VzZWVudGVyKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBtb3VzZWVudGVyIDogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipTaW11bGF0ZSBhIGtleWRvd24gZXZlbnQgdG8gdGhlIGVsZW1lbnQuKi9cbiAgICAvLyBAdHMtaWdub3JlXG4gICAga2V5ZG93bigpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBrZXlkb3duYCBldmVudCBsaXN0ZW5lciovXG4gICAga2V5ZG93bihmbjogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAga2V5ZG93bihmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBrZXlkb3duIDogZm4gfSwgb3B0aW9ucylcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGtleXVwKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2tleXVwL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGtleXByZXNzKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2tleXByZXNzL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGhvdmVyKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2hvdmVyL1xuICAgICAgICAvLyBiaW5kcyB0byBib3RoIG1vdXNlZW50ZXIgYW5kIG1vdXNlbGVhdmVcbiAgICAgICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTc1ODk0MjAvd2hlbi10by1jaG9vc2UtbW91c2VvdmVyLWFuZC1ob3Zlci1mdW5jdGlvblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG1vdXNlZG93bigpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXlwcmVzcy9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBtb3VzZWxlYXZlKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2tleXByZXNzL1xuICAgICAgICAvL21vdXNlbGVhdmUgYW5kIG1vdXNlb3V0IGFyZSBzaW1pbGFyIGJ1dCBkaWZmZXIgaW4gdGhhdCBtb3VzZWxlYXZlIGRvZXMgbm90IGJ1YmJsZSBhbmQgbW91c2VvdXQgZG9lcy5cbiAgICAgICAgLy8gVGhpcyBtZWFucyB0aGF0IG1vdXNlbGVhdmUgaXMgZmlyZWQgd2hlbiB0aGUgcG9pbnRlciBoYXMgZXhpdGVkIHRoZSBlbGVtZW50IGFuZCBhbGwgb2YgaXRzIGRlc2NlbmRhbnRzLFxuICAgICAgICAvLyB3aGVyZWFzIG1vdXNlb3V0IGlzIGZpcmVkIHdoZW4gdGhlIHBvaW50ZXIgbGVhdmVzIHRoZSBlbGVtZW50IG9yIGxlYXZlcyBvbmUgb2YgdGhlIGVsZW1lbnQncyBkZXNjZW5kYW50c1xuICAgICAgICAvLyAoZXZlbiBpZiB0aGUgcG9pbnRlciBpcyBzdGlsbCB3aXRoaW4gdGhlIGVsZW1lbnQpLlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG1vdXNlbW92ZSgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXlwcmVzcy9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEgbW91c2VvdXQgZXZlbnQgdG8gdGhlIGVsZW1lbnQuKi9cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgbW91c2VvdXQoKTogdGhpcztcbiAgICAvKipBZGQgYSBgbW91c2VvdXRgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBtb3VzZW91dChmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgbW91c2VvdXQoZm4/LCBvcHRpb25zPykge1xuICAgICAgICAvL21vdXNlbGVhdmUgYW5kIG1vdXNlb3V0IGFyZSBzaW1pbGFyIGJ1dCBkaWZmZXIgaW4gdGhhdCBtb3VzZWxlYXZlIGRvZXMgbm90IGJ1YmJsZSBhbmQgbW91c2VvdXQgZG9lcy5cbiAgICAgICAgLy8gVGhpcyBtZWFucyB0aGF0IG1vdXNlbGVhdmUgaXMgZmlyZWQgd2hlbiB0aGUgcG9pbnRlciBoYXMgZXhpdGVkIHRoZSBlbGVtZW50IGFuZCBhbGwgb2YgaXRzIGRlc2NlbmRhbnRzLFxuICAgICAgICAvLyB3aGVyZWFzIG1vdXNlb3V0IGlzIGZpcmVkIHdoZW4gdGhlIHBvaW50ZXIgbGVhdmVzIHRoZSBlbGVtZW50IG9yIGxlYXZlcyBvbmUgb2YgdGhlIGVsZW1lbnQncyBkZXNjZW5kYW50c1xuICAgICAgICAvLyAoZXZlbiBpZiB0aGUgcG9pbnRlciBpcyBzdGlsbCB3aXRoaW4gdGhlIGVsZW1lbnQpLlxuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgbW91c2VvdXQgOiBmbiB9LCBvcHRpb25zKVxuICAgIH1cbiAgICBcbiAgICAvKipTaW11bGF0ZSBhIG1vdXNlb3ZlciBldmVudCB0byB0aGUgZWxlbWVudC4qL1xuICAgIG1vdXNlb3ZlcigpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBtb3VzZW92ZXJgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBtb3VzZW92ZXIoZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIG1vdXNlb3Zlcihmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIC8vIG1vdXNlb3ZlcjogYWxzbyBjaGlsZCBlbGVtZW50c1xuICAgICAgICAvLyBtb3VzZWVudGVyOiBvbmx5IGJvdW5kIGVsZW1lbnRcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IG1vdXNlb3ZlciA6IGZuIH0sIG9wdGlvbnMpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBtb3VzZXVwKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2tleXByZXNzL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgdHJhbnNmb3JtKG9wdGlvbnM6IFRyYW5zZm9ybU9wdGlvbnMpIHtcbiAgICAgICAgbGV0IHRyYW5zZm9ybTogc3RyaW5nID0gJyc7XG4gICAgICAgIGZvciAoIGxldCBbIGssIHYgXSBvZiBlbnVtZXJhdGUob3B0aW9ucykgKSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm0gKz0gYCR7a30oJHt2fSkgYFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMub24oe1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb25lbmQgOiByZXNvbHZlXG4gICAgICAgICAgICB9LCB7IG9uY2UgOiB0cnVlIH0pO1xuICAgICAgICAgICAgdGhpcy5jc3MoeyB0cmFuc2Zvcm0gfSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgXG4gICAgLyoqIFJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXIgb2YgYGV2ZW50YCwgaWYgZXhpc3RzLiovXG4gICAgb2ZmKGV2ZW50OiBURXZlbnQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIHRoaXMuX2xpc3RlbmVyc1tldmVudF0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgYWxsT2ZmKCk6IHRoaXMge1xuICAgICAgICBmb3IgKCBsZXQgZXZlbnQgaW4gdGhpcy5fbGlzdGVuZXJzICkge1xuICAgICAgICAgICAgdGhpcy5vZmYoPFRFdmVudD4gZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvLyAqKiogIEF0dHJpYnV0ZXNcbiAgICBcbiAgICAvKiogRm9yIGVhY2ggYFthdHRyLCB2YWxdYCBwYWlyLCBhcHBseSBgc2V0QXR0cmlidXRlYCovXG4gICAgYXR0cihhdHRyVmFsUGFpcnM6IFRNYXA8c3RyaW5nIHwgYm9vbGVhbj4pOiB0aGlzXG4gICAgLyoqIGFwcGx5IGBnZXRBdHRyaWJ1dGVgKi9cbiAgICBhdHRyKGF0dHJpYnV0ZU5hbWU6IHN0cmluZyk6IHN0cmluZ1xuICAgIGF0dHIoYXR0clZhbFBhaXJzKSB7XG4gICAgICAgIGlmICggdHlwZW9mIGF0dHJWYWxQYWlycyA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLmdldEF0dHJpYnV0ZShhdHRyVmFsUGFpcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICggbGV0IFsgYXR0ciwgdmFsIF0gb2YgZW51bWVyYXRlKGF0dHJWYWxQYWlycykgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5zZXRBdHRyaWJ1dGUoYXR0ciwgdmFsKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKiBgcmVtb3ZlQXR0cmlidXRlYCAqL1xuICAgIHJlbW92ZUF0dHIocXVhbGlmaWVkTmFtZTogc3RyaW5nLCAuLi5xdWFsaWZpZWROYW1lczogc3RyaW5nW10pOiB0aGlzIHtcbiAgICAgICAgbGV0IF9yZW1vdmVBdHRyaWJ1dGU7XG4gICAgICAgIGlmICggdGhpcy5faXNTdmcgKVxuICAgICAgICAgICAgX3JlbW92ZUF0dHJpYnV0ZSA9IChxdWFsaWZpZWROYW1lKSA9PiB0aGlzLmUucmVtb3ZlQXR0cmlidXRlTlMoU1ZHX05TX1VSSSwgcXVhbGlmaWVkTmFtZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUgPSAocXVhbGlmaWVkTmFtZSkgPT4gdGhpcy5lLnJlbW92ZUF0dHJpYnV0ZShxdWFsaWZpZWROYW1lKTtcbiAgICAgICAgXG4gICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUocXVhbGlmaWVkTmFtZSk7XG4gICAgICAgIGZvciAoIGxldCBxbiBvZiBxdWFsaWZpZWROYW1lcyApXG4gICAgICAgICAgICBfcmVtb3ZlQXR0cmlidXRlKHFuKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKmBnZXRBdHRyaWJ1dGUoYGRhdGEtJHtrZXl9YClgLiBKU09OLnBhcnNlIGl0IGJ5IGRlZmF1bHQuKi9cbiAgICBkYXRhKGtleTogc3RyaW5nLCBwYXJzZTogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcgfCBUTWFwPHN0cmluZz4ge1xuICAgICAgICAvLyBUT0RPOiBqcXVlcnkgZG9lc24ndCBhZmZlY3QgZGF0YS0qIGF0dHJzIGluIERPTS4gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9kYXRhL1xuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5lLmdldEF0dHJpYnV0ZShgZGF0YS0ke2tleX1gKTtcbiAgICAgICAgaWYgKCBwYXJzZSA9PT0gdHJ1ZSApXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICB9XG4gICAgXG4gICAgLy8gKiogIEZhZGVcbiAgICBhc3luYyBmYWRlKGR1cjogbnVtYmVyLCB0bzogMCB8IDEpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgY29uc3Qgc3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lKTtcbiAgICAgICAgY29uc3QgdHJhbnNQcm9wID0gc3R5bGVzLnRyYW5zaXRpb25Qcm9wZXJ0eS5zcGxpdCgnLCAnKTtcbiAgICAgICAgY29uc3QgaW5kZXhPZk9wYWNpdHkgPSB0cmFuc1Byb3AuaW5kZXhPZignb3BhY2l0eScpO1xuICAgICAgICAvLyBjc3Mgb3BhY2l0eTowID0+IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTogMHNcbiAgICAgICAgLy8gY3NzIG9wYWNpdHk6NTAwbXMgPT4gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldOiAwLjVzXG4gICAgICAgIC8vIGNzcyBOTyBvcGFjaXR5ID0+IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTogdW5kZWZpbmVkXG4gICAgICAgIGlmICggaW5kZXhPZk9wYWNpdHkgIT09IC0xICkge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNEdXIgPSBzdHlsZXMudHJhbnNpdGlvbkR1cmF0aW9uLnNwbGl0KCcsICcpO1xuICAgICAgICAgICAgY29uc3Qgb3BhY2l0eVRyYW5zRHVyID0gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldO1xuICAgICAgICAgICAgY29uc3QgdHJhbnMgPSBzdHlsZXMudHJhbnNpdGlvbi5zcGxpdCgnLCAnKTtcbiAgICAgICAgICAgIC8vIHRyYW5zaXRpb246IG9wYWNpdHkgd2FzIGRlZmluZWQgaW4gY3NzLlxuICAgICAgICAgICAgLy8gc2V0IHRyYW5zaXRpb24gdG8gZHVyLCBzZXQgb3BhY2l0eSB0byAwLCBsZWF2ZSB0aGUgYW5pbWF0aW9uIHRvIG5hdGl2ZSB0cmFuc2l0aW9uLCB3YWl0IGR1ciBhbmQgcmV0dXJuIHRoaXNcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgZmFkZSgke2R1cn0sICR7dG99KSwgb3BhY2l0eVRyYW5zRHVyICE9PSB1bmRlZmluZWQuIG51bGxpZnlpbmcgdHJhbnNpdGlvbi4gU0hPVUxEIE5PVCBXT1JLYCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgdHJhbnM6XFx0JHt0cmFuc31cXG50cmFuc1Byb3A6XFx0JHt0cmFuc1Byb3B9XFxuaW5kZXhPZk9wYWNpdHk6XFx0JHtpbmRleE9mT3BhY2l0eX1cXG5vcGFjaXR5VHJhbnNEdXI6XFx0JHtvcGFjaXR5VHJhbnNEdXJ9YCk7XG4gICAgICAgICAgICAvLyB0cmFucy5zcGxpY2UoaW5kZXhPZk9wYWNpdHksIDEsIGBvcGFjaXR5ICR7ZHVyIC8gMTAwMH1zYCk7XG4gICAgICAgICAgICB0cmFucy5zcGxpY2UoaW5kZXhPZk9wYWNpdHksIDEsIGBvcGFjaXR5IDBzYCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgYWZ0ZXIsIHRyYW5zOiAke3RyYW5zfWApO1xuICAgICAgICAgICAgdGhpcy5lLnN0eWxlLnRyYW5zaXRpb24gPSB0cmFucy5qb2luKCcsICcpO1xuICAgICAgICAgICAgdGhpcy5jc3MoeyBvcGFjaXR5IDogdG8gfSk7XG4gICAgICAgICAgICBhd2FpdCB3YWl0KGR1cik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICAvLyB0cmFuc2l0aW9uOiBvcGFjaXR5IHdhcyBOT1QgZGVmaW5lZCBpbiBjc3MuXG4gICAgICAgIGlmICggZHVyID09IDAgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jc3MoeyBvcGFjaXR5IDogdG8gfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXNGYWRlT3V0ID0gdG8gPT09IDA7XG4gICAgICAgIGxldCBvcGFjaXR5ID0gcGFyc2VGbG9hdCh0aGlzLmUuc3R5bGUub3BhY2l0eSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIG9wYWNpdHkgPT09IHVuZGVmaW5lZCB8fCBpc05hTihvcGFjaXR5KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgZmFkZSgke2R1cn0sICR7dG99KSBodG1sRWxlbWVudCBoYXMgTk8gb3BhY2l0eSBhdCBhbGwuIHJlY3Vyc2luZ2AsIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5LFxuICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNzcyh7IG9wYWNpdHkgOiBNYXRoLmFicygxIC0gdG8pIH0pLmZhZGUoZHVyLCB0bylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCBpc0ZhZGVPdXQgPyBvcGFjaXR5IDw9IDAgOiBvcGFjaXR5ID4gMSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYGZhZGUoJHtkdXJ9LCAke3RvfSkgb3BhY2l0eSB3YXMgYmV5b25kIHRhcmdldCBvcGFjaXR5LiByZXR1cm5pbmcgdGhpcyBhcyBpcy5gLCB7XG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxldCBzdGVwcyA9IDMwO1xuICAgICAgICBsZXQgb3BTdGVwID0gMSAvIHN0ZXBzO1xuICAgICAgICBsZXQgZXZlcnltcyA9IGR1ciAvIHN0ZXBzO1xuICAgICAgICBpZiAoIGV2ZXJ5bXMgPCAxICkge1xuICAgICAgICAgICAgZXZlcnltcyA9IDE7XG4gICAgICAgICAgICBzdGVwcyA9IGR1cjtcbiAgICAgICAgICAgIG9wU3RlcCA9IDEgLyBzdGVwcztcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgZmFkZSgke2R1cn0sICR7dG99KSBoYWQgb3BhY2l0eSwgbm8gdHJhbnNpdGlvbi4gKGdvb2QpIG9wYWNpdHk6ICR7b3BhY2l0eX1gLCB7XG4gICAgICAgICAgICBzdGVwcyxcbiAgICAgICAgICAgIG9wU3RlcCxcbiAgICAgICAgICAgIGV2ZXJ5bXNcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlYWNoZWRUbyA9IGlzRmFkZU91dCA/IChvcCkgPT4gb3AgLSBvcFN0ZXAgPiAwIDogKG9wKSA9PiBvcCArIG9wU3RlcCA8IDE7XG4gICAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCByZWFjaGVkVG8ob3BhY2l0eSkgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBpc0ZhZGVPdXQgPT09IHRydWUgKVxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5IC09IG9wU3RlcDtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHkgKz0gb3BTdGVwO1xuICAgICAgICAgICAgICAgIHRoaXMuY3NzKHsgb3BhY2l0eSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eSA9IHRvO1xuICAgICAgICAgICAgICAgIHRoaXMuY3NzKHsgb3BhY2l0eSB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZXZlcnltcyk7XG4gICAgICAgIGF3YWl0IHdhaXQoZHVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGZhZGVPdXQoZHVyOiBudW1iZXIpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZmFkZShkdXIsIDApO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBhc3luYyBmYWRlSW4oZHVyOiBudW1iZXIpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZmFkZShkdXIsIDEpO1xuICAgIH1cbiAgICBcbiAgICBcbn1cblxuY2xhc3MgRGl2IGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxEaXZFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhIERpdiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ2RpdicsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgIH1cbn1cblxuY2xhc3MgUGFyYWdyYXBoIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxQYXJhZ3JhcGhFbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxQYXJhZ3JhcGhFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhIFBhcmFncmFwaCBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ3AnLCB0ZXh0LCBjbHMgfSk7XG4gICAgICAgIGlmICggaWQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmlkKGlkKTtcbiAgICB9XG59XG5cbmNsYXNzIFNwYW4gZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTFNwYW5FbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxTcGFuRWxlbWVudDtcbiAgICBcbiAgICAvKipDcmVhdGUgYSBTcGFuIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCB0ZXh0LCBjbHMgfTogU3ViRWxlbUNvbnN0cnVjdG9yID0ge30pIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnc3BhbicsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBcbiAgICB9XG59XG5cbmNsYXNzIEltZyBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhbiBJbWcgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCBzcmMgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgc3JjLCBjbHMgfTogSW1nQ29uc3RydWN0b3IpIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnaW1nJywgY2xzIH0pO1xuICAgICAgICBpZiAoIGlkICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5pZChpZCk7XG4gICAgICAgIGlmICggc3JjICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuc3JjID0gc3JjO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgc3JjKHNyYzogc3RyaW5nKTogdGhpcztcbiAgICBzcmMoKTogc3RyaW5nO1xuICAgIHNyYyhzcmM/KSB7XG4gICAgICAgIGlmICggc3JjID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQuc3JjXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5zcmMgPSBzcmM7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZWFkb25seSBlOiBIVE1MSW1hZ2VFbGVtZW50O1xufVxuXG5jbGFzcyBCdXR0b24gZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gICAgXG4gICAgLyoqQ3JlYXRlIGEgQnV0dG9uIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgY2xzLCBodG1sIG9yIGNsaWNrIGZ1bmN0aW9uKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCBjbHMsIGNsaWNrLCBodG1sIH06IEJ1dHRvbkNvbnN0cnVjdG9yKSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ2J1dHRvbicsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBpZiAoIGNsaWNrICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5jbGljayhjbGljayk7XG4gICAgICAgIGlmICggaHRtbCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaHRtbChodG1sKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICByZWFkb25seSBlOiBIVE1MQnV0dG9uRWxlbWVudDtcbn1cblxuY2xhc3MgQW5jaG9yIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxBbmNob3JFbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxBbmNob3JFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhbiBBbmNob3IgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0LCBocmVmIG9yIGNscy4qL1xuICAgIGNvbnN0cnVjdG9yKHsgaWQsIHRleHQsIGNscywgaHJlZiB9OiBBbmNob3JDb25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ2EnLCB0ZXh0LCBjbHMgfSk7XG4gICAgICAgIGlmICggaWQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmlkKGlkKTtcbiAgICAgICAgaWYgKCBocmVmICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5ocmVmKGhyZWYpXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBocmVmKCk6IHN0cmluZ1xuICAgIGhyZWYodmFsOiBzdHJpbmcpOiB0aGlzXG4gICAgaHJlZih2YWw/KSB7XG4gICAgICAgIGlmICggdmFsID09PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignaHJlZicpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKHsgaHJlZiA6IHZhbCB9KVxuICAgIH1cbiAgICBcbiAgICB0YXJnZXQoKTogc3RyaW5nXG4gICAgdGFyZ2V0KHZhbDogc3RyaW5nKTogdGhpc1xuICAgIHRhcmdldCh2YWw/KSB7XG4gICAgICAgIGlmICggdmFsID09PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigndGFyZ2V0Jyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoeyB0YXJnZXQgOiB2YWwgfSlcbiAgICB9XG59XG5cbmNsYXNzIElucHV0IGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgcmVhZG9ubHkgZTogSFRNTElucHV0RWxlbWVudDtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCB0ZXh0LCBjbHMsIHBsYWNlaG9sZGVyLCB0eXBlIH06IElucHV0Q29uc3RydWN0b3IgPSB7fSkge1xuICAgICAgICBzdXBlcih7IHRhZyA6ICdpbnB1dCcsIHRleHQsIGNscyB9KTtcbiAgICAgICAgXG4gICAgICAgIGlmICggaWQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmlkKGlkKTtcbiAgICAgICAgaWYgKCBwbGFjZWhvbGRlciAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuYXR0cih7IHBsYWNlaG9sZGVyLCB0eXBlIDogdHlwZSA/PyAndGV4dCcgfSlcbiAgICB9XG4gICAgXG4gICAgZ2V0IHZhbHVlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmUudmFsdWU7XG4gICAgfVxuICAgIFxuICAgIHNldCB2YWx1ZSh2YWw6IHN0cmluZykge1xuICAgICAgICB0aGlzLmUudmFsdWUgPSB2YWw7XG4gICAgfVxufVxuXG4vKmNsYXNzIFN2ZyBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50e1xuIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IFNWR0VsZW1lbnQ7XG4gY29uc3RydWN0b3Ioe2lkLCBjbHMsaHRtbEVsZW1lbnR9OiBTdmdDb25zdHJ1Y3Rvcikge1xuIHN1cGVyKHt0YWc6ICdzdmcnLCBjbHN9KTtcbiBpZiAoaWQpXG4gdGhpcy5pZChpZCk7XG4gaWYgKHNyYylcbiB0aGlzLl9odG1sRWxlbWVudC5zcmMgPSBzcmM7XG4gXG4gfVxuIH1cbiAqL1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItaHRtbC1lbGVtZW50JywgQmV0dGVySFRNTEVsZW1lbnQpO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItZGl2JywgRGl2LCB7IGV4dGVuZHMgOiAnZGl2JyB9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLXAnLCBQYXJhZ3JhcGgsIHsgZXh0ZW5kcyA6ICdwJyB9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLXNwYW4nLCBTcGFuLCB7IGV4dGVuZHMgOiAnc3BhbicgfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1pbWcnLCBJbWcsIHsgZXh0ZW5kcyA6ICdpbWcnIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItYScsIEFuY2hvciwgeyBleHRlbmRzIDogJ2EnIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItYnV0dG9uJywgQnV0dG9uLCB7IGV4dGVuZHMgOiAnYnV0dG9uJyB9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWlucHV0JywgSW5wdXQsIHsgZXh0ZW5kcyA6ICdpbnB1dCcgfSk7XG5cbi8vIGN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLXN2ZycsIFN2Zywge2V4dGVuZHM6ICdzdmcnfSk7XG5cbi8qKkNyZWF0ZSBhbiBlbGVtZW50IG9mIGB0YWdgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCBhbmQgLyBvciBgY2xzYCovXG5mdW5jdGlvbiBlbGVtKHsgdGFnLCB0ZXh0LCBjbHMgfTogeyB0YWc6IFF1ZXJ5U2VsZWN0b3IsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZyB9KTogQmV0dGVySFRNTEVsZW1lbnQ7XG4vKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgaWRgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG5mdW5jdGlvbiBlbGVtKHsgaWQsIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBpZDogc3RyaW5nLCB0ZXh0Pzogc3RyaW5nLCBjbHM/OiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk6IEJldHRlckhUTUxFbGVtZW50O1xuLyoqR2V0IGFuIGV4aXN0aW5nIGVsZW1lbnQgYnkgYHF1ZXJ5YC4gT3B0aW9uYWxseSwgc2V0IGl0cyBgdGV4dGAsIGBjbHNgIG9yIGNhY2hlIGBjaGlsZHJlbmAqL1xuZnVuY3Rpb24gZWxlbSh7IHF1ZXJ5LCB0ZXh0LCBjbHMsIGNoaWxkcmVuIH06IHsgcXVlcnk6IFF1ZXJ5U2VsZWN0b3IsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTogQmV0dGVySFRNTEVsZW1lbnQ7XG4vKipXcmFwIGFuIGV4aXN0aW5nIEhUTUxFbGVtZW50LiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG5mdW5jdGlvbiBlbGVtKHsgaHRtbEVsZW1lbnQsIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBodG1sRWxlbWVudDogSFRNTEVsZW1lbnQsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTogQmV0dGVySFRNTEVsZW1lbnQ7XG5mdW5jdGlvbiBlbGVtKGVsZW1PcHRpb25zKTogQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHJldHVybiBuZXcgQmV0dGVySFRNTEVsZW1lbnQoZWxlbU9wdGlvbnMpO1xufVxuXG4vKipDcmVhdGUgYSBTcGFuIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbmZ1bmN0aW9uIHNwYW4oeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogU3BhbiB7XG4gICAgcmV0dXJuIG5ldyBTcGFuKHsgaWQsIHRleHQsIGNscyB9KTtcbn1cblxuLyoqQ3JlYXRlIGFuIERpdiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG5mdW5jdGlvbiBkaXYoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogRGl2IHtcbiAgICByZXR1cm4gbmV3IERpdih7IGlkLCB0ZXh0LCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhbiBJbWcgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCBzcmMgb3IgY2xzLiovXG5mdW5jdGlvbiBpbWcoeyBpZCwgc3JjLCBjbHMgfTogSW1nQ29uc3RydWN0b3IgPSB7fSk6IEltZyB7XG4gICAgcmV0dXJuIG5ldyBJbWcoeyBpZCwgc3JjLCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhIEJ1dHRvbiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIGNscywgaHRtbCBvciBjbGljayBmdW5jdGlvbiovXG5mdW5jdGlvbiBidXR0b24oeyBpZCwgY2xzLCBjbGljaywgaHRtbCB9OiBCdXR0b25Db25zdHJ1Y3RvciA9IHt9KTogQnV0dG9uIHtcbiAgICByZXR1cm4gbmV3IEJ1dHRvbih7IGlkLCBjbHMsIGNsaWNrLCBodG1sIH0pO1xufVxuXG4vKipDcmVhdGUgYSBQYXJhZ3JhcGggZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0IG9yIGNscy4qL1xuZnVuY3Rpb24gcGFyYWdyYXBoKHsgaWQsIHRleHQsIGNscyB9OiBTdWJFbGVtQ29uc3RydWN0b3IgPSB7fSk6IFBhcmFncmFwaCB7XG4gICAgcmV0dXJuIG5ldyBQYXJhZ3JhcGgoeyBpZCwgdGV4dCwgY2xzIH0pO1xufVxuXG4vKipDcmVhdGUgYW4gQW5jaG9yIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCwgaHJlZiBvciBjbHMuKi9cbmZ1bmN0aW9uIGFuY2hvcih7IGlkLCB0ZXh0LCBjbHMsIGhyZWYgfTogQW5jaG9yQ29uc3RydWN0b3IgPSB7fSk6IEFuY2hvciB7XG4gICAgcmV0dXJuIG5ldyBBbmNob3IoeyBpZCwgdGV4dCwgY2xzLCBocmVmIH0pO1xufVxuXG4vKipDcmVhdGUgYW4gSW5wdXQgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGBpZGAsIGB0ZXh0YCwgYGNsc2AsIGBwbGFjZWhvbGRlcmAsIG9yIGB0eXBlYC4gYHR5cGVgIGRlZmF1bHRzIHRvIGB0ZXh0YC4qL1xuZnVuY3Rpb24gaW5wdXQoeyBpZCwgdGV4dCwgY2xzLCBwbGFjZWhvbGRlciwgdHlwZSB9OiBJbnB1dENvbnN0cnVjdG9yID0ge30pOiBJbnB1dCB7XG4gICAgcmV0dXJuIG5ldyBJbnB1dCh7IGlkLCB0ZXh0LCBjbHMsIHBsYWNlaG9sZGVyLCB0eXBlIH0pO1xufVxuXG5leHBvcnQgeyBlbGVtLCBzcGFuLCBkaXYsIGltZywgcGFyYWdyYXBoLCBhbmNob3IsIGJ1dHRvbiwgaW5wdXQsIEJldHRlckhUTUxFbGVtZW50LCBEaXYsIEJ1dHRvbiwgU3BhbiwgSW5wdXQgfVxuIl19