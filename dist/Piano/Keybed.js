Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
const Component_1 = require("./Component");
const Salamander_1 = require("./Salamander");
const Util_1 = require("./Util");
class Keybed extends Component_1.PianoComponent {
    constructor(options) {
        super(options);
        /**
         * The urls to load
         */
        this._urls = {};
        for (let i = options.minNote; i <= options.maxNote; i++) {
            this._urls[i] = Salamander_1.getReleasesUrl(i);
        }
    }
    _internalLoad() {
        return new Promise(success => {
            this._buffers = new tone_1.ToneAudioBuffers(this._urls, success, this.samples);
        });
    }
    start(note, time, velocity) {
        if (this._enabled && this._buffers.has(note)) {
            const source = new tone_1.ToneBufferSource({
                buffer: this._buffers.get(note),
                context: this.context,
            }).connect(this.output);
            // randomize the velocity slightly
            source.start(time, 0, undefined, 0.015 * velocity * Util_1.randomBetween(0.5, 1));
        }
    }
}
exports.Keybed = Keybed;
//# sourceMappingURL=Keybed.js.map