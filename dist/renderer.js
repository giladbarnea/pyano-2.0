// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
console.log('%crenderer.ts', 'font-weight: bold');
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
        _this.on('message', function (message) {
            console.log(message);
        });
        _this.end(function (err, code, signal) {
            if (err)
                reject(err);
            console.log("exit code: " + code + ", signal: " + signal);
            resolve();
        });
    });
};
var pyshell = new PythonShell('check_create_experiments_folder_structure.py', {
    mode: "text",
    args: [__dirname, 'debug'],
    pythonOptions: ['-u']
});
function foo() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('foo start');
                    return [4 /*yield*/, pyshell.runAsync()];
                case 1:
                    _a.sent();
                    console.log('foo end');
                    return [2 /*return*/];
            }
        });
    });
}
/*pyshell.on('message', message => console.log(message));
 
 
 pyshell.end(function (err, code, signal) {
 if (err) throw err;
 console.log(`exit code: ${code}, signal: ${signal}`);
 });*/
/*PythonShell.run("check_create_experiments_folder_structure.py", {
 mode: "text",
 args: [__dirname, 'debug'],
 pythonOptions: ['-u']
 }, (err, output) => {
 if (err) throw err;
 console.log(output)
 });*/
foo().then(function () { return console.log('after running py script'); });
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
//# sourceMappingURL=renderer.js.map