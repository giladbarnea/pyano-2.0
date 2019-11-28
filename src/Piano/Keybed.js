"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
const Component_1 = require("./Component");
const Salamander_1 = require("./Salamander");
const Util_1 = require("./Util");
class Keybed extends Component_1.PianoComponent {
    constructor(options) {
        super(options);
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
            source.start(time, 0, undefined, 0.015 * velocity * Util_1.randomBetween(0.5, 1));
        }
    }
}
exports.Keybed = Keybed;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiS2V5YmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiS2V5YmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQStEO0FBQy9ELDJDQUE0RTtBQUM1RSw2Q0FBNkM7QUFDN0MsaUNBQXNDO0FBT3RDLE1BQWEsTUFBTyxTQUFRLDBCQUFjO0lBWXpDLFlBQVksT0FBc0I7UUFDakMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBSFAsVUFBSyxHQUFZLEVBQUUsQ0FBQTtRQUsxQixLQUFLLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDeEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRywyQkFBYyxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ2pDO0lBQ0YsQ0FBQztJQUVTLGFBQWE7UUFDdEIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3hFLENBQUMsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLFFBQWdCO1FBQ2pELElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLHVCQUFnQixDQUFDO2dCQUNuQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO2dCQUMvQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87YUFDckIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7WUFFdkIsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEdBQUcsUUFBUSxHQUFHLG9CQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDMUU7SUFDRixDQUFDO0NBQ0Q7QUFwQ0Qsd0JBb0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgR2FpbiwgVG9uZUF1ZGlvQnVmZmVycywgVG9uZUJ1ZmZlclNvdXJjZSB9IGZyb20gJ3RvbmUnXG5pbXBvcnQgeyBQaWFub0NvbXBvbmVudCwgUGlhbm9Db21wb25lbnRPcHRpb25zLCBVcmxzTWFwIH0gZnJvbSAnLi9Db21wb25lbnQnXG5pbXBvcnQgeyBnZXRSZWxlYXNlc1VybCB9IGZyb20gJy4vU2FsYW1hbmRlcidcbmltcG9ydCB7IHJhbmRvbUJldHdlZW4gfSBmcm9tICcuL1V0aWwnXG5cbmludGVyZmFjZSBLZXliZWRPcHRpb25zIGV4dGVuZHMgUGlhbm9Db21wb25lbnRPcHRpb25zIHtcblx0bWluTm90ZTogbnVtYmVyXG5cdG1heE5vdGU6IG51bWJlclxufVxuXG5leHBvcnQgY2xhc3MgS2V5YmVkIGV4dGVuZHMgUGlhbm9Db21wb25lbnQge1xuXG5cdC8qKlxuXHQgKiBBbGwgb2YgdGhlIGJ1ZmZlcnMgb2Yga2V5YmVkIGNsaWNrc1xuXHQgKi9cblx0cHJpdmF0ZSBfYnVmZmVyczogVG9uZUF1ZGlvQnVmZmVyc1xuXG5cdC8qKlxuXHQgKiBUaGUgdXJscyB0byBsb2FkXG5cdCAqL1xuXHRwcml2YXRlIF91cmxzOiBVcmxzTWFwID0ge31cblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBLZXliZWRPcHRpb25zKSB7XG5cdFx0c3VwZXIob3B0aW9ucylcblxuXHRcdGZvciAobGV0IGkgPSBvcHRpb25zLm1pbk5vdGU7IGkgPD0gb3B0aW9ucy5tYXhOb3RlOyBpKyspIHtcblx0XHRcdHRoaXMuX3VybHNbaV0gPSBnZXRSZWxlYXNlc1VybChpKVxuXHRcdH1cblx0fVxuXG5cdHByb3RlY3RlZCBfaW50ZXJuYWxMb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZShzdWNjZXNzID0+IHtcblx0XHRcdHRoaXMuX2J1ZmZlcnMgPSBuZXcgVG9uZUF1ZGlvQnVmZmVycyh0aGlzLl91cmxzLCBzdWNjZXNzLCB0aGlzLnNhbXBsZXMpXG5cdFx0fSlcblx0fVxuXG5cdHN0YXJ0KG5vdGU6IG51bWJlciwgdGltZTogbnVtYmVyLCB2ZWxvY2l0eTogbnVtYmVyKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuX2VuYWJsZWQgJiYgdGhpcy5fYnVmZmVycy5oYXMobm90ZSkpIHtcblx0XHRcdGNvbnN0IHNvdXJjZSA9IG5ldyBUb25lQnVmZmVyU291cmNlKHtcblx0XHRcdFx0YnVmZmVyOiB0aGlzLl9idWZmZXJzLmdldChub3RlKSxcblx0XHRcdFx0Y29udGV4dDogdGhpcy5jb250ZXh0LFxuXHRcdFx0fSkuY29ubmVjdCh0aGlzLm91dHB1dClcblx0XHRcdC8vIHJhbmRvbWl6ZSB0aGUgdmVsb2NpdHkgc2xpZ2h0bHlcblx0XHRcdHNvdXJjZS5zdGFydCh0aW1lLCAwLCB1bmRlZmluZWQsIDAuMDE1ICogdmVsb2NpdHkgKiByYW5kb21CZXR3ZWVuKDAuNSwgMSkpXG5cdFx0fVxuXHR9XG59XG4iXX0=