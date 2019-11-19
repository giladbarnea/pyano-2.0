console.group('MyPyShell.index.ts');
import { Options, PythonShell, PythonShellError } from 'python-shell';

const enginePath = path.join(SRC_PATH_ABS, "engine");
const pyExecPath = path.join(enginePath, process.platform === "linux" ? "env/bin/python" : "env/Scripts/python.exe");

PythonShell.defaultOptions = {
    pythonPath : pyExecPath,
    // scriptPath : enginePath,
    pythonOptions : [ '-OO' ],
};

class MyPyShell extends PythonShell {
    constructor(scriptPath: string, options?: Options) {
        super(scriptPath, options);
        
    }
    
    async runAsync(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const messages = [];
            this.on('message', message => messages.push(message));
            
            
            this.end((err, code, signal) => {
                if ( err ) reject(err);
                resolve(messages)
            });
        });
    }
    
    static run(scriptPath: string, options?: Options, callback?: (err?: PythonShellError, output?: any[]) => any) {
        if ( !options ) options = { args : [], pythonOptions : [ '-OO' ] };
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
    }
}


/*PythonShell.prototype.runAsync = function (): Promise<string[]> {
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
 };*/


MyPyShell.run("-m checks.dirs");

// **  Electron Store
const Store = new (require("electron-store"))();

// const MyStore = require("./MyStore");

// const EStore = new MyStore.MyStore(true);
console.log(`Store.path: `, Store.path);
MyPyShell.run("-m checks.config", { args : [ Store.path ] });


console.log({ 'process.argv' : process.argv });
console.groupEnd();
