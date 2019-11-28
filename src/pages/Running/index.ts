import Glob from "../../Glob";
import * as util from "../../util";
import { elem } from "../../bhe";
// import keyboard from './keyboard'
// import Dialog from './dialog'
// import { Piano } from "../../Piano"
import { Piano, PianoOptions } from "../../Piano"
import { Midi } from "@tonejs/midi";
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
    Tone.context.latencyHint = "playback";
    Glob.Sidebar.remove();
    const subconfig = Glob.BigConfig.getSubconfig();
    Glob.Title.html(`${subconfig.truth.name}`);
    const experiment = new Experiment();
    const subtitle = elem({ tag : 'h3', text : '1/1' });
    subtitle.insertBefore(experiment.keyboard);
    // keyboard.class('active').before(
    //     subtitle,
    //
    // );
    experiment.intro(subconfig.demo_type);
    // Glob.MainContent.insertBefore(
    //
    // );
    console.groupEnd();
    
}

export { load }
