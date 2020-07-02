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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXFTQSxTQUFnQixTQUFTLENBQUksR0FBTTtJQWMvQixJQUFJLFNBQVMsR0FBRyxPQUFPLEdBQUcsQ0FBQztJQUMzQixJQUNJLEdBQUcsS0FBSyxTQUFTO1dBQ2QsVUFBVSxDQUFDLEdBQUcsQ0FBQztXQUNmLFVBQVUsQ0FBQyxHQUFHLENBQUM7V0FFZixHQUFHLEtBQUssRUFBRSxFQUNmO1FBQ0UsT0FBTyxFQUFtQixDQUFDO0tBQzlCO0lBRUQsSUFDSSxHQUFHLEtBQUssSUFBSTtXQUNULFNBQVMsS0FBSyxTQUFTO1dBQ3ZCLFNBQVMsS0FBSyxRQUFRO1dBQ3RCLFNBQVMsS0FBSyxVQUFVLEVBQzdCO1FBQ0UsTUFBTSxJQUFJLFNBQVMsQ0FBQyxHQUFHLFNBQVMseUJBQXlCLENBQUMsQ0FBQztLQUM5RDtJQUNELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNmLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ2QsSUFBSSxDQUFDLEdBQVcsQ0FBQyxDQUFDO1FBQ2xCLEtBQUssSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFO1lBQ2YsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLENBQUMsRUFBRSxDQUFDO1NBQ1A7S0FDSjtTQUFNO1FBQ0gsS0FBSyxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUU7WUFDbEIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pDO0tBQ0o7SUFDRCxPQUFPLEtBQXNCLENBQUM7QUFDbEMsQ0FBQztBQTlDRCw4QkE4Q0M7QUFFRCxTQUFnQixJQUFJLENBQUMsRUFBVTtJQUMzQixPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENB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QUFDLENBQUE7QUFDakMsQ0FBQztBQUxELHdCQUtDIiwic291cmNlc0NvbnRlbnQiOlsiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICoqKiBUeXBpbmdcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5leHBvcnQgaW50ZXJmYWNlIFRNYXA8VD4ge1xuICAgIFtzOiBzdHJpbmddOiBUO1xuXG4gICAgW3M6IG51bWJlcl06IFRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUUmVjTWFwPFQ+IHtcbiAgICBbczogc3RyaW5nXTogVCB8IFRSZWNNYXA8VD47XG5cbiAgICBbczogbnVtYmVyXTogVCB8IFRSZWNNYXA8VD5cbn1cblxuLy8gdHlwZSBJTWFwPFQ+ID0ge1xuLy8gICAgIFtzIGluIGtleW9mIFRdOiBUXG4vLyB9XG5cblxuLy8gdHlwZSBFdmVudE5hbWVGdW5jdGlvbk1hcE9yaWc8RSBleHRlbmRzIEV2ZW50TmFtZT4gPSB7XG4vLyAgICAgW1AgaW4gRV0/OiAoZXZlbnQ6IEhUTUxFbGVtZW50RXZlbnRNYXBbUF0pID0+IHZvaWQ7XG4vLyB9W0VdO1xuLy9cbi8vIHR5cGUgRXZlbnROYW1lRnVuY3Rpb25NYXAyPEUgZXh0ZW5kcyBFdmVudE5hbWU+ID0gRSBleHRlbmRzIEV2ZW50TmFtZSA/IChldmVudDogSFRNTEVsZW1lbnRFdmVudE1hcFtFXSkgPT4gdm9pZCA6IG5ldmVyO1xuLy8gdHlwZSBFdmVudE5hbWVGdW5jdGlvbk1hcDMgPSB7XG4vLyAgICAgW1AgaW4gRXZlbnROYW1lXT86IChldmVudDogSFRNTEVsZW1lbnRFdmVudE1hcFtQXSkgPT4gdm9pZDtcbi8vIH1cbi8vIHR5cGUgRXZlbnROYW1lRnVuY3Rpb25NYXA0PEUgZXh0ZW5kcyBFdmVudE5hbWU+ID0ge1xuLy8gICAgIFtQIGluIEV2ZW50TmFtZV0/OiAoZXZlbnQ6IEhUTUxFbGVtZW50RXZlbnRNYXBbUF0pID0+IHZvaWQ7XG4vLyB9XG5leHBvcnQgdHlwZSBFdmVudE5hbWUgPSBrZXlvZiBIVE1MRWxlbWVudEV2ZW50TWFwO1xuLy8gRXZlbnROYW1lMkZ1bmN0aW9uPFwiY2xpY2tcIj4g4oaSIGZ1bmN0aW9uKGV2ZW50OiBNb3VzZUV2ZW50KSB7IH1cbmV4cG9ydCB0eXBlIEV2ZW50TmFtZTJGdW5jdGlvbjxFIGV4dGVuZHMgRXZlbnROYW1lID0gRXZlbnROYW1lPiA9IHtcbiAgICBbUCBpbiBFdmVudE5hbWVdPzogKGV2ZW50OiBIVE1MRWxlbWVudEV2ZW50TWFwW1BdKSA9PiB2b2lkO1xufVtFXVxuLy8gZS5nLiB7IFwibW91c2VvdmVyXCIgOiBNb3VzZUV2ZW50LCAuLi4gfVxuZXhwb3J0IHR5cGUgTWFwT2ZFdmVudE5hbWUyRnVuY3Rpb24gPSBQYXJ0aWFsPFJlY29yZDxrZXlvZiBIVE1MRWxlbWVudEV2ZW50TWFwLCBFdmVudE5hbWUyRnVuY3Rpb24+PlxuXG5cbi8qdHlwZSBNb3VzZU92ZXJGdW5jdGlvbiA9IEV2ZW50TmFtZTJGdW5jdGlvbjxcIm1vdXNlb3ZlclwiPjtcblxuXG5mdW5jdGlvbiBleHBlY3RzTW91c2VFdmVudEZ1bmN0aW9uKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHZvaWQpIHtcblxufVxuXG5jb25zdCBtb3VzZUV2ZW50RnVuY3Rpb246IE1vdXNlT3ZlckZ1bmN0aW9uID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XG59O1xuXG5leHBlY3RzTW91c2VFdmVudEZ1bmN0aW9uKG1vdXNlRXZlbnRGdW5jdGlvbik7XG5cbmZ1bmN0aW9uIGV4cGVjdHNNb3VzZUV2ZW50RnVuY3Rpb25QYWlycyhwYWlyczogTWFwT2ZFdmVudE5hbWUyRnVuY3Rpb24pIHtcbiAgICBmb3IgKGxldCBbZXZOYW1lLCBldkZuXSBvZiBPYmplY3QuZW50cmllcyhwYWlycykpIHtcbiAgICAgICAgZXhwZWN0c01vdXNlRXZlbnRGdW5jdGlvbihldkZuKVxuICAgIH1cblxufVxuXG5jb25zdCBwYWlyczogTWFwT2ZFdmVudE5hbWUyRnVuY3Rpb24gPSB7XCJtb3VzZW92ZXJcIjogbW91c2VFdmVudEZ1bmN0aW9ufTtcbmV4cGVjdHNNb3VzZUV2ZW50RnVuY3Rpb25QYWlycyhwYWlycyk7Ki9cblxuXG4vLyAvLyBIVE1MVGFnMkhUTUxFbGVtZW50PFwiYVwiPiDihpIgSFRNTEFuY2hvckVsZW1lbnRcbi8vIHR5cGUgSFRNTFRhZzJIVE1MRWxlbWVudDxLIGV4dGVuZHMga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwPiA9IHtcbi8vICAgICBbUCBpbiBLXTogSFRNTEVsZW1lbnRUYWdOYW1lTWFwW1BdXG4vLyB9W0tdXG4vL1xuLy8gLy8gSFRNTFRhZzJIVE1MRWxlbWVudDJbXCJhXCJdIOKGkiBIVE1MQW5jaG9yRWxlbWVudFxuLy8gdHlwZSBIVE1MVGFnMkhUTUxFbGVtZW50MiA9IHtcbi8vICAgICBbUCBpbiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXBdOiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbUF1cbi8vIH1cbi8vXG4vLyAvLyBjb25zdCBhOiBIVE1MVGFnMkhUTUxFbGVtZW50PFwiYVwiPiA9IHVuZGVmaW5lZDtcbi8vIC8vIGNvbnN0IGI6IEhUTUxUYWcySFRNTEVsZW1lbnQyW1wiYVwiXSA9IHVuZGVmaW5lZDtcblxuXG4vKipcbiAqIFwiYVwiLCBcImRpdlwiXG4gKiBAZXhhbXBsZVxuICogY29uc3QgZm9vID0gPEsgZXh0ZW5kcyBUYWc+KHRhZzogSykgPT4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICogZm9vKFwiYVwiKSDihpIgSFRNTEFuY2hvckVsZW1lbnRcbiAqIGZvbyhcIkJBRFwiKSAvLyBlcnJvclxuICovXG5leHBvcnQgdHlwZSBUYWcgPSBFeGNsdWRlPGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcCwgXCJvYmplY3RcIj47XG5leHBvcnQgdHlwZSBOb3RUYWc8VCBleHRlbmRzIFRhZz4gPSBFeGNsdWRlPFRhZywgVD47XG5leHBvcnQgdHlwZSBRdWVyeU9yUHJlY2lzZVRhZzxRLCBUIGV4dGVuZHMgVGFnPiA9IEV4Y2x1ZGU8USwgUXVlcnlTZWxlY3RvcjxOb3RUYWc8VD4+Pjtcbi8vIC8qKlxuLy8gICpcImFcIiwgXCJkaXZcIiwgXCJnaWxhZFwiLlxuLy8gICpUYWcyRWxlbWVudCBleHBlY3RzIGEgdGFnIGFuZCByZXR1cm5zIGFuIEhUTUxFbGVtZW50LlxuLy8gICpAZXhhbXBsZVxuLy8gICpjb25zdCBiYXogPSA8SyBleHRlbmRzIFRhZyB8IHN0cmluZz4ocXVlcnk6IEspID0+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocXVlcnkpO1xuLy8gICpiYXooXCJkaXZcIikg4oaSIEhUTUxEaXZFbGVtZW50XG4vLyAgKmJheihcImRpdmFcIikg4oaSIEhUTUxTZWxlY3RFbGVtZW50IHwgSFRNTExlZ2VuZEVsZW1lbnQgfCAuLi5cbi8vICAqL1xuLy8gdHlwZSBUYWcyRWxlbWVudDxLIGV4dGVuZHMgVGFnID0gVGFnPiA9IEsgZXh0ZW5kcyBUYWcgPyBIVE1MRWxlbWVudFRhZ05hbWVNYXBbS10gOiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbVGFnXVxuZXhwb3J0IHR5cGUgVGFnT3JTdHJpbmcgPSBUYWcgfCBzdHJpbmc7XG4vKipcbiAqIFwiYVwiLCBcImRpdlwiLCBcImdpbGFkXCIuXG4gKiBRdWVyeVNlbGVjdG9yIGV4cGVjdHMgYSB0YWcgYW5kIHJldHVybnMgYSBUYWcuXG4gKiBAZXhhbXBsZVxuICogY29uc3QgYmFyID0gPEsgZXh0ZW5kcyBUYWcgfCBzdHJpbmc+KHF1ZXJ5OiBRdWVyeVNlbGVjdG9yPEs+KSA9PiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHF1ZXJ5KTtcbiAqIGJhcihcImFcIikg4oaSIEhUTUxBbmNob3JFbGVtZW50XG4gKiBiYXIoXCJnaWxhZFwiKSDihpIgSFRNTFNlbGVjdEVsZW1lbnQgfCBIVE1MTGVnZW5kRWxlbWVudCB8IC4uLlxuICovXG5leHBvcnQgdHlwZSBRdWVyeVNlbGVjdG9yPEsgZXh0ZW5kcyBUYWdPclN0cmluZyA9IFRhZ09yU3RyaW5nPiA9IEsgZXh0ZW5kcyBUYWcgPyBLIDogc3RyaW5nO1xuXG4vLyBjb25zdCBmb28gPSA8SyBleHRlbmRzIFRhZz4odGFnOiBLKSA9PiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG5cbi8vIGNvbnN0IGJheiA9IDxLIGV4dGVuZHMgVGFnIHwgc3RyaW5nPihxdWVyeTogSykgPT4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihxdWVyeSk7XG5cbi8vIGNvbnN0IGJhciA9IDxLIGV4dGVuZHMgVGFnIHwgc3RyaW5nPihxdWVyeTogUXVlcnlTZWxlY3RvcjxLPikgPT4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihxdWVyeSk7XG5cbi8vIFRhZzJCSEVbXCJhXCJdIOKGkiBBbmNob3Jcbi8qXG5pbnRlcmZhY2UgVGFnMkJIRSB7XG4gICAgXCJpbWdcIjogSW1nLFxuICAgIFwiYVwiOiBBbmNob3IsXG4gICAgXCJpbnB1dFwiOiBJbnB1dDxIVE1MSW5wdXRFbGVtZW50PixcbiAgICBcImRpdlwiOiBEaXYsXG4gICAgXCJwXCI6IFBhcmFncmFwaCxcbiAgICBcImJ1dHRvblwiOiBCdXR0b24sXG4gICAgXCJzcGFuXCI6IFNwYW4sXG59XG4qL1xuXG5cbi8vIHR5cGUgQkhFVGFnID0ga2V5b2YgVGFnMkJIRTtcbi8vIHR5cGUgQkhFSFRNTEVsZW1lbnQgPVxuLy8gICAgIEhUTUxBbmNob3JFbGVtZW50IHxcbi8vICAgICBIVE1MSW5wdXRFbGVtZW50IHxcbi8vICAgICBIVE1MSW1hZ2VFbGVtZW50IHxcbi8vICAgICBIVE1MUGFyYWdyYXBoRWxlbWVudCB8XG4vLyAgICAgSFRNTERpdkVsZW1lbnQgfFxuLy8gICAgIEhUTUxCdXR0b25FbGVtZW50IHxcbi8vICAgICBIVE1MU3BhbkVsZW1lbnQ7XG4vL1xuLy8gdHlwZSBTdGRCSEVIVE1MRWxlbWVudCA9XG4vLyAgICAgSFRNTFBhcmFncmFwaEVsZW1lbnQgfFxuLy8gICAgIEhUTUxEaXZFbGVtZW50IHxcbi8vICAgICBIVE1MQnV0dG9uRWxlbWVudCB8XG4vLyAgICAgSFRNTFNwYW5FbGVtZW50XG5cbmV4cG9ydCB0eXBlIEVsZW1lbnQyVGFnPFQ+ID1cbiAgICBUIGV4dGVuZHMgSFRNTElucHV0RWxlbWVudCA/IFwiaW5wdXRcIlxuICAgICAgICA6IFQgZXh0ZW5kcyBIVE1MQW5jaG9yRWxlbWVudCA/IFwiYVwiXG4gICAgICAgIDogVCBleHRlbmRzIEhUTUxJbWFnZUVsZW1lbnQgPyBcImltZ1wiXG4gICAgICAgICAgICA6IFRhZ1xuXG4vLyB0eXBlIE1hcFZhbHVlczxUPiA9IHsgW0sgaW4ga2V5b2YgVF06IFRbS10gfVtrZXlvZiBUXTtcblxuLy8gSFRNTERpdkVsZW1lbnQsIC4uLlxuLy8gdHlwZSBIVE1MRWxlbWVudHMgPSBNYXBWYWx1ZXM8SFRNTEVsZW1lbnRUYWdOYW1lTWFwPjtcbi8vIHR5cGUgRmlsdGVyPFQ+ID0gVCBleHRlbmRzIEhUTUxFbGVtZW50cyA/IFQgOiBuZXZlcjtcbi8vIHR5cGUgR2VuZXJpY0ZpbHRlcjxULCBVPiA9IFQgZXh0ZW5kcyBVID8gVCA6IG5ldmVyO1xuXG4vLyBjb25zdCB3aGF0OiBFbGVtZW50MlRhZzxIVE1MRGl2RWxlbWVudD4gPSB1bmRlZmluZWQ7XG4vLyBjb25zdCB3aGF0OiBGaWx0ZXI8SFRNTElucHV0RWxlbWVudCwgSFRNTEVsZW1lbnRzPiA9IHVuZGVmaW5lZDtcbi8vIGNvbnN0IHdoYXQ6IEZpbHRlcjxIVE1MSW5wdXRFbGVtZW50PiA9IHVuZGVmaW5lZDtcbi8vIGNvbnN0IHdoYXQ6IEVsZW1lbnQyVGFnPEhUTUxBbmNob3JFbGVtZW50PiA9IHVuZGVmaW5lZDtcblxuXG4vLyB0eXBlIENoaWxkcmVuT2JqID0gVE1hcDxUYWcyRWxlbWVudD4gfCBUUmVjTWFwPFRhZzJFbGVtZW50PlxuLy8gdHlwZSBDaGlsZHJlbk9iaiA9IFRNYXA8UXVlcnlTZWxlY3Rvcj4gfCBUUmVjTWFwPFF1ZXJ5U2VsZWN0b3I+XG5leHBvcnQgdHlwZSBDaGlsZHJlbk9iaiA9IFRSZWNNYXA8UXVlcnlTZWxlY3RvciB8IEJldHRlckhUTUxFbGVtZW50IHwgdHlwZW9mIEJldHRlckhUTUxFbGVtZW50PlxuZXhwb3J0IHR5cGUgRW51bWVyYXRlZDxUPiA9XG4gICAgVCBleHRlbmRzIChpbmZlciBVKVtdID8gW251bWJlciwgVV1bXVxuICAgICAgICA6IFQgZXh0ZW5kcyBUUmVjTWFwPChpbmZlciBVKT4gPyBba2V5b2YgVCwgVV1bXVxuICAgICAgICA6IFQgZXh0ZW5kcyBib29sZWFuID8gbmV2ZXIgOiBhbnk7XG5leHBvcnQgdHlwZSBSZXR1cm5zPFQ+ID0gKHM6IHN0cmluZykgPT4gVDtcbi8vIHR5cGUgVFJldHVybkJvb2xlYW4gPSAoczogc3RyaW5nKSA9PiBib29sZWFuO1xuXG5cbmV4cG9ydCB0eXBlIEF3YWl0ZWQ8VD4gPSBUIGV4dGVuZHMgUHJvbWlzZTxpbmZlciBVPiA/IFUgOiBUO1xuLy8gdHlwZSBDYWxsYWJsZTxUMSwgVDIsIEY+ID0gRiBleHRlbmRzIChhMTogVDEsIGEyOiBUMikgPT4gaW5mZXIgUiA/IFIgOiBhbnk7XG4vLyB0eXBlIENhbGxhYmxlMjxUMSwgRj4gPSBGIGV4dGVuZHMgKGExOiBUMSwgYTI6IEhUTUxFbGVtZW50KSA9PiBpbmZlciBSID8gUiA6IGFueTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8gQ1NTIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIFRPRE86IGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2Nzc3R5cGVcbmV4cG9ydCB0eXBlIE9taXR0ZWRDc3NQcm9wcyA9IFwiYW5pbWF0aW9uRGlyZWN0aW9uXCJcbiAgICB8IFwiYW5pbWF0aW9uRmlsbE1vZGVcIlxuICAgIHwgXCJhbmltYXRpb25JdGVyYXRpb25Db3VudFwiXG4gICAgfCBcImFuaW1hdGlvblBsYXlTdGF0ZVwiXG4gICAgfCBcImFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uXCJcbiAgICB8IFwib3BhY2l0eVwiXG4gICAgfCBcInBhZGRpbmdcIlxuICAgIHwgXCJwYWRkaW5nQm90dG9tXCJcbiAgICB8IFwicGFkZGluZ0xlZnRcIlxuICAgIHwgXCJwYWRkaW5nUmlnaHRcIlxuICAgIHwgXCJwYWRkaW5nVG9wXCJcbiAgICB8IFwicHJlbG9hZFwiXG4gICAgfCBcIndpZHRoXCJcbmV4cG9ydCB0eXBlIFBhcnRpYWxDc3NTdHlsZURlY2xhcmF0aW9uID0gT21pdDxQYXJ0aWFsPENTU1N0eWxlRGVjbGFyYXRpb24+LCBPbWl0dGVkQ3NzUHJvcHM+O1xuXG5leHBvcnQgaW50ZXJmYWNlIENzc09wdGlvbnMgZXh0ZW5kcyBQYXJ0aWFsQ3NzU3R5bGVEZWNsYXJhdGlvbiB7XG4gICAgYW5pbWF0aW9uRGlyZWN0aW9uPzogQW5pbWF0aW9uRGlyZWN0aW9uO1xuICAgIGFuaW1hdGlvbkZpbGxNb2RlPzogQW5pbWF0aW9uRmlsbE1vZGU7XG4gICAgYW5pbWF0aW9uSXRlcmF0aW9uQ291bnQ/OiBudW1iZXI7XG4gICAgYW5pbWF0aW9uUGxheVN0YXRlPzogQW5pbWF0aW9uUGxheVN0YXRlO1xuICAgIGFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uPzogQW5pbWF0aW9uVGltaW5nRnVuY3Rpb247XG4gICAgb3BhY2l0eT86IHN0cmluZyB8IG51bWJlcjtcbiAgICBwYWRkaW5nPzogc3RyaW5nIHwgbnVtYmVyO1xuICAgIHBhZGRpbmdCb3R0b20/OiBzdHJpbmcgfCBudW1iZXI7XG4gICAgcGFkZGluZ0xlZnQ/OiBzdHJpbmcgfCBudW1iZXI7XG4gICAgcGFkZGluZ1JpZ2h0Pzogc3RyaW5nIHwgbnVtYmVyO1xuICAgIHBhZGRpbmdUb3A/OiBzdHJpbmcgfCBudW1iZXI7XG4gICAgcHJlbG9hZD86IFwiYXV0b1wiIHwgc3RyaW5nO1xuICAgIHdpZHRoPzogc3RyaW5nIHwgbnVtYmVyO1xufVxuXG5cbmV4cG9ydCB0eXBlIEN1YmljQmV6aWVyRnVuY3Rpb24gPSBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcbmV4cG9ydCB0eXBlIEp1bXB0ZXJtID0gJ2p1bXAtc3RhcnQnIHwgJ2p1bXAtZW5kJyB8ICdqdW1wLW5vbmUnIHwgJ2p1bXAtYm90aCcgfCAnc3RhcnQnIHwgJ2VuZCc7XG5cbi8qKkRpc3BsYXlzIGFuIGFuaW1hdGlvbiBpdGVyYXRpb24gYWxvbmcgbiBzdG9wcyBhbG9uZyB0aGUgdHJhbnNpdGlvbiwgZGlzcGxheWluZyBlYWNoIHN0b3AgZm9yIGVxdWFsIGxlbmd0aHMgb2YgdGltZS5cbiAqIEZvciBleGFtcGxlLCBpZiBuIGlzIDUsICB0aGVyZSBhcmUgNSBzdGVwcy5cbiAqIFdoZXRoZXIgdGhlIGFuaW1hdGlvbiBob2xkcyB0ZW1wb3JhcmlseSBhdCAwJSwgMjAlLCA0MCUsIDYwJSBhbmQgODAlLCBvbiB0aGUgMjAlLCA0MCUsIDYwJSwgODAlIGFuZCAxMDAlLCBvciBtYWtlcyA1IHN0b3BzIGJldHdlZW4gdGhlIDAlIGFuZCAxMDAlIGFsb25nIHRoZSBhbmltYXRpb24sIG9yIG1ha2VzIDUgc3RvcHMgaW5jbHVkaW5nIHRoZSAwJSBhbmQgMTAwJSBtYXJrcyAob24gdGhlIDAlLCAyNSUsIDUwJSwgNzUlLCBhbmQgMTAwJSkgZGVwZW5kcyBvbiB3aGljaCBvZiB0aGUgZm9sbG93aW5nIGp1bXAgdGVybXMgaXMgdXNlZCovXG5leHBvcnQgdHlwZSBTdGVwc0Z1bmN0aW9uID0gW251bWJlciwgSnVtcHRlcm1dO1xuZXhwb3J0IHR5cGUgQW5pbWF0aW9uVGltaW5nRnVuY3Rpb24gPVxuICAgICdsaW5lYXInXG4gICAgfCAnZWFzZSdcbiAgICB8ICdlYXNlLWluJ1xuICAgIHwgJ2Vhc2Utb3V0J1xuICAgIHwgJ2Vhc2UtaW4tb3V0J1xuICAgIHwgJ3N0ZXAtc3RhcnQnXG4gICAgfCAnc3RlcC1lbmQnXG4gICAgfCBTdGVwc0Z1bmN0aW9uXG4gICAgfCBDdWJpY0JlemllckZ1bmN0aW9uXG5leHBvcnQgdHlwZSBBbmltYXRpb25EaXJlY3Rpb24gPSAnbm9ybWFsJyB8ICdyZXZlcnNlJyB8ICdhbHRlcm5hdGUnIHwgJ2FsdGVybmF0ZS1yZXZlcnNlJztcbmV4cG9ydCB0eXBlIEFuaW1hdGlvbkZpbGxNb2RlID0gJ25vbmUnIHwgJ2ZvcndhcmRzJyB8ICdiYWNrd2FyZHMnIHwgJ2JvdGgnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRyYW5zZm9ybU9wdGlvbnMge1xuICAgIG1hdHJpeD86IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXSxcbiAgICBtYXRyaXgzZD86IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdLFxuICAgIHBlcnNwZWN0aXZlPzogc3RyaW5nLCAvLyBweFxuICAgIHJvdGF0ZT86IHN0cmluZywgLy8gZGVnXG4gICAgcm90YXRlM2Q/OiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgc3RyaW5nXSAvLyBbLCwsZGVnXVxuICAgIHJvdGF0ZVg/OiBzdHJpbmcsXG4gICAgcm90YXRlWT86IHN0cmluZyxcbiAgICByb3RhdGVaPzogc3RyaW5nLFxuICAgIHNjYWxlPzogbnVtYmVyLCAvLyAxLjVcbiAgICBzY2FsZTNkPzogW251bWJlciwgbnVtYmVyLCBudW1iZXJdLFxuICAgIHNjYWxlWD86IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXSxcbiAgICBzY2FsZVk/OiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0sXG4gICAgc2tldz86IFtzdHJpbmcsIHN0cmluZ10gLy8gZGVnLCBkZWdcbiAgICBza2V3WD86IHN0cmluZyxcbiAgICBza2V3WT86IHN0cmluZyxcbiAgICB0cmFuc2xhdGU/OiBbc3RyaW5nLCBzdHJpbmddLCAvLyBweCwgcHhcbiAgICB0cmFuc2xhdGUzZD86IFtzdHJpbmcsIHN0cmluZywgc3RyaW5nXSxcbiAgICB0cmFuc2xhdGVYPzogc3RyaW5nLFxuICAgIHRyYW5zbGF0ZVk/OiBzdHJpbmcsXG4gICAgdHJhbnNsYXRlWj86IHN0cmluZyxcblxuXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0ZU9wdGlvbnMge1xuICAgIGRlbGF5Pzogc3RyaW5nO1xuICAgIGRpcmVjdGlvbj86IEFuaW1hdGlvbkRpcmVjdGlvbjtcbiAgICBkdXJhdGlvbjogc3RyaW5nO1xuICAgIGZpbGxNb2RlPzogQW5pbWF0aW9uRmlsbE1vZGU7XG4gICAgaXRlcmF0aW9uQ291bnQ/OiBudW1iZXI7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHBsYXlTdGF0ZT86IEFuaW1hdGlvblBsYXlTdGF0ZTtcbiAgICAvKiogQWxzbyBhY2NlcHRzOlxuICAgICAqIGN1YmljLWJlemllcihwMSwgcDIsIHAzLCBwNClcbiAgICAgKiAnZWFzZScgPT0gJ2N1YmljLWJlemllcigwLjI1LCAwLjEsIDAuMjUsIDEuMCknXG4gICAgICogJ2xpbmVhcicgPT0gJ2N1YmljLWJlemllcigwLjAsIDAuMCwgMS4wLCAxLjApJ1xuICAgICAqICdlYXNlLWluJyA9PSAnY3ViaWMtYmV6aWVyKDAuNDIsIDAsIDEuMCwgMS4wKSdcbiAgICAgKiAnZWFzZS1vdXQnID09ICdjdWJpYy1iZXppZXIoMCwgMCwgMC41OCwgMS4wKSdcbiAgICAgKiAnZWFzZS1pbi1vdXQnID09ICdjdWJpYy1iZXppZXIoMC40MiwgMCwgMC41OCwgMS4wKSdcbiAgICAgKiAqL1xuICAgIHRpbWluZ0Z1bmN0aW9uPzogQW5pbWF0aW9uVGltaW5nRnVuY3Rpb247XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAqKiogVXRpbGl0aWVzXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZnVuY3Rpb24gZW51bWVyYXRlKG9iajogdW5kZWZpbmVkKTogW3ZvaWRdO1xuXG4vLyBmdW5jdGlvbiBlbnVtZXJhdGU8VD4ob2JqOiBUKTogbmV2ZXI7XG4vLyBmdW5jdGlvbiBlbnVtZXJhdGU8VD4ob2JqOiBUKTogW2tleW9mIFQsIFRba2V5b2YgVF1dW107XG5cblxuLy8gZnVuY3Rpb24gZW51bWVyYXRlPFQ+KG9iajogVCk6IFQgZXh0ZW5kcyBzdHJpbmdbXVxuLy8gICAgID8gW251bWJlciwgc3RyaW5nXVtdXG4vLyAgICAgOiBba2V5b2YgVCwgVFtrZXlvZiBUXV1bXSB7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGVudW1lcmF0ZTxUPihvYmo6IFQpOiBFbnVtZXJhdGVkPFQ+IHtcbiAgICAvLyB1bmRlZmluZWQgICAgW11cbiAgICAvLyB7fSAgICAgICAgICAgW11cbiAgICAvLyBbXSAgICAgICAgICAgW11cbiAgICAvLyBcIlwiICAgICAgICAgICBbXVxuICAgIC8vIG51bWJlciAgICAgICBUeXBlRXJyb3JcbiAgICAvLyBudWxsICAgICAgICAgVHlwZUVycm9yXG4gICAgLy8gYm9vbGVhbiAgICAgIFR5cGVFcnJvclxuICAgIC8vIEZ1bmN0aW9uICAgICBUeXBlRXJyb3JcbiAgICAvLyBcImZvb1wiICAgICAgICBbIFswLCBcImZcIl0sIFsxLCBcIm9cIl0sIFsyLCBcIm9cIl0gXVxuICAgIC8vIFsgXCJmb29cIiBdICAgIFsgWzAsIFwiZm9vXCJdIF1cbiAgICAvLyBbIDEwIF0gICAgICAgWyBbMCwgMTBdIF1cbiAgICAvLyB7IGE6IFwiZm9vXCIgfSBbIFtcImFcIiwgXCJmb29cIl0gXVxuICAgIC8vIC8vICgpPT57fSAgICA/XG4gICAgbGV0IHR5cGVvZk9iaiA9IHR5cGVvZiBvYmo7XG4gICAgaWYgKFxuICAgICAgICBvYmogPT09IHVuZGVmaW5lZFxuICAgICAgICB8fCBpc0VtcHR5T2JqKG9iailcbiAgICAgICAgfHwgaXNFbXB0eUFycihvYmopXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgfHwgb2JqID09PSBcIlwiXG4gICAgKSB7XG4gICAgICAgIHJldHVybiBbXSBhcyBFbnVtZXJhdGVkPFQ+O1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgICAgb2JqID09PSBudWxsXG4gICAgICAgIHx8IHR5cGVvZk9iaiA9PT0gXCJib29sZWFuXCJcbiAgICAgICAgfHwgdHlwZW9mT2JqID09PSBcIm51bWJlclwiXG4gICAgICAgIHx8IHR5cGVvZk9iaiA9PT0gXCJmdW5jdGlvblwiXG4gICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYCR7dHlwZW9mT2JqfSBvYmplY3QgaXMgbm90IGl0ZXJhYmxlYCk7XG4gICAgfVxuICAgIGxldCBhcnJheSA9IFtdO1xuICAgIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgbGV0IGk6IG51bWJlciA9IDA7XG4gICAgICAgIGZvciAobGV0IHggb2Ygb2JqKSB7XG4gICAgICAgICAgICBhcnJheS5wdXNoKFtpLCB4XSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGxldCBwcm9wIGluIG9iaikge1xuICAgICAgICAgICAgYXJyYXkucHVzaChbcHJvcCwgb2JqW3Byb3BdXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5IGFzIEVudW1lcmF0ZWQ8VD47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YWl0KG1zOiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJvb2wodmFsOiBhbnkpOiBib29sZWFuIHtcbiAgICAvLyAwICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIDEgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyAnMCcgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gJzEnICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vICcgJyAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyAnJyAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICdmb28nICAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyAoKT0+e30gICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gQm9vbGVhbiAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIEJvb2xlYW4oKSAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbihmYWxzZSkgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuKHRydWUpICAgICAgICB0cnVlXG4gICAgLy8gRnVuY3Rpb24gICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIEZ1bmN0aW9uKCkgICAgICAgICAgIHRydWVcbiAgICAvLyBOdW1iZXIgICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gTnVtYmVyKDApICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIoMSkgICAgICAgICAgICB0cnVlXG4gICAgLy8gTnVtYmVyKCkgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBbIDAgXSAgICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gWyAxIF0gICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIFsgW10gXSAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyBbIGZhbHNlIF0gICAgICAgICAgICB0cnVlXG4gICAgLy8gWyB0cnVlIF0gICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIFtdICAgICAgICAgICAgICAgICAgIGZhbHNlICAgICAgIHVubGlrZSBuYXRpdmVcbiAgICAvLyBkb2N1bWVudC5ib2R5ICAgICAgICB0cnVlXG4gICAgLy8gZmFsc2UgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBmdW5jdGlvbigpe30gICAgICAgICB0cnVlXG4gICAgLy8gbmV3IEJvb2xlYW4gICAgICAgICAgZmFsc2UgICAgICAgdW5saWtlIG5hdGl2ZVxuICAgIC8vIG5ldyBCb29sZWFuKCkgICAgICAgIGZhbHNlICAgICAgIHVubGlrZSBuYXRpdmVcbiAgICAvLyBuZXcgQm9vbGVhbihmYWxzZSkgICBmYWxzZSAgICAgICB1bmxpa2UgbmF0aXZlXG4gICAgLy8gbmV3IEJvb2xlYW4odHJ1ZSkgICAgdHJ1ZVxuICAgIC8vIG5ldyBGdW5jdGlvbiAgICAgICAgIHRydWVcbiAgICAvLyBuZXcgRnVuY3Rpb24oKSAgICAgICB0cnVlXG4gICAgLy8gbmV3IE51bWJlciAgICAgICAgICAgZmFsc2UgICAgICAgdW5saWtlIG5hdGl2ZVxuICAgIC8vIG5ldyBOdW1iZXIoMCkgICAgICAgIGZhbHNlICAgICAgIHVubGlrZSBuYXRpdmVcbiAgICAvLyBuZXcgTnVtYmVyKDEpICAgICAgICB0cnVlXG4gICAgLy8gbmV3IE51bWJlcigpICAgICAgICAgZmFsc2UgICAgICAgdW5saWtlIG5hdGl2ZVxuICAgIC8vIG5ldyBUaW1lbGluZSguLi4pICAgIHRydWVcbiAgICAvLyBuZXcgY2xhc3N7fSAgICAgICAgICBmYWxzZSAgICAgICB1bmxpa2UgbmF0aXZlXG4gICAgLy8gbnVsbCAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB0cnVlICAgICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gdW5kZWZpbmVkICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB7IGhpIDogJ2J5ZScgfSAgICAgICB0cnVlXG4gICAgLy8ge30gICAgICAgICAgICAgICAgICAgZmFsc2UgICAgICAgdW5saWtlIG5hdGl2ZVxuXG5cbiAgICBpZiAoIXZhbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHR5cGVvZnZhbCA9IHR5cGVvZiB2YWw7XG4gICAgaWYgKHR5cGVvZnZhbCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKHR5cGVvZnZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gISF2YWw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gbGV0IGtleXNMZW5ndGggPSBPYmplY3Qua2V5cyh2YWwpLmxlbmd0aDtcbiAgICBsZXQgdG9TdHJpbmdlZCA9IHt9LnRvU3RyaW5nLmNhbGwodmFsKTtcbiAgICBpZiAodG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgT2JqZWN0XScgfHwgdG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModmFsKS5sZW5ndGggIT09IDA7XG4gICAgfVxuXG4gICAgLy8gQm9vbGVhbiwgTnVtYmVyLCBIVE1MRWxlbWVudC4uLlxuICAgIHJldHVybiAhIXZhbC52YWx1ZU9mKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FycmF5PFQ+KG9iaik6IG9iaiBpcyBBcnJheTxUPiB7IC8vIHNhbWUgYXMgQXJyYXkuaXNBcnJheVxuICAgIC8vIDAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAxICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJycgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcgJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnZm9vJyAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzAnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcxJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAoKT0+e30gICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbiAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIEJvb2xlYW4oKSAgICAgICAgICAgZmFsc2VcbiAgICAvLyBGdW5jdGlvbiAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gRnVuY3Rpb24oKSAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlciAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIoKSAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gLyBbIDEgXSAgICAgICAgICAgICB0cnVlXG4gICAgLy8gLyBbXSAgICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gZmFsc2UgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIGZ1bmN0aW9uKCl7fSAgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbigpICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4oZmFsc2UpICBmYWxzZVxuICAgIC8vIG5ldyBCb29sZWFuKHRydWUpICAgZmFsc2VcbiAgICAvLyBuZXcgRnVuY3Rpb24oKSAgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigwKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoMSkgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgTnVtYmVyKCkgICAgICAgIGZhbHNlXG4gICAgLy8gbnVsbCAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHRydWUgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB1bmRlZmluZWQgICAgICAgICAgIGZhbHNlXG4gICAgLy8geyBoaSA6ICdieWUnIH0gICAgICBmYWxzZVxuICAgIC8vIHt9ICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICBpZiAoIW9iaikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0eXBlb2Ygb2JqICE9PSAnc3RyaW5nJyAmJiAoQXJyYXkuaXNBcnJheShvYmopIHx8IHR5cGVvZiBvYmpbU3ltYm9sLml0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5QXJyKGNvbGxlY3Rpb24pOiBib29sZWFuIHtcbiAgICAvLyAwICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gMSAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcnICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnICcgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzAnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcxJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAoKT0+e30gICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbiAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIEJvb2xlYW4oKSAgICAgICAgICAgZmFsc2VcbiAgICAvLyBGdW5jdGlvbiAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gRnVuY3Rpb24oKSAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlciAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIoKSAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gWyAxIF0gICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIC8gW10gICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIGZhbHNlICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBmdW5jdGlvbigpe30gICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4oKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBCb29sZWFuKGZhbHNlKSAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbih0cnVlKSAgIGZhbHNlXG4gICAgLy8gbmV3IEZ1bmN0aW9uKCkgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoMCkgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgTnVtYmVyKDEpICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigpICAgICAgICBmYWxzZVxuICAgIC8vIG51bGwgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB0cnVlICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdW5kZWZpbmVkICAgICAgICAgICBmYWxzZVxuICAgIC8vIHsgaGkgOiAnYnllJyB9ICAgICAgZmFsc2VcbiAgICAvLyB7fSAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgcmV0dXJuIGlzQXJyYXkoY29sbGVjdGlvbikgJiYgZ2V0TGVuZ3RoKGNvbGxlY3Rpb24pID09PSAwXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5T2JqKG9iaik6IGJvb2xlYW4ge1xuICAgIC8vIDAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAxICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJycgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcgJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMCcgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzEnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICgpPT57fSAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbigpICAgICAgICAgICBmYWxzZVxuICAgIC8vIEZ1bmN0aW9uICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBGdW5jdGlvbigpICAgICAgICAgIGZhbHNlXG4gICAgLy8gTnVtYmVyICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlcigpICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBbIDEgXSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gW10gICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIGZhbHNlICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBmdW5jdGlvbigpe30gICAgICAgIGZhbHNlXG4gICAgLy8gLyBuZXcgQm9vbGVhbigpICAgICB0cnVlXG4gICAgLy8gLyBuZXcgQm9vbGVhbihmYWxzZSl0cnVlXG4gICAgLy8gLyBuZXcgQm9vbGVhbih0cnVlKSB0cnVlXG4gICAgLy8gbmV3IEZ1bmN0aW9uKCkgICAgICBmYWxzZVxuICAgIC8vIC8gbmV3IE51bWJlcigwKSAgICAgdHJ1ZVxuICAgIC8vIC8gbmV3IE51bWJlcigxKSAgICAgdHJ1ZVxuICAgIC8vIC8gbmV3IE51bWJlcigpICAgICAgdHJ1ZVxuICAgIC8vIG51bGwgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB0cnVlICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdW5kZWZpbmVkICAgICAgICAgICBmYWxzZVxuICAgIC8vIHsgaGkgOiAnYnllJyB9ICAgICAgZmFsc2VcbiAgICAvLyAvIHt9ICAgICAgICAgICAgICAgIHRydWVcbiAgICByZXR1cm4gaXNPYmplY3Qob2JqKSAmJiAhaXNBcnJheShvYmopICYmIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb248Rj4oZm46IEYpOiBmbiBpcyBGXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbihmbjogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpOiBmbiBpcyAoLi4uYXJnczogYW55W10pID0+IGFueVxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24oZm4pIHtcbiAgICAvLyAwICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gMSAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcnICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnICcgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzAnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcxJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAvICgpPT57fSAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIC8gQm9vbGVhbiAgICAgICAgICAgICB0cnVlXG4gICAgLy8gQm9vbGVhbigpICAgICAgICAgICBmYWxzZVxuICAgIC8vIC8gRnVuY3Rpb24gICAgICAgICAgICB0cnVlXG4gICAgLy8gLyBGdW5jdGlvbigpICAgICAgICAgIHRydWVcbiAgICAvLyAvIE51bWJlciAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIE51bWJlcigpICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBbIDEgXSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gW10gICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIGZhbHNlICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAvIGZ1bmN0aW9uKCl7fSAgICAgICAgdHJ1ZVxuICAgIC8vIG5ldyBCb29sZWFuKCkgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbihmYWxzZSkgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4odHJ1ZSkgICBmYWxzZVxuICAgIC8vIC8gbmV3IEZ1bmN0aW9uKCkgICAgICB0cnVlXG4gICAgLy8gbmV3IE51bWJlcigwKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoMSkgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgTnVtYmVyKCkgICAgICAgIGZhbHNlXG4gICAgLy8gbnVsbCAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHRydWUgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB1bmRlZmluZWQgICAgICAgICAgIGZhbHNlXG4gICAgLy8geyBoaSA6ICdieWUnIH0gICAgICBmYWxzZVxuICAgIC8vIHt9ICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICBsZXQgdG9TdHJpbmdlZCA9IHt9LnRvU3RyaW5nLmNhbGwoZm4pO1xuICAgIHJldHVybiAhIWZuICYmIHRvU3RyaW5nZWQgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueURlZmluZWQob2JqKTogYm9vbGVhbiB7XG4gICAgbGV0IGFycmF5O1xuICAgIGlmIChpc09iamVjdChvYmopKSB7XG4gICAgICAgIGFycmF5ID0gT2JqZWN0LnZhbHVlcyhvYmopO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICAgIGFycmF5ID0gb2JqO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYGV4cGVjdGVkIGFycmF5IG9yIG9iaiwgZ290OiAke3R5cGVvZiBvYmp9YCk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheS5maWx0ZXIoeCA9PiB4ICE9PSB1bmRlZmluZWQpLmxlbmd0aCA+IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnlUcnV0aHkob2JqKTogYm9vbGVhbiB7XG4gICAgbGV0IGFycmF5O1xuICAgIGlmIChpc09iamVjdChvYmopKSB7XG4gICAgICAgIGFycmF5ID0gT2JqZWN0LnZhbHVlcyhvYmopO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICAgIGFycmF5ID0gb2JqO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYGV4cGVjdGVkIGFycmF5IG9yIG9iaiwgZ290OiAke3R5cGVvZiBvYmp9YCk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheS5maWx0ZXIoeCA9PiBib29sKHgpKS5sZW5ndGggPiAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWxsVW5kZWZpbmVkKG9iaik6IGJvb2xlYW4ge1xuICAgIGxldCBhcnJheTtcbiAgICBpZiAoaXNPYmplY3Qob2JqKSkge1xuICAgICAgICBhcnJheSA9IE9iamVjdC52YWx1ZXMob2JqKVxuICAgIH0gZWxzZSBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICAgIGFycmF5ID0gb2JqO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYGV4cGVjdGVkIGFycmF5IG9yIG9iaiwgZ290OiAke3R5cGVvZiBvYmp9YClcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5LmZpbHRlcih4ID0+IHggIT09IHVuZGVmaW5lZCkubGVuZ3RoID09PSAwXG59XG5cbi8qKkNoZWNrIGV2ZXJ5IGBjaGVja0ludGVydmFsYCBtcyBpZiBgY29uZCgpYCBpcyB0cnV0aHkuIElmLCB3aXRoaW4gYHRpbWVvdXRgLCBjb25kKCkgaXMgdHJ1dGh5LCByZXR1cm4gYHRydWVgLiBSZXR1cm4gYGZhbHNlYCBpZiB0aW1lIGlzIG91dC5cbiAqIEBleGFtcGxlXG4gKiAvLyBHaXZlIHRoZSB1c2VyIGEgMjAwbXMgY2hhbmNlIHRvIGdldCBoZXIgcG9pbnRlciBvdmVyIFwibXlkaXZcIi4gQ29udGludWUgaW1tZWRpYXRlbHkgb25jZSBzaGUgZG9lcywgb3IgYWZ0ZXIgMjAwbXMgaWYgc2hlIGRvZXNuJ3QuXG4gKiBteWRpdi5wb2ludGVyZW50ZXIoICgpID0+IG15ZGl2LnBvaW50ZXJIb3ZlcmluZyA9IHRydWU7IClcbiAqIGNvbnN0IHBvaW50ZXJPbk15ZGl2ID0gYXdhaXQgd2FpdFVudGlsKCgpID0+IG15ZGl2LnBvaW50ZXJIb3ZlcmluZywgMjAwLCAxMCk7Ki9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3YWl0VW50aWwoY29uZDogKCkgPT4gYm9vbGVhbiwgY2hlY2tJbnRlcnZhbDogbnVtYmVyID0gMjAsIHRpbWVvdXQ6IG51bWJlciA9IEluZmluaXR5KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGNoZWNrSW50ZXJ2YWwgPD0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGNoZWNrSW50ZXJ2YWwgPD0gMC4gY2hlY2tJbnRlcnZhbDogJHtjaGVja0ludGVydmFsfWApO1xuICAgIH1cbiAgICBpZiAoY2hlY2tJbnRlcnZhbCA+IHRpbWVvdXQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBjaGVja0ludGVydmFsID4gdGltZW91dCAoJHtjaGVja0ludGVydmFsfSA+ICR7dGltZW91dH0pLiBjaGVja0ludGVydmFsIGhhcyB0byBiZSBsb3dlciB0aGFuIHRpbWVvdXQuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgbG9vcHMgPSB0aW1lb3V0IC8gY2hlY2tJbnRlcnZhbDtcbiAgICBpZiAobG9vcHMgPD0gMSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYGxvb3BzIDw9IDEsIHlvdSBwcm9iYWJseSBkaWRuJ3Qgd2FudCB0aGlzIHRvIGhhcHBlbmApO1xuICAgIH1cbiAgICBsZXQgY291bnQgPSAwO1xuICAgIHdoaWxlIChjb3VudCA8IGxvb3BzKSB7XG4gICAgICAgIGlmIChjb25kKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IHdhaXQoY2hlY2tJbnRlcnZhbCk7XG4gICAgICAgIGNvdW50Kys7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQkhFPFQgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudD4oYmhlOiBULCBiaGVTdWJUeXBlKTogYmhlIGlzIFQge1xuICAgIHJldHVybiAoYmhlIGluc3RhbmNlb2YgYmhlU3ViVHlwZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVHlwZTxUPihhcmc6IFQpOiBhcmcgaXMgVCB7XG4gICAgcmV0dXJuIHRydWVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVE1hcDxUPihvYmo6IFRNYXA8VD4pOiBvYmogaXMgVE1hcDxUPiB7XG4gICAgLy8gMCAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIDEgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnJyAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJyAnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcwJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMScgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gKCk9Pnt9ICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIEJvb2xlYW4gICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuKCkgICAgICAgICAgIGZhbHNlXG4gICAgLy8gRnVuY3Rpb24gICAgICAgICAgICBmYWxzZVxuICAgIC8vIEZ1bmN0aW9uKCkgICAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gTnVtYmVyKCkgICAgICAgICAgICBmYWxzZVxuICAgIC8vIFsgMSBdICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gW10gICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBmYWxzZSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gZnVuY3Rpb24oKXt9ICAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBCb29sZWFuKCkgICAgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4oZmFsc2UpZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbih0cnVlKSBmYWxzZVxuICAgIC8vIG5ldyBGdW5jdGlvbigpICAgICAgZmFsc2VcbiAgICAvLyBuZXcgTnVtYmVyKDApICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoMSkgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigpICAgICAgZmFsc2VcbiAgICAvLyBudWxsICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdHJ1ZSAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHVuZGVmaW5lZCAgICAgICAgICAgZmFsc2VcbiAgICAvLyAvIHsgaGkgOiAnYnllJyB9ICAgIHRydWVcbiAgICAvLyAvIHt9ICAgICAgICAgICAgICAgIHRydWVcbiAgICByZXR1cm4ge30udG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IE9iamVjdF0nXG59XG5cblxuLy8gKiAgdW5kZXJzY29yZS5qc1xuLyoqdHJ1ZSBmb3IgYW55IG5vbi1wcmltaXRpdmUsIGluY2x1ZGluZyBhcnJheSwgZnVuY3Rpb24qL1xuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0KG9iaik6IGJvb2xlYW4ge1xuICAgIC8vIDAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAxICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJycgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcgJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMCcgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzEnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICgpPT57fSAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbigpICAgICAgICAgICBmYWxzZVxuICAgIC8vIEZ1bmN0aW9uICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBGdW5jdGlvbigpICAgICAgICAgIGZhbHNlXG4gICAgLy8gTnVtYmVyICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlcigpICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAvIFsgMSBdICAgICAgICAgICAgIHRydWVcbiAgICAvLyAvIFtdICAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyBmYWxzZSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gZnVuY3Rpb24oKXt9ICAgICAgICBmYWxzZVxuICAgIC8vIC8gbmV3IEJvb2xlYW4oKSAgICAgdHJ1ZVxuICAgIC8vIC8gbmV3IEJvb2xlYW4oZmFsc2UpdHJ1ZVxuICAgIC8vIC8gbmV3IEJvb2xlYW4odHJ1ZSkgdHJ1ZVxuICAgIC8vIG5ldyBGdW5jdGlvbigpICAgICAgZmFsc2VcbiAgICAvLyAvIG5ldyBOdW1iZXIoMCkgICAgIHRydWVcbiAgICAvLyAvIG5ldyBOdW1iZXIoMSkgICAgIHRydWVcbiAgICAvLyAvIG5ldyBOdW1iZXIoKSAgICAgIHRydWVcbiAgICAvLyBudWxsICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdHJ1ZSAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHVuZGVmaW5lZCAgICAgICAgICAgZmFsc2VcbiAgICAvLyAvIHsgaGkgOiAnYnllJyB9ICAgIHRydWVcbiAgICAvLyAvIHt9ICAgICAgICAgICAgICAgIHRydWVcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaGFsbG93UHJvcGVydHk8VD4oa2V5OiBzdHJpbmcpOiAob2JqOiBUKSA9PiBUIGV4dGVuZHMgbnVsbCA/IHVuZGVmaW5lZCA6IFRba2V5b2YgVF0ge1xuICAgIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogPT0gbnVsbCA/IHZvaWQgMCA6IG9ialtrZXldO1xuICAgIH07XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExlbmd0aChjb2xsZWN0aW9uKTogbnVtYmVyIHtcbiAgICByZXR1cm4gc2hhbGxvd1Byb3BlcnR5KCdsZW5ndGgnKShjb2xsZWN0aW9uKVxufVxuXG5cbmNvbnN0IE1BWF9BUlJBWV9JTkRFWCA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FycmF5TGlrZShjb2xsZWN0aW9uKTogYm9vbGVhbiB7XG4gICAgY29uc3QgbGVuZ3RoID0gZ2V0TGVuZ3RoKGNvbGxlY3Rpb24pO1xuICAgIHJldHVybiB0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInICYmIGxlbmd0aCA+PSAwICYmIGxlbmd0aCA8PSBNQVhfQVJSQVlfSU5ERVg7XG59XG5cblxuLy8gKiAgbWlzY1xuLy8gY2hpbGQgZXh0ZW5kcyBzdXBcbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQoc3VwLCBjaGlsZCkge1xuICAgIGNoaWxkLnByb3RvdHlwZSA9IHN1cC5wcm90b3R5cGU7XG4gICAgY29uc3QgaGFuZGxlciA9IHtcbiAgICAgICAgY29uc3RydWN0XG4gICAgfTtcblxuICAgIC8vIFwibmV3IEJveUNsc1wiXG4gICAgZnVuY3Rpb24gY29uc3RydWN0KF8sIGFyZ0FycmF5KSB7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBjaGlsZDtcbiAgICAgICAgc3VwLmFwcGx5KG9iaiwgYXJnQXJyYXkpOyAgICAvLyBjYWxscyBQZXJzb25DdG9yLiBTZXRzIG5hbWVcbiAgICAgICAgY2hpbGQuYXBwbHkob2JqLCBhcmdBcnJheSk7IC8vIGNhbGxzIEJveUN0b3IuIFNldHMgYWdlXG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgcHJveHkgPSBuZXcgUHJveHkoY2hpbGQsIGhhbmRsZXIpO1xuICAgIHJldHVybiBwcm94eTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueVZhbHVlKG9iaikge1xuICAgIGxldCBhcnJheTtcbiAgICBpZiAoaXNPYmplY3Qob2JqKSkge1xuICAgICAgICBhcnJheSA9IE9iamVjdC52YWx1ZXMob2JqKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICBhcnJheSA9IG9iajtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBleHBlY3RlZCBhcnJheSBvciBvYmosIGdvdDogJHt0eXBlb2Ygb2JqfWApO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXkuZmlsdGVyKHggPT4gQm9vbGVhbih4KSkubGVuZ3RoID4gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsc0FueShvYmo6IGFueSwgLi4ub3RoZXJzOiBhbnlbXSk6IGJvb2xlYW4ge1xuICAgIGlmICghb3RoZXJzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGV2ZW4gb25lIG90aGVyIHdhcyBwYXNzZWQnKTtcbiAgICB9XG4gICAgbGV0IHN0cmljdCA9ICEoaXNBcnJheUxpa2Uob2JqKSAmJiBpc09iamVjdChvYmpbb2JqLmxlbmd0aCAtIDFdKSAmJiBvYmpbb2JqLmxlbmd0aCAtIDFdLnN0cmljdCA9PSBmYWxzZSk7XG4gICAgY29uc3QgX2lzRXEgPSAoX29iaiwgX290aGVyKSA9PiBzdHJpY3QgPyBfb2JqID09PSBfb3RoZXIgOiBfb2JqID09IF9vdGhlcjtcbiAgICBmb3IgKGxldCBvdGhlciBvZiBvdGhlcnMpIHtcbiAgICAgICAgaWYgKF9pc0VxKG9iaiwgb3RoZXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub1ZhbHVlKG9iaik6IGJvb2xlYW4ge1xuICAgIGxldCBhcnJheTtcbiAgICBpZiAoaXNPYmplY3Qob2JqKSkge1xuICAgICAgICBhcnJheSA9IE9iamVjdC52YWx1ZXMob2JqKVxuICAgIH0gZWxzZSBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICAgIGFycmF5ID0gb2JqO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYGV4cGVjdGVkIGFycmF5IG9yIG9iaiwgZ290OiAke3R5cGVvZiBvYmp9YClcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5LmZpbHRlcih4ID0+IEJvb2xlYW4oeCkpLmxlbmd0aCA9PT0gMFxufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gKioqIEV4Y2VwdGlvbnNcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcmdzRnVsbFJlcHIoYXJnc1dpdGhWYWx1ZXM6IFRNYXA8YW55Pik6IHN0cmluZyB7XG4gICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKGFyZ3NXaXRoVmFsdWVzKVxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIC5mbGF0TWFwKChbYXJnbmFtZSwgYXJndmFsXSkgPT4gYCR7YXJnbmFtZX0gKCR7dHlwZW9mIGFyZ3ZhbH0pOiAke2lzT2JqZWN0KGFyZ3ZhbCkgPyBgeyR7Z2V0QXJnc0Z1bGxSZXByKGFyZ3ZhbCl9fWAgOiBhcmd2YWx9YClcbiAgICAgICAgLmpvaW4oJ1wiLCBcIicpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXJnc1dpdGhWYWx1ZXMocGFzc2VkQXJnczogVE1hcDxhbnk+KSB7XG4gICAgY29uc3QgYXJnc1dpdGhWYWx1ZXM6IFRNYXA8YW55PiA9IHt9O1xuICAgIGZvciAobGV0IFthcmduYW1lLCBhcmd2YWxdIG9mIE9iamVjdC5lbnRyaWVzKHBhc3NlZEFyZ3MpKSB7XG4gICAgICAgIGlmIChhcmd2YWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgYXJnc1dpdGhWYWx1ZXNbYXJnbmFtZV0gPSBhcmd2YWw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFyZ3NXaXRoVmFsdWVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VtbWFyeShhcmdzZXQ6IFRNYXA8YW55Pik6IHN0cmluZyB7XG4gICAgY29uc3QgYXJnc1dpdGhWYWx1ZXMgPSBnZXRBcmdzV2l0aFZhbHVlcyhhcmdzZXQpO1xuICAgIGNvbnN0IGFyZ3NGdWxsUmVwcjogc3RyaW5nID0gZ2V0QXJnc0Z1bGxSZXByKGFyZ3NXaXRoVmFsdWVzKTtcbiAgICBsZXQgYXJnTmFtZXMgPSBPYmplY3Qua2V5cyhhcmdzZXQpO1xuICAgIHJldHVybiBgJHthcmdOYW1lcy5sZW5ndGh9IGFyZ3MgKCR7YXJnTmFtZXN9KTsgJHtPYmplY3Qua2V5cyhhcmdzV2l0aFZhbHVlcykubGVuZ3RofSBoYWQgdmFsdWU6IFwiJHthcmdzRnVsbFJlcHJ9XCIuXFxuYDtcbn1cblxuLyoqUHJpbnRzIHdoYXQgd2FzIGV4cGVjdGVkIGFuZCB3aGF0IHdhcyBhY3R1YWxseSBwYXNzZWQuKi9cbmV4cG9ydCBjbGFzcyBNdXR1YWxseUV4Y2x1c2l2ZUFyZ3MgZXh0ZW5kcyBFcnJvciB7XG4gICAgLyoqQHBhcmFtIHBhc3NlZEFyZ3MgLSBrZXk6dmFsdWUgcGFpcnMgb2YgYXJnTmFtZTphcmdWYWx1ZSwgd2hlcmUgZWFjaCBhcmcgaXMgbXV0dWFsbHkgZXhjbHVzaXZlIHdpdGggYWxsIG90aGVycyovXG4gICAgY29uc3RydWN0b3IocGFzc2VkQXJnczogVE1hcDxhbnk+LCBkZXRhaWxzPzogc3RyaW5nKVxuICAgIC8qKkBwYXJhbSBwYXNzZWRBcmdzIC0gQXJyYXkgb2YgbXV0dWFsbHkgZXhjbHVzaXZlIHNldHMgb2YgYXJncywgd2hlcmUgYW4gYXJnIGZyb20gb25lIHNldCBtZWFucyB0aGVyZSBjYW4ndCBiZSBhbnkgYXJncyBmcm9tIHRoZSBvdGhlciBzZXRzLlxuICAgICAqIEVhY2ggc2V0IGlzIGtleTp2YWx1ZSBwYWlycyBvZiBhcmdOYW1lOmFyZ1ZhbHVlLiovXG4gICAgY29uc3RydWN0b3IocGFzc2VkQXJnczogVE1hcDxhbnk+W10sIGRldGFpbHM/OiBzdHJpbmcpXG4gICAgLyoqRWl0aGVyIGEgYXJnTmFtZTphcmdWYWx1ZSBtYXAgb3IgYW4gYXJyYXkgb2Ygc3VjaCBtYXBzLCB0byBpbmRpY2F0ZSBtdXR1YWxseSBleGNsdXNpdmUgc2V0cyBvZiBhcmdzLiovXG4gICAgY29uc3RydWN0b3IocGFzc2VkQXJncywgZGV0YWlscz86IHN0cmluZykge1xuICAgICAgICBsZXQgbWVzc2FnZSA9IGBEaWRuJ3QgcmVjZWl2ZSBleGFjdGx5IG9uZSBhcmdgO1xuICAgICAgICBpZiAoaXNBcnJheShwYXNzZWRBcmdzKSkge1xuICAgICAgICAgICAgbWVzc2FnZSArPSBgIGZyb20gdGhlIGZvbGxvd2luZyBtdXR1YWxseSBleGNsdXNpdmUgc2V0cyBvZiBhcmdzLlxcbmA7XG4gICAgICAgICAgICBmb3IgKGxldCBbaSwgYXJnc2V0XSBvZiBlbnVtZXJhdGUocGFzc2VkQXJncykpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlICs9IGBPdXQgb2Ygc2V0ICMke2kgKyAxfSwgd2hpY2ggY29uc2lzdHMgb2YgJHtzdW1tYXJ5KGFyZ3NldCl9YFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZSArPSBgIGZyb20gdGhlIGZvbGxvd2luZyBtdXR1YWxseSBleGNsdXNpdmUgc2V0IG9mIGFyZ3MuXFxuT3V0IG9mICR7c3VtbWFyeShwYXNzZWRBcmdzKX1gXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGV0YWlscykge1xuICAgICAgICAgICAgbWVzc2FnZSArPSBgRGV0YWlsczogJHtkZXRhaWxzfWBcbiAgICAgICAgfVxuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB9XG5cblxufVxuXG5cbmV4cG9ydCBjbGFzcyBOb3RFbm91Z2hBcmdzIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKGV4cGVjdGVkOiBudW1iZXIgfCBudW1iZXJbXSwgcGFzc2VkQXJnczogVE1hcDxhbnk+IHwgVE1hcDxhbnk+W10sIHJlbGF0aW9uPzogJ2VhY2gnIHwgJ2VpdGhlcicpIHtcbiAgICAgICAgbGV0IG1lc3NhZ2U7XG4gICAgICAgIGlmIChpc0FycmF5KGV4cGVjdGVkKSkge1xuICAgICAgICAgICAgbGV0IFttaW4sIG1heF0gPSBleHBlY3RlZDtcbiAgICAgICAgICAgIGlmIChtYXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgRGlkbid0IHJlY2VpdmUgZW5vdWdoIGFyZ3M6IGV4cGVjdGVkIGF0IGxlYXN0ICR7bWlufWBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBEaWRuJ3QgcmVjZWl2ZSBlbm91Z2ggYXJnczogZXhwZWN0ZWQgYmV0d2VlbiAke21pbn0gYW5kICR7bWF4fWBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgRGlkbid0IHJlY2VpdmUgZW5vdWdoIGFyZ3M6IGV4cGVjdGVkIGV4YWN0bHkgJHtleHBlY3RlZH1gO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzQXJyYXkocGFzc2VkQXJncykpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgKz0gYCBmcm9tICR7cmVsYXRpb259IHNldCBvZiBhcmd1bWVudHMuXFxuYDtcbiAgICAgICAgICAgIGZvciAobGV0IFtpLCBhcmdzZXRdIG9mIGVudW1lcmF0ZShwYXNzZWRBcmdzKSkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgKz0gYE91dCBvZiBzZXQgIyR7aSArIDF9LCB3aGljaCBjb25zaXN0cyBvZiAke3N1bW1hcnkoYXJnc2V0KX1gXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgKz0gYCBmcm9tIHRoZSBmb2xsb3dpbmcgc2V0IG9mIGFyZ3MuXFxuT3V0IG9mICR7c3VtbWFyeShwYXNzZWRBcmdzKX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQkhFVHlwZUVycm9yIGV4dGVuZHMgVHlwZUVycm9yIHtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHsgZmF1bHR5VmFsdWU6IFRNYXA8YW55PiwgZXhwZWN0ZWQ/OiBhbnkgfCBhbnlbXSwgd2hlcmU/OiBzdHJpbmcsIG1lc3NhZ2U/OiBzdHJpbmcgfSkge1xuICAgICAgICBsZXQgeyBmYXVsdHlWYWx1ZSwgZXhwZWN0ZWQsIHdoZXJlLCBtZXNzYWdlIH0gPSBvcHRpb25zO1xuICAgICAgICBjb25zdCByZXByID0gZ2V0QXJnc0Z1bGxSZXByKGZhdWx0eVZhbHVlKTtcbiAgICAgICAgbGV0IG1zZyA9ICcnO1xuICAgICAgICBpZiAod2hlcmUpIHtcbiAgICAgICAgICAgIG1zZyArPSBgJHt3aGVyZX0gfCBgXG4gICAgICAgIH1cbiAgICAgICAgbXNnICs9IGBHb3QgJHtyZXByfS4gYDtcbiAgICAgICAgaWYgKGV4cGVjdGVkKSB7XG4gICAgICAgICAgICBpZiAoaXNBcnJheShleHBlY3RlZCkpIHtcbiAgICAgICAgICAgICAgICBleHBlY3RlZCA9IGV4cGVjdGVkLmpvaW4oXCIgfCBcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1zZyArPSBgIEV4cGVjdGVkOiAke2V4cGVjdGVkfS4gYFxuICAgICAgICB9XG4gICAgICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICAgICAgICBtc2cgKz0gYERldGFpbHM6XFxuJHttZXNzYWdlfWBcbiAgICAgICAgfVxuICAgICAgICBzdXBlcihtc2cpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFZhbHVlRXJyb3IgZXh0ZW5kcyBCSEVUeXBlRXJyb3Ige1xuXG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAqKiogQmV0dGVySFRNTEVsZW1lbnRcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmNvbnN0IFNWR19OU19VUkkgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuXG5leHBvcnQgY2xhc3MgQmV0dGVySFRNTEVsZW1lbnQ8R2VuZXJpYyBleHRlbmRzIEhUTUxFbGVtZW50ID0gSFRNTEVsZW1lbnQ+IHtcbiAgICBwcm90ZWN0ZWQgX2h0bWxFbGVtZW50OiBHZW5lcmljO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2lzU3ZnOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfbGlzdGVuZXJzOiBNYXBPZkV2ZW50TmFtZTJGdW5jdGlvbiA9IHt9O1xuICAgIHByaXZhdGUgX2NhY2hlZENoaWxkcmVuOiBUTWFwPEJldHRlckhUTUxFbGVtZW50IHwgQmV0dGVySFRNTEVsZW1lbnRbXT4gPSB7fTtcblxuICAgIC8qKkNyZWF0ZSBhbiBlbGVtZW50IG9mIGB0YWdgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGBjbHNgIG9yIGBpZGAuICovXG4gICAgY29uc3RydWN0b3IoeyB0YWcsIGNscywgc2V0aWQsIGh0bWwgfTogeyB0YWc6IEVsZW1lbnQyVGFnPEdlbmVyaWM+LCBjbHM/OiBzdHJpbmcsIHNldGlkPzogc3RyaW5nLCBodG1sPzogc3RyaW5nIH0pO1xuICAgIC8qKldyYXAgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgYnlpZGAuIE9wdGlvbmFsbHkgY2FjaGUgZXhpc3RpbmcgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBieWlkLCBjaGlsZHJlbiB9OiB7IGJ5aWQ6IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICAvKipXcmFwIGFuIGV4aXN0aW5nIGVsZW1lbnQgYnkgYHF1ZXJ5YC4gT3B0aW9uYWxseSBjYWNoZSBleGlzdGluZyBgY2hpbGRyZW5gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IHF1ZXJ5LCBjaGlsZHJlbiB9OiB7IHF1ZXJ5OiBRdWVyeVNlbGVjdG9yLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIC8qKldyYXAgYW4gZXhpc3RpbmcgSFRNTEVsZW1lbnQuIE9wdGlvbmFsbHkgY2FjaGUgZXhpc3RpbmcgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBodG1sRWxlbWVudCwgY2hpbGRyZW4gfTogeyBodG1sRWxlbWVudDogR2VuZXJpYzsgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICBjb25zdHJ1Y3RvcihlbGVtT3B0aW9ucykge1xuICAgICAgICBsZXQge1xuICAgICAgICAgICAgdGFnLCBjbHMsIHNldGlkLCBodG1sLCAvLyBjcmVhdGVcbiAgICAgICAgICAgIGh0bWxFbGVtZW50LCBieWlkLCBxdWVyeSwgY2hpbGRyZW4gLy8gd3JhcCBleGlzdGluZ1xuICAgICAgICB9ID0gZWxlbU9wdGlvbnM7XG5cbiAgICAgICAgLy8gKioqIEFyZ3VtZW50IEVycm9yc1xuICAgICAgICAvLyAqKiB3cmFwcGluZyBhcmdzOiBhc3NlcnQgbWF4IG9uZSAob3Igbm9uZSBpZiBjcmVhdGluZyBuZXcpXG4gICAgICAgIGlmIChbdGFnLCBieWlkLCBxdWVyeSwgaHRtbEVsZW1lbnRdLmZpbHRlcih4ID0+IHggIT09IHVuZGVmaW5lZCkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE11dHVhbGx5RXhjbHVzaXZlQXJncyh7XG4gICAgICAgICAgICAgICAgYnlpZCwgcXVlcnksIGh0bWxFbGVtZW50LCB0YWdcbiAgICAgICAgICAgIH0sICdFaXRoZXIgd3JhcCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IHBhc3Npbmcgb25lIG9mIGBieWlkYCAvIGBxdWVyeWAgLyBgaHRtbEVsZW1lbnRgLCBvciBjcmVhdGUgYSBuZXcgb25lIGJ5IHBhc3NpbmcgYHRhZ2AuJylcbiAgICAgICAgfVxuICAgICAgICAvLyAqKiBjcmVhdGluZyBuZXcgZWxlbSBhcmdzOiBhc3NlcnQgY3JlYXRvcnMgYW5kIHdyYXBwZXJzIG5vdCBtaXhlZFxuICAgICAgICAvLyAqIGlmIGNyZWF0aW5nIG5ldyB3aXRoIGVpdGhlciBgdGFnYCAvIGBzZXRpZGAgLCBubyBtZWFuaW5nIHRvIGVpdGhlciBjaGlsZHJlbiwgYnlpZCwgaHRtbEVsZW1lbnQsIG9yIHF1ZXJ5XG4gICAgICAgIGlmIChhbnlEZWZpbmVkKFt0YWcsIGNscywgc2V0aWRdKSAmJiBhbnlEZWZpbmVkKFtjaGlsZHJlbiwgYnlpZCwgaHRtbEVsZW1lbnQsIHF1ZXJ5XSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNdXR1YWxseUV4Y2x1c2l2ZUFyZ3MoW1xuICAgICAgICAgICAgICAgIHsgdGFnLCBjbHMsIHNldGlkIH0sXG4gICAgICAgICAgICAgICAgeyBjaGlsZHJlbiwgYnlpZCwgaHRtbEVsZW1lbnQsIHF1ZXJ5IH1cbiAgICAgICAgICAgIF0sIGBDYW4ndCBoYXZlIGFyZ3MgZnJvbSBib3RoIHNldHNgKVxuICAgICAgICB9XG4gICAgICAgIGlmIChhbGxVbmRlZmluZWQoW3RhZywgYnlpZCwgaHRtbEVsZW1lbnQsIHF1ZXJ5XSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBOb3RFbm91Z2hBcmdzKDEsIHsgdGFnLCBieWlkLCBodG1sRWxlbWVudCwgcXVlcnkgfSwgJ2VpdGhlcicpO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyAqKiB0YWcgKENSRUFURSBlbGVtZW50KVxuICAgICAgICBpZiAodGFnICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChbJ3N2ZycsICdwYXRoJ10uaW5jbHVkZXModGFnLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNTdmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OU19VUkksIHRhZyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpIGFzIEdlbmVyaWM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHsgLy8gKiogd3JhcCBFWElTVElORyBlbGVtZW50XG4gICAgICAgICAgICAvLyAqIGJ5aWRcbiAgICAgICAgICAgIGlmIChieWlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoYnlpZC5zdGFydHNXaXRoKCcjJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBwYXJhbSAnYnlpZCcgc3RhcnRzIHdpdGggJyMnLCBzdHJpcHBpbmcgaXQ6ICR7YnlpZH1gKTtcbiAgICAgICAgICAgICAgICAgICAgYnlpZCA9IGJ5aWQuc3Vic3RyKDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGJ5aWQpIGFzIEdlbmVyaWM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vICogcXVlcnlcbiAgICAgICAgICAgICAgICBpZiAocXVlcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocXVlcnkpIGFzIEdlbmVyaWM7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gKiBodG1sRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICBpZiAoaHRtbEVsZW1lbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQgPSBodG1sRWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWJvb2wodGhpcy5faHRtbEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dGhpc30gY29uc3RydWN0b3IgZW5kZWQgdXAgd2l0aCBubyAndGhpcy5faHRtbEVsZW1lbnQnLiBQYXNzZWQgb3B0aW9uczogJHtzdW1tYXJ5KGVsZW1PcHRpb25zKX1gKVxuICAgICAgICB9XG4gICAgICAgIGlmIChjbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5jbGFzcyhjbHMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChodG1sICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaHRtbChodG1sKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hpbGRyZW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5jYWNoZUNoaWxkcmVuKGNoaWxkcmVuKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2V0aWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5pZChzZXRpZCk7XG4gICAgICAgIH1cblxuXG4gICAgfVxuXG4gICAgLyoqUmV0dXJuIHRoZSB3cmFwcGVkIEhUTUxFbGVtZW50Ki9cbiAgICBnZXQgZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50O1xuICAgIH1cblxuICAgIHN0YXRpYyB3cmFwV2l0aEJIRShodG1sRWxlbWVudDogSFRNTEFuY2hvckVsZW1lbnQpOiBBbmNob3I7XG5cbiAgICBzdGF0aWMgd3JhcFdpdGhCSEU8VElucHV0VHlwZSBleHRlbmRzIElucHV0VHlwZSA9IElucHV0VHlwZSwgR2VuZXJpYyBleHRlbmRzIEZvcm1pc2hIVE1MRWxlbWVudCA9IEZvcm1pc2hIVE1MRWxlbWVudD4oaHRtbEVsZW1lbnQ6IEdlbmVyaWMpOiBJbnB1dDxUSW5wdXRUeXBlLCBHZW5lcmljPjtcblxuICAgIHN0YXRpYyB3cmFwV2l0aEJIRShodG1sRWxlbWVudDogSFRNTEltYWdlRWxlbWVudCk6IEltZztcblxuICAgIHN0YXRpYyB3cmFwV2l0aEJIRShodG1sRWxlbWVudDogSFRNTFBhcmFncmFwaEVsZW1lbnQpOiBQYXJhZ3JhcGg7XG5cbiAgICBzdGF0aWMgd3JhcFdpdGhCSEUoaHRtbEVsZW1lbnQ6IEhUTUxTcGFuRWxlbWVudCk6IFNwYW47XG5cbiAgICBzdGF0aWMgd3JhcFdpdGhCSEUoaHRtbEVsZW1lbnQ6IEhUTUxCdXR0b25FbGVtZW50KTogQnV0dG9uO1xuXG4gICAgc3RhdGljIHdyYXBXaXRoQkhFKGh0bWxFbGVtZW50OiBIVE1MRGl2RWxlbWVudCk6IERpdjtcblxuICAgIHN0YXRpYyB3cmFwV2l0aEJIRShodG1sRWxlbWVudDogSFRNTFNlbGVjdEVsZW1lbnQpOiBEaXY7XG5cbiAgICBzdGF0aWMgd3JhcFdpdGhCSEUoaHRtbEVsZW1lbnQ6IEhUTUxFbGVtZW50KTogQmV0dGVySFRNTEVsZW1lbnQ7XG5cbiAgICBzdGF0aWMgd3JhcFdpdGhCSEUoZWxlbWVudCkge1xuICAgICAgICBjb25zdCB0YWcgPSBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSBhcyBFbGVtZW50MlRhZzx0eXBlb2YgZWxlbWVudD47XG4gICAgICAgIC8vIGNvbnN0IHRhZyA9IGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpIGFzIFRhZztcbiAgICAgICAgaWYgKHRhZyA9PT0gJ2RpdicpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXYoeyBodG1sRWxlbWVudDogZWxlbWVudCB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0YWcgPT09ICdhJykge1xuICAgICAgICAgICAgcmV0dXJuIGFuY2hvcih7IGh0bWxFbGVtZW50OiBlbGVtZW50IH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ3AnKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyYWdyYXBoKHsgaHRtbEVsZW1lbnQ6IGVsZW1lbnQgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGFnID09PSAnaW1nJykge1xuICAgICAgICAgICAgcmV0dXJuIGltZyh7IGh0bWxFbGVtZW50OiBlbGVtZW50IH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ2lucHV0Jykge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gXCJ0ZXh0XCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRleHRJbnB1dCh7IGh0bWxFbGVtZW50OiBlbGVtZW50IH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtZW50LnR5cGUgPT09IFwiY2hlY2tib3hcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ2hlY2tib3hJbnB1dCh7IGh0bWxFbGVtZW50OiBlbGVtZW50IH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5wdXQoeyBodG1sRWxlbWVudDogZWxlbWVudCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0YWcgPT09ICdidXR0b24nKSB7XG4gICAgICAgICAgICByZXR1cm4gYnV0dG9uKHsgaHRtbEVsZW1lbnQ6IGVsZW1lbnQgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGFnID09PSAnc3BhbicpIHtcbiAgICAgICAgICAgIHJldHVybiBzcGFuKHsgaHRtbEVsZW1lbnQ6IGVsZW1lbnQgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGFnID09PSAnc2VsZWN0Jykge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdCh7IGh0bWxFbGVtZW50OiBlbGVtZW50IH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW0oeyBodG1sRWxlbWVudDogZWxlbWVudCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKTtcbiAgICAgICAgY29uc3QgcHJvdG9TdHIgPSBwcm90by5jb25zdHJ1Y3Rvci50b1N0cmluZygpO1xuICAgICAgICBsZXQgc3RyID0gcHJvdG9TdHIuc3Vic3RyaW5nKDYsIHByb3RvU3RyLmluZGV4T2YoJ3snKSAtIDEpO1xuXG4gICAgICAgIGxldCB0YWcgPSB0aGlzLl9odG1sRWxlbWVudD8udGFnTmFtZTtcbiAgICAgICAgbGV0IGlkID0gdGhpcy5pZCgpO1xuICAgICAgICBsZXQgY2xhc3NMaXN0ID0gdGhpcy5faHRtbEVsZW1lbnQ/LmNsYXNzTGlzdDtcbiAgICAgICAgaWYgKGFueVRydXRoeShbaWQsIGNsYXNzTGlzdCwgdGFnXSkpIHtcbiAgICAgICAgICAgIHN0ciArPSBgIChgO1xuICAgICAgICAgICAgaWYgKHRhZykge1xuICAgICAgICAgICAgICAgIHN0ciArPSBgPCR7dGFnLnRvTG93ZXJDYXNlKCl9PmBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZCkge1xuICAgICAgICAgICAgICAgIHN0ciArPSBgIyR7aWR9YFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNsYXNzTGlzdCkge1xuICAgICAgICAgICAgICAgIHN0ciArPSBgLiR7Y2xhc3NMaXN0fWBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ciArPSBgKWA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0clxuICAgIH1cblxuICAgIC8qKlNldHMgYHRoaXMuX2h0bWxFbGVtZW50YCB0byBgbmV3SHRtbEVsZW1lbnQuX2h0bWxFbGVtZW50YC5cbiAgICAgKiBSZXNldHMgYHRoaXMuX2NhY2hlZENoaWxkcmVuYCBhbmQgY2FjaGVzIGBuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW5gLlxuICAgICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIGZyb20gYG5ld0h0bWxFbGVtZW50Ll9saXN0ZW5lcnNgLCB3aGlsZSBrZWVwaW5nIGB0aGlzLl9saXN0ZW5lcnNgLiovXG4gICAgd3JhcFNvbWV0aGluZ0Vsc2U8VCBleHRlbmRzIEhUTUxFbGVtZW50PihuZXdIdG1sRWxlbWVudDogQmV0dGVySFRNTEVsZW1lbnQ8VD4pOiB0aGlzXG4gICAgLyoqU2V0cyBgdGhpcy5faHRtbEVsZW1lbnRgIHRvIGBuZXdIdG1sRWxlbWVudGAuXG4gICAgICogS2VlcHMgYHRoaXMuX2xpc3RlbmVyc2AuXG4gICAgICogTk9URTogdGhpcyByZWluaXRpYWxpemVzIGB0aGlzLl9jYWNoZWRDaGlsZHJlbmAgYW5kIGFsbCBldmVudCBsaXN0ZW5lcnMgYmVsb25naW5nIHRvIGBuZXdIdG1sRWxlbWVudGAgYXJlIGxvc3QuIFBhc3MgYSBgQmV0dGVySFRNTEVsZW1lbnRgIHRvIGtlZXAgdGhlbS4qL1xuICAgIHdyYXBTb21ldGhpbmdFbHNlKG5ld0h0bWxFbGVtZW50OiBOb2RlKTogdGhpc1xuICAgIHdyYXBTb21ldGhpbmdFbHNlKG5ld0h0bWxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX2NhY2hlZENoaWxkcmVuID0ge307XG4gICAgICAgIGlmIChuZXdIdG1sRWxlbWVudCBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5yZXBsYWNlV2l0aChuZXdIdG1sRWxlbWVudC5lKTtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50ID0gbmV3SHRtbEVsZW1lbnQuZTtcbiAgICAgICAgICAgIGZvciAobGV0IFtfa2V5LCBfY2FjaGVkQ2hpbGRdIG9mIGVudW1lcmF0ZShuZXdIdG1sRWxlbWVudC5fY2FjaGVkQ2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoX2tleSwgX2NhY2hlZENoaWxkKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuX2NhY2hlZENoaWxkcmVuKS5sZW5ndGhcbiAgICAgICAgICAgICAgICAhPT0gT2JqZWN0LmtleXMobmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuKS5sZW5ndGhcbiAgICAgICAgICAgICAgICB8fFxuICAgICAgICAgICAgICAgIE9iamVjdC52YWx1ZXModGhpcy5fY2FjaGVkQ2hpbGRyZW4pLmZpbHRlcih2ID0+IHYgIT09IHVuZGVmaW5lZCkubGVuZ3RoXG4gICAgICAgICAgICAgICAgIT09IE9iamVjdC52YWx1ZXMobmV3SHRtbEVsZW1lbnQuX2NhY2hlZENoaWxkcmVuKS5maWx0ZXIodiA9PiB2ICE9PSB1bmRlZmluZWQpLmxlbmd0aFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGB3cmFwU29tZXRoaW5nRWxzZSB0aGlzLl9jYWNoZWRDaGlsZHJlbiBsZW5ndGggIT09IG5ld0h0bWxFbGVtZW50Ll9jYWNoZWRDaGlsZHJlbi5sZW5ndGhgLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzOiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3SHRtbEVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub24oeyAuLi50aGlzLl9saXN0ZW5lcnMsIC4uLm5ld0h0bWxFbGVtZW50Ll9saXN0ZW5lcnMsIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm8gd2F5IHRvIGdldCBuZXdIdG1sRWxlbWVudCBldmVudCBsaXN0ZW5lcnMgYmVzaWRlcyBoYWNraW5nIEVsZW1lbnQucHJvdG90eXBlXG4gICAgICAgICAgICB0aGlzLm9uKHRoaXMuX2xpc3RlbmVycyk7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5yZXBsYWNlV2l0aChuZXdIdG1sRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudCA9IG5ld0h0bWxFbGVtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gKioqIEJhc2ljXG4gICAgLyoqU2V0IHRoZSBlbGVtZW50J3MgaW5uZXJIVE1MKi9cbiAgICBodG1sKGh0bWw6IHN0cmluZyk6IHRoaXM7XG4gICAgLyoqR2V0IHRoZSBlbGVtZW50J3MgaW5uZXJIVE1MKi9cbiAgICBodG1sKCk6IHN0cmluZztcbiAgICBodG1sKGh0bWw/KSB7XG4gICAgICAgIGlmIChodG1sID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9odG1sRWxlbWVudC5pbm5lckhUTUw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipTZXQgdGhlIGVsZW1lbnQncyBpbm5lclRleHQqL1xuICAgIHRleHQodHh0OiBzdHJpbmcgfCBudW1iZXIpOiB0aGlzO1xuICAgIC8qKkdldCB0aGUgZWxlbWVudCdzIGlubmVyVGV4dCovXG4gICAgdGV4dCgpOiBzdHJpbmc7XG4gICAgdGV4dCh0eHQ/KSB7XG4gICAgICAgIGlmICh0eHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50LmlubmVyVGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmlubmVyVGV4dCA9IHR4dDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipTZXQgdGhlIGlkIG9mIHRoZSBlbGVtZW50Ki9cbiAgICBpZChpZDogc3RyaW5nKTogdGhpcztcbiAgICAvKipHZXQgdGhlIGlkIG9mIHRoZSBlbGVtZW50Ki9cbiAgICBpZCgpOiBzdHJpbmc7XG4gICAgaWQoaWQ/KSB7XG4gICAgICAgIGlmIChpZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQ/LmlkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuaWQgPSBpZDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqRm9yIGVhY2ggYHs8c3R5bGVBdHRyPjogPHN0eWxlVmFsPn1gIHBhaXIsIHNldCB0aGUgYHN0eWxlW3N0eWxlQXR0cl1gIHRvIGBzdHlsZVZhbGAuKi9cbiAgICBjc3MoY3NzOiBQYXJ0aWFsPENzc09wdGlvbnM+KTogdGhpc1xuICAgIC8qKkdldCBgc3R5bGVbY3NzXWAqL1xuICAgIGNzcyhjc3M6IHN0cmluZyk6IHN0cmluZ1xuICAgIGNzcyhjc3MpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjc3MgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQuc3R5bGVbY3NzXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAobGV0IFtzdHlsZUF0dHIsIHN0eWxlVmFsXSBvZiBlbnVtZXJhdGUoY3NzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnN0eWxlWzxzdHJpbmc+c3R5bGVBdHRyXSA9IHN0eWxlVmFsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipSZW1vdmUgdGhlIHZhbHVlIG9mIHRoZSBwYXNzZWQgc3R5bGUgcHJvcGVydGllcyovXG4gICAgdW5jc3MoLi4ucmVtb3ZlUHJvcHM6IChrZXlvZiBDc3NPcHRpb25zKVtdKTogdGhpcyB7XG4gICAgICAgIGxldCBjc3MgPSB7fTtcbiAgICAgICAgZm9yIChsZXQgcHJvcCBvZiByZW1vdmVQcm9wcykge1xuICAgICAgICAgICAgY3NzW3Byb3BdID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY3NzKGNzcyk7XG4gICAgfVxuXG5cbiAgICAvLyAqKiogQ2xhc3Nlc1xuICAgIC8qKmAuY2xhc3NOYW1lID0gY2xzYCovXG4gICAgY2xhc3MoY2xzOiBzdHJpbmcpOiB0aGlzO1xuICAgIC8qKlJldHVybiB0aGUgZmlyc3QgY2xhc3MgdGhhdCBtYXRjaGVzIGBjbHNgIHByZWRpY2F0ZS4qL1xuICAgIGNsYXNzKGNsczogUmV0dXJuczxib29sZWFuPik6IHN0cmluZztcbiAgICAvKipSZXR1cm4gYSBzdHJpbmcgYXJyYXkgb2YgdGhlIGVsZW1lbnQncyBjbGFzc2VzIChub3QgYSBjbGFzc0xpc3QpKi9cbiAgICBjbGFzcygpOiBzdHJpbmdbXTtcbiAgICBjbGFzcyhjbHM/KSB7XG4gICAgICAgIGlmIChjbHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5faHRtbEVsZW1lbnQuY2xhc3NMaXN0KTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uKGNscykpIHtcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX2h0bWxFbGVtZW50LmNsYXNzTGlzdCkuZmluZChjbHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzU3ZnKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIC8vIG5vaW5zcGVjdGlvbiBKU0NvbnN0YW50UmVhc3NpZ25tZW50XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuY2xhc3NMaXN0ID0gW2Nsc107XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmNsYXNzTmFtZSA9IGNscztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkQ2xhc3MoY2xzOiBzdHJpbmcsIC4uLmNsc2VzOiBzdHJpbmdbXSk6IHRoaXMge1xuICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5jbGFzc0xpc3QuYWRkKGNscyk7XG4gICAgICAgIGZvciAobGV0IGMgb2YgY2xzZXMpIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmNsYXNzTGlzdC5hZGQoYyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2xhc3MoY2xzOiBSZXR1cm5zPGJvb2xlYW4+LCAuLi5jbHNlczogUmV0dXJuczxib29sZWFuPltdKTogdGhpcztcbiAgICByZW1vdmVDbGFzcyhjbHM6IHN0cmluZywgY2xzZXM/OiBzdHJpbmdbXSk6IHRoaXM7XG4gICAgcmVtb3ZlQ2xhc3MoY2xzLCAuLi5jbHNlcykge1xuICAgICAgICBpZiAoaXNGdW5jdGlvbjxSZXR1cm5zPGJvb2xlYW4+PihjbHMpKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3MoY2xzKSk7XG4gICAgICAgICAgICBmb3IgKGxldCBjIG9mIDxSZXR1cm5zPGJvb2xlYW4+W10+Y2xzZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY2xhc3MoYykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbHMpO1xuICAgICAgICAgICAgZm9yIChsZXQgYyBvZiBjbHNlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVwbGFjZUNsYXNzKG9sZFRva2VuOiBSZXR1cm5zPGJvb2xlYW4+LCBuZXdUb2tlbjogc3RyaW5nKTogdGhpcztcbiAgICByZXBsYWNlQ2xhc3Mob2xkVG9rZW46IHN0cmluZywgbmV3VG9rZW46IHN0cmluZyk6IHRoaXNcbiAgICByZXBsYWNlQ2xhc3Mob2xkVG9rZW4sIG5ld1Rva2VuKSB7XG4gICAgICAgIGlmIChpc0Z1bmN0aW9uPFJldHVybnM8Ym9vbGVhbj4+KG9sZFRva2VuKSkge1xuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuY2xhc3NMaXN0LnJlcGxhY2UodGhpcy5jbGFzcyhvbGRUb2tlbiksIG5ld1Rva2VuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmNsYXNzTGlzdC5yZXBsYWNlKG9sZFRva2VuLCBuZXdUb2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9nZ2xlQ2xhc3MoY2xzOiBSZXR1cm5zPGJvb2xlYW4+LCBmb3JjZT86IGJvb2xlYW4pOiB0aGlzXG4gICAgdG9nZ2xlQ2xhc3MoY2xzOiBzdHJpbmcsIGZvcmNlPzogYm9vbGVhbik6IHRoaXNcbiAgICB0b2dnbGVDbGFzcyhjbHMsIGZvcmNlKSB7XG4gICAgICAgIGlmIChpc0Z1bmN0aW9uPFJldHVybnM8Ym9vbGVhbj4+KGNscykpIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUodGhpcy5jbGFzcyhjbHMpLCBmb3JjZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKGNscywgZm9yY2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlJldHVybnMgYHRoaXMuX2h0bWxFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjbHMpYCAqL1xuICAgIGhhc0NsYXNzKGNsczogc3RyaW5nKTogYm9vbGVhblxuICAgIC8qKlJldHVybnMgd2hldGhlciBgdGhpc2AgaGFzIGEgY2xhc3MgdGhhdCBtYXRjaGVzIHBhc3NlZCBmdW5jdGlvbiAqL1xuICAgIGhhc0NsYXNzKGNsczogUmV0dXJuczxib29sZWFuPik6IGJvb2xlYW5cbiAgICBoYXNDbGFzcyhjbHMpIHtcbiAgICAgICAgaWYgKGlzRnVuY3Rpb24oY2xzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xhc3MoY2xzKSAhPT0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjbHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gKioqIE5vZGVzXG4gICAgLyoqSW5zZXJ0IGF0IGxlYXN0IG9uZSBgbm9kZWAganVzdCBhZnRlciBgdGhpc2AuIEFueSBgbm9kZWAgY2FuIGJlIGVpdGhlciBgQmV0dGVySFRNTEVsZW1lbnRgcyBvciB2YW5pbGxhIGBOb2RlYC4qL1xuICAgIGFmdGVyKC4uLm5vZGVzOiBBcnJheTxCZXR0ZXJIVE1MRWxlbWVudCB8IE5vZGU+KTogdGhpcyB7XG4gICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5hZnRlcihub2RlLmUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5hZnRlcihub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipJbnNlcnQgYHRoaXNgIGp1c3QgYWZ0ZXIgYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9yIGEgdmFuaWxsYSBgTm9kZWAuKi9cbiAgICBpbnNlcnRBZnRlcihub2RlOiBCZXR0ZXJIVE1MRWxlbWVudCB8IEhUTUxFbGVtZW50KTogdGhpcyB7XG4gICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIG5vZGUuX2h0bWxFbGVtZW50LmFmdGVyKHRoaXMuX2h0bWxFbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUuYWZ0ZXIodGhpcy5faHRtbEVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKkluc2VydCBhdCBsZWFzdCBvbmUgYG5vZGVgIGFmdGVyIHRoZSBsYXN0IGNoaWxkIG9mIGB0aGlzYC5cbiAgICAgKiBBbnkgYG5vZGVgIGNhbiBiZSBlaXRoZXIgYSBgQmV0dGVySFRNTEVsZW1lbnRgLCBhIHZhbmlsbGEgYE5vZGVgLFxuICAgICAqIGEgYHtzb21lS2V5OiBCZXR0ZXJIVE1MRWxlbWVudH1gIHBhaXJzIG9iamVjdCwgb3IgYSBgW3NvbWVLZXksIEJldHRlckhUTUxFbGVtZW50XWAgdHVwbGUuKi9cbiAgICBhcHBlbmQoLi4ubm9kZXM6IEFycmF5PEJldHRlckhUTUxFbGVtZW50IHwgTm9kZSB8IFRNYXA8QmV0dGVySFRNTEVsZW1lbnQ+IHwgW3N0cmluZywgQmV0dGVySFRNTEVsZW1lbnRdPik6IHRoaXMge1xuICAgICAgICBmb3IgKGxldCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEJldHRlckhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuYXBwZW5kKG5vZGUuZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5hcHBlbmQobm9kZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVBcHBlbmQoW25vZGVdKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVBcHBlbmQobm9kZSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxuICAgIC8qKkFwcGVuZCBgdGhpc2AgdG8gYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9yIGEgdmFuaWxsYSBgTm9kZWAqL1xuICAgIGFwcGVuZFRvKG5vZGU6IEJldHRlckhUTUxFbGVtZW50IHwgSFRNTEVsZW1lbnQpOiB0aGlzIHtcbiAgICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgbm9kZS5faHRtbEVsZW1lbnQuYXBwZW5kKHRoaXMuX2h0bWxFbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUuYXBwZW5kKHRoaXMuX2h0bWxFbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKkluc2VydCBhdCBsZWFzdCBvbmUgYG5vZGVgIGp1c3QgYmVmb3JlIGB0aGlzYC4gQW55IGBub2RlYCBjYW4gYmUgZWl0aGVyIGBCZXR0ZXJIVE1MRWxlbWVudGBzIG9yIHZhbmlsbGEgYE5vZGVgLiovXG4gICAgYmVmb3JlKC4uLm5vZGVzOiBBcnJheTxCZXR0ZXJIVE1MRWxlbWVudCB8IE5vZGU+KTogdGhpcyB7XG4gICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgQmV0dGVySFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5iZWZvcmUobm9kZS5lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuYmVmb3JlKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKkluc2VydCBgdGhpc2AganVzdCBiZWZvcmUgYSBgQmV0dGVySFRNTEVsZW1lbnRgIG9yIGEgdmFuaWxsYSBgTm9kZWBzLiovXG4gICAgaW5zZXJ0QmVmb3JlKG5vZGU6IEJldHRlckhUTUxFbGVtZW50IHwgSFRNTEVsZW1lbnQpOiB0aGlzIHtcbiAgICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgbm9kZS5faHRtbEVsZW1lbnQuYmVmb3JlKHRoaXMuX2h0bWxFbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUuYmVmb3JlKHRoaXMuX2h0bWxFbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZXBsYWNlQ2hpbGQobmV3Q2hpbGQ6IE5vZGUsIG9sZENoaWxkOiBOb2RlKTogdGhpcztcbiAgICByZXBsYWNlQ2hpbGQobmV3Q2hpbGQ6IEJldHRlckhUTUxFbGVtZW50LCBvbGRDaGlsZDogQmV0dGVySFRNTEVsZW1lbnQpOiB0aGlzO1xuICAgIHJlcGxhY2VDaGlsZChuZXdDaGlsZCwgb2xkQ2hpbGQpIHtcbiAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQucmVwbGFjZUNoaWxkKG5ld0NoaWxkLCBvbGRDaGlsZCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuXG4gICAgLyoqRm9yIGVhY2ggYFtrZXksIGNoaWxkXWAgcGFpciwgYGFwcGVuZChjaGlsZClgIGFuZCBzdG9yZSBpdCBpbiBgdGhpc1trZXldYC4gKi9cbiAgICBjYWNoZUFwcGVuZChrZXlDaGlsZFBhaXJzOiBUTWFwPEJldHRlckhUTUxFbGVtZW50Pik6IHRoaXNcblxuICAgIC8qKkZvciBlYWNoIGBba2V5LCBjaGlsZF1gIHR1cGxlLCBgYXBwZW5kKGNoaWxkKWAgYW5kIHN0b3JlIGl0IGluIGB0aGlzW2tleV1gLiAqL1xuICAgIGNhY2hlQXBwZW5kKGtleUNoaWxkUGFpcnM6IFtzdHJpbmcsIEJldHRlckhUTUxFbGVtZW50XVtdKTogdGhpc1xuXG4gICAgY2FjaGVBcHBlbmQoa2V5Q2hpbGRQYWlycykge1xuICAgICAgICBjb25zdCBfY2FjaGVBcHBlbmQgPSAoX2tleTogc3RyaW5nLCBfY2hpbGQ6IEJldHRlckhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFwcGVuZChfY2hpbGQpO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGUoX2tleSwgX2NoaWxkKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoa2V5Q2hpbGRQYWlycykpIHtcbiAgICAgICAgICAgIGZvciAobGV0IFtrZXksIGNoaWxkXSBvZiBrZXlDaGlsZFBhaXJzKSB7XG4gICAgICAgICAgICAgICAgX2NhY2hlQXBwZW5kKGtleSwgY2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgW2tleSwgY2hpbGRdIG9mIGVudW1lcmF0ZShrZXlDaGlsZFBhaXJzKSkge1xuICAgICAgICAgICAgICAgIF9jYWNoZUFwcGVuZChrZXksIGNoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBfY2xzKCkge1xuICAgICAgICByZXR1cm4gQmV0dGVySFRNTEVsZW1lbnRcbiAgICB9XG5cbiAgICBjaGlsZChzZWxlY3RvcjogXCJpbWdcIik6IEltZztcblxuICAgIGNoaWxkKHNlbGVjdG9yOiBcImFcIik6IEFuY2hvcjtcblxuICAgIGNoaWxkPFRJbnB1dFR5cGUgZXh0ZW5kcyBJbnB1dFR5cGUgPSBJbnB1dFR5cGU+KHNlbGVjdG9yOiBcImlucHV0XCIpOiBJbnB1dDxUSW5wdXRUeXBlLCBIVE1MSW5wdXRFbGVtZW50PjtcbiAgICBjaGlsZChzZWxlY3RvcjogXCJzZWxlY3RcIik6IElucHV0PHVuZGVmaW5lZCwgSFRNTFNlbGVjdEVsZW1lbnQ+O1xuXG4gICAgY2hpbGQoc2VsZWN0b3I6IFwicFwiKTogUGFyYWdyYXBoO1xuXG4gICAgY2hpbGQoc2VsZWN0b3I6IFwic3BhblwiKTogU3BhbjtcblxuICAgIGNoaWxkKHNlbGVjdG9yOiBcImJ1dHRvblwiKTogQnV0dG9uO1xuXG4gICAgY2hpbGQoc2VsZWN0b3I6IFwiZGl2XCIpOiBEaXY7XG5cbiAgICBjaGlsZDxUIGV4dGVuZHMgVGFnPihzZWxlY3RvcjogVCk6IEJldHRlckhUTUxFbGVtZW50PEhUTUxFbGVtZW50VGFnTmFtZU1hcFtUXT47XG5cbiAgICBjaGlsZChzZWxlY3Rvcjogc3RyaW5nKTogQmV0dGVySFRNTEVsZW1lbnQ7XG5cbiAgICBjaGlsZDxUIGV4dGVuZHMgdHlwZW9mIEJldHRlckhUTUxFbGVtZW50PihzZWxlY3Rvcjogc3RyaW5nLCBiaGVDbHM6IFQpOiBUO1xuXG4gICAgY2hpbGQoc2VsZWN0b3IsIGJoZUNscz8pIHtcbiAgICAgICAgY29uc3QgaHRtbEVsZW1lbnQgPSB0aGlzLl9odG1sRWxlbWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgaWYgKGh0bWxFbGVtZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7dGhpc30uY2hpbGQoJHtzZWxlY3Rvcn0pOiBubyBjaGlsZC4gcmV0dXJuaW5nIHVuZGVmaW5lZGApO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYmhlO1xuICAgICAgICBpZiAoYmhlQ2xzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGJoZSA9IHRoaXMuX2NscygpLndyYXBXaXRoQkhFKGh0bWxFbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJoZSA9IG5ldyBiaGVDbHMoeyBodG1sRWxlbWVudCB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmhlO1xuICAgIH1cblxuICAgIC8qKlJldHVybiBhIGBCZXR0ZXJIVE1MRWxlbWVudGAgbGlzdCBvZiBhbGwgY2hpbGRyZW4gKi9cbiAgICBjaGlsZHJlbigpOiBCZXR0ZXJIVE1MRWxlbWVudFtdO1xuXG4gICAgLyoqUmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBsaXN0IG9mIGFsbCBjaGlsZHJlbiBzZWxlY3RlZCBieSBgc2VsZWN0b3JgICovXG4gICAgY2hpbGRyZW48SyBleHRlbmRzIFRhZz4oc2VsZWN0b3I6IEspOiBCZXR0ZXJIVE1MRWxlbWVudFtdO1xuXG4gICAgLyoqUmV0dXJuIGEgYEJldHRlckhUTUxFbGVtZW50YCBsaXN0IG9mIGFsbCBjaGlsZHJlbiBzZWxlY3RlZCBieSBgc2VsZWN0b3JgICovXG4gICAgY2hpbGRyZW4oc2VsZWN0b3I6IFF1ZXJ5U2VsZWN0b3IpOiBCZXR0ZXJIVE1MRWxlbWVudFtdO1xuXG4gICAgY2hpbGRyZW4oc2VsZWN0b3I/KSB7XG4gICAgICAgIGxldCBjaGlsZHJlblZhbmlsbGE7XG4gICAgICAgIGxldCBjaGlsZHJlbkNvbGxlY3Rpb247XG4gICAgICAgIGlmIChzZWxlY3RvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjaGlsZHJlbkNvbGxlY3Rpb24gPSB0aGlzLl9odG1sRWxlbWVudC5jaGlsZHJlbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoaWxkcmVuQ29sbGVjdGlvbiA9IHRoaXMuX2h0bWxFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hpbGRyZW5WYW5pbGxhID0gQXJyYXkuZnJvbShjaGlsZHJlbkNvbGxlY3Rpb24pO1xuXG4gICAgICAgIHJldHVybiBjaGlsZHJlblZhbmlsbGEubWFwKHRoaXMuX2NscygpLndyYXBXaXRoQkhFKTtcbiAgICB9XG5cbiAgICBjbG9uZShkZWVwPzogYm9vbGVhbik6IEJldHRlckhUTUxFbGVtZW50IHtcbiAgICAgICAgY29uc29sZS53YXJuKGAke3RoaXN9LmNsb25lKCkgZG9lc250IHJldHVybiBhIG1hdGNoaW5nIEJIRSBzdWJ0eXBlLCBidXQgYSByZWd1bGFyIEJIRWApO1xuICAgICAgICAvLyBUT0RPOiByZXR1cm4gbmV3IHRoaXMoKT9cbiAgICAgICAgcmV0dXJuIG5ldyBCZXR0ZXJIVE1MRWxlbWVudCh7IGh0bWxFbGVtZW50OiB0aGlzLl9odG1sRWxlbWVudC5jbG9uZU5vZGUoZGVlcCkgYXMgSFRNTEVsZW1lbnQgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RvcmVzIGNoaWxkIEJIRSdzIGluIGB0aGlzYCBzbyB0aGV5IGNhbiBiZSBhY2Nlc3NlZCBlLmcuIGBuYXZiYXIuaG9tZS5jbGFzcygnc2VsZWN0ZWQnKWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBuYXZiYXIuY2FjaGVDaGlsZHJlbih7ICdob21lJzogJ2J1dHRvbi5ob21lJyB9KVxuICAgICAqIC8vIG9yXG4gICAgICogbWFpbmRpdi5jYWNoZUNoaWxkcmVuKHsgJ3dlbGNvbWUnOiBwYXJhZ3JhcGgoeyAncXVlcnknOiAncC53ZWxjb21lJyB9KSB9KVxuICAgICAqIC8vIGBjaGlsZHJlbk9iamAgY2FuIGJlIHJlY3Vyc2l2ZSBhbmQgbWl4ZWQsIGUuZy5cbiAgICAgKiBuYXZiYXIuY2FjaGVDaGlsZHJlbih7XG4gICAgICogICAgICBob21lOiB7XG4gICAgICogICAgICAgICAgJ2xpLm5hdmJhci1pdGVtLWhvbWUnOiB7XG4gICAgICogICAgICAgICAgICAgIHRodW1ibmFpbDogJ2ltZy5ob21lLXRodW1ibmFpbCcsXG4gICAgICogICAgICAgICAgICAgIGV4cGFuZDogYnV0dG9uKHsgYnlpZDogJ2hvbWVfZXhwYW5kJyB9KVxuICAgICAqICAgICAgICAgIH1cbiAgICAgKiAgICAgIH1cbiAgICAgKiAgfSk7XG4gICAgICogbmF2YmFyLmhvbWUuY2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgKiBuYXZiYXIuaG9tZS50aHVtYm5haWwuY3NzKC4uLik7XG4gICAgICogbmF2YmFyLmhvbWUuZXhwYW5kLmNsaWNrKCBlID0+IHsuLi59IClcbiAgICAgKiBAc2VlIHRoaXMuY2hpbGQqL1xuICAgIGNhY2hlQ2hpbGRyZW4oY2hpbGRyZW5PYmo6IENoaWxkcmVuT2JqKTogdGhpcyB7XG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiBlbnVtZXJhdGUoY2hpbGRyZW5PYmopKSB7XG4gICAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgICAgICAgICAgIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBCZXR0ZXJIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB7IFwibXlpbWdcIjogaW1nKC4uLikgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZShrZXksIHZhbHVlKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHsgXCJteWRpdlwiOiB7IFwibXlpbWdcIjogaW1nKC4uLiksIFwibXlpbnB1dFwiOiBpbnB1dCguLi4pIH0gfVxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudHJpZXNbMV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBjYWNoZUNoaWxkcmVuKCkgcmVjZWl2ZWQgcmVjdXJzaXZlIG9iaiB3aXRoIG1vcmUgdGhhbiAxIHNlbGVjdG9yIGZvciBhIGtleS4gVXNpbmcgb25seSAwdGggc2VsZWN0b3JgLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtdWx0aXBsZSBzZWxlY3RvcnNcIjogZW50cmllcy5tYXAoZSA9PiBlWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXM6IHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxldCBbc2VsZWN0b3IsIG9ial0gPSBlbnRyaWVzWzBdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNGdW5jdGlvbihvYmopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBiaGUgY29uc3RydWN0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBiaGUgPSB0aGlzLmNoaWxkKHNlbGVjdG9yLCBvYmopO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoa2V5LCBiaGUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoa2V5LCB0aGlzLmNoaWxkKHNlbGVjdG9yKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzW2tleV0uY2FjaGVDaGlsZHJlbihvYmopO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgbGV0IG1hdGNoID0gLzwoXFx3Kyk+JC8uZXhlYyh2YWx1ZSBhcyBzdHJpbmcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHsgXCJvcHRpb25zXCI6IFwiPG9wdGlvbj5cIiB9XG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWdOYW1lID0gbWF0Y2hbMV0gYXMgVGFnO1xuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxFbGVtZW50cyA9IFsuLi50aGlzLl9odG1sRWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWdOYW1lKV0gYXMgSFRNTEVsZW1lbnRUYWdOYW1lTWFwW3R5cGVvZiB0YWdOYW1lXVtdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgYmhlcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBodG1sRWxlbWVudCBvZiBodG1sRWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJoZXMucHVzaCh0aGlzLl9jbHMoKS53cmFwV2l0aEJIRShodG1sRWxlbWVudCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlKGtleSwgYmhlcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8geyBcIm15aW5wdXRcIjogXCJpbnB1dFt0eXBlPWNoZWNrYm94XVwiIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGUoa2V5LCB0aGlzLmNoaWxkKHZhbHVlIGFzIFRhZ09yU3RyaW5nKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYGNhY2hlQ2hpbGRyZW4sIGJhZCB2YWx1ZSB0eXBlOiBcIiR7dHlwZX1cIi4ga2V5OiBcIiR7a2V5fVwiLCB2YWx1ZTogXCIke3ZhbHVlfVwiLiBjaGlsZHJlbk9iajpgLCBjaGlsZHJlbk9iaiwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqUmVtb3ZlIGFsbCBjaGlsZHJlbiBmcm9tIERPTSovXG4gICAgZW1wdHkoKTogdGhpcyB7XG4gICAgICAgIHdoaWxlICh0aGlzLl9odG1sRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLl9odG1sRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipSZW1vdmUgZWxlbWVudCBmcm9tIERPTSovXG4gICAgcmVtb3ZlKCk6IHRoaXMge1xuICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cbiAgICAvLyAqKiogRXZlbnRzXG4gICAgb24oZXZUeXBlRm5QYWlyczogVE1hcDxFdmVudE5hbWUyRnVuY3Rpb24+LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgLy8gY29uc3QgZm9vID0gZXZUeXBlRm5QYWlyc1tcImFib3J0XCJdO1xuICAgICAgICBmb3IgKGxldCBbZXZUeXBlLCBldkZuXSBvZiBlbnVtZXJhdGUoZXZUeXBlRm5QYWlycykpIHtcbiAgICAgICAgICAgIGNvbnN0IF9mID0gZnVuY3Rpb24gX2YoZXZ0KSB7XG4gICAgICAgICAgICAgICAgZXZGbihldnQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZUeXBlLCBfZiwgb3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnNbZXZUeXBlXSA9IF9mO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qXG4gICAgQ2hyb25vbG9neTpcblx0bW91c2Vkb3duICAgdG91Y2hzdGFydFx0cG9pbnRlcmRvd25cblx0bW91c2VlbnRlclx0XHQgICAgICAgIHBvaW50ZXJlbnRlclxuXHRtb3VzZWxlYXZlXHRcdCAgICAgICAgcG9pbnRlcmxlYXZlXG5cdG1vdXNlbW92ZVx0dG91Y2htb3ZlXHRwb2ludGVybW92ZVxuXHRtb3VzZW91dFx0XHQgICAgICAgIHBvaW50ZXJvdXRcblx0bW91c2VvdmVyXHRcdCAgICAgICAgcG9pbnRlcm92ZXJcblx0bW91c2V1cFx0ICAgIHRvdWNoZW5kICAgIHBvaW50ZXJ1cFxuXHQqL1xuICAgIC8qKiBBZGQgYSBgdG91Y2hzdGFydGAgZXZlbnQgbGlzdGVuZXIuIFRoaXMgaXMgdGhlIGZhc3QgYWx0ZXJuYXRpdmUgdG8gYGNsaWNrYCBsaXN0ZW5lcnMgZm9yIG1vYmlsZSAobm8gMzAwbXMgd2FpdCkuICovXG4gICAgdG91Y2hzdGFydChmbjogKGV2OiBUb3VjaEV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24gX2YoZXY6IFRvdWNoRXZlbnQpIHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7IC8vIG90aGVyd2lzZSBcInRvdWNobW92ZVwiIGlzIHRyaWdnZXJlZFxuICAgICAgICAgICAgZm4oZXYpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5vbmNlKSAvLyBUT0RPOiBtYXliZSBuYXRpdmUgb3B0aW9ucy5vbmNlIGlzIGVub3VnaFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIF9mKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICAgIC8vIFRPRE86IHRoaXMuX2xpc3RlbmVycywgb3IgdXNlIHRoaXMub24oXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKiBBZGQgYSBgcG9pbnRlcmRvd25gIGV2ZW50IGxpc3RlbmVyIGlmIGJyb3dzZXIgc3VwcG9ydHMgYHBvaW50ZXJkb3duYCwgZWxzZSBzZW5kIGBtb3VzZWRvd25gIChzYWZhcmkpLiAqL1xuICAgIHBvaW50ZXJkb3duKGZuOiAoZXZlbnQ6IFBvaW50ZXJFdmVudCB8IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG5cbiAgICAgICAgbGV0IGFjdGlvbjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIFBvaW50ZXJFdmVudCBleGlzdHMgaW5zdGVhZCBvZiB0cnkvY2F0Y2hcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGFjdGlvbiA9IHdpbmRvdy5Qb2ludGVyRXZlbnQgPyAncG9pbnRlcmRvd24nIDogJ21vdXNlZG93bic7IC8vIHNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgcG9pbnRlcmRvd25cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgYWN0aW9uID0gJ21vdXNlZG93bidcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBfZiA9IGZ1bmN0aW9uIF9mKGV2OiBQb2ludGVyRXZlbnQgfCBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZm4oZXYpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5vbmNlKSAvLyBUT0RPOiBtYXliZSBuYXRpdmUgb3B0aW9ucy5vbmNlIGlzIGVub3VnaFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihhY3Rpb24sIF9mKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihhY3Rpb24sIF9mLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzLnBvaW50ZXJkb3duID0gX2Y7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlNpbXVsYXRlIGEgY2xpY2sgb2YgdGhlIGVsZW1lbnQuIFVzZWZ1bCBmb3IgYDxhPmAgZWxlbWVudHMuKi9cbiAgICBjbGljaygpOiB0aGlzO1xuXG4gICAgLyoqQWRkIGEgYGNsaWNrYCBldmVudCBsaXN0ZW5lci4gWW91IHNob3VsZCBwcm9iYWJseSB1c2UgYHBvaW50ZXJkb3duKClgIGlmIG9uIGRlc2t0b3AsIG9yIGB0b3VjaHN0YXJ0KClgIGlmIG9uIG1vYmlsZS4qL1xuICAgIGNsaWNrKGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcblxuICAgIGNsaWNrKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKGZuID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmNsaWNrKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgY2xpY2s6IGZuIH0sIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqQmx1ciAodW5mb2N1cykgdGhlIGVsZW1lbnQuKi9cbiAgICBibHVyKCk6IHRoaXM7XG5cbiAgICAvKipBZGQgYSBgYmx1cmAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGJsdXIoZm46IChldmVudDogRm9jdXNFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuXG4gICAgYmx1cihmbj8sIG9wdGlvbnM/KSB7XG4gICAgICAgIGlmIChmbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgYmx1cjogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKkZvY3VzIHRoZSBlbGVtZW50LiovXG4gICAgZm9jdXMoKTogdGhpcztcblxuICAgIC8qKkFkZCBhIGBmb2N1c2AgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGZvY3VzKGZuOiAoZXZlbnQ6IEZvY3VzRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcztcblxuICAgIGZvY3VzKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgaWYgKGZuID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uKHsgZm9jdXM6IGZuIH0sIG9wdGlvbnMpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipBZGQgYSBgY2hhbmdlYCBldmVudCBsaXN0ZW5lciovXG4gICAgY2hhbmdlKGZuOiAoZXZlbnQ6IEV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXMge1xuICAgICAgICByZXR1cm4gdGhpcy5vbih7IGNoYW5nZTogZm4gfSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqQWRkIGEgYGNvbnRleHRtZW51YCBldmVudCBsaXN0ZW5lciovXG4gICAgY29udGV4dG1lbnUoZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub24oeyBjb250ZXh0bWVudTogZm4gfSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqU2ltdWxhdGUgYSBkb3VibGUgY2xpY2sgb2YgdGhlIGVsZW1lbnQuKi9cbiAgICBkYmxjbGljaygpOiB0aGlzO1xuXG4gICAgLyoqQWRkIGEgYGRibGNsaWNrYCBldmVudCBsaXN0ZW5lciovXG4gICAgZGJsY2xpY2soZm46IChldmVudDogTW91c2VFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzO1xuXG4gICAgZGJsY2xpY2soZm4/LCBvcHRpb25zPykge1xuICAgICAgICBpZiAoZm4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgZGJsY2xpY2sgPSBuZXcgTW91c2VFdmVudCgnZGJsY2xpY2snLCB7XG4gICAgICAgICAgICAgICAgJ3ZpZXcnOiB3aW5kb3csXG4gICAgICAgICAgICAgICAgJ2J1YmJsZXMnOiB0cnVlLFxuICAgICAgICAgICAgICAgICdjYW5jZWxhYmxlJzogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5kaXNwYXRjaEV2ZW50KGRibGNsaWNrKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub24oeyBkYmxjbGljazogZm4gfSwgb3B0aW9ucylcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlNpbXVsYXRlIGEgbW91c2VlbnRlciBldmVudCB0byB0aGUgZWxlbWVudC4qL1xuICAgIG1vdXNlZW50ZXIoKTogdGhpcztcblxuICAgIC8qKkFkZCBhIGBtb3VzZWVudGVyYCBldmVudCBsaXN0ZW5lciovXG4gICAgbW91c2VlbnRlcihmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnksIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyk6IHRoaXM7XG5cbiAgICBtb3VzZWVudGVyKGZuPywgb3B0aW9ucz8pIHtcbiAgICAgICAgLy8gbW91c2VvdmVyOiBhbHNvIGNoaWxkIGVsZW1lbnRzXG4gICAgICAgIC8vIG1vdXNlZW50ZXI6IG9ubHkgYm91bmQgZWxlbWVudFxuXG4gICAgICAgIGlmIChmbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBtb3VzZWVudGVyID0gbmV3IE1vdXNlRXZlbnQoJ21vdXNlZW50ZXInLCB7XG4gICAgICAgICAgICAgICAgJ3ZpZXcnOiB3aW5kb3csXG4gICAgICAgICAgICAgICAgJ2J1YmJsZXMnOiB0cnVlLFxuICAgICAgICAgICAgICAgICdjYW5jZWxhYmxlJzogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5kaXNwYXRjaEV2ZW50KG1vdXNlZW50ZXIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vbih7IG1vdXNlZW50ZXI6IGZuIH0sIG9wdGlvbnMpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipBZGQgYSBga2V5ZG93bmAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIGtleWRvd24oZm46IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gYW55LCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub24oeyBrZXlkb3duOiBmbiB9LCBvcHRpb25zKVxuICAgIH1cblxuICAgIC8qKkFkZCBhIGBtb3VzZW91dGAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIG1vdXNlb3V0KGZuOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueSwgb3B0aW9ucz86IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIC8vbW91c2VsZWF2ZSBhbmQgbW91c2VvdXQgYXJlIHNpbWlsYXIgYnV0IGRpZmZlciBpbiB0aGF0IG1vdXNlbGVhdmUgZG9lcyBub3QgYnViYmxlIGFuZCBtb3VzZW91dCBkb2VzLlxuICAgICAgICAvLyBUaGlzIG1lYW5zIHRoYXQgbW91c2VsZWF2ZSBpcyBmaXJlZCB3aGVuIHRoZSBwb2ludGVyIGhhcyBleGl0ZWQgdGhlIGVsZW1lbnQgYW5kIGFsbCBvZiBpdHMgZGVzY2VuZGFudHMsXG4gICAgICAgIC8vIHdoZXJlYXMgbW91c2VvdXQgaXMgZmlyZWQgd2hlbiB0aGUgcG9pbnRlciBsZWF2ZXMgdGhlIGVsZW1lbnQgb3IgbGVhdmVzIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRlc2NlbmRhbnRzXG4gICAgICAgIC8vIChldmVuIGlmIHRoZSBwb2ludGVyIGlzIHN0aWxsIHdpdGhpbiB0aGUgZWxlbWVudCkuXG4gICAgICAgIHJldHVybiB0aGlzLm9uKHsgbW91c2VvdXQ6IGZuIH0sIG9wdGlvbnMpXG4gICAgfVxuXG4gICAgLyoqQWRkIGEgYG1vdXNlb3ZlcmAgZXZlbnQgbGlzdGVuZXIqL1xuICAgIG1vdXNlb3ZlcihmbjogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB2b2lkLCBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgLy8gbW91c2VvdmVyOiBhbHNvIGNoaWxkIGVsZW1lbnRzXG4gICAgICAgIC8vIG1vdXNlZW50ZXI6IG9ubHkgYm91bmQgZWxlbWVudFxuICAgICAgICAvLyByZXR1cm4gdGhpcy5vbih7bW91c2VvdmVyOiBmbn0sIG9wdGlvbnMpXG4gICAgICAgIHJldHVybiB0aGlzLm9uKHsgbW91c2VvdmVyOiBmbiB9KVxuICAgIH1cblxuICAgIC8qKiBSZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyIG9mIGBldmVudGAsIGlmIGV4aXN0cy4qL1xuICAgIG9mZihldmVudDogRXZlbnROYW1lKTogdGhpcyB7XG4gICAgICAgIC8vIFRPRE86IFNob3VsZCByZW1vdmUgbGlzdGVuZXIgZnJvbSB0aGlzLl9saXN0ZW5lcnM/XG4gICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIHRoaXMuX2xpc3RlbmVyc1tldmVudF0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKiogUmVtb3ZlIGFsbCBldmVudCBsaXN0ZW5lcnMgaW4gYF9saXN0ZW5lcnNgKi9cbiAgICBhbGxPZmYoKTogdGhpcyB7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBPYmplY3Qua2V5cyh0aGlzLl9saXN0ZW5lcnMpLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgZXZlbnQgPSB0aGlzLl9saXN0ZW5lcnNbaV07XG4gICAgICAgICAgICB0aGlzLm9mZihldmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKiogRm9yIGVhY2ggYFthdHRyLCB2YWxdYCBwYWlyLCBhcHBseSBgc2V0QXR0cmlidXRlYCovXG4gICAgYXR0cihhdHRyVmFsUGFpcnM6IFRNYXA8c3RyaW5nIHwgYm9vbGVhbj4pOiB0aGlzXG5cbiAgICAvLyAqKiogQXR0cmlidXRlc1xuXG4gICAgLyoqIGFwcGx5IGBnZXRBdHRyaWJ1dGVgKi9cbiAgICBhdHRyKGF0dHJpYnV0ZU5hbWU6IHN0cmluZyk6IHN0cmluZ1xuXG4gICAgYXR0cihhdHRyVmFsUGFpcnMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhdHRyVmFsUGFpcnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJWYWxQYWlycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGxldCBbYXR0ciwgdmFsXSBvZiBlbnVtZXJhdGUoYXR0clZhbFBhaXJzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyLCB2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogYHJlbW92ZUF0dHJpYnV0ZWAgKi9cbiAgICByZW1vdmVBdHRyKHF1YWxpZmllZE5hbWU6IHN0cmluZywgLi4ucXVhbGlmaWVkTmFtZXM6IHN0cmluZ1tdKTogdGhpcyB7XG4gICAgICAgIGxldCBfcmVtb3ZlQXR0cmlidXRlO1xuICAgICAgICBpZiAodGhpcy5faXNTdmcpIHtcbiAgICAgICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUgPSAocXVhbGlmaWVkTmFtZSkgPT4gdGhpcy5faHRtbEVsZW1lbnQucmVtb3ZlQXR0cmlidXRlTlMoU1ZHX05TX1VSSSwgcXVhbGlmaWVkTmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfcmVtb3ZlQXR0cmlidXRlID0gKHF1YWxpZmllZE5hbWUpID0+IHRoaXMuX2h0bWxFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShxdWFsaWZpZWROYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUocXVhbGlmaWVkTmFtZSk7XG4gICAgICAgIGZvciAobGV0IHFuIG9mIHF1YWxpZmllZE5hbWVzKSB7XG4gICAgICAgICAgICBfcmVtb3ZlQXR0cmlidXRlKHFuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipgZ2V0QXR0cmlidXRlKGBkYXRhLSR7a2V5fWApYC4gSlNPTi5wYXJzZSBpdCBieSBkZWZhdWx0LiovXG4gICAgZ2V0ZGF0YShrZXk6IHN0cmluZywgcGFyc2U6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHwgVE1hcDxzdHJpbmc+IHtcbiAgICAgICAgLy8gVE9ETzoganF1ZXJ5IGRvZXNuJ3QgYWZmZWN0IGRhdGEtKiBhdHRycyBpbiBET00uIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vZGF0YS9cbiAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuX2h0bWxFbGVtZW50LmdldEF0dHJpYnV0ZShgZGF0YS0ke2tleX1gKTtcbiAgICAgICAgaWYgKHBhcnNlID09PSB0cnVlKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9jYWNoZShrZXksIGNoaWxkOiBCZXR0ZXJIVE1MRWxlbWVudCB8IEJldHRlckhUTUxFbGVtZW50W10pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgb2xkY2hpbGQgPSB0aGlzLl9jYWNoZWRDaGlsZHJlbltrZXldO1xuICAgICAgICBpZiAob2xkY2hpbGQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBPdmVyd3JpdGluZyB0aGlzLl9jYWNoZWRDaGlsZHJlblske2tleX1dIWAsIGBvbGQgY2hpbGQ6ICR7b2xkY2hpbGR9YCxcbiAgICAgICAgICAgICAgICBgbmV3IGNoaWxkOiAke2NoaWxkfWAsIGBhcmUgdGhleSBkaWZmZXJlbnQ/OiAke29sZGNoaWxkID09IGNoaWxkfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpc1trZXldID0gY2hpbGQ7XG4gICAgICAgIHRoaXMuX2NhY2hlZENoaWxkcmVuW2tleV0gPSBjaGlsZDtcbiAgICB9XG5cblxufVxuXG5leHBvcnQgY2xhc3MgRGl2PFEgZXh0ZW5kcyBRdWVyeVNlbGVjdG9yID0gUXVlcnlTZWxlY3Rvcj4gZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudDxIVE1MRGl2RWxlbWVudD4ge1xuICAgIC8qKkNyZWF0ZSBhIEhUTUxEaXZFbGVtZW50LiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgYGlkYC4gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGNscywgc2V0aWQsIHRleHQgfTogeyBjbHM/OiBzdHJpbmcsIHNldGlkPzogc3RyaW5nLCB0ZXh0Pzogc3RyaW5nIH0pO1xuICAgIC8qKkNyZWF0ZSBhIEhUTUxEaXZFbGVtZW50LiBPcHRpb25hbGx5LCBzZXQgaXRzIGBodG1sYCwgYGNsc2Agb3IgYGlkYC4gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IGNscywgc2V0aWQsIGh0bWwgfTogeyBjbHM/OiBzdHJpbmcsIHNldGlkPzogc3RyaW5nLCBodG1sPzogc3RyaW5nIH0pO1xuICAgIC8qKldyYXAgYW4gZXhpc3RpbmcgZWxlbWVudCBieSBgYnlpZGAuIE9wdGlvbmFsbHkgY2FjaGUgZXhpc3RpbmcgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBieWlkLCBjaGlsZHJlbiB9OiB7IGJ5aWQ6IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICAvKipXcmFwIGFuIGV4aXN0aW5nIGVsZW1lbnQgYnkgYHF1ZXJ5YC4gT3B0aW9uYWxseSBjYWNoZSBleGlzdGluZyBgY2hpbGRyZW5gKi9cbiAgICBjb25zdHJ1Y3Rvcih7IHF1ZXJ5LCBjaGlsZHJlbiB9OiB7IHF1ZXJ5OiBRdWVyeU9yUHJlY2lzZVRhZzxRLCBcImRpdlwiPiwgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICAvKipXcmFwIGFuIGV4aXN0aW5nIEhUTUxFbGVtZW50LiBPcHRpb25hbGx5IGNhY2hlIGV4aXN0aW5nIGBjaGlsZHJlbmAqL1xuICAgIGNvbnN0cnVjdG9yKHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH06IHsgaHRtbEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50OyBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIGNvbnN0cnVjdG9yKGRpdk9wdHMpIHtcbiAgICAgICAgY29uc3QgeyBzZXRpZCwgY2xzLCB0ZXh0LCBodG1sLCBieWlkLCBxdWVyeSwgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH0gPSBkaXZPcHRzO1xuICAgICAgICBpZiAodGV4dCAhPT0gdW5kZWZpbmVkICYmIGh0bWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE11dHVhbGx5RXhjbHVzaXZlQXJncyh7IHRleHQsIGh0bWwgfSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoaHRtbEVsZW1lbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3VwZXIoeyBodG1sRWxlbWVudCwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYnlpZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcih7IGJ5aWQsIGNoaWxkcmVuIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHF1ZXJ5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1cGVyKHsgcXVlcnksIGNoaWxkcmVuIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIoeyB0YWc6IFwiZGl2XCIsIHNldGlkLCBjbHMsIGh0bWwgfSk7XG4gICAgICAgICAgICBpZiAodGV4dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0KHRleHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFBhcmFncmFwaCBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50PEhUTUxQYXJhZ3JhcGhFbGVtZW50PiB7XG5cbiAgICBjb25zdHJ1Y3RvcihwT3B0cykge1xuICAgICAgICAvLyBpZiAobm9WYWx1ZShhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIC8vICAgICB0aHJvdyBuZXcgTm90RW5vdWdoQXJncyhbMV0sIGFyZ3VtZW50c1swXSlcbiAgICAgICAgLy8gfVxuICAgICAgICBjb25zdCB7IHNldGlkLCBjbHMsIHRleHQsIGh0bWwsIGJ5aWQsIHF1ZXJ5LCBodG1sRWxlbWVudCwgY2hpbGRyZW4gfSA9IHBPcHRzO1xuICAgICAgICBpZiAodGV4dCAhPT0gdW5kZWZpbmVkICYmIGh0bWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE11dHVhbGx5RXhjbHVzaXZlQXJncyh7IHRleHQsIGh0bWwgfSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoaHRtbEVsZW1lbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3VwZXIoeyBodG1sRWxlbWVudCwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYnlpZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcih7IGJ5aWQsIGNoaWxkcmVuIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHF1ZXJ5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1cGVyKHsgcXVlcnksIGNoaWxkcmVuIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIoeyB0YWc6IFwicFwiLCBzZXRpZCwgY2xzLCBodG1sIH0pO1xuICAgICAgICAgICAgaWYgKHRleHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMudGV4dCh0ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNwYW4gZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudDxIVE1MU3BhbkVsZW1lbnQ+IHtcblxuXG4gICAgY29uc3RydWN0b3IoeyBjbHMsIHNldGlkLCB0ZXh0IH06IHsgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZywgdGV4dD86IHN0cmluZyB9KVxuICAgIGNvbnN0cnVjdG9yKHsgY2xzLCBzZXRpZCwgaHRtbCB9OiB7IGNscz86IHN0cmluZywgc2V0aWQ/OiBzdHJpbmcsIGh0bWw/OiBzdHJpbmcgfSlcbiAgICBjb25zdHJ1Y3Rvcih7IGJ5aWQsIGNoaWxkcmVuIH06IHsgYnlpZDogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pXG4gICAgY29uc3RydWN0b3IoeyBxdWVyeSwgY2hpbGRyZW4gfToge1xuICAgICAgICBxdWVyeTogc3RyaW5nLFxuICAgICAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG4gICAgfSlcbiAgICBjb25zdHJ1Y3Rvcih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9OiB7XG4gICAgICAgIGh0bWxFbGVtZW50OiBIVE1MU3BhbkVsZW1lbnQ7XG4gICAgICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbiAgICB9KVxuICAgIGNvbnN0cnVjdG9yKHNwYW5PcHRzKSB7XG4gICAgICAgIGNvbnN0IHsgc2V0aWQsIGNscywgdGV4dCwgaHRtbCwgYnlpZCwgcXVlcnksIGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9ID0gc3Bhbk9wdHM7XG4gICAgICAgIGlmICh0ZXh0ICE9PSB1bmRlZmluZWQgJiYgaHRtbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTXV0dWFsbHlFeGNsdXNpdmVBcmdzKHsgdGV4dCwgaHRtbCB9KVxuICAgICAgICB9XG4gICAgICAgIGlmIChodG1sRWxlbWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChieWlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1cGVyKHsgYnlpZCwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocXVlcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3VwZXIoeyBxdWVyeSwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlcih7IHRhZzogXCJzcGFuXCIsIHNldGlkLCBjbHMsIGh0bWwgfSk7XG4gICAgICAgICAgICBpZiAodGV4dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0KHRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbWc8USBleHRlbmRzIFF1ZXJ5U2VsZWN0b3IgPSBRdWVyeVNlbGVjdG9yPiBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50PEhUTUxJbWFnZUVsZW1lbnQ+IHtcblxuXG4gICAgY29uc3RydWN0b3IoeyBjbHMsIHNldGlkLCBzcmMgfToge1xuICAgICAgICBjbHM/OiBzdHJpbmcsIHNldGlkPzogc3RyaW5nLFxuICAgICAgICBzcmM/OiBzdHJpbmdcbiAgICB9KTtcbiAgICBjb25zdHJ1Y3Rvcih7IGJ5aWQsIGNoaWxkcmVuIH06IHtcbiAgICAgICAgYnlpZDogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG4gICAgfSk7XG4gICAgY29uc3RydWN0b3IoeyBxdWVyeSwgY2hpbGRyZW4gfToge1xuICAgICAgICBxdWVyeTogUXVlcnlPclByZWNpc2VUYWc8USwgXCJpbWdcIj4sXG4gICAgICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbiAgICB9KTtcbiAgICBjb25zdHJ1Y3Rvcih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9OiB7XG4gICAgICAgIGh0bWxFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50O1xuICAgICAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG4gICAgfSlcbiAgICBjb25zdHJ1Y3RvcigpO1xuICAgIGNvbnN0cnVjdG9yKGltZ09wdHM/KSB7XG4gICAgICAgIGNvbnN0IHsgY2xzLCBzZXRpZCwgc3JjLCBieWlkLCBxdWVyeSwgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH0gPSBpbWdPcHRzO1xuICAgICAgICBpZiAoaHRtbEVsZW1lbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3VwZXIoeyBodG1sRWxlbWVudCwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYnlpZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcih7IGJ5aWQsIGNoaWxkcmVuIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHF1ZXJ5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1cGVyKHsgcXVlcnksIGNoaWxkcmVuIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIoeyB0YWc6IFwiaW1nXCIsIHNldGlkLCBjbHMgfSk7XG4gICAgICAgICAgICBpZiAoc3JjICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNyYyhzcmMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBzcmMoc3JjOiBzdHJpbmcpOiB0aGlzO1xuICAgIHNyYygpOiBzdHJpbmc7XG4gICAgc3JjKHNyYz8pIHtcbiAgICAgICAgaWYgKHNyYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQuc3JjXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5zcmMgPSBzcmM7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5cbmV4cG9ydCBjbGFzcyBBbmNob3IgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudDxIVE1MQW5jaG9yRWxlbWVudD4ge1xuXG5cbiAgICBjb25zdHJ1Y3Rvcih7IHNldGlkLCBjbHMsIHRleHQsIGh0bWwsIGhyZWYsIHRhcmdldCwgYnlpZCwgcXVlcnksIGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9KSB7XG4gICAgICAgIGlmICh0ZXh0ICE9PSB1bmRlZmluZWQgJiYgaHRtbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTXV0dWFsbHlFeGNsdXNpdmVBcmdzKHsgdGV4dCwgaHRtbCB9KVxuICAgICAgICB9XG4gICAgICAgIGlmIChodG1sRWxlbWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChieWlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1cGVyKHsgYnlpZCwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocXVlcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3VwZXIoeyBxdWVyeSwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlcih7IHRhZzogXCJhXCIsIHNldGlkLCBjbHMsIGh0bWwgfSk7XG4gICAgICAgICAgICBpZiAodGV4dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0KHRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhyZWYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaHJlZihocmVmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YXJnZXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0KHRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGhyZWYoKTogc3RyaW5nXG4gICAgaHJlZih2YWw6IHN0cmluZyk6IHRoaXNcbiAgICBocmVmKHZhbD8pIHtcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdocmVmJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKHsgaHJlZjogdmFsIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0YXJnZXQoKTogc3RyaW5nXG4gICAgdGFyZ2V0KHZhbDogc3RyaW5nKTogdGhpc1xuICAgIHRhcmdldCh2YWw/KSB7XG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigndGFyZ2V0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKHsgdGFyZ2V0OiB2YWwgfSlcbiAgICAgICAgfVxuICAgIH1cbn1cblxuaW50ZXJmYWNlIEZsYXNoYWJsZSB7XG4gICAgZmxhc2hCYWQoKTogUHJvbWlzZTx2b2lkPjtcblxuICAgIGZsYXNoR29vZCgpOiBQcm9taXNlPHZvaWQ+O1xufVxuXG5leHBvcnQgdHlwZSBGb3JtaXNoSFRNTEVsZW1lbnQgPSBIVE1MQnV0dG9uRWxlbWVudCB8IEhUTUxJbnB1dEVsZW1lbnQgfCBIVE1MU2VsZWN0RWxlbWVudDtcbmV4cG9ydCB0eXBlIElucHV0VHlwZSA9IFwiY2hlY2tib3hcIiB8IFwibnVtYmVyXCIgfCBcInJhZGlvXCIgfCBcInRleHRcIiB8IFwidGltZVwiIHwgXCJkYXRldGltZS1sb2NhbFwiXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBGb3JtPEdlbmVyaWMgZXh0ZW5kcyBGb3JtaXNoSFRNTEVsZW1lbnQ+XG4gICAgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudDxHZW5lcmljPiBpbXBsZW1lbnRzIEZsYXNoYWJsZSB7XG5cblxuICAgIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50LmRpc2FibGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICBCdXR0b24gPCBJbnB1dFxuICAgICBTZWxlY3QgLSBJbnB1dDogYWRkKCksIGl0ZW0oKSwgbGVuZ3RoLCBuYW1lZEl0ZW0oKSwgb3B0aW9ucywgcmVtb3ZlKCksIHNlbGVjdGVkSW5kZXgsIHNlbGVjdGVkT3B0aW9ucywgSVRFUkFUT1JcbiAgICAgU2VsZWN0IC0gQnV0dG9uOiBhZGQoKSBhdXRvY29tcGxldGUgaXRlbSgpIGxlbmd0aCBtdWx0aXBsZSBuYW1lZEl0ZW0oKSBvcHRpb25zIHJlbW92ZSgpIHJlcXVpcmVkIHNlbGVjdGVkSW5kZXggc2VsZWN0ZWRPcHRpb25zIHNpemUgSVRFUkFUT1JcbiAgICAgQnV0dG9uIC0gU2VsZWN0OiBmb3JtQWN0aW9uIGZvcm1FbmN0eXBlIGZvcm1NZXRob2QgZm9ybU5vVmFsaWRhdGUgZm9ybVRhcmdldFxuXG4gICAgIElucHV0IHVuaXF1ZXM6XG4gICAgIGFjY2VwdCBjaGVja2VkIGRlZmF1bHRDaGVja2VkIGRlZmF1bHRWYWx1ZSBkaXJOYW1lIGZpbGVzIGluZGV0ZXJtaW5hdGUgbGlzdCBtYXggbWF4TGVuZ3RoIG1pbiBtaW5MZW5ndGggcGF0dGVybiBwbGFjZWhvbGRlciByZWFkT25seSBzZWxlY3QoKSBzZWxlY3Rpb25EaXJlY3Rpb24gc2VsZWN0aW9uRW5kIHNlbGVjdGlvblN0YXJ0IHNldFJhbmdlVGV4dCgpIHNldFNlbGVjdGlvblJhbmdlKCkgc3JjIHN0ZXAgc3RlcERvd24oKSBzdGVwVXAoKSB1c2VNYXAgdmFsdWVBc0RhdGUgdmFsdWVBc051bWJlclxuXG4gICAgIFNlbGVjdCB1bmlxdWVzOlxuICAgICBhZGQoKSBpdGVtKCkgbGVuZ3RoIG5hbWVkSXRlbSgpIG9wdGlvbnMgcmVtb3ZlKCkgc2VsZWN0ZWRJbmRleCBzZWxlY3RlZE9wdGlvbnMgSVRFUkFUT1JcblxuICAgICBTaGFyZWQgYW1vbmcgQnV0dG9uLCBTZWxlY3QgYW5kIElucHV0OiAob3IgQnV0dG9uIGFuZCBTZWxlY3QsIHNhbWUpXG4gICAgIGNoZWNrVmFsaWRpdHkoKSBkaXNhYmxlZCBmb3JtIGxhYmVscyBuYW1lIHJlcG9ydFZhbGlkaXR5KCkgc2V0Q3VzdG9tVmFsaWRpdHkoKSB0eXBlIHZhbGlkYXRpb25NZXNzYWdlIHZhbGlkaXR5IHZhbHVlIHdpbGxWYWxpZGF0ZVxuXG4gICAgIFNoYXJlZCBhbW1vbmcgU2VsZWNjdCBhbmQgSW5wdXQ6XG4gICAgIGF1dG9jb21wbGV0ZSBjaGVja1ZhbGlkaXR5KCkgZGlzYWJsZWQgZm9ybSBsYWJlbHMgbXVsdGlwbGUgbmFtZSByZXBvcnRWYWxpZGl0eSgpIHJlcXVpcmVkIHNldEN1c3RvbVZhbGlkaXR5KCkgdHlwZSB2YWxpZGF0aW9uTWVzc2FnZSB2YWxpZGl0eSB2YWx1ZSB3aWxsVmFsaWRhdGVcblxuICAgICAqL1xuICAgIGRpc2FibGUoKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZW5hYmxlKCk6IHRoaXMge1xuICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipEaXNhYmxlcy4qL1xuICAgIHRvZ2dsZUVuYWJsZWQob246IG51bGwgfCB1bmRlZmluZWQgfCAwKTogdGhpc1xuICAgIC8qKkNhbGxzIGBlbmFibGUoKWAgb3IgYGRpc2FibGUoKWAgYWNjb3JkaW5nbHkuICovXG4gICAgdG9nZ2xlRW5hYmxlZChvbjogYm9vbGVhbik6IHRoaXNcbiAgICAvKipFbmFibGVzIGlmIGBvbmAgaXMgdHJ1dGh5LCBvdGhlcndpc2UgZGlzYWJsZXMuXG4gICAgIEVycm9ycyBpZiBgb25gIGlzIG5vbi1wcmltaXRpdmUgKG9iamVjdCwgYXJyYXkpLiovXG4gICAgdG9nZ2xlRW5hYmxlZChvbik6IHRoaXMge1xuICAgICAgICBpZiAoaXNPYmplY3Qob24pKSB7XG4gICAgICAgICAgICB0aGlzLl9zb2Z0RXJyKG5ldyBCSEVUeXBlRXJyb3IoeyBmYXVsdHlWYWx1ZTogeyBvbiB9LCBleHBlY3RlZDogXCJwcmltaXRpdmVcIiwgd2hlcmU6IFwidG9nZ2xlRW5hYmxlZCgpXCIgfSkpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9vbChvbikpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVuYWJsZSgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaXNhYmxlKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlJldHVybnMgdW5kZWZpbmVkIGlmIGBfaHRtbEVsZW1lbnQudmFsdWVgIGlzIG51bGwgb3IgdW5kZWZpbmVkLCBvdGhlcndpc2UgcmV0dXJucyBgX2h0bWxFbGVtZW50LnZhbHVlYCovXG4gICAgdmFsdWUoKTogYW55O1xuICAgIC8qKlJldHVybnMgdW5kZWZpbmVkIGlmIGBfaHRtbEVsZW1lbnQudmFsdWVgIGlzIG51bGwgb3IgdW5kZWZpbmVkLCBvdGhlcndpc2UgcmV0dXJucyBgX2h0bWxFbGVtZW50LnZhbHVlYCovXG4gICAgdmFsdWUodmFsOiB1bmRlZmluZWQpOiBhbnk7XG4gICAgLyoqUmVzZXRzIGB2YWx1ZWAuICovXG4gICAgdmFsdWUodmFsOiBudWxsIHwgJycpOiB0aGlzO1xuICAgIC8qKlNldHMgYHZhbHVlYCAqL1xuICAgIHZhbHVlKHZhbDogYW55KTogdGhpcztcbiAgICB2YWx1ZSh2YWw/KSB7XG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50LnZhbHVlID8/IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpc09iamVjdCh2YWwpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc29mdEVycihuZXcgQkhFVHlwZUVycm9yKHsgZmF1bHR5VmFsdWU6IHsgdmFsIH0sIGV4cGVjdGVkOiBcInByaW1pdGl2ZVwiLCB3aGVyZTogXCJ2YWx1ZSgpXCIgfSkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQudmFsdWUgPSB2YWw7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGZsYXNoQmFkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aGlzLmFkZENsYXNzKCdiYWQnKTtcbiAgICAgICAgYXdhaXQgd2FpdCgyMDAwKTtcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcygnYmFkJyk7XG5cbiAgICB9XG5cbiAgICBhc3luYyBmbGFzaEdvb2QoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3MoJ2dvb2QnKTtcbiAgICAgICAgYXdhaXQgd2FpdCgyMDAwKTtcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcygnZ29vZCcpO1xuICAgIH1cblxuICAgIGNsZWFyKCk6IHRoaXMge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZShudWxsKVxuICAgIH1cblxuICAgIC8vICoqIEV2ZW50IEhvb2tzXG4gICAgX2JlZm9yZUV2ZW50KCk6IHRoaXM7XG4gICAgLyoqQ2FsbHMgYHNlbGYuZGlzYWJsZSgpYC4qL1xuICAgIF9iZWZvcmVFdmVudCh0aGlzQXJnOiB0aGlzKTogdGhpc1xuICAgIF9iZWZvcmVFdmVudCh0aGlzQXJnPzogdGhpcyk6IHRoaXMge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXMgPT09IHVuZGVmaW5lZCA/IHRoaXNBcmcgOiB0aGlzO1xuICAgICAgICByZXR1cm4gc2VsZi5kaXNhYmxlKClcbiAgICB9XG5cbiAgICBfb25FdmVudFN1Y2Nlc3MocmV0OiBhbnkpOiB0aGlzXG4gICAgX29uRXZlbnRTdWNjZXNzKHJldDogYW55LCB0aGlzQXJnOiB0aGlzKTogdGhpc1xuICAgIC8qKkNhbGxzIGBzZWxmLmZsYXNoR29vZCgpYC4qL1xuICAgIF9vbkV2ZW50U3VjY2VzcyhyZXQ6IGFueSwgdGhpc0FyZz86IHRoaXMpOiB0aGlzIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzID09PSB1bmRlZmluZWQgPyB0aGlzQXJnIDogdGhpcztcbiAgICAgICAgaWYgKHNlbGYuZmxhc2hHb29kKSB7XG4gICAgICAgICAgICBzZWxmLmZsYXNoR29vZCgpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlbGZcbiAgICB9XG5cbiAgICBhc3luYyBfc29mdEVycihlOiBFcnJvcik6IFByb21pc2U8dGhpcz47XG4gICAgYXN5bmMgX3NvZnRFcnIoZTogRXJyb3IsIHRoaXNBcmc6IHRoaXMpOiBQcm9taXNlPHRoaXM+O1xuICAgIC8qKkxvZ3MgZXJyb3IgdG8gY29uc29sZSBhbmQgY2FsbHMgYHNlbGYuZmxhc2hCYWQoKWAuKi9cbiAgICBhc3luYyBfc29mdEVycihlOiBFcnJvciwgdGhpc0FyZz86IHRoaXMpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgJHtlLm5hbWV9OlxcbiR7ZS5tZXNzYWdlfWApO1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXMgPT09IHVuZGVmaW5lZCA/IHRoaXNBcmcgOiB0aGlzO1xuICAgICAgICBpZiAoc2VsZi5mbGFzaEJhZCkge1xuICAgICAgICAgICAgYXdhaXQgc2VsZi5mbGFzaEJhZCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZWxmXG4gICAgfVxuXG4gICAgYXN5bmMgX3NvZnRXYXJuKGU6IEVycm9yKTogUHJvbWlzZTx0aGlzPjtcbiAgICBhc3luYyBfc29mdFdhcm4oZTogRXJyb3IsIHRoaXNBcmc6IHRoaXMpOiBQcm9taXNlPHRoaXM+O1xuICAgIC8qKkxvZ3Mgd2FybmluZyB0byBjb25zb2xlIGFuZCBjYWxscyBgc2VsZi5mbGFzaEJhZCgpYC4qL1xuICAgIGFzeW5jIF9zb2Z0V2FybihlOiBFcnJvciwgdGhpc0FyZz86IHRoaXMpOiBQcm9taXNlPHRoaXM+IHtcbiAgICAgICAgY29uc29sZS53YXJuKGAke2UubmFtZX06XFxuJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcyA9PT0gdW5kZWZpbmVkID8gdGhpc0FyZyA6IHRoaXM7XG4gICAgICAgIGlmIChzZWxmLmZsYXNoQmFkKSB7XG4gICAgICAgICAgICBhd2FpdCBzZWxmLmZsYXNoQmFkKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlbGZcbiAgICB9XG5cbiAgICBfYWZ0ZXJFdmVudCgpOiB0aGlzO1xuICAgIF9hZnRlckV2ZW50KHRoaXNBcmc6IHRoaXMpOiB0aGlzO1xuICAgIC8qKkNhbGxzIGBzZWxmLmVuYWJsZSgpYC4qL1xuICAgIF9hZnRlckV2ZW50KHRoaXNBcmc/OiB0aGlzKTogdGhpcyB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcyA9PT0gdW5kZWZpbmVkID8gdGhpc0FyZyA6IHRoaXM7XG4gICAgICAgIHJldHVybiBzZWxmLmVuYWJsZSgpO1xuICAgIH1cblxuICAgIC8qKlVzZWQgYnkgZS5nLiBgY2xpY2soZm4pYCB0byB3cmFwIHBhc3NlZCBgZm5gIHNhZmVseSBhbmQgdHJpZ2dlciBgX1tiZWZvcmV8YWZ0ZXJ8b25dRXZlbnRbU3VjY2Vzc3xFcnJvcl1gLiovXG4gICAgcHJvdGVjdGVkIGFzeW5jIF93cmFwRm5JbkV2ZW50SG9va3M8RiBleHRlbmRzIChldmVudDogRXZlbnQpID0+IFByb21pc2U8YW55Pj4oYXN5bmNGbjogRiwgZXZlbnQ6IEV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLl9iZWZvcmVFdmVudCgpO1xuICAgICAgICAgICAgY29uc3QgcmV0ID0gYXdhaXQgYXN5bmNGbihldmVudCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9vbkV2ZW50U3VjY2VzcyhyZXQpO1xuXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX3NvZnRFcnIoZSk7XG5cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRoaXMuX2FmdGVyRXZlbnQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgQnV0dG9uPFEgZXh0ZW5kcyBRdWVyeVNlbGVjdG9yID0gUXVlcnlTZWxlY3Rvcj4gZXh0ZW5kcyBGb3JtPEhUTUxCdXR0b25FbGVtZW50PiB7XG4gICAgY29uc3RydWN0b3IoeyBjbHMsIHNldGlkLCB0ZXh0LCBjbGljayB9OiB7XG4gICAgICAgIGNscz86IHN0cmluZywgc2V0aWQ/OiBzdHJpbmcsIHRleHQ/OiBzdHJpbmcsIGNsaWNrPzogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBhbnlcbiAgICB9KTtcbiAgICBjb25zdHJ1Y3Rvcih7IGNscywgc2V0aWQsIGh0bWwsIGNsaWNrIH06IHtcbiAgICAgICAgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZywgaHRtbD86IHN0cmluZywgY2xpY2s/OiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueVxuICAgIH0pO1xuICAgIGNvbnN0cnVjdG9yKHsgYnlpZCwgY2hpbGRyZW4gfToge1xuICAgICAgICBieWlkOiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbiAgICB9KTtcbiAgICBjb25zdHJ1Y3Rvcih7IHF1ZXJ5LCBjaGlsZHJlbiB9OiB7XG4gICAgICAgIHF1ZXJ5OiBRdWVyeU9yUHJlY2lzZVRhZzxRLCBcImJ1dHRvblwiPixcbiAgICAgICAgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxuICAgIH0pXG4gICAgY29uc3RydWN0b3IoeyBodG1sRWxlbWVudCwgY2hpbGRyZW4gfToge1xuICAgICAgICBodG1sRWxlbWVudDogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gICAgICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbiAgICB9KVxuICAgIGNvbnN0cnVjdG9yKCk7XG4gICAgY29uc3RydWN0b3IoYnV0dG9uT3B0cz8pIHtcbiAgICAgICAgY29uc3QgeyBzZXRpZCwgY2xzLCB0ZXh0LCBodG1sLCBieWlkLCBxdWVyeSwgaHRtbEVsZW1lbnQsIGNoaWxkcmVuLCBjbGljayB9ID0gYnV0dG9uT3B0cztcbiAgICAgICAgaWYgKHRleHQgIT09IHVuZGVmaW5lZCAmJiBodG1sICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNdXR1YWxseUV4Y2x1c2l2ZUFyZ3MoeyB0ZXh0LCBodG1sIH0pXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGh0bWxFbGVtZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1cGVyKHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGJ5aWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3VwZXIoeyBieWlkLCBjaGlsZHJlbiB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChxdWVyeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcih7IHF1ZXJ5LCBjaGlsZHJlbiB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyKHsgdGFnOiBcImJ1dHRvblwiLCBzZXRpZCwgY2xzLCBodG1sIH0pO1xuICAgICAgICAgICAgaWYgKHRleHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMudGV4dCh0ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjbGljayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGljayhjbGljayk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgY2xpY2soX2ZuPzogKF9ldmVudDogTW91c2VFdmVudCkgPT4gUHJvbWlzZTxhbnk+KTogdGhpcyB7XG4gICAgICAgIGlmIChfZm4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgZm4gPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLl93cmFwRm5JbkV2ZW50SG9va3MoX2ZuLCBldmVudCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuY2xpY2soZm4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci5jbGljaygpXG4gICAgfVxuXG5cbn1cblxuZXhwb3J0IGNsYXNzIElucHV0PFRJbnB1dFR5cGUgZXh0ZW5kcyBJbnB1dFR5cGUsXG4gICAgR2VuZXJpYyBleHRlbmRzIEZvcm1pc2hIVE1MRWxlbWVudCA9IEhUTUxJbnB1dEVsZW1lbnQsXG4gICAgUSBleHRlbmRzIFF1ZXJ5U2VsZWN0b3IgPSBRdWVyeVNlbGVjdG9yPlxuICAgIGV4dGVuZHMgRm9ybTxHZW5lcmljPiB7XG4gICAgdHlwZTogVElucHV0VHlwZTtcblxuICAgIGNvbnN0cnVjdG9yKHsgY2xzLCBzZXRpZCwgdHlwZSB9OiB7XG4gICAgICAgIGNscz86IHN0cmluZywgc2V0aWQ/OiBzdHJpbmcsXG4gICAgICAgIHR5cGU/OiBUSW5wdXRUeXBlXG4gICAgfSk7XG5cbiAgICBjb25zdHJ1Y3Rvcih7IGJ5aWQsIGNoaWxkcmVuIH06IHsgYnlpZDogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pO1xuICAgIGNvbnN0cnVjdG9yKHsgcXVlcnksIGNoaWxkcmVuIH06IHtcbiAgICAgICAgcXVlcnk6IFF1ZXJ5T3JQcmVjaXNlVGFnPFEsIFwiaW5wdXRcIj4sXG4gICAgICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbiAgICB9KTtcblxuICAgIGNvbnN0cnVjdG9yKHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH06IHtcbiAgICAgICAgaHRtbEVsZW1lbnQ6IEdlbmVyaWM7XG4gICAgICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbiAgICB9KTtcblxuICAgIGNvbnN0cnVjdG9yKCk7XG4gICAgY29uc3RydWN0b3IoaW5wdXRPcHRzPykge1xuICAgICAgICBjb25zdCB7IHNldGlkLCBjbHMsIHR5cGUsIGJ5aWQsIHF1ZXJ5LCBodG1sRWxlbWVudCwgY2hpbGRyZW4gfSA9IGlucHV0T3B0cztcblxuXG4gICAgICAgIGlmIChodG1sRWxlbWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChieWlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1cGVyKHsgYnlpZCwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocXVlcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3VwZXIoeyBxdWVyeSwgY2hpbGRyZW4gfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlcih7IHRhZzogXCJpbnB1dFwiIGFzIEVsZW1lbnQyVGFnPEdlbmVyaWM+LCBjbHMsIHNldGlkIH0pO1xuICAgICAgICAgICAgaWYgKHR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICB0aGlzLl9odG1sRWxlbWVudC50eXBlID0gdHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICB9XG5cblxufVxuXG5leHBvcnQgY2xhc3MgVGV4dElucHV0PFEgZXh0ZW5kcyBRdWVyeVNlbGVjdG9yID0gUXVlcnlTZWxlY3Rvcj4gZXh0ZW5kcyBJbnB1dDxcInRleHRcIj4ge1xuICAgIGNvbnN0cnVjdG9yKHsgY2xzLCBzZXRpZCwgcGxhY2Vob2xkZXIgfToge1xuICAgICAgICBjbHM/OiBzdHJpbmcsIHNldGlkPzogc3RyaW5nLFxuICAgICAgICBwbGFjZWhvbGRlcj86IHN0cmluZ1xuICAgIH0pO1xuXG4gICAgY29uc3RydWN0b3IoeyBieWlkLCBjaGlsZHJlbiB9OiB7IGJ5aWQ6IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICBjb25zdHJ1Y3Rvcih7IHF1ZXJ5LCBjaGlsZHJlbiB9OiB7XG4gICAgICAgIHF1ZXJ5OiBRdWVyeU9yUHJlY2lzZVRhZzxRLCBcImlucHV0XCI+LFxuICAgICAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG4gICAgfSk7XG5cbiAgICBjb25zdHJ1Y3Rvcih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9OiB7XG4gICAgICAgIGh0bWxFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG4gICAgfSk7XG5cbiAgICBjb25zdHJ1Y3RvcigpO1xuICAgIGNvbnN0cnVjdG9yKG9wdHM/KSB7XG4gICAgICAgIG9wdHMudHlwZSA9ICd0ZXh0JztcbiAgICAgICAgc3VwZXIob3B0cyk7XG4gICAgICAgIGNvbnN0IHsgcGxhY2Vob2xkZXIgfSA9IG9wdHM7XG4gICAgICAgIGlmIChwbGFjZWhvbGRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnBsYWNlaG9sZGVyKHBsYWNlaG9sZGVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBsYWNlaG9sZGVyKHZhbDogc3RyaW5nKTogdGhpcztcbiAgICBwbGFjZWhvbGRlcigpOiBzdHJpbmc7XG4gICAgcGxhY2Vob2xkZXIodmFsPykge1xuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9odG1sRWxlbWVudC5wbGFjZWhvbGRlcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LnBsYWNlaG9sZGVyID0gdmFsO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGtleWRvd24oX2ZuOiAoX2V2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBQcm9taXNlPGFueT4pOiB0aGlzIHtcbiAgICAgICAgY29uc3QgZm4gPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5rZXkgIT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdmFsID0gdGhpcy52YWx1ZSgpO1xuICAgICAgICAgICAgaWYgKCFib29sKHZhbCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zb2Z0V2FybihuZXcgVmFsdWVFcnJvcih7IGZhdWx0eVZhbHVlOiB7IHZhbCB9LCBleHBlY3RlZDogXCJ0cnV0aHlcIiwgd2hlcmU6IFwia2V5ZG93bigpXCIgfSkpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX3dyYXBGbkluRXZlbnRIb29rcyhfZm4sIGV2ZW50KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmtleWRvd24oZm4pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIENoYW5nYWJsZTxUSW5wdXRUeXBlIGV4dGVuZHMgSW5wdXRUeXBlLCBHZW5lcmljIGV4dGVuZHMgRm9ybWlzaEhUTUxFbGVtZW50PiBleHRlbmRzIElucHV0PFRJbnB1dFR5cGUsIEdlbmVyaWM+IHtcbiAgICBjaGFuZ2UoX2ZuOiAoX2V2ZW50OiBFdmVudCkgPT4gUHJvbWlzZTxhbnk+KTogdGhpcyB7XG5cbiAgICAgICAgY29uc3QgZm4gPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX3dyYXBGbkluRXZlbnRIb29rcyhfZm4sIGV2ZW50KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmNoYW5nZShmbik7XG4gICAgfVxufVxuXG4vKipQYXRjaGVzIEZvcm0ncyBgdmFsdWUoKWAgdG8gc2V0L2dldCBgX2h0bWxFbGVtZW50LmNoZWNrZWRgLCBhbmQgYGNsZWFyKClgIHRvIHVuY2hlY2suICovXG5leHBvcnQgY2xhc3MgQ2hlY2tib3hJbnB1dCBleHRlbmRzIENoYW5nYWJsZTxcImNoZWNrYm94XCIsIEhUTUxJbnB1dEVsZW1lbnQ+IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRzKSB7XG4gICAgICAgIG9wdHMudHlwZSA9ICdjaGVja2JveCc7XG4gICAgICAgIHN1cGVyKG9wdHMpO1xuICAgIH1cblxuICAgIGdldCBjaGVja2VkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQuY2hlY2tlZDtcbiAgICB9XG5cbiAgICBjaGVjaygpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5faHRtbEVsZW1lbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHVuY2hlY2soKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cbiAgICAvKipEaXNhYmxlcy4qL1xuICAgIHRvZ2dsZUNoZWNrZWQob246IG51bGwgfCB1bmRlZmluZWQgfCAwKTogdGhpc1xuICAgIC8qKkNhbGxzIGBjaGVjaygpYCBvciBgdW5jaGVjaygpYCBhY2NvcmRpbmdseS4gKi9cbiAgICB0b2dnbGVDaGVja2VkKG9uOiBib29sZWFuKTogdGhpc1xuXG4gICAgLyoqY2hlY2tzIG9uIGlmIGBvbmAgaXMgdHJ1dGh5LCBvdGhlcndpc2UgdW5jaGVja3MuXG4gICAgIEVycm9ycyBpZiBgb25gIGlzIG5vbi1wcmltaXRpdmUgKG9iamVjdCwgYXJyYXkpLiovXG4gICAgdG9nZ2xlQ2hlY2tlZChvbikge1xuICAgICAgICBpZiAoaXNPYmplY3Qob24pKSB7XG4gICAgICAgICAgICB0aGlzLl9zb2Z0RXJyKG5ldyBCSEVUeXBlRXJyb3IoeyBmYXVsdHlWYWx1ZTogeyBvbiB9LCBleHBlY3RlZDogXCJwcmltaXRpdmVcIiwgd2hlcmU6IFwidG9nZ2xlQ2hlY2tlZCgpXCIgfSkpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9vbChvbikpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVuY2hlY2soKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqUmV0dXJucyB1bmRlZmluZWQgaWYgYF9odG1sRWxlbWVudC52YWx1ZWAgaXMgbnVsbCBvciB1bmRlZmluZWQsIG90aGVyd2lzZSByZXR1cm5zIGBfaHRtbEVsZW1lbnQudmFsdWVgKi9cbiAgICB2YWx1ZSgpOiBhbnk7XG4gICAgLyoqUmV0dXJucyB1bmRlZmluZWQgaWYgYF9odG1sRWxlbWVudC52YWx1ZWAgaXMgbnVsbCBvciB1bmRlZmluZWQsIG90aGVyd2lzZSByZXR1cm5zIGBfaHRtbEVsZW1lbnQudmFsdWVgKi9cbiAgICB2YWx1ZSh2YWw6IHVuZGVmaW5lZCk6IGFueTtcbiAgICAvKipSZXNldHMgYHZhbHVlYC4gKi9cbiAgICB2YWx1ZSh2YWw6IG51bGwgfCAnJyk6IHRoaXM7XG4gICAgLyoqU2V0cyBgdmFsdWVgICovXG4gICAgdmFsdWUodmFsOiBhbnkpOiB0aGlzO1xuICAgIHZhbHVlKHZhbD8pIHtcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faHRtbEVsZW1lbnQuY2hlY2tlZCA/PyB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaXNPYmplY3QodmFsKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NvZnRFcnIobmV3IEJIRVR5cGVFcnJvcih7IGZhdWx0eVZhbHVlOiB7IHZhbCB9LCBleHBlY3RlZDogXCJwcmltaXRpdmVcIiwgd2hlcmU6IFwidmFsdWUoKVwiIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2h0bWxFbGVtZW50LmNoZWNrZWQgPSB2YWw7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsZWFyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51bmNoZWNrKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3NvZnRFcnIoZTogRXJyb3IsIHRoaXNBcmc/OiB0aGlzKTogUHJvbWlzZTx0aGlzPiB7XG4gICAgICAgIHRoaXMudG9nZ2xlQ2hlY2tlZCghdGhpcy5jaGVja2VkKTtcbiAgICAgICAgcmV0dXJuIHN1cGVyLl9zb2Z0RXJyKGUpO1xuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgU2VsZWN0IGV4dGVuZHMgQ2hhbmdhYmxlPHVuZGVmaW5lZCwgSFRNTFNlbGVjdEVsZW1lbnQ+IHtcblxuICAgIC8vIFNlbGVjdCB1bmlxdWVzOlxuICAgIC8vIGFkZCgpIGl0ZW0oKSBsZW5ndGggbmFtZWRJdGVtKCkgb3B0aW9ucyByZW1vdmUoKSBzZWxlY3RlZEluZGV4IHNlbGVjdGVkT3B0aW9ucyBJVEVSQVRPUlxuICAgIGNvbnN0cnVjdG9yKHNlbGVjdE9wdHMpIHtcbiAgICAgICAgc3VwZXIoc2VsZWN0T3B0cyk7XG4gICAgfVxuXG4gICAgZ2V0IHNlbGVjdGVkSW5kZXgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50LnNlbGVjdGVkSW5kZXhcbiAgICB9XG5cbiAgICBzZXQgc2VsZWN0ZWRJbmRleCh2YWw6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9odG1sRWxlbWVudC5zZWxlY3RlZEluZGV4ID0gdmFsXG4gICAgfVxuXG4gICAgZ2V0IHNlbGVjdGVkKCk6IEhUTUxPcHRpb25FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbSh0aGlzLnNlbGVjdGVkSW5kZXgpXG4gICAgfVxuXG4gICAgLyoqQHBhcmFtIHZhbCAtIEVpdGhlciBhIHNwZWNpZmljIEhUTUxPcHRpb25FbGVtZW50LCBudW1iZXIgKGluZGV4KSovXG4gICAgc2V0IHNlbGVjdGVkKHZhbCkge1xuICAgICAgICBpZiAodmFsIGluc3RhbmNlb2YgSFRNTE9wdGlvbkVsZW1lbnQpIHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IHRoaXMub3B0aW9ucy5maW5kSW5kZXgobyA9PiBvID09PSB2YWwpO1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NvZnRXYXJuKG5ldyBWYWx1ZUVycm9yKHsgZmF1bHR5VmFsdWU6IHsgdmFsIH0sIHdoZXJlOiBcInNldCBzZWxlY3RlZCh2YWwpXCIsIG1lc3NhZ2U6IGBubyBvcHRpb24gZXF1YWxzIHBhc3NlZCB2YWxgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSB2YWxcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IHRoaXMub3B0aW9ucy5maW5kSW5kZXgobyA9PiBvLnZhbHVlID09PSB2YWwpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBnZXQgb3B0aW9ucygpOiBIVE1MT3B0aW9uRWxlbWVudFtdIHtcbiAgICAgICAgcmV0dXJuIFsuLi50aGlzLl9odG1sRWxlbWVudC5vcHRpb25zIGFzIHVua25vd24gYXMgSXRlcmFibGU8SFRNTE9wdGlvbkVsZW1lbnQ+XVxuICAgIH1cblxuICAgIGl0ZW0oaW5kZXg6IG51bWJlcik6IEhUTUxPcHRpb25FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2h0bWxFbGVtZW50Lml0ZW0oaW5kZXgpIGFzIEhUTUxPcHRpb25FbGVtZW50XG4gICAgfVxuXG4gICAgLyoqUmV0dXJucyB1bmRlZmluZWQgaWYgYHRoaXMuc2VsZWN0ZWQudmFsdWVgIGlzIG51bGwgb3IgdW5kZWZpbmVkLCBvdGhlcndpc2UgcmV0dXJucyBgdGhpcy5zZWxlY3RlZC52YWx1ZWAqL1xuICAgIHZhbHVlKCk6IGFueTtcbiAgICAvKipSZXR1cm5zIHVuZGVmaW5lZCBpZiBgdGhpcy5zZWxlY3RlZC52YWx1ZWAgaXMgbnVsbCBvciB1bmRlZmluZWQsIG90aGVyd2lzZSByZXR1cm5zIGB0aGlzLnNlbGVjdGVkLnZhbHVlYCovXG4gICAgdmFsdWUodmFsOiB1bmRlZmluZWQpOiBhbnk7XG4gICAgLyoqUmVzZXRzIGBzZWxlY3RlZGAgdG8gYmxhbmsqL1xuICAgIHZhbHVlKHZhbDogbnVsbCB8ICcnIHwgYm9vbGVhbik6IHRoaXM7XG4gICAgLyoqU2V0cyBgc2VsZWN0ZWRgIHRvIGB2YWxgIGlmIGZpbmRzIGEgbWF0Y2ggKi9cbiAgICB2YWx1ZSh2YWw6IEhUTUxPcHRpb25FbGVtZW50IHwgbnVtYmVyIHwgYW55KTogdGhpcztcbiAgICB2YWx1ZSh2YWw/KSB7XG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWQudmFsdWUgPz8gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHZhbDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqU2V0cyBgc2VsZWN0ZWRgIHRvIDB0aCBlbGVtZW50LiBFcXVpdmFsZW50IHRvIGB2YWx1ZSgwKWAuKi9cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLypbU3ltYm9sLml0ZXJhdG9yXSgpIHtcbiAgICAgICAgbGV0IG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICAgIGxldCBjdXJyZW50SW5kZXggPSAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50SW5kZXggKz0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBkb25lOiB0cnVlXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSovXG59XG5cblxuLypjdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1odG1sLWVsZW1lbnQnLCBCZXR0ZXJIVE1MRWxlbWVudCk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1kaXYnLCBEaXYsIHtleHRlbmRzOiAnZGl2J30pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItaW5wdXQnLCBJbnB1dCwge2V4dGVuZHM6ICdpbnB1dCd9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLXAnLCBQYXJhZ3JhcGgsIHtleHRlbmRzOiAncCd9KTtcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLXNwYW4nLCBTcGFuLCB7ZXh0ZW5kczogJ3NwYW4nfSk7XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JldHRlci1pbWcnLCBJbWcsIHtleHRlbmRzOiAnaW1nJ30pO1xuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdiZXR0ZXItYScsIEFuY2hvciwge2V4dGVuZHM6ICdhJ30pOyovXG5cbi8vIGN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmV0dGVyLXN2ZycsIFN2Zywge2V4dGVuZHM6ICdzdmcnfSk7XG5cbi8qKkNyZWF0ZSBhbiBlbGVtZW50IG9mIGBjcmVhdGVgLiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCBhbmQgLyBvciBgY2xzYCovXG5leHBvcnQgZnVuY3Rpb24gZWxlbTxUIGV4dGVuZHMgVGFnPih7IHRhZywgY2xzLCBzZXRpZCwgaHRtbCB9OiB7IHRhZzogVCwgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZywgaHRtbD86IHN0cmluZyB9KTpcbiAgICBUIGV4dGVuZHMgVGFnID8gQmV0dGVySFRNTEVsZW1lbnQ8SFRNTEVsZW1lbnRUYWdOYW1lTWFwW1RdPiA6IG5ldmVyO1xuLyoqR2V0IGFuIGV4aXN0aW5nIGVsZW1lbnQgYnkgYGlkYC4gT3B0aW9uYWxseSwgc2V0IGl0cyBgdGV4dGAsIGBjbHNgIG9yIGNhY2hlIGBjaGlsZHJlbmAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVsZW0oeyBieWlkLCBjaGlsZHJlbiB9OiB7IGJ5aWQ6IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTpcbiAgICBCZXR0ZXJIVE1MRWxlbWVudDtcbi8qKkdldCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBxdWVyeWAuIE9wdGlvbmFsbHksIHNldCBpdHMgYHRleHRgLCBgY2xzYCBvciBjYWNoZSBgY2hpbGRyZW5gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbGVtPFEgZXh0ZW5kcyBRdWVyeVNlbGVjdG9yPih7IHF1ZXJ5LCBjaGlsZHJlbiB9OiB7IHF1ZXJ5OiBRLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOlxuICAgIFEgZXh0ZW5kcyBUYWcgPyBCZXR0ZXJIVE1MRWxlbWVudDxIVE1MRWxlbWVudFRhZ05hbWVNYXBbUV0+IDogQmV0dGVySFRNTEVsZW1lbnQ7XG4vKipXcmFwIGFuIGV4aXN0aW5nIEhUTUxFbGVtZW50LiBPcHRpb25hbGx5LCBzZXQgaXRzIGB0ZXh0YCwgYGNsc2Agb3IgY2FjaGUgYGNoaWxkcmVuYCovXG5leHBvcnQgZnVuY3Rpb24gZWxlbTxFIGV4dGVuZHMgSFRNTEVsZW1lbnQ+KHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH06IHsgaHRtbEVsZW1lbnQ6IEU7IGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk6XG4gICAgQmV0dGVySFRNTEVsZW1lbnQ8RT47XG5cbmV4cG9ydCBmdW5jdGlvbiBlbGVtKGVsZW1PcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBCZXR0ZXJIVE1MRWxlbWVudChlbGVtT3B0aW9ucyk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNwYW4oeyBjbHMsIHNldGlkLCB0ZXh0IH06IHsgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZywgdGV4dD86IHN0cmluZyB9KTogU3BhbjtcbmV4cG9ydCBmdW5jdGlvbiBzcGFuKHsgY2xzLCBzZXRpZCwgaHRtbCB9OiB7IGNscz86IHN0cmluZywgc2V0aWQ/OiBzdHJpbmcsIGh0bWw/OiBzdHJpbmcgfSk6IFNwYW47XG5leHBvcnQgZnVuY3Rpb24gc3Bhbih7IGJ5aWQsIGNoaWxkcmVuIH06IHsgYnlpZDogc3RyaW5nLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOiBTcGFuO1xuZXhwb3J0IGZ1bmN0aW9uIHNwYW48USBleHRlbmRzIFF1ZXJ5U2VsZWN0b3I+KHsgcXVlcnksIGNoaWxkcmVuIH06IHtcbiAgICBxdWVyeTogUXVlcnlPclByZWNpc2VUYWc8USwgXCJzcGFuXCI+LFxuICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBTcGFuO1xuZXhwb3J0IGZ1bmN0aW9uIHNwYW48RSBleHRlbmRzIEhUTUxTcGFuRWxlbWVudD4oeyBodG1sRWxlbWVudCwgY2hpbGRyZW4gfToge1xuICAgIGh0bWxFbGVtZW50OiBFO1xuICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBTcGFuO1xuZXhwb3J0IGZ1bmN0aW9uIHNwYW4oKTogU3BhblxuZXhwb3J0IGZ1bmN0aW9uIHNwYW4oc3Bhbk9wdHM/KTogU3BhbiB7XG4gICAgaWYgKCFib29sKHNwYW5PcHRzKSkge1xuICAgICAgICBzcGFuT3B0cyA9IHt9XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3BhbihzcGFuT3B0cylcbn1cblxuLyoqQ3JlYXRlIGEgRGl2IGVsZW1lbnQsIG9yIHdyYXAgYW4gZXhpc3Rpbmcgb25lIGJ5IHBhc3NpbmcgaHRtbEVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgdGV4dCBvciBjbHMuKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXYoeyBjbHMsIHNldGlkLCB0ZXh0IH06IHtcbiAgICBjbHM/OiBzdHJpbmcsIHNldGlkPzogc3RyaW5nLCB0ZXh0Pzogc3RyaW5nXG59KTogRGl2O1xuZXhwb3J0IGZ1bmN0aW9uIGRpdih7IGNscywgc2V0aWQsIGh0bWwgfToge1xuICAgIGNscz86IHN0cmluZywgc2V0aWQ/OiBzdHJpbmcsIGh0bWw/OiBzdHJpbmdcbn0pOiBEaXY7XG5leHBvcnQgZnVuY3Rpb24gZGl2KHsgYnlpZCwgY2hpbGRyZW4gfToge1xuICAgIGJ5aWQ6IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxufSk6IERpdjtcbmV4cG9ydCBmdW5jdGlvbiBkaXY8USBleHRlbmRzIFF1ZXJ5U2VsZWN0b3I+KHsgcXVlcnksIGNoaWxkcmVuIH06IHtcbiAgICBxdWVyeTogUXVlcnlPclByZWNpc2VUYWc8USwgXCJkaXZcIj4sXG4gICAgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxufSk6IERpdjtcbmV4cG9ydCBmdW5jdGlvbiBkaXYoeyBodG1sRWxlbWVudCwgY2hpbGRyZW4gfToge1xuICAgIGh0bWxFbGVtZW50OiBIVE1MRGl2RWxlbWVudDtcbiAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG59KTogRGl2O1xuZXhwb3J0IGZ1bmN0aW9uIGRpdigpOiBEaXZcbmV4cG9ydCBmdW5jdGlvbiBkaXYoZGl2T3B0cz8pOiBEaXYge1xuICAgIGlmICghYm9vbChkaXZPcHRzKSkge1xuICAgICAgICBkaXZPcHRzID0ge31cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEaXYoZGl2T3B0cylcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYnV0dG9uKHsgY2xzLCBzZXRpZCwgdGV4dCB9OiB7XG4gICAgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZywgdGV4dD86IHN0cmluZywgY2xpY2s/OiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGFueVxufSk6IEJ1dHRvbjtcbmV4cG9ydCBmdW5jdGlvbiBidXR0b24oeyBjbHMsIHNldGlkLCBodG1sIH06IHtcbiAgICBjbHM/OiBzdHJpbmcsIHNldGlkPzogc3RyaW5nLCBodG1sPzogc3RyaW5nLCBjbGljaz86IChldmVudDogTW91c2VFdmVudCkgPT4gYW55XG59KTogQnV0dG9uO1xuZXhwb3J0IGZ1bmN0aW9uIGJ1dHRvbih7IGJ5aWQsIGNoaWxkcmVuIH06IHtcbiAgICBieWlkOiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBCdXR0b247XG5leHBvcnQgZnVuY3Rpb24gYnV0dG9uPFEgZXh0ZW5kcyBRdWVyeVNlbGVjdG9yPih7IHF1ZXJ5LCBjaGlsZHJlbiB9OiB7XG4gICAgcXVlcnk6IFF1ZXJ5T3JQcmVjaXNlVGFnPFEsIFwiYnV0dG9uXCI+LFxuICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBCdXR0b247XG5leHBvcnQgZnVuY3Rpb24gYnV0dG9uKHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH06IHtcbiAgICBodG1sRWxlbWVudDogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gICAgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxufSk6IEJ1dHRvbjtcbmV4cG9ydCBmdW5jdGlvbiBidXR0b24oKTogQnV0dG9uXG5leHBvcnQgZnVuY3Rpb24gYnV0dG9uKGJ1dHRvbk9wdHM/KTogQnV0dG9uIHtcbiAgICBpZiAoIWJvb2woYnV0dG9uT3B0cykpIHtcbiAgICAgICAgYnV0dG9uT3B0cyA9IHt9XG4gICAgfVxuICAgIHJldHVybiBuZXcgQnV0dG9uKGJ1dHRvbk9wdHMpXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGlucHV0PFRJbnB1dFR5cGUgZXh0ZW5kcyBJbnB1dFR5cGUsIEdlbmVyaWMgZXh0ZW5kcyBGb3JtaXNoSFRNTEVsZW1lbnQgPSBIVE1MSW5wdXRFbGVtZW50Pih7IGNscywgc2V0aWQsIHR5cGUsIHBsYWNlaG9sZGVyIH06IHtcbiAgICBjbHM/OiBzdHJpbmcsIHNldGlkPzogc3RyaW5nLFxuICAgIHR5cGU/OiBUSW5wdXRUeXBlLFxuICAgIHBsYWNlaG9sZGVyPzogc3RyaW5nXG59KTogSW5wdXQ8VElucHV0VHlwZSwgR2VuZXJpYz47XG5leHBvcnQgZnVuY3Rpb24gaW5wdXQ8VElucHV0VHlwZSBleHRlbmRzIElucHV0VHlwZSA9IElucHV0VHlwZSwgR2VuZXJpYyBleHRlbmRzIEZvcm1pc2hIVE1MRWxlbWVudCA9IEhUTUxJbnB1dEVsZW1lbnQ+KHsgYnlpZCwgY2hpbGRyZW4gfTogeyBieWlkOiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk6IElucHV0PFRJbnB1dFR5cGUsIEdlbmVyaWM+O1xuZXhwb3J0IGZ1bmN0aW9uIGlucHV0PFEgZXh0ZW5kcyBRdWVyeVNlbGVjdG9yLCBUSW5wdXRUeXBlIGV4dGVuZHMgSW5wdXRUeXBlID0gSW5wdXRUeXBlLCBHZW5lcmljIGV4dGVuZHMgRm9ybWlzaEhUTUxFbGVtZW50ID0gSFRNTElucHV0RWxlbWVudD4oeyBxdWVyeSwgY2hpbGRyZW4gfToge1xuICAgIHF1ZXJ5OiBRdWVyeU9yUHJlY2lzZVRhZzxRLCBcImlucHV0XCI+LFxuICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBJbnB1dDxUSW5wdXRUeXBlLCBHZW5lcmljPjtcbmV4cG9ydCBmdW5jdGlvbiBpbnB1dDxUSW5wdXRUeXBlIGV4dGVuZHMgSW5wdXRUeXBlID0gSW5wdXRUeXBlLCBHZW5lcmljIGV4dGVuZHMgRm9ybWlzaEhUTUxFbGVtZW50ID0gSFRNTElucHV0RWxlbWVudD4oeyBodG1sRWxlbWVudCwgY2hpbGRyZW4gfToge1xuICAgIGh0bWxFbGVtZW50OiBHZW5lcmljO1xuICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBJbnB1dDxUSW5wdXRUeXBlLCBHZW5lcmljPjtcbmV4cG9ydCBmdW5jdGlvbiBpbnB1dDxUSW5wdXRUeXBlIGV4dGVuZHMgSW5wdXRUeXBlID0gSW5wdXRUeXBlLCBHZW5lcmljIGV4dGVuZHMgRm9ybWlzaEhUTUxFbGVtZW50ID0gSFRNTElucHV0RWxlbWVudD4oKTogSW5wdXQ8VElucHV0VHlwZSwgR2VuZXJpYz5cbmV4cG9ydCBmdW5jdGlvbiBpbnB1dChpbnB1dE9wdHM/KSB7XG4gICAgaWYgKCFib29sKGlucHV0T3B0cykpIHtcbiAgICAgICAgaW5wdXRPcHRzID0ge31cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBJbnB1dChpbnB1dE9wdHMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3Qoc2VsZWN0T3B0cyk6IFNlbGVjdCB7XG4gICAgaWYgKCFib29sKHNlbGVjdE9wdHMpKSB7XG4gICAgICAgIHNlbGVjdE9wdHMgPSB7fVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFNlbGVjdChzZWxlY3RPcHRzKVxufVxuXG4vKipDcmVhdGUgYW4gSW1nIGVsZW1lbnQsIG9yIHdyYXAgYW4gZXhpc3Rpbmcgb25lIGJ5IHBhc3NpbmcgaHRtbEVsZW1lbnQuIE9wdGlvbmFsbHkgc2V0IGl0cyBpZCwgc3JjIG9yIGNscy4qL1xuZXhwb3J0IGZ1bmN0aW9uIGltZyh7IGNscywgc2V0aWQsIHNyYyB9OiB7XG4gICAgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZyxcbiAgICBzcmM/OiBzdHJpbmdcbn0pOiBJbWc7XG5leHBvcnQgZnVuY3Rpb24gaW1nKHsgYnlpZCwgY2hpbGRyZW4gfToge1xuICAgIGJ5aWQ6IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxufSk6IEltZztcbmV4cG9ydCBmdW5jdGlvbiBpbWc8USBleHRlbmRzIFF1ZXJ5U2VsZWN0b3I+KHsgcXVlcnksIGNoaWxkcmVuIH06IHtcbiAgICBxdWVyeTogUXVlcnlPclByZWNpc2VUYWc8USwgXCJpbWdcIj4sXG4gICAgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxufSk6IEltZztcbmV4cG9ydCBmdW5jdGlvbiBpbWcoeyBodG1sRWxlbWVudCwgY2hpbGRyZW4gfToge1xuICAgIGh0bWxFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50O1xuICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBJbWc7XG5leHBvcnQgZnVuY3Rpb24gaW1nKCk6IEltZ1xuZXhwb3J0IGZ1bmN0aW9uIGltZyhpbWdPcHRzPyk6IEltZyB7XG4gICAgaWYgKCFib29sKGltZ09wdHMpKSB7XG4gICAgICAgIGltZ09wdHMgPSB7fVxuICAgIH1cbiAgICByZXR1cm4gbmV3IEltZyhpbWdPcHRzKVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJhZ3JhcGgoeyBjbHMsIHNldGlkLCB0ZXh0IH06IHsgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZywgdGV4dD86IHN0cmluZyB9KTogUGFyYWdyYXBoO1xuZXhwb3J0IGZ1bmN0aW9uIHBhcmFncmFwaCh7IGNscywgc2V0aWQsIGh0bWwgfTogeyBjbHM/OiBzdHJpbmcsIHNldGlkPzogc3RyaW5nLCBodG1sPzogc3RyaW5nIH0pOiBQYXJhZ3JhcGg7XG5leHBvcnQgZnVuY3Rpb24gcGFyYWdyYXBoKHsgYnlpZCwgY2hpbGRyZW4gfTogeyBieWlkOiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk6IFBhcmFncmFwaDtcbmV4cG9ydCBmdW5jdGlvbiBwYXJhZ3JhcGg8USBleHRlbmRzIFF1ZXJ5U2VsZWN0b3I+KHsgcXVlcnksIGNoaWxkcmVuIH06IHtcbiAgICBxdWVyeTogUXVlcnlPclByZWNpc2VUYWc8USwgXCJwXCI+LFxuICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBQYXJhZ3JhcGg7XG5leHBvcnQgZnVuY3Rpb24gcGFyYWdyYXBoKHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH06IHtcbiAgICBodG1sRWxlbWVudDogSFRNTFBhcmFncmFwaEVsZW1lbnQ7XG4gICAgY2hpbGRyZW4/OiBDaGlsZHJlbk9ialxufSk6IFBhcmFncmFwaDtcbmV4cG9ydCBmdW5jdGlvbiBwYXJhZ3JhcGgoKTogUGFyYWdyYXBoXG5leHBvcnQgZnVuY3Rpb24gcGFyYWdyYXBoKHBPcHRzPyk6IFBhcmFncmFwaCB7XG4gICAgaWYgKCFib29sKHBPcHRzKSkge1xuICAgICAgICBwT3B0cyA9IHt9XG4gICAgfVxuICAgIHJldHVybiBuZXcgUGFyYWdyYXBoKHBPcHRzKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5jaG9yKHsgY2xzLCBzZXRpZCwgaHJlZiwgdGFyZ2V0LCB0ZXh0IH06IHtcbiAgICBjbHM/OiBzdHJpbmcsXG4gICAgc2V0aWQ/OiBzdHJpbmcsXG4gICAgaHJlZj86IHN0cmluZ1xuICAgIHRhcmdldD86IHN0cmluZyxcbiAgICB0ZXh0Pzogc3RyaW5nLFxufSk6IEFuY2hvcjtcbmV4cG9ydCBmdW5jdGlvbiBhbmNob3IoeyBjbHMsIHNldGlkLCBocmVmLCB0YXJnZXQsIGh0bWwgfToge1xuICAgIGNscz86IHN0cmluZyxcbiAgICBzZXRpZD86IHN0cmluZyxcbiAgICBocmVmPzogc3RyaW5nXG4gICAgdGFyZ2V0Pzogc3RyaW5nLFxuICAgIGh0bWw/OiBzdHJpbmcsXG59KTogQW5jaG9yO1xuZXhwb3J0IGZ1bmN0aW9uIGFuY2hvcih7IGJ5aWQsIGNoaWxkcmVuIH06IHtcbiAgICBieWlkOiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBBbmNob3I7XG5leHBvcnQgZnVuY3Rpb24gYW5jaG9yPFEgZXh0ZW5kcyBRdWVyeVNlbGVjdG9yPih7IHF1ZXJ5LCBjaGlsZHJlbiB9OiB7XG4gICAgcXVlcnk6IFF1ZXJ5T3JQcmVjaXNlVGFnPFEsIFwiYVwiPixcbiAgICBjaGlsZHJlbj86IENoaWxkcmVuT2JqXG59KTogQW5jaG9yO1xuZXhwb3J0IGZ1bmN0aW9uIGFuY2hvcih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9OiB7XG4gICAgaHRtbEVsZW1lbnQ6IEhUTUxBbmNob3JFbGVtZW50O1xuICAgIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmpcbn0pOiBBbmNob3I7XG5leHBvcnQgZnVuY3Rpb24gYW5jaG9yKCk6IEFuY2hvclxuZXhwb3J0IGZ1bmN0aW9uIGFuY2hvcihhbmNob3JPcHRzPyk6IEFuY2hvciB7XG4gICAgaWYgKCFib29sKGFuY2hvck9wdHMpKSB7XG4gICAgICAgIGFuY2hvck9wdHMgPSB7fVxuICAgIH1cbiAgICByZXR1cm4gbmV3IEFuY2hvcihhbmNob3JPcHRzKVxufVxuXG5cblxuIl19