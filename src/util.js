"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function round(n, d = 0) {
    const fr = 10 ** d;
    return int(n * fr) / fr;
}
function float(str) {
    return parseFloat(str);
}
function int(x, base) {
    return parseInt(x, base);
}
exports.int = int;
function bool(val) {
    if (val === null)
        return false;
    const typeofval = typeof val;
    if (typeofval !== 'object') {
        if (typeofval === 'function')
            return true;
        else
            return !!val;
    }
    return Object.keys(val).length !== 0;
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
function wait(ms) {
    if (skipFade)
        return;
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function waitUntil(cond, timeout = Infinity, checkInterval = 20) {
    if (checkInterval <= 0)
        throw new Error(`checkInterval <= 0. checkInterval: ${checkInterval}`);
    if (checkInterval > timeout)
        throw new Error(`checkInterval > timeout (${checkInterval} > ${timeout}). Has to be lower than timeout.`);
    const loops = timeout / checkInterval;
    if (loops == 1)
        console.warn(`loops == 1, you probably didn't want this to happen`);
    let count = 0;
    while (count < loops) {
        if (cond())
            return true;
        await wait(checkInterval);
        count++;
    }
    return false;
}
let stuff = {
    '()=>{}': () => {
    }, 'function(){}': function () {
    }, 'Function': Function,
    'Function()': Function(),
    "new Function()": new Function(),
    "Boolean": Boolean,
    "Boolean()": Boolean(),
    "new Boolean()": new Boolean(),
    "new Boolean(true)": new Boolean(true),
    "new Boolean(false)": new Boolean(false),
    "true": true,
    "false": false,
    "Number": Number,
    "Number()": Number(),
    "new Number()": new Number(),
    "new Number(0)": new Number(0),
    "new Number(1)": new Number(1),
    "0": 0,
    "1": 1,
    "'0'": '0',
    "'1'": '1',
    "{}": {},
    "{ hi : 'bye' }": { hi: 'bye' },
    "[]": [],
    "[ 1 ]": [1],
    "undefined": undefined,
    "null": null,
};
function notnot(obj) {
    return !!obj;
}
function isArray(obj) {
    if (!obj)
        return false;
    return typeof obj !== 'string' && (Array.isArray(obj) || typeof obj[Symbol.iterator] === 'function');
}
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
function isObject(obj) {
    return typeof obj === 'object' && !!obj;
}
function shallowProperty(key) {
    return function (obj) {
        return obj == null ? void 0 : obj[key];
    };
}
function getLength(collection) {
    return shallowProperty('length')(collection);
}
function any(collection) {
    return collection.some(item => bool(item));
}
exports.any = any;
function all(arr) {
    return arr.every(item => bool(item));
}
exports.all = all;
function getCurrentWindow() {
    return remote.getCurrentWindow();
}
function reloadPage() {
    getCurrentWindow().reload();
}
exports.reloadPage = reloadPage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxTQUFTLEtBQUssQ0FBQyxDQUFTLEVBQUUsSUFBWSxDQUFDO0lBQ25DLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkIsT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUM1QixDQUFDO0FBRUQsU0FBUyxLQUFLLENBQUMsR0FBVztJQUN0QixPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBRUQsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQWlDO0lBQzdDLE9BQU8sUUFBUSxDQUFDLENBQUMsRUFBVyxJQUFJLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBdVlvQyxrQkFBRztBQXJZeEMsU0FBUyxJQUFJLENBQUMsR0FBUTtJQUNsQixJQUFLLEdBQUcsS0FBSyxJQUFJO1FBQ2IsT0FBTyxLQUFLLENBQUM7SUFDakIsTUFBTSxTQUFTLEdBQUcsT0FBTyxHQUFHLENBQUM7SUFDN0IsSUFBSyxTQUFTLEtBQUssUUFBUSxFQUFHO1FBQzFCLElBQUssU0FBUyxLQUFLLFVBQVU7WUFDekIsT0FBTyxJQUFJLENBQUM7O1lBRVosT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDO0tBQ3BCO0lBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7QUFDekMsQ0FBQztBQTBYa0Isb0JBQUk7QUF4WHZCLFNBQVMsU0FBUyxDQUFJLEdBQU07SUFjeEIsSUFBSSxTQUFTLEdBQUcsT0FBTyxHQUFHLENBQUM7SUFDM0IsSUFDSSxHQUFHLEtBQUssU0FBUztXQUNkLFVBQVUsQ0FBQyxHQUFHLENBQUM7V0FDZixVQUFVLENBQUMsR0FBRyxDQUFDO1dBRWYsR0FBRyxLQUFLLEVBQUUsRUFDZjtRQUNF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O0FBRUQsU0FBUyxVQUFVO0lBQ2YsZ0JBQWdCLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNoQyxDQUFDO0FBRXdCLGdDQUFVIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gcm91bmQobjogbnVtYmVyLCBkOiBudW1iZXIgPSAwKSB7XG4gICAgY29uc3QgZnIgPSAxMCAqKiBkO1xuICAgIHJldHVybiBpbnQobiAqIGZyKSAvIGZyO1xufVxuXG5mdW5jdGlvbiBmbG9hdChzdHI6IHN0cmluZyk6IG51bWJlciB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQoc3RyKTtcbn1cblxuZnVuY3Rpb24gaW50KHgsIGJhc2U/OiBzdHJpbmcgfCBudW1iZXIgfCBGdW5jdGlvbik6IG51bWJlciB7XG4gICAgcmV0dXJuIHBhcnNlSW50KHgsIDxudW1iZXI+IGJhc2UpO1xufVxuXG5mdW5jdGlvbiBib29sKHZhbDogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKCB2YWwgPT09IG51bGwgKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgdHlwZW9mdmFsID0gdHlwZW9mIHZhbDtcbiAgICBpZiAoIHR5cGVvZnZhbCAhPT0gJ29iamVjdCcgKSB7XG4gICAgICAgIGlmICggdHlwZW9mdmFsID09PSAnZnVuY3Rpb24nIClcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gISF2YWw7XG4gICAgfVxuICAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwpLmxlbmd0aCAhPT0gMDtcbn1cblxuZnVuY3Rpb24gZW51bWVyYXRlPFQ+KG9iajogVCk6IEVudW1lcmF0ZWQ8VD4ge1xuICAgIC8vIHVuZGVmaW5lZCAgICBbXVxuICAgIC8vIHt9ICAgICAgICAgICBbXVxuICAgIC8vIFtdICAgICAgICAgICBbXVxuICAgIC8vIFwiXCIgICAgICAgICAgIFtdXG4gICAgLy8gbnVtYmVyICAgICAgIFR5cGVFcnJvclxuICAgIC8vIG51bGwgICAgICAgICBUeXBlRXJyb3JcbiAgICAvLyBib29sZWFuICAgICAgVHlwZUVycm9yXG4gICAgLy8gRnVuY3Rpb24gICAgIFR5cGVFcnJvclxuICAgIC8vIFwiZm9vXCIgICAgICAgIFsgWzAsIFwiZlwiXSwgWzEsIFwib1wiXSwgWzIsIFwib1wiXSBdXG4gICAgLy8gWyBcImZvb1wiIF0gICAgWyBbMCwgXCJmb29cIl0gXVxuICAgIC8vIFsgMTAgXSAgICAgICBbIFswLCAxMF0gXVxuICAgIC8vIHsgYTogXCJmb29cIiB9IFsgW1wiYVwiLCBcImZvb1wiXSBdXG4gICAgLy8gLy8gKCk9Pnt9ICAgID9cbiAgICBsZXQgdHlwZW9mT2JqID0gdHlwZW9mIG9iajtcbiAgICBpZiAoXG4gICAgICAgIG9iaiA9PT0gdW5kZWZpbmVkXG4gICAgICAgIHx8IGlzRW1wdHlPYmoob2JqKVxuICAgICAgICB8fCBpc0VtcHR5QXJyKG9iailcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB8fCBvYmogPT09IFwiXCJcbiAgICApIHtcbiAgICAgICAgcmV0dXJuIFtdIGFzIEVudW1lcmF0ZWQ8VD47XG4gICAgfVxuICAgIFxuICAgIGlmIChcbiAgICAgICAgb2JqID09PSBudWxsXG4gICAgICAgIHx8IHR5cGVvZk9iaiA9PT0gXCJib29sZWFuXCJcbiAgICAgICAgfHwgdHlwZW9mT2JqID09PSBcIm51bWJlclwiXG4gICAgICAgIHx8IHR5cGVvZk9iaiA9PT0gXCJmdW5jdGlvblwiXG4gICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYCR7dHlwZW9mT2JqfSBvYmplY3QgaXMgbm90IGl0ZXJhYmxlYCk7XG4gICAgfVxuICAgIGxldCBhcnJheSA9IFtdO1xuICAgIGlmICggaXNBcnJheShvYmopICkge1xuICAgICAgICBsZXQgaTogbnVtYmVyID0gMDtcbiAgICAgICAgZm9yICggbGV0IHggb2Ygb2JqICkge1xuICAgICAgICAgICAgYXJyYXkucHVzaChbIGksIHggXSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKCBsZXQgcHJvcCBpbiBvYmogKSB7XG4gICAgICAgICAgICBhcnJheS5wdXNoKFsgcHJvcCwgb2JqW3Byb3BdIF0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheSBhcyBFbnVtZXJhdGVkPFQ+O1xufVxuXG5mdW5jdGlvbiB3YWl0KG1zOiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmICggc2tpcEZhZGUgKVxuICAgICAgICByZXR1cm47XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xufVxuXG4vKipDaGVjayBldmVyeSBgY2hlY2tJbnRlcnZhbGAgbXMgaWYgYGNvbmQoKWAgaXMgdHJ1dGh5LiBJZiwgd2l0aGluIGB0aW1lb3V0YCwgY29uZCgpIGlzIHRydXRoeSwgcmV0dXJuIGB0cnVlYC4gUmV0dXJuIGBmYWxzZWAgaWYgdGltZSBpcyBvdXQuXG4gKiBAZXhhbXBsZVxuICogLy8gR2l2ZSB0aGUgdXNlciBhIDIwMG1zIGNoYW5jZSB0byBnZXQgaGVyIHBvaW50ZXIgb3ZlciBcIm15ZGl2XCIuIENvbnRpbnVlIGltbWVkaWF0ZWx5IG9uY2Ugc2hlIGRvZXMsIG9yIGFmdGVyIDIwMG1zIGlmIHNoZSBkb2Vzbid0LlxuICogbXlkaXYucG9pbnRlcmVudGVyKCAoKSA9PiBteWRpdi5wb2ludGVySG92ZXJpbmcgPSB0cnVlOyApXG4gKiBjb25zdCBwb2ludGVyT25NeWRpdiA9IGF3YWl0IHdhaXRVbnRpbCgoKSA9PiBteWRpdi5wb2ludGVySG92ZXJpbmcsIDIwMCwgMTApOyovXG5hc3luYyBmdW5jdGlvbiB3YWl0VW50aWwoY29uZDogKCkgPT4gYm9vbGVhbiwgdGltZW91dDogbnVtYmVyID0gSW5maW5pdHksIGNoZWNrSW50ZXJ2YWw6IG51bWJlciA9IDIwKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKCBjaGVja0ludGVydmFsIDw9IDAgKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGNoZWNrSW50ZXJ2YWwgPD0gMC4gY2hlY2tJbnRlcnZhbDogJHtjaGVja0ludGVydmFsfWApO1xuICAgIGlmICggY2hlY2tJbnRlcnZhbCA+IHRpbWVvdXQgKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGNoZWNrSW50ZXJ2YWwgPiB0aW1lb3V0ICgke2NoZWNrSW50ZXJ2YWx9ID4gJHt0aW1lb3V0fSkuIEhhcyB0byBiZSBsb3dlciB0aGFuIHRpbWVvdXQuYCk7XG4gICAgXG4gICAgY29uc3QgbG9vcHMgPSB0aW1lb3V0IC8gY2hlY2tJbnRlcnZhbDtcbiAgICBpZiAoIGxvb3BzID09IDEgKVxuICAgICAgICBjb25zb2xlLndhcm4oYGxvb3BzID09IDEsIHlvdSBwcm9iYWJseSBkaWRuJ3Qgd2FudCB0aGlzIHRvIGhhcHBlbmApO1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgd2hpbGUgKCBjb3VudCA8IGxvb3BzICkge1xuICAgICAgICBpZiAoIGNvbmQoKSApXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgYXdhaXQgd2FpdChjaGVja0ludGVydmFsKTtcbiAgICAgICAgY291bnQrKztcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5sZXQgc3R1ZmYgPSB7XG4gICAgJygpPT57fScgOiAoKSA9PiB7XG4gICAgfSwgJ2Z1bmN0aW9uKCl7fScgOiBmdW5jdGlvbiAoKSB7XG4gICAgfSwgJ0Z1bmN0aW9uJyA6IEZ1bmN0aW9uLFxuICAgICdGdW5jdGlvbigpJyA6IEZ1bmN0aW9uKCksXG4gICAgXCJuZXcgRnVuY3Rpb24oKVwiIDogbmV3IEZ1bmN0aW9uKCksXG4gICAgXCJCb29sZWFuXCIgOiBCb29sZWFuLFxuICAgIFwiQm9vbGVhbigpXCIgOiBCb29sZWFuKCksXG4gICAgXCJuZXcgQm9vbGVhbigpXCIgOiBuZXcgQm9vbGVhbigpLFxuICAgIFwibmV3IEJvb2xlYW4odHJ1ZSlcIiA6IG5ldyBCb29sZWFuKHRydWUpLFxuICAgIFwibmV3IEJvb2xlYW4oZmFsc2UpXCIgOiBuZXcgQm9vbGVhbihmYWxzZSksXG4gICAgXCJ0cnVlXCIgOiB0cnVlLFxuICAgIFwiZmFsc2VcIiA6IGZhbHNlLFxuICAgIFwiTnVtYmVyXCIgOiBOdW1iZXIsXG4gICAgXCJOdW1iZXIoKVwiIDogTnVtYmVyKCksXG4gICAgXCJuZXcgTnVtYmVyKClcIiA6IG5ldyBOdW1iZXIoKSxcbiAgICBcIm5ldyBOdW1iZXIoMClcIiA6IG5ldyBOdW1iZXIoMCksXG4gICAgXCJuZXcgTnVtYmVyKDEpXCIgOiBuZXcgTnVtYmVyKDEpLFxuICAgIFwiMFwiIDogMCxcbiAgICBcIjFcIiA6IDEsXG4gICAgXCInMCdcIiA6ICcwJyxcbiAgICBcIicxJ1wiIDogJzEnLFxuICAgIFwie31cIiA6IHt9LFxuICAgIFwieyBoaSA6ICdieWUnIH1cIiA6IHsgaGkgOiAnYnllJyB9LFxuICAgIFwiW11cIiA6IFtdLFxuICAgIFwiWyAxIF1cIiA6IFsgMSBdLFxuICAgIFwidW5kZWZpbmVkXCIgOiB1bmRlZmluZWQsXG4gICAgXCJudWxsXCIgOiBudWxsLFxufTtcblxuZnVuY3Rpb24gbm90bm90KG9iaikge1xuICAgIC8vIC8gMCAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIDEgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gKCk9Pnt9ICAgICAgICAgICAgIHRydWVcbiAgICAvLyBmdW5jdGlvbigpe30gICAgICAgdHJ1ZVxuICAgIC8vIEZ1bmN0aW9uICAgICAgICAgICB0cnVlXG4gICAgLy8gRnVuY3Rpb24oKSAgICAgICAgIHRydWVcbiAgICAvLyBuZXcgRnVuY3Rpb24oKSAgICAgdHJ1ZVxuICAgIC8vIEJvb2xlYW4gICAgICAgICAgICB0cnVlXG4gICAgLy8gLyAgQm9vbGVhbigpICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4oKSAgICAgIHRydWVcbiAgICAvLyBuZXcgQm9vbGVhbih0cnVlKSAgdHJ1ZVxuICAgIC8vIG5ldyBCb29sZWFuKGZhbHNlKSB0cnVlXG4gICAgLy8gdHJ1ZSAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyAvICBmYWxzZSAgICAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIC8gIE51bWJlcigpICAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoKSAgICAgICB0cnVlXG4gICAgLy8gbmV3IE51bWJlcigwKSAgICAgIHRydWVcbiAgICAvLyBuZXcgTnVtYmVyKDEpICAgICAgdHJ1ZVxuICAgIC8vIC8gJycgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcgJyAgICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gJzAnICAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyAnMScgICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIHt9ICAgICAgICAgICAgICAgICB0cnVlXG4gICAgLy8geyBoaSA6ICdieWUnIH0gICAgIHRydWVcbiAgICAvLyBbXSAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIFsgMSBdICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gLyAgdW5kZWZpbmVkICAgICAgIGZhbHNlXG4gICAgLy8gLyAgbnVsbCAgICAgICAgICAgIGZhbHNlXG4gICAgcmV0dXJuICEhb2JqO1xufVxuXG5mdW5jdGlvbiBpc0FycmF5PFQ+KG9iaik6IG9iaiBpcyBBcnJheTxUPiB7XG4gICAgLy8gMCAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIDEgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnJyAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJyAnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcwJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMScgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gKCk9Pnt9ICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIEJvb2xlYW4gICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuKCkgICAgICAgICAgIGZhbHNlXG4gICAgLy8gRnVuY3Rpb24gICAgICAgICAgICBmYWxzZVxuICAgIC8vIEZ1bmN0aW9uKCkgICAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gTnVtYmVyKCkgICAgICAgICAgICBmYWxzZVxuICAgIC8vIC8gWyAxIF0gICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIC8gW10gICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIGZhbHNlICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBmdW5jdGlvbigpe30gICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4oKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBCb29sZWFuKGZhbHNlKSAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbih0cnVlKSAgIGZhbHNlXG4gICAgLy8gbmV3IEZ1bmN0aW9uKCkgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoMCkgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgTnVtYmVyKDEpICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigpICAgICAgICBmYWxzZVxuICAgIC8vIG51bGwgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB0cnVlICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdW5kZWZpbmVkICAgICAgICAgICBmYWxzZVxuICAgIC8vIHsgaGkgOiAnYnllJyB9ICAgICAgZmFsc2VcbiAgICAvLyB7fSAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgaWYgKCAhb2JqICkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0eXBlb2Ygb2JqICE9PSAnc3RyaW5nJyAmJiAoQXJyYXkuaXNBcnJheShvYmopIHx8IHR5cGVvZiBvYmpbU3ltYm9sLml0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJyk7XG59XG5cbmZ1bmN0aW9uIGlzRW1wdHkob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgICAvLyAwICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gMSAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcnICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnICcgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzAnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcxJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAoKT0+e30gICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbiAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIEJvb2xlYW4oKSAgICAgICAgICAgZmFsc2VcbiAgICAvLyBGdW5jdGlvbiAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gRnVuY3Rpb24oKSAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlciAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIoKSAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gWyAxIF0gICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIC8gW10gICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIGZhbHNlICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBmdW5jdGlvbigpe30gICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4oKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBCb29sZWFuKGZhbHNlKSAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbih0cnVlKSAgIGZhbHNlXG4gICAgLy8gbmV3IEZ1bmN0aW9uKCkgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoMCkgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgTnVtYmVyKDEpICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigpICAgICAgICBmYWxzZVxuICAgIC8vIG51bGwgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB0cnVlICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdW5kZWZpbmVkICAgICAgICAgICBmYWxzZVxuICAgIC8vIHsgaGkgOiAnYnllJyB9ICAgICAgZmFsc2VcbiAgICAvLyAvIHt9ICAgICAgICAgICAgICAgIHRydWVcbiAgICBsZXQgdG9TdHJpbmdlZCA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcbiAgICByZXR1cm4gKHRvU3RyaW5nZWQgPT09ICdbb2JqZWN0IE9iamVjdF0nIHx8IHRvU3RyaW5nZWQgPT09ICdbb2JqZWN0IEFycmF5XScpICYmIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09IDA7XG59XG5cbmZ1bmN0aW9uIGlzRW1wdHlBcnIoY29sbGVjdGlvbik6IGJvb2xlYW4ge1xuICAgIC8vIDAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAxICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJycgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcgJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMCcgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzEnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICgpPT57fSAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbigpICAgICAgICAgICBmYWxzZVxuICAgIC8vIEZ1bmN0aW9uICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBGdW5jdGlvbigpICAgICAgICAgIGZhbHNlXG4gICAgLy8gTnVtYmVyICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlcigpICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBbIDEgXSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gLyBbXSAgICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gZmFsc2UgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIGZ1bmN0aW9uKCl7fSAgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbigpICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4oZmFsc2UpICBmYWxzZVxuICAgIC8vIG5ldyBCb29sZWFuKHRydWUpICAgZmFsc2VcbiAgICAvLyBuZXcgRnVuY3Rpb24oKSAgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigwKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoMSkgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgTnVtYmVyKCkgICAgICAgIGZhbHNlXG4gICAgLy8gbnVsbCAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHRydWUgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB1bmRlZmluZWQgICAgICAgICAgIGZhbHNlXG4gICAgLy8geyBoaSA6ICdieWUnIH0gICAgICBmYWxzZVxuICAgIC8vIHt9ICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICByZXR1cm4gaXNBcnJheShjb2xsZWN0aW9uKSAmJiBnZXRMZW5ndGgoY29sbGVjdGlvbikgPT09IDBcbn1cblxuZnVuY3Rpb24gaXNFbXB0eU9iaihvYmopOiBib29sZWFuIHtcbiAgICAvLyAwICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gMSAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcnICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnICcgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzAnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcxJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAoKT0+e30gICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbiAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIEJvb2xlYW4oKSAgICAgICAgICAgZmFsc2VcbiAgICAvLyBGdW5jdGlvbiAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gRnVuY3Rpb24oKSAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlciAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIoKSAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gWyAxIF0gICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIFtdICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBmYWxzZSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gZnVuY3Rpb24oKXt9ICAgICAgICBmYWxzZVxuICAgIC8vIC8gbmV3IEJvb2xlYW4oKSAgICAgdHJ1ZVxuICAgIC8vIC8gbmV3IEJvb2xlYW4oZmFsc2UpdHJ1ZVxuICAgIC8vIC8gbmV3IEJvb2xlYW4odHJ1ZSkgdHJ1ZVxuICAgIC8vIG5ldyBGdW5jdGlvbigpICAgICAgZmFsc2VcbiAgICAvLyAvIG5ldyBOdW1iZXIoMCkgICAgIHRydWVcbiAgICAvLyAvIG5ldyBOdW1iZXIoMSkgICAgIHRydWVcbiAgICAvLyAvIG5ldyBOdW1iZXIoKSAgICAgIHRydWVcbiAgICAvLyBudWxsICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdHJ1ZSAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHVuZGVmaW5lZCAgICAgICAgICAgZmFsc2VcbiAgICAvLyB7IGhpIDogJ2J5ZScgfSAgICAgIGZhbHNlXG4gICAgLy8gLyB7fSAgICAgICAgICAgICAgICB0cnVlXG4gICAgcmV0dXJuIGlzT2JqZWN0KG9iaikgJiYgIWlzQXJyYXkob2JqKSAmJiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMFxufVxuXG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oZm46IEFueUZ1bmN0aW9uKTogZm4gaXMgQW55RnVuY3Rpb24ge1xuICAgIC8vIDAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAxICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJycgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcgJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMCcgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzEnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIC8gKCk9Pnt9ICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gLyBCb29sZWFuICAgICAgICAgICAgIHRydWVcbiAgICAvLyBCb29sZWFuKCkgICAgICAgICAgIGZhbHNlXG4gICAgLy8gLyBGdW5jdGlvbiAgICAgICAgICAgIHRydWVcbiAgICAvLyAvIEZ1bmN0aW9uKCkgICAgICAgICAgdHJ1ZVxuICAgIC8vIC8gTnVtYmVyICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gTnVtYmVyKCkgICAgICAgICAgICBmYWxzZVxuICAgIC8vIFsgMSBdICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBbXSAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gZmFsc2UgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIC8gZnVuY3Rpb24oKXt9ICAgICAgICB0cnVlXG4gICAgLy8gbmV3IEJvb2xlYW4oKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBCb29sZWFuKGZhbHNlKSAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbih0cnVlKSAgIGZhbHNlXG4gICAgLy8gLyBuZXcgRnVuY3Rpb24oKSAgICAgIHRydWVcbiAgICAvLyBuZXcgTnVtYmVyKDApICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigxKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoKSAgICAgICAgZmFsc2VcbiAgICAvLyBudWxsICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdHJ1ZSAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHVuZGVmaW5lZCAgICAgICAgICAgZmFsc2VcbiAgICAvLyB7IGhpIDogJ2J5ZScgfSAgICAgIGZhbHNlXG4gICAgLy8ge30gICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIGxldCB0b1N0cmluZ2VkID0ge30udG9TdHJpbmcuY2FsbChmbik7XG4gICAgcmV0dXJuICEhZm4gJiYgdG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJ1xufVxuXG5cbi8vICogIHVuZGVyc2NvcmUuanNcbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaik6IGJvb2xlYW4ge1xuICAgIC8vIDAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAxICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJycgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcgJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMCcgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzEnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICgpPT57fSAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbigpICAgICAgICAgICBmYWxzZVxuICAgIC8vIEZ1bmN0aW9uICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBGdW5jdGlvbigpICAgICAgICAgIGZhbHNlXG4gICAgLy8gTnVtYmVyICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlcigpICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAvIFsgMSBdICAgICAgICAgICAgIHRydWVcbiAgICAvLyAvIFtdICAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyBmYWxzZSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gZnVuY3Rpb24oKXt9ICAgICAgICBmYWxzZVxuICAgIC8vIC8gbmV3IEJvb2xlYW4oKSAgICAgdHJ1ZVxuICAgIC8vIC8gbmV3IEJvb2xlYW4oZmFsc2UpdHJ1ZVxuICAgIC8vIC8gbmV3IEJvb2xlYW4odHJ1ZSkgdHJ1ZVxuICAgIC8vIG5ldyBGdW5jdGlvbigpICAgICAgZmFsc2VcbiAgICAvLyAvIG5ldyBOdW1iZXIoMCkgICAgIHRydWVcbiAgICAvLyAvIG5ldyBOdW1iZXIoMSkgICAgIHRydWVcbiAgICAvLyAvIG5ldyBOdW1iZXIoKSAgICAgIHRydWVcbiAgICAvLyBudWxsICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdHJ1ZSAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHVuZGVmaW5lZCAgICAgICAgICAgZmFsc2VcbiAgICAvLyAvIHsgaGkgOiAnYnllJyB9ICAgIHRydWVcbiAgICAvLyAvIHt9ICAgICAgICAgICAgICAgIHRydWVcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG59XG5cblxuZnVuY3Rpb24gc2hhbGxvd1Byb3BlcnR5PFQ+KGtleTogc3RyaW5nKTogKG9iajogVCkgPT4gVCBleHRlbmRzIG51bGwgPyB1bmRlZmluZWQgOiBUW2tleW9mIFRdIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAvLyA9PSBudWxsIHRydWUgZm9yIHVuZGVmaW5lZFxuICAgICAgICByZXR1cm4gb2JqID09IG51bGwgPyB2b2lkIDAgOiBvYmpba2V5XTtcbiAgICB9O1xufVxuXG5cbmZ1bmN0aW9uIGdldExlbmd0aChjb2xsZWN0aW9uKTogbnVtYmVyIHtcbiAgICByZXR1cm4gc2hhbGxvd1Byb3BlcnR5KCdsZW5ndGgnKShjb2xsZWN0aW9uKVxufVxuXG5cbmZ1bmN0aW9uIGFueShjb2xsZWN0aW9uOiBhbnlbXSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBjb2xsZWN0aW9uLnNvbWUoaXRlbSA9PiBib29sKGl0ZW0pKTtcbn1cblxuXG5mdW5jdGlvbiBhbGwoYXJyOiBhbnlbXSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhcnIuZXZlcnkoaXRlbSA9PiBib29sKGl0ZW0pKTtcbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudFdpbmRvdygpIHtcbiAgICByZXR1cm4gcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKTtcbn1cblxuZnVuY3Rpb24gcmVsb2FkUGFnZSgpIHtcbiAgICBnZXRDdXJyZW50V2luZG93KCkucmVsb2FkKCk7XG59XG5cbmV4cG9ydCB7IGFueSwgYWxsLCBib29sLCByZWxvYWRQYWdlLCBpbnQgfVxuIl19