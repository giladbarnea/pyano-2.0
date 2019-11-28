"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
const Salamander_1 = require("./Salamander");
class PianoString extends tone_1.ToneAudioNode {
    constructor(options) {
        super(options);
        this.name = 'PianoString';
        this._urls = {};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU3RyaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQTZDO0FBRTdDLDZDQUEwQztBQVUxQyxNQUFhLFdBQVksU0FBUSxvQkFBYTtJQWE3QyxZQUFZLE9BQTJCO1FBQ3RDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQVpOLFNBQUksR0FBRyxhQUFhLENBQUE7UUFPckIsVUFBSyxHQUFZLEVBQUUsQ0FBQTtRQVExQixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsd0JBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7UUFFckYsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFBO0lBQy9CLENBQUM7SUFFRCxJQUFJO1FBQ0gsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxjQUFPLENBQUM7Z0JBQ3pDLE1BQU0sRUFBRyxDQUFDO2dCQUNWLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztnQkFDckIsS0FBSyxFQUFHLGFBQWE7Z0JBQ3JCLE1BQU07Z0JBQ04sT0FBTyxFQUFHLEdBQUc7Z0JBQ2IsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNoQixNQUFNLEVBQUcsQ0FBQzthQUNWLENBQUMsQ0FBQTtRQUNILENBQUMsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztJQUVELGFBQWEsQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLFFBQWdCO1FBQ3pELElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDbEQsQ0FBQztJQUVELGNBQWMsQ0FBQyxJQUFZLEVBQUUsSUFBWTtRQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDekMsQ0FBQztDQUNEO0FBM0NELGtDQTJDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNhbXBsZXIsIFRvbmVBdWRpb05vZGUgfSBmcm9tICd0b25lJ1xuaW1wb3J0IHsgUGlhbm9Db21wb25lbnRPcHRpb25zLCBVcmxzTWFwIH0gZnJvbSAnLi9Db21wb25lbnQnXG5pbXBvcnQgeyBnZXROb3Rlc1VybCB9IGZyb20gJy4vU2FsYW1hbmRlcidcblxuaW50ZXJmYWNlIFBpYW5vU3RyaW5nT3B0aW9ucyBleHRlbmRzIFBpYW5vQ29tcG9uZW50T3B0aW9ucyB7XG5cdG5vdGVzOiBudW1iZXJbXVxuXHR2ZWxvY2l0eTogbnVtYmVyXG59XG5cbi8qKlxuICogQSBzaW5nbGUgdmVsb2NpdHkgb2Ygc3RyaW5nc1xuICovXG5leHBvcnQgY2xhc3MgUGlhbm9TdHJpbmcgZXh0ZW5kcyBUb25lQXVkaW9Ob2RlIHtcblxuXHRyZWFkb25seSBuYW1lID0gJ1BpYW5vU3RyaW5nJ1xuXG5cdHByaXZhdGUgX3NhbXBsZXI6IFNhbXBsZXJcblxuXHRvdXRwdXQ6IFNhbXBsZXJcblx0aW5wdXQ6IHVuZGVmaW5lZFxuXG5cdHByaXZhdGUgX3VybHM6IFVybHNNYXAgPSB7fVxuXG5cdHJlYWRvbmx5IHNhbXBsZXM6IHN0cmluZ1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IFBpYW5vU3RyaW5nT3B0aW9ucykge1xuXHRcdHN1cGVyKG9wdGlvbnMpXG5cblx0XHQvLyBjcmVhdGUgdGhlIHVybHNcblx0XHRvcHRpb25zLm5vdGVzLmZvckVhY2gobm90ZSA9PiB0aGlzLl91cmxzW25vdGVdID0gZ2V0Tm90ZXNVcmwobm90ZSwgb3B0aW9ucy52ZWxvY2l0eSkpXG5cblx0XHR0aGlzLnNhbXBsZXMgPSBvcHRpb25zLnNhbXBsZXNcblx0fVxuXG5cdGxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKG9ubG9hZCA9PiB7XG5cdFx0XHR0aGlzLl9zYW1wbGVyID0gdGhpcy5vdXRwdXQgPSBuZXcgU2FtcGxlcih7XG5cdFx0XHRcdGF0dGFjayA6IDAsXG5cdFx0XHRcdGJhc2VVcmw6IHRoaXMuc2FtcGxlcyxcblx0XHRcdFx0Y3VydmUgOiAnZXhwb25lbnRpYWwnLFxuXHRcdFx0XHRvbmxvYWQsXG5cdFx0XHRcdHJlbGVhc2UgOiAwLjQsXG5cdFx0XHRcdHVybHM6IHRoaXMuX3VybHMsXG5cdFx0XHRcdHZvbHVtZSA6IDMsXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH1cblxuXHR0cmlnZ2VyQXR0YWNrKG5vdGU6IHN0cmluZywgdGltZTogbnVtYmVyLCB2ZWxvY2l0eTogbnVtYmVyKTogdm9pZCB7XG5cdFx0dGhpcy5fc2FtcGxlci50cmlnZ2VyQXR0YWNrKG5vdGUsIHRpbWUsIHZlbG9jaXR5KVxuXHR9XG5cblx0dHJpZ2dlclJlbGVhc2Uobm90ZTogc3RyaW5nLCB0aW1lOiBudW1iZXIpOiB2b2lkIHtcblx0XHR0aGlzLl9zYW1wbGVyLnRyaWdnZXJSZWxlYXNlKG5vdGUsIHRpbWUpXG5cdH1cbn1cbiJdfQ==