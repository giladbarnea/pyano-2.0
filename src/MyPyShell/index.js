"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
console.group('MyPyShell.index.ts');
const python_shell_1 = require("python-shell");
const enginePath = path.join(SRC_PATH_ABS, "engine");
const pyExecPath = path.join(enginePath, process.platform === "linux" ? "env/bin/python" : "env/Scripts/python.exe");
const MyAlert_1 = require("../MyAlert");
python_shell_1.PythonShell.defaultOptions = {
    pythonPath: pyExecPath,
    pythonOptions: ['-OO'],
};
class MyPyShell extends python_shell_1.PythonShell {
    constructor(scriptPath, options) {
        console.log(`MyPyShell.constructor(scriptPath: ${scriptPath})`);
        [scriptPath, options] = MyPyShell.handleArguments(scriptPath, options);
        let json = false;
        if (options.mode && options.mode === "json") {
            delete options.mode;
            json = true;
        }
        super(scriptPath, options);
        this.json = json;
    }
    static handleArguments(scriptPath, options) {
        if (!util_1.bool(options)) {
            options = { args: [], pythonOptions: ['-OO'] };
        }
        else {
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
                options.pythonOptions = ['-m'];
            }
            else {
                if (!options.pythonOptions.includes('-m')) {
                    options.pythonOptions.push('-m');
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
        return [scriptPath, options];
    }
    static run(scriptPath, options, callback) {
        console.group(`MyPyShell.run(scriptPath: ${scriptPath})`);
        try {
            [scriptPath, options] = MyPyShell.handleArguments(scriptPath, options);
            if (!callback) {
                callback = (err, output) => {
                    if (err) {
                        console.error(err);
                    }
                    if (output) {
                        output = output.map(m => m.removeAll(MyPyShell.colorRegex));
                        console.log(`%c${scriptPath}\n`, 'font-weight: bold', output.join('\n'));
                    }
                };
            }
            return python_shell_1.PythonShell.run(scriptPath, options, callback);
        }
        catch (e) {
            const { what, where, cleanstack } = e.toObj();
            console.error('MyPyShell.run() error!', { what, where, cleanstack });
        }
        finally {
            console.groupEnd();
        }
    }
    async runAsync() {
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
                            warn = message.endsWith('START');
                        }
                        else if (message.includes('ERROR')) {
                            error = message.endsWith('START');
                        }
                        else if (message.includes('LOG')) {
                            log = message.endsWith('START');
                        }
                        else if (message.includes('SEND')) {
                            if (message.endsWith('START')) {
                                push = true;
                            }
                            else {
                                push = DEBUG;
                            }
                        }
                        return;
                    }
                    if (push || warn || error || log) {
                        if (this.json) {
                            message = JSON.parse(message);
                        }
                        if (typeof message === "string") {
                            message = message.removeAll(MyPyShell.colorRegex);
                        }
                        if (push) {
                            messages.push(message);
                        }
                        if (warn) {
                            console.warn(`TONODE_WARN:`, message);
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
                    if (util_1.bool(errors)) {
                        for (let e of errors) {
                            let html;
                            const typeofe = typeof e;
                            if (typeofe === "string") {
                                html = e.replaceAll('\n', '</br>');
                            }
                            else if (Array.isArray(e)) {
                                html = e.join('</br>');
                            }
                            else if (typeofe === "object") {
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
                     
                     `;
                            }
                            else {
                                html = e;
                            }
                            MyAlert_1.default.big.error({ title: 'A python script threw an error', html });
                        }
                    }
                    resolve(messages[0]);
                });
            }
            catch (e) {
                const { what, where, cleanstack } = e.toObj();
                console.error(`${MyPyShell}.runAsync() error!`, { what, where, cleanstack });
                reject(what);
            }
            finally {
                console.groupEnd();
            }
        });
    }
}
exports.MyPyShell = MyPyShell;
MyPyShell.colorRegex = /.?\[\d{1,3}m/;
let isChecksModuleDone = NOPYTHON;
function isDone() {
    return isChecksModuleDone;
}
exports.isDone = isDone;
if (!NOPYTHON) {
    const Store = new (require("electron-store"))();
    console.log(`Store.path: `, Store.path);
    const PyChecksModule = new MyPyShell('-m checks', {
        args: [Store.path]
    });
    PyChecksModule.runAsync().then(msgs => {
        isChecksModuleDone = true;
        console.log('PyChecksModule msgs:', msgs);
    });
}
console.groupEnd();
//# sourceMappingURL=index.js.map