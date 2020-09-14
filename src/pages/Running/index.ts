import Glob from "../../Glob";
import { elem } from "../../bhe";
// import keyboard from './keyboard'
// import Dialog from './dialog'
// import { Piano } from "../../Piano"
// import { Piano, PianoOptions } from "../../Piano"
// import { Midi } from "@tonejs/midi";
import Experiment from "./experiment";

async function tryCatch(fn: () => Promise<void>, when: string): Promise<void> {
    try {
        await fn();
    } catch (e) {

        // todo: either just elog.error, or this may be completely redundant because of elog.catchError
        await swalert.big.error({
            title: `An error has occurred when ${when}`,
            html: e,
        });
    }
}

/**require('./Running').load()
 * DONT import * as runningPage, this calls constructors etc*/
async function load(reload: boolean) {
    // **  Performance, visuals sync: https://github.com/Tonejs/Tone.js/wiki/Performance
    console.group(`Running.index.load(${reload})`);

    BigConfig.last_page = "running";
    if (reload) {
        console.groupEnd();
        return util.reloadPage();
    }
    Glob.skipFade = BigConfig.dev.skip_fade();

    Glob.Sidebar.remove();
    const subconfig = BigConfig.getSubconfig();


    Glob.Title
        .html(`${subconfig.truth.name}`)

        .cacheAppend({
            levelh3: elem({
                tag: 'h3'
            }),
            trialh3: elem({
                tag: 'h3'
            })
        });


    console.time(`new Experiment() and init()`);
    // const experiment = new Experiment(subconfig.truth.name, subconfig.demo_type);
    const experiment = new Experiment(subconfig.store);
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

export { load, tryCatch }
