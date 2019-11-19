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
function isArray(obj) {
    return typeof obj !== "string" && (Array.isArray(obj) || typeof obj[Symbol.iterator] === 'function');
}
function isEmptyArr(collection) {
    return isArray(collection) && getLength(collection) === 0;
}
function isEmptyObj(obj) {
    // {}               true
    // new Boolean()    true
    // new Number()     true
    // {hi:"bye"}       false
    // []               false
    // undefined        false
    // null             false
    // ()=>{}           false
    // function(){}     false
    // Boolean()        false
    // Number()         false
    return isObject(obj) && !isArray(obj) && Object.keys(obj).length === 0;
}
function isFunction(fn) {
    // ()=>{}           true
    // function(){}     true
    // Function         true
    // Function()       true
    // new Function()   true
    // Boolean          true
    // Number           true
    // {}               false
    // {hi:"bye"}       false
    // []               false
    // Boolean()        false
    // new Boolean()    false
    // Number()         false
    // new Number()     false
    // undefined        false
    // null             false
    let toStringed = {}.toString.call(fn);
    return !!fn && toStringed === '[object Function]';
}
// *  underscore.js
function isObject(obj) {
    // {}               true
    // {hi:"bye"}       true
    // []               true
    // new Boolean()    true
    // new Number()     true
    // undefined        false
    // null             false
    // ()=>{}           false
    // function(){}     false
    // Boolean()        false
    // Number()         false
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxTQUFTLEtBQUssQ0FBQyxDQUFTLEVBQUUsSUFBWSxDQUFDO0lBQ25DLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkIsT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUM1QixDQUFDO0FBRUQsU0FBUyxLQUFLLENBQUMsR0FBVztJQUN0QixPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBRUQsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQWlDO0lBQzdDLE9BQU8sUUFBUSxDQUFDLENBQUMsRUFBVyxJQUFJLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBd0xvQyxrQkFBRztBQXRMeEMsU0FBUyxJQUFJLENBQUMsR0FBUTtJQUNsQixJQUFLLEdBQUcsS0FBSyxJQUFJO1FBQ2IsT0FBTyxLQUFLLENBQUM7SUFDakIsTUFBTSxTQUFTLEdBQUcsT0FBTyxHQUFHLENBQUM7SUFDN0IsSUFBSyxTQUFTLEtBQUssUUFBUSxFQUFHO1FBQzFCLElBQUssU0FBUyxLQUFLLFVBQVU7WUFDekIsT0FBTyxJQUFJLENBQUM7O1lBRVosT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDO0tBQ3BCO0lBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7QUFDekMsQ0FBQztBQTJLa0Isb0JBQUk7QUF6S3ZCLFNBQVMsU0FBUyxDQUFJLEdBQU07SUFDeEIsa0JBQWtCO0lBQ2xCLGtCQUFrQjtJQUNsQixrQkFBa0I7SUFDbEIsa0JBQWtCO0lBQ2xCLHlCQUF5QjtJQUN6Qix5QkFBeUI7SUFDekIseUJBQXlCO0lBQ3pCLHlCQUF5QjtJQUN6QixnREFBZ0Q7SUFDaEQsOEJBQThCO0lBQzlCLDJCQUEy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Q0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQUdELFNBQVMsU0FBUyxDQUFDLFVBQVU7SUFDekIsT0FBTyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDaEQsQ0FBQztBQUdELFNBQVMsR0FBRyxDQUFDLFVBQVU7SUFDbkIsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQWVRLGtCQUFHO0FBWlosU0FBUyxHQUFHLENBQUMsR0FBVTtJQUNuQixPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN6QyxDQUFDO0FBVWEsa0JBQUc7QUFSakIsU0FBUyxnQkFBZ0I7SUFDckIsT0FBTyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUNyQyxDQUFDO0FBRUQsU0FBUyxVQUFVO0lBQ2YsZ0JBQWdCLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNoQyxDQUFDO0FBRXdCLGdDQUFVIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gcm91bmQobjogbnVtYmVyLCBkOiBudW1iZXIgPSAwKSB7XG4gICAgY29uc3QgZnIgPSAxMCAqKiBkO1xuICAgIHJldHVybiBpbnQobiAqIGZyKSAvIGZyO1xufVxuXG5mdW5jdGlvbiBmbG9hdChzdHI6IHN0cmluZyk6IG51bWJlciB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQoc3RyKTtcbn1cblxuZnVuY3Rpb24gaW50KHgsIGJhc2U/OiBzdHJpbmcgfCBudW1iZXIgfCBGdW5jdGlvbik6IG51bWJlciB7XG4gICAgcmV0dXJuIHBhcnNlSW50KHgsIDxudW1iZXI+IGJhc2UpO1xufVxuXG5mdW5jdGlvbiBib29sKHZhbDogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKCB2YWwgPT09IG51bGwgKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgdHlwZW9mdmFsID0gdHlwZW9mIHZhbDtcbiAgICBpZiAoIHR5cGVvZnZhbCAhPT0gJ29iamVjdCcgKSB7XG4gICAgICAgIGlmICggdHlwZW9mdmFsID09PSAnZnVuY3Rpb24nIClcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gISF2YWw7XG4gICAgfVxuICAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwpLmxlbmd0aCAhPT0gMDtcbn1cblxuZnVuY3Rpb24gZW51bWVyYXRlPFQ+KG9iajogVCk6IEVudW1lcmF0ZWQ8VD4ge1xuICAgIC8vIHVuZGVmaW5lZCAgICBbXVxuICAgIC8vIHt9ICAgICAgICAgICBbXVxuICAgIC8vIFtdICAgICAgICAgICBbXVxuICAgIC8vIFwiXCIgICAgICAgICAgIFtdXG4gICAgLy8gbnVtYmVyICAgICAgIFR5cGVFcnJvclxuICAgIC8vIG51bGwgICAgICAgICBUeXBlRXJyb3JcbiAgICAvLyBib29sZWFuICAgICAgVHlwZUVycm9yXG4gICAgLy8gRnVuY3Rpb24gICAgIFR5cGVFcnJvclxuICAgIC8vIFwiZm9vXCIgICAgICAgIFsgWzAsIFwiZlwiXSwgWzEsIFwib1wiXSwgWzIsIFwib1wiXSBdXG4gICAgLy8gWyBcImZvb1wiIF0gICAgWyBbMCwgXCJmb29cIl0gXVxuICAgIC8vIFsgMTAgXSAgICAgICBbIFswLCAxMF0gXVxuICAgIC8vIHsgYTogXCJmb29cIiB9IFsgW1wiYVwiLCBcImZvb1wiXSBdXG4gICAgLy8gLy8gKCk9Pnt9ICAgID9cbiAgICBsZXQgdHlwZW9mT2JqID0gdHlwZW9mIG9iajtcbiAgICBpZiAoXG4gICAgICAgIG9iaiA9PT0gdW5kZWZpbmVkXG4gICAgICAgIHx8IGlzRW1wdHlPYmoob2JqKVxuICAgICAgICB8fCBpc0VtcHR5QXJyKG9iailcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB8fCBvYmogPT09IFwiXCJcbiAgICApIHtcbiAgICAgICAgcmV0dXJuIFtdIGFzIEVudW1lcmF0ZWQ8VD47XG4gICAgfVxuICAgIFxuICAgIGlmIChcbiAgICAgICAgb2JqID09PSBudWxsXG4gICAgICAgIHx8IHR5cGVvZk9iaiA9PT0gXCJib29sZWFuXCJcbiAgICAgICAgfHwgdHlwZW9mT2JqID09PSBcIm51bWJlclwiXG4gICAgICAgIHx8IHR5cGVvZk9iaiA9PT0gXCJmdW5jdGlvblwiXG4gICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYCR7dHlwZW9mT2JqfSBvYmplY3QgaXMgbm90IGl0ZXJhYmxlYCk7XG4gICAgfVxuICAgIGxldCBhcnJheSA9IFtdO1xuICAgIGlmICggaXNBcnJheShvYmopICkge1xuICAgICAgICBsZXQgaTogbnVtYmVyID0gMDtcbiAgICAgICAgZm9yICggbGV0IHggb2Ygb2JqICkge1xuICAgICAgICAgICAgYXJyYXkucHVzaChbIGksIHggXSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKCBsZXQgcHJvcCBpbiBvYmogKSB7XG4gICAgICAgICAgICBhcnJheS5wdXNoKFsgcHJvcCwgb2JqW3Byb3BdIF0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheSBhcyBFbnVtZXJhdGVkPFQ+O1xufVxuXG5mdW5jdGlvbiB3YWl0KG1zOiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmICggc2tpcEZhZGUgKVxuICAgICAgICByZXR1cm47XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xufVxuXG4vKipDaGVjayBldmVyeSBgY2hlY2tJbnRlcnZhbGAgbXMgaWYgYGNvbmQoKWAgaXMgdHJ1dGh5LiBJZiwgd2l0aGluIGB0aW1lb3V0YCwgY29uZCgpIGlzIHRydXRoeSwgcmV0dXJuIGB0cnVlYC4gUmV0dXJuIGBmYWxzZWAgaWYgdGltZSBpcyBvdXQuXG4gKiBAZXhhbXBsZVxuICogLy8gR2l2ZSB0aGUgdXNlciBhIDIwMG1zIGNoYW5jZSB0byBnZXQgaGVyIHBvaW50ZXIgb3ZlciBcIm15ZGl2XCIuIENvbnRpbnVlIGltbWVkaWF0ZWx5IG9uY2Ugc2hlIGRvZXMsIG9yIGFmdGVyIDIwMG1zIGlmIHNoZSBkb2Vzbid0LlxuICogbXlkaXYucG9pbnRlcmVudGVyKCAoKSA9PiBteWRpdi5wb2ludGVySG92ZXJpbmcgPSB0cnVlOyApXG4gKiBjb25zdCBwb2ludGVyT25NeWRpdiA9IGF3YWl0IHdhaXRVbnRpbCgoKSA9PiBteWRpdi5wb2ludGVySG92ZXJpbmcsIDIwMCwgMTApOyovXG5hc3luYyBmdW5jdGlvbiB3YWl0VW50aWwoY29uZDogKCkgPT4gYm9vbGVhbiwgdGltZW91dDogbnVtYmVyID0gSW5maW5pdHksIGNoZWNrSW50ZXJ2YWw6IG51bWJlciA9IDIwKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKCBjaGVja0ludGVydmFsIDw9IDAgKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGNoZWNrSW50ZXJ2YWwgPD0gMC4gY2hlY2tJbnRlcnZhbDogJHtjaGVja0ludGVydmFsfWApO1xuICAgIGlmICggY2hlY2tJbnRlcnZhbCA+IHRpbWVvdXQgKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGNoZWNrSW50ZXJ2YWwgPiB0aW1lb3V0ICgke2NoZWNrSW50ZXJ2YWx9ID4gJHt0aW1lb3V0fSkuIEhhcyB0byBiZSBsb3dlciB0aGFuIHRpbWVvdXQuYCk7XG4gICAgXG4gICAgY29uc3QgbG9vcHMgPSB0aW1lb3V0IC8gY2hlY2tJbnRlcnZhbDtcbiAgICBpZiAoIGxvb3BzID09IDEgKVxuICAgICAgICBjb25zb2xlLndhcm4oYGxvb3BzID09IDEsIHlvdSBwcm9iYWJseSBkaWRuJ3Qgd2FudCB0aGlzIHRvIGhhcHBlbmApO1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgd2hpbGUgKCBjb3VudCA8IGxvb3BzICkge1xuICAgICAgICBpZiAoIGNvbmQoKSApXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgYXdhaXQgd2FpdChjaGVja0ludGVydmFsKTtcbiAgICAgICAgY291bnQrKztcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBpc0FycmF5PFQ+KG9iaik6IG9iaiBpcyBBcnJheTxUPiB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogIT09IFwic3RyaW5nXCIgJiYgKEFycmF5LmlzQXJyYXkob2JqKSB8fCB0eXBlb2Ygb2JqW1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbicpO1xufVxuXG5mdW5jdGlvbiBpc0VtcHR5QXJyKGNvbGxlY3Rpb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNBcnJheShjb2xsZWN0aW9uKSAmJiBnZXRMZW5ndGgoY29sbGVjdGlvbikgPT09IDBcbn1cblxuZnVuY3Rpb24gaXNFbXB0eU9iaihvYmopOiBib29sZWFuIHtcbiAgICAvLyB7fSAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyBuZXcgQm9vbGVhbigpICAgIHRydWVcbiAgICAvLyBuZXcgTnVtYmVyKCkgICAgIHRydWVcbiAgICAvLyB7aGk6XCJieWVcIn0gICAgICAgZmFsc2VcbiAgICAvLyBbXSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gdW5kZWZpbmVkICAgICAgICBmYWxzZVxuICAgIC8vIG51bGwgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyAoKT0+e30gICAgICAgICAgIGZhbHNlXG4gICAgLy8gZnVuY3Rpb24oKXt9ICAgICBmYWxzZVxuICAgIC8vIEJvb2xlYW4oKSAgICAgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIoKSAgICAgICAgIGZhbHNlXG4gICAgcmV0dXJuIGlzT2JqZWN0KG9iaikgJiYgIWlzQXJyYXkob2JqKSAmJiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMFxufVxuXG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oZm46IEFueUZ1bmN0aW9uKTogZm4gaXMgQW55RnVuY3Rpb24ge1xuICAgIC8vICgpPT57fSAgICAgICAgICAgdHJ1ZVxuICAgIC8vIGZ1bmN0aW9uKCl7fSAgICAgdHJ1ZVxuICAgIC8vIEZ1bmN0aW9uICAgICAgICAgdHJ1ZVxuICAgIC8vIEZ1bmN0aW9uKCkgICAgICAgdHJ1ZVxuICAgIC8vIG5ldyBGdW5jdGlvbigpICAgdHJ1ZVxuICAgIC8vIEJvb2xlYW4gICAgICAgICAgdHJ1ZVxuICAgIC8vIE51bWJlciAgICAgICAgICAgdHJ1ZVxuICAgIC8vIHt9ICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB7aGk6XCJieWVcIn0gICAgICAgZmFsc2VcbiAgICAvLyBbXSAgICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbigpICAgICAgICBmYWxzZVxuICAgIC8vIG5ldyBCb29sZWFuKCkgICAgZmFsc2VcbiAgICAvLyBOdW1iZXIoKSAgICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IE51bWJlcigpICAgICBmYWxzZVxuICAgIC8vIHVuZGVmaW5lZCAgICAgICAgZmFsc2VcbiAgICAvLyBudWxsICAgICAgICAgICAgIGZhbHNlXG4gICAgbGV0IHRvU3RyaW5nZWQgPSB7fS50b1N0cmluZy5jYWxsKGZuKTtcbiAgICByZXR1cm4gISFmbiAmJiB0b1N0cmluZ2VkID09PSAnW29iamVjdCBGdW5jdGlvbl0nXG59XG5cblxuLy8gKiAgdW5kZXJzY29yZS5qc1xuZnVuY3Rpb24gaXNPYmplY3Qob2JqKTogYm9vbGVhbiB7XG4gICAgLy8ge30gICAgICAgICAgICAgICB0cnVlXG4gICAgLy8ge2hpOlwiYnllXCJ9ICAgICAgIHRydWVcbiAgICAvLyBbXSAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyBuZXcgQm9vbGVhbigpICAgIHRydWVcbiAgICAvLyBuZXcgTnVtYmVyKCkgICAgIHRydWVcbiAgICAvLyB1bmRlZmluZWQgICAgICAgIGZhbHNlXG4gICAgLy8gbnVsbCAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICgpPT57fSAgICAgICAgICAgZmFsc2VcbiAgICAvLyBmdW5jdGlvbigpe30gICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbigpICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlcigpICAgICAgICAgZmFsc2VcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG59XG5cbmZ1bmN0aW9uIHNoYWxsb3dQcm9wZXJ0eTxUPihrZXk6IHN0cmluZyk6IChvYmo6IFQpID0+IFQgZXh0ZW5kcyBudWxsID8gdW5kZWZpbmVkIDogVFtrZXlvZiBUXSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIG9iaiA9PSBudWxsID8gdm9pZCAwIDogb2JqW2tleV07XG4gICAgfTtcbn1cblxuXG5mdW5jdGlvbiBnZXRMZW5ndGgoY29sbGVjdGlvbik6IG51bWJlciB7XG4gICAgcmV0dXJuIHNoYWxsb3dQcm9wZXJ0eSgnbGVuZ3RoJykoY29sbGVjdGlvbilcbn1cblxuXG5mdW5jdGlvbiBhbnkoY29sbGVjdGlvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBjb2xsZWN0aW9uLnNvbWUoaXRlbSA9PiBib29sKGl0ZW0pKTtcbn1cblxuXG5mdW5jdGlvbiBhbGwoYXJyOiBhbnlbXSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhcnIuZXZlcnkoaXRlbSA9PiBib29sKGl0ZW0pKTtcbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudFdpbmRvdygpIHtcbiAgICByZXR1cm4gcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKTtcbn1cblxuZnVuY3Rpb24gcmVsb2FkUGFnZSgpIHtcbiAgICBnZXRDdXJyZW50V2luZG93KCkucmVsb2FkKCk7XG59XG5cbmV4cG9ydCB7IGFueSwgYWxsLCBib29sLCByZWxvYWRQYWdlLCBpbnQgfVxuIl19