"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
const Harmonics_1 = require("./Harmonics");
const Keybed_1 = require("./Keybed");
const Pedal_1 = require("./Pedal");
const Strings_1 = require("./Strings");
class Piano extends tone_1.ToneAudioNode {
    constructor() {
        super(tone_1.optionsFromArguments(Piano.getDefaults(), arguments));
        this.name = 'Piano';
        this.input = undefined;
        this.output = new tone_1.Gain({ context: this.context });
        this._heldNotes = new Map();
        this._loaded = false;
        const options = tone_1.optionsFromArguments(Piano.getDefaults(), arguments);
        this._heldNotes = new Map();
        this._sustainedNotes = new Map();
        this._strings = new Strings_1.PianoStrings(Object.assign({}, options, {
            enabled: true,
            volume: options.volume.strings,
        })).connect(this.output);
        this.strings = this._strings.volume;
        this._pedal = new Pedal_1.Pedal(Object.assign({}, options, {
            enabled: options.pedal,
            volume: options.volume.pedal,
        })).connect(this.output);
        this.pedal = this._pedal.volume;
        this._keybed = new Keybed_1.Keybed(Object.assign({}, options, {
            enabled: options.release,
            volume: options.volume.keybed,
        })).connect(this.output);
        this.keybed = this._keybed.volume;
        this._harmonics = new Harmonics_1.Harmonics(Object.assign({}, options, {
            enabled: options.release,
            volume: options.volume.harmonics,
        })).connect(this.output);
        this.harmonics = this._harmonics.volume;
    }
    static getDefaults() {
        return Object.assign(tone_1.ToneAudioNode.getDefaults(), {
            maxNote: 108,
            minNote: 21,
            pedal: true,
            release: false,
            samples: './audio/',
            velocities: 1,
            volume: {
                harmonics: 0,
                keybed: 0,
                pedal: 0,
                strings: 0,
            },
        });
    }
    async load() {
        await Promise.all([
            this._strings.load(),
            this._pedal.load(),
            this._keybed.load(),
            this._harmonics.load(),
        ]);
        this._loaded = true;
    }
    get loaded() {
        return this._loaded;
    }
    pedalDown(time) {
        if (this.loaded) {
            time = this.toSeconds(time);
            if (!this._pedal.isDown(time)) {
                this._pedal.down(time);
            }
        }
        return this;
    }
    pedalUp(time) {
        if (this.loaded) {
            const seconds = this.toSeconds(time);
            if (this._pedal.isDown(seconds)) {
                this._pedal.up(seconds);
                this._sustainedNotes.forEach((t, note) => {
                    if (!this._heldNotes.has(note)) {
                        this._strings.triggerRelease(note, seconds);
                    }
                });
                this._sustainedNotes.clear();
            }
        }
        return this;
    }
    keyDown(note, time = this.immediate(), velocity = 0.8) {
        if (this.loaded) {
            time = this.toSeconds(time);
            if (tone_1.isString(note)) {
                note = Math.round(tone_1.Midi(note).toMidi());
            }
            if (!this._heldNotes.has(note)) {
                this._heldNotes.set(note, { time, velocity });
                this._strings.triggerAttack(note, time, velocity);
            }
        }
        return this;
    }
    keyUp(note, time = this.immediate(), velocity = 0.8) {
        if (this.loaded) {
            time = this.toSeconds(time);
            if (tone_1.isString(note)) {
                note = Math.round(tone_1.Midi(note).toMidi());
            }
            if (this._heldNotes.has(note)) {
                const prevNote = this._heldNotes.get(note);
                this._heldNotes.delete(note);
                const holdTime = Math.pow(Math.max(time - prevNote.time, 0.1), 0.7);
                const prevVel = prevNote.velocity;
                let dampenGain = (3 / holdTime) * prevVel * velocity;
                dampenGain = Math.max(dampenGain, 0.4);
                dampenGain = Math.min(dampenGain, 4);
                if (this._pedal.isDown(time)) {
                    if (!this._sustainedNotes.has(note)) {
                        this._sustainedNotes.set(note, time);
                    }
                }
                else {
                    this._strings.triggerRelease(note, time);
                    this._harmonics.triggerAttack(note, time, dampenGain);
                }
                this._keybed.start(note, time, velocity);
            }
        }
        return this;
    }
    stopAll() {
        this.pedalUp();
        this._heldNotes.forEach((value, note) => {
            this.keyUp(note);
        });
        return this;
    }
}
exports.Piano = Piano;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGlhbm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQaWFuby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtCQUlhO0FBQ2IsMkNBQXVDO0FBQ3ZDLHFDQUFpQztBQUNqQyxtQ0FBK0I7QUFDL0IsdUNBQXdDO0FBOEN4QyxNQUFhLEtBQU0sU0FBUSxvQkFBMkI7SUE4RGxEO1FBQ0ksS0FBSyxDQUFDLDJCQUFvQixDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBN0R2RCxTQUFJLEdBQUcsT0FBTyxDQUFDO1FBQ2YsVUFBSyxHQUFHLFNBQVMsQ0FBQztRQUNsQixXQUFNLEdBQUcsSUFBSSxXQUFJLENBQUMsRUFBRSxPQUFPLEVBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFrRC9DLGVBQVUsR0FBa0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUt0QyxZQUFPLEdBQVksS0FBSyxDQUFDO1FBTTdCLE1BQU0sT0FBTyxHQUFHLDJCQUFvQixDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUVyRSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFFNUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRWpDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxzQkFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRTtZQUN4RCxPQUFPLEVBQUcsSUFBSTtZQUNkLE1BQU0sRUFBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU87U0FDbEMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBRXBDLElBQUksQ0FBQyxNQUFNLEdB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SyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFHO3dCQUNuQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7cUJBQ3ZDO2lCQUNKO3FCQUFNO29CQUVILElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFFekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQTtpQkFDeEQ7Z0JBR0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTthQUMzQztTQUNKO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBRUQsT0FBTztRQUNILElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDcEIsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7Q0FDSjtBQXBQRCxzQkFvUEMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtbm9jaGVja1xuaW1wb3J0IHtcbiAgICBDb250ZXh0LCBHYWluLCBpc1N0cmluZyxcbiAgICBNaWRpLCBvcHRpb25zRnJvbUFyZ3VtZW50cywgUGFyYW0sXG4gICAgVG9uZUF1ZGlvTm9kZSwgVW5pdFxufSBmcm9tICd0b25lJ1xuaW1wb3J0IHsgSGFybW9uaWNzIH0gZnJvbSAnLi9IYXJtb25pY3MnXG5pbXBvcnQgeyBLZXliZWQgfSBmcm9tICcuL0tleWJlZCdcbmltcG9ydCB7IFBlZGFsIH0gZnJvbSAnLi9QZWRhbCdcbmltcG9ydCB7IFBpYW5vU3RyaW5ncyB9IGZyb20gJy4vU3RyaW5ncydcblxuZXhwb3J0IGludGVyZmFjZSBQaWFub09wdGlvbnMge1xuICAgIC8qKlxuICAgICAqIFRoZSBhdWRpbyBjb250ZXh0LiBEZWZhdWx0cyB0byB0aGUgZ2xvYmFsIFRvbmUgYXVkaW8gY29udGV4dFxuICAgICAqL1xuICAgIGNvbnRleHQ6IENvbnRleHRcbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIHZlbG9jaXR5IHN0ZXBzIHRvIGxvYWRcbiAgICAgKi9cbiAgICB2ZWxvY2l0aWVzOiBudW1iZXIsXG4gICAgLyoqXG4gICAgICogVGhlIGxvd2VzdCBub3RlIHRvIGxvYWRcbiAgICAgKi9cbiAgICBtaW5Ob3RlOiBudW1iZXIsXG4gICAgLyoqXG4gICAgICogVGhlIGhpZ2hlc3Qgbm90ZSB0byBsb2FkXG4gICAgICovXG4gICAgbWF4Tm90ZTogbnVtYmVyLFxuICAgIC8qKlxuICAgICAqIElmIGl0IHNob3VsZCBpbmNsdWRlIGEgJ3JlbGVhc2UnIHNvdW5kcyBjb21wb3NlZCBvZiBhIGtleWNsaWNrIGFuZCBzdHJpbmcgaGFybW9uaWNcbiAgICAgKi9cbiAgICByZWxlYXNlOiBib29sZWFuLFxuICAgIC8qKlxuICAgICAqIElmIHRoZSBwaWFubyBzaG91bGQgaW5jbHVkZSBhICdwZWRhbCcgc291bmQuXG4gICAgICovXG4gICAgcGVkYWw6IGJvb2xlYW4sXG4gICAgLyoqXG4gICAgICogVGhlIGRpcmVjdG9yeSBvZiB0aGUgc2FsYW1hbmRlciBncmFuZCBwaWFubyBzYW1wbGVzXG4gICAgICovXG4gICAgc2FtcGxlczogc3RyaW5nLFxuICAgIFxuICAgIC8qKlxuICAgICAqIFZvbHVtZSBsZXZlbHRzIGZvciBlYWNoIG9mIHRoZSBjb21wb25lbnRzIChpbiBkZWNpYmVscylcbiAgICAgKi9cbiAgICB2b2x1bWU6IHtcbiAgICAgICAgcGVkYWw6IG51bWJlcixcbiAgICAgICAgc3RyaW5nczogbnVtYmVyLFxuICAgICAgICBrZXliZWQ6IG51bWJlcixcbiAgICAgICAgaGFybW9uaWNzOiBudW1iZXIsXG4gICAgfVxufVxuXG4vKipcbiAqICBUaGUgUGlhbm9cbiAqL1xuZXhwb3J0IGNsYXNzIFBpYW5vIGV4dGVuZHMgVG9uZUF1ZGlvTm9kZTxQaWFub09wdGlvbnM+IHtcbiAgICBcbiAgICByZWFkb25seSBuYW1lID0gJ1BpYW5vJztcbiAgICByZWFkb25seSBpbnB1dCA9IHVuZGVmaW5lZDtcbiAgICByZWFkb25seSBvdXRwdXQgPSBuZXcgR2Fpbih7IGNvbnRleHQgOiB0aGlzLmNvbnRleHQgfSk7XG4gICAgXG4gICAgLyoqXG4gICAgICogVGhlIHN0cmluZyBoYXJtb25pY3NcbiAgICAgKi9cbiAgICBwcml2YXRlIF9oYXJtb25pY3M6IEhhcm1vbmljcztcbiAgICBcbiAgICAvKipcbiAgICAgKiBUaGUga2V5YmVkIHJlbGVhc2Ugc291bmRcbiAgICAgKi9cbiAgICBwcml2YXRlIF9rZXliZWQ6IEtleWJlZDtcbiAgICBcbiAgICAvKipcbiAgICAgKiBUaGUgcGVkYWxcbiAgICAgKi9cbiAgICBwcml2YXRlIF9wZWRhbDogUGVkYWw7XG4gICAgXG4gICAgLyoqXG4gICAgICogVGhlIHN0cmluZ3NcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zdHJpbmdzOiBQaWFub1N0cmluZ3M7XG4gICAgXG4gICAgLyoqXG4gICAgICogVGhlIHZvbHVtZSBsZXZlbCBvZiB0aGUgc3RyaW5ncyBvdXRwdXQuIFRoaXMgaXMgdGhlIG1haW4gcGlhbm8gc291bmQuXG4gICAgICovXG4gICAgc3RyaW5nczogUGFyYW08VW5pdC5EZWNpYmVscz47XG4gICAgXG4gICAgLyoqXG4gICAgICogVGhlIHZvbHVtZSBvdXRwdXQgb2YgdGhlIHBlZGFsIHVwIGFuZCBkb3duIHNvdW5kc1xuICAgICAqL1xuICAgIHBlZGFsOiBQYXJhbTxVbml0LkRlY2liZWxzPjtcbiAgICBcbiAgICAvKipcbiAgICAgKiBUaGUgdm9sdW1lIG9mIHRoZSBzdHJpbmcgaGFybW9uaWNzXG4gICAgICovXG4gICAgaGFybW9uaWNzOiBQYXJhbTxVbml0LkRlY2liZWxzPjtcbiAgICBcbiAgICAvKipcbiAgICAgKiBUaGUgdm9sdW1lIG9mIHRoZSBrZXliZWQgY2xpY2sgc291bmRcbiAgICAgKi9cbiAgICBrZXliZWQ6IFBhcmFtPFVuaXQuRGVjaWJlbHM+O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFRoZSBzdXN0YWluZWQgbm90ZXNcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zdXN0YWluZWROb3RlczogTWFwPGFueSwgYW55PjtcbiAgICBcbiAgICAvKipcbiAgICAgKiBUaGUgY3VycmVudGx5IGhlbGQgbm90ZXNcbiAgICAgKi9cbiAgICBwcml2YXRlIF9oZWxkTm90ZXM6IE1hcDxhbnksIGFueT4gPSBuZXcgTWFwKCk7XG4gICAgXG4gICAgLyoqXG4gICAgICogSWYgaXQncyBsb2FkZWQgb3Igbm90XG4gICAgICovXG4gICAgcHJpdmF0ZSBfbG9hZGVkOiBib29sZWFuID0gZmFsc2U7XG4gICAgXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucz86IFBhcnRpYWw8UGlhbm9PcHRpb25zPik7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKG9wdGlvbnNGcm9tQXJndW1lbnRzKFBpYW5vLmdldERlZmF1bHRzKCksIGFyZ3VtZW50cykpO1xuICAgICAgICBcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbnNGcm9tQXJndW1lbnRzKFBpYW5vLmdldERlZmF1bHRzKCksIGFyZ3VtZW50cyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9oZWxkTm90ZXMgPSBuZXcgTWFwKCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9zdXN0YWluZWROb3RlcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX3N0cmluZ3MgPSBuZXcgUGlhbm9TdHJpbmdzKE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMsIHtcbiAgICAgICAgICAgIGVuYWJsZWQgOiB0cnVlLFxuICAgICAgICAgICAgdm9sdW1lIDogb3B0aW9ucy52b2x1bWUuc3RyaW5ncyxcbiAgICAgICAgfSkpLmNvbm5lY3QodGhpcy5vdXRwdXQpO1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSB0aGlzLl9zdHJpbmdzLnZvbHVtZTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX3BlZGFsID0gbmV3IFBlZGFsKE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMsIHtcbiAgICAgICAgICAgIGVuYWJsZWQgOiBvcHRpb25zLnBlZGFsLFxuICAgICAgICAgICAgdm9sdW1lIDogb3B0aW9ucy52b2x1bWUucGVkYWwsXG4gICAgICAgIH0pKS5jb25uZWN0KHRoaXMub3V0cHV0KTtcbiAgICAgICAgdGhpcy5wZWRhbCA9IHRoaXMuX3BlZGFsLnZvbHVtZTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2tleWJlZCA9IG5ldyBLZXliZWQoT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucywge1xuICAgICAgICAgICAgZW5hYmxlZCA6IG9wdGlvbnMucmVsZWFzZSxcbiAgICAgICAgICAgIHZvbHVtZSA6IG9wdGlvbnMudm9sdW1lLmtleWJlZCxcbiAgICAgICAgfSkpLmNvbm5lY3QodGhpcy5vdXRwdXQpO1xuICAgICAgICB0aGlzLmtleWJlZCA9IHRoaXMuX2tleWJlZC52b2x1bWU7XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9oYXJtb25pY3MgPSBuZXcgSGFybW9uaWNzKE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMsIHtcbiAgICAgICAgICAgIGVuYWJsZWQgOiBvcHRpb25zLnJlbGVhc2UsXG4gICAgICAgICAgICB2b2x1bWUgOiBvcHRpb25zLnZvbHVtZS5oYXJtb25pY3MsXG4gICAgICAgIH0pKS5jb25uZWN0KHRoaXMub3V0cHV0KTtcbiAgICAgICAgdGhpcy5oYXJtb25pY3MgPSB0aGlzLl9oYXJtb25pY3Mudm9sdW1lXG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBnZXREZWZhdWx0cygpOiBQaWFub09wdGlvbnMge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihUb25lQXVkaW9Ob2RlLmdldERlZmF1bHRzKCksIHtcbiAgICAgICAgICAgIG1heE5vdGUgOiAxMDgsXG4gICAgICAgICAgICBtaW5Ob3RlIDogMjEsXG4gICAgICAgICAgICBwZWRhbCA6IHRydWUsXG4gICAgICAgICAgICByZWxlYXNlIDogZmFsc2UsXG4gICAgICAgICAgICBzYW1wbGVzIDogJy4vYXVkaW8vJyxcbiAgICAgICAgICAgIHZlbG9jaXRpZXMgOiAxLFxuICAgICAgICAgICAgdm9sdW1lIDoge1xuICAgICAgICAgICAgICAgIGhhcm1vbmljcyA6IDAsXG4gICAgICAgICAgICAgICAga2V5YmVkIDogMCxcbiAgICAgICAgICAgICAgICBwZWRhbCA6IDAsXG4gICAgICAgICAgICAgICAgc3RyaW5ncyA6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiAgTG9hZCBhbGwgdGhlIHNhbXBsZXNcbiAgICAgKi9cbiAgICBhc3luYyBsb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICB0aGlzLl9zdHJpbmdzLmxvYWQoKSxcbiAgICAgICAgICAgIHRoaXMuX3BlZGFsLmxvYWQoKSxcbiAgICAgICAgICAgIHRoaXMuX2tleWJlZC5sb2FkKCksXG4gICAgICAgICAgICB0aGlzLl9oYXJtb25pY3MubG9hZCgpLFxuICAgICAgICBdKTtcbiAgICAgICAgdGhpcy5fbG9hZGVkID0gdHJ1ZVxuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBJZiBhbGwgdGhlIHNhbXBsZXMgYXJlIGxvYWRlZCBvciBub3RcbiAgICAgKi9cbiAgICBnZXQgbG9hZGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fbG9hZGVkXG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqICBQdXQgdGhlIHBlZGFsIGRvd24gYXQgdGhlIGdpdmVuIHRpbWUuIENhdXNlcyBzdWJzZXF1ZW50XG4gICAgICogIG5vdGVzIGFuZCBjdXJyZW50bHkgaGVsZCBub3RlcyB0byBzdXN0YWluLlxuICAgICAqICBAcGFyYW0gdGltZSAgVGhlIHRpbWUgdGhlIHBlZGFsIHNob3VsZCBnbyBkb3duXG4gICAgICovXG4gICAgcGVkYWxEb3duKHRpbWU/OiBVbml0LlRpbWUpOiB0aGlzIHtcbiAgICAgICAgXG4gICAgICAgIGlmICggdGhpcy5sb2FkZWQgKSB7XG4gICAgICAgICAgICB0aW1lID0gdGhpcy50b1NlY29uZHModGltZSk7XG4gICAgICAgICAgICBpZiAoICF0aGlzLl9wZWRhbC5pc0Rvd24odGltZSkgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGVkYWwuZG93bih0aW1lKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqICBQdXQgdGhlIHBlZGFsIHVwLiBEYW1wZW5zIHN1c3RhaW5lZCBub3Rlc1xuICAgICAqICBAcGFyYW0gdGltZSAgVGhlIHRpbWUgdGhlIHBlZGFsIHNob3VsZCBnbyB1cFxuICAgICAqL1xuICAgIHBlZGFsVXAodGltZT86IFVuaXQuVGltZSk6IHRoaXMge1xuICAgICAgICBcbiAgICAgICAgaWYgKCB0aGlzLmxvYWRlZCApIHtcbiAgICAgICAgICAgIGNvbnN0IHNlY29uZHMgPSB0aGlzLnRvU2Vjb25kcyh0aW1lKTtcbiAgICAgICAgICAgIGlmICggdGhpcy5fcGVkYWwuaXNEb3duKHNlY29uZHMpICkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3BlZGFsLnVwKHNlY29uZHMpO1xuICAgICAgICAgICAgICAgIC8vIGRhbXBlbiBlYWNoIG9mIHRoZSBub3Rlc1xuICAgICAgICAgICAgICAgIHRoaXMuX3N1c3RhaW5lZE5vdGVzLmZvckVhY2goKHQsIG5vdGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCAhdGhpcy5faGVsZE5vdGVzLmhhcyhub3RlKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3N0cmluZ3MudHJpZ2dlclJlbGVhc2Uobm90ZSwgc2Vjb25kcylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N1c3RhaW5lZE5vdGVzLmNsZWFyKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiAgUGxheSBhIG5vdGUuXG4gICAgICogIEBwYXJhbSBub3RlICAgICAgVGhlIG5vdGUgdG8gcGxheS4gSWYgaXQgaXMgYSBudW1iZXIsIGl0IGlzIGFzc3VtZWQgdG8gYmUgTUlESVxuICAgICAqICBAcGFyYW0gdmVsb2NpdHkgIFRoZSB2ZWxvY2l0eSB0byBwbGF5IHRoZSBub3RlXG4gICAgICogIEBwYXJhbSB0aW1lICAgICAgVGhlIHRpbWUgb2YgdGhlIGV2ZW50XG4gICAgICovXG4gICAga2V5RG93bihub3RlOiBzdHJpbmcgfCBudW1iZXIsIHRpbWU6IFVuaXQuVGltZSA9IHRoaXMuaW1tZWRpYXRlKCksIHZlbG9jaXR5OiBudW1iZXIgPSAwLjgpOiB0aGlzIHtcbiAgICAgICAgaWYgKCB0aGlzLmxvYWRlZCApIHtcbiAgICAgICAgICAgIHRpbWUgPSB0aGlzLnRvU2Vjb25kcyh0aW1lKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCBpc1N0cmluZyhub3RlKSApIHtcbiAgICAgICAgICAgICAgICBub3RlID0gTWF0aC5yb3VuZChNaWRpKG5vdGUpLnRvTWlkaSgpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoICF0aGlzLl9oZWxkTm90ZXMuaGFzKG5vdGUpICkge1xuICAgICAgICAgICAgICAgIC8vIHJlY29yZCB0aGUgc3RhcnQgdGltZSBhbmQgdmVsb2NpdHlcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWxkTm90ZXMuc2V0KG5vdGUsIHsgdGltZSwgdmVsb2NpdHkgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5fc3RyaW5ncy50cmlnZ2VyQXR0YWNrKG5vdGUsIHRpbWUsIHZlbG9jaXR5KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogIFJlbGVhc2UgYSBoZWxkIG5vdGUuXG4gICAgICovXG4gICAga2V5VXAobm90ZTogc3RyaW5nIHwgbnVtYmVyLCB0aW1lOiBVbml0LlRpbWUgPSB0aGlzLmltbWVkaWF0ZSgpLCB2ZWxvY2l0eSA9IDAuOCk6IHRoaXMge1xuICAgICAgICBpZiAoIHRoaXMubG9hZGVkICkge1xuICAgICAgICAgICAgdGltZSA9IHRoaXMudG9TZWNvbmRzKHRpbWUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIGlzU3RyaW5nKG5vdGUpICkge1xuICAgICAgICAgICAgICAgIG5vdGUgPSBNYXRoLnJvdW5kKE1pZGkobm90ZSkudG9NaWRpKCkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICggdGhpcy5faGVsZE5vdGVzLmhhcyhub3RlKSApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2Tm90ZSA9IHRoaXMuX2hlbGROb3Rlcy5nZXQobm90ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5faGVsZE5vdGVzLmRlbGV0ZShub3RlKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBjb21wdXRlIHRoZSByZWxlYXNlIHZlbG9jaXR5XG4gICAgICAgICAgICAgICAgY29uc3QgaG9sZFRpbWUgPSBNYXRoLnBvdyhNYXRoLm1heCh0aW1lIC0gcHJldk5vdGUudGltZSwgMC4xKSwgMC43KTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2VmVsID0gcHJldk5vdGUudmVsb2NpdHk7XG4gICAgICAgICAgICAgICAgbGV0IGRhbXBlbkdhaW4gPSAoMyAvIGhvbGRUaW1lKSAqIHByZXZWZWwgKiB2ZWxvY2l0eTtcbiAgICAgICAgICAgICAgICBkYW1wZW5HYWluID0gTWF0aC5tYXgoZGFtcGVuR2FpbiwgMC40KTtcbiAgICAgICAgICAgICAgICBkYW1wZW5HYWluID0gTWF0aC5taW4oZGFtcGVuR2FpbiwgNCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKCB0aGlzLl9wZWRhbC5pc0Rvd24odGltZSkgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggIXRoaXMuX3N1c3RhaW5lZE5vdGVzLmhhcyhub3RlKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3N1c3RhaW5lZE5vdGVzLnNldChub3RlLCB0aW1lKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVsZWFzZSB0aGUgc3RyaW5nIHNvdW5kXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N0cmluZ3MudHJpZ2dlclJlbGVhc2Uobm90ZSwgdGltZSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRyaWdnZXIgdGhlIGhhcm1vbmljcyBzb3VuZFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYXJtb25pY3MudHJpZ2dlckF0dGFjayhub3RlLCB0aW1lLCBkYW1wZW5HYWluKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyB0cmlnZ2VyIHRoZSBrZXliZWQgcmVsZWFzZSBzb3VuZFxuICAgICAgICAgICAgICAgIHRoaXMuX2tleWJlZC5zdGFydChub3RlLCB0aW1lLCB2ZWxvY2l0eSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgICBcbiAgICBzdG9wQWxsKCk6IHRoaXMge1xuICAgICAgICB0aGlzLnBlZGFsVXAoKTtcbiAgICAgICAgdGhpcy5faGVsZE5vdGVzLmZvckVhY2goKHZhbHVlLCBub3RlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmtleVVwKG5vdGUpXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cbn1cbiJdfQ==