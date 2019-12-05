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
            if (options.args === undefined)
                options.args = [];
            if (options.pythonOptions === undefined)
                options.pythonOptions = ['-OO'];
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
        if (DEBUG)
            options.args.push('debug');
        if (DRYRUN)
            options.args.push('dry-run');
        return [scriptPath, options];
    }
    async runAsync() {
        return new Promise((resolve, reject) => {
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
                if (err)
                    reject(err);
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
                            const { eargs, filename, line, lineno } = e;
                            html = `
                 <style>
                 p > span {
                 font-family: monospace;
                 margin-left: 40px;
                 }
                 </style>
                 <div style="text-align: left">
                    <p>This error was consciously caught within the script before reaching here, so it's probably not horrible</p>
                    <p><b>Exception args</b>: <span>${eargs.join('</br>')}</span></p>
                    <p><b>File</b>: <span>${filename}:${lineno}</span></p>
                    <p><b>Line</b>: <span>${line}</span></p>
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
        });
    }
    static run(scriptPath, options, callback) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtDQUErQjtBQWUvQixPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDcEMsK0NBQXNFO0FBRXRFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUNySCx3Q0FBZ0M7QUFFaEMsMEJBQVcsQ0FBQyxjQUFjLEdBQUc7SUFDekIsVUFBVSxFQUFHLFVBQVU7SUFFdkIsYUFBYSxFQUFHLENBQUUsS0FBSyxDQUFFO0NBQzVCLENBQUM7QUFFRixNQUFNLFNBQVUsU0FBUSwwQkFBVztJQUkvQixZQUFZLFVBQWtCLEVBQUUsT0FBaUI7UUFDN0MsQ0FBRSxVQUFVLEVBQUUsT0FBTyxDQUFFLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekUsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLElBQUssT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRztZQUMzQyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDcEIsSUFBSSxHQUFHLElBQUksQ0FBQztTQUNmO1FBQ0QsS0FBSyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUVyQixDQUFDO0lBRUQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxVQUFrQixFQUFFLE9BQWlCO1FBQ3hELElBQUssQ0FBQyxXQUFJ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QyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFDNUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLFVBQVUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFFNUU7WUFDTCxDQUFDLENBQUE7U0FDSjtRQUNELE9BQU8sMEJBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUN6RCxDQUFDOztBQW1EWSw4QkFBUztBQWpOTixvQkFBVSxHQUFHLGNBQWMsQ0FBQztBQWlLaEQsSUFBSSxrQkFBa0IsR0FBRyxRQUFRLENBQUM7QUFFbEMsU0FBUyxNQUFNO0lBRVgsT0FBTyxrQkFBa0IsQ0FBQTtBQUM3QixDQUFDO0FBMkNRLHdCQUFNO0FBekNmLElBQUssQ0FBQyxRQUFRLEVBQUc7SUFHYixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBR2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxNQUFNLGNBQWMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUU7UUFDOUMsSUFBSSxFQUFHLENBQUUsS0FBSyxDQUFDLElBQUksQ0FBRTtLQUN4QixDQUFDLENBQUM7SUFDSCxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2xDLGtCQUFrQixHQUFHLElBQUksQ0FBQztRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlDLENBQUMsQ0FBQyxDQUFDO0NBQ047QUE0QkQsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYm9vbCB9IGZyb20gXCIuLi91dGlsXCI7XG5cbnR5cGUgS2luZCA9ICdvbicgfCAnb2ZmJ1xuXG5pbnRlcmZhY2UgSU1zZyB7XG4gICAga2luZDogS2luZFxuICAgIG5vdGU6IG51bWJlclxuICAgIHRpbWU6IG51bWJlclxuICAgIHRpbWVfZGVsdGE/OiBudW1iZXIgfCBudWxsXG4gICAgbGFzdF9vbm1zZ190aW1lPzogbnVtYmVyIHwgbnVsbFxuICAgIHZlbG9jaXR5PzogbnVtYmVyIHwgbnVsbFxufVxuXG50eXBlIElQYWlycyA9IEFycmF5PFsgSU1zZywgSU1zZyBdPlxuXG5jb25zb2xlLmdyb3VwKCdNeVB5U2hlbGwuaW5kZXgudHMnKTtcbmltcG9ydCB7IE9wdGlvbnMsIFB5dGhvblNoZWxsLCBQeXRob25TaGVsbEVycm9yIH0gZnJvbSAncHl0aG9uLXNoZWxsJztcblxuY29uc3QgZW5naW5lUGF0aCA9IHBhdGguam9pbihTUkNfUEFUSF9BQlMsIFwiZW5naW5lXCIpO1xuY29uc3QgcHlFeGVjUGF0aCA9IHBhdGguam9pbihlbmdpbmVQYXRoLCBwcm9jZXNzLnBsYXRmb3JtID09PSBcImxpbnV4XCIgPyBcImVudi9iaW4vcHl0aG9uXCIgOiBcImVudi9TY3JpcHRzL3B5dGhvbi5leGVcIik7XG5pbXBvcnQgTXlBbGVydCBmcm9tICcuLi9NeUFsZXJ0J1xuXG5QeXRob25TaGVsbC5kZWZhdWx0T3B0aW9ucyA9IHtcbiAgICBweXRob25QYXRoIDogcHlFeGVjUGF0aCxcbiAgICAvLyBzY3JpcHRQYXRoIDogZW5naW5lUGF0aCxcbiAgICBweXRob25PcHRpb25zIDogWyAnLU9PJyBdLFxufTtcblxuY2xhc3MgTXlQeVNoZWxsIGV4dGVuZHMgUHl0aG9uU2hlbGwge1xuICAgIHN0YXRpYyByZWFkb25seSBjb2xvclJlZ2V4ID0gLy4/XFxbXFxkezEsM31tLztcbiAgICBwcml2YXRlIHJlYWRvbmx5IGpzb246IGJvb2xlYW47XG4gICAgXG4gICAgY29uc3RydWN0b3Ioc2NyaXB0UGF0aDogc3RyaW5nLCBvcHRpb25zPzogT3B0aW9ucykge1xuICAgICAgICBbIHNjcmlwdFBhdGgsIG9wdGlvbnMgXSA9IE15UHlTaGVsbC5oYW5kbGVBcmd1bWVudHMoc2NyaXB0UGF0aCwgb3B0aW9ucyk7XG4gICAgICAgIGxldCBqc29uID0gZmFsc2U7XG4gICAgICAgIGlmICggb3B0aW9ucy5tb2RlICYmIG9wdGlvbnMubW9kZSA9PT0gXCJqc29uXCIgKSB7XG4gICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5tb2RlO1xuICAgICAgICAgICAganNvbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoc2NyaXB0UGF0aCwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuanNvbiA9IGpzb247XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBzdGF0aWMgaGFuZGxlQXJndW1lbnRzKHNjcmlwdFBhdGg6IHN0cmluZywgb3B0aW9ucz86IE9wdGlvbnMpOiBbIHN0cmluZywgT3B0aW9ucyBdIHtcbiAgICAgICAgaWYgKCAhYm9vbChvcHRpb25zKSApIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7IGFyZ3MgOiBbXSwgcHl0aG9uT3B0aW9ucyA6IFsgJy1PTycgXSB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCBvcHRpb25zLmFyZ3MgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5hcmdzID0gW107XG4gICAgICAgICAgICBpZiAoIG9wdGlvbnMucHl0aG9uT3B0aW9ucyA9PT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgICAgICBvcHRpb25zLnB5dGhvbk9wdGlvbnMgPSBbICctT08nIF07XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHNjcmlwdFBhdGguc3RhcnRzV2l0aCgnLW0nKSApIHtcbiAgICAgICAgICAgIHNjcmlwdFBhdGggPSBzY3JpcHRQYXRoLnNsaWNlKDMpO1xuICAgICAgICAgICAgaWYgKCAhb3B0aW9ucy5weXRob25PcHRpb25zICkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMucHl0aG9uT3B0aW9ucyA9IFsgJy1tJyBdXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICggIW9wdGlvbnMucHl0aG9uT3B0aW9ucy5pbmNsdWRlcygnLW0nKSApIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5weXRob25PcHRpb25zLnB1c2goJy1tJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIG9wdGlvbnMuYXJncyA9IFsgUk9PVF9QQVRIX0FCUywgLi4ub3B0aW9ucy5hcmdzIF07XG4gICAgICAgIGlmICggREVCVUcgKVxuICAgICAgICAgICAgb3B0aW9ucy5hcmdzLnB1c2goJ2RlYnVnJyk7XG4gICAgICAgIGlmICggRFJZUlVOIClcbiAgICAgICAgICAgIG9wdGlvbnMuYXJncy5wdXNoKCdkcnktcnVuJyk7XG4gICAgICAgIHJldHVybiBbIHNjcmlwdFBhdGgsIG9wdGlvbnMgXVxuICAgIH1cbiAgICBcbiAgICBhc3luYyBydW5Bc3luYzxUPigpOiBQcm9taXNlPFRNYXA8VD4+XG4gICAgYXN5bmMgcnVuQXN5bmMoKTogUHJvbWlzZTxUTWFwPGFueT4+IHtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlcyA9IFtdO1xuICAgICAgICAgICAgbGV0IHB1c2ggPSBERUJVRztcbiAgICAgICAgICAgIGxldCB3YXJuID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgZXJyb3IgPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBsb2cgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5vbignbWVzc2FnZScsIG1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggbWVzc2FnZS5zdGFydHNXaXRoKCdUT05PREUnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBtZXNzYWdlLmluY2x1ZGVzKCdXQVJOJykgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3YXJuID0gbWVzc2FnZS5lbmRzV2l0aCgnU1RBUlQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIG1lc3NhZ2UuaW5jbHVkZXMoJ0VSUk9SJykgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciA9IG1lc3NhZ2UuZW5kc1dpdGgoJ1NUQVJUJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggbWVzc2FnZS5pbmNsdWRlcygnTE9HJykgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cgPSBtZXNzYWdlLmVuZHNXaXRoKCdTVEFSVCcpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIG1lc3NhZ2UuaW5jbHVkZXMoJ1NFTkQnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbWVzc2FnZS5lbmRzV2l0aCgnU1RBUlQnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaCA9IERFQlVHO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh7IHB1c2gsIHdhcm4sIGVycm9yLCBtZXNzYWdlLCBtZXNzYWdlcywgXCJ0aGlzLmpzb25cIiA6IHRoaXMuanNvbiwgfSk7XG4gICAgICAgICAgICAgICAgaWYgKCBwdXNoIHx8IHdhcm4gfHwgZXJyb3IgfHwgbG9nICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMuanNvbiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IEpTT04ucGFyc2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCB0eXBlb2YgbWVzc2FnZSA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlLnJlbW92ZUFsbChNeVB5U2hlbGwuY29sb3JSZWdleCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBwdXNoICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiByZXNvbHZlKG1lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCB3YXJuICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBUT05PREVfV0FSTjpgLCBtZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggZXJyb3IgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUT05PREVfRVJST1I6YCwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIGxvZyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBUT05PREVfTE9HOmAsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5lbmQoKGVyciwgY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCBlcnIgKSByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICBpZiAoIGJvb2woZXJyb3JzKSApIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICggbGV0IGUgb2YgZXJyb3JzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaHRtbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVvZmUgPSB0eXBlb2YgZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdHlwZW9mZSA9PT0gXCJzdHJpbmdcIiApIHsgLy8vIHRvbm9kZS5lcnJvcihteXRiLmV4Y19zdHIoZSwgbG9jYWxzPUZhbHNlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sID0gZS5yZXBsYWNlQWxsKCdcXG4nLCAnPC9icj4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggQXJyYXkuaXNBcnJheShlKSApIHsgLy8vIHRvbm9kZS5lcnJvcihlLmFyZ3MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGUuam9pbignPC9icj4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mZSA9PT0gXCJvYmplY3RcIiApIHsgLy8vIHRvbm9kZS5lcnJvcihteXRiLmV4Y19kaWN0KGUsIGxvY2Fscz1GYWxzZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBlYXJncywgZmlsZW5hbWUsIGxpbmUsIGxpbmVubyB9ID0gZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sID0gYFxuICAgICAgICAgICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgICAgICAgIHAgPiBzcGFuIHtcbiAgICAgICAgICAgICAgICAgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTtcbiAgICAgICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IDQwcHg7XG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHA+VGhpcyBlcnJvciB3YXMgY29uc2Npb3VzbHkgY2F1Z2h0IHdpdGhpbiB0aGUgc2NyaXB0IGJlZm9yZSByZWFjaGluZyBoZXJlLCBzbyBpdCdzIHByb2JhYmx5IG5vdCBob3JyaWJsZTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+PGI+RXhjZXB0aW9uIGFyZ3M8L2I+OiA8c3Bhbj4ke2VhcmdzLmpvaW4oJzwvYnI+Jyl9PC9zcGFuPjwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+PGI+RmlsZTwvYj46IDxzcGFuPiR7ZmlsZW5hbWV9OiR7bGluZW5vfTwvc3Bhbj48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPjxiPkxpbmU8L2I+OiA8c3Bhbj4ke2xpbmV9PC9zcGFuPjwvcD5cbiAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICBgXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBNeUFsZXJ0LmJpZy5lcnJvcih7IHRpdGxlIDogJ0EgcHl0aG9uIHNjcmlwdCB0aHJldyBhbiBlcnJvcicsIGh0bWwgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKk15QWxlcnQuYmlnLm9uZUJ1dHRvbignQSBweXRob24gc2NyaXB0IHRocmV3IGFuIGVycm9yLiBQbGVhc2UgdGFrZSBhIHNjcmVlbnNob3Qgd2l0aCBQcnRTYyBidXR0b24gYW5kIHNhdmUgaXQuJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxcbiAgICAgICAgICAgICAgICAgICAgICAgICB9KSovXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShtZXNzYWdlc1swXSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIHJ1bihzY3JpcHRQYXRoOiBzdHJpbmcsIG9wdGlvbnM/OiBPcHRpb25zLCBjYWxsYmFjaz86IChlcnI/OiBQeXRob25TaGVsbEVycm9yLCBvdXRwdXQ/OiBhbnlbXSkgPT4gYW55KSB7XG4gICAgICAgIFsgc2NyaXB0UGF0aCwgb3B0aW9ucyBdID0gTXlQeVNoZWxsLmhhbmRsZUFyZ3VtZW50cyhzY3JpcHRQYXRoLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKCAhY2FsbGJhY2sgKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IChlcnI6IFB5dGhvblNoZWxsRXJyb3IsIG91dHB1dDogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIGVyciApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIG91dHB1dCApIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0Lm1hcChtID0+IG0ucmVtb3ZlQWxsKE15UHlTaGVsbC5jb2xvclJlZ2V4KSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAlYyR7c2NyaXB0UGF0aH1cXG5gLCAnZm9udC13ZWlnaHQ6IGJvbGQnLCBvdXRwdXQuam9pbignXFxuJykpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFB5dGhvblNoZWxsLnJ1bihzY3JpcHRQYXRoLCBvcHRpb25zLCBjYWxsYmFjaylcbiAgICB9XG59XG5cbmxldCBpc0NoZWNrc01vZHVsZURvbmUgPSBOT1BZVEhPTjsgLy8gaWYgTk9QWVRIT04gPT0gdHJ1ZSwgdGhlbiB3ZSdyZSBkb25lLlxuXG5mdW5jdGlvbiBpc0RvbmUoKTogYm9vbGVhbiB7XG4gICAgLy8gcmV0dXJuIGlzQ2hlY2tzRGlyc0RvbmUgJiYgaXNDaGVja3NDZmdEb25lXG4gICAgcmV0dXJuIGlzQ2hlY2tzTW9kdWxlRG9uZVxufVxuXG5pZiAoICFOT1BZVEhPTiApIHtcbiAgICBcbiAgICBcbiAgICBjb25zdCBTdG9yZSA9IG5ldyAocmVxdWlyZShcImVsZWN0cm9uLXN0b3JlXCIpKSgpO1xuICAgIFxuICAgIFxuICAgIGNvbnNvbGUubG9nKGBTdG9yZS5wYXRoOiBgLCBTdG9yZS5wYXRoKTtcbiAgICBjb25zdCBQeUNoZWNrc01vZHVsZSA9IG5ldyBNeVB5U2hlbGwoJy1tIGNoZWNrcycsIHtcbiAgICAgICAgYXJncyA6IFsgU3RvcmUucGF0aCBdXG4gICAgfSk7XG4gICAgUHlDaGVja3NNb2R1bGUucnVuQXN5bmMoKS50aGVuKG1zZ3MgPT4ge1xuICAgICAgICBpc0NoZWNrc01vZHVsZURvbmUgPSB0cnVlO1xuICAgICAgICBjb25zb2xlLmxvZygnUHlDaGVja3NNb2R1bGUgbXNnczonLCBtc2dzKTtcbiAgICB9KTtcbn1cbi8qY29uc3QgUHlDaGVja3NEaXJzID0gbmV3IE15UHlTaGVsbCgnY2hlY2tzLmRpcnMnLCB7XG4gcHl0aG9uT3B0aW9ucyA6IFsgJy1tJywgXSxcbiBhcmdzIDogWyBST09UX1BBVEhfQUJTLCAnZGVidWcnLCAnZHJ5LXJ1bicgXVxuIH0pO1xuIFB5Q2hlY2tzRGlycy5ydW5Bc3luYygpLnRoZW4obXNncyA9PiB7XG4gaXNDaGVja3NEaXJzRG9uZSA9IHRydWU7XG4gY29uc29sZS5sb2coJ1B5Q2hlY2tzRGlycyBtc2dzOicsIG1zZ3Muam9pbignXFxuJykpO1xuIH0pO1xuIFxuIC8vIE15UHlTaGVsbC5ydW4oXCItbSBjaGVja3MuZGlyc1wiKTtcbiBcbiAvLyAqKiAgRWxlY3Ryb24gU3RvcmVcbiBjb25zdCBTdG9yZSA9IG5ldyAocmVxdWlyZShcImVsZWN0cm9uLXN0b3JlXCIpKSgpO1xuIFxuIFxuIGNvbnNvbGUubG9nKGBTdG9yZS5wYXRoOiBgLCBTdG9yZS5wYXRoKTtcbiBjb25zdCBQeUNoZWNrc0NmZyA9IG5ldyBNeVB5U2hlbGwoJ2NoZWNrcy5jb25maWcnLCB7XG4gcHl0aG9uT3B0aW9ucyA6IFsgJy1tJyBdLFxuIGFyZ3MgOiBbIFJPT1RfUEFUSF9BQlMsIFN0b3JlLnBhdGgsICdkZWJ1ZycsICdkcnktcnVuJyBdXG4gfSk7XG4gUHlDaGVja3NDZmcucnVuQXN5bmMoKS50aGVuKG1zZ3MgPT4ge1xuIGlzQ2hlY2tzQ2ZnRG9uZSA9IHRydWU7XG4gY29uc29sZS5sb2coJ1B5Q2hlY2tzQ2ZnIG1zZ3M6JywgbXNncy5qb2luKCdcXG4nKSk7XG4gfSk7XG4gLy8gTXlQeVNoZWxsLnJ1bihcIi1tIGNoZWNrcy5jb25maWdcIiwgeyBhcmdzIDogWyBTdG9yZS5wYXRoIF0gfSk7Ki9cblxuZXhwb3J0IHsgaXNEb25lLCBNeVB5U2hlbGwsIElQYWlycywgSU1zZywgS2luZCB9O1xuY29uc29sZS5ncm91cEVuZCgpO1xuIl19