import Glob from "../../Glob";
import * as util from "../../util";
import { elem } from "../../bhe";
import animation from './animation'
import Dialog from './dialog'
// import { Piano } from "../../Piano"
import { Piano, PianoOptions } from "../../Piano"
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";

// const { Piano } = require("@tonejs/piano");


/**import * as runningPage from "../Running"
 * require('./Running')*/
async function load(reload: boolean) {
    // **  Performance, visuals sync: https://github.com/Tonejs/Tone.js/wiki/Performance
    console.group(`pages.Running.index.load(${reload})`);
    Glob.BigConfig.last_page = "running";
    if ( reload ) {
        console.groupEnd();
        return util.reloadPage();
    }
    Glob.Sidebar.remove();
    const subconfig = Glob.BigConfig.getSubconfig();
    const pianoOptions: Partial<PianoOptions> = {
        samples : SALAMANDER_PATH_ABS,
        release : true,
        pedal : false,
        velocities : 1,
    };
    if ( Glob.BigConfig.dev.mute_piano() ) {
        console.warn(`Glob.BigConfig.dev.mute_piano()`);
        pianoOptions.volume = { strings : -Infinity, harmonics : -Infinity, keybed : -Infinity, pedal : -Infinity }
    }
    const piano = new Piano(pianoOptions).toDestination();
    await piano.load();
    console.log('piano loaded');
    const midi = await Midi.fromUrl(subconfig.truth.midi.absPath);
    console.log('midi loaded');
    type NoteOffEvent = { name: string | number };
    type NoteOnEvent = NoteOffEvent & { velocity: number };
    type NoteOff = NoteOffEvent & { time: Tone.Unit.Time };
    type NoteOn = NoteOnEvent & { time: Tone.Unit.Time, duration: number };
    
    const noteOffCallback = (time: Tone.Unit.Time, event: NoteOffEvent) => {
        piano.keyUp(event.name, time);
    };
    const noteOnCallback = (time: Tone.Unit.Time, event: NoteOnEvent) => {
        piano.keyDown(event.name, time, event.velocity);
    };
    
    
    let noteOffObjs: NoteOff[] = [];
    let noteOnObjs: NoteOn[] = [];
    for ( let note of midi.tracks[0].notes ) {
        let { name, velocity, duration, time : timeOn } = note;
        let timeOff = timeOn + duration;
        noteOffObjs.push({ name, time : timeOff });
        noteOnObjs.push({ name, time : timeOn, duration, velocity });
    }
    
    const noteOffEvents = new Tone.Part(noteOffCallback, noteOffObjs).start(0);
    const noteOnEvents = new Tone.Part(noteOnCallback, noteOnObjs).start(0);
    Tone.Transport.start();
    
    remote.globalShortcut.register("M", () => Tone.Transport.toggle());
    
    console.log({ subconfig, midi, piano });
    Glob.Title.html(`${subconfig.truth.name}`);
    
    const subtitle = elem({ tag : 'h3', text : '1/1' });
    const dialog = new Dialog(subconfig.demo_type);
    
    Glob.MainContent.append(
        subtitle,
        dialog
    );
    console.groupEnd();
    
}

export { load }
