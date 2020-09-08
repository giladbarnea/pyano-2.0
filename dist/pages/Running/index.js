"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Glob_1 = require("../../Glob");
const bhe_1 = require("../../bhe");
const experiment_1 = require("./experiment");
async function tryCatch(fn, when) {
    try {
        await fn();
    }
    catch (e) {
        await swalert.big.error({
            title: `An error has occurred when ${when}`,
            html: e,
        });
    }
}
exports.tryCatch = tryCatch;
async function load(reload) {
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
    const experiment = new experiment_1.default(subconfig.store);
    await tryCatch(() => experiment.init(subconfig), 'trying to initialize Experiment');
    console.timeEnd(`new Experiment() and init()`);
    if (BigConfig.experiment_type === "test" || BigConfig.dev.simulate_test_mode('Running.index.ts')) {
        if (!BigConfig.dev.skip_experiment_intro('Running.index.ts')) {
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
//# sourceMappingURL=index.js.map