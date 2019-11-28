"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFybW9uaWNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiSGFybW9uaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQW9DO0FBQ3BDLDJDQUE0RTtBQUM1RSw2Q0FBcUY7QUFDckYsaUNBQXNDO0FBUXRDLE1BQWEsU0FBVSxTQUFRLDBCQUFjO0lBTTVDLFlBQVksT0FBeUI7UUFFcEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBRWQsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUE7UUFDZixNQUFNLEtBQUssR0FBRyxnQ0FBbUIsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNuRSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRTtZQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLDRCQUFlLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDbEM7SUFDRixDQUFDO0lBRUQsYUFBYSxDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsUUFBZ0I7UUFDekQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLDZCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzVDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFdBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxHQUFHLG9CQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDeEY7SUFDRixDQUFDO0lBRVMsYUFBYTtRQUN0QixPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxjQUFPLENBQUM7Z0JBQzNCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztnQkFDckIsTUFBTTtnQkFDTixJQUFJLEVBQUcsSUFBSSxDQUFDLEtBQUs7YUFDakIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDeEIsQ0FBQyxDQUFDLENBQUE7SUFDSCxDQUFDO0NBQ0Q7QUFoQ0QsOEJBZ0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWlkaSwgU2FtcGxlciB9IGZyb20gJ3RvbmUnXG5pbXBvcnQgeyBQaWFub0NvbXBvbmVudCwgUGlhbm9Db21wb25lbnRPcHRpb25zLCBVcmxzTWFwIH0gZnJvbSAnLi9Db21wb25lbnQnXG5pbXBvcnQgeyBnZXRIYXJtb25pY3NJblJhbmdlLCBnZXRIYXJtb25pY3NVcmwsIGluSGFybW9uaWNzUmFuZ2UgfSBmcm9tICcuL1NhbGFtYW5kZXInXG5pbXBvcnQgeyByYW5kb21CZXR3ZWVuIH0gZnJvbSAnLi9VdGlsJ1xuXG5pbnRlcmZhY2UgSGFybW9uaWNzT3B0aW9ucyBleHRlbmRzIFBpYW5vQ29tcG9uZW50T3B0aW9ucyB7XG5cdG1pbk5vdGU6IG51bWJlclxuXHRtYXhOb3RlOiBudW1iZXJcblx0cmVsZWFzZTogYm9vbGVhblxufVxuXG5leHBvcnQgY2xhc3MgSGFybW9uaWNzIGV4dGVuZHMgUGlhbm9Db21wb25lbnQge1xuXG5cdHByaXZhdGUgX3NhbXBsZXI6IFNhbXBsZXJcblxuXHRwcml2YXRlIF91cmxzOiBVcmxzTWFwXG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSGFybW9uaWNzT3B0aW9ucykge1xuXG5cdFx0c3VwZXIob3B0aW9ucylcblxuXHRcdHRoaXMuX3VybHMgPSB7fVxuXHRcdGNvbnN0IG5vdGVzID0gZ2V0SGFybW9uaWNzSW5SYW5nZShvcHRpb25zLm1pbk5vdGUsIG9wdGlvbnMubWF4Tm90ZSlcblx0XHRmb3IgKGNvbnN0IG4gb2Ygbm90ZXMpIHtcblx0XHRcdHRoaXMuX3VybHNbbl0gPSBnZXRIYXJtb25pY3NVcmwobilcblx0XHR9XG5cdH1cblxuXHR0cmlnZ2VyQXR0YWNrKG5vdGU6IG51bWJlciwgdGltZTogbnVtYmVyLCB2ZWxvY2l0eTogbnVtYmVyKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuX2VuYWJsZWQgJiYgaW5IYXJtb25pY3NSYW5nZShub3RlKSkge1xuXHRcdFx0dGhpcy5fc2FtcGxlci50cmlnZ2VyQXR0YWNrKE1pZGkobm90ZSkudG9Ob3RlKCksIHRpbWUsIHZlbG9jaXR5ICogcmFuZG9tQmV0d2VlbigwLjUsIDEpKVxuXHRcdH1cblx0fVxuXG5cdHByb3RlY3RlZCBfaW50ZXJuYWxMb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZShvbmxvYWQgPT4ge1xuXHRcdFx0dGhpcy5fc2FtcGxlciA9IG5ldyBTYW1wbGVyKHtcblx0XHRcdFx0YmFzZVVybDogdGhpcy5zYW1wbGVzLFxuXHRcdFx0XHRvbmxvYWQsXG5cdFx0XHRcdHVybHMgOiB0aGlzLl91cmxzLFxuXHRcdFx0fSkuY29ubmVjdCh0aGlzLm91dHB1dClcblx0XHR9KVxuXHR9XG59XG4iXX0=