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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsd0RBQXdEO0FBQ3hELHVEQUF1RDtBQUN2RCx3REFBd0Q7QUFDeEQsdURBQXVEO0FBQ3ZELHNEQUFzRDtBQUN0RCxXQUFXOzs7Ozs7OztBQUdYLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDckIsSUFBQSxtQ0FBTSxDQUF5QjtBQUN2QyxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFmLENBQWUsQ0FBQyxDQUFDO0FBQ3ZFLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDeEMsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMzQyxhQUFhO0FBQ2IsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUV6QixrQkFBa0I7QUFDVixJQUFBLGlEQUFXLENBQTZCO0FBQ2hELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN6RCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDckg7Ozs7OztJQU1JO0FBQ0osV0FBVyxDQUFDLGNBQWMsR0FBRztJQUN6QixV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QUM7QUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBYyxTQUFXLENBQUMsQ0FBQztBQUd2QyxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUN2QixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGZpbGUgaXMgcmVxdWlyZWQgYnkgdGhlIGluZGV4Lmh0bWwgZmlsZSBhbmQgd2lsbFxuLy8gYmUgZXhlY3V0ZWQgaW4gdGhlIHJlbmRlcmVyIHByb2Nlc3MgZm9yIHRoYXQgd2luZG93LlxuLy8gTm8gTm9kZS5qcyBBUElzIGFyZSBhdmFpbGFibGUgaW4gdGhpcyBwcm9jZXNzIGJlY2F1c2Vcbi8vIGBub2RlSW50ZWdyYXRpb25gIGlzIHR1cm5lZCBvZmYuIFVzZSBgcHJlbG9hZC5qc2AgdG9cbi8vIHNlbGVjdGl2ZWx5IGVuYWJsZSBmZWF0dXJlcyBuZWVkZWQgaW4gdGhlIHJlbmRlcmluZ1xuLy8gcHJvY2Vzcy5cblxuXG5jb25zb2xlLmdyb3VwKCdyZW5kZXJlci50cycpO1xuY29uc3QgeyByZW1vdGUgfSA9IHJlcXVpcmUoJ2VsZWN0cm9uJyk7XG5jb25zdCBhcmd2YXJzID0gcmVtb3RlLnByb2Nlc3MuYXJndi5zbGljZSgyKS5tYXAocyA9PiBzLnRvTG93ZXJDYXNlKCkpO1xuY29uc3QgREVCVUcgPSBhcmd2YXJzLmluY2x1ZGVzKCdkZWJ1ZycpO1xuY29uc3QgRFJZUlVOID0gYXJndmFycy5pbmNsdWRlcygnZHJ5LXJ1bicpO1xuLy8gQHRzLWlnbm9yZVxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxuLy8gKiogIFB5dGhvblNoZWxsXG5jb25zdCB7IFB5dGhvblNoZWxsIH0gPSByZXF1aXJlKFwicHl0aG9uLXNoZWxsXCIpO1xuY29uc3QgZW5naW5lUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsIFwic3JjXCIsIFwiZW5naW5lXCIpO1xuY29uc3QgcHlFeGVjUGF0aCA9IHBhdGguam9pbihlbmdpbmVQYXRoLCBwcm9jZXNzLnBsYXRmb3JtID09PSBcImxpbnV4XCIgPyBcImVudi9iaW4vcHl0aG9uXCIgOiBcImVudi9TY3JpcHRzL3B5dGhvbi5leGVcIik7XG4vKmNvbnN0IHsgc3Bhd25TeW5jIH0gPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJyk7XG4gY29uc3QgeyBvdXRwdXQgfSA9IHNwYXduU3luYyhQeXRob25TaGVsbC5nZXRQeXRob25QYXRoKCksIFsgJy1jIHByaW50KFwiaGlcIiknIF0pO1xuIGlmICggb3V0cHV0ID09PSBudWxsICkge1xuIC8vIFRPRE86IHRlc3RcbiBjb25zb2xlLmVycm9yKGBTcGF3bmluZyBhIFB5dGhvblNoZWxsLmdldFB5dGhvblBhdGgoKSBmYWlsZWRgKTtcbiBwcm9jZXNzLmV4aXQoMCk7XG4gfSovXG5QeXRob25TaGVsbC5kZWZhdWx0T3B0aW9ucyA9IHtcbiAgICBweXRob25QYXRoIDogcHlFeGVjUGF0aCxcbiAgICAvLyBzY3JpcHRQYXRoIDogZW5naW5lUGF0aCxcbiAgICBweXRob25PcHRpb25zIDogWyAnLU9PJyBdLFxufTtcblxuXG5QeXRob25TaGVsbC5wcm90b3R5cGUucnVuQXN5bmMgPSBmdW5jdGlvbiAoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gW107XG4gICAgICAgIHRoaXMub24oJ21lc3NhZ2UnLCBtZXNzYWdlID0+IG1lc3NhZ2VzLnB1c2gobWVzc2FnZSkpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZW5kKChlcnIsIGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgICAgICAgaWYgKCBlcnIgKSByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIHJlc29sdmUobWVzc2FnZXMpXG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblB5dGhvblNoZWxsLm15cnVuID0gZnVuY3Rpb24gKHNjcmlwdFBhdGg6IHN0cmluZywgb3B0aW9ucyA9IHsgYXJncyA6IFtdLCBweXRob25PcHRpb25zIDogWyAnLU9PJyBdIH0sIGNhbGxiYWNrKSB7XG4gICAgXG4gICAgaWYgKCBzY3JpcHRQYXRoLnN0YXJ0c1dpdGgoJy1tJykgKSB7XG4gICAgICAgIHNjcmlwdFBhdGggPSBzY3JpcHRQYXRoLnNsaWNlKDMpO1xuICAgICAgICBpZiAoICFvcHRpb25zLnB5dGhvbk9wdGlvbnMgKSB7XG4gICAgICAgICAgICBvcHRpb25zLnB5dGhvbk9wdGlvbnMgPSBbICctbScgXVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCAhb3B0aW9ucy5weXRob25PcHRpb25zLmluY2x1ZGVzKCctbScpICkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMucHl0aG9uT3B0aW9ucy5wdXNoKCctbScpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgb3B0aW9ucy5hcmdzID0gWyBfX2Rpcm5hbWUsIC4uLm9wdGlvbnMuYXJncyBdO1xuICAgIGlmICggREVCVUcgKVxuICAgICAgICBvcHRpb25zLmFyZ3MucHVzaCgnZGVidWcnKTtcbiAgICBpZiAoIERSWVJVTiApXG4gICAgICAgIG9wdGlvbnMuYXJncy5wdXNoKCdkcnktcnVuJyk7XG4gICAgaWYgKCAhY2FsbGJhY2sgKSB7XG4gICAgICAgIGNhbGxiYWNrID0gKGVyciwgb3V0cHV0KSA9PiB7XG4gICAgICAgICAgICBpZiAoIGVyciApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIG91dHB1dCApXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCVjJHtzY3JpcHRQYXRofVxcbmAsICdmb250LXdlaWdodDogYm9sZCcsIG91dHB1dC5qb2luKCdcXG4nKSlcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gUHl0aG9uU2hlbGwucnVuKHNjcmlwdFBhdGgsIG9wdGlvbnMsIGNhbGxiYWNrKVxufTtcblxuXG5QeXRob25TaGVsbC5teXJ1bihcIi1tIGNoZWNrcy5kaXJzXCIpO1xuLy8gKiogIEVsZWN0cm9uIFN0b3JlXG5jb25zdCBTdG9yZSA9IG5ldyAocmVxdWlyZShcImVsZWN0cm9uLXN0b3JlXCIpKSgpO1xuY29uc29sZS5sb2coYFN0b3JlLnBhdGg6ICR7U3RvcmUucGF0aH1gKTtcblB5dGhvblNoZWxsLm15cnVuKFwiLW0gY2hlY2tzLmNvbmZpZ1wiLCB7IGFyZ3MgOiBbIFN0b3JlLnBhdGggXSB9KTtcblxuXG5sZXQgbGFzdF9wYWdlID0gU3RvcmUuZ2V0KCdsYXN0X3BhZ2UnKTtcbmNvbnNvbGUubG9nKGBsYXN0X3BhZ2U6ICR7bGFzdF9wYWdlfWApO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gU3RvcmU7XG5jb25zb2xlLmdyb3VwRW5kKCk7XG4iXX0=