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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFybW9uaWNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0hhcm1vbmljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUFvQztBQUNwQywyQ0FBNEU7QUFDNUUsNkNBQXFGO0FBQ3JGLGlDQUFzQztBQVF0QyxNQUFhLFNBQVUsU0FBUSwwQkFBYztJQU01QyxZQUFZLE9BQXlCO1FBRXBDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUVkLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO1FBQ2YsTUFBTSxLQUFLLEdBQUcsZ0NBQW1CLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDbkUsS0FBSyxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQUU7WUFDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyw0QkFBZSxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ2xDO0lBQ0YsQ0FBQztJQUVELGFBQWEsQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLFFBQWdCO1FBQ3pELElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSw2QkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsR0FBRyxvQkFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ3hGO0lBQ0YsQ0FBQztJQUVTLGFBQWE7UUFDdEIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksY0FBTyxDQUFDO2dCQUMzQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87Z0JBQ3JCLE1BQU07Z0JBQ04sSUFBSSxFQUFHLElBQUksQ0FBQyxLQUFLO2FBQ2pCLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3hCLENBQUMsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUNEO0FBaENELDhCQWdDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1pZGksIFNhbXBsZXIgfSBmcm9tICd0b25lJ1xuaW1wb3J0IHsgUGlhbm9Db21wb25lbnQsIFBpYW5vQ29tcG9uZW50T3B0aW9ucywgVXJsc01hcCB9IGZyb20gJy4vQ29tcG9uZW50J1xuaW1wb3J0IHsgZ2V0SGFybW9uaWNzSW5SYW5nZSwgZ2V0SGFybW9uaWNzVXJsLCBpbkhhcm1vbmljc1JhbmdlIH0gZnJvbSAnLi9TYWxhbWFuZGVyJ1xuaW1wb3J0IHsgcmFuZG9tQmV0d2VlbiB9IGZyb20gJy4vVXRpbCdcblxuaW50ZXJmYWNlIEhhcm1vbmljc09wdGlvbnMgZXh0ZW5kcyBQaWFub0NvbXBvbmVudE9wdGlvbnMge1xuXHRtaW5Ob3RlOiBudW1iZXJcblx0bWF4Tm90ZTogbnVtYmVyXG5cdHJlbGVhc2U6IGJvb2xlYW5cbn1cblxuZXhwb3J0IGNsYXNzIEhhcm1vbmljcyBleHRlbmRzIFBpYW5vQ29tcG9uZW50IHtcblxuXHRwcml2YXRlIF9zYW1wbGVyOiBTYW1wbGVyXG5cblx0cHJpdmF0ZSBfdXJsczogVXJsc01hcFxuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IEhhcm1vbmljc09wdGlvbnMpIHtcblxuXHRcdHN1cGVyKG9wdGlvbnMpXG5cblx0XHR0aGlzLl91cmxzID0ge31cblx0XHRjb25zdCBub3RlcyA9IGdldEhhcm1vbmljc0luUmFuZ2Uob3B0aW9ucy5taW5Ob3RlLCBvcHRpb25zLm1heE5vdGUpXG5cdFx0Zm9yIChjb25zdCBuIG9mIG5vdGVzKSB7XG5cdFx0XHR0aGlzLl91cmxzW25dID0gZ2V0SGFybW9uaWNzVXJsKG4pXG5cdFx0fVxuXHR9XG5cblx0dHJpZ2dlckF0dGFjayhub3RlOiBudW1iZXIsIHRpbWU6IG51bWJlciwgdmVsb2NpdHk6IG51bWJlcik6IHZvaWQge1xuXHRcdGlmICh0aGlzLl9lbmFibGVkICYmIGluSGFybW9uaWNzUmFuZ2Uobm90ZSkpIHtcblx0XHRcdHRoaXMuX3NhbXBsZXIudHJpZ2dlckF0dGFjayhNaWRpKG5vdGUpLnRvTm90ZSgpLCB0aW1lLCB2ZWxvY2l0eSAqIHJhbmRvbUJldHdlZW4oMC41LCAxKSlcblx0XHR9XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2ludGVybmFsTG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2Uob25sb2FkID0+IHtcblx0XHRcdHRoaXMuX3NhbXBsZXIgPSBuZXcgU2FtcGxlcih7XG5cdFx0XHRcdGJhc2VVcmw6IHRoaXMuc2FtcGxlcyxcblx0XHRcdFx0b25sb2FkLFxuXHRcdFx0XHR1cmxzIDogdGhpcy5fdXJscyxcblx0XHRcdH0pLmNvbm5lY3QodGhpcy5vdXRwdXQpXG5cdFx0fSlcblx0fVxufVxuIl19