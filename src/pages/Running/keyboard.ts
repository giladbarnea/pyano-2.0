import { BetterHTMLElement } from "../../bhe";
import * as util from "../../util"
import Glob from "../../Glob";
import { Piano, PianoOptions } from "../../Piano";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";

class Keyboard extends BetterHTMLElement {
    constructor() {
        console.group('Keyboard ctor');
        
        const keys = {
            A0 : {
                '[data-note="A0"]' : {
                    'A#0' : '[data-note="A#0"]'
                }
            },
            B0 : '[data-note="B0"]',
        };
        const indexToLetter = {
            1 : "C",
            2 : "D",
            3 : "E",
            4 : "F",
            5 : "G",
            6 : "A",
            7 : "B"
        };
        const noblacks = [ 3, 7 ]; // E, B
        for ( let register of util.range(1, 7) ) {
            for ( let keyIndex of util.range(1, 7) ) {
                let letter = indexToLetter[keyIndex];
                let name = `${letter}${register}`;
                let value;
                if ( noblacks.includes(keyIndex) ) {
                    value = `[data-note="${name}"]`
                } else {
                    let query = `[data-note="${name}"]`;
                    let subname = `${letter}#${register}`;
                    let subquery = `[data-note="${subname}"]`;
                    let subvalue = {};
                    subvalue[subname] = subquery;
                    value = {};
                    value[query] = subvalue;
                }
                keys[name] = value;
            }
        }
        console.log({ keys });
        super({
            id : 'keyboard', children : keys
        });
        
        console.groupEnd();
        
    }
    
    private async initPiano() {
        console.group(`initPiano()`);
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
        console.groupEnd();
    }
}

const keyboard = new Keyboard();
export default keyboard;
