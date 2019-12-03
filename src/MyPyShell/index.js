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
            const errors = [];
            this.on('message', message => {
                if (message.startsWith('TONODE')) {
                    if (message.includes('WARN')) {
                        warn = message.endsWith('START');
                    }
                    else if (message.includes('ERROR')) {
                        error = message.endsWith('START');
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
                if (push || warn || error) {
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
                }
            });
            this.end(async (err, code, signal) => {
                if (err)
                    reject(err);
                console.log({ errors });
                for (let e of errors) {
                    let html;
                    const typeofe = typeof e;
                    if (typeofe === "string") {
                        html = e.replaceAll('\n', '</br>');
                    }
                    else if (Array.isArray(e)) {
                        html = e.join('</br>');
                    }
                    else {
                        html = e;
                    }
                    await MyAlert_1.default.big.oneButton('A python script threw an error. Please take a screenshot with PrtSc button and save it.', { html });
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
        console.log('PyChecksModule msgs:', msgs.join('\n'));
    });
}
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtDQUErQjtBQUUvQixPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDcEMsK0NBQXNFO0FBRXRFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUNySCx3Q0FBZ0M7QUFFaEMsMEJBQVcsQ0FBQyxjQUFjLEdBQUc7SUFDekIsVUFBVSxFQUFHLFVBQVU7SUFFdkIsYUFBYSxFQUFHLENBQUUsS0FBSyxDQUFFO0NBQzVCLENBQUM7QUFFRixNQUFNLFNBQVUsU0FBUSwwQkFBVztJQUkvQixZQUFZLFVBQWtCLEVBQUUsT0FBaUI7UUFDN0MsQ0FBRSxVQUFVLEVBQUUsT0FBTyxDQUFFLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekUsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLElBQUssT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRztZQUMzQyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDcEIsSUFBSSxHQUFHLElBQUksQ0FBQztTQUNmO1FBQ0QsS0FBSyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUVyQixDQUFDO0lBRUQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxVQUFrQixFQUFFLE9BQWlCO1FBQ3hELElBQUssQ0FBQyxXQUFJ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LGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBR2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxNQUFNLGNBQWMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUU7UUFDOUMsSUFBSSxFQUFHLENBQUUsS0FBSyxDQUFDLElBQUksQ0FBRTtLQUN4QixDQUFDLENBQUM7SUFDSCxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2xDLGtCQUFrQixHQUFHLElBQUksQ0FBQztRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN6RCxDQUFDLENBQUMsQ0FBQztDQUNOO0FBNEJELE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJvb2wgfSBmcm9tIFwiLi4vdXRpbFwiO1xuXG5jb25zb2xlLmdyb3VwKCdNeVB5U2hlbGwuaW5kZXgudHMnKTtcbmltcG9ydCB7IE9wdGlvbnMsIFB5dGhvblNoZWxsLCBQeXRob25TaGVsbEVycm9yIH0gZnJvbSAncHl0aG9uLXNoZWxsJztcblxuY29uc3QgZW5naW5lUGF0aCA9IHBhdGguam9pbihTUkNfUEFUSF9BQlMsIFwiZW5naW5lXCIpO1xuY29uc3QgcHlFeGVjUGF0aCA9IHBhdGguam9pbihlbmdpbmVQYXRoLCBwcm9jZXNzLnBsYXRmb3JtID09PSBcImxpbnV4XCIgPyBcImVudi9iaW4vcHl0aG9uXCIgOiBcImVudi9TY3JpcHRzL3B5dGhvbi5leGVcIik7XG5pbXBvcnQgTXlBbGVydCBmcm9tICcuLi9NeUFsZXJ0J1xuXG5QeXRob25TaGVsbC5kZWZhdWx0T3B0aW9ucyA9IHtcbiAgICBweXRob25QYXRoIDogcHlFeGVjUGF0aCxcbiAgICAvLyBzY3JpcHRQYXRoIDogZW5naW5lUGF0aCxcbiAgICBweXRob25PcHRpb25zIDogWyAnLU9PJyBdLFxufTtcblxuY2xhc3MgTXlQeVNoZWxsIGV4dGVuZHMgUHl0aG9uU2hlbGwge1xuICAgIHN0YXRpYyByZWFkb25seSBjb2xvclJlZ2V4ID0gLy4/XFxbXFxkezEsM31tLztcbiAgICBwcml2YXRlIHJlYWRvbmx5IGpzb246IGJvb2xlYW47XG4gICAgXG4gICAgY29uc3RydWN0b3Ioc2NyaXB0UGF0aDogc3RyaW5nLCBvcHRpb25zPzogT3B0aW9ucykge1xuICAgICAgICBbIHNjcmlwdFBhdGgsIG9wdGlvbnMgXSA9IE15UHlTaGVsbC5oYW5kbGVBcmd1bWVudHMoc2NyaXB0UGF0aCwgb3B0aW9ucyk7XG4gICAgICAgIGxldCBqc29uID0gZmFsc2U7XG4gICAgICAgIGlmICggb3B0aW9ucy5tb2RlICYmIG9wdGlvbnMubW9kZSA9PT0gXCJqc29uXCIgKSB7XG4gICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5tb2RlO1xuICAgICAgICAgICAganNvbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoc2NyaXB0UGF0aCwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuanNvbiA9IGpzb247XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBzdGF0aWMgaGFuZGxlQXJndW1lbnRzKHNjcmlwdFBhdGg6IHN0cmluZywgb3B0aW9ucz86IE9wdGlvbnMpOiBbIHN0cmluZywgT3B0aW9ucyBdIHtcbiAgICAgICAgaWYgKCAhYm9vbChvcHRpb25zKSApIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7IGFyZ3MgOiBbXSwgcHl0aG9uT3B0aW9ucyA6IFsgJy1PTycgXSB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCBvcHRpb25zLmFyZ3MgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5hcmdzID0gW107XG4gICAgICAgICAgICBpZiAoIG9wdGlvbnMucHl0aG9uT3B0aW9ucyA9PT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgICAgICBvcHRpb25zLnB5dGhvbk9wdGlvbnMgPSBbICctT08nIF07XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHNjcmlwdFBhdGguc3RhcnRzV2l0aCgnLW0nKSApIHtcbiAgICAgICAgICAgIHNjcmlwdFBhdGggPSBzY3JpcHRQYXRoLnNsaWNlKDMpO1xuICAgICAgICAgICAgaWYgKCAhb3B0aW9ucy5weXRob25PcHRpb25zICkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMucHl0aG9uT3B0aW9ucyA9IFsgJy1tJyBdXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICggIW9wdGlvbnMucHl0aG9uT3B0aW9ucy5pbmNsdWRlcygnLW0nKSApIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5weXRob25PcHRpb25zLnB1c2goJy1tJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIG9wdGlvbnMuYXJncyA9IFsgUk9PVF9QQVRIX0FCUywgLi4ub3B0aW9ucy5hcmdzIF07XG4gICAgICAgIGlmICggREVCVUcgKVxuICAgICAgICAgICAgb3B0aW9ucy5hcmdzLnB1c2goJ2RlYnVnJyk7XG4gICAgICAgIGlmICggRFJZUlVOIClcbiAgICAgICAgICAgIG9wdGlvbnMuYXJncy5wdXNoKCdkcnktcnVuJyk7XG4gICAgICAgIHJldHVybiBbIHNjcmlwdFBhdGgsIG9wdGlvbnMgXVxuICAgIH1cbiAgICBcbiAgICBcbiAgICBhc3luYyBydW5Bc3luYygpOiBQcm9taXNlPFRNYXA8YW55Pj4ge1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gW107XG4gICAgICAgICAgICBsZXQgcHVzaCA9IERFQlVHO1xuICAgICAgICAgICAgbGV0IHdhcm4gPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBlcnJvciA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgICAgICAgICB0aGlzLm9uKCdtZXNzYWdlJywgbWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCBtZXNzYWdlLnN0YXJ0c1dpdGgoJ1RPTk9ERScpICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIG1lc3NhZ2UuaW5jbHVkZXMoJ1dBUk4nKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhcm4gPSBtZXNzYWdlLmVuZHNXaXRoKCdTVEFSVCcpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIG1lc3NhZ2UuaW5jbHVkZXMoJ0VSUk9SJykgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciA9IG1lc3NhZ2UuZW5kc1dpdGgoJ1NUQVJUJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIG1lc3NhZ2UuaW5jbHVkZXMoJ1NFTkQnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbWVzc2FnZS5lbmRzV2l0aCgnU1RBUlQnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaCA9IERFQlVHO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIHB1c2ggfHwgd2FybiB8fCBlcnJvciApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB0aGlzLmpzb24gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gSlNPTi5wYXJzZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIHR5cGVvZiBtZXNzYWdlID09PSBcInN0cmluZ1wiICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UucmVtb3ZlQWxsKE15UHlTaGVsbC5jb2xvclJlZ2V4KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIHB1c2ggKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHJlc29sdmUobWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIHdhcm4gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFRPTk9ERV9XQVJOOmAsIG1lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBlcnJvciApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFRPTk9ERV9FUlJPUjpgLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5lbmQoYXN5bmMgKGVyciwgY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCBlcnIgKSByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh7IGVycm9ycyB9KTtcbiAgICAgICAgICAgICAgICBmb3IgKCBsZXQgZSBvZiBlcnJvcnMgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IHtlYXJncyxmaWxlbmFtZSxsaW5lLGxpbmVub30gPSBlO1xuICAgICAgICAgICAgICAgICAgICBsZXQgaHRtbDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHlwZW9mZSA9IHR5cGVvZiBlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHR5cGVvZmUgPT09IFwic3RyaW5nXCIgKSB7IC8vLyB0b25vZGUuZXJyb3IobXl0Yi5leGNfc3RyKGUsIGxvY2Fscz1GYWxzZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sID0gZS5yZXBsYWNlQWxsKCdcXG4nLCAnPC9icj4nKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBBcnJheS5pc0FycmF5KGUpICkgeyAvLy8gdG9ub2RlLmVycm9yKGUuYXJncylcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBlLmpvaW4oJzwvYnI+JylcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IE15QWxlcnQuYmlnLm9uZUJ1dHRvbignQSBweXRob24gc2NyaXB0IHRocmV3IGFuIGVycm9yLiBQbGVhc2UgdGFrZSBhIHNjcmVlbnNob3Qgd2l0aCBQcnRTYyBidXR0b24gYW5kIHNhdmUgaXQuJywgeyBodG1sIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc29sdmUobWVzc2FnZXNbMF0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBydW4oc2NyaXB0UGF0aDogc3RyaW5nLCBvcHRpb25zPzogT3B0aW9ucywgY2FsbGJhY2s/OiAoZXJyPzogUHl0aG9uU2hlbGxFcnJvciwgb3V0cHV0PzogYW55W10pID0+IGFueSkge1xuICAgICAgICBbIHNjcmlwdFBhdGgsIG9wdGlvbnMgXSA9IE15UHlTaGVsbC5oYW5kbGVBcmd1bWVudHMoc2NyaXB0UGF0aCwgb3B0aW9ucyk7XG4gICAgICAgIGlmICggIWNhbGxiYWNrICkge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSAoZXJyOiBQeXRob25TaGVsbEVycm9yLCBvdXRwdXQ6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCBvdXRwdXQgKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dC5tYXAobSA9PiBtLnJlbW92ZUFsbChNeVB5U2hlbGwuY29sb3JSZWdleCkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJWMke3NjcmlwdFBhdGh9XFxuYCwgJ2ZvbnQtd2VpZ2h0OiBib2xkJywgb3V0cHV0LmpvaW4oJ1xcbicpKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQeXRob25TaGVsbC5ydW4oc2NyaXB0UGF0aCwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgfVxufVxuXG5sZXQgaXNDaGVja3NNb2R1bGVEb25lID0gTk9QWVRIT047IC8vIGlmIE5PUFlUSE9OID09IHRydWUsIHRoZW4gd2UncmUgZG9uZS5cblxuZnVuY3Rpb24gaXNEb25lKCk6IGJvb2xlYW4ge1xuICAgIC8vIHJldHVybiBpc0NoZWNrc0RpcnNEb25lICYmIGlzQ2hlY2tzQ2ZnRG9uZVxuICAgIHJldHVybiBpc0NoZWNrc01vZHVsZURvbmVcbn1cblxuaWYgKCAhTk9QWVRIT04gKSB7XG4gICAgXG4gICAgXG4gICAgY29uc3QgU3RvcmUgPSBuZXcgKHJlcXVpcmUoXCJlbGVjdHJvbi1zdG9yZVwiKSkoKTtcbiAgICBcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgU3RvcmUucGF0aDogYCwgU3RvcmUucGF0aCk7XG4gICAgY29uc3QgUHlDaGVja3NNb2R1bGUgPSBuZXcgTXlQeVNoZWxsKCctbSBjaGVja3MnLCB7XG4gICAgICAgIGFyZ3MgOiBbIFN0b3JlLnBhdGggXVxuICAgIH0pO1xuICAgIFB5Q2hlY2tzTW9kdWxlLnJ1bkFzeW5jKCkudGhlbihtc2dzID0+IHtcbiAgICAgICAgaXNDaGVja3NNb2R1bGVEb25lID0gdHJ1ZTtcbiAgICAgICAgY29uc29sZS5sb2coJ1B5Q2hlY2tzTW9kdWxlIG1zZ3M6JywgbXNncy5qb2luKCdcXG4nKSk7XG4gICAgfSk7XG59XG4vKmNvbnN0IFB5Q2hlY2tzRGlycyA9IG5ldyBNeVB5U2hlbGwoJ2NoZWNrcy5kaXJzJywge1xuIHB5dGhvbk9wdGlvbnMgOiBbICctbScsIF0sXG4gYXJncyA6IFsgUk9PVF9QQVRIX0FCUywgJ2RlYnVnJywgJ2RyeS1ydW4nIF1cbiB9KTtcbiBQeUNoZWNrc0RpcnMucnVuQXN5bmMoKS50aGVuKG1zZ3MgPT4ge1xuIGlzQ2hlY2tzRGlyc0RvbmUgPSB0cnVlO1xuIGNvbnNvbGUubG9nKCdQeUNoZWNrc0RpcnMgbXNnczonLCBtc2dzLmpvaW4oJ1xcbicpKTtcbiB9KTtcbiBcbiAvLyBNeVB5U2hlbGwucnVuKFwiLW0gY2hlY2tzLmRpcnNcIik7XG4gXG4gLy8gKiogIEVsZWN0cm9uIFN0b3JlXG4gY29uc3QgU3RvcmUgPSBuZXcgKHJlcXVpcmUoXCJlbGVjdHJvbi1zdG9yZVwiKSkoKTtcbiBcbiBcbiBjb25zb2xlLmxvZyhgU3RvcmUucGF0aDogYCwgU3RvcmUucGF0aCk7XG4gY29uc3QgUHlDaGVja3NDZmcgPSBuZXcgTXlQeVNoZWxsKCdjaGVja3MuY29uZmlnJywge1xuIHB5dGhvbk9wdGlvbnMgOiBbICctbScgXSxcbiBhcmdzIDogWyBST09UX1BBVEhfQUJTLCBTdG9yZS5wYXRoLCAnZGVidWcnLCAnZHJ5LXJ1bicgXVxuIH0pO1xuIFB5Q2hlY2tzQ2ZnLnJ1bkFzeW5jKCkudGhlbihtc2dzID0+IHtcbiBpc0NoZWNrc0NmZ0RvbmUgPSB0cnVlO1xuIGNvbnNvbGUubG9nKCdQeUNoZWNrc0NmZyBtc2dzOicsIG1zZ3Muam9pbignXFxuJykpO1xuIH0pO1xuIC8vIE15UHlTaGVsbC5ydW4oXCItbSBjaGVja3MuY29uZmlnXCIsIHsgYXJncyA6IFsgU3RvcmUucGF0aCBdIH0pOyovXG5cbmV4cG9ydCB7IGlzRG9uZSwgTXlQeVNoZWxsIH07XG5jb25zb2xlLmdyb3VwRW5kKCk7XG4iXX0=