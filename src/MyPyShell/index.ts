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

console.group('MyPyShell.index.ts');
import { Options, PythonShell, PythonShellError } from 'python-shell';

const enginePath = path.join(SRC_PATH_ABS, "engine");
const pyExecPath = path.join(enginePath, process.platform === "linux" ? "env/bin/python" : "env/Scripts/python.exe");

PythonShell.defaultOptions = {
    pythonPath: pyExecPath,
    // scriptPath : enginePath,
    pythonOptions: ['-OO'],
};

class MyPyShell extends PythonShell {
    static readonly colorRegex = /.?\[\d{1,3}m/;
    private readonly json: boolean;

    constructor(scriptPath: string, options?: Options) {
        elog.debug(`MyPyShell.constructor(scriptPath: ${scriptPath})`);
        [scriptPath, options] = MyPyShell.handleArguments(scriptPath, options);
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
        console.group(`MyPyShell.run(scriptPath: ${scriptPath})`);
        try {
            [scriptPath, options] = MyPyShell.handleArguments(scriptPath, options);
            if (!callback) {
                callback = (err: PythonShellError, output: any[]) => {
                    if (err) {
                        console.error(err);
                    }
                    if (output) {
                        output = output.map(m => m.removeAll(MyPyShell.colorRegex));
                        elog.debug(`%c${scriptPath}\n`, 'font-weight: bold', output.join('\n'));

                    }
                }
            }
            return PythonShell.run(scriptPath, options, callback)
        } catch (e) {
            const { what, where, cleanstack } = e.toObj();
            console.error('MyPyShell.run() error!', { what, where, cleanstack });
        } finally {
            console.groupEnd();
        }
    }


    async runAsync<T>(): Promise<TMap<T>>

    async runAsync(): Promise<TMap<any>> {

        return new Promise((resolve, reject) => {
            try {
                console.group(`MyPyShell.runAsync()`);
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
                    // elog.debug({ push, warn, error, message, messages, "this.json" : this.json, });
                    if (push || warn || error || log) {
                        if (this.json) {

                            message = JSON.parse(message);
                        }
                        if (typeof message === "string") {
                            message = message.removeAll(MyPyShell.colorRegex);
                        }
                        if (push) {
                            messages.push(message);
                            // return resolve(message)
                        }
                        if (warn) {
                            elog.warn(`TONODE_WARN:`, message)
                        }
                        if (error) {
                            elog.error(`TONODE_ERROR:`, message);
                            errors.push(message);
                        }
                        if (log) {
                            elog.log(`TONODE_LOG:`, message);
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
                const { what, where, cleanstack } = e.toObj();
                console.error(`${MyPyShell}.runAsync() error!`, { what, where, cleanstack });
                reject(what)
            } finally {
                console.groupEnd();

            }
        });
    }
}

let isChecksModuleDone = NOPYTHON; // if NOPYTHON == true, then we're done.

function isDone(): boolean {
    // return isChecksDirsDone && isChecksCfgDone
    return isChecksModuleDone
}

if (!NOPYTHON) {


    const Store = new (require("electron-store"))();


    elog.debug(`Store.path: `, Store.path);
    const PyChecksModule = new MyPyShell('-m checks', {
        args: [Store.path]
    });
    PyChecksModule.runAsync().then(msgs => {
        isChecksModuleDone = true;
        elog.log('PyChecksModule msgs:', msgs);
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

export { isDone, MyPyShell, IPairs, IMsg, Kind };
console.groupEnd();
