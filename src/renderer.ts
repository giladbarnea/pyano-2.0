// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.


import { wait } from "./util";

const { remote } = require('electron');
const argvars = remote.process.argv.slice(2).map(s => s.toLowerCase());
const DEBUG = argvars.includes('debug');
const DRYRUN = argvars.includes('dry-run');
// @ts-ignore
const path = require('path');
// const fs = require('fs');
let ROOT_PATH_ABS: string;
let SRC_PATH_ABS: string;
if ( path.basename(__dirname) === 'src' ) {
    ROOT_PATH_ABS = path.join(__dirname, '..');
    SRC_PATH_ABS = __dirname;
} else {
    ROOT_PATH_ABS = __dirname;
    SRC_PATH_ABS = path.join(ROOT_PATH_ABS, 'src');
}
// /src/templates
const TEMPLATES_PATH_ABS = path.join(ROOT_PATH_ABS, 'templates');
// /src/templates/Salamander
const SALAMANDER_PATH_ABS = path.join(TEMPLATES_PATH_ABS, 'Salamander');

// /src/experiments
const EXPERIMENTS_PATH_ABS = path.join(SRC_PATH_ABS, 'experiments');
// /src/experiments/truths
const TRUTHS_PATH_ABS = path.join(EXPERIMENTS_PATH_ABS, 'truths');
// /src/experiments/configs
const CONFIGS_PATH_ABS = path.join(EXPERIMENTS_PATH_ABS, 'configs');
// /src/experiments/subjects
const SUBJECTS_PATH_ABS = path.join(EXPERIMENTS_PATH_ABS, 'subjects');
process.env.ROOT_PATH_ABS = ROOT_PATH_ABS;
process.env.SRC_PATH_ABS = SRC_PATH_ABS;

process.env.TEMPLATES_PATH_ABS = TEMPLATES_PATH_ABS;
process.env.SALAMANDER_PATH_ABS = SALAMANDER_PATH_ABS;

process.env.EXPERIMENTS_PATH_ABS = EXPERIMENTS_PATH_ABS;
process.env.TRUTHS_PATH_ABS = TRUTHS_PATH_ABS;
process.env.CONFIGS_PATH_ABS = CONFIGS_PATH_ABS;
process.env.SUBJECTS_PATH_ABS = SUBJECTS_PATH_ABS;

// **  PythonShell
const { PythonShell } = require("python-shell");
const enginePath = path.join(ROOT_PATH_ABS, "src", "engine");
const pyExecPath = path.join(enginePath, process.platform === "linux" ? "env/bin/python" : "env/Scripts/python.exe");
console.group(`renderer.ts`);
console.table({
    __dirname, ROOT_PATH_ABS, SRC_PATH_ABS,
    TEMPLATES_PATH_ABS,
    SALAMANDER_PATH_ABS,
    EXPERIMENTS_PATH_ABS,
    TRUTHS_PATH_ABS,
    CONFIGS_PATH_ABS,
    SUBJECTS_PATH_ABS,
    DEBUG, DRYRUN,
    enginePath, pyExecPath
});
/*const { spawnSync } = require('child_process');
 const { output } = spawnSync(PythonShell.getPythonPath(), [ '-c print("hi")' ]);
 if ( output === null ) {
 // TODO: test
 console.error(`Spawning a PythonShell.getPythonPath() failed`);
 process.exit(0);
 }*/
PythonShell.defaultOptions = {
    pythonPath : pyExecPath,
    // scriptPath : enginePath,
    pythonOptions : [ '-OO' ],
};


PythonShell.prototype.runAsync = function (): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const messages = [];
        this.on('message', message => messages.push(message));
        
        
        this.end((err, code, signal) => {
            if ( err ) reject(err);
            resolve(messages)
        });
    });
};
PythonShell.myrun = function (scriptPath: string, options = { args : [], pythonOptions : [ '-OO' ] }, callback) {
    
    if ( scriptPath.startsWith('-m') ) {
        scriptPath = scriptPath.slice(3);
        if ( !options.pythonOptions ) {
            options.pythonOptions = [ '-m' ]
        } else {
            if ( !options.pythonOptions.includes('-m') ) {
                options.pythonOptions.push('-m')
            }
        }
    }
    options.args = [ ROOT_PATH_ABS, ...options.args ];
    if ( DEBUG )
        options.args.push('debug');
    if ( DRYRUN )
        options.args.push('dry-run');
    if ( !callback ) {
        callback = (err, output) => {
            if ( err ) {
                console.error(err);
            }
            if ( output )
                console.log(`%c${scriptPath}\n`, 'font-weight: bold', output.join('\n'))
        }
    }
    return PythonShell.run(scriptPath, options, callback)
};


PythonShell.myrun("-m checks.dirs");
// **  Electron Store
// const Store = new (require("electron-store"))();
const MyStore = require("./MyStore");

const Store = new MyStore.MyStore(true);
console.log(`Store.path: `, Store.path);
PythonShell.myrun("-m checks.config", { args : [ Store.path ] });


Object.defineProperty(Object.prototype, "keys", {
    enumerable : false,
    value(): Array<string | number> {
        // @ts-ignore
        return Object.keys(this).map(key => key.isdigit()
            ? parseInt(key) : key);
    }
});
// ** Array
Object.defineProperty(Array.prototype, "last", {
    enumerable : false,
    value() {
        return this[this.length - 1];
    }
},);
Object.defineProperty(Array.prototype, "lowerAll", {
    enumerable : false,
    value(): string {
        return this.map(s => s.lower());
    }
},);
Object.defineProperty(Array.prototype, "rsort", {
    enumerable : false,
    value() {
        return this.sort((n, m) => n < m);
    }
},);
Object.defineProperty(Array.prototype, "count", {
    enumerable : false,
    value(item: any, strict = false): number {
        let _count = 0;
        for ( let x of this ) {
            if ( strict ) {
                if ( x === item )
                    _count++;
                
            } else if ( x == item ) {
                _count++;
            }
        }
        return _count;
        
    }
    
},);
// ** String
Object.defineProperty(String.prototype, "upTo", {
    enumerable : false,
    value(searchString: string, searchFromEnd = false): string {
        let end = searchFromEnd
            ? this.lastIndexOf(searchString)
            : this.indexOf(searchString);
        if ( end === -1 )
            console.warn(`${this.valueOf()}.upTo(${searchString},${searchFromEnd}) index is -1`);
        return this.slice(0, end);
    }
},);
Object.defineProperty(String.prototype, "in", {
    enumerable : false,
    value(arr: any[]): boolean {
        return arr.includes(this.valueOf());
    }
},);
Object.defineProperty(String.prototype, "lower", {
    enumerable : false,
    value(): string {
        return this.toLowerCase();
    }
},);
Object.defineProperty(String.prototype, "upper", {
    enumerable : false,
    value(): string {
        return this.toUpperCase();
    }
},);
Object.defineProperty(String.prototype, "title", {
    enumerable : false,
    value(): string {
        
        if ( this.includes(' ') )
            return this.split(' ').map(str => str.title()).join(' ');
        else
            return this[0].upper() + this.slice(1, this.length).lower();
        
    }
},);
Object.defineProperty(String.prototype, "isdigit", {
    enumerable : false,
    value(): boolean {
        return !isNaN(Math.floor(this));
    }
},);
Object.defineProperty(String.prototype, "removeAll", {
    enumerable : false,
    
    value(removeValue, ...removeValues) {
        let temp = this;
        for ( let value of [ removeValue, ...removeValues ] )
            temp = temp.replaceAll(value, '');
        return temp;
    }
});
Object.defineProperty(String.prototype, "replaceAll", {
    enumerable : false,
    
    value(searchValue: (string | number) | TMap<string>, replaceValue?: string) {
        const type = typeof searchValue;
        if ( type === 'string' || type === 'number' ) {
            return this
                .split(searchValue)
                .join(replaceValue);
        } else if ( type === 'object' ) {
            let temp = this;
            for ( let [ sv, rv ] of Object.entries(searchValue) )
                temp = temp.replaceAll(sv, rv);
            
            return temp;
        } else {
            console.warn(`replaceAll got a bad type, searchValue: ${searchValue}, type: ${type}`);
            return this;
        }
    }
});
// **  Number
Object.defineProperty(Number.prototype, "human", {
    enumerable : false,
    value(letters = false) {
        switch ( Math.floor(this) + 1 ) {
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
            
            default:
                return `${Math.floor(this) + 1}th`;
        }
        
    }
});
// **  Date
Object.defineProperty(Date.prototype, "human", {
    enumerable : false, value() {
        let d = this.getUTCDate();
        d = d < 10 ? `0${d}` : d;
        let m = this.getMonth() + 1;
        m = m < 10 ? `0${m}` : m;
        const y = this.getFullYear();
        const t = this.toTimeString().slice(0, 8).replaceAll(':', '-');
        return `${d}_${m}_${y}_${t}`;
    }
});
let skipFade = false;

module.exports = {
    skipFade,
    // Store,
    PythonShell
};
console.groupEnd();
