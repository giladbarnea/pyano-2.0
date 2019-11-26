"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
const Harmonics_1 = require("./Harmonics");
const Keybed_1 = require("./Keybed");
const Pedal_1 = require("./Pedal");
const Strings_1 = require("./Strings");
/**
 *  The Piano
 */
class Piano extends tone_1.ToneAudioNode {
    constructor() {
        super(tone_1.optionsFromArguments(Piano.getDefaults(), arguments));
        this.name = 'Piano';
        this.input = undefined;
        this.output = new tone_1.Gain({ context: this.context });
        /**
         * The currently held notes
         */
        this._heldNotes = new Map();
        /**
         * If it's loaded or not
         */
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
    /**
     *  Load all the samples
     */
    async load() {
        await Promise.all([
            this._strings.load(),
            this._pedal.load(),
            this._keybed.load(),
            this._harmonics.load(),
        ]);
        this._loaded = true;
    }
    /**
     * If all the samples are loaded or not
     */
    get loaded() {
        return this._loaded;
    }
    /**
     *  Put the pedal down at the given time. Causes subsequent
     *  notes and currently held notes to sustain.
     *  @param time  The time the pedal should go down
     */
    pedalDown(time) {
        if (this.loaded) {
            time = this.toSeconds(time);
            if (!this._pedal.isDown(time)) {
                this._pedal.down(time);
            }
        }
        return this;
    }
    /**
     *  Put the pedal up. Dampens sustained notes
     *  @param time  The time the pedal should go up
     */
    pedalUp(time) {
        if (this.loaded) {
            const seconds = this.toSeconds(time);
            if (this._pedal.isDown(seconds)) {
                this._pedal.up(seconds);
                // dampen each of the notes
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
    /**
     *  Play a note.
     *  @param note	  The note to play. If it is a number, it is assumed to be MIDI
     *  @param velocity  The velocity to play the note
     *  @param time	  The time of the event
     */
    keyDown(note, time = this.immediate(), velocity = 0.8) {
        if (this.loaded) {
            time = this.toSeconds(time);
            if (tone_1.isString(note)) {
                note = Math.round(tone_1.Midi(note).toMidi());
            }
            if (!this._heldNotes.has(note)) {
                // record the start time and velocity
                this._heldNotes.set(note, { time, velocity });
                this._strings.triggerAttack(note, time, velocity);
            }
        }
        return this;
    }
    /**
     *  Release a held note.
     */
    keyUp(note, time = this.immediate(), velocity = 0.8) {
        if (this.loaded) {
            time = this.toSeconds(time);
            if (tone_1.isString(note)) {
                note = Math.round(tone_1.Midi(note).toMidi());
            }
            if (this._heldNotes.has(note)) {
                const prevNote = this._heldNotes.get(note);
                this._heldNotes.delete(note);
                // compute the release velocity
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
                    // release the string sound
                    this._strings.triggerRelease(note, time);
                    // trigger the harmonics sound
                    this._harmonics.triggerAttack(note, time, dampenGain);
                }
                // trigger the keybed release sound
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGlhbm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvUGlhbm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFFa0M7QUFDbEMsMkNBQXVDO0FBQ3ZDLHFDQUFpQztBQUNqQyxtQ0FBK0I7QUFDL0IsdUNBQXdDO0FBMkN4Qzs7R0FFRztBQUNILE1BQWEsS0FBTSxTQUFRLG9CQUEyQjtJQThEckQ7UUFDQyxLQUFLLENBQUMsMkJBQW9CLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUE7UUE3RG5ELFNBQUksR0FBRyxPQUFPLENBQUE7UUFDZCxVQUFLLEdBQUcsU0FBUyxDQUFBO1FBQ2pCLFdBQU0sR0FBRyxJQUFJLFdBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRyxJQUFJLENBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQTtRQStDcEQ7O1dBRUc7UUFDSyxlQUFVLEdBQWtCLElBQUksR0FBRyxFQUFFLENBQUE7UUFFN0M7O1dBRUc7UUFDSyxZQUFPLEdBQVksS0FBSyxDQUFBO1FBTS9CLE1BQU0sT0FBTyxHQUFHLDJCQUFvQixDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQTtRQUVwRSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7UUFFM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBRWhDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxzQkFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRTtZQUMzRCxPQUFPLEVBQUUsSUFBSTtZQUNiLE1BQU0sRUFBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU87U0FDL0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FB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LEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBQ3RDLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQTtnQkFFcEMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNwQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7cUJBQ3BDO2lCQUNEO3FCQUFNO29CQUNOLDJCQUEyQjtvQkFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO29CQUN4Qyw4QkFBOEI7b0JBQzlCLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUE7aUJBQ3JEO2dCQUVELG1DQUFtQztnQkFDbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTthQUN4QztTQUNEO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDWixDQUFDO0lBRUQsT0FBTztRQUNOLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNkLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDakIsQ0FBQyxDQUFDLENBQUE7UUFDRixPQUFPLElBQUksQ0FBQTtJQUNaLENBQUM7Q0FDRDtBQXBQRCxzQkFvUEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb250ZXh0LCBHYWluLCBpc1N0cmluZyxcblx0TWlkaSwgb3B0aW9uc0Zyb21Bcmd1bWVudHMsIFBhcmFtLFxuXHRUb25lQXVkaW9Ob2RlLCBVbml0IH0gZnJvbSAndG9uZSdcbmltcG9ydCB7IEhhcm1vbmljcyB9IGZyb20gJy4vSGFybW9uaWNzJ1xuaW1wb3J0IHsgS2V5YmVkIH0gZnJvbSAnLi9LZXliZWQnXG5pbXBvcnQgeyBQZWRhbCB9IGZyb20gJy4vUGVkYWwnXG5pbXBvcnQgeyBQaWFub1N0cmluZ3MgfSBmcm9tICcuL1N0cmluZ3MnXG5cbmludGVyZmFjZSBQaWFub09wdGlvbnMge1xuXHQvKipcblx0ICogVGhlIGF1ZGlvIGNvbnRleHQuIERlZmF1bHRzIHRvIHRoZSBnbG9iYWwgVG9uZSBhdWRpbyBjb250ZXh0XG5cdCAqL1xuXHRjb250ZXh0OiBDb250ZXh0XG5cdC8qKlxuXHQgKiBUaGUgbnVtYmVyIG9mIHZlbG9jaXR5IHN0ZXBzIHRvIGxvYWRcblx0ICovXG5cdHZlbG9jaXRpZXM6IG51bWJlcixcblx0LyoqXG5cdCAqIFRoZSBsb3dlc3Qgbm90ZSB0byBsb2FkXG5cdCAqL1xuXHRtaW5Ob3RlOiBudW1iZXIsXG5cdC8qKlxuXHQgKiBUaGUgaGlnaGVzdCBub3RlIHRvIGxvYWRcblx0ICovXG5cdG1heE5vdGU6IG51bWJlcixcblx0LyoqXG5cdCAqIElmIGl0IHNob3VsZCBpbmNsdWRlIGEgJ3JlbGVhc2UnIHNvdW5kcyBjb21wb3NlZCBvZiBhIGtleWNsaWNrIGFuZCBzdHJpbmcgaGFybW9uaWNcblx0ICovXG5cdHJlbGVhc2U6IGJvb2xlYW4sXG5cdC8qKlxuXHQgKiBJZiB0aGUgcGlhbm8gc2hvdWxkIGluY2x1ZGUgYSAncGVkYWwnIHNvdW5kLlxuXHQgKi9cblx0cGVkYWw6IGJvb2xlYW4sXG5cdC8qKlxuXHQgKiBUaGUgZGlyZWN0b3J5IG9mIHRoZSBzYWxhbWFuZGVyIGdyYW5kIHBpYW5vIHNhbXBsZXNcblx0ICovXG5cdHNhbXBsZXM6IHN0cmluZyxcblxuXHQvKipcblx0ICogVm9sdW1lIGxldmVsdHMgZm9yIGVhY2ggb2YgdGhlIGNvbXBvbmVudHMgKGluIGRlY2liZWxzKVxuXHQgKi9cblx0dm9sdW1lOiB7XG5cdFx0cGVkYWw6IG51bWJlcixcblx0XHRzdHJpbmdzOiBudW1iZXIsXG5cdFx0a2V5YmVkOiBudW1iZXIsXG5cdFx0aGFybW9uaWNzOiBudW1iZXIsXG5cdH1cbn1cblxuLyoqXG4gKiAgVGhlIFBpYW5vXG4gKi9cbmV4cG9ydCBjbGFzcyBQaWFubyBleHRlbmRzIFRvbmVBdWRpb05vZGU8UGlhbm9PcHRpb25zPiB7XG5cblx0cmVhZG9ubHkgbmFtZSA9ICdQaWFubydcblx0cmVhZG9ubHkgaW5wdXQgPSB1bmRlZmluZWRcblx0cmVhZG9ubHkgb3V0cHV0ID0gbmV3IEdhaW4oe2NvbnRleHQgOiB0aGlzLmNvbnRleHR9KVxuXG5cdC8qKlxuXHQgKiBUaGUgc3RyaW5nIGhhcm1vbmljc1xuXHQgKi9cblx0cHJpdmF0ZSBfaGFybW9uaWNzOiBIYXJtb25pY3NcblxuXHQvKipcblx0ICogVGhlIGtleWJlZCByZWxlYXNlIHNvdW5kXG5cdCAqL1xuXHRwcml2YXRlIF9rZXliZWQ6IEtleWJlZFxuXG5cdC8qKlxuXHQgKiBUaGUgcGVkYWxcblx0ICovXG5cdHByaXZhdGUgX3BlZGFsOiBQZWRhbFxuXG5cdC8qKlxuXHQgKiBUaGUgc3RyaW5nc1xuXHQgKi9cblx0cHJpdmF0ZSBfc3RyaW5nczogUGlhbm9TdHJpbmdzXG5cblx0LyoqXG5cdCAqIFRoZSB2b2x1bWUgbGV2ZWwgb2YgdGhlIHN0cmluZ3Mgb3V0cHV0LiBUaGlzIGlzIHRoZSBtYWluIHBpYW5vIHNvdW5kLlxuXHQgKi9cblx0c3RyaW5nczogUGFyYW08VW5pdC5EZWNpYmVscz5cblxuXHQvKipcblx0ICogVGhlIHZvbHVtZSBvdXRwdXQgb2YgdGhlIHBlZGFsIHVwIGFuZCBkb3duIHNvdW5kc1xuXHQgKi9cblx0cGVkYWw6IFBhcmFtPFVuaXQuRGVjaWJlbHM+XG5cblx0LyoqXG5cdCAqIFRoZSB2b2x1bWUgb2YgdGhlIHN0cmluZyBoYXJtb25pY3Ncblx0ICovXG5cdGhhcm1vbmljczogUGFyYW08VW5pdC5EZWNpYmVscz5cblxuXHQvKipcblx0ICogVGhlIHZvbHVtZSBvZiB0aGUga2V5YmVkIGNsaWNrIHNvdW5kXG5cdCAqL1xuXHRrZXliZWQ6IFBhcmFtPFVuaXQuRGVjaWJlbHM+XG5cblx0LyoqXG5cdCAqIFRoZSBzdXN0YWluZWQgbm90ZXNcblx0ICovXG5cdHByaXZhdGUgX3N1c3RhaW5lZE5vdGVzOiBNYXA8YW55LCBhbnk+XG5cblx0LyoqXG5cdCAqIFRoZSBjdXJyZW50bHkgaGVsZCBub3Rlc1xuXHQgKi9cblx0cHJpdmF0ZSBfaGVsZE5vdGVzOiBNYXA8YW55LCBhbnk+ID0gbmV3IE1hcCgpXG5cblx0LyoqXG5cdCAqIElmIGl0J3MgbG9hZGVkIG9yIG5vdFxuXHQgKi9cblx0cHJpdmF0ZSBfbG9hZGVkOiBib29sZWFuID0gZmFsc2VcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zPzogUGFydGlhbDxQaWFub09wdGlvbnM+KTtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIob3B0aW9uc0Zyb21Bcmd1bWVudHMoUGlhbm8uZ2V0RGVmYXVsdHMoKSwgYXJndW1lbnRzKSlcblxuXHRcdGNvbnN0IG9wdGlvbnMgPSBvcHRpb25zRnJvbUFyZ3VtZW50cyhQaWFuby5nZXREZWZhdWx0cygpLCBhcmd1bWVudHMpXG5cblx0XHR0aGlzLl9oZWxkTm90ZXMgPSBuZXcgTWFwKClcblxuXHRcdHRoaXMuX3N1c3RhaW5lZE5vdGVzID0gbmV3IE1hcCgpXG5cblx0XHR0aGlzLl9zdHJpbmdzID0gbmV3IFBpYW5vU3RyaW5ncyhPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLCB7XG5cdFx0XHRlbmFibGVkOiB0cnVlLFxuXHRcdFx0dm9sdW1lIDogb3B0aW9ucy52b2x1bWUuc3RyaW5ncyxcblx0XHR9KSkuY29ubmVjdCh0aGlzLm91dHB1dClcblx0XHR0aGlzLnN0cmluZ3MgPSB0aGlzLl9zdHJpbmdzLnZvbHVtZVxuXG5cdFx0dGhpcy5fcGVkYWwgPSBuZXcgUGVkYWwoT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucywge1xuXHRcdFx0ZW5hYmxlZDogb3B0aW9ucy5wZWRhbCxcblx0XHRcdHZvbHVtZSA6IG9wdGlvbnMudm9sdW1lLnBlZGFsLFxuXHRcdH0pKS5jb25uZWN0KHRoaXMub3V0cHV0KVxuXHRcdHRoaXMucGVkYWwgPSB0aGlzLl9wZWRhbC52b2x1bWVcblxuXHRcdHRoaXMuX2tleWJlZCA9IG5ldyBLZXliZWQoT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucywge1xuXHRcdFx0ZW5hYmxlZDogb3B0aW9ucy5yZWxlYXNlLFxuXHRcdFx0dm9sdW1lIDogb3B0aW9ucy52b2x1bWUua2V5YmVkLFxuXHRcdH0pKS5jb25uZWN0KHRoaXMub3V0cHV0KVxuXHRcdHRoaXMua2V5YmVkID0gdGhpcy5fa2V5YmVkLnZvbHVtZVxuXG5cdFx0dGhpcy5faGFybW9uaWNzID0gbmV3IEhhcm1vbmljcyhPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLCB7XG5cdFx0XHRlbmFibGVkOiBvcHRpb25zLnJlbGVhc2UsXG5cdFx0XHR2b2x1bWUgOiBvcHRpb25zLnZvbHVtZS5oYXJtb25pY3MsXG5cdFx0fSkpLmNvbm5lY3QodGhpcy5vdXRwdXQpXG5cdFx0dGhpcy5oYXJtb25pY3MgPSB0aGlzLl9oYXJtb25pY3Mudm9sdW1lXG5cdH1cblxuXHRzdGF0aWMgZ2V0RGVmYXVsdHMoKTogUGlhbm9PcHRpb25zIHtcblx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbihUb25lQXVkaW9Ob2RlLmdldERlZmF1bHRzKCksIHtcblx0XHRcdG1heE5vdGUgOiAxMDgsXG5cdFx0XHRtaW5Ob3RlIDogMjEsXG5cdFx0XHRwZWRhbCA6IHRydWUsXG5cdFx0XHRyZWxlYXNlIDogZmFsc2UsXG5cdFx0XHRzYW1wbGVzIDogJy4vYXVkaW8vJyxcblx0XHRcdHZlbG9jaXRpZXMgOiAxLFxuXHRcdFx0dm9sdW1lIDoge1xuXHRcdFx0XHRoYXJtb25pY3MgOiAwLFxuXHRcdFx0XHRrZXliZWQgOiAwLFxuXHRcdFx0XHRwZWRhbCA6IDAsXG5cdFx0XHRcdHN0cmluZ3MgOiAwLFxuXHRcdFx0fSxcblx0XHR9KVxuXHR9XG5cblx0LyoqXG5cdCAqICBMb2FkIGFsbCB0aGUgc2FtcGxlc1xuXHQgKi9cblx0YXN5bmMgbG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRhd2FpdCBQcm9taXNlLmFsbChbXG5cdFx0XHR0aGlzLl9zdHJpbmdzLmxvYWQoKSxcblx0XHRcdHRoaXMuX3BlZGFsLmxvYWQoKSxcblx0XHRcdHRoaXMuX2tleWJlZC5sb2FkKCksXG5cdFx0XHR0aGlzLl9oYXJtb25pY3MubG9hZCgpLFxuXHRcdF0pXG5cdFx0dGhpcy5fbG9hZGVkID0gdHJ1ZVxuXHR9XG5cblx0LyoqXG5cdCAqIElmIGFsbCB0aGUgc2FtcGxlcyBhcmUgbG9hZGVkIG9yIG5vdFxuXHQgKi9cblx0Z2V0IGxvYWRlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fbG9hZGVkXG5cdH1cblxuXHQvKipcblx0ICogIFB1dCB0aGUgcGVkYWwgZG93biBhdCB0aGUgZ2l2ZW4gdGltZS4gQ2F1c2VzIHN1YnNlcXVlbnRcblx0ICogIG5vdGVzIGFuZCBjdXJyZW50bHkgaGVsZCBub3RlcyB0byBzdXN0YWluLlxuXHQgKiAgQHBhcmFtIHRpbWUgIFRoZSB0aW1lIHRoZSBwZWRhbCBzaG91bGQgZ28gZG93blxuXHQgKi9cblx0cGVkYWxEb3duKHRpbWU/OiBVbml0LlRpbWUpOiB0aGlzIHtcblxuXHRcdGlmICh0aGlzLmxvYWRlZCkge1xuXHRcdFx0dGltZSA9IHRoaXMudG9TZWNvbmRzKHRpbWUpXG5cdFx0XHRpZiAoIXRoaXMuX3BlZGFsLmlzRG93bih0aW1lKSkge1xuXHRcdFx0XHR0aGlzLl9wZWRhbC5kb3duKHRpbWUpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzXG5cdH1cblxuXHQvKipcblx0ICogIFB1dCB0aGUgcGVkYWwgdXAuIERhbXBlbnMgc3VzdGFpbmVkIG5vdGVzXG5cdCAqICBAcGFyYW0gdGltZSAgVGhlIHRpbWUgdGhlIHBlZGFsIHNob3VsZCBnbyB1cFxuXHQgKi9cblx0cGVkYWxVcCh0aW1lPzogVW5pdC5UaW1lKTogdGhpcyB7XG5cblx0XHRpZiAodGhpcy5sb2FkZWQpIHtcblx0XHRcdGNvbnN0IHNlY29uZHMgPSB0aGlzLnRvU2Vjb25kcyh0aW1lKVxuXHRcdFx0aWYgKHRoaXMuX3BlZGFsLmlzRG93bihzZWNvbmRzKSkge1xuXHRcdFx0XHR0aGlzLl9wZWRhbC51cChzZWNvbmRzKVxuXHRcdFx0XHQvLyBkYW1wZW4gZWFjaCBvZiB0aGUgbm90ZXNcblx0XHRcdFx0dGhpcy5fc3VzdGFpbmVkTm90ZXMuZm9yRWFjaCgodCwgbm90ZSkgPT4ge1xuXHRcdFx0XHRcdGlmICghdGhpcy5faGVsZE5vdGVzLmhhcyhub3RlKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fc3RyaW5ncy50cmlnZ2VyUmVsZWFzZShub3RlLCBzZWNvbmRzKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0dGhpcy5fc3VzdGFpbmVkTm90ZXMuY2xlYXIoKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0LyoqXG5cdCAqICBQbGF5IGEgbm90ZS5cblx0ICogIEBwYXJhbSBub3RlXHQgIFRoZSBub3RlIHRvIHBsYXkuIElmIGl0IGlzIGEgbnVtYmVyLCBpdCBpcyBhc3N1bWVkIHRvIGJlIE1JRElcblx0ICogIEBwYXJhbSB2ZWxvY2l0eSAgVGhlIHZlbG9jaXR5IHRvIHBsYXkgdGhlIG5vdGVcblx0ICogIEBwYXJhbSB0aW1lXHQgIFRoZSB0aW1lIG9mIHRoZSBldmVudFxuXHQgKi9cblx0a2V5RG93bihub3RlOiBzdHJpbmcgfCBudW1iZXIsIHRpbWU6IFVuaXQuVGltZSA9IHRoaXMuaW1tZWRpYXRlKCksIHZlbG9jaXR5OiBudW1iZXIgPSAwLjgpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5sb2FkZWQpIHtcblx0XHRcdHRpbWUgPSB0aGlzLnRvU2Vjb25kcyh0aW1lKVxuXG5cdFx0XHRpZiAoaXNTdHJpbmcobm90ZSkpIHtcblx0XHRcdFx0bm90ZSA9IE1hdGgucm91bmQoTWlkaShub3RlKS50b01pZGkoKSlcblx0XHRcdH1cblxuXHRcdFx0aWYgKCF0aGlzLl9oZWxkTm90ZXMuaGFzKG5vdGUpKSB7XG5cdFx0XHRcdC8vIHJlY29yZCB0aGUgc3RhcnQgdGltZSBhbmQgdmVsb2NpdHlcblx0XHRcdFx0dGhpcy5faGVsZE5vdGVzLnNldChub3RlLCB7IHRpbWUsIHZlbG9jaXR5IH0pXG5cblx0XHRcdFx0dGhpcy5fc3RyaW5ncy50cmlnZ2VyQXR0YWNrKG5vdGUsIHRpbWUsIHZlbG9jaXR5KVxuXHRcdFx0fVxuXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzXG5cdH1cblxuXHQvKipcblx0ICogIFJlbGVhc2UgYSBoZWxkIG5vdGUuXG5cdCAqL1xuXHRrZXlVcChub3RlOiBzdHJpbmcgfCBudW1iZXIsIHRpbWU6IFVuaXQuVGltZSA9IHRoaXMuaW1tZWRpYXRlKCksIHZlbG9jaXR5ID0gMC44KTogdGhpcyB7XG5cdFx0aWYgKHRoaXMubG9hZGVkKSB7XG5cdFx0XHR0aW1lID0gdGhpcy50b1NlY29uZHModGltZSlcblxuXHRcdFx0aWYgKGlzU3RyaW5nKG5vdGUpKSB7XG5cdFx0XHRcdG5vdGUgPSBNYXRoLnJvdW5kKE1pZGkobm90ZSkudG9NaWRpKCkpXG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLl9oZWxkTm90ZXMuaGFzKG5vdGUpKSB7XG5cblx0XHRcdFx0Y29uc3QgcHJldk5vdGUgPSB0aGlzLl9oZWxkTm90ZXMuZ2V0KG5vdGUpXG5cdFx0XHRcdHRoaXMuX2hlbGROb3Rlcy5kZWxldGUobm90ZSlcblxuXHRcdFx0XHQvLyBjb21wdXRlIHRoZSByZWxlYXNlIHZlbG9jaXR5XG5cdFx0XHRcdGNvbnN0IGhvbGRUaW1lID0gTWF0aC5wb3coTWF0aC5tYXgodGltZSAtIHByZXZOb3RlLnRpbWUsIDAuMSksIDAuNylcblx0XHRcdFx0Y29uc3QgcHJldlZlbCA9IHByZXZOb3RlLnZlbG9jaXR5XG5cdFx0XHRcdGxldCBkYW1wZW5HYWluID0gKDMgLyBob2xkVGltZSkgKiBwcmV2VmVsICogdmVsb2NpdHlcblx0XHRcdFx0ZGFtcGVuR2FpbiA9IE1hdGgubWF4KGRhbXBlbkdhaW4sIDAuNClcblx0XHRcdFx0ZGFtcGVuR2FpbiA9IE1hdGgubWluKGRhbXBlbkdhaW4sIDQpXG5cblx0XHRcdFx0aWYgKHRoaXMuX3BlZGFsLmlzRG93bih0aW1lKSkge1xuXHRcdFx0XHRcdGlmICghdGhpcy5fc3VzdGFpbmVkTm90ZXMuaGFzKG5vdGUpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLl9zdXN0YWluZWROb3Rlcy5zZXQobm90ZSwgdGltZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gcmVsZWFzZSB0aGUgc3RyaW5nIHNvdW5kXG5cdFx0XHRcdFx0dGhpcy5fc3RyaW5ncy50cmlnZ2VyUmVsZWFzZShub3RlLCB0aW1lKVxuXHRcdFx0XHRcdC8vIHRyaWdnZXIgdGhlIGhhcm1vbmljcyBzb3VuZFxuXHRcdFx0XHRcdHRoaXMuX2hhcm1vbmljcy50cmlnZ2VyQXR0YWNrKG5vdGUsIHRpbWUsIGRhbXBlbkdhaW4pXG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyB0cmlnZ2VyIHRoZSBrZXliZWQgcmVsZWFzZSBzb3VuZFxuXHRcdFx0XHR0aGlzLl9rZXliZWQuc3RhcnQobm90ZSwgdGltZSwgdmVsb2NpdHkpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzXG5cdH1cblxuXHRzdG9wQWxsKCk6IHRoaXMge1xuXHRcdHRoaXMucGVkYWxVcCgpXG5cdFx0dGhpcy5faGVsZE5vdGVzLmZvckVhY2goKHZhbHVlLCBub3RlKSA9PiB7XG5cdFx0XHR0aGlzLmtleVVwKG5vdGUpXG5cdFx0fSlcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG59XG4iXX0=