import * as util from "../../util"
import Glob from "../../Glob";
import { Piano, PianoOptions } from "../../Piano";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";
import { VisualBHE } from "../../bhe/extra.js";

type NoteEvent = { name: string };
// type NoteOffEvent = { name: string };
type NoteOnEvent = NoteEvent & { velocity: number };
type NoteOff = NoteEvent & { time: Tone.Unit.Time };
type NoteOn = NoteOnEvent & { time: Tone.Unit.Time, duration: number };

class Animation extends VisualBHE {
    private piano: Piano;
    private noteOns: NoteOn[];
    private noteOffs: NoteOff[];

    constructor() {

        const keys = {
            A0: {
                '[data-note="A0"]': {
                    'A#0': '[data-note="A#0"]'
                }
            },
            B0: '[data-note="B0"]',
        };
        const indexToLetter = {
            1: "C",
            2: "D",
            3: "E",
            4: "F",
            5: "G",
            6: "A",
            7: "B"
        };
        const noblacks = [3, 7]; // E, B
        for (let register of util.range(1, 7)) {
            for (let keyIndex of util.range(1, 7)) {
                let letter = indexToLetter[keyIndex];
                let name = `${letter}${register}`;
                let value;
                if (noblacks.includes(keyIndex)) {
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
        super({
            byid: 'animation', children: keys
        });


    }

    async init(midiAbsPath: string) {
        console.group(`Animation.init()`);

        const pianoOptions: Partial<PianoOptions> = {
            samples: SALAMANDER_PATH_ABS,
            release: true,
            pedal: false,
            velocities: Glob.BigConfig.velocities,
        };
        if (Glob.BigConfig.dev.mute_animation()) {
            pianoOptions.volume = { strings: -Infinity, harmonics: -Infinity, keybed: -Infinity, pedal: -Infinity }
        }
        this.piano = new Piano(pianoOptions).toDestination();
        const loadPiano = this.piano.load();
        const loadMidi = Midi.fromUrl(midiAbsPath);
        const [_, midi] = await Promise.all([loadPiano, loadMidi]);
        console.log('piano loaded, midi loaded: ', midi);
        const notes = midi.tracks[0].notes;
        Tone.context.latencyHint = "playback";
        Tone.Transport.start();


        let noteOns: NoteOn[] = [];
        let noteOffs: NoteOff[] = [];

        for (let note of notes) {
            let { name, velocity, duration, time: timeOn } = note;
            let timeOff = timeOn + duration;
            noteOns.push({ name, time: timeOn, duration, velocity });
            noteOffs.push({ name, time: timeOff });
        }
        this.noteOns = noteOns;
        this.noteOffs = noteOffs;
        console.groupEnd();
        return;


    }

    async intro(): Promise<unknown> {
        console.group(`Animation.intro()`);
        await this.play();
        console.groupEnd();
        return;


    }

    async levelIntro(notes: number, rate: number) {
        console.group(`Animation.levelIntro(notes: ${notes}, rate: ${rate})`);
        await this.play(notes, rate);
        console.groupEnd();
        return;
    }

    private paintKey({ name }: NoteEvent, color: "red" | "green" | "blue", on: boolean) {
        let child;
        if (name.includes('#')) {
            let nohash = name.replace('#', '');
            child = this[nohash][name];
        } else {
            child = this[name];
        }
        child.toggleClass(color, on);
    }

    private play(notes?: number, rate?: number): Promise<unknown> {

        return new Promise(resolve => {
            let count = 0;

            const noteOnCallback = (time: Tone.Unit.Time, event: NoteOnEvent) => {
                Tone.Draw.schedule(() => this.paintKey(event, "green", true), time);
                this.piano.keyDown(event.name, time, event.velocity);
            };
            const noteOffCallback = async (time: Tone.Unit.Time, event: NoteEvent) => {
                Tone.Draw.schedule(() => this.paintKey(event, "green", false), time);
                this.piano.keyUp(event.name, time);
                count++;

                if (noteOffEvents.length === count) {
                    const now = Tone.Transport.now();
                    // const util = require("../../util");
                    // @ts-ignore
                    const diff = now - time;
                    await util.wait((diff * 1000), false);
                    console.log('animation ended!');
                    resolve();
                }


            };


            // const now = Tone.Transport.now();
            let noteOffs;
            let noteOns;
            if (notes) {
                noteOns = this.noteOns.slice(0, notes);
                noteOffs = this.noteOffs.slice(0, notes);
            } else {
                noteOns = this.noteOns;
                noteOffs = this.noteOffs;
            }
            const onPart = new Tone.Part(noteOnCallback, noteOns);
            onPart.playbackRate = rate;

            const offPart = new Tone.Part(noteOffCallback, noteOffs);
            offPart.playbackRate = rate;
            const noteOnEvents = onPart.start();
            const noteOffEvents = offPart.start();


        });

    }


}

export default Animation;
