Object.defineProperty(exports, "__esModule", { value: true });
function messagehook(message, selectedTransport) {
    // ** This is called every time any elog function is called
    // * variables used in elog.transports.file.format (by end of this file)
    // message.variables.now = mmnt(mmnt.now()).format('YYYY-MM-DD HH:mm:ss:SSS X');
    const d = message.date;
    message.variables.now = `${d.toLocaleDateString()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()}`;
    if (message.variables.record_start_ts) {
        // 'record_start_ts' variable exists after mediaRecorder.start() in screen_record.ts
        message.variables.rec_time = (util.now(1) - message.variables.record_start_ts) / 10;
    }
    const messageWithLocationIndex = message.data.findIndex(x => x?.location);
    if (messageWithLocationIndex != -1) {
        const messageWithLocation = message.data.splice(messageWithLocationIndex, 1)[0];
        const location = messageWithLocation['location'];
        message.variables.location = location;
    }
    // * This runs only on elog.error(err), and every time there's an uncaught error (because of elog.catchErrors)
    if (message.level === "error" && message.data[0] instanceof Error) {
        // 1. save screenshots
        // 2. extract nice trace and extra info from error,
        // 3. continue through lib code (prints to terminal that launched pyano, and writes log file)
        util.saveScreenshots()
            .then(() => console.debug('Saved screenshots successfully'))
            .catch((reason) => console.debug('Failed saving screenshots', reason));
        const formattedErr = util.formatErr(message.data[0]);
        return { ...message, data: [...formattedErr, ...message.data.slice(1)] };
        /* (async () => {
            try {
                await util.saveScreenshots();
                console.debug('Saved screenshots successfully');
            } catch (e) {
                console.debug('Failed saving screenshots')
            }
            const formattedErr = util.formatErr(message.data[0])

            return { ...message, data: [...formattedErr, ...message.data.slice(1)] };
        })(); */
    }
    return message;
}
function logGitStats() {
    const currentbranch = util.safeExec('git branch --show-current');
    if (currentbranch) {
        console.debug(`Current git branch: "${currentbranch}"`);
    }
    const currentcommit = util.safeExec('git log --oneline -n 1');
    if (currentcommit) {
        console.debug(`Current git commit: "${currentcommit}"`);
    }
    const gitdiff = util.safeExec('git diff --compact-summary');
    if (gitdiff) {
        console.debug(`Current git diff:\n${gitdiff}`);
    }
}
// this prevents elog from printing to console, because webContents.on("console-message", ...) already prints to console
elog.transports.console.level = false;
elog.transports.file.file = path.join(SESSION_PATH_ABS, path.basename(SESSION_PATH_ABS) + '.log');
if (NOSCREENCAPTURE) {
    elog.transports.file.format = "[{now}] [{location}] [{level}]{scope} {text}";
}
else {
    elog.transports.file.format = "[{now}] [{rec_time}s] [{level}]{scope} {text}";
}
// elog.transports.file.format = (message) => {
//     // let now = Math.round(message.date.getTime() / 1000);
//     // debugger;
//
//     const m = moment(moment.now()).format('YYYY-MM-DD HH:mm:ss:SSS X')
//     return `[${m}] [${message.level}] ${message.data.map(x => `${x}`.startsWith('[object') ? JSON.parse(JSON.stringify(x)) : x).join(" ")}`
//
//     // return '[{h}:{i}:{s}] [{level}] {text}'
// }
elog.hooks.push(messagehook);
logGitStats();
// elog.transports.file.format = '{h}:{i}:{s}.{ms} [{level}] › {text}';
const loglevels = { 0: 'debug', 1: 'log', 2: 'warn', 3: 'error' };
remote.getCurrentWindow().webContents.on("console-message", (event, level, message, line, sourceId) => {
    if (sourceId.includes('electron/js2c/renderer_init.js')) {
        return;
    }
    const d = new Date();
    // toLocaleDateString() returns '9/22/2020'
    const now = `${d.toLocaleDateString()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()}`;
    const ts = d.getTime() / 1000;
    let relSourceId;
    if (sourceId.startsWith('file://')) {
        relSourceId = path.relative('file://' + ROOT_PATH_ABS, sourceId);
    }
    else {
        relSourceId = path.relative(ROOT_PATH_ABS, sourceId);
    }
    const levelName = loglevels[level];
    if (levelName === undefined) {
        console.warn(`on console-message | undefined level: `, level);
        return;
    }
    const location = `${relSourceId}:${line}`;
    elog[levelName](message, { location });
    /*

    let levelName;
    levelName = ({ 0: 'DEBUG', 1: 'LOG', 2: 'WARN', 3: 'ERROR' })[level]
    if (levelName === undefined) {

        elog.silly(`on console-message | undefined level: `, level);
        return
    }
    sourceId = path.relative(ROOT_PATH_ABS, sourceId);
    elog.transports.file({
        data: [`${sourceId}:${line}`, message],
        level: levelName,

    })*/
});
if (AUTOEDITLOG) {
    console.debug('editing log file with vscode');
    const { spawnSync } = require('child_process');
    spawnSync('code', [elog.transports.file.file]);
}