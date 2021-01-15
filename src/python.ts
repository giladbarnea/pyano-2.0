debug('python.ts')
type Kind = 'on' | 'off'

interface IMsg {
    kind: Kind
    note: number
    time: number
    time_delta?: number | null
    last_onmsg_time?: number | null
    velocity?: number | null
}

type IPairs = Array<[IMsg, IMsg]>

// console.group('Python.index.ts');
import { Options, PythonShell, PythonShellError } from 'python-shell';
import { FileNotFoundError } from "error";

debug('python.ts | checking paths')
const enginePath = path.join(SRC_PATH_ABS, "engine");
if (!fs.existsSync(enginePath)) {
    util.onError(new FileNotFoundError(`python/index.ts | engine path does not exist (${enginePath})`))
}
const pyExecPath = path.join(enginePath, process.platform === "win32" ? "env/Scripts/python.exe" : "env/bin/python");
if (!fs.existsSync(pyExecPath)) {
    util.onError(new FileNotFoundError(`python/index.ts | python executable file does not exist (${pyExecPath})`))
}


PythonShell.defaultOptions = {
    pythonPath: pyExecPath,
    // scriptPath : enginePath,
    pythonOptions: ['-OO'],
};
import swalert from 'swalert';
class Python extends PythonShell {
    static readonly colorRegex = /.?\[\d{1,3}m/;
    private readonly json: boolean;

    constructor(scriptPath: string, options?: Options) {
        console.title(`MyPyShell.constructor(scriptPath: ${scriptPath})`);
        [scriptPath, options] = Python.handleArguments(scriptPath, options);
        let json = false;
        if (options.mode && options.mode === "json") {
            delete options.mode;
            json = true;
        }
        super(scriptPath, options);
        this.json = json;

    }

    static handleArguments(scriptPath: string, options?: Options): [string, Options] {
        if (!util.bool(options)) {
            options = { args: [], pythonOptions: ['-OO'] };
        } else {
            if (options.args === undefined) {
                options.args = [];
            }
            if (options.pythonOptions === undefined) {
                options.pythonOptions = ['-OO'];
            }

        }
        if (scriptPath.startsWith('-m')) {
            scriptPath = scriptPath.slice(3);
            if (!options.pythonOptions) {
                options.pythonOptions = ['-m']
            } else {
                if (!options.pythonOptions.includes('-m')) {
                    options.pythonOptions.push('-m')
                }
            }
        }

        options.args = [ROOT_PATH_ABS, ...options.args];
        if (DEBUG) {
            options.args.push('debug');
        }
        if (DRYRUN) {
            options.args.push('dry-run');
        }
        return [scriptPath, options]
    }

    static run(scriptPath: string, options?: Options, callback?: (err?: PythonShellError, output?: any[]) => any) {
        title(`MyPyShell.run(scriptPath: ${scriptPath})`);
        try {
            [scriptPath, options] = Python.handleArguments(scriptPath, options);
            if (!callback) {
                callback = (err: PythonShellError, output: any[]) => {
                    if (err) {
                        util.onError(err, { screenshots: true, swal: true })
                    }
                    if (output) {
                        output = output.map(m => m.removeAll(Python.colorRegex));
                        console.debug(`${scriptPath} → ${output.join('\n')}`)

                    }
                }
            }
            return PythonShell.run(scriptPath, options, callback)
        } catch (e) {
            e.when = `MyPyShell.run(scriptPath: ${scriptPath})`
            util.onError(e)
        }
    }


    async runAsync<T>(): Promise<TMap<T>>

    async runAsync(): Promise<TMap<any>> {

        return new Promise((resolve, reject) => {
            try {
                console.title(`MyPyShell.runAsync()`);
                const messages = [];
                let push = DEBUG;
                let warn = false;
                let error = false;
                let log = false;
                const errors = [];
                this.on('message', message => {
                    if (message.startsWith('TONODE')) {
                        if (message.includes('WARN')) {
                            warn = message.endsWith('START')

                        } else if (message.includes('ERROR')) {
                            error = message.endsWith('START');

                        } else if (message.includes('LOG')) {
                            log = message.endsWith('START')
                        } else if (message.includes('SEND')) {
                            if (message.endsWith('START')) {
                                push = true;
                            } else {
                                push = DEBUG;
                            }
                        }
                        return
                    }
                    // console.debug({ push, warn, error, message, messages, "this.json" : this.json, });
                    if (push || warn || error || log) {
                        if (this.json) {

                            message = JSON.parse(message);
                        }
                        if (typeof message === "string") {
                            message = message.removeAll(Python.colorRegex);
                        }
                        if (push) {
                            messages.push(message);
                            // return resolve(message)
                        }
                        if (warn) {
                            console.warn(`TONODE_WARN:`, message)
                        }
                        if (error) {
                            console.error(`TONODE_ERROR:`, message);
                            errors.push(message);
                        }
                        if (log) {
                            console.log(`TONODE_LOG:`, message);
                        }
                    }
                });


                this.end((err, code, signal) => {
                    if (err) {
                        reject(err);
                    }
                    if (util.bool(errors)) {
                        for (let e of errors) {

                            let html;
                            const typeofe = typeof e;
                            if (typeofe === "string") { /// tonode.error(mytb.exc_str(e, locals=False))
                                html = e.replaceAll('\n', '</br>')
                            } else if (Array.isArray(e)) { /// tonode.error(e.args)
                                html = e.join('</br>')
                            } else if (typeofe === "object") { /// tonode.error(mytb.exc_dict(e, locals=False))
                                const { eargs, etype, filename, line, lineno } = e;
                                html = `
                     <style>
                     p > span {
                     font-family: monospace;
                     margin-left: 40px;
                     }
                     </style>
                     <div style="text-align: left">
                        <p><b>Exception args</b>: <span>${eargs.join('</br>')}</span></p>
                        <p><b>File</b>: <span>${filename}:${lineno}</span></p>
                        <p><b>Line</b>: <span>${line}</span></p>
                        <p><b>Type</b>: <span>${etype}</span></p>
                     </div>
                     
                     `
                            } else {
                                html = e
                            }
                            swalert.big.error({ title: 'A python script threw an error', html });
                            /*MyAlert.big.oneButton('A python script threw an error. Please take a screenshot with PrtSc button and save it.', {
                             html
                             })*/
                        }
                    }

                    resolve(messages[0])
                });
            } catch (e) {
                e.when = `MyPyShell.runAsync()`
                util.onError(e);

                reject((<Error>e).toObj().what)
            }
        });
    }
}

/*let isChecksModuleDone = NOPYTHON; // if NOPYTHON == true, then we're done.

function isDone(): boolean {
    // return isChecksDirsDone && isChecksCfgDone
    return isChecksModuleDone
}

if (!NOPYTHON) {


    const Store = new (require("electron-store"))();


    console.debug(`Store.path: `, Store.path);
    const PyChecksModule = new Python('-m checks', {
        args: [Store.path]
    });
    PyChecksModule.runAsync().then(msgs => {
        isChecksModuleDone = true;
        console.log('PyChecksModule msgs:', msgs);
    });
}*/
/*const PyChecksDirs = new Python('checks.dirs', {
 pythonOptions : [ '-m', ],
 args : [ ROOT_PATH_ABS, 'debug', 'dry-run' ]
 });
 PyChecksDirs.runAsync().then(msgs => {
 isChecksDirsDone = true;
 console.log('PyChecksDirs msgs:', msgs.join('\n'));
 });

 // Python.run("-m checks.dirs");

 // **  Electron Store
 const Store = new (require("electron-store"))();


 console.log(`Store.path: `, Store.path);
 const PyChecksCfg = new Python('checks.config', {
 pythonOptions : [ '-m' ],
 args : [ ROOT_PATH_ABS, Store.path, 'debug', 'dry-run' ]
 });
 PyChecksCfg.runAsync().then(msgs => {
 isChecksCfgDone = true;
 console.log('PyChecksCfg msgs:', msgs.join('\n'));
 });
 // Python.run("-m checks.config", { args : [ Store.path ] });*/

// export { isDone, Python, IPairs, IMsg, Kind };
export { Python, IPairs, IMsg, Kind };
// console.groupEnd();
