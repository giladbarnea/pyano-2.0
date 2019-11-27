import Glob from "../../Glob";
import * as util from "../../util";
import { elem } from "../../bhe";
import keyboard from './keyboard'
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
    Tone.context.latencyHint = "playback";
    Glob.Sidebar.remove();
    const subconfig = Glob.BigConfig.getSubconfig();
    const pianoOptions: Partial<PianoOptions> = {
        samples : SALAMANDER_PATH_ABS,
        release : true,
        pedal : false,
        velocities : Glob.BigConfig.velocities,
    };
    if ( Glob.BigConfig.dev.mute_animation() ) {
        pianoOptions.volume = { strings : -Infinity, harmonics : -Infinity, keybed : -Infinity, pedal : -Infinity }
    }
    const piano = new Piano(pianoOptions).toDestination();
    await piano.load();
    console.log('piano loaded');
    const midi = await Midi.fromUrl(subconfig.truth.midi.absPath);
    console.log('midi loaded');
    
    
    type NoteOffEvent = { name: string };
    type NoteOnEvent = NoteOffEvent & { velocity: number };
    type NoteOff = NoteOffEvent & { time: Tone.Unit.Time };
    type NoteOn = NoteOnEvent & { time: Tone.Unit.Time, duration: number };
    
    function noteOffCallback(time: Tone.Unit.Time, event: NoteOffEvent) {
        Tone.Draw.schedule(function () {
            console.log(event.name);
            if ( event.name.includes('#') ) {
                let nohash = event.name.replace('#', '');
                keyboard[nohash][event.name].removeClass('on');
            } else {
                keyboard[event.name].removeClass('on');
            }
        }, time);
        piano.keyUp(event.name, time);
    }
    
    function noteOnCallback(time: Tone.Unit.Time, event: NoteOnEvent) {
        Tone.Draw.schedule(function () {
            console.log(event.name);
            if ( event.name.includes('#') ) {
                let nohash = event.name.replace('#', '');
                keyboard[nohash][event.name].addClass('on');
            } else {
                keyboard[event.name].addClass('on');
            }
        }, time);
        piano.keyDown(event.name, time, event.velocity);
    }
    
    
    let noteOffObjs: NoteOff[] = [];
    let noteOnObjs: NoteOn[] = [];
    let notes;
    const maxAnimationNotes = Glob.BigConfig.dev.max_animation_notes();
    if ( maxAnimationNotes ) {
        notes = midi.tracks[0].notes.slice(0, maxAnimationNotes);
    } else {
        notes = midi.tracks[0].notes;
    }
    for ( let note of notes ) {
        let { name, velocity, duration, time : timeOn } = note;
        let timeOff = timeOn + duration;
        noteOffObjs.push({ name, time : timeOff });
        noteOnObjs.push({ name, time : timeOn, duration, velocity });
    }
    const now = Tone.Transport.now();
    const noteOffEvents = new Tone.Part(noteOffCallback, noteOffObjs).start(now);
    const noteOnEvents = new Tone.Part(noteOnCallback, noteOnObjs).start(now);
    Tone.Transport.start(now);
    
    remote.globalShortcut.register("CommandOrControl+M", () => Tone.Transport.toggle());
    
    console.log({ subconfig, midi, piano, "Tone.Context.getDefaults()" : Tone.Context.getDefaults(), });
    Glob.Title.html(`${subconfig.truth.name}`);
    
    const subtitle = elem({ tag : 'h3', text : '1/1' });
    const dialog = new Dialog(subconfig.demo_type);
    keyboard.class('active').before(
        subtitle,
        dialog
    );
    // Glob.MainContent.append(
    //
    // );
    console.groupEnd();
    
}

export { load }
