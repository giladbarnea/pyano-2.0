Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
class PianoComponent extends tone_1.ToneAudioNode {
    constructor(options) {
        super(options);
        this.name = 'PianoComponent';
        this.input = undefined;
        this.output = new tone_1.Volume({ context: this.context });
        this._enabled = false;
        this.volume = this.output.volume;
        this._loaded = false;
        this.volume.value = options.volume;
        this._enabled = options.enabled;
        this.samples = options.samples;
    }
    get loaded() {
        return this._loaded;
    }
    async load() {
        if (this._enabled) {
            await this._internalLoad();
            this._loaded = true;
        }
        else {
            return Promise.resolve();
        }
    }
}
exports.PianoComponent = PianoComponent;
//# sourceMappingURL=Component.js.map