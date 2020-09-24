// *** Properties Of This File
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
// ***          Interfaces
////////////////////////////////////////////////////
interface TMap<T> {
    [s: string]: T;

    [s: number]: T
}

interface String {
    endsWithAny(...args: string[]): boolean

    human(): string

    isdigit(): boolean

    lower(): string

    upper(): string

    removeAll(removeValue: string | number | RegExp | TMap<string>, ...removeValues: (string | number | RegExp | TMap<string>)[]): string

    replaceAll(searchValue: TMap<string>): string

    replaceAll(searchValue: string | number | RegExp, replaceValue: string): string

    title(): string

    partition(val: string): [string, string, string];

    upTo(searchString: string, searchFromEnd?: boolean): string
}

interface Array<T> {
    _lowerAll: T[];

    /**Also caches _lowerAll*/
    lowerAll(): T[]

    count(item: T): number

    count(predicate: (item: T) => boolean): number

    lazy(fn: (item: T) => T): IterableIterator<T>
}

interface Number {
    human(letters?: boolean): string
}

interface Error {
    toObj(): { what: string, where: string, whilst?: string, locals?: TMap<any> }
}

interface Date {
    /**"31-12-2020_23-40-50-789"*/
    human(format: 'DD-MM-YYYY_HH-mm-ss-fff'): string

    /**"31-12-2020_23-40-50"*/
    human(format: 'DD-MM-YYYY_HH-mm-ss'): string

    /**"2020-12-31_23-40-50-789"*/
    human(format: 'YYYY-MM-DD_HH-mm-ss-fff'): string

    /**"2020-12-31_23-40-50"*/
    human(format: 'YYYY-MM-DD_HH-mm-ss'): string

    /**"2020-12-31_23-40-50"*/
    human(): string

}

interface ILevel {
    notes: number;
    rhythm: boolean;
    tempo: number | null;
    trials: number;
}

////////////////////////////////////////////////////
// ***          Prototype Properties
////////////////////////////////////////////////////
Object.defineProperty(Object.prototype, "keys", {
    enumerable: false,
    value(): Array<string | number> {
        // @ts-ignore
        return Object.keys(this).map(key => key.isdigit()
            ? parseInt(key) : key);
    }
});
// **  Array
Object.defineProperty(Array.prototype, "lazy", {
    enumerable: false,
    * value(fn) {
        for (let x in this) {
            yield fn(x)
        }
    }
},);
Object.defineProperty(Array.prototype, "last", {
    enumerable: false,
    value() {
        return this[this.length - 1];
    }
},);
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
},);
Object.defineProperty(Array.prototype, "rsort", {
    enumerable: false,
    value() {
        return this.sort((n, m) => n < m);
    }
},);
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

},);
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
},);
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
},);
Object.defineProperty(String.prototype, "in", {
    enumerable: false,
    value(arr: any[]): boolean {
        return arr.includes(this.valueOf());
    }
},);
Object.defineProperty(String.prototype, "lower", {
    enumerable: false,
    value(): string {
        return this.toLowerCase();
    }
},);
Object.defineProperty(String.prototype, "upper", {
    enumerable: false,
    value(): string {
        return this.toUpperCase()
    }
},);
Object.defineProperty(String.prototype, "title", {
    enumerable: false,
    value(): string {
        if (this.includes(' ')) {
            return this.split(' ').map(str => str.title()).join(' ');
        } else {
            if (this.match(/[_\-.]/)) {
                let temp = this.replaceAll(/[_\-.]/, ' ');
                return temp.title()
            } else {
                return this[0].upper() + this.slice(1, this.length).lower();
            }
        }


    }
},);
Object.defineProperty(String.prototype, "partition", {
    enumerable: false,
    value(val: string): [string, string, string] {
        const idx = this.indexOf(val);
        const before = this.substring(0, idx);
        const after = this.substring(idx + val.length);
        return [before, val, after];
    }
},);
Object.defineProperty(String.prototype, "isdigit", {
    enumerable: false,
    value(): boolean {
        return !isNaN(Math.floor(this));
    }
},);
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
            ret = `${D}-${M}-${Y}_${HHmmss}`
        } else {
            ret = `${Y}-${M}-${D}_${HHmmss}`
        }
        if (format.endsWith('fff')) {
            ret += `-${this.getMilliseconds()}`; // 789
        }
        return ret;
    }
});
// **  Error
Object.defineProperty(Error.prototype, "toObj", {
    enumerable: false, value() {
        // Note: require('stack-trace').parse(e) does a better job with cleanstack
        const where = this.stack.slice(this.stack.search(/(?<=\s)at/), this.stack.search(/(?<=at\s.*)\n/));
        const what = this.message;
        const whilst = this.whilst;
        const locals = this.locals;
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
        return { what, where, whilst, locals }
    }
});

////////////////////////////////////////////////////
// ***          Libraries (require calls)
////////////////////////////////////////////////////
// @ts-ignore
const path = require('path');
const fs = require('fs');


const _pft = require('pretty-format');
declare namespace pftns {

    export  type Colors = {
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
    export  type Refs = Array<unknown>;
    type Print = (arg0: unknown) => string;
    export  type Theme = {
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
    export  type Options = {
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
    export  type OptionsReceived = {
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
    export  type Config = {
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
    export  type Printer = (val: unknown, config: Config, indentation: string, depth: number, refs: Refs, hasCalledToJSON?: boolean) => string;
    type Test = (arg0: any) => boolean;
    export  type NewPlugin = {
        serialize: (val: any, config: Config, indentation: string, depth: number, refs: Refs, printer: Printer) => string;
        test: Test;
    };
    type PluginOptions = {
        edgeSpacing: string;
        min: boolean;
        spacing: string;
    };
    export  type OldPlugin = {
        print: (val: unknown, print: Print, indent: Indent, options: PluginOptions, colors: Colors) => string;
        test: Test;
    };
    export  type Plugin = NewPlugin | OldPlugin;
    export  type Plugins = Array<Plugin>;
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
            return util.hasprops(val[0], 'fileName')
        } catch (e) {
            return false
        }
    }
}
const __pft_class_plugin: pftns.Plugin = {

    serialize(value: any, config: pftns.Config, indentation: string,
              depth: number, refs: pftns.Refs, printer: pftns.Printer): string {

        const vanilla = _pft(value);
        if (/^\w+ {}$/.test(vanilla)) {
            return vanilla.slice(0, -3)
        } else {
            return vanilla;
        }


    },

    test(val) {
        try {
            return typeof val?.constructor === 'function'
        } catch (e) {
            return false
        }
    }
}

const __pft_plugins = [__pft_fn_plugin, __pft_callsite_plugin, /*__pft_class_plugin*/]
// const mmnt = require('moment');
const util = require('./util');

const elog = require('electron-log').default;

function pft(val: unknown, options?) {
    if (!options || util.isEmpty(options)) {
        options = { plugins: __pft_plugins }
    } else {
        if (options.plugins) {
            options.plugins.push(...__pft_plugins)
        } else {
            options.plugins = __pft_plugins
        }
    }
    return _pft(val, options)
}

function pftm(_val: unknown, _options?) {
    if (!_options || util.isEmpty(_options)) {

        return pft(_val, { min: true })
    } else {
        return pft(_val, { ..._options, min: true })
    }
}

elog.catchErrors({
    // ** What this means:
    // Every uncaught error across the app is handled here
    // screenshots are saved and error is formatted in util.formatErr, then
    // passed to console.error() → __writeConsoleMessageToLogFile()
    showDialog: false,
    onError: util.onError
});


const myfs = require('./myfs');
const coolstore = require('./coolstore');

const swalert = require('./swalert.js');


////////////////////////////////////////////////////
// ***          Command Line Arguments
////////////////////////////////////////////////////
const { remote } = require('electron');
const argvars = remote.process.argv.slice(2).map(s => s.toLowerCase());
const DEBUG = argvars.includes('--debug');
const DRYRUN = argvars.includes('--dry-run');
const NOPYTHON = argvars.includes('--no-python');
const NOSCREENCAPTURE = argvars.includes('--no-screen-capture');
const AUTOEDITLOG = argvars.includes('--auto-edit-log');
const DEVTOOLS = argvars.includes('--devtools');
// const LOG = argvars.includes('log');

const { table } = require('table');
console.log(table([
        ['Command Line Arguments', ''],
        ['DEBUG', DEBUG],
        ['DRYRUN', DRYRUN],
        ['NOPYTHON', NOPYTHON],
        ['NOSCREENCAPTURE', NOSCREENCAPTURE],
        ['AUTOEDITLOG', AUTOEDITLOG],
        ['DEVTOOLS', DEVTOOLS],
    ],
    )
);

////////////////////////////////////////////////////
// ***          Path Consts
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
// "2020-09-13_14:27:33"
const SESSION_PATH_ABS = path.join(ERRORS_PATH_ABS, new Date().human());
myfs.createIfNotExists(SESSION_PATH_ABS);
// /src/templates
// const TEMPLATES_PATH_ABS = path.join(ROOT_PATH_ABS, 'templates');
// /src/Salamander
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
/*
////////////////////////////////////////////////////
// ***          Window Keyboard Shortcuts
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
// ***          Logging
////////////////////////////////////////////////////

const __logfilepath = path.join(SESSION_PATH_ABS, path.basename(SESSION_PATH_ABS) + '.log');
/*// this prevents elog from printing to console, because webContents.on("console-message", ...) already prints to console
elog.transports.console.level = false;
elog.transports.file.fileName = path.basename(SESSION_PATH_ABS) + '.log';
elog.transports.file.resolvePath = (variables) => {
    return path.join(SESSION_PATH_ABS, variables.fileName)
}
if (elog.transports.file.getFile().path !== __logfilepath) {
    throw new Error(`elog file path != __logfilepath. elog: ${elog.transports.file.getFile().path}, __logfilepath: ${__logfilepath}`)
} else {
    console.log(`elog file path ok: ${elog.transports.file.getFile().path}`)
}*/

/*elog.transports.file.file = __logfilepath;
if (NOSCREENCAPTURE) {
    elog.transports.file.format = "[{now}] [{location}] [{level}]{scope} {text}"
} else {
    elog.transports.file.format = "[{now}] [{rec_time}s] [{level}]{scope} {text}"
}*/

function __logGitStats() {
    const currentbranch = util.safeExec('git branch --show-current')
    if (currentbranch) {
        console.debug(`Current git branch: "${currentbranch}"`)
    }
    const currentcommit = util.safeExec('git log --oneline -n 1')
    if (currentcommit) {
        console.debug(`Current git commit: "${currentcommit}"`)
    }
    const gitdiff = util.safeExec('git diff --compact-summary')
    if (gitdiff) {
        console.debug(`Current git diff:\n${gitdiff}`)
    }
}

const __loglevels = { 0: 'debug', 1: 'log', 2: 'warn', 3: 'error' };

function __writeConsoleMessageToLogFile(event, level, message, line, sourceId) {
    /// Problem is that message is always a string, so even if e.g. console.error(new Error()), we get the toString'ed version
    if (sourceId.includes('electron/js2c/renderer_init.js')) {
        return;
    }


    const d = new Date();


    const now = d.human("DD-MM-YYYY_HH-mm-ss-fff")
    const ts = d.getTime() / 1000;
    const rel_ts = util.round(ts - TS0);
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
    const msg = `[${now} ${rel_ts}][${levelName}] [${location}] ${message}\n`;
    let fd = undefined;
    try {
        fd = fs.openSync(__logfilepath, 'a');
        fs.appendFileSync(fd, msg);
    } catch (e) {
        const formattedItems = util.formatErr(e);
        debugger;
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

remote.getCurrentWindow().webContents.on("console-message", __writeConsoleMessageToLogFile);
if (AUTOEDITLOG) {
    console.debug('editing log file with vscode');
    const { spawnSync } = require('child_process');
    spawnSync('code', [__logfilepath]);
}
__logGitStats();

////////////////////////////////////////////////////
// ***          Screen Capture
////////////////////////////////////////////////////
import('./initializers/screen_capture')

console.log(table([
        ['Path Constants', ''],
        ['ROOT_PATH_ABS', ROOT_PATH_ABS,],
        ['SRC_PATH_ABS', SRC_PATH_ABS,],
        ['ERRORS_PATH_ABS', ERRORS_PATH_ABS,],
        ['SESSION_PATH_ABS', SESSION_PATH_ABS,],
        ['SALAMANDER_PATH_ABS', SALAMANDER_PATH_ABS,],
        ['EXPERIMENTS_PATH_ABS', EXPERIMENTS_PATH_ABS,],
        ['TRUTHS_PATH_ABS', TRUTHS_PATH_ABS,],
        ['CONFIGS_PATH_ABS', CONFIGS_PATH_ABS,],
        ['SUBJECTS_PATH_ABS', SUBJECTS_PATH_ABS,],
    ],
    )
);


// Keep BigConfig at EOF
const BigConfig = new coolstore.BigConfigCls(true);
const TS0 = util.now();
console.log(table([
        ['Times', ''],
        ['TS0', TS0,],
        ['process.uptime()', process.uptime(),],

    ],
    )
)
// console.groupEnd();