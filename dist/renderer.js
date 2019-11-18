// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
console.group('renderer.ts');
var remote = require('electron').remote;
var argvars = remote.process.argv.slice(2).map(function (s) { return s.toLowerCase(); });
var DEBUG = argvars.includes('debug');
var DRYRUN = argvars.includes('dry-run');
// @ts-ignore
var path = require('path');
var fs = require('fs');
// **  PythonShell
var PythonShell = require("python-shell").PythonShell;
var enginePath = path.join(__dirname, "src", "engine");
var pyExecPath = path.join(enginePath, process.platform === "linux" ? "env/bin/python" : "env/Scripts/python.exe");
/*const { spawnSync } = require('child_process');
 const { output } = spawnSync(PythonShell.getPythonPath(), [ '-c print("hi")' ]);
 if ( output === null ) {
 // TODO: test
 console.error(`Spawning a PythonShell.getPythonPath() failed`);
 process.exit(0);
 }*/
PythonShell.defaultOptions = {
    pythonPath: pyExecPath,
    // scriptPath : enginePath,
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
PythonShell.myrun = function (scriptPath, options, callback) {
    if (options === void 0) { options = { args: [], pythonOptions: ['-OO'] }; }
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
    options.args = __spreadArrays([__dirname], options.args);
    if (DEBUG)
        options.args.push('debug');
    if (DRYRUN)
        options.args.push('dry-run');
    if (!callback) {
        callback = function (err, output) {
            if (err) {
                console.error(err);
            }
            if (output)
                console.log("%c" + scriptPath + "\n", 'font-weight: bold', output.join('\n'));
        };
    }
    return PythonShell.run(scriptPath, options, callback);
};
PythonShell.myrun("-m checks.dirs");
// **  Electron Store
var Store = new (require("electron-store"))();
console.log("Store.path: " + Store.path);
PythonShell.myrun("-m checks.config", { args: [Store.path] });
var last_page = Store.get('last_page');
console.log("last_page: " + last_page);
module.exports = Store;
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsd0RBQXdEO0FBQ3hELHVEQUF1RDtBQUN2RCx3REFBd0Q7QUFDeEQsdURBQXVEO0FBQ3ZELHNEQUFzRDtBQUN0RCxXQUFXOzs7Ozs7OztBQUdYLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckIsSUFBQSxtQ0FBTSxDQUF5QjtBQUN2QyxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFmLENBQWUsQ0FBQyxDQUFDO0FBQ3ZFLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDeEMsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMzQyxhQUFhO0FBQ2IsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUV6QixrQkFBa0I7QUFDVixJQUFBLGlEQUFXLENBQTZCO0FBQ2hELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN6RCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDckg7Ozs7OztJQU1JO0FBQ0osV0FBVyxDQUFDLGNBQWMsR0FBRztJQUN6QixV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