import { bool } from "../util";

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
    static readonly colorRegex = /.?\[\d{1,3}m/;
    
    constructor(scriptPath: string, options?: Options) {
        [ scriptPath, options ] = MyPyShell.handleArguments(scriptPath, options);
        super(scriptPath, options);
        
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
        // [ scriptPath, options ] = MyPyShell.adjustIfModule(scriptPath, options);
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
        // options = MyPyShell.addPossibleArgV(options);
        options.args = [ ROOT_PATH_ABS, ...options.args ];
        if ( DEBUG )
            options.args.push('debug');
        if ( DRYRUN )
            options.args.push('dry-run');
        return [ scriptPath, options ]
    }
    
    
    async runAsync(): Promise<string[]> {
        
        return new Promise((resolve, reject) => {
            const messages = [];
            this.on('message', message => {
                messages.push(message.removeAll(MyPyShell.colorRegex));
            });
            
            
            this.end((err, code, signal) => {
                if ( err ) reject(err);
                resolve(messages)
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

let isChecksModuleDone = false;
let isChecksDirsDone = false;
let isChecksCfgDone = false;

function isDone(): boolean {
    // return isChecksDirsDone && isChecksCfgDone
    return isChecksModuleDone
}

const Store = new (require("electron-store"))();


console.log(`Store.path: `, Store.path);
const PyChecksModule = new MyPyShell('-m checks', {
    args : [ Store.path ]
});
PyChecksModule.runAsync().then(msgs => {
    isChecksModuleDone = true;
    console.log('PyChecksModule msgs:', msgs.join('\n'));
});

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

export { isDone };
console.groupEnd();
