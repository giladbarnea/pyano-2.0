// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
console.group('renderer.ts');
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
    if (!options)
        options = {};
    if (scriptPath.startsWith('-m')) {
        scriptPath = scriptPath.slice(3);
        if (!options.pythonOptions) {
            options = __assign(__assign({}, options), { pythonOptions: ['-m'] });
        }
        else {
            if (!options.pythonOptions.includes('-m')) {
                options.pythonOptions.push('-m');
            }
        }
    }
    options.args = __spreadArrays([__dirname], options.args);
    return PythonShell.run(scriptPath, options, callback);
};
PythonShell.runDebug = function (scriptPath, options) {
    if (!options) {
        options = { args: ['debug'] };
    }
    else {
        if (!options.args) {
            options.args = ['debug'];
        }
        else {
            if (!options.args.includes('debug'))
                options.args.push('debug');
        }
    }
    PythonShell.myrun(scriptPath, options, function (err, output) {
        if (err) {
            console.error(err);
        }
        if (output)
            console.log("%c" + scriptPath + "\n", 'font-weight: bold', output.join('\n'));
    });
};
PythonShell.runDebug("-m checks.dirs");
// **  Electron Store
var Store = new (require("electron-store"))();
console.log("Store.path: " + Store.path);
PythonShell.runDebug("-m checks.config", { args: [Store.path] });
var last_page = Store.get('last_page');
console.log("last_page: " + last_page);
module.exports = Store;
console.groupEnd();
//# sourceMappingURL=renderer.js.map