// *** Properties Of This File
/*
- Objects are globally accessible across app, no import needed
- Cannot have ES6 imports, only require(). Otherwise, objects no longer globally accessible
*/
////////////////////////////////////////////////////
// ***          Prototype Properties
////////////////////////////////////////////////////
Object.defineProperty(Object.prototype, "keys", {
    enumerable: false,
    value() {
        // @ts-ignore
        return Object.keys(this).map(key => key.isdigit()
            ? parseInt(key) : key);
    }
});
// **  Array
Object.defineProperty(Array.prototype, "lazy", {
    enumerable: false,
    *value(fn) {
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
    value(item) {
        let _count = 0;
        if (util.isFunction(item)) {
            for (let x of this) {
                if (item(x)) {
                    _count++;
                }
            }
        }
        else {
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
    value(...args) {
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
    value(searchString, searchFromEnd = false) {
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
    value(arr) {
        return arr.includes(this.valueOf());
    }
});
Object.defineProperty(String.prototype, "lower", {
    enumerable: false,
    value() {
        return this.toLowerCase();
    }
});
Object.defineProperty(String.prototype, "upper", {
    enumerable: false,
    value() {
        return this.toUpperCase();
    }
});
Object.defineProperty(String.prototype, "title", {
    enumerable: false,
    value() {
        if (this.includes(' ')) {
            return this.split(' ').map(str => str.title()).join(' ');
        }
        else {
            if (this.match(/[_\-.]/)) {
                let temp = this.replaceAll(/[_\-.]/, ' ');
                return temp.title();
            }
            else {
                return this[0].upper() + this.slice(1, this.length).lower();
            }
        }
    }
});
Object.defineProperty(String.prototype, "partition", {
    enumerable: false,
    value(val) {
        const idx = this.indexOf(val);
        const before = this.substring(0, idx);
        const after = this.substring(idx + val.length);
        return [before, val, after];
    }
});
Object.defineProperty(String.prototype, "isdigit", {
    enumerable: false,
    value() {
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
    value(searchValue, replaceValue) {
        const type = typeof searchValue;
        if (type === 'string' || type === 'number') {
            return this
                .split(searchValue)
                .join(replaceValue);
        }
        else if (type === 'object') {
            if (searchValue.compile) {
                let temp = this;
                let replaced = temp.replace(searchValue, replaceValue);
                while (replaced !== temp) {
                    temp = replaced;
                    replaced = replaced.replace(searchValue, replaceValue);
                }
                return replaced;
            }
            else {
                let temp = this;
                for (let [sv, rv] of Object.entries(searchValue))
                    temp = temp.replaceAll(sv, rv);
                return temp;
            }
        }
        else {
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
    value(locale = 'en-US') {
        let format;
        if (locale === "he-IL") {
            format = 'DD-MM-YYYY_HH:mm:ss';
        }
        else {
            format = 'YYYY-MM-DD_HH:mm:ss';
        }
        return mmnt(mmnt.now()).format(format);
        /*let d = this.getUTCDate();
        d = d < 10 ? `0${d}` : d;
        let m = this.getMonth() + 1;
        m = m < 10 ? `0${m}` : m;
        const y = this.getFullYear();
        const t = this.toTimeString().slice(0, 8).replaceAll(':', '-');
        return `${d}_${m}_${y}_${t}`;*/
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
        return { what, where, whilst, locals };
    }
});
////////////////////////////////////////////////////
// ***          Libraries (require calls)
////////////////////////////////////////////////////
// @ts-ignore
const path = require('path');
const fs = require('fs');
const mmnt = require('moment');
const util = require('./util');
const elog = require('electron-log').default;
/*
elog.catchErrors({
    // ** What this means:
    // Every uncaught error across the app is handled here
    // console.error(e) is called, and since `messagehook` was pushed to elog.hooks (in initializers/logging.ts),
    // screenshots are saved and error is handled in util.formatErr, then written to log file.
    showDialog: true,
    onError(error: Error, versions?: { app: string; electron: string; os: string }, submitIssue?: (url: string, data: any) => void) {
        console.error(error);
        return false;
    }
})
*/
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
// const LOG = argvars.includes('log');
const { table } = require('table');
console.log(table([
    ['Command Line Arguments', ''],
    ['DEBUG', DEBUG],
    ['DRYRUN', DRYRUN],
    ['NOPYTHON', NOPYTHON],
    ['NOSCREENCAPTURE', NOSCREENCAPTURE],
    ['AUTOEDITLOG', AUTOEDITLOG],
]));
////////////////////////////////////////////////////
// ***          Path Consts
////////////////////////////////////////////////////
let ROOT_PATH_ABS;
let SRC_PATH_ABS;
if (path.basename(__dirname) === 'dist' || path.basename(__dirname) === 'src') {
    ROOT_PATH_ABS = path.join(__dirname, '..');
    SRC_PATH_ABS = __dirname;
}
else {
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
// import('./initializers/logging')
// this prevents elog from printing to console, because webContents.on("console-message", ...) already prints to console
elog.transports.console.level = false;
const __logfilepath = path.join(SESSION_PATH_ABS, path.basename(SESSION_PATH_ABS) + '.log');
// const __writestream = fs.createWriteStream(__logfilepath);
function __logGitStats() {
    const currentbranch = util.safeExec('git branch --show-current');
    if (currentbranch) {
        console.debug(`Current git branch: "${currentbranch}"`);
    }
    const currentcommit = util.safeExec('git log --oneline -n 1');
    if (currentcommit) {
        console.debug(`Current git commit: "${currentcommit}"`);
    }
    const gitdiff = util.safeExec('git diff --compact-summary');
    if (gitdiff) {
        console.debug(`Current git diff:\n${gitdiff}`);
    }
}
const __loglevels = { 0: 'debug', 1: 'log', 2: 'warn', 3: 'error' };
remote.getCurrentWindow().webContents.on("console-message", (event, level, message, line, sourceId) => {
    if (sourceId.includes('electron/js2c/renderer_init.js')) {
        return;
    }
    const d = new Date();
    // toLocaleDateString() returns '9/22/2020'
    const now = `${d.toLocaleDateString()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()}`;
    const ts = d.getTime() / 1000;
    let relSourceId;
    if (sourceId.startsWith('file://')) {
        relSourceId = path.relative('file://' + ROOT_PATH_ABS, sourceId);
    }
    else {
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
    const msg = `[${now} ${ts}][${levelName}] [${location}] ${message}\n`;
    let fd = undefined;
    try {
        fd = fs.openSync(__logfilepath, 'a');
        fs.appendFileSync(fd, msg);
    }
    catch (e) {
        const formattedItems = util.formatErr(e);
        debugger;
    }
    finally {
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
});
if (AUTOEDITLOG) {
    console.debug('editing log file with vscode');
    const { spawnSync } = require('child_process');
    spawnSync('code', [__logfilepath]);
}
__logGitStats();
////////////////////////////////////////////////////
// ***          Screen Capture
////////////////////////////////////////////////////
Promise.resolve().then(() => require('./initializers/screen_record'));
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
]));
// Keep BigConfig at EOF
const BigConfig = new coolstore.BigConfigCls(true);
// console.groupEnd();
