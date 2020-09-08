"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
const Salamander_1 = require("./Salamander");
class PianoString extends tone_1.ToneAudioNode {
    constructor(options) {
        super(options);
        this.name = 'PianoString';
        this._urls = {};
        options.notes.forEach(note => this._urls[note] = Salamander_1.getNotesUrl(note, options.velocity));
        this.samples = options.samples;
    }
    load() {
        return new Promise(onload => {
            this._sampler = this.output = new tone_1.Sampler({
                attack: 0,
                baseUrl: this.samples,
                curve: 'exponential',
                onload,
                release: 0.4,
                urls: this._urls,
                volume: 3,
            });
        });
    }
    triggerAttack(note, time, velocity) {
        this._sampler.triggerAttack(note, time, velocity);
    }
    triggerRelease(note, time) {
        this._sampler.triggerRelease(note, time);
    }
}
exports.PianoString = PianoString;
//# sourceMappingURL=String.js.map