import { BetterHTMLElement } from "../../bhe";
import * as util from "../../util"
import Glob from "../../Glob";
import { Piano, PianoOptions } from "../../Piano";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";
import { Note } from "@tonejs/midi/dist/Note";

// import * as Tone from "tone";
// import Note = Tone.Encoding.Note;
// import asx from "../../asx";


type NoteOffEvent = { name: string };
type NoteOnEvent = NoteOffEvent & { velocity: number };
type NoteOff = NoteOffEvent & { time: Tone.Unit.Time };
type NoteOn = NoteOnEvent & { time: Tone.Unit.Time, duration: number };

class Keyboard extends BetterHTMLElement {
    private notes: Note[];
    private piano: Piano;
    
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
        // this.initPiano();
        
        console.groupEnd();
        
    }
    
    async intro() {
        let noteOffObjs: NoteOff[] = [];
        let noteOnObjs: NoteOn[] = [];
        let notes: Note[];
        const maxAnimationNotes = Glob.BigConfig.dev.max_animation_notes();
        if ( maxAnimationNotes ) {
            notes = this.notes.slice(0, maxAnimationNotes);
        } else {
            notes = this.notes;
        }
        for ( let note of notes ) {
            let { name, velocity, duration, time : timeOn } = note;
            let timeOff = timeOn + duration;
            noteOffObjs.push({ name, time : timeOff });
            noteOnObjs.push({ name, time : timeOn, duration, velocity });
        }
        let count = 0;
        const noteOffCallback = async (time: Tone.Unit.Time, event: NoteOffEvent) => {
            Tone.Draw.schedule(() => this.paintKey(event, false), time);
            this.piano.keyUp(event.name, time);
            count++;
            
            if ( noteOffEvents.length === count ) {
                const now = Tone.Transport.now();
                const util = require("../../util");
                await util.wait((now - time) * 1000);
                console.log('intro done', { event, time, now, });
            }
            /*setTimeout(() => {
             console.log('noteOffCallback', {
             time,
             event,
             "noteOffEvents.progress" : noteOffEvents.progress,
             });
             
             }, 2000);*/
            
            
        };
        
        const noteOnCallback = (time: Tone.Unit.Time, event: NoteOnEvent) => {
            Tone.Draw.schedule(() => this.paintKey(event, true), time);
            this.piano.keyDown(event.name, time, event.velocity);
        };
        
        const now = Tone.Transport.now();
        const noteOffEvents = new Tone.Part(noteOffCallback, noteOffObjs).start(now);
        const noteOnEvents = new Tone.Part(noteOnCallback, noteOnObjs).start(now);
        
        Tone.Transport.start(now);
        console.log({ noteOffEvents });
        remote.globalShortcut.register("CommandOrControl+M", () => Tone.Transport.toggle());
        
        
    }
    
    private paintKey(event, on: boolean) {
        if ( event.name.includes('#') ) {
            let nohash = event.name.replace('#', '');
            this[nohash][event.name].toggleClass('on', on);
        } else {
            this[event.name].toggleClass('on', on);
        }
    }
    
    
    async initPiano() {
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
        this.piano = new Piano(pianoOptions).toDestination();
        const promisePianoLoaded = this.piano.load();
        const promiseMidiLoaded = Midi.fromUrl(subconfig.truth.midi.absPath);
        const [ _, midi ] = await Promise.all([ promisePianoLoaded, promiseMidiLoaded ]);
        // const midi = await Midi.fromUrl(subconfig.truth.midi.absPath);
        console.log('piano loaded');
        console.log('midi loaded', midi);
        this.notes = midi.tracks[0].notes;
        console.groupEnd();
        return;
        
        // const noteOffCallback = (time: Tone.Unit.Time, event: NoteOffEvent) => {
        //
        //     Tone.Draw.schedule(() => this.paintKey(event, false), time);
        //     piano.keyUp(event.name, time);
        // };
        
        // const noteOnCallback = (time: Tone.Unit.Time, event: NoteOnEvent) => {
        //     Tone.Draw.schedule(() => this.paintKey(event, true), time);
        //     piano.keyDown(event.name, time, event.velocity);
        // };
        
        
    }
}

// const keyboard = new Keyboard();
export default Keyboard;
