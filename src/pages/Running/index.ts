import Glob from "../../Glob";
import * as util from "../../util";
import { elem } from "../../bhe";
import animation from './animation'
import Dialog from './dialog'
import { Piano } from "../../Piano"
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
    const piano = new Piano({
        samples : SALAMANDER_PATH_ABS,
        release : true,
        pedal : true,
        velocities : 5,
    }).toDestination();
    await piano.load();
    console.log('piano loaded');
    const midi = await Midi.fromUrl(subconfig.truth.midi.absPath);
    console.log('midi loaded');
    
    const noteOffCallback = (time: Tone.Unit.Time, event: { name: string | number }) => {
        piano.keyUp(event.name, time);
    };
    const noteOnCallback = (time: Tone.Unit.Time, event: { name: string | number, velocity: number }) => {
        piano.keyDown(event.name, time, event.velocity);
    };
    type NoteOff = { name: string | number, time: Tone.Unit.Time };
    type NoteOn = NoteOff & { velocity: number, duration: number };
    let noteOffObjs: NoteOff[] = [];
    let noteOnObjs: NoteOn[] = [];
    for ( let note of midi.tracks[0].notes ) {
        let { name, velocity, duration, time : timeOn } = note;
        let timeOff = timeOn + duration;
        noteOffObjs.push({ name, time : timeOff });
        noteOnObjs.push({ name, time : timeOn, duration, velocity });
    }
    /*const noteOffObjs = midi.tracks[0].notes.map(n => ({
     name : n.name,
     time : n.time + n.duration,
     }
     )
     );
     const noteOnObjs = midi.tracks[0].notes.map(n => ({
     name : n.name,
     velocity : n.velocity,
     duration : n.duration,
     time : n.time,
     }));*/
    const noteOffEvents = new Tone.Part(noteOffCallback, noteOffObjs).start(0);
    const noteOnEvents = new Tone.Part(noteOnCallback, noteOnObjs).start(0);
    Tone.Transport.start();
    remote.globalShortcut.register("M", () => Tone.Transport.toggle());
    
    console.log({ subconfig, midi, piano, "Tone.Transport.state" : Tone.Transport.state, });
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
