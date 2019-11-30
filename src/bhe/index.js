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
        console.warn(`getOpacityTransitionDuration() returning undefined`);
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
class VisualBHE extends BetterHTMLElement {
    constructor(options) {
        super(options);
    }
    setOpacTransDur() {
        this._opacTransDur = this.getOpacityTransitionDuration();
    }
    async display() {
        this.addClass('active');
        return await util_1.wait(this._opacTransDur, false);
    }
    async hide() {
        this.removeClass('active');
        return await util_1.wait(this._opacTransDur, false);
    }
}
exports.VisualBHE = VisualBHE;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtDQUFzRTtBQUV0RSxNQUFNLFVBQVUsR0FBRyw0QkFBNEIsQ0FBQztBQUloRCxNQUFNLGlCQUFpQjtJQStCbkIsWUFBWSxXQUFXO1FBN0JOLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFDeEIsZUFBVSxHQUE4QixFQUFFLENBQUM7UUFDcEQsb0JBQWUsR0FBNEIsRUFBRSxDQUFDO1FBQzVDLG1CQUFjLEdBQXdCLFNBQVMsQ0FBQztRQTJCdEQsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxHQUFHLFdBQVcsQ0FBQztRQUV6RSxJQUFLLENBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUc7WUFDM0UsTUFBTSxJQUFJLHVCQUF1QixDQUFDLENBQUMsRUFBRTtnQkFDakMsR0FBRztnQkFDSCxFQUFFO2dCQUNGLFdBQVc7Z0JBQ1gsS0FBSzthQUNSLENBQUMsQ0FBQTtTQUVMO1FBQ0QsSUFBSyxHQUFHLEtBQUssU0FBUyxJQUFJLFFBQVEsS0FBSyxTQUFTO1lBQzVDLE1BQU0sSUFBSSx1QkFBdUIsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pDLEdBQUc7Z0JBQ0gsUUFBUTthQUNYLEVBQUUsK0lBQStJLENBQUMsQ0FBQztRQUV4SixJQUFLLEdBQUcsS0FBSyxTQUFTLEVBQUc7WUFDckIsSUFBSyxDQUFFLEtBQUssRUFBRSxNQUFNLENBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUc7Z0JBQ2pELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFB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TTtBQWR4RCxTQUFTLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxLQUF5QixFQUFFO0lBQ3pELE9BQU8sSUFBSSxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQVk4Qiw4QkFBUztBQVR4QyxTQUFTLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBd0IsRUFBRTtJQUMzRCxPQUFPLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBT3lDLHdCQUFNO0FBSmhELFNBQVMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksS0FBdUIsRUFBRTtJQUN0RSxPQUFPLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDM0QsQ0FBQztBQUV5RCxzQkFBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJvb2wsIGVudW1lcmF0ZSwgaXNGdW5jdGlvbiwgaXNPYmplY3QsIHdhaXQgfSBmcm9tIFwiLi4vdXRpbFwiO1xuXG5jb25zdCBTVkdfTlNfVVJJID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJztcblxuLy8gVE9ETzogbWFrZSBCZXR0ZXJIVE1MRWxlbWVudDxUPiwgZm9yIHVzZSBpbiBlZyBjaGlsZFtyZW5dIGZ1bmN0aW9uXG4vLyBleHRlbmRzIEhUTUxFbGVtZW50OiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5L3VwZ3JhZGUjRXhhbXBsZXNcbmNsYXNzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgX2h0bWxFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9pc1N2ZzogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2xpc3RlbmVyczogVEV2ZW50RnVuY3Rpb25NYXA8VEV2ZW50PiA9IHt9O1xuICAgIHByaXZhdGUgX2NhY2hlZENoaWxkcmVuOiBUTWFwPEJldHRlckhUTUxFbGVtZW50PiA9IHt9O1xuICAgIHByb3RlY3RlZCBfY29tcHV0ZWRTdHlsZTogQ1NTU3R5bGVEZWNsYXJhdGlvbiA9IHVuZGVmaW5lZDtcbiAgICAvKltTeW1ib2wudG9QcmltaXRpdmVdKGhpbnQpIHtcbiAgICAgY29uc29sZS5sb2coJ2Zyb20gdG9QcmltaXRpdmUsIGhpbnQ6ICcsIGhpbnQsICdcXG50aGlzOiAnLCB0aGlzKTtcbiAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50O1xuICAgICB9XG4gICAgIFxuICAgICB2YWx1ZU9mKCkge1xuICAgICBjb25zb2xlLmxvZygnZnJvbSB2YWx1ZU9mLCB0aGlzOiAnLCB0aGlzKTtcbiAgICAgcmV0dXJuIHRoaXM7XG4gICAgIH1cbiAgICAgXG4gICAgIHRvU3RyaW5nKCkge1xuICAgICBjb25zb2xlLmxvZygnZnJvbSB0b1N0cmluZywgdGhpczogJywgdGhpcyk7XG4gICAgIHJldHVybiB0aGlzO1xuICAgICB9XG4gICAgICovXG4gICAgXG4gICAgLy8gVE9ETzogcXVlcnkgc2hvdWxkIGFsc28gYmUgYSBwcmVkaWNhdGUgZnVuY3Rpb25cbiAgICAvKipDcmVhdGUgYW4gZWxlbWVudCBvZiBgdGFnYC4gT3B0aW9uYWxseSwgc2V0IGl0cyBgdGV4dGAgYW5kIC8gb3IgYGNsc2AqL1xuICAgIGNvbnN0cnVjdG9yKHsgdGFnLCB0ZXh0LCBjbHMgfTogeyB0YWc6IFF1ZXJ5U2VsZWN0b3IsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZyB9KTtcbiAgICAvKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgaWRgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGlkOiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICAvKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgcXVlcnlgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBxdWVyeSwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IHF1ZXJ5OiBRdWVyeVNlbGVjdG9yLCB0ZXh0Pzogc3RyaW5nLCBjbHM/OiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk7XG4gICAgLyoqV3JhcCBhbiBleGlzdGluZyBIVE1MRWxlbWVudC4gT3B0aW9uYWxseSwgc2V0IGl0cyBgdGV4dGAsIGBjbHNgIG9yIGNhY2hlIGBjaGlsZHJlbmAqL1xuICAgIGNvbnN0cnVjdG9yKHsgaHRtbEVsZW1lbnQsIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBodG1sRWxlbWVudDogSFRNTEVsZW1lbnQsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICBjb25zdHJ1Y3RvcihlbGVtT3B0aW9ucykge1xuICAgICAgICBjb25zdCB7IHRhZywgaWQsIGh0bWxFbGVtZW50LCB0ZXh0LCBxdWVyeSwgY2hpbGRyZW4sIGNscyB9ID0gZWxlbU9wdGlvbnM7XG4gICAgICAgIFxuICAgICAgICBpZiAoIFsgdGFnLCBpZCwgaHRtbEVsZW1lbnQsIHF1ZXJ5IF0uZmlsdGVyKHggPT4geCAhPT0gdW5kZWZpbmVkKS5sZW5ndGggPiAxICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEJhZEFyZ3VtZW50c0Ftb3VudEVycm9yKDEsIHtcbiAgICAgICAgICAgICAgICB0YWcsXG4gICAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgICAgaHRtbEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgcXVlcnlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHRhZyAhPT0gdW5kZWZpbmVkICYmIGNoaWxkcmVuICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEJhZEFyZ3VtZW50c0Ftb3VudEVycm9yKDEsIHtcbiAgICAgICAgICAgICAgICB0YWcsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5cbiAgICAgICAgICAgIH0sICdcImNoaWxkcmVuXCIgYW5kIFwidGFnXCIgb3B0aW9ucyBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlLCBiZWNhdXNlIHRhZyBpbXBsaWVzIGNyZWF0aW5nIGEgbmV3IGVsZW1lbnQgYW5kIGNoaWxkcmVuIGltcGxpZXMgZ2V0dGluZyBhbiBleGlzdGluZyBvbmUuJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIHRhZyAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgaWYgKCBbICdzdmcnLCAncGF0aCcgXS5pbmNsdWRlcyh0YWcudG9Mb3dlckNhc2UoKSkgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNTdmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OU19VUkksIHRhZyk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5faHRtbEVsZW1lbnQuc2V0QXR0cmlidXRlKCd4bWxucycsIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCBpZCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgICAgICBpZiAoICFib29sKHRoaXMuX2h0bWxFbGVtZW50KSApXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFbGVtIGNvbnN0cnVjdG9yOiB0cmllZCB0byBnZXQgZWxlbWVudCBieSBpZDogXCIke2lkfVwiLCBidXQgbm8gc3VjaCBlbGVtZW50IGV4aXN0cy5gKVxuICAgICAgICB9IGVsc2UgaWYgKCBxdWVyeSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHF1ZXJ5KTtcbiAgICAgICAgICAgIGlmICggIWJvb2wodGhpcy5faHRtbEVsZW1lbnQpIClcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEVsZW0gY29uc3RydWN0b3I6IHRyaWVkIHRvIGdldCBlbGVtZW50IGJ5IHF1ZXJ5OiBcIiR7cXVlcnl9XCIsIGJ1dCBubyBlbGVtZW50IGZvdW5kLmApXG4gICAgICAgIH0gZWxzZSBpZiAoIGh0bWxFbGVtZW50ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGh0bWxFbGVtZW50O1xuICAgICAgICAgICAgaWYgKCAhYm9vbCh0aGlzLl9odG1sRWxlbWVudCkgKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRWxlbSBjb25zdHJ1Y3RvcjogcGFzc2VkIGV4cGxpY2l0IGh0bWxFbGVtZW50IGFyZywgYnV0IGFyZyB3YXMgZmFsc2V5OiAke2h0bWxFbGVtZW50fWAsIGh0bWxFbGVtZW50KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEJhZEFyZ3VtZW50c0Ftb3VudEVycm9yKDEsIHtcbiAgICAgICAgICAgICAgICB0YWcsXG4gICAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgICAgaHRtbEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgcXVlcnlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICggdGV4dCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMudGV4dCh0ZXh0KTtcbiAgICAgICAgaWYgKCBjbHMgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmNsYXNzKGNscyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIGNoaWxkcmVuICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5jYWNoZUNoaWxkcmVuKGNoaWxkcmVuKTtcbiAgICAgICAgXG4gICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcywgcHJveHkpO1xuICAgICAgICAvKmNvbnN0IHRoYXQgPSB0aGlzO1xuICAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh0aGlzLCB7XG4gICAgICAgICBnZXQodGFyZ2V0OiBCZXR0ZXJIVE1MRWxlbWVudCwgcDogc3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sLCByZWNlaXZlcjogYW55KTogYW55IHtcbiAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdsb2dnaW5nJyk7XG4gICAgICAgICAvLyBjb25zb2xlLmxvZygndGFyZ2V0OiAnLCB0YXJnZXQsXG4gICAgICAgICAvLyAgICAgJ1xcbnRoYXQ6ICcsIHRoYXQsXG4gICAgICAgICAvLyAgICAgJ1xcbnR5cGVvZih0aGF0KTogJywgdHlwZW9mICh0aGF0KSxcbiAgICAgICAgIC8vICAgICAnXFxucDogJywgcCxcbiAgICAgICAgIC8vICAgICAnXFxucmVjZWl2ZXI6ICcsIHJlY2VpdmVyLFxuICAgICAgICAgLy8gICAgICdcXG50aGlzOiAnLCB0aGlzKTtcbiAgICAgICAgIHJldHVybiB0aGF0W3BdO1xuICAgICAgICAgfVxuICAgICAgICAgfSlcbiAgICAgICAgICovXG4gICAgfVxuICAgIFxuICAgIC8qKlJldHVybiB0aGUgd3JhcHBlZCBIVE1MRWxlbWVudCovXG4gICAgZ2V0IGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9odG1sRWxlbWVudDtcbiAgICB9XG4gICAgXG4gICAgLyoqU2V0cyBgdGhpcy5faHRtbEVsZW1lbnRgIHRvIGBuZXdIdG1sRWxlbWVudC5faHRtbEVsZW1lbnRgLlxuICAgICAqIFJlc2V0cyBgdGhpcy5fY2FjaGVkQ2hpbGRyZW5gIGFuZCBjYWNoZXMgYG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbmAuXG4gICAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgZnJvbSBgbmV3SHRtbEVsZW1lbnQuX2xpc3RlbmVyc2AsIHdoaWxlIGtlZXBpbmcgYHRoaXMuX2xpc3RlbmVyc2AuKi9cbiAgICB3cmFwU29tZXRoaW5nRWxzZShuZXdIdG1sRWxlbWVudDogQmV0dGVySFRNTEVsZW1lbnQpOiB0aGlzXG4gICAgLyoqU2V0cyBgdGhpcy5faHRtbEVsZW1lbnRgIHRvIGBuZXdIdG1sRWxlbWVudGAuXG4gICAgICogS2VlcHMgYHRoaXMuX2xpc3RlbmVyc2AuXG4gICAgICogTk9URTogdGhpcyByZWluaXRpYWxpemVzIGB0aGlzLl9jYWNoZWRDaGlsZHJlbmAgYW5kIGFsbCBldmVudCBsaXN0ZW5lcnMgYmVsb25naW5nIHRvIGBuZXdIdG1sRWxlbWVudGAgYXJlIGxvc3QuIFBhc3MgYSBgQmV0dGVySFRNTEVsZW1lbnRgIHRvIGtlZXAgdGhlbS4qL1xuICAgIHdyYXBTb21ldGhpbmdFbHNlKG5ld0h0bWxFbGVtZW50OiBOb2RlKTogdGhpc1xuICAgIHdyYXBTb21ldGhpbmdFbHNlKG5ld0h0bWxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX2NhY2hlZENoaWxkcmVuID0ge307XG4gICAgICAgIGlmICggbmV3SHRtbEVsZW1lbnQgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnJlcGxhY2VXaXRoKG5ld0h0bWxFbGVtZW50LmUpO1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBuZXdIdG1sRWxlbWVudC5lO1xuICAgICAgICAgICAgZm9yICggbGV0IFsgX2tleSwgX2NhY2hlZENoaWxkIF0gb2YgZW51bWVyYXRlKG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbikgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoX2tleSBhcyBzdHJpbmcsIF9jYWNoZWRDaGlsZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh0aGlzLl9jYWNoZWRDaGlsZHJlbikubGVuZ3RoXG4gICAgICAgICAgICAgICAgIT09IE9iamVjdC5rZXlzKG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbikubGVuZ3RoXG4gICAgICAgICAgICAgICAgfHxcbiAgICAgICAgICAgICAgICBPYmplY3QudmFsdWVzKHRoaXMuX2NhY2hlZENoaWxkcmVuKS5maWx0ZXIodiA9PiB2ICE9PSB1bmRlZmluZWQpLmxlbmd0aFxuICAgICAgICAgICAgICAgICE9PSBPYmplY3QudmFsdWVzKG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbikuZmlsdGVyKHYgPT4gdiAhPT0gdW5kZWZpbmVkKS5sZW5ndGhcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgd3JhcFNvbWV0aGluZ0Vsc2UgdGhpcy5fY2FjaGVkQ2hpbGRyZW4gbGVuZ3RoICE9PSBuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW4ubGVuZ3RoYCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyA6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdIdG1sRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbih7IC4uLnRoaXMuX2xpc3RlbmVycywgLi4ubmV3SHRtbEVsZW1lbnQuX2xpc3RlbmVycywgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBObyB3YXkgdG8gZ2V0IG5ld0h0bWxFbGVtZW50IGV2ZW50IGxpc3RlbmVycyBiZXNpZGVzIGhhY2tpbmcgRWxlbWVudC5wcm90b3R5cGVcbiAgICAgICAgICAgIHRoaXMub24odGhpcy5fbGlzdGVuZXJzKTtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnJlcGxhY2VXaXRoKG5ld0h0bWxFbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gbmV3SHRtbEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvLyAqKiogIEJhc2ljXG4gICAgLyoqU2V0IHRoZSBlbGVtZW50J3MgaW5uZXJIVE1MKi9cbiAgICBodG1sKGh0bWw6IHN0cmluZyk6IHRoaXM7XG4gICAgLyoqR2V0IHRoZSBlbGVtZW50J3MgaW5uZXJIVE1MKi9cbiAgICBodG1sKCk6IHN0cmluZztcbiAgICBodG1sKGh0bWw/KSB7XG4gICAgICAgIGlmICggaHRtbCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5pbm5lckhUTUw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmUuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlNldCB0aGUgZWxlbWVudCdzIGlubmVyVGV4dCovXG4gICAgdGV4dCh0eHQ6IHN0cmluZyB8IG51bWJlcik6IHRoaXM7XG4gICAgLyoqR2V0IHRoZSBlbGVtZW50J3MgaW5uZXJUZXh0Ki9cbiAgICB0ZXh0KCk6IHN0cmluZztcbiAgICB0ZXh0KHR4dD8pIHtcbiAgICAgICAgaWYgKCB0eHQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuaW5uZXJUZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lLmlubmVyVGV4dCA9IHR4dDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvKipTZXQgdGhlIGlkIG9mIHRoZSBlbGVtZW50Ki9cbiAgICBpZChpZDogc3RyaW5nKTogdGhpcztcbiAgICAvKipHZXQgdGhlIGlkIG9mIHRoZSBlbGVtZW50Ki9cbiAgICBpZCgpOiBzdHJpbmc7XG4gICAgaWQoaWQ/KSB7XG4gICAgICAgIGlmICggaWQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuaWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmUuaWQgPSBpZDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKkZvciBlYWNoIGB7PHN0eWxlQXR0cj46IDxzdHlsZVZhbD59YCBwYWlyLCBzZXQgdGhlIGBzdHlsZVtzdHlsZUF0dHJdYCB0byBgc3R5bGVWYWxgLiovXG4gICAgY3NzKGNzczogUGFydGlhbDxDc3NPcHRpb25zPik6IHRoaXNcbiAgICAvKipHZXQgYHN0eWxlW2Nzc11gKi9cbiAgICBjc3MoY3NzOiBzdHJpbmcpOiBzdHJpbmdcbiAgICBjc3MoY3NzKSB7XG4gICAgICAgIGlmICggdHlwZW9mIGNzcyA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLnN0eWxlW2Nzc107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKCBsZXQgWyBzdHlsZUF0dHIsIHN0eWxlVmFsIF0gb2YgZW51bWVyYXRlKGNzcykgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5zdHlsZVs8c3RyaW5nPiBzdHlsZUF0dHJdID0gc3R5bGVWYWw7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipSZW1vdmUgdGhlIHZhbHVlIG9mIHRoZSBwYXNzZWQgc3R5bGUgcHJvcGVydGllcyovXG4gICAgdW5jc3MoLi4ucmVtb3ZlUHJvcHM6IChrZXlvZiBDc3NPcHRpb25zKVtdKTogdGhpcyB7XG4gICAgICAgIGxldCBjc3MgPSB7fTtcbiAgICAgICAgZm9yICggbGV0IHByb3Agb2YgcmVtb3ZlUHJvcHMgKVxuICAgICAgICAgICAgY3NzW3Byb3BdID0gJyc7XG4gICAgICAgIHJldHVybiB0aGlzLmNzcyhjc3MpO1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgaXMoZWxlbWVudDogQmV0dGVySFRNTEVsZW1lbnQpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9pcy9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpO1xuICAgIH1cbiAgICBcbiAgICAvKlxuICAgICBhbmltYXRlKG9wdHM6IEFuaW1hdGVPcHRpb25zKSB7XG4gICAgIC8vIHNlZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL0NTU19BbmltYXRpb25zL1RpcHNcbiAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICAgfVxuICAgICAqL1xuICAgIFxuICAgIC8vICoqKiAgQ2xhc3Nlc1xuICAgIC8qKmAuY2xhc3NOYW1lID0gY2xzYCovXG4gICAgY2xhc3MoY2xzOiBzdHJpbmcpOiB0aGlzO1xuICAgIC8qKlJldHVybiB0aGUgZmlyc3QgY2xhc3MgdGhhdCBtYXRjaGVzIGBjbHNgIHByZWRpY2F0ZS4qL1xuICAgIGNsYXNzKGNsczogVFJldHVybkJvb2xlYW4pOiBzdHJpbmc7XG4gICAgLyoqUmV0dXJuIGEgc3RyaW5nIGFycmF5IG9mIHRoZSBlbGVtZW50J3MgY2xhc3NlcyAobm90IGEgY2xhc3NMaXN0KSovXG4gICAgY2xhc3MoKTogc3RyaW5nW107XG4gICAgY2xhc3MoY2xzPykge1xuICAgICAgICBpZiAoIGNscyA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5lLmNsYXNzTGlzdCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIGlzRnVuY3Rpb24oY2xzKSApIHtcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuZS5jbGFzc0xpc3QpLmZpbmQoY2xzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICggdGhpcy5faXNTdmcgKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIC8vIG5vaW5zcGVjdGlvbiBKU0NvbnN0YW50UmVhc3NpZ25tZW50XG4gICAgICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdCA9IFsgY2xzIF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZS5jbGFzc05hbWUgPSBjbHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBhZGRDbGFzcyhjbHM6IHN0cmluZywgLi4uY2xzZXM6IHN0cmluZ1tdKTogdGhpcyB7XG4gICAgICAgIHRoaXMuZS5jbGFzc0xpc3QuYWRkKGNscyk7XG4gICAgICAgIGZvciAoIGxldCBjIG9mIGNsc2VzIClcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QuYWRkKGMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcmVtb3ZlQ2xhc3MoY2xzOiBUUmV0dXJuQm9vbGVhbik6IHRoaXM7XG4gICAgcmVtb3ZlQ2xhc3MoY2xzOiBzdHJpbmcsIC4uLmNsc2VzOiBzdHJpbmdbXSk6IHRoaXM7XG4gICAgcmVtb3ZlQ2xhc3MoY2xzLCAuLi5jbHNlcykge1xuICAgICAgICBpZiAoIGlzRnVuY3Rpb248Ym9vbGVhbj4oY2xzKSApIHtcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3MoY2xzKSk7XG4gICAgICAgICAgICBpZiAoIGJvb2woY2xzZXMpIClcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ3JlbW92ZUNsYXNzLCBjbHMgaXMgVFJldHVybkJvb2xlYW4sIGdvdCAuLi5jbHNlcyBidXQgc2hvdWxkbnQgaGF2ZScpXG4gICAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QucmVtb3ZlKGNscyk7XG4gICAgICAgICAgICBmb3IgKCBsZXQgYyBvZiBjbHNlcyApXG4gICAgICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZW1vdmUoYyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHJlcGxhY2VDbGFzcyhvbGRUb2tlbjogVFJldHVybkJvb2xlYW4sIG5ld1Rva2VuOiBzdHJpbmcpOiB0aGlzO1xuICAgIHJlcGxhY2VDbGFzcyhvbGRUb2tlbjogc3RyaW5nLCBuZXdUb2tlbjogc3RyaW5nKTogdGhpc1xuICAgIHJlcGxhY2VDbGFzcyhvbGRUb2tlbiwgbmV3VG9rZW4pIHtcbiAgICAgICAgaWYgKCBpc0Z1bmN0aW9uPGJvb2xlYW4+KG9sZFRva2VuKSApIHtcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QucmVwbGFjZSh0aGlzLmNsYXNzKG9sZFRva2VuKSwgbmV3VG9rZW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZXBsYWNlKG9sZFRva2VuLCBuZXdUb2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHRvZ2dsZUNsYXNzKGNsczogVFJldHVybkJvb2xlYW4sIGZvcmNlPzogYm9vbGVhbik6IHRoaXNcbiAgICB0b2dnbGVDbGFzcyhjbHM6IHN0cmluZywgZm9yY2U/OiBib29sZWFuKTogdGhpc1xuICAgIHRvZ2dsZUNsYXNzKGNscywgZm9yY2UpIHtcbiAgICAgICAgaWYgKCBpc0Z1bmN0aW9uPGJvb2xlYW4+KGNscykgKVxuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC50b2dnbGUodGhpcy5jbGFzcyhjbHMpLCBmb3JjZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuZS5jbGFzc0xpc3QudG9nZ2xlKGNscywgZm9yY2UpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqUmV0dXJucyBgdGhpcy5lLmNsYXNzTGlzdC5jb250YWlucyhjbHMpYCAqL1xuICAgIGhhc0NsYXNzKGNsczogc3RyaW5nKTogYm9vbGVhblxuICAgIC8qKlJldHVybnMgd2hldGhlciBgdGhpc2AgaGFzIGEgY2xhc3MgdGhhdCBtYXRjaGVzIHBhc3NlZCBmdW5jdGlvbiAqL1xuICAgIGhhc0NsYXNzKGNsczogVFJldHVybkJvb2xlYW4pOiBib29sZWFuXG4gICAgaGFzQ2xhc3MoY2xzKSB7XG4gICAgICAgIGlmICggaXNGdW5jdGlvbjxib29sZWFuPihjbHMpICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xhc3MoY2xzKSAhPT0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5jbGFzc0xpc3QuY29udGFpbnMoY2xzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyAqKiogIE5vZGVzXG4gICAgLyoqSW5zZXJ0IGF0IGxlYXN0IG9uZSBgbm9kZWAganVzdCBhZnRlciBgdGhpc2AuIEFueSBgbm9kZWAgY2FuIGJlIGVpdGhlciBgQmV0dGVySFRNTEVsZW1lbnRgcyBvciB2YW5pbGxhIGBOb2RlYC4qL1xuICAgIGFmdGVyKC4uLm5vZGVzOiBBcnJheTxCZXR0ZXJIVE1MRWxlbWVudCB8IE5vZGU+KTogdGhpcyB7XG4gICAgICAgIGZvciAoIGxldCBub2RlIG9mIG5vZGVzICkge1xuICAgICAgICAgICAgaWYgKCBub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5hZnRlcihub2RlLmUpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuZS5hZnRlcihub2RlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqSW5zZXJ0IGB0aGlzYCBqdXN0IGFmdGVyIGEgYEJldHRlckhUTUxFbGVtZW50YCBvciBhIHZhbmlsbGEgYE5vZGVgLiovXG4gICAgaW5zZXJ0QWZ0ZXIobm9kZTogQmV0dGVySFRNTEVsZW1lbnQgfCBIVE1MRWxlbWVudCk6IHRoaXMge1xuICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICBub2RlLmUuYWZ0ZXIodGhpcy5lKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbm9kZS5hZnRlcih0aGlzLmUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqSW5zZXJ0IGF0IGxlYXN0IG9uZSBgbm9kZWAgYWZ0ZXIgdGhlIGxhc3QgY2hpbGQgb2YgYHRoaXNgLlxuICAgICAqIEFueSBgbm9kZWAgY2FuIGJlIGVpdGhlciBhIGBCZXR0ZXJIVE1MRWxlbWVudGAsIGEgdmFuaWxsYSBgTm9kZWAsXG4gICAgICogYSBge3NvbWVLZXk6IEJldHRlckhUTUxFbGVtZW50fWAgcGFpcnMgb2JqZWN0LCBvciBhIGBbc29tZUtleSwgQmV0dGVySFRNTEVsZW1lbnRdYCB0dXBsZS4qL1xuICAgIGFwcGVuZCguLi5ub2RlczogQXJyYXk8QmV0dGVySFRNTEVsZW1lbnQgfCBOb2RlIHwgVE1hcDxCZXR0ZXJIVE1MRWxlbWVudD4gfCBbIHN0cmluZywgQmV0dGVySFRNTEVsZW1lbnQgXT4pOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IG5vZGUgb2Ygbm9kZXMgKSB7XG4gICAgICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICAgICAgdGhpcy5lLmFwcGVuZChub2RlLmUpO1xuICAgICAgICAgICAgZWxzZSBpZiAoIG5vZGUgaW5zdGFuY2VvZiBOb2RlIClcbiAgICAgICAgICAgICAgICB0aGlzLmUuYXBwZW5kKG5vZGUpO1xuICAgICAgICAgICAgZWxzZSBpZiAoIEFycmF5LmlzQXJyYXkobm9kZSkgKVxuICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVBcHBlbmQoWyBub2RlIF0pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVBcHBlbmQobm9kZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqQXBwZW5kIGB0aGlzYCB0byBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgb3IgYSB2YW5pbGxhIGBOb2RlYCovXG4gICAgYXBwZW5kVG8obm9kZTogQmV0dGVySFRNTEVsZW1lbnQgfCBIVE1MRWxlbWVudCk6IHRoaXMge1xuICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICBub2RlLmUuYXBwZW5kKHRoaXMuZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5vZGUuYXBwZW5kKHRoaXMuZSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqSW5zZXJ0IGF0IGxlYXN0IG9uZSBgbm9kZWAganVzdCBiZWZvcmUgYHRoaXNgLiBBbnkgYG5vZGVgIGNhbiBiZSBlaXRoZXIgYEJldHRlckhUTUxFbGVtZW50YHMgb3IgdmFuaWxsYSBgTm9kZWAuKi9cbiAgICBiZWZvcmUoLi4ubm9kZXM6IEFycmF5PEJldHRlckhUTUxFbGVtZW50IHwgTm9kZT4pOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IG5vZGUgb2Ygbm9kZXMgKSB7XG4gICAgICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICAgICAgdGhpcy5lLmJlZm9yZShub2RlLmUpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuZS5iZWZvcmUobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKkluc2VydCBgdGhpc2AganVzdCBiZWZvcmUgYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9yIGEgdmFuaWxsYSBgTm9kZWBzLiovXG4gICAgaW5zZXJ0QmVmb3JlKG5vZGU6IEJldHRlckhUTUxFbGVtZW50IHwgSFRNTEVsZW1lbnQpOiB0aGlzIHtcbiAgICAgICAgaWYgKCBub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKVxuICAgICAgICAgICAgbm9kZS5lLmJlZm9yZSh0aGlzLmUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBub2RlLmJlZm9yZSh0aGlzLmUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcmVwbGFjZUNoaWxkKG5ld0NoaWxkOiBOb2RlLCBvbGRDaGlsZDogTm9kZSk6IHRoaXM7XG4gICAgcmVwbGFjZUNoaWxkKG5ld0NoaWxkOiBCZXR0ZXJIVE1MRWxlbWVudCwgb2xkQ2hpbGQ6IEJldHRlckhUTUxFbGVtZW50KTogdGhpcztcbiAgICByZXBsYWNlQ2hpbGQobmV3Q2hpbGQsIG9sZENoaWxkKSB7XG4gICAgICAgIHRoaXMuZS5yZXBsYWNlQ2hpbGQobmV3Q2hpbGQsIG9sZENoaWxkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgX2NhY2hlKGtleTogc3RyaW5nLCBjaGlsZDogQmV0dGVySFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGhpc1trZXldID0gY2hpbGQ7XG4gICAgICAgIHRoaXMuX2NhY2hlZENoaWxkcmVuW2tleV0gPSBjaGlsZDtcbiAgICB9XG4gICAgXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIGNoaWxkXWAgcGFpciwgYGFwcGVuZChjaGlsZClgIGFuZCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYC4gKi9cbiAgICBjYWNoZUFwcGVuZChrZXlDaGlsZFBhaXJzOiBUTWFwPEJldHRlckhUTUxFbGVtZW50Pik6IHRoaXNcbiAgICAvKipGb3IgZWFjaCBgW2tleSwgY2hpbGRdYCB0dXBsZSwgYGFwcGVuZChjaGlsZClgIGFuZCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYC4gKi9cbiAgICBjYWNoZUFwcGVuZChrZXlDaGlsZFBhaXJzOiBbIHN0cmluZywgQmV0dGVySFRNTEVsZW1lbnQgXVtdKTogdGhpc1xuICAgIGNhY2hlQXBwZW5kKGtleUNoaWxkUGFpcnMpIHtcbiAgICAgICAgY29uc3QgX2NhY2hlQXBwZW5kID0gKF9rZXk6IHN0cmluZywgX2NoaWxkOiBCZXR0ZXJIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hcHBlbmQoX2NoaWxkKTtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlKF9rZXksIF9jaGlsZCk7XG4gICAgICAgIH07XG4gICAgICAgIGlmICggQXJyYXkuaXNBcnJheShrZXlDaGlsZFBhaXJzKSApIHtcbiAgICAgICAgICAgIGZvciAoIGxldCBbIGtleSwgY2hpbGQgXSBvZiBrZXlDaGlsZFBhaXJzIClcbiAgICAgICAgICAgICAgICBfY2FjaGVBcHBlbmQoa2V5LCBjaGlsZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKCBsZXQgWyBrZXksIGNoaWxkIF0gb2YgZW51bWVyYXRlKGtleUNoaWxkUGFpcnMpIClcbiAgICAgICAgICAgICAgICBfY2FjaGVBcHBlbmQoa2V5LCBjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKkdldCBhIGNoaWxkIHdpdGggYHF1ZXJ5U2VsZWN0b3JgIGFuZCByZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9mIGl0Ki9cbiAgICBjaGlsZDxLIGV4dGVuZHMgSFRNTFRhZz4oc2VsZWN0b3I6IEspOiBCZXR0ZXJIVE1MRWxlbWVudDtcbiAgICAvKipHZXQgYSBjaGlsZCB3aXRoIGBxdWVyeVNlbGVjdG9yYCBhbmQgcmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBvZiBpdCovXG4gICAgY2hpbGQoc2VsZWN0b3I6IHN0cmluZyk6IEJldHRlckhUTUxFbGVtZW50O1xuICAgIGNoaWxkKHNlbGVjdG9yKSB7XG4gICAgICAgIHJldHVybiBuZXcgQmV0dGVySFRNTEVsZW1lbnQoeyBodG1sRWxlbWVudCA6IHRoaXMuZS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSB9KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqUmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBsaXN0IG9mIGFsbCBjaGlsZHJlbiAqL1xuICAgIGNoaWxkcmVuKCk6IEJldHRlckhUTUxFbGVtZW50W107XG4gICAgLyoqUmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBsaXN0IG9mIGFsbCBjaGlsZHJlbiBzZWxlY3RlZCBieSBgc2VsZWN0b3JgICovXG4gICAgY2hpbGRyZW48SyBleHRlbmRzIEhUTUxUYWc+KHNlbGVjdG9yOiBLKTogQmV0dGVySFRNTEVsZW1lbnRbXTtcbiAgICAvKipSZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIGxpc3Qgb2YgYWxsIGNoaWxkcmVuIHNlbGVjdGVkIGJ5IGBzZWxlY3RvcmAgKi9cbiAgICBjaGlsZHJlbihzZWxlY3Rvcjogc3RyaW5nIHwgSFRNTFRhZyk6IEJldHRlckhUTUxFbGVtZW50W107XG4gICAgY2hpbGRyZW4oc2VsZWN0b3I/KSB7XG4gICAgICAgIGxldCBjaGlsZHJlblZhbmlsbGE7XG4gICAgICAgIGxldCBjaGlsZHJlbkNvbGxlY3Rpb247XG4gICAgICAgIGlmICggc2VsZWN0b3IgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGNoaWxkcmVuQ29sbGVjdGlvbiA9IHRoaXMuZS5jaGlsZHJlbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoaWxkcmVuQ29sbGVjdGlvbiA9IHRoaXMuZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgfVxuICAgICAgICBjaGlsZHJlblZhbmlsbGEgPSA8SFRNTEVsZW1lbnRbXT4gQXJyYXkuZnJvbShjaGlsZHJlbkNvbGxlY3Rpb24pO1xuICAgICAgICBjb25zdCB0b0VsZW0gPSAoYzogSFRNTEVsZW1lbnQpID0+IG5ldyBCZXR0ZXJIVE1MRWxlbWVudCh7IGh0bWxFbGVtZW50IDogYyB9KTtcbiAgICAgICAgcmV0dXJuIGNoaWxkcmVuVmFuaWxsYS5tYXAodG9FbGVtKTtcbiAgICB9XG4gICAgXG4gICAgY2xvbmUoZGVlcD86IGJvb2xlYW4pOiBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIG5ldyBCZXR0ZXJIVE1MRWxlbWVudCh7IGh0bWxFbGVtZW50IDogdGhpcy5lLmNsb25lTm9kZShkZWVwKSB9KTtcbiAgICB9XG4gICAgXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIHNlbGVjdG9yXWAgcGFpciwgd2hlcmUgYHNlbGVjdG9yYCBpcyBlaXRoZXIgYW4gYEhUTUxUYWdgIG9yIGEgYHN0cmluZ2AsIGdldCBgdGhpcy5jaGlsZChzZWxlY3RvcilgLCBhbmQgc3RvcmUgaXQgaW4gYHRoaXNba2V5XWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgZGlyZWN0bHlcbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHsgaWQ6ICduYXZiYXInIH0pO1xuICAgICAqIG5hdmJhci5jYWNoZUNoaWxkcmVuKHsgaG9tZTogJy5uYXZiYXItaXRlbS1ob21lJywgYWJvdXQ6ICcubmF2YmFyLWl0ZW0tYWJvdXQnIH0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogbmF2YmFyLmFib3V0LmNzcyguLi4pO1xuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGluZGlyZWN0bHkgdGhyb3VnaCBgY2hpbGRyZW5gIGNvbnN0cnVjdG9yIG9wdGlvblxuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oeyBpZDogJ25hdmJhcicsIGNoaWxkcmVuOiB7IGhvbWU6ICcubmF2YmFyLWl0ZW0taG9tZScsIGFib3V0OiAnLm5hdmJhci1pdGVtLWFib3V0JyB9fSk7XG4gICAgICogbmF2YmFyLmhvbWUudG9nZ2xlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBuYXZiYXIuYWJvdXQuY3NzKC4uLik7XG4gICAgICogQHNlZSB0aGlzLmNoaWxkKi9cbiAgICBjYWNoZUNoaWxkcmVuKHF1ZXJ5TWFwOiBUTWFwPFF1ZXJ5U2VsZWN0b3I+KTogdGhpc1xuICAgIC8qKkZvciBlYWNoIGBba2V5LCBzZWxlY3Rvcl1gIHBhaXIsIHdoZXJlIGBzZWxlY3RvcmAgaXMgYSByZWN1cnNpdmUgYHtzdWJzZWxlY3Rvcjoga2V5U2VsZWN0b3JPYmp9YCBvYmplY3QsXG4gICAgICogZXh0cmFjdCBgdGhpcy5jaGlsZChzdWJzZWxlY3RvcilgLCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYCwgdGhlbiBjYWxsIGB0aGlzW2tleV0uY2FjaGVDaGlsZHJlbmAgcGFzc2luZyB0aGUgcmVjdXJzaXZlIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzaW5nIGBjYWNoZUNoaWxkcmVuYCBkaXJlY3RseVxuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oeyBpZDogJ25hdmJhcicgfSk7XG4gICAgICogbmF2YmFyLmNhY2hlQ2hpbGRyZW4oe1xuICAgICAqICAgICAgaG9tZToge1xuICAgICAqICAgICAgICAgICcubmF2YmFyLWl0ZW0taG9tZSc6IHtcbiAgICAgKiAgICAgICAgICAgICAgbmV3czogJy5uYXZiYXItc3ViaXRlbS1uZXdzLFxuICAgICAqICAgICAgICAgICAgICBzdXBwb3J0OiAnLm5hdmJhci1zdWJpdGVtLXN1cHBvcnQnXG4gICAgICogICAgICAgICAgfVxuICAgICAqICAgICAgfVxuICAgICAqICB9KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIG5hdmJhci5ob21lLm5ld3MuY3NzKC4uLik7XG4gICAgICogbmF2YmFyLmhvbWUuc3VwcG9ydC5wb2ludGVyZG93biguLi4pO1xuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGluZGlyZWN0bHkgdGhyb3VnaCBgY2hpbGRyZW5gIGNvbnN0cnVjdG9yIG9wdGlvblxuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oe3F1ZXJ5OiAnI25hdmJhcicsIGNoaWxkcmVuOiB7XG4gICAgICogICAgICBob21lOiB7XG4gICAgICogICAgICAgICAgJy5uYXZiYXItaXRlbS1ob21lJzoge1xuICAgICAqICAgICAgICAgICAgICBuZXdzOiAnLm5hdmJhci1zdWJpdGVtLW5ld3MsXG4gICAgICogICAgICAgICAgICAgIHN1cHBvcnQ6ICcubmF2YmFyLXN1Yml0ZW0tc3VwcG9ydCdcbiAgICAgKiAgICAgICAgICB9XG4gICAgICogICAgICB9XG4gICAgICogIH19KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIG5hdmJhci5ob21lLm5ld3MuY3NzKC4uLik7XG4gICAgICogbmF2YmFyLmhvbWUuc3VwcG9ydC5wb2ludGVyZG93biguLi4pO1xuICAgICAqIEBzZWUgdGhpcy5jaGlsZCovXG4gICAgY2FjaGVDaGlsZHJlbihyZWN1cnNpdmVRdWVyeU1hcDogVFJlY01hcDxRdWVyeVNlbGVjdG9yPik6IHRoaXNcbiAgICBjYWNoZUNoaWxkcmVuKGJoZU1hcDogVE1hcDxCZXR0ZXJIVE1MRWxlbWVudD4pOiB0aGlzXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIHNlbGVjdG9yXWAgcGFpciwgd2hlcmUgYHNlbGVjdG9yYCBpcyBhIGBCZXR0ZXJIVE1MRWxlbWVudGAsIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGRpcmVjdGx5XG4gICAgICogY29uc3QgaG9tZSA9IGVsZW0oeyBxdWVyeTogJy5uYXZiYXItaXRlbS1ob21lJyB9KTtcbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHsgaWQ6ICduYXZiYXInIH0pO1xuICAgICAqIG5hdmJhci5jYWNoZUNoaWxkcmVuKHsgaG9tZSB9KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGluZGlyZWN0bHkgdGhyb3VnaCBgY2hpbGRyZW5gIGNvbnN0cnVjdG9yIG9wdGlvblxuICAgICAqIGNvbnN0IGhvbWUgPSBlbGVtKHsgcXVlcnk6ICcubmF2YmFyLWl0ZW0taG9tZScgfSk7XG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7aWQ6ICduYXZiYXInLCBjaGlsZHJlbjogeyBob21lIH19KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIEBzZWUgdGhpcy5jaGlsZCovXG4gICAgXG4gICAgY2FjaGVDaGlsZHJlbihyZWN1cnNpdmVCSEVNYXA6IFRSZWNNYXA8QmV0dGVySFRNTEVsZW1lbnQ+KTogdGhpc1xuICAgIC8qKmtleTogc3RyaW5nLiB2YWx1ZTogZWl0aGVyIFwic2VsZWN0b3Igc3RyaW5nXCIgT1Ige1wic2VsZWN0b3Igc3RyaW5nXCI6IDxyZWN1cnNlIGRvd24+fSovXG4gICAgY2FjaGVDaGlsZHJlbihtYXApIHtcbiAgICAgICAgZm9yICggbGV0IFsga2V5LCB2YWx1ZSBdIG9mIGVudW1lcmF0ZShtYXApICkge1xuICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gICAgICAgICAgICBpZiAoIGlzT2JqZWN0KHZhbHVlKSApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHZhbHVlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlKGtleSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICggZW50cmllc1sxXSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBjYWNoZUNoaWxkcmVuKCkgcmVjZWl2ZWQgcmVjdXJzaXZlIG9iaiB3aXRoIG1vcmUgdGhhbiAxIHNlbGVjdG9yIGZvciBhIGtleS4gVXNpbmcgb25seSAwdGggc2VsZWN0b3JgLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtdWx0aXBsZSBzZWxlY3RvcnNcIiA6IGVudHJpZXMubWFwKGUgPT4gZVswXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzIDogdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gb25seSBmaXJzdCBiZWNhdXNlIDE6MSBmb3Iga2V5OnNlbGVjdG9yLlxuICAgICAgICAgICAgICAgICAgICAvLyAoaWUgY2FuJ3QgZG8ge3JpZ2h0OiB7LnJpZ2h0OiB7Li4ufSwgLnJpZ2h0Mjogey4uLn19KVxuICAgICAgICAgICAgICAgICAgICBsZXQgWyBzZWxlY3Rvciwgb2JqIF0gPSBlbnRyaWVzWzBdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShrZXksIHRoaXMuY2hpbGQoc2VsZWN0b3IpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpc1trZXldLmNhY2hlQ2hpbGRyZW4ob2JqKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHR5cGUgPT09IFwic3RyaW5nXCIgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoa2V5LCB0aGlzLmNoaWxkKHZhbHVlKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgY2FjaGVDaGlsZHJlbiwgYmFkIHZhbHVlIHR5cGU6IFwiJHt0eXBlfVwiLiBrZXk6IFwiJHtrZXl9XCIsIHZhbHVlOiBcIiR7dmFsdWV9XCIuIG1hcDpgLCBtYXAsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qKlJlbW92ZSBhbGwgY2hpbGRyZW4gZnJvbSBET00qL1xuICAgIGVtcHR5KCk6IHRoaXMge1xuICAgICAgICAvLyBUT0RPOiBpcyB0aGlzIGZhc3RlciB0aGFuIGlubmVySFRNTCA9IFwiXCI/XG4gICAgICAgIHdoaWxlICggdGhpcy5lLmZpcnN0Q2hpbGQgKVxuICAgICAgICAgICAgdGhpcy5lLnJlbW92ZUNoaWxkKHRoaXMuZS5maXJzdENoaWxkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKlJlbW92ZSBlbGVtZW50IGZyb20gRE9NKi9cbiAgICByZW1vdmUoKTogdGhpcyB7XG4gICAgICAgIHRoaXMuZS5yZW1vdmUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE86IHJlY3Vyc2l2ZWx5IHlpZWxkIGNoaWxkcmVuXG4gICAgLy8gICh1bmxpa2UgLmNoaWxkcmVuKCksIHRoaXMgZG9lc24ndCByZXR1cm4gb25seSB0aGUgZmlyc3QgbGV2ZWwpXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZpbmQoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vZmluZC9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBmaXJzdCgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9maXJzdC9cbiAgICAgICAgLy8gdGhpcy5lLmZpcnN0Q2hpbGRcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBsYXN0KCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2xhc3QvXG4gICAgICAgIC8vIHRoaXMuZS5sYXN0Q2hpbGRcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBuZXh0KCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG5vdCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBwYXJlbnQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgcGFyZW50cygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8vICoqKiAgRXZlbnRzXG4gICAgXG4gICAgb24oZXZUeXBlRm5QYWlyczogVEV2ZW50RnVuY3Rpb25NYXA8VEV2ZW50Piwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIGZvciAoIGxldCBbIGV2VHlwZSwgZXZGbiBdIG9mIGVudW1lcmF0ZShldlR5cGVGblBhaXJzKSApIHtcbiAgICAgICAgICAgIGNvbnN0IF9mID0gZnVuY3Rpb24gX2YoZXZ0KSB7XG4gICAgICAgICAgICAgICAgZXZGbihldnQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuZS5hZGRFdmVudExpc3RlbmVyKGV2VHlwZSwgX2YsIG9wdGlvbnMpO1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzW2V2VHlwZV0gPSBfZjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgb25jZShldlR5cGU6IFRFdmVudCwgbGlzdGVuZXI6IEZ1bmN0aW9uUmVjaWV2ZXNFdmVudDxURXZlbnQ+LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgY29uc3QgZXZUeXBlRm5QYWlycyA9IHt9O1xuICAgICAgICBldlR5cGVGblBhaXJzW2V2VHlwZV0gPSBsaXN0ZW5lcjtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPT09IHVuZGVmaW5lZCA/IHsgb25jZSA6IHRydWUgfSA6IHsgLi4ub3B0aW9ucywgb25jZSA6IHRydWUgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMub24oZXZUeXBlRm5QYWlycywgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlJlbW92ZSBgZXZlbnRgIGZyb20gd3JhcHBlZCBlbGVtZW50J3MgZXZlbnQgbGlzdGVuZXJzLCBidXQga2VlcCB0aGUgcmVtb3ZlZCBsaXN0ZW5lciBpbiBjYWNoZS5cbiAgICAgKiBUaGlzIGlzIHVzZWZ1bCBmb3IgbGF0ZXIgdW5ibG9ja2luZyovXG4gICAgYmxvY2tMaXN0ZW5lcihldmVudDogVEV2ZW50KSB7XG4gICAgICAgIGxldCBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tldmVudF07XG4gICAgICAgIGlmICggbGlzdGVuZXIgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oYGJsb2NrTGlzdGVuZXIoZXZlbnQpOiB0aGlzLl9saXN0ZW5lcnNbZXZlbnRdIGlzIHVuZGVmaW5lZC4gZXZlbnQ6YCwgZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICB1bmJsb2NrTGlzdGVuZXIoZXZlbnQ6IFRFdmVudCkge1xuICAgICAgICBsZXQgbGlzdGVuZXIgPSB0aGlzLl9saXN0ZW5lcnNbZXZlbnRdO1xuICAgICAgICBpZiAoIGxpc3RlbmVyID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKGB1bmJsb2NrTGlzdGVuZXIoZXZlbnQpOiB0aGlzLl9saXN0ZW5lcnNbZXZlbnRdIGlzIHVuZGVmaW5lZC4gZXZlbnQ6YCwgZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKlxuICAgICBDaHJvbm9sb2d5OlxuICAgICBtb3VzZWRvd24gICAgICB0b3VjaHN0YXJ0XHRwb2ludGVyZG93blxuICAgICBtb3VzZWVudGVyXHRcdCAgICAgICAgICAgIHBvaW50ZXJlbnRlclxuICAgICBtb3VzZWxlYXZlXHRcdCAgICAgICAgICAgIHBvaW50ZXJsZWF2ZVxuICAgICBtb3VzZW1vdmUgICAgICB0b3VjaG1vdmVcdHBvaW50ZXJtb3ZlXG4gICAgIG1vdXNlb3V0XHRcdCAgICAgICAgICAgIHBvaW50ZXJvdXRcbiAgICAgbW91c2VvdmVyXHRcdCAgICAgICAgICAgIHBvaW50ZXJvdmVyXG4gICAgIG1vdXNldXBcdCAgICB0b3VjaGVuZCAgICBwb2ludGVydXBcbiAgICAgKi9cbiAgICAvKiogQWRkIGEgYHRvdWNoc3RhcnRgIGV2ZW50IGxpc3RlbmVyLiBUaGlzIGlzIHRoZSBmYXN0IGFsdGVybmF0aXZlIHRvIGBjbGlja2AgbGlzdGVuZXJzIGZvciBtb2JpbGUgKG5vIDMwMG1zIHdhaXQpLiAqL1xuICAgIHRvdWNoc3RhcnQoZm46IChldjogVG91Y2hFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbiBfZihldjogVG91Y2hFdmVudCkge1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTsgLy8gb3RoZXJ3aXNlIFwidG91Y2htb3ZlXCIgaXMgdHJpZ2dlcmVkXG4gICAgICAgICAgICBmbihldik7XG4gICAgICAgICAgICBpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5vbmNlICkgLy8gVE9ETzogbWF5YmUgbmF0aXZlIG9wdGlvbnMub25jZSBpcyBlbm91Z2hcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBfZik7XG4gICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICAvLyBUT0RPOiB0aGlzLl9saXN0ZW5lcnMsIG9yIHVzZSB0aGlzLm9uKFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcG9pbnRlcmVudGVyKGZuOiAoZXZlbnQ6IFBvaW50ZXJFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub24oeyBwb2ludGVyZW50ZXIgOiBmbiB9LCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgLyoqIEFkZCBhIGBwb2ludGVyZG93bmAgZXZlbnQgbGlzdGVuZXIgaWYgYnJvd3NlciBzdXBwb3J0cyBgcG9pbnRlcmRvd25gLCBlbHNlIHNlbmQgYG1vdXNlZG93bmAgKHNhZmFyaSkuICovXG4gICAgcG9pbnRlcmRvd24oZm46IChldmVudDogUG9pbnRlckV2ZW50IHwgTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgXG4gICAgICAgIGxldCBhY3Rpb247XG4gICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIFBvaW50ZXJFdmVudCBleGlzdHMgYW5kIHN0b3JlIGluIHZhciBvdXRzaWRlIGNsYXNzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhY3Rpb24gPSB3aW5kb3cuUG9pbnRlckV2ZW50ID8gJ3BvaW50ZXJkb3duJyA6ICdtb3VzZWRvd24nOyAvLyBzYWZhcmkgZG9lc24ndCBzdXBwb3J0IHBvaW50ZXJkb3duXG4gICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgYWN0aW9uID0gJ21vdXNlZG93bidcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBfZiA9IGZ1bmN0aW9uIF9mKGV2OiBQb2ludGVyRXZlbnQgfCBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZm4oZXYpO1xuICAgICAgICAgICAgaWYgKCBvcHRpb25zICYmIG9wdGlvbnMub25jZSApIC8vIFRPRE86IG1heWJlIG5hdGl2ZSBvcHRpb25zLm9uY2UgaXMgZW5vdWdoXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGFjdGlvbiwgX2YpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmUuYWRkRXZlbnRMaXN0ZW5lcihhY3Rpb24sIF9mLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzLnBvaW50ZXJkb3duID0gX2Y7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipTaW11bGF0ZSBhIGNsaWNrIG9mIHRoZSBlbGVtZW50LiBVc2VmdWwgZm9yIGA8YT5gIGVsZW1lbnRzLiovXG4gICAgY2xpY2soKTogdGhpcztcbiAgICAvKipBZGQgYSBgY2xpY2tgIGV2ZW50IGxpc3RlbmVyLiBZb3Ugc2hvdWxkIHByb2JhYmx5IHVzZSBgcG9pbnRlcmRvd24oKWAgaWYgb24gZGVza3RvcCwgb3IgYHRvdWNoc3RhcnQoKWAgaWYgb24gbW9iaWxlLiovXG4gICAgY2xpY2soZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIGNsaWNrKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgdGhpcy5lLmNsaWNrKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgY2xpY2sgOiBmbiB9LCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipCbHVyICh1bmZvY3VzKSB0aGUgZWxlbWVudC4qL1xuICAgIGJsdXIoKTogdGhpcztcbiAgICAvKipBZGQgYSBgYmx1cmAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGJsdXIoZm46IChldmVudDogRm9jdXNFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIGJsdXIoZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLmUuYmx1cigpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGJsdXIgOiBmbiB9LCBvcHRpb25zKVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKkZvY3VzIHRoZSBlbGVtZW50LiovXG4gICAgZm9jdXMoKTogdGhpcztcbiAgICAvKipBZGQgYSBgZm9jdXNgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBmb2N1cyhmbjogKGV2ZW50OiBGb2N1c0V2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgZm9jdXMoZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLmUuZm9jdXMoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBmb2N1cyA6IGZuIH0sIG9wdGlvbnMpXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQWRkIGEgYGNoYW5nZWAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGNoYW5nZShmbjogKGV2ZW50OiBFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub24oeyBjaGFuZ2UgOiBmbiB9LCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQWRkIGEgYGNvbnRleHRtZW51YCBldmVudCBsaXN0ZW5lciovXG4gICAgY29udGV4dG1lbnUoZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub24oeyBjb250ZXh0bWVudSA6IGZuIH0sIG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICAvKipTaW11bGF0ZSBhIGRvdWJsZSBjbGljayBvZiB0aGUgZWxlbWVudC4qL1xuICAgIGRibGNsaWNrKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYGRibGNsaWNrYCBldmVudCBsaXN0ZW5lciovXG4gICAgZGJsY2xpY2soZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIGRibGNsaWNrKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgY29uc3QgZGJsY2xpY2sgPSBuZXcgTW91c2VFdmVudCgnZGJsY2xpY2snLCB7XG4gICAgICAgICAgICAgICAgJ3ZpZXcnIDogd2luZG93LFxuICAgICAgICAgICAgICAgICdidWJibGVzJyA6IHRydWUsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbGFibGUnIDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmUuZGlzcGF0Y2hFdmVudChkYmxjbGljayk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgZGJsY2xpY2sgOiBmbiB9LCBvcHRpb25zKVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEgbW91c2VlbnRlciBldmVudCB0byB0aGUgZWxlbWVudC4qL1xuICAgIG1vdXNlZW50ZXIoKTogdGhpcztcbiAgICAvKipBZGQgYSBgbW91c2VlbnRlcmAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIG1vdXNlZW50ZXIoZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIG1vdXNlZW50ZXIoZm4/LCBvcHRpb25zPykge1xuICAgICAgICAvLyBtb3VzZW92ZXI6IGFsc28gY2hpbGQgZWxlbWVudHNcbiAgICAgICAgLy8gbW91c2VlbnRlcjogb25seSBib3VuZCBlbGVtZW50XG4gICAgICAgIFxuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBjb25zdCBtb3VzZWVudGVyID0gbmV3IE1vdXNlRXZlbnQoJ21vdXNlZW50ZXInLCB7XG4gICAgICAgICAgICAgICAgJ3ZpZXcnIDogd2luZG93LFxuICAgICAgICAgICAgICAgICdidWJibGVzJyA6IHRydWUsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbGFibGUnIDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmUuZGlzcGF0Y2hFdmVudChtb3VzZWVudGVyKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBtb3VzZWVudGVyIDogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipTaW11bGF0ZSBhIGtleWRvd24gZXZlbnQgdG8gdGhlIGVsZW1lbnQuKi9cbiAgICAvLyBAdHMtaWdub3JlXG4gICAga2V5ZG93bigpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBrZXlkb3duYCBldmVudCBsaXN0ZW5lciovXG4gICAga2V5ZG93bihmbjogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAga2V5ZG93bihmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBrZXlkb3duIDogZm4gfSwgb3B0aW9ucylcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGtleXVwKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2tleXVwL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGtleXByZXNzKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2tleXByZXNzL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGhvdmVyKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2hvdmVyL1xuICAgICAgICAvLyBiaW5kcyB0byBib3RoIG1vdXNlZW50ZXIgYW5kIG1vdXNlbGVhdmVcbiAgICAgICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTc1ODk0MjAvd2hlbi10by1jaG9vc2UtbW91c2VvdmVyLWFuZC1ob3Zlci1mdW5jdGlvblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG1vdXNlZG93bigpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXlwcmVzcy9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBtb3VzZWxlYXZlKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2tleXByZXNzL1xuICAgICAgICAvL21vdXNlbGVhdmUgYW5kIG1vdXNlb3V0IGFyZSBzaW1pbGFyIGJ1dCBkaWZmZXIgaW4gdGhhdCBtb3VzZWxlYXZlIGRvZXMgbm90IGJ1YmJsZSBhbmQgbW91c2VvdXQgZG9lcy5cbiAgICAgICAgLy8gVGhpcyBtZWFucyB0aGF0IG1vdXNlbGVhdmUgaXMgZmlyZWQgd2hlbiB0aGUgcG9pbnRlciBoYXMgZXhpdGVkIHRoZSBlbGVtZW50IGFuZCBhbGwgb2YgaXRzIGRlc2NlbmRhbnRzLFxuICAgICAgICAvLyB3aGVyZWFzIG1vdXNlb3V0IGlzIGZpcmVkIHdoZW4gdGhlIHBvaW50ZXIgbGVhdmVzIHRoZSBlbGVtZW50IG9yIGxlYXZlcyBvbmUgb2YgdGhlIGVsZW1lbnQncyBkZXNjZW5kYW50c1xuICAgICAgICAvLyAoZXZlbiBpZiB0aGUgcG9pbnRlciBpcyBzdGlsbCB3aXRoaW4gdGhlIGVsZW1lbnQpLlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG1vdXNlbW92ZSgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXlwcmVzcy9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKlNpbXVsYXRlIGEgbW91c2VvdXQgZXZlbnQgdG8gdGhlIGVsZW1lbnQuKi9cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgbW91c2VvdXQoKTogdGhpcztcbiAgICAvKipBZGQgYSBgbW91c2VvdXRgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBtb3VzZW91dChmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG4gICAgbW91c2VvdXQoZm4/LCBvcHRpb25zPykge1xuICAgICAgICAvL21vdXNlbGVhdmUgYW5kIG1vdXNlb3V0IGFyZSBzaW1pbGFyIGJ1dCBkaWZmZXIgaW4gdGhhdCBtb3VzZWxlYXZlIGRvZXMgbm90IGJ1YmJsZSBhbmQgbW91c2VvdXQgZG9lcy5cbiAgICAgICAgLy8gVGhpcyBtZWFucyB0aGF0IG1vdXNlbGVhdmUgaXMgZmlyZWQgd2hlbiB0aGUgcG9pbnRlciBoYXMgZXhpdGVkIHRoZSBlbGVtZW50IGFuZCBhbGwgb2YgaXRzIGRlc2NlbmRhbnRzLFxuICAgICAgICAvLyB3aGVyZWFzIG1vdXNlb3V0IGlzIGZpcmVkIHdoZW4gdGhlIHBvaW50ZXIgbGVhdmVzIHRoZSBlbGVtZW50IG9yIGxlYXZlcyBvbmUgb2YgdGhlIGVsZW1lbnQncyBkZXNjZW5kYW50c1xuICAgICAgICAvLyAoZXZlbiBpZiB0aGUgcG9pbnRlciBpcyBzdGlsbCB3aXRoaW4gdGhlIGVsZW1lbnQpLlxuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgbW91c2VvdXQgOiBmbiB9LCBvcHRpb25zKVxuICAgIH1cbiAgICBcbiAgICAvKipTaW11bGF0ZSBhIG1vdXNlb3ZlciBldmVudCB0byB0aGUgZWxlbWVudC4qL1xuICAgIG1vdXNlb3ZlcigpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBtb3VzZW92ZXJgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBtb3VzZW92ZXIoZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIG1vdXNlb3Zlcihmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIC8vIG1vdXNlb3ZlcjogYWxzbyBjaGlsZCBlbGVtZW50c1xuICAgICAgICAvLyBtb3VzZWVudGVyOiBvbmx5IGJvdW5kIGVsZW1lbnRcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IG1vdXNlb3ZlciA6IGZuIH0sIG9wdGlvbnMpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBtb3VzZXVwKCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2tleXByZXNzL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgdHJhbnNmb3JtKG9wdGlvbnM6IFRyYW5zZm9ybU9wdGlvbnMpIHtcbiAgICAgICAgbGV0IHRyYW5zZm9ybTogc3RyaW5nID0gJyc7XG4gICAgICAgIGZvciAoIGxldCBbIGssIHYgXSBvZiBlbnVtZXJhdGUob3B0aW9ucykgKSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm0gKz0gYCR7a30oJHt2fSkgYFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMub24oe1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb25lbmQgOiByZXNvbHZlXG4gICAgICAgICAgICB9LCB7IG9uY2UgOiB0cnVlIH0pO1xuICAgICAgICAgICAgdGhpcy5jc3MoeyB0cmFuc2Zvcm0gfSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgXG4gICAgLyoqIFJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXIgb2YgYGV2ZW50YCwgaWYgZXhpc3RzLiovXG4gICAgb2ZmKGV2ZW50OiBURXZlbnQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIHRoaXMuX2xpc3RlbmVyc1tldmVudF0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgYWxsT2ZmKCk6IHRoaXMge1xuICAgICAgICBmb3IgKCBsZXQgZXZlbnQgaW4gdGhpcy5fbGlzdGVuZXJzICkge1xuICAgICAgICAgICAgdGhpcy5vZmYoPFRFdmVudD4gZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvLyAqKiogIEF0dHJpYnV0ZXNcbiAgICBcbiAgICAvKiogRm9yIGVhY2ggYFthdHRyLCB2YWxdYCBwYWlyLCBhcHBseSBgc2V0QXR0cmlidXRlYCovXG4gICAgYXR0cihhdHRyVmFsUGFpcnM6IFRNYXA8c3RyaW5nIHwgYm9vbGVhbj4pOiB0aGlzXG4gICAgLyoqIGFwcGx5IGBnZXRBdHRyaWJ1dGVgKi9cbiAgICBhdHRyKGF0dHJpYnV0ZU5hbWU6IHN0cmluZyk6IHN0cmluZ1xuICAgIGF0dHIoYXR0clZhbFBhaXJzKSB7XG4gICAgICAgIGlmICggdHlwZW9mIGF0dHJWYWxQYWlycyA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLmdldEF0dHJpYnV0ZShhdHRyVmFsUGFpcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICggbGV0IFsgYXR0ciwgdmFsIF0gb2YgZW51bWVyYXRlKGF0dHJWYWxQYWlycykgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5zZXRBdHRyaWJ1dGUoYXR0ciwgdmFsKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKiBgcmVtb3ZlQXR0cmlidXRlYCAqL1xuICAgIHJlbW92ZUF0dHIocXVhbGlmaWVkTmFtZTogc3RyaW5nLCAuLi5xdWFsaWZpZWROYW1lczogc3RyaW5nW10pOiB0aGlzIHtcbiAgICAgICAgbGV0IF9yZW1vdmVBdHRyaWJ1dGU7XG4gICAgICAgIGlmICggdGhpcy5faXNTdmcgKVxuICAgICAgICAgICAgX3JlbW92ZUF0dHJpYnV0ZSA9IChxdWFsaWZpZWROYW1lKSA9PiB0aGlzLmUucmVtb3ZlQXR0cmlidXRlTlMoU1ZHX05TX1VSSSwgcXVhbGlmaWVkTmFtZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUgPSAocXVhbGlmaWVkTmFtZSkgPT4gdGhpcy5lLnJlbW92ZUF0dHJpYnV0ZShxdWFsaWZpZWROYW1lKTtcbiAgICAgICAgXG4gICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUocXVhbGlmaWVkTmFtZSk7XG4gICAgICAgIGZvciAoIGxldCBxbiBvZiBxdWFsaWZpZWROYW1lcyApXG4gICAgICAgICAgICBfcmVtb3ZlQXR0cmlidXRlKHFuKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKmBnZXRBdHRyaWJ1dGUoYGRhdGEtJHtrZXl9YClgLiBKU09OLnBhcnNlIGl0IGJ5IGRlZmF1bHQuKi9cbiAgICBkYXRhKGtleTogc3RyaW5nLCBwYXJzZTogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcgfCBUTWFwPHN0cmluZz4ge1xuICAgICAgICAvLyBUT0RPOiBqcXVlcnkgZG9lc24ndCBhZmZlY3QgZGF0YS0qIGF0dHJzIGluIERPTS4gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9kYXRhL1xuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5lLmdldEF0dHJpYnV0ZShgZGF0YS0ke2tleX1gKTtcbiAgICAgICAgaWYgKCBwYXJzZSA9PT0gdHJ1ZSApXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIGdldE9wYWNpdHlUcmFuc2l0aW9uRHVyYXRpb24oKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKCAhdGhpcy5fY29tcHV0ZWRTdHlsZSApIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbXB1dGVkU3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMuZSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHsgdHJhbnNpdGlvblByb3BlcnR5LCB0cmFuc2l0aW9uRHVyYXRpb24gfSA9IHRoaXMuX2NvbXB1dGVkU3R5bGU7XG4gICAgICAgIGNvbnN0IHRyYW5zUHJvcCA9IHRyYW5zaXRpb25Qcm9wZXJ0eS5zcGxpdCgnLCAnKTtcbiAgICAgICAgY29uc3QgaW5kZXhPZk9wYWNpdHkgPSB0cmFuc1Byb3AuaW5kZXhPZignb3BhY2l0eScpO1xuICAgICAgICBpZiAoIGluZGV4T2ZPcGFjaXR5ICE9PSAtMSApIHtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zRHVyID0gdHJhbnNpdGlvbkR1cmF0aW9uLnNwbGl0KCcsICcpO1xuICAgICAgICAgICAgY29uc3Qgb3BhY2l0eVRyYW5zRHVyID0gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldO1xuICAgICAgICAgICAgaWYgKCBvcGFjaXR5VHJhbnNEdXIuaW5jbHVkZXMoJ20nKSApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQob3BhY2l0eVRyYW5zRHVyKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChvcGFjaXR5VHJhbnNEdXIpICogMTAwMFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUud2FybihgZ2V0T3BhY2l0eVRyYW5zaXRpb25EdXJhdGlvbigpIHJldHVybmluZyB1bmRlZmluZWRgKTtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgXG4gICAgLy8gKiogIEZhZGVcbiAgICBhc3luYyBmYWRlKGR1cjogbnVtYmVyLCB0bzogMCB8IDEpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgY29uc3Qgc3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lKTtcbiAgICAgICAgY29uc3QgdHJhbnNQcm9wID0gc3R5bGVzLnRyYW5zaXRpb25Qcm9wZXJ0eS5zcGxpdCgnLCAnKTtcbiAgICAgICAgY29uc3QgaW5kZXhPZk9wYWNpdHkgPSB0cmFuc1Byb3AuaW5kZXhPZignb3BhY2l0eScpO1xuICAgICAgICAvLyBjc3Mgb3BhY2l0eTowID0+IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTogMHNcbiAgICAgICAgLy8gY3NzIG9wYWNpdHk6NTAwbXMgPT4gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldOiAwLjVzXG4gICAgICAgIC8vIGNzcyBOTyBvcGFjaXR5ID0+IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTogdW5kZWZpbmVkXG4gICAgICAgIGlmICggaW5kZXhPZk9wYWNpdHkgIT09IC0xICkge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNEdXIgPSBzdHlsZXMudHJhbnNpdGlvbkR1cmF0aW9uLnNwbGl0KCcsICcpO1xuICAgICAgICAgICAgY29uc3Qgb3BhY2l0eVRyYW5zRHVyID0gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldO1xuICAgICAgICAgICAgY29uc3QgdHJhbnMgPSBzdHlsZXMudHJhbnNpdGlvbi5zcGxpdCgnLCAnKTtcbiAgICAgICAgICAgIC8vIHRyYW5zaXRpb246IG9wYWNpdHkgd2FzIGRlZmluZWQgaW4gY3NzLlxuICAgICAgICAgICAgLy8gc2V0IHRyYW5zaXRpb24gdG8gZHVyLCBzZXQgb3BhY2l0eSB0byAwLCBsZWF2ZSB0aGUgYW5pbWF0aW9uIHRvIG5hdGl2ZSB0cmFuc2l0aW9uLCB3YWl0IGR1ciBhbmQgcmV0dXJuIHRoaXNcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgZmFkZSgke2R1cn0sICR7dG99KSwgb3BhY2l0eVRyYW5zRHVyICE9PSB1bmRlZmluZWQuIG51bGxpZnlpbmcgdHJhbnNpdGlvbi4gU0hPVUxEIE5PVCBXT1JLYCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgdHJhbnM6XFx0JHt0cmFuc31cXG50cmFuc1Byb3A6XFx0JHt0cmFuc1Byb3B9XFxuaW5kZXhPZk9wYWNpdHk6XFx0JHtpbmRleE9mT3BhY2l0eX1cXG5vcGFjaXR5VHJhbnNEdXI6XFx0JHtvcGFjaXR5VHJhbnNEdXJ9YCk7XG4gICAgICAgICAgICAvLyB0cmFucy5zcGxpY2UoaW5kZXhPZk9wYWNpdHksIDEsIGBvcGFjaXR5ICR7ZHVyIC8gMTAwMH1zYCk7XG4gICAgICAgICAgICB0cmFucy5zcGxpY2UoaW5kZXhPZk9wYWNpdHksIDEsIGBvcGFjaXR5IDBzYCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgYWZ0ZXIsIHRyYW5zOiAke3RyYW5zfWApO1xuICAgICAgICAgICAgdGhpcy5lLnN0eWxlLnRyYW5zaXRpb24gPSB0cmFucy5qb2luKCcsICcpO1xuICAgICAgICAgICAgdGhpcy5jc3MoeyBvcGFjaXR5IDogdG8gfSk7XG4gICAgICAgICAgICBhd2FpdCB3YWl0KGR1cik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICAvLyB0cmFuc2l0aW9uOiBvcGFjaXR5IHdhcyBOT1QgZGVmaW5lZCBpbiBjc3MuXG4gICAgICAgIGlmICggZHVyID09IDAgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jc3MoeyBvcGFjaXR5IDogdG8gfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXNGYWRlT3V0ID0gdG8gPT09IDA7XG4gICAgICAgIGxldCBvcGFjaXR5ID0gcGFyc2VGbG9hdCh0aGlzLmUuc3R5bGUub3BhY2l0eSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIG9wYWNpdHkgPT09IHVuZGVmaW5lZCB8fCBpc05hTihvcGFjaXR5KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgZmFkZSgke2R1cn0sICR7dG99KSBodG1sRWxlbWVudCBoYXMgTk8gb3BhY2l0eSBhdCBhbGwuIHJlY3Vyc2luZ2AsIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5LFxuICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNzcyh7IG9wYWNpdHkgOiBNYXRoLmFicygxIC0gdG8pIH0pLmZhZGUoZHVyLCB0bylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCBpc0ZhZGVPdXQgPyBvcGFjaXR5IDw9IDAgOiBvcGFjaXR5ID4gMSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYGZhZGUoJHtkdXJ9LCAke3RvfSkgb3BhY2l0eSB3YXMgYmV5b25kIHRhcmdldCBvcGFjaXR5LiByZXR1cm5pbmcgdGhpcyBhcyBpcy5gLCB7XG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxldCBzdGVwcyA9IDMwO1xuICAgICAgICBsZXQgb3BTdGVwID0gMSAvIHN0ZXBzO1xuICAgICAgICBsZXQgZXZlcnltcyA9IGR1ciAvIHN0ZXBzO1xuICAgICAgICBpZiAoIGV2ZXJ5bXMgPCAxICkge1xuICAgICAgICAgICAgZXZlcnltcyA9IDE7XG4gICAgICAgICAgICBzdGVwcyA9IGR1cjtcbiAgICAgICAgICAgIG9wU3RlcCA9IDEgLyBzdGVwcztcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgZmFkZSgke2R1cn0sICR7dG99KSBoYWQgb3BhY2l0eSwgbm8gdHJhbnNpdGlvbi4gKGdvb2QpIG9wYWNpdHk6ICR7b3BhY2l0eX1gLCB7XG4gICAgICAgICAgICBzdGVwcyxcbiAgICAgICAgICAgIG9wU3RlcCxcbiAgICAgICAgICAgIGV2ZXJ5bXNcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlYWNoZWRUbyA9IGlzRmFkZU91dCA/IChvcCkgPT4gb3AgLSBvcFN0ZXAgPiAwIDogKG9wKSA9PiBvcCArIG9wU3RlcCA8IDE7XG4gICAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCByZWFjaGVkVG8ob3BhY2l0eSkgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBpc0ZhZGVPdXQgPT09IHRydWUgKVxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5IC09IG9wU3RlcDtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHkgKz0gb3BTdGVwO1xuICAgICAgICAgICAgICAgIHRoaXMuY3NzKHsgb3BhY2l0eSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eSA9IHRvO1xuICAgICAgICAgICAgICAgIHRoaXMuY3NzKHsgb3BhY2l0eSB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZXZlcnltcyk7XG4gICAgICAgIGF3YWl0IHdhaXQoZHVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGZhZGVPdXQoZHVyOiBudW1iZXIpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZmFkZShkdXIsIDApO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBhc3luYyBmYWRlSW4oZHVyOiBudW1iZXIpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZmFkZShkdXIsIDEpO1xuICAgIH1cbiAgICBcbiAgICBcbn1cblxuY2xhc3MgRGl2IGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxEaXZFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhIERpdiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ2RpdicsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgIH1cbn1cblxuY2xhc3MgUGFyYWdyYXBoIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxQYXJhZ3JhcGhFbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxQYXJhZ3JhcGhFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhIFBhcmFncmFwaCBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ3AnLCB0ZXh0LCBjbHMgfSk7XG4gICAgICAgIGlmICggaWQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmlkKGlkKTtcbiAgICB9XG59XG5cbmNsYXNzIFNwYW4gZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTFNwYW5FbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxTcGFuRWxlbWVudDtcbiAgICBcbiAgICAvKipDcmVhdGUgYSBTcGFuIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCB0ZXh0LCBjbHMgfTogU3ViRWxlbUNvbnN0cnVjdG9yID0ge30pIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnc3BhbicsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBcbiAgICB9XG59XG5cbmNsYXNzIEltZyBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhbiBJbWcgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCBzcmMgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgc3JjLCBjbHMgfTogSW1nQ29uc3RydWN0b3IpIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnaW1nJywgY2xzIH0pO1xuICAgICAgICBpZiAoIGlkICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5pZChpZCk7XG4gICAgICAgIGlmICggc3JjICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuc3JjID0gc3JjO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgc3JjKHNyYzogc3RyaW5nKTogdGhpcztcbiAgICBzcmMoKTogc3RyaW5nO1xuICAgIHNyYyhzcmM/KSB7XG4gICAgICAgIGlmICggc3JjID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQuc3JjXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5zcmMgPSBzcmM7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZWFkb25seSBlOiBIVE1MSW1hZ2VFbGVtZW50O1xufVxuXG5jbGFzcyBCdXR0b24gZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gICAgXG4gICAgLyoqQ3JlYXRlIGEgQnV0dG9uIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgY2xzLCBodG1sIG9yIGNsaWNrIGZ1bmN0aW9uKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCBjbHMsIGNsaWNrLCBodG1sIH06IEJ1dHRvbkNvbnN0cnVjdG9yKSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ2J1dHRvbicsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBpZiAoIGNsaWNrICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5jbGljayhjbGljayk7XG4gICAgICAgIGlmICggaHRtbCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaHRtbChodG1sKTtcbiAgICAgICAgdGhpcy5hdHRyKHsgdHlwZSA6ICdidXR0b24nIH0pXG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcmVhZG9ubHkgZTogSFRNTEJ1dHRvbkVsZW1lbnQ7XG59XG5cbmNsYXNzIEFuY2hvciBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBIVE1MQW5jaG9yRWxlbWVudDtcbiAgICByZWFkb25seSBlOiBIVE1MQW5jaG9yRWxlbWVudDtcbiAgICBcbiAgICAvKipDcmVhdGUgYW4gQW5jaG9yIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCwgaHJlZiBvciBjbHMuKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCB0ZXh0LCBjbHMsIGhyZWYgfTogQW5jaG9yQ29uc3RydWN0b3IgPSB7fSkge1xuICAgICAgICBzdXBlcih7IHRhZyA6ICdhJywgdGV4dCwgY2xzIH0pO1xuICAgICAgICBpZiAoIGlkICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5pZChpZCk7XG4gICAgICAgIGlmICggaHJlZiAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaHJlZihocmVmKVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgaHJlZigpOiBzdHJpbmdcbiAgICBocmVmKHZhbDogc3RyaW5nKTogdGhpc1xuICAgIGhyZWYodmFsPykge1xuICAgICAgICBpZiAoIHZhbCA9PT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ2hyZWYnKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cih7IGhyZWYgOiB2YWwgfSlcbiAgICB9XG4gICAgXG4gICAgdGFyZ2V0KCk6IHN0cmluZ1xuICAgIHRhcmdldCh2YWw6IHN0cmluZyk6IHRoaXNcbiAgICB0YXJnZXQodmFsPykge1xuICAgICAgICBpZiAoIHZhbCA9PT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3RhcmdldCcpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKHsgdGFyZ2V0IDogdmFsIH0pXG4gICAgfVxufVxuXG5jbGFzcyBJbnB1dCBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzLCBwbGFjZWhvbGRlciwgdHlwZSB9OiBJbnB1dENvbnN0cnVjdG9yID0ge30pIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnaW5wdXQnLCB0ZXh0LCBjbHMgfSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIGlkICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5pZChpZCk7XG4gICAgICAgIGlmICggcGxhY2Vob2xkZXIgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmF0dHIoeyBwbGFjZWhvbGRlciwgdHlwZSA6IHR5cGUgPz8gJ3RleHQnIH0pXG4gICAgfVxuICAgIFxuICAgIGdldCBwbGFjZWhvbGRlcigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5lLnBsYWNlaG9sZGVyO1xuICAgIH1cbiAgICBcbiAgICBzZXQgcGxhY2Vob2xkZXIodmFsOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5lLnBsYWNlaG9sZGVyID0gdmFsO1xuICAgIH1cbiAgICBcbiAgICBnZXQgdmFsdWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZS52YWx1ZTtcbiAgICB9XG4gICAgXG4gICAgc2V0IHZhbHVlKHZhbDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZS52YWx1ZSA9IHZhbDtcbiAgICB9XG59XG5cbmNsYXNzIFZpc3VhbEJIRSBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgX29wYWNUcmFuc0R1cjogbnVtYmVyO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIHNldE9wYWNUcmFuc0R1cigpIHtcbiAgICAgICAgdGhpcy5fb3BhY1RyYW5zRHVyID0gdGhpcy5nZXRPcGFjaXR5VHJhbnNpdGlvbkR1cmF0aW9uKClcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgZGlzcGxheSgpIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIHJldHVybiBhd2FpdCB3YWl0KHRoaXMuX29wYWNUcmFuc0R1ciwgZmFsc2UpO1xuICAgIH1cbiAgICBcbiAgICBhc3luYyBoaWRlKCkge1xuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHdhaXQodGhpcy5fb3BhY1RyYW5zRHVyLCBmYWxzZSk7XG4gICAgfVxufVxuXG5cbi8qY2xhc3MgU3ZnIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnR7XG4gcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogU1ZHRWxlbWVudDtcbiBjb25zdHJ1Y3Rvcih7aWQsIGNscyxodG1sRWxlbWVudH06IFN2Z0NvbnN0cnVjdG9yKSB7XG4gc3VwZXIoe3RhZzogJ3N2ZycsIGNsc30pO1xuIGlmIChpZClcbiB0aGlzLmlkKGlkKTtcbiBpZiAoc3JjKVxuIHRoaXMuX2h0bWxFbGVtZW50LnNyYyA9IHNyYztcbiBcbiB9XG4gfVxuICovXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1odG1sLWVsZW1lbnQnLCBCZXR0ZXJIVE1MRWxlbWVudCk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1kaXYnLCBEaXYsIHsgZXh0ZW5kcyA6ICdkaXYnIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItcCcsIFBhcmFncmFwaCwgeyBleHRlbmRzIDogJ3AnIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItc3BhbicsIFNwYW4sIHsgZXh0ZW5kcyA6ICdzcGFuJyB9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWltZycsIEltZywgeyBleHRlbmRzIDogJ2ltZycgfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1hJywgQW5jaG9yLCB7IGV4dGVuZHMgOiAnYScgfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1idXR0b24nLCBCdXR0b24sIHsgZXh0ZW5kcyA6ICdidXR0b24nIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItaW5wdXQnLCBJbnB1dCwgeyBleHRlbmRzIDogJ2lucHV0JyB9KTtcblxuLy8gY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItc3ZnJywgU3ZnLCB7ZXh0ZW5kczogJ3N2Zyd9KTtcblxuLyoqQ3JlYXRlIGFuIGVsZW1lbnQgb2YgYHRhZ2AuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgIGFuZCAvIG9yIGBjbHNgKi9cbmZ1bmN0aW9uIGVsZW0oeyB0YWcsIHRleHQsIGNscyB9OiB7IHRhZzogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbi8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBpZGAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbmZ1bmN0aW9uIGVsZW0oeyBpZCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGlkOiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTogQmV0dGVySFRNTEVsZW1lbnQ7XG4vKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgcXVlcnlgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG5mdW5jdGlvbiBlbGVtKHsgcXVlcnksIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBxdWVyeTogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbi8qKldyYXAgYW4gZXhpc3RpbmcgSFRNTEVsZW1lbnQuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbmZ1bmN0aW9uIGVsZW0oeyBodG1sRWxlbWVudCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGh0bWxFbGVtZW50OiBIVE1MRWxlbWVudCwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbmZ1bmN0aW9uIGVsZW0oZWxlbU9wdGlvbnMpOiBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIG5ldyBCZXR0ZXJIVE1MRWxlbWVudChlbGVtT3B0aW9ucyk7XG59XG5cbi8qKkNyZWF0ZSBhIFNwYW4gZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0IG9yIGNscy4qL1xuZnVuY3Rpb24gc3Bhbih7IGlkLCB0ZXh0LCBjbHMgfTogU3ViRWxlbUNvbnN0cnVjdG9yID0ge30pOiBTcGFuIHtcbiAgICByZXR1cm4gbmV3IFNwYW4oeyBpZCwgdGV4dCwgY2xzIH0pO1xufVxuXG4vKipDcmVhdGUgYW4gRGl2IGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbmZ1bmN0aW9uIGRpdih7IGlkLCB0ZXh0LCBjbHMgfTogU3ViRWxlbUNvbnN0cnVjdG9yID0ge30pOiBEaXYge1xuICAgIHJldHVybiBuZXcgRGl2KHsgaWQsIHRleHQsIGNscyB9KTtcbn1cblxuLyoqQ3JlYXRlIGFuIEltZyBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHNyYyBvciBjbHMuKi9cbmZ1bmN0aW9uIGltZyh7IGlkLCBzcmMsIGNscyB9OiBJbWdDb25zdHJ1Y3RvciA9IHt9KTogSW1nIHtcbiAgICByZXR1cm4gbmV3IEltZyh7IGlkLCBzcmMsIGNscyB9KTtcbn1cblxuLyoqQ3JlYXRlIGEgQnV0dG9uIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgY2xzLCBodG1sIG9yIGNsaWNrIGZ1bmN0aW9uKi9cbmZ1bmN0aW9uIGJ1dHRvbih7IGlkLCBjbHMsIGNsaWNrLCBodG1sIH06IEJ1dHRvbkNvbnN0cnVjdG9yID0ge30pOiBCdXR0b24ge1xuICAgIHJldHVybiBuZXcgQnV0dG9uKHsgaWQsIGNscywgY2xpY2ssIGh0bWwgfSk7XG59XG5cbi8qKkNyZWF0ZSBhIFBhcmFncmFwaCBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG5mdW5jdGlvbiBwYXJhZ3JhcGgoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogUGFyYWdyYXBoIHtcbiAgICByZXR1cm4gbmV3IFBhcmFncmFwaCh7IGlkLCB0ZXh0LCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhbiBBbmNob3IgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0LCBocmVmIG9yIGNscy4qL1xuZnVuY3Rpb24gYW5jaG9yKHsgaWQsIHRleHQsIGNscywgaHJlZiB9OiBBbmNob3JDb25zdHJ1Y3RvciA9IHt9KTogQW5jaG9yIHtcbiAgICByZXR1cm4gbmV3IEFuY2hvcih7IGlkLCB0ZXh0LCBjbHMsIGhyZWYgfSk7XG59XG5cbi8qKkNyZWF0ZSBhbiBJbnB1dCBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgYGlkYCwgYHRleHRgLCBgY2xzYCwgYHBsYWNlaG9sZGVyYCwgb3IgYHR5cGVgLiBgdHlwZWAgZGVmYXVsdHMgdG8gYHRleHRgLiovXG5mdW5jdGlvbiBpbnB1dCh7IGlkLCB0ZXh0LCBjbHMsIHBsYWNlaG9sZGVyLCB0eXBlIH06IElucHV0Q29uc3RydWN0b3IgPSB7fSk6IElucHV0IHtcbiAgICByZXR1cm4gbmV3IElucHV0KHsgaWQsIHRleHQsIGNscywgcGxhY2Vob2xkZXIsIHR5cGUgfSk7XG59XG5cbmV4cG9ydCB7IGVsZW0sIHNwYW4sIGRpdiwgaW1nLCBwYXJhZ3JhcGgsIGFuY2hvciwgYnV0dG9uLCBpbnB1dCwgQmV0dGVySFRNTEVsZW1lbnQsIERpdiwgQnV0dG9uLCBTcGFuLCBJbnB1dCwgVmlzdWFsQkhFIH1cbiJdfQ==