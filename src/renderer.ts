// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.


console.group('renderer.ts');

// @ts-ignore
const path = require('path');
const fs = require('fs');

// **  PythonShell
const { PythonShell } = require("python-shell");
const enginePath = path.join(__dirname, "src", "engine");
const pyExecPath = path.join(enginePath, process.platform === "linux" ? "env/bin/python" : "env/Scripts/python.exe");
const { spawnSync } = require('child_process');
const { output } = spawnSync(PythonShell.getPythonPath(), [ '-c print("hi")' ]);
if ( output === null ) {
    // TODO: test
    console.error(`Spawning a PythonShell.getPythonPath() failed`);
    process.exit(0);
}
PythonShell.defaultOptions = {
    pythonPath : pyExecPath,
    scriptPath : enginePath,
    pythonOptions : [ '-OO' ]
};


PythonShell.prototype.runAsync = function () {
    return new Promise((resolve, reject) => {
        this.on('message', function (message) {
            console.log(message);
        });
        
        
        this.end((err, code, signal) => {
            if ( err ) reject(err);
            resolve()
        });
    });
};


PythonShell.run("check_create_experiments_folder_structure.py", {
    mode : "text",
    args : [ __dirname, ],
    // pythonOptions : [ '-u' ]
}, (err, output) => {
    if ( err )
        throw err;
    if ( output )
        console.log('%ccheck_create_experiments_folder_structure.py\n', 'font-weight: bold', output.join('\n'))
});

// **  Electron Store
const Store = new (require("electron-store"))();
const { remote } = require('electron');
const configJsonExists = fs.existsSync(path.join(remote.app.getPath("userData"), 'config.json'));
console.log({ configJsonExists });

try {
    console.log('trying to get last page from store');
    let last_page = Store.get('last_page');
    if ( last_page == 'inside_test' ) {
        console.log('"last_page" is "inside_test", changing to "new_test"');
        Store.set('last_page', 'new_test');
    }
} catch ( e ) {
    console.log(`FAILED getting last page from store`, e);
}
// console.dir(store);
module.exports = Store;
console.groupEnd();
