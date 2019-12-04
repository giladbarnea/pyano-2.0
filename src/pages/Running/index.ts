import Glob from "../../Glob";
import * as util from "../../util";
import { elem } from "../../bhe";
// import keyboard from './keyboard'
// import Dialog from './dialog'
// import { Piano } from "../../Piano"
// import { Piano, PianoOptions } from "../../Piano"
// import { Midi } from "@tonejs/midi";
import Experiment from "./experiment";
import MyAlert from "../../MyAlert";

// const { Piano } = require("@tonejs/piano");


/**require('./Running').load()
 * DONT import * as runningPage, this calls constructors etc*/
async function load(reload: boolean) {
    // **  Performance, visuals sync: https://github.com/Tonejs/Tone.js/wiki/Performance
    console.group(`Running.index.load(${reload})`);
    
    Glob.BigConfig.last_page = "running";
    if ( reload ) {
        console.groupEnd();
        return util.reloadPage();
    }
    Glob.skipFade = Glob.BigConfig.dev.skip_fade();
    
    Glob.Sidebar.remove();
    const subconfig = Glob.BigConfig.getSubconfig();
    
    
    Glob.Title
        .html(`${subconfig.truth.name}`)
    
        .cacheAppend({
            levelh3 : elem({
                tag : 'h3'
            }),
            trialh3 : elem({
                tag : 'h3'
            })
        });
    
    
    let readonlyTruth = subconfig.truth.toReadOnly();
    console.time(`new Experiment() and init()`);
    const experiment = new Experiment(subconfig.demo_type);
    await experiment.init(readonlyTruth);
    console.timeEnd(`new Experiment() and init()`);
    if ( Glob.BigConfig.experiment_type === "test" || Glob.BigConfig.dev.simulate_test_mode('Running.index.ts') ) {
        if ( !Glob.BigConfig.dev.skip_experiment_intro('Running.index.ts') ) {
            // TODO: limit by maxNotes
            try {
                await experiment.intro();
                
            } catch ( e ) {
                const { where, what } = e.toObj();
                await MyAlert.big.error({
                    title : 'An error has occurred when trying to play experiment intro',
                    html : `${what}<p>${where}</p>`
                });
                throw e
            }
        }
    }
    const levelCollection = subconfig.getLevelCollection();
    
    
    try {
        await experiment.levelIntro(levelCollection);
        
    } catch ( e ) {
        const { where, what } = e.toObj();
        await MyAlert.big.error({
            title : 'An error has occurred while trying to play levelIntro',
            html : `${what}<p>${where}</p>`
        });
        throw e
    }
    console.groupEnd();
    
}

export { load }
