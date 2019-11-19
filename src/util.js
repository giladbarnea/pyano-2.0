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
    // undefined    []
    // {}           []
    // []           []
    // ""           []
    // number       TypeError
    // null         TypeError
    // boolean      TypeError
    // Function     TypeError
    // "foo"        [ [0, "f"], [1, "o"], [2, "o"] ]
    // [ "foo" ]    [ [0, "foo"] ]
    // [ 10 ]       [ [0, 10] ]
    // { a: "foo" } [ ["a", "foo"] ]
    // // ()=>{}    ?
    let typeofObj = typeof obj;
    if (obj === undefined
        || isEmptyObj(obj)
        || isEmptyArr(obj)
        // @ts-ignore
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
/**Check every `checkInterval` ms if `cond()` is truthy. If, within `timeout`, cond() is truthy, return `true`. Return `false` if time is out.
 * @example
 * // Give the user a 200ms chance to get her pointer over "mydiv". Continue immediately once she does, or after 200ms if she doesn't.
 * mydiv.pointerenter( () => mydiv.pointerHovering = true; )
 * const pointerOnMydiv = await waitUntil(() => mydiv.pointerHovering, 200, 10);*/
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
    // / 0                false
    // 1                  true
    // ()=>{}             true
    // function(){}       true
    // Function           true
    // Function()         true
    // new Function()     true
    // Boolean            true
    // /  Boolean()       false
    // new Boolean()      true
    // new Boolean(true)  true
    // new Boolean(false) true
    // true               true
    // /  false           false
    // Number             true
    // /  Number()        false
    // new Number()       true
    // new Number(0)      true
    // new Number(1)      true
    // '0'                true
    // '1'                true
    // {}                 true
    // { hi : 'bye' }     true
    // []                 true
    // [ 1 ]              true
    // /  undefined       false
    // /  null            false
    return !!obj;
}
function isArray(obj) {
    // 0                   false
    // 1                   false
    // '0'                 false
    // '1'                 false
    // ()=>{}              false
    // Boolean             false
    // Boolean()           false
    // Function            false
    // Function()          false
    // Number              false
    // Number()            false
    // / [ 1 ]             true
    // / []                true
    // false               false
    // function(){}        false
    // new Boolean()       false
    // new Boolean(false)  false
    // new Boolean(true)   false
    // new Function()      false
    // new Number(0)       false
    // new Number(1)       false
    // new Number()        false
    // null                false
    // true                false
    // undefined           false
    // { hi : 'bye' }      false
    // {}                  false
    if (!obj)
        return false;
    return typeof obj !== 'string' && (Array.isArray(obj) || typeof obj[Symbol.iterator] === 'function');
}
function isEmptyArr(collection) {
    // 0                   false
    // 1                   false
    // '0'                 false
    // '1'                 false
    // ()=>{}              false
    // Boolean             false
    // Boolean()           false
    // Function            false
    // Function()          false
    // Number              false
    // Number()            false
    // [ 1 ]               false
    // / []                true
    // false               false
    // function(){}        false
    // new Boolean()       false
    // new Boolean(false)  false
    // new Boolean(true)   false
    // new Function()      false
    // new Number(0)       false
    // new Number(1)       false
    // new Number()        false
    // null                false
    // true                false
    // undefined           false
    // { hi : 'bye' }      false
    // {}                  false
    return isArray(collection) && getLength(collection) === 0;
}
function isEmptyObj(obj) {
    // 0                   false
    // 1                   false
    // '0'                 false
    // '1'                 false
    // ()=>{}              false
    // Boolean             false
    // Boolean()           false
    // Function            false
    // Function()          false
    // Number              false
    // Number()            false
    // [ 1 ]               false
    // []                  false
    // false               false
    // function(){}        false
    // / new Boolean()     true
    // / new Boolean(false)true
    // / new Boolean(true) true
    // new Function()      false
    // / new Number(0)     true
    // / new Number(1)     true
    // / new Number()      true
    // null                false
    // true                false
    // undefined           false
    // { hi : 'bye' }      false
    // / {}                true
    return isObject(obj) && !isArray(obj) && Object.keys(obj).length === 0;
}
function isFunction(fn) {
    // 0                   false
    // 1                   false
    // '0'                 false
    // '1'                 false
    // / ()=>{}              true
    // / Boolean             true
    // Boolean()           false
    // / Function            true
    // / Function()          true
    // / Number              true
    // Number()            false
    // [ 1 ]               false
    // []                  false
    // false               false
    // / function(){}        true
    // new Boolean()       false
    // new Boolean(false)  false
    // new Boolean(true)   false
    // / new Function()      true
    // new Number(0)       false
    // new Number(1)       false
    // new Number()        false
    // null                false
    // true                false
    // undefined           false
    // { hi : 'bye' }      false
    // {}                  false
    let toStringed = {}.toString.call(fn);
    return !!fn && toStringed === '[object Function]';
}
// *  underscore.js
function isObject(obj) {
    // 0                   false
    // 1                   false
    // '0'                 false
    // '1'                 false
    // ()=>{}              false
    // Boolean             false
    // Boolean()           false
    // Function            false
    // Function()          false
    // Number              false
    // Number()            false
    // / [ 1 ]             true
    // / []                true
    // false               false
    // function(){}        false
    // / new Boolean()     true
    // / new Boolean(false)true
    // / new Boolean(true) true
    // new Function()      false
    // / new Number(0)     true
    // / new Number(1)     true
    // / new Number()      true
    // null                false
    // true                false
    // undefined           false
    // / { hi : 'bye' }    true
    // / {}                true
    return typeof obj === 'object' && !!obj;
}
function shallowProperty(key) {
    return function (obj) {
        // == null true for undefined
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxTQUFTLEtBQUssQ0FBQyxDQUFTLEVBQUUsSUFBWSxDQUFDO0lBQ25DLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkIsT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUM1QixDQUFDO0FBRUQsU0FBUyxLQUFLLENBQUMsR0FBVztJQUN0QixPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBRUQsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQWlDO0lBQzdDLE9BQU8sUUFBUSxDQUFDLENBQUMsRUFBVyxJQUFJLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBd1ZvQyxrQkFBRztBQXRWeEMsU0FBUyxJQUFJLENBQUMsR0FBUTtJQUNsQixJQUFLLEdBQUcsS0FBSyxJQUFJO1FBQ2IsT0FBTyxLQUFLLENBQUM7SUFDakIsTUFBTSxTQUFTLEdBQUcsT0FBTyxHQUFHLENBQUM7SUFDN0IsSUFBSyxTQUFTLEtBQUssUUFBUSxFQUFHO1FBQzFCLElBQUssU0FBUyxLQUFLLFVBQVU7WUFDekIsT0FBTyxJQUFJLENBQUM7O1lBRVosT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDO0tBQ3BCO0lBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7QUFDekMsQ0FBQztBQTJVa0Isb0JBQUk7QUF6VXZCLFNBQVMsU0FBUyxDQUFJLEdBQU07SUFDeEIsa0JBQWtCO0lBQ2xCLGtCQUFrQjtJQUNsQixrQkFBa0I7SUFDbEIsa0JBQWtCO0lBQ2xCLHlCQUF5QjtJQUN6Qix5QkFBeUI7SUFDekIseUJBQXlCO0lBQ3pCLHlCQUF5QjtJQUN6QixnREFBZ0Q7SUFDaEQsOEJBQThCO0lBQzlCLDJCQUEy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NEI7SUFDNUIsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsNEJBQTRCO0lBQzVCLDJCQUEyQjtJQUMzQiwyQkFBMkI7SUFDM0IsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1QixJQUFLLENBQUMsR0FBRztRQUFHLE9BQU8sS0FBSyxDQUFDO0lBQ3pCLE9BQU8sT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssVUFBVSxDQUFDLENBQUM7QUFDekcsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLFVBQVU7SUFDMUIsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsMkJBQTJCO0lBQzNCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsNEJBQTRCO0lBQzVCLDRCQUE0QjtJQUM1Qiw0QkFBNEI7SUFDNUIsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksU0FB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QjtJQUMxQixPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBZVEsa0JBQUc7QUFaWixTQUFTLEdBQUcsQ0FBQyxHQUFVO0lBQ25CLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFVYSxrQkFBRztBQVJqQixTQUFTLGdCQUFnQjtJQUNyQixPQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3JDLENBQUM7QUFFRCxTQUFTLFVBQVU7SUFDZixnQkFBZ0IsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLENBQUM7QUFFd0IsZ0NBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiByb3VuZChuOiBudW1iZXIsIGQ6IG51bWJlciA9IDApIHtcbiAgICBjb25zdCBmciA9IDEwICoqIGQ7XG4gICAgcmV0dXJuIGludChuICogZnIpIC8gZnI7XG59XG5cbmZ1bmN0aW9uIGZsb2F0KHN0cjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xufVxuXG5mdW5jdGlvbiBpbnQoeCwgYmFzZT86IHN0cmluZyB8IG51bWJlciB8IEZ1bmN0aW9uKTogbnVtYmVyIHtcbiAgICByZXR1cm4gcGFyc2VJbnQoeCwgPG51bWJlcj4gYmFzZSk7XG59XG5cbmZ1bmN0aW9uIGJvb2wodmFsOiBhbnkpOiBib29sZWFuIHtcbiAgICBpZiAoIHZhbCA9PT0gbnVsbCApXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCB0eXBlb2Z2YWwgPSB0eXBlb2YgdmFsO1xuICAgIGlmICggdHlwZW9mdmFsICE9PSAnb2JqZWN0JyApIHtcbiAgICAgICAgaWYgKCB0eXBlb2Z2YWwgPT09ICdmdW5jdGlvbicgKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiAhIXZhbDtcbiAgICB9XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHZhbCkubGVuZ3RoICE9PSAwO1xufVxuXG5mdW5jdGlvbiBlbnVtZXJhdGU8VD4ob2JqOiBUKTogRW51bWVyYXRlZDxUPiB7XG4gICAgLy8gdW5kZWZpbmVkICAgIFtdXG4gICAgLy8ge30gICAgICAgICAgIFtdXG4gICAgLy8gW10gICAgICAgICAgIFtdXG4gICAgLy8gXCJcIiAgICAgICAgICAgW11cbiAgICAvLyBudW1iZXIgICAgICAgVHlwZUVycm9yXG4gICAgLy8gbnVsbCAgICAgICAgIFR5cGVFcnJvclxuICAgIC8vIGJvb2xlYW4gICAgICBUeXBlRXJyb3JcbiAgICAvLyBGdW5jdGlvbiAgICAgVHlwZUVycm9yXG4gICAgLy8gXCJmb29cIiAgICAgICAgWyBbMCwgXCJmXCJdLCBbMSwgXCJvXCJdLCBbMiwgXCJvXCJdIF1cbiAgICAvLyBbIFwiZm9vXCIgXSAgICBbIFswLCBcImZvb1wiXSBdXG4gICAgLy8gWyAxMCBdICAgICAgIFsgWzAsIDEwXSBdXG4gICAgLy8geyBhOiBcImZvb1wiIH0gWyBbXCJhXCIsIFwiZm9vXCJdIF1cbiAgICAvLyAvLyAoKT0+e30gICAgP1xuICAgIGxldCB0eXBlb2ZPYmogPSB0eXBlb2Ygb2JqO1xuICAgIGlmIChcbiAgICAgICAgb2JqID09PSB1bmRlZmluZWRcbiAgICAgICAgfHwgaXNFbXB0eU9iaihvYmopXG4gICAgICAgIHx8IGlzRW1wdHlBcnIob2JqKVxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHx8IG9iaiA9PT0gXCJcIlxuICAgICkge1xuICAgICAgICByZXR1cm4gW10gYXMgRW51bWVyYXRlZDxUPjtcbiAgICB9XG4gICAgXG4gICAgaWYgKFxuICAgICAgICBvYmogPT09IG51bGxcbiAgICAgICAgfHwgdHlwZW9mT2JqID09PSBcImJvb2xlYW5cIlxuICAgICAgICB8fCB0eXBlb2ZPYmogPT09IFwibnVtYmVyXCJcbiAgICAgICAgfHwgdHlwZW9mT2JqID09PSBcImZ1bmN0aW9uXCJcbiAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgJHt0eXBlb2ZPYmp9IG9iamVjdCBpcyBub3QgaXRlcmFibGVgKTtcbiAgICB9XG4gICAgbGV0IGFycmF5ID0gW107XG4gICAgaWYgKCBpc0FycmF5KG9iaikgKSB7XG4gICAgICAgIGxldCBpOiBudW1iZXIgPSAwO1xuICAgICAgICBmb3IgKCBsZXQgeCBvZiBvYmogKSB7XG4gICAgICAgICAgICBhcnJheS5wdXNoKFsgaSwgeCBdKTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoIGxldCBwcm9wIGluIG9iaiApIHtcbiAgICAgICAgICAgIGFycmF5LnB1c2goWyBwcm9wLCBvYmpbcHJvcF0gXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5IGFzIEVudW1lcmF0ZWQ8VD47XG59XG5cbmZ1bmN0aW9uIHdhaXQobXM6IG51bWJlcik6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKCBza2lwRmFkZSApXG4gICAgICAgIHJldHVybjtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG59XG5cbi8qKkNoZWNrIGV2ZXJ5IGBjaGVja0ludGVydmFsYCBtcyBpZiBgY29uZCgpYCBpcyB0cnV0aHkuIElmLCB3aXRoaW4gYHRpbWVvdXRgLCBjb25kKCkgaXMgdHJ1dGh5LCByZXR1cm4gYHRydWVgLiBSZXR1cm4gYGZhbHNlYCBpZiB0aW1lIGlzIG91dC5cbiAqIEBleGFtcGxlXG4gKiAvLyBHaXZlIHRoZSB1c2VyIGEgMjAwbXMgY2hhbmNlIHRvIGdldCBoZXIgcG9pbnRlciBvdmVyIFwibXlkaXZcIi4gQ29udGludWUgaW1tZWRpYXRlbHkgb25jZSBzaGUgZG9lcywgb3IgYWZ0ZXIgMjAwbXMgaWYgc2hlIGRvZXNuJ3QuXG4gKiBteWRpdi5wb2ludGVyZW50ZXIoICgpID0+IG15ZGl2LnBvaW50ZXJIb3ZlcmluZyA9IHRydWU7IClcbiAqIGNvbnN0IHBvaW50ZXJPbk15ZGl2ID0gYXdhaXQgd2FpdFVudGlsKCgpID0+IG15ZGl2LnBvaW50ZXJIb3ZlcmluZywgMjAwLCAxMCk7Ki9cbmFzeW5jIGZ1bmN0aW9uIHdhaXRVbnRpbChjb25kOiAoKSA9PiBib29sZWFuLCB0aW1lb3V0OiBudW1iZXIgPSBJbmZpbml0eSwgY2hlY2tJbnRlcnZhbDogbnVtYmVyID0gMjApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoIGNoZWNrSW50ZXJ2YWwgPD0gMCApXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgY2hlY2tJbnRlcnZhbCA8PSAwLiBjaGVja0ludGVydmFsOiAke2NoZWNrSW50ZXJ2YWx9YCk7XG4gICAgaWYgKCBjaGVja0ludGVydmFsID4gdGltZW91dCApXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgY2hlY2tJbnRlcnZhbCA+IHRpbWVvdXQgKCR7Y2hlY2tJbnRlcnZhbH0gPiAke3RpbWVvdXR9KS4gSGFzIHRvIGJlIGxvd2VyIHRoYW4gdGltZW91dC5gKTtcbiAgICBcbiAgICBjb25zdCBsb29wcyA9IHRpbWVvdXQgLyBjaGVja0ludGVydmFsO1xuICAgIGlmICggbG9vcHMgPT0gMSApXG4gICAgICAgIGNvbnNvbGUud2FybihgbG9vcHMgPT0gMSwgeW91IHByb2JhYmx5IGRpZG4ndCB3YW50IHRoaXMgdG8gaGFwcGVuYCk7XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICB3aGlsZSAoIGNvdW50IDwgbG9vcHMgKSB7XG4gICAgICAgIGlmICggY29uZCgpIClcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBhd2FpdCB3YWl0KGNoZWNrSW50ZXJ2YWwpO1xuICAgICAgICBjb3VudCsrO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmxldCBzdHVmZiA9IHtcbiAgICAnKCk9Pnt9JyA6ICgpID0+IHtcbiAgICB9LCAnZnVuY3Rpb24oKXt9JyA6IGZ1bmN0aW9uICgpIHtcbiAgICB9LCAnRnVuY3Rpb24nIDogRnVuY3Rpb24sXG4gICAgJ0Z1bmN0aW9uKCknIDogRnVuY3Rpb24oKSxcbiAgICBcIm5ldyBGdW5jdGlvbigpXCIgOiBuZXcgRnVuY3Rpb24oKSxcbiAgICBcIkJvb2xlYW5cIiA6IEJvb2xlYW4sXG4gICAgXCJCb29sZWFuKClcIiA6IEJvb2xlYW4oKSxcbiAgICBcIm5ldyBCb29sZWFuKClcIiA6IG5ldyBCb29sZWFuKCksXG4gICAgXCJuZXcgQm9vbGVhbih0cnVlKVwiIDogbmV3IEJvb2xlYW4odHJ1ZSksXG4gICAgXCJuZXcgQm9vbGVhbihmYWxzZSlcIiA6IG5ldyBCb29sZWFuKGZhbHNlKSxcbiAgICBcInRydWVcIiA6IHRydWUsXG4gICAgXCJmYWxzZVwiIDogZmFsc2UsXG4gICAgXCJOdW1iZXJcIiA6IE51bWJlcixcbiAgICBcIk51bWJlcigpXCIgOiBOdW1iZXIoKSxcbiAgICBcIm5ldyBOdW1iZXIoKVwiIDogbmV3IE51bWJlcigpLFxuICAgIFwibmV3IE51bWJlcigwKVwiIDogbmV3IE51bWJlcigwKSxcbiAgICBcIm5ldyBOdW1iZXIoMSlcIiA6IG5ldyBOdW1iZXIoMSksXG4gICAgXCIwXCIgOiAwLFxuICAgIFwiMVwiIDogMSxcbiAgICBcIicwJ1wiIDogJzAnLFxuICAgIFwiJzEnXCIgOiAnMScsXG4gICAgXCJ7fVwiIDoge30sXG4gICAgXCJ7IGhpIDogJ2J5ZScgfVwiIDogeyBoaSA6ICdieWUnIH0sXG4gICAgXCJbXVwiIDogW10sXG4gICAgXCJbIDEgXVwiIDogWyAxIF0sXG4gICAgXCJ1bmRlZmluZWRcIiA6IHVuZGVmaW5lZCxcbiAgICBcIm51bGxcIiA6IG51bGwsXG59O1xuXG5mdW5jdGlvbiBub3Rub3Qob2JqKSB7XG4gICAgLy8gLyAwICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gMSAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyAoKT0+e30gICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIGZ1bmN0aW9uKCl7fSAgICAgICB0cnVlXG4gICAgLy8gRnVuY3Rpb24gICAgICAgICAgIHRydWVcbiAgICAvLyBGdW5jdGlvbigpICAgICAgICAgdHJ1ZVxuICAgIC8vIG5ldyBGdW5jdGlvbigpICAgICB0cnVlXG4gICAgLy8gQm9vbGVhbiAgICAgICAgICAgIHRydWVcbiAgICAvLyAvICBCb29sZWFuKCkgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbigpICAgICAgdHJ1ZVxuICAgIC8vIG5ldyBCb29sZWFuKHRydWUpICB0cnVlXG4gICAgLy8gbmV3IEJvb2xlYW4oZmFsc2UpIHRydWVcbiAgICAvLyB0cnVlICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIC8gIGZhbHNlICAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlciAgICAgICAgICAgICB0cnVlXG4gICAgLy8gLyAgTnVtYmVyKCkgICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigpICAgICAgIHRydWVcbiAgICAvLyBuZXcgTnVtYmVyKDApICAgICAgdHJ1ZVxuICAgIC8vIG5ldyBOdW1iZXIoMSkgICAgICB0cnVlXG4gICAgLy8gJzAnICAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyAnMScgICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIHt9ICAgICAgICAgICAgICAgICB0cnVlXG4gICAgLy8geyBoaSA6ICdieWUnIH0gICAgIHRydWVcbiAgICAvLyBbXSAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIFsgMSBdICAgICAgICAgICAgICB0cnVlXG4gICAgLy8gLyAgdW5kZWZpbmVkICAgICAgIGZhbHNlXG4gICAgLy8gLyAgbnVsbCAgICAgICAgICAgIGZhbHNlXG4gICAgcmV0dXJuICEhb2JqO1xufVxuXG5mdW5jdGlvbiBpc0FycmF5PFQ+KG9iaik6IG9iaiBpcyBBcnJheTxUPiB7XG4gICAgLy8gMCAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIDEgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMCcgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzEnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICgpPT57fSAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbigpICAgICAgICAgICBmYWxzZVxuICAgIC8vIEZ1bmN0aW9uICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBGdW5jdGlvbigpICAgICAgICAgIGZhbHNlXG4gICAgLy8gTnVtYmVyICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlcigpICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAvIFsgMSBdICAgICAgICAgICAgIHRydWVcbiAgICAvLyAvIFtdICAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyBmYWxzZSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gZnVuY3Rpb24oKXt9ICAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBCb29sZWFuKCkgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbihmYWxzZSkgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4odHJ1ZSkgICBmYWxzZVxuICAgIC8vIG5ldyBGdW5jdGlvbigpICAgICAgZmFsc2VcbiAgICAvLyBuZXcgTnVtYmVyKDApICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigxKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoKSAgICAgICAgZmFsc2VcbiAgICAvLyBudWxsICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdHJ1ZSAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHVuZGVmaW5lZCAgICAgICAgICAgZmFsc2VcbiAgICAvLyB7IGhpIDogJ2J5ZScgfSAgICAgIGZhbHNlXG4gICAgLy8ge30gICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIGlmICggIW9iaiApIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiAhPT0gJ3N0cmluZycgJiYgKEFycmF5LmlzQXJyYXkob2JqKSB8fCB0eXBlb2Ygb2JqW1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbicpO1xufVxuXG5mdW5jdGlvbiBpc0VtcHR5QXJyKGNvbGxlY3Rpb24pOiBib29sZWFuIHtcbiAgICAvLyAwICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gMSAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcwJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMScgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gKCk9Pnt9ICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIEJvb2xlYW4gICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuKCkgICAgICAgICAgIGZhbHNlXG4gICAgLy8gRnVuY3Rpb24gICAgICAgICAgICBmYWxzZVxuICAgIC8vIEZ1bmN0aW9uKCkgICAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gTnVtYmVyKCkgICAgICAgICAgICBmYWxzZVxuICAgIC8vIFsgMSBdICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAvIFtdICAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyBmYWxzZSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gZnVuY3Rpb24oKXt9ICAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBCb29sZWFuKCkgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbihmYWxzZSkgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4odHJ1ZSkgICBmYWxzZVxuICAgIC8vIG5ldyBGdW5jdGlvbigpICAgICAgZmFsc2VcbiAgICAvLyBuZXcgTnVtYmVyKDApICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigxKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoKSAgICAgICAgZmFsc2VcbiAgICAvLyBudWxsICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdHJ1ZSAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHVuZGVmaW5lZCAgICAgICAgICAgZmFsc2VcbiAgICAvLyB7IGhpIDogJ2J5ZScgfSAgICAgIGZhbHNlXG4gICAgLy8ge30gICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIHJldHVybiBpc0FycmF5KGNvbGxlY3Rpb24pICYmIGdldExlbmd0aChjb2xsZWN0aW9uKSA9PT0gMFxufVxuXG5mdW5jdGlvbiBpc0VtcHR5T2JqKG9iaik6IGJvb2xlYW4ge1xuICAgIC8vIDAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAxICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzAnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcxJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAoKT0+e30gICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbiAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIEJvb2xlYW4oKSAgICAgICAgICAgZmFsc2VcbiAgICAvLyBGdW5jdGlvbiAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gRnVuY3Rpb24oKSAgICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlciAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIoKSAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gWyAxIF0gICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIFtdICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBmYWxzZSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gZnVuY3Rpb24oKXt9ICAgICAgICBmYWxzZVxuICAgIC8vIC8gbmV3IEJvb2xlYW4oKSAgICAgdHJ1ZVxuICAgIC8vIC8gbmV3IEJvb2xlYW4oZmFsc2UpdHJ1ZVxuICAgIC8vIC8gbmV3IEJvb2xlYW4odHJ1ZSkgdHJ1ZVxuICAgIC8vIG5ldyBGdW5jdGlvbigpICAgICAgZmFsc2VcbiAgICAvLyAvIG5ldyBOdW1iZXIoMCkgICAgIHRydWVcbiAgICAvLyAvIG5ldyBOdW1iZXIoMSkgICAgIHRydWVcbiAgICAvLyAvIG5ldyBOdW1iZXIoKSAgICAgIHRydWVcbiAgICAvLyBudWxsICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdHJ1ZSAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHVuZGVmaW5lZCAgICAgICAgICAgZmFsc2VcbiAgICAvLyB7IGhpIDogJ2J5ZScgfSAgICAgIGZhbHNlXG4gICAgLy8gLyB7fSAgICAgICAgICAgICAgICB0cnVlXG4gICAgcmV0dXJuIGlzT2JqZWN0KG9iaikgJiYgIWlzQXJyYXkob2JqKSAmJiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMFxufVxuXG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oZm46IEFueUZ1bmN0aW9uKTogZm4gaXMgQW55RnVuY3Rpb24ge1xuICAgIC8vIDAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAxICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gJzAnICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcxJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAvICgpPT57fSAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIC8gQm9vbGVhbiAgICAgICAgICAgICB0cnVlXG4gICAgLy8gQm9vbGVhbigpICAgICAgICAgICBmYWxzZVxuICAgIC8vIC8gRnVuY3Rpb24gICAgICAgICAgICB0cnVlXG4gICAgLy8gLyBGdW5jdGlvbigpICAgICAgICAgIHRydWVcbiAgICAvLyAvIE51bWJlciAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIE51bWJlcigpICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBbIDEgXSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gW10gICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIGZhbHNlICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAvIGZ1bmN0aW9uKCl7fSAgICAgICAgdHJ1ZVxuICAgIC8vIG5ldyBCb29sZWFuKCkgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgQm9vbGVhbihmYWxzZSkgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4odHJ1ZSkgICBmYWxzZVxuICAgIC8vIC8gbmV3IEZ1bmN0aW9uKCkgICAgICB0cnVlXG4gICAgLy8gbmV3IE51bWJlcigwKSAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBOdW1iZXIoMSkgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgTnVtYmVyKCkgICAgICAgIGZhbHNlXG4gICAgLy8gbnVsbCAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHRydWUgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB1bmRlZmluZWQgICAgICAgICAgIGZhbHNlXG4gICAgLy8geyBoaSA6ICdieWUnIH0gICAgICBmYWxzZVxuICAgIC8vIHt9ICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICBsZXQgdG9TdHJpbmdlZCA9IHt9LnRvU3RyaW5nLmNhbGwoZm4pO1xuICAgIHJldHVybiAhIWZuICYmIHRvU3RyaW5nZWQgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSdcbn1cblxuXG4vLyAqICB1bmRlcnNjb3JlLmpzXG5mdW5jdGlvbiBpc09iamVjdChvYmopOiBib29sZWFuIHtcbiAgICAvLyAwICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gMSAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICcwJyAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAnMScgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gKCk9Pnt9ICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIEJvb2xlYW4gICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuKCkgICAgICAgICAgIGZhbHNlXG4gICAgLy8gRnVuY3Rpb24gICAgICAgICAgICBmYWxzZVxuICAgIC8vIEZ1bmN0aW9uKCkgICAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gTnVtYmVyKCkgICAgICAgICAgICBmYWxzZVxuICAgIC8vIC8gWyAxIF0gICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIC8gW10gICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIGZhbHNlICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBmdW5jdGlvbigpe30gICAgICAgIGZhbHNlXG4gICAgLy8gLyBuZXcgQm9vbGVhbigpICAgICB0cnVlXG4gICAgLy8gLyBuZXcgQm9vbGVhbihmYWxzZSl0cnVlXG4gICAgLy8gLyBuZXcgQm9vbGVhbih0cnVlKSB0cnVlXG4gICAgLy8gbmV3IEZ1bmN0aW9uKCkgICAgICBmYWxzZVxuICAgIC8vIC8gbmV3IE51bWJlcigwKSAgICAgdHJ1ZVxuICAgIC8vIC8gbmV3IE51bWJlcigxKSAgICAgdHJ1ZVxuICAgIC8vIC8gbmV3IE51bWJlcigpICAgICAgdHJ1ZVxuICAgIC8vIG51bGwgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB0cnVlICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdW5kZWZpbmVkICAgICAgICAgICBmYWxzZVxuICAgIC8vIC8geyBoaSA6ICdieWUnIH0gICAgdHJ1ZVxuICAgIC8vIC8ge30gICAgICAgICAgICAgICAgdHJ1ZVxuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbn1cblxuZnVuY3Rpb24gc2hhbGxvd1Byb3BlcnR5PFQ+KGtleTogc3RyaW5nKTogKG9iajogVCkgPT4gVCBleHRlbmRzIG51bGwgPyB1bmRlZmluZWQgOiBUW2tleW9mIFRdIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAvLyA9PSBudWxsIHRydWUgZm9yIHVuZGVmaW5lZFxuICAgICAgICByZXR1cm4gb2JqID09IG51bGwgPyB2b2lkIDAgOiBvYmpba2V5XTtcbiAgICB9O1xufVxuXG5cbmZ1bmN0aW9uIGdldExlbmd0aChjb2xsZWN0aW9uKTogbnVtYmVyIHtcbiAgICByZXR1cm4gc2hhbGxvd1Byb3BlcnR5KCdsZW5ndGgnKShjb2xsZWN0aW9uKVxufVxuXG5cbmZ1bmN0aW9uIGFueShjb2xsZWN0aW9uOiBhbnlbXSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBjb2xsZWN0aW9uLnNvbWUoaXRlbSA9PiBib29sKGl0ZW0pKTtcbn1cblxuXG5mdW5jdGlvbiBhbGwoYXJyOiBhbnlbXSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhcnIuZXZlcnkoaXRlbSA9PiBib29sKGl0ZW0pKTtcbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudFdpbmRvdygpIHtcbiAgICByZXR1cm4gcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKTtcbn1cblxuZnVuY3Rpb24gcmVsb2FkUGFnZSgpIHtcbiAgICBnZXRDdXJyZW50V2luZG93KCkucmVsb2FkKCk7XG59XG5cbmV4cG9ydCB7IGFueSwgYWxsLCBib29sLCByZWxvYWRQYWdlLCBpbnQgfVxuIl19