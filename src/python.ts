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
import { PythonShell, PythonShellError } from 'python-shell';
import type { Options } from "python-shell"
import { FileNotFoundError } from "error";

debug('python.ts | checking paths')
const enginePath = path.join(SRC_PATH_ABS, "engine");
if (!fs.existsSync(enginePath)) {
    throw new FileNotFoundError(`python/index.ts | engine path does not exist (${enginePath})`)
}
const pyExecPath = path.join(enginePath, process.platform === "win32" ? "env/Scripts/python.exe" : "env/bin/python");
if (!fs.existsSync(pyExecPath)) {
    throw new FileNotFoundError(`python/index.ts | python executable file does not exist (${pyExecPath})`)
}

PythonShell.defaultOptions = {
    cwd: SRC_PATH_ABS,
    env: {},
    pythonPath: pyExecPath,
    // scriptPath : enginePath,
    pythonOptions: ['-OO'],
};
import swalert from 'swalert';

class Python extends PythonShell {
    static readonly colorRegex = /.?\[\d{1,3}m/;
    private readonly json: boolean;

    constructor(scriptPath: string, options?: Options) {

        console.title(`Python.constructor(scriptPath: '${scriptPath}', options: ${util.inspect.inspect(options, { compact: true })})`);
        [scriptPath, options] = Python.parseArguments(scriptPath, options);
        let json = false;
        if (options?.mode === "json") {
            delete options.mode;
            json = true;
        }

        super(scriptPath, options);
        this.json = json;

    }

    static parseArguments(scriptPath: string, options?: Options): [scriptPath: string, options: Options] {
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
        let _title = `${this}.run(scriptPath: '${scriptPath}', options: ${util.inspect.inspect(options, { compact: true })})`;
        title(_title);
        try {
            [scriptPath, options] = Python.parseArguments(scriptPath, options);
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
            e.when = _title
            util.onError(e)
        }
    }

    toString(): string {
        return `Python(${this.scriptPath})`;
    }

    runAsync<T>(): Promise<TMap<T>>
    runAsync(): Promise<TMap<any>> {

        return new Promise((resolve, reject) => {
            try {
                title(`${this}.runAsync()`);
                const messages = [];
                let push = false;
                let level = undefined;
                // let warn = false;
                // let error = false;
                // let log = false;
                const errors = [];
                this.on('message', (message: string) => {
                    // console.python(`${this} | ${message}`)
                    if (message.startsWith('TONODE')) {
                        /*if (message.startsWith('TONODE_WARN')) {
                            warn = message === 'TONODE_WARN__START';
                        } else if (message.startsWith('TONODE_ERROR')) {
                            error = message === 'TONODE_ERROR__START';

                        } else if (message.startsWith('TONODE_LOG')) {
                            log = message === 'TONODE_LOG__START';
                        } else if (message.startsWith('TONODE_SEND')) {
                            if (message === 'TONODE_SEND__START') {
                                push = true;
                            } else {
                                push = DEBUG;
                            }
                        }*/
                        if (message.startsWith('TONODE_SEND')) {
                            if (message === 'TONODE_SEND__START') {
                                push = true;
                            } else if (message === 'TONODE_SEND__END') {
                                push = false;
                            }
                        }
                        return
                    }
                    // console.debug({ push, warn, error, message, messages, "this.json" : this.json, });
                    // if (push || warn || error || log) {
                    if (push) {
                        if (this.json) {

                            message = JSON.parse(message);
                        }
                        if (typeof message === "string") {
                            message = message.removeAll(Python.colorRegex);
                        }
                        messages.push(message);
                        // if (push) {
                        //     messages.push(message);
                        //     // return resolve(message)
                        // }
                        /*if (warn) {
                            console.warn(`TONODE_WARN:`, message)
                        }
                        if (error) {
                            console.error(`TONODE_ERROR:`, message);
                            errors.push(message);
                        }
                        if (log) {
                            console.log(`TONODE_LOG:`, message);
                        }*/
                    }
                });


                this.end((err, code, signal) => {
                    if (err) {
                        pwarn(`${this}.runAsync.end(err, code, signal) | err: `, err);
                        throw err;
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
                    plog(`${this}.runAsync.end(err, code, signal) | resolving messages[0]: `, messages[0])
                    resolve(messages[0])
                });
            } catch (e) {
                e.when = `${this}.runAsync()`
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
