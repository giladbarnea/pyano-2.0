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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtDQUFzRTtBQUV0RSxNQUFNLFVBQVUsR0FBRyw0QkFBNEIsQ0FBQztBQUloRCxNQUFNLGlCQUFpQjtJQStCbkIsWUFBWSxXQUFXO1FBN0JOLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFDeEIsZUFBVSxHQUE4QixFQUFFLENBQUM7UUFDcEQsb0JBQWUsR0FBNEIsRUFBRSxDQUFDO1FBNEJsRCxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsV0FBVyxDQUFDO1FBRXpFLElBQUssQ0FBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRztZQUMzRSxNQUFNLElBQUksdUJBQXVCLENBQUMsQ0FBQyxFQUFFO2dCQUNqQyxHQUFHO2dCQUNILEVBQUU7Z0JBQ0YsV0FBVztnQkFDWCxLQUFLO2FBQ1IsQ0FBQyxDQUFBO1NBRUw7UUFDRCxJQUFLLEdBQUcsS0FBSyxTQUFTLElBQUksUUFBUSxLQUFLLFNBQVM7WUFDNUMsTUFBTSxJQUFJLHVCQUF1QixDQUFDLENBQUMsRUFBRTtnQkFDakMsR0FBRztnQkFDSCxRQUFRO2FBQ1gsRUFBRSwrSUFBK0ksQ0FBQyxDQUFDO1FBRXhKLElBQUssR0FBRyxLQUFLLFNBQVMsRUFBRztZQUNyQixJQUFLLENBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRztnQkFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxZQUFZ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QUksR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFheUIsa0JBQUc7QUFWN0IsU0FBUyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsS0FBeUIsRUFBRTtJQUN6RCxPQUFPLElBQUksU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFROEIsOEJBQVM7QUFMeEMsU0FBUyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQXdCLEVBQUU7SUFDM0QsT0FBTyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUd5Qyx3QkFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJvb2wsIGVudW1lcmF0ZSwgaXNGdW5jdGlvbiwgaXNPYmplY3QsIHdhaXQgfSBmcm9tIFwiLi4vdXRpbFwiO1xuXG5jb25zdCBTVkdfTlNfVVJJID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJztcblxuLy8gVE9ETzogbWFrZSBCZXR0ZXJIVE1MRWxlbWVudDxUPiwgZm9yIHVzZSBpbiBlZyBjaGlsZFtyZW5dIGZ1bmN0aW9uXG4vLyBleHRlbmRzIEhUTUxFbGVtZW50OiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5L3VwZ3JhZGUjRXhhbXBsZXNcbmNsYXNzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgX2h0bWxFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9pc1N2ZzogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2xpc3RlbmVyczogVEV2ZW50RnVuY3Rpb25NYXA8VEV2ZW50PiA9IHt9O1xuICAgIHByaXZhdGUgX2NhY2hlZENoaWxkcmVuOiBUTWFwPEJldHRlckhUTUxFbGVtZW50PiA9IHt9O1xuICAgIFxuICAgIC8qW1N5bWJvbC50b1ByaW1pdGl2ZV0oaGludCkge1xuICAgICBjb25zb2xlLmxvZygnZnJvbSB0b1ByaW1pdGl2ZSwgaGludDogJywgaGludCwgJ1xcbnRoaXM6ICcsIHRoaXMpO1xuICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQ7XG4gICAgIH1cbiAgICAgXG4gICAgIHZhbHVlT2YoKSB7XG4gICAgIGNvbnNvbGUubG9nKCdmcm9tIHZhbHVlT2YsIHRoaXM6ICcsIHRoaXMpO1xuICAgICByZXR1cm4gdGhpcztcbiAgICAgfVxuICAgICBcbiAgICAgdG9TdHJpbmcoKSB7XG4gICAgIGNvbnNvbGUubG9nKCdmcm9tIHRvU3RyaW5nLCB0aGlzOiAnLCB0aGlzKTtcbiAgICAgcmV0dXJuIHRoaXM7XG4gICAgIH1cbiAgICAgKi9cbiAgICBcbiAgICAvLyBUT0RPOiBxdWVyeSBzaG91bGQgYWxzbyBiZSBhIHByZWRpY2F0ZSBmdW5jdGlvblxuICAgIC8qKkNyZWF0ZSBhbiBlbGVtZW50IG9mIGB0YWdgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCBhbmQgLyBvciBgY2xzYCovXG4gICAgY29uc3RydWN0b3IoeyB0YWcsIHRleHQsIGNscyB9OiB7IHRhZzogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nIH0pO1xuICAgIC8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBpZGAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCB0ZXh0LCBjbHMsIGNoaWxkcmVuIH06IHsgaWQ6IHN0cmluZywgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIC8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBxdWVyeWAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IHF1ZXJ5LCB0ZXh0LCBjbHMsIGNoaWxkcmVuIH06IHsgcXVlcnk6IFF1ZXJ5U2VsZWN0b3IsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICAvKipXcmFwIGFuIGV4aXN0aW5nIEhUTUxFbGVtZW50LiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBodG1sRWxlbWVudCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGh0bWxFbGVtZW50OiBIVE1MRWxlbWVudCwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIGNvbnN0cnVjdG9yKGVsZW1PcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHsgdGFnLCBpZCwgaHRtbEVsZW1lbnQsIHRleHQsIHF1ZXJ5LCBjaGlsZHJlbiwgY2xzIH0gPSBlbGVtT3B0aW9ucztcbiAgICAgICAgXG4gICAgICAgIGlmICggWyB0YWcsIGlkLCBodG1sRWxlbWVudCwgcXVlcnkgXS5maWx0ZXIoeCA9PiB4ICE9PSB1bmRlZmluZWQpLmxlbmd0aCA+IDEgKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFkQXJndW1lbnRzQW1vdW50RXJyb3IoMSwge1xuICAgICAgICAgICAgICAgIHRhZyxcbiAgICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgICBodG1sRWxlbWVudCxcbiAgICAgICAgICAgICAgICBxdWVyeVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGlmICggdGFnICE9PSB1bmRlZmluZWQgJiYgY2hpbGRyZW4gIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFkQXJndW1lbnRzQW1vdW50RXJyb3IoMSwge1xuICAgICAgICAgICAgICAgIHRhZyxcbiAgICAgICAgICAgICAgICBjaGlsZHJlblxuICAgICAgICAgICAgfSwgJ1wiY2hpbGRyZW5cIiBhbmQgXCJ0YWdcIiBvcHRpb25zIGFyZSBtdXR1YWxseSBleGNsdXNpdmUsIGJlY2F1c2UgdGFnIGltcGxpZXMgY3JlYXRpbmcgYSBuZXcgZWxlbWVudCBhbmQgY2hpbGRyZW4gaW1wbGllcyBnZXR0aW5nIGFuIGV4aXN0aW5nIG9uZS4nKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggdGFnICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBpZiAoIFsgJ3N2ZycsICdwYXRoJyBdLmluY2x1ZGVzKHRhZy50b0xvd2VyQ2FzZSgpKSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N2ZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TX1VSSSwgdGFnKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLl9odG1sRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3htbG5zJywgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIGlkICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgICAgICAgIGlmICggIWJvb2wodGhpcy5faHRtbEVsZW1lbnQpIClcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEVsZW0gY29uc3RydWN0b3I6IHRyaWVkIHRvIGdldCBlbGVtZW50IGJ5IGlkOiBcIiR7aWR9XCIsIGJ1dCBubyBzdWNoIGVsZW1lbnQgZXhpc3RzLmApXG4gICAgICAgIH0gZWxzZSBpZiAoIHF1ZXJ5ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocXVlcnkpO1xuICAgICAgICAgICAgaWYgKCAhYm9vbCh0aGlzLl9odG1sRWxlbWVudCkgKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRWxlbSBjb25zdHJ1Y3RvcjogdHJpZWQgdG8gZ2V0IGVsZW1lbnQgYnkgcXVlcnk6IFwiJHtxdWVyeX1cIiwgYnV0IG5vIGVsZW1lbnQgZm91bmQuYClcbiAgICAgICAgfSBlbHNlIGlmICggaHRtbEVsZW1lbnQgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gaHRtbEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoICFib29sKHRoaXMuX2h0bWxFbGVtZW50KSApXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBFbGVtIGNvbnN0cnVjdG9yOiBwYXNzZWQgZXhwbGljaXQgaHRtbEVsZW1lbnQgYXJnLCBidXQgYXJnIHdhcyBmYWxzZXk6ICR7aHRtbEVsZW1lbnR9YCwgaHRtbEVsZW1lbnQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFkQXJndW1lbnRzQW1vdW50RXJyb3IoMSwge1xuICAgICAgICAgICAgICAgIHRhZyxcbiAgICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgICBodG1sRWxlbWVudCxcbiAgICAgICAgICAgICAgICBxdWVyeVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCB0ZXh0ICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy50ZXh0KHRleHQpO1xuICAgICAgICBpZiAoIGNscyAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuY2xhc3MoY2xzKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggY2hpbGRyZW4gIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmNhY2hlQ2hpbGRyZW4oY2hpbGRyZW4pO1xuICAgICAgICBcbiAgICAgICAgLy8gT2JqZWN0LmFzc2lnbih0aGlzLCBwcm94eSk7XG4gICAgICAgIC8qY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgICAgICByZXR1cm4gbmV3IFByb3h5KHRoaXMsIHtcbiAgICAgICAgIGdldCh0YXJnZXQ6IEJldHRlckhUTUxFbGVtZW50LCBwOiBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2wsIHJlY2VpdmVyOiBhbnkpOiBhbnkge1xuICAgICAgICAgLy8gY29uc29sZS5sb2coJ2xvZ2dpbmcnKTtcbiAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd0YXJnZXQ6ICcsIHRhcmdldCxcbiAgICAgICAgIC8vICAgICAnXFxudGhhdDogJywgdGhhdCxcbiAgICAgICAgIC8vICAgICAnXFxudHlwZW9mKHRoYXQpOiAnLCB0eXBlb2YgKHRoYXQpLFxuICAgICAgICAgLy8gICAgICdcXG5wOiAnLCBwLFxuICAgICAgICAgLy8gICAgICdcXG5yZWNlaXZlcjogJywgcmVjZWl2ZXIsXG4gICAgICAgICAvLyAgICAgJ1xcbnRoaXM6ICcsIHRoaXMpO1xuICAgICAgICAgcmV0dXJuIHRoYXRbcF07XG4gICAgICAgICB9XG4gICAgICAgICB9KVxuICAgICAgICAgKi9cbiAgICB9XG4gICAgXG4gICAgLyoqUmV0dXJuIHRoZSB3cmFwcGVkIEhUTUxFbGVtZW50Ki9cbiAgICBnZXQgZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50O1xuICAgIH1cbiAgICBcbiAgICAvKipTZXRzIGB0aGlzLl9odG1sRWxlbWVudGAgdG8gYG5ld0h0bWxFbGVtZW50Ll9odG1sRWxlbWVudGAuXG4gICAgICogUmVzZXRzIGB0aGlzLl9jYWNoZWRDaGlsZHJlbmAgYW5kIGNhY2hlcyBgbmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuYC5cbiAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyBmcm9tIGBuZXdIdG1sRWxlbWVudC5fbGlzdGVuZXJzYCwgd2hpbGUga2VlcGluZyBgdGhpcy5fbGlzdGVuZXJzYC4qL1xuICAgIHdyYXBTb21ldGhpbmdFbHNlKG5ld0h0bWxFbGVtZW50OiBCZXR0ZXJIVE1MRWxlbWVudCk6IHRoaXNcbiAgICAvKipTZXRzIGB0aGlzLl9odG1sRWxlbWVudGAgdG8gYG5ld0h0bWxFbGVtZW50YC5cbiAgICAgKiBLZWVwcyBgdGhpcy5fbGlzdGVuZXJzYC5cbiAgICAgKiBOT1RFOiB0aGlzIHJlaW5pdGlhbGl6ZXMgYHRoaXMuX2NhY2hlZENoaWxkcmVuYCBhbmQgYWxsIGV2ZW50IGxpc3RlbmVycyBiZWxvbmdpbmcgdG8gYG5ld0h0bWxFbGVtZW50YCBhcmUgbG9zdC4gUGFzcyBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgdG8ga2VlcCB0aGVtLiovXG4gICAgd3JhcFNvbWV0aGluZ0Vsc2UobmV3SHRtbEVsZW1lbnQ6IE5vZGUpOiB0aGlzXG4gICAgd3JhcFNvbWV0aGluZ0Vsc2UobmV3SHRtbEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fY2FjaGVkQ2hpbGRyZW4gPSB7fTtcbiAgICAgICAgaWYgKCBuZXdIdG1sRWxlbWVudCBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50ICkge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQucmVwbGFjZVdpdGgobmV3SHRtbEVsZW1lbnQuZSk7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IG5ld0h0bWxFbGVtZW50LmU7XG4gICAgICAgICAgICBmb3IgKCBsZXQgWyBfa2V5LCBfY2FjaGVkQ2hpbGQgXSBvZiBlbnVtZXJhdGUobmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuKSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShfa2V5IGFzIHN0cmluZywgX2NhY2hlZENoaWxkKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuX2NhY2hlZENoaWxkcmVuKS5sZW5ndGhcbiAgICAgICAgICAgICAgICAhPT0gT2JqZWN0LmtleXMobmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuKS5sZW5ndGhcbiAgICAgICAgICAgICAgICB8fFxuICAgICAgICAgICAgICAgIE9iamVjdC52YWx1ZXModGhpcy5fY2FjaGVkQ2hpbGRyZW4pLmZpbHRlcih2ID0+IHYgIT09IHVuZGVmaW5lZCkubGVuZ3RoXG4gICAgICAgICAgICAgICAgIT09IE9iamVjdC52YWx1ZXMobmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuKS5maWx0ZXIodiA9PiB2ICE9PSB1bmRlZmluZWQpLmxlbmd0aFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGB3cmFwU29tZXRoaW5nRWxzZSB0aGlzLl9jYWNoZWRDaGlsZHJlbiBsZW5ndGggIT09IG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbi5sZW5ndGhgLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzIDogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0h0bWxFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9uKHsgLi4udGhpcy5fbGlzdGVuZXJzLCAuLi5uZXdIdG1sRWxlbWVudC5fbGlzdGVuZXJzLCB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5vIHdheSB0byBnZXQgbmV3SHRtbEVsZW1lbnQgZXZlbnQgbGlzdGVuZXJzIGJlc2lkZXMgaGFja2luZyBFbGVtZW50LnByb3RvdHlwZVxuICAgICAgICAgICAgdGhpcy5vbih0aGlzLl9saXN0ZW5lcnMpO1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQucmVwbGFjZVdpdGgobmV3SHRtbEVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBuZXdIdG1sRWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8vICoqKiAgQmFzaWNcbiAgICAvKipTZXQgdGhlIGVsZW1lbnQncyBpbm5lckhUTUwqL1xuICAgIGh0bWwoaHRtbDogc3RyaW5nKTogdGhpcztcbiAgICAvKipHZXQgdGhlIGVsZW1lbnQncyBpbm5lckhUTUwqL1xuICAgIGh0bWwoKTogc3RyaW5nO1xuICAgIGh0bWwoaHRtbD8pIHtcbiAgICAgICAgaWYgKCBodG1sID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLmlubmVySFRNTDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqU2V0IHRoZSBlbGVtZW50J3MgaW5uZXJUZXh0Ki9cbiAgICB0ZXh0KHR4dDogc3RyaW5nIHwgbnVtYmVyKTogdGhpcztcbiAgICAvKipHZXQgdGhlIGVsZW1lbnQncyBpbm5lclRleHQqL1xuICAgIHRleHQoKTogc3RyaW5nO1xuICAgIHRleHQodHh0Pykge1xuICAgICAgICBpZiAoIHR4dCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5pbm5lclRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmUuaW5uZXJUZXh0ID0gdHh0O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qKlNldCB0aGUgaWQgb2YgdGhlIGVsZW1lbnQqL1xuICAgIGlkKGlkOiBzdHJpbmcpOiB0aGlzO1xuICAgIC8qKkdldCB0aGUgaWQgb2YgdGhlIGVsZW1lbnQqL1xuICAgIGlkKCk6IHN0cmluZztcbiAgICBpZChpZD8pIHtcbiAgICAgICAgaWYgKCBpZCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZS5pZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZS5pZCA9IGlkO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqRm9yIGVhY2ggYHs8c3R5bGVBdHRyPjogPHN0eWxlVmFsPn1gIHBhaXIsIHNldCB0aGUgYHN0eWxlW3N0eWxlQXR0cl1gIHRvIGBzdHlsZVZhbGAuKi9cbiAgICBjc3MoY3NzOiBQYXJ0aWFsPENzc09wdGlvbnM+KTogdGhpc1xuICAgIC8qKkdldCBgc3R5bGVbY3NzXWAqL1xuICAgIGNzcyhjc3M6IHN0cmluZyk6IHN0cmluZ1xuICAgIGNzcyhjc3MpIHtcbiAgICAgICAgaWYgKCB0eXBlb2YgY3NzID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmUuc3R5bGVbY3NzXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoIGxldCBbIHN0eWxlQXR0ciwgc3R5bGVWYWwgXSBvZiBlbnVtZXJhdGUoY3NzKSApXG4gICAgICAgICAgICAgICAgdGhpcy5lLnN0eWxlWzxzdHJpbmc+IHN0eWxlQXR0cl0gPSBzdHlsZVZhbDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlJlbW92ZSB0aGUgdmFsdWUgb2YgdGhlIHBhc3NlZCBzdHlsZSBwcm9wZXJ0aWVzKi9cbiAgICB1bmNzcyguLi5yZW1vdmVQcm9wczogKGtleW9mIENzc09wdGlvbnMpW10pOiB0aGlzIHtcbiAgICAgICAgbGV0IGNzcyA9IHt9O1xuICAgICAgICBmb3IgKCBsZXQgcHJvcCBvZiByZW1vdmVQcm9wcyApXG4gICAgICAgICAgICBjc3NbcHJvcF0gPSAnJztcbiAgICAgICAgcmV0dXJuIHRoaXMuY3NzKGNzcyk7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBpcyhlbGVtZW50OiBCZXR0ZXJIVE1MRWxlbWVudCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2lzL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIik7XG4gICAgfVxuICAgIFxuICAgIC8qXG4gICAgIGFuaW1hdGUob3B0czogQW5pbWF0ZU9wdGlvbnMpIHtcbiAgICAgLy8gc2VlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvQ1NTX0FuaW1hdGlvbnMvVGlwc1xuICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgICB9XG4gICAgICovXG4gICAgXG4gICAgLy8gKioqICBDbGFzc2VzXG4gICAgLyoqYC5jbGFzc05hbWUgPSBjbHNgKi9cbiAgICBjbGFzcyhjbHM6IHN0cmluZyk6IHRoaXM7XG4gICAgLyoqUmV0dXJuIHRoZSBmaXJzdCBjbGFzcyB0aGF0IG1hdGNoZXMgYGNsc2AgcHJlZGljYXRlLiovXG4gICAgY2xhc3MoY2xzOiBUUmV0dXJuQm9vbGVhbik6IHN0cmluZztcbiAgICAvKipSZXR1cm4gYSBzdHJpbmcgYXJyYXkgb2YgdGhlIGVsZW1lbnQncyBjbGFzc2VzIChub3QgYSBjbGFzc0xpc3QpKi9cbiAgICBjbGFzcygpOiBzdHJpbmdbXTtcbiAgICBjbGFzcyhjbHM/KSB7XG4gICAgICAgIGlmICggY2xzID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmUuY2xhc3NMaXN0KTtcbiAgICAgICAgfSBlbHNlIGlmICggaXNGdW5jdGlvbihjbHMpICkge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5lLmNsYXNzTGlzdCkuZmluZChjbHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCB0aGlzLl9pc1N2ZyApIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgLy8gbm9pbnNwZWN0aW9uIEpTQ29uc3RhbnRSZWFzc2lnbm1lbnRcbiAgICAgICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0ID0gWyBjbHMgXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lLmNsYXNzTmFtZSA9IGNscztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGFkZENsYXNzKGNsczogc3RyaW5nLCAuLi5jbHNlczogc3RyaW5nW10pOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5hZGQoY2xzKTtcbiAgICAgICAgZm9yICggbGV0IGMgb2YgY2xzZXMgKVxuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5hZGQoYyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICByZW1vdmVDbGFzcyhjbHM6IFRSZXR1cm5Cb29sZWFuKTogdGhpcztcbiAgICByZW1vdmVDbGFzcyhjbHM6IHN0cmluZywgLi4uY2xzZXM6IHN0cmluZ1tdKTogdGhpcztcbiAgICByZW1vdmVDbGFzcyhjbHMsIC4uLmNsc2VzKSB7XG4gICAgICAgIGlmICggaXNGdW5jdGlvbjxib29sZWFuPihjbHMpICkge1xuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5jbGFzcyhjbHMpKTtcbiAgICAgICAgICAgIGlmICggYm9vbChjbHNlcykgKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybigncmVtb3ZlQ2xhc3MsIGNscyBpcyBUUmV0dXJuQm9vbGVhbiwgZ290IC4uLmNsc2VzIGJ1dCBzaG91bGRudCBoYXZlJylcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZW1vdmUoY2xzKTtcbiAgICAgICAgICAgIGZvciAoIGxldCBjIG9mIGNsc2VzIClcbiAgICAgICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcmVwbGFjZUNsYXNzKG9sZFRva2VuOiBUUmV0dXJuQm9vbGVhbiwgbmV3VG9rZW46IHN0cmluZyk6IHRoaXM7XG4gICAgcmVwbGFjZUNsYXNzKG9sZFRva2VuOiBzdHJpbmcsIG5ld1Rva2VuOiBzdHJpbmcpOiB0aGlzXG4gICAgcmVwbGFjZUNsYXNzKG9sZFRva2VuLCBuZXdUb2tlbikge1xuICAgICAgICBpZiAoIGlzRnVuY3Rpb248Ym9vbGVhbj4ob2xkVG9rZW4pICkge1xuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC5yZXBsYWNlKHRoaXMuY2xhc3Mob2xkVG9rZW4pLCBuZXdUb2tlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnJlcGxhY2Uob2xkVG9rZW4sIG5ld1Rva2VuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgdG9nZ2xlQ2xhc3MoY2xzOiBUUmV0dXJuQm9vbGVhbiwgZm9yY2U/OiBib29sZWFuKTogdGhpc1xuICAgIHRvZ2dsZUNsYXNzKGNsczogc3RyaW5nLCBmb3JjZT86IGJvb2xlYW4pOiB0aGlzXG4gICAgdG9nZ2xlQ2xhc3MoY2xzLCBmb3JjZSkge1xuICAgICAgICBpZiAoIGlzRnVuY3Rpb248Ym9vbGVhbj4oY2xzKSApXG4gICAgICAgICAgICB0aGlzLmUuY2xhc3NMaXN0LnRvZ2dsZSh0aGlzLmNsYXNzKGNscyksIGZvcmNlKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5lLmNsYXNzTGlzdC50b2dnbGUoY2xzLCBmb3JjZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipSZXR1cm5zIGB0aGlzLmUuY2xhc3NMaXN0LmNvbnRhaW5zKGNscylgICovXG4gICAgaGFzQ2xhc3MoY2xzOiBzdHJpbmcpOiBib29sZWFuXG4gICAgLyoqUmV0dXJucyB3aGV0aGVyIGB0aGlzYCBoYXMgYSBjbGFzcyB0aGF0IG1hdGNoZXMgcGFzc2VkIGZ1bmN0aW9uICovXG4gICAgaGFzQ2xhc3MoY2xzOiBUUmV0dXJuQm9vbGVhbik6IGJvb2xlYW5cbiAgICBoYXNDbGFzcyhjbHMpIHtcbiAgICAgICAgaWYgKCBpc0Z1bmN0aW9uPGJvb2xlYW4+KGNscykgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbGFzcyhjbHMpICE9PSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLmNsYXNzTGlzdC5jb250YWlucyhjbHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vICoqKiAgTm9kZXNcbiAgICAvKipJbnNlcnQgYXQgbGVhc3Qgb25lIGBub2RlYCBqdXN0IGFmdGVyIGB0aGlzYC4gQW55IGBub2RlYCBjYW4gYmUgZWl0aGVyIGBCZXR0ZXJIVE1MRWxlbWVudGBzIG9yIHZhbmlsbGEgYE5vZGVgLiovXG4gICAgYWZ0ZXIoLi4ubm9kZXM6IEFycmF5PEJldHRlckhUTUxFbGVtZW50IHwgTm9kZT4pOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IG5vZGUgb2Ygbm9kZXMgKSB7XG4gICAgICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICAgICAgdGhpcy5lLmFmdGVyKG5vZGUuZSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5lLmFmdGVyKG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipJbnNlcnQgYHRoaXNgIGp1c3QgYWZ0ZXIgYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9yIGEgdmFuaWxsYSBgTm9kZWAuKi9cbiAgICBpbnNlcnRBZnRlcihub2RlOiBCZXR0ZXJIVE1MRWxlbWVudCB8IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgIG5vZGUuZS5hZnRlcih0aGlzLmUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBub2RlLmFmdGVyKHRoaXMuZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipJbnNlcnQgYXQgbGVhc3Qgb25lIGBub2RlYCBhZnRlciB0aGUgbGFzdCBjaGlsZCBvZiBgdGhpc2AuXG4gICAgICogQW55IGBub2RlYCBjYW4gYmUgZWl0aGVyIGEgYEJldHRlckhUTUxFbGVtZW50YCwgYSB2YW5pbGxhIGBOb2RlYCxcbiAgICAgKiBhIGB7c29tZUtleTogQmV0dGVySFRNTEVsZW1lbnR9YCBwYWlycyBvYmplY3QsIG9yIGEgYFtzb21lS2V5LCBCZXR0ZXJIVE1MRWxlbWVudF1gIHR1cGxlLiovXG4gICAgYXBwZW5kKC4uLm5vZGVzOiBBcnJheTxCZXR0ZXJIVE1MRWxlbWVudCB8IE5vZGUgfCBUTWFwPEJldHRlckhUTUxFbGVtZW50PiB8IFsgc3RyaW5nLCBCZXR0ZXJIVE1MRWxlbWVudCBdPik6IHRoaXMge1xuICAgICAgICBmb3IgKCBsZXQgbm9kZSBvZiBub2RlcyApIHtcbiAgICAgICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgICAgICB0aGlzLmUuYXBwZW5kKG5vZGUuZSk7XG4gICAgICAgICAgICBlbHNlIGlmICggbm9kZSBpbnN0YW5jZW9mIE5vZGUgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5hcHBlbmQobm9kZSk7XG4gICAgICAgICAgICBlbHNlIGlmICggQXJyYXkuaXNBcnJheShub2RlKSApXG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZUFwcGVuZChbIG5vZGUgXSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZUFwcGVuZChub2RlKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipBcHBlbmQgYHRoaXNgIHRvIGEgYEJldHRlckhUTUxFbGVtZW50YCBvciBhIHZhbmlsbGEgYE5vZGVgKi9cbiAgICBhcHBlbmRUbyhub2RlOiBCZXR0ZXJIVE1MRWxlbWVudCB8IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgIG5vZGUuZS5hcHBlbmQodGhpcy5lKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbm9kZS5hcHBlbmQodGhpcy5lKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICAvKipJbnNlcnQgYXQgbGVhc3Qgb25lIGBub2RlYCBqdXN0IGJlZm9yZSBgdGhpc2AuIEFueSBgbm9kZWAgY2FuIGJlIGVpdGhlciBgQmV0dGVySFRNTEVsZW1lbnRgcyBvciB2YW5pbGxhIGBOb2RlYC4qL1xuICAgIGJlZm9yZSguLi5ub2RlczogQXJyYXk8QmV0dGVySFRNTEVsZW1lbnQgfCBOb2RlPik6IHRoaXMge1xuICAgICAgICBmb3IgKCBsZXQgbm9kZSBvZiBub2RlcyApIHtcbiAgICAgICAgICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50IClcbiAgICAgICAgICAgICAgICB0aGlzLmUuYmVmb3JlKG5vZGUuZSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5lLmJlZm9yZShub2RlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqSW5zZXJ0IGB0aGlzYCBqdXN0IGJlZm9yZSBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgb3IgYSB2YW5pbGxhIGBOb2RlYHMuKi9cbiAgICBpbnNlcnRCZWZvcmUobm9kZTogQmV0dGVySFRNTEVsZW1lbnQgfCBIVE1MRWxlbWVudCk6IHRoaXMge1xuICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApXG4gICAgICAgICAgICBub2RlLmUuYmVmb3JlKHRoaXMuZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5vZGUuYmVmb3JlKHRoaXMuZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICByZXBsYWNlQ2hpbGQobmV3Q2hpbGQ6IE5vZGUsIG9sZENoaWxkOiBOb2RlKTogdGhpcztcbiAgICByZXBsYWNlQ2hpbGQobmV3Q2hpbGQ6IEJldHRlckhUTUxFbGVtZW50LCBvbGRDaGlsZDogQmV0dGVySFRNTEVsZW1lbnQpOiB0aGlzO1xuICAgIHJlcGxhY2VDaGlsZChuZXdDaGlsZCwgb2xkQ2hpbGQpIHtcbiAgICAgICAgdGhpcy5lLnJlcGxhY2VDaGlsZChuZXdDaGlsZCwgb2xkQ2hpbGQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBfY2FjaGUoa2V5OiBzdHJpbmcsIGNoaWxkOiBCZXR0ZXJIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzW2tleV0gPSBjaGlsZDtcbiAgICAgICAgdGhpcy5fY2FjaGVkQ2hpbGRyZW5ba2V5XSA9IGNoaWxkO1xuICAgIH1cbiAgICBcbiAgICAvKipGb3IgZWFjaCBgW2tleSwgY2hpbGRdYCBwYWlyLCBgYXBwZW5kKGNoaWxkKWAgYW5kIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLiAqL1xuICAgIGNhY2hlQXBwZW5kKGtleUNoaWxkUGFpcnM6IFRNYXA8QmV0dGVySFRNTEVsZW1lbnQ+KTogdGhpc1xuICAgIC8qKkZvciBlYWNoIGBba2V5LCBjaGlsZF1gIHR1cGxlLCBgYXBwZW5kKGNoaWxkKWAgYW5kIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLiAqL1xuICAgIGNhY2hlQXBwZW5kKGtleUNoaWxkUGFpcnM6IFsgc3RyaW5nLCBCZXR0ZXJIVE1MRWxlbWVudCBdW10pOiB0aGlzXG4gICAgY2FjaGVBcHBlbmQoa2V5Q2hpbGRQYWlycykge1xuICAgICAgICBjb25zdCBfY2FjaGVBcHBlbmQgPSAoX2tleTogc3RyaW5nLCBfY2hpbGQ6IEJldHRlckhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFwcGVuZChfY2hpbGQpO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGUoX2tleSwgX2NoaWxkKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCBBcnJheS5pc0FycmF5KGtleUNoaWxkUGFpcnMpICkge1xuICAgICAgICAgICAgZm9yICggbGV0IFsga2V5LCBjaGlsZCBdIG9mIGtleUNoaWxkUGFpcnMgKVxuICAgICAgICAgICAgICAgIF9jYWNoZUFwcGVuZChrZXksIGNoaWxkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoIGxldCBbIGtleSwgY2hpbGQgXSBvZiBlbnVtZXJhdGUoa2V5Q2hpbGRQYWlycykgKVxuICAgICAgICAgICAgICAgIF9jYWNoZUFwcGVuZChrZXksIGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqR2V0IGEgY2hpbGQgd2l0aCBgcXVlcnlTZWxlY3RvcmAgYW5kIHJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgb2YgaXQqL1xuICAgIGNoaWxkPEsgZXh0ZW5kcyBIVE1MVGFnPihzZWxlY3RvcjogSyk6IEJldHRlckhUTUxFbGVtZW50O1xuICAgIC8qKkdldCBhIGNoaWxkIHdpdGggYHF1ZXJ5U2VsZWN0b3JgIGFuZCByZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9mIGl0Ki9cbiAgICBjaGlsZChzZWxlY3Rvcjogc3RyaW5nKTogQmV0dGVySFRNTEVsZW1lbnQ7XG4gICAgY2hpbGQoc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCZXR0ZXJIVE1MRWxlbWVudCh7IGh0bWxFbGVtZW50IDogdGhpcy5lLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpIH0pO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipSZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIGxpc3Qgb2YgYWxsIGNoaWxkcmVuICovXG4gICAgY2hpbGRyZW4oKTogQmV0dGVySFRNTEVsZW1lbnRbXTtcbiAgICAvKipSZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIGxpc3Qgb2YgYWxsIGNoaWxkcmVuIHNlbGVjdGVkIGJ5IGBzZWxlY3RvcmAgKi9cbiAgICBjaGlsZHJlbjxLIGV4dGVuZHMgSFRNTFRhZz4oc2VsZWN0b3I6IEspOiBCZXR0ZXJIVE1MRWxlbWVudFtdO1xuICAgIC8qKlJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgbGlzdCBvZiBhbGwgY2hpbGRyZW4gc2VsZWN0ZWQgYnkgYHNlbGVjdG9yYCAqL1xuICAgIGNoaWxkcmVuKHNlbGVjdG9yOiBzdHJpbmcgfCBIVE1MVGFnKTogQmV0dGVySFRNTEVsZW1lbnRbXTtcbiAgICBjaGlsZHJlbihzZWxlY3Rvcj8pIHtcbiAgICAgICAgbGV0IGNoaWxkcmVuVmFuaWxsYTtcbiAgICAgICAgbGV0IGNoaWxkcmVuQ29sbGVjdGlvbjtcbiAgICAgICAgaWYgKCBzZWxlY3RvciA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgY2hpbGRyZW5Db2xsZWN0aW9uID0gdGhpcy5lLmNoaWxkcmVuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hpbGRyZW5Db2xsZWN0aW9uID0gdGhpcy5lLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkcmVuVmFuaWxsYSA9IDxIVE1MRWxlbWVudFtdPiBBcnJheS5mcm9tKGNoaWxkcmVuQ29sbGVjdGlvbik7XG4gICAgICAgIGNvbnN0IHRvRWxlbSA9IChjOiBIVE1MRWxlbWVudCkgPT4gbmV3IEJldHRlckhUTUxFbGVtZW50KHsgaHRtbEVsZW1lbnQgOiBjIH0pO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW5WYW5pbGxhLm1hcCh0b0VsZW0pO1xuICAgIH1cbiAgICBcbiAgICBjbG9uZShkZWVwPzogYm9vbGVhbik6IEJldHRlckhUTUxFbGVtZW50IHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gbmV3IEJldHRlckhUTUxFbGVtZW50KHsgaHRtbEVsZW1lbnQgOiB0aGlzLmUuY2xvbmVOb2RlKGRlZXApIH0pO1xuICAgIH1cbiAgICBcbiAgICAvKipGb3IgZWFjaCBgW2tleSwgc2VsZWN0b3JdYCBwYWlyLCB3aGVyZSBgc2VsZWN0b3JgIGlzIGVpdGhlciBhbiBgSFRNTFRhZ2Agb3IgYSBgc3RyaW5nYCwgZ2V0IGB0aGlzLmNoaWxkKHNlbGVjdG9yKWAsIGFuZCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzaW5nIGBjYWNoZUNoaWxkcmVuYCBkaXJlY3RseVxuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oeyBpZDogJ25hdmJhcicgfSk7XG4gICAgICogbmF2YmFyLmNhY2hlQ2hpbGRyZW4oeyBob21lOiAnLm5hdmJhci1pdGVtLWhvbWUnLCBhYm91dDogJy5uYXZiYXItaXRlbS1hYm91dCcgfSk7XG4gICAgICogbmF2YmFyLmhvbWUudG9nZ2xlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBuYXZiYXIuYWJvdXQuY3NzKC4uLik7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgaW5kaXJlY3RseSB0aHJvdWdoIGBjaGlsZHJlbmAgY29uc3RydWN0b3Igb3B0aW9uXG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7IGlkOiAnbmF2YmFyJywgY2hpbGRyZW46IHsgaG9tZTogJy5uYXZiYXItaXRlbS1ob21lJywgYWJvdXQ6ICcubmF2YmFyLWl0ZW0tYWJvdXQnIH19KTtcbiAgICAgKiBuYXZiYXIuaG9tZS50b2dnbGVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAqIG5hdmJhci5hYm91dC5jc3MoLi4uKTtcbiAgICAgKiBAc2VlIHRoaXMuY2hpbGQqL1xuICAgIGNhY2hlQ2hpbGRyZW4ocXVlcnlNYXA6IFRNYXA8UXVlcnlTZWxlY3Rvcj4pOiB0aGlzXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIHNlbGVjdG9yXWAgcGFpciwgd2hlcmUgYHNlbGVjdG9yYCBpcyBhIHJlY3Vyc2l2ZSBge3N1YnNlbGVjdG9yOiBrZXlTZWxlY3Rvck9ian1gIG9iamVjdCxcbiAgICAgKiBleHRyYWN0IGB0aGlzLmNoaWxkKHN1YnNlbGVjdG9yKWAsIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLCB0aGVuIGNhbGwgYHRoaXNba2V5XS5jYWNoZUNoaWxkcmVuYCBwYXNzaW5nIHRoZSByZWN1cnNpdmUgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgYGNhY2hlQ2hpbGRyZW5gIGRpcmVjdGx5XG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7IGlkOiAnbmF2YmFyJyB9KTtcbiAgICAgKiBuYXZiYXIuY2FjaGVDaGlsZHJlbih7XG4gICAgICogICAgICBob21lOiB7XG4gICAgICogICAgICAgICAgJy5uYXZiYXItaXRlbS1ob21lJzoge1xuICAgICAqICAgICAgICAgICAgICBuZXdzOiAnLm5hdmJhci1zdWJpdGVtLW5ld3MsXG4gICAgICogICAgICAgICAgICAgIHN1cHBvcnQ6ICcubmF2YmFyLXN1Yml0ZW0tc3VwcG9ydCdcbiAgICAgKiAgICAgICAgICB9XG4gICAgICogICAgICB9XG4gICAgICogIH0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogbmF2YmFyLmhvbWUubmV3cy5jc3MoLi4uKTtcbiAgICAgKiBuYXZiYXIuaG9tZS5zdXBwb3J0LnBvaW50ZXJkb3duKC4uLik7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgaW5kaXJlY3RseSB0aHJvdWdoIGBjaGlsZHJlbmAgY29uc3RydWN0b3Igb3B0aW9uXG4gICAgICogY29uc3QgbmF2YmFyID0gZWxlbSh7cXVlcnk6ICcjbmF2YmFyJywgY2hpbGRyZW46IHtcbiAgICAgKiAgICAgIGhvbWU6IHtcbiAgICAgKiAgICAgICAgICAnLm5hdmJhci1pdGVtLWhvbWUnOiB7XG4gICAgICogICAgICAgICAgICAgIG5ld3M6ICcubmF2YmFyLXN1Yml0ZW0tbmV3cyxcbiAgICAgKiAgICAgICAgICAgICAgc3VwcG9ydDogJy5uYXZiYXItc3ViaXRlbS1zdXBwb3J0J1xuICAgICAqICAgICAgICAgIH1cbiAgICAgKiAgICAgIH1cbiAgICAgKiAgfX0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogbmF2YmFyLmhvbWUubmV3cy5jc3MoLi4uKTtcbiAgICAgKiBuYXZiYXIuaG9tZS5zdXBwb3J0LnBvaW50ZXJkb3duKC4uLik7XG4gICAgICogQHNlZSB0aGlzLmNoaWxkKi9cbiAgICBjYWNoZUNoaWxkcmVuKHJlY3Vyc2l2ZVF1ZXJ5TWFwOiBUUmVjTWFwPFF1ZXJ5U2VsZWN0b3I+KTogdGhpc1xuICAgIGNhY2hlQ2hpbGRyZW4oYmhlTWFwOiBUTWFwPEJldHRlckhUTUxFbGVtZW50Pik6IHRoaXNcbiAgICAvKipGb3IgZWFjaCBgW2tleSwgc2VsZWN0b3JdYCBwYWlyLCB3aGVyZSBgc2VsZWN0b3JgIGlzIGEgYEJldHRlckhUTUxFbGVtZW50YCwgc3RvcmUgaXQgaW4gYHRoaXNba2V5XWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgZGlyZWN0bHlcbiAgICAgKiBjb25zdCBob21lID0gZWxlbSh7IHF1ZXJ5OiAnLm5hdmJhci1pdGVtLWhvbWUnIH0pO1xuICAgICAqIGNvbnN0IG5hdmJhciA9IGVsZW0oeyBpZDogJ25hdmJhcicgfSk7XG4gICAgICogbmF2YmFyLmNhY2hlQ2hpbGRyZW4oeyBob21lIH0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBVc2luZyBgY2FjaGVDaGlsZHJlbmAgaW5kaXJlY3RseSB0aHJvdWdoIGBjaGlsZHJlbmAgY29uc3RydWN0b3Igb3B0aW9uXG4gICAgICogY29uc3QgaG9tZSA9IGVsZW0oeyBxdWVyeTogJy5uYXZiYXItaXRlbS1ob21lJyB9KTtcbiAgICAgKiBjb25zdCBuYXZiYXIgPSBlbGVtKHtpZDogJ25hdmJhcicsIGNoaWxkcmVuOiB7IGhvbWUgfX0pO1xuICAgICAqIG5hdmJhci5ob21lLnRvZ2dsZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogQHNlZSB0aGlzLmNoaWxkKi9cbiAgICBcbiAgICBjYWNoZUNoaWxkcmVuKHJlY3Vyc2l2ZUJIRU1hcDogVFJlY01hcDxCZXR0ZXJIVE1MRWxlbWVudD4pOiB0aGlzXG4gICAgLyoqa2V5OiBzdHJpbmcuIHZhbHVlOiBlaXRoZXIgXCJzZWxlY3RvciBzdHJpbmdcIiBPUiB7XCJzZWxlY3RvciBzdHJpbmdcIjogPHJlY3Vyc2UgZG93bj59Ki9cbiAgICBjYWNoZUNoaWxkcmVuKG1hcCkge1xuICAgICAgICBmb3IgKCBsZXQgWyBrZXksIHZhbHVlIF0gb2YgZW51bWVyYXRlKG1hcCkgKSB7XG4gICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgICAgICAgICAgIGlmICggaXNPYmplY3QodmFsdWUpICkge1xuICAgICAgICAgICAgICAgIGlmICggdmFsdWUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoa2V5LCB2YWx1ZSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBlbnRyaWVzWzFdICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYGNhY2hlQ2hpbGRyZW4oKSByZWNlaXZlZCByZWN1cnNpdmUgb2JqIHdpdGggbW9yZSB0aGFuIDEgc2VsZWN0b3IgZm9yIGEga2V5LiBVc2luZyBvbmx5IDB0aCBzZWxlY3RvcmAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm11bHRpcGxlIHNlbGVjdG9yc1wiIDogZW50cmllcy5tYXAoZSA9PiBlWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBvbmx5IGZpcnN0IGJlY2F1c2UgMToxIGZvciBrZXk6c2VsZWN0b3IuXG4gICAgICAgICAgICAgICAgICAgIC8vIChpZSBjYW4ndCBkbyB7cmlnaHQ6IHsucmlnaHQ6IHsuLi59LCAucmlnaHQyOiB7Li4ufX0pXG4gICAgICAgICAgICAgICAgICAgIGxldCBbIHNlbGVjdG9yLCBvYmogXSA9IGVudHJpZXNbMF07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlKGtleSwgdGhpcy5jaGlsZChzZWxlY3RvcikpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2tleV0uY2FjaGVDaGlsZHJlbihvYmopXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShrZXksIHRoaXMuY2hpbGQodmFsdWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBjYWNoZUNoaWxkcmVuLCBiYWQgdmFsdWUgdHlwZTogXCIke3R5cGV9XCIuIGtleTogXCIke2tleX1cIiwgdmFsdWU6IFwiJHt2YWx1ZX1cIi4gbWFwOmAsIG1hcCwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqUmVtb3ZlIGFsbCBjaGlsZHJlbiBmcm9tIERPTSovXG4gICAgZW1wdHkoKTogdGhpcyB7XG4gICAgICAgIC8vIFRPRE86IGlzIHRoaXMgZmFzdGVyIHRoYW4gaW5uZXJIVE1MID0gXCJcIj9cbiAgICAgICAgd2hpbGUgKCB0aGlzLmUuZmlyc3RDaGlsZCApXG4gICAgICAgICAgICB0aGlzLmUucmVtb3ZlQ2hpbGQodGhpcy5lLmZpcnN0Q2hpbGQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqUmVtb3ZlIGVsZW1lbnQgZnJvbSBET00qL1xuICAgIHJlbW92ZSgpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lLnJlbW92ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ETzogcmVjdXJzaXZlbHkgeWllbGQgY2hpbGRyZW5cbiAgICAvLyAgKHVubGlrZSAuY2hpbGRyZW4oKSwgdGhpcyBkb2Vzbid0IHJldHVybiBvbmx5IHRoZSBmaXJzdCBsZXZlbClcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgZmluZCgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9maW5kL1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZpcnN0KCkge1xuICAgICAgICAvLyBodHRwczovL2FwaS5qcXVlcnkuY29tL2ZpcnN0L1xuICAgICAgICAvLyB0aGlzLmUuZmlyc3RDaGlsZFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGxhc3QoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vbGFzdC9cbiAgICAgICAgLy8gdGhpcy5lLmxhc3RDaGlsZFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIG5leHQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbm90KCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHBhcmVudCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBwYXJlbnRzKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIilcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLy8gKioqICBFdmVudHNcbiAgICBcbiAgICBvbihldlR5cGVGblBhaXJzOiBURXZlbnRGdW5jdGlvbk1hcDxURXZlbnQ+LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IFsgZXZUeXBlLCBldkZuIF0gb2YgZW51bWVyYXRlKGV2VHlwZUZuUGFpcnMpICkge1xuICAgICAgICAgICAgY29uc3QgX2YgPSBmdW5jdGlvbiBfZihldnQpIHtcbiAgICAgICAgICAgICAgICBldkZuKGV2dCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5lLmFkZEV2ZW50TGlzdGVuZXIoZXZUeXBlLCBfZiwgb3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbZXZUeXBlXSA9IF9mO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBvbmUoZXZUeXBlOiBURXZlbnQsIGxpc3RlbmVyOiBGdW5jdGlvblJlY2lldmVzRXZlbnQ8VEV2ZW50Piwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIGNvbnN0IGV2VHlwZUZuUGFpcnMgPSB7fTtcbiAgICAgICAgZXZUeXBlRm5QYWlyc1tldlR5cGVdID0gbGlzdGVuZXI7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zID09PSB1bmRlZmluZWQgPyB7IG9uY2UgOiB0cnVlIH0gOiB7IC4uLm9wdGlvbnMsIG9uY2UgOiB0cnVlIH07XG4gICAgICAgIHJldHVybiB0aGlzLm9uKGV2VHlwZUZuUGFpcnMsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICAvKipSZW1vdmUgYGV2ZW50YCBmcm9tIHdyYXBwZWQgZWxlbWVudCdzIGV2ZW50IGxpc3RlbmVycywgYnV0IGtlZXAgdGhlIHJlbW92ZWQgbGlzdGVuZXIgaW4gY2FjaGUuXG4gICAgICogVGhpcyBpcyB1c2VmdWwgZm9yIGxhdGVyIHVuYmxvY2tpbmcqL1xuICAgIGJsb2NrTGlzdGVuZXIoZXZlbnQ6IFRFdmVudCkge1xuICAgICAgICBsZXQgbGlzdGVuZXIgPSB0aGlzLl9saXN0ZW5lcnNbZXZlbnRdO1xuICAgICAgICBpZiAoIGxpc3RlbmVyID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKGBibG9ja0xpc3RlbmVyKGV2ZW50KTogdGhpcy5fbGlzdGVuZXJzW2V2ZW50XSBpcyB1bmRlZmluZWQuIGV2ZW50OmAsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgdW5ibG9ja0xpc3RlbmVyKGV2ZW50OiBURXZlbnQpIHtcbiAgICAgICAgbGV0IGxpc3RlbmVyID0gdGhpcy5fbGlzdGVuZXJzW2V2ZW50XTtcbiAgICAgICAgaWYgKCBsaXN0ZW5lciA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihgdW5ibG9ja0xpc3RlbmVyKGV2ZW50KTogdGhpcy5fbGlzdGVuZXJzW2V2ZW50XSBpcyB1bmRlZmluZWQuIGV2ZW50OmAsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmUuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLypcbiAgICAgQ2hyb25vbG9neTpcbiAgICAgbW91c2Vkb3duICAgICAgdG91Y2hzdGFydFx0cG9pbnRlcmRvd25cbiAgICAgbW91c2VlbnRlclx0XHQgICAgICAgICAgICBwb2ludGVyZW50ZXJcbiAgICAgbW91c2VsZWF2ZVx0XHQgICAgICAgICAgICBwb2ludGVybGVhdmVcbiAgICAgbW91c2Vtb3ZlICAgICAgdG91Y2htb3ZlXHRwb2ludGVybW92ZVxuICAgICBtb3VzZW91dFx0XHQgICAgICAgICAgICBwb2ludGVyb3V0XG4gICAgIG1vdXNlb3Zlclx0XHQgICAgICAgICAgICBwb2ludGVyb3ZlclxuICAgICBtb3VzZXVwXHQgICAgdG91Y2hlbmQgICAgcG9pbnRlcnVwXG4gICAgICovXG4gICAgLyoqIEFkZCBhIGB0b3VjaHN0YXJ0YCBldmVudCBsaXN0ZW5lci4gVGhpcyBpcyB0aGUgZmFzdCBhbHRlcm5hdGl2ZSB0byBgY2xpY2tgIGxpc3RlbmVycyBmb3IgbW9iaWxlIChubyAzMDBtcyB3YWl0KS4gKi9cbiAgICB0b3VjaHN0YXJ0KGZuOiAoZXY6IFRvdWNoRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIHRoaXMuZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24gX2YoZXY6IFRvdWNoRXZlbnQpIHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7IC8vIG90aGVyd2lzZSBcInRvdWNobW92ZVwiIGlzIHRyaWdnZXJlZFxuICAgICAgICAgICAgZm4oZXYpO1xuICAgICAgICAgICAgaWYgKCBvcHRpb25zICYmIG9wdGlvbnMub25jZSApIC8vIFRPRE86IG1heWJlIG5hdGl2ZSBvcHRpb25zLm9uY2UgaXMgZW5vdWdoXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgX2YpO1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgLy8gVE9ETzogdGhpcy5fbGlzdGVuZXJzLCBvciB1c2UgdGhpcy5vbihcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHBvaW50ZXJlbnRlcihmbjogKGV2ZW50OiBQb2ludGVyRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uKHsgcG9pbnRlcmVudGVyIDogZm4gfSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIC8qKiBBZGQgYSBgcG9pbnRlcmRvd25gIGV2ZW50IGxpc3RlbmVyIGlmIGJyb3dzZXIgc3VwcG9ydHMgYHBvaW50ZXJkb3duYCwgZWxzZSBzZW5kIGBtb3VzZWRvd25gIChzYWZhcmkpLiAqL1xuICAgIHBvaW50ZXJkb3duKGZuOiAoZXZlbnQ6IFBvaW50ZXJFdmVudCB8IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIFxuICAgICAgICBsZXQgYWN0aW9uO1xuICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBQb2ludGVyRXZlbnQgZXhpc3RzIGFuZCBzdG9yZSBpbiB2YXIgb3V0c2lkZSBjbGFzc1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYWN0aW9uID0gd2luZG93LlBvaW50ZXJFdmVudCA/ICdwb2ludGVyZG93bicgOiAnbW91c2Vkb3duJzsgLy8gc2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBwb2ludGVyZG93blxuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIGFjdGlvbiA9ICdtb3VzZWRvd24nXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgX2YgPSBmdW5jdGlvbiBfZihldjogUG9pbnRlckV2ZW50IHwgTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGZuKGV2KTtcbiAgICAgICAgICAgIGlmICggb3B0aW9ucyAmJiBvcHRpb25zLm9uY2UgKSAvLyBUT0RPOiBtYXliZSBuYXRpdmUgb3B0aW9ucy5vbmNlIGlzIGVub3VnaFxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihhY3Rpb24sIF9mKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5lLmFkZEV2ZW50TGlzdGVuZXIoYWN0aW9uLCBfZiwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVycy5wb2ludGVyZG93biA9IF9mO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBjbGljayBvZiB0aGUgZWxlbWVudC4gVXNlZnVsIGZvciBgPGE+YCBlbGVtZW50cy4qL1xuICAgIGNsaWNrKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYGNsaWNrYCBldmVudCBsaXN0ZW5lci4gWW91IHNob3VsZCBwcm9iYWJseSB1c2UgYHBvaW50ZXJkb3duKClgIGlmIG9uIGRlc2t0b3AsIG9yIGB0b3VjaHN0YXJ0KClgIGlmIG9uIG1vYmlsZS4qL1xuICAgIGNsaWNrKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBjbGljayhmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuZS5jbGljaygpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGNsaWNrIDogZm4gfSwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqQmx1ciAodW5mb2N1cykgdGhlIGVsZW1lbnQuKi9cbiAgICBibHVyKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYGJsdXJgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBibHVyKGZuOiAoZXZlbnQ6IEZvY3VzRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBibHVyKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgdGhpcy5lLmJsdXIoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBibHVyIDogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipGb2N1cyB0aGUgZWxlbWVudC4qL1xuICAgIGZvY3VzKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYGZvY3VzYCBldmVudCBsaXN0ZW5lciovXG4gICAgZm9jdXMoZm46IChldmVudDogRm9jdXNFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIGZvY3VzKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgdGhpcy5lLmZvY3VzKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgZm9jdXMgOiBmbiB9LCBvcHRpb25zKVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkFkZCBhIGBjaGFuZ2VgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBjaGFuZ2UoZm46IChldmVudDogRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uKHsgY2hhbmdlIDogZm4gfSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIFxuICAgIC8qKkFkZCBhIGBjb250ZXh0bWVudWAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGNvbnRleHRtZW51KGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uKHsgY29udGV4dG1lbnUgOiBmbiB9LCBvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBkb3VibGUgY2xpY2sgb2YgdGhlIGVsZW1lbnQuKi9cbiAgICBkYmxjbGljaygpOiB0aGlzO1xuICAgIC8qKkFkZCBhIGBkYmxjbGlja2AgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGRibGNsaWNrKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBkYmxjbGljayhmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGNvbnN0IGRibGNsaWNrID0gbmV3IE1vdXNlRXZlbnQoJ2RibGNsaWNrJywge1xuICAgICAgICAgICAgICAgICd2aWV3JyA6IHdpbmRvdyxcbiAgICAgICAgICAgICAgICAnYnViYmxlcycgOiB0cnVlLFxuICAgICAgICAgICAgICAgICdjYW5jZWxhYmxlJyA6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5lLmRpc3BhdGNoRXZlbnQoZGJsY2xpY2spO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGRibGNsaWNrIDogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipTaW11bGF0ZSBhIG1vdXNlZW50ZXIgZXZlbnQgdG8gdGhlIGVsZW1lbnQuKi9cbiAgICBtb3VzZWVudGVyKCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYG1vdXNlZW50ZXJgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBtb3VzZWVudGVyKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBtb3VzZWVudGVyKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgLy8gbW91c2VvdmVyOiBhbHNvIGNoaWxkIGVsZW1lbnRzXG4gICAgICAgIC8vIG1vdXNlZW50ZXI6IG9ubHkgYm91bmQgZWxlbWVudFxuICAgICAgICBcbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgY29uc3QgbW91c2VlbnRlciA9IG5ldyBNb3VzZUV2ZW50KCdtb3VzZWVudGVyJywge1xuICAgICAgICAgICAgICAgICd2aWV3JyA6IHdpbmRvdyxcbiAgICAgICAgICAgICAgICAnYnViYmxlcycgOiB0cnVlLFxuICAgICAgICAgICAgICAgICdjYW5jZWxhYmxlJyA6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5lLmRpc3BhdGNoRXZlbnQobW91c2VlbnRlcik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgbW91c2VlbnRlciA6IGZuIH0sIG9wdGlvbnMpXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBrZXlkb3duIGV2ZW50IHRvIHRoZSBlbGVtZW50LiovXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGtleWRvd24oKTogdGhpcztcbiAgICAvKipBZGQgYSBga2V5ZG93bmAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGtleWRvd24oZm46IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIGtleWRvd24oZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoIGZuID09PSB1bmRlZmluZWQgKSB0aHJvdyBuZXcgRXJyb3IoXCJOT1QgSU1QTEVNRU5URURcIik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsga2V5ZG93biA6IGZuIH0sIG9wdGlvbnMpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBrZXl1cCgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXl1cC9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBrZXlwcmVzcygpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXlwcmVzcy9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBob3ZlcigpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9ob3Zlci9cbiAgICAgICAgLy8gYmluZHMgdG8gYm90aCBtb3VzZWVudGVyIGFuZCBtb3VzZWxlYXZlXG4gICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE3NTg5NDIwL3doZW4tdG8tY2hvb3NlLW1vdXNlb3Zlci1hbmQtaG92ZXItZnVuY3Rpb25cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBtb3VzZWRvd24oKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbW91c2VsZWF2ZSgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXlwcmVzcy9cbiAgICAgICAgLy9tb3VzZWxlYXZlIGFuZCBtb3VzZW91dCBhcmUgc2ltaWxhciBidXQgZGlmZmVyIGluIHRoYXQgbW91c2VsZWF2ZSBkb2VzIG5vdCBidWJibGUgYW5kIG1vdXNlb3V0IGRvZXMuXG4gICAgICAgIC8vIFRoaXMgbWVhbnMgdGhhdCBtb3VzZWxlYXZlIGlzIGZpcmVkIHdoZW4gdGhlIHBvaW50ZXIgaGFzIGV4aXRlZCB0aGUgZWxlbWVudCBhbmQgYWxsIG9mIGl0cyBkZXNjZW5kYW50cyxcbiAgICAgICAgLy8gd2hlcmVhcyBtb3VzZW91dCBpcyBmaXJlZCB3aGVuIHRoZSBwb2ludGVyIGxlYXZlcyB0aGUgZWxlbWVudCBvciBsZWF2ZXMgb25lIG9mIHRoZSBlbGVtZW50J3MgZGVzY2VuZGFudHNcbiAgICAgICAgLy8gKGV2ZW4gaWYgdGhlIHBvaW50ZXIgaXMgc3RpbGwgd2l0aGluIHRoZSBlbGVtZW50KS5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBtb3VzZW1vdmUoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20va2V5cHJlc3MvXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKVxuICAgIH1cbiAgICBcbiAgICAvKipTaW11bGF0ZSBhIG1vdXNlb3V0IGV2ZW50IHRvIHRoZSBlbGVtZW50LiovXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIG1vdXNlb3V0KCk6IHRoaXM7XG4gICAgLyoqQWRkIGEgYG1vdXNlb3V0YCBldmVudCBsaXN0ZW5lciovXG4gICAgbW91c2VvdXQoZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuICAgIG1vdXNlb3V0KGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgLy9tb3VzZWxlYXZlIGFuZCBtb3VzZW91dCBhcmUgc2ltaWxhciBidXQgZGlmZmVyIGluIHRoYXQgbW91c2VsZWF2ZSBkb2VzIG5vdCBidWJibGUgYW5kIG1vdXNlb3V0IGRvZXMuXG4gICAgICAgIC8vIFRoaXMgbWVhbnMgdGhhdCBtb3VzZWxlYXZlIGlzIGZpcmVkIHdoZW4gdGhlIHBvaW50ZXIgaGFzIGV4aXRlZCB0aGUgZWxlbWVudCBhbmQgYWxsIG9mIGl0cyBkZXNjZW5kYW50cyxcbiAgICAgICAgLy8gd2hlcmVhcyBtb3VzZW91dCBpcyBmaXJlZCB3aGVuIHRoZSBwb2ludGVyIGxlYXZlcyB0aGUgZWxlbWVudCBvciBsZWF2ZXMgb25lIG9mIHRoZSBlbGVtZW50J3MgZGVzY2VuZGFudHNcbiAgICAgICAgLy8gKGV2ZW4gaWYgdGhlIHBvaW50ZXIgaXMgc3RpbGwgd2l0aGluIHRoZSBlbGVtZW50KS5cbiAgICAgICAgaWYgKCBmbiA9PT0gdW5kZWZpbmVkICkgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IG1vdXNlb3V0IDogZm4gfSwgb3B0aW9ucylcbiAgICB9XG4gICAgXG4gICAgLyoqU2ltdWxhdGUgYSBtb3VzZW92ZXIgZXZlbnQgdG8gdGhlIGVsZW1lbnQuKi9cbiAgICBtb3VzZW92ZXIoKTogdGhpcztcbiAgICAvKipBZGQgYSBgbW91c2VvdmVyYCBldmVudCBsaXN0ZW5lciovXG4gICAgbW91c2VvdmVyKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcbiAgICBtb3VzZW92ZXIoZm4/LCBvcHRpb25zPykge1xuICAgICAgICAvLyBtb3VzZW92ZXI6IGFsc28gY2hpbGQgZWxlbWVudHNcbiAgICAgICAgLy8gbW91c2VlbnRlcjogb25seSBib3VuZCBlbGVtZW50XG4gICAgICAgIGlmICggZm4gPT09IHVuZGVmaW5lZCApIHRocm93IG5ldyBFcnJvcihcIk5PVCBJTVBMRU1FTlRFRFwiKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBtb3VzZW92ZXIgOiBmbiB9LCBvcHRpb25zKVxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgbW91c2V1cCgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9rZXlwcmVzcy9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTk9UIElNUExFTUVOVEVEXCIpXG4gICAgfVxuICAgIFxuICAgIHRyYW5zZm9ybShvcHRpb25zOiBUcmFuc2Zvcm1PcHRpb25zKSB7XG4gICAgICAgIGxldCB0cmFuc2Zvcm06IHN0cmluZyA9ICcnO1xuICAgICAgICBmb3IgKCBsZXQgWyBrLCB2IF0gb2YgZW51bWVyYXRlKG9wdGlvbnMpICkge1xuICAgICAgICAgICAgdHJhbnNmb3JtICs9IGAke2t9KCR7dn0pIGBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uKHtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uZW5kIDogcmVzb2x2ZVxuICAgICAgICAgICAgfSwgeyBvbmNlIDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHRoaXMuY3NzKHsgdHJhbnNmb3JtIH0pXG4gICAgICAgIH0pXG4gICAgfVxuICAgIFxuICAgIC8qKiBSZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyIG9mIGBldmVudGAsIGlmIGV4aXN0cy4qL1xuICAgIG9mZihldmVudDogVEV2ZW50KTogdGhpcyB7XG4gICAgICAgIHRoaXMuZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCB0aGlzLl9saXN0ZW5lcnNbZXZlbnRdKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIGFsbE9mZigpOiB0aGlzIHtcbiAgICAgICAgZm9yICggbGV0IGV2ZW50IGluIHRoaXMuX2xpc3RlbmVycyApIHtcbiAgICAgICAgICAgIHRoaXMub2ZmKDxURXZlbnQ+IGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLy8gKioqICBBdHRyaWJ1dGVzXG4gICAgXG4gICAgLyoqIEZvciBlYWNoIGBbYXR0ciwgdmFsXWAgcGFpciwgYXBwbHkgYHNldEF0dHJpYnV0ZWAqL1xuICAgIGF0dHIoYXR0clZhbFBhaXJzOiBUTWFwPHN0cmluZz4pOiB0aGlzXG4gICAgLyoqIGFwcGx5IGBnZXRBdHRyaWJ1dGVgKi9cbiAgICBhdHRyKGF0dHJpYnV0ZU5hbWU6IHN0cmluZyk6IHN0cmluZ1xuICAgIGF0dHIoYXR0clZhbFBhaXJzKSB7XG4gICAgICAgIGlmICggdHlwZW9mIGF0dHJWYWxQYWlycyA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lLmdldEF0dHJpYnV0ZShhdHRyVmFsUGFpcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICggbGV0IFsgYXR0ciwgdmFsIF0gb2YgZW51bWVyYXRlKGF0dHJWYWxQYWlycykgKVxuICAgICAgICAgICAgICAgIHRoaXMuZS5zZXRBdHRyaWJ1dGUoYXR0ciwgdmFsKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKiBgcmVtb3ZlQXR0cmlidXRlYCAqL1xuICAgIHJlbW92ZUF0dHIocXVhbGlmaWVkTmFtZTogc3RyaW5nLCAuLi5xdWFsaWZpZWROYW1lczogc3RyaW5nW10pOiB0aGlzIHtcbiAgICAgICAgbGV0IF9yZW1vdmVBdHRyaWJ1dGU7XG4gICAgICAgIGlmICggdGhpcy5faXNTdmcgKVxuICAgICAgICAgICAgX3JlbW92ZUF0dHJpYnV0ZSA9IChxdWFsaWZpZWROYW1lKSA9PiB0aGlzLmUucmVtb3ZlQXR0cmlidXRlTlMoU1ZHX05TX1VSSSwgcXVhbGlmaWVkTmFtZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUgPSAocXVhbGlmaWVkTmFtZSkgPT4gdGhpcy5lLnJlbW92ZUF0dHJpYnV0ZShxdWFsaWZpZWROYW1lKTtcbiAgICAgICAgXG4gICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUocXVhbGlmaWVkTmFtZSk7XG4gICAgICAgIGZvciAoIGxldCBxbiBvZiBxdWFsaWZpZWROYW1lcyApXG4gICAgICAgICAgICBfcmVtb3ZlQXR0cmlidXRlKHFuKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKmBnZXRBdHRyaWJ1dGUoYGRhdGEtJHtrZXl9YClgLiBKU09OLnBhcnNlIGl0IGJ5IGRlZmF1bHQuKi9cbiAgICBkYXRhKGtleTogc3RyaW5nLCBwYXJzZTogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcgfCBUTWFwPHN0cmluZz4ge1xuICAgICAgICAvLyBUT0RPOiBqcXVlcnkgZG9lc24ndCBhZmZlY3QgZGF0YS0qIGF0dHJzIGluIERPTS4gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9kYXRhL1xuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5lLmdldEF0dHJpYnV0ZShgZGF0YS0ke2tleX1gKTtcbiAgICAgICAgaWYgKCBwYXJzZSA9PT0gdHJ1ZSApXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICB9XG4gICAgXG4gICAgLy8gKiogIEZhZGVcbiAgICBhc3luYyBmYWRlKGR1cjogbnVtYmVyLCB0bzogMCB8IDEpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgY29uc3Qgc3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lKTtcbiAgICAgICAgY29uc3QgdHJhbnNQcm9wID0gc3R5bGVzLnRyYW5zaXRpb25Qcm9wZXJ0eS5zcGxpdCgnLCAnKTtcbiAgICAgICAgY29uc3QgaW5kZXhPZk9wYWNpdHkgPSB0cmFuc1Byb3AuaW5kZXhPZignb3BhY2l0eScpO1xuICAgICAgICAvLyBjc3Mgb3BhY2l0eTowID0+IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTogMHNcbiAgICAgICAgLy8gY3NzIG9wYWNpdHk6NTAwbXMgPT4gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldOiAwLjVzXG4gICAgICAgIC8vIGNzcyBOTyBvcGFjaXR5ID0+IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTogdW5kZWZpbmVkXG4gICAgICAgIGlmICggaW5kZXhPZk9wYWNpdHkgIT09IC0xICkge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNEdXIgPSBzdHlsZXMudHJhbnNpdGlvbkR1cmF0aW9uLnNwbGl0KCcsICcpO1xuICAgICAgICAgICAgY29uc3Qgb3BhY2l0eVRyYW5zRHVyID0gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldO1xuICAgICAgICAgICAgY29uc3QgdHJhbnMgPSBzdHlsZXMudHJhbnNpdGlvbi5zcGxpdCgnLCAnKTtcbiAgICAgICAgICAgIC8vIHRyYW5zaXRpb246IG9wYWNpdHkgd2FzIGRlZmluZWQgaW4gY3NzLlxuICAgICAgICAgICAgLy8gc2V0IHRyYW5zaXRpb24gdG8gZHVyLCBzZXQgb3BhY2l0eSB0byAwLCBsZWF2ZSB0aGUgYW5pbWF0aW9uIHRvIG5hdGl2ZSB0cmFuc2l0aW9uLCB3YWl0IGR1ciBhbmQgcmV0dXJuIHRoaXNcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgZmFkZSgke2R1cn0sICR7dG99KSwgb3BhY2l0eVRyYW5zRHVyICE9PSB1bmRlZmluZWQuIG51bGxpZnlpbmcgdHJhbnNpdGlvbi4gU0hPVUxEIE5PVCBXT1JLYCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgdHJhbnM6XFx0JHt0cmFuc31cXG50cmFuc1Byb3A6XFx0JHt0cmFuc1Byb3B9XFxuaW5kZXhPZk9wYWNpdHk6XFx0JHtpbmRleE9mT3BhY2l0eX1cXG5vcGFjaXR5VHJhbnNEdXI6XFx0JHtvcGFjaXR5VHJhbnNEdXJ9YCk7XG4gICAgICAgICAgICAvLyB0cmFucy5zcGxpY2UoaW5kZXhPZk9wYWNpdHksIDEsIGBvcGFjaXR5ICR7ZHVyIC8gMTAwMH1zYCk7XG4gICAgICAgICAgICB0cmFucy5zcGxpY2UoaW5kZXhPZk9wYWNpdHksIDEsIGBvcGFjaXR5IDBzYCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgYWZ0ZXIsIHRyYW5zOiAke3RyYW5zfWApO1xuICAgICAgICAgICAgdGhpcy5lLnN0eWxlLnRyYW5zaXRpb24gPSB0cmFucy5qb2luKCcsICcpO1xuICAgICAgICAgICAgdGhpcy5jc3MoeyBvcGFjaXR5IDogdG8gfSk7XG4gICAgICAgICAgICBhd2FpdCB3YWl0KGR1cik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICAvLyB0cmFuc2l0aW9uOiBvcGFjaXR5IHdhcyBOT1QgZGVmaW5lZCBpbiBjc3MuXG4gICAgICAgIGlmICggZHVyID09IDAgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jc3MoeyBvcGFjaXR5IDogdG8gfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXNGYWRlT3V0ID0gdG8gPT09IDA7XG4gICAgICAgIGxldCBvcGFjaXR5ID0gcGFyc2VGbG9hdCh0aGlzLmUuc3R5bGUub3BhY2l0eSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIG9wYWNpdHkgPT09IHVuZGVmaW5lZCB8fCBpc05hTihvcGFjaXR5KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgZmFkZSgke2R1cn0sICR7dG99KSBodG1sRWxlbWVudCBoYXMgTk8gb3BhY2l0eSBhdCBhbGwuIHJlY3Vyc2luZ2AsIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5LFxuICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNzcyh7IG9wYWNpdHkgOiBNYXRoLmFicygxIC0gdG8pIH0pLmZhZGUoZHVyLCB0bylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCBpc0ZhZGVPdXQgPyBvcGFjaXR5IDw9IDAgOiBvcGFjaXR5ID4gMSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYGZhZGUoJHtkdXJ9LCAke3RvfSkgb3BhY2l0eSB3YXMgYmV5b25kIHRhcmdldCBvcGFjaXR5LiByZXR1cm5pbmcgdGhpcyBhcyBpcy5gLCB7XG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMgOiB0aGlzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxldCBzdGVwcyA9IDMwO1xuICAgICAgICBsZXQgb3BTdGVwID0gMSAvIHN0ZXBzO1xuICAgICAgICBsZXQgZXZlcnltcyA9IGR1ciAvIHN0ZXBzO1xuICAgICAgICBpZiAoIGV2ZXJ5bXMgPCAxICkge1xuICAgICAgICAgICAgZXZlcnltcyA9IDE7XG4gICAgICAgICAgICBzdGVwcyA9IGR1cjtcbiAgICAgICAgICAgIG9wU3RlcCA9IDEgLyBzdGVwcztcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgZmFkZSgke2R1cn0sICR7dG99KSBoYWQgb3BhY2l0eSwgbm8gdHJhbnNpdGlvbi4gKGdvb2QpIG9wYWNpdHk6ICR7b3BhY2l0eX1gLCB7XG4gICAgICAgICAgICBzdGVwcyxcbiAgICAgICAgICAgIG9wU3RlcCxcbiAgICAgICAgICAgIGV2ZXJ5bXNcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlYWNoZWRUbyA9IGlzRmFkZU91dCA/IChvcCkgPT4gb3AgLSBvcFN0ZXAgPiAwIDogKG9wKSA9PiBvcCArIG9wU3RlcCA8IDE7XG4gICAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCByZWFjaGVkVG8ob3BhY2l0eSkgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBpc0ZhZGVPdXQgPT09IHRydWUgKVxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5IC09IG9wU3RlcDtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHkgKz0gb3BTdGVwO1xuICAgICAgICAgICAgICAgIHRoaXMuY3NzKHsgb3BhY2l0eSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eSA9IHRvO1xuICAgICAgICAgICAgICAgIHRoaXMuY3NzKHsgb3BhY2l0eSB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZXZlcnltcyk7XG4gICAgICAgIGF3YWl0IHdhaXQoZHVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGZhZGVPdXQoZHVyOiBudW1iZXIpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZmFkZShkdXIsIDApO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBhc3luYyBmYWRlSW4oZHVyOiBudW1iZXIpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZmFkZShkdXIsIDEpO1xuICAgIH1cbiAgICBcbiAgICBcbn1cblxuY2xhc3MgRGl2IGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxEaXZFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhIERpdiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ2RpdicsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgIH1cbn1cblxuY2xhc3MgUGFyYWdyYXBoIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBfaHRtbEVsZW1lbnQ6IEhUTUxQYXJhZ3JhcGhFbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxQYXJhZ3JhcGhFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhIFBhcmFncmFwaCBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ3AnLCB0ZXh0LCBjbHMgfSk7XG4gICAgICAgIGlmICggaWQgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmlkKGlkKTtcbiAgICB9XG59XG5cbmNsYXNzIFNwYW4gZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTFNwYW5FbGVtZW50O1xuICAgIHJlYWRvbmx5IGU6IEhUTUxTcGFuRWxlbWVudDtcbiAgICBcbiAgICAvKipDcmVhdGUgYSBTcGFuIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGlkLCB0ZXh0LCBjbHMgfTogU3ViRWxlbUNvbnN0cnVjdG9yID0ge30pIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnc3BhbicsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBcbiAgICB9XG59XG5cbmNsYXNzIEltZyBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50O1xuICAgIFxuICAgIC8qKkNyZWF0ZSBhbiBJbWcgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCBzcmMgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgc3JjLCBjbHMgfTogSW1nQ29uc3RydWN0b3IpIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnaW1nJywgY2xzIH0pO1xuICAgICAgICBpZiAoIGlkICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5pZChpZCk7XG4gICAgICAgIGlmICggc3JjICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuc3JjID0gc3JjO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgc3JjKHNyYzogc3RyaW5nKTogdGhpcztcbiAgICBzcmMoKTogc3RyaW5nO1xuICAgIHNyYyhzcmM/KSB7XG4gICAgICAgIGlmICggc3JjID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQuc3JjXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5zcmMgPSBzcmM7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZWFkb25seSBlOiBIVE1MSW1hZ2VFbGVtZW50O1xufVxuXG5jbGFzcyBBbmNob3IgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9odG1sRWxlbWVudDogSFRNTEFuY2hvckVsZW1lbnQ7XG4gICAgcmVhZG9ubHkgZTogSFRNTEFuY2hvckVsZW1lbnQ7XG4gICAgXG4gICAgLyoqQ3JlYXRlIGFuIEFuY2hvciBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQsIGhyZWYgb3IgY2xzLiovXG4gICAgY29uc3RydWN0b3IoeyBpZCwgdGV4dCwgY2xzLCBocmVmIH06IEFuY2hvckNvbnN0cnVjdG9yID0ge30pIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnYScsIHRleHQsIGNscyB9KTtcbiAgICAgICAgaWYgKCBpZCAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuaWQoaWQpO1xuICAgICAgICBpZiAoIGhyZWYgIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLmhyZWYoaHJlZilcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGhyZWYoKTogc3RyaW5nXG4gICAgaHJlZih2YWw6IHN0cmluZyk6IHRoaXNcbiAgICBocmVmKHZhbD8pIHtcbiAgICAgICAgaWYgKCB2YWwgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdocmVmJyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoeyBocmVmIDogdmFsIH0pXG4gICAgfVxuICAgIFxuICAgIHRhcmdldCgpOiBzdHJpbmdcbiAgICB0YXJnZXQodmFsOiBzdHJpbmcpOiB0aGlzXG4gICAgdGFyZ2V0KHZhbD8pIHtcbiAgICAgICAgaWYgKCB2YWwgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd0YXJnZXQnKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cih7IHRhcmdldCA6IHZhbCB9KVxuICAgIH1cbn1cblxuLypjbGFzcyBTdmcgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudHtcbiBwcm90ZWN0ZWQgcmVhZG9ubHkgX2h0bWxFbGVtZW50OiBTVkdFbGVtZW50O1xuIGNvbnN0cnVjdG9yKHtpZCwgY2xzLGh0bWxFbGVtZW50fTogU3ZnQ29uc3RydWN0b3IpIHtcbiBzdXBlcih7dGFnOiAnc3ZnJywgY2xzfSk7XG4gaWYgKGlkKVxuIHRoaXMuaWQoaWQpO1xuIGlmIChzcmMpXG4gdGhpcy5faHRtbEVsZW1lbnQuc3JjID0gc3JjO1xuIFxuIH1cbiB9XG4gKi9cbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWh0bWwtZWxlbWVudCcsIEJldHRlckhUTUxFbGVtZW50KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWRpdicsIERpdiwgeyBleHRlbmRzIDogJ2RpdicgfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1wJywgUGFyYWdyYXBoLCB7IGV4dGVuZHMgOiAncCcgfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1zcGFuJywgU3BhbiwgeyBleHRlbmRzIDogJ3NwYW4nIH0pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItaW1nJywgSW1nLCB7IGV4dGVuZHMgOiAnaW1nJyB9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWEnLCBBbmNob3IsIHsgZXh0ZW5kcyA6ICdhJyB9KTtcblxuLy8gY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItc3ZnJywgU3ZnLCB7ZXh0ZW5kczogJ3N2Zyd9KTtcblxuLyoqQ3JlYXRlIGFuIGVsZW1lbnQgb2YgYHRhZ2AuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgIGFuZCAvIG9yIGBjbHNgKi9cbmZ1bmN0aW9uIGVsZW0oeyB0YWcsIHRleHQsIGNscyB9OiB7IHRhZzogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbi8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBpZGAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbmZ1bmN0aW9uIGVsZW0oeyBpZCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGlkOiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcsIGNscz86IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTogQmV0dGVySFRNTEVsZW1lbnQ7XG4vKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgcXVlcnlgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG5mdW5jdGlvbiBlbGVtKHsgcXVlcnksIHRleHQsIGNscywgY2hpbGRyZW4gfTogeyBxdWVyeTogUXVlcnlTZWxlY3RvciwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbi8qKldyYXAgYW4gZXhpc3RpbmcgSFRNTEVsZW1lbnQuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbmZ1bmN0aW9uIGVsZW0oeyBodG1sRWxlbWVudCwgdGV4dCwgY2xzLCBjaGlsZHJlbiB9OiB7IGh0bWxFbGVtZW50OiBIVE1MRWxlbWVudCwgdGV4dD86IHN0cmluZywgY2xzPzogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBCZXR0ZXJIVE1MRWxlbWVudDtcbmZ1bmN0aW9uIGVsZW0oZWxlbU9wdGlvbnMpOiBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIG5ldyBCZXR0ZXJIVE1MRWxlbWVudChlbGVtT3B0aW9ucyk7XG59XG5cbi8qKkNyZWF0ZSBhbiBTcGFuIGVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbmZ1bmN0aW9uIHNwYW4oeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogU3BhbiB7XG4gICAgcmV0dXJuIG5ldyBTcGFuKHsgaWQsIHRleHQsIGNscyB9KTtcbn1cblxuLyoqQ3JlYXRlIGFuIERpdiBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG5mdW5jdGlvbiBkaXYoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogRGl2IHtcbiAgICByZXR1cm4gbmV3IERpdih7IGlkLCB0ZXh0LCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhbiBJbWcgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCBzcmMgb3IgY2xzLiovXG5mdW5jdGlvbiBpbWcoeyBpZCwgc3JjLCBjbHMgfTogSW1nQ29uc3RydWN0b3IgPSB7fSk6IEltZyB7XG4gICAgcmV0dXJuIG5ldyBJbWcoeyBpZCwgc3JjLCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhIFBhcmFncmFwaCBlbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG5mdW5jdGlvbiBwYXJhZ3JhcGgoeyBpZCwgdGV4dCwgY2xzIH06IFN1YkVsZW1Db25zdHJ1Y3RvciA9IHt9KTogUGFyYWdyYXBoIHtcbiAgICByZXR1cm4gbmV3IFBhcmFncmFwaCh7IGlkLCB0ZXh0LCBjbHMgfSk7XG59XG5cbi8qKkNyZWF0ZSBhbiBBbmNob3IgZWxlbWVudC4gT3B0aW9uYWxseSBzZXQgaXRzIGlkLCB0ZXh0LCBocmVmIG9yIGNscy4qL1xuZnVuY3Rpb24gYW5jaG9yKHsgaWQsIHRleHQsIGNscywgaHJlZiB9OiBBbmNob3JDb25zdHJ1Y3RvciA9IHt9KTogQW5jaG9yIHtcbiAgICByZXR1cm4gbmV3IEFuY2hvcih7IGlkLCB0ZXh0LCBjbHMsIGhyZWYgfSk7XG59XG5cblxuZXhwb3J0IHsgZWxlbSwgc3BhbiwgZGl2LCBpbWcsIHBhcmFncmFwaCwgYW5jaG9yLCBCZXR0ZXJIVE1MRWxlbWVudCwgRGl2IH1cbiJdfQ==