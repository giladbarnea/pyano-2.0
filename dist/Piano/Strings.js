Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
const Component_1 = require("./Component");
const Salamander_1 = require("./Salamander");
const String_1 = require("./String");
/**
 *  Manages all of the hammered string sounds
 */
class PianoStrings extends Component_1.PianoComponent {
    constructor(options) {
        super(options);
        const notes = Salamander_1.getNotesInRange(options.minNote, options.maxNote);
        const velocities = Salamander_1.velocitiesMap[options.velocities].slice();
        this._strings = velocities.map(velocity => {
            const string = new String_1.PianoString(Object.assign(options, {
                notes, velocity,
            }));
            return string;
        });
        this._activeNotes = new Map();
    }
    /**
     * Scale a value between a given range
     */
    scale(val, inMin, inMax, outMin, outMax) {
        return ((val - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
    }
    triggerAttack(note, time, velocity) {
        const scaledVel = this.scale(velocity, 0, 1, -0.5, this._strings.length - 0.51);
        const stringIndex = Math.max(Math.round(scaledVel), 0);
        let gain = 1 + scaledVel - stringIndex;
        if (this._strings.length === 1) {
            gain = velocity;
        }
        const sampler = this._strings[stringIndex];
        if (this._activeNotes.has(note)) {
            this.triggerRelease(note, time);
        }
        this._activeNotes.set(note, sampler);
        sampler.triggerAttack(tone_1.Midi(note).toNote(), time, gain);
    }
    triggerRelease(note, time) {
        // trigger the release of all of the notes at that velociy
        if (this._activeNotes.has(note)) {
            this._activeNotes.get(note).triggerRelease(tone_1.Midi(note).toNote(), time);
            this._activeNotes.delete(note);
        }
    }
    async _internalLoad() {
        await Promise.all(this._strings.map(async (s) => {
            await s.load();
            s.connect(this.output);
        }));
    }
}
exports.PianoStrings = PianoStrings;
//# sourceMappingURL=Strings.js.map