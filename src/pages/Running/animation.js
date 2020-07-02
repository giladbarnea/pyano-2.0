"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("../../util");
const Glob_1 = require("../../Glob");
const Piano_1 = require("../../Piano");
const midi_1 = require("@tonejs/midi");
const Tone = require("tone");
const extra_js_1 = require("../../bhe/extra.js");
class Animation extends extra_js_1.VisualBHE {
    constructor() {
        const keys = {
            A0: {
                '[data-note="A0"]': {
                    'A#0': '[data-note="A#0"]'
                }
            },
            B0: '[data-note="B0"]',
        };
        const indexToLetter = {
            1: "C",
            2: "D",
            3: "E",
            4: "F",
            5: "G",
            6: "A",
            7: "B"
        };
        const noblacks = [3, 7];
        for (let register of util.range(1, 7)) {
            for (let keyIndex of util.range(1, 7)) {
                let letter = indexToLetter[keyIndex];
                let name = `${letter}${register}`;
                let value;
                if (noblacks.includes(keyIndex)) {
                    value = `[data-note="${name}"]`;
                }
                else {
                    let query = `[data-note="${name}"]`;
                    let subname = `${letter}#${register}`;
                    let subquery = `[data-note="${subname}"]`;
                    let subvalue = {};
                    subvalue[subname] = subquery;
                    value = {};
                    value[query] = subvalue;
                }
                keys[name] = value;
            }
        }
        super({
            byid: 'animation', children: keys
        });
    }
    async init(midiAbsPath) {
        console.group(`Animation.init()`);
        const pianoOptions = {
            samples: SALAMANDER_PATH_ABS,
            release: true,
            pedal: false,
            velocities: Glob_1.default.BigConfig.velocities,
        };
        if (Glob_1.default.BigConfig.dev.mute_animation()) {
            pianoOptions.volume = { strings: -Infinity, harmonics: -Infinity, keybed: -Infinity, pedal: -Infinity };
        }
        this.piano = new Piano_1.Piano(pianoOptions).toDestination();
        const loadPiano = this.piano.load();
        const loadMidi = midi_1.Midi.fromUrl(midiAbsPath);
        const [_, midi] = await Promise.all([loadPiano, loadMidi]);
        console.log('piano loaded, midi loaded: ', midi);
        const notes = midi.tracks[0].notes;
        Tone.context.latencyHint = "playback";
        Tone.Transport.start();
        let noteOns = [];
        let noteOffs = [];
        for (let note of notes) {
            let { name, velocity, duration, time: timeOn } = note;
            let timeOff = timeOn + duration;
            noteOns.push({ name, time: timeOn, duration, velocity });
            noteOffs.push({ name, time: timeOff });
        }
        this.noteOns = noteOns;
        this.noteOffs = noteOffs;
        console.groupEnd();
        return;
    }
    async intro() {
        console.group(`Animation.intro()`);
        await this.play();
        console.groupEnd();
        return;
    }
    async levelIntro(notes, rate) {
        console.group(`Animation.levelIntro(notes: ${notes}, rate: ${rate})`);
        await this.play(notes, rate);
        console.groupEnd();
        return;
    }
    paintKey({ name }, color, on) {
        let child;
        if (name.includes('#')) {
            let nohash = name.replace('#', '');
            child = this[nohash][name];
        }
        else {
            child = this[name];
        }
        child.toggleClass(color, on);
    }
    play(notes, rate) {
        return new Promise(resolve => {
            let count = 0;
            const noteOnCallback = (time, event) => {
                Tone.Draw.schedule(() => this.paintKey(event, "green", true), time);
                this.piano.keyDown(event.name, time, event.velocity);
            };
            const noteOffCallback = async (time, event) => {
                Tone.Draw.schedule(() => this.paintKey(event, "green", false), time);
                this.piano.keyUp(event.name, time);
                count++;
                if (noteOffEvents.length === count) {
                    const now = Tone.Transport.now();
                    const diff = now - time;
                    await util.wait((diff * 1000), false);
                    console.log('animation ended!');
                    resolve();
                }
            };
            let noteOffs;
            let noteOns;
            if (notes) {
                noteOns = this.noteOns.slice(0, notes);
                noteOffs = this.noteOffs.slice(0, notes);
            }
            else {
                noteOns = this.noteOns;
                noteOffs = this.noteOffs;
            }
            const onPart = new Tone.Part(noteOnCallback, noteOns);
            onPart.playbackRate = rate;
            const offPart = new Tone.Part(noteOffCallback, noteOffs);
            offPart.playbackRate = rate;
            const noteOnEvents = onPart.start();
            const noteOffEvents = offPart.start();
        });
    }
}
exports.default = Animation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5pbWF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQWtDO0FBQ2xDLHFDQUE4QjtBQUM5Qix1Q0FBa0Q7QUFDbEQsdUNBQW9DO0FBQ3BDLDZCQUE2QjtBQUM3QixpREFBK0M7QUFRL0MsTUFBTSxTQUFVLFNBQVEsb0JBQVM7SUFLN0I7UUFFSSxNQUFNLElBQUksR0FBRztZQUNULEVBQUUsRUFBRTtnQkFDQSxrQkFBa0IsRUFBRTtvQkFDaEIsS0FBSyxFQUFFLG1CQUFtQjtpQkFDN0I7YUFDSjtZQUNELEVBQUUsRUFBRSxrQkFBa0I7U0FDekIsQ0FBQztRQUNGLE1BQU0sYUFBYSxHQUFHO1lBQ2xCLENBQUMsRUFBRSxHQUFHO1lBQ04sQ0FBQyxFQUFFLEdBQUc7WUFDTixDQUFDLEVBQUUsR0FBRztZQUNOLENBQUMsRUFBRSxHQUFHO1lBQ04sQ0FBQyxFQUFFLEdBQUc7WUFDTixDQUFDLEVBQUUsR0FBRztZQUNOLENBQUMsRUFBRSxHQUFHO1NBQ1QsQ0FBQztRQUNGLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLEtBQUssSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDbkMsS0FBSyxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDbkMsSUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLElBQUksR0FBRyxHQUFHLE1BQU0sR0FBRyxRQUFRLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxLQUFLLENBQUM7Z0JBQ1YsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUM3QixLQUFLLEdBQUcsZUFBZSxJQUFJLElBQUksQ0FB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Q0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdkMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUM1QztpQkFBTTtnQkFDSCxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDdkIsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDNUI7WUFDRCxNQUFNLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBRTNCLE1BQU0sT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDekQsT0FBTyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDNUIsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3BDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUcxQyxDQUFDLENBQUMsQ0FBQztJQUVQLENBQUM7Q0FHSjtBQUVELGtCQUFlLFNBQVMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4uLy4uL3V0aWxcIlxuaW1wb3J0IEdsb2IgZnJvbSBcIi4uLy4uL0dsb2JcIjtcbmltcG9ydCB7IFBpYW5vLCBQaWFub09wdGlvbnMgfSBmcm9tIFwiLi4vLi4vUGlhbm9cIjtcbmltcG9ydCB7IE1pZGkgfSBmcm9tIFwiQHRvbmVqcy9taWRpXCI7XG5pbXBvcnQgKiBhcyBUb25lIGZyb20gXCJ0b25lXCI7XG5pbXBvcnQgeyBWaXN1YWxCSEUgfSBmcm9tIFwiLi4vLi4vYmhlL2V4dHJhLmpzXCI7XG5cbnR5cGUgTm90ZUV2ZW50ID0geyBuYW1lOiBzdHJpbmcgfTtcbi8vIHR5cGUgTm90ZU9mZkV2ZW50ID0geyBuYW1lOiBzdHJpbmcgfTtcbnR5cGUgTm90ZU9uRXZlbnQgPSBOb3RlRXZlbnQgJiB7IHZlbG9jaXR5OiBudW1iZXIgfTtcbnR5cGUgTm90ZU9mZiA9IE5vdGVFdmVudCAmIHsgdGltZTogVG9uZS5Vbml0LlRpbWUgfTtcbnR5cGUgTm90ZU9uID0gTm90ZU9uRXZlbnQgJiB7IHRpbWU6IFRvbmUuVW5pdC5UaW1lLCBkdXJhdGlvbjogbnVtYmVyIH07XG5cbmNsYXNzIEFuaW1hdGlvbiBleHRlbmRzIFZpc3VhbEJIRSB7XG4gICAgcHJpdmF0ZSBwaWFubzogUGlhbm87XG4gICAgcHJpdmF0ZSBub3RlT25zOiBOb3RlT25bXTtcbiAgICBwcml2YXRlIG5vdGVPZmZzOiBOb3RlT2ZmW107XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICBjb25zdCBrZXlzID0ge1xuICAgICAgICAgICAgQTA6IHtcbiAgICAgICAgICAgICAgICAnW2RhdGEtbm90ZT1cIkEwXCJdJzoge1xuICAgICAgICAgICAgICAgICAgICAnQSMwJzogJ1tkYXRhLW5vdGU9XCJBIzBcIl0nXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEIwOiAnW2RhdGEtbm90ZT1cIkIwXCJdJyxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaW5kZXhUb0xldHRlciA9IHtcbiAgICAgICAgICAgIDE6IFwiQ1wiLFxuICAgICAgICAgICAgMjogXCJEXCIsXG4gICAgICAgICAgICAzOiBcIkVcIixcbiAgICAgICAgICAgIDQ6IFwiRlwiLFxuICAgICAgICAgICAgNTogXCJHXCIsXG4gICAgICAgICAgICA2OiBcIkFcIixcbiAgICAgICAgICAgIDc6IFwiQlwiXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG5vYmxhY2tzID0gWzMsIDddOyAvLyBFLCBCXG4gICAgICAgIGZvciAobGV0IHJlZ2lzdGVyIG9mIHV0aWwucmFuZ2UoMSwgNykpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGtleUluZGV4IG9mIHV0aWwucmFuZ2UoMSwgNykpIHtcbiAgICAgICAgICAgICAgICBsZXQgbGV0dGVyID0gaW5kZXhUb0xldHRlcltrZXlJbmRleF07XG4gICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBgJHtsZXR0ZXJ9JHtyZWdpc3Rlcn1gO1xuICAgICAgICAgICAgICAgIGxldCB2YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAobm9ibGFja3MuaW5jbHVkZXMoa2V5SW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gYFtkYXRhLW5vdGU9XCIke25hbWV9XCJdYFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBxdWVyeSA9IGBbZGF0YS1ub3RlPVwiJHtuYW1lfVwiXWA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJuYW1lID0gYCR7bGV0dGVyfSMke3JlZ2lzdGVyfWA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJxdWVyeSA9IGBbZGF0YS1ub3RlPVwiJHtzdWJuYW1lfVwiXWA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJ2YWx1ZSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBzdWJ2YWx1ZVtzdWJuYW1lXSA9IHN1YnF1ZXJ5O1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZVtxdWVyeV0gPSBzdWJ2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAga2V5c1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIGJ5aWQ6ICdhbmltYXRpb24nLCBjaGlsZHJlbjoga2V5c1xuICAgICAgICB9KTtcblxuXG4gICAgfVxuXG4gICAgYXN5bmMgaW5pdChtaWRpQWJzUGF0aDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYEFuaW1hdGlvbi5pbml0KClgKTtcblxuICAgICAgICBjb25zdCBwaWFub09wdGlvbnM6IFBhcnRpYWw8UGlhbm9PcHRpb25zPiA9IHtcbiAgICAgICAgICAgIHNhbXBsZXM6IFNBTEFNQU5ERVJfUEFUSF9BQlMsXG4gICAgICAgICAgICByZWxlYXNlOiB0cnVlLFxuICAgICAgICAgICAgcGVkYWw6IGZhbHNlLFxuICAgICAgICAgICAgdmVsb2NpdGllczogR2xvYi5CaWdDb25maWcudmVsb2NpdGllcyxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKEdsb2IuQmlnQ29uZmlnLmRldi5tdXRlX2FuaW1hdGlvbigpKSB7XG4gICAgICAgICAgICBwaWFub09wdGlvbnMudm9sdW1lID0geyBzdHJpbmdzOiAtSW5maW5pdHksIGhhcm1vbmljczogLUluZmluaXR5LCBrZXliZWQ6IC1JbmZpbml0eSwgcGVkYWw6IC1JbmZpbml0eSB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5waWFubyA9IG5ldyBQaWFubyhwaWFub09wdGlvbnMpLnRvRGVzdGluYXRpb24oKTtcbiAgICAgICAgY29uc3QgbG9hZFBpYW5vID0gdGhpcy5waWFuby5sb2FkKCk7XG4gICAgICAgIGNvbnN0IGxvYWRNaWRpID0gTWlkaS5mcm9tVXJsKG1pZGlBYnNQYXRoKTtcbiAgICAgICAgY29uc3QgW18sIG1pZGldID0gYXdhaXQgUHJvbWlzZS5hbGwoW2xvYWRQaWFubywgbG9hZE1pZGldKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3BpYW5vIGxvYWRlZCwgbWlkaSBsb2FkZWQ6ICcsIG1pZGkpO1xuICAgICAgICBjb25zdCBub3RlcyA9IG1pZGkudHJhY2tzWzBdLm5vdGVzO1xuICAgICAgICBUb25lLmNvbnRleHQubGF0ZW5jeUhpbnQgPSBcInBsYXliYWNrXCI7XG4gICAgICAgIFRvbmUuVHJhbnNwb3J0LnN0YXJ0KCk7XG5cblxuICAgICAgICBsZXQgbm90ZU9uczogTm90ZU9uW10gPSBbXTtcbiAgICAgICAgbGV0IG5vdGVPZmZzOiBOb3RlT2ZmW10gPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBub3RlIG9mIG5vdGVzKSB7XG4gICAgICAgICAgICBsZXQgeyBuYW1lLCB2ZWxvY2l0eSwgZHVyYXRpb24sIHRpbWU6IHRpbWVPbiB9ID0gbm90ZTtcbiAgICAgICAgICAgIGxldCB0aW1lT2ZmID0gdGltZU9uICsgZHVyYXRpb247XG4gICAgICAgICAgICBub3RlT25zLnB1c2goeyBuYW1lLCB0aW1lOiB0aW1lT24sIGR1cmF0aW9uLCB2ZWxvY2l0eSB9KTtcbiAgICAgICAgICAgIG5vdGVPZmZzLnB1c2goeyBuYW1lLCB0aW1lOiB0aW1lT2ZmIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubm90ZU9ucyA9IG5vdGVPbnM7XG4gICAgICAgIHRoaXMubm90ZU9mZnMgPSBub3RlT2ZmcztcbiAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICByZXR1cm47XG5cblxuICAgIH1cblxuICAgIGFzeW5jIGludHJvKCk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBBbmltYXRpb24uaW50cm8oKWApO1xuICAgICAgICBhd2FpdCB0aGlzLnBsYXkoKTtcbiAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICByZXR1cm47XG5cblxuICAgIH1cblxuICAgIGFzeW5jIGxldmVsSW50cm8obm90ZXM6IG51bWJlciwgcmF0ZTogbnVtYmVyKSB7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYEFuaW1hdGlvbi5sZXZlbEludHJvKG5vdGVzOiAke25vdGVzfSwgcmF0ZTogJHtyYXRlfSlgKTtcbiAgICAgICAgYXdhaXQgdGhpcy5wbGF5KG5vdGVzLCByYXRlKTtcbiAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwYWludEtleSh7IG5hbWUgfTogTm90ZUV2ZW50LCBjb2xvcjogXCJyZWRcIiB8IFwiZ3JlZW5cIiB8IFwiYmx1ZVwiLCBvbjogYm9vbGVhbikge1xuICAgICAgICBsZXQgY2hpbGQ7XG4gICAgICAgIGlmIChuYW1lLmluY2x1ZGVzKCcjJykpIHtcbiAgICAgICAgICAgIGxldCBub2hhc2ggPSBuYW1lLnJlcGxhY2UoJyMnLCAnJyk7XG4gICAgICAgICAgICBjaGlsZCA9IHRoaXNbbm9oYXNoXVtuYW1lXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoaWxkID0gdGhpc1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgICBjaGlsZC50b2dnbGVDbGFzcyhjb2xvciwgb24pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcGxheShub3Rlcz86IG51bWJlciwgcmF0ZT86IG51bWJlcik6IFByb21pc2U8dW5rbm93bj4ge1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XG5cbiAgICAgICAgICAgIGNvbnN0IG5vdGVPbkNhbGxiYWNrID0gKHRpbWU6IFRvbmUuVW5pdC5UaW1lLCBldmVudDogTm90ZU9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBUb25lLkRyYXcuc2NoZWR1bGUoKCkgPT4gdGhpcy5wYWludEtleShldmVudCwgXCJncmVlblwiLCB0cnVlKSwgdGltZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5waWFuby5rZXlEb3duKGV2ZW50Lm5hbWUsIHRpbWUsIGV2ZW50LnZlbG9jaXR5KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBub3RlT2ZmQ2FsbGJhY2sgPSBhc3luYyAodGltZTogVG9uZS5Vbml0LlRpbWUsIGV2ZW50OiBOb3RlRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBUb25lLkRyYXcuc2NoZWR1bGUoKCkgPT4gdGhpcy5wYWludEtleShldmVudCwgXCJncmVlblwiLCBmYWxzZSksIHRpbWUpO1xuICAgICAgICAgICAgICAgIHRoaXMucGlhbm8ua2V5VXAoZXZlbnQubmFtZSwgdGltZSk7XG4gICAgICAgICAgICAgICAgY291bnQrKztcblxuICAgICAgICAgICAgICAgIGlmIChub3RlT2ZmRXZlbnRzLmxlbmd0aCA9PT0gY291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm93ID0gVG9uZS5UcmFuc3BvcnQubm93KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IHV0aWwgPSByZXF1aXJlKFwiLi4vLi4vdXRpbFwiKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaWZmID0gbm93IC0gdGltZTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdXRpbC53YWl0KChkaWZmICogMTAwMCksIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FuaW1hdGlvbiBlbmRlZCEnKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB9O1xuXG5cbiAgICAgICAgICAgIC8vIGNvbnN0IG5vdyA9IFRvbmUuVHJhbnNwb3J0Lm5vdygpO1xuICAgICAgICAgICAgbGV0IG5vdGVPZmZzO1xuICAgICAgICAgICAgbGV0IG5vdGVPbnM7XG4gICAgICAgICAgICBpZiAobm90ZXMpIHtcbiAgICAgICAgICAgICAgICBub3RlT25zID0gdGhpcy5ub3RlT25zLnNsaWNlKDAsIG5vdGVzKTtcbiAgICAgICAgICAgICAgICBub3RlT2ZmcyA9IHRoaXMubm90ZU9mZnMuc2xpY2UoMCwgbm90ZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub3RlT25zID0gdGhpcy5ub3RlT25zO1xuICAgICAgICAgICAgICAgIG5vdGVPZmZzID0gdGhpcy5ub3RlT2ZmcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG9uUGFydCA9IG5ldyBUb25lLlBhcnQobm90ZU9uQ2FsbGJhY2ssIG5vdGVPbnMpO1xuICAgICAgICAgICAgb25QYXJ0LnBsYXliYWNrUmF0ZSA9IHJhdGU7XG5cbiAgICAgICAgICAgIGNvbnN0IG9mZlBhcnQgPSBuZXcgVG9uZS5QYXJ0KG5vdGVPZmZDYWxsYmFjaywgbm90ZU9mZnMpO1xuICAgICAgICAgICAgb2ZmUGFydC5wbGF5YmFja1JhdGUgPSByYXRlO1xuICAgICAgICAgICAgY29uc3Qgbm90ZU9uRXZlbnRzID0gb25QYXJ0LnN0YXJ0KCk7XG4gICAgICAgICAgICBjb25zdCBub3RlT2ZmRXZlbnRzID0gb2ZmUGFydC5zdGFydCgpO1xuXG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cblxufVxuXG5leHBvcnQgZGVmYXVsdCBBbmltYXRpb247XG4iXX0=