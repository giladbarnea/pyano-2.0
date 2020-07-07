"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function enumerate(obj) {
    let typeofObj = typeof obj;
    if (obj === undefined
        || isEmptyObj(obj)
        || isEmptyArr(obj)
        || obj === "") {
        return [];
    }
    if (obj === null
        || typeofObj === "boolean"
        || typeofObj === "number"
        || typeofObj === "function") {
        throw new TypeError(`${typeofObj} object is not iterable`);
    }
    let array = [];
    if (isArray(obj)) {
        let i = 0;
        for (let x of obj) {
            array.push([i, x]);
            i++;
        }
    }
    else {
        for (let prop in obj) {
            array.push([prop, obj[prop]]);
        }
    }
    return array;
}
exports.enumerate = enumerate;
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.wait = wait;
function bool(val) {
    if (!val) {
        return false;
    }
    const typeofval = typeof val;
    if (typeofval !== 'object') {
        if (typeofval === 'function') {
            return true;
        }
        else {
            return !!val;
        }
    }
    let toStringed = {}.toString.call(val);
    if (toStringed === '[object Object]' || toStringed === '[object Array]') {
        return Object.keys(val).length !== 0;
    }
    return !!val.valueOf();
}
exports.bool = bool;
function isArray(obj) {
    if (!obj) {
        return false;
    }
    return typeof obj !== 'string' && (Array.isArray(obj) || typeof obj[Symbol.iterator] === 'function');
}
exports.isArray = isArray;
function isEmptyArr(collection) {
    return isArray(collection) && getLength(collection) === 0;
}
exports.isEmptyArr = isEmptyArr;
function isEmptyObj(obj) {
    return isObject(obj) && !isArray(obj) && Object.keys(obj).length === 0;
}
exports.isEmptyObj = isEmptyObj;
function isFunction(fn) {
    let toStringed = {}.toString.call(fn);
    return !!fn && toStringed === '[object Function]';
}
exports.isFunction = isFunction;
function anyDefined(obj) {
    let array;
    if (isObject(obj)) {
        array = Object.values(obj);
    }
    else if (isArray(obj)) {
        array = obj;
    }
    else {
        throw new TypeError(`expected array or obj, got: ${typeof obj}`);
    }
    return array.filter(x => x !== undefined).length > 0;
}
exports.anyDefined = anyDefined;
function anyTruthy(obj) {
    let array;
    if (isObject(obj)) {
        array = Object.values(obj);
    }
    else if (isArray(obj)) {
        array = obj;
    }
    else {
        throw new TypeError(`expected array or obj, got: ${typeof obj}`);
    }
    return array.filter(x => bool(x)).length > 0;
}
exports.anyTruthy = anyTruthy;
function allUndefined(obj) {
    let array;
    if (isObject(obj)) {
        array = Object.values(obj);
    }
    else if (isArray(obj)) {
        array = obj;
    }
    else {
        throw new TypeError(`expected array or obj, got: ${typeof obj}`);
    }
    return array.filter(x => x !== undefined).length === 0;
}
exports.allUndefined = allUndefined;
async function waitUntil(cond, checkInterval = 20, timeout = Infinity) {
    if (checkInterval <= 0) {
        throw new Error(`checkInterval <= 0. checkInterval: ${checkInterval}`);
    }
    if (checkInterval > timeout) {
        throw new Error(`checkInterval > timeout (${checkInterval} > ${timeout}). checkInterval has to be lower than timeout.`);
    }
    const loops = timeout / checkInterval;
    if (loops <= 1) {
        console.warn(`loops <= 1, you probably didn't want this to happen`);
    }
    let count = 0;
    while (count < loops) {
        if (cond()) {
            return true;
        }
        await wait(checkInterval);
        count++;
    }
    return false;
}
exports.waitUntil = waitUntil;
function isBHE(bhe, bheSubType) {
    return (bhe instanceof bheSubType);
}
exports.isBHE = isBHE;
function isType(arg) {
    return true;
}
exports.isType = isType;
function isTMap(obj) {
    return {}.toString.call(obj) == '[object Object]';
}
exports.isTMap = isTMap;
function isObject(obj) {
    return typeof obj === 'object' && !!obj;
}
exports.isObject = isObject;
function shallowProperty(key) {
    return function (obj) {
        return obj == null ? void 0 : obj[key];
    };
}
exports.shallowProperty = shallowProperty;
function getLength(collection) {
    return shallowProperty('length')(collection);
}
exports.getLength = getLength;
const MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
function isArrayLike(collection) {
    const length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
}
exports.isArrayLike = isArrayLike;
function extend(sup, child) {
    child.prototype = sup.prototype;
    const handler = {
        construct
    };
    function construct(_, argArray) {
        const obj = new child;
        sup.apply(obj, argArray);
        child.apply(obj, argArray);
        return obj;
    }
    const proxy = new Proxy(child, handler);
    return proxy;
}
exports.extend = extend;
function anyValue(obj) {
    let array;
    if (isObject(obj)) {
        array = Object.values(obj);
    }
    else if (isArray(obj)) {
        array = obj;
    }
    else {
        throw new TypeError(`expected array or obj, got: ${typeof obj}`);
    }
    return array.filter(x => Boolean(x)).length > 0;
}
exports.anyValue = anyValue;
function equalsAny(obj, ...others) {
    if (!others) {
        throw new Error('Not even one other was passed');
    }
    let strict = !(isArrayLike(obj) && isObject(obj[obj.length - 1]) && obj[obj.length - 1].strict == false);
    const _isEq = (_obj, _other) => strict ? _obj === _other : _obj == _other;
    for (let other of others) {
        if (_isEq(obj, other)) {
            return true;
        }
    }
    return false;
}
exports.equalsAny = equalsAny;
function noValue(obj) {
    let array;
    if (isObject(obj)) {
        array = Object.values(obj);
    }
    else if (isArray(obj)) {
        array = obj;
    }
    else {
        throw new TypeError(`expected array or obj, got: ${typeof obj}`);
    }
    return array.filter(x => Boolean(x)).length === 0;
}
exports.noValue = noValue;
function getArgsFullRepr(argsWithValues) {
    return Object.entries(argsWithValues)
        .flatMap(([argname, argval]) => `${argname} (${typeof argval}): ${isObject(argval) ? `{${getArgsFullRepr(argval)}}` : argval}`)
        .join('", "');
}
exports.getArgsFullRepr = getArgsFullRepr;
function getArgsWithValues(passedArgs) {
    const argsWithValues = {};
    for (let [argname, argval] of Object.entries(passedArgs)) {
        if (argval !== undefined) {
            argsWithValues[argname] = argval;
        }
    }
    return argsWithValues;
}
exports.getArgsWithValues = getArgsWithValues;
function summary(argset) {
    const argsWithValues = getArgsWithValues(argset);
    const argsFullRepr = getArgsFullRepr(argsWithValues);
    let argNames = Object.keys(argset);
    return `${argNames.length} args (${argNames}); ${Object.keys(argsWithValues).length} had value: "${argsFullRepr}".\n`;
}
exports.summary = summary;
class MutuallyExclusiveArgs extends Error {
    constructor(passedArgs, details) {
        let message = `Didn't receive exactly one arg`;
        if (isArray(passedArgs)) {
            message += ` from the following mutually exclusive sets of args.\n`;
            for (let [i, argset] of enumerate(passedArgs)) {
                message += `Out of set #${i + 1}, which consists of ${summary(argset)}`;
            }
        }
        else {
            message += ` from the following mutually exclusive set of args.\nOut of ${summary(passedArgs)}`;
        }
        if (details) {
            message += `Details: ${details}`;
        }
        super(message);
    }
}
exports.MutuallyExclusiveArgs = MutuallyExclusiveArgs;
class NotEnoughArgs extends Error {
    constructor(expected, passedArgs, relation) {
        let message;
        if (isArray(expected)) {
            let [min, max] = expected;
            if (max === undefined) {
                message = `Didn't receive enough args: expected at least ${min}`;
            }
            else {
                message = `Didn't receive enough args: expected between ${min} and ${max}`;
            }
        }
        else {
            message = `Didn't receive enough args: expected exactly ${expected}`;
        }
        if (isArray(passedArgs)) {
            message += ` from ${relation} set of arguments.\n`;
            for (let [i, argset] of enumerate(passedArgs)) {
                message += `Out of set #${i + 1}, which consists of ${summary(argset)}`;
            }
        }
        else {
            message += ` from the following set of args.\nOut of ${summary(passedArgs)}`;
        }
        super(message);
    }
}
exports.NotEnoughArgs = NotEnoughArgs;
class BHETypeError extends TypeError {
    constructor(options) {
        let { faultyValue, expected, where, message } = options;
        const repr = getArgsFullRepr(faultyValue);
        let msg = '';
        if (where) {
            msg += `${where} | `;
        }
        msg += `Got ${repr}. `;
        if (expected) {
            if (isArray(expected)) {
                expected = expected.join(" | ");
            }
            msg += ` Expected: ${expected}. `;
        }
        if (message) {
            msg += `Details:\n${message}`;
        }
        super(msg);
    }
}
exports.BHETypeError = BHETypeError;
class ValueError extends BHETypeError {
}
exports.ValueError = ValueError;
const SVG_NS_URI = 'http://www.w3.org/2000/svg';
class BetterHTMLElement {
    constructor(elemOptions) {
        this._isSvg = false;
        this._listeners = {};
        this._cachedChildren = {};
        let { tag, cls, setid, html, htmlElement, byid, query, children } = elemOptions;
        if ([tag, byid, query, htmlElement].filter(x => x !== undefined).length > 1) {
            throw new MutuallyExclusiveArgs({
                byid, query, htmlElement, tag
            }, 'Either wrap an existing element by passing one of `byid` / `query` / `htmlElement`, or create a new one by passing `tag`.');
        }
        if (anyDefined([tag, cls, setid]) && anyDefined([children, byid, htmlElement, query])) {
            throw new MutuallyExclusiveArgs([
                { tag, cls, setid },
                { children, byid, htmlElement, query }
            ], `Can't have args from both sets`);
        }
        if (allUndefined([tag, byid, htmlElement, query])) {
            throw new NotEnoughArgs(1, { tag, byid, htmlElement, query }, 'either');
        }
        if (tag !== undefined) {
            if (['svg', 'path'].includes(tag.toLowerCase())) {
                this._isSvg = true;
                this._htmlElement = document.createElementNS(SVG_NS_URI, tag);
            }
            else {
                this._htmlElement = document.createElement(tag);
            }
        }
        else {
            if (byid !== undefined) {
                if (byid.startsWith('#')) {
                    console.warn(`param 'byid' starts with '#', stripping it: ${byid}`);
                    byid = byid.substr(1);
                }
                this._htmlElement = document.getElementById(byid);
            }
            else {
                if (query !== undefined) {
                    this._htmlElement = document.querySelector(query);
                }
                else {
                    if (htmlElement !== undefined) {
                        this._htmlElement = htmlElement;
                    }
                }
            }
        }
        if (!bool(this._htmlElement)) {
            throw new Error(`${this} constructor ended up with no 'this._htmlElement'. Passed options: ${summary(elemOptions)}`);
        }
        if (cls !== undefined) {
            this.class(cls);
        }
        if (html !== undefined) {
            this.html(html);
        }
        if (children !== undefined) {
            this.cacheChildren(children);
        }
        if (setid !== undefined) {
            this.id(setid);
        }
    }
    get e() {
        return this._htmlElement;
    }
    static wrapWithBHE(element) {
        const tag = element.tagName.toLowerCase();
        if (tag === 'div') {
            return div({ htmlElement: element });
        }
        else if (tag === 'a') {
            return anchor({ htmlElement: element });
        }
        else if (tag === 'p') {
            return paragraph({ htmlElement: element });
        }
        else if (tag === 'img') {
            return img({ htmlElement: element });
        }
        else if (tag === 'input') {
            if (element.type === "text") {
                return new TextInput({ htmlElement: element });
            }
            else if (element.type === "checkbox") {
                return new CheckboxInput({ htmlElement: element });
            }
            else {
                return input({ htmlElement: element });
            }
        }
        else if (tag === 'button') {
            return button({ htmlElement: element });
        }
        else if (tag === 'span') {
            return span({ htmlElement: element });
        }
        else if (tag === 'select') {
            return select({ htmlElement: element });
        }
        else {
            return elem({ htmlElement: element });
        }
    }
    toString() {
        var _a, _b;
        const proto = Object.getPrototypeOf(this);
        const protoStr = proto.constructor.toString();
        let str = protoStr.substring(6, protoStr.indexOf('{') - 1);
        let tag = (_a = this._htmlElement) === null || _a === void 0 ? void 0 : _a.tagName;
        let id = this.id();
        let classList = (_b = this._htmlElement) === null || _b === void 0 ? void 0 : _b.classList;
        if (anyTruthy([id, classList, tag])) {
            str += ` (`;
            if (tag) {
                str += `<${tag.toLowerCase()}>`;
            }
            if (id) {
                str += `#${id}`;
            }
            if (classList) {
                str += `.${classList}`;
            }
            str += `)`;
        }
        return str;
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
            return this._htmlElement.innerHTML;
        }
        else {
            this._htmlElement.innerHTML = html;
            return this;
        }
    }
    text(txt) {
        if (txt === undefined) {
            return this._htmlElement.innerText;
        }
        else {
            this._htmlElement.innerText = txt;
            return this;
        }
    }
    id(id) {
        var _a;
        if (id === undefined) {
            return (_a = this._htmlElement) === null || _a === void 0 ? void 0 : _a.id;
        }
        else {
            this._htmlElement.id = id;
            return this;
        }
    }
    css(css) {
        if (typeof css === 'string') {
            return this._htmlElement.style[css];
        }
        else {
            for (let [styleAttr, styleVal] of enumerate(css)) {
                this._htmlElement.style[styleAttr] = styleVal;
            }
            return this;
        }
    }
    uncss(...removeProps) {
        let css = {};
        for (let prop of removeProps) {
            css[prop] = '';
        }
        return this.css(css);
    }
    class(cls) {
        if (cls === undefined) {
            return Array.from(this._htmlElement.classList);
        }
        else if (isFunction(cls)) {
            return Array.from(this._htmlElement.classList).find(cls);
        }
        else {
            if (this._isSvg) {
                this._htmlElement.classList = [cls];
            }
            else {
                this._htmlElement.className = cls;
            }
            return this;
        }
    }
    addClass(cls, ...clses) {
        this._htmlElement.classList.add(cls);
        for (let c of clses) {
            this._htmlElement.classList.add(c);
        }
        return this;
    }
    removeClass(cls, ...clses) {
        if (isFunction(cls)) {
            this._htmlElement.classList.remove(this.class(cls));
            for (let c of clses) {
                this._htmlElement.classList.remove(this.class(c));
            }
        }
        else {
            this._htmlElement.classList.remove(cls);
            for (let c of clses) {
                this._htmlElement.classList.remove(c);
            }
        }
        return this;
    }
    replaceClass(oldToken, newToken) {
        if (isFunction(oldToken)) {
            this._htmlElement.classList.replace(this.class(oldToken), newToken);
        }
        else {
            this._htmlElement.classList.replace(oldToken, newToken);
        }
        return this;
    }
    toggleClass(cls, force) {
        if (isFunction(cls)) {
            this._htmlElement.classList.toggle(this.class(cls), force);
        }
        else {
            this._htmlElement.classList.toggle(cls, force);
        }
        return this;
    }
    hasClass(cls) {
        if (isFunction(cls)) {
            return this.class(cls) !== undefined;
        }
        else {
            return this._htmlElement.classList.contains(cls);
        }
    }
    after(...nodes) {
        for (let node of nodes) {
            if (node instanceof BetterHTMLElement) {
                this._htmlElement.after(node.e);
            }
            else {
                this._htmlElement.after(node);
            }
        }
        return this;
    }
    insertAfter(node) {
        if (node instanceof BetterHTMLElement) {
            node._htmlElement.after(this._htmlElement);
        }
        else {
            node.after(this._htmlElement);
        }
        return this;
    }
    append(...nodes) {
        for (let node of nodes) {
            if (node instanceof BetterHTMLElement) {
                this._htmlElement.append(node.e);
            }
            else {
                if (node instanceof Node) {
                    this._htmlElement.append(node);
                }
                else {
                    if (Array.isArray(node)) {
                        this.cacheAppend([node]);
                    }
                    else {
                        this.cacheAppend(node);
                    }
                }
            }
        }
        return this;
    }
    appendTo(node) {
        if (node instanceof BetterHTMLElement) {
            node._htmlElement.append(this._htmlElement);
        }
        else {
            node.append(this._htmlElement);
        }
        return this;
    }
    before(...nodes) {
        for (let node of nodes) {
            if (node instanceof BetterHTMLElement) {
                this._htmlElement.before(node.e);
            }
            else {
                this._htmlElement.before(node);
            }
        }
        return this;
    }
    insertBefore(node) {
        if (node instanceof BetterHTMLElement) {
            node._htmlElement.before(this._htmlElement);
        }
        else {
            node.before(this._htmlElement);
        }
        return this;
    }
    replaceChild(newChild, oldChild) {
        this._htmlElement.replaceChild(newChild, oldChild);
        return this;
    }
    cacheAppend(keyChildPairs) {
        const _cacheAppend = (_key, _child) => {
            this.append(_child);
            this._cache(_key, _child);
        };
        if (Array.isArray(keyChildPairs)) {
            for (let [key, child] of keyChildPairs) {
                _cacheAppend(key, child);
            }
        }
        else {
            for (let [key, child] of enumerate(keyChildPairs)) {
                _cacheAppend(key, child);
            }
        }
        return this;
    }
    _cls() {
        return BetterHTMLElement;
    }
    child(selector, bheCls) {
        const htmlElement = this._htmlElement.querySelector(selector);
        if (htmlElement === null) {
            console.warn(`${this}.child(${selector}): no child. returning undefined`);
            return undefined;
        }
        let bhe;
        if (bheCls === undefined) {
            bhe = this._cls().wrapWithBHE(htmlElement);
        }
        else {
            bhe = new bheCls({ htmlElement });
        }
        return bhe;
    }
    children(selector) {
        let childrenVanilla;
        let childrenCollection;
        if (selector === undefined) {
            childrenCollection = this._htmlElement.children;
        }
        else {
            childrenCollection = this._htmlElement.querySelectorAll(selector);
        }
        childrenVanilla = Array.from(childrenCollection);
        return childrenVanilla.map(this._cls().wrapWithBHE);
    }
    clone(deep) {
        console.warn(`${this}.clone() doesnt return a matching BHE subtype, but a regular BHE`);
        return new BetterHTMLElement({ htmlElement: this._htmlElement.cloneNode(deep) });
    }
    cacheChildren(childrenObj) {
        for (let [key, value] of enumerate(childrenObj)) {
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
                    if (isFunction(obj)) {
                        let bhe = this.child(selector, obj);
                        this._cache(key, bhe);
                    }
                    else {
                        this._cache(key, this.child(selector));
                        this[key].cacheChildren(obj);
                    }
                }
            }
            else if (type === "string") {
                let match = /<(\w+)>$/.exec(value);
                if (match) {
                    let tagName = match[1];
                    const htmlElements = [...this._htmlElement.getElementsByTagName(tagName)];
                    let bhes = [];
                    for (let htmlElement of htmlElements) {
                        bhes.push(this._cls().wrapWithBHE(htmlElement));
                    }
                    this._cache(key, bhes);
                }
                else {
                    this._cache(key, this.child(value));
                }
            }
            else {
                console.warn(`cacheChildren, bad value type: "${type}". key: "${key}", value: "${value}". childrenObj:`, childrenObj);
            }
        }
        return this;
    }
    empty() {
        while (this._htmlElement.firstChild) {
            this._htmlElement.removeChild(this._htmlElement.firstChild);
        }
        return this;
    }
    remove() {
        this._htmlElement.remove();
        return this;
    }
    on(evTypeFnPairs, options) {
        for (let [evType, evFn] of enumerate(evTypeFnPairs)) {
            const _f = function _f(evt) {
                evFn(evt);
            };
            this._htmlElement.addEventListener(evType, _f, options);
            this._listeners[evType] = _f;
        }
        return this;
    }
    touchstart(fn, options) {
        this._htmlElement.addEventListener('touchstart', function _f(ev) {
            ev.preventDefault();
            fn(ev);
            if (options && options.once) {
                this.removeEventListener('touchstart', _f);
            }
        }, options);
        return this;
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
            if (options && options.once) {
                this.removeEventListener(action, _f);
            }
        };
        this._htmlElement.addEventListener(action, _f, options);
        this._listeners.pointerdown = _f;
        return this;
    }
    click(fn, options) {
        if (fn === undefined) {
            this._htmlElement.click();
            return this;
        }
        else {
            return this.on({ click: fn }, options);
        }
    }
    blur(fn, options) {
        if (fn === undefined) {
            this._htmlElement.blur();
            return this;
        }
        else {
            return this.on({ blur: fn }, options);
        }
    }
    focus(fn, options) {
        if (fn === undefined) {
            this._htmlElement.focus();
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
            this._htmlElement.dispatchEvent(dblclick);
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
            this._htmlElement.dispatchEvent(mouseenter);
            return this;
        }
        else {
            return this.on({ mouseenter: fn }, options);
        }
    }
    keydown(fn, options) {
        return this.on({ keydown: fn }, options);
    }
    mouseout(fn, options) {
        return this.on({ mouseout: fn }, options);
    }
    mouseover(fn, options) {
        return this.on({ mouseover: fn });
    }
    off(event) {
        this._htmlElement.removeEventListener(event, this._listeners[event]);
        return this;
    }
    allOff() {
        for (let i = 0; i < Object.keys(this._listeners).length; i++) {
            let event = this._listeners[i];
            this.off(event);
        }
        return this;
    }
    attr(attrValPairs) {
        if (typeof attrValPairs === 'string') {
            return this._htmlElement.getAttribute(attrValPairs);
        }
        else {
            for (let [attr, val] of enumerate(attrValPairs)) {
                this._htmlElement.setAttribute(attr, val);
            }
            return this;
        }
    }
    removeAttr(qualifiedName, ...qualifiedNames) {
        let _removeAttribute;
        if (this._isSvg) {
            _removeAttribute = (qualifiedName) => this._htmlElement.removeAttributeNS(SVG_NS_URI, qualifiedName);
        }
        else {
            _removeAttribute = (qualifiedName) => this._htmlElement.removeAttribute(qualifiedName);
        }
        _removeAttribute(qualifiedName);
        for (let qn of qualifiedNames) {
            _removeAttribute(qn);
        }
        return this;
    }
    getdata(key, parse = true) {
        const data = this._htmlElement.getAttribute(`data-${key}`);
        if (parse === true) {
            return JSON.parse(data);
        }
        else {
            return data;
        }
    }
    _cache(key, child) {
        const oldchild = this._cachedChildren[key];
        if (oldchild !== undefined) {
            console.warn(`Overwriting this._cachedChildren[${key}]!`, `old child: ${oldchild}`, `new child: ${child}`, `are they different?: ${oldchild == child}`);
        }
        this[key] = child;
        this._cachedChildren[key] = child;
    }
}
exports.BetterHTMLElement = BetterHTMLElement;
class Div extends BetterHTMLElement {
    constructor(divOpts) {
        const { setid, cls, text, html, byid, query, htmlElement, children } = divOpts;
        if (text !== undefined && html !== undefined) {
            throw new MutuallyExclusiveArgs({ text, html });
        }
        if (htmlElement !== undefined) {
            super({ htmlElement, children });
        }
        else if (byid !== undefined) {
            super({ byid, children });
        }
        else if (query !== undefined) {
            super({ query, children });
        }
        else {
            super({ tag: "div", setid, cls, html });
            if (text !== undefined) {
                this.text(text);
            }
        }
    }
}
exports.Div = Div;
class Paragraph extends BetterHTMLElement {
    constructor(pOpts) {
        const { setid, cls, text, html, byid, query, htmlElement, children } = pOpts;
        if (text !== undefined && html !== undefined) {
            throw new MutuallyExclusiveArgs({ text, html });
        }
        if (htmlElement !== undefined) {
            super({ htmlElement, children });
        }
        else if (byid !== undefined) {
            super({ byid, children });
        }
        else if (query !== undefined) {
            super({ query, children });
        }
        else {
            super({ tag: "p", setid, cls, html });
            if (text !== undefined) {
                this.text(text);
            }
        }
    }
}
exports.Paragraph = Paragraph;
class Span extends BetterHTMLElement {
    constructor(spanOpts) {
        const { setid, cls, text, html, byid, query, htmlElement, children } = spanOpts;
        if (text !== undefined && html !== undefined) {
            throw new MutuallyExclusiveArgs({ text, html });
        }
        if (htmlElement !== undefined) {
            super({ htmlElement, children });
        }
        else if (byid !== undefined) {
            super({ byid, children });
        }
        else if (query !== undefined) {
            super({ query, children });
        }
        else {
            super({ tag: "span", setid, cls, html });
            if (text !== undefined) {
                this.text(text);
            }
        }
    }
}
exports.Span = Span;
class Img extends BetterHTMLElement {
    constructor(imgOpts) {
        const { cls, setid, src, byid, query, htmlElement, children } = imgOpts;
        if (htmlElement !== undefined) {
            super({ htmlElement, children });
        }
        else if (byid !== undefined) {
            super({ byid, children });
        }
        else if (query !== undefined) {
            super({ query, children });
        }
        else {
            super({ tag: "img", setid, cls });
            if (src !== undefined) {
                this.src(src);
            }
        }
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
exports.Img = Img;
class Anchor extends BetterHTMLElement {
    constructor({ setid, cls, text, html, href, target, byid, query, htmlElement, children }) {
        if (text !== undefined && html !== undefined) {
            throw new MutuallyExclusiveArgs({ text, html });
        }
        if (htmlElement !== undefined) {
            super({ htmlElement, children });
        }
        else if (byid !== undefined) {
            super({ byid, children });
        }
        else if (query !== undefined) {
            super({ query, children });
        }
        else {
            super({ tag: "a", setid, cls, html });
            if (text !== undefined) {
                this.text(text);
            }
            if (href !== undefined) {
                this.href(href);
            }
            if (target !== undefined) {
                this.target(target);
            }
        }
    }
    href(val) {
        if (val === undefined) {
            return this.attr('href');
        }
        else {
            return this.attr({ href: val });
        }
    }
    target(val) {
        if (val === undefined) {
            return this.attr('target');
        }
        else {
            return this.attr({ target: val });
        }
    }
}
exports.Anchor = Anchor;
class Form extends BetterHTMLElement {
    get disabled() {
        return this._htmlElement.disabled;
    }
    disable() {
        this._htmlElement.disabled = true;
        return this;
    }
    enable() {
        this._htmlElement.disabled = false;
        return this;
    }
    toggleEnabled(on) {
        if (isObject(on)) {
            this._softErr(new BHETypeError({ faultyValue: { on }, expected: "primitive", where: "toggleEnabled()" }));
            return this;
        }
        if (bool(on)) {
            return this.enable();
        }
        else {
            return this.disable();
        }
    }
    value(val) {
        var _a;
        if (val === undefined) {
            return _a = this._htmlElement.value, (_a !== null && _a !== void 0 ? _a : undefined);
        }
        else {
            if (isObject(val)) {
                this._softErr(new BHETypeError({ faultyValue: { val }, expected: "primitive", where: "value()" }));
                return this;
            }
            this._htmlElement.value = val;
            return this;
        }
    }
    async flashBad() {
        this.addClass('bad');
        await wait(2000);
        this.removeClass('bad');
    }
    async flashGood() {
        this.addClass('good');
        await wait(2000);
        this.removeClass('good');
    }
    clear() {
        return this.value(null);
    }
    _beforeEvent(thisArg) {
        let self = this === undefined ? thisArg : this;
        return self.disable();
    }
    _onEventSuccess(ret, thisArg) {
        let self = this === undefined ? thisArg : this;
        if (self.flashGood) {
            self.flashGood();
        }
        return self;
    }
    async _softErr(e, thisArg) {
        console.error(`${e.name}:\n${e.message}`);
        let self = this === undefined ? thisArg : this;
        if (self.flashBad) {
            await self.flashBad();
        }
        return self;
    }
    async _softWarn(e, thisArg) {
        console.warn(`${e.name}:\n${e.message}`);
        let self = this === undefined ? thisArg : this;
        if (self.flashBad) {
            await self.flashBad();
        }
        return self;
    }
    _afterEvent(thisArg) {
        let self = this === undefined ? thisArg : this;
        return self.enable();
    }
    async _wrapFnInEventHooks(asyncFn, event) {
        try {
            this._beforeEvent();
            const ret = await asyncFn(event);
            await this._onEventSuccess(ret);
        }
        catch (e) {
            await this._softErr(e);
        }
        finally {
            this._afterEvent();
        }
    }
}
exports.Form = Form;
class Button extends Form {
    constructor(buttonOpts) {
        const { setid, cls, text, html, byid, query, htmlElement, children, click } = buttonOpts;
        if (text !== undefined && html !== undefined) {
            throw new MutuallyExclusiveArgs({ text, html });
        }
        if (htmlElement !== undefined) {
            super({ htmlElement, children });
        }
        else if (byid !== undefined) {
            super({ byid, children });
        }
        else if (query !== undefined) {
            super({ query, children });
        }
        else {
            super({ tag: "button", setid, cls, html });
            if (text !== undefined) {
                this.text(text);
            }
            if (click !== undefined) {
                this.click(click);
            }
        }
    }
    click(_fn) {
        if (_fn !== undefined) {
            const fn = async (event) => {
                await this._wrapFnInEventHooks(_fn, event);
            };
            return super.click(fn);
        }
        return super.click();
    }
}
exports.Button = Button;
class Input extends Form {
    constructor(inputOpts) {
        const { setid, cls, type, byid, query, htmlElement, children } = inputOpts;
        if (htmlElement !== undefined) {
            super({ htmlElement, children });
        }
        else if (byid !== undefined) {
            super({ byid, children });
        }
        else if (query !== undefined) {
            super({ query, children });
        }
        else {
            super({ tag: "input", cls, setid });
            if (type !== undefined) {
                this._htmlElement.type = type;
            }
        }
    }
}
exports.Input = Input;
class TextInput extends Input {
    constructor(opts) {
        opts.type = 'text';
        super(opts);
        const { placeholder } = opts;
        if (placeholder !== undefined) {
            this.placeholder(placeholder);
        }
    }
    placeholder(val) {
        if (val === undefined) {
            return this._htmlElement.placeholder;
        }
        else {
            this._htmlElement.placeholder = val;
            return this;
        }
    }
    keydown(_fn) {
        const fn = async (event) => {
            if (event.key !== 'Enter') {
                return;
            }
            let val = this.value();
            if (!bool(val)) {
                this._softWarn(new ValueError({ faultyValue: { val }, expected: "truthy", where: "keydown()" }));
                return;
            }
            await this._wrapFnInEventHooks(_fn, event);
        };
        return super.keydown(fn);
    }
}
exports.TextInput = TextInput;
class Changable extends Input {
    change(_fn) {
        const fn = async (event) => {
            await this._wrapFnInEventHooks(_fn, event);
        };
        return super.change(fn);
    }
}
exports.Changable = Changable;
class CheckboxInput extends Changable {
    constructor(opts) {
        opts.type = 'checkbox';
        super(opts);
    }
    get checked() {
        return this._htmlElement.checked;
    }
    check() {
        this._htmlElement.checked = true;
        return this;
    }
    uncheck() {
        this._htmlElement.checked = false;
        return this;
    }
    toggleChecked(on) {
        if (isObject(on)) {
            this._softErr(new BHETypeError({ faultyValue: { on }, expected: "primitive", where: "toggleChecked()" }));
            return this;
        }
        if (bool(on)) {
            return this.check();
        }
        else {
            return this.uncheck();
        }
    }
    value(val) {
        var _a;
        if (val === undefined) {
            return _a = this._htmlElement.checked, (_a !== null && _a !== void 0 ? _a : undefined);
        }
        else {
            if (isObject(val)) {
                this._softErr(new BHETypeError({ faultyValue: { val }, expected: "primitive", where: "value()" }));
            }
            this._htmlElement.checked = val;
            return this;
        }
    }
    clear() {
        return this.uncheck();
    }
    async _softErr(e, thisArg) {
        this.toggleChecked(!this.checked);
        return super._softErr(e);
    }
}
exports.CheckboxInput = CheckboxInput;
class Select extends Changable {
    constructor(selectOpts) {
        super(selectOpts);
    }
    get selectedIndex() {
        return this._htmlElement.selectedIndex;
    }
    set selectedIndex(val) {
        this._htmlElement.selectedIndex = val;
    }
    get selected() {
        return this.item(this.selectedIndex);
    }
    set selected(val) {
        if (val instanceof HTMLOptionElement) {
            let index = this.options.findIndex(o => o === val);
            if (index === -1) {
                this._softWarn(new ValueError({ faultyValue: { val }, where: "set selected(val)", message: `no option equals passed val` }));
            }
            this.selectedIndex = index;
        }
        else if (typeof val === 'number') {
            this.selectedIndex = val;
        }
        else {
            this.selectedIndex = this.options.findIndex(o => o.value === val);
        }
    }
    get options() {
        return [...this._htmlElement.options];
    }
    item(index) {
        return this._htmlElement.item(index);
    }
    value(val) {
        var _a;
        if (val === undefined) {
            return _a = this.selected.value, (_a !== null && _a !== void 0 ? _a : undefined);
        }
        else {
            this.selected = val;
            return this;
        }
    }
    clear() {
        this.selectedIndex = 0;
        return this;
    }
}
exports.Select = Select;
function elem(elemOptions) {
    return new BetterHTMLElement(elemOptions);
}
exports.elem = elem;
function span(spanOpts) {
    if (!bool(spanOpts)) {
        spanOpts = {};
    }
    return new Span(spanOpts);
}
exports.span = span;
function div(divOpts) {
    if (!bool(divOpts)) {
        divOpts = {};
    }
    return new Div(divOpts);
}
exports.div = div;
function button(buttonOpts) {
    if (!bool(buttonOpts)) {
        buttonOpts = {};
    }
    return new Button(buttonOpts);
}
exports.button = button;
function input(inputOpts) {
    if (!bool(inputOpts)) {
        inputOpts = {};
    }
    return new Input(inputOpts);
}
exports.input = input;
function select(selectOpts) {
    if (!bool(selectOpts)) {
        selectOpts = {};
    }
    return new Select(selectOpts);
}
exports.select = select;
function img(imgOpts) {
    if (!bool(imgOpts)) {
        imgOpts = {};
    }
    return new Img(imgOpts);
}
exports.img = img;
function paragraph(pOpts) {
    if (!bool(pOpts)) {
        pOpts = {};
    }
    return new Paragraph(pOpts);
}
exports.paragraph = paragraph;
function anchor(anchorOpts) {
    if (!bool(anchorOpts)) {
        anchorOpts = {};
    }
    return new Anchor(anchorOpts);
}
exports.anchor = anchor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXNTQSxTQUFnQixTQUFTLENBQUksR0FBTTtJQWMvQixJQUFJLFNBQVMsR0FBRyxPQUFPLEdBQUcsQ0FBQztJQUMzQixJQUNJLEdBQUcsS0FBSyxTQUFTO1dBQ2QsVUFBVSxDQUFDLEdBQUcsQ0FBQztXQUNmLFVBQVUsQ0FBQyxHQUFHLENBQUM7V0FDZixHQUFHLEtBQUssRUFBRSxFQUNmO1FBQ0UsT0FBTyxFQUFtQixDQUFDO0tBQzlCO0lBRUQsSUFDSSxHQUFHLEtBQUssSUFBSTtXQUNULFNBQVMsS0FBSyxTQUFTO1dBQ3ZCLFNBQVMsS0FBSyxRQUFRO1dBQ3RCLFNBQVMsS0FBSyxVQUFVLEVBQzdCO1FBQ0UsTUFBTSxJQUFJLFNBQVMsQ0FBQyxHQUFHLFNBQVMseUJBQXlCLENBQUMsQ0FBQztLQUM5RDtJQUNELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNmLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ2QsSUFBSSxDQUFDLEdBQVcsQ0FBQyxDQUFDO1FBQ2xCLEtBQUssSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFO1lBQ2YsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLENBQUMsRUFBRSxDQUFDO1NBQ1A7S0FDSjtTQUFNO1FBQ0gsS0FBSyxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUU7WUFDbEIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pDO0tBQ0o7SUFDRCxPQUFPLEtBQXNCLENBQUM7QUFDbEMsQ0FBQztBQTdDRCw4QkE2Q0M7QUFFRCxTQUFnQixJQUFJLENBQUMsRUFBVTtJQUMzQixPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENB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QUFDLENBQUE7QUFDakMsQ0FBQztBQUxELHdCQUtDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLW5vY2hlY2tcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAqKiogVHlwaW5nXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZXhwb3J0IGludGVyZmFjZSBUTWFwPFQ+IHtcbiAgICBbczogc3RyaW5nXTogVDtcblxuICAgIFtzOiBudW1iZXJdOiBUXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVFJlY01hcDxUPiB7XG4gICAgW3M6IHN0cmluZ106IFQgfCBUUmVjTWFwPFQ+O1xuXG4gICAgW3M6IG51bWJlcl06IFQgfCBUUmVjTWFwPFQ+XG59XG5cbi8vIHR5cGUgSU1hcDxUPiA9IHtcbi8vICAgICBbcyBpbiBrZXlvZiBUXTogVFxuLy8gfVxuXG5cbi8vIHR5cGUgRXZlbnROYW1lRnVuY3Rpb25NYXBPcmlnPEUgZXh0ZW5kcyBFdmVudE5hbWU+ID0ge1xuLy8gICAgIFtQIGluIEVdPzogKGV2ZW50OiBIVE1MRWxlbWVudEV2ZW50TWFwW1BdKSA9PiB2b2lkO1xuLy8gfVtFXTtcbi8vXG4vLyB0eXBlIEV2ZW50TmFtZUZ1bmN0aW9uTWFwMjxFIGV4dGVuZHMgRXZlbnROYW1lPiA9IEUgZXh0ZW5kcyBFdmVudE5hbWUgPyAoZXZlbnQ6IEhUTUxFbGVtZW50RXZlbnRNYXBbRV0pID0+IHZvaWQgOiBuZXZlcjtcbi8vIHR5cGUgRXZlbnROYW1lRnVuY3Rpb25NYXAzID0ge1xuLy8gICAgIFtQIGluIEV2ZW50TmFtZV0/OiAoZXZlbnQ6IEhUTUxFbGVtZW50RXZlbnRNYXBbUF0pID0+IHZvaWQ7XG4vLyB9XG4vLyB0eXBlIEV2ZW50TmFtZUZ1bmN0aW9uTWFwNDxFIGV4dGVuZHMgRXZlbnROYW1lPiA9IHtcbi8vICAgICBbUCBpbiBFdmVudE5hbWVdPzogKGV2ZW50OiBIVE1MRWxlbWVudEV2ZW50TWFwW1BdKSA9PiB2b2lkO1xuLy8gfVxuZXhwb3J0IHR5cGUgRXZlbnROYW1lID0ga2V5b2YgSFRNTEVsZW1lbnRFdmVudE1hcDtcbi8vIEV2ZW50TmFtZTJGdW5jdGlvbjxcImNsaWNrXCI+IOKGkiBmdW5jdGlvbihldmVudDogTW91c2VFdmVudCkgeyB9XG5leHBvcnQgdHlwZSBFdmVudE5hbWUyRnVuY3Rpb248RSBleHRlbmRzIEV2ZW50TmFtZSA9IEV2ZW50TmFtZT4gPSB7XG4gICAgW1AgaW4gRXZlbnROYW1lXT86IChldmVudDogSFRNTEVsZW1lbnRFdmVudE1hcFtQXSkgPT4gdm9pZDtcbn1bRV1cbi8vIGUuZy4geyBcIm1vdXNlb3ZlclwiIDogTW91c2VFdmVudCwgLi4uIH1cbmV4cG9ydCB0eXBlIE1hcE9mRXZlbnROYW1lMkZ1bmN0aW9uID0gUGFydGlhbDxSZWNvcmQ8a2V5b2YgSFRNTEVsZW1lbnRFdmVudE1hcCwgRXZlbnROYW1lMkZ1bmN0aW9uPj5cblxuXG4vKnR5cGUgTW91c2VPdmVyRnVuY3Rpb24gPSBFdmVudE5hbWUyRnVuY3Rpb248XCJtb3VzZW92ZXJcIj47XG5cblxuZnVuY3Rpb24gZXhwZWN0c01vdXNlRXZlbnRGdW5jdGlvbihmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB2b2lkKSB7XG5cbn1cblxuY29uc3QgbW91c2VFdmVudEZ1bmN0aW9uOiBNb3VzZU92ZXJGdW5jdGlvbiA9IChldmVudDogTW91c2VFdmVudCkgPT4ge1xufTtcblxuZXhwZWN0c01vdXNlRXZlbnRGdW5jdGlvbihtb3VzZUV2ZW50RnVuY3Rpb24pO1xuXG5mdW5jdGlvbiBleHBlY3RzTW91c2VFdmVudEZ1bmN0aW9uUGFpcnMocGFpcnM6IE1hcE9mRXZlbnROYW1lMkZ1bmN0aW9uKSB7XG4gICAgZm9yIChsZXQgW2V2TmFtZSwgZXZGbl0gb2YgT2JqZWN0LmVudHJpZXMocGFpcnMpKSB7XG4gICAgICAgIGV4cGVjdHNNb3VzZUV2ZW50RnVuY3Rpb24oZXZGbilcbiAgICB9XG5cbn1cblxuY29uc3QgcGFpcnM6IE1hcE9mRXZlbnROYW1lMkZ1bmN0aW9uID0ge1wibW91c2VvdmVyXCI6IG1vdXNlRXZlbnRGdW5jdGlvbn07XG5leHBlY3RzTW91c2VFdmVudEZ1bmN0aW9uUGFpcnMocGFpcnMpOyovXG5cblxuLy8gLy8gSFRNTFRhZzJIVE1MRWxlbWVudDxcImFcIj4g4oaSIEhUTUxBbmNob3JFbGVtZW50XG4vLyB0eXBlIEhUTUxUYWcySFRNTEVsZW1lbnQ8SyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4gPSB7XG4vLyAgICAgW1AgaW4gS106IEhUTUxFbGVtZW50VGFnTmFtZU1hcFtQXVxuLy8gfVtLXVxuLy9cbi8vIC8vIEhUTUxUYWcySFRNTEVsZW1lbnQyW1wiYVwiXSDihpIgSFRNTEFuY2hvckVsZW1lbnRcbi8vIHR5cGUgSFRNTFRhZzJIVE1MRWxlbWVudDIgPSB7XG4vLyAgICAgW1AgaW4ga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwXTogSFRNTEVsZW1lbnRUYWdOYW1lTWFwW1BdXG4vLyB9XG4vL1xuLy8gLy8gY29uc3QgYTogSFRNTFRhZzJIVE1MRWxlbWVudDxcImFcIj4gPSB1bmRlZmluZWQ7XG4vLyAvLyBjb25zdCBiOiBIVE1MVGFnMkhUTUxFbGVtZW50MltcImFcIl0gPSB1bmRlZmluZWQ7XG5cblxuLyoqXG4gKiBcImFcIiwgXCJkaXZcIlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGZvbyA9IDxLIGV4dGVuZHMgVGFnPih0YWc6IEspID0+IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAqIGZvbyhcImFcIikg4oaSIEhUTUxBbmNob3JFbGVtZW50XG4gKiBmb28oXCJCQURcIikgLy8gZXJyb3JcbiAqL1xuZXhwb3J0IHR5cGUgVGFnID0gRXhjbHVkZTxrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsIFwib2JqZWN0XCI+O1xuZXhwb3J0IHR5cGUgTm90VGFnPFQgZXh0ZW5kcyBUYWc+ID0gRXhjbHVkZTxUYWcsIFQ+O1xuZXhwb3J0IHR5cGUgUXVlcnlPclByZWNpc2VUYWc8USwgVCBleHRlbmRzIFRhZz4gPSBFeGNsdWRlPFEsIFF1ZXJ5U2VsZWN0b3I8Tm90VGFnPFQ+Pj47XG4vLyAvKipcbi8vICAqXCJhXCIsIFwiZGl2XCIsIFwiZ2lsYWRcIi5cbi8vICAqVGFnMkVsZW1lbnQgZXhwZWN0cyBhIHRhZyBhbmQgcmV0dXJucyBhbiBIVE1MRWxlbWVudC5cbi8vICAqQGV4YW1wbGVcbi8vICAqY29uc3QgYmF6ID0gPEsgZXh0ZW5kcyBUYWcgfCBzdHJpbmc+KHF1ZXJ5OiBLKSA9PiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHF1ZXJ5KTtcbi8vICAqYmF6KFwiZGl2XCIpIOKGkiBIVE1MRGl2RWxlbWVudFxuLy8gICpiYXooXCJkaXZhXCIpIOKGkiBIVE1MU2VsZWN0RWxlbWVudCB8IEhUTUxMZWdlbmRFbGVtZW50IHwgLi4uXG4vLyAgKi9cbi8vIHR5cGUgVGFnMkVsZW1lbnQ8SyBleHRlbmRzIFRhZyA9IFRhZz4gPSBLIGV4dGVuZHMgVGFnID8gSFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdIDogSFRNTEVsZW1lbnRUYWdOYW1lTWFwW1RhZ11cbmV4cG9ydCB0eXBlIFRhZ09yU3RyaW5nID0gVGFnIHwgc3RyaW5nO1xuLyoqXG4gKiBcImFcIiwgXCJkaXZcIiwgXCJnaWxhZFwiLlxuICogUXVlcnlTZWxlY3RvciBleHBlY3RzIGEgdGFnIGFuZCByZXR1cm5zIGEgVGFnLlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGJhciA9IDxLIGV4dGVuZHMgVGFnIHwgc3RyaW5nPihxdWVyeTogUXVlcnlTZWxlY3RvcjxLPikgPT4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihxdWVyeSk7XG4gKiBiYXIoXCJhXCIpIOKGkiBIVE1MQW5jaG9yRWxlbWVudFxuICogYmFyKFwiZ2lsYWRcIikg4oaSIEhUTUxTZWxlY3RFbGVtZW50IHwgSFRNTExlZ2VuZEVsZW1lbnQgfCAuLi5cbiAqL1xuZXhwb3J0IHR5cGUgUXVlcnlTZWxlY3RvcjxLIGV4dGVuZHMgVGFnT3JTdHJpbmcgPSBUYWdPclN0cmluZz4gPSBLIGV4dGVuZHMgVGFnID8gSyA6IHN0cmluZztcblxuLy8gY29uc3QgZm9vID0gPEsgZXh0ZW5kcyBUYWc+KHRhZzogSykgPT4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuXG4vLyBjb25zdCBiYXogPSA8SyBleHRlbmRzIFRhZyB8IHN0cmluZz4ocXVlcnk6IEspID0+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocXVlcnkpO1xuXG4vLyBjb25zdCBiYXIgPSA8SyBleHRlbmRzIFRhZyB8IHN0cmluZz4ocXVlcnk6IFF1ZXJ5U2VsZWN0b3I8Sz4pID0+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocXVlcnkpO1xuXG4vLyBUYWcyQkhFW1wiYVwiXSDihpIgQW5jaG9yXG4vKlxuaW50ZXJmYWNlIFRhZzJCSEUge1xuICAgIFwiaW1nXCI6IEltZyxcbiAgICBcImFcIjogQW5jaG9yLFxuICAgIFwiaW5wdXRcIjogSW5wdXQ8SFRNTElucHV0RWxlbWVudD4sXG4gICAgXCJkaXZcIjogRGl2LFxuICAgIFwicFwiOiBQYXJhZ3JhcGgsXG4gICAgXCJidXR0b25cIjogQnV0dG9uLFxuICAgIFwic3BhblwiOiBTcGFuLFxufVxuKi9cblxuXG4vLyB0eXBlIEJIRVRhZyA9IGtleW9mIFRhZzJCSEU7XG4vLyB0eXBlIEJIRUhUTUxFbGVtZW50ID1cbi8vICAgICBIVE1MQW5jaG9yRWxlbWVudCB8XG4vLyAgICAgSFRNTElucHV0RWxlbWVudCB8XG4vLyAgICAgSFRNTEltYWdlRWxlbWVudCB8XG4vLyAgICAgSFRNTFBhcmFncmFwaEVsZW1lbnQgfFxuLy8gICAgIEhUTUxEaXZFbGVtZW50IHxcbi8vICAgICBIVE1MQnV0dG9uRWxlbWVudCB8XG4vLyAgICAgSFRNTFNwYW5FbGVtZW50O1xuLy9cbi8vIHR5cGUgU3RkQkhFSFRNTEVsZW1lbnQgPVxuLy8gICAgIEhUTUxQYXJhZ3JhcGhFbGVtZW50IHxcbi8vICAgICBIVE1MRGl2RWxlbWVudCB8XG4vLyAgICAgSFRNTEJ1dHRvbkVsZW1lbnQgfFxuLy8gICAgIEhUTUxTcGFuRWxlbWVudFxuXG5leHBvcnQgdHlwZSBFbGVtZW50MlRhZzxUPiA9XG4gICAgVCBleHRlbmRzIEhUTUxJbnB1dEVsZW1lbnQgPyBcImlucHV0XCJcbiAgICAgICAgOiBUIGV4dGVuZHMgSFRNTEFuY2hvckVsZW1lbnQgPyBcImFcIlxuICAgICAgICA6IFQgZXh0ZW5kcyBIVE1MSW1hZ2VFbGVtZW50ID8gXCJpbWdcIlxuICAgICAgICAgICAgOiBUYWdcblxuLy8gdHlwZSBNYXBWYWx1ZXM8VD4gPSB7IFtLIGluIGtleW9mIFRdOiBUW0tdIH1ba2V5b2YgVF07XG5cbi8vIEhUTUxEaXZFbGVtZW50LCAuLi5cbi8vIHR5cGUgSFRNTEVsZW1lbnRzID0gTWFwVmFsdWVzPEhUTUxFbGVtZW50VGFnTmFtZU1hcD47XG4vLyB0eXBlIEZpbHRlcjxUPiA9IFQgZXh0ZW5kcyBIVE1MRWxlbWVudHMgPyBUIDogbmV2ZXI7XG4vLyB0eXBlIEdlbmVyaWNGaWx0ZXI8VCwgVT4gPSBUIGV4dGVuZHMgVSA/IFQgOiBuZXZlcjtcblxuLy8gY29uc3Qgd2hhdDogRWxlbWVudDJUYWc8SFRNTERpdkVsZW1lbnQ+ID0gdW5kZWZpbmVkO1xuLy8gY29uc3Qgd2hhdDogRmlsdGVyPEhUTUxJbnB1dEVsZW1lbnQsIEhUTUxFbGVtZW50cz4gPSB1bmRlZmluZWQ7XG4vLyBjb25zdCB3aGF0OiBGaWx0ZXI8SFRNTElucHV0RWxlbWVudD4gPSB1bmRlZmluZWQ7XG4vLyBjb25zdCB3aGF0OiBFbGVtZW50MlRhZzxIVE1MQW5jaG9yRWxlbWVudD4gPSB1bmRlZmluZWQ7XG5cblxuLy8gdHlwZSBDaGlsZHJlbk9iaiA9IFRNYXA8VGFnMkVsZW1lbnQ+IHwgVFJlY01hcDxUYWcyRWxlbWVudD5cbi8vIHR5cGUgQ2hpbGRyZW5PYmogPSBUTWFwPFF1ZXJ5U2VsZWN0b3I+IHwgVFJlY01hcDxRdWVyeVNlbGVjdG9yPlxuZXhwb3J0IHR5cGUgQ2hpbGRyZW5PYmogPSBUUmVjTWFwPFF1ZXJ5U2VsZWN0b3IgfCBCZXR0ZXJIVE1MRWxlbWVudCB8IHR5cGVvZiBCZXR0ZXJIVE1MRWxlbWVudD5cbmV4cG9ydCB0eXBlIEVudW1lcmF0ZWQ8VD4gPVxuICAgIFQgZXh0ZW5kcyAoaW5mZXIgVSlbXSA/IFtudW1iZXIsIFVdW11cbiAgICAgICAgOiBUIGV4dGVuZHMgVFJlY01hcDwoaW5mZXIgVSk+ID8gW2tleW9mIFQsIFVdW11cbiAgICAgICAgOiBUIGV4dGVuZHMgYm9vbGVhbiA/IG5ldmVyIDogYW55O1xuZXhwb3J0IHR5cGUgUmV0dXJuczxUPiA9IChzOiBzdHJpbmcpID0+IFQ7XG4vLyB0eXBlIFRSZXR1cm5Cb29sZWFuID0gKHM6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuXG5leHBvcnQgdHlwZSBBd2FpdGVkPFQ+ID0gVCBleHRlbmRzIFByb21pc2U8aW5mZXIgVT4gPyBVIDogVDtcbi8vIHR5cGUgQ2FsbGFibGU8VDEsIFQyLCBGPiA9IEYgZXh0ZW5kcyAoYTE6IFQxLCBhMjogVDIpID0+IGluZmVyIFIgPyBSIDogYW55O1xuLy8gdHlwZSBDYWxsYWJsZTI8VDEsIEY+ID0gRiBleHRlbmRzIChhMTogVDEsIGEyOiBIVE1MRWxlbWVudCkgPT4gaW5mZXIgUiA/IFIgOiBhbnk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vIENTUyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBUT0RPOiBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9jc3N0eXBlXG5leHBvcnQgdHlwZSBPbWl0dGVkQ3NzUHJvcHMgPSBcImFuaW1hdGlvbkRpcmVjdGlvblwiXG4gICAgfCBcImFuaW1hdGlvbkZpbGxNb2RlXCJcbiAgICB8IFwiYW5pbWF0aW9uSXRlcmF0aW9uQ291bnRcIlxuICAgIHwgXCJhbmltYXRpb25QbGF5U3RhdGVcIlxuICAgIHwgXCJhbmltYXRpb25UaW1pbmdGdW5jdGlvblwiXG4gICAgfCBcIm9wYWNpdHlcIlxuICAgIHwgXCJwYWRkaW5nXCJcbiAgICB8IFwicGFkZGluZ0JvdHRvbVwiXG4gICAgfCBcInBhZGRpbmdMZWZ0XCJcbiAgICB8IFwicGFkZGluZ1JpZ2h0XCJcbiAgICB8IFwicGFkZGluZ1RvcFwiXG4gICAgfCBcInByZWxvYWRcIlxuICAgIHwgXCJ3aWR0aFwiXG5leHBvcnQgdHlwZSBQYXJ0aWFsQ3NzU3R5bGVEZWNsYXJhdGlvbiA9IE9taXQ8UGFydGlhbDxDU1NTdHlsZURlY2xhcmF0aW9uPiwgT21pdHRlZENzc1Byb3BzPjtcblxuZXhwb3J0IGludGVyZmFjZSBDc3NPcHRpb25zIGV4dGVuZHMgUGFydGlhbENzc1N0eWxlRGVjbGFyYXRpb24ge1xuICAgIGFuaW1hdGlvbkRpcmVjdGlvbj86IEFuaW1hdGlvbkRpcmVjdGlvbjtcbiAgICBhbmltYXRpb25GaWxsTW9kZT86IEFuaW1hdGlvbkZpbGxNb2RlO1xuICAgIGFuaW1hdGlvbkl0ZXJhdGlvbkNvdW50PzogbnVtYmVyO1xuICAgIGFuaW1hdGlvblBsYXlTdGF0ZT86IEFuaW1hdGlvblBsYXlTdGF0ZTtcbiAgICBhbmltYXRpb25UaW1pbmdGdW5jdGlvbj86IEFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uO1xuICAgIG9wYWNpdHk/OiBzdHJpbmcgfCBudW1iZXI7XG4gICAgcGFkZGluZz86IHN0cmluZyB8IG51bWJlcjtcbiAgICBwYWRkaW5nQm90dG9tPzogc3RyaW5nIHwgbnVtYmVyO1xuICAgIHBhZGRpbmdMZWZ0Pzogc3RyaW5nIHwgbnVtYmVyO1xuICAgIHBhZGRpbmdSaWdodD86IHN0cmluZyB8IG51bWJlcjtcbiAgICBwYWRkaW5nVG9wPzogc3RyaW5nIHwgbnVtYmVyO1xuICAgIHByZWxvYWQ/OiBcImF1dG9cIiB8IHN0cmluZztcbiAgICB3aWR0aD86IHN0cmluZyB8IG51bWJlcjtcbn1cblxuXG5leHBvcnQgdHlwZSBDdWJpY0JlemllckZ1bmN0aW9uID0gW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG5leHBvcnQgdHlwZSBKdW1wdGVybSA9ICdqdW1wLXN0YXJ0JyB8ICdqdW1wLWVuZCcgfCAnanVtcC1ub25lJyB8ICdqdW1wLWJvdGgnIHwgJ3N0YXJ0JyB8ICdlbmQnO1xuXG4vKipEaXNwbGF5cyBhbiBhbmltYXRpb24gaXRlcmF0aW9uIGFsb25nIG4gc3RvcHMgYWxvbmcgdGhlIHRyYW5zaXRpb24sIGRpc3BsYXlpbmcgZWFjaCBzdG9wIGZvciBlcXVhbCBsZW5ndGhzIG9mIHRpbWUuXG4gKiBGb3IgZXhhbXBsZSwgaWYgbiBpcyA1LCAgdGhlcmUgYXJlIDUgc3RlcHMuXG4gKiBXaGV0aGVyIHRoZSBhbmltYXRpb24gaG9sZHMgdGVtcG9yYXJpbHkgYXQgMCUsIDIwJSwgNDAlLCA2MCUgYW5kIDgwJSwgb24gdGhlIDIwJSwgNDAlLCA2MCUsIDgwJSBhbmQgMTAwJSwgb3IgbWFrZXMgNSBzdG9wcyBiZXR3ZWVuIHRoZSAwJSBhbmQgMTAwJSBhbG9uZyB0aGUgYW5pbWF0aW9uLCBvciBtYWtlcyA1IHN0b3BzIGluY2x1ZGluZyB0aGUgMCUgYW5kIDEwMCUgbWFya3MgKG9uIHRoZSAwJSwgMjUlLCA1MCUsIDc1JSwgYW5kIDEwMCUpIGRlcGVuZHMgb24gd2hpY2ggb2YgdGhlIGZvbGxvd2luZyBqdW1wIHRlcm1zIGlzIHVzZWQqL1xuZXhwb3J0IHR5cGUgU3RlcHNGdW5jdGlvbiA9IFtudW1iZXIsIEp1bXB0ZXJtXTtcbmV4cG9ydCB0eXBlIEFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uID1cbiAgICAnbGluZWFyJ1xuICAgIHwgJ2Vhc2UnXG4gICAgfCAnZWFzZS1pbidcbiAgICB8ICdlYXNlLW91dCdcbiAgICB8ICdlYXNlLWluLW91dCdcbiAgICB8ICdzdGVwLXN0YXJ0J1xuICAgIHwgJ3N0ZXAtZW5kJ1xuICAgIHwgU3RlcHNGdW5jdGlvblxuICAgIHwgQ3ViaWNCZXppZXJGdW5jdGlvblxuZXhwb3J0IHR5cGUgQW5pbWF0aW9uRGlyZWN0aW9uID0gJ25vcm1hbCcgfCAncmV2ZXJzZScgfCAnYWx0ZXJuYXRlJyB8ICdhbHRlcm5hdGUtcmV2ZXJzZSc7XG5leHBvcnQgdHlwZSBBbmltYXRpb25GaWxsTW9kZSA9ICdub25lJyB8ICdmb3J3YXJkcycgfCAnYmFja3dhcmRzJyB8ICdib3RoJztcblxuZXhwb3J0IGludGVyZmFjZSBUcmFuc2Zvcm1PcHRpb25zIHtcbiAgICBtYXRyaXg/OiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl0sXG4gICAgbWF0cml4M2Q/OiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXSxcbiAgICBwZXJzcGVjdGl2ZT86IHN0cmluZywgLy8gcHhcbiAgICByb3RhdGU/OiBzdHJpbmcsIC8vIGRlZ1xuICAgIHJvdGF0ZTNkPzogW251bWJlciwgbnVtYmVyLCBudW1iZXIsIHN0cmluZ10gLy8gWywsLGRlZ11cbiAgICByb3RhdGVYPzogc3RyaW5nLFxuICAgIHJvdGF0ZVk/OiBzdHJpbmcsXG4gICAgcm90YXRlWj86IHN0cmluZyxcbiAgICBzY2FsZT86IG51bWJlciwgLy8gMS41XG4gICAgc2NhbGUzZD86IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXSxcbiAgICBzY2FsZVg/OiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0sXG4gICAgc2NhbGVZPzogW251bWJlciwgbnVtYmVyLCBudW1iZXJdLFxuICAgIHNrZXc/OiBbc3RyaW5nLCBzdHJpbmddIC8vIGRlZywgZGVnXG4gICAgc2tld1g/OiBzdHJpbmcsXG4gICAgc2tld1k/OiBzdHJpbmcsXG4gICAgdHJhbnNsYXRlPzogW3N0cmluZywgc3RyaW5nXSwgLy8gcHgsIHB4XG4gICAgdHJhbnNsYXRlM2Q/OiBbc3RyaW5nLCBzdHJpbmcsIHN0cmluZ10sXG4gICAgdHJhbnNsYXRlWD86IHN0cmluZyxcbiAgICB0cmFuc2xhdGVZPzogc3RyaW5nLFxuICAgIHRyYW5zbGF0ZVo/OiBzdHJpbmcsXG5cblxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGVPcHRpb25zIHtcbiAgICBkZWxheT86IHN0cmluZztcbiAgICBkaXJlY3Rpb24/OiBBbmltYXRpb25EaXJlY3Rpb247XG4gICAgZHVyYXRpb246IHN0cmluZztcbiAgICBmaWxsTW9kZT86IEFuaW1hdGlvbkZpbGxNb2RlO1xuICAgIGl0ZXJhdGlvbkNvdW50PzogbnVtYmVyO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBwbGF5U3RhdGU/OiBBbmltYXRpb25QbGF5U3RhdGU7XG4gICAgLyoqIEFsc28gYWNjZXB0czpcbiAgICAgKiBjdWJpYy1iZXppZXIocDEsIHAyLCBwMywgcDQpXG4gICAgICogJ2Vhc2UnID09ICdjdWJpYy1iZXppZXIoMC4yNSwgMC4xLCAwLjI1LCAxLjApJ1xuICAgICAqICdsaW5lYXInID09ICdjdWJpYy1iZXppZXIoMC4wLCAwLjAsIDEuMCwgMS4wKSdcbiAgICAgKiAnZWFzZS1pbicgPT0gJ2N1YmljLWJlemllcigwLjQyLCAwLCAxLjAsIDEuMCknXG4gICAgICogJ2Vhc2Utb3V0JyA9PSAnY3ViaWMtYmV6aWVyKDAsIDAsIDAuNTgsIDEuMCknXG4gICAgICogJ2Vhc2UtaW4tb3V0JyA9PSAnY3ViaWMtYmV6aWVyKDAuNDIsIDAsIDAuNTgsIDEuMCknXG4gICAgICogKi9cbiAgICB0aW1pbmdGdW5jdGlvbj86IEFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uO1xufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gKioqIFV0aWxpdGllc1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGZ1bmN0aW9uIGVudW1lcmF0ZShvYmo6IHVuZGVmaW5lZCk6IFt2b2lkXTtcblxuLy8gZnVuY3Rpb24gZW51bWVyYXRlPFQ+KG9iajogVCk6IG5ldmVyO1xuLy8gZnVuY3Rpb24gZW51bWVyYXRlPFQ+KG9iajogVCk6IFtrZXlvZiBULCBUW2tleW9mIFRdXVtdO1xuXG5cbi8vIGZ1bmN0aW9uIGVudW1lcmF0ZTxUPihvYmo6IFQpOiBUIGV4dGVuZHMgc3RyaW5nW11cbi8vICAgICA/IFtudW1iZXIsIHN0cmluZ11bXVxuLy8gICAgIDogW2tleW9mIFQsIFRba2V5b2YgVF1dW10ge1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBlbnVtZXJhdGU8VD4ob2JqOiBUKTogRW51bWVyYXRlZDxUPiB7XG4gICAgLy8gdW5kZWZpbmVkICAgIFtdXG4gICAgLy8ge30gICAgICAgICAgIFtdXG4gICAgLy8gW10gICAgICAgICAgIFtdXG4gICAgLy8gXCJcIiAgICAgICAgICAgW11cbiAgICAvLyBudW1iZXIgICAgICAgVHlwZUVycm9yXG4gICAgLy8gbnVsbCAgICAgICAgIFR5cGVFcnJvclxuICAgIC8vIGJvb2xlYW4gICAgICBUeXBlRXJyb3JcbiAgICAvLyBGdW5jdGlvbiAgICAgVHlwZUVycm9yXG4gICAgLy8gXCJmb29cIiAgICAgICAgWyBbMCwgXCJmXCJdLCBbMSwgXCJvXCJdLCBbMiwgXCJvXCJdIF1cbiAgICAvLyBbIFwiZm9vXCIgXSAgICBbIFswLCBcImZvb1wiXSBdXG4gICAgLy8gWyAxMCBdICAgICAgIFsgWzAsIDEwXSBdXG4gICAgLy8geyBhOiBcImZvb1wiIH0gWyBbXCJhXCIsIFwiZm9vXCJdIF1cbiAgICAvLyAvLyAoKT0+e30gICAgP1xuICAgIGxldCB0eXBlb2ZPYmogPSB0eXBlb2Ygb2JqO1xuICAgIGlmIChcbiAgICAgICAgb2JqID09PSB1bmRlZmluZWRcbiAgICAgICAgfHwgaXNFbXB0eU9iaihvYmopXG4gICAgICAgIHx8IGlzRW1wdHlBcnIob2JqKVxuICAgICAgICB8fCBvYmogPT09IFwiXCJcbiAgICApIHtcbiAgICAgICAgcmV0dXJuIFtdIGFzIEVudW1lcmF0ZWQ8VD47XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgICBvYmogPT09IG51bGxcbiAgICAgICAgfHwgdHlwZW9mT2JqID09PSBcImJvb2xlYW5cIlxuICAgICAgICB8fCB0eXBlb2ZPYmogPT09IFwibnVtYmVyXCJcbiAgICAgICAgfHwgdHlwZW9mT2JqID09PSBcImZ1bmN0aW9uXCJcbiAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgJHt0eXBlb2ZPYmp9IG9iamVjdCBpcyBub3QgaXRlcmFibGVgKTtcbiAgICB9XG4gICAgbGV0IGFycmF5ID0gW107XG4gICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICBsZXQgaTogbnVtYmVyID0gMDtcbiAgICAgICAgZm9yIChsZXQgeCBvZiBvYmopIHtcbiAgICAgICAgICAgIGFycmF5LnB1c2goW2ksIHhdKTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IHByb3AgaW4gb2JqKSB7XG4gICAgICAgICAgICBhcnJheS5wdXNoKFtwcm9wLCBvYmpbcHJvcF1dKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXkgYXMgRW51bWVyYXRlZDxUPjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhaXQobXM6IG51bWJlcik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYm9vbCh2YWw6IGFueSk6IGJvb2xlYW4ge1xuICAgIC8vIDAgICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gMSAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vICcwJyAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyAnMScgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gJyAnICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vICcnICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJ2ZvbycgICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vICgpPT57fSAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyBCb29sZWFuICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gQm9vbGVhbigpICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuKGZhbHNlKSAgICAgICBmYWxzZVxuICAgIC8vIEJvb2xlYW4odHJ1ZSkgICAgICAgIHRydWVcbiAgICAvLyBGdW5jdGlvbiAgICAgICAgICAgICB0cnVlXG4gICAgLy8gRnVuY3Rpb24oKSAgICAgICAgICAgdHJ1ZVxuICAgIC8vIE51bWJlciAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyBOdW1iZXIoMCkgICAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlcigxKSAgICAgICAgICAgIHRydWVcbiAgICAvLyBOdW1iZXIoKSAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIFsgMCBdICAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyBbIDEgXSAgICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gWyBbXSBdICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIFsgZmFsc2UgXSAgICAgICAgICAgIHRydWVcbiAgICAvLyBbIHRydWUgXSAgICAgICAgICAgICB0cnVlXG4gICAgLy8gW10gICAgICAgICAgICAgICAgICAgZmFsc2UgICAgICAgdW5saWtlIG5hdGl2ZVxuICAgIC8vIGRvY3VtZW50LmJvZHkgICAgICAgIHRydWVcbiAgICAvLyBmYWxzZSAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIGZ1bmN0aW9uKCl7fSAgICAgICAgIHRydWVcbiAgICAvLyBuZXcgQm9vbGVhbiAgICAgICAgICBmYWxzZSAgICAgICB1bmxpa2UgbmF0aXZlXG4gICAgLy8gbmV3IEJvb2xlYW4oKSAgICAgICAgZmFsc2UgICAgICAgdW5saWtlIG5hdGl2ZVxuICAgIC8vIG5ldyBCb29sZWFuKGZhbHNlKSAgIGZhbHNlICAgICAgIHVubGlrZSBuYXRpdmVcbiAgICAvLyBuZXcgQm9vbGVhbih0cnVlKSAgICB0cnVlXG4gICAgLy8gbmV3IEZ1bmN0aW9uICAgICAgICAgdHJ1ZVxuICAgIC8vIG5ldyBGdW5jdGlvbigpICAgICAgIHRydWVcbiAgICAvLyBuZXcgTnVtYmVyICAgICAgICAgICBmYWxzZSAgICAgICB1bmxpa2UgbmF0aXZlXG4gICAgLy8gbmV3IE51bWJlcigwKSAgICAgICAgZmFsc2UgICAgICAgdW5saWtlIG5hdGl2ZVxuICAgIC8vIG5ldyBOdW1iZXIoMSkgICAgICAgIHRydWVcbiAgICAvLyBuZXcgTnVtYmVyKCkgICAgICAgICBmYWxzZSAgICAgICB1bmxpa2UgbmF0aXZlXG4gICAgLy8gbmV3IFRpbWVsaW5lKC4uLikgICAgdHJ1ZVxuICAgIC8vIG5ldyBjbGFzc3t9ICAgICAgICAgIGZhbHNlICAgICAgIHVubGlrZSBuYXRpdmVcbiAgICAvLyBudWxsICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHRydWUgICAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyB1bmRlZmluZWQgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHsgaGkgOiAnYnllJyB9ICAgICAgIHRydWVcbiAgICAvLyB7fSAgICAgICAgICAgICAgICAgICBmYWxzZSAgICAgICB1bmxpa2UgbmF0aXZlXG5cblxuICAgIGlmICghdmFsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgdHlwZW9mdmFsID0gdHlwZW9mIHZhbDtcbiAgICBpZiAodHlwZW9mdmFsICE9PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAodHlwZW9mdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAhIXZhbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBsZXQga2V5c0xlbmd0aCA9IE9iamVjdC5rZXlzKHZhbCkubGVuZ3RoO1xuICAgIGxldCB0b1N0cmluZ2VkID0ge30udG9TdHJpbmcuY2FsbCh2YWwpO1xuICAgIGlmICh0b1N0cmluZ2VkID09PSAnW29iamVjdCBPYmplY3RdJyB8fCB0b1N0cmluZ2VkID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwpLmxlbmd0aCAhPT0gMDtcbiAgICB9XG5cbiAgICAvLyBCb29sZWFuLCBOdW1iZXIsIEhUTUxFbGVtZW50Li4uXG4gICAgcmV0dXJuICEhdmFsLnZhbHVlT2YoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQXJyYXk8VD4ob2JqKTogb2JqIGlzIEFycmF5PFQ+IHsgLy8gc2FtZSBhcyBBcnJheS5pc0FycmF5XG4gICAgLy8gMCAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIDEgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnJyAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJyAnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICdmb28nICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMCcgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzEnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICgpPT57fSAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbigpICAgICAgICAgICBmYWxzZVxuICAgIC8vIEZ1bmN0aW9uICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBGdW5jdGlvbigpICAgICAgICAgIGZhbHNlXG4gICAgLy8gTnVtYmVyICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlcigpICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAvIFsgMSBdICAgICAgICAgICAgIHRydWVcbiAgICAvLyAvIFtdICAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyBmYWxzZSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gZnVuY3Rpb24oKXt9ICAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBCb29sZWFuKCkgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbihmYWxzZSkgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4odHJ1ZSkgICBmYWxzZVxuICAgIC8vIG5ldyBGdW5jdGlvbigpICAgICAgZmFsc2VcbiAgICAvLyBuZXcgTnVtYmVyKDApICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigxKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoKSAgICAgICAgZmFsc2VcbiAgICAvLyBudWxsICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdHJ1ZSAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHVuZGVmaW5lZCAgICAgICAgICAgZmFsc2VcbiAgICAvLyB7IGhpIDogJ2J5ZScgfSAgICAgIGZhbHNlXG4gICAgLy8ge30gICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIGlmICghb2JqKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogIT09ICdzdHJpbmcnICYmIChBcnJheS5pc0FycmF5KG9iaikgfHwgdHlwZW9mIG9ialtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHlBcnIoY29sbGVjdGlvbik6IGJvb2xlYW4ge1xuICAgIC8vIDAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAxICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJycgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcgJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMCcgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzEnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICgpPT57fSAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbigpICAgICAgICAgICBmYWxzZVxuICAgIC8vIEZ1bmN0aW9uICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBGdW5jdGlvbigpICAgICAgICAgIGZhbHNlXG4gICAgLy8gTnVtYmVyICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlcigpICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBbIDEgXSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gLyBbXSAgICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gZmFsc2UgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIGZ1bmN0aW9uKCl7fSAgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbigpICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4oZmFsc2UpICBmYWxzZVxuICAgIC8vIG5ldyBCb29sZWFuKHRydWUpICAgZmFsc2VcbiAgICAvLyBuZXcgRnVuY3Rpb24oKSAgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigwKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoMSkgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgTnVtYmVyKCkgICAgICAgIGZhbHNlXG4gICAgLy8gbnVsbCAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHRydWUgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB1bmRlZmluZWQgICAgICAgICAgIGZhbHNlXG4gICAgLy8geyBoaSA6ICdieWUnIH0gICAgICBmYWxzZVxuICAgIC8vIHt9ICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICByZXR1cm4gaXNBcnJheShjb2xsZWN0aW9uKSAmJiBnZXRMZW5ndGgoY29sbGVjdGlvbikgPT09IDBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHlPYmoob2JqKTogYm9vbGVhbiB7XG4gICAgLy8gMCAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIDEgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnJyAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJyAnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcwJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMScgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gKCk9Pnt9ICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIEJvb2xlYW4gICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuKCkgICAgICAgICAgIGZhbHNlXG4gICAgLy8gRnVuY3Rpb24gICAgICAgICAgICBmYWxzZVxuICAgIC8vIEZ1bmN0aW9uKCkgICAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gTnVtYmVyKCkgICAgICAgICAgICBmYWxzZVxuICAgIC8vIFsgMSBdICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBbXSAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gZmFsc2UgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIGZ1bmN0aW9uKCl7fSAgICAgICAgZmFsc2VcbiAgICAvLyAvIG5ldyBCb29sZWFuKCkgICAgIHRydWVcbiAgICAvLyAvIG5ldyBCb29sZWFuKGZhbHNlKXRydWVcbiAgICAvLyAvIG5ldyBCb29sZWFuKHRydWUpIHRydWVcbiAgICAvLyBuZXcgRnVuY3Rpb24oKSAgICAgIGZhbHNlXG4gICAgLy8gLyBuZXcgTnVtYmVyKDApICAgICB0cnVlXG4gICAgLy8gLyBuZXcgTnVtYmVyKDEpICAgICB0cnVlXG4gICAgLy8gLyBuZXcgTnVtYmVyKCkgICAgICB0cnVlXG4gICAgLy8gbnVsbCAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHRydWUgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB1bmRlZmluZWQgICAgICAgICAgIGZhbHNlXG4gICAgLy8geyBoaSA6ICdieWUnIH0gICAgICBmYWxzZVxuICAgIC8vIC8ge30gICAgICAgICAgICAgICAgdHJ1ZVxuICAgIHJldHVybiBpc09iamVjdChvYmopICYmICFpc0FycmF5KG9iaikgJiYgT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDBcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbjxGPihmbjogRik6IGZuIGlzIEZcbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKGZuOiAoLi4uYXJnczogYW55W10pID0+IGFueSk6IGZuIGlzICguLi5hcmdzOiBhbnlbXSkgPT4gYW55XG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbihmbikge1xuICAgIC8vIDAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAxICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJycgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcgJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMCcgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzEnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIC8gKCk9Pnt9ICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gLyBCb29sZWFuICAgICAgICAgICAgIHRydWVcbiAgICAvLyBCb29sZWFuKCkgICAgICAgICAgIGZhbHNlXG4gICAgLy8gLyBGdW5jdGlvbiAgICAgICAgICAgIHRydWVcbiAgICAvLyAvIEZ1bmN0aW9uKCkgICAgICAgICAgdHJ1ZVxuICAgIC8vIC8gTnVtYmVyICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gTnVtYmVyKCkgICAgICAgICAgICBmYWxzZVxuICAgIC8vIFsgMSBdICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBbXSAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gZmFsc2UgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIC8gZnVuY3Rpb24oKXt9ICAgICAgICB0cnVlXG4gICAgLy8gbmV3IEJvb2xlYW4oKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBCb29sZWFuKGZhbHNlKSAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbih0cnVlKSAgIGZhbHNlXG4gICAgLy8gLyBuZXcgRnVuY3Rpb24oKSAgICAgIHRydWVcbiAgICAvLyBuZXcgTnVtYmVyKDApICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigxKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoKSAgICAgICAgZmFsc2VcbiAgICAvLyBudWxsICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdHJ1ZSAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHVuZGVmaW5lZCAgICAgICAgICAgZmFsc2VcbiAgICAvLyB7IGhpIDogJ2J5ZScgfSAgICAgIGZhbHNlXG4gICAgLy8ge30gICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIGxldCB0b1N0cmluZ2VkID0ge30udG9TdHJpbmcuY2FsbChmbik7XG4gICAgcmV0dXJuICEhZm4gJiYgdG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW55RGVmaW5lZChvYmopOiBib29sZWFuIHtcbiAgICBsZXQgYXJyYXk7XG4gICAgaWYgKGlzT2JqZWN0KG9iaikpIHtcbiAgICAgICAgYXJyYXkgPSBPYmplY3QudmFsdWVzKG9iaik7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgYXJyYXkgPSBvYmo7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0ZWQgYXJyYXkgb3Igb2JqLCBnb3Q6ICR7dHlwZW9mIG9ian1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5LmZpbHRlcih4ID0+IHggIT09IHVuZGVmaW5lZCkubGVuZ3RoID4gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueVRydXRoeShvYmopOiBib29sZWFuIHtcbiAgICBsZXQgYXJyYXk7XG4gICAgaWYgKGlzT2JqZWN0KG9iaikpIHtcbiAgICAgICAgYXJyYXkgPSBPYmplY3QudmFsdWVzKG9iaik7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgYXJyYXkgPSBvYmo7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0ZWQgYXJyYXkgb3Igb2JqLCBnb3Q6ICR7dHlwZW9mIG9ian1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5LmZpbHRlcih4ID0+IGJvb2woeCkpLmxlbmd0aCA+IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbGxVbmRlZmluZWQob2JqKTogYm9vbGVhbiB7XG4gICAgbGV0IGFycmF5O1xuICAgIGlmIChpc09iamVjdChvYmopKSB7XG4gICAgICAgIGFycmF5ID0gT2JqZWN0LnZhbHVlcyhvYmopXG4gICAgfSBlbHNlIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgYXJyYXkgPSBvYmo7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0ZWQgYXJyYXkgb3Igb2JqLCBnb3Q6ICR7dHlwZW9mIG9ian1gKVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXkuZmlsdGVyKHggPT4geCAhPT0gdW5kZWZpbmVkKS5sZW5ndGggPT09IDBcbn1cblxuLyoqQ2hlY2sgZXZlcnkgYGNoZWNrSW50ZXJ2YWxgIG1zIGlmIGBjb25kKClgIGlzIHRydXRoeS4gSWYsIHdpdGhpbiBgdGltZW91dGAsIGNvbmQoKSBpcyB0cnV0aHksIHJldHVybiBgdHJ1ZWAuIFJldHVybiBgZmFsc2VgIGlmIHRpbWUgaXMgb3V0LlxuICogQGV4YW1wbGVcbiAqIC8vIEdpdmUgdGhlIHVzZXIgYSAyMDBtcyBjaGFuY2UgdG8gZ2V0IGhlciBwb2ludGVyIG92ZXIgXCJteWRpdlwiLiBDb250aW51ZSBpbW1lZGlhdGVseSBvbmNlIHNoZSBkb2VzLCBvciBhZnRlciAyMDBtcyBpZiBzaGUgZG9lc24ndC5cbiAqIG15ZGl2LnBvaW50ZXJlbnRlciggKCkgPT4gbXlkaXYucG9pbnRlckhvdmVyaW5nID0gdHJ1ZTsgKVxuICogY29uc3QgcG9pbnRlck9uTXlkaXYgPSBhd2FpdCB3YWl0VW50aWwoKCkgPT4gbXlkaXYucG9pbnRlckhvdmVyaW5nLCAyMDAsIDEwKTsqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdhaXRVbnRpbChjb25kOiAoKSA9PiBib29sZWFuLCBjaGVja0ludGVydmFsOiBudW1iZXIgPSAyMCwgdGltZW91dDogbnVtYmVyID0gSW5maW5pdHkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoY2hlY2tJbnRlcnZhbCA8PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgY2hlY2tJbnRlcnZhbCA8PSAwLiBjaGVja0ludGVydmFsOiAke2NoZWNrSW50ZXJ2YWx9YCk7XG4gICAgfVxuICAgIGlmIChjaGVja0ludGVydmFsID4gdGltZW91dCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGNoZWNrSW50ZXJ2YWwgPiB0aW1lb3V0ICgke2NoZWNrSW50ZXJ2YWx9ID4gJHt0aW1lb3V0fSkuIGNoZWNrSW50ZXJ2YWwgaGFzIHRvIGJlIGxvd2VyIHRoYW4gdGltZW91dC5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBsb29wcyA9IHRpbWVvdXQgLyBjaGVja0ludGVydmFsO1xuICAgIGlmIChsb29wcyA8PSAxKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgbG9vcHMgPD0gMSwgeW91IHByb2JhYmx5IGRpZG4ndCB3YW50IHRoaXMgdG8gaGFwcGVuYCk7XG4gICAgfVxuICAgIGxldCBjb3VudCA9IDA7XG4gICAgd2hpbGUgKGNvdW50IDwgbG9vcHMpIHtcbiAgICAgICAgaWYgKGNvbmQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgd2FpdChjaGVja0ludGVydmFsKTtcbiAgICAgICAgY291bnQrKztcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNCSEU8VCBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50PihiaGU6IFQsIGJoZVN1YlR5cGUpOiBiaGUgaXMgVCB7XG4gICAgcmV0dXJuIChiaGUgaW5zdGFuY2VvZiBiaGVTdWJUeXBlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNUeXBlPFQ+KGFyZzogVCk6IGFyZyBpcyBUIHtcbiAgICByZXR1cm4gdHJ1ZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNUTWFwPFQ+KG9iajogVE1hcDxUPik6IG9iaiBpcyBUTWFwPFQ+IHtcbiAgICAvLyAwICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gMSAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcnICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnICcgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzAnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcxJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAoKT0+e30gICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbiAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIEJvb2xlYW4oKSAgICAgICAgICAgZmFsc2VcbiAgICAvLyBGdW5jdGlvbiAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gRnVuY3Rpb24oKSAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlciAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIoKSAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gWyAxIF0gICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBbXSAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIGZhbHNlICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBmdW5jdGlvbigpe30gICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4oKSAgICAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbihmYWxzZSlmYWxzZVxuICAgIC8vIG5ldyBCb29sZWFuKHRydWUpIGZhbHNlXG4gICAgLy8gbmV3IEZ1bmN0aW9uKCkgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoMCkgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigxKSAgICAgZmFsc2VcbiAgICAvLyBuZXcgTnVtYmVyKCkgICAgICBmYWxzZVxuICAgIC8vIG51bGwgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB0cnVlICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdW5kZWZpbmVkICAgICAgICAgICBmYWxzZVxuICAgIC8vIC8geyBoaSA6ICdieWUnIH0gICAgdHJ1ZVxuICAgIC8vIC8ge30gICAgICAgICAgICAgICAgdHJ1ZVxuICAgIHJldHVybiB7fS50b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgT2JqZWN0XSdcbn1cblxuXG4vLyAqICB1bmRlcnNjb3JlLmpzXG4vKip0cnVlIGZvciBhbnkgbm9uLXByaW1pdGl2ZSwgaW5jbHVkaW5nIGFycmF5LCBmdW5jdGlvbiovXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3Qob2JqKTogYm9vbGVhbiB7XG4gICAgLy8gMCAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIDEgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnJyAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJyAnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcwJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMScgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gKCk9Pnt9ICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIEJvb2xlYW4gICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuKCkgICAgICAgICAgIGZhbHNlXG4gICAgLy8gRnVuY3Rpb24gICAgICAgICAgICBmYWxzZVxuICAgIC8vIEZ1bmN0aW9uKCkgICAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gTnVtYmVyKCkgICAgICAgICAgICBmYWxzZVxuICAgIC8vIC8gWyAxIF0gICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIC8gW10gICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIGZhbHNlICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBmdW5jdGlvbigpe30gICAgICAgIGZhbHNlXG4gICAgLy8gLyBuZXcgQm9vbGVhbigpICAgICB0cnVlXG4gICAgLy8gLyBuZXcgQm9vbGVhbihmYWxzZSl0cnVlXG4gICAgLy8gLyBuZXcgQm9vbGVhbih0cnVlKSB0cnVlXG4gICAgLy8gbmV3IEZ1bmN0aW9uKCkgICAgICBmYWxzZVxuICAgIC8vIC8gbmV3IE51bWJlcigwKSAgICAgdHJ1ZVxuICAgIC8vIC8gbmV3IE51bWJlcigxKSAgICAgdHJ1ZVxuICAgIC8vIC8gbmV3IE51bWJlcigpICAgICAgdHJ1ZVxuICAgIC8vIG51bGwgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB0cnVlICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdW5kZWZpbmVkICAgICAgICAgICBmYWxzZVxuICAgIC8vIC8geyBoaSA6ICdieWUnIH0gICAgdHJ1ZVxuICAgIC8vIC8ge30gICAgICAgICAgICAgICAgdHJ1ZVxuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNoYWxsb3dQcm9wZXJ0eTxUPihrZXk6IHN0cmluZyk6IChvYmo6IFQpID0+IFQgZXh0ZW5kcyBudWxsID8gdW5kZWZpbmVkIDogVFtrZXlvZiBUXSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIG9iaiA9PSBudWxsID8gdm9pZCAwIDogb2JqW2tleV07XG4gICAgfTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGVuZ3RoKGNvbGxlY3Rpb24pOiBudW1iZXIge1xuICAgIHJldHVybiBzaGFsbG93UHJvcGVydHkoJ2xlbmd0aCcpKGNvbGxlY3Rpb24pXG59XG5cblxuY29uc3QgTUFYX0FSUkFZX0lOREVYID0gTWF0aC5wb3coMiwgNTMpIC0gMTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzQXJyYXlMaWtlKGNvbGxlY3Rpb24pOiBib29sZWFuIHtcbiAgICBjb25zdCBsZW5ndGggPSBnZXRMZW5ndGgoY29sbGVjdGlvbik7XG4gICAgcmV0dXJuIHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicgJiYgbGVuZ3RoID49IDAgJiYgbGVuZ3RoIDw9IE1BWF9BUlJBWV9JTkRFWDtcbn1cblxuXG4vLyAqICBtaXNjXG4vLyBjaGlsZCBleHRlbmRzIHN1cFxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZChzdXAsIGNoaWxkKSB7XG4gICAgY2hpbGQucHJvdG90eXBlID0gc3VwLnByb3RvdHlwZTtcbiAgICBjb25zdCBoYW5kbGVyID0ge1xuICAgICAgICBjb25zdHJ1Y3RcbiAgICB9O1xuXG4gICAgLy8gXCJuZXcgQm95Q2xzXCJcbiAgICBmdW5jdGlvbiBjb25zdHJ1Y3QoXywgYXJnQXJyYXkpIHtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IGNoaWxkO1xuICAgICAgICBzdXAuYXBwbHkob2JqLCBhcmdBcnJheSk7ICAgIC8vIGNhbGxzIFBlcnNvbkN0b3IuIFNldHMgbmFtZVxuICAgICAgICBjaGlsZC5hcHBseShvYmosIGFyZ0FycmF5KTsgLy8gY2FsbHMgQm95Q3Rvci4gU2V0cyBhZ2VcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cblxuICAgIGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KGNoaWxkLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gcHJveHk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlWYWx1ZShvYmopIHtcbiAgICBsZXQgYXJyYXk7XG4gICAgaWYgKGlzT2JqZWN0KG9iaikpIHtcbiAgICAgICAgYXJyYXkgPSBPYmplY3QudmFsdWVzKG9iaik7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgYXJyYXkgPSBvYmo7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0ZWQgYXJyYXkgb3Igb2JqLCBnb3Q6ICR7dHlwZW9mIG9ian1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5LmZpbHRlcih4ID0+IEJvb2xlYW4oeCkpLmxlbmd0aCA+IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHNBbnkob2JqOiBhbnksIC4uLm90aGVyczogYW55W10pOiBib29sZWFuIHtcbiAgICBpZiAoIW90aGVycykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBldmVuIG9uZSBvdGhlciB3YXMgcGFzc2VkJyk7XG4gICAgfVxuICAgIGxldCBzdHJpY3QgPSAhKGlzQXJyYXlMaWtlKG9iaikgJiYgaXNPYmplY3Qob2JqW29iai5sZW5ndGggLSAxXSkgJiYgb2JqW29iai5sZW5ndGggLSAxXS5zdHJpY3QgPT0gZmFsc2UpO1xuICAgIGNvbnN0IF9pc0VxID0gKF9vYmosIF9vdGhlcikgPT4gc3RyaWN0ID8gX29iaiA9PT0gX290aGVyIDogX29iaiA9PSBfb3RoZXI7XG4gICAgZm9yIChsZXQgb3RoZXIgb2Ygb3RoZXJzKSB7XG4gICAgICAgIGlmIChfaXNFcShvYmosIG90aGVyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9WYWx1ZShvYmopOiBib29sZWFuIHtcbiAgICBsZXQgYXJyYXk7XG4gICAgaWYgKGlzT2JqZWN0KG9iaikpIHtcbiAgICAgICAgYXJyYXkgPSBPYmplY3QudmFsdWVzKG9iailcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICBhcnJheSA9IG9iajtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBleHBlY3RlZCBhcnJheSBvciBvYmosIGdvdDogJHt0eXBlb2Ygb2JqfWApXG4gICAgfVxuICAgIHJldHVybiBhcnJheS5maWx0ZXIoeCA9PiBCb29sZWFuKHgpKS5sZW5ndGggPT09IDBcbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICoqKiBFeGNlcHRpb25zXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXJnc0Z1bGxSZXByKGFyZ3NXaXRoVmFsdWVzOiBUTWFwPGFueT4pOiBzdHJpbmcge1xuICAgIHJldHVybiBPYmplY3QuZW50cmllcyhhcmdzV2l0aFZhbHVlcylcbiAgICAgICAgLmZsYXRNYXAoKFthcmduYW1lLCBhcmd2YWxdKSA9PiBgJHthcmduYW1lfSAoJHt0eXBlb2YgYXJndmFsfSk6ICR7aXNPYmplY3QoYXJndmFsKSA/IGB7JHtnZXRBcmdzRnVsbFJlcHIoYXJndmFsKX19YCA6IGFyZ3ZhbH1gKVxuICAgICAgICAuam9pbignXCIsIFwiJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcmdzV2l0aFZhbHVlcyhwYXNzZWRBcmdzOiBUTWFwPGFueT4pIHtcbiAgICBjb25zdCBhcmdzV2l0aFZhbHVlczogVE1hcDxhbnk+ID0ge307XG4gICAgZm9yIChsZXQgW2FyZ25hbWUsIGFyZ3ZhbF0gb2YgT2JqZWN0LmVudHJpZXMocGFzc2VkQXJncykpIHtcbiAgICAgICAgaWYgKGFyZ3ZhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBhcmdzV2l0aFZhbHVlc1thcmduYW1lXSA9IGFyZ3ZhbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJnc1dpdGhWYWx1ZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdW1tYXJ5KGFyZ3NldDogVE1hcDxhbnk+KTogc3RyaW5nIHtcbiAgICBjb25zdCBhcmdzV2l0aFZhbHVlcyA9IGdldEFyZ3NXaXRoVmFsdWVzKGFyZ3NldCk7XG4gICAgY29uc3QgYXJnc0Z1bGxSZXByOiBzdHJpbmcgPSBnZXRBcmdzRnVsbFJlcHIoYXJnc1dpdGhWYWx1ZXMpO1xuICAgIGxldCBhcmdOYW1lcyA9IE9iamVjdC5rZXlzKGFyZ3NldCk7XG4gICAgcmV0dXJuIGAke2FyZ05hbWVzLmxlbmd0aH0gYXJncyAoJHthcmdOYW1lc30pOyAke09iamVjdC5rZXlzKGFyZ3NXaXRoVmFsdWVzKS5sZW5ndGh9IGhhZCB2YWx1ZTogXCIke2FyZ3NGdWxsUmVwcn1cIi5cXG5gO1xufVxuXG4vKipQcmludHMgd2hhdCB3YXMgZXhwZWN0ZWQgYW5kIHdoYXQgd2FzIGFjdHVhbGx5IHBhc3NlZC4qL1xuZXhwb3J0IGNsYXNzIE11dHVhbGx5RXhjbHVzaXZlQXJncyBleHRlbmRzIEVycm9yIHtcbiAgICAvKipAcGFyYW0gcGFzc2VkQXJncyAtIGtleTp2YWx1ZSBwYWlycyBvZiBhcmdOYW1lOmFyZ1ZhbHVlLCB3aGVyZSBlYWNoIGFyZyBpcyBtdXR1YWxseSBleGNsdXNpdmUgd2l0aCBhbGwgb3RoZXJzKi9cbiAgICBjb25zdHJ1Y3RvcihwYXNzZWRBcmdzOiBUTWFwPGFueT4sIGRldGFpbHM/OiBzdHJpbmcpXG4gICAgLyoqQHBhcmFtIHBhc3NlZEFyZ3MgLSBBcnJheSBvZiBtdXR1YWxseSBleGNsdXNpdmUgc2V0cyBvZiBhcmdzLCB3aGVyZSBhbiBhcmcgZnJvbSBvbmUgc2V0IG1lYW5zIHRoZXJlIGNhbid0IGJlIGFueSBhcmdzIGZyb20gdGhlIG90aGVyIHNldHMuXG4gICAgICogRWFjaCBzZXQgaXMga2V5OnZhbHVlIHBhaXJzIG9mIGFyZ05hbWU6YXJnVmFsdWUuKi9cbiAgICBjb25zdHJ1Y3RvcihwYXNzZWRBcmdzOiBUTWFwPGFueT5bXSwgZGV0YWlscz86IHN0cmluZylcbiAgICAvKipFaXRoZXIgYSBhcmdOYW1lOmFyZ1ZhbHVlIG1hcCBvciBhbiBhcnJheSBvZiBzdWNoIG1hcHMsIHRvIGluZGljYXRlIG11dHVhbGx5IGV4Y2x1c2l2ZSBzZXRzIG9mIGFyZ3MuKi9cbiAgICBjb25zdHJ1Y3RvcihwYXNzZWRBcmdzLCBkZXRhaWxzPzogc3RyaW5nKSB7XG4gICAgICAgIGxldCBtZXNzYWdlID0gYERpZG4ndCByZWNlaXZlIGV4YWN0bHkgb25lIGFyZ2A7XG4gICAgICAgIGlmIChpc0FycmF5KHBhc3NlZEFyZ3MpKSB7XG4gICAgICAgICAgICBtZXNzYWdlICs9IGAgZnJvbSB0aGUgZm9sbG93aW5nIG11dHVhbGx5IGV4Y2x1c2l2ZSBzZXRzIG9mIGFyZ3MuXFxuYDtcbiAgICAgICAgICAgIGZvciAobGV0IFtpLCBhcmdzZXRdIG9mIGVudW1lcmF0ZShwYXNzZWRBcmdzKSkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgKz0gYE91dCBvZiBzZXQgIyR7aSArIDF9LCB3aGljaCBjb25zaXN0cyBvZiAke3N1bW1hcnkoYXJnc2V0KX1gXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXNzYWdlICs9IGAgZnJvbSB0aGUgZm9sbG93aW5nIG11dHVhbGx5IGV4Y2x1c2l2ZSBzZXQgb2YgYXJncy5cXG5PdXQgb2YgJHtzdW1tYXJ5KHBhc3NlZEFyZ3MpfWBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZXRhaWxzKSB7XG4gICAgICAgICAgICBtZXNzYWdlICs9IGBEZXRhaWxzOiAke2RldGFpbHN9YFxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIH1cblxuXG59XG5cblxuZXhwb3J0IGNsYXNzIE5vdEVub3VnaEFyZ3MgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IoZXhwZWN0ZWQ6IG51bWJlciB8IG51bWJlcltdLCBwYXNzZWRBcmdzOiBUTWFwPGFueT4gfCBUTWFwPGFueT5bXSwgcmVsYXRpb24/OiAnZWFjaCcgfCAnZWl0aGVyJykge1xuICAgICAgICBsZXQgbWVzc2FnZTtcbiAgICAgICAgaWYgKGlzQXJyYXkoZXhwZWN0ZWQpKSB7XG4gICAgICAgICAgICBsZXQgW21pbiwgbWF4XSA9IGV4cGVjdGVkO1xuICAgICAgICAgICAgaWYgKG1heCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBEaWRuJ3QgcmVjZWl2ZSBlbm91Z2ggYXJnczogZXhwZWN0ZWQgYXQgbGVhc3QgJHttaW59YFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYERpZG4ndCByZWNlaXZlIGVub3VnaCBhcmdzOiBleHBlY3RlZCBiZXR3ZWVuICR7bWlufSBhbmQgJHttYXh9YFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZSA9IGBEaWRuJ3QgcmVjZWl2ZSBlbm91Z2ggYXJnczogZXhwZWN0ZWQgZXhhY3RseSAke2V4cGVjdGVkfWA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNBcnJheShwYXNzZWRBcmdzKSkge1xuICAgICAgICAgICAgbWVzc2FnZSArPSBgIGZyb20gJHtyZWxhdGlvbn0gc2V0IG9mIGFyZ3VtZW50cy5cXG5gO1xuICAgICAgICAgICAgZm9yIChsZXQgW2ksIGFyZ3NldF0gb2YgZW51bWVyYXRlKHBhc3NlZEFyZ3MpKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSArPSBgT3V0IG9mIHNldCAjJHtpICsgMX0sIHdoaWNoIGNvbnNpc3RzIG9mICR7c3VtbWFyeShhcmdzZXQpfWBcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZSArPSBgIGZyb20gdGhlIGZvbGxvd2luZyBzZXQgb2YgYXJncy5cXG5PdXQgb2YgJHtzdW1tYXJ5KHBhc3NlZEFyZ3MpfWA7XG4gICAgICAgIH1cblxuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCSEVUeXBlRXJyb3IgZXh0ZW5kcyBUeXBlRXJyb3Ige1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogeyBmYXVsdHlWYWx1ZTogVE1hcDxhbnk+LCBleHBlY3RlZD86IGFueSB8IGFueVtdLCB3aGVyZT86IHN0cmluZywgbWVzc2FnZT86IHN0cmluZyB9KSB7XG4gICAgICAgIGxldCB7IGZhdWx0eVZhbHVlLCBleHBlY3RlZCwgd2hlcmUsIG1lc3NhZ2UgfSA9IG9wdGlvbnM7XG4gICAgICAgIGNvbnN0IHJlcHIgPSBnZXRBcmdzRnVsbFJlcHIoZmF1bHR5VmFsdWUpO1xuICAgICAgICBsZXQgbXNnID0gJyc7XG4gICAgICAgIGlmICh3aGVyZSkge1xuICAgICAgICAgICAgbXNnICs9IGAke3doZXJlfSB8IGBcbiAgICAgICAgfVxuICAgICAgICBtc2cgKz0gYEdvdCAke3JlcHJ9LiBgO1xuICAgICAgICBpZiAoZXhwZWN0ZWQpIHtcbiAgICAgICAgICAgIGlmIChpc0FycmF5KGV4cGVjdGVkKSkge1xuICAgICAgICAgICAgICAgIGV4cGVjdGVkID0gZXhwZWN0ZWQuam9pbihcIiB8IFwiKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbXNnICs9IGAgRXhwZWN0ZWQ6ICR7ZXhwZWN0ZWR9LiBgXG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIG1zZyArPSBgRGV0YWlsczpcXG4ke21lc3NhZ2V9YFxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKG1zZyk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVmFsdWVFcnJvciBleHRlbmRzIEJIRVR5cGVFcnJvciB7XG5cbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICoqKiBCZXR0ZXJIVE1MRWxlbWVudFxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuY29uc3QgU1ZHX05TX1VSSSA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG5cbmV4cG9ydCBjbGFzcyBCZXR0ZXJIVE1MRWxlbWVudDxHZW5lcmljIGV4dGVuZHMgSFRNTEVsZW1lbnQgPSBIVE1MRWxlbWVudD4ge1xuICAgIHByb3RlY3RlZCBfaHRtbEVsZW1lbnQ6IEdlbmVyaWM7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfaXNTdmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9saXN0ZW5lcnM6IE1hcE9mRXZlbnROYW1lMkZ1bmN0aW9uID0ge307XG4gICAgcHJpdmF0ZSBfY2FjaGVkQ2hpbGRyZW46IFRNYXA8QmV0dGVySFRNTEVsZW1lbnQgfCBCZXR0ZXJIVE1MRWxlbWVudFtdPiA9IHt9O1xuXG4gICAgLyoqQ3JlYXRlIGFuIGVsZW1lbnQgb2YgYHRhZ2AuIE9wdGlvbmFsbHksIHNldCBpdHMgYGNsc2Agb3IgYGlkYC4gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IHRhZywgY2xzLCBzZXRpZCwgaHRtbCB9OiB7IHRhZzogRWxlbWVudDJUYWc8R2VuZXJpYz4sIGNscz86IHN0cmluZywgc2V0aWQ/OiBzdHJpbmcsIGh0bWw/OiBzdHJpbmcgfSk7XG4gICAgLyoqV3JhcCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBieWlkYC4gT3B0aW9uYWxseSBjYWNoZSBleGlzdGluZyBgY2hpbGRyZW5gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGJ5aWQsIGNoaWxkcmVuIH06IHsgYnlpZDogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIC8qKldyYXAgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgcXVlcnlgLiBPcHRpb25hbGx5IGNhY2hlIGV4aXN0aW5nIGBjaGlsZHJlbmAqL1xuICAgIGNvbnN0cnVjdG9yKHsgcXVlcnksIGNoaWxkcmVuIH06IHsgcXVlcnk6IFF1ZXJ5U2VsZWN0b3IsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk7XG4gICAgLyoqV3JhcCBhbiBleGlzdGluZyBIVE1MRWxlbWVudC4gT3B0aW9uYWxseSBjYWNoZSBleGlzdGluZyBgY2hpbGRyZW5gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9OiB7IGh0bWxFbGVtZW50OiBHZW5lcmljOyBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIGNvbnN0cnVjdG9yKGVsZW1PcHRpb25zKSB7XG4gICAgICAgIGxldCB7XG4gICAgICAgICAgICB0YWcsIGNscywgc2V0aWQsIGh0bWwsIC8vIGNyZWF0ZVxuICAgICAgICAgICAgaHRtbEVsZW1lbnQsIGJ5aWQsIHF1ZXJ5LCBjaGlsZHJlbiAvLyB3cmFwIGV4aXN0aW5nXG4gICAgICAgIH0gPSBlbGVtT3B0aW9ucztcblxuICAgICAgICAvLyAqKiogQXJndW1lbnQgRXJyb3JzXG4gICAgICAgIC8vICoqIHdyYXBwaW5nIGFyZ3M6IGFzc2VydCBtYXggb25lIChvciBub25lIGlmIGNyZWF0aW5nIG5ldylcbiAgICAgICAgaWYgKFt0YWcsIGJ5aWQsIHF1ZXJ5LCBodG1sRWxlbWVudF0uZmlsdGVyKHggPT4geCAhPT0gdW5kZWZpbmVkKS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTXV0dWFsbHlFeGNsdXNpdmVBcmdzKHtcbiAgICAgICAgICAgICAgICBieWlkLCBxdWVyeSwgaHRtbEVsZW1lbnQsIHRhZ1xuICAgICAgICAgICAgfSwgJ0VpdGhlciB3cmFwIGFuIGV4aXN0aW5nIGVsZW1lbnQgYnkgcGFzc2luZyBvbmUgb2YgYGJ5aWRgIC8gYHF1ZXJ5YCAvIGBodG1sRWxlbWVudGAsIG9yIGNyZWF0ZSBhIG5ldyBvbmUgYnkgcGFzc2luZyBgdGFnYC4nKVxuICAgICAgICB9XG4gICAgICAgIC8vICoqIGNyZWF0aW5nIG5ldyBlbGVtIGFyZ3M6IGFzc2VydCBjcmVhdG9ycyBhbmQgd3JhcHBlcnMgbm90IG1peGVkXG4gICAgICAgIC8vICogaWYgY3JlYXRpbmcgbmV3IHdpdGggZWl0aGVyIGB0YWdgIC8gYHNldGlkYCAsIG5vIG1lYW5pbmcgdG8gZWl0aGVyIGNoaWxkcmVuLCBieWlkLCBodG1sRWxlbWVudCwgb3IgcXVlcnlcbiAgICAgICAgaWYgKGFueURlZmluZWQoW3RhZywgY2xzLCBzZXRpZF0pICYmIGFueURlZmluZWQoW2NoaWxkcmVuLCBieWlkLCBodG1sRWxlbWVudCwgcXVlcnldKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE11dHVhbGx5RXhjbHVzaXZlQXJncyhbXG4gICAgICAgICAgICAgICAgeyB0YWcsIGNscywgc2V0aWQgfSxcbiAgICAgICAgICAgICAgICB7IGNoaWxkcmVuLCBieWlkLCBodG1sRWxlbWVudCwgcXVlcnkgfVxuICAgICAgICAgICAgXSwgYENhbid0IGhhdmUgYXJncyBmcm9tIGJvdGggc2V0c2ApXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFsbFVuZGVmaW5lZChbdGFnLCBieWlkLCBodG1sRWxlbWVudCwgcXVlcnldKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE5vdEVub3VnaEFyZ3MoMSwgeyB0YWcsIGJ5aWQsIGh0bWxFbGVtZW50LCBxdWVyeSB9LCAnZWl0aGVyJyk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vICoqIHRhZyAoQ1JFQVRFIGVsZW1lbnQpXG4gICAgICAgIGlmICh0YWcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKFsnc3ZnJywgJ3BhdGgnXS5pbmNsdWRlcyh0YWcudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1N2ZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TX1VSSSwgdGFnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZykgYXMgR2VuZXJpYztcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgeyAvLyAqKiB3cmFwIEVYSVNUSU5HIGVsZW1lbnRcbiAgICAgICAgICAgIC8vICogYnlpZFxuICAgICAgICAgICAgaWYgKGJ5aWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGlmIChieWlkLnN0YXJ0c1dpdGgoJyMnKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHBhcmFtICdieWlkJyBzdGFydHMgd2l0aCAnIycsIHN0cmlwcGluZyBpdDogJHtieWlkfWApO1xuICAgICAgICAgICAgICAgICAgICBieWlkID0gYnlpZC5zdWJzdHIoMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnlpZCkgYXMgR2VuZXJpYztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gKiBxdWVyeVxuICAgICAgICAgICAgICAgIGlmIChxdWVyeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihxdWVyeSkgYXMgR2VuZXJpYztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyAqIGh0bWxFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIGlmIChodG1sRWxlbWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGh0bWxFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghYm9vbCh0aGlzLl9odG1sRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHt0aGlzfSBjb25zdHJ1Y3RvciBlbmRlZCB1cCB3aXRoIG5vICd0aGlzLl9odG1sRWxlbWVudCcuIFBhc3NlZCBvcHRpb25zOiAke3N1bW1hcnkoZWxlbU9wdGlvbnMpfWApXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNscyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmNsYXNzKGNscyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGh0bWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5odG1sKGh0bWwpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmNhY2hlQ2hpbGRyZW4oY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZXRpZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmlkKHNldGlkKTtcbiAgICAgICAgfVxuXG5cbiAgICB9XG5cbiAgICAvKipSZXR1cm4gdGhlIHdyYXBwZWQgSFRNTEVsZW1lbnQqL1xuICAgIGdldCBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgc3RhdGljIHdyYXBXaXRoQkhFKGh0bWxFbGVtZW50OiBIVE1MQW5jaG9yRWxlbWVudCk6IEFuY2hvcjtcblxuICAgIHN0YXRpYyB3cmFwV2l0aEJIRTxUSW5wdXRUeXBlIGV4dGVuZHMgSW5wdXRUeXBlID0gSW5wdXRUeXBlLCBHZW5lcmljIGV4dGVuZHMgRm9ybWlzaEhUTUxFbGVtZW50ID0gRm9ybWlzaEhUTUxFbGVtZW50PihodG1sRWxlbWVudDogR2VuZXJpYyk6IElucHV0PFRJbnB1dFR5cGUsIEdlbmVyaWM+O1xuXG4gICAgc3RhdGljIHdyYXBXaXRoQkhFKGh0bWxFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50KTogSW1nO1xuXG4gICAgc3RhdGljIHdyYXBXaXRoQkhFKGh0bWxFbGVtZW50OiBIVE1MUGFyYWdyYXBoRWxlbWVudCk6IFBhcmFncmFwaDtcblxuICAgIHN0YXRpYyB3cmFwV2l0aEJIRShodG1sRWxlbWVudDogSFRNTFNwYW5FbGVtZW50KTogU3BhbjtcblxuICAgIHN0YXRpYyB3cmFwV2l0aEJIRShodG1sRWxlbWVudDogSFRNTEJ1dHRvbkVsZW1lbnQpOiBCdXR0b247XG5cbiAgICBzdGF0aWMgd3JhcFdpdGhCSEUoaHRtbEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50KTogRGl2O1xuXG4gICAgc3RhdGljIHdyYXBXaXRoQkhFKGh0bWxFbGVtZW50OiBIVE1MU2VsZWN0RWxlbWVudCk6IERpdjtcblxuICAgIHN0YXRpYyB3cmFwV2l0aEJIRShodG1sRWxlbWVudDogSFRNTEVsZW1lbnQpOiBCZXR0ZXJIVE1MRWxlbWVudDtcblxuICAgIHN0YXRpYyB3cmFwV2l0aEJIRShlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHRhZyA9IGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpIGFzIEVsZW1lbnQyVGFnPHR5cGVvZiBlbGVtZW50PjtcbiAgICAgICAgLy8gY29uc3QgdGFnID0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgYXMgVGFnO1xuICAgICAgICBpZiAodGFnID09PSAnZGl2Jykge1xuICAgICAgICAgICAgcmV0dXJuIGRpdih7IGh0bWxFbGVtZW50OiBlbGVtZW50IH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ2EnKSB7XG4gICAgICAgICAgICByZXR1cm4gYW5jaG9yKHsgaHRtbEVsZW1lbnQ6IGVsZW1lbnQgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGFnID09PSAncCcpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJhZ3JhcGgoeyBodG1sRWxlbWVudDogZWxlbWVudCB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0YWcgPT09ICdpbWcnKSB7XG4gICAgICAgICAgICByZXR1cm4gaW1nKHsgaHRtbEVsZW1lbnQ6IGVsZW1lbnQgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGFnID09PSAnaW5wdXQnKSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSBcInRleHRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVGV4dElucHV0KHsgaHRtbEVsZW1lbnQ6IGVsZW1lbnQgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnQudHlwZSA9PT0gXCJjaGVja2JveFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDaGVja2JveElucHV0KHsgaHRtbEVsZW1lbnQ6IGVsZW1lbnQgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnB1dCh7IGh0bWxFbGVtZW50OiBlbGVtZW50IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ2J1dHRvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBidXR0b24oeyBodG1sRWxlbWVudDogZWxlbWVudCB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0YWcgPT09ICdzcGFuJykge1xuICAgICAgICAgICAgcmV0dXJuIHNwYW4oeyBodG1sRWxlbWVudDogZWxlbWVudCB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0YWcgPT09ICdzZWxlY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0KHsgaHRtbEVsZW1lbnQ6IGVsZW1lbnQgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbSh7IGh0bWxFbGVtZW50OiBlbGVtZW50IH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIGNvbnN0IHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpO1xuICAgICAgICBjb25zdCBwcm90b1N0ciA9IHByb3RvLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCk7XG4gICAgICAgIGxldCBzdHIgPSBwcm90b1N0ci5zdWJzdHJpbmcoNiwgcHJvdG9TdHIuaW5kZXhPZigneycpIC0gMSk7XG5cbiAgICAgICAgbGV0IHRhZyA9IHRoaXMuX2h0bWxFbGVtZW50Py50YWdOYW1lO1xuICAgICAgICBsZXQgaWQgPSB0aGlzLmlkKCk7XG4gICAgICAgIGxldCBjbGFzc0xpc3QgPSB0aGlzLl9odG1sRWxlbWVudD8uY2xhc3NMaXN0O1xuICAgICAgICBpZiAoYW55VHJ1dGh5KFtpZCwgY2xhc3NMaXN0LCB0YWddKSkge1xuICAgICAgICAgICAgc3RyICs9IGAgKGA7XG4gICAgICAgICAgICBpZiAodGFnKSB7XG4gICAgICAgICAgICAgICAgc3RyICs9IGA8JHt0YWcudG9Mb3dlckNhc2UoKX0+YFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkKSB7XG4gICAgICAgICAgICAgICAgc3RyICs9IGAjJHtpZH1gXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2xhc3NMaXN0KSB7XG4gICAgICAgICAgICAgICAgc3RyICs9IGAuJHtjbGFzc0xpc3R9YFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RyICs9IGApYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyXG4gICAgfVxuXG4gICAgLyoqU2V0cyBgdGhpcy5faHRtbEVsZW1lbnRgIHRvIGBuZXdIdG1sRWxlbWVudC5faHRtbEVsZW1lbnRgLlxuICAgICAqIFJlc2V0cyBgdGhpcy5fY2FjaGVkQ2hpbGRyZW5gIGFuZCBjYWNoZXMgYG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbmAuXG4gICAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgZnJvbSBgbmV3SHRtbEVsZW1lbnQuX2xpc3RlbmVyc2AsIHdoaWxlIGtlZXBpbmcgYHRoaXMuX2xpc3RlbmVyc2AuKi9cbiAgICB3cmFwU29tZXRoaW5nRWxzZTxUIGV4dGVuZHMgSFRNTEVsZW1lbnQ+KG5ld0h0bWxFbGVtZW50OiBCZXR0ZXJIVE1MRWxlbWVudDxUPik6IHRoaXNcbiAgICAvKipTZXRzIGB0aGlzLl9odG1sRWxlbWVudGAgdG8gYG5ld0h0bWxFbGVtZW50YC5cbiAgICAgKiBLZWVwcyBgdGhpcy5fbGlzdGVuZXJzYC5cbiAgICAgKiBOT1RFOiB0aGlzIHJlaW5pdGlhbGl6ZXMgYHRoaXMuX2NhY2hlZENoaWxkcmVuYCBhbmQgYWxsIGV2ZW50IGxpc3RlbmVycyBiZWxvbmdpbmcgdG8gYG5ld0h0bWxFbGVtZW50YCBhcmUgbG9zdC4gUGFzcyBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgdG8ga2VlcCB0aGVtLiovXG4gICAgd3JhcFNvbWV0aGluZ0Vsc2UobmV3SHRtbEVsZW1lbnQ6IE5vZGUpOiB0aGlzXG4gICAgd3JhcFNvbWV0aGluZ0Vsc2UobmV3SHRtbEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fY2FjaGVkQ2hpbGRyZW4gPSB7fTtcbiAgICAgICAgaWYgKG5ld0h0bWxFbGVtZW50IGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnJlcGxhY2VXaXRoKG5ld0h0bWxFbGVtZW50LmUpO1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBuZXdIdG1sRWxlbWVudC5lO1xuICAgICAgICAgICAgZm9yIChsZXQgW19rZXksIF9jYWNoZWRDaGlsZF0gb2YgZW51bWVyYXRlKG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShfa2V5LCBfY2FjaGVkQ2hpbGQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXModGhpcy5fY2FjaGVkQ2hpbGRyZW4pLmxlbmd0aFxuICAgICAgICAgICAgICAgICE9PSBPYmplY3Qua2V5cyhuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW4pLmxlbmd0aFxuICAgICAgICAgICAgICAgIHx8XG4gICAgICAgICAgICAgICAgT2JqZWN0LnZhbHVlcyh0aGlzLl9jYWNoZWRDaGlsZHJlbikuZmlsdGVyKHYgPT4gdiAhPT0gdW5kZWZpbmVkKS5sZW5ndGhcbiAgICAgICAgICAgICAgICAhPT0gT2JqZWN0LnZhbHVlcyhuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW4pLmZpbHRlcih2ID0+IHYgIT09IHVuZGVmaW5lZCkubGVuZ3RoXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHdyYXBTb21ldGhpbmdFbHNlIHRoaXMuX2NhY2hlZENoaWxkcmVuIGxlbmd0aCAhPT0gbmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuLmxlbmd0aGAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXM6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdIdG1sRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbih7IC4uLnRoaXMuX2xpc3RlbmVycywgLi4ubmV3SHRtbEVsZW1lbnQuX2xpc3RlbmVycywgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBObyB3YXkgdG8gZ2V0IG5ld0h0bWxFbGVtZW50IGV2ZW50IGxpc3RlbmVycyBiZXNpZGVzIGhhY2tpbmcgRWxlbWVudC5wcm90b3R5cGVcbiAgICAgICAgICAgIHRoaXMub24odGhpcy5fbGlzdGVuZXJzKTtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnJlcGxhY2VXaXRoKG5ld0h0bWxFbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gbmV3SHRtbEVsZW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyAqKiogQmFzaWNcbiAgICAvKipTZXQgdGhlIGVsZW1lbnQncyBpbm5lckhUTUwqL1xuICAgIGh0bWwoaHRtbDogc3RyaW5nKTogdGhpcztcbiAgICAvKipHZXQgdGhlIGVsZW1lbnQncyBpbm5lckhUTUwqL1xuICAgIGh0bWwoKTogc3RyaW5nO1xuICAgIGh0bWwoaHRtbD8pIHtcbiAgICAgICAgaWYgKGh0bWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50LmlubmVySFRNTDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlNldCB0aGUgZWxlbWVudCdzIGlubmVyVGV4dCovXG4gICAgdGV4dCh0eHQ6IHN0cmluZyB8IG51bWJlcik6IHRoaXM7XG4gICAgLyoqR2V0IHRoZSBlbGVtZW50J3MgaW5uZXJUZXh0Ki9cbiAgICB0ZXh0KCk6IHN0cmluZztcbiAgICB0ZXh0KHR4dD8pIHtcbiAgICAgICAgaWYgKHR4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQuaW5uZXJUZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuaW5uZXJUZXh0ID0gdHh0O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlNldCB0aGUgaWQgb2YgdGhlIGVsZW1lbnQqL1xuICAgIGlkKGlkOiBzdHJpbmcpOiB0aGlzO1xuICAgIC8qKkdldCB0aGUgaWQgb2YgdGhlIGVsZW1lbnQqL1xuICAgIGlkKCk6IHN0cmluZztcbiAgICBpZChpZD8pIHtcbiAgICAgICAgaWYgKGlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9odG1sRWxlbWVudD8uaWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5pZCA9IGlkO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipGb3IgZWFjaCBgezxzdHlsZUF0dHI+OiA8c3R5bGVWYWw+fWAgcGFpciwgc2V0IHRoZSBgc3R5bGVbc3R5bGVBdHRyXWAgdG8gYHN0eWxlVmFsYC4qL1xuICAgIGNzcyhjc3M6IFBhcnRpYWw8Q3NzT3B0aW9ucz4pOiB0aGlzXG4gICAgLyoqR2V0IGBzdHlsZVtjc3NdYCovXG4gICAgY3NzKGNzczogc3RyaW5nKTogc3RyaW5nXG4gICAgY3NzKGNzcykge1xuICAgICAgICBpZiAodHlwZW9mIGNzcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9odG1sRWxlbWVudC5zdHlsZVtjc3NdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgW3N0eWxlQXR0ciwgc3R5bGVWYWxdIG9mIGVudW1lcmF0ZShjc3MpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuc3R5bGVbPHN0cmluZz5zdHlsZUF0dHJdID0gc3R5bGVWYWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlJlbW92ZSB0aGUgdmFsdWUgb2YgdGhlIHBhc3NlZCBzdHlsZSBwcm9wZXJ0aWVzKi9cbiAgICB1bmNzcyguLi5yZW1vdmVQcm9wczogKGtleW9mIENzc09wdGlvbnMpW10pOiB0aGlzIHtcbiAgICAgICAgbGV0IGNzcyA9IHt9O1xuICAgICAgICBmb3IgKGxldCBwcm9wIG9mIHJlbW92ZVByb3BzKSB7XG4gICAgICAgICAgICBjc3NbcHJvcF0gPSAnJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jc3MoY3NzKTtcbiAgICB9XG5cblxuICAgIC8vICoqKiBDbGFzc2VzXG4gICAgLyoqYC5jbGFzc05hbWUgPSBjbHNgKi9cbiAgICBjbGFzcyhjbHM6IHN0cmluZyk6IHRoaXM7XG4gICAgLyoqUmV0dXJuIHRoZSBmaXJzdCBjbGFzcyB0aGF0IG1hdGNoZXMgYGNsc2AgcHJlZGljYXRlLiovXG4gICAgY2xhc3MoY2xzOiBSZXR1cm5zPGJvb2xlYW4+KTogc3RyaW5nO1xuICAgIC8qKlJldHVybiBhIHN0cmluZyBhcnJheSBvZiB0aGUgZWxlbWVudCdzIGNsYXNzZXMgKG5vdCBhIGNsYXNzTGlzdCkqL1xuICAgIGNsYXNzKCk6IHN0cmluZ1tdO1xuICAgIGNsYXNzKGNscz8pIHtcbiAgICAgICAgaWYgKGNscyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9odG1sRWxlbWVudC5jbGFzc0xpc3QpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24oY2xzKSkge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5faHRtbEVsZW1lbnQuY2xhc3NMaXN0KS5maW5kKGNscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNTdmcpIHtcbiAgICAgICAgICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNDb25zdGFudFJlYXNzaWdubWVudFxuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmNsYXNzTGlzdCA9IFtjbHNdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5jbGFzc05hbWUgPSBjbHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZENsYXNzKGNsczogc3RyaW5nLCAuLi5jbHNlczogc3RyaW5nW10pOiB0aGlzIHtcbiAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbHMpO1xuICAgICAgICBmb3IgKGxldCBjIG9mIGNsc2VzKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5jbGFzc0xpc3QuYWRkKGMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJlbW92ZUNsYXNzKGNsczogUmV0dXJuczxib29sZWFuPiwgLi4uY2xzZXM6IFJldHVybnM8Ym9vbGVhbj5bXSk6IHRoaXM7XG4gICAgcmVtb3ZlQ2xhc3MoY2xzOiBzdHJpbmcsIGNsc2VzPzogc3RyaW5nW10pOiB0aGlzO1xuICAgIHJlbW92ZUNsYXNzKGNscywgLi4uY2xzZXMpIHtcbiAgICAgICAgaWYgKGlzRnVuY3Rpb248UmV0dXJuczxib29sZWFuPj4oY2xzKSkge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzKGNscykpO1xuICAgICAgICAgICAgZm9yIChsZXQgYyBvZiA8UmV0dXJuczxib29sZWFuPltdPmNsc2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmNsYXNzKGMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xzKTtcbiAgICAgICAgICAgIGZvciAobGV0IGMgb2YgY2xzZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJlcGxhY2VDbGFzcyhvbGRUb2tlbjogUmV0dXJuczxib29sZWFuPiwgbmV3VG9rZW46IHN0cmluZyk6IHRoaXM7XG4gICAgcmVwbGFjZUNsYXNzKG9sZFRva2VuOiBzdHJpbmcsIG5ld1Rva2VuOiBzdHJpbmcpOiB0aGlzXG4gICAgcmVwbGFjZUNsYXNzKG9sZFRva2VuLCBuZXdUb2tlbikge1xuICAgICAgICBpZiAoaXNGdW5jdGlvbjxSZXR1cm5zPGJvb2xlYW4+PihvbGRUb2tlbikpIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmNsYXNzTGlzdC5yZXBsYWNlKHRoaXMuY2xhc3Mob2xkVG9rZW4pLCBuZXdUb2tlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5jbGFzc0xpc3QucmVwbGFjZShvbGRUb2tlbiwgbmV3VG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRvZ2dsZUNsYXNzKGNsczogUmV0dXJuczxib29sZWFuPiwgZm9yY2U/OiBib29sZWFuKTogdGhpc1xuICAgIHRvZ2dsZUNsYXNzKGNsczogc3RyaW5nLCBmb3JjZT86IGJvb2xlYW4pOiB0aGlzXG4gICAgdG9nZ2xlQ2xhc3MoY2xzLCBmb3JjZSkge1xuICAgICAgICBpZiAoaXNGdW5jdGlvbjxSZXR1cm5zPGJvb2xlYW4+PihjbHMpKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKHRoaXMuY2xhc3MoY2xzKSwgZm9yY2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShjbHMsIGZvcmNlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipSZXR1cm5zIGB0aGlzLl9odG1sRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xzKWAgKi9cbiAgICBoYXNDbGFzcyhjbHM6IHN0cmluZyk6IGJvb2xlYW5cbiAgICAvKipSZXR1cm5zIHdoZXRoZXIgYHRoaXNgIGhhcyBhIGNsYXNzIHRoYXQgbWF0Y2hlcyBwYXNzZWQgZnVuY3Rpb24gKi9cbiAgICBoYXNDbGFzcyhjbHM6IFJldHVybnM8Ym9vbGVhbj4pOiBib29sZWFuXG4gICAgaGFzQ2xhc3MoY2xzKSB7XG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKGNscykpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsYXNzKGNscykgIT09IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9odG1sRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vICoqKiBOb2Rlc1xuICAgIC8qKkluc2VydCBhdCBsZWFzdCBvbmUgYG5vZGVgIGp1c3QgYWZ0ZXIgYHRoaXNgLiBBbnkgYG5vZGVgIGNhbiBiZSBlaXRoZXIgYEJldHRlckhUTUxFbGVtZW50YHMgb3IgdmFuaWxsYSBgTm9kZWAuKi9cbiAgICBhZnRlciguLi5ub2RlczogQXJyYXk8QmV0dGVySFRNTEVsZW1lbnQgfCBOb2RlPik6IHRoaXMge1xuICAgICAgICBmb3IgKGxldCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuYWZ0ZXIobm9kZS5lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuYWZ0ZXIobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqSW5zZXJ0IGB0aGlzYCBqdXN0IGFmdGVyIGEgYEJldHRlckhUTUxFbGVtZW50YCBvciBhIHZhbmlsbGEgYE5vZGVgLiovXG4gICAgaW5zZXJ0QWZ0ZXIobm9kZTogQmV0dGVySFRNTEVsZW1lbnQgfCBIVE1MRWxlbWVudCk6IHRoaXMge1xuICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBub2RlLl9odG1sRWxlbWVudC5hZnRlcih0aGlzLl9odG1sRWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub2RlLmFmdGVyKHRoaXMuX2h0bWxFbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipJbnNlcnQgYXQgbGVhc3Qgb25lIGBub2RlYCBhZnRlciB0aGUgbGFzdCBjaGlsZCBvZiBgdGhpc2AuXG4gICAgICogQW55IGBub2RlYCBjYW4gYmUgZWl0aGVyIGEgYEJldHRlckhUTUxFbGVtZW50YCwgYSB2YW5pbGxhIGBOb2RlYCxcbiAgICAgKiBhIGB7c29tZUtleTogQmV0dGVySFRNTEVsZW1lbnR9YCBwYWlycyBvYmplY3QsIG9yIGEgYFtzb21lS2V5LCBCZXR0ZXJIVE1MRWxlbWVudF1gIHR1cGxlLiovXG4gICAgYXBwZW5kKC4uLm5vZGVzOiBBcnJheTxCZXR0ZXJIVE1MRWxlbWVudCB8IE5vZGUgfCBUTWFwPEJldHRlckhUTUxFbGVtZW50PiB8IFtzdHJpbmcsIEJldHRlckhUTUxFbGVtZW50XT4pOiB0aGlzIHtcbiAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBub2Rlcykge1xuICAgICAgICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmFwcGVuZChub2RlLmUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuYXBwZW5kKG5vZGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhY2hlQXBwZW5kKFtub2RlXSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhY2hlQXBwZW5kKG5vZGUpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9XG5cbiAgICAvKipBcHBlbmQgYHRoaXNgIHRvIGEgYEJldHRlckhUTUxFbGVtZW50YCBvciBhIHZhbmlsbGEgYE5vZGVgKi9cbiAgICBhcHBlbmRUbyhub2RlOiBCZXR0ZXJIVE1MRWxlbWVudCB8IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIG5vZGUuX2h0bWxFbGVtZW50LmFwcGVuZCh0aGlzLl9odG1sRWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub2RlLmFwcGVuZCh0aGlzLl9odG1sRWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipJbnNlcnQgYXQgbGVhc3Qgb25lIGBub2RlYCBqdXN0IGJlZm9yZSBgdGhpc2AuIEFueSBgbm9kZWAgY2FuIGJlIGVpdGhlciBgQmV0dGVySFRNTEVsZW1lbnRgcyBvciB2YW5pbGxhIGBOb2RlYC4qL1xuICAgIGJlZm9yZSguLi5ub2RlczogQXJyYXk8QmV0dGVySFRNTEVsZW1lbnQgfCBOb2RlPik6IHRoaXMge1xuICAgICAgICBmb3IgKGxldCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuYmVmb3JlKG5vZGUuZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmJlZm9yZShub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipJbnNlcnQgYHRoaXNgIGp1c3QgYmVmb3JlIGEgYEJldHRlckhUTUxFbGVtZW50YCBvciBhIHZhbmlsbGEgYE5vZGVgcy4qL1xuICAgIGluc2VydEJlZm9yZShub2RlOiBCZXR0ZXJIVE1MRWxlbWVudCB8IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIG5vZGUuX2h0bWxFbGVtZW50LmJlZm9yZSh0aGlzLl9odG1sRWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub2RlLmJlZm9yZSh0aGlzLl9odG1sRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVwbGFjZUNoaWxkKG5ld0NoaWxkOiBOb2RlLCBvbGRDaGlsZDogTm9kZSk6IHRoaXM7XG4gICAgcmVwbGFjZUNoaWxkKG5ld0NoaWxkOiBCZXR0ZXJIVE1MRWxlbWVudCwgb2xkQ2hpbGQ6IEJldHRlckhUTUxFbGVtZW50KTogdGhpcztcbiAgICByZXBsYWNlQ2hpbGQobmV3Q2hpbGQsIG9sZENoaWxkKSB7XG4gICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnJlcGxhY2VDaGlsZChuZXdDaGlsZCwgb2xkQ2hpbGQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuICAgIC8qKkZvciBlYWNoIGBba2V5LCBjaGlsZF1gIHBhaXIsIGBhcHBlbmQoY2hpbGQpYCBhbmQgc3RvcmUgaXQgaW4gYHRoaXNba2V5XWAuICovXG4gICAgY2FjaGVBcHBlbmQoa2V5Q2hpbGRQYWlyczogVE1hcDxCZXR0ZXJIVE1MRWxlbWVudD4pOiB0aGlzXG5cbiAgICAvKipGb3IgZWFjaCBgW2tleSwgY2hpbGRdYCB0dXBsZSwgYGFwcGVuZChjaGlsZClgIGFuZCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYC4gKi9cbiAgICBjYWNoZUFwcGVuZChrZXlDaGlsZFBhaXJzOiBbc3RyaW5nLCBCZXR0ZXJIVE1MRWxlbWVudF1bXSk6IHRoaXNcblxuICAgIGNhY2hlQXBwZW5kKGtleUNoaWxkUGFpcnMpIHtcbiAgICAgICAgY29uc3QgX2NhY2hlQXBwZW5kID0gKF9rZXk6IHN0cmluZywgX2NoaWxkOiBCZXR0ZXJIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hcHBlbmQoX2NoaWxkKTtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlKF9rZXksIF9jaGlsZCk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGtleUNoaWxkUGFpcnMpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBba2V5LCBjaGlsZF0gb2Yga2V5Q2hpbGRQYWlycykge1xuICAgICAgICAgICAgICAgIF9jYWNoZUFwcGVuZChrZXksIGNoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAobGV0IFtrZXksIGNoaWxkXSBvZiBlbnVtZXJhdGUoa2V5Q2hpbGRQYWlycykpIHtcbiAgICAgICAgICAgICAgICBfY2FjaGVBcHBlbmQoa2V5LCBjaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgX2NscygpIHtcbiAgICAgICAgcmV0dXJuIEJldHRlckhUTUxFbGVtZW50XG4gICAgfVxuXG4gICAgY2hpbGQoc2VsZWN0b3I6IFwiaW1nXCIpOiBJbWc7XG5cbiAgICBjaGlsZChzZWxlY3RvcjogXCJhXCIpOiBBbmNob3I7XG5cbiAgICBjaGlsZDxUSW5wdXRUeXBlIGV4dGVuZHMgSW5wdXRUeXBlID0gSW5wdXRUeXBlPihzZWxlY3RvcjogXCJpbnB1dFwiKTogSW5wdXQ8VElucHV0VHlwZSwgSFRNTElucHV0RWxlbWVudD47XG4gICAgY2hpbGQoc2VsZWN0b3I6IFwic2VsZWN0XCIpOiBJbnB1dDx1bmRlZmluZWQsIEhUTUxTZWxlY3RFbGVtZW50PjtcblxuICAgIGNoaWxkKHNlbGVjdG9yOiBcInBcIik6IFBhcmFncmFwaDtcblxuICAgIGNoaWxkKHNlbGVjdG9yOiBcInNwYW5cIik6IFNwYW47XG5cbiAgICBjaGlsZChzZWxlY3RvcjogXCJidXR0b25cIik6IEJ1dHRvbjtcblxuICAgIGNoaWxkKHNlbGVjdG9yOiBcImRpdlwiKTogRGl2O1xuXG4gICAgY2hpbGQ8VCBleHRlbmRzIFRhZz4oc2VsZWN0b3I6IFQpOiBCZXR0ZXJIVE1MRWxlbWVudDxIVE1MRWxlbWVudFRhZ05hbWVNYXBbVF0+O1xuXG4gICAgY2hpbGQoc2VsZWN0b3I6IHN0cmluZyk6IEJldHRlckhUTUxFbGVtZW50O1xuXG4gICAgY2hpbGQ8VCBleHRlbmRzIHR5cGVvZiBCZXR0ZXJIVE1MRWxlbWVudD4oc2VsZWN0b3I6IHN0cmluZywgYmhlQ2xzOiBUKTogVDtcblxuICAgIGNoaWxkKHNlbGVjdG9yLCBiaGVDbHM/KSB7XG4gICAgICAgIGNvbnN0IGh0bWxFbGVtZW50ID0gdGhpcy5faHRtbEVsZW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGlmIChodG1sRWxlbWVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGAke3RoaXN9LmNoaWxkKCR7c2VsZWN0b3J9KTogbm8gY2hpbGQuIHJldHVybmluZyB1bmRlZmluZWRgKTtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGJoZTtcbiAgICAgICAgaWYgKGJoZUNscyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBiaGUgPSB0aGlzLl9jbHMoKS53cmFwV2l0aEJIRShodG1sRWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiaGUgPSBuZXcgYmhlQ2xzKHsgaHRtbEVsZW1lbnQgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJoZTtcbiAgICB9XG5cbiAgICAvKipSZXR1cm4gYSBgQmV0dGVySFRNTEVsZW1lbnRgIGxpc3Qgb2YgYWxsIGNoaWxkcmVuICovXG4gICAgY2hpbGRyZW4oKTogQmV0dGVySFRNTEVsZW1lbnRbXTtcblxuICAgIC8qKlJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgbGlzdCBvZiBhbGwgY2hpbGRyZW4gc2VsZWN0ZWQgYnkgYHNlbGVjdG9yYCAqL1xuICAgIGNoaWxkcmVuPEsgZXh0ZW5kcyBUYWc+KHNlbGVjdG9yOiBLKTogQmV0dGVySFRNTEVsZW1lbnRbXTtcblxuICAgIC8qKlJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgbGlzdCBvZiBhbGwgY2hpbGRyZW4gc2VsZWN0ZWQgYnkgYHNlbGVjdG9yYCAqL1xuICAgIGNoaWxkcmVuKHNlbGVjdG9yOiBRdWVyeVNlbGVjdG9yKTogQmV0dGVySFRNTEVsZW1lbnRbXTtcblxuICAgIGNoaWxkcmVuKHNlbGVjdG9yPykge1xuICAgICAgICBsZXQgY2hpbGRyZW5WYW5pbGxhO1xuICAgICAgICBsZXQgY2hpbGRyZW5Db2xsZWN0aW9uO1xuICAgICAgICBpZiAoc2VsZWN0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2hpbGRyZW5Db2xsZWN0aW9uID0gdGhpcy5faHRtbEVsZW1lbnQuY2hpbGRyZW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGlsZHJlbkNvbGxlY3Rpb24gPSB0aGlzLl9odG1sRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoaWxkcmVuVmFuaWxsYSA9IEFycmF5LmZyb20oY2hpbGRyZW5Db2xsZWN0aW9uKTtcblxuICAgICAgICByZXR1cm4gY2hpbGRyZW5WYW5pbGxhLm1hcCh0aGlzLl9jbHMoKS53cmFwV2l0aEJIRSk7XG4gICAgfVxuXG4gICAgY2xvbmUoZGVlcD86IGJvb2xlYW4pOiBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgICAgIGNvbnNvbGUud2FybihgJHt0aGlzfS5jbG9uZSgpIGRvZXNudCByZXR1cm4gYSBtYXRjaGluZyBCSEUgc3VidHlwZSwgYnV0IGEgcmVndWxhciBCSEVgKTtcbiAgICAgICAgLy8gVE9ETzogcmV0dXJuIG5ldyB0aGlzKCk/XG4gICAgICAgIHJldHVybiBuZXcgQmV0dGVySFRNTEVsZW1lbnQoeyBodG1sRWxlbWVudDogdGhpcy5faHRtbEVsZW1lbnQuY2xvbmVOb2RlKGRlZXApIGFzIEhUTUxFbGVtZW50IH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0b3JlcyBjaGlsZCBCSEUncyBpbiBgdGhpc2Agc28gdGhleSBjYW4gYmUgYWNjZXNzZWQgZS5nLiBgbmF2YmFyLmhvbWUuY2xhc3MoJ3NlbGVjdGVkJylgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogbmF2YmFyLmNhY2hlQ2hpbGRyZW4oeyAnaG9tZSc6ICdidXR0b24uaG9tZScgfSlcbiAgICAgKiAvLyBvclxuICAgICAqIG1haW5kaXYuY2FjaGVDaGlsZHJlbih7ICd3ZWxjb21lJzogcGFyYWdyYXBoKHsgJ3F1ZXJ5JzogJ3Aud2VsY29tZScgfSkgfSlcbiAgICAgKiAvLyBgY2hpbGRyZW5PYmpgIGNhbiBiZSByZWN1cnNpdmUgYW5kIG1peGVkLCBlLmcuXG4gICAgICogbmF2YmFyLmNhY2hlQ2hpbGRyZW4oe1xuICAgICAqICAgICAgaG9tZToge1xuICAgICAqICAgICAgICAgICdsaS5uYXZiYXItaXRlbS1ob21lJzoge1xuICAgICAqICAgICAgICAgICAgICB0aHVtYm5haWw6ICdpbWcuaG9tZS10aHVtYm5haWwnLFxuICAgICAqICAgICAgICAgICAgICBleHBhbmQ6IGJ1dHRvbih7IGJ5aWQ6ICdob21lX2V4cGFuZCcgfSlcbiAgICAgKiAgICAgICAgICB9XG4gICAgICogICAgICB9XG4gICAgICogIH0pO1xuICAgICAqIG5hdmJhci5ob21lLmNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICogbmF2YmFyLmhvbWUudGh1bWJuYWlsLmNzcyguLi4pO1xuICAgICAqIG5hdmJhci5ob21lLmV4cGFuZC5jbGljayggZSA9PiB7Li4ufSApXG4gICAgICogQHNlZSB0aGlzLmNoaWxkKi9cbiAgICBjYWNoZUNoaWxkcmVuKGNoaWxkcmVuT2JqOiBDaGlsZHJlbk9iaik6IHRoaXMge1xuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgZW51bWVyYXRlKGNoaWxkcmVuT2JqKSkge1xuICAgICAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gICAgICAgICAgICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8geyBcIm15aW1nXCI6IGltZyguLi4pIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoa2V5LCB2YWx1ZSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyB7IFwibXlkaXZcIjogeyBcIm15aW1nXCI6IGltZyguLi4pLCBcIm15aW5wdXRcIjogaW5wdXQoLi4uKSB9IH1cbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyaWVzWzFdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgY2FjaGVDaGlsZHJlbigpIHJlY2VpdmVkIHJlY3Vyc2l2ZSBvYmogd2l0aCBtb3JlIHRoYW4gMSBzZWxlY3RvciBmb3IgYSBrZXkuIFVzaW5nIG9ubHkgMHRoIHNlbGVjdG9yYCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibXVsdGlwbGUgc2VsZWN0b3JzXCI6IGVudHJpZXMubWFwKGUgPT4gZVswXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzOiB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgW3NlbGVjdG9yLCBvYmpdID0gZW50cmllc1swXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24ob2JqKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYmhlIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYmhlID0gdGhpcy5jaGlsZChzZWxlY3Rvciwgb2JqKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlKGtleSwgYmhlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlKGtleSwgdGhpcy5jaGlsZChzZWxlY3RvcikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1trZXldLmNhY2hlQ2hpbGRyZW4ob2JqKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IC88KFxcdyspPiQvLmV4ZWModmFsdWUgYXMgc3RyaW5nKTtcblxuICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB7IFwib3B0aW9uc1wiOiBcIjxvcHRpb24+XCIgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFnTmFtZSA9IG1hdGNoWzFdIGFzIFRhZztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaHRtbEVsZW1lbnRzID0gWy4uLnRoaXMuX2h0bWxFbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKHRhZ05hbWUpXSBhcyBIVE1MRWxlbWVudFRhZ05hbWVNYXBbdHlwZW9mIHRhZ05hbWVdW107XG4gICAgICAgICAgICAgICAgICAgIGxldCBiaGVzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGh0bWxFbGVtZW50IG9mIGh0bWxFbGVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmhlcy5wdXNoKHRoaXMuX2NscygpLndyYXBXaXRoQkhFKGh0bWxFbGVtZW50KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoa2V5LCBiaGVzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyB7IFwibXlpbnB1dFwiOiBcImlucHV0W3R5cGU9Y2hlY2tib3hdXCIgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShrZXksIHRoaXMuY2hpbGQodmFsdWUgYXMgVGFnT3JTdHJpbmcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgY2FjaGVDaGlsZHJlbiwgYmFkIHZhbHVlIHR5cGU6IFwiJHt0eXBlfVwiLiBrZXk6IFwiJHtrZXl9XCIsIHZhbHVlOiBcIiR7dmFsdWV9XCIuIGNoaWxkcmVuT2JqOmAsIGNoaWxkcmVuT2JqLCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9XG5cbiAgICAvKipSZW1vdmUgYWxsIGNoaWxkcmVuIGZyb20gRE9NKi9cbiAgICBlbXB0eSgpOiB0aGlzIHtcbiAgICAgICAgd2hpbGUgKHRoaXMuX2h0bWxFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuX2h0bWxFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlJlbW92ZSBlbGVtZW50IGZyb20gRE9NKi9cbiAgICByZW1vdmUoKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuICAgIC8vICoqKiBFdmVudHNcbiAgICBvbihldlR5cGVGblBhaXJzOiBUTWFwPEV2ZW50TmFtZTJGdW5jdGlvbj4sIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICAvLyBjb25zdCBmb28gPSBldlR5cGVGblBhaXJzW1wiYWJvcnRcIl07XG4gICAgICAgIGZvciAobGV0IFtldlR5cGUsIGV2Rm5dIG9mIGVudW1lcmF0ZShldlR5cGVGblBhaXJzKSkge1xuICAgICAgICAgICAgY29uc3QgX2YgPSBmdW5jdGlvbiBfZihldnQpIHtcbiAgICAgICAgICAgICAgICBldkZuKGV2dCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldlR5cGUsIF9mLCBvcHRpb25zKTtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyc1tldlR5cGVdID0gX2Y7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLypcbiAgICBDaHJvbm9sb2d5OlxuXHRtb3VzZWRvd24gICB0b3VjaHN0YXJ0XHRwb2ludGVyZG93blxuXHRtb3VzZWVudGVyXHRcdCAgICAgICAgcG9pbnRlcmVudGVyXG5cdG1vdXNlbGVhdmVcdFx0ICAgICAgICBwb2ludGVybGVhdmVcblx0bW91c2Vtb3ZlXHR0b3VjaG1vdmVcdHBvaW50ZXJtb3ZlXG5cdG1vdXNlb3V0XHRcdCAgICAgICAgcG9pbnRlcm91dFxuXHRtb3VzZW92ZXJcdFx0ICAgICAgICBwb2ludGVyb3ZlclxuXHRtb3VzZXVwXHQgICAgdG91Y2hlbmQgICAgcG9pbnRlcnVwXG5cdCovXG4gICAgLyoqIEFkZCBhIGB0b3VjaHN0YXJ0YCBldmVudCBsaXN0ZW5lci4gVGhpcyBpcyB0aGUgZmFzdCBhbHRlcm5hdGl2ZSB0byBgY2xpY2tgIGxpc3RlbmVycyBmb3IgbW9iaWxlIChubyAzMDBtcyB3YWl0KS4gKi9cbiAgICB0b3VjaHN0YXJ0KGZuOiAoZXY6IFRvdWNoRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbiBfZihldjogVG91Y2hFdmVudCkge1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTsgLy8gb3RoZXJ3aXNlIFwidG91Y2htb3ZlXCIgaXMgdHJpZ2dlcmVkXG4gICAgICAgICAgICBmbihldik7XG4gICAgICAgICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLm9uY2UpIC8vIFRPRE86IG1heWJlIG5hdGl2ZSBvcHRpb25zLm9uY2UgaXMgZW5vdWdoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgX2YpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgLy8gVE9ETzogdGhpcy5fbGlzdGVuZXJzLCBvciB1c2UgdGhpcy5vbihcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqIEFkZCBhIGBwb2ludGVyZG93bmAgZXZlbnQgbGlzdGVuZXIgaWYgYnJvd3NlciBzdXBwb3J0cyBgcG9pbnRlcmRvd25gLCBlbHNlIHNlbmQgYG1vdXNlZG93bmAgKHNhZmFyaSkuICovXG4gICAgcG9pbnRlcmRvd24oZm46IChldmVudDogUG9pbnRlckV2ZW50IHwgTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcblxuICAgICAgICBsZXQgYWN0aW9uO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gVE9ETzogY2hlY2sgaWYgUG9pbnRlckV2ZW50IGV4aXN0cyBpbnN0ZWFkIG9mIHRyeS9jYXRjaFxuICAgICAgICAgICAgYWN0aW9uID0gd2luZG93LlBvaW50ZXJFdmVudCA/ICdwb2ludGVyZG93bicgOiAnbW91c2Vkb3duJzsgLy8gc2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBwb2ludGVyZG93blxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBhY3Rpb24gPSAnbW91c2Vkb3duJ1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IF9mID0gZnVuY3Rpb24gX2YoZXY6IFBvaW50ZXJFdmVudCB8IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBmbihldik7XG4gICAgICAgICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLm9uY2UpIC8vIFRPRE86IG1heWJlIG5hdGl2ZSBvcHRpb25zLm9uY2UgaXMgZW5vdWdoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGFjdGlvbiwgX2YpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGFjdGlvbiwgX2YsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMucG9pbnRlcmRvd24gPSBfZjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqU2ltdWxhdGUgYSBjbGljayBvZiB0aGUgZWxlbWVudC4gVXNlZnVsIGZvciBgPGE+YCBlbGVtZW50cy4qL1xuICAgIGNsaWNrKCk6IHRoaXM7XG5cbiAgICAvKipBZGQgYSBgY2xpY2tgIGV2ZW50IGxpc3RlbmVyLiBZb3Ugc2hvdWxkIHByb2JhYmx5IHVzZSBgcG9pbnRlcmRvd24oKWAgaWYgb24gZGVza3RvcCwgb3IgYHRvdWNoc3RhcnQoKWAgaWYgb24gbW9iaWxlLiovXG4gICAgY2xpY2soZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuXG4gICAgY2xpY2soZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoZm4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuY2xpY2soKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBjbGljazogZm4gfSwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipCbHVyICh1bmZvY3VzKSB0aGUgZWxlbWVudC4qL1xuICAgIGJsdXIoKTogdGhpcztcblxuICAgIC8qKkFkZCBhIGBibHVyYCBldmVudCBsaXN0ZW5lciovXG4gICAgYmx1cihmbjogKGV2ZW50OiBGb2N1c0V2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG5cbiAgICBibHVyKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKGZuID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBibHVyOiBmbiB9LCBvcHRpb25zKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqRm9jdXMgdGhlIGVsZW1lbnQuKi9cbiAgICBmb2N1cygpOiB0aGlzO1xuXG4gICAgLyoqQWRkIGEgYGZvY3VzYCBldmVudCBsaXN0ZW5lciovXG4gICAgZm9jdXMoZm46IChldmVudDogRm9jdXNFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuXG4gICAgZm9jdXMoZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoZm4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBmb2N1czogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKkFkZCBhIGBjaGFuZ2VgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBjaGFuZ2UoZm46IChldmVudDogRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uKHsgY2hhbmdlOiBmbiB9LCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipBZGQgYSBgY29udGV4dG1lbnVgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBjb250ZXh0bWVudShmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICByZXR1cm4gdGhpcy5vbih7IGNvbnRleHRtZW51OiBmbiB9LCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipTaW11bGF0ZSBhIGRvdWJsZSBjbGljayBvZiB0aGUgZWxlbWVudC4qL1xuICAgIGRibGNsaWNrKCk6IHRoaXM7XG5cbiAgICAvKipBZGQgYSBgZGJsY2xpY2tgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBkYmxjbGljayhmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG5cbiAgICBkYmxjbGljayhmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmIChmbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBkYmxjbGljayA9IG5ldyBNb3VzZUV2ZW50KCdkYmxjbGljaycsIHtcbiAgICAgICAgICAgICAgICAndmlldyc6IHdpbmRvdyxcbiAgICAgICAgICAgICAgICAnYnViYmxlcyc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbGFibGUnOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmRpc3BhdGNoRXZlbnQoZGJsY2xpY2spO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IGRibGNsaWNrOiBmbiB9LCBvcHRpb25zKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqU2ltdWxhdGUgYSBtb3VzZWVudGVyIGV2ZW50IHRvIHRoZSBlbGVtZW50LiovXG4gICAgbW91c2VlbnRlcigpOiB0aGlzO1xuXG4gICAgLyoqQWRkIGEgYG1vdXNlZW50ZXJgIGV2ZW50IGxpc3RlbmVyKi9cbiAgICBtb3VzZWVudGVyKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcblxuICAgIG1vdXNlZW50ZXIoZm4/LCBvcHRpb25zPykge1xuICAgICAgICAvLyBtb3VzZW92ZXI6IGFsc28gY2hpbGQgZWxlbWVudHNcbiAgICAgICAgLy8gbW91c2VlbnRlcjogb25seSBib3VuZCBlbGVtZW50XG5cbiAgICAgICAgaWYgKGZuID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IG1vdXNlZW50ZXIgPSBuZXcgTW91c2VFdmVudCgnbW91c2VlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAndmlldyc6IHdpbmRvdyxcbiAgICAgICAgICAgICAgICAnYnViYmxlcyc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbGFibGUnOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmRpc3BhdGNoRXZlbnQobW91c2VlbnRlcik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgbW91c2VlbnRlcjogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKkFkZCBhIGBrZXlkb3duYCBldmVudCBsaXN0ZW5lciovXG4gICAga2V5ZG93bihmbjogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICByZXR1cm4gdGhpcy5vbih7IGtleWRvd246IGZuIH0sIG9wdGlvbnMpXG4gICAgfVxuXG4gICAgLyoqQWRkIGEgYG1vdXNlb3V0YCBldmVudCBsaXN0ZW5lciovXG4gICAgbW91c2VvdXQoZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgLy9tb3VzZWxlYXZlIGFuZCBtb3VzZW91dCBhcmUgc2ltaWxhciBidXQgZGlmZmVyIGluIHRoYXQgbW91c2VsZWF2ZSBkb2VzIG5vdCBidWJibGUgYW5kIG1vdXNlb3V0IGRvZXMuXG4gICAgICAgIC8vIFRoaXMgbWVhbnMgdGhhdCBtb3VzZWxlYXZlIGlzIGZpcmVkIHdoZW4gdGhlIHBvaW50ZXIgaGFzIGV4aXRlZCB0aGUgZWxlbWVudCBhbmQgYWxsIG9mIGl0cyBkZXNjZW5kYW50cyxcbiAgICAgICAgLy8gd2hlcmVhcyBtb3VzZW91dCBpcyBmaXJlZCB3aGVuIHRoZSBwb2ludGVyIGxlYXZlcyB0aGUgZWxlbWVudCBvciBsZWF2ZXMgb25lIG9mIHRoZSBlbGVtZW50J3MgZGVzY2VuZGFudHNcbiAgICAgICAgLy8gKGV2ZW4gaWYgdGhlIHBvaW50ZXIgaXMgc3RpbGwgd2l0aGluIHRoZSBlbGVtZW50KS5cbiAgICAgICAgcmV0dXJuIHRoaXMub24oeyBtb3VzZW91dDogZm4gfSwgb3B0aW9ucylcbiAgICB9XG5cbiAgICAvKipBZGQgYSBgbW91c2VvdmVyYCBldmVudCBsaXN0ZW5lciovXG4gICAgbW91c2VvdmVyKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHZvaWQsIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICAvLyBtb3VzZW92ZXI6IGFsc28gY2hpbGQgZWxlbWVudHNcbiAgICAgICAgLy8gbW91c2VlbnRlcjogb25seSBib3VuZCBlbGVtZW50XG4gICAgICAgIC8vIHJldHVybiB0aGlzLm9uKHttb3VzZW92ZXI6IGZufSwgb3B0aW9ucylcbiAgICAgICAgcmV0dXJuIHRoaXMub24oeyBtb3VzZW92ZXI6IGZuIH0pXG4gICAgfVxuXG4gICAgLyoqIFJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXIgb2YgYGV2ZW50YCwgaWYgZXhpc3RzLiovXG4gICAgb2ZmKGV2ZW50OiBFdmVudE5hbWUpOiB0aGlzIHtcbiAgICAgICAgLy8gVE9ETzogU2hvdWxkIHJlbW92ZSBsaXN0ZW5lciBmcm9tIHRoaXMuX2xpc3RlbmVycz9cbiAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcy5fbGlzdGVuZXJzW2V2ZW50XSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKiBSZW1vdmUgYWxsIGV2ZW50IGxpc3RlbmVycyBpbiBgX2xpc3RlbmVyc2AqL1xuICAgIGFsbE9mZigpOiB0aGlzIHtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IE9iamVjdC5rZXlzKHRoaXMuX2xpc3RlbmVycykubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBldmVudCA9IHRoaXMuX2xpc3RlbmVyc1tpXTtcbiAgICAgICAgICAgIHRoaXMub2ZmKGV2ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKiBGb3IgZWFjaCBgW2F0dHIsIHZhbF1gIHBhaXIsIGFwcGx5IGBzZXRBdHRyaWJ1dGVgKi9cbiAgICBhdHRyKGF0dHJWYWxQYWlyczogVE1hcDxzdHJpbmcgfCBib29sZWFuPik6IHRoaXNcblxuICAgIC8vICoqKiBBdHRyaWJ1dGVzXG5cbiAgICAvKiogYXBwbHkgYGdldEF0dHJpYnV0ZWAqL1xuICAgIGF0dHIoYXR0cmlidXRlTmFtZTogc3RyaW5nKTogc3RyaW5nXG5cbiAgICBhdHRyKGF0dHJWYWxQYWlycykge1xuICAgICAgICBpZiAodHlwZW9mIGF0dHJWYWxQYWlycyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9odG1sRWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0clZhbFBhaXJzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAobGV0IFthdHRyLCB2YWxdIG9mIGVudW1lcmF0ZShhdHRyVmFsUGFpcnMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHIsIHZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBgcmVtb3ZlQXR0cmlidXRlYCAqL1xuICAgIHJlbW92ZUF0dHIocXVhbGlmaWVkTmFtZTogc3RyaW5nLCAuLi5xdWFsaWZpZWROYW1lczogc3RyaW5nW10pOiB0aGlzIHtcbiAgICAgICAgbGV0IF9yZW1vdmVBdHRyaWJ1dGU7XG4gICAgICAgIGlmICh0aGlzLl9pc1N2Zykge1xuICAgICAgICAgICAgX3JlbW92ZUF0dHJpYnV0ZSA9IChxdWFsaWZpZWROYW1lKSA9PiB0aGlzLl9odG1sRWxlbWVudC5yZW1vdmVBdHRyaWJ1dGVOUyhTVkdfTlNfVVJJLCBxdWFsaWZpZWROYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUgPSAocXVhbGlmaWVkTmFtZSkgPT4gdGhpcy5faHRtbEVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKHF1YWxpZmllZE5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgX3JlbW92ZUF0dHJpYnV0ZShxdWFsaWZpZWROYW1lKTtcbiAgICAgICAgZm9yIChsZXQgcW4gb2YgcXVhbGlmaWVkTmFtZXMpIHtcbiAgICAgICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUocW4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKmBnZXRBdHRyaWJ1dGUoYGRhdGEtJHtrZXl9YClgLiBKU09OLnBhcnNlIGl0IGJ5IGRlZmF1bHQuKi9cbiAgICBnZXRkYXRhKGtleTogc3RyaW5nLCBwYXJzZTogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcgfCBUTWFwPHN0cmluZz4ge1xuICAgICAgICAvLyBUT0RPOiBqcXVlcnkgZG9lc24ndCBhZmZlY3QgZGF0YS0qIGF0dHJzIGluIERPTS4gaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9kYXRhL1xuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5faHRtbEVsZW1lbnQuZ2V0QXR0cmlidXRlKGBkYXRhLSR7a2V5fWApO1xuICAgICAgICBpZiAocGFyc2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2NhY2hlKGtleSwgY2hpbGQ6IEJldHRlckhUTUxFbGVtZW50IHwgQmV0dGVySFRNTEVsZW1lbnRbXSk6IHZvaWQge1xuICAgICAgICBjb25zdCBvbGRjaGlsZCA9IHRoaXMuX2NhY2hlZENoaWxkcmVuW2tleV07XG4gICAgICAgIGlmIChvbGRjaGlsZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYE92ZXJ3cml0aW5nIHRoaXMuX2NhY2hlZENoaWxkcmVuWyR7a2V5fV0hYCwgYG9sZCBjaGlsZDogJHtvbGRjaGlsZH1gLFxuICAgICAgICAgICAgICAgIGBuZXcgY2hpbGQ6ICR7Y2hpbGR9YCwgYGFyZSB0aGV5IGRpZmZlcmVudD86ICR7b2xkY2hpbGQgPT0gY2hpbGR9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzW2tleV0gPSBjaGlsZDtcbiAgICAgICAgdGhpcy5fY2FjaGVkQ2hpbGRyZW5ba2V5XSA9IGNoaWxkO1xuICAgIH1cblxuXG59XG5cbmV4cG9ydCBjbGFzcyBEaXY8USBleHRlbmRzIFF1ZXJ5U2VsZWN0b3IgPSBRdWVyeVNlbGVjdG9yPiBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50PEhUTUxEaXZFbGVtZW50PiB7XG4gICAgLyoqQ3JlYXRlIGEgSFRNTERpdkVsZW1lbnQuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBgaWRgLiAqL1xuICAgIGNvbnN0cnVjdG9yKHsgY2xzLCBzZXRpZCwgdGV4dCB9OiB7IGNscz86IHN0cmluZywgc2V0aWQ/OiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcgfSk7XG4gICAgLyoqQ3JlYXRlIGEgSFRNTERpdkVsZW1lbnQuIE9wdGlvbmFsbHksIHNldCBpdHMgYGh0bWxgLCBgY2xzYCBvciBgaWRgLiAqL1xuICAgIGNvbnN0cnVjdG9yKHsgY2xzLCBzZXRpZCwgaHRtbCB9OiB7IGNscz86IHN0cmluZywgc2V0aWQ/OiBzdHJpbmcsIGh0bWw/OiBzdHJpbmcgfSk7XG4gICAgLyoqV3JhcCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBieWlkYC4gT3B0aW9uYWxseSBjYWNoZSBleGlzdGluZyBgY2hpbGRyZW5gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGJ5aWQsIGNoaWxkcmVuIH06IHsgYnlpZDogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIC8qKldyYXAgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgcXVlcnlgLiBPcHRpb25hbGx5IGNhY2hlIGV4aXN0aW5nIGBjaGlsZHJlbmAqL1xuICAgIGNvbnN0cnVjdG9yKHsgcXVlcnksIGNoaWxkcmVuIH06IHsgcXVlcnk6IFF1ZXJ5T3JQcmVjaXNlVGFnPFEsIFwiZGl2XCI+LCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIC8qKldyYXAgYW4gZXhpc3RpbmcgSFRNTEVsZW1lbnQuIE9wdGlvbmFsbHkgY2FjaGUgZXhpc3RpbmcgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBodG1sRWxlbWVudCwgY2hpbGRyZW4gfTogeyBodG1sRWxlbWVudDogSFRNTERpdkVsZW1lbnQ7IGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk7XG4gICAgY29uc3RydWN0b3IoZGl2T3B0cykge1xuICAgICAgICBjb25zdCB7IHNldGlkLCBjbHMsIHRleHQsIGh0bWwsIGJ5aWQsIHF1ZXJ5LCBodG1sRWxlbWVudCwgY2hpbGRyZW4gfSA9IGRpdk9wdHM7XG4gICAgICAgIGlmICh0ZXh0ICE9PSB1bmRlZmluZWQgJiYgaHRtbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTXV0dWFsbHlFeGNsdXNpdmVBcmdzKHsgdGV4dCwgaHRtbCB9KVxuICAgICAgICB9XG4gICAgICAgIGlmIChodG1sRWxlbWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChieWlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1cGVyKHsgYnlpZCwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocXVlcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3VwZXIoeyBxdWVyeSwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlcih7IHRhZzogXCJkaXZcIiwgc2V0aWQsIGNscywgaHRtbCB9KTtcbiAgICAgICAgICAgIGlmICh0ZXh0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRleHQodGV4dCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxufVxuXG5leHBvcnQgY2xhc3MgUGFyYWdyYXBoIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQ8SFRNTFBhcmFncmFwaEVsZW1lbnQ+IHtcblxuICAgIGNvbnN0cnVjdG9yKHBPcHRzKSB7XG4gICAgICAgIC8vIGlmIChub1ZhbHVlKGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgLy8gICAgIHRocm93IG5ldyBOb3RFbm91Z2hBcmdzKFsxXSwgYXJndW1lbnRzWzBdKVxuICAgICAgICAvLyB9XG4gICAgICAgIGNvbnN0IHsgc2V0aWQsIGNscywgdGV4dCwgaHRtbCwgYnlpZCwgcXVlcnksIGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9ID0gcE9wdHM7XG4gICAgICAgIGlmICh0ZXh0ICE9PSB1bmRlZmluZWQgJiYgaHRtbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTXV0dWFsbHlFeGNsdXNpdmVBcmdzKHsgdGV4dCwgaHRtbCB9KVxuICAgICAgICB9XG4gICAgICAgIGlmIChodG1sRWxlbWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChieWlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1cGVyKHsgYnlpZCwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocXVlcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3VwZXIoeyBxdWVyeSwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlcih7IHRhZzogXCJwXCIsIHNldGlkLCBjbHMsIGh0bWwgfSk7XG4gICAgICAgICAgICBpZiAodGV4dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0KHRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3BhbiBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50PEhUTUxTcGFuRWxlbWVudD4ge1xuXG5cbiAgICBjb25zdHJ1Y3Rvcih7IGNscywgc2V0aWQsIHRleHQgfTogeyBjbHM/OiBzdHJpbmcsIHNldGlkPzogc3RyaW5nLCB0ZXh0Pzogc3RyaW5nIH0pXG4gICAgY29uc3RydWN0b3IoeyBjbHMsIHNldGlkLCBodG1sIH06IHsgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZywgaHRtbD86IHN0cmluZyB9KVxuICAgIGNvbnN0cnVjdG9yKHsgYnlpZCwgY2hpbGRyZW4gfTogeyBieWlkOiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSlcbiAgICBjb25zdHJ1Y3Rvcih7IHF1ZXJ5LCBjaGlsZHJlbiB9OiB7XG4gICAgICAgIHF1ZXJ5OiBzdHJpbmcsXG4gICAgICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbiAgICB9KVxuICAgIGNvbnN0cnVjdG9yKHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH06IHtcbiAgICAgICAgaHRtbEVsZW1lbnQ6IEhUTUxTcGFuRWxlbWVudDtcbiAgICAgICAgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxuICAgIH0pXG4gICAgY29uc3RydWN0b3Ioc3Bhbk9wdHMpIHtcbiAgICAgICAgY29uc3QgeyBzZXRpZCwgY2xzLCB0ZXh0LCBodG1sLCBieWlkLCBxdWVyeSwgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH0gPSBzcGFuT3B0cztcbiAgICAgICAgaWYgKHRleHQgIT09IHVuZGVmaW5lZCAmJiBodG1sICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNdXR1YWxseUV4Y2x1c2l2ZUFyZ3MoeyB0ZXh0LCBodG1sIH0pXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGh0bWxFbGVtZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1cGVyKHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGJ5aWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3VwZXIoeyBieWlkLCBjaGlsZHJlbiB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChxdWVyeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcih7IHF1ZXJ5LCBjaGlsZHJlbiB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyKHsgdGFnOiBcInNwYW5cIiwgc2V0aWQsIGNscywgaHRtbCB9KTtcbiAgICAgICAgICAgIGlmICh0ZXh0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRleHQodGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEltZzxRIGV4dGVuZHMgUXVlcnlTZWxlY3RvciA9IFF1ZXJ5U2VsZWN0b3I+IGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQ8SFRNTEltYWdlRWxlbWVudD4ge1xuXG5cbiAgICBjb25zdHJ1Y3Rvcih7IGNscywgc2V0aWQsIHNyYyB9OiB7XG4gICAgICAgIGNscz86IHN0cmluZywgc2V0aWQ/OiBzdHJpbmcsXG4gICAgICAgIHNyYz86IHN0cmluZ1xuICAgIH0pO1xuICAgIGNvbnN0cnVjdG9yKHsgYnlpZCwgY2hpbGRyZW4gfToge1xuICAgICAgICBieWlkOiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbiAgICB9KTtcbiAgICBjb25zdHJ1Y3Rvcih7IHF1ZXJ5LCBjaGlsZHJlbiB9OiB7XG4gICAgICAgIHF1ZXJ5OiBRdWVyeU9yUHJlY2lzZVRhZzxRLCBcImltZ1wiPixcbiAgICAgICAgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxuICAgIH0pO1xuICAgIGNvbnN0cnVjdG9yKHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH06IHtcbiAgICAgICAgaHRtbEVsZW1lbnQ6IEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbiAgICB9KVxuICAgIGNvbnN0cnVjdG9yKCk7XG4gICAgY29uc3RydWN0b3IoaW1nT3B0cz8pIHtcbiAgICAgICAgY29uc3QgeyBjbHMsIHNldGlkLCBzcmMsIGJ5aWQsIHF1ZXJ5LCBodG1sRWxlbWVudCwgY2hpbGRyZW4gfSA9IGltZ09wdHM7XG4gICAgICAgIGlmIChodG1sRWxlbWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChieWlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1cGVyKHsgYnlpZCwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocXVlcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3VwZXIoeyBxdWVyeSwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlcih7IHRhZzogXCJpbWdcIiwgc2V0aWQsIGNscyB9KTtcbiAgICAgICAgICAgIGlmIChzcmMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3JjKHNyYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIHNyYyhzcmM6IHN0cmluZyk6IHRoaXM7XG4gICAgc3JjKCk6IHN0cmluZztcbiAgICBzcmMoc3JjPykge1xuICAgICAgICBpZiAoc3JjID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9odG1sRWxlbWVudC5zcmNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnNyYyA9IHNyYztcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cblxuZXhwb3J0IGNsYXNzIEFuY2hvciBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50PEhUTUxBbmNob3JFbGVtZW50PiB7XG5cblxuICAgIGNvbnN0cnVjdG9yKHsgc2V0aWQsIGNscywgdGV4dCwgaHRtbCwgaHJlZiwgdGFyZ2V0LCBieWlkLCBxdWVyeSwgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH0pIHtcbiAgICAgICAgaWYgKHRleHQgIT09IHVuZGVmaW5lZCAmJiBodG1sICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNdXR1YWxseUV4Y2x1c2l2ZUFyZ3MoeyB0ZXh0LCBodG1sIH0pXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGh0bWxFbGVtZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1cGVyKHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGJ5aWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3VwZXIoeyBieWlkLCBjaGlsZHJlbiB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChxdWVyeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcih7IHF1ZXJ5LCBjaGlsZHJlbiB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyKHsgdGFnOiBcImFcIiwgc2V0aWQsIGNscywgaHRtbCB9KTtcbiAgICAgICAgICAgIGlmICh0ZXh0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRleHQodGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaHJlZiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ocmVmKGhyZWYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhcmdldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgaHJlZigpOiBzdHJpbmdcbiAgICBocmVmKHZhbDogc3RyaW5nKTogdGhpc1xuICAgIGhyZWYodmFsPykge1xuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ2hyZWYnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoeyBocmVmOiB2YWwgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRhcmdldCgpOiBzdHJpbmdcbiAgICB0YXJnZXQodmFsOiBzdHJpbmcpOiB0aGlzXG4gICAgdGFyZ2V0KHZhbD8pIHtcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd0YXJnZXQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoeyB0YXJnZXQ6IHZhbCB9KVxuICAgICAgICB9XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgRmxhc2hhYmxlIHtcbiAgICBmbGFzaEJhZCgpOiBQcm9taXNlPHZvaWQ+O1xuXG4gICAgZmxhc2hHb29kKCk6IFByb21pc2U8dm9pZD47XG59XG5cbmV4cG9ydCB0eXBlIEZvcm1pc2hIVE1MRWxlbWVudCA9IEhUTUxCdXR0b25FbGVtZW50IHwgSFRNTElucHV0RWxlbWVudCB8IEhUTUxTZWxlY3RFbGVtZW50O1xuZXhwb3J0IHR5cGUgSW5wdXRUeXBlID0gXCJjaGVja2JveFwiIHwgXCJudW1iZXJcIiB8IFwicmFkaW9cIiB8IFwidGV4dFwiIHwgXCJ0aW1lXCIgfCBcImRhdGV0aW1lLWxvY2FsXCJcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEZvcm08R2VuZXJpYyBleHRlbmRzIEZvcm1pc2hIVE1MRWxlbWVudD5cbiAgICBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50PEdlbmVyaWM+IGltcGxlbWVudHMgRmxhc2hhYmxlIHtcblxuXG4gICAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQuZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgIEJ1dHRvbiA8IElucHV0XG4gICAgIFNlbGVjdCAtIElucHV0OiBhZGQoKSwgaXRlbSgpLCBsZW5ndGgsIG5hbWVkSXRlbSgpLCBvcHRpb25zLCByZW1vdmUoKSwgc2VsZWN0ZWRJbmRleCwgc2VsZWN0ZWRPcHRpb25zLCBJVEVSQVRPUlxuICAgICBTZWxlY3QgLSBCdXR0b246IGFkZCgpIGF1dG9jb21wbGV0ZSBpdGVtKCkgbGVuZ3RoIG11bHRpcGxlIG5hbWVkSXRlbSgpIG9wdGlvbnMgcmVtb3ZlKCkgcmVxdWlyZWQgc2VsZWN0ZWRJbmRleCBzZWxlY3RlZE9wdGlvbnMgc2l6ZSBJVEVSQVRPUlxuICAgICBCdXR0b24gLSBTZWxlY3Q6IGZvcm1BY3Rpb24gZm9ybUVuY3R5cGUgZm9ybU1ldGhvZCBmb3JtTm9WYWxpZGF0ZSBmb3JtVGFyZ2V0XG5cbiAgICAgSW5wdXQgdW5pcXVlczpcbiAgICAgYWNjZXB0IGNoZWNrZWQgZGVmYXVsdENoZWNrZWQgZGVmYXVsdFZhbHVlIGRpck5hbWUgZmlsZXMgaW5kZXRlcm1pbmF0ZSBsaXN0IG1heCBtYXhMZW5ndGggbWluIG1pbkxlbmd0aCBwYXR0ZXJuIHBsYWNlaG9sZGVyIHJlYWRPbmx5IHNlbGVjdCgpIHNlbGVjdGlvbkRpcmVjdGlvbiBzZWxlY3Rpb25FbmQgc2VsZWN0aW9uU3RhcnQgc2V0UmFuZ2VUZXh0KCkgc2V0U2VsZWN0aW9uUmFuZ2UoKSBzcmMgc3RlcCBzdGVwRG93bigpIHN0ZXBVcCgpIHVzZU1hcCB2YWx1ZUFzRGF0ZSB2YWx1ZUFzTnVtYmVyXG5cbiAgICAgU2VsZWN0IHVuaXF1ZXM6XG4gICAgIGFkZCgpIGl0ZW0oKSBsZW5ndGggbmFtZWRJdGVtKCkgb3B0aW9ucyByZW1vdmUoKSBzZWxlY3RlZEluZGV4IHNlbGVjdGVkT3B0aW9ucyBJVEVSQVRPUlxuXG4gICAgIFNoYXJlZCBhbW9uZyBCdXR0b24sIFNlbGVjdCBhbmQgSW5wdXQ6IChvciBCdXR0b24gYW5kIFNlbGVjdCwgc2FtZSlcbiAgICAgY2hlY2tWYWxpZGl0eSgpIGRpc2FibGVkIGZvcm0gbGFiZWxzIG5hbWUgcmVwb3J0VmFsaWRpdHkoKSBzZXRDdXN0b21WYWxpZGl0eSgpIHR5cGUgdmFsaWRhdGlvbk1lc3NhZ2UgdmFsaWRpdHkgdmFsdWUgd2lsbFZhbGlkYXRlXG5cbiAgICAgU2hhcmVkIGFtbW9uZyBTZWxlY2N0IGFuZCBJbnB1dDpcbiAgICAgYXV0b2NvbXBsZXRlIGNoZWNrVmFsaWRpdHkoKSBkaXNhYmxlZCBmb3JtIGxhYmVscyBtdWx0aXBsZSBuYW1lIHJlcG9ydFZhbGlkaXR5KCkgcmVxdWlyZWQgc2V0Q3VzdG9tVmFsaWRpdHkoKSB0eXBlIHZhbGlkYXRpb25NZXNzYWdlIHZhbGlkaXR5IHZhbHVlIHdpbGxWYWxpZGF0ZVxuXG4gICAgICovXG4gICAgZGlzYWJsZSgpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBlbmFibGUoKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKkRpc2FibGVzLiovXG4gICAgdG9nZ2xlRW5hYmxlZChvbjogbnVsbCB8IHVuZGVmaW5lZCB8IDApOiB0aGlzXG4gICAgLyoqQ2FsbHMgYGVuYWJsZSgpYCBvciBgZGlzYWJsZSgpYCBhY2NvcmRpbmdseS4gKi9cbiAgICB0b2dnbGVFbmFibGVkKG9uOiBib29sZWFuKTogdGhpc1xuICAgIC8qKkVuYWJsZXMgaWYgYG9uYCBpcyB0cnV0aHksIG90aGVyd2lzZSBkaXNhYmxlcy5cbiAgICAgRXJyb3JzIGlmIGBvbmAgaXMgbm9uLXByaW1pdGl2ZSAob2JqZWN0LCBhcnJheSkuKi9cbiAgICB0b2dnbGVFbmFibGVkKG9uKTogdGhpcyB7XG4gICAgICAgIGlmIChpc09iamVjdChvbikpIHtcbiAgICAgICAgICAgIHRoaXMuX3NvZnRFcnIobmV3IEJIRVR5cGVFcnJvcih7IGZhdWx0eVZhbHVlOiB7IG9uIH0sIGV4cGVjdGVkOiBcInByaW1pdGl2ZVwiLCB3aGVyZTogXCJ0b2dnbGVFbmFibGVkKClcIiB9KSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgICB9XG4gICAgICAgIGlmIChib29sKG9uKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5hYmxlKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpc2FibGUoKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqUmV0dXJucyB1bmRlZmluZWQgaWYgYF9odG1sRWxlbWVudC52YWx1ZWAgaXMgbnVsbCBvciB1bmRlZmluZWQsIG90aGVyd2lzZSByZXR1cm5zIGBfaHRtbEVsZW1lbnQudmFsdWVgKi9cbiAgICB2YWx1ZSgpOiBhbnk7XG4gICAgLyoqUmV0dXJucyB1bmRlZmluZWQgaWYgYF9odG1sRWxlbWVudC52YWx1ZWAgaXMgbnVsbCBvciB1bmRlZmluZWQsIG90aGVyd2lzZSByZXR1cm5zIGBfaHRtbEVsZW1lbnQudmFsdWVgKi9cbiAgICB2YWx1ZSh2YWw6IHVuZGVmaW5lZCk6IGFueTtcbiAgICAvKipSZXNldHMgYHZhbHVlYC4gKi9cbiAgICB2YWx1ZSh2YWw6IG51bGwgfCAnJyk6IHRoaXM7XG4gICAgLyoqU2V0cyBgdmFsdWVgICovXG4gICAgdmFsdWUodmFsOiBhbnkpOiB0aGlzO1xuICAgIHZhbHVlKHZhbD8pIHtcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQudmFsdWUgPz8gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlzT2JqZWN0KHZhbCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zb2Z0RXJyKG5ldyBCSEVUeXBlRXJyb3IoeyBmYXVsdHlWYWx1ZTogeyB2YWwgfSwgZXhwZWN0ZWQ6IFwicHJpbWl0aXZlXCIsIHdoZXJlOiBcInZhbHVlKClcIiB9KSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC52YWx1ZSA9IHZhbDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgZmxhc2hCYWQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3MoJ2JhZCcpO1xuICAgICAgICBhd2FpdCB3YWl0KDIwMDApO1xuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKCdiYWQnKTtcblxuICAgIH1cblxuICAgIGFzeW5jIGZsYXNoR29vZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcygnZ29vZCcpO1xuICAgICAgICBhd2FpdCB3YWl0KDIwMDApO1xuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKCdnb29kJyk7XG4gICAgfVxuXG4gICAgY2xlYXIoKTogdGhpcyB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlKG51bGwpXG4gICAgfVxuXG4gICAgLy8gKiogRXZlbnQgSG9va3NcbiAgICBfYmVmb3JlRXZlbnQoKTogdGhpcztcbiAgICAvKipDYWxscyBgc2VsZi5kaXNhYmxlKClgLiovXG4gICAgX2JlZm9yZUV2ZW50KHRoaXNBcmc6IHRoaXMpOiB0aGlzXG4gICAgX2JlZm9yZUV2ZW50KHRoaXNBcmc/OiB0aGlzKTogdGhpcyB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcyA9PT0gdW5kZWZpbmVkID8gdGhpc0FyZyA6IHRoaXM7XG4gICAgICAgIHJldHVybiBzZWxmLmRpc2FibGUoKVxuICAgIH1cblxuICAgIF9vbkV2ZW50U3VjY2VzcyhyZXQ6IGFueSk6IHRoaXNcbiAgICBfb25FdmVudFN1Y2Nlc3MocmV0OiBhbnksIHRoaXNBcmc6IHRoaXMpOiB0aGlzXG4gICAgLyoqQ2FsbHMgYHNlbGYuZmxhc2hHb29kKClgLiovXG4gICAgX29uRXZlbnRTdWNjZXNzKHJldDogYW55LCB0aGlzQXJnPzogdGhpcyk6IHRoaXMge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXMgPT09IHVuZGVmaW5lZCA/IHRoaXNBcmcgOiB0aGlzO1xuICAgICAgICBpZiAoc2VsZi5mbGFzaEdvb2QpIHtcbiAgICAgICAgICAgIHNlbGYuZmxhc2hHb29kKClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VsZlxuICAgIH1cblxuICAgIGFzeW5jIF9zb2Z0RXJyKGU6IEVycm9yKTogUHJvbWlzZTx0aGlzPjtcbiAgICBhc3luYyBfc29mdEVycihlOiBFcnJvciwgdGhpc0FyZzogdGhpcyk6IFByb21pc2U8dGhpcz47XG4gICAgLyoqTG9ncyBlcnJvciB0byBjb25zb2xlIGFuZCBjYWxscyBgc2VsZi5mbGFzaEJhZCgpYC4qL1xuICAgIGFzeW5jIF9zb2Z0RXJyKGU6IEVycm9yLCB0aGlzQXJnPzogdGhpcyk6IFByb21pc2U8dGhpcz4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKGAke2UubmFtZX06XFxuJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcyA9PT0gdW5kZWZpbmVkID8gdGhpc0FyZyA6IHRoaXM7XG4gICAgICAgIGlmIChzZWxmLmZsYXNoQmFkKSB7XG4gICAgICAgICAgICBhd2FpdCBzZWxmLmZsYXNoQmFkKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlbGZcbiAgICB9XG5cbiAgICBhc3luYyBfc29mdFdhcm4oZTogRXJyb3IpOiBQcm9taXNlPHRoaXM+O1xuICAgIGFzeW5jIF9zb2Z0V2FybihlOiBFcnJvciwgdGhpc0FyZzogdGhpcyk6IFByb21pc2U8dGhpcz47XG4gICAgLyoqTG9ncyB3YXJuaW5nIHRvIGNvbnNvbGUgYW5kIGNhbGxzIGBzZWxmLmZsYXNoQmFkKClgLiovXG4gICAgYXN5bmMgX3NvZnRXYXJuKGU6IEVycm9yLCB0aGlzQXJnPzogdGhpcyk6IFByb21pc2U8dGhpcz4ge1xuICAgICAgICBjb25zb2xlLndhcm4oYCR7ZS5uYW1lfTpcXG4ke2UubWVzc2FnZX1gKTtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzID09PSB1bmRlZmluZWQgPyB0aGlzQXJnIDogdGhpcztcbiAgICAgICAgaWYgKHNlbGYuZmxhc2hCYWQpIHtcbiAgICAgICAgICAgIGF3YWl0IHNlbGYuZmxhc2hCYWQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VsZlxuICAgIH1cblxuICAgIF9hZnRlckV2ZW50KCk6IHRoaXM7XG4gICAgX2FmdGVyRXZlbnQodGhpc0FyZzogdGhpcyk6IHRoaXM7XG4gICAgLyoqQ2FsbHMgYHNlbGYuZW5hYmxlKClgLiovXG4gICAgX2FmdGVyRXZlbnQodGhpc0FyZz86IHRoaXMpOiB0aGlzIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzID09PSB1bmRlZmluZWQgPyB0aGlzQXJnIDogdGhpcztcbiAgICAgICAgcmV0dXJuIHNlbGYuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgLyoqVXNlZCBieSBlLmcuIGBjbGljayhmbilgIHRvIHdyYXAgcGFzc2VkIGBmbmAgc2FmZWx5IGFuZCB0cmlnZ2VyIGBfW2JlZm9yZXxhZnRlcnxvbl1FdmVudFtTdWNjZXNzfEVycm9yXWAuKi9cbiAgICBwcm90ZWN0ZWQgYXN5bmMgX3dyYXBGbkluRXZlbnRIb29rczxGIGV4dGVuZHMgKGV2ZW50OiBFdmVudCkgPT4gUHJvbWlzZTxhbnk+Pihhc3luY0ZuOiBGLCBldmVudDogRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuX2JlZm9yZUV2ZW50KCk7XG4gICAgICAgICAgICBjb25zdCByZXQgPSBhd2FpdCBhc3luY0ZuKGV2ZW50KTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX29uRXZlbnRTdWNjZXNzKHJldCk7XG5cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5fc29mdEVycihlKTtcblxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5fYWZ0ZXJFdmVudCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBCdXR0b248USBleHRlbmRzIFF1ZXJ5U2VsZWN0b3IgPSBRdWVyeVNlbGVjdG9yPiBleHRlbmRzIEZvcm08SFRNTEJ1dHRvbkVsZW1lbnQ+IHtcbiAgICBjb25zdHJ1Y3Rvcih7IGNscywgc2V0aWQsIHRleHQsIGNsaWNrIH06IHtcbiAgICAgICAgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZywgdGV4dD86IHN0cmluZywgY2xpY2s/OiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueVxuICAgIH0pO1xuICAgIGNvbnN0cnVjdG9yKHsgY2xzLCBzZXRpZCwgaHRtbCwgY2xpY2sgfToge1xuICAgICAgICBjbHM/OiBzdHJpbmcsIHNldGlkPzogc3RyaW5nLCBodG1sPzogc3RyaW5nLCBjbGljaz86IChldmVudDogTW91c2VFdmVudCkgPT4gYW55XG4gICAgfSk7XG4gICAgY29uc3RydWN0b3IoeyBieWlkLCBjaGlsZHJlbiB9OiB7XG4gICAgICAgIGJ5aWQ6IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxuICAgIH0pO1xuICAgIGNvbnN0cnVjdG9yKHsgcXVlcnksIGNoaWxkcmVuIH06IHtcbiAgICAgICAgcXVlcnk6IFF1ZXJ5T3JQcmVjaXNlVGFnPFEsIFwiYnV0dG9uXCI+LFxuICAgICAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG4gICAgfSlcbiAgICBjb25zdHJ1Y3Rvcih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9OiB7XG4gICAgICAgIGh0bWxFbGVtZW50OiBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICAgICAgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxuICAgIH0pXG4gICAgY29uc3RydWN0b3IoKTtcbiAgICBjb25zdHJ1Y3RvcihidXR0b25PcHRzPykge1xuICAgICAgICBjb25zdCB7IHNldGlkLCBjbHMsIHRleHQsIGh0bWwsIGJ5aWQsIHF1ZXJ5LCBodG1sRWxlbWVudCwgY2hpbGRyZW4sIGNsaWNrIH0gPSBidXR0b25PcHRzO1xuICAgICAgICBpZiAodGV4dCAhPT0gdW5kZWZpbmVkICYmIGh0bWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE11dHVhbGx5RXhjbHVzaXZlQXJncyh7IHRleHQsIGh0bWwgfSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoaHRtbEVsZW1lbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3VwZXIoeyBodG1sRWxlbWVudCwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYnlpZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcih7IGJ5aWQsIGNoaWxkcmVuIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHF1ZXJ5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1cGVyKHsgcXVlcnksIGNoaWxkcmVuIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIoeyB0YWc6IFwiYnV0dG9uXCIsIHNldGlkLCBjbHMsIGh0bWwgfSk7XG4gICAgICAgICAgICBpZiAodGV4dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0KHRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNsaWNrICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrKGNsaWNrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBjbGljayhfZm4/OiAoX2V2ZW50OiBNb3VzZUV2ZW50KSA9PiBQcm9taXNlPGFueT4pOiB0aGlzIHtcbiAgICAgICAgaWYgKF9mbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBmbiA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuX3dyYXBGbkluRXZlbnRIb29rcyhfZm4sIGV2ZW50KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBzdXBlci5jbGljayhmbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1cGVyLmNsaWNrKClcbiAgICB9XG5cblxufVxuXG5leHBvcnQgY2xhc3MgSW5wdXQ8VElucHV0VHlwZSBleHRlbmRzIElucHV0VHlwZSxcbiAgICBHZW5lcmljIGV4dGVuZHMgRm9ybWlzaEhUTUxFbGVtZW50ID0gSFRNTElucHV0RWxlbWVudCxcbiAgICBRIGV4dGVuZHMgUXVlcnlTZWxlY3RvciA9IFF1ZXJ5U2VsZWN0b3I+XG4gICAgZXh0ZW5kcyBGb3JtPEdlbmVyaWM+IHtcbiAgICB0eXBlOiBUSW5wdXRUeXBlO1xuXG4gICAgY29uc3RydWN0b3IoeyBjbHMsIHNldGlkLCB0eXBlIH06IHtcbiAgICAgICAgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZyxcbiAgICAgICAgdHlwZT86IFRJbnB1dFR5cGVcbiAgICB9KTtcblxuICAgIGNvbnN0cnVjdG9yKHsgYnlpZCwgY2hpbGRyZW4gfTogeyBieWlkOiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk7XG4gICAgY29uc3RydWN0b3IoeyBxdWVyeSwgY2hpbGRyZW4gfToge1xuICAgICAgICBxdWVyeTogUXVlcnlPclByZWNpc2VUYWc8USwgXCJpbnB1dFwiPixcbiAgICAgICAgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxuICAgIH0pO1xuXG4gICAgY29uc3RydWN0b3IoeyBodG1sRWxlbWVudCwgY2hpbGRyZW4gfToge1xuICAgICAgICBodG1sRWxlbWVudDogR2VuZXJpYztcbiAgICAgICAgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxuICAgIH0pO1xuXG4gICAgY29uc3RydWN0b3IoKTtcbiAgICBjb25zdHJ1Y3RvcihpbnB1dE9wdHM/KSB7XG4gICAgICAgIGNvbnN0IHsgc2V0aWQsIGNscywgdHlwZSwgYnlpZCwgcXVlcnksIGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9ID0gaW5wdXRPcHRzO1xuXG5cbiAgICAgICAgaWYgKGh0bWxFbGVtZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1cGVyKHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGJ5aWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3VwZXIoeyBieWlkLCBjaGlsZHJlbiB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChxdWVyeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcih7IHF1ZXJ5LCBjaGlsZHJlbiB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyKHsgdGFnOiBcImlucHV0XCIgYXMgRWxlbWVudDJUYWc8R2VuZXJpYz4sIGNscywgc2V0aWQgfSk7XG4gICAgICAgICAgICBpZiAodHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQudHlwZSA9IHR5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgfVxuXG5cbn1cblxuZXhwb3J0IGNsYXNzIFRleHRJbnB1dDxRIGV4dGVuZHMgUXVlcnlTZWxlY3RvciA9IFF1ZXJ5U2VsZWN0b3I+IGV4dGVuZHMgSW5wdXQ8XCJ0ZXh0XCI+IHtcbiAgICBjb25zdHJ1Y3Rvcih7IGNscywgc2V0aWQsIHBsYWNlaG9sZGVyIH06IHtcbiAgICAgICAgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZyxcbiAgICAgICAgcGxhY2Vob2xkZXI/OiBzdHJpbmdcbiAgICB9KTtcblxuICAgIGNvbnN0cnVjdG9yKHsgYnlpZCwgY2hpbGRyZW4gfTogeyBieWlkOiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk7XG4gICAgY29uc3RydWN0b3IoeyBxdWVyeSwgY2hpbGRyZW4gfToge1xuICAgICAgICBxdWVyeTogUXVlcnlPclByZWNpc2VUYWc8USwgXCJpbnB1dFwiPixcbiAgICAgICAgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxuICAgIH0pO1xuXG4gICAgY29uc3RydWN0b3IoeyBodG1sRWxlbWVudCwgY2hpbGRyZW4gfToge1xuICAgICAgICBodG1sRWxlbWVudDogSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxuICAgIH0pO1xuXG4gICAgY29uc3RydWN0b3IoKTtcbiAgICBjb25zdHJ1Y3RvcihvcHRzPykge1xuICAgICAgICBvcHRzLnR5cGUgPSAndGV4dCc7XG4gICAgICAgIHN1cGVyKG9wdHMpO1xuICAgICAgICBjb25zdCB7IHBsYWNlaG9sZGVyIH0gPSBvcHRzO1xuICAgICAgICBpZiAocGxhY2Vob2xkZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5wbGFjZWhvbGRlcihwbGFjZWhvbGRlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwbGFjZWhvbGRlcih2YWw6IHN0cmluZyk6IHRoaXM7XG4gICAgcGxhY2Vob2xkZXIoKTogc3RyaW5nO1xuICAgIHBsYWNlaG9sZGVyKHZhbD8pIHtcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQucGxhY2Vob2xkZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5wbGFjZWhvbGRlciA9IHZhbDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBrZXlkb3duKF9mbjogKF9ldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gUHJvbWlzZTxhbnk+KTogdGhpcyB7XG4gICAgICAgIGNvbnN0IGZuID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5ICE9PSAnRW50ZXInKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHZhbCA9IHRoaXMudmFsdWUoKTtcbiAgICAgICAgICAgIGlmICghYm9vbCh2YWwpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc29mdFdhcm4obmV3IFZhbHVlRXJyb3IoeyBmYXVsdHlWYWx1ZTogeyB2YWwgfSwgZXhwZWN0ZWQ6IFwidHJ1dGh5XCIsIHdoZXJlOiBcImtleWRvd24oKVwiIH0pKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCB0aGlzLl93cmFwRm5JbkV2ZW50SG9va3MoX2ZuLCBldmVudCk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBzdXBlci5rZXlkb3duKGZuKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDaGFuZ2FibGU8VElucHV0VHlwZSBleHRlbmRzIElucHV0VHlwZSwgR2VuZXJpYyBleHRlbmRzIEZvcm1pc2hIVE1MRWxlbWVudD4gZXh0ZW5kcyBJbnB1dDxUSW5wdXRUeXBlLCBHZW5lcmljPiB7XG4gICAgY2hhbmdlKF9mbjogKF9ldmVudDogRXZlbnQpID0+IFByb21pc2U8YW55Pik6IHRoaXMge1xuXG4gICAgICAgIGNvbnN0IGZuID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLl93cmFwRm5JbkV2ZW50SG9va3MoX2ZuLCBldmVudCk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBzdXBlci5jaGFuZ2UoZm4pO1xuICAgIH1cbn1cblxuLyoqUGF0Y2hlcyBGb3JtJ3MgYHZhbHVlKClgIHRvIHNldC9nZXQgYF9odG1sRWxlbWVudC5jaGVja2VkYCwgYW5kIGBjbGVhcigpYCB0byB1bmNoZWNrLiAqL1xuZXhwb3J0IGNsYXNzIENoZWNrYm94SW5wdXQgZXh0ZW5kcyBDaGFuZ2FibGU8XCJjaGVja2JveFwiLCBIVE1MSW5wdXRFbGVtZW50PiB7XG4gICAgY29uc3RydWN0b3Iob3B0cykge1xuICAgICAgICBvcHRzLnR5cGUgPSAnY2hlY2tib3gnO1xuICAgICAgICBzdXBlcihvcHRzKTtcbiAgICB9XG5cbiAgICBnZXQgY2hlY2tlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50LmNoZWNrZWQ7XG4gICAgfVxuXG4gICAgY2hlY2soKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB1bmNoZWNrKCk6IHRoaXMge1xuICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuXG4gICAgLyoqRGlzYWJsZXMuKi9cbiAgICB0b2dnbGVDaGVja2VkKG9uOiBudWxsIHwgdW5kZWZpbmVkIHwgMCk6IHRoaXNcbiAgICAvKipDYWxscyBgY2hlY2soKWAgb3IgYHVuY2hlY2soKWAgYWNjb3JkaW5nbHkuICovXG4gICAgdG9nZ2xlQ2hlY2tlZChvbjogYm9vbGVhbik6IHRoaXNcblxuICAgIC8qKmNoZWNrcyBvbiBpZiBgb25gIGlzIHRydXRoeSwgb3RoZXJ3aXNlIHVuY2hlY2tzLlxuICAgICBFcnJvcnMgaWYgYG9uYCBpcyBub24tcHJpbWl0aXZlIChvYmplY3QsIGFycmF5KS4qL1xuICAgIHRvZ2dsZUNoZWNrZWQob24pIHtcbiAgICAgICAgaWYgKGlzT2JqZWN0KG9uKSkge1xuICAgICAgICAgICAgdGhpcy5fc29mdEVycihuZXcgQkhFVHlwZUVycm9yKHsgZmF1bHR5VmFsdWU6IHsgb24gfSwgZXhwZWN0ZWQ6IFwicHJpbWl0aXZlXCIsIHdoZXJlOiBcInRvZ2dsZUNoZWNrZWQoKVwiIH0pKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJvb2wob24pKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjaygpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy51bmNoZWNrKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlJldHVybnMgdW5kZWZpbmVkIGlmIGBfaHRtbEVsZW1lbnQudmFsdWVgIGlzIG51bGwgb3IgdW5kZWZpbmVkLCBvdGhlcndpc2UgcmV0dXJucyBgX2h0bWxFbGVtZW50LnZhbHVlYCovXG4gICAgdmFsdWUoKTogYW55O1xuICAgIC8qKlJldHVybnMgdW5kZWZpbmVkIGlmIGBfaHRtbEVsZW1lbnQudmFsdWVgIGlzIG51bGwgb3IgdW5kZWZpbmVkLCBvdGhlcndpc2UgcmV0dXJucyBgX2h0bWxFbGVtZW50LnZhbHVlYCovXG4gICAgdmFsdWUodmFsOiB1bmRlZmluZWQpOiBhbnk7XG4gICAgLyoqUmVzZXRzIGB2YWx1ZWAuICovXG4gICAgdmFsdWUodmFsOiBudWxsIHwgJycpOiB0aGlzO1xuICAgIC8qKlNldHMgYHZhbHVlYCAqL1xuICAgIHZhbHVlKHZhbDogYW55KTogdGhpcztcbiAgICB2YWx1ZSh2YWw/KSB7XG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50LmNoZWNrZWQgPz8gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlzT2JqZWN0KHZhbCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zb2Z0RXJyKG5ldyBCSEVUeXBlRXJyb3IoeyBmYXVsdHlWYWx1ZTogeyB2YWwgfSwgZXhwZWN0ZWQ6IFwicHJpbWl0aXZlXCIsIHdoZXJlOiBcInZhbHVlKClcIiB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5jaGVja2VkID0gdmFsO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGVhcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudW5jaGVjaygpO1xuICAgIH1cblxuICAgIGFzeW5jIF9zb2Z0RXJyKGU6IEVycm9yLCB0aGlzQXJnPzogdGhpcyk6IFByb21pc2U8dGhpcz4ge1xuICAgICAgICB0aGlzLnRvZ2dsZUNoZWNrZWQoIXRoaXMuY2hlY2tlZCk7XG4gICAgICAgIHJldHVybiBzdXBlci5fc29mdEVycihlKTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFNlbGVjdCBleHRlbmRzIENoYW5nYWJsZTx1bmRlZmluZWQsIEhUTUxTZWxlY3RFbGVtZW50PiB7XG5cbiAgICAvLyBTZWxlY3QgdW5pcXVlczpcbiAgICAvLyBhZGQoKSBpdGVtKCkgbGVuZ3RoIG5hbWVkSXRlbSgpIG9wdGlvbnMgcmVtb3ZlKCkgc2VsZWN0ZWRJbmRleCBzZWxlY3RlZE9wdGlvbnMgSVRFUkFUT1JcbiAgICBjb25zdHJ1Y3RvcihzZWxlY3RPcHRzKSB7XG4gICAgICAgIHN1cGVyKHNlbGVjdE9wdHMpO1xuICAgIH1cblxuICAgIGdldCBzZWxlY3RlZEluZGV4KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9odG1sRWxlbWVudC5zZWxlY3RlZEluZGV4XG4gICAgfVxuXG4gICAgc2V0IHNlbGVjdGVkSW5kZXgodmFsOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuc2VsZWN0ZWRJbmRleCA9IHZhbFxuICAgIH1cblxuICAgIGdldCBzZWxlY3RlZCgpOiBIVE1MT3B0aW9uRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW0odGhpcy5zZWxlY3RlZEluZGV4KVxuICAgIH1cblxuICAgIC8qKkBwYXJhbSB2YWwgLSBFaXRoZXIgYSBzcGVjaWZpYyBIVE1MT3B0aW9uRWxlbWVudCwgbnVtYmVyIChpbmRleCkqL1xuICAgIHNldCBzZWxlY3RlZCh2YWwpIHtcbiAgICAgICAgaWYgKHZhbCBpbnN0YW5jZW9mIEhUTUxPcHRpb25FbGVtZW50KSB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLm9wdGlvbnMuZmluZEluZGV4KG8gPT4gbyA9PT0gdmFsKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zb2Z0V2FybihuZXcgVmFsdWVFcnJvcih7IGZhdWx0eVZhbHVlOiB7IHZhbCB9LCB3aGVyZTogXCJzZXQgc2VsZWN0ZWQodmFsKVwiLCBtZXNzYWdlOiBgbm8gb3B0aW9uIGVxdWFscyBwYXNzZWQgdmFsYCB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSBpbmRleDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gdmFsXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSB0aGlzLm9wdGlvbnMuZmluZEluZGV4KG8gPT4gby52YWx1ZSA9PT0gdmFsKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZ2V0IG9wdGlvbnMoKTogSFRNTE9wdGlvbkVsZW1lbnRbXSB7XG4gICAgICAgIHJldHVybiBbLi4udGhpcy5faHRtbEVsZW1lbnQub3B0aW9ucyBhcyB1bmtub3duIGFzIEl0ZXJhYmxlPEhUTUxPcHRpb25FbGVtZW50Pl1cbiAgICB9XG5cbiAgICBpdGVtKGluZGV4OiBudW1iZXIpOiBIVE1MT3B0aW9uRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9odG1sRWxlbWVudC5pdGVtKGluZGV4KSBhcyBIVE1MT3B0aW9uRWxlbWVudFxuICAgIH1cblxuICAgIC8qKlJldHVybnMgdW5kZWZpbmVkIGlmIGB0aGlzLnNlbGVjdGVkLnZhbHVlYCBpcyBudWxsIG9yIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIHJldHVybnMgYHRoaXMuc2VsZWN0ZWQudmFsdWVgKi9cbiAgICB2YWx1ZSgpOiBhbnk7XG4gICAgLyoqUmV0dXJucyB1bmRlZmluZWQgaWYgYHRoaXMuc2VsZWN0ZWQudmFsdWVgIGlzIG51bGwgb3IgdW5kZWZpbmVkLCBvdGhlcndpc2UgcmV0dXJucyBgdGhpcy5zZWxlY3RlZC52YWx1ZWAqL1xuICAgIHZhbHVlKHZhbDogdW5kZWZpbmVkKTogYW55O1xuICAgIC8qKlJlc2V0cyBgc2VsZWN0ZWRgIHRvIGJsYW5rKi9cbiAgICB2YWx1ZSh2YWw6IG51bGwgfCAnJyB8IGJvb2xlYW4pOiB0aGlzO1xuICAgIC8qKlNldHMgYHNlbGVjdGVkYCB0byBgdmFsYCBpZiBmaW5kcyBhIG1hdGNoICovXG4gICAgdmFsdWUodmFsOiBIVE1MT3B0aW9uRWxlbWVudCB8IG51bWJlciB8IGFueSk6IHRoaXM7XG4gICAgdmFsdWUodmFsPykge1xuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkLnZhbHVlID8/IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB2YWw7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlNldHMgYHNlbGVjdGVkYCB0byAwdGggZWxlbWVudC4gRXF1aXZhbGVudCB0byBgdmFsdWUoMClgLiovXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgICAgIGxldCBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgICBsZXQgY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudEluZGV4ICs9IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgZG9uZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0qL1xufVxuXG5cbi8qY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItaHRtbC1lbGVtZW50JywgQmV0dGVySFRNTEVsZW1lbnQpO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItZGl2JywgRGl2LCB7ZXh0ZW5kczogJ2Rpdid9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWlucHV0JywgSW5wdXQsIHtleHRlbmRzOiAnaW5wdXQnfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1wJywgUGFyYWdyYXBoLCB7ZXh0ZW5kczogJ3AnfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1zcGFuJywgU3Bhbiwge2V4dGVuZHM6ICdzcGFuJ30pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItaW1nJywgSW1nLCB7ZXh0ZW5kczogJ2ltZyd9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLWEnLCBBbmNob3IsIHtleHRlbmRzOiAnYSd9KTsqL1xuXG4vLyBjdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1zdmcnLCBTdmcsIHtleHRlbmRzOiAnc3ZnJ30pO1xuXG4vKipDcmVhdGUgYW4gZWxlbWVudCBvZiBgY3JlYXRlYC4gT3B0aW9uYWxseSwgc2V0IGl0cyBgdGV4dGAgYW5kIC8gb3IgYGNsc2AqL1xuZXhwb3J0IGZ1bmN0aW9uIGVsZW08VCBleHRlbmRzIFRhZz4oeyB0YWcsIGNscywgc2V0aWQsIGh0bWwgfTogeyB0YWc6IFQsIGNscz86IHN0cmluZywgc2V0aWQ/OiBzdHJpbmcsIGh0bWw/OiBzdHJpbmcgfSk6XG4gICAgVCBleHRlbmRzIFRhZyA/IEJldHRlckhUTUxFbGVtZW50PEhUTUxFbGVtZW50VGFnTmFtZU1hcFtUXT4gOiBuZXZlcjtcbi8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBpZGAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbGVtKHsgYnlpZCwgY2hpbGRyZW4gfTogeyBieWlkOiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk6XG4gICAgQmV0dGVySFRNTEVsZW1lbnQ7XG4vKipHZXQgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgcXVlcnlgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG5leHBvcnQgZnVuY3Rpb24gZWxlbTxRIGV4dGVuZHMgUXVlcnlTZWxlY3Rvcj4oeyBxdWVyeSwgY2hpbGRyZW4gfTogeyBxdWVyeTogUSwgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTpcbiAgICBRIGV4dGVuZHMgVGFnID8gQmV0dGVySFRNTEVsZW1lbnQ8SFRNTEVsZW1lbnRUYWdOYW1lTWFwW1FdPiA6IEJldHRlckhUTUxFbGVtZW50O1xuLyoqV3JhcCBhbiBleGlzdGluZyBIVE1MRWxlbWVudC4gT3B0aW9uYWxseSwgc2V0IGl0cyBgdGV4dGAsIGBjbHNgIG9yIGNhY2hlIGBjaGlsZHJlbmAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVsZW08RSBleHRlbmRzIEhUTUxFbGVtZW50Pih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9OiB7IGh0bWxFbGVtZW50OiBFOyBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOlxuICAgIEJldHRlckhUTUxFbGVtZW50PEU+O1xuXG5leHBvcnQgZnVuY3Rpb24gZWxlbShlbGVtT3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgQmV0dGVySFRNTEVsZW1lbnQoZWxlbU9wdGlvbnMpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzcGFuKHsgY2xzLCBzZXRpZCwgdGV4dCB9OiB7IGNscz86IHN0cmluZywgc2V0aWQ/OiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcgfSk6IFNwYW47XG5leHBvcnQgZnVuY3Rpb24gc3Bhbih7IGNscywgc2V0aWQsIGh0bWwgfTogeyBjbHM/OiBzdHJpbmcsIHNldGlkPzogc3RyaW5nLCBodG1sPzogc3RyaW5nIH0pOiBTcGFuO1xuZXhwb3J0IGZ1bmN0aW9uIHNwYW4oeyBieWlkLCBjaGlsZHJlbiB9OiB7IGJ5aWQ6IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTogU3BhbjtcbmV4cG9ydCBmdW5jdGlvbiBzcGFuPFEgZXh0ZW5kcyBRdWVyeVNlbGVjdG9yPih7IHF1ZXJ5LCBjaGlsZHJlbiB9OiB7XG4gICAgcXVlcnk6IFF1ZXJ5T3JQcmVjaXNlVGFnPFEsIFwic3BhblwiPixcbiAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG59KTogU3BhbjtcbmV4cG9ydCBmdW5jdGlvbiBzcGFuPEUgZXh0ZW5kcyBIVE1MU3BhbkVsZW1lbnQ+KHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH06IHtcbiAgICBodG1sRWxlbWVudDogRTtcbiAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG59KTogU3BhbjtcbmV4cG9ydCBmdW5jdGlvbiBzcGFuKCk6IFNwYW5cbmV4cG9ydCBmdW5jdGlvbiBzcGFuKHNwYW5PcHRzPyk6IFNwYW4ge1xuICAgIGlmICghYm9vbChzcGFuT3B0cykpIHtcbiAgICAgICAgc3Bhbk9wdHMgPSB7fVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFNwYW4oc3Bhbk9wdHMpXG59XG5cbi8qKkNyZWF0ZSBhIERpdiBlbGVtZW50LCBvciB3cmFwIGFuIGV4aXN0aW5nIG9uZSBieSBwYXNzaW5nIGh0bWxFbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHRleHQgb3IgY2xzLiovXG5leHBvcnQgZnVuY3Rpb24gZGl2KHsgY2xzLCBzZXRpZCwgdGV4dCB9OiB7XG4gICAgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZywgdGV4dD86IHN0cmluZ1xufSk6IERpdjtcbmV4cG9ydCBmdW5jdGlvbiBkaXYoeyBjbHMsIHNldGlkLCBodG1sIH06IHtcbiAgICBjbHM/OiBzdHJpbmcsIHNldGlkPzogc3RyaW5nLCBodG1sPzogc3RyaW5nXG59KTogRGl2O1xuZXhwb3J0IGZ1bmN0aW9uIGRpdih7IGJ5aWQsIGNoaWxkcmVuIH06IHtcbiAgICBieWlkOiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBEaXY7XG5leHBvcnQgZnVuY3Rpb24gZGl2PFEgZXh0ZW5kcyBRdWVyeVNlbGVjdG9yPih7IHF1ZXJ5LCBjaGlsZHJlbiB9OiB7XG4gICAgcXVlcnk6IFF1ZXJ5T3JQcmVjaXNlVGFnPFEsIFwiZGl2XCI+LFxuICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBEaXY7XG5leHBvcnQgZnVuY3Rpb24gZGl2KHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH06IHtcbiAgICBodG1sRWxlbWVudDogSFRNTERpdkVsZW1lbnQ7XG4gICAgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxufSk6IERpdjtcbmV4cG9ydCBmdW5jdGlvbiBkaXYoKTogRGl2XG5leHBvcnQgZnVuY3Rpb24gZGl2KGRpdk9wdHM/KTogRGl2IHtcbiAgICBpZiAoIWJvb2woZGl2T3B0cykpIHtcbiAgICAgICAgZGl2T3B0cyA9IHt9XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGl2KGRpdk9wdHMpXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1dHRvbih7IGNscywgc2V0aWQsIHRleHQgfToge1xuICAgIGNscz86IHN0cmluZywgc2V0aWQ/OiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcsIGNsaWNrPzogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnlcbn0pOiBCdXR0b247XG5leHBvcnQgZnVuY3Rpb24gYnV0dG9uKHsgY2xzLCBzZXRpZCwgaHRtbCB9OiB7XG4gICAgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZywgaHRtbD86IHN0cmluZywgY2xpY2s/OiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueVxufSk6IEJ1dHRvbjtcbmV4cG9ydCBmdW5jdGlvbiBidXR0b24oeyBieWlkLCBjaGlsZHJlbiB9OiB7XG4gICAgYnlpZDogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG59KTogQnV0dG9uO1xuZXhwb3J0IGZ1bmN0aW9uIGJ1dHRvbjxRIGV4dGVuZHMgUXVlcnlTZWxlY3Rvcj4oeyBxdWVyeSwgY2hpbGRyZW4gfToge1xuICAgIHF1ZXJ5OiBRdWVyeU9yUHJlY2lzZVRhZzxRLCBcImJ1dHRvblwiPixcbiAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG59KTogQnV0dG9uO1xuZXhwb3J0IGZ1bmN0aW9uIGJ1dHRvbih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9OiB7XG4gICAgaHRtbEVsZW1lbnQ6IEhUTUxCdXR0b25FbGVtZW50O1xuICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBCdXR0b247XG5leHBvcnQgZnVuY3Rpb24gYnV0dG9uKCk6IEJ1dHRvblxuZXhwb3J0IGZ1bmN0aW9uIGJ1dHRvbihidXR0b25PcHRzPyk6IEJ1dHRvbiB7XG4gICAgaWYgKCFib29sKGJ1dHRvbk9wdHMpKSB7XG4gICAgICAgIGJ1dHRvbk9wdHMgPSB7fVxuICAgIH1cbiAgICByZXR1cm4gbmV3IEJ1dHRvbihidXR0b25PcHRzKVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpbnB1dDxUSW5wdXRUeXBlIGV4dGVuZHMgSW5wdXRUeXBlLCBHZW5lcmljIGV4dGVuZHMgRm9ybWlzaEhUTUxFbGVtZW50ID0gSFRNTElucHV0RWxlbWVudD4oeyBjbHMsIHNldGlkLCB0eXBlLCBwbGFjZWhvbGRlciB9OiB7XG4gICAgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZyxcbiAgICB0eXBlPzogVElucHV0VHlwZSxcbiAgICBwbGFjZWhvbGRlcj86IHN0cmluZ1xufSk6IElucHV0PFRJbnB1dFR5cGUsIEdlbmVyaWM+O1xuZXhwb3J0IGZ1bmN0aW9uIGlucHV0PFRJbnB1dFR5cGUgZXh0ZW5kcyBJbnB1dFR5cGUgPSBJbnB1dFR5cGUsIEdlbmVyaWMgZXh0ZW5kcyBGb3JtaXNoSFRNTEVsZW1lbnQgPSBIVE1MSW5wdXRFbGVtZW50Pih7IGJ5aWQsIGNoaWxkcmVuIH06IHsgYnlpZDogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBJbnB1dDxUSW5wdXRUeXBlLCBHZW5lcmljPjtcbmV4cG9ydCBmdW5jdGlvbiBpbnB1dDxRIGV4dGVuZHMgUXVlcnlTZWxlY3RvciwgVElucHV0VHlwZSBleHRlbmRzIElucHV0VHlwZSA9IElucHV0VHlwZSwgR2VuZXJpYyBleHRlbmRzIEZvcm1pc2hIVE1MRWxlbWVudCA9IEhUTUxJbnB1dEVsZW1lbnQ+KHsgcXVlcnksIGNoaWxkcmVuIH06IHtcbiAgICBxdWVyeTogUXVlcnlPclByZWNpc2VUYWc8USwgXCJpbnB1dFwiPixcbiAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG59KTogSW5wdXQ8VElucHV0VHlwZSwgR2VuZXJpYz47XG5leHBvcnQgZnVuY3Rpb24gaW5wdXQ8VElucHV0VHlwZSBleHRlbmRzIElucHV0VHlwZSA9IElucHV0VHlwZSwgR2VuZXJpYyBleHRlbmRzIEZvcm1pc2hIVE1MRWxlbWVudCA9IEhUTUxJbnB1dEVsZW1lbnQ+KHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH06IHtcbiAgICBodG1sRWxlbWVudDogR2VuZXJpYztcbiAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG59KTogSW5wdXQ8VElucHV0VHlwZSwgR2VuZXJpYz47XG5leHBvcnQgZnVuY3Rpb24gaW5wdXQ8VElucHV0VHlwZSBleHRlbmRzIElucHV0VHlwZSA9IElucHV0VHlwZSwgR2VuZXJpYyBleHRlbmRzIEZvcm1pc2hIVE1MRWxlbWVudCA9IEhUTUxJbnB1dEVsZW1lbnQ+KCk6IElucHV0PFRJbnB1dFR5cGUsIEdlbmVyaWM+XG5leHBvcnQgZnVuY3Rpb24gaW5wdXQoaW5wdXRPcHRzPykge1xuICAgIGlmICghYm9vbChpbnB1dE9wdHMpKSB7XG4gICAgICAgIGlucHV0T3B0cyA9IHt9XG4gICAgfVxuICAgIHJldHVybiBuZXcgSW5wdXQoaW5wdXRPcHRzKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0KHNlbGVjdE9wdHMpOiBTZWxlY3Qge1xuICAgIGlmICghYm9vbChzZWxlY3RPcHRzKSkge1xuICAgICAgICBzZWxlY3RPcHRzID0ge31cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTZWxlY3Qoc2VsZWN0T3B0cylcbn1cblxuLyoqQ3JlYXRlIGFuIEltZyBlbGVtZW50LCBvciB3cmFwIGFuIGV4aXN0aW5nIG9uZSBieSBwYXNzaW5nIGh0bWxFbGVtZW50LiBPcHRpb25hbGx5IHNldCBpdHMgaWQsIHNyYyBvciBjbHMuKi9cbmV4cG9ydCBmdW5jdGlvbiBpbWcoeyBjbHMsIHNldGlkLCBzcmMgfToge1xuICAgIGNscz86IHN0cmluZywgc2V0aWQ/OiBzdHJpbmcsXG4gICAgc3JjPzogc3RyaW5nXG59KTogSW1nO1xuZXhwb3J0IGZ1bmN0aW9uIGltZyh7IGJ5aWQsIGNoaWxkcmVuIH06IHtcbiAgICBieWlkOiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBJbWc7XG5leHBvcnQgZnVuY3Rpb24gaW1nPFEgZXh0ZW5kcyBRdWVyeVNlbGVjdG9yPih7IHF1ZXJ5LCBjaGlsZHJlbiB9OiB7XG4gICAgcXVlcnk6IFF1ZXJ5T3JQcmVjaXNlVGFnPFEsIFwiaW1nXCI+LFxuICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBJbWc7XG5leHBvcnQgZnVuY3Rpb24gaW1nKHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH06IHtcbiAgICBodG1sRWxlbWVudDogSFRNTEltYWdlRWxlbWVudDtcbiAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG59KTogSW1nO1xuZXhwb3J0IGZ1bmN0aW9uIGltZygpOiBJbWdcbmV4cG9ydCBmdW5jdGlvbiBpbWcoaW1nT3B0cz8pOiBJbWcge1xuICAgIGlmICghYm9vbChpbWdPcHRzKSkge1xuICAgICAgICBpbWdPcHRzID0ge31cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBJbWcoaW1nT3B0cylcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyYWdyYXBoKHsgY2xzLCBzZXRpZCwgdGV4dCB9OiB7IGNscz86IHN0cmluZywgc2V0aWQ/OiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcgfSk6IFBhcmFncmFwaDtcbmV4cG9ydCBmdW5jdGlvbiBwYXJhZ3JhcGgoeyBjbHMsIHNldGlkLCBodG1sIH06IHsgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZywgaHRtbD86IHN0cmluZyB9KTogUGFyYWdyYXBoO1xuZXhwb3J0IGZ1bmN0aW9uIHBhcmFncmFwaCh7IGJ5aWQsIGNoaWxkcmVuIH06IHsgYnlpZDogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBQYXJhZ3JhcGg7XG5leHBvcnQgZnVuY3Rpb24gcGFyYWdyYXBoPFEgZXh0ZW5kcyBRdWVyeVNlbGVjdG9yPih7IHF1ZXJ5LCBjaGlsZHJlbiB9OiB7XG4gICAgcXVlcnk6IFF1ZXJ5T3JQcmVjaXNlVGFnPFEsIFwicFwiPixcbiAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG59KTogUGFyYWdyYXBoO1xuZXhwb3J0IGZ1bmN0aW9uIHBhcmFncmFwaCh7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9OiB7XG4gICAgaHRtbEVsZW1lbnQ6IEhUTUxQYXJhZ3JhcGhFbGVtZW50O1xuICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBQYXJhZ3JhcGg7XG5leHBvcnQgZnVuY3Rpb24gcGFyYWdyYXBoKCk6IFBhcmFncmFwaFxuZXhwb3J0IGZ1bmN0aW9uIHBhcmFncmFwaChwT3B0cz8pOiBQYXJhZ3JhcGgge1xuICAgIGlmICghYm9vbChwT3B0cykpIHtcbiAgICAgICAgcE9wdHMgPSB7fVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFBhcmFncmFwaChwT3B0cylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuY2hvcih7IGNscywgc2V0aWQsIGhyZWYsIHRhcmdldCwgdGV4dCB9OiB7XG4gICAgY2xzPzogc3RyaW5nLFxuICAgIHNldGlkPzogc3RyaW5nLFxuICAgIGhyZWY/OiBzdHJpbmdcbiAgICB0YXJnZXQ/OiBzdHJpbmcsXG4gICAgdGV4dD86IHN0cmluZyxcbn0pOiBBbmNob3I7XG5leHBvcnQgZnVuY3Rpb24gYW5jaG9yKHsgY2xzLCBzZXRpZCwgaHJlZiwgdGFyZ2V0LCBodG1sIH06IHtcbiAgICBjbHM/OiBzdHJpbmcsXG4gICAgc2V0aWQ/OiBzdHJpbmcsXG4gICAgaHJlZj86IHN0cmluZ1xuICAgIHRhcmdldD86IHN0cmluZyxcbiAgICBodG1sPzogc3RyaW5nLFxufSk6IEFuY2hvcjtcbmV4cG9ydCBmdW5jdGlvbiBhbmNob3IoeyBieWlkLCBjaGlsZHJlbiB9OiB7XG4gICAgYnlpZDogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG59KTogQW5jaG9yO1xuZXhwb3J0IGZ1bmN0aW9uIGFuY2hvcjxRIGV4dGVuZHMgUXVlcnlTZWxlY3Rvcj4oeyBxdWVyeSwgY2hpbGRyZW4gfToge1xuICAgIHF1ZXJ5OiBRdWVyeU9yUHJlY2lzZVRhZzxRLCBcImFcIj4sXG4gICAgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxufSk6IEFuY2hvcjtcbmV4cG9ydCBmdW5jdGlvbiBhbmNob3IoeyBodG1sRWxlbWVudCwgY2hpbGRyZW4gfToge1xuICAgIGh0bWxFbGVtZW50OiBIVE1MQW5jaG9yRWxlbWVudDtcbiAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG59KTogQW5jaG9yO1xuZXhwb3J0IGZ1bmN0aW9uIGFuY2hvcigpOiBBbmNob3JcbmV4cG9ydCBmdW5jdGlvbiBhbmNob3IoYW5jaG9yT3B0cz8pOiBBbmNob3Ige1xuICAgIGlmICghYm9vbChhbmNob3JPcHRzKSkge1xuICAgICAgICBhbmNob3JPcHRzID0ge31cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBBbmNob3IoYW5jaG9yT3B0cylcbn1cblxuXG5cbiJdfQ==