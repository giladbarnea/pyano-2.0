"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiS2V5YmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0tleWJlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErRDtBQUMvRCwyQ0FBNEU7QUFDNUUsNkNBQTZDO0FBQzdDLGlDQUFzQztBQU90QyxNQUFhLE1BQU8sU0FBUSwwQkFBYztJQVl6QyxZQUFZLE9BQXNCO1FBQ2pDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQU5mOztXQUVHO1FBQ0ssVUFBSyxHQUFZLEVBQUUsQ0FBQTtRQUsxQixLQUFLLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDeEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRywyQkFBYyxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ2pDO0lBQ0YsQ0FBQztJQUVTLGFBQWE7UUFDdEIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3hFLENBQUMsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLFFBQWdCO1FBQ2pELElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLHVCQUFnQixDQUFDO2dCQUNuQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO2dCQUMvQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87YUFDckIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDdkIsa0NBQWtDO1lBQ2xDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxHQUFHLFFBQVEsR0FBRyxvQkFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQzFFO0lBQ0YsQ0FBQztDQUNEO0FBcENELHdCQW9DQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEdhaW4sIFRvbmVBdWRpb0J1ZmZlcnMsIFRvbmVCdWZmZXJTb3VyY2UgfSBmcm9tICd0b25lJ1xuaW1wb3J0IHsgUGlhbm9Db21wb25lbnQsIFBpYW5vQ29tcG9uZW50T3B0aW9ucywgVXJsc01hcCB9IGZyb20gJy4vQ29tcG9uZW50J1xuaW1wb3J0IHsgZ2V0UmVsZWFzZXNVcmwgfSBmcm9tICcuL1NhbGFtYW5kZXInXG5pbXBvcnQgeyByYW5kb21CZXR3ZWVuIH0gZnJvbSAnLi9VdGlsJ1xuXG5pbnRlcmZhY2UgS2V5YmVkT3B0aW9ucyBleHRlbmRzIFBpYW5vQ29tcG9uZW50T3B0aW9ucyB7XG5cdG1pbk5vdGU6IG51bWJlclxuXHRtYXhOb3RlOiBudW1iZXJcbn1cblxuZXhwb3J0IGNsYXNzIEtleWJlZCBleHRlbmRzIFBpYW5vQ29tcG9uZW50IHtcblxuXHQvKipcblx0ICogQWxsIG9mIHRoZSBidWZmZXJzIG9mIGtleWJlZCBjbGlja3Ncblx0ICovXG5cdHByaXZhdGUgX2J1ZmZlcnM6IFRvbmVBdWRpb0J1ZmZlcnNcblxuXHQvKipcblx0ICogVGhlIHVybHMgdG8gbG9hZFxuXHQgKi9cblx0cHJpdmF0ZSBfdXJsczogVXJsc01hcCA9IHt9XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogS2V5YmVkT3B0aW9ucykge1xuXHRcdHN1cGVyKG9wdGlvbnMpXG5cblx0XHRmb3IgKGxldCBpID0gb3B0aW9ucy5taW5Ob3RlOyBpIDw9IG9wdGlvbnMubWF4Tm90ZTsgaSsrKSB7XG5cdFx0XHR0aGlzLl91cmxzW2ldID0gZ2V0UmVsZWFzZXNVcmwoaSlcblx0XHR9XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2ludGVybmFsTG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2Uoc3VjY2VzcyA9PiB7XG5cdFx0XHR0aGlzLl9idWZmZXJzID0gbmV3IFRvbmVBdWRpb0J1ZmZlcnModGhpcy5fdXJscywgc3VjY2VzcywgdGhpcy5zYW1wbGVzKVxuXHRcdH0pXG5cdH1cblxuXHRzdGFydChub3RlOiBudW1iZXIsIHRpbWU6IG51bWJlciwgdmVsb2NpdHk6IG51bWJlcik6IHZvaWQge1xuXHRcdGlmICh0aGlzLl9lbmFibGVkICYmIHRoaXMuX2J1ZmZlcnMuaGFzKG5vdGUpKSB7XG5cdFx0XHRjb25zdCBzb3VyY2UgPSBuZXcgVG9uZUJ1ZmZlclNvdXJjZSh7XG5cdFx0XHRcdGJ1ZmZlcjogdGhpcy5fYnVmZmVycy5nZXQobm90ZSksXG5cdFx0XHRcdGNvbnRleHQ6IHRoaXMuY29udGV4dCxcblx0XHRcdH0pLmNvbm5lY3QodGhpcy5vdXRwdXQpXG5cdFx0XHQvLyByYW5kb21pemUgdGhlIHZlbG9jaXR5IHNsaWdodGx5XG5cdFx0XHRzb3VyY2Uuc3RhcnQodGltZSwgMCwgdW5kZWZpbmVkLCAwLjAxNSAqIHZlbG9jaXR5ICogcmFuZG9tQmV0d2VlbigwLjUsIDEpKVxuXHRcdH1cblx0fVxufVxuIl19