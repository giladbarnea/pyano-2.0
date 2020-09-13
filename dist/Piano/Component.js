Object.defineProperty(exports, "__esModule", { value: true });
//@ts-nocheck
const tone_1 = require("tone");
/**
 * Base class for the other components
 */
class PianoComponent extends tone_1.ToneAudioNode {
    constructor(options) {
        super(options);
        this.name = 'PianoComponent';
        this.input = undefined;
        this.output = new tone_1.Volume({ context: this.context });
        /**
         * If the component is enabled or not
         */
        this._enabled = false;
        /**
         * The volume output of the component
         */
        this.volume = this.output.volume;
        /**
         * Boolean indication of if the component is loaded or not
         */
        this._loaded = false;
        this.volume.value = options.volume;
        this._enabled = options.enabled;
        this.samples = options.samples;
    }
    /**
     * If the samples are loaded or not
     */
    get loaded() {
        return this._loaded;
    }
    /**
     * Load the samples
     */
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