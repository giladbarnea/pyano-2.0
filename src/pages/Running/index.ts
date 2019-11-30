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
        .cacheAppend({ h3 : elem({ tag : 'h3', text : '1/1' }) });
    const experiment = new Experiment(subconfig.demo_type);
    let absPaths;
    if ( subconfig.demo_type === "video" ) {
        absPaths = [ subconfig.truth.mp4.absPath, subconfig.truth.onsets.absPath ];
    } else {
        absPaths = [ subconfig.truth.midi.absPath ];
    }
    await experiment.intro(subconfig.truth);
    
    console.groupEnd();
    
}

export { load }
