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


console.group(`renderer.ts`);

// *** Interfaces
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
    human(locale?: 'en-US' | 'he-IL'): string
}

interface ILevel {
    notes: number;
    rhythm: boolean;
    tempo: number | null;
    trials: number;
}

// *** Prototype Properties
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
            elog.warn(`${this.valueOf()}.upTo(${searchString},${searchFromEnd}) index is -1`);
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
            elog.warn(`replaceAll got a bad type, searchValue: ${searchValue}, type: ${type}`);
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
    value(locale: 'en-US' | 'he-IL' = 'en-US') { // "13_09_2020_17:29:31"
        let format;
        if (locale === "he-IL") {
            format = 'DD-MM-YYYY_HH:mm:ss'
        } else {
            format = 'YYYY-MM-DD_HH:mm:ss'
        }
        return moment(moment.now()).format(format)
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
        return { what, where, whilst, locals }
    }
});
// *** Libraries
// @ts-ignore
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const util = require('./util');
const elog = require('electron-log').default;

elog.catchErrors({
    // ** What this means:
    // Every uncaught error across the app is handled here
    // elog.error(e) is called, and since `errhook` was pushed to elog.hooks,
    // screenshots are saved and error is handled in util.formatErr then written to log file.
    onError(e: Error,
            versions?: { app: string; electron: string; os: string },
            submitIssue?: (url: string, data: any) => void) {
        elog.error(e);
        return false;
    },
    showDialog: true
})

const myfs = require('./myfs');
// const { BetterHTMLElement } = require('./bhe');

const coolstore = require('./coolstore');
const swalert = require('./swalert.js');


// *** Command Line Arguments
const { ipcRenderer, remote } = require('electron');
const argvars = remote.process.argv.slice(2).map(s => s.toLowerCase());
const DEBUG = argvars.includes('debug');
const DRYRUN = argvars.includes('dry-run');
const NOPYTHON = argvars.includes('no-python');
// const LOG = argvars.includes('log');

// *** Path Consts
let ROOT_PATH_ABS: string;
let SRC_PATH_ABS: string;
if (path.basename(__dirname) === 'dist' || path.basename(__dirname) === 'src') {
    ROOT_PATH_ABS = path.join(__dirname, '..');
    SRC_PATH_ABS = __dirname;
} else {
    ROOT_PATH_ABS = __dirname;
    SRC_PATH_ABS = path.join(ROOT_PATH_ABS, 'dist');
}

// const { default: MyAlert } = require('./MyAlert');
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

// const currentWindow = remote.getCurrentWindow();


/*currentWindow.on("focus", () => {

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

// *** Log logic
function __errhook(message, selectedTransport) {
    // if elog.error(e:Error) was called, save screenshots,
    // extract nice trace and extra info from error, and
    // continue normally (prints to devtools console, terminal that launched pyano, and to log file)
    message.variables.now = moment(moment.now()).format('YYYY-MM-DD HH:mm:ss:SSS X');
    if (message.variables.record_start_ts) {
        message.variables.rec_time = (util.now(1) - message.variables.record_start_ts) / 10;

    }
    if (message.level === "error" && message.data[0] instanceof Error) {


        util.saveScreenshots()
            .then(value => {
                elog.debug('Saved screenshots successfully')
            })
            .catch(reason => {
                elog.debug('Failed saving screenshots')

            })
        const formattedErr = util.formatErr(message.data[0])
        return { ...message, data: formattedErr };

    }

    return message;
}

function __logGitStats() {
    const currentbranch = util.safeExec('git branch --show-current')
    if (currentbranch) {
        elog.info(`Current git branch: "${currentbranch}"`)
    }
    const currentcommit = util.safeExec('git log --oneline -n 1')
    if (currentcommit) {
        elog.info(`Current git commit: "${currentcommit}"`)
    }
    const gitdiff = util.safeExec('git diff --compact-summary')
    if (gitdiff) {
        elog.info(`Current git diff:\n${gitdiff}`)
    }
}

// elog[0] = elog.debug;
// elog[1] = elog.info;
// elog[2] = elog.warn;
// elog[3] = elog.error;


elog.transports.file.file = path.join(SESSION_PATH_ABS, path.basename(SESSION_PATH_ABS) + '.log');
elog.transports.file.format = "[{now}] [{rec_time}s] [{level}]{scope} {text}"
// elog.transports.file.format = (message) => {
//     // let now = Math.round(message.date.getTime() / 1000);
//     // debugger;
//
//     const m = moment(moment.now()).format('YYYY-MM-DD HH:mm:ss:SSS X')
//     return `[${m}] [${message.level}] ${message.data.map(x => `${x}`.startsWith('[object') ? JSON.parse(JSON.stringify(x)) : x).join(" ")}`
//
//     // return '[{h}:{i}:{s}] [{level}] {text}'
// }

elog.hooks.push(__errhook)
__logGitStats();

// elog.transports.file.format = '{h}:{i}:{s}.{ms} [{level}] › {text}';


/*currentWindow.webContents.on("console-message",
    (event: Event, level, message, line, sourceId) => {
        if (message.includes('console.group')) {
            return
        }
        if (sourceId.includes('electron/js2c/renderer_init.js')) {
            return
        }
        let levelName;
        levelName = ({ 0: 'DEBUG', 1: 'LOG', 2: 'WARN', 3: 'ERROR' })[level]
        if (levelName === undefined) {

            elog.silly(`on console-message | undefined level: `, level);
            return
        }
        sourceId = path.relative(ROOT_PATH_ABS, sourceId);
        elog.transports.file({
            data: [`${sourceId}:${line}`, message],
            level: levelName,

        })

    });*/

