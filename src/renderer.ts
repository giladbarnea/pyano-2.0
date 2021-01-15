console.debug('renderer.ts')
require('app-module-path').addPath(__dirname);
// *** About This File
/*
- Objects are globally accessible across app, no import needed
- Cannot have ES6 imports, only require(). Otherwise, objects no longer globally accessible
*/

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.


////////////////////////////////////////////////////
// *** Interfaces
////////////////////////////////////////////////////

interface TMap<T = any> {
    [s: string]: T;

    [s: number]: T
}

interface SMap<T = any> {
    [s: string]: T;
}

interface NMap<T = any> {
    [s: number]: T;
}

interface RecMap<T = any> {
    [s: string]: T | RecMap<T>;

    [s: number]: T | RecMap<T>
}

type Enumerated<T> =
    T extends (infer U)[] ? [i: number, item: U][] // Array
        // TMaps
        : T extends SMap<(infer U)> ? [key: string, value: U][]
        : T extends NMap<(infer U)> ? [key: number, value: U][]
            : T extends TMap<(infer U)> ? [key: keyof T, value: U][]
                : T extends RecMap<(infer U)> ? [key: keyof T, value: U][]
                    // : T extends boolean ? never : any;
                    // : T extends infer U ? [key: string, value: U[keyof U]][]
                    : never;

interface Object {
    keys<T>(): Array<keyof T>;

    /**Gets value of `key` and deletes it from instance.*/
    // pop<T, K = keyof T>(key: keyof T): T[K extends keyof T ? K : never];
    // pop<T=this,K = keyof this>(key: keyof T): T[K extends keyof T ? K : never];
    // pop<K = keyof this>(key: keyof this): this[K extends keyof this ? K : never];

    // pop(key: keyof this): this[keyof this];
    // pop<T=this>(key: keyof this): T[keyof T];
    pop(key: PropertyKey, defualt?: any): any;
}

interface String {
    endsWithAny(...args: string[]): boolean;

    human(): string;

    isdigit(): boolean;

    lower(): string;

    upper(): string;

    removeAll(removeValue: string | number | RegExp | TMap<string>, ...removeValues: (string | number | RegExp | TMap<string>)[]): string;

    /**Replaces everything*/
    replaceAll(searchValue: TMap<string>): string;

    /**Replaces everything*/
    replaceAll(searchValue: string | number | RegExp, replaceValue: string): string;

    title(): string;

    partition(val: string): [string, string, string];

    upTo(searchString: string, searchFromEnd?: boolean): string;
}

interface Array<T> {
    _lowerAll: T[];

    /**Also caches _lowerAll*/
    lowerAll(): T[];

    count(item: T): number;

    count(predicate: (item: T) => boolean): number;

    lazy(fn: (item: T) => T): IterableIterator<T>;
}

interface Number {
    human(letters?: boolean): string;
}


interface Date {
    /**"31-12-2020_23-40-50-789"*/
    human(format: 'DD-MM-YYYY_HH-mm-ss-fff'): string;

    /**"31-12-2020_23-40-50"*/
    human(format: 'DD-MM-YYYY_HH-mm-ss'): string;

    /**"2020-12-31_23-40-50-789"*/
    human(format: 'YYYY-MM-DD_HH-mm-ss-fff'): string;

    /**"2020-12-31_23-40-50"*/
    human(format: 'YYYY-MM-DD_HH-mm-ss'): string;

    /**"2020-12-31_23-40-50"*/
    human(): string;

}


interface Error {
    toObj(): {
        original_error: Error;
        /**'ReferenceError: formattedStrings is not defined'*/
        what: string;
        /**'at startIfReady (/home/gilad/Code/scratches/pyano-2.0-versions-playground/dist/pages/New/index.js:50:23)'*/
        where: string;
        callsites: any[];
        stack: string;
        code?: string;
        when?: string;
        locals?: TMap<string>;
        /**A pretty-formatted verbose string*/
        toString(): string;
        toNiceHtml(): string;
    };
}

interface Callsite {
    typeName: string;
    functionName: string;
    methodName: string;
    fileName: string;
    lineNumber: string;
    columnNumber: string;
    function: string;
    evalOrigin: string;
    topLevel: boolean;
    eval: boolean;
    native: boolean;
    constructor: boolean;

    getTypeName(): string;

    getFunctionName(): string;

    getMethodName(): string;

    getFileName(): string;

    getLineNumber(): number;

    getColumnNumber(): number;

    getFunction(): any;

    getEvalOrigin(): any;

    isNative(): boolean;

    isEval(): boolean;

    isTopLevel(): boolean;

    isConstructor(): boolean;
}

interface Console {
    orig: Partial<Console>


    // print(...args): any

    title(...args): any

}

////////////////////////////////////////////////////
// *** Prototype Injection
////////////////////////////////////////////////////
// **  Object
Object.defineProperty(Object.prototype, "keys", {
    enumerable: false,
    value(): Array<string | number> {
        // @ts-ignore
        return Object.keys(this).map(key => key.isdigit()
            ? parseInt(key) : key);
    }
});
Object.defineProperty(Object.prototype, "pop", {
    enumerable: false,
    value(key: number | string | symbol, defualt = null) {

        const val = this[key];
        if (val === undefined) {
            return defualt
        }
        delete this[key];
        return val
    }
});
// **  Console
/*Object.defineProperty(Object.getPrototypeOf(console), "print", {
    value(msg): void {
        console.log.apply(this, [...arguments, "NOWRITE"]);
    }
});
Object.defineProperty(Object.getPrototypeOf(console), "title", {
    value(msg): void {
        // console.log.apply(this, [
        //
        //     `[TITLE] %c${[...arguments].shift()}`,
        //     [...arguments].map(arg=>[`%c${arg}`, "font-weight:bold;"]),
        //     "font-weight:bold;",
        //     // 'color: rgb(150,150,150);',
        //     ...arguments,
        // ]);


        console.log.apply(this, [
            ...[...arguments].flatMap(arg => [`%c${arg}`, "font-weight:bold;"]),
        ]);
    }
});*/
/*Object.defineProperty(Object.getPrototypeOf(console), "debug", {
    value(msg): void {
        console.debug.apply(this, [
            `%c[DEBUG] %c${module.path}`,
            'color: rgb(150,150,150);',
            ...arguments,
        ]);
    }
});*/


// **  Array
Object.defineProperty(Array.prototype, "lazy", {
    enumerable: false,
    * value(fn) {
        for (let x in this) {
            yield fn(x);
        }
    }
});
Object.defineProperty(Array.prototype, "last", {
    enumerable: false,
    value() {
        return this[this.length - 1];
    }
});
Object.defineProperty(Array.prototype, "lowerAll", {
    enumerable: false,
    value() {

        if (!util.bool(this._lowerAll)) {
            this._lowerAll = [];
            for (let x of this) {
                this._lowerAll.push(x.lower());
            }
        }
        return this._lowerAll;
    }
});
Object.defineProperty(Array.prototype, "rsort", {
    enumerable: false,
    value() {
        return this.sort((n, m) => n < m);
    }
});
Object.defineProperty(Array.prototype, "count", {
    enumerable: false,
    value(item: any): number {
        let _count = 0;

        if (util.isFunction(item)) {
            for (let x of this) {
                if (item(x)) {
                    _count++;
                }
            }
        } else {

            for (let x of this) {
                if (x === item) {
                    _count++;
                }
            }
            return _count;
        }

    }

});
// **  String
Object.defineProperty(String.prototype, "endsWithAny", {
    enumerable: false,
    value(...args: string[]) {
        for (let x of args) {
            if (this.endsWith(x)) {
                return true;
            }
        }
        return false;

    }
});
Object.defineProperty(String.prototype, "upTo", {
    enumerable: false,
    value(searchString: string, searchFromEnd = false): string {
        let end = searchFromEnd
            ? this.lastIndexOf(searchString)
            : this.indexOf(searchString);
        if (end === -1) {
            console.warn(`${this.valueOf()}.upTo(${searchString},${searchFromEnd}) index is -1`);
        }
        return this.slice(0, end);
    }
});
Object.defineProperty(String.prototype, "in", {
    enumerable: false,
    value(arr: any[]): boolean {
        return arr.includes(this.valueOf());
    }
});
Object.defineProperty(String.prototype, "lower", {
    enumerable: false,
    value(): string {
        return this.toLowerCase();
    }
});
Object.defineProperty(String.prototype, "upper", {
    enumerable: false,
    value(): string {
        return this.toUpperCase();
    }
});
Object.defineProperty(String.prototype, "title", {
    enumerable: false,
    value(): string {
        if (this.includes(' ')) {
            return this.split(' ').map(str => str.title()).join(' ');
        } else {
            if (this.match(/[_\-.]/)) {
                let temp = this.replaceAll(/[_\-.]/, ' ');
                return temp.title();
            } else {
                return this[0].upper() + this.slice(1, this.length).lower();
            }
        }


    }
});
Object.defineProperty(String.prototype, "partition", {
    enumerable: false,
    value(val: string): [string, string, string] {
        const idx = this.indexOf(val);
        const before = this.substring(0, idx);
        const after = this.substring(idx + val.length);
        return [before, val, after];
    }
});
Object.defineProperty(String.prototype, "isdigit", {
    enumerable: false,
    value(): boolean {
        return !isNaN(Math.floor(this));
    }
});
Object.defineProperty(String.prototype, "removeAll", {
    enumerable: false,

    value(removeValue, ...removeValues) {
        let temp = this;
        for (let value of [removeValue, ...removeValues])
            temp = temp.replaceAll(value, '');
        return temp;
    }
});
Object.defineProperty(String.prototype, "replaceAll", {
    enumerable: false,
    /**good stuff*/
    value(searchValue: (string | number | RegExp) | TMap<string>, replaceValue?: string) {
        const type = typeof searchValue;
        if (type === 'string' || type === 'number') {
            return this
                .split(searchValue)
                .join(replaceValue);
        } else if (type === 'object') {
            if ((<RegExp>searchValue).compile) {
                let temp = this;
                let replaced = temp.replace(searchValue, replaceValue);
                while (replaced !== temp) {
                    temp = replaced;
                    replaced = replaced.replace(searchValue, replaceValue);
                }
                return replaced;
            } else {
                let temp = this;
                for (let [sv, rv] of Object.entries(searchValue))
                    temp = temp.replaceAll(sv, rv);

                return temp;
            }
        } else {
            console.warn(`replaceAll got a bad type, searchValue: ${searchValue}, type: ${type}`);
            return this;
        }
    }
});

// **  Number
Object.defineProperty(Number.prototype, "human", {
    enumerable: false,
    value(letters = false) {
        const floored = Math.floor(this);
        switch (floored) {
            case 0:
                return letters
                    ? "zeroth"
                    : "0th";
            case 1:
                return letters
                    ? "first"
                    : "1st";
            case 2:
                return letters
                    ? "second"
                    : "2nd";
            case 3:
                return letters
                    ? "third"
                    : "3rd";
            case 4:
                return letters
                    ? "fourth"
                    : "4th";
            case 5:
                return letters
                    ? "fifth"
                    : "5th";
            case 6:
                return letters
                    ? "sixth"
                    : "6th";
            case 7:
                return letters
                    ? "seventh"
                    : "7th";
            case 8:
                return letters
                    ? "eighth"
                    : "8th";
            case 9:
                return letters
                    ? "ninth"
                    : "9th";
            case 10:
                return letters
                    ? "tenth"
                    : "10th";
            case 11:
                return letters
                    ? "eleventh"
                    : "11th";
            case 12:
                return letters
                    ? "twelveth"
                    : "12th";
            case 13:
                return letters
                    ? "thirteenth"
                    : "13th";
            case 14:
                return letters
                    ? "fourteenth"
                    : "14th";
            case 15:
                return letters
                    ? "fifteenth"
                    : "15th";
            case 16:
                return letters
                    ? "sixteenth"
                    : "16th";
            case 17:
                return letters
                    ? "seventeenth"
                    : "17th";
            case 18:
                return letters
                    ? "eighteenth"
                    : "18th";
            case 19:
                return letters
                    ? "ninteenth"
                    : "19th";
            default:
                const stringed = floored.toString();
                const lastChar = stringed.slice(-1);
                let suffix;
                switch (lastChar) {
                    case "1":
                        suffix = "st";
                        break;
                    case "2":
                        suffix = "nd";
                        break;
                    case "3":
                        suffix = "rd";
                        break;
                    default:
                        suffix = "th";
                        break;
                }
                return `${floored}${suffix}`;
        }

    }
});
// **  Date
Object.defineProperty(Date.prototype, "human", {
    enumerable: false,
    value(format: 'YYYY-MM-DD_HH-mm-ss' | 'YYYY-MM-DD_HH-mm-ss-fff' | 'DD-MM-YYYY_HH-mm-ss' | 'DD-MM-YYYY_HH-mm-ss-fff' = 'YYYY-MM-DD_HH-mm-ss') {
        let D = this.getUTCDate(); // this gets the day, not getDay()
        D = D < 10 ? `0${D}` : D;
        let M = this.getMonth() + 1; // 0-based index
        M = M < 10 ? `0${M}` : M;
        const Y = this.getFullYear(); // 2020
        const HHmmss = this.toTimeString().slice(0, 8).replaceAll(':', '-'); // 23-40-50

        let ret;
        if (format.startsWith('DD-MM-YYYY_HH-mm-ss')) {
            ret = `${D}-${M}-${Y}_${HHmmss}`;
        } else {
            ret = `${Y}-${M}-${D}_${HHmmss}`;
        }
        if (format.endsWith('fff')) {
            ret += `-${this.getMilliseconds()}`; // 789
        }
        return ret;
    }
});
// **  Error
Object.defineProperty(Error.prototype, "toObj", {
    enumerable: false,

    value(): {
        original_error: Error,
        what: string;
        where: string;
        callsites: Callsite[];
        stack: string;
        code?: string;
        when?: string;
        locals?: TMap<string>;
        toString(): string;
        toNiceHtml(): string;
    } {

        const self: Error = this;
        try {
            const stackTrace = require('stack-trace');


            // @ts-ignore
            const obj: {
                original_error: Error,
                what: string;
                where: string;
                callsites: Callsite[];
                stack: string;
                code?: string;
                when?: string;
                locals?: TMap<string>;
                toString(): string;
                toNiceHtml(): string;
            } = {
                what: `${this.name}: ${this.message}`,
                where: this.stack.slice(this.stack.search(/(?<=\s)at/), this.stack.search(/(?<=at\s.*)\n/)),
                stack: this.stack,
                original_error: this,
                code: undefined, // don't ternary here because `code` is updated below
                when: this.when ?? undefined,
                locals: util.bool(this.locals) ? this.locals : undefined
            };

            let code = ''; // keep it string


            const callsites = stackTrace.parse(this);
            obj.callsites = callsites;
            const lastframe = callsites[0];
            try {
                const lines = `${fs.readFileSync(lastframe.fileName)}`.split('\n');
                for (let linenum of [lastframe.lineNumber - 2, lastframe.lineNumber - 1, lastframe.lineNumber]) {
                    // 0-based, so responsible line is lastframe.lineNumber - 1
                    let line = lines[linenum];
                    if (!util.bool(line)) {
                        continue;
                    }
                    if (linenum == lastframe.lineNumber - 1) {
                        code += `→   ${line}\n`;
                    } else {
                        code += `\t${line}\n`;
                    }
                }
            } catch (e) {
                // happens when file is e.g. "internal/child_process.js".
            }
            if (util.bool(code)) {
                obj.code = code;
            }

            // if (util.bool(this.locals)) {
            //     // anyDefined because { options: undefined } passes bool but shows up '{ }' when printed
            //     obj.locals = this.locals;
            // }
            obj.toString = function (): string {
                const formattedItems: string[] = [
                    `\nWHAT:\n-----\n`, `${obj.what}`,
                    '\n\nWHERE:\n-----\n', obj.where,
                ];
                if (obj.code) {
                    formattedItems.push('\n\nCODE:\n-----\n', obj.code);
                }
                if (obj.when) {
                    formattedItems.push('\n\nWHILE:\n-----\n', obj.when);
                }
                if (obj.locals) {
                    const prettyLocals = pf(obj.locals);
                    formattedItems.push('\n\nLOCALS:\n------\n', prettyLocals);
                }
                const prettyCallSites = pf(callsites);
                formattedItems.push(
                    '\n\nCALL SITES:\n-----------\n', prettyCallSites,

                    // in DevTools, printing 'e' is enough for DevTools to print stack automagically,
                    // but it's needed to be states explicitly for it to be written to log file
                    '\n\nORIGINAL ERROR:\n---------------\n', obj.stack, '\n'
                );
                return formattedItems.join('');
            };
            obj.toNiceHtml = function (): string {
                let formattedMessage = obj.original_error?.message ?? '';
                let formattedCode = obj.code ?? '';
                if (obj.code) {

                    const dont_matter = [
                        'after', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'how', 'in', 'is', 'not', 'nor', 'of', 'on', 'or', 'so', 'such', 'that', 'the', 'to', 'without', 'with', 'what', 'yet',
                    ];

                    let code_words: string[] = obj.code.split('\n')
                        .flatMap((line: string) => line.split(/\b/).map((word: string) => word.removeAll('"', "'").trim()))
                        .filter((word: string) => util.bool(word) && word.length > 1 && !dont_matter.includes(word.toLowerCase()));

                    for (let word of code_words) {
                        let wordIndexInFormattedMessage = formattedMessage.toLowerCase().indexOf(word.toLowerCase());
                        if (wordIndexInFormattedMessage == -1) {
                            continue;
                        }

                        let wordInFormattedMessage = formattedMessage.slice(wordIndexInFormattedMessage, wordIndexInFormattedMessage + word.length);
                        formattedMessage = formattedMessage.replaceAll(wordInFormattedMessage, `<b>${wordInFormattedMessage}</b>`);
                        formattedCode = formattedCode.replaceAll(word, `<b>${word}</b>`);

                    }
                }
                let whenFormatted = obj.when ?
                    `
                    <h4>What was supposed to happen?</h4>
                    pyano was ${obj.when}
                    `
                    : '';

                let moreDetails = util.bool(formattedMessage) ?
                    `
                    <h4>Are there any more details?</h4>
                    Glad you asked. The error says:
                    <span style="font-family: monospace">${formattedMessage}</span>
                    ` : '';

                util.bool(formattedCode) ?
                    moreDetails += `Here's the piece of code that threw the error, see if sheds some light on a quick fix:
                    <div style="font-family: monospace">
                    ${formattedCode}
                    </div>
                    It happened <span style="font-family: monospace">${obj.where}</span>
                    `
                    : '';

                let htmlContent = `
                    <h4>What just happened?</h4>
                    A ${obj.original_error.name} occurred.
                    
                    ${whenFormatted}
                    <h4>What does it mean?</h4>
                    It means that what you tried to do, immediately before this error showed up, is broken.
                    For example, if the last thing you did was pressing a button, that specific button is broken.  
                    
                    ${moreDetails}
                    
                    <h4>Is the session lost?</h4>
                    No, the error was caught and contained. No need to restart. 
                    If you have an idea about what's wrong, or how to avoid this error, you can resume working.  
                    
                    <h4>What's going to happen?</h4>
                    The directory <span style="font-family: monospace">"${SESSION_PATH_ABS}"</span> now contains:
                    - the moment of error was captured in .png and .html files
                    - a video capture of the whole session
                    - the session's log file.
                    It's probably wise to keep these files somewhere outside pyano's dir for future review.  
                `.split('\n')
                    .map(s => s.trim())
                    .join('<br>');

                return htmlContent;
            };


            // Error.captureStackTrace(this); // this makes the stack useless?
            /*const cleanstack = this.stack.split('\n')
                .filter(s => s.includes(ROOT_PATH_ABS) && !s.includes('node_modules'))
                .map(s => {
                    s = s.trim();
                    let frame = s.slice(s.search(ROOT_PATH_ABS), s.length - 1);
                    let [file, lineno, ...rest] = frame.split(':');
                    file = path.relative(ROOT_PATH_ABS, file);
                    return { file, lineno };
                });*/
            return obj;
        } catch (toObjError) {
            const str = `bad: Error.toObj() ITSELF threw ${toObjError?.name}: ${toObjError?.message}.
        this: Error:
        ---------------
        ${self?.name}: ${self?.message}
        ${self?.stack}
        
        toObjError:
        ----------
        ${toObjError?.stack}
        `;
            console.error(str);
            // @ts-ignore
            return {
                toString(): string {
                    return str;
                },
                toNiceHtml(): string {
                    return str.split('\n')
                        .map(s => s.trim())
                        .join('<br>');
                }
            };
        }
    }
});

////////////////////////////////////////////////////
// *** Libraries (require calls)
////////////////////////////////////////////////////
// @ts-ignore
const path = require('path');

const fs = require('fs');


const util: {
    /**
     @example
     > round(100.5)
     100
     > round(100.5, 0)
     100
     > round(100.5, 1)
     100.5
     > round(100.5, 2)
     100.5
     > round(100.50, 2)
     100.5
     > round(100.56, 2)
     100.56
     */
    round(n: number, d?: number): number;
    int(x: any, base?: string | number): number;
    str(val: any): any;
    /**
     @example

     > [
     .    1,
     .    '0',
     .    ' ',
     .    true,
     .    'foo',
     .    { hi : 'bye' },
     .    ()=>{},
     .    function(){},
     .    Boolean,
     .    Boolean(true),
     .    Function,
     .    Function(),
     .    Number,
     .    Number(1),
     .    [0],
     .    [1],
     .    [[]],
     .    [false],
     .    [true],
     .    document.body,
     .    new Boolean(true),
     .    new Function,
     .    new Function(),
     .    new Number(1),
     . ].map(bool).every(x=>x===true)
     true

     > [
     .    0,
     .    '',
     .    [],     // unlike native
     .    {},       // unlike native
     .    false,
     .    null,
     .    undefined,
     .    Boolean(),
     .    Boolean(false),
     .    new Boolean,        // unlike native
     .    new Boolean(),      // unlike native
     .    new Boolean(false),     // unlike native
     .    Number(),       // unlike native
     .    Number(0),       // unlike native
     .    new Number,
     .    new Number(),       // unlike native
     .    new Number(0),
     .    new class{},       // unlike native
     . ].map(bool).some(x=>x===true)
     false
     */
    bool(val: any): boolean;
    enumerate<T>(obj: T): Enumerated<T>;
    any(...args: any[]): boolean;
    all(...args: any): boolean;
    sum(arr: any[]): number | undefined;
    range(start: number, stop: number): Generator<number>;
    zip(arr1: any, arr2: any): Generator<any[], void, unknown>;
    isString(obj: any): obj is string;
    isPromise(obj: any): obj is Promise<any>;
    /**
     @example
     > [
     .    Error(),
     .    new Error,
     .    new Error(),
     . ].map(isError).every(x=>x===true)
     true

     > [
     .    0,
     .    '',
     .    [],
     .    1,
     .    '0',
     .    ' ',
     .    ()=>{},
     .    '1',
     .    Boolean(),
     .    Boolean,
     .    Function(),
     .    Function,
     .    Number(),
     .    Number,
     .    false,
     .    new Boolean(),
     .    new Boolean(true),
     .    new Boolean(false),
     .    new Number(0),
     .    new Number(),
     .    new Number(1),
     .    Error,
     .    [1],
     .    function(){},
     .    new Function(),
     .    true,
     .    null,
     .    { hi : 'bye' },
     .    undefined,
     . ].map(isError).some(x=>x===true)
     false
     * */
    isError(obj: any): obj is Error;
    /*** Same is Array.isArray?
     * Only `true` for `[]` and `[ 1 ]`*/
    isArray<T>(obj: any): obj is Array<T>;
    /**
     @example
     > [
     .    [],
     .    {},
     . ].map(isEmpty).every(x=>x===true)
     true
     > [
     .    0,
     .    1,
     .    '',
     .    ' ',
     .    '0',
     .    '1',
     .    ()=>{},
     .    Boolean,
     .    Boolean(),
     .    Function,
     .    Function(),
     .    Number,
     .    Number(),
     .    [ 1 ],
     .    false,
     .    function(){},
     .    new Boolean(),
     .    new Boolean(false),
     .    new Boolean(true),
     .    new Function(),
     .    new Number(0),
     .    new Number(1),
     .    new Number(),
     .    null,
     .    true,
     .    undefined,
     .    { hi : 'bye' },
     . ].map(isEmpty).some(x=>x===true)
     false
     * */
    isEmpty(obj: any): boolean;
    /**
     * @example
     * > isEmptyArr([])
     * true
     > [
     .    0,
     .    '',
     .    1,
     .    '0',
     .    ' ',
     .    ()=>{},
     .    '1',
     .    Boolean(),
     .    Boolean,
     .    Function(),
     .    Function,
     .    Number(),
     .    Number,
     .    false,
     .    [ 1 ],
     .    new Boolean(),
     .    function(){},
     .    new Boolean(true),
     .    new Boolean(false),
     .    new Number(0),
     .    new Function(),
     .    new Number(),
     .    new Number(1),
     .    Set,
     .    new Set,
     .    new Set(),
     .    true,
     .    null,
     .    { hi : 'bye' },
     .    undefined,
     .    {},
     . ].map(isEmptyArr).some(x=>x===true)
     false
     * */
    isEmptyArr(collection: any): boolean;
    /**
     @example
     > [
     .    {},
     . ].map(isEmptyObj).every(x=>x===true)
     true

     > [
     .    0,
     .    '',
     .    [],
     .    1,
     .    '0',
     .    ' ',
     .    ()=>{},
     .    '1',
     .    Boolean(),
     .    Boolean,
     .    Function(),
     .    Function,
     .    Number(),
     .    Number,
     .    false,
     .    new Boolean(),
     .    new Boolean(true),
     .    new Boolean(false),
     .    new Number(0),
     .    new Number(),
     .    new Number(1),
     .    Set,
     .    new Set,
     .    new Set(),
     .    Error,
     .    Error(),
     .    new Error,
     .    new Error(),
     .    [1],
     .    function(){},
     .    new Function(),
     .    true,
     .    null,
     .    { hi : 'bye' },
     .    undefined,
     . ].map(isEmptyObj).some(x=>x===true)
     false
     * */
    isEmptyObj(obj: any): boolean;
    /**
     @example
     > [
     .    ()=>{},
     .    Boolean,
     .    Function(),
     .    Function,
     .    Number,
     .    Set,
     .    function(){},
     .    new Function(),
     .    Error,
     . ].map(isFunction).every(x=>x===true)
     true

     > [
     .    0,
     .    '',
     .    [],
     .    1,
     .    '0',
     .    ' ',
     .    '1',
     .    {},
     .    Boolean(),
     .    Number(),
     .    false,
     .    new Boolean(),
     .    new Boolean(true),
     .    new Boolean(false),
     .    new Number(0),
     .    new Number(),
     .    new Number(1),
     .    new Error(),
     .    new Error,
     .    Error(),
     .    new Set,
     .    new Set(),
     .    [1],
     .    true,
     .    null,
     .    { hi : 'bye' },
     .    undefined,
     . ].map(isFunction).some(x=>x===true)
     false
     * */
    isFunction(fn: any): fn is Function;
    /**Has to be either {} or {foo:"bar"}. Not anything else.
     @example
     > [
     .    {},
     .    { foo : 'bar' },
     .    { foo : undefined },
     .    { foo : null },
     . ].map(isTMap).every(x=>x===true)
     true

     > [
     .    [],
     .    [1],
     .    new Boolean(),
     .    new Boolean(true),
     .    new Boolean(false),
     .    new Number(),
     .    new Number(0),
     .    new Number(1),
     .    new Set,
     .    new Set(),
     .    Error(),
     .    new Error,
     .    new Error(),
     .    0,
     .    '',
     .    1,
     .    '0',
     .    ' ',
     .    '1',
     .    ()=>{},
     .    Boolean(),
     .    Boolean,
     .    Function(),
     .    Function,
     .    Number,
     .    Set,
     .    function(){},
     .    new Function(),
     .    Number(),
     .    Error,
     .    false,
     .    true,
     .    null,
     .    undefined,
     . ].map(isTMap).some(x=>x===true)
     false
     * */
    isTMap<T>(obj: TMap<T>): obj is TMap<T>;
    /**
     @example
     > [
     .    [],
     .    [1],
     .    new Boolean(),
     .    new Boolean(true),
     .    new Boolean(false),
     .    new Number(),
     .    new Number(0),
     .    new Number(1),
     .    new Set,
     .    new Set(),
     .    Error(),
     .    new Error,
     .    new Error(),
     .    {},
     .    { hi : 'bye' },
     . ].map(isObject).every(x=>x===true)
     true

     > [
     .    0,
     .    '',
     .    1,
     .    '0',
     .    ' ',
     .    '1',
     .    ()=>{},
     .    Boolean(),
     .    Boolean,
     .    Function(),
     .    Function,
     .    Number,
     .    Set,
     .    function(){},
     .    new Function(),
     .    Number(),
     .    Error,
     .    false,
     .    true,
     .    null,
     .    undefined,
     . ].map(isObject).some(x=>x===true)
     false
     */
    isObject(obj: any): boolean;
    isPrimitive(value: any): boolean;
    getCurrentWindow(): Electron.BrowserWindow;
    reloadPage(): void;
    editBigConfig(): void;
    /**Writes screen capture (png) and exports full page to HTML for both main window WebContents and DevTools WebContents.*/
    saveScreenshots(): Promise<void>;
    /**
     @example
     const myFunc = investigate([async] function myFunc(val: any): boolean { ... }
     */
    investigate<T extends (...args: any[]) => any>(fn: T, options?: {
        group: boolean;
    }): T;
    investigate<T extends (...args: any[]) => any>(thisArg: ThisParameterType<T>, fnname: string, descriptor: {
        value: T;
    }): void;
    investigate<Getter extends () => any, Setter extends (val: any) => any>(thisArg: ThisParameterType<Getter>, fnname: string, descriptor: {
        get: Getter;
        set: Setter;
    }): void;
    ignoreErr(fn: (...args: any[]) => any): void;
    /**Extracts useful information from an Error, and returns a tuple containing formatted data, to be printed right away.

     Calls Error.toObj() and 'stack-trace' lib.
     @param e - can have 'whilst' key and 'locals' key.
     */
    /**
     * Safely does `console.error(err.toObj().toString())`.
     * @param options - If unpecified, both default to true but conditioned on cmd line args `--no-screenshots-on-error` and `--no-swal-on-error`.
     * This serves functionality around elog.catchErrors.
     * If specified true explicitly, bypass cmd line args `--no-screenshots-on-error` and `--no-swal-on-error`.
     * This serves functionality around calling onError programmaticly.
     */
    onError(error: Error, options?: {
        screenshots?: boolean;
        swal?: boolean;
    }, submitIssue?: any): boolean;
    /**
     @example
     > function foo(bar, baz){
 .    const argnames = getFnArgNames(foo);
 .    return Object.fromEntries(zip(argnames, arguments));
 . }
     . foo('rab', 'zab')
     {bar:'rab', baz:'zab'}
     */
    getFnArgNames(func: Function): string[];
    getMethodNames(obj: any): Set<unknown>;
    /**
     @example
     > const obj = { time: 5 };
     * if (hasprops(obj, "level")) {
     *     console.log(obj.level); // ok
     *     console.log(obj.bad); // err
     * } else {
     *     console.log(obj.level); // err
     *     console.log(obj.bad); // err
     * }
     * */
    hasprops<Obj extends Record<any, any>, Key extends string>(obj: Obj, ...keys: Key[]): boolean;
    safeExec(command: string, options?): string | undefined;
    copy<T>(obj: T): T;
    /**
     true if objects have the same CONTENT. This means that
     @example
     > equal( [1,2], [2,1] )
     true

     */
    equal(a: any, b: any): boolean;
    /**
     * Returns ts (seconds since epoch).
     * @param decdigits - default 0. decdigits=1 for ts in 0.1s resolution, decdigits=3 for ts in ms resolution.
     *
     @example
     now() // → 1600000000
     now(0) // → 1600000000
     now(1) // → 1600000000.7
     now(3) // → 1600000000.789
     */
    now(decdigits?: number, kwargs?: {
        date?: Date;
        unix_ms?: number;
        unix_sec?: number;
    }): number;
    hash(obj: any): number;
    wait(ms: number, honorSkipFade?: boolean): Promise<any>;
    /**Check every `checkInterval` ms if `cond()` is truthy. If, within `timeout`, cond() is truthy, return `true`. Return `false` if time is out.
     * @example
     * // Give the user a 200ms chance to get her pointer over "mydiv". Continue immediately once she does, or after 200ms if she doesn't.
     * mydiv.pointerenter( () => mydiv.pointerHovering = true; )
     * const pointerOnMydiv = await waitUntil(() => mydiv.pointerHovering, 10, 200);*/
    waitUntil(cond: () => boolean, checkInterval?: number, timeout?: number): Promise<boolean>;
} = require('./util');
const nodeutil = require('util');

// const mmnt = require('moment');
const _pft = require('pretty-format');
declare namespace pftns {

    export type Colors = {
        comment: {
            close: string;
            open: string;
        };
        content: {
            close: string;
            open: string;
        };
        prop: {
            close: string;
            open: string;
        };
        tag: {
            close: string;
            open: string;
        };
        value: {
            close: string;
            open: string;
        };
    };
    type Indent = (arg0: string) => string;
    export type Refs = Array<unknown>;
    type Print = (arg0: unknown) => string;
    export type Theme = {
        comment: string;
        content: string;
        prop: string;
        tag: string;
        value: string;
    };
    type ThemeReceived = {
        comment?: string;
        content?: string;
        prop?: string;
        tag?: string;
        value?: string;
    };
    export type Options = {
        callToJSON: boolean;
        escapeRegex: boolean;
        escapeString: boolean;
        highlight: boolean;
        indent: number;
        maxDepth: number;
        min: boolean;
        plugins: Plugins;
        printFunctionName: boolean;
        theme: Theme;
    };
    export type OptionsReceived = {
        callToJSON?: boolean;
        escapeRegex?: boolean;
        escapeString?: boolean;
        highlight?: boolean;
        indent?: number;
        maxDepth?: number;
        min?: boolean;
        plugins?: Plugins;
        printFunctionName?: boolean;
        theme?: ThemeReceived;
    };
    export type Config = {
        callToJSON: boolean;
        colors: Colors;
        escapeRegex: boolean;
        escapeString: boolean;
        indent: string;
        maxDepth: number;
        min: boolean;
        plugins: Plugins;
        printFunctionName: boolean;
        spacingInner: string;
        spacingOuter: string;
    };
    export type Printer = (val: unknown, config: Config, indentation: string, depth: number, refs: Refs, hasCalledToJSON?: boolean) => string;
    type Test = (arg0: any) => boolean;
    export type NewPlugin = {
        serialize: (val: any, config: Config, indentation: string, depth: number, refs: Refs, printer: Printer) => string;
        test: Test;
    };
    type PluginOptions = {
        edgeSpacing: string;
        min: boolean;
        spacing: string;
    };
    export type OldPlugin = {
        print: (val: unknown, print: Print, indent: Indent, options: PluginOptions, colors: Colors) => string;
        test: Test;
    };
    export type Plugin = NewPlugin | OldPlugin;
    export type Plugins = Array<Plugin>;
    export {};

}
const __pft_fn_plugin: pftns.Plugin = {

    print(val: Function) {
        return `[Function ${val.name || 'anonymous'}(${util.getFnArgNames(val)})]`;
    },
    test(val) {
        return typeof val === 'function';
    },

};
const __pft_callsite_plugin: pftns.Plugin = {

    serialize(callsites: any, config: pftns.Config, indentation: string,
              depth: number, refs: pftns.Refs, printer: pftns.Printer): string {

        const vanilla = _pft(callsites);
        return vanilla.replaceAll('Object', 'CallSite');

    },

    test(val) {
        try {
            return util.hasprops(val[0], 'fileName');
        } catch (e) {
            return false;
        }
    }
};
const __pft_class_plugin: pftns.Plugin = {

    serialize(value: any, config: pftns.Config, indentation: string,
              depth: number, refs: pftns.Refs, printer: pftns.Printer): string {

        const vanilla = _pft(value);
        if (/^\w+ {}$/.test(vanilla)) {
            return vanilla.slice(0, -3);
        } else {
            return vanilla;
        }


    },

    test(val) {
        try {
            return typeof val?.constructor === 'function';
        } catch (e) {
            return false;
        }
    }
};

const __pft_plugins = [__pft_fn_plugin, __pft_callsite_plugin,
    /*__pft_class_plugin,*/
];


function pff(val: unknown, options?) {
    if (!options || options == {}) {
        options = { plugins: __pft_plugins };
    } else {
        if (options.plugins) {
            options.plugins.push(...__pft_plugins);
        } else {
            options.plugins = __pft_plugins;
        }
    }
    return _pft(val, options);
}

/*function pp(_val: unknown, _options?) {
    if (!_options || util.isEmpty(_options)) {

        return pf(_val, { min: true });
    } else {
        return pf(_val, { ..._options, min: true });
    }
}*/

function pf(_val: unknown, _options?) {
    if (!_options || util.isEmpty(_options)) {

        return pff(_val, { min: true });
    } else {
        return pff(_val, { ..._options, min: true });
    }
}

// ** Console patches
// * good examples:
// console.log("hello %c world %c wide", "color:blue", 'color:orange')
// console.log("hello %c world %c wide", "color:blue; font-weight:bold", 'color:orange')
// console.log("hello %c world", "color:blue", 'wide')
// * bad examples:
// console.log("hello %c world", 'wide', "color:blue")
// console.log('hello %c', 'world', 'color:blue')
console.orig = {
    log: console.log.bind(console),
    debug: console.debug.bind(console)
};

/**Calls original `console` methods, pretty-formatting each arg, coloring and prefixing the output with [LEVEL]. */
function __generic_format(level: 'debug' | 'log' | 'title' | 'warn', ...args) {
    const formatted_prefix = `%c[${level.toUpperCase()}]%c`;
    const formatted_args: string[] = [];


    let any_linebreak = false;
    for (let arg of args) {
        if (util.isPrimitive(arg)) {
            // str += `${arg} `
            arg = `${arg} `;
            if (arg.includes('\n')) {
                any_linebreak = true;
            }
            formatted_args.push(arg)
        } else {

            let prettified = nodeutil.inspect(arg, { compact: true, colors: false });
            if (prettified.includes('\n')) {
                any_linebreak = true;
            }
            formatted_args.push(prettified);
            // str += `${prettified} `
        }
    }

    // log.apply(window.console, [args.join(' '), 'color:rgba(255,255,255,0.5)', 'color:rgba(255,255,255,0.8)']);
    // console.orig.log(args.join(' '), 'color:rgba(255,255,255,0.5)', 'color:rgba(255,255,255,0.8)');
    // console.orig.log(args.join(' '),'color:white');
    let string;
    let maincolor;
    switch (level) {
        case "title":
            maincolor = 'color:white; font-weight: bold'
            break;
        case "log":
            maincolor = 'color:white'
            break;
        case "debug":
            maincolor = 'color:rgba(255,255,255,0.8)'
            break;
        default: // good for warn
            maincolor = 'color: unset'

    }
    if (any_linebreak) {
        string = `${formatted_prefix}\n${formatted_args.join(' ')}`
    } else {
        string = `${formatted_prefix} ${formatted_args.join(' ')}`

    }
    console.orig[level](string, 'color:rgba(255,255,255,0.5)', maincolor);
}

console.title = console.log.bind(console, '%c[TITLE] %c%s', 'color:rgba(255,255,255,0.5)', 'color:white; font-weight: bold')
const title = console.title;


/**Calls `__generic_format('title')`.
 * @see __generic_format*/
function ptitle(...args) {
    return __generic_format('title', ...args);
}

console.debug = console.debug.bind(console, '%c[DEBUG] %c%s', 'color:rgba(255,255,255,0.5)', 'color:rgba(255,255,255,0.8)')
const debug = console.debug;


/**Calls `__generic_format('debug')`.
 * @see __generic_format*/
function pdebug(...args) {
    return __generic_format('debug', ...args);
}

console.log = console.log.bind(console, '%c[LOG] %c%s', 'color:rgba(255,255,255,0.5)', 'color: unset')
const log = console.log;


/**Calls `__generic_format('log')`.
 * @see __generic_format*/
function plog(...args) {
    return __generic_format('log', ...args);
}

console.warn = console.warn.bind(console, '%c[WARN] %c%s', 'color:rgba(255,255,255,0.5)', 'color: unset')
const warn = console.warn;

/**Calls `__generic_format('warn')`.
 * @see __generic_format*/
function pwarn(...args) {
    return __generic_format('warn', ...args);
}

/*console.debug_ = function () {
    // * good examples:
    // console.log("hello %c world %c wide", "color:blue", 'color:orange')
    // console.log("hello %c world %c wide", "color:blue; font-weight:bold", 'color:orange')
    // console.log("hello %c world", "color:blue", 'wide')
    // * bad examples:
    // console.log("hello %c world", 'wide', "color:blue")
    // console.log('hello %c', 'world', 'color:blue')
    const args: string[] = ['%c[DEBUG]'];
    let str: string = '%c[DEBUG]';
    for (let arg of arguments) {
        if (util.isPrimitive(arg)) {
            str += `${arg} `
            args.push(arg)
        } else {
            let inspected = nodeutil.inspect(arg, { compact: true, colors: false });
            args.push(inspected);
            str += `${inspected} `
        }
    }

    // debug.apply(window.console, [args.join(' '), 'color:rgba(255,255,255,0.5)', 'color:rgba(255,255,255,0.8)']);
    // console.orig.debug(args.join(' '), 'color:rgba(255,255,255,0.5)', 'color:rgba(255,255,255,0.8)');
    // console.orig.debug(args.join(' '),'color:white');
    console.orig.debug(str, 'color:white');

}*/
const elog = require('electron-log').default;
/*(function () {
    var exLog = console.log;
    console.log = function (msg) {
        exLog.apply(this, ["[LOG]",...arguments]);
        // alert(msg);
    }
})()*/


// var debug = console.log.bind(window.console)
elog.catchErrors({
    // ** What this means:
    // Every uncaught error across the app is handled here
    // screenshots are saved and error is formatted in util.onError, then
    // passed to console.error() → __writeConsoleMessageToLogFile()
    showDialog: false,
    onError: util.onError
});


const myfs = require('./myfs');
const { store } = require('./store');


////////////////////////////////////////////////////
// *** Command Line Arguments
////////////////////////////////////////////////////
const { remote } = require('electron');

const argvars: string[] = remote.process.argv.slice(2).map(s => s.toLowerCase());

for (let argvar of argvars) {

}

const DEVTOOLS = argvars.includes('--devtools');
let EDITBIGCONF: string = argvars.find(arg => arg.startsWith('--edit-big-conf'));
if (EDITBIGCONF) {
    if (EDITBIGCONF.slice('--edit-big-conf'.length + 1)) {
        EDITBIGCONF = EDITBIGCONF.slice('--edit-big-conf'.length + 1)
    } else {
        EDITBIGCONF = 'code';
    }
}
let EDITLOG: string = argvars.find(arg => arg.startsWith('--edit-log'))
if (EDITLOG) {
    if (EDITLOG.slice('--edit-log'.length + 1)) {
        EDITLOG = EDITLOG.slice('--edit-log'.length + 1)
    } else {
        EDITLOG = 'code';
    }
}
// const EDITLOG = argvars.includes('--edit-log');
const NOCONSOLELOGTOFILE = argvars.includes('--no-console-log-to-file');
const NOSCREENCAPTURE = argvars.includes('--no-screen-capture');
const NOSCREENSHOTSONERROR = argvars.includes('--no-screenshots-on-error');
const NOSWALONERROR = argvars.includes('--no-swal-on-error');
const DEBUG = argvars.includes('--debug');
const DRYRUN = argvars.includes('--dry-run');
const NOPYTHON = argvars.includes('--no-python');
// const LOG = argvars.includes('log');

const { table: _table } = require('table');

function table(title: string, data) {
    // @ts-ignore
    let pairs: [key: string, value: any] = [];
    if (util.isTMap(data)) {
        for (let [k, v] of Object.entries(data).sort()) {
            pairs.push([`  ${k}`, v])
        }
    } else {
        pairs = data.map(x => [x, ' ']);
    }
    return _table([
        [title, ' '],
        ...pairs
    ])
}

/*console.log(table([
        ['Command Line Arguments:', ''],
        ['  DEVTOOLS', DEVTOOLS],
        ['  EDITBIGCONF', EDITBIGCONF],
        ['  EDITLOG', EDITLOG],
        ['  NOCONSOLELOGTOFILE', NOCONSOLELOGTOFILE],
        ['  NOSCREENCAPTURE', NOSCREENCAPTURE],
        ['  NOSCREENSHOTSONERROR', NOSCREENSHOTSONERROR],
        ['  NOSWALONERROR', NOSWALONERROR],
        ['  DEBUG', DEBUG],
        ['  DRYRUN', DRYRUN],
        ['  NOPYTHON', NOPYTHON],
    ],
    )
);*/
plog(table('Command Line Arguments', {
    DEVTOOLS,
    EDITBIGCONF,
    EDITLOG,
    NOCONSOLELOGTOFILE,
    NOSCREENCAPTURE,
    NOSCREENSHOTSONERROR,
    NOSWALONERROR,
    DEBUG,
    DRYRUN,
    NOPYTHON
}))

////////////////////////////////////////////////////
// *** Path Consts
////////////////////////////////////////////////////
let ROOT_PATH_ABS: string;
let SRC_PATH_ABS: string;
if (path.basename(__dirname) === 'dist' || path.basename(__dirname) === 'src') {
    ROOT_PATH_ABS = path.join(__dirname, '..');
    SRC_PATH_ABS = __dirname;
} else {
    ROOT_PATH_ABS = __dirname;
    SRC_PATH_ABS = path.join(ROOT_PATH_ABS, 'dist');
}


const ERRORS_PATH_ABS = path.join(ROOT_PATH_ABS, 'errors');
myfs.createIfNotExists(ERRORS_PATH_ABS);

// "/home/gilad/Code/pyano-2.0/errors/2020-09-28_15-47-11"
const SESSION_PATH_ABS = path.join(ERRORS_PATH_ABS, new Date().human());
myfs.createIfNotExists(SESSION_PATH_ABS);
// /src/templates
// const TEMPLATES_PATH_ABS = path.join(ROOT_PATH_ABS, 'templates');
// /src/Salamander
// TODO: SRC_PATH_ABS.slice(1)??
// TODO: TEST ON WINDOWS
const SALAMANDER_PATH_ABS = path.join(SRC_PATH_ABS.slice(1), 'Salamander/');

// /src/experiments
const EXPERIMENTS_PATH_ABS = path.join(SRC_PATH_ABS, 'experiments');
myfs.createIfNotExists(EXPERIMENTS_PATH_ABS);


// /src/experiments/truths
const TRUTHS_PATH_ABS = path.join(EXPERIMENTS_PATH_ABS, 'truths');
myfs.createIfNotExists(TRUTHS_PATH_ABS);
// /src/experiments/configs
const CONFIGS_PATH_ABS = path.join(EXPERIMENTS_PATH_ABS, 'configs');
myfs.createIfNotExists(CONFIGS_PATH_ABS);
// /src/experiments/subjects
const SUBJECTS_PATH_ABS = path.join(EXPERIMENTS_PATH_ABS, 'subjects');
myfs.createIfNotExists(SUBJECTS_PATH_ABS);

////////////////////////////////////////////////////
// *** Window Keyboard Shortcuts
////////////////////////////////////////////////////

/* const currentWindow = remote.getCurrentWindow();


currentWindow.on("focus", () => {

    remote.globalShortcut.register('CommandOrControl+Y', () => remote.getCurrentWindow().webContents.openDevTools());
    remote.globalShortcut.register('CommandOrControl+Q', async () => {
        const { default: MyAlert } = require('./MyAlert');
        const action = await MyAlert.big.twoButtons({ title: 'Reset finished trials count and back to New page?' });
        if (action === "second") {
            return;
        }
        require('./Glob').default.BigConfig.last_page = 'new';
        remote.getCurrentWindow().reload();
    });
});
currentWindow.on('blur', () => remote.globalShortcut.unregisterAll());*/


////////////////////////////////////////////////////
// *** Logging
////////////////////////////////////////////////////
let RECORD_START_TS;
let MEDIA_RECORDER: MediaRecorder;
const __logfilepath = path.join(SESSION_PATH_ABS, path.basename(SESSION_PATH_ABS) + '.log');
/*
// this prevents elog from printing to console, because webContents.on("console-message", ...) already prints to console
elog.transports.console.level = false;
elog.transports.file.fileName = path.basename(SESSION_PATH_ABS) + '.log';
elog.transports.file.resolvePath = (variables) => {
    return path.join(SESSION_PATH_ABS, variables.fileName)
}
if (elog.transports.file.getFile().path !== __logfilepath) {
    throw new Error(`elog file path != __logfilepath. elog: ${elog.transports.file.getFile().path}, __logfilepath: ${__logfilepath}`)
} else {
    console.log(`elog file path ok: ${elog.transports.file.getFile().path}`)
}
*/

/*elog.transports.file.file = __logfilepath;
if (NOSCREENCAPTURE) {
    elog.transports.file.format = "[{now}] [{location}] [{level}]{scope} {text}"
} else {
    elog.transports.file.format = "[{now}] [{rec_time}s] [{level}]{scope} {text}"
}*/

function __print_git_stats() {

    const lastgitlog = util.safeExec('git log --pretty="%h -%d %s (%cD) <%an>" --all -n 1');
    if (lastgitlog) {
        console.debug(`Last git log:\n"${lastgitlog}"`);
    }
    const gitdiff = util.safeExec('git diff --compact-summary');
    if (gitdiff) {
        console.debug(`Current git diff:\n${gitdiff}`);
    }
}

const __loglevels = { 0: 'debug', 1: 'log', 2: 'warn', 3: 'error' };

// ** This is where each console.<whatever> call gets written to file
function __writeConsoleMessageToLogFile(event, level, message, line, sourceId) {
    /// Problem is that message is always a string, so even if e.g. console.error(new Error()), we get the toString'ed version
    if (sourceId.includes('electron/js2c/renderer_init.js')) {
        return;
    }

    if (message.includes('%c')) {
        message = message.removeAll(/(%c|text-decoration:\s?[^\s]*)/).trim();
    }
    const date = new Date();


    const now = date.human("DD-MM-YYYY_HH-mm-ss-fff");
    const unix_ms = date.getTime();
    const unix_sec = util.now(0, { unix_ms });
    // seconds since program start
    const rel_ts = util.round(unix_sec - TS0);
    let relSourceId;
    if (sourceId.startsWith('file://')) {
        relSourceId = path.relative('file://' + ROOT_PATH_ABS, sourceId);
    } else {
        relSourceId = path.relative(ROOT_PATH_ABS, sourceId);
    }
    const levelName = __loglevels[level];
    if (levelName === undefined) {
        console.warn(`on console-message | undefined level: `, level);
        return;
    }
    const location = `${relSourceId}:${line}`;
    if (message.startsWith('╔')) {
        message = `\n${message}`;
    }
    let msg;
    if (RECORD_START_TS) {
        const rec_time = util.round(util.now(2, { unix_ms }) - RECORD_START_TS, 2);
        msg = `[${now} ${rel_ts}][${rec_time}s][${levelName}] [${location}] ${message}\n`;
    } else {
        msg = `[${now} ${rel_ts}][${levelName}] [${location}] ${message}\n`;
    }
    let fd = undefined;
    try {
        fd = fs.openSync(__logfilepath, 'a');
        fs.appendFileSync(fd, msg);
    } catch (e) {
        if (DEVTOOLS) {
            debugger;
        }
    } finally {
        if (fd !== undefined) {
            fs.closeSync(fd);
        }
    }
    // elog[levelName](message, { location })
    /*
    elog.transports.file({
        data: [`${sourceId}:${line}`, message],
        level: levelName,

    })*/
}

if (!NOCONSOLELOGTOFILE) {
    remote.getCurrentWindow().webContents.on("console-message", __writeConsoleMessageToLogFile);
}


__print_git_stats();

////////////////////////////////////////////////////
// *** Screen Capture
////////////////////////////////////////////////////
if (NOSCREENCAPTURE) {
    console.warn('NOSCREENCAPTURE, not capturing');
} else {
    import('./initializers/screen_capture');
}

plog(table('Path Constants:', {
        ROOT_PATH_ABS,
        SRC_PATH_ABS,
        ERRORS_PATH_ABS,
        SESSION_PATH_ABS,
        SALAMANDER_PATH_ABS,
        EXPERIMENTS_PATH_ABS,
        TRUTHS_PATH_ABS,
        CONFIGS_PATH_ABS,
        SUBJECTS_PATH_ABS,
    }
    )
);


// used in __writeConsoleMessageToLogFile
const TS0 = util.now();
plog(table('Times:', {
        TS0,
        'process.uptime()': process.uptime()
    }
))
plog(table('Globally Accessible Modules:',
    ['path', 'fs', 'util', 'elog', 'pf / pff', 'myfs', 'store', 'remote', 'table']
    )
);

// Keep BigConfig at EOF
const BigConfig = new store.BigConfigCls(true);
if (EDITLOG || EDITBIGCONF) {
    const { spawnSync } = require('child_process');
    setTimeout(() => {
        if (EDITLOG) {
            console.debug(`editing log file with ${EDITLOG}`);
            spawnSync(EDITLOG, [__logfilepath]);
        }
        if (EDITBIGCONF) {
            console.debug(`editing big config file: ${BigConfig.path}`);
            util.editBigConfig()
        }
    }, 1000);
}
// console.groupEnd();