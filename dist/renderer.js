// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
console.group('renderer.ts');
// @ts-ignore
var path = require('path');
var fs = require('fs');
// **  PythonShell
var PythonShell = require("python-shell").PythonShell;
var enginePath = path.join(__dirname, "src", "engine");
var pyExecPath = path.join(enginePath, process.platform === "linux" ? "env/bin/python" : "env/Scripts/python.exe");
var spawnSync = require('child_process').spawnSync;
var output = spawnSync(PythonShell.getPythonPath(), ['-c print("hi")']).output;
if (output === null) {
    // TODO: test
    console.error("Spawning a PythonShell.getPythonPath() failed");
    process.exit(0);
}
PythonShell.defaultOptions = {
    pythonPath: pyExecPath,
    scriptPath: enginePath,
    pythonOptions: ['-OO']
};
PythonShell.prototype.runAsync = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var messages = [];
        _this.on('message', function (message) { return messages.push(message); });
        _this.end(function (err, code, signal) {
            if (err)
                reject(err);
            resolve(messages);
        });
    });
};
PythonShell.runDebug = function (scriptPath, options) {
    if (!options.args.includes('debug'))
        options.args.push('debug');
    PythonShell.run(scriptPath, options, function (err, output) {
        if (err) {
            console.error(err);
            /*if ( err.message.includes('SoftError') )
             console.error(err);
             else
             throw err;*/
        }
        if (output)
            console.log("%c" + scriptPath + "\n", 'font-weight: bold', output.join('\n'));
    });
};
PythonShell.runDebug("check_create_experiments_folder_structure.py", {
    args: [__dirname]
});
// **  Electron Store
var Store = new (require("electron-store"))();
var remote = require('electron').remote;
var configJsonExists = fs.existsSync(path.join(remote.app.getPath("userData"), 'config.json'));
console.log({ configJsonExists: configJsonExists });
try {
    console.log('trying to get last page from store');
    var last_page = Store.get('last_page');
    if (last_page == 'inside_test') {
        console.log('"last_page" is "inside_test", changing to "new_test"');
        Store.set('last_page', 'new_test');
    }
}
catch (e) {
    console.log("FAILED getting last page from store", e);
}
// console.dir(store);
module.exports = Store;
console.groupEnd();
//# sourceMappingURL=renderer.js.map