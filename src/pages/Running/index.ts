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
import { MyPyShell } from "../../MyPyShell";
import { enumerate } from "../../util";

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
    const PY_getOnOffPairs = new MyPyShell('-m txt.get_on_off_pairs', {
        mode : "json",
        args : [ subconfig.truth_file ]
    });
    const { on_msgs, off_msgs } = await PY_getOnOffPairs.runAsync();
    console.log({ on_msgs, off_msgs });
    // for ( let [ i, m ] of enumerate(response.msgs_C) ) {
    //     if ( m.time !== response.normalized_messages[i].time ) {
    //         console.log({ "response.normalized_messages[i]" : response.normalized_messages[i], m });
    //     }
    // }
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
