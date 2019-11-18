// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const { remote } = require('electron');
const argvars = remote.process.argv.slice(2).map(s => s.toLowerCase());
const DEBUG = argvars.includes('debug');
const DRYRUN = argvars.includes('dry-run');
// @ts-ignore
const path = require('path');
const fs = require('fs');
const ROOT_PATH_ABS = path.basename(__dirname) === 'src' ? path.join(__dirname, '..') : __dirname;
// **  PythonShell
const { PythonShell } = require("python-shell");
const enginePath = path.join(ROOT_PATH_ABS, "src", "engine");
const pyExecPath = path.join(enginePath, process.platform === "linux" ? "env/bin/python" : "env/Scripts/python.exe");
console.group(`renderer.ts`);
console.table({ __dirname, ROOT_PATH_ABS, DEBUG, DRYRUN, enginePath, pyExecPath });
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
    pythonOptions: ['-OO'],
};
PythonShell.prototype.runAsync = function () {
    return new Promise((resolve, reject) => {
        const messages = [];
        this.on('message', message => messages.push(message));
        this.end((err, code, signal) => {
            if (err)
                reject(err);
            resolve(messages);
        });
    });
};
PythonShell.myrun = function (scriptPath, options = { args: [], pythonOptions: ['-OO'] }, callback) {
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
    if (DEBUG)
        options.args.push('debug');
    if (DRYRUN)
        options.args.push('dry-run');
    if (!callback) {
        callback = (err, output) => {
            if (err) {
                console.error(err);
            }
            if (output)
                console.log(`%c${scriptPath}\n`, 'font-weight: bold', output.join('\n'));
        };
    }
    return PythonShell.run(scriptPath, options, callback);
};
PythonShell.myrun("-m checks.dirs");
// **  Electron Store
const Store = new (require("electron-store"))();
console.log(`Store.path: `, Store.path);
PythonShell.myrun("-m checks.config", { args: [Store.path] });
let last_page = Store.get('last_page');
console.log(`last_page: ${last_page}`);
module.exports = Store;
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx3REFBd0Q7QUFDeEQsdURBQXVEO0FBQ3ZELHdEQUF3RDtBQUN4RCx1REFBdUQ7QUFDdkQsc0RBQXNEO0FBQ3RELFdBQVc7QUFHWCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUN2RSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3hDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDM0MsYUFBYTtBQUNiLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFFbEcsa0JBQWtCO0FBQ2xCLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDaEQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzdELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJ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QUFDO0FBQ3BDLHFCQUFxQjtBQUNyQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QyxXQUFXLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsSUFBSSxFQUFHLENBQUUsS0FBSyxDQUFDLElBQUksQ0FBRSxFQUFFLENBQUMsQ0FBQztBQUdqRSxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBR3ZDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3ZCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRoaXMgZmlsZSBpcyByZXF1aXJlZCBieSB0aGUgaW5kZXguaHRtbCBmaWxlIGFuZCB3aWxsXG4vLyBiZSBleGVjdXRlZCBpbiB0aGUgcmVuZGVyZXIgcHJvY2VzcyBmb3IgdGhhdCB3aW5kb3cuXG4vLyBObyBOb2RlLmpzIEFQSXMgYXJlIGF2YWlsYWJsZSBpbiB0aGlzIHByb2Nlc3MgYmVjYXVzZVxuLy8gYG5vZGVJbnRlZ3JhdGlvbmAgaXMgdHVybmVkIG9mZi4gVXNlIGBwcmVsb2FkLmpzYCB0b1xuLy8gc2VsZWN0aXZlbHkgZW5hYmxlIGZlYXR1cmVzIG5lZWRlZCBpbiB0aGUgcmVuZGVyaW5nXG4vLyBwcm9jZXNzLlxuXG5cbmNvbnN0IHsgcmVtb3RlIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuY29uc3QgYXJndmFycyA9IHJlbW90ZS5wcm9jZXNzLmFyZ3Yuc2xpY2UoMikubWFwKHMgPT4gcy50b0xvd2VyQ2FzZSgpKTtcbmNvbnN0IERFQlVHID0gYXJndmFycy5pbmNsdWRlcygnZGVidWcnKTtcbmNvbnN0IERSWVJVTiA9IGFyZ3ZhcnMuaW5jbHVkZXMoJ2RyeS1ydW4nKTtcbi8vIEB0cy1pZ25vcmVcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBST09UX1BBVEhfQUJTID0gcGF0aC5iYXNlbmFtZShfX2Rpcm5hbWUpID09PSAnc3JjJyA/IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicpIDogX19kaXJuYW1lO1xuXG4vLyAqKiAgUHl0aG9uU2hlbGxcbmNvbnN0IHsgUHl0aG9uU2hlbGwgfSA9IHJlcXVpcmUoXCJweXRob24tc2hlbGxcIik7XG5jb25zdCBlbmdpbmVQYXRoID0gcGF0aC5qb2luKFJPT1RfUEFUSF9BQlMsIFwic3JjXCIsIFwiZW5naW5lXCIpO1xuY29uc3QgcHlFeGVjUGF0aCA9IHBhdGguam9pbihlbmdpbmVQYXRoLCBwcm9jZXNzLnBsYXRmb3JtID09PSBcImxpbnV4XCIgPyBcImVudi9iaW4vcHl0aG9uXCIgOiBcImVudi9TY3JpcHRzL3B5dGhvbi5leGVcIik7XG5jb25zb2xlLmdyb3VwKGByZW5kZXJlci50c2ApO1xuY29uc29sZS50YWJsZSh7IF9fZGlybmFtZSwgUk9PVF9QQVRIX0FCUywgREVCVUcsIERSWVJVTiwgZW5naW5lUGF0aCwgcHlFeGVjUGF0aCB9KTtcbi8qY29uc3QgeyBzcGF3blN5bmMgfSA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcbiBjb25zdCB7IG91dHB1dCB9ID0gc3Bhd25TeW5jKFB5dGhvblNoZWxsLmdldFB5dGhvblBhdGgoKSwgWyAnLWMgcHJpbnQoXCJoaVwiKScgXSk7XG4gaWYgKCBvdXRwdXQgPT09IG51bGwgKSB7XG4gLy8gVE9ETzogdGVzdFxuIGNvbnNvbGUuZXJyb3IoYFNwYXduaW5nIGEgUHl0aG9uU2hlbGwuZ2V0UHl0aG9uUGF0aCgpIGZhaWxlZGApO1xuIHByb2Nlc3MuZXhpdCgwKTtcbiB9Ki9cblB5dGhvblNoZWxsLmRlZmF1bHRPcHRpb25zID0ge1xuICAgIHB5dGhvblBhdGggOiBweUV4ZWNQYXRoLFxuICAgIC8vIHNjcmlwdFBhdGggOiBlbmdpbmVQYXRoLFxuICAgIHB5dGhvbk9wdGlvbnMgOiBbICctT08nIF0sXG59O1xuXG5cblB5dGhvblNoZWxsLnByb3RvdHlwZS5ydW5Bc3luYyA9IGZ1bmN0aW9uICgpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBbXTtcbiAgICAgICAgdGhpcy5vbignbWVzc2FnZScsIG1lc3NhZ2UgPT4gbWVzc2FnZXMucHVzaChtZXNzYWdlKSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgdGhpcy5lbmQoKGVyciwgY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAoIGVyciApIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgcmVzb2x2ZShtZXNzYWdlcylcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuUHl0aG9uU2hlbGwubXlydW4gPSBmdW5jdGlvbiAoc2NyaXB0UGF0aDogc3RyaW5nLCBvcHRpb25zID0geyBhcmdzIDogW10sIHB5dGhvbk9wdGlvbnMgOiBbICctT08nIF0gfSwgY2FsbGJhY2spIHtcbiAgICBcbiAgICBpZiAoIHNjcmlwdFBhdGguc3RhcnRzV2l0aCgnLW0nKSApIHtcbiAgICAgICAgc2NyaXB0UGF0aCA9IHNjcmlwdFBhdGguc2xpY2UoMyk7XG4gICAgICAgIGlmICggIW9wdGlvbnMucHl0aG9uT3B0aW9ucyApIHtcbiAgICAgICAgICAgIG9wdGlvbnMucHl0aG9uT3B0aW9ucyA9IFsgJy1tJyBdXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoICFvcHRpb25zLnB5dGhvbk9wdGlvbnMuaW5jbHVkZXMoJy1tJykgKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5weXRob25PcHRpb25zLnB1c2goJy1tJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBvcHRpb25zLmFyZ3MgPSBbIFJPT1RfUEFUSF9BQlMsIC4uLm9wdGlvbnMuYXJncyBdO1xuICAgIGlmICggREVCVUcgKVxuICAgICAgICBvcHRpb25zLmFyZ3MucHVzaCgnZGVidWcnKTtcbiAgICBpZiAoIERSWVJVTiApXG4gICAgICAgIG9wdGlvbnMuYXJncy5wdXNoKCdkcnktcnVuJyk7XG4gICAgaWYgKCAhY2FsbGJhY2sgKSB7XG4gICAgICAgIGNhbGxiYWNrID0gKGVyciwgb3V0cHV0KSA9PiB7XG4gICAgICAgICAgICBpZiAoIGVyciApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIG91dHB1dCApXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCVjJHtzY3JpcHRQYXRofVxcbmAsICdmb250LXdlaWdodDogYm9sZCcsIG91dHB1dC5qb2luKCdcXG4nKSlcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gUHl0aG9uU2hlbGwucnVuKHNjcmlwdFBhdGgsIG9wdGlvbnMsIGNhbGxiYWNrKVxufTtcblxuXG5QeXRob25TaGVsbC5teXJ1bihcIi1tIGNoZWNrcy5kaXJzXCIpO1xuLy8gKiogIEVsZWN0cm9uIFN0b3JlXG5jb25zdCBTdG9yZSA9IG5ldyAocmVxdWlyZShcImVsZWN0cm9uLXN0b3JlXCIpKSgpO1xuY29uc29sZS5sb2coYFN0b3JlLnBhdGg6IGAsIFN0b3JlLnBhdGgpO1xuUHl0aG9uU2hlbGwubXlydW4oXCItbSBjaGVja3MuY29uZmlnXCIsIHsgYXJncyA6IFsgU3RvcmUucGF0aCBdIH0pO1xuXG5cbmxldCBsYXN0X3BhZ2UgPSBTdG9yZS5nZXQoJ2xhc3RfcGFnZScpO1xuY29uc29sZS5sb2coYGxhc3RfcGFnZTogJHtsYXN0X3BhZ2V9YCk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBTdG9yZTtcbmNvbnNvbGUuZ3JvdXBFbmQoKTtcbiJdfQ==