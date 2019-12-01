import Glob from "../../Glob";
import * as util from "../../util";
import { elem } from "../../bhe";
// import keyboard from './keyboard'
// import Dialog from './dialog'
// import { Piano } from "../../Piano"
// import { Piano, PianoOptions } from "../../Piano"
// import { Midi } from "@tonejs/midi";
import * as Tone from "tone";
import Experiment from "./experiment";

// const { Piano } = require("@tonejs/piano");


/**require('./Running').load()
 * DONT import * as runningPage, this calls constructors etc*/
async function load(reload: boolean) {
    // **  Performance, visuals sync: https://github.com/Tonejs/Tone.js/wiki/Performance
    console.group(`pages.Running.index.load(${reload})`);
    
    Glob.BigConfig.last_page = "running";
    if ( reload ) {
        console.groupEnd();
        return util.reloadPage();
    }
    Glob.skipFade = Glob.BigConfig.dev.skip_fade();
    Tone.context.latencyHint = "playback"; // TODO: this should be under keybard.ts
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
    const experiment = new Experiment(subconfig.demo_type);
    await experiment.init(readonlyTruth);
    if ( Glob.BigConfig.experiment_type === "test" ) {
        // TODO: limit by maxNotes
        await experiment.intro();
    }
    const levelCollection = subconfig.getLevelCollection();
    await experiment.levelIntro(levelCollection);
    console.groupEnd();
    
}

export { load }
