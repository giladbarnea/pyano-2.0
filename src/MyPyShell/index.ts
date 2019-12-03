import { bool } from "../util";

console.group('MyPyShell.index.ts');
import { Options, PythonShell, PythonShellError } from 'python-shell';

const enginePath = path.join(SRC_PATH_ABS, "engine");
const pyExecPath = path.join(enginePath, process.platform === "linux" ? "env/bin/python" : "env/Scripts/python.exe");
import MyAlert from '../MyAlert'

PythonShell.defaultOptions = {
    pythonPath : pyExecPath,
    // scriptPath : enginePath,
    pythonOptions : [ '-OO' ],
};

class MyPyShell extends PythonShell {
    static readonly colorRegex = /.?\[\d{1,3}m/;
    private readonly json: boolean;
    
    constructor(scriptPath: string, options?: Options) {
        [ scriptPath, options ] = MyPyShell.handleArguments(scriptPath, options);
        let json = false;
        if ( options.mode && options.mode === "json" ) {
            delete options.mode;
            json = true;
        }
        super(scriptPath, options);
        this.json = json;
        
    }
    
    static handleArguments(scriptPath: string, options?: Options): [ string, Options ] {
        if ( !bool(options) ) {
            options = { args : [], pythonOptions : [ '-OO' ] };
        } else {
            if ( options.args === undefined )
                options.args = [];
            if ( options.pythonOptions === undefined )
                options.pythonOptions = [ '-OO' ];
            
        }
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
        return [ scriptPath, options ]
    }
    
    
    async runAsync(): Promise<TMap<any>> {
        
        return new Promise((resolve, reject) => {
            const messages = [];
            let push = DEBUG;
            let warn = false;
            let error = false;
            const errors = [];
            this.on('message', message => {
                if ( message.startsWith('TONODE') ) {
                    if ( message.includes('WARN') ) {
                        warn = message.endsWith('START')
                        
                    } else if ( message.includes('ERROR') ) {
                        error = message.endsWith('START');
                        
                    } else if ( message.includes('SEND') ) {
                        if ( message.endsWith('START') ) {
                            push = true;
                        } else {
                            push = DEBUG;
                        }
                    }
                    return
                }
                // console.log({ push, warn, error, message, messages, "this.json" : this.json, });
                if ( push || warn || error ) {
                    if ( this.json ) {
                        
                        message = JSON.parse(message);
                    }
                    if ( typeof message === "string" ) {
                        message = message.removeAll(MyPyShell.colorRegex);
                    }
                    if ( push ) {
                        messages.push(message);
                        // return resolve(message)
                    }
                    if ( warn ) {
                        console.warn(`TONODE_WARN:`, message)
                    }
                    if ( error ) {
                        console.error(`TONODE_ERROR:`, message);
                        errors.push(message);
                    }
                }
            });
            
            
            this.end((err, code, signal) => {
                if ( err ) reject(err);
                if ( bool(errors) ) {
                    for ( let e of errors ) {
                        
                        let html;
                        const typeofe = typeof e;
                        if ( typeofe === "string" ) { /// tonode.error(mytb.exc_str(e, locals=False))
                            html = e.replaceAll('\n', '</br>')
                        } else if ( Array.isArray(e) ) { /// tonode.error(e.args)
                            html = e.join('</br>')
                        } else if ( typeofe === "object" ) { /// tonode.error(mytb.exc_dict(e, locals=False))
                            const { eargs, filename, line, lineno } = e;
                            html = `
                 <style>
                 span {
                 font-family: monospace;
                 margin-left: 40px;
                 }
                 </style>
                 <div style="text-align: left">
                 <p><b>Exception args</b>: <span>${eargs.join('</br>')}</span></p>
                 <p><b>File</b>: <span>${filename}:${lineno}</span></p>
                 <p><b>Line</b>: <span>${line}</span></p>
                 </div>
                 
                 `
                        } else {
                            html = e
                        }
                        
                        MyAlert.big.oneButton('A python script threw an error. Please take a screenshot with PrtSc button and save it.', {
                            html
                        })
                    }
                }
                
                resolve(messages[0])
            });
        });
    }
    
    static run(scriptPath: string, options?: Options, callback?: (err?: PythonShellError, output?: any[]) => any) {
        [ scriptPath, options ] = MyPyShell.handleArguments(scriptPath, options);
        if ( !callback ) {
            callback = (err: PythonShellError, output: any[]) => {
                if ( err ) {
                    console.error(err);
                }
                if ( output ) {
                    output = output.map(m => m.removeAll(MyPyShell.colorRegex));
                    console.log(`%c${scriptPath}\n`, 'font-weight: bold', output.join('\n'));
                    
                }
            }
        }
        return PythonShell.run(scriptPath, options, callback)
    }
}

let isChecksModuleDone = NOPYTHON; // if NOPYTHON == true, then we're done.

function isDone(): boolean {
    // return isChecksDirsDone && isChecksCfgDone
    return isChecksModuleDone
}

if ( !NOPYTHON ) {
    
    
    const Store = new (require("electron-store"))();
    
    
    console.log(`Store.path: `, Store.path);
    const PyChecksModule = new MyPyShell('-m checks', {
        args : [ Store.path ]
    });
    PyChecksModule.runAsync().then(msgs => {
        isChecksModuleDone = true;
        console.log('PyChecksModule msgs:', msgs.join('\n'));
    });
}
/*const PyChecksDirs = new MyPyShell('checks.dirs', {
 pythonOptions : [ '-m', ],
 args : [ ROOT_PATH_ABS, 'debug', 'dry-run' ]
 });
 PyChecksDirs.runAsync().then(msgs => {
 isChecksDirsDone = true;
 console.log('PyChecksDirs msgs:', msgs.join('\n'));
 });
 
 // MyPyShell.run("-m checks.dirs");
 
 // **  Electron Store
 const Store = new (require("electron-store"))();
 
 
 console.log(`Store.path: `, Store.path);
 const PyChecksCfg = new MyPyShell('checks.config', {
 pythonOptions : [ '-m' ],
 args : [ ROOT_PATH_ABS, Store.path, 'debug', 'dry-run' ]
 });
 PyChecksCfg.runAsync().then(msgs => {
 isChecksCfgDone = true;
 console.log('PyChecksCfg msgs:', msgs.join('\n'));
 });
 // MyPyShell.run("-m checks.config", { args : [ Store.path ] });*/

export { isDone, MyPyShell };
console.groupEnd();