// *** Screen Capture
const { desktopCapturer } = require('electron')
desktopCapturer.getSources({ types: ['window'] }).then(async sources => {
    for (const { id, name, display_id } of sources) {
        elog.debug(`desktopCapturer.getSources() source:`, { id, name, display_id });
        let shouldCapture = (
            // source.name.includes('Developer Tools') ||
            // source.name.includes('DevTools') ||
            name == 'Pyano'
            // name.includes('מכבי')
        );

        if (shouldCapture) {
            // https://www.electronjs.org/docs/api/desktop-capturer
            const constraints = {
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: id,
                        // minWidth: 1280,
                        // maxWidth: 1280,
                        // minHeight: 720,
                        // maxHeight: 720
                    }
                }
            };
            const stream: MediaStream = await navigator.mediaDevices.getUserMedia(constraints)
            elog.debug('created stream:', stream);

            // handleStream(stream);
            // const mimeType = 'video/webm; codecs=vp24';
            const mimeType = 'video/webm';
            let mediaRecorder = new MediaRecorder(stream, {
                audioBitsPerSecond: 128000,
                videoBitsPerSecond: 2500000,
                mimeType
            })
            elog.debug('created mediaRecorder:', mediaRecorder);
            const recordedChunks = [];
            let stopped = false;

            async function handleStop(e) {
                elog.debug('handleStop()')
                const blob = new Blob(recordedChunks, {
                    type: mimeType
                });

                const buffer = Buffer.from(await blob.arrayBuffer());


                const vidpath = path.join(SESSION_PATH_ABS, path.basename(SESSION_PATH_ABS) + '.webm')
                elog.debug('saving vid...')
                fs.writeFile(vidpath, buffer, () => elog.log('video saved successfully!'));
                stopped = true;
            }

            mediaRecorder.ondataavailable = function (e) {
                elog.debug('video data available, pushing to recordedChunks');
                recordedChunks.push(e.data);
            };
            mediaRecorder.onstop = handleStop;
            mediaRecorder.start();
            elog.variables["record_start_ts"] = util.now(1);
            elog.debug('mediaRecorder.start()', mediaRecorder);
            ipcRenderer.on('stop-record', async (event, args) => {
                elog.debug('got stop-record signal, stopping!');
                mediaRecorder.stop();
                await util.waitUntil(() => stopped, 5, 2500);
                elog.debug('done writing vid to file');
            })
            // await util.wait(3000);
            // elog.debug('waited 2s, now stopping')
            // mediaRecorder.stop();

            return
        }
    }
})

function handleStream(stream) {
    const video = document.querySelector('video')
    video.srcObject = stream
    video.onloadedmetadata = (e) => video.play()
}


console.table({
    __dirname,
    ROOT_PATH_ABS,
    SRC_PATH_ABS,
    ERRORS_PATH_ABS,
    SESSION_PATH_ABS,
    SALAMANDER_PATH_ABS,
    EXPERIMENTS_PATH_ABS,
    TRUTHS_PATH_ABS,
    CONFIGS_PATH_ABS,
    SUBJECTS_PATH_ABS,
    DEBUG,
    DRYRUN,
    NOPYTHON,
});

// Keep BigConfig at EOF
const BigConfig = new coolstore.BigConfigCls(true);
console.groupEnd();