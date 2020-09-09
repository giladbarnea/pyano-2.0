Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
const Component_1 = require("./Component");
const Salamander_1 = require("./Salamander");
const Util_1 = require("./Util");
class Harmonics extends Component_1.PianoComponent {
    constructor(options) {
        super(options);
        this._urls = {};
        const notes = Salamander_1.getHarmonicsInRange(options.minNote, options.maxNote);
        for (const n of notes) {
            this._urls[n] = Salamander_1.getHarmonicsUrl(n);
        }
    }
    triggerAttack(note, time, velocity) {
        if (this._enabled && Salamander_1.inHarmonicsRange(note)) {
            this._sampler.triggerAttack(tone_1.Midi(note).toNote(), time, velocity * Util_1.randomBetween(0.5, 1));
        }
    }
    _internalLoad() {
        return new Promise(onload => {
            this._sampler = new tone_1.Sampler({
                baseUrl: this.samples,
                onload,
                urls: this._urls,
            }).connect(this.output);
        });
    }
}
exports.Harmonics = Harmonics;
//# sourceMappingURL=Harmonics.js.map