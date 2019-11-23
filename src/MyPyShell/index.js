"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.group('MyPyShell.index.ts');
const python_shell_1 = require("python-shell");
const enginePath = path.join(SRC_PATH_ABS, "engine");
const pyExecPath = path.join(enginePath, process.platform === "linux" ? "env/bin/python" : "env/Scripts/python.exe");
python_shell_1.PythonShell.defaultOptions = {
    pythonPath: pyExecPath,
    pythonOptions: ['-OO'],
};
class MyPyShell extends python_shell_1.PythonShell {
    constructor(scriptPath, options) {
        super(scriptPath, options);
        this._colorRegex = /.?\[\d{1,3}m/;
    }
    async runAsync() {
        return new Promise((resolve, reject) => {
            const messages = [];
            this.on('message', message => {
                messages.push(message.removeAll(this._colorRegex));
            });
            this.end((err, code, signal) => {
                if (err)
                    reject(err);
                resolve(messages);
            });
        });
    }
    static run(scriptPath, options, callback) {
        if (!options)
            options = { args: [], pythonOptions: ['-OO'] };
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
        return python_shell_1.PythonShell.run(scriptPath, options, callback);
    }
}
let isChecksDirsDone = false;
let isChecksCfgDone = false;
function isDone() {
    return isChecksDirsDone && isChecksCfgDone;
}
exports.isDone = isDone;
const PyChecksDirs = new MyPyShell('checks.dirs', {
    pythonOptions: ['-m',],
    args: [ROOT_PATH_ABS, 'debug', 'dry-run']
});
PyChecksDirs.runAsync().then(msgs => {
    isChecksDirsDone = true;
    console.log('PyChecksDirs msgs:', msgs);
});
const Store = new (require("electron-store"))();
console.log(`Store.path: `, Store.path);
const PyChecksCfg = new MyPyShell('checks.config', {
    pythonOptions: ['-m',],
    args: [ROOT_PATH_ABS, Store.path, 'debug', 'dry-run']
});
PyChecksCfg.runAsync().then(msgs => {
    isChecksCfgDone = true;
    console.log('PyChecksCfg msgs:', msgs);
});
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUNwQywrQ0FBc0U7QUFFdEUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDckQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBRXJILDBCQUFXLENBQUMsY0FBYyxHQUFHO0lBQ3pCLFVBQVUsRUFBRyxVQUFVO0lBRXZCLGFBQWEsRUFBRyxDQUFFLEtBQUssQ0FBRTtDQUM1QixDQUFDO0FBRUYsTUFBTSxTQUFVLFNBQVEsMEJBQVc7SUFHL0IsWUFBWSxVQUFrQixFQUFFLE9BQWlCO1FBQzdDLEtBQUssQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFIZCxnQkFBVyxHQUFHLGNBQWMsQ0FBQztJQUs5QyxDQUFDO0lBRUQsS0FBSyxDQUFDLFFBQVE7UUFDVixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsRUFBRTtnQkFDekIsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELENBQUMsQ0FBQyxDQUFDO1lBR0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQzNCLElBQUss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SSxFQUFHLENBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBRTtDQUMzRCxDQUFDLENBQUM7QUFDSCxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO0lBQy9CLGVBQWUsR0FBRyxJQUFJLENBQUM7SUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzQyxDQUFDLENBQUMsQ0FBQztBQUlILE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnNvbGUuZ3JvdXAoJ015UHlTaGVsbC5pbmRleC50cycpO1xuaW1wb3J0IHsgT3B0aW9ucywgUHl0aG9uU2hlbGwsIFB5dGhvblNoZWxsRXJyb3IgfSBmcm9tICdweXRob24tc2hlbGwnO1xuXG5jb25zdCBlbmdpbmVQYXRoID0gcGF0aC5qb2luKFNSQ19QQVRIX0FCUywgXCJlbmdpbmVcIik7XG5jb25zdCBweUV4ZWNQYXRoID0gcGF0aC5qb2luKGVuZ2luZVBhdGgsIHByb2Nlc3MucGxhdGZvcm0gPT09IFwibGludXhcIiA/IFwiZW52L2Jpbi9weXRob25cIiA6IFwiZW52L1NjcmlwdHMvcHl0aG9uLmV4ZVwiKTtcblxuUHl0aG9uU2hlbGwuZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgcHl0aG9uUGF0aCA6IHB5RXhlY1BhdGgsXG4gICAgLy8gc2NyaXB0UGF0aCA6IGVuZ2luZVBhdGgsXG4gICAgcHl0aG9uT3B0aW9ucyA6IFsgJy1PTycgXSxcbn07XG5cbmNsYXNzIE15UHlTaGVsbCBleHRlbmRzIFB5dGhvblNoZWxsIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9jb2xvclJlZ2V4ID0gLy4/XFxbXFxkezEsM31tLztcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihzY3JpcHRQYXRoOiBzdHJpbmcsIG9wdGlvbnM/OiBPcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKHNjcmlwdFBhdGgsIG9wdGlvbnMpO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgcnVuQXN5bmMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMub24oJ21lc3NhZ2UnLCBtZXNzYWdlID0+IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKG1lc3NhZ2UucmVtb3ZlQWxsKHRoaXMuX2NvbG9yUmVnZXgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuZW5kKChlcnIsIGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggZXJyICkgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShtZXNzYWdlcylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIHJ1bihzY3JpcHRQYXRoOiBzdHJpbmcsIG9wdGlvbnM/OiBPcHRpb25zLCBjYWxsYmFjaz86IChlcnI/OiBQeXRob25TaGVsbEVycm9yLCBvdXRwdXQ/OiBhbnlbXSkgPT4gYW55KSB7XG4gICAgICAgIGlmICggIW9wdGlvbnMgKSBvcHRpb25zID0geyBhcmdzIDogW10sIHB5dGhvbk9wdGlvbnMgOiBbICctT08nIF0gfTtcbiAgICAgICAgaWYgKCBzY3JpcHRQYXRoLnN0YXJ0c1dpdGgoJy1tJykgKSB7XG4gICAgICAgICAgICBzY3JpcHRQYXRoID0gc2NyaXB0UGF0aC5zbGljZSgzKTtcbiAgICAgICAgICAgIGlmICggIW9wdGlvbnMucHl0aG9uT3B0aW9ucyApIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLnB5dGhvbk9wdGlvbnMgPSBbICctbScgXVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoICFvcHRpb25zLnB5dGhvbk9wdGlvbnMuaW5jbHVkZXMoJy1tJykgKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucHl0aG9uT3B0aW9ucy5wdXNoKCctbScpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMuYXJncyA9IFsgUk9PVF9QQVRIX0FCUywgLi4ub3B0aW9ucy5hcmdzIF07XG4gICAgICAgIGlmICggREVCVUcgKVxuICAgICAgICAgICAgb3B0aW9ucy5hcmdzLnB1c2goJ2RlYnVnJyk7XG4gICAgICAgIGlmICggRFJZUlVOIClcbiAgICAgICAgICAgIG9wdGlvbnMuYXJncy5wdXNoKCdkcnktcnVuJyk7XG4gICAgICAgIGlmICggIWNhbGxiYWNrICkge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSAoZXJyOiBQeXRob25TaGVsbEVycm9yLCBvdXRwdXQ6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCBvdXRwdXQgKVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJWMke3NjcmlwdFBhdGh9XFxuYCwgJ2ZvbnQtd2VpZ2h0OiBib2xkJywgb3V0cHV0LmpvaW4oJ1xcbicpKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQeXRob25TaGVsbC5ydW4oc2NyaXB0UGF0aCwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgfVxufVxuXG5cbmxldCBpc0NoZWNrc0RpcnNEb25lID0gZmFsc2U7XG5sZXQgaXNDaGVja3NDZmdEb25lID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGlzRG9uZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNDaGVja3NEaXJzRG9uZSAmJiBpc0NoZWNrc0NmZ0RvbmVcbn1cblxuY29uc3QgUHlDaGVja3NEaXJzID0gbmV3IE15UHlTaGVsbCgnY2hlY2tzLmRpcnMnLCB7XG4gICAgcHl0aG9uT3B0aW9ucyA6IFsgJy1tJywgXSxcbiAgICBhcmdzIDogWyBST09UX1BBVEhfQUJTLCAnZGVidWcnLCAnZHJ5LXJ1bicgXVxufSk7XG5QeUNoZWNrc0RpcnMucnVuQXN5bmMoKS50aGVuKG1zZ3MgPT4ge1xuICAgIGlzQ2hlY2tzRGlyc0RvbmUgPSB0cnVlO1xuICAgIGNvbnNvbGUubG9nKCdQeUNoZWNrc0RpcnMgbXNnczonLCBtc2dzKTtcbn0pO1xuXG4vLyBNeVB5U2hlbGwucnVuKFwiLW0gY2hlY2tzLmRpcnNcIik7XG5cbi8vICoqICBFbGVjdHJvbiBTdG9yZVxuY29uc3QgU3RvcmUgPSBuZXcgKHJlcXVpcmUoXCJlbGVjdHJvbi1zdG9yZVwiKSkoKTtcblxuXG5jb25zb2xlLmxvZyhgU3RvcmUucGF0aDogYCwgU3RvcmUucGF0aCk7XG5jb25zdCBQeUNoZWNrc0NmZyA9IG5ldyBNeVB5U2hlbGwoJ2NoZWNrcy5jb25maWcnLCB7XG4gICAgcHl0aG9uT3B0aW9ucyA6IFsgJy1tJywgXSxcbiAgICBhcmdzIDogWyBST09UX1BBVEhfQUJTLCBTdG9yZS5wYXRoLCAnZGVidWcnLCAnZHJ5LXJ1bicgXVxufSk7XG5QeUNoZWNrc0NmZy5ydW5Bc3luYygpLnRoZW4obXNncyA9PiB7XG4gICAgaXNDaGVja3NDZmdEb25lID0gdHJ1ZTtcbiAgICBjb25zb2xlLmxvZygnUHlDaGVja3NDZmcgbXNnczonLCBtc2dzKTtcbn0pO1xuLy8gTXlQeVNoZWxsLnJ1bihcIi1tIGNoZWNrcy5jb25maWdcIiwgeyBhcmdzIDogWyBTdG9yZS5wYXRoIF0gfSk7XG5cbmV4cG9ydCB7IGlzRG9uZSB9O1xuY29uc29sZS5ncm91cEVuZCgpO1xuIl19