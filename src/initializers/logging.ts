function errhook(message, selectedTransport) {
    // if elog.error(e:Error) was called, save screenshots,
    // extract nice trace and extra info from error, and
    // continue normally (prints to devtools console, terminal that launched pyano, and to log file)
    message.variables.now = mmnt(mmnt.now()).format('YYYY-MM-DD HH:mm:ss:SSS X');
    if (message.variables.record_start_ts) {
        message.variables.rec_time = (util.now(1) - message.variables.record_start_ts) / 10;

    }
    if (message.level === "error" && message.data[0] instanceof Error) {
        (async () => {
            try {
                await util.saveScreenshots();
                elog.debug('Saved screenshots successfully');
            } catch (e) {
                elog.debug('Failed saving screenshots')
            }
            const formattedErr = util.formatErr(message.data[0])
            return { ...message, data: formattedErr };
        })();

        /*util.saveScreenshots()
            .then(value => {
                elog.debug('Saved screenshots successfully')
            })
            .catch(reason => {
                elog.debug('Failed saving screenshots')

            })*/


    }

    return message;
}

function logGitStats() {
    const currentbranch = util.safeExec('git branch --show-current')
    if (currentbranch) {
        elog.info(`Current git branch: "${currentbranch}"`)
    }
    const currentcommit = util.safeExec('git log --oneline -n 1')
    if (currentcommit) {
        elog.info(`Current git commit: "${currentcommit}"`)
    }
    const gitdiff = util.safeExec('git diff --compact-summary')
    if (gitdiff) {
        elog.info(`Current git diff:\n${gitdiff}`)
    }
}

// elog[0] = elog.debug;
// elog[1] = elog.info;
// elog[2] = elog.warn;
// elog[3] = elog.error;


elog.transports.file.file = path.join(SESSION_PATH_ABS, path.basename(SESSION_PATH_ABS) + '.log');

elog.transports.file.format = "[{now}] [{rec_time}s] [{level}]{scope} {text}"
// elog.transports.file.format = (message) => {
//     // let now = Math.round(message.date.getTime() / 1000);
//     // debugger;
//
//     const m = moment(moment.now()).format('YYYY-MM-DD HH:mm:ss:SSS X')
//     return `[${m}] [${message.level}] ${message.data.map(x => `${x}`.startsWith('[object') ? JSON.parse(JSON.stringify(x)) : x).join(" ")}`
//
//     // return '[{h}:{i}:{s}] [{level}] {text}'
// }

elog.hooks.push(errhook)
logGitStats();

// elog.transports.file.format = '{h}:{i}:{s}.{ms} [{level}] › {text}';


/*currentWindow.webContents.on("console-message",
    (event: Event, level, message, line, sourceId) => {
        if (message.includes('console.group')) {
            return
        }
        if (sourceId.includes('electron/js2c/renderer_init.js')) {
            return
        }
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

        })

    });*/
if (AUTOEDITLOG) {
    elog.debug('opening log file');
    const { spawnSync } = require('child_process');
    spawnSync('code', [elog.transports.file.file]);
}
export {}