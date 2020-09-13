Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
const Component_1 = require("./Component");
const Util_1 = require("./Util");
class Pedal extends Component_1.PianoComponent {
    constructor(options) {
        super(options);
        this._downTime = Infinity;
        this._currentSound = null;
        this._downTime = Infinity;
    }
    _internalLoad() {
        return new Promise((success) => {
            this._buffers = new tone_1.ToneAudioBuffers({
                down1: 'pedalD1.mp3',
                down2: 'pedalD2.mp3',
                up1: 'pedalU1.mp3',
                up2: 'pedalU2.mp3',
            }, success, this.samples);
        });
    }
    /**
     *  Squash the current playing sound
     */
    _squash(time) {
        if (this._currentSound && this._currentSound.state !== 'stopped') {
            this._currentSound.stop(time);
        }
        this._currentSound = null;
    }
    _playSample(time, dir) {
        if (this._enabled) {
            this._currentSound = new tone_1.ToneBufferSource({
                buffer: this._buffers.get(`${dir}${Math.random() > 0.5 ? 1 : 2}`),
                context: this.context,
                curve: 'exponential',
                fadeIn: 0.05,
                fadeOut: 0.1,
            }).connect(this.output);
            this._currentSound.start(time, Util_1.randomBetween(0, 0.01), undefined, 0.1 * Util_1.randomBetween(0.5, 1));
        }
    }
    /**
     * Put the pedal down
     */
    down(time) {
        this._squash(time);
        this._downTime = time;
        this._playSample(time, 'down');
    }
    /**
     * Put the pedal up
     */
    up(time) {
        this._squash(time);
        this._downTime = Infinity;
        this._playSample(time, 'up');
    }
    /**
     * Indicates if the pedal is down at the given time
     */
    isDown(time) {
        return time > this._downTime;
    }
}
exports.Pedal = Pedal;
//# sourceMappingURL=Pedal.js.map