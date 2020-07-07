"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs = require("fs");
const path = require("path");
const MyFs_1 = require("./MyFs");
function round(n, d = 0) {
    const fr = 10 ** d;
    return parseInt(n * fr) / fr;
}
function int(x, base) {
    return parseInt(x, base);
}
function str(val) {
    return val ? val.toString() : "";
}
exports.str = str;
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
function wait(ms, honorSkipFade = true) {
    if (honorSkipFade) {
        if (require('./Glob').default.skipFade) {
            console.warn(`skipFade!`);
            return;
        }
    }
    if (!bool(ms)) {
        console.warn(`util.wait(${ms})`);
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.wait = wait;
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
        await wait(checkInterval, false);
        count++;
    }
    return false;
}
exports.waitUntil = waitUntil;
function notnot(obj) {
    return !!obj;
}
function isString(obj) {
    return typeof obj === "string";
}
exports.isString = isString;
function isArray(obj) {
    if (!obj) {
        return false;
    }
    return typeof obj !== 'string' && (Array.isArray(obj) || typeof obj[Symbol.iterator] === 'function');
}
exports.isArray = isArray;
function isEmpty(obj) {
    let toStringed = {}.toString.call(obj);
    return (toStringed === '[object Object]' || toStringed === '[object Array]') && Object.keys(obj).length == 0;
}
function isEmptyArr(collection) {
    return isArray(collection) && getLength(collection) === 0;
}
function isEmptyObj(obj) {
    return isObject(obj) && !isArray(obj) && Object.keys(obj).length === 0;
}
function isFunction(fn) {
    let toStringed = {}.toString.call(fn);
    return !!fn && toStringed === '[object Function]';
}
exports.isFunction = isFunction;
function isTMap(obj) {
    return {}.toString.call(obj) == '[object Object]';
}
function isObject(obj) {
    return typeof obj === 'object' && !!obj;
}
exports.isObject = isObject;
function shallowProperty(key) {
    return function (obj) {
        return obj == null ? void 0 : obj[key];
    };
}
function getLength(collection) {
    return shallowProperty('length')(collection);
}
function any(...args) {
    for (let a of args) {
        if (bool(a)) {
            return true;
        }
    }
    return false;
}
exports.any = any;
function all(...args) {
    for (let a of args) {
        if (!bool(a)) {
            return false;
        }
    }
    return true;
}
exports.all = all;
function sum(arr) {
    let sum = 0;
    let dirty = false;
    for (let v of arr) {
        let number = parseFloat(v);
        if (!isNaN(number)) {
            dirty = true;
            sum += number;
        }
    }
    return !dirty ? undefined : sum;
}
exports.sum = sum;
function getCurrentWindow() {
    return electron_1.remote.getCurrentWindow();
}
exports.getCurrentWindow = getCurrentWindow;
function reloadPage() {
    if (require("./Glob").default.BigConfig.dev.no_reload_on_submit()) {
        return;
    }
    getCurrentWindow().reload();
}
exports.reloadPage = reloadPage;
function* range(start, stop) {
    for (let i = start; i <= stop; i++) {
        yield i;
    }
}
exports.range = range;
async function takeScreenshot(dirname) {
    const webContents = electron_1.remote.getCurrentWebContents();
    const image = await webContents.capturePage();
    MyFs_1.default.createIfNotExists(SESSION_PATH_ABS);
    const dirnameAbs = path.join(SESSION_PATH_ABS, dirname);
    MyFs_1.default.createIfNotExists(dirnameAbs);
    const files = { png: undefined, html: undefined };
    if (fs.existsSync(path.join(dirnameAbs, 'page.png'))) {
        files.png = `${dirnameAbs}/page__${new Date().human()}.png`;
    }
    else {
        files.png = path.join(dirnameAbs, 'page.png');
    }
    fs.writeFileSync(files.png, image.toPNG());
    if (fs.existsSync(path.join(dirnameAbs, 'screenshot.html'))) {
        files.html = `${dirnameAbs}/screenshot__${new Date().human()}.html`;
    }
    else {
        files.html = path.join(dirnameAbs, 'screenshot.html');
    }
    return await webContents.savePage(files.html, "HTMLComplete");
}
exports.takeScreenshot = takeScreenshot;
function ignoreErr(fn) {
    try {
        fn();
    }
    catch (e) {
        console.warn(`IGNORED ERROR: `, e);
    }
}
exports.ignoreErr = ignoreErr;
//# sourceMappingURL=util.js.map