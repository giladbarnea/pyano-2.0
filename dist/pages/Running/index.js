Object.defineProperty(exports, "__esModule", { value: true });
exports.tryCatch = exports.load = void 0;
const Glob_1 = require("../../Glob");
const bhe_1 = require("../../bhe");
// import keyboard from './keyboard'
// import Dialog from './dialog'
// import { Piano } from "../../Piano"
// import { Piano, PianoOptions } from "../../Piano"
// import { Midi } from "@tonejs/midi";
const experiment_1 = require("./experiment");
async function tryCatch(fn, when) {
    try {
        await fn();
    }
    catch (e) {
        // todo: either just elog.error, or this may be completely redundant because of elog.catchError
        await swalert.big.error({
            title: `An error has occurred when ${when}`,
            html: e,
        });
    }
}
exports.tryCatch = tryCatch;
/**require('./Running').load()
 * DONT import * as runningPage, this calls constructors etc*/
async function load(reload) {
    // **  Performance, visuals sync: https://github.com/Tonejs/Tone.js/wiki/Performance
    console.group(`Running.index.load(${reload})`);
    BigConfig.last_page = "running";
    if (reload) {
        console.groupEnd();
        return util.reloadPage();
    }
    Glob_1.default.skipFade = BigConfig.dev.skip_fade();
    Glob_1.default.Sidebar.remove();
    const subconfig = BigConfig.getSubconfig();
    Glob_1.default.Title
        .html(`${subconfig.truth.name}`)
        .cacheAppend({
        levelh3: bhe_1.elem({
            tag: 'h3'
        }),
        trialh3: bhe_1.elem({
            tag: 'h3'
        })
    });
    console.time(`new Experiment() and init()`);
    // const experiment = new Experiment(subconfig.truth.name, subconfig.demo_type);
    const experiment = new experiment_1.default(subconfig.store);
    await tryCatch(() => experiment.init(subconfig), 'trying to initialize Experiment');
    console.timeEnd(`new Experiment() and init()`);
    if (BigConfig.experiment_type === "test" || BigConfig.dev.simulate_test_mode('Running.index.ts')) {
        if (!BigConfig.dev.skip_experiment_intro('Running.index.ts')) {
            // TODO: limit by maxNotes
            await tryCatch(() => experiment.intro(), 'trying to play experiment intro');
        }
    }
    const levelCollection = subconfig.getLevelCollection();
    if (!BigConfig.dev.skip_level_intro('Running.index.ts')) {
        await tryCatch(() => experiment.levelIntro(levelCollection), 'trying to play levelIntro');
    }
    await tryCatch(() => experiment.record(levelCollection), 'trying to record');
    console.groupEnd();
}
exports.load = load;