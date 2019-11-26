"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVkYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvUGVkYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBeUQ7QUFDekQsMkNBQW1FO0FBQ25FLGlDQUFzQztBQUV0QyxNQUFhLEtBQU0sU0FBUSwwQkFBYztJQVF4QyxZQUFZLE9BQThCO1FBQ3pDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQVBQLGNBQVMsR0FBVyxRQUFRLENBQUE7UUFFNUIsa0JBQWEsR0FBcUIsSUFBSSxDQUFBO1FBTzdDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFBO0lBQzFCLENBQUM7SUFFUyxhQUFhO1FBQ3RCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUM5QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQWdCLENBQUM7Z0JBQ3BDLEtBQUssRUFBRyxhQUFhO2dCQUNyQixLQUFLLEVBQUcsYUFBYTtnQkFDckIsR0FBRyxFQUFHLGFBQWE7Z0JBQ25CLEdBQUcsRUFBRyxhQUFhO2FBQ25CLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUMxQixDQUFDLENBQUMsQ0FBQTtJQUNILENBQUM7SUFFRDs7T0FFRztJQUNLLE9BQU8sQ0FBQyxJQUFZO1FBQzNCLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7WUFDakUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDN0I7UUFDRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtJQUMxQixDQUFDO0lBRU8sV0FBVyxDQUFDLElBQVksRUFBRSxHQUFrQjtRQUNuRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDbEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLHVCQUFnQixDQUFDO2dCQUN6QyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDakUsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO2dCQUNyQixLQUFLLEVBQUUsYUFBYTtnQkFDcEIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osT0FBTyxFQUFHLEdBQUc7YUFDYixDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUN2QixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsb0JBQWEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLEdBQUcsR0FBRyxvQkFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQzlGO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSSxDQUFDLElBQVk7UUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtRQUNyQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUMvQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxFQUFFLENBQUMsSUFBWTtRQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUE7UUFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDN0IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTSxDQUFDLElBQVk7UUFDbEIsT0FBTyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQTtJQUM3QixDQUFDO0NBQ0Q7QUF4RUQsc0JBd0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVG9uZUF1ZGlvQnVmZmVycywgVG9uZUJ1ZmZlclNvdXJjZSB9IGZyb20gJ3RvbmUnXG5pbXBvcnQgeyBQaWFub0NvbXBvbmVudCwgUGlhbm9Db21wb25lbnRPcHRpb25zIH0gZnJvbSAnLi9Db21wb25lbnQnXG5pbXBvcnQgeyByYW5kb21CZXR3ZWVuIH0gZnJvbSAnLi9VdGlsJ1xuXG5leHBvcnQgY2xhc3MgUGVkYWwgZXh0ZW5kcyBQaWFub0NvbXBvbmVudCB7XG5cblx0cHJpdmF0ZSBfZG93blRpbWU6IG51bWJlciA9IEluZmluaXR5XG5cblx0cHJpdmF0ZSBfY3VycmVudFNvdW5kOiBUb25lQnVmZmVyU291cmNlID0gbnVsbFxuXG5cdHByaXZhdGUgX2J1ZmZlcnM6IFRvbmVBdWRpb0J1ZmZlcnNcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBQaWFub0NvbXBvbmVudE9wdGlvbnMpIHtcblx0XHRzdXBlcihvcHRpb25zKVxuXG5cdFx0dGhpcy5fZG93blRpbWUgPSBJbmZpbml0eVxuXHR9XG5cblx0cHJvdGVjdGVkIF9pbnRlcm5hbExvYWQoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChzdWNjZXNzKSA9PiB7XG5cdFx0XHR0aGlzLl9idWZmZXJzID0gbmV3IFRvbmVBdWRpb0J1ZmZlcnMoe1xuXHRcdFx0XHRkb3duMSA6ICdwZWRhbEQxLm1wMycsXG5cdFx0XHRcdGRvd24yIDogJ3BlZGFsRDIubXAzJyxcblx0XHRcdFx0dXAxIDogJ3BlZGFsVTEubXAzJyxcblx0XHRcdFx0dXAyIDogJ3BlZGFsVTIubXAzJyxcblx0XHRcdH0sIHN1Y2Nlc3MsIHRoaXMuc2FtcGxlcylcblx0XHR9KVxuXHR9XG5cblx0LyoqXG5cdCAqICBTcXVhc2ggdGhlIGN1cnJlbnQgcGxheWluZyBzb3VuZFxuXHQgKi9cblx0cHJpdmF0ZSBfc3F1YXNoKHRpbWU6IG51bWJlcik6IHZvaWQge1xuXHRcdGlmICh0aGlzLl9jdXJyZW50U291bmQgJiYgdGhpcy5fY3VycmVudFNvdW5kLnN0YXRlICE9PSAnc3RvcHBlZCcpIHtcblx0XHRcdHRoaXMuX2N1cnJlbnRTb3VuZC5zdG9wKHRpbWUpXG5cdFx0fVxuXHRcdHRoaXMuX2N1cnJlbnRTb3VuZCA9IG51bGxcblx0fVxuXG5cdHByaXZhdGUgX3BsYXlTYW1wbGUodGltZTogbnVtYmVyLCBkaXI6ICdkb3duJyB8ICd1cCcpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5fZW5hYmxlZCkge1xuXHRcdFx0dGhpcy5fY3VycmVudFNvdW5kID0gbmV3IFRvbmVCdWZmZXJTb3VyY2Uoe1xuXHRcdFx0XHRidWZmZXI6IHRoaXMuX2J1ZmZlcnMuZ2V0KGAke2Rpcn0ke01hdGgucmFuZG9tKCkgPiAwLjUgPyAxIDogMn1gKSxcblx0XHRcdFx0Y29udGV4dDogdGhpcy5jb250ZXh0LFxuXHRcdFx0XHRjdXJ2ZTogJ2V4cG9uZW50aWFsJyxcblx0XHRcdFx0ZmFkZUluOiAwLjA1LFxuXHRcdFx0XHRmYWRlT3V0IDogMC4xLFxuXHRcdFx0fSkuY29ubmVjdCh0aGlzLm91dHB1dClcblx0XHRcdHRoaXMuX2N1cnJlbnRTb3VuZC5zdGFydCh0aW1lLCByYW5kb21CZXR3ZWVuKDAsIDAuMDEpLCB1bmRlZmluZWQsIDAuMSAqIHJhbmRvbUJldHdlZW4oMC41LCAxKSlcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUHV0IHRoZSBwZWRhbCBkb3duXG5cdCAqL1xuXHRkb3duKHRpbWU6IG51bWJlcik6IHZvaWQge1xuXHRcdHRoaXMuX3NxdWFzaCh0aW1lKVxuXHRcdHRoaXMuX2Rvd25UaW1lID0gdGltZVxuXHRcdHRoaXMuX3BsYXlTYW1wbGUodGltZSwgJ2Rvd24nKVxuXHR9XG5cblx0LyoqXG5cdCAqIFB1dCB0aGUgcGVkYWwgdXBcblx0ICovXG5cdHVwKHRpbWU6IG51bWJlcik6IHZvaWQge1xuXHRcdHRoaXMuX3NxdWFzaCh0aW1lKVxuXHRcdHRoaXMuX2Rvd25UaW1lID0gSW5maW5pdHlcblx0XHR0aGlzLl9wbGF5U2FtcGxlKHRpbWUsICd1cCcpXG5cdH1cblxuXHQvKipcblx0ICogSW5kaWNhdGVzIGlmIHRoZSBwZWRhbCBpcyBkb3duIGF0IHRoZSBnaXZlbiB0aW1lXG5cdCAqL1xuXHRpc0Rvd24odGltZTogbnVtYmVyKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRpbWUgPiB0aGlzLl9kb3duVGltZVxuXHR9XG59XG4iXX0=