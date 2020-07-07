"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Glob_1 = require("../../Glob");
const util = require("../../util");
const bhe_1 = require("../../bhe");
const experiment_1 = require("./experiment");
const MyAlert_1 = require("../../MyAlert");
async function tryCatch(fn, when) {
    try {
        await fn();
    }
    catch (e) {
        await MyAlert_1.default.big.error({
            title: `An error has occurred when ${when}`,
            html: e,
        });
    }
}
exports.tryCatch = tryCatch;
async function load(reload) {
    console.group(`Running.index.load(${reload})`);
    Glob_1.default.BigConfig.last_page = "running";
    if (reload) {
        console.groupEnd();
        return util.reloadPage();
    }
    Glob_1.default.skipFade = Glob_1.default.BigConfig.dev.skip_fade();
    Glob_1.default.Sidebar.remove();
    const subconfig = Glob_1.default.BigConfig.getSubconfig();
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
    const experiment = new experiment_1.default(subconfig.store);
    await tryCatch(() => experiment.init(subconfig), 'trying to initialize Experiment');
    console.timeEnd(`new Experiment() and init()`);
    if (Glob_1.default.BigConfig.experiment_type === "test" || Glob_1.default.BigConfig.dev.simulate_test_mode('Running.index.ts')) {
        if (!Glob_1.default.BigConfig.dev.skip_experiment_intro('Running.index.ts')) {
            await tryCatch(() => experiment.intro(), 'trying to play experiment intro');
        }
    }
    const levelCollection = subconfig.getLevelCollection();
    if (!Glob_1.default.BigConfig.dev.skip_level_intro('Running.index.ts')) {
        await tryCatch(() => experiment.levelIntro(levelCollection), 'trying to play levelIntro');
    }
    await tryCatch(() => experiment.record(levelCollection), 'trying to record');
    console.groupEnd();
}
exports.load = load;
//# sourceMappingURL=index.js.map