"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
const Harmonics_1 = require("./Harmonics");
const Keybed_1 = require("./Keybed");
const Pedal_1 = require("./Pedal");
const Strings_1 = require("./Strings");
class Piano extends tone_1.ToneAudioNode {
    constructor() {
        super(tone_1.optionsFromArguments(Piano.getDefaults(), arguments));
        this.name = 'Piano';
        this.input = undefined;
        this.output = new tone_1.Gain({ context: this.context });
        this._heldNotes = new Map();
        this._loaded = false;
        const options = tone_1.optionsFromArguments(Piano.getDefaults(), arguments);
        this._heldNotes = new Map();
        this._sustainedNotes = new Map();
        this._strings = new Strings_1.PianoStrings(Object.assign({}, options, {
            enabled: true,
            volume: options.volume.strings,
        })).connect(this.output);
        this.strings = this._strings.volume;
        this._pedal = new Pedal_1.Pedal(Object.assign({}, options, {
            enabled: options.pedal,
            volume: options.volume.pedal,
        })).connect(this.output);
        this.pedal = this._pedal.volume;
        this._keybed = new Keybed_1.Keybed(Object.assign({}, options, {
            enabled: options.release,
            volume: options.volume.keybed,
        })).connect(this.output);
        this.keybed = this._keybed.volume;
        this._harmonics = new Harmonics_1.Harmonics(Object.assign({}, options, {
            enabled: options.release,
            volume: options.volume.harmonics,
        })).connect(this.output);
        this.harmonics = this._harmonics.volume;
    }
    static getDefaults() {
        return Object.assign(tone_1.ToneAudioNode.getDefaults(), {
            maxNote: 108,
            minNote: 21,
            pedal: true,
            release: false,
            samples: './audio/',
            velocities: 1,
            volume: {
                harmonics: 0,
                keybed: 0,
                pedal: 0,
                strings: 0,
            },
        });
    }
    async load() {
        await Promise.all([
            this._strings.load(),
            this._pedal.load(),
            this._keybed.load(),
            this._harmonics.load(),
        ]);
        this._loaded = true;
    }
    get loaded() {
        return this._loaded;
    }
    pedalDown(time) {
        if (this.loaded) {
            time = this.toSeconds(time);
            if (!this._pedal.isDown(time)) {
                this._pedal.down(time);
            }
        }
        return this;
    }
    pedalUp(time) {
        if (this.loaded) {
            const seconds = this.toSeconds(time);
            if (this._pedal.isDown(seconds)) {
                this._pedal.up(seconds);
                this._sustainedNotes.forEach((t, note) => {
                    if (!this._heldNotes.has(note)) {
                        this._strings.triggerRelease(note, seconds);
                    }
                });
                this._sustainedNotes.clear();
            }
        }
        return this;
    }
    keyDown(note, time = this.immediate(), velocity = 0.8) {
        if (this.loaded) {
            time = this.toSeconds(time);
            if (tone_1.isString(note)) {
                note = Math.round(tone_1.Midi(note).toMidi());
            }
            if (!this._heldNotes.has(note)) {
                this._heldNotes.set(note, { time, velocity });
                this._strings.triggerAttack(note, time, velocity);
            }
        }
        return this;
    }
    keyUp(note, time = this.immediate(), velocity = 0.8) {
        if (this.loaded) {
            time = this.toSeconds(time);
            if (tone_1.isString(note)) {
                note = Math.round(tone_1.Midi(note).toMidi());
            }
            if (this._heldNotes.has(note)) {
                const prevNote = this._heldNotes.get(note);
                this._heldNotes.delete(note);
                const holdTime = Math.pow(Math.max(time - prevNote.time, 0.1), 0.7);
                const prevVel = prevNote.velocity;
                let dampenGain = (3 / holdTime) * prevVel * velocity;
                dampenGain = Math.max(dampenGain, 0.4);
                dampenGain = Math.min(dampenGain, 4);
                if (this._pedal.isDown(time)) {
                    if (!this._sustainedNotes.has(note)) {
                        this._sustainedNotes.set(note, time);
                    }
                }
                else {
                    this._strings.triggerRelease(note, time);
                    this._harmonics.triggerAttack(note, time, dampenGain);
                }
                this._keybed.start(note, time, velocity);
            }
        }
        return this;
    }
    stopAll() {
        this.pedalUp();
        this._heldNotes.forEach((value, note) => {
            this.keyUp(note);
        });
        return this;
    }
}
exports.Piano = Piano;
//# sourceMappingURL=Piano.js.map