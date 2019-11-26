"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
const Salamander_1 = require("./Salamander");
/**
 * A single velocity of strings
 */
class PianoString extends tone_1.ToneAudioNode {
    constructor(options) {
        super(options);
        this.name = 'PianoString';
        this._urls = {};
        // create the urls
        options.notes.forEach(note => this._urls[note] = Salamander_1.getNotesUrl(note, options.velocity));
        this.samples = options.samples;
    }
    load() {
        return new Promise(onload => {
            this._sampler = this.output = new tone_1.Sampler({
                attack: 0,
                baseUrl: this.samples,
                curve: 'exponential',
                onload,
                release: 0.4,
                urls: this._urls,
                volume: 3,
            });
        });
    }
    triggerAttack(note, time, velocity) {
        this._sampler.triggerAttack(note, time, velocity);
    }
    triggerRelease(note, time) {
        this._sampler.triggerRelease(note, time);
    }
}
exports.PianoString = PianoString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1N0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUE2QztBQUU3Qyw2Q0FBMEM7QUFPMUM7O0dBRUc7QUFDSCxNQUFhLFdBQVksU0FBUSxvQkFBYTtJQWE3QyxZQUFZLE9BQTJCO1FBQ3RDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQVpOLFNBQUksR0FBRyxhQUFhLENBQUE7UUFPckIsVUFBSyxHQUFZLEVBQUUsQ0FBQTtRQU8xQixrQkFBa0I7UUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLHdCQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO1FBRXJGLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQTtJQUMvQixDQUFDO0lBRUQsSUFBSTtRQUNILE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksY0FBTyxDQUFDO2dCQUN6QyxNQUFNLEVBQUcsQ0FBQztnQkFDVixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87Z0JBQ3JCLEtBQUssRUFBRyxhQUFhO2dCQUNyQixNQUFNO2dCQUNOLE9BQU8sRUFBRyxHQUFHO2dCQUNiLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSztnQkFDaEIsTUFBTSxFQUFHLENBQUM7YUFDVixDQUFDLENBQUE7UUFDSCxDQUFDLENBQUMsQ0FBQTtJQUNILENBQUM7SUFFRCxhQUFhLENBQUMsSUFBWSxFQUFFLElBQVksRUFBRSxRQUFnQjtRQUN6RCxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ2xELENBQUM7SUFFRCxjQUFjLENBQUMsSUFBWSxFQUFFLElBQVk7UUFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ3pDLENBQUM7Q0FDRDtBQTNDRCxrQ0EyQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTYW1wbGVyLCBUb25lQXVkaW9Ob2RlIH0gZnJvbSAndG9uZSdcbmltcG9ydCB7IFBpYW5vQ29tcG9uZW50T3B0aW9ucywgVXJsc01hcCB9IGZyb20gJy4vQ29tcG9uZW50J1xuaW1wb3J0IHsgZ2V0Tm90ZXNVcmwgfSBmcm9tICcuL1NhbGFtYW5kZXInXG5cbmludGVyZmFjZSBQaWFub1N0cmluZ09wdGlvbnMgZXh0ZW5kcyBQaWFub0NvbXBvbmVudE9wdGlvbnMge1xuXHRub3RlczogbnVtYmVyW11cblx0dmVsb2NpdHk6IG51bWJlclxufVxuXG4vKipcbiAqIEEgc2luZ2xlIHZlbG9jaXR5IG9mIHN0cmluZ3NcbiAqL1xuZXhwb3J0IGNsYXNzIFBpYW5vU3RyaW5nIGV4dGVuZHMgVG9uZUF1ZGlvTm9kZSB7XG5cblx0cmVhZG9ubHkgbmFtZSA9ICdQaWFub1N0cmluZydcblxuXHRwcml2YXRlIF9zYW1wbGVyOiBTYW1wbGVyXG5cblx0b3V0cHV0OiBTYW1wbGVyXG5cdGlucHV0OiB1bmRlZmluZWRcblxuXHRwcml2YXRlIF91cmxzOiBVcmxzTWFwID0ge31cblxuXHRyZWFkb25seSBzYW1wbGVzOiBzdHJpbmdcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBQaWFub1N0cmluZ09wdGlvbnMpIHtcblx0XHRzdXBlcihvcHRpb25zKVxuXG5cdFx0Ly8gY3JlYXRlIHRoZSB1cmxzXG5cdFx0b3B0aW9ucy5ub3Rlcy5mb3JFYWNoKG5vdGUgPT4gdGhpcy5fdXJsc1tub3RlXSA9IGdldE5vdGVzVXJsKG5vdGUsIG9wdGlvbnMudmVsb2NpdHkpKVxuXG5cdFx0dGhpcy5zYW1wbGVzID0gb3B0aW9ucy5zYW1wbGVzXG5cdH1cblxuXHRsb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZShvbmxvYWQgPT4ge1xuXHRcdFx0dGhpcy5fc2FtcGxlciA9IHRoaXMub3V0cHV0ID0gbmV3IFNhbXBsZXIoe1xuXHRcdFx0XHRhdHRhY2sgOiAwLFxuXHRcdFx0XHRiYXNlVXJsOiB0aGlzLnNhbXBsZXMsXG5cdFx0XHRcdGN1cnZlIDogJ2V4cG9uZW50aWFsJyxcblx0XHRcdFx0b25sb2FkLFxuXHRcdFx0XHRyZWxlYXNlIDogMC40LFxuXHRcdFx0XHR1cmxzOiB0aGlzLl91cmxzLFxuXHRcdFx0XHR2b2x1bWUgOiAzLFxuXHRcdFx0fSlcblx0XHR9KVxuXHR9XG5cblx0dHJpZ2dlckF0dGFjayhub3RlOiBzdHJpbmcsIHRpbWU6IG51bWJlciwgdmVsb2NpdHk6IG51bWJlcik6IHZvaWQge1xuXHRcdHRoaXMuX3NhbXBsZXIudHJpZ2dlckF0dGFjayhub3RlLCB0aW1lLCB2ZWxvY2l0eSlcblx0fVxuXG5cdHRyaWdnZXJSZWxlYXNlKG5vdGU6IHN0cmluZywgdGltZTogbnVtYmVyKTogdm9pZCB7XG5cdFx0dGhpcy5fc2FtcGxlci50cmlnZ2VyUmVsZWFzZShub3RlLCB0aW1lKVxuXHR9XG59XG4iXX0=