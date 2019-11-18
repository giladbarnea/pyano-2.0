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
function all(collection) {
    return collection.every(item => bool(item));
}
function getCurrentWindow() {
    return remote.getCurrentWindow();
}
function reloadPage() {
    getCurrentWindow().reload();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxLQUFLLENBQUMsQ0FBUyxFQUFFLElBQVksQ0FBQztJQUNuQyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25CLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDNUIsQ0FBQztBQUVELFNBQVMsS0FBSyxDQUFDLEdBQVc7SUFDdEIsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUVELFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFpQztJQUM3QyxPQUFPLFFBQVEsQ0FBQyxDQUFDLEVBQVcsSUFBSSxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUVELFNBQVMsSUFBSSxDQUFDLEdBQVE7SUFDbEIsSUFBSyxHQUFHLEtBQUssSUFBSTtRQUNiLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLE1BQU0sU0FBUyxHQUFHLE9BQU8sR0FBRyxDQUFDO0lBQzdCLElBQUssU0FBUyxLQUFLLFFBQVEsRUFBRztRQUMxQixJQUFLLFNBQVMsS0FBSyxVQUFVO1lBQ3pCLE9BQU8sSUFBSSxDQUFDOztZQUVaLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQztLQUNwQjtJQUNELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBSSxHQUFNO0lBQ3hCLGtCQUFrQjtJQUNsQixrQkFBa0I7SUFDbEIsa0JBQWtCO0lBQ2xCLGtCQUFrQjtJQUNsQix5QkFBeUI7SUFDekIseUJBQXlCO0lBQ3pCLHlCQUF5QjtJQUN6Qix5QkFBeUI7SUFDekIsZ0RBQWdEO0lBQ2hELDhCQUE4QjtJQUM5QiwyQkFBMkI7SUFDM0IsZ0NBQWdDO0lBQ2hDLGlCQUFpQjtJQUNqQixJQUFJLFNBQVMsR0FBRyxPQUFPLEdBQUcsQ0FBQztJQUMzQixJQUNJLEdBQUcsS0FBSyxTQUFTO1dBQ2QsVUFBVSxDQUFDLEdBQUcsQ0FBQztXQUNmLFVBQVUsQ0FBQyxHQUFHLENBQUM7UUFDbEIsYUFBYTtXQUNWLEdBQUcsS0FBSyxFQUFFLEVBQ2Y7UUFDRSxPQUFPLEVBQW1CLENBQUM7S0FDOUI7SUFFRCxJQUNJLEdBQUcsS0FBSyxJQUFJO1dBQ1QsU0FBUyxLQUFLLFNBQVM7V0FDdkIsU0FBUyxLQUFLLFFBQVE7V0FDdEIsU0FBUyxLQUFLLFVBQVUsRUFDN0I7UUFDRSxNQUFNLElBQUksU0FBUyxDQUFDLEdBQUcsU0FBUyx5QkFBeUIsQ0FBQyxDQUFDO0tBQzlEO0lBQ0QsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ2YsSUFBSyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUc7UUFDaEIsSUFBSSxDQUFDLEdBQVcsQ0FBQyxDQUFDO1FBQ2xCLEtBQU0sSUFBSSxDQUFDLElBQUksR0FBRyxFQUFHO1lBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQztZQUNyQixDQUFDLEVBQUUsQ0FBQztTQUNQO0tBQ0o7U0FBTTtRQUNILEtBQU0sSUFBSSxJQUFJLElBQUksR0FBRyxFQUFHO1lBQ3BCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFFLENBQUMsQ0FBQztTQUNuQztLQUNKO0lBQ0QsT0FBTyxLQUFzQixDQUFDO0FBQ2xDLENBQUM7QUFFRCxTQUFTLElBQUksQ0FBQyxFQUFVO0lBQ3BCLElBQUssUUFBUTtRQUNULE9BQU87SUFDWCxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFFRDs7OztrRkFJa0Y7QUFDbEYsS0FBSyxVQUFVLFNBQVMsQ0FBQyxJQUFtQixFQUFFLFVBQWtCLFFBQVEsRUFBRSxnQkFBd0IsRUFBRTtJQUNoRyxJQUFLLGFBQWEsSUFBSSxDQUFDO1FBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFDM0UsSUFBSyxhQUFhLEdBQUcsT0FBTztRQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixhQUFhLE1BQU0sT0FBTyxrQ0FBa0MsQ0FBQyxDQUFDO0lBRTlHLE1BQU0sS0FBSyxHQUFHLE9BQU8sR0FBRyxhQUFhLENBQUM7SUFDdEMsSUFBSyxLQUFLLElBQUksQ0FBQztRQUNYLE9BQU8sQ0FBQyxJQUFJLENBQUMscURBQXFELENBQUMsQ0FBQztJQUN4RSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDZCxPQUFRLEtBQUssR0FBRyxLQUFLLEVBQUc7UUFDcEIsSUFBSyxJQUFJLEVBQUU7WUFDUCxPQUFPLElBQUksQ0FBQztRQUNoQixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMxQixLQUFLLEVBQUUsQ0FBQztLQUNYO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFJLEdBQUc7SUFDbkIsT0FBTyxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxVQUFVLENBQUMsQ0FBQztBQUN6RyxDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsVUFBVTtJQUMxQixPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzdELENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxHQUFHO0lBQ25CLHdCQUF3QjtJQUN4Qix3QkFBd0I7SUFDeEIsd0JBQXdCO0lBQ3hCLHlCQUF5QjtJQUN6Qix5QkFBeUI7SUFDekIseUJBQXlCO0lBQ3pCLHlCQUF5QjtJQUN6Qix5QkFBeUI7SUFDekIseUJBQXlCO0lBQ3pCLHlCQUF5QjtJQUN6Qix5QkFBeUI7SUFDekIsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFBO0FBQzFFLENBQUM7QUFHRCxTQUFTLFVBQVUsQ0FBQyxFQUFlO0lBQy9CLHdCQUF3QjtJQUN4Qix3QkFBd0I7SUFDeEIsd0JBQXdCO0lBQ3hCLHdCQUF3QjtJQUN4Qix3QkFBd0I7SUFDeEIsd0JBQXdCO0lBQ3hCLHdCQUF3QjtJQUN4Qix5QkFBeUI7SUFDekIseUJBQXlCO0lBQ3pCLHlCQUF5QjtJQUN6Qix5QkFBeUI7SUFDekIseUJBQXlCO0lBQ3pCLHlCQUF5QjtJQUN6Qix5QkFBeUI7SUFDekIseUJBQXlCO0lBQ3pCLHlCQUF5QjtJQUN6QixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN0QyxPQUFPLENBQUMsQ0FBQyxFQUFFLElBQUksVUFBVSxLQUFLLG1CQUFtQixDQUFBO0FBQ3JELENBQUM7QUFHRCxtQkFBbUI7QUFDbkIsU0FBUyxRQUFRLENBQUMsR0FBRztJQUNqQix3QkFBd0I7SUFDeEIsd0JBQXdCO0lBQ3hCLHdCQUF3QjtJQUN4Qix3QkFBd0I7SUFDeEIsd0JBQXdCO0lBQ3hCLHlCQUF5QjtJQUN6Qix5QkFBeUI7SUFDekIseUJBQXlCO0lBQ3pCLHlCQUF5QjtJQUN6Qix5QkFBeUI7SUFDekIseUJBQXlCO0lBQ3pCLE9BQU8sT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDNUMsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFJLEdBQVc7SUFDbkMsT0FBTyxVQUFVLEdBQUc7UUFDaEIsT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLENBQUMsQ0FBQztBQUNOLENBQUM7QUFHRCxTQUFTLFNBQVMsQ0FBQyxVQUFVO0lBQ3pCLE9BQU8sZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ2hELENBQUM7QUFHRCxTQUFTLEdBQUcsQ0FBQyxVQUFVO0lBQ25CLE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFHRCxTQUFTLEdBQUcsQ0FBQyxVQUFVO0lBQ25CLE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFFRCxTQUFTLGdCQUFnQjtJQUNyQixPQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3JDLENBQUM7QUFFRCxTQUFTLFVBQVU7SUFDZixnQkFBZ0IsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiByb3VuZChuOiBudW1iZXIsIGQ6IG51bWJlciA9IDApIHtcbiAgICBjb25zdCBmciA9IDEwICoqIGQ7XG4gICAgcmV0dXJuIGludChuICogZnIpIC8gZnI7XG59XG5cbmZ1bmN0aW9uIGZsb2F0KHN0cjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xufVxuXG5mdW5jdGlvbiBpbnQoeCwgYmFzZT86IHN0cmluZyB8IG51bWJlciB8IEZ1bmN0aW9uKTogbnVtYmVyIHtcbiAgICByZXR1cm4gcGFyc2VJbnQoeCwgPG51bWJlcj4gYmFzZSk7XG59XG5cbmZ1bmN0aW9uIGJvb2wodmFsOiBhbnkpOiBib29sZWFuIHtcbiAgICBpZiAoIHZhbCA9PT0gbnVsbCApXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCB0eXBlb2Z2YWwgPSB0eXBlb2YgdmFsO1xuICAgIGlmICggdHlwZW9mdmFsICE9PSAnb2JqZWN0JyApIHtcbiAgICAgICAgaWYgKCB0eXBlb2Z2YWwgPT09ICdmdW5jdGlvbicgKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiAhIXZhbDtcbiAgICB9XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHZhbCkubGVuZ3RoICE9PSAwO1xufVxuXG5mdW5jdGlvbiBlbnVtZXJhdGU8VD4ob2JqOiBUKTogRW51bWVyYXRlZDxUPiB7XG4gICAgLy8gdW5kZWZpbmVkICAgIFtdXG4gICAgLy8ge30gICAgICAgICAgIFtdXG4gICAgLy8gW10gICAgICAgICAgIFtdXG4gICAgLy8gXCJcIiAgICAgICAgICAgW11cbiAgICAvLyBudW1iZXIgICAgICAgVHlwZUVycm9yXG4gICAgLy8gbnVsbCAgICAgICAgIFR5cGVFcnJvclxuICAgIC8vIGJvb2xlYW4gICAgICBUeXBlRXJyb3JcbiAgICAvLyBGdW5jdGlvbiAgICAgVHlwZUVycm9yXG4gICAgLy8gXCJmb29cIiAgICAgICAgWyBbMCwgXCJmXCJdLCBbMSwgXCJvXCJdLCBbMiwgXCJvXCJdIF1cbiAgICAvLyBbIFwiZm9vXCIgXSAgICBbIFswLCBcImZvb1wiXSBdXG4gICAgLy8gWyAxMCBdICAgICAgIFsgWzAsIDEwXSBdXG4gICAgLy8geyBhOiBcImZvb1wiIH0gWyBbXCJhXCIsIFwiZm9vXCJdIF1cbiAgICAvLyAvLyAoKT0+e30gICAgP1xuICAgIGxldCB0eXBlb2ZPYmogPSB0eXBlb2Ygb2JqO1xuICAgIGlmIChcbiAgICAgICAgb2JqID09PSB1bmRlZmluZWRcbiAgICAgICAgfHwgaXNFbXB0eU9iaihvYmopXG4gICAgICAgIHx8IGlzRW1wdHlBcnIob2JqKVxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHx8IG9iaiA9PT0gXCJcIlxuICAgICkge1xuICAgICAgICByZXR1cm4gW10gYXMgRW51bWVyYXRlZDxUPjtcbiAgICB9XG4gICAgXG4gICAgaWYgKFxuICAgICAgICBvYmogPT09IG51bGxcbiAgICAgICAgfHwgdHlwZW9mT2JqID09PSBcImJvb2xlYW5cIlxuICAgICAgICB8fCB0eXBlb2ZPYmogPT09IFwibnVtYmVyXCJcbiAgICAgICAgfHwgdHlwZW9mT2JqID09PSBcImZ1bmN0aW9uXCJcbiAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgJHt0eXBlb2ZPYmp9IG9iamVjdCBpcyBub3QgaXRlcmFibGVgKTtcbiAgICB9XG4gICAgbGV0IGFycmF5ID0gW107XG4gICAgaWYgKCBpc0FycmF5KG9iaikgKSB7XG4gICAgICAgIGxldCBpOiBudW1iZXIgPSAwO1xuICAgICAgICBmb3IgKCBsZXQgeCBvZiBvYmogKSB7XG4gICAgICAgICAgICBhcnJheS5wdXNoKFsgaSwgeCBdKTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoIGxldCBwcm9wIGluIG9iaiApIHtcbiAgICAgICAgICAgIGFycmF5LnB1c2goWyBwcm9wLCBvYmpbcHJvcF0gXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5IGFzIEVudW1lcmF0ZWQ8VD47XG59XG5cbmZ1bmN0aW9uIHdhaXQobXM6IG51bWJlcik6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKCBza2lwRmFkZSApXG4gICAgICAgIHJldHVybjtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG59XG5cbi8qKkNoZWNrIGV2ZXJ5IGBjaGVja0ludGVydmFsYCBtcyBpZiBgY29uZCgpYCBpcyB0cnV0aHkuIElmLCB3aXRoaW4gYHRpbWVvdXRgLCBjb25kKCkgaXMgdHJ1dGh5LCByZXR1cm4gYHRydWVgLiBSZXR1cm4gYGZhbHNlYCBpZiB0aW1lIGlzIG91dC5cbiAqIEBleGFtcGxlXG4gKiAvLyBHaXZlIHRoZSB1c2VyIGEgMjAwbXMgY2hhbmNlIHRvIGdldCBoZXIgcG9pbnRlciBvdmVyIFwibXlkaXZcIi4gQ29udGludWUgaW1tZWRpYXRlbHkgb25jZSBzaGUgZG9lcywgb3IgYWZ0ZXIgMjAwbXMgaWYgc2hlIGRvZXNuJ3QuXG4gKiBteWRpdi5wb2ludGVyZW50ZXIoICgpID0+IG15ZGl2LnBvaW50ZXJIb3ZlcmluZyA9IHRydWU7IClcbiAqIGNvbnN0IHBvaW50ZXJPbk15ZGl2ID0gYXdhaXQgd2FpdFVudGlsKCgpID0+IG15ZGl2LnBvaW50ZXJIb3ZlcmluZywgMjAwLCAxMCk7Ki9cbmFzeW5jIGZ1bmN0aW9uIHdhaXRVbnRpbChjb25kOiAoKSA9PiBib29sZWFuLCB0aW1lb3V0OiBudW1iZXIgPSBJbmZpbml0eSwgY2hlY2tJbnRlcnZhbDogbnVtYmVyID0gMjApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoIGNoZWNrSW50ZXJ2YWwgPD0gMCApXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgY2hlY2tJbnRlcnZhbCA8PSAwLiBjaGVja0ludGVydmFsOiAke2NoZWNrSW50ZXJ2YWx9YCk7XG4gICAgaWYgKCBjaGVja0ludGVydmFsID4gdGltZW91dCApXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgY2hlY2tJbnRlcnZhbCA+IHRpbWVvdXQgKCR7Y2hlY2tJbnRlcnZhbH0gPiAke3RpbWVvdXR9KS4gSGFzIHRvIGJlIGxvd2VyIHRoYW4gdGltZW91dC5gKTtcbiAgICBcbiAgICBjb25zdCBsb29wcyA9IHRpbWVvdXQgLyBjaGVja0ludGVydmFsO1xuICAgIGlmICggbG9vcHMgPT0gMSApXG4gICAgICAgIGNvbnNvbGUud2FybihgbG9vcHMgPT0gMSwgeW91IHByb2JhYmx5IGRpZG4ndCB3YW50IHRoaXMgdG8gaGFwcGVuYCk7XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICB3aGlsZSAoIGNvdW50IDwgbG9vcHMgKSB7XG4gICAgICAgIGlmICggY29uZCgpIClcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBhd2FpdCB3YWl0KGNoZWNrSW50ZXJ2YWwpO1xuICAgICAgICBjb3VudCsrO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzQXJyYXk8VD4ob2JqKTogb2JqIGlzIEFycmF5PFQ+IHtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiAhPT0gXCJzdHJpbmdcIiAmJiAoQXJyYXkuaXNBcnJheShvYmopIHx8IHR5cGVvZiBvYmpbU3ltYm9sLml0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJyk7XG59XG5cbmZ1bmN0aW9uIGlzRW1wdHlBcnIoY29sbGVjdGlvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc0FycmF5KGNvbGxlY3Rpb24pICYmIGdldExlbmd0aChjb2xsZWN0aW9uKSA9PT0gMFxufVxuXG5mdW5jdGlvbiBpc0VtcHR5T2JqKG9iaik6IGJvb2xlYW4ge1xuICAgIC8vIHt9ICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIG5ldyBCb29sZWFuKCkgICAgdHJ1ZVxuICAgIC8vIG5ldyBOdW1iZXIoKSAgICAgdHJ1ZVxuICAgIC8vIHtoaTpcImJ5ZVwifSAgICAgICBmYWxzZVxuICAgIC8vIFtdICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyB1bmRlZmluZWQgICAgICAgIGZhbHNlXG4gICAgLy8gbnVsbCAgICAgICAgICAgICBmYWxzZVxuICAgIC8vICgpPT57fSAgICAgICAgICAgZmFsc2VcbiAgICAvLyBmdW5jdGlvbigpe30gICAgIGZhbHNlXG4gICAgLy8gQm9vbGVhbigpICAgICAgICBmYWxzZVxuICAgIC8vIE51bWJlcigpICAgICAgICAgZmFsc2VcbiAgICByZXR1cm4gaXNPYmplY3Qob2JqKSAmJiAhaXNBcnJheShvYmopICYmIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwXG59XG5cblxuZnVuY3Rpb24gaXNGdW5jdGlvbihmbjogQW55RnVuY3Rpb24pOiBmbiBpcyBBbnlGdW5jdGlvbiB7XG4gICAgLy8gKCk9Pnt9ICAgICAgICAgICB0cnVlXG4gICAgLy8gZnVuY3Rpb24oKXt9ICAgICB0cnVlXG4gICAgLy8gRnVuY3Rpb24gICAgICAgICB0cnVlXG4gICAgLy8gRnVuY3Rpb24oKSAgICAgICB0cnVlXG4gICAgLy8gbmV3IEZ1bmN0aW9uKCkgICB0cnVlXG4gICAgLy8gQm9vbGVhbiAgICAgICAgICB0cnVlXG4gICAgLy8gTnVtYmVyICAgICAgICAgICB0cnVlXG4gICAgLy8ge30gICAgICAgICAgICAgICBmYWxzZVxuICAgIC8vIHtoaTpcImJ5ZVwifSAgICAgICBmYWxzZVxuICAgIC8vIFtdICAgICAgICAgICAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuKCkgICAgICAgIGZhbHNlXG4gICAgLy8gbmV3IEJvb2xlYW4oKSAgICBmYWxzZVxuICAgIC8vIE51bWJlcigpICAgICAgICAgZmFsc2VcbiAgICAvLyBuZXcgTnVtYmVyKCkgICAgIGZhbHNlXG4gICAgLy8gdW5kZWZpbmVkICAgICAgICBmYWxzZVxuICAgIC8vIG51bGwgICAgICAgICAgICAgZmFsc2VcbiAgICBsZXQgdG9TdHJpbmdlZCA9IHt9LnRvU3RyaW5nLmNhbGwoZm4pO1xuICAgIHJldHVybiAhIWZuICYmIHRvU3RyaW5nZWQgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSdcbn1cblxuXG4vLyAqICB1bmRlcnNjb3JlLmpzXG5mdW5jdGlvbiBpc09iamVjdChvYmopOiBib29sZWFuIHtcbiAgICAvLyB7fSAgICAgICAgICAgICAgIHRydWVcbiAgICAvLyB7aGk6XCJieWVcIn0gICAgICAgdHJ1ZVxuICAgIC8vIFtdICAgICAgICAgICAgICAgdHJ1ZVxuICAgIC8vIG5ldyBCb29sZWFuKCkgICAgdHJ1ZVxuICAgIC8vIG5ldyBOdW1iZXIoKSAgICAgdHJ1ZVxuICAgIC8vIHVuZGVmaW5lZCAgICAgICAgZmFsc2VcbiAgICAvLyBudWxsICAgICAgICAgICAgIGZhbHNlXG4gICAgLy8gKCk9Pnt9ICAgICAgICAgICBmYWxzZVxuICAgIC8vIGZ1bmN0aW9uKCl7fSAgICAgZmFsc2VcbiAgICAvLyBCb29sZWFuKCkgICAgICAgIGZhbHNlXG4gICAgLy8gTnVtYmVyKCkgICAgICAgICBmYWxzZVxuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbn1cblxuZnVuY3Rpb24gc2hhbGxvd1Byb3BlcnR5PFQ+KGtleTogc3RyaW5nKTogKG9iajogVCkgPT4gVCBleHRlbmRzIG51bGwgPyB1bmRlZmluZWQgOiBUW2tleW9mIFRdIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqID09IG51bGwgPyB2b2lkIDAgOiBvYmpba2V5XTtcbiAgICB9O1xufVxuXG5cbmZ1bmN0aW9uIGdldExlbmd0aChjb2xsZWN0aW9uKTogbnVtYmVyIHtcbiAgICByZXR1cm4gc2hhbGxvd1Byb3BlcnR5KCdsZW5ndGgnKShjb2xsZWN0aW9uKVxufVxuXG5cbmZ1bmN0aW9uIGFueShjb2xsZWN0aW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGNvbGxlY3Rpb24uc29tZShpdGVtID0+IGJvb2woaXRlbSkpO1xufVxuXG5cbmZ1bmN0aW9uIGFsbChjb2xsZWN0aW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGNvbGxlY3Rpb24uZXZlcnkoaXRlbSA9PiBib29sKGl0ZW0pKTtcbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudFdpbmRvdygpIHtcbiAgICByZXR1cm4gcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKTtcbn1cblxuZnVuY3Rpb24gcmVsb2FkUGFnZSgpIHtcbiAgICBnZXRDdXJyZW50V2luZG93KCkucmVsb2FkKCk7XG59XG4iXX0=