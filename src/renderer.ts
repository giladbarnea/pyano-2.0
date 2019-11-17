// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.


console.group('renderer.ts');
const { remote } = require('electron');
const argvars = remote.process.argv.slice(2).map(s => s.toLowerCase());
const DEBUG = argvars.includes('debug');
const DRYRUN = argvars.includes('dry-run');
// @ts-ignore
const path = require('path');
const fs = require('fs');

// **  PythonShell
const { PythonShell } = require("python-shell");
const enginePath = path.join(__dirname, "src", "engine");
const pyExecPath = path.join(enginePath, process.platform === "linux" ? "env/bin/python" : "env/Scripts/python.exe");
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
    options.args = [ __dirname, ...options.args ];
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
    console.log({ scriptPath, options, callback })
    return PythonShell.run(scriptPath, options, callback)
};


PythonShell.myrun("-m checks.dirs");
// **  Electron Store
const Store = new (require("electron-store"))();
console.log(`Store.path: ${Store.path}`);
PythonShell.myrun("-m checks.config", { args : [ Store.path ] });


let last_page = Store.get('last_page');
console.log(`last_page: ${last_page}`);


module.exports = Store;
console.groupEnd();
