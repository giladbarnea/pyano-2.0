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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtDQUFzRTtBQUV0RSxNQUFNLFVBQVUsR0FBRyw0QkFBNEIsQ0FBQztBQUloRCxNQUFNLGlCQUFpQjtJQStCbkIsWUFBWSxXQUFXO1FBN0JOLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFDeEIsZUFBVSxHQUE4QixFQUFFLENBQUM7UUFDcEQsb0JBQWUsR0FBNEIsRUFBRSxDQUFDO1FBNEJsRCxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsV0FBVyxDQUFDO1FBRXpFLElBQUssQ0FBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRztZQUMzRSxNQUFNLElBQUksdUJBQXVCLENBQUMsQ0FBQyxFQUFFO2dCQUNqQyxHQUFHO2dCQUNILEVBQUU7Z0JBQ0YsV0FBVztnQkFDWCxLQUFLO2FBQ1IsQ0FBQyxDQUFBO1NBRUw7UUFDRCxJQUFLLEdBQUcsS0FBSyxTQUFTLElBQUksUUFBUSxLQUFLLFNBQVM7WUFDNUMsTUFBTSxJQUFJLHVCQUF1QixDQUFDLENBQUMsRUFBRTtnQkFDakMsR0FBRztnQkFDSCxRQUFRO2FBQ1gsRUFBRSwrSUFBK0ksQ0FBQyxDQUFDO1FBRXhKLElBQUssR0FBRyxLQUFLLFNBQVMsRUFBRztZQUNyQixJQUFLLENBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRztnQkFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxZQUFZ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IGlzT2JqZWN0LCB3YWl0IH0gZnJvbSBcIi4uL3V0aWxcIjtcblxuY29uc3QgU1ZHX05TX1VSSSA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG5cbi8vIFRPRE86IG1ha2UgQmV0dGVySFRNTEVsZW1lbnQ8VD4sIGZvciB1c2UgaW4gZWcgY2hpbGRbcmVuXSBmdW5jdGlvblxuLy8gZXh0ZW5kcyBIVE1MRWxlbWVudDogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUVsZW1lbnRSZWdpc3RyeS91cGdyYWRlI0V4YW1wbGVzXG5jbGFzcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIF9odG1sRWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfaXNTdmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9saXN0ZW5lcnM6IFRFdmVudEZ1bmN0aW9uTWFwPFRFdmVudD4gPSB7fTtcbiAgICBwcml2YXRlIF9jYWNoZWRDaGlsZHJlbjogVE1hcDxCZXR0ZXJIVE1MRWxlbWVudD4gPSB7fTtcbiAgICBcbiAgICAvKltTeW1ib2wudG9QcmltaXRpdmVdKGhpbnQpIHtcbiAgICAgY29uc29sZS5sb2coJ2Zyb20gdG9QcmltaXRpdmUsIGhpbnQ6ICcsIGhpbnQsICdcXG50aGlzOiAnLCB0aGlzKTtcbiAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50O1xuICAgICB9XG4gICAgIFxuICAgICB2YWx1ZU9mKCkge1xuICAgICBjb25zb2xlLmxvZygnZnJvbSB2YWx1ZU9mLCB0aGlzOiAnLCB0aGlzKTtcbiAgICAgcmV0dXJuIHRoaXM7XG4gICAgIH1cbiAgICAgXG4gICAgIHRvU3RyaW5nKCkge1xuICAgICBjb25zb2xlLmxvZygnZnJvbSB0b1N0cmluZywgdGhpczogJywgdGhpcyk7XG4gICAgIHJldHVybiB0aGlzO1xuICAgICB9XG4gICAgICovXG4gICAgXG4gICAgLy8gVE9ETzogcXVlcnkgc2hvdWxkIGFsc28gYmUgYSBwcmVkaWNhdGUgZnVuY3Rpb25cbiAgICAvKipDcmVhdGUgYW4gZWxlbWVudCBvZiBgdGFnYC4gT3B0aW9uYWxseSwgc2V0IGl0cyBgdGV4dGAgYW5kIC8gb3IgYGNsc2AqL1xuICAgIGNvbnN0cnVjdG9yKHsgdGFnLCB0ZXh0LCBjbHMgfTogeyB0YWc6IFF1ZXJ5U2VsZWN0b3IsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZyB9KTtcbiAgICAvKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgaWRgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGlkOiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICAvKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgcXVlcnlgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBxdWVyeSwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IHF1ZXJ5OiBRdWVyeVNlbGVjdG9yLCB0ZXh0Pzogc3RyaW5nLCBjbHM/OiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk7XG4gICAgLyoqV3JhcCBhbiBleGlzdGluZyBIVE1MRWxlbWVudC4gT3B0aW9uYWxseSwgc2V0IGl0cyBgdGV4dGAsIGBjbHNgIG9yIGNhY2hlIGBjaGlsZHJlbmAqL1xuICAgIGNvbnN0cnVjdG9yKHsgaHRtbEVsZW1lbnQsIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBodG1sRWxlbWVudDogSFRNTEVsZW1lbnQsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICBjb25zdHJ1Y3RvcihlbGVtT3B0aW9ucykge1xuICAgICAgICBjb25zdCB7IHRhZywgaWQsIGh0bWxFbGVtZW50LCB0ZXh0LCBxdWVyeSwgY2hpbGRyZW4sIGNscyB9ID0gZWxlbU9wdGlvbnM7XG4gICAgICAgIFxuICAgICAgICBpZiAoIFsgdGFnLCBpZCwgaHRtbEVsZW1lbnQsIHF1ZXJ5IF0uZmlsdGVyKHggPT4geCAhPT0gdW5kZWZpbmVkKS5sZW5ndGggPiAxICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEJhZEFyZ3VtZW50c0Ftb3VudEVycm9yKDEsIHtcbiAgICAgICAgICAgICAgICB0YWcsXG4gICAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgICAgaHRtbEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgcXVlcnlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHRhZyAhPT0gdW5kZWZpbmVkICYmIGNoaWxkcmVuICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEJhZEFyZ3VtZW50c0Ftb3VudEVycm9yKDEsIHtcbiAgICAgICAgICAgICAgICB0YWcsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5cbiAgICAgICAgICAgIH0sICdcImNoaWxkcmVuXCIgYW5kIFwidGFnXCIgb3B0aW9ucyBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlLCBiZWNhdXNlIHRhZyBpbXBsaWVzIGNyZWF0aW5nIGEgbmV3IGVsZW1lbnQgYW5kIGNoaWxkcmVuIGltcGxpZXMgZ2V0dGluZyBhbiBleGlzdGluZyBvbmUuJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIHRhZyAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgaWYgKCBbICdzdmcnLCAncGF0aCcgXS5pbmNsdWRlcyh0YWcudG9Mb3dlckNhc2UoKSkgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNTdmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OU19VUkksIHRhZyk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5faHRtbEVsZW1lbnQuc2V0QXR0cmlidXRlKCd4bWxucycsIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCBpZCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgICAgICBpZiAoICFib29sKHRoaXMuX2h0bWxFbGVtZW50KSApXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFbGVtIGNvbnN0cnVjdG9yOiB0cmllZCB0byBnZXQgZWxlbWVudCBieSBpZDogXCIke2lkfVwiLCBidXQgbm8gc3VjaCBlbGVtZW50IGV4aXN0cy5gKVxuICAgICAgICB9IGVsc2UgaWYgKCBxdWVyeSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHF1ZXJ5KTtcbiAgICAgICAgICAgIGlmICggIWJvb2wodGhpcy5faHRtbEVsZW1lbnQpIClcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEVsZW0gY29uc3RydWN0b3I6IHRyaWVkIHRvIGdldCBlbGVtZW50IGJ5IHF1ZXJ5OiBcIiR7cXVlcnl9XCIsIGJ1dCBubyBlbGVtZW50IGZvdW5kLmApXG4gICAgICAgIH0gZWxzZSBpZiAoIGh0bWxFbGVtZW50ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGh0bWxFbGVtZW50O1xuICAgICAgICAgICAgaWYgKCAhYm9vbCh0aGlzLl9odG1sRWxlbWVudCkgKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRWxlbSBjb25zdHJ1Y3RvcjogcGFzc2VkIGV4cGxpY2l0IGh0bWxFbGVtZW50IGFyZywgYnV0IGFyZyB3YXMgZmFsc2V5OiAke2h0bWxFbGVtZW50fWAsIGh0bWxFbGVtZW50KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEJhZEFyZ3VtZW50c0Ftb3VudEVycm9yKDEsIHtcbiAgICAgICAgICAgICAgICB0YWcsXG4gICAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgICAgaHRtbEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgcXVlcnlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICggdGV4dCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMudGV4dCh0ZXh0KTtcbiAgICAgICAgaWYgKCBjbHMgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmNsYXNzKGNscyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIGNoaWxkcmVuICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5jYWNoZUNoaWxkcmVuKGNoaWxkcmVuKTtcbiAgICAgICAgXG4gICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcywgcHJveHkpO1xuICAgICAgICAvKmNvbnN0IHRoYXQgPSB0aGlzO1xuICAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh0aGlzLCB7XG4gICAgICAgICBnZXQodGFyZ2V0OiBCZXR0ZXJIVE1MRWxlbWVudCwgcDogc3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sLCByZWNlaXZlcjogYW55KTogYW55IHtcbiAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdsb2dnaW5nJyk7XG4gICAgICAgICAvLyBjb25zb2xlLmxvZygndGFyZ2V0OiAnLCB0YXJnZXQsXG4gICAgICAgICAvLyAgICAgJ1xcbnRoYXQ6ICcsIHRoYXQsXG4gICAgICAgICAvLyAgICAgJ1xcbnR5cGVvZih0aGF0KTogJywgdHlwZW9mICh0aGF0KSxcbiAgICAgICAgIC8vICAgICAnXFxucDogJywgcCxcbiAgICAgICAgIC8vICAgICAnXFxucmVjZWl2ZXI6ICcsIHJlY2VpdmVyLFxuICAgICAgICAgLy8gICAgICdcXG50aGlzOiAnLCB0aGlzKTtcbiAgICAgICAgIHJldHVybiB0aGF0W3BdO1xuICAgICAgICAgfVxuICAgICAgICAgfSlcbiAgICAgICAgICovXG4gICAgfVxuICAgIFxuICAgIC8qKlJldHVybiB0aGUgd3JhcHBlZCBIVE1MRWxlbWVudCovXG4gICAgZ2V0IGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9odG1sRWxlbWVudDtcbiAgICB9XG4gICAgXG4gICAgLyoqU2V0cyBgdGhpcy5faHRtbEVsZW1lbnRgIHRvIGBuZXdIdG1sRWxlbWVudC5faHRtbEVsZW1lbnRgLlxuICAgICAqIFJlc2V0cyBgdGhpcy5fY2FjaGVkQ2hpbGRyZW5gIGFuZCBjYWNoZXMgYG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbmAuXG4gICAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgZnJvbSBgbmV3SHRtbEVsZW1lbnQuX2xpc3RlbmVyc2AsIHdoaWxlIGtlZXBpbmcgYHRoaXMuX2xpc3RlbmVyc2AuKi9cbiAgICB3cmFwU29tZXRoaW5nRWxzZShuZXdIdG1sRWxlbWVudDogQmV0dGVySFRNTEVsZW1lbnQpOiB0aGlzXG4gICAgLyoqU2V0cyBgdGhpcy5faHRtbEVsZW1lbnRgIHRvIGBuZXdIdG1sRWxlbWVudGAuXG4gICAgICogS2VlcHMgYHRoaXMuX2xpc3RlbmVyc2AuXG4gICAgICogTk9URTogdGhpcyByZWluaXRpYWxpemVzIGB0aGlzLl9jYWNoZWRDaGlsZHJlbmAgYW5kIGFsbCBldmVudCBsaXN0ZW5lcnMgYmVsb25naW5nIHRvIGBuZXdIdG1sRWxlbWVudGAgYXJlIGxvc3QuIFBhc3MgYSBgQmV0dGVySFRNTEVsZW1lbnRgIHRvIGtlZXAgdGhlbS4qL1xuICAgIHdyYXBTb21ldGhpbmdFbHNlKG5ld0h0bWxFbGVtZW50OiBOb2RlKTogdGhpc1xuICAgIHdyYXBTb21ldGhpbmdFbHNlKG5ld0h0bWxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX2NhY2hlZENoaWxkcmVuID0ge307XG4gICAgICAgIGlmICggbmV3SHRtbEVsZW1lbnQgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnJlcGxhY2VXaXRoKG5ld0h0bWxFbGVtZW50LmUpO1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBuZXdIdG1sRWxlbWVudC5lO1xuICAgICAgICAgICAgZm9yICggbGV0IFsgX2tleSwgX2NhY2hlZENoaWxkIF0gb2YgZW51bWVyYXRlKG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbikgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoX2tleSBhcyBzdHJpbmcsIF9jYWNoZWRDaGlsZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh0aGlzLl9jYWNoZWRDaGlsZHJlbikubGVuZ3RoXG4gICAgICAgICAgICAgICAgIT09IE9iamVjdC5rZXlzKG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbikubGVuZ3RoXG4gICAgICAgICAgICAgICAgfHxcbiAgICAgICAgICAgICAgICBPYmplY3QudmFsdWVzKHRoaXMuX2NhY2hlZENoaWxkcmVuKS5maWx0ZXIodiA9PiB2ICE9PSB1bmRlZmluZWQpLmxlbmd0aFxuICAgICAgICAgICAgICAgICE9PSBPYmplY3QudmFsdWVzKG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbikuZmlsdGVyKHYgPT4gdiAhPT0gdW5kZWZpbmVkKS5sZW5ndGhcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgd3JhcFNvbWV0aGluZ0Vsc2UgdGhpcy5fY2FjaGVkQ2hpbGRyZW4gbGVuZ3RoICE9PSBuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW4ubGVuZ3RoYCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyA6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdIdG1sRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbih7IC4uLnRoaXMuX2xpc3RlbmVycywgLi4ubmV3SHRtbEVsZW1lbnQuX2xpc3RlbmVycywgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBObyB3YXkgdG8gZ2V0IG5ld0h0bWxFbGVtZW50IGV2ZW50IGxpc3RlbmVycyBiZXNpZGVzIGhhY2tpbmcgRWxlbWVudC5wcm90b3R5cGVcbiAgICAgICAgICAgIHRoaXMub24odGhpcy5fbGlzdGVuZXJzKTtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnJlcGxhY2VXaXRoKG5ld0h0bWxFbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gbmV3SHRtbEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvLyAqKiogIEJhc2ljXG4gICAgLyoqU2V0IHRoZSBlbGVtZW50J3MgaW5uZXJIVE1MKi9cbiAgICBodG1sKGh0bWw6IHN0cmluZyk6IHRoaXM7XG4gICAgLyoqR2V0IHRoZSBlbGVtZW50J3MgaW5uZXJIVE1MKi9cbiAgICBodG1sKCk6IHN0cmluZztcbiAgICBodG1sKGh0bWw/KSB7XG4gICAgICAgIGlmICggaHRtbCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5pbm5lckhUTUw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmUuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlNldCB0aGUgZWxlbWVudCdzIGlubmVyVGV4dCovXG4gICAgdGV4dCh0eHQ6IHN0cmluZyB8IG51bWJlcik6IHRoaXM7XG4gICAgLyoqR2V0IHRoZSBlbGVtZW50J3MgaW5uZXJUZXh0Ki9cbiAgICB0ZXh0KCk6IHN0cmluZztcbiAgICB0ZXh0KHR4dD8pIHtcbiAgICAgICAgaWYgKCB0eHQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuaW5uZXJUZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lLmlubmVyVGV4dCA9IHR4dDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvKipTZXQgdGhlIGlkIG9mIHRoZSBlbGVtZW50Ki9cbiAgICBpZChpZDogc3RyaW5nKTogdGhpcztcbiAgICAvKipHZXQgdGhlIGlkIG9mIHRoZSBlbGVtZW50Ki9cbiAgICBpZCgpOiBzdHJpbmc7XG4gICAgaWQoaWQ/KSB7XG4gICAgICAgIGlmICggaWQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuaWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmUuaWQgPSBpZDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKkZvciBlYWNoIGB7PHN0eWxlQXR0cj46IDxzdHlsZVZhbD59YCBwYWlyLCBzZXQgdGhlIGBzdHlsZVtzdHlsZUF0dHJdYCB0byBgc3R5bGVWYWxgLiovXG4gICAgY3NzKGNzczogUGFydGlhbDxDc3NPcHRpb25zPik6IHRoaXNcbiAgICAvKipHZXQgYHN0eWxlW2Nzc11gKi9cbiAgICBjc3MoY3NzOiBzdHJpbmcpOiBzdHJpbmdcbiAgICBjc3MoY3NzKSB7XG4gICAgICAgIGlmICggdHlwZW9mIGNzcyA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLnN0eWxlW2Nzc107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKCBsZXQgWyBzdHlsZUF0dHIsIHN0eWxlVmFsIF0gb2YgZW51bWVyYXRlKGNzcykgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5zdHlsZVs8c3RyaW5nPiBzdHlsZUF0dHJdID0gc3R5bGVWYWw7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipSZW1vdmUgdGhlIHZhbHVlIG9mIHRoZSBwYXNzZWQgc3R5bGUgcHJvcGVydGllcyovXG4gICAgdW5jc3MoLi4ucmVtb3ZlUHJvcHM6IChrZXlvZiBDc3NPcHRpb25zKVtdKTogdGhpcyB7XG4gICAgICAgIGxldCBjc3MgPSB7fTtcbiAgICAgICAgZm9yICggbGV0IHByb3Agb2YgcmVtb3ZlUHJvcHMgKVxuICAgICAgICAgICAgY3NzW3Byb3BdID0gJyc7XG4gICAgICAgIHJldHVybiB0aGlzLmNzcyhjc3MpO1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgaXMoZWxlbWVudDogQmV0dGVySFRNTEVsZW1lbnQpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9pcy9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpO1xuICAgIH1cbiAgICBcbiAgICAvKlxuICAgICBhbmltYXRlKG9wdHM6IEFuaW1hdGVPcHRpb25zKSB7XG4gICAgIC8vIHNlZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL0NTU19BbmltYXRpb25zL1RpcHNcbiAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICAgfVxuICAgICAqL1xuICAgIFxuICAgIC8vICoqKiAgQ2xhc3Nlc1xuICAgIC8qKmAuY2xhc3NOYW1lID0gY2xzYCovXG4gICAgY2xhc3MoY2xzOiBzdHJpbmcpOiB0aGlzO1xuICAgIC8qKlJldHVybiB0aGUgZmlyc3QgY2xhc3MgdGhhdCBtYXRjaGVzIGBjbHNgIHByZWRpY2F0ZS4qL1xuICAgIGNsYXNzKGNsczogVFJldHVybkJvb2xlYW4pOiBzdHJpbmc7XG4gICAgLyoqUmV0dXJuIGEgc3RyaW5nIGFycmF5IG9mIHRoZSBlbGVtZW50J3MgY2xhc3NlcyAobm90IGEgY2xhc3NMaXN0KSovXG4gICAgY2xhc3MoKTogc3RyaW5nW107XG4gICAgY2xhc3MoY2xzPykge1xuICAgICAgICBpZiAoIGNscyA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5lLmNsYXNzTGlzdCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIGlzRnVuY3Rpb24oY2xzKSApIHtcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuZS5jbGFzc0xpc3QpLmZpbmQoY2xzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICggdGhpcy5faXNTdmcgKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIC8vIG5vaW5zcGVjdGlvbiBKU0NvbnN0YW50UmVhc3NpZ25tZW50XG4gICAgICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdCA9IFsgY2xzIF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZS5jbGFzc05hbWUgPSBjbHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBhZGRDbGFzcyhjbHM6IHN0cmluZywgLi4uY2xzZXM6IHN0cmluZ1tdKTogdGhpcyB7XG4gICAgICAgIHRoaXMuZS5jbGFzc0xpc3QuYWRkKGNscyk7XG4gICAgICAgIGZvciAoIGxldCBjIG9mIGNsc2VzIClcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QuYWRkKGMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcmVtb3ZlQ2xhc3MoY2xzOiBUUmV0dXJuQm9vbGVhbik6IHRoaXM7XG4gICAgcmVtb3ZlQ2xhc3MoY2xzOiBzdHJpbmcsIC4uLmNsc2VzOiBzdHJpbmdbXSk6IHRoaXM7XG4gICAgcmVtb3ZlQ2xhc3MoY2xzLCAuLi5jbHNlcykge1xuICAgICAgICBpZiAoIGlzRnVuY3Rpb248Ym9vbGVhbj4oY2xzKSApIHtcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3MoY2xzKSk7XG4gICAgICAgICAgICBpZiAoIGJvb2woY2xzZXMpIClcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ3JlbW92ZUNsYXNzLCBjbHMgaXMgVFJldHVybkJvb2xlYW4sIGdvdCAuLi5jbHNlcyBidXQgc2hvdWxkbnQgaGF2ZScpXG4gICAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QucmVtb3ZlKGNscyk7XG4gICAgICAgICAgICBmb3IgKCBsZXQgYyBvZiBjbHNlcyApXG4gICAgICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZW1vdmUoYyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHJlcGxhY2VDbGFzcyhvbGRUb2tlbjogVFJldHVybkJvb2xlYW4sIG5ld1Rva2VuOiBzdHJpbmcpOiB0aGlzO1xuICAgIHJlcGxhY2VDbGFzcyhvbGRUb2tlbjogc3RyaW5nLCBuZXdUb2tlbjogc3RyaW5nKTogdGhpc1xuICAgIHJlcGxhY2VDbGFzcyhvbGRUb2tlbiwgbmV3VG9rZW4pIHtcbiAgICAgICAgaWYgKCBpc0Z1bmN0aW9uPGJvb2xlYW4+KG9sZFRva2VuKSApIHtcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QucmVwbGFjZSh0aGlzLmNsYXNzKG9sZFRva2VuKSwgbmV3VG9rZW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZXBsYWNlKG9sZFRva2VuLCBuZXdUb2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHRvZ2dsZUNsYXNzKGNsczogVFJldHVybkJvb2xlYW4sIGZvcmNlPzogYm9vbGVhbik6IHRoaXNcbiAgICB0b2dnbGVDbGFzcyhjbHM6IHN0cmluZywgZm9yY2U/OiBib29sZWFuKTogdGhpc1xuICAgIHRvZ2dsZUNsYXNzKGNscywgZm9yY2UpIHtcbiAgICAgICAgaWYgKCBpc0Z1bmN0aW9uPGJvb2xlYW4+KGNscykgKVxuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC50b2dnbGUodGhpcy5jbGFzcyhjbHMpLCBmb3JjZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QudG9nZ2xlKGNscywgZm9yY2UpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqUmV0dXJucyBgdGhpcy5lLmNsYXNzTGlzdC5jb250YWlucyhjbHMpYCAqL1xuICAgIGhhc0NsYXNzKGNsczogc3RyaW5nKTogYm9vbGVhblxuICAgIC8qKlJldHVybnMgd2hldGhlciBgdGhpc2AgaGFzIGEgY2xhc3MgdGhhdCBtYXRjaGVzIHBhc3NlZCBmdW5jdGlvbiAqL1xuICAgIGhhc0NsYXNzKGNsczogVFJldHVybkJvb2xlYW4pOiBib29sZWFuXG4gICAgaGFzQ2xhc3MoY2xzKSB7XG4gICAgICAgIGlmICggaXNGdW5jdGlvbjxib29sZWFuPihjbHMpICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xhc3MoY2xzKSAhPT0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5jbGFzc0xpc3QuY29udGFpbnMoY2xzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyAqKiogIE5vZGVzXG4gICAgLyoqSW5zZXJ0IGF0IGxlYXN0IG9uZSBgbm9kZWAganVzdCBhZnRlciBgdGhpc2AuIEFueSBgbm9kZWAgY2FuIGJlIGVpdGhlciBgQmV0dGVySFRNTEVsZW1lbnRgcyBvciB2YW5pbGxhIGBOb2RlYC4qL1xuICAgIGFmdGVyKC4uLm5vZGVzOiBBcnJheTxCZXR0ZXJIVE1MRWxlbWVudCB8IE5vZGU+KTogdGhpcyB7XG4gICAgICAgIGZvciAoIGxldCBub2RlIG9mIG5vZGVzICkge1xuICAgICAgICAgICAgaWYgKCBub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5hZnRlcihub2RlLmUpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuZS5hZnRlcihub2RlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqSW5zZXJ0IGB0aGlzYCBqdXN0IGFmdGVyIGEgYEJldHRlckhUTUxFbGVtZW50YCBvciBhIHZhbmlsbGEgYE5vZGVgLiovXG4gICAgaW5zZXJ0QWZ0ZXIobm9kZTogQmV0dGVySFRNTEVsZW1lbnQgfCBIVE1MRWxlbWVudCk6IHRoaXMge1xuICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICBub2RlLmUuYWZ0ZXIodGhpcy5lKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbm9kZS5hZnRlcih0aGlzLmUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqSW5zZXJ0IGF0IGxlYXN0IG9uZSBgbm9kZWAgYWZ0ZXIgdGhlIGxhc3QgY2hpbGQgb2YgYHRoaXNgLlxuICAgICAqIEFueSBgbm9kZWAgY2FuIGJlIGVpdGhlciBhIGBCZXR0ZXJIVE1MRWxlbWVudGAsIGEgdmFuaWxsYSBgTm9kZWAsXG4gICAgICogYSBge3NvbWVLZXk6IEJldHRlckhUTUxFbGVtZW50fWAgcGFpcnMgb2JqZWN0LCBvciBhIGBbc29tZUtleSwgQmV0dGVySFRNTEVsZW1lbnRdYCB0dXBsZS4qL1xuICAgIGFwcGVuZCguLi5ub2RlczogQXJyYXk8QmV0dGVySFRNTEVsZW1lbnQgfCBOb2RlIHwgVE1hcDxCZXR0ZXJIVE1MRWxlbWVudD4gfCBbIHN0cmluZywgQmV0dGVySFRNTEVsZW1lbnQgXT4pOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IG5vZGUgb2Ygbm9kZXMgKSB7XG4gICAgICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICAgICAgdGhpcy5lLmFwcGVuZChub2RlLmUpO1xuICAgICAgICAgICAgZWxzZSBpZiAoIG5vZGUgaW5zdGFuY2VvZiBOb2RlIClcbiAgICAgICAgICAgICAgICB0aGlzLmUuYXBwZW5kKG5vZGUpO1xuICAgICAgICAgICAgZWxzZSBpZiAoIEFycmF5LmlzQXJyYXkobm9kZSkgKVxuICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVBcHBlbmQoWyBub2RlIF0pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVBcHBlbmQobm9kZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqQXBwZW5kIGB0aGlzYCB0byBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgb3IgYSB2YW5pbGxhIGBOb2RlYCovXG4gICAgYXBwZW5kVG8obm9kZTogQmV0dGVySFRNTEVsZW1lbnQgfCBIVE1MRWxlbWVudCk6IHRoaXMge1xuICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICBub2RlLmUuYXBwZW5kKHRoaXMuZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5vZGUuYXBwZW5kKHRoaXMuZSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqSW5zZXJ0IGF0IGxlYXN0IG9uZSBgbm9kZWAganVzdCBiZWZvcmUgYHRoaXNgLiBBbnkgYG5vZGVgIGNhbiBiZSBlaXRoZXIgYEJldHRlckhUTUxFbGVtZW50YHMgb3IgdmFuaWxsYSBgTm9kZWAuKi9cbiAgICBiZWZvcmUoLi4ubm9kZXM6IEFycmF5PEJldHRlckhUTUxFbGVtZW50IHwgTm9kZT4pOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IG5vZGUgb2Ygbm9kZXMgKSB7XG4gICAgICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICAgICAgdGhpcy5lLmJlZm9yZShub2RlLmUpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuZS5iZWZvcmUobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKkluc2VydCBgdGhpc2AganVzdCBiZWZvcmUgYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9yIGEgdmFuaWxsYSBgTm9kZWBzLiovXG4gICAgaW5zZXJ0QmVmb3JlKG5vZGU6IEJldHRlckhUTUxFbGVtZW50IHwgSFRNTEVsZW1lbnQpOiB0aGlzIHtcbiAgICAgICAgaWYgKCBub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKVxuICAgICAgICAgICAgbm9kZS5lLmJlZm9yZSh0aGlzLmUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBub2RlLmJlZm9yZSh0aGlzLmUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcmVwbGFjZUNoaWxkKG5ld0NoaWxkOiBOb2RlLCBvbGRDaGlsZDogTm9kZSk6IHRoaXM7XG4gICAgcmVwbGFjZUNoaWxkKG5ld0NoaWxkOiBCZXR0ZXJIVE1MRWxlbWVudCwgb2xkQ2hpbGQ6IEJldHRlckhUTUxFbGVtZW50KTogdGhpcztcbiAgICByZXBsYWNlQ2hpbGQobmV3Q2hpbGQsIG9sZENoaWxkKSB7XG4gICAgICAgIHRoaXMuZS5yZXBsYWNlQ2hpbGQobmV3Q2hpbGQsIG9sZENoaWxkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgX2NhY2hlKGtleTogc3RyaW5nLCBjaGlsZDogQmV0dGVySFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGhpc1trZXldID0gY2hpbGQ7XG4gICAgICAgIHRoaXMuX2NhY2hlZENoaWxkcmVuW2tleV0gPSBjaGlsZDtcbiAgICB9XG4gICAgXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIGNoaWxkXWAgcGFpciwgYGFwcGVuZChjaGlsZClgIGFuZCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYC4gKi9cbiAgICBjYWNoZUFwcGVuZChrZXlDaGlsZFBhaXJzOiBUTWFwPEJldHRlckhUTUxFbGVtZW50Pik6IHRoaXNcbiAgICAvKipGb3IgZWFjaCBgW2tleSwgY2hpbGRdYCB0dXBsZSwgYGFwcGVuZChjaGlsZClgIGFuZCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYC4gKi9cbiAgICBjYWNoZUFwcGVuZChrZXlDaGlsZFBhaXJzOiBbIHN0cmluZywgQmV0dGVySFRNTEVsZW1lbnQgXVtdKTogdGhpc1xuICAgIGNhY2hlQXBwZW5kKGtleUNoaWxkUGFpcnMpIHtcbiAgICAgICAgY29uc3QgX2NhY2hlQXBwZW5kID0gKF9rZXk6IHN0cmluZywgX2NoaWxkOiBCZXR0ZXJIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hcHBlbmQoX2NoaWxkKTtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlKF9rZXksIF9jaGlsZCk7XG4gICAgICAgIH07XG4gICAgICAgIGlmICggQXJyYXkuaXNBcnJheShrZXlDaGlsZFBhaXJzKSApIHtcbiAgICAgICAgICAgIGZvciAoIGxldCBbIGtleSwgY2hpbGQgXSBvZiBrZXlDaGlsZFBhaXJzIClcbiAgICAgICAgICAgICAgICBfY2FjaGVBcHBlbmQoa2V5LCBjaGlsZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKCBsZXQgWyBrZXksIGNoaWxkIF0gb2YgZW51bWVyYXRlKGtleUNoaWxkUGFpcnMpIClcbiAgICAgICAgICAgICAgICBfY2FjaGVBcHBlbmQoa2V5LCBjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKkdldCBhIGNoaWxkIHdpdGggYHF1ZXJ5U2VsZWN0b3JgIGFuZCByZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9mIGl0Ki9cbiAgICBjaGlsZDxLIGV4dGVuZHMgSFRNTFRhZz4oc2VsZWN0b3I6IEspOiBCZXR0ZXJIVE1MRWxlbWVudDtcbiAgICAvKipHZXQgYSBjaGlsZCB3aXRoIGBxdWVyeVNlbGVjdG9yYCBhbmQgcmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBvZiBpdCovXG4gICAgY2hpbGQoc2VsZWN0b3I6IHN0cmluZyk6IEJldHRlckhUTUxFbGVtZW50O1xuICAgIGNoaWxkKHNlbGVjdG9yKSB7XG4gICAgICAgIHJldHVybiBuZXcgQmV0dGVySFRNTEVsZW1lbnQoeyBodG1sRWxlbWVudCA6IHRoaXMuZS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSB9KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqUmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBsaXN0IG9mIGFsbCBjaGlsZHJlbiAqL1xuICAgIGNoaWxkcmVuKCk6IEJldHRlckhUTUxFbGVtZW50W107XG4gICAgLyoqUmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBsaXN0IG9mIGFsbCBjaGlsZHJlbiBzZWxlY3RlZCBieSBgc2VsZWN0b3JgICovXG4gICAgY2hpbGRyZW48SyBleHRlbmRzIEhUTUxUYWc+KHNlbGVjdG9yOiBLKTogQmV0dGVySFRNTEVsZW1lbnRbXTtcbiAgICAvKipSZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIGxpc3Qgb2YgYWxsIGNoaWxkcmVuIHNlbGVjdGVkIGJ5IGBzZWxlY3RvcmAgKi9cbiAgICBjaGlsZHJlbihzZWxlY3Rvcjogc3RyaW5nIHwgSFRNTFRhZyk6IEJldHRlckhUTUxFbGVtZW50W107XG4gICAgY2hpbGRyZW4oc2VsZWN0b3I/KSB7XG4gICAgICAgIGxldCBjaGlsZHJlblZhbmlsbGE7XG4gICAgICAgIGxldCBjaGlsZHJlbkNvbGxlY3Rpb247XG4gICAgICAgIGlmICggc2VsZWN0b3IgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGNoaWxkcmVuQ29sbGVjdGlvbiA9IHRoaXMuZS5jaGlsZHJlbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoaWxkcmVuQ29sbGVjdGlvbiA9IHRoaXMuZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgfVxuICAgICAgICBjaGlsZHJlblZhbmlsbGEgPSA8SFRNTEVsZW1lbnRbXT4gQXJyYXkuZnJvbShjaGlsZHJlbkNvbGxlY3Rpb24pO1xuICAgICAgICBjb25zdCB0b0VsZW0gPSAoYzogSFRNTEVsZW1lbnQpID0+IG5ldyBCZXR0ZXJIVE1MRWxlbWVudCh7IGh0bWxFbGVtZW50IDogYyB9KTtcbiAgICAgICAgcmV0dXJuIGNoaWxkcmVuVmFuaWxsYS5tYXAodG9FbGVtKTtcbiAgICB9XG4gICAgXG4gICAgY2xvbmUoZGVlcD86IGJvb2xlYW4pOiBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIG5ldyBCZXR0ZXJIVE1MRWxlbWVudCh7IGh0bWxFbGVtZW50IDogdGhpcy5lLmNsb25lTm9kZShkZWVwKSB9KTtcbiAgICB9XG4gICAgXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIHNlbGVjdG9yXWAgcGFpciwgd2hlcmUgYHNlbGVjdG9yYCBpcyBlaXRoZXIgYW4gYEhUTUxUYWdgIG9yIGEgYHN0cmluZ2AsIGdldCBgdGhpcy5jaGlsZChzZWxlY3RvcilgLCBhbmQgc3RvcmUgaXQgaW4gYHRoaXNba2V5XWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgZGlyZWN0bHlcbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHsgaWQ6ICduYXZiYXInIH0pO1xuICAgICAqIG5hdmJhci5jYWNoZUNoaWxkcmVuKHsgaG9tZTogJy5uYXZiYXItaXRlbS1ob21lJywgYWJvdXQ6ICcubmF2YmFyLWl0ZW0tYWJvdXQnIH0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogbmF2YmFyLmFib3V0LmNzcyguLi4pO1xuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGluZGlyZWN0bHkgdGhyb3VnaCBgY2hpbGRyZW5gIGNvbnN0cnVjdG9yIG9wdGlvblxuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oeyBpZDogJ25hdmJhcicsIGNoaWxkcmVuOiB7IGhvbWU6ICcubmF2YmFyLWl0ZW0taG9tZScsIGFib3V0OiAnLm5hdmJhci1pdGVtLWFib3V0JyB9fSk7XG4gICAgICogbmF2YmFyLmhvbWUudG9nZ2xlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBuYXZiYXIuYWJvdXQuY3NzKC4uLik7XG4gICAgICogQHNlZSB0aGlzLmNoaWxkKi9cbiAgICBjYWNoZUNoaWxkcmVuKHF1ZXJ5TWFwOiBUTWFwPFF1ZXJ5U2VsZWN0b3I+KTogdGhpc1xuICAgIC8qKkZvciBlYWNoIGBba2V5LCBzZWxlY3Rvcl1gIHBhaXIsIHdoZXJlIGBzZWxlY3RvcmAgaXMgYSByZWN1cnNpdmUgYHtzdWJzZWxlY3Rvcjoga2V5U2VsZWN0b3JPYmp9YCBvYmplY3QsXG4gICAgICogZXh0cmFjdCBgdGhpcy5jaGlsZChzdWJzZWxlY3RvcilgLCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYCwgdGhlbiBjYWxsIGB0aGlzW2tleV0uY2FjaGVDaGlsZHJlbmAgcGFzc2luZyB0aGUgcmVjdXJzaXZlIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzaW5nIGBjYWNoZUNoaWxkcmVuYCBkaXJlY3RseVxuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oeyBpZDogJ25hdmJhcicgfSk7XG4gICAgICogbmF2YmFyLmNhY2hlQ2hpbGRyZW4oe1xuICAgICAqICAgICAgaG9tZToge1xuICAgICAqICAgICAgICAgICcubmF2YmFyLWl0ZW0taG9tZSc6IHtcbiAgICAgKiAgICAgICAgICAgICAgbmV3czogJy5uYXZiYXItc3ViaXRlbS1uZXdzLFxuICAgICAqICAgICAgICAgICAgICBzdXBwb3J0OiAnLm5hdmJhci1zdWJpdGVtLXN1cHBvcnQnXG4gICAgICogICAgICAgICAgfVxuICAgICAqICAgICAgfVxuICAgICAqICB9KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIG5hdmJhci5ob21lLm5ld3MuY3NzKC4uLik7XG4gICAgICogbmF2YmFyLmhvbWUuc3VwcG9ydC5wb2ludGVyZG93biguLi4pO1xuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGluZGlyZWN0bHkgdGhyb3VnaCBgY2hpbGRyZW5gIGNvbnN0cnVjdG9yIG9wdGlvblxuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oe3F1ZXJ5OiAnI25hdmJhcicsIGNoaWxkcmVuOiB7XG4gICAgICogICAgICBob21lOiB7XG4gICAgICogICAgICAgICAgJy5uYXZiYXItaXRlbS1ob21lJzoge1xuICAgICAqICAgICAgICAgICAgICBuZXdzOiAnLm5hdmJhci1zdWJpdGVtLW5ld3MsXG4gICAgICogICAgICAgICAgICAgIHN1cHBvcnQ6ICcubmF2YmFyLXN1Yml0ZW0tc3VwcG9ydCdcbiAgICAgKiAgICAgICAgICB9XG4gICAgICogICAgICB9XG4gICAgICogIH19KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIG5hdmJhci5ob21lLm5ld3MuY3NzKC4uLik7XG4gICAgICogbmF2YmFyLmhvbWUuc3VwcG9ydC5wb2ludGVyZG93biguLi4pO1xuICAgICAqIEBzZWUgdGhpcy5jaGlsZCovXG4gICAgY2FjaGVDaGlsZHJlbihyZWN1cnNpdmVRdWVyeU1hcDogVFJlY01hcDxRdWVyeVNlbGVjdG9yPik6IHRoaXNcbiAgICBjYWNoZUNoaWxkcmVuKGJoZU1hcDogVE1hcDxCZXR0ZXJIVE1MRWxlbWVudD4pOiB0aGlzXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIHNlbGVjdG9yXWAgcGFpciwgd2hlcmUgYHNlbGVjdG9yYCBpcyBhIGBCZXR0ZXJIVE1MRWxlbWVudGAsIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGRpcmVjdGx5XG4gICAgICogY29uc3QgaG9tZSA9IGVsZW0oeyBxdWVyeTogJy5uYXZiYXItaXRlbS1ob21lJyB9KTtcbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHsgaWQ6ICduYXZiYXInIH0pO1xuICAgICAqIG5hdmJhci5jYWNoZUNoaWxkcmVuKHsgaG9tZSB9KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGluZGlyZWN0bHkgdGhyb3VnaCBgY2hpbGRyZW5gIGNvbnN0cnVjdG9yIG9wdGlvblxuICAgICAqIGNvbnN0IGhvbWUgPSBlbGVtKHsgcXVlcnk6ICcubmF2YmFyLWl0ZW0taG9tZScgfSk7XG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7aWQ6ICduYXZiYXInLCBjaGlsZHJlbjogeyBob21lIH19KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIEBzZWUgdGhpcy5jaGlsZCovXG4gICAgXG4gICAgY2FjaGVDaGlsZHJlbihyZWN1cnNpdmVCSEVNYXA6IFRSZWNNYXA8QmV0dGVySFRNTEVsZW1lbnQ+KTogdGhpc1xuICAgIC8qKmtleTogc3RyaW5nLiB2YWx1ZTogZWl0aGVyIFwic2VsZWN0b3Igc3RyaW5nXCIgT1Ige1wic2VsZWN0b3Igc3RyaW5nXCI6IDxyZWN1cnNlIGRvd24+fSovXG4gICAgY2FjaGVDaGlsZHJlbihtYXApIHtcbiAgICAgICAgZm9yICggbGV0IFsga2V5LCB2YWx1ZSBdIG9mIGVudW1lcmF0ZShtYXApICkge1xuICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gICAgICAgICAgICBpZiAoIGlzT2JqZWN0KHZhbHVlKSApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHZhbHVlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlKGtleSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICggZW50cmllc1sxXSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBjYWNoZUNoaWxkcmVuKCkgcmVjZWl2ZWQgcmVjdXJzaXZlIG9iaiB3aXRoIG1vcmUgdGhhbiAxIHNlbGVjdG9yIGZvciBhIGtleS4gVXNpbmcgb25seSAwdGggc2VsZWN0b3JgLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtdWx0aXBsZSBzZWxlY3RvcnNcIiA6IGVudHJpZXMubWFwKGUgPT4gZVswXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzIDogdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gb25seSBmaXJzdCBiZWNhdXNlIDE6MSBmb3Iga2V5OnNlbGVjdG9yLlxuICAgICAgICAgICAgICAgICAgICAvLyAoaWUgY2FuJ3QgZG8ge3JpZ2h0OiB7LnJpZ2h0OiB7Li4ufSwgLnJpZ2h0Mjogey4uLn19KVxuICAgICAgICAgICAgICAgICAgICBsZXQgWyBzZWxlY3Rvciwgb2JqIF0gPSBlbnRyaWVzWzBdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShrZXksIHRoaXMuY2hpbGQoc2VsZWN0b3IpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpc1trZXldLmNhY2hlQ2hpbGRyZW4ob2JqKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHR5cGUgPT09IFwic3RyaW5nXCIgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoa2V5LCB0aGlzLmNoaWxkKHZhbHVlKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgY2FjaGVDaGlsZHJlbiwgYmFkIHZhbHVlIHR5cGU6IFwiJHt0eXBlfVwiLiBrZXk6IFwiJHtrZXl9XCIsIHZhbHVlOiBcIiR7dmFsdWV9XCIuIG1hcDpgLCBtYXAsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qKlJlbW92ZSBhbGwgY2hpbGRyZW4gZnJvbSBET00qL1xuICAgIGVtcHR5KCk6IHRoaXMge1xuICAgICAgICAvLyBUT0RPOiBpcyB0aGlzIGZhc3RlciB0aGFuIGlubmVySFRNTCA9IFwiXCI/XG4gICAgICAgIHdoaWxlICggdGhpcy5lLmZpcnN0Q2hpbGQgKVxuICAgICAgICAgICAgdGhpcy5lLnJlbW92ZUNoaWxkKHRoaXMuZS5maXJzdENoaWxkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKlJlbW92ZSBlbGVtZW50IGZyb20gRE9NKi9cbiAgICByZW1vdmUoKTogdGhpcyB7XG4gICAgICAgIHRoaXMuZS5yZW1vdmUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE86IHJlY3Vyc2l2ZWx5IHlpZWxkIGNoaWxkcmVuXG4gICAgLy8gICh1bmxpa2UgLmNoaWxkcmVuKCksIHRoaXMgZG9lc24ndCByZXR1cm4gb25seSB0aGUgZmlyc3QgbGV2ZWwpXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZpbmQoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vZmluZC9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBmaXJzdCgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9maXJzdC9cbiAgICAgICAgLy8gdGhpcy5lLmZpcnN0Q2hpbGRcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBsYXN0KCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2xhc3QvXG4gICAgICAgIC8vIHRoaXMuZS5sYXN0Q2hpbGRcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBuZXh0KCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG5vdCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBwYXJlbnQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgcGFyZW50cygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8vICoqKiAgRXZlbnRzXG4gICAgXG4gICAgb24oZXZUeXBlRm5QYWlyczogVEV2ZW50RnVuY3Rpb25NYXA8VEV2ZW50Piwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIGZvciAoIGxldCBbIGV2VHlwZSwgZXZGbiBdIG9mIGVudW1lcmF0ZShldlR5cGVGblBhaXJzKSApIHtcbiAgICAgICAgICAgIGNvbnN0IF9mID0gZnVuY3Rpb24gX2YoZXZ0KSB7XG4gICAgICAgICAgICAgICAgZXZGbihldnQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuZS5hZGRFdmVudExpc3RlbmVyKGV2VHlwZSwgX2YsIG9wdGlvbnMpO1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzW2V2VHlwZV0gPSBfZjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgb25lKGV2VHlwZTogVEV2ZW50LCBsaXN0ZW5lcjogRnVuY3Rpb25SZWNpZXZlc0V2ZW50PFRFdmVudD4sIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICBjb25zdCBldlR5cGVGblBhaXJzID0ge307XG4gICAgICAgIGV2VHlwZUZuUGFpcnNbZXZUeXBlXSA9IGxpc3RlbmVyO1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyA9PT0gdW5kZWZpbmVkID8geyBvbmNlIDogdHJ1ZSB9IDogeyAuLi5vcHRpb25zLCBvbmNlIDogdHJ1ZSB9O1xuICAgICAgICByZXR1cm4gdGhpcy5vbihldlR5cGVGblBhaXJzLCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgLyoqUmVtb3ZlIGBldmVudGAgZnJvbSB3cmFwcGVkIGVsZW1lbnQncyBldmVudCBsaXN0ZW5lcnMsIGJ1dCBrZWVwIHRoZSByZW1vdmVkIGxpc3RlbmVyIGluIGNhY2hlLlxuICAgICAqIFRoaXMgaXMgdXNlZnVsIGZvciBsYXRlciB1bmJsb2NraW5nKi9cbiAgICBibG9ja0xpc3RlbmVyKGV2ZW50OiBURXZlbnQpIHtcbiAgICAgICAgbGV0IGxpc3RlbmVyID0gdGhpcy5fbGlzdGVuZXJzW2V2ZW50XTtcbiAgICAgICAgaWYgKCBsaXN0ZW5lciA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihgYmxvY2tMaXN0ZW5lcihldmVudCk6IHRoaXMuX2xpc3RlbmVyc1tldmVudF0gaXMgdW5kZWZpbmVkLiBldmVudDpgLCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHVuYmxvY2tMaXN0ZW5lcihldmVudDogVEV2ZW50KSB7XG4gICAgICAgIGxldCBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tldmVudF07XG4gICAgICAgIGlmICggbGlzdGVuZXIgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oYHVuYmxvY2tMaXN0ZW5lcihldmVudCk6IHRoaXMuX2xpc3RlbmVyc1tldmVudF0gaXMgdW5kZWZpbmVkLiBldmVudDpgLCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qXG4gICAgIENocm9ub2xvZ3k6XG4gICAgIG1vdXNlZG93biAgICAgIHRvdWNoc3RhcnRcdHBvaW50ZXJkb3duXG4gICAgIG1vdXNlZW50ZXJcdFx0ICAgICAgICAgICAgcG9pbnRlcmVudGVyXG4gICAgIG1vdXNlbGVhdmVcdFx0ICAgICAgICAgICAgcG9pbnRlcmxlYXZlXG4gICAgIG1vdXNlbW92ZSAgICAgIHRvdWNobW92ZVx0cG9pbnRlcm1vdmVcbiAgICAgbW91c2VvdXRcdFx0ICAgICAgICAgICAgcG9pbnRlcm91dFxuICAgICBtb3VzZW92ZXJcdFx0ICAgICAgICAgICAgcG9pbnRlcm92ZXJcbiAgICAgbW91c2V1cFx0ICAgIHRvdWNoZW5kICAgIHBvaW50ZXJ1cFxuICAgICAqL1xuICAgIC8qKiBBZGQgYSBgdG91Y2hzdGFydGAgZXZlbnQgbGlzdGVuZXIuIFRoaXMgaXMgdGhlIGZhc3QgYWx0ZXJuYXRpdmUgdG8gYGNsaWNrYCBsaXN0ZW5lcnMgZm9yIG1vYmlsZSAobm8gMzAwbXMgd2FpdCkuICovXG4gICAgdG91Y2hzdGFydChmbjogKGV2OiBUb3VjaEV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICB0aGlzLmUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uIF9mKGV2OiBUb3VjaEV2ZW50KSB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpOyAvLyBvdGhlcndpc2UgXCJ0b3VjaG1vdmVcIiBpcyB0cmlnZ2VyZWRcbiAgICAgICAgICAgIGZuKGV2KTtcbiAgICAgICAgICAgIGlmICggb3B0aW9ucyAmJiBvcHRpb25zLm9uY2UgKSAvLyBUT0RPOiBtYXliZSBuYXRpdmUgb3B0aW9ucy5vbmNlIGlzIGVub3VnaFxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIF9mKTtcbiAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICAgIC8vIFRPRE86IHRoaXMuX2xpc3RlbmVycywgb3IgdXNlIHRoaXMub24oXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBwb2ludGVyZW50ZXIoZm46IChldmVudDogUG9pbnRlckV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICByZXR1cm4gdGhpcy5vbih7IHBvaW50ZXJlbnRlciA6IGZuIH0sIG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICAvKiogQWRkIGEgYHBvaW50ZXJkb3duYCBldmVudCBsaXN0ZW5lciBpZiBicm93c2VyIHN1cHBvcnRzIGBwb2ludGVyZG93bmAsIGVsc2Ugc2VuZCBgbW91c2Vkb3duYCAoc2FmYXJpKS4gKi9cbiAgICBwb2ludGVyZG93bihmbjogKGV2ZW50OiBQb2ludGVyRXZlbnQgfCBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICBcbiAgICAgICAgbGV0IGFjdGlvbjtcbiAgICAgICAgLy8gVE9ETzogY2hlY2sgaWYgUG9pbnRlckV2ZW50IGV4aXN0cyBhbmQgc3RvcmUgaW4gdmFyIG91dHNpZGUgY2xhc3NcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGFjdGlvbiA9IHdpbmRvdy5Qb2ludGVyRXZlbnQgPyAncG9pbnRlcmRvd24nIDogJ21vdXNlZG93bic7IC8vIHNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgcG9pbnRlcmRvd25cbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICBhY3Rpb24gPSAnbW91c2Vkb3duJ1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IF9mID0gZnVuY3Rpb24gX2YoZXY6IFBvaW50ZXJFdmVudCB8IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBmbihldik7XG4gICAgICAgICAgICBpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5vbmNlICkgLy8gVE9ETzogbWF5YmUgbmF0aXZlIG9wdGlvbnMub25jZSBpcyBlbm91Z2hcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoYWN0aW9uLCBfZik7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZS5hZGRFdmVudExpc3RlbmVyKGFjdGlvbiwgX2YsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMucG9pbnRlcmRvd24gPSBfZjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEgY2xpY2sgb2YgdGhlIGVsZW1lbnQuIFVzZWZ1bCBmb3IgYDxhPmAgZWxlbWVudHMuKi9cbiAgICBjbGljaygpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBjbGlja2AgZXZlbnQgbGlzdGVuZXIuIFlvdSBzaG91bGQgcHJvYmFibHkgdXNlIGBwb2ludGVyZG93bigpYCBpZiBvbiBkZXNrdG9wLCBvciBgdG91Y2hzdGFydCgpYCBpZiBvbiBtb2JpbGUuKi9cbiAgICBjbGljayhmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgY2xpY2soZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLmUuY2xpY2soKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBjbGljayA6IGZuIH0sIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKkJsdXIgKHVuZm9jdXMpIHRoZSBlbGVtZW50LiovXG4gICAgYmx1cigpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBibHVyYCBldmVudCBsaXN0ZW5lciovXG4gICAgYmx1cihmbjogKGV2ZW50OiBGb2N1c0V2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgYmx1cihmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuZS5ibHVyKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgYmx1ciA6IGZuIH0sIG9wdGlvbnMpXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqRm9jdXMgdGhlIGVsZW1lbnQuKi9cbiAgICBmb2N1cygpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBmb2N1c2AgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGZvY3VzKGZuOiAoZXZlbnQ6IEZvY3VzRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBmb2N1cyhmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuZS5mb2N1cygpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGZvY3VzIDogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipBZGQgYSBgY2hhbmdlYCBldmVudCBsaXN0ZW5lciovXG4gICAgY2hhbmdlKGZuOiAoZXZlbnQ6IEV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICByZXR1cm4gdGhpcy5vbih7IGNoYW5nZSA6IGZuIH0sIG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICAvKipBZGQgYSBgY29udGV4dG1lbnVgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBjb250ZXh0bWVudShmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICByZXR1cm4gdGhpcy5vbih7IGNvbnRleHRtZW51IDogZm4gfSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEgZG91YmxlIGNsaWNrIG9mIHRoZSBlbGVtZW50LiovXG4gICAgZGJsY2xpY2soKTogdGhpcztcbiAgICAvKipBZGQgYSBgZGJsY2xpY2tgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBkYmxjbGljayhmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgZGJsY2xpY2soZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBjb25zdCBkYmxjbGljayA9IG5ldyBNb3VzZUV2ZW50KCdkYmxjbGljaycsIHtcbiAgICAgICAgICAgICAgICAndmlldycgOiB3aW5kb3csXG4gICAgICAgICAgICAgICAgJ2J1YmJsZXMnIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnY2FuY2VsYWJsZScgOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZS5kaXNwYXRjaEV2ZW50KGRibGNsaWNrKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBkYmxjbGljayA6IGZuIH0sIG9wdGlvbnMpXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBtb3VzZWVudGVyIGV2ZW50IHRvIHRoZSBlbGVtZW50LiovXG4gICAgbW91c2VlbnRlcigpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBtb3VzZWVudGVyYCBldmVudCBsaXN0ZW5lciovXG4gICAgbW91c2VlbnRlcihmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgbW91c2VlbnRlcihmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIC8vIG1vdXNlb3ZlcjogYWxzbyBjaGlsZCBlbGVtZW50c1xuICAgICAgICAvLyBtb3VzZWVudGVyOiBvbmx5IGJvdW5kIGVsZW1lbnRcbiAgICAgICAgXG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGNvbnN0IG1vdXNlZW50ZXIgPSBuZXcgTW91c2VFdmVudCgnbW91c2VlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAndmlldycgOiB3aW5kb3csXG4gICAgICAgICAgICAgICAgJ2J1YmJsZXMnIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnY2FuY2VsYWJsZScgOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZS5kaXNwYXRjaEV2ZW50KG1vdXNlZW50ZXIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IG1vdXNlZW50ZXIgOiBmbiB9LCBvcHRpb25zKVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEga2V5ZG93biBldmVudCB0byB0aGUgZWxlbWVudC4qL1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBrZXlkb3duKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYGtleWRvd25gIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBrZXlkb3duKGZuOiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBrZXlkb3duKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGtleWRvd24gOiBmbiB9LCBvcHRpb25zKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAga2V5dXAoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5dXAvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAga2V5cHJlc3MoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgaG92ZXIoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vaG92ZXIvXG4gICAgICAgIC8vIGJpbmRzIHRvIGJvdGggbW91c2VlbnRlciBhbmQgbW91c2VsZWF2ZVxuICAgICAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNzU4OTQyMC93aGVuLXRvLWNob29zZS1tb3VzZW92ZXItYW5kLWhvdmVyLWZ1bmN0aW9uXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbW91c2Vkb3duKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2tleXByZXNzL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG1vdXNlbGVhdmUoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIC8vbW91c2VsZWF2ZSBhbmQgbW91c2VvdXQgYXJlIHNpbWlsYXIgYnV0IGRpZmZlciBpbiB0aGF0IG1vdXNlbGVhdmUgZG9lcyBub3QgYnViYmxlIGFuZCBtb3VzZW91dCBkb2VzLlxuICAgICAgICAvLyBUaGlzIG1lYW5zIHRoYXQgbW91c2VsZWF2ZSBpcyBmaXJlZCB3aGVuIHRoZSBwb2ludGVyIGhhcyBleGl0ZWQgdGhlIGVsZW1lbnQgYW5kIGFsbCBvZiBpdHMgZGVzY2VuZGFudHMsXG4gICAgICAgIC8vIHdoZXJlYXMgbW91c2VvdXQgaXMgZmlyZWQgd2hlbiB0aGUgcG9pbnRlciBsZWF2ZXMgdGhlIGVsZW1lbnQgb3IgbGVhdmVzIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRlc2NlbmRhbnRzXG4gICAgICAgIC8vIChldmVuIGlmIHRoZSBwb2ludGVyIGlzIHN0aWxsIHdpdGhpbiB0aGUgZWxlbWVudCkuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbW91c2Vtb3ZlKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2tleXByZXNzL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBtb3VzZW91dCBldmVudCB0byB0aGUgZWxlbWVudC4qL1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBtb3VzZW91dCgpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBtb3VzZW91dGAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIG1vdXNlb3V0KGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBtb3VzZW91dChmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIC8vbW91c2VsZWF2ZSBhbmQgbW91c2VvdXQgYXJlIHNpbWlsYXIgYnV0IGRpZmZlciBpbiB0aGF0IG1vdXNlbGVhdmUgZG9lcyBub3QgYnViYmxlIGFuZCBtb3VzZW91dCBkb2VzLlxuICAgICAgICAvLyBUaGlzIG1lYW5zIHRoYXQgbW91c2VsZWF2ZSBpcyBmaXJlZCB3aGVuIHRoZSBwb2ludGVyIGhhcyBleGl0ZWQgdGhlIGVsZW1lbnQgYW5kIGFsbCBvZiBpdHMgZGVzY2VuZGFudHMsXG4gICAgICAgIC8vIHdoZXJlYXMgbW91c2VvdXQgaXMgZmlyZWQgd2hlbiB0aGUgcG9pbnRlciBsZWF2ZXMgdGhlIGVsZW1lbnQgb3IgbGVhdmVzIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRlc2NlbmRhbnRzXG4gICAgICAgIC8vIChldmVuIGlmIHRoZSBwb2ludGVyIGlzIHN0aWxsIHdpdGhpbiB0aGUgZWxlbWVudCkuXG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBtb3VzZW91dCA6IGZuIH0sIG9wdGlvbnMpXG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEgbW91c2VvdmVyIGV2ZW50IHRvIHRoZSBlbGVtZW50LiovXG4gICAgbW91c2VvdmVyKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYG1vdXNlb3ZlcmAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIG1vdXNlb3ZlcihmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgbW91c2VvdmVyKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgLy8gbW91c2VvdmVyOiBhbHNvIGNoaWxkIGVsZW1lbnRzXG4gICAgICAgIC8vIG1vdXNlZW50ZXI6IG9ubHkgYm91bmQgZWxlbWVudFxuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgbW91c2VvdmVyIDogZm4gfSwgb3B0aW9ucylcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG1vdXNldXAoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICB0cmFuc2Zvcm0ob3B0aW9uczogVHJhbnNmb3JtT3B0aW9ucykge1xuICAgICAgICBsZXQgdHJhbnNmb3JtOiBzdHJpbmcgPSAnJztcbiAgICAgICAgZm9yICggbGV0IFsgaywgdiBdIG9mIGVudW1lcmF0ZShvcHRpb25zKSApIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybSArPSBgJHtrfSgke3Z9KSBgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbih7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbmVuZCA6IHJlc29sdmVcbiAgICAgICAgICAgIH0sIHsgb25jZSA6IHRydWUgfSk7XG4gICAgICAgICAgICB0aGlzLmNzcyh7IHRyYW5zZm9ybSB9KVxuICAgICAgICB9KVxuICAgIH1cbiAgICBcbiAgICAvKiogUmVtb3ZlIHRoZSBldmVudCBsaXN0ZW5lciBvZiBgZXZlbnRgLCBpZiBleGlzdHMuKi9cbiAgICBvZmYoZXZlbnQ6IFRFdmVudCk6IHRoaXMge1xuICAgICAgICB0aGlzLmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcy5fbGlzdGVuZXJzW2V2ZW50XSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBhbGxPZmYoKTogdGhpcyB7XG4gICAgICAgIGZvciAoIGxldCBldmVudCBpbiB0aGlzLl9saXN0ZW5lcnMgKSB7XG4gICAgICAgICAgICB0aGlzLm9mZig8VEV2ZW50PiBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8vICoqKiAgQXR0cmlidXRlc1xuICAgIFxuICAgIC8qKiBGb3IgZWFjaCBgW2F0dHIsIHZhbF1gIHBhaXIsIGFwcGx5IGBzZXRBdHRyaWJ1dGVgKi9cbiAgICBhdHRyKGF0dHJWYWxQYWlyczogVE1hcDxzdHJpbmcgfCBib29sZWFuPik6IHRoaXNcbiAgICAvKiogYXBwbHkgYGdldEF0dHJpYnV0ZWAqL1xuICAgIGF0dHIoYXR0cmlidXRlTmFtZTogc3RyaW5nKTogc3RyaW5nXG4gICAgYXR0cihhdHRyVmFsUGFpcnMpIHtcbiAgICAgICAgaWYgKCB0eXBlb2YgYXR0clZhbFBhaXJzID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuZ2V0QXR0cmlidXRlKGF0dHJWYWxQYWlycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKCBsZXQgWyBhdHRyLCB2YWwgXSBvZiBlbnVtZXJhdGUoYXR0clZhbFBhaXJzKSApXG4gICAgICAgICAgICAgICAgdGhpcy5lLnNldEF0dHJpYnV0ZShhdHRyLCB2YWwpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqIGByZW1vdmVBdHRyaWJ1dGVgICovXG4gICAgcmVtb3ZlQXR0cihxdWFsaWZpZWROYW1lOiBzdHJpbmcsIC4uLnF1YWxpZmllZE5hbWVzOiBzdHJpbmdbXSk6IHRoaXMge1xuICAgICAgICBsZXQgX3JlbW92ZUF0dHJpYnV0ZTtcbiAgICAgICAgaWYgKCB0aGlzLl9pc1N2ZyApXG4gICAgICAgICAgICBfcmVtb3ZlQXR0cmlidXRlID0gKHF1YWxpZmllZE5hbWUpID0+IHRoaXMuZS5yZW1vdmVBdHRyaWJ1dGVOUyhTVkdfTlNfVVJJLCBxdWFsaWZpZWROYW1lKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgX3JlbW92ZUF0dHJpYnV0ZSA9IChxdWFsaWZpZWROYW1lKSA9PiB0aGlzLmUucmVtb3ZlQXR0cmlidXRlKHF1YWxpZmllZE5hbWUpO1xuICAgICAgICBcbiAgICAgICAgX3JlbW92ZUF0dHJpYnV0ZShxdWFsaWZpZWROYW1lKTtcbiAgICAgICAgZm9yICggbGV0IHFuIG9mIHF1YWxpZmllZE5hbWVzIClcbiAgICAgICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUocW4pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqYGdldEF0dHJpYnV0ZShgZGF0YS0ke2tleX1gKWAuIEpTT04ucGFyc2UgaXQgYnkgZGVmYXVsdC4qL1xuICAgIGRhdGEoa2V5OiBzdHJpbmcsIHBhcnNlOiBib29sZWFuID0gdHJ1ZSk6IHN0cmluZyB8IFRNYXA8c3RyaW5nPiB7XG4gICAgICAgIC8vIFRPRE86IGpxdWVyeSBkb2Vzbid0IGFmZmVjdCBkYXRhLSogYXR0cnMgaW4gRE9NLiBodHRwczovL2FwaS5qcXVlcnkuY29tL2RhdGEvXG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmUuZ2V0QXR0cmlidXRlKGBkYXRhLSR7a2V5fWApO1xuICAgICAgICBpZiAoIHBhcnNlID09PSB0cnVlIClcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gZGF0YVxuICAgIH1cbiAgICBcbiAgICAvLyAqKiAgRmFkZVxuICAgIGFzeW5jIGZhZGUoZHVyOiBudW1iZXIsIHRvOiAwIHwgMSk6IFByb21pc2U8dGhpcz4ge1xuICAgICAgICBjb25zdCBzdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmUpO1xuICAgICAgICBjb25zdCB0cmFuc1Byb3AgPSBzdHlsZXMudHJhbnNpdGlvblByb3BlcnR5LnNwbGl0KCcsICcpO1xuICAgICAgICBjb25zdCBpbmRleE9mT3BhY2l0eSA9IHRyYW5zUHJvcC5pbmRleE9mKCdvcGFjaXR5Jyk7XG4gICAgICAgIC8vIGNzcyBvcGFjaXR5OjAgPT4gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldOiAwc1xuICAgICAgICAvLyBjc3Mgb3BhY2l0eTo1MDBtcyA9PiB0cmFuc0R1cltpbmRleE9mT3BhY2l0eV06IDAuNXNcbiAgICAgICAgLy8gY3NzIE5PIG9wYWNpdHkgPT4gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldOiB1bmRlZmluZWRcbiAgICAgICAgaWYgKCBpbmRleE9mT3BhY2l0eSAhPT0gLTEgKSB7XG4gICAgICAgICAgICBjb25zdCB0cmFuc0R1ciA9IHN0eWxlcy50cmFuc2l0aW9uRHVyYXRpb24uc3BsaXQoJywgJyk7XG4gICAgICAgICAgICBjb25zdCBvcGFjaXR5VHJhbnNEdXIgPSB0cmFuc0R1cltpbmRleE9mT3BhY2l0eV07XG4gICAgICAgICAgICBjb25zdCB0cmFucyA9IHN0eWxlcy50cmFuc2l0aW9uLnNwbGl0KCcsICcpO1xuICAgICAgICAgICAgLy8gdHJhbnNpdGlvbjogb3BhY2l0eSB3YXMgZGVmaW5lZCBpbiBjc3MuXG4gICAgICAgICAgICAvLyBzZXQgdHJhbnNpdGlvbiB0byBkdXIsIHNldCBvcGFjaXR5IHRvIDAsIGxlYXZlIHRoZSBhbmltYXRpb24gdG8gbmF0aXZlIHRyYW5zaXRpb24sIHdhaXQgZHVyIGFuZCByZXR1cm4gdGhpc1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBmYWRlKCR7ZHVyfSwgJHt0b30pLCBvcGFjaXR5VHJhbnNEdXIgIT09IHVuZGVmaW5lZC4gbnVsbGlmeWluZyB0cmFuc2l0aW9uLiBTSE9VTEQgTk9UIFdPUktgKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGB0cmFuczpcXHQke3RyYW5zfVxcbnRyYW5zUHJvcDpcXHQke3RyYW5zUHJvcH1cXG5pbmRleE9mT3BhY2l0eTpcXHQke2luZGV4T2ZPcGFjaXR5fVxcbm9wYWNpdHlUcmFuc0R1cjpcXHQke29wYWNpdHlUcmFuc0R1cn1gKTtcbiAgICAgICAgICAgIC8vIHRyYW5zLnNwbGljZShpbmRleE9mT3BhY2l0eSwgMSwgYG9wYWNpdHkgJHtkdXIgLyAxMDAwfXNgKTtcbiAgICAgICAgICAgIHRyYW5zLnNwbGljZShpbmRleE9mT3BhY2l0eSwgMSwgYG9wYWNpdHkgMHNgKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBhZnRlciwgdHJhbnM6ICR7dHJhbnN9YCk7XG4gICAgICAgICAgICB0aGlzLmUuc3R5bGUudHJhbnNpdGlvbiA9IHRyYW5zLmpvaW4oJywgJyk7XG4gICAgICAgICAgICB0aGlzLmNzcyh7IG9wYWNpdHkgOiB0byB9KTtcbiAgICAgICAgICAgIGF3YWl0IHdhaXQoZHVyKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRyYW5zaXRpb246IG9wYWNpdHkgd2FzIE5PVCBkZWZpbmVkIGluIGNzcy5cbiAgICAgICAgaWYgKCBkdXIgPT0gMCApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNzcyh7IG9wYWNpdHkgOiB0byB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpc0ZhZGVPdXQgPSB0byA9PT0gMDtcbiAgICAgICAgbGV0IG9wYWNpdHkgPSBwYXJzZUZsb2F0KHRoaXMuZS5zdHlsZS5vcGFjaXR5KTtcbiAgICAgICAgXG4gICAgICAgIGlmICggb3BhY2l0eSA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKG9wYWNpdHkpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBmYWRlKCR7ZHVyfSwgJHt0b30pIGh0bWxFbGVtZW50IGhhcyBOTyBvcGFjaXR5IGF0IGFsbC4gcmVjdXJzaW5nYCwge1xuICAgICAgICAgICAgICAgIG9wYWNpdHksXG4gICAgICAgICAgICAgICAgdGhpcyA6IHRoaXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3NzKHsgb3BhY2l0eSA6IE1hdGguYWJzKDEgLSB0bykgfSkuZmFkZShkdXIsIHRvKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIGlzRmFkZU91dCA/IG9wYWNpdHkgPD0gMCA6IG9wYWNpdHkgPiAxICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgZmFkZSgke2R1cn0sICR7dG99KSBvcGFjaXR5IHdhcyBiZXlvbmQgdGFyZ2V0IG9wYWNpdHkuIHJldHVybmluZyB0aGlzIGFzIGlzLmAsIHtcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcyA6IHRoaXNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbGV0IHN0ZXBzID0gMzA7XG4gICAgICAgIGxldCBvcFN0ZXAgPSAxIC8gc3RlcHM7XG4gICAgICAgIGxldCBldmVyeW1zID0gZHVyIC8gc3RlcHM7XG4gICAgICAgIGlmICggZXZlcnltcyA8IDEgKSB7XG4gICAgICAgICAgICBldmVyeW1zID0gMTtcbiAgICAgICAgICAgIHN0ZXBzID0gZHVyO1xuICAgICAgICAgICAgb3BTdGVwID0gMSAvIHN0ZXBzO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBmYWRlKCR7ZHVyfSwgJHt0b30pIGhhZCBvcGFjaXR5LCBubyB0cmFuc2l0aW9uLiAoZ29vZCkgb3BhY2l0eTogJHtvcGFjaXR5fWAsIHtcbiAgICAgICAgICAgIHN0ZXBzLFxuICAgICAgICAgICAgb3BTdGVwLFxuICAgICAgICAgICAgZXZlcnltc1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcmVhY2hlZFRvID0gaXNGYWRlT3V0ID8gKG9wKSA9PiBvcCAtIG9wU3RlcCA+IDAgOiAob3ApID0+IG9wICsgb3BTdGVwIDwgMTtcbiAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIHJlYWNoZWRUbyhvcGFjaXR5KSApIHtcbiAgICAgICAgICAgICAgICBpZiAoIGlzRmFkZU91dCA9PT0gdHJ1ZSApXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHkgLT0gb3BTdGVwO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eSArPSBvcFN0ZXA7XG4gICAgICAgICAgICAgICAgdGhpcy5jc3MoeyBvcGFjaXR5IH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5ID0gdG87XG4gICAgICAgICAgICAgICAgdGhpcy5jc3MoeyBvcGFjaXR5IH0pO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBldmVyeW1zKTtcbiAgICAgICAgYXdhaXQgd2FpdChkdXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgZmFkZU91dChkdXI6IG51bWJlcik6IFByb21pc2U8dGhpcz4ge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5mYWRlKGR1ciwgMCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGFzeW5jIGZhZGVJbihkdXI6IG51bWJlcik6IFByb21pc2U8dGhpcz4ge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5mYWRlKGR1ciwgMSk7XG4gICAgfVxuICAgIFxuICAgIFxufVxuXG5jbGFzcyBEaXYgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTERpdkVsZW1lbnQ7XG4gICAgcmVhZG9ubHkgZTogSFRNTERpdkVsZW1lbnQ7XG4gICAgXG4gICAgLyoqQ3JlYXRlIGEgRGl2IGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCB0ZXh0LCBjbHMgfTogU3ViRWxlbUNvbnN0cnVjdG9yID0ge30pIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnZGl2JywgdGV4dCwgY2xzIH0pO1xuICAgICAgICBpZiAoIGlkICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5pZChpZCk7XG4gICAgfVxufVxuXG5jbGFzcyBQYXJhZ3JhcGggZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTFBhcmFncmFwaEVsZW1lbnQ7XG4gICAgcmVhZG9ubHkgZTogSFRNTFBhcmFncmFwaEVsZW1lbnQ7XG4gICAgXG4gICAgLyoqQ3JlYXRlIGEgUGFyYWdyYXBoIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCB0ZXh0LCBjbHMgfTogU3ViRWxlbUNvbnN0cnVjdG9yID0ge30pIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAncCcsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgIH1cbn1cblxuY2xhc3MgU3BhbiBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBIVE1MU3BhbkVsZW1lbnQ7XG4gICAgcmVhZG9ubHkgZTogSFRNTFNwYW5FbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhIFNwYW4gZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0IG9yIGNscy4qL1xuICAgIGNvbnN0cnVjdG9yKHsgaWQsIHRleHQsIGNscyB9OiBTdWJFbGVtQ29uc3RydWN0b3IgPSB7fSkge1xuICAgICAgICBzdXBlcih7IHRhZyA6ICdzcGFuJywgdGV4dCwgY2xzIH0pO1xuICAgICAgICBpZiAoIGlkICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5pZChpZCk7XG4gICAgICAgIFxuICAgIH1cbn1cblxuY2xhc3MgSW1nIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgXG4gICAgLyoqQ3JlYXRlIGFuIEltZyBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHNyYyBvciBjbHMuKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCBzcmMsIGNscyB9OiBJbWdDb25zdHJ1Y3Rvcikge1xuICAgICAgICBzdXBlcih7IHRhZyA6ICdpbWcnLCBjbHMgfSk7XG4gICAgICAgIGlmICggaWQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmlkKGlkKTtcbiAgICAgICAgaWYgKCBzcmMgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5zcmMgPSBzcmM7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBzcmMoc3JjOiBzdHJpbmcpOiB0aGlzO1xuICAgIHNyYygpOiBzdHJpbmc7XG4gICAgc3JjKHNyYz8pIHtcbiAgICAgICAgaWYgKCBzcmMgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9odG1sRWxlbWVudC5zcmNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnNyYyA9IHNyYztcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHJlYWRvbmx5IGU6IEhUTUxJbWFnZUVsZW1lbnQ7XG59XG5cbmNsYXNzIEJ1dHRvbiBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICBcbiAgICAvKipDcmVhdGUgYSBCdXR0b24gZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCBjbHMsIGh0bWwgb3IgY2xpY2sgZnVuY3Rpb24qL1xuICAgIGNvbnN0cnVjdG9yKHsgaWQsIGNscywgY2xpY2ssIGh0bWwgfTogQnV0dG9uQ29uc3RydWN0b3IpIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnYnV0dG9uJywgY2xzIH0pO1xuICAgICAgICBpZiAoIGlkICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5pZChpZCk7XG4gICAgICAgIGlmICggY2xpY2sgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmNsaWNrKGNsaWNrKTtcbiAgICAgICAgaWYgKCBodG1sICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5odG1sKGh0bWwpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHJlYWRvbmx5IGU6IEhUTUxCdXR0b25FbGVtZW50O1xufVxuXG5jbGFzcyBBbmNob3IgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTEFuY2hvckVsZW1lbnQ7XG4gICAgcmVhZG9ubHkgZTogSFRNTEFuY2hvckVsZW1lbnQ7XG4gICAgXG4gICAgLyoqQ3JlYXRlIGFuIEFuY2hvciBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQsIGhyZWYgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzLCBocmVmIH06IEFuY2hvckNvbnN0cnVjdG9yID0ge30pIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnYScsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBpZiAoIGhyZWYgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmhyZWYoaHJlZilcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGhyZWYoKTogc3RyaW5nXG4gICAgaHJlZih2YWw6IHN0cmluZyk6IHRoaXNcbiAgICBocmVmKHZhbD8pIHtcbiAgICAgICAgaWYgKCB2YWwgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdocmVmJyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoeyBocmVmIDogdmFsIH0pXG4gICAgfVxuICAgIFxuICAgIHRhcmdldCgpOiBzdHJpbmdcbiAgICB0YXJnZXQodmFsOiBzdHJpbmcpOiB0aGlzXG4gICAgdGFyZ2V0KHZhbD8pIHtcbiAgICAgICAgaWYgKCB2YWwgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd0YXJnZXQnKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cih7IHRhcmdldCA6IHZhbCB9KVxuICAgIH1cbn1cblxuY2xhc3MgSW5wdXQgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTElucHV0RWxlbWVudDtcbiAgICByZWFkb25seSBlOiBIVE1MSW5wdXRFbGVtZW50O1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHsgaWQsIHRleHQsIGNscywgcGxhY2Vob2xkZXIsIHR5cGUgfTogSW5wdXRDb25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ2lucHV0JywgdGV4dCwgY2xzIH0pO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBpZiAoIHBsYWNlaG9sZGVyICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5hdHRyKHsgcGxhY2Vob2xkZXIsIHR5cGUgOiB0eXBlID8/ICd0ZXh0JyB9KVxuICAgICAgICBcbiAgICB9XG59XG5cbi8qY2xhc3MgU3ZnIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnR7XG4gcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogU1ZHRWxlbWVudDtcbiBjb25zdHJ1Y3Rvcih7aWQsIGNscyxodG1sRWxlbWVudH06IFN2Z0NvbnN0cnVjdG9yKSB7XG4gc3VwZXIoe3RhZzogJ3N2ZycsIGNsc30pO1xuIGlmIChpZClcbiB0aGlzLmlkKGlkKTtcbiBpZiAoc3JjKVxuIHRoaXMuX2h0bWxFbGVtZW50LnNyYyA9IHNyYztcbiBcbiB9XG4gfVxuICovXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1odG1sLWVsZW1lbnQnLCBCZXR0ZXJIVE1MRWxlbWVudCk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1kaXYnLCBEaXYsIHsgZXh0ZW5kcyA6ICdkaXYnIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItcCcsIFBhcmFncmFwaCwgeyBleHRlbmRzIDogJ3AnIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItc3BhbicsIFNwYW4sIHsgZXh0ZW5kcyA6ICdzcGFuJyB9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWltZycsIEltZywgeyBleHRlbmRzIDogJ2ltZycgfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1hJywgQW5jaG9yLCB7IGV4dGVuZHMgOiAnYScgfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1idXR0b24nLCBCdXR0b24sIHsgZXh0ZW5kcyA6ICdidXR0b24nIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItaW5wdXQnLCBJbnB1dCwgeyBleHRlbmRzIDogJ2lucHV0JyB9KTtcblxuLy8gY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItc3ZnJywgU3ZnLCB7ZXh0ZW5kczogJ3N2Zyd9KTtcblxuLyoqQ3JlYXRlIGFuIGVsZW1lbnQgb2YgYHRhZ2AuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgIGFuZCAvIG9yIGBjbHNgKi9cbmZ1bmN0aW9uIGVsZW0oeyB0YWcsIHRleHQsIGNscyB9OiB7IHRhZzogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbi8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBpZGAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbmZ1bmN0aW9uIGVsZW0oeyBpZCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGlkOiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTogQmV0dGVySFRNTEVsZW1lbnQ7XG4vKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgcXVlcnlgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG5mdW5jdGlvbiBlbGVtKHsgcXVlcnksIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBxdWVyeTogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbi8qKldyYXAgYW4gZXhpc3RpbmcgSFRNTEVsZW1lbnQuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbmZ1bmN0aW9uIGVsZW0oeyBodG1sRWxlbWVudCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGh0bWxFbGVtZW50OiBIVE1MRWxlbWVudCwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbmZ1bmN0aW9uIGVsZW0oZWxlbU9wdGlvbnMpOiBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIG5ldyBCZXR0ZXJIVE1MRWxlbWVudChlbGVtT3B0aW9ucyk7XG59XG5cbi8qKkNyZWF0ZSBhIFNwYW4gZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0IG9yIGNscy4qL1xuZnVuY3Rpb24gc3Bhbih7IGlkLCB0ZXh0LCBjbHMgfTogU3ViRWxlbUNvbnN0cnVjdG9yID0ge30pOiBTcGFuIHtcbiAgICByZXR1cm4gbmV3IFNwYW4oeyBpZCwgdGV4dCwgY2xzIH0pO1xufVxuXG4vKipDcmVhdGUgYW4gRGl2IGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbmZ1bmN0aW9uIGRpdih7IGlkLCB0ZXh0LCBjbHMgfTogU3ViRWxlbUNvbnN0cnVjdG9yID0ge30pOiBEaXYge1xuICAgIHJldHVybiBuZXcgRGl2KHsgaWQsIHRleHQsIGNscyB9KTtcbn1cblxuLyoqQ3JlYXRlIGFuIEltZyBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHNyYyBvciBjbHMuKi9cbmZ1bmN0aW9uIGltZyh7IGlkLCBzcmMsIGNscyB9OiBJbWdDb25zdHJ1Y3RvciA9IHt9KTogSW1nIHtcbiAgICByZXR1cm4gbmV3IEltZyh7IGlkLCBzcmMsIGNscyB9KTtcbn1cblxuLyoqQ3JlYXRlIGEgQnV0dG9uIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgY2xzLCBodG1sIG9yIGNsaWNrIGZ1bmN0aW9uKi9cbmZ1bmN0aW9uIGJ1dHRvbih7IGlkLCBjbHMsIGNsaWNrLCBodG1sIH06IEJ1dHRvbkNvbnN0cnVjdG9yID0ge30pOiBCdXR0b24ge1xuICAgIHJldHVybiBuZXcgQnV0dG9uKHsgaWQsIGNscywgY2xpY2ssIGh0bWwgfSk7XG59XG5cbi8qKkNyZWF0ZSBhIFBhcmFncmFwaCBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG5mdW5jdGlvbiBwYXJhZ3JhcGgoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogUGFyYWdyYXBoIHtcbiAgICByZXR1cm4gbmV3IFBhcmFncmFwaCh7IGlkLCB0ZXh0LCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhbiBBbmNob3IgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0LCBocmVmIG9yIGNscy4qL1xuZnVuY3Rpb24gYW5jaG9yKHsgaWQsIHRleHQsIGNscywgaHJlZiB9OiBBbmNob3JDb25zdHJ1Y3RvciA9IHt9KTogQW5jaG9yIHtcbiAgICByZXR1cm4gbmV3IEFuY2hvcih7IGlkLCB0ZXh0LCBjbHMsIGhyZWYgfSk7XG59XG5cbi8qKkNyZWF0ZSBhbiBJbnB1dCBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgYGlkYCwgYHRleHRgLCBgY2xzYCwgYHBsYWNlaG9sZGVyYCwgb3IgYHR5cGVgLiBgdHlwZWAgZGVmYXVsdHMgdG8gYHRleHRgLiovXG5mdW5jdGlvbiBpbnB1dCh7IGlkLCB0ZXh0LCBjbHMsIHBsYWNlaG9sZGVyLCB0eXBlIH06IElucHV0Q29uc3RydWN0b3IgPSB7fSk6IElucHV0IHtcbiAgICByZXR1cm4gbmV3IElucHV0KHsgaWQsIHRleHQsIGNscywgcGxhY2Vob2xkZXIsIHR5cGUgfSk7XG59XG5cbmV4cG9ydCB7IGVsZW0sIHNwYW4sIGRpdiwgaW1nLCBwYXJhZ3JhcGgsIGFuY2hvciwgYnV0dG9uLCBpbnB1dCwgQmV0dGVySFRNTEVsZW1lbnQsIERpdiwgQnV0dG9uLCBTcGFuLCBJbnB1dCB9XG4iXX0=