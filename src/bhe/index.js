"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const SVG_NS_URI = 'http://www.w3.org/2000/svg';
class BetterHTMLElement {
    constructor(elemOptions) {
        this._isSvg = false;
        this._listeners = {};
        this._cachedChildren = {};
        this._computedStyle = undefined;
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
    once(evType, listener, options) {
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
    getOpacityTransitionDuration() {
        if (!this._computedStyle) {
            this._computedStyle = getComputedStyle(this.e);
        }
        else {
            console.warn(`got computed style from cache`);
        }
        const { transitionProperty, transitionDuration } = this._computedStyle;
        const transProp = transitionProperty.split(', ');
        const indexOfOpacity = transProp.indexOf('opacity');
        if (indexOfOpacity !== -1) {
            const transDur = transitionDuration.split(', ');
            const opacityTransDur = transDur[indexOfOpacity];
            if (opacityTransDur.includes('m')) {
                return parseInt(opacityTransDur);
            }
            else {
                return parseFloat(opacityTransDur) * 1000;
            }
        }
        return undefined;
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
        this.attr({ type: 'button' });
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
    get placeholder() {
        return this.e.placeholder;
    }
    set placeholder(val) {
        this.e.placeholder = val;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtDQUFzRTtBQUV0RSxNQUFNLFVBQVUsR0FBRyw0QkFBNEIsQ0FBQztBQUloRCxNQUFNLGlCQUFpQjtJQStCbkIsWUFBWSxXQUFXO1FBN0JOLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFDeEIsZUFBVSxHQUE4QixFQUFFLENBQUM7UUFDcEQsb0JBQWUsR0FBNEIsRUFBRSxDQUFDO1FBQzlDLG1CQUFjLEdBQXdCLFNBQVMsQ0FBQztRQTJCcEQsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxHQUFHLFdBQVcsQ0FBQztRQUV6RSxJQUFLLENBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUc7WUFDM0UsTUFBTSxJQUFJLHVCQUF1QixDQUFDLENBQUMsRUFBRTtnQkFDakMsR0FBRztnQkFDSCxFQUFFO2dCQUNGLFdBQVc7Z0JBQ1gsS0FBSzthQUNSLENBQUMsQ0FBQTtTQUVMO1FBQ0QsSUFBSyxHQUFHLEtBQUssU0FBUyxJQUFJLFFBQVEsS0FBSyxTQUFTO1lBQzVDLE1BQU0sSUFBSSx1QkFBdUIsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pDLEdBQUc7Z0JBQ0gsUUFBUTthQUNYLEVBQUUsK0lBQStJLENBQUMsQ0FBQztRQUV4SixJQUFLLEdBQUcsS0FBSyxTQUFTLEVBQUc7WUFDckIsSUFBSyxDQUFFLEtBQUssRUFBRSxNQUFNLENBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUc7Z0JBQ2pELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFB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LEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFFeUQsc0JBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBib29sLCBlbnVtZXJhdGUsIGlzRnVuY3Rpb24sIGlzT2JqZWN0LCB3YWl0IH0gZnJvbSBcIi4uL3V0aWxcIjtcblxuY29uc3QgU1ZHX05TX1VSSSA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG5cbi8vIFRPRE86IG1ha2UgQmV0dGVySFRNTEVsZW1lbnQ8VD4sIGZvciB1c2UgaW4gZWcgY2hpbGRbcmVuXSBmdW5jdGlvblxuLy8gZXh0ZW5kcyBIVE1MRWxlbWVudDogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUVsZW1lbnRSZWdpc3RyeS91cGdyYWRlI0V4YW1wbGVzXG5jbGFzcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIF9odG1sRWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfaXNTdmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9saXN0ZW5lcnM6IFRFdmVudEZ1bmN0aW9uTWFwPFRFdmVudD4gPSB7fTtcbiAgICBwcml2YXRlIF9jYWNoZWRDaGlsZHJlbjogVE1hcDxCZXR0ZXJIVE1MRWxlbWVudD4gPSB7fTtcbiAgICBwcml2YXRlIF9jb21wdXRlZFN0eWxlOiBDU1NTdHlsZURlY2xhcmF0aW9uID0gdW5kZWZpbmVkO1xuICAgIC8qW1N5bWJvbC50b1ByaW1pdGl2ZV0oaGludCkge1xuICAgICBjb25zb2xlLmxvZygnZnJvbSB0b1ByaW1pdGl2ZSwgaGludDogJywgaGludCwgJ1xcbnRoaXM6ICcsIHRoaXMpO1xuICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQ7XG4gICAgIH1cbiAgICAgXG4gICAgIHZhbHVlT2YoKSB7XG4gICAgIGNvbnNvbGUubG9nKCdmcm9tIHZhbHVlT2YsIHRoaXM6ICcsIHRoaXMpO1xuICAgICByZXR1cm4gdGhpcztcbiAgICAgfVxuICAgICBcbiAgICAgdG9TdHJpbmcoKSB7XG4gICAgIGNvbnNvbGUubG9nKCdmcm9tIHRvU3RyaW5nLCB0aGlzOiAnLCB0aGlzKTtcbiAgICAgcmV0dXJuIHRoaXM7XG4gICAgIH1cbiAgICAgKi9cbiAgICBcbiAgICAvLyBUT0RPOiBxdWVyeSBzaG91bGQgYWxzbyBiZSBhIHByZWRpY2F0ZSBmdW5jdGlvblxuICAgIC8qKkNyZWF0ZSBhbiBlbGVtZW50IG9mIGB0YWdgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCBhbmQgLyBvciBgY2xzYCovXG4gICAgY29uc3RydWN0b3IoeyB0YWcsIHRleHQsIGNscyB9OiB7IHRhZzogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nIH0pO1xuICAgIC8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBpZGAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCB0ZXh0LCBjbHMsIGNoaWxkcmVuIH06IHsgaWQ6IHN0cmluZywgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIC8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBxdWVyeWAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IHF1ZXJ5LCB0ZXh0LCBjbHMsIGNoaWxkcmVuIH06IHsgcXVlcnk6IFF1ZXJ5U2VsZWN0b3IsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICAvKipXcmFwIGFuIGV4aXN0aW5nIEhUTUxFbGVtZW50LiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBodG1sRWxlbWVudCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGh0bWxFbGVtZW50OiBIVE1MRWxlbWVudCwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIGNvbnN0cnVjdG9yKGVsZW1PcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHsgdGFnLCBpZCwgaHRtbEVsZW1lbnQsIHRleHQsIHF1ZXJ5LCBjaGlsZHJlbiwgY2xzIH0gPSBlbGVtT3B0aW9ucztcbiAgICAgICAgXG4gICAgICAgIGlmICggWyB0YWcsIGlkLCBodG1sRWxlbWVudCwgcXVlcnkgXS5maWx0ZXIoeCA9PiB4ICE9PSB1bmRlZmluZWQpLmxlbmd0aCA+IDEgKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFkQXJndW1lbnRzQW1vdW50RXJyb3IoMSwge1xuICAgICAgICAgICAgICAgIHRhZyxcbiAgICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgICBodG1sRWxlbWVudCxcbiAgICAgICAgICAgICAgICBxdWVyeVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGlmICggdGFnICE9PSB1bmRlZmluZWQgJiYgY2hpbGRyZW4gIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFkQXJndW1lbnRzQW1vdW50RXJyb3IoMSwge1xuICAgICAgICAgICAgICAgIHRhZyxcbiAgICAgICAgICAgICAgICBjaGlsZHJlblxuICAgICAgICAgICAgfSwgJ1wiY2hpbGRyZW5cIiBhbmQgXCJ0YWdcIiBvcHRpb25zIGFyZSBtdXR1YWxseSBleGNsdXNpdmUsIGJlY2F1c2UgdGFnIGltcGxpZXMgY3JlYXRpbmcgYSBuZXcgZWxlbWVudCBhbmQgY2hpbGRyZW4gaW1wbGllcyBnZXR0aW5nIGFuIGV4aXN0aW5nIG9uZS4nKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggdGFnICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBpZiAoIFsgJ3N2ZycsICdwYXRoJyBdLmluY2x1ZGVzKHRhZy50b0xvd2VyQ2FzZSgpKSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N2ZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TX1VSSSwgdGFnKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLl9odG1sRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3htbG5zJywgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIGlkICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgICAgICAgIGlmICggIWJvb2wodGhpcy5faHRtbEVsZW1lbnQpIClcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEVsZW0gY29uc3RydWN0b3I6IHRyaWVkIHRvIGdldCBlbGVtZW50IGJ5IGlkOiBcIiR7aWR9XCIsIGJ1dCBubyBzdWNoIGVsZW1lbnQgZXhpc3RzLmApXG4gICAgICAgIH0gZWxzZSBpZiAoIHF1ZXJ5ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocXVlcnkpO1xuICAgICAgICAgICAgaWYgKCAhYm9vbCh0aGlzLl9odG1sRWxlbWVudCkgKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRWxlbSBjb25zdHJ1Y3RvcjogdHJpZWQgdG8gZ2V0IGVsZW1lbnQgYnkgcXVlcnk6IFwiJHtxdWVyeX1cIiwgYnV0IG5vIGVsZW1lbnQgZm91bmQuYClcbiAgICAgICAgfSBlbHNlIGlmICggaHRtbEVsZW1lbnQgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gaHRtbEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoICFib29sKHRoaXMuX2h0bWxFbGVtZW50KSApXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFbGVtIGNvbnN0cnVjdG9yOiBwYXNzZWQgZXhwbGljaXQgaHRtbEVsZW1lbnQgYXJnLCBidXQgYXJnIHdhcyBmYWxzZXk6ICR7aHRtbEVsZW1lbnR9YCwgaHRtbEVsZW1lbnQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFkQXJndW1lbnRzQW1vdW50RXJyb3IoMSwge1xuICAgICAgICAgICAgICAgIHRhZyxcbiAgICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgICBodG1sRWxlbWVudCxcbiAgICAgICAgICAgICAgICBxdWVyeVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCB0ZXh0ICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy50ZXh0KHRleHQpO1xuICAgICAgICBpZiAoIGNscyAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuY2xhc3MoY2xzKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggY2hpbGRyZW4gIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmNhY2hlQ2hpbGRyZW4oY2hpbGRyZW4pO1xuICAgICAgICBcbiAgICAgICAgLy8gT2JqZWN0LmFzc2lnbih0aGlzLCBwcm94eSk7XG4gICAgICAgIC8qY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgICAgICByZXR1cm4gbmV3IFByb3h5KHRoaXMsIHtcbiAgICAgICAgIGdldCh0YXJnZXQ6IEJldHRlckhUTUxFbGVtZW50LCBwOiBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2wsIHJlY2VpdmVyOiBhbnkpOiBhbnkge1xuICAgICAgICAgLy8gY29uc29sZS5sb2coJ2xvZ2dpbmcnKTtcbiAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd0YXJnZXQ6ICcsIHRhcmdldCxcbiAgICAgICAgIC8vICAgICAnXFxudGhhdDogJywgdGhhdCxcbiAgICAgICAgIC8vICAgICAnXFxudHlwZW9mKHRoYXQpOiAnLCB0eXBlb2YgKHRoYXQpLFxuICAgICAgICAgLy8gICAgICdcXG5wOiAnLCBwLFxuICAgICAgICAgLy8gICAgICdcXG5yZWNlaXZlcjogJywgcmVjZWl2ZXIsXG4gICAgICAgICAvLyAgICAgJ1xcbnRoaXM6ICcsIHRoaXMpO1xuICAgICAgICAgcmV0dXJuIHRoYXRbcF07XG4gICAgICAgICB9XG4gICAgICAgICB9KVxuICAgICAgICAgKi9cbiAgICB9XG4gICAgXG4gICAgLyoqUmV0dXJuIHRoZSB3cmFwcGVkIEhUTUxFbGVtZW50Ki9cbiAgICBnZXQgZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50O1xuICAgIH1cbiAgICBcbiAgICAvKipTZXRzIGB0aGlzLl9odG1sRWxlbWVudGAgdG8gYG5ld0h0bWxFbGVtZW50Ll9odG1sRWxlbWVudGAuXG4gICAgICogUmVzZXRzIGB0aGlzLl9jYWNoZWRDaGlsZHJlbmAgYW5kIGNhY2hlcyBgbmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuYC5cbiAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyBmcm9tIGBuZXdIdG1sRWxlbWVudC5fbGlzdGVuZXJzYCwgd2hpbGUga2VlcGluZyBgdGhpcy5fbGlzdGVuZXJzYC4qL1xuICAgIHdyYXBTb21ldGhpbmdFbHNlKG5ld0h0bWxFbGVtZW50OiBCZXR0ZXJIVE1MRWxlbWVudCk6IHRoaXNcbiAgICAvKipTZXRzIGB0aGlzLl9odG1sRWxlbWVudGAgdG8gYG5ld0h0bWxFbGVtZW50YC5cbiAgICAgKiBLZWVwcyBgdGhpcy5fbGlzdGVuZXJzYC5cbiAgICAgKiBOT1RFOiB0aGlzIHJlaW5pdGlhbGl6ZXMgYHRoaXMuX2NhY2hlZENoaWxkcmVuYCBhbmQgYWxsIGV2ZW50IGxpc3RlbmVycyBiZWxvbmdpbmcgdG8gYG5ld0h0bWxFbGVtZW50YCBhcmUgbG9zdC4gUGFzcyBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgdG8ga2VlcCB0aGVtLiovXG4gICAgd3JhcFNvbWV0aGluZ0Vsc2UobmV3SHRtbEVsZW1lbnQ6IE5vZGUpOiB0aGlzXG4gICAgd3JhcFNvbWV0aGluZ0Vsc2UobmV3SHRtbEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fY2FjaGVkQ2hpbGRyZW4gPSB7fTtcbiAgICAgICAgaWYgKCBuZXdIdG1sRWxlbWVudCBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50ICkge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQucmVwbGFjZVdpdGgobmV3SHRtbEVsZW1lbnQuZSk7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IG5ld0h0bWxFbGVtZW50LmU7XG4gICAgICAgICAgICBmb3IgKCBsZXQgWyBfa2V5LCBfY2FjaGVkQ2hpbGQgXSBvZiBlbnVtZXJhdGUobmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuKSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShfa2V5IGFzIHN0cmluZywgX2NhY2hlZENoaWxkKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuX2NhY2hlZENoaWxkcmVuKS5sZW5ndGhcbiAgICAgICAgICAgICAgICAhPT0gT2JqZWN0LmtleXMobmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuKS5sZW5ndGhcbiAgICAgICAgICAgICAgICB8fFxuICAgICAgICAgICAgICAgIE9iamVjdC52YWx1ZXModGhpcy5fY2FjaGVkQ2hpbGRyZW4pLmZpbHRlcih2ID0+IHYgIT09IHVuZGVmaW5lZCkubGVuZ3RoXG4gICAgICAgICAgICAgICAgIT09IE9iamVjdC52YWx1ZXMobmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuKS5maWx0ZXIodiA9PiB2ICE9PSB1bmRlZmluZWQpLmxlbmd0aFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGB3cmFwU29tZXRoaW5nRWxzZSB0aGlzLl9jYWNoZWRDaGlsZHJlbiBsZW5ndGggIT09IG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbi5sZW5ndGhgLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzIDogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0h0bWxFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9uKHsgLi4udGhpcy5fbGlzdGVuZXJzLCAuLi5uZXdIdG1sRWxlbWVudC5fbGlzdGVuZXJzLCB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5vIHdheSB0byBnZXQgbmV3SHRtbEVsZW1lbnQgZXZlbnQgbGlzdGVuZXJzIGJlc2lkZXMgaGFja2luZyBFbGVtZW50LnByb3RvdHlwZVxuICAgICAgICAgICAgdGhpcy5vbih0aGlzLl9saXN0ZW5lcnMpO1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQucmVwbGFjZVdpdGgobmV3SHRtbEVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBuZXdIdG1sRWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8vICoqKiAgQmFzaWNcbiAgICAvKipTZXQgdGhlIGVsZW1lbnQncyBpbm5lckhUTUwqL1xuICAgIGh0bWwoaHRtbDogc3RyaW5nKTogdGhpcztcbiAgICAvKipHZXQgdGhlIGVsZW1lbnQncyBpbm5lckhUTUwqL1xuICAgIGh0bWwoKTogc3RyaW5nO1xuICAgIGh0bWwoaHRtbD8pIHtcbiAgICAgICAgaWYgKCBodG1sID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLmlubmVySFRNTDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqU2V0IHRoZSBlbGVtZW50J3MgaW5uZXJUZXh0Ki9cbiAgICB0ZXh0KHR4dDogc3RyaW5nIHwgbnVtYmVyKTogdGhpcztcbiAgICAvKipHZXQgdGhlIGVsZW1lbnQncyBpbm5lclRleHQqL1xuICAgIHRleHQoKTogc3RyaW5nO1xuICAgIHRleHQodHh0Pykge1xuICAgICAgICBpZiAoIHR4dCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5pbm5lclRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmUuaW5uZXJUZXh0ID0gdHh0O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qKlNldCB0aGUgaWQgb2YgdGhlIGVsZW1lbnQqL1xuICAgIGlkKGlkOiBzdHJpbmcpOiB0aGlzO1xuICAgIC8qKkdldCB0aGUgaWQgb2YgdGhlIGVsZW1lbnQqL1xuICAgIGlkKCk6IHN0cmluZztcbiAgICBpZChpZD8pIHtcbiAgICAgICAgaWYgKCBpZCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5pZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZS5pZCA9IGlkO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqRm9yIGVhY2ggYHs8c3R5bGVBdHRyPjogPHN0eWxlVmFsPn1gIHBhaXIsIHNldCB0aGUgYHN0eWxlW3N0eWxlQXR0cl1gIHRvIGBzdHlsZVZhbGAuKi9cbiAgICBjc3MoY3NzOiBQYXJ0aWFsPENzc09wdGlvbnM+KTogdGhpc1xuICAgIC8qKkdldCBgc3R5bGVbY3NzXWAqL1xuICAgIGNzcyhjc3M6IHN0cmluZyk6IHN0cmluZ1xuICAgIGNzcyhjc3MpIHtcbiAgICAgICAgaWYgKCB0eXBlb2YgY3NzID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuc3R5bGVbY3NzXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoIGxldCBbIHN0eWxlQXR0ciwgc3R5bGVWYWwgXSBvZiBlbnVtZXJhdGUoY3NzKSApXG4gICAgICAgICAgICAgICAgdGhpcy5lLnN0eWxlWzxzdHJpbmc+IHN0eWxlQXR0cl0gPSBzdHlsZVZhbDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlJlbW92ZSB0aGUgdmFsdWUgb2YgdGhlIHBhc3NlZCBzdHlsZSBwcm9wZXJ0aWVzKi9cbiAgICB1bmNzcyguLi5yZW1vdmVQcm9wczogKGtleW9mIENzc09wdGlvbnMpW10pOiB0aGlzIHtcbiAgICAgICAgbGV0IGNzcyA9IHt9O1xuICAgICAgICBmb3IgKCBsZXQgcHJvcCBvZiByZW1vdmVQcm9wcyApXG4gICAgICAgICAgICBjc3NbcHJvcF0gPSAnJztcbiAgICAgICAgcmV0dXJuIHRoaXMuY3NzKGNzcyk7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBpcyhlbGVtZW50OiBCZXR0ZXJIVE1MRWxlbWVudCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2lzL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIik7XG4gICAgfVxuICAgIFxuICAgIC8qXG4gICAgIGFuaW1hdGUob3B0czogQW5pbWF0ZU9wdGlvbnMpIHtcbiAgICAgLy8gc2VlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvQ1NTX0FuaW1hdGlvbnMvVGlwc1xuICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgICB9XG4gICAgICovXG4gICAgXG4gICAgLy8gKioqICBDbGFzc2VzXG4gICAgLyoqYC5jbGFzc05hbWUgPSBjbHNgKi9cbiAgICBjbGFzcyhjbHM6IHN0cmluZyk6IHRoaXM7XG4gICAgLyoqUmV0dXJuIHRoZSBmaXJzdCBjbGFzcyB0aGF0IG1hdGNoZXMgYGNsc2AgcHJlZGljYXRlLiovXG4gICAgY2xhc3MoY2xzOiBUUmV0dXJuQm9vbGVhbik6IHN0cmluZztcbiAgICAvKipSZXR1cm4gYSBzdHJpbmcgYXJyYXkgb2YgdGhlIGVsZW1lbnQncyBjbGFzc2VzIChub3QgYSBjbGFzc0xpc3QpKi9cbiAgICBjbGFzcygpOiBzdHJpbmdbXTtcbiAgICBjbGFzcyhjbHM/KSB7XG4gICAgICAgIGlmICggY2xzID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmUuY2xhc3NMaXN0KTtcbiAgICAgICAgfSBlbHNlIGlmICggaXNGdW5jdGlvbihjbHMpICkge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5lLmNsYXNzTGlzdCkuZmluZChjbHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCB0aGlzLl9pc1N2ZyApIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgLy8gbm9pbnNwZWN0aW9uIEpTQ29uc3RhbnRSZWFzc2lnbm1lbnRcbiAgICAgICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0ID0gWyBjbHMgXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lLmNsYXNzTmFtZSA9IGNscztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGFkZENsYXNzKGNsczogc3RyaW5nLCAuLi5jbHNlczogc3RyaW5nW10pOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5hZGQoY2xzKTtcbiAgICAgICAgZm9yICggbGV0IGMgb2YgY2xzZXMgKVxuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5hZGQoYyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICByZW1vdmVDbGFzcyhjbHM6IFRSZXR1cm5Cb29sZWFuKTogdGhpcztcbiAgICByZW1vdmVDbGFzcyhjbHM6IHN0cmluZywgLi4uY2xzZXM6IHN0cmluZ1tdKTogdGhpcztcbiAgICByZW1vdmVDbGFzcyhjbHMsIC4uLmNsc2VzKSB7XG4gICAgICAgIGlmICggaXNGdW5jdGlvbjxib29sZWFuPihjbHMpICkge1xuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzcyhjbHMpKTtcbiAgICAgICAgICAgIGlmICggYm9vbChjbHNlcykgKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybigncmVtb3ZlQ2xhc3MsIGNscyBpcyBUUmV0dXJuQm9vbGVhbiwgZ290IC4uLmNsc2VzIGJ1dCBzaG91bGRudCBoYXZlJylcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZW1vdmUoY2xzKTtcbiAgICAgICAgICAgIGZvciAoIGxldCBjIG9mIGNsc2VzIClcbiAgICAgICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcmVwbGFjZUNsYXNzKG9sZFRva2VuOiBUUmV0dXJuQm9vbGVhbiwgbmV3VG9rZW46IHN0cmluZyk6IHRoaXM7XG4gICAgcmVwbGFjZUNsYXNzKG9sZFRva2VuOiBzdHJpbmcsIG5ld1Rva2VuOiBzdHJpbmcpOiB0aGlzXG4gICAgcmVwbGFjZUNsYXNzKG9sZFRva2VuLCBuZXdUb2tlbikge1xuICAgICAgICBpZiAoIGlzRnVuY3Rpb248Ym9vbGVhbj4ob2xkVG9rZW4pICkge1xuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZXBsYWNlKHRoaXMuY2xhc3Mob2xkVG9rZW4pLCBuZXdUb2tlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnJlcGxhY2Uob2xkVG9rZW4sIG5ld1Rva2VuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgdG9nZ2xlQ2xhc3MoY2xzOiBUUmV0dXJuQm9vbGVhbiwgZm9yY2U/OiBib29sZWFuKTogdGhpc1xuICAgIHRvZ2dsZUNsYXNzKGNsczogc3RyaW5nLCBmb3JjZT86IGJvb2xlYW4pOiB0aGlzXG4gICAgdG9nZ2xlQ2xhc3MoY2xzLCBmb3JjZSkge1xuICAgICAgICBpZiAoIGlzRnVuY3Rpb248Ym9vbGVhbj4oY2xzKSApXG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLmNsYXNzKGNscyksIGZvcmNlKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC50b2dnbGUoY2xzLCBmb3JjZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipSZXR1cm5zIGB0aGlzLmUuY2xhc3NMaXN0LmNvbnRhaW5zKGNscylgICovXG4gICAgaGFzQ2xhc3MoY2xzOiBzdHJpbmcpOiBib29sZWFuXG4gICAgLyoqUmV0dXJucyB3aGV0aGVyIGB0aGlzYCBoYXMgYSBjbGFzcyB0aGF0IG1hdGNoZXMgcGFzc2VkIGZ1bmN0aW9uICovXG4gICAgaGFzQ2xhc3MoY2xzOiBUUmV0dXJuQm9vbGVhbik6IGJvb2xlYW5cbiAgICBoYXNDbGFzcyhjbHMpIHtcbiAgICAgICAgaWYgKCBpc0Z1bmN0aW9uPGJvb2xlYW4+KGNscykgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbGFzcyhjbHMpICE9PSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLmNsYXNzTGlzdC5jb250YWlucyhjbHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vICoqKiAgTm9kZXNcbiAgICAvKipJbnNlcnQgYXQgbGVhc3Qgb25lIGBub2RlYCBqdXN0IGFmdGVyIGB0aGlzYC4gQW55IGBub2RlYCBjYW4gYmUgZWl0aGVyIGBCZXR0ZXJIVE1MRWxlbWVudGBzIG9yIHZhbmlsbGEgYE5vZGVgLiovXG4gICAgYWZ0ZXIoLi4ubm9kZXM6IEFycmF5PEJldHRlckhUTUxFbGVtZW50IHwgTm9kZT4pOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IG5vZGUgb2Ygbm9kZXMgKSB7XG4gICAgICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICAgICAgdGhpcy5lLmFmdGVyKG5vZGUuZSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5lLmFmdGVyKG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipJbnNlcnQgYHRoaXNgIGp1c3QgYWZ0ZXIgYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9yIGEgdmFuaWxsYSBgTm9kZWAuKi9cbiAgICBpbnNlcnRBZnRlcihub2RlOiBCZXR0ZXJIVE1MRWxlbWVudCB8IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgIG5vZGUuZS5hZnRlcih0aGlzLmUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBub2RlLmFmdGVyKHRoaXMuZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipJbnNlcnQgYXQgbGVhc3Qgb25lIGBub2RlYCBhZnRlciB0aGUgbGFzdCBjaGlsZCBvZiBgdGhpc2AuXG4gICAgICogQW55IGBub2RlYCBjYW4gYmUgZWl0aGVyIGEgYEJldHRlckhUTUxFbGVtZW50YCwgYSB2YW5pbGxhIGBOb2RlYCxcbiAgICAgKiBhIGB7c29tZUtleTogQmV0dGVySFRNTEVsZW1lbnR9YCBwYWlycyBvYmplY3QsIG9yIGEgYFtzb21lS2V5LCBCZXR0ZXJIVE1MRWxlbWVudF1gIHR1cGxlLiovXG4gICAgYXBwZW5kKC4uLm5vZGVzOiBBcnJheTxCZXR0ZXJIVE1MRWxlbWVudCB8IE5vZGUgfCBUTWFwPEJldHRlckhUTUxFbGVtZW50PiB8IFsgc3RyaW5nLCBCZXR0ZXJIVE1MRWxlbWVudCBdPik6IHRoaXMge1xuICAgICAgICBmb3IgKCBsZXQgbm9kZSBvZiBub2RlcyApIHtcbiAgICAgICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgICAgICB0aGlzLmUuYXBwZW5kKG5vZGUuZSk7XG4gICAgICAgICAgICBlbHNlIGlmICggbm9kZSBpbnN0YW5jZW9mIE5vZGUgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5hcHBlbmQobm9kZSk7XG4gICAgICAgICAgICBlbHNlIGlmICggQXJyYXkuaXNBcnJheShub2RlKSApXG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZUFwcGVuZChbIG5vZGUgXSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZUFwcGVuZChub2RlKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipBcHBlbmQgYHRoaXNgIHRvIGEgYEJldHRlckhUTUxFbGVtZW50YCBvciBhIHZhbmlsbGEgYE5vZGVgKi9cbiAgICBhcHBlbmRUbyhub2RlOiBCZXR0ZXJIVE1MRWxlbWVudCB8IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgIG5vZGUuZS5hcHBlbmQodGhpcy5lKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbm9kZS5hcHBlbmQodGhpcy5lKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipJbnNlcnQgYXQgbGVhc3Qgb25lIGBub2RlYCBqdXN0IGJlZm9yZSBgdGhpc2AuIEFueSBgbm9kZWAgY2FuIGJlIGVpdGhlciBgQmV0dGVySFRNTEVsZW1lbnRgcyBvciB2YW5pbGxhIGBOb2RlYC4qL1xuICAgIGJlZm9yZSguLi5ub2RlczogQXJyYXk8QmV0dGVySFRNTEVsZW1lbnQgfCBOb2RlPik6IHRoaXMge1xuICAgICAgICBmb3IgKCBsZXQgbm9kZSBvZiBub2RlcyApIHtcbiAgICAgICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgICAgICB0aGlzLmUuYmVmb3JlKG5vZGUuZSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5lLmJlZm9yZShub2RlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqSW5zZXJ0IGB0aGlzYCBqdXN0IGJlZm9yZSBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgb3IgYSB2YW5pbGxhIGBOb2RlYHMuKi9cbiAgICBpbnNlcnRCZWZvcmUobm9kZTogQmV0dGVySFRNTEVsZW1lbnQgfCBIVE1MRWxlbWVudCk6IHRoaXMge1xuICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICBub2RlLmUuYmVmb3JlKHRoaXMuZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5vZGUuYmVmb3JlKHRoaXMuZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICByZXBsYWNlQ2hpbGQobmV3Q2hpbGQ6IE5vZGUsIG9sZENoaWxkOiBOb2RlKTogdGhpcztcbiAgICByZXBsYWNlQ2hpbGQobmV3Q2hpbGQ6IEJldHRlckhUTUxFbGVtZW50LCBvbGRDaGlsZDogQmV0dGVySFRNTEVsZW1lbnQpOiB0aGlzO1xuICAgIHJlcGxhY2VDaGlsZChuZXdDaGlsZCwgb2xkQ2hpbGQpIHtcbiAgICAgICAgdGhpcy5lLnJlcGxhY2VDaGlsZChuZXdDaGlsZCwgb2xkQ2hpbGQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBfY2FjaGUoa2V5OiBzdHJpbmcsIGNoaWxkOiBCZXR0ZXJIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzW2tleV0gPSBjaGlsZDtcbiAgICAgICAgdGhpcy5fY2FjaGVkQ2hpbGRyZW5ba2V5XSA9IGNoaWxkO1xuICAgIH1cbiAgICBcbiAgICAvKipGb3IgZWFjaCBgW2tleSwgY2hpbGRdYCBwYWlyLCBgYXBwZW5kKGNoaWxkKWAgYW5kIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLiAqL1xuICAgIGNhY2hlQXBwZW5kKGtleUNoaWxkUGFpcnM6IFRNYXA8QmV0dGVySFRNTEVsZW1lbnQ+KTogdGhpc1xuICAgIC8qKkZvciBlYWNoIGBba2V5LCBjaGlsZF1gIHR1cGxlLCBgYXBwZW5kKGNoaWxkKWAgYW5kIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLiAqL1xuICAgIGNhY2hlQXBwZW5kKGtleUNoaWxkUGFpcnM6IFsgc3RyaW5nLCBCZXR0ZXJIVE1MRWxlbWVudCBdW10pOiB0aGlzXG4gICAgY2FjaGVBcHBlbmQoa2V5Q2hpbGRQYWlycykge1xuICAgICAgICBjb25zdCBfY2FjaGVBcHBlbmQgPSAoX2tleTogc3RyaW5nLCBfY2hpbGQ6IEJldHRlckhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFwcGVuZChfY2hpbGQpO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGUoX2tleSwgX2NoaWxkKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCBBcnJheS5pc0FycmF5KGtleUNoaWxkUGFpcnMpICkge1xuICAgICAgICAgICAgZm9yICggbGV0IFsga2V5LCBjaGlsZCBdIG9mIGtleUNoaWxkUGFpcnMgKVxuICAgICAgICAgICAgICAgIF9jYWNoZUFwcGVuZChrZXksIGNoaWxkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoIGxldCBbIGtleSwgY2hpbGQgXSBvZiBlbnVtZXJhdGUoa2V5Q2hpbGRQYWlycykgKVxuICAgICAgICAgICAgICAgIF9jYWNoZUFwcGVuZChrZXksIGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqR2V0IGEgY2hpbGQgd2l0aCBgcXVlcnlTZWxlY3RvcmAgYW5kIHJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgb2YgaXQqL1xuICAgIGNoaWxkPEsgZXh0ZW5kcyBIVE1MVGFnPihzZWxlY3RvcjogSyk6IEJldHRlckhUTUxFbGVtZW50O1xuICAgIC8qKkdldCBhIGNoaWxkIHdpdGggYHF1ZXJ5U2VsZWN0b3JgIGFuZCByZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9mIGl0Ki9cbiAgICBjaGlsZChzZWxlY3Rvcjogc3RyaW5nKTogQmV0dGVySFRNTEVsZW1lbnQ7XG4gICAgY2hpbGQoc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCZXR0ZXJIVE1MRWxlbWVudCh7IGh0bWxFbGVtZW50IDogdGhpcy5lLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpIH0pO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipSZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIGxpc3Qgb2YgYWxsIGNoaWxkcmVuICovXG4gICAgY2hpbGRyZW4oKTogQmV0dGVySFRNTEVsZW1lbnRbXTtcbiAgICAvKipSZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIGxpc3Qgb2YgYWxsIGNoaWxkcmVuIHNlbGVjdGVkIGJ5IGBzZWxlY3RvcmAgKi9cbiAgICBjaGlsZHJlbjxLIGV4dGVuZHMgSFRNTFRhZz4oc2VsZWN0b3I6IEspOiBCZXR0ZXJIVE1MRWxlbWVudFtdO1xuICAgIC8qKlJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgbGlzdCBvZiBhbGwgY2hpbGRyZW4gc2VsZWN0ZWQgYnkgYHNlbGVjdG9yYCAqL1xuICAgIGNoaWxkcmVuKHNlbGVjdG9yOiBzdHJpbmcgfCBIVE1MVGFnKTogQmV0dGVySFRNTEVsZW1lbnRbXTtcbiAgICBjaGlsZHJlbihzZWxlY3Rvcj8pIHtcbiAgICAgICAgbGV0IGNoaWxkcmVuVmFuaWxsYTtcbiAgICAgICAgbGV0IGNoaWxkcmVuQ29sbGVjdGlvbjtcbiAgICAgICAgaWYgKCBzZWxlY3RvciA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgY2hpbGRyZW5Db2xsZWN0aW9uID0gdGhpcy5lLmNoaWxkcmVuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hpbGRyZW5Db2xsZWN0aW9uID0gdGhpcy5lLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkcmVuVmFuaWxsYSA9IDxIVE1MRWxlbWVudFtdPiBBcnJheS5mcm9tKGNoaWxkcmVuQ29sbGVjdGlvbik7XG4gICAgICAgIGNvbnN0IHRvRWxlbSA9IChjOiBIVE1MRWxlbWVudCkgPT4gbmV3IEJldHRlckhUTUxFbGVtZW50KHsgaHRtbEVsZW1lbnQgOiBjIH0pO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW5WYW5pbGxhLm1hcCh0b0VsZW0pO1xuICAgIH1cbiAgICBcbiAgICBjbG9uZShkZWVwPzogYm9vbGVhbik6IEJldHRlckhUTUxFbGVtZW50IHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gbmV3IEJldHRlckhUTUxFbGVtZW50KHsgaHRtbEVsZW1lbnQgOiB0aGlzLmUuY2xvbmVOb2RlKGRlZXApIH0pO1xuICAgIH1cbiAgICBcbiAgICAvKipGb3IgZWFjaCBgW2tleSwgc2VsZWN0b3JdYCBwYWlyLCB3aGVyZSBgc2VsZWN0b3JgIGlzIGVpdGhlciBhbiBgSFRNTFRhZ2Agb3IgYSBgc3RyaW5nYCwgZ2V0IGB0aGlzLmNoaWxkKHNlbGVjdG9yKWAsIGFuZCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzaW5nIGBjYWNoZUNoaWxkcmVuYCBkaXJlY3RseVxuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oeyBpZDogJ25hdmJhcicgfSk7XG4gICAgICogbmF2YmFyLmNhY2hlQ2hpbGRyZW4oeyBob21lOiAnLm5hdmJhci1pdGVtLWhvbWUnLCBhYm91dDogJy5uYXZiYXItaXRlbS1hYm91dCcgfSk7XG4gICAgICogbmF2YmFyLmhvbWUudG9nZ2xlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBuYXZiYXIuYWJvdXQuY3NzKC4uLik7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgaW5kaXJlY3RseSB0aHJvdWdoIGBjaGlsZHJlbmAgY29uc3RydWN0b3Igb3B0aW9uXG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7IGlkOiAnbmF2YmFyJywgY2hpbGRyZW46IHsgaG9tZTogJy5uYXZiYXItaXRlbS1ob21lJywgYWJvdXQ6ICcubmF2YmFyLWl0ZW0tYWJvdXQnIH19KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIG5hdmJhci5hYm91dC5jc3MoLi4uKTtcbiAgICAgKiBAc2VlIHRoaXMuY2hpbGQqL1xuICAgIGNhY2hlQ2hpbGRyZW4ocXVlcnlNYXA6IFRNYXA8UXVlcnlTZWxlY3Rvcj4pOiB0aGlzXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIHNlbGVjdG9yXWAgcGFpciwgd2hlcmUgYHNlbGVjdG9yYCBpcyBhIHJlY3Vyc2l2ZSBge3N1YnNlbGVjdG9yOiBrZXlTZWxlY3Rvck9ian1gIG9iamVjdCxcbiAgICAgKiBleHRyYWN0IGB0aGlzLmNoaWxkKHN1YnNlbGVjdG9yKWAsIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLCB0aGVuIGNhbGwgYHRoaXNba2V5XS5jYWNoZUNoaWxkcmVuYCBwYXNzaW5nIHRoZSByZWN1cnNpdmUgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGRpcmVjdGx5XG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7IGlkOiAnbmF2YmFyJyB9KTtcbiAgICAgKiBuYXZiYXIuY2FjaGVDaGlsZHJlbih7XG4gICAgICogICAgICBob21lOiB7XG4gICAgICogICAgICAgICAgJy5uYXZiYXItaXRlbS1ob21lJzoge1xuICAgICAqICAgICAgICAgICAgICBuZXdzOiAnLm5hdmJhci1zdWJpdGVtLW5ld3MsXG4gICAgICogICAgICAgICAgICAgIHN1cHBvcnQ6ICcubmF2YmFyLXN1Yml0ZW0tc3VwcG9ydCdcbiAgICAgKiAgICAgICAgICB9XG4gICAgICogICAgICB9XG4gICAgICogIH0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogbmF2YmFyLmhvbWUubmV3cy5jc3MoLi4uKTtcbiAgICAgKiBuYXZiYXIuaG9tZS5zdXBwb3J0LnBvaW50ZXJkb3duKC4uLik7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgaW5kaXJlY3RseSB0aHJvdWdoIGBjaGlsZHJlbmAgY29uc3RydWN0b3Igb3B0aW9uXG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7cXVlcnk6ICcjbmF2YmFyJywgY2hpbGRyZW46IHtcbiAgICAgKiAgICAgIGhvbWU6IHtcbiAgICAgKiAgICAgICAgICAnLm5hdmJhci1pdGVtLWhvbWUnOiB7XG4gICAgICogICAgICAgICAgICAgIG5ld3M6ICcubmF2YmFyLXN1Yml0ZW0tbmV3cyxcbiAgICAgKiAgICAgICAgICAgICAgc3VwcG9ydDogJy5uYXZiYXItc3ViaXRlbS1zdXBwb3J0J1xuICAgICAqICAgICAgICAgIH1cbiAgICAgKiAgICAgIH1cbiAgICAgKiAgfX0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogbmF2YmFyLmhvbWUubmV3cy5jc3MoLi4uKTtcbiAgICAgKiBuYXZiYXIuaG9tZS5zdXBwb3J0LnBvaW50ZXJkb3duKC4uLik7XG4gICAgICogQHNlZSB0aGlzLmNoaWxkKi9cbiAgICBjYWNoZUNoaWxkcmVuKHJlY3Vyc2l2ZVF1ZXJ5TWFwOiBUUmVjTWFwPFF1ZXJ5U2VsZWN0b3I+KTogdGhpc1xuICAgIGNhY2hlQ2hpbGRyZW4oYmhlTWFwOiBUTWFwPEJldHRlckhUTUxFbGVtZW50Pik6IHRoaXNcbiAgICAvKipGb3IgZWFjaCBgW2tleSwgc2VsZWN0b3JdYCBwYWlyLCB3aGVyZSBgc2VsZWN0b3JgIGlzIGEgYEJldHRlckhUTUxFbGVtZW50YCwgc3RvcmUgaXQgaW4gYHRoaXNba2V5XWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgZGlyZWN0bHlcbiAgICAgKiBjb25zdCBob21lID0gZWxlbSh7IHF1ZXJ5OiAnLm5hdmJhci1pdGVtLWhvbWUnIH0pO1xuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oeyBpZDogJ25hdmJhcicgfSk7XG4gICAgICogbmF2YmFyLmNhY2hlQ2hpbGRyZW4oeyBob21lIH0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgaW5kaXJlY3RseSB0aHJvdWdoIGBjaGlsZHJlbmAgY29uc3RydWN0b3Igb3B0aW9uXG4gICAgICogY29uc3QgaG9tZSA9IGVsZW0oeyBxdWVyeTogJy5uYXZiYXItaXRlbS1ob21lJyB9KTtcbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHtpZDogJ25hdmJhcicsIGNoaWxkcmVuOiB7IGhvbWUgfX0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogQHNlZSB0aGlzLmNoaWxkKi9cbiAgICBcbiAgICBjYWNoZUNoaWxkcmVuKHJlY3Vyc2l2ZUJIRU1hcDogVFJlY01hcDxCZXR0ZXJIVE1MRWxlbWVudD4pOiB0aGlzXG4gICAgLyoqa2V5OiBzdHJpbmcuIHZhbHVlOiBlaXRoZXIgXCJzZWxlY3RvciBzdHJpbmdcIiBPUiB7XCJzZWxlY3RvciBzdHJpbmdcIjogPHJlY3Vyc2UgZG93bj59Ki9cbiAgICBjYWNoZUNoaWxkcmVuKG1hcCkge1xuICAgICAgICBmb3IgKCBsZXQgWyBrZXksIHZhbHVlIF0gb2YgZW51bWVyYXRlKG1hcCkgKSB7XG4gICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgICAgICAgICAgIGlmICggaXNPYmplY3QodmFsdWUpICkge1xuICAgICAgICAgICAgICAgIGlmICggdmFsdWUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoa2V5LCB2YWx1ZSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBlbnRyaWVzWzFdICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYGNhY2hlQ2hpbGRyZW4oKSByZWNlaXZlZCByZWN1cnNpdmUgb2JqIHdpdGggbW9yZSB0aGFuIDEgc2VsZWN0b3IgZm9yIGEga2V5LiBVc2luZyBvbmx5IDB0aCBzZWxlY3RvcmAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm11bHRpcGxlIHNlbGVjdG9yc1wiIDogZW50cmllcy5tYXAoZSA9PiBlWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBvbmx5IGZpcnN0IGJlY2F1c2UgMToxIGZvciBrZXk6c2VsZWN0b3IuXG4gICAgICAgICAgICAgICAgICAgIC8vIChpZSBjYW4ndCBkbyB7cmlnaHQ6IHsucmlnaHQ6IHsuLi59LCAucmlnaHQyOiB7Li4ufX0pXG4gICAgICAgICAgICAgICAgICAgIGxldCBbIHNlbGVjdG9yLCBvYmogXSA9IGVudHJpZXNbMF07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlKGtleSwgdGhpcy5jaGlsZChzZWxlY3RvcikpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2tleV0uY2FjaGVDaGlsZHJlbihvYmopXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShrZXksIHRoaXMuY2hpbGQodmFsdWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBjYWNoZUNoaWxkcmVuLCBiYWQgdmFsdWUgdHlwZTogXCIke3R5cGV9XCIuIGtleTogXCIke2tleX1cIiwgdmFsdWU6IFwiJHt2YWx1ZX1cIi4gbWFwOmAsIG1hcCwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqUmVtb3ZlIGFsbCBjaGlsZHJlbiBmcm9tIERPTSovXG4gICAgZW1wdHkoKTogdGhpcyB7XG4gICAgICAgIC8vIFRPRE86IGlzIHRoaXMgZmFzdGVyIHRoYW4gaW5uZXJIVE1MID0gXCJcIj9cbiAgICAgICAgd2hpbGUgKCB0aGlzLmUuZmlyc3RDaGlsZCApXG4gICAgICAgICAgICB0aGlzLmUucmVtb3ZlQ2hpbGQodGhpcy5lLmZpcnN0Q2hpbGQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqUmVtb3ZlIGVsZW1lbnQgZnJvbSBET00qL1xuICAgIHJlbW92ZSgpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lLnJlbW92ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ETzogcmVjdXJzaXZlbHkgeWllbGQgY2hpbGRyZW5cbiAgICAvLyAgKHVubGlrZSAuY2hpbGRyZW4oKSwgdGhpcyBkb2Vzbid0IHJldHVybiBvbmx5IHRoZSBmaXJzdCBsZXZlbClcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgZmluZCgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9maW5kL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZpcnN0KCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2ZpcnN0L1xuICAgICAgICAvLyB0aGlzLmUuZmlyc3RDaGlsZFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGxhc3QoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vbGFzdC9cbiAgICAgICAgLy8gdGhpcy5lLmxhc3RDaGlsZFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG5leHQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbm90KCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHBhcmVudCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBwYXJlbnRzKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLy8gKioqICBFdmVudHNcbiAgICBcbiAgICBvbihldlR5cGVGblBhaXJzOiBURXZlbnRGdW5jdGlvbk1hcDxURXZlbnQ+LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IFsgZXZUeXBlLCBldkZuIF0gb2YgZW51bWVyYXRlKGV2VHlwZUZuUGFpcnMpICkge1xuICAgICAgICAgICAgY29uc3QgX2YgPSBmdW5jdGlvbiBfZihldnQpIHtcbiAgICAgICAgICAgICAgICBldkZuKGV2dCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5lLmFkZEV2ZW50TGlzdGVuZXIoZXZUeXBlLCBfZiwgb3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbZXZUeXBlXSA9IF9mO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBvbmNlKGV2VHlwZTogVEV2ZW50LCBsaXN0ZW5lcjogRnVuY3Rpb25SZWNpZXZlc0V2ZW50PFRFdmVudD4sIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICBjb25zdCBldlR5cGVGblBhaXJzID0ge307XG4gICAgICAgIGV2VHlwZUZuUGFpcnNbZXZUeXBlXSA9IGxpc3RlbmVyO1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyA9PT0gdW5kZWZpbmVkID8geyBvbmNlIDogdHJ1ZSB9IDogeyAuLi5vcHRpb25zLCBvbmNlIDogdHJ1ZSB9O1xuICAgICAgICByZXR1cm4gdGhpcy5vbihldlR5cGVGblBhaXJzLCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgLyoqUmVtb3ZlIGBldmVudGAgZnJvbSB3cmFwcGVkIGVsZW1lbnQncyBldmVudCBsaXN0ZW5lcnMsIGJ1dCBrZWVwIHRoZSByZW1vdmVkIGxpc3RlbmVyIGluIGNhY2hlLlxuICAgICAqIFRoaXMgaXMgdXNlZnVsIGZvciBsYXRlciB1bmJsb2NraW5nKi9cbiAgICBibG9ja0xpc3RlbmVyKGV2ZW50OiBURXZlbnQpIHtcbiAgICAgICAgbGV0IGxpc3RlbmVyID0gdGhpcy5fbGlzdGVuZXJzW2V2ZW50XTtcbiAgICAgICAgaWYgKCBsaXN0ZW5lciA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihgYmxvY2tMaXN0ZW5lcihldmVudCk6IHRoaXMuX2xpc3RlbmVyc1tldmVudF0gaXMgdW5kZWZpbmVkLiBldmVudDpgLCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHVuYmxvY2tMaXN0ZW5lcihldmVudDogVEV2ZW50KSB7XG4gICAgICAgIGxldCBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tldmVudF07XG4gICAgICAgIGlmICggbGlzdGVuZXIgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oYHVuYmxvY2tMaXN0ZW5lcihldmVudCk6IHRoaXMuX2xpc3RlbmVyc1tldmVudF0gaXMgdW5kZWZpbmVkLiBldmVudDpgLCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qXG4gICAgIENocm9ub2xvZ3k6XG4gICAgIG1vdXNlZG93biAgICAgIHRvdWNoc3RhcnRcdHBvaW50ZXJkb3duXG4gICAgIG1vdXNlZW50ZXJcdFx0ICAgICAgICAgICAgcG9pbnRlcmVudGVyXG4gICAgIG1vdXNlbGVhdmVcdFx0ICAgICAgICAgICAgcG9pbnRlcmxlYXZlXG4gICAgIG1vdXNlbW92ZSAgICAgIHRvdWNobW92ZVx0cG9pbnRlcm1vdmVcbiAgICAgbW91c2VvdXRcdFx0ICAgICAgICAgICAgcG9pbnRlcm91dFxuICAgICBtb3VzZW92ZXJcdFx0ICAgICAgICAgICAgcG9pbnRlcm92ZXJcbiAgICAgbW91c2V1cFx0ICAgIHRvdWNoZW5kICAgIHBvaW50ZXJ1cFxuICAgICAqL1xuICAgIC8qKiBBZGQgYSBgdG91Y2hzdGFydGAgZXZlbnQgbGlzdGVuZXIuIFRoaXMgaXMgdGhlIGZhc3QgYWx0ZXJuYXRpdmUgdG8gYGNsaWNrYCBsaXN0ZW5lcnMgZm9yIG1vYmlsZSAobm8gMzAwbXMgd2FpdCkuICovXG4gICAgdG91Y2hzdGFydChmbjogKGV2OiBUb3VjaEV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICB0aGlzLmUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uIF9mKGV2OiBUb3VjaEV2ZW50KSB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpOyAvLyBvdGhlcndpc2UgXCJ0b3VjaG1vdmVcIiBpcyB0cmlnZ2VyZWRcbiAgICAgICAgICAgIGZuKGV2KTtcbiAgICAgICAgICAgIGlmICggb3B0aW9ucyAmJiBvcHRpb25zLm9uY2UgKSAvLyBUT0RPOiBtYXliZSBuYXRpdmUgb3B0aW9ucy5vbmNlIGlzIGVub3VnaFxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIF9mKTtcbiAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICAgIC8vIFRPRE86IHRoaXMuX2xpc3RlbmVycywgb3IgdXNlIHRoaXMub24oXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBwb2ludGVyZW50ZXIoZm46IChldmVudDogUG9pbnRlckV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICByZXR1cm4gdGhpcy5vbih7IHBvaW50ZXJlbnRlciA6IGZuIH0sIG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICAvKiogQWRkIGEgYHBvaW50ZXJkb3duYCBldmVudCBsaXN0ZW5lciBpZiBicm93c2VyIHN1cHBvcnRzIGBwb2ludGVyZG93bmAsIGVsc2Ugc2VuZCBgbW91c2Vkb3duYCAoc2FmYXJpKS4gKi9cbiAgICBwb2ludGVyZG93bihmbjogKGV2ZW50OiBQb2ludGVyRXZlbnQgfCBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICBcbiAgICAgICAgbGV0IGFjdGlvbjtcbiAgICAgICAgLy8gVE9ETzogY2hlY2sgaWYgUG9pbnRlckV2ZW50IGV4aXN0cyBhbmQgc3RvcmUgaW4gdmFyIG91dHNpZGUgY2xhc3NcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGFjdGlvbiA9IHdpbmRvdy5Qb2ludGVyRXZlbnQgPyAncG9pbnRlcmRvd24nIDogJ21vdXNlZG93bic7IC8vIHNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgcG9pbnRlcmRvd25cbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICBhY3Rpb24gPSAnbW91c2Vkb3duJ1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IF9mID0gZnVuY3Rpb24gX2YoZXY6IFBvaW50ZXJFdmVudCB8IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBmbihldik7XG4gICAgICAgICAgICBpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5vbmNlICkgLy8gVE9ETzogbWF5YmUgbmF0aXZlIG9wdGlvbnMub25jZSBpcyBlbm91Z2hcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoYWN0aW9uLCBfZik7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZS5hZGRFdmVudExpc3RlbmVyKGFjdGlvbiwgX2YsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMucG9pbnRlcmRvd24gPSBfZjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEgY2xpY2sgb2YgdGhlIGVsZW1lbnQuIFVzZWZ1bCBmb3IgYDxhPmAgZWxlbWVudHMuKi9cbiAgICBjbGljaygpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBjbGlja2AgZXZlbnQgbGlzdGVuZXIuIFlvdSBzaG91bGQgcHJvYmFibHkgdXNlIGBwb2ludGVyZG93bigpYCBpZiBvbiBkZXNrdG9wLCBvciBgdG91Y2hzdGFydCgpYCBpZiBvbiBtb2JpbGUuKi9cbiAgICBjbGljayhmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgY2xpY2soZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLmUuY2xpY2soKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBjbGljayA6IGZuIH0sIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKkJsdXIgKHVuZm9jdXMpIHRoZSBlbGVtZW50LiovXG4gICAgYmx1cigpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBibHVyYCBldmVudCBsaXN0ZW5lciovXG4gICAgYmx1cihmbjogKGV2ZW50OiBGb2N1c0V2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgYmx1cihmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuZS5ibHVyKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgYmx1ciA6IGZuIH0sIG9wdGlvbnMpXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqRm9jdXMgdGhlIGVsZW1lbnQuKi9cbiAgICBmb2N1cygpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBmb2N1c2AgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGZvY3VzKGZuOiAoZXZlbnQ6IEZvY3VzRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBmb2N1cyhmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuZS5mb2N1cygpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGZvY3VzIDogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipBZGQgYSBgY2hhbmdlYCBldmVudCBsaXN0ZW5lciovXG4gICAgY2hhbmdlKGZuOiAoZXZlbnQ6IEV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICByZXR1cm4gdGhpcy5vbih7IGNoYW5nZSA6IGZuIH0sIG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICAvKipBZGQgYSBgY29udGV4dG1lbnVgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBjb250ZXh0bWVudShmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICByZXR1cm4gdGhpcy5vbih7IGNvbnRleHRtZW51IDogZm4gfSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEgZG91YmxlIGNsaWNrIG9mIHRoZSBlbGVtZW50LiovXG4gICAgZGJsY2xpY2soKTogdGhpcztcbiAgICAvKipBZGQgYSBgZGJsY2xpY2tgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBkYmxjbGljayhmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgZGJsY2xpY2soZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBjb25zdCBkYmxjbGljayA9IG5ldyBNb3VzZUV2ZW50KCdkYmxjbGljaycsIHtcbiAgICAgICAgICAgICAgICAndmlldycgOiB3aW5kb3csXG4gICAgICAgICAgICAgICAgJ2J1YmJsZXMnIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnY2FuY2VsYWJsZScgOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZS5kaXNwYXRjaEV2ZW50KGRibGNsaWNrKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBkYmxjbGljayA6IGZuIH0sIG9wdGlvbnMpXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBtb3VzZWVudGVyIGV2ZW50IHRvIHRoZSBlbGVtZW50LiovXG4gICAgbW91c2VlbnRlcigpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBtb3VzZWVudGVyYCBldmVudCBsaXN0ZW5lciovXG4gICAgbW91c2VlbnRlcihmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgbW91c2VlbnRlcihmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIC8vIG1vdXNlb3ZlcjogYWxzbyBjaGlsZCBlbGVtZW50c1xuICAgICAgICAvLyBtb3VzZWVudGVyOiBvbmx5IGJvdW5kIGVsZW1lbnRcbiAgICAgICAgXG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGNvbnN0IG1vdXNlZW50ZXIgPSBuZXcgTW91c2VFdmVudCgnbW91c2VlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAndmlldycgOiB3aW5kb3csXG4gICAgICAgICAgICAgICAgJ2J1YmJsZXMnIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnY2FuY2VsYWJsZScgOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZS5kaXNwYXRjaEV2ZW50KG1vdXNlZW50ZXIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IG1vdXNlZW50ZXIgOiBmbiB9LCBvcHRpb25zKVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEga2V5ZG93biBldmVudCB0byB0aGUgZWxlbWVudC4qL1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBrZXlkb3duKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYGtleWRvd25gIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBrZXlkb3duKGZuOiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBrZXlkb3duKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGtleWRvd24gOiBmbiB9LCBvcHRpb25zKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAga2V5dXAoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5dXAvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAga2V5cHJlc3MoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgaG92ZXIoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vaG92ZXIvXG4gICAgICAgIC8vIGJpbmRzIHRvIGJvdGggbW91c2VlbnRlciBhbmQgbW91c2VsZWF2ZVxuICAgICAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNzU4OTQyMC93aGVuLXRvLWNob29zZS1tb3VzZW92ZXItYW5kLWhvdmVyLWZ1bmN0aW9uXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbW91c2Vkb3duKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2tleXByZXNzL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG1vdXNlbGVhdmUoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIC8vbW91c2VsZWF2ZSBhbmQgbW91c2VvdXQgYXJlIHNpbWlsYXIgYnV0IGRpZmZlciBpbiB0aGF0IG1vdXNlbGVhdmUgZG9lcyBub3QgYnViYmxlIGFuZCBtb3VzZW91dCBkb2VzLlxuICAgICAgICAvLyBUaGlzIG1lYW5zIHRoYXQgbW91c2VsZWF2ZSBpcyBmaXJlZCB3aGVuIHRoZSBwb2ludGVyIGhhcyBleGl0ZWQgdGhlIGVsZW1lbnQgYW5kIGFsbCBvZiBpdHMgZGVzY2VuZGFudHMsXG4gICAgICAgIC8vIHdoZXJlYXMgbW91c2VvdXQgaXMgZmlyZWQgd2hlbiB0aGUgcG9pbnRlciBsZWF2ZXMgdGhlIGVsZW1lbnQgb3IgbGVhdmVzIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRlc2NlbmRhbnRzXG4gICAgICAgIC8vIChldmVuIGlmIHRoZSBwb2ludGVyIGlzIHN0aWxsIHdpdGhpbiB0aGUgZWxlbWVudCkuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbW91c2Vtb3ZlKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2tleXByZXNzL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBtb3VzZW91dCBldmVudCB0byB0aGUgZWxlbWVudC4qL1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBtb3VzZW91dCgpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBtb3VzZW91dGAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIG1vdXNlb3V0KGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBtb3VzZW91dChmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIC8vbW91c2VsZWF2ZSBhbmQgbW91c2VvdXQgYXJlIHNpbWlsYXIgYnV0IGRpZmZlciBpbiB0aGF0IG1vdXNlbGVhdmUgZG9lcyBub3QgYnViYmxlIGFuZCBtb3VzZW91dCBkb2VzLlxuICAgICAgICAvLyBUaGlzIG1lYW5zIHRoYXQgbW91c2VsZWF2ZSBpcyBmaXJlZCB3aGVuIHRoZSBwb2ludGVyIGhhcyBleGl0ZWQgdGhlIGVsZW1lbnQgYW5kIGFsbCBvZiBpdHMgZGVzY2VuZGFudHMsXG4gICAgICAgIC8vIHdoZXJlYXMgbW91c2VvdXQgaXMgZmlyZWQgd2hlbiB0aGUgcG9pbnRlciBsZWF2ZXMgdGhlIGVsZW1lbnQgb3IgbGVhdmVzIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRlc2NlbmRhbnRzXG4gICAgICAgIC8vIChldmVuIGlmIHRoZSBwb2ludGVyIGlzIHN0aWxsIHdpdGhpbiB0aGUgZWxlbWVudCkuXG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBtb3VzZW91dCA6IGZuIH0sIG9wdGlvbnMpXG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEgbW91c2VvdmVyIGV2ZW50IHRvIHRoZSBlbGVtZW50LiovXG4gICAgbW91c2VvdmVyKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYG1vdXNlb3ZlcmAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIG1vdXNlb3ZlcihmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgbW91c2VvdmVyKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgLy8gbW91c2VvdmVyOiBhbHNvIGNoaWxkIGVsZW1lbnRzXG4gICAgICAgIC8vIG1vdXNlZW50ZXI6IG9ubHkgYm91bmQgZWxlbWVudFxuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgbW91c2VvdmVyIDogZm4gfSwgb3B0aW9ucylcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG1vdXNldXAoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICB0cmFuc2Zvcm0ob3B0aW9uczogVHJhbnNmb3JtT3B0aW9ucykge1xuICAgICAgICBsZXQgdHJhbnNmb3JtOiBzdHJpbmcgPSAnJztcbiAgICAgICAgZm9yICggbGV0IFsgaywgdiBdIG9mIGVudW1lcmF0ZShvcHRpb25zKSApIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybSArPSBgJHtrfSgke3Z9KSBgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbih7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbmVuZCA6IHJlc29sdmVcbiAgICAgICAgICAgIH0sIHsgb25jZSA6IHRydWUgfSk7XG4gICAgICAgICAgICB0aGlzLmNzcyh7IHRyYW5zZm9ybSB9KVxuICAgICAgICB9KVxuICAgIH1cbiAgICBcbiAgICAvKiogUmVtb3ZlIHRoZSBldmVudCBsaXN0ZW5lciBvZiBgZXZlbnRgLCBpZiBleGlzdHMuKi9cbiAgICBvZmYoZXZlbnQ6IFRFdmVudCk6IHRoaXMge1xuICAgICAgICB0aGlzLmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcy5fbGlzdGVuZXJzW2V2ZW50XSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBhbGxPZmYoKTogdGhpcyB7XG4gICAgICAgIGZvciAoIGxldCBldmVudCBpbiB0aGlzLl9saXN0ZW5lcnMgKSB7XG4gICAgICAgICAgICB0aGlzLm9mZig8VEV2ZW50PiBldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8vICoqKiAgQXR0cmlidXRlc1xuICAgIFxuICAgIC8qKiBGb3IgZWFjaCBgW2F0dHIsIHZhbF1gIHBhaXIsIGFwcGx5IGBzZXRBdHRyaWJ1dGVgKi9cbiAgICBhdHRyKGF0dHJWYWxQYWlyczogVE1hcDxzdHJpbmcgfCBib29sZWFuPik6IHRoaXNcbiAgICAvKiogYXBwbHkgYGdldEF0dHJpYnV0ZWAqL1xuICAgIGF0dHIoYXR0cmlidXRlTmFtZTogc3RyaW5nKTogc3RyaW5nXG4gICAgYXR0cihhdHRyVmFsUGFpcnMpIHtcbiAgICAgICAgaWYgKCB0eXBlb2YgYXR0clZhbFBhaXJzID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuZ2V0QXR0cmlidXRlKGF0dHJWYWxQYWlycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKCBsZXQgWyBhdHRyLCB2YWwgXSBvZiBlbnVtZXJhdGUoYXR0clZhbFBhaXJzKSApXG4gICAgICAgICAgICAgICAgdGhpcy5lLnNldEF0dHJpYnV0ZShhdHRyLCB2YWwpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqIGByZW1vdmVBdHRyaWJ1dGVgICovXG4gICAgcmVtb3ZlQXR0cihxdWFsaWZpZWROYW1lOiBzdHJpbmcsIC4uLnF1YWxpZmllZE5hbWVzOiBzdHJpbmdbXSk6IHRoaXMge1xuICAgICAgICBsZXQgX3JlbW92ZUF0dHJpYnV0ZTtcbiAgICAgICAgaWYgKCB0aGlzLl9pc1N2ZyApXG4gICAgICAgICAgICBfcmVtb3ZlQXR0cmlidXRlID0gKHF1YWxpZmllZE5hbWUpID0+IHRoaXMuZS5yZW1vdmVBdHRyaWJ1dGVOUyhTVkdfTlNfVVJJLCBxdWFsaWZpZWROYW1lKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgX3JlbW92ZUF0dHJpYnV0ZSA9IChxdWFsaWZpZWROYW1lKSA9PiB0aGlzLmUucmVtb3ZlQXR0cmlidXRlKHF1YWxpZmllZE5hbWUpO1xuICAgICAgICBcbiAgICAgICAgX3JlbW92ZUF0dHJpYnV0ZShxdWFsaWZpZWROYW1lKTtcbiAgICAgICAgZm9yICggbGV0IHFuIG9mIHF1YWxpZmllZE5hbWVzIClcbiAgICAgICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUocW4pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqYGdldEF0dHJpYnV0ZShgZGF0YS0ke2tleX1gKWAuIEpTT04ucGFyc2UgaXQgYnkgZGVmYXVsdC4qL1xuICAgIGRhdGEoa2V5OiBzdHJpbmcsIHBhcnNlOiBib29sZWFuID0gdHJ1ZSk6IHN0cmluZyB8IFRNYXA8c3RyaW5nPiB7XG4gICAgICAgIC8vIFRPRE86IGpxdWVyeSBkb2Vzbid0IGFmZmVjdCBkYXRhLSogYXR0cnMgaW4gRE9NLiBodHRwczovL2FwaS5qcXVlcnkuY29tL2RhdGEvXG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmUuZ2V0QXR0cmlidXRlKGBkYXRhLSR7a2V5fWApO1xuICAgICAgICBpZiAoIHBhcnNlID09PSB0cnVlIClcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gZGF0YVxuICAgIH1cbiAgICBcbiAgICBnZXRPcGFjaXR5VHJhbnNpdGlvbkR1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgICAgIGlmICggIXRoaXMuX2NvbXB1dGVkU3R5bGUgKSB7XG4gICAgICAgICAgICB0aGlzLl9jb21wdXRlZFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBnb3QgY29tcHV0ZWQgc3R5bGUgZnJvbSBjYWNoZWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgdHJhbnNpdGlvblByb3BlcnR5LCB0cmFuc2l0aW9uRHVyYXRpb24gfSA9IHRoaXMuX2NvbXB1dGVkU3R5bGU7XG4gICAgICAgIGNvbnN0IHRyYW5zUHJvcCA9IHRyYW5zaXRpb25Qcm9wZXJ0eS5zcGxpdCgnLCAnKTtcbiAgICAgICAgY29uc3QgaW5kZXhPZk9wYWNpdHkgPSB0cmFuc1Byb3AuaW5kZXhPZignb3BhY2l0eScpO1xuICAgICAgICBpZiAoIGluZGV4T2ZPcGFjaXR5ICE9PSAtMSApIHtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zRHVyID0gdHJhbnNpdGlvbkR1cmF0aW9uLnNwbGl0KCcsICcpO1xuICAgICAgICAgICAgY29uc3Qgb3BhY2l0eVRyYW5zRHVyID0gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldO1xuICAgICAgICAgICAgaWYgKCBvcGFjaXR5VHJhbnNEdXIuaW5jbHVkZXMoJ20nKSApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQob3BhY2l0eVRyYW5zRHVyKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChvcGFjaXR5VHJhbnNEdXIpICogMTAwMFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIFxuICAgIC8vICoqICBGYWRlXG4gICAgYXN5bmMgZmFkZShkdXI6IG51bWJlciwgdG86IDAgfCAxKTogUHJvbWlzZTx0aGlzPiB7XG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuZSk7XG4gICAgICAgIGNvbnN0IHRyYW5zUHJvcCA9IHN0eWxlcy50cmFuc2l0aW9uUHJvcGVydHkuc3BsaXQoJywgJyk7XG4gICAgICAgIGNvbnN0IGluZGV4T2ZPcGFjaXR5ID0gdHJhbnNQcm9wLmluZGV4T2YoJ29wYWNpdHknKTtcbiAgICAgICAgLy8gY3NzIG9wYWNpdHk6MCA9PiB0cmFuc0R1cltpbmRleE9mT3BhY2l0eV06IDBzXG4gICAgICAgIC8vIGNzcyBvcGFjaXR5OjUwMG1zID0+IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTogMC41c1xuICAgICAgICAvLyBjc3MgTk8gb3BhY2l0eSA9PiB0cmFuc0R1cltpbmRleE9mT3BhY2l0eV06IHVuZGVmaW5lZFxuICAgICAgICBpZiAoIGluZGV4T2ZPcGFjaXR5ICE9PSAtMSApIHtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zRHVyID0gc3R5bGVzLnRyYW5zaXRpb25EdXJhdGlvbi5zcGxpdCgnLCAnKTtcbiAgICAgICAgICAgIGNvbnN0IG9wYWNpdHlUcmFuc0R1ciA9IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zID0gc3R5bGVzLnRyYW5zaXRpb24uc3BsaXQoJywgJyk7XG4gICAgICAgICAgICAvLyB0cmFuc2l0aW9uOiBvcGFjaXR5IHdhcyBkZWZpbmVkIGluIGNzcy5cbiAgICAgICAgICAgIC8vIHNldCB0cmFuc2l0aW9uIHRvIGR1ciwgc2V0IG9wYWNpdHkgdG8gMCwgbGVhdmUgdGhlIGFuaW1hdGlvbiB0byBuYXRpdmUgdHJhbnNpdGlvbiwgd2FpdCBkdXIgYW5kIHJldHVybiB0aGlzXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGZhZGUoJHtkdXJ9LCAke3RvfSksIG9wYWNpdHlUcmFuc0R1ciAhPT0gdW5kZWZpbmVkLiBudWxsaWZ5aW5nIHRyYW5zaXRpb24uIFNIT1VMRCBOT1QgV09SS2ApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYHRyYW5zOlxcdCR7dHJhbnN9XFxudHJhbnNQcm9wOlxcdCR7dHJhbnNQcm9wfVxcbmluZGV4T2ZPcGFjaXR5OlxcdCR7aW5kZXhPZk9wYWNpdHl9XFxub3BhY2l0eVRyYW5zRHVyOlxcdCR7b3BhY2l0eVRyYW5zRHVyfWApO1xuICAgICAgICAgICAgLy8gdHJhbnMuc3BsaWNlKGluZGV4T2ZPcGFjaXR5LCAxLCBgb3BhY2l0eSAke2R1ciAvIDEwMDB9c2ApO1xuICAgICAgICAgICAgdHJhbnMuc3BsaWNlKGluZGV4T2ZPcGFjaXR5LCAxLCBgb3BhY2l0eSAwc2ApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYGFmdGVyLCB0cmFuczogJHt0cmFuc31gKTtcbiAgICAgICAgICAgIHRoaXMuZS5zdHlsZS50cmFuc2l0aW9uID0gdHJhbnMuam9pbignLCAnKTtcbiAgICAgICAgICAgIHRoaXMuY3NzKHsgb3BhY2l0eSA6IHRvIH0pO1xuICAgICAgICAgICAgYXdhaXQgd2FpdChkdXIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdHJhbnNpdGlvbjogb3BhY2l0eSB3YXMgTk9UIGRlZmluZWQgaW4gY3NzLlxuICAgICAgICBpZiAoIGR1ciA9PSAwICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3NzKHsgb3BhY2l0eSA6IHRvIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlzRmFkZU91dCA9IHRvID09PSAwO1xuICAgICAgICBsZXQgb3BhY2l0eSA9IHBhcnNlRmxvYXQodGhpcy5lLnN0eWxlLm9wYWNpdHkpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBvcGFjaXR5ID09PSB1bmRlZmluZWQgfHwgaXNOYU4ob3BhY2l0eSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGZhZGUoJHtkdXJ9LCAke3RvfSkgaHRtbEVsZW1lbnQgaGFzIE5PIG9wYWNpdHkgYXQgYWxsLiByZWN1cnNpbmdgLCB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eSxcbiAgICAgICAgICAgICAgICB0aGlzIDogdGhpc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jc3MoeyBvcGFjaXR5IDogTWF0aC5hYnMoMSAtIHRvKSB9KS5mYWRlKGR1ciwgdG8pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICggaXNGYWRlT3V0ID8gb3BhY2l0eSA8PSAwIDogb3BhY2l0eSA+IDEgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBmYWRlKCR7ZHVyfSwgJHt0b30pIG9wYWNpdHkgd2FzIGJleW9uZCB0YXJnZXQgb3BhY2l0eS4gcmV0dXJuaW5nIHRoaXMgYXMgaXMuYCwge1xuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5LFxuICAgICAgICAgICAgICAgICAgICB0aGlzIDogdGhpc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgc3RlcHMgPSAzMDtcbiAgICAgICAgbGV0IG9wU3RlcCA9IDEgLyBzdGVwcztcbiAgICAgICAgbGV0IGV2ZXJ5bXMgPSBkdXIgLyBzdGVwcztcbiAgICAgICAgaWYgKCBldmVyeW1zIDwgMSApIHtcbiAgICAgICAgICAgIGV2ZXJ5bXMgPSAxO1xuICAgICAgICAgICAgc3RlcHMgPSBkdXI7XG4gICAgICAgICAgICBvcFN0ZXAgPSAxIC8gc3RlcHM7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYGZhZGUoJHtkdXJ9LCAke3RvfSkgaGFkIG9wYWNpdHksIG5vIHRyYW5zaXRpb24uIChnb29kKSBvcGFjaXR5OiAke29wYWNpdHl9YCwge1xuICAgICAgICAgICAgc3RlcHMsXG4gICAgICAgICAgICBvcFN0ZXAsXG4gICAgICAgICAgICBldmVyeW1zXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZWFjaGVkVG8gPSBpc0ZhZGVPdXQgPyAob3ApID0+IG9wIC0gb3BTdGVwID4gMCA6IChvcCkgPT4gb3AgKyBvcFN0ZXAgPCAxO1xuICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICggcmVhY2hlZFRvKG9wYWNpdHkpICkge1xuICAgICAgICAgICAgICAgIGlmICggaXNGYWRlT3V0ID09PSB0cnVlIClcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eSAtPSBvcFN0ZXA7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5ICs9IG9wU3RlcDtcbiAgICAgICAgICAgICAgICB0aGlzLmNzcyh7IG9wYWNpdHkgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wYWNpdHkgPSB0bztcbiAgICAgICAgICAgICAgICB0aGlzLmNzcyh7IG9wYWNpdHkgfSk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGV2ZXJ5bXMpO1xuICAgICAgICBhd2FpdCB3YWl0KGR1cik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBhc3luYyBmYWRlT3V0KGR1cjogbnVtYmVyKTogUHJvbWlzZTx0aGlzPiB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZhZGUoZHVyLCAwKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgYXN5bmMgZmFkZUluKGR1cjogbnVtYmVyKTogUHJvbWlzZTx0aGlzPiB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZhZGUoZHVyLCAxKTtcbiAgICB9XG4gICAgXG4gICAgXG59XG5cbmNsYXNzIERpdiBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBIVE1MRGl2RWxlbWVudDtcbiAgICByZWFkb25seSBlOiBIVE1MRGl2RWxlbWVudDtcbiAgICBcbiAgICAvKipDcmVhdGUgYSBEaXYgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0IG9yIGNscy4qL1xuICAgIGNvbnN0cnVjdG9yKHsgaWQsIHRleHQsIGNscyB9OiBTdWJFbGVtQ29uc3RydWN0b3IgPSB7fSkge1xuICAgICAgICBzdXBlcih7IHRhZyA6ICdkaXYnLCB0ZXh0LCBjbHMgfSk7XG4gICAgICAgIGlmICggaWQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmlkKGlkKTtcbiAgICB9XG59XG5cbmNsYXNzIFBhcmFncmFwaCBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBIVE1MUGFyYWdyYXBoRWxlbWVudDtcbiAgICByZWFkb25seSBlOiBIVE1MUGFyYWdyYXBoRWxlbWVudDtcbiAgICBcbiAgICAvKipDcmVhdGUgYSBQYXJhZ3JhcGggZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0IG9yIGNscy4qL1xuICAgIGNvbnN0cnVjdG9yKHsgaWQsIHRleHQsIGNscyB9OiBTdWJFbGVtQ29uc3RydWN0b3IgPSB7fSkge1xuICAgICAgICBzdXBlcih7IHRhZyA6ICdwJywgdGV4dCwgY2xzIH0pO1xuICAgICAgICBpZiAoIGlkICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5pZChpZCk7XG4gICAgfVxufVxuXG5jbGFzcyBTcGFuIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxTcGFuRWxlbWVudDtcbiAgICByZWFkb25seSBlOiBIVE1MU3BhbkVsZW1lbnQ7XG4gICAgXG4gICAgLyoqQ3JlYXRlIGEgU3BhbiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ3NwYW4nLCB0ZXh0LCBjbHMgfSk7XG4gICAgICAgIGlmICggaWQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmlkKGlkKTtcbiAgICAgICAgXG4gICAgfVxufVxuXG5jbGFzcyBJbWcgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTEltYWdlRWxlbWVudDtcbiAgICBcbiAgICAvKipDcmVhdGUgYW4gSW1nIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgc3JjIG9yIGNscy4qL1xuICAgIGNvbnN0cnVjdG9yKHsgaWQsIHNyYywgY2xzIH06IEltZ0NvbnN0cnVjdG9yKSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ2ltZycsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBpZiAoIHNyYyAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnNyYyA9IHNyYztcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHNyYyhzcmM6IHN0cmluZyk6IHRoaXM7XG4gICAgc3JjKCk6IHN0cmluZztcbiAgICBzcmMoc3JjPykge1xuICAgICAgICBpZiAoIHNyYyA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50LnNyY1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuc3JjID0gc3JjO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmVhZG9ubHkgZTogSFRNTEltYWdlRWxlbWVudDtcbn1cblxuY2xhc3MgQnV0dG9uIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxCdXR0b25FbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhIEJ1dHRvbiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIGNscywgaHRtbCBvciBjbGljayBmdW5jdGlvbiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgY2xzLCBjbGljaywgaHRtbCB9OiBCdXR0b25Db25zdHJ1Y3Rvcikge1xuICAgICAgICBzdXBlcih7IHRhZyA6ICdidXR0b24nLCBjbHMgfSk7XG4gICAgICAgIGlmICggaWQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmlkKGlkKTtcbiAgICAgICAgaWYgKCBjbGljayAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuY2xpY2soY2xpY2spO1xuICAgICAgICBpZiAoIGh0bWwgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmh0bWwoaHRtbCk7XG4gICAgICAgIHRoaXMuYXR0cih7IHR5cGUgOiAnYnV0dG9uJyB9KVxuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHJlYWRvbmx5IGU6IEhUTUxCdXR0b25FbGVtZW50O1xufVxuXG5jbGFzcyBBbmNob3IgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTEFuY2hvckVsZW1lbnQ7XG4gICAgcmVhZG9ubHkgZTogSFRNTEFuY2hvckVsZW1lbnQ7XG4gICAgXG4gICAgLyoqQ3JlYXRlIGFuIEFuY2hvciBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQsIGhyZWYgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzLCBocmVmIH06IEFuY2hvckNvbnN0cnVjdG9yID0ge30pIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnYScsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBpZiAoIGhyZWYgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmhyZWYoaHJlZilcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGhyZWYoKTogc3RyaW5nXG4gICAgaHJlZih2YWw6IHN0cmluZyk6IHRoaXNcbiAgICBocmVmKHZhbD8pIHtcbiAgICAgICAgaWYgKCB2YWwgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdocmVmJyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoeyBocmVmIDogdmFsIH0pXG4gICAgfVxuICAgIFxuICAgIHRhcmdldCgpOiBzdHJpbmdcbiAgICB0YXJnZXQodmFsOiBzdHJpbmcpOiB0aGlzXG4gICAgdGFyZ2V0KHZhbD8pIHtcbiAgICAgICAgaWYgKCB2YWwgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd0YXJnZXQnKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cih7IHRhcmdldCA6IHZhbCB9KVxuICAgIH1cbn1cblxuY2xhc3MgSW5wdXQgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTElucHV0RWxlbWVudDtcbiAgICByZWFkb25seSBlOiBIVE1MSW5wdXRFbGVtZW50O1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHsgaWQsIHRleHQsIGNscywgcGxhY2Vob2xkZXIsIHR5cGUgfTogSW5wdXRDb25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ2lucHV0JywgdGV4dCwgY2xzIH0pO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBpZiAoIHBsYWNlaG9sZGVyICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5hdHRyKHsgcGxhY2Vob2xkZXIsIHR5cGUgOiB0eXBlID8/ICd0ZXh0JyB9KVxuICAgIH1cbiAgICBcbiAgICBnZXQgcGxhY2Vob2xkZXIoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZS5wbGFjZWhvbGRlcjtcbiAgICB9XG4gICAgXG4gICAgc2V0IHBsYWNlaG9sZGVyKHZhbDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZS5wbGFjZWhvbGRlciA9IHZhbDtcbiAgICB9XG4gICAgXG4gICAgZ2V0IHZhbHVlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmUudmFsdWU7XG4gICAgfVxuICAgIFxuICAgIHNldCB2YWx1ZSh2YWw6IHN0cmluZykge1xuICAgICAgICB0aGlzLmUudmFsdWUgPSB2YWw7XG4gICAgfVxufVxuXG4vKmNsYXNzIFN2ZyBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50e1xuIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IFNWR0VsZW1lbnQ7XG4gY29uc3RydWN0b3Ioe2lkLCBjbHMsaHRtbEVsZW1lbnR9OiBTdmdDb25zdHJ1Y3Rvcikge1xuIHN1cGVyKHt0YWc6ICdzdmcnLCBjbHN9KTtcbiBpZiAoaWQpXG4gdGhpcy5pZChpZCk7XG4gaWYgKHNyYylcbiB0aGlzLl9odG1sRWxlbWVudC5zcmMgPSBzcmM7XG4gXG4gfVxuIH1cbiAqL1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItaHRtbC1lbGVtZW50JywgQmV0dGVySFRNTEVsZW1lbnQpO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItZGl2JywgRGl2LCB7IGV4dGVuZHMgOiAnZGl2JyB9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLXAnLCBQYXJhZ3JhcGgsIHsgZXh0ZW5kcyA6ICdwJyB9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLXNwYW4nLCBTcGFuLCB7IGV4dGVuZHMgOiAnc3BhbicgfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1pbWcnLCBJbWcsIHsgZXh0ZW5kcyA6ICdpbWcnIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItYScsIEFuY2hvciwgeyBleHRlbmRzIDogJ2EnIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItYnV0dG9uJywgQnV0dG9uLCB7IGV4dGVuZHMgOiAnYnV0dG9uJyB9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWlucHV0JywgSW5wdXQsIHsgZXh0ZW5kcyA6ICdpbnB1dCcgfSk7XG5cbi8vIGN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLXN2ZycsIFN2Zywge2V4dGVuZHM6ICdzdmcnfSk7XG5cbi8qKkNyZWF0ZSBhbiBlbGVtZW50IG9mIGB0YWdgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCBhbmQgLyBvciBgY2xzYCovXG5mdW5jdGlvbiBlbGVtKHsgdGFnLCB0ZXh0LCBjbHMgfTogeyB0YWc6IFF1ZXJ5U2VsZWN0b3IsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZyB9KTogQmV0dGVySFRNTEVsZW1lbnQ7XG4vKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgaWRgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG5mdW5jdGlvbiBlbGVtKHsgaWQsIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBpZDogc3RyaW5nLCB0ZXh0Pzogc3RyaW5nLCBjbHM/OiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk6IEJldHRlckhUTUxFbGVtZW50O1xuLyoqR2V0IGFuIGV4aXN0aW5nIGVsZW1lbnQgYnkgYHF1ZXJ5YC4gT3B0aW9uYWxseSwgc2V0IGl0cyBgdGV4dGAsIGBjbHNgIG9yIGNhY2hlIGBjaGlsZHJlbmAqL1xuZnVuY3Rpb24gZWxlbSh7IHF1ZXJ5LCB0ZXh0LCBjbHMsIGNoaWxkcmVuIH06IHsgcXVlcnk6IFF1ZXJ5U2VsZWN0b3IsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTogQmV0dGVySFRNTEVsZW1lbnQ7XG4vKipXcmFwIGFuIGV4aXN0aW5nIEhUTUxFbGVtZW50LiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG5mdW5jdGlvbiBlbGVtKHsgaHRtbEVsZW1lbnQsIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBodG1sRWxlbWVudDogSFRNTEVsZW1lbnQsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTogQmV0dGVySFRNTEVsZW1lbnQ7XG5mdW5jdGlvbiBlbGVtKGVsZW1PcHRpb25zKTogQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHJldHVybiBuZXcgQmV0dGVySFRNTEVsZW1lbnQoZWxlbU9wdGlvbnMpO1xufVxuXG4vKipDcmVhdGUgYSBTcGFuIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbmZ1bmN0aW9uIHNwYW4oeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogU3BhbiB7XG4gICAgcmV0dXJuIG5ldyBTcGFuKHsgaWQsIHRleHQsIGNscyB9KTtcbn1cblxuLyoqQ3JlYXRlIGFuIERpdiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG5mdW5jdGlvbiBkaXYoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogRGl2IHtcbiAgICByZXR1cm4gbmV3IERpdih7IGlkLCB0ZXh0LCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhbiBJbWcgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCBzcmMgb3IgY2xzLiovXG5mdW5jdGlvbiBpbWcoeyBpZCwgc3JjLCBjbHMgfTogSW1nQ29uc3RydWN0b3IgPSB7fSk6IEltZyB7XG4gICAgcmV0dXJuIG5ldyBJbWcoeyBpZCwgc3JjLCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhIEJ1dHRvbiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIGNscywgaHRtbCBvciBjbGljayBmdW5jdGlvbiovXG5mdW5jdGlvbiBidXR0b24oeyBpZCwgY2xzLCBjbGljaywgaHRtbCB9OiBCdXR0b25Db25zdHJ1Y3RvciA9IHt9KTogQnV0dG9uIHtcbiAgICByZXR1cm4gbmV3IEJ1dHRvbih7IGlkLCBjbHMsIGNsaWNrLCBodG1sIH0pO1xufVxuXG4vKipDcmVhdGUgYSBQYXJhZ3JhcGggZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0IG9yIGNscy4qL1xuZnVuY3Rpb24gcGFyYWdyYXBoKHsgaWQsIHRleHQsIGNscyB9OiBTdWJFbGVtQ29uc3RydWN0b3IgPSB7fSk6IFBhcmFncmFwaCB7XG4gICAgcmV0dXJuIG5ldyBQYXJhZ3JhcGgoeyBpZCwgdGV4dCwgY2xzIH0pO1xufVxuXG4vKipDcmVhdGUgYW4gQW5jaG9yIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCwgaHJlZiBvciBjbHMuKi9cbmZ1bmN0aW9uIGFuY2hvcih7IGlkLCB0ZXh0LCBjbHMsIGhyZWYgfTogQW5jaG9yQ29uc3RydWN0b3IgPSB7fSk6IEFuY2hvciB7XG4gICAgcmV0dXJuIG5ldyBBbmNob3IoeyBpZCwgdGV4dCwgY2xzLCBocmVmIH0pO1xufVxuXG4vKipDcmVhdGUgYW4gSW5wdXQgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGBpZGAsIGB0ZXh0YCwgYGNsc2AsIGBwbGFjZWhvbGRlcmAsIG9yIGB0eXBlYC4gYHR5cGVgIGRlZmF1bHRzIHRvIGB0ZXh0YC4qL1xuZnVuY3Rpb24gaW5wdXQoeyBpZCwgdGV4dCwgY2xzLCBwbGFjZWhvbGRlciwgdHlwZSB9OiBJbnB1dENvbnN0cnVjdG9yID0ge30pOiBJbnB1dCB7XG4gICAgcmV0dXJuIG5ldyBJbnB1dCh7IGlkLCB0ZXh0LCBjbHMsIHBsYWNlaG9sZGVyLCB0eXBlIH0pO1xufVxuXG5leHBvcnQgeyBlbGVtLCBzcGFuLCBkaXYsIGltZywgcGFyYWdyYXBoLCBhbmNob3IsIGJ1dHRvbiwgaW5wdXQsIEJldHRlckhUTUxFbGVtZW50LCBEaXYsIEJ1dHRvbiwgU3BhbiwgSW5wdXQgfVxuIl19