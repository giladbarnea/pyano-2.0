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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFybW9uaWNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiSGFybW9uaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQW9DO0FBQ3BDLDJDQUE0RTtBQUM1RSw2Q0FBcUY7QUFDckYsaUNBQXNDO0FBUXRDLE1BQWEsU0FBVSxTQUFRLDBCQUFjO0lBTTVDLFlBQVksT0FBeUI7UUFFcEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWYsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDaEIsTUFBTSxLQUFLLEdBQUcsZ0NBQW1CLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEUsS0FBSyxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQUU7WUFDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyw0QkFBZSxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ2xDO0lBQ0YsQ0FBQztJQUVELGFBQWEsQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLFFBQWdCO1FBQ3pELElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSw2QkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsR0FBRyxvQkFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ3hGO0lBQ0YsQ0FBQztJQUVTLGFBQWE7UUFDdEIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksY0FBTyxDQUFDO2dCQUMzQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87Z0JBQ3JCLE1BQU07Z0JBQ04sSUFBSSxFQUFHLElBQUksQ0FBQyxLQUFLO2FBQ2pCLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3hCLENBQUMsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUNEO0FBaENELDhCQWdDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1pZGksIFNhbXBsZXIgfSBmcm9tICd0b25lJ1xuaW1wb3J0IHsgUGlhbm9Db21wb25lbnQsIFBpYW5vQ29tcG9uZW50T3B0aW9ucywgVXJsc01hcCB9IGZyb20gJy4vQ29tcG9uZW50J1xuaW1wb3J0IHsgZ2V0SGFybW9uaWNzSW5SYW5nZSwgZ2V0SGFybW9uaWNzVXJsLCBpbkhhcm1vbmljc1JhbmdlIH0gZnJvbSAnLi9TYWxhbWFuZGVyJ1xuaW1wb3J0IHsgcmFuZG9tQmV0d2VlbiB9IGZyb20gJy4vVXRpbCdcblxuaW50ZXJmYWNlIEhhcm1vbmljc09wdGlvbnMgZXh0ZW5kcyBQaWFub0NvbXBvbmVudE9wdGlvbnMge1xuXHRtaW5Ob3RlOiBudW1iZXJcblx0bWF4Tm90ZTogbnVtYmVyXG5cdHJlbGVhc2U6IGJvb2xlYW5cbn1cblxuZXhwb3J0IGNsYXNzIEhhcm1vbmljcyBleHRlbmRzIFBpYW5vQ29tcG9uZW50IHtcblxuXHRwcml2YXRlIF9zYW1wbGVyOiBTYW1wbGVyO1xuXG5cdHByaXZhdGUgX3VybHM6IFVybHNNYXA7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSGFybW9uaWNzT3B0aW9ucykge1xuXG5cdFx0c3VwZXIob3B0aW9ucyk7XG5cblx0XHR0aGlzLl91cmxzID0ge307XG5cdFx0Y29uc3Qgbm90ZXMgPSBnZXRIYXJtb25pY3NJblJhbmdlKG9wdGlvbnMubWluTm90ZSwgb3B0aW9ucy5tYXhOb3RlKTtcblx0XHRmb3IgKGNvbnN0IG4gb2Ygbm90ZXMpIHtcblx0XHRcdHRoaXMuX3VybHNbbl0gPSBnZXRIYXJtb25pY3NVcmwobilcblx0XHR9XG5cdH1cblxuXHR0cmlnZ2VyQXR0YWNrKG5vdGU6IG51bWJlciwgdGltZTogbnVtYmVyLCB2ZWxvY2l0eTogbnVtYmVyKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuX2VuYWJsZWQgJiYgaW5IYXJtb25pY3NSYW5nZShub3RlKSkge1xuXHRcdFx0dGhpcy5fc2FtcGxlci50cmlnZ2VyQXR0YWNrKE1pZGkobm90ZSkudG9Ob3RlKCksIHRpbWUsIHZlbG9jaXR5ICogcmFuZG9tQmV0d2VlbigwLjUsIDEpKVxuXHRcdH1cblx0fVxuXG5cdHByb3RlY3RlZCBfaW50ZXJuYWxMb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZShvbmxvYWQgPT4ge1xuXHRcdFx0dGhpcy5fc2FtcGxlciA9IG5ldyBTYW1wbGVyKHtcblx0XHRcdFx0YmFzZVVybDogdGhpcy5zYW1wbGVzLFxuXHRcdFx0XHRvbmxvYWQsXG5cdFx0XHRcdHVybHMgOiB0aGlzLl91cmxzLFxuXHRcdFx0fSkuY29ubmVjdCh0aGlzLm91dHB1dClcblx0XHR9KVxuXHR9XG59XG4iXX0=