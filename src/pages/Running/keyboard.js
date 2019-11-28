"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../bhe");
const util = require("../../util");
const Glob_1 = require("../../Glob");
const Piano_1 = require("../../Piano");
const midi_1 = require("@tonejs/midi");
const Tone = require("tone");
const util_1 = require("../../util");
class Keyboard extends bhe_1.BetterHTMLElement {
    constructor() {
        console.group('Keyboard ctor');
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
            id: 'keyboard', children: keys
        });
        console.groupEnd();
    }
    async intro() {
        let noteOffObjs = [];
        let noteOnObjs = [];
        let notes;
        const maxAnimationNotes = Glob_1.default.BigConfig.dev.max_animation_notes();
        if (maxAnimationNotes) {
            notes = this.notes.slice(0, maxAnimationNotes);
        }
        else {
            notes = this.notes;
        }
        for (let note of notes) {
            let { name, velocity, duration, time: timeOn } = note;
            let timeOff = timeOn + duration;
            noteOffObjs.push({ name, time: timeOff });
            noteOnObjs.push({ name, time: timeOn, duration, velocity });
        }
        let count = 0;
        let done = false;
        const noteOffCallback = async (time, event) => {
            Tone.Draw.schedule(() => this.paintKey(event, false), time);
            this.piano.keyUp(event.name, time);
            console.log(event.name);
            count++;
            if (noteOffEvents.length === count) {
                const now = Tone.Transport.now();
                const util = require("../../util");
                const diff = now - time;
                await util.wait((diff * 1000), false);
                done = true;
                console.log('intro done', { event, time, now, diff, });
            }
        };
        const noteOnCallback = (time, event) => {
            Tone.Draw.schedule(() => this.paintKey(event, true), time);
            this.piano.keyDown(event.name, time, event.velocity);
        };
        const noteOffEvents = new Tone.Part(noteOffCallback, noteOffObjs).start();
        const noteOnEvents = new Tone.Part(noteOnCallback, noteOnObjs).start();
        console.log({ noteOffEvents });
        remote.globalShortcut.register("CommandOrControl+M", () => Tone.Transport.toggle());
        return await util_1.waitUntil(() => done, 5000, 300);
    }
    paintKey(event, on) {
        if (event.name.includes('#')) {
            let nohash = event.name.replace('#', '');
            this[nohash][event.name].toggleClass('on', on);
        }
        else {
            this[event.name].toggleClass('on', on);
        }
    }
    async initPiano(midiAbsPath) {
        console.group(`initPiano()`);
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
        const promisePianoLoaded = this.piano.load();
        const promiseMidiLoaded = midi_1.Midi.fromUrl(midiAbsPath);
        const [_, midi] = await Promise.all([promisePianoLoaded, promiseMidiLoaded]);
        console.log('piano loaded');
        console.log('midi loaded', midi);
        this.notes = midi.tracks[0].notes;
        Tone.Transport.start();
        console.groupEnd();
        return;
    }
}
exports.default = Keyboard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJrZXlib2FyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUE4QztBQUM5QyxtQ0FBa0M7QUFDbEMscUNBQThCO0FBQzlCLHVDQUFrRDtBQUNsRCx1Q0FBb0M7QUFDcEMsNkJBQTZCO0FBRTdCLHFDQUF1QztBQVl2QyxNQUFNLFFBQVMsU0FBUSx1QkFBaUI7SUFJcEM7UUFDSSxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRS9CLE1BQU0sSUFBSSxHQUFHO1lBQ1QsRUFBRSxFQUFHO2dCQUNELGtCQUFrQixFQUFHO29CQUNqQixLQUFLLEVBQUcsbUJBQW1CO2lCQUM5QjthQUNKO1lBQ0QsRUFBRSxFQUFHLGtCQUFrQjtTQUMxQixDQUFDO1FBQ0YsTUFBTSxhQUFhLEdBQUc7WUFDbEIsQ0FBQyxFQUFHLEdBQUc7WUFDUCxDQUFDLEVBQUcsR0FBRztZQUNQLENBQUMsRUFBRyxHQUFHO1lBQ1AsQ0FBQyxFQUFHLEdBQUc7WUFDUCxDQUFDLEVBQUcsR0FBRztZQUNQLENBQUMsRUFBRyxHQUFHO1lBQ1AsQ0FBQyxFQUFHLEdBQUc7U0FDVixDQUFDO1FBQ0YsTUFBTSxRQUFRLEdBQUcsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFDMUIsS0FBTSxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRztZQUNyQyxLQUFNLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHO2dCQUNyQyxJQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3JDLElBQUksSUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLFFBQVEsRUFBRSxDQUFDO2dCQUNsQyxJQUFJLEtBQUssQ0FBQztnQkFDVixJQUFLLFFBQVEsQ0FBQyxRQUFRLENB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LEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLENBQUUsQ0FBQyxDQUFDO1FBRWpGLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNsQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQixPQUFPO0lBY1gsQ0FBQztDQUNKO0FBR0Qsa0JBQWUsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmV0dGVySFRNTEVsZW1lbnQgfSBmcm9tIFwiLi4vLi4vYmhlXCI7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gXCIuLi8uLi91dGlsXCJcbmltcG9ydCBHbG9iIGZyb20gXCIuLi8uLi9HbG9iXCI7XG5pbXBvcnQgeyBQaWFubywgUGlhbm9PcHRpb25zIH0gZnJvbSBcIi4uLy4uL1BpYW5vXCI7XG5pbXBvcnQgeyBNaWRpIH0gZnJvbSBcIkB0b25lanMvbWlkaVwiO1xuaW1wb3J0ICogYXMgVG9uZSBmcm9tIFwidG9uZVwiO1xuaW1wb3J0IHsgTm90ZSB9IGZyb20gXCJAdG9uZWpzL21pZGkvZGlzdC9Ob3RlXCI7XG5pbXBvcnQgeyB3YWl0VW50aWwgfSBmcm9tIFwiLi4vLi4vdXRpbFwiO1xuXG4vLyBpbXBvcnQgKiBhcyBUb25lIGZyb20gXCJ0b25lXCI7XG4vLyBpbXBvcnQgTm90ZSA9IFRvbmUuRW5jb2RpbmcuTm90ZTtcbi8vIGltcG9ydCBhc3ggZnJvbSBcIi4uLy4uL2FzeFwiO1xuXG5cbnR5cGUgTm90ZU9mZkV2ZW50ID0geyBuYW1lOiBzdHJpbmcgfTtcbnR5cGUgTm90ZU9uRXZlbnQgPSBOb3RlT2ZmRXZlbnQgJiB7IHZlbG9jaXR5OiBudW1iZXIgfTtcbnR5cGUgTm90ZU9mZiA9IE5vdGVPZmZFdmVudCAmIHsgdGltZTogVG9uZS5Vbml0LlRpbWUgfTtcbnR5cGUgTm90ZU9uID0gTm90ZU9uRXZlbnQgJiB7IHRpbWU6IFRvbmUuVW5pdC5UaW1lLCBkdXJhdGlvbjogbnVtYmVyIH07XG5cbmNsYXNzIEtleWJvYXJkIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIHByaXZhdGUgbm90ZXM6IE5vdGVbXTtcbiAgICBwcml2YXRlIHBpYW5vOiBQaWFubztcbiAgICBcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc29sZS5ncm91cCgnS2V5Ym9hcmQgY3RvcicpO1xuICAgICAgICBcbiAgICAgICAgY29uc3Qga2V5cyA9IHtcbiAgICAgICAgICAgIEEwIDoge1xuICAgICAgICAgICAgICAgICdbZGF0YS1ub3RlPVwiQTBcIl0nIDoge1xuICAgICAgICAgICAgICAgICAgICAnQSMwJyA6ICdbZGF0YS1ub3RlPVwiQSMwXCJdJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBCMCA6ICdbZGF0YS1ub3RlPVwiQjBcIl0nLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBpbmRleFRvTGV0dGVyID0ge1xuICAgICAgICAgICAgMSA6IFwiQ1wiLFxuICAgICAgICAgICAgMiA6IFwiRFwiLFxuICAgICAgICAgICAgMyA6IFwiRVwiLFxuICAgICAgICAgICAgNCA6IFwiRlwiLFxuICAgICAgICAgICAgNSA6IFwiR1wiLFxuICAgICAgICAgICAgNiA6IFwiQVwiLFxuICAgICAgICAgICAgNyA6IFwiQlwiXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG5vYmxhY2tzID0gWyAzLCA3IF07IC8vIEUsIEJcbiAgICAgICAgZm9yICggbGV0IHJlZ2lzdGVyIG9mIHV0aWwucmFuZ2UoMSwgNykgKSB7XG4gICAgICAgICAgICBmb3IgKCBsZXQga2V5SW5kZXggb2YgdXRpbC5yYW5nZSgxLCA3KSApIHtcbiAgICAgICAgICAgICAgICBsZXQgbGV0dGVyID0gaW5kZXhUb0xldHRlcltrZXlJbmRleF07XG4gICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBgJHtsZXR0ZXJ9JHtyZWdpc3Rlcn1gO1xuICAgICAgICAgICAgICAgIGxldCB2YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoIG5vYmxhY2tzLmluY2x1ZGVzKGtleUluZGV4KSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBgW2RhdGEtbm90ZT1cIiR7bmFtZX1cIl1gXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFtkYXRhLW5vdGU9XCIke25hbWV9XCJdYDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1Ym5hbWUgPSBgJHtsZXR0ZXJ9IyR7cmVnaXN0ZXJ9YDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1YnF1ZXJ5ID0gYFtkYXRhLW5vdGU9XCIke3N1Ym5hbWV9XCJdYDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1YnZhbHVlID0ge307XG4gICAgICAgICAgICAgICAgICAgIHN1YnZhbHVlW3N1Ym5hbWVdID0gc3VicXVlcnk7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0ge307XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlW3F1ZXJ5XSA9IHN1YnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBrZXlzW25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgaWQgOiAna2V5Ym9hcmQnLCBjaGlsZHJlbiA6IGtleXNcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIHRoaXMuaW5pdFBpYW5vKCk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBhc3luYyBpbnRybygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgbGV0IG5vdGVPZmZPYmpzOiBOb3RlT2ZmW10gPSBbXTtcbiAgICAgICAgbGV0IG5vdGVPbk9ianM6IE5vdGVPbltdID0gW107XG4gICAgICAgIGxldCBub3RlczogTm90ZVtdO1xuICAgICAgICBjb25zdCBtYXhBbmltYXRpb25Ob3RlcyA9IEdsb2IuQmlnQ29uZmlnLmRldi5tYXhfYW5pbWF0aW9uX25vdGVzKCk7XG4gICAgICAgIGlmICggbWF4QW5pbWF0aW9uTm90ZXMgKSB7XG4gICAgICAgICAgICBub3RlcyA9IHRoaXMubm90ZXMuc2xpY2UoMCwgbWF4QW5pbWF0aW9uTm90ZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm90ZXMgPSB0aGlzLm5vdGVzO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoIGxldCBub3RlIG9mIG5vdGVzICkge1xuICAgICAgICAgICAgbGV0IHsgbmFtZSwgdmVsb2NpdHksIGR1cmF0aW9uLCB0aW1lIDogdGltZU9uIH0gPSBub3RlO1xuICAgICAgICAgICAgbGV0IHRpbWVPZmYgPSB0aW1lT24gKyBkdXJhdGlvbjtcbiAgICAgICAgICAgIG5vdGVPZmZPYmpzLnB1c2goeyBuYW1lLCB0aW1lIDogdGltZU9mZiB9KTtcbiAgICAgICAgICAgIG5vdGVPbk9ianMucHVzaCh7IG5hbWUsIHRpbWUgOiB0aW1lT24sIGR1cmF0aW9uLCB2ZWxvY2l0eSB9KTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICBsZXQgZG9uZSA9IGZhbHNlO1xuICAgICAgICBjb25zdCBub3RlT2ZmQ2FsbGJhY2sgPSBhc3luYyAodGltZTogVG9uZS5Vbml0LlRpbWUsIGV2ZW50OiBOb3RlT2ZmRXZlbnQpID0+IHtcbiAgICAgICAgICAgIFRvbmUuRHJhdy5zY2hlZHVsZSgoKSA9PiB0aGlzLnBhaW50S2V5KGV2ZW50LCBmYWxzZSksIHRpbWUpO1xuICAgICAgICAgICAgdGhpcy5waWFuby5rZXlVcChldmVudC5uYW1lLCB0aW1lKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGV2ZW50Lm5hbWUpO1xuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCBub3RlT2ZmRXZlbnRzLmxlbmd0aCA9PT0gY291bnQgKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm93ID0gVG9uZS5UcmFuc3BvcnQubm93KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdXRpbCA9IHJlcXVpcmUoXCIuLi8uLi91dGlsXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpZmYgPSBub3cgLSB0aW1lO1xuICAgICAgICAgICAgICAgIGF3YWl0IHV0aWwud2FpdCgoZGlmZiAqIDEwMDApLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ludHJvIGRvbmUnLCB7IGV2ZW50LCB0aW1lLCBub3csIGRpZmYsIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG5vdGVPbkNhbGxiYWNrID0gKHRpbWU6IFRvbmUuVW5pdC5UaW1lLCBldmVudDogTm90ZU9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgIFRvbmUuRHJhdy5zY2hlZHVsZSgoKSA9PiB0aGlzLnBhaW50S2V5KGV2ZW50LCB0cnVlKSwgdGltZSk7XG4gICAgICAgICAgICB0aGlzLnBpYW5vLmtleURvd24oZXZlbnQubmFtZSwgdGltZSwgZXZlbnQudmVsb2NpdHkpO1xuICAgICAgICB9O1xuICAgICAgICAvLyBjb25zdCBub3cgPSBUb25lLlRyYW5zcG9ydC5ub3coKTtcbiAgICAgICAgY29uc3Qgbm90ZU9mZkV2ZW50cyA9IG5ldyBUb25lLlBhcnQobm90ZU9mZkNhbGxiYWNrLCBub3RlT2ZmT2Jqcykuc3RhcnQoKTtcbiAgICAgICAgY29uc3Qgbm90ZU9uRXZlbnRzID0gbmV3IFRvbmUuUGFydChub3RlT25DYWxsYmFjaywgbm90ZU9uT2Jqcykuc3RhcnQoKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyh7IG5vdGVPZmZFdmVudHMgfSk7XG4gICAgICAgIHJlbW90ZS5nbG9iYWxTaG9ydGN1dC5yZWdpc3RlcihcIkNvbW1hbmRPckNvbnRyb2wrTVwiLCAoKSA9PiBUb25lLlRyYW5zcG9ydC50b2dnbGUoKSk7XG4gICAgICAgIHJldHVybiBhd2FpdCB3YWl0VW50aWwoKCkgPT4gZG9uZSwgNTAwMCwgMzAwKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHBhaW50S2V5KGV2ZW50LCBvbjogYm9vbGVhbikge1xuICAgICAgICBpZiAoIGV2ZW50Lm5hbWUuaW5jbHVkZXMoJyMnKSApIHtcbiAgICAgICAgICAgIGxldCBub2hhc2ggPSBldmVudC5uYW1lLnJlcGxhY2UoJyMnLCAnJyk7XG4gICAgICAgICAgICB0aGlzW25vaGFzaF1bZXZlbnQubmFtZV0udG9nZ2xlQ2xhc3MoJ29uJywgb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpc1tldmVudC5uYW1lXS50b2dnbGVDbGFzcygnb24nLCBvbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgYXN5bmMgaW5pdFBpYW5vKG1pZGlBYnNQYXRoOnN0cmluZykge1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBpbml0UGlhbm8oKWApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcGlhbm9PcHRpb25zOiBQYXJ0aWFsPFBpYW5vT3B0aW9ucz4gPSB7XG4gICAgICAgICAgICBzYW1wbGVzIDogU0FMQU1BTkRFUl9QQVRIX0FCUyxcbiAgICAgICAgICAgIHJlbGVhc2UgOiB0cnVlLFxuICAgICAgICAgICAgcGVkYWwgOiBmYWxzZSxcbiAgICAgICAgICAgIHZlbG9jaXRpZXMgOiBHbG9iLkJpZ0NvbmZpZy52ZWxvY2l0aWVzLFxuICAgICAgICB9O1xuICAgICAgICBpZiAoIEdsb2IuQmlnQ29uZmlnLmRldi5tdXRlX2FuaW1hdGlvbigpICkge1xuICAgICAgICAgICAgcGlhbm9PcHRpb25zLnZvbHVtZSA9IHsgc3RyaW5ncyA6IC1JbmZpbml0eSwgaGFybW9uaWNzIDogLUluZmluaXR5LCBrZXliZWQgOiAtSW5maW5pdHksIHBlZGFsIDogLUluZmluaXR5IH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBpYW5vID0gbmV3IFBpYW5vKHBpYW5vT3B0aW9ucykudG9EZXN0aW5hdGlvbigpO1xuICAgICAgICBjb25zdCBwcm9taXNlUGlhbm9Mb2FkZWQgPSB0aGlzLnBpYW5vLmxvYWQoKTtcbiAgICAgICAgY29uc3QgcHJvbWlzZU1pZGlMb2FkZWQgPSBNaWRpLmZyb21VcmwobWlkaUFic1BhdGgpO1xuICAgICAgICBjb25zdCBbIF8sIG1pZGkgXSA9IGF3YWl0IFByb21pc2UuYWxsKFsgcHJvbWlzZVBpYW5vTG9hZGVkLCBwcm9taXNlTWlkaUxvYWRlZCBdKTtcbiAgICAgICAgLy8gY29uc3QgbWlkaSA9IGF3YWl0IE1pZGkuZnJvbVVybChzdWJjb25maWcudHJ1dGgubWlkaS5hYnNQYXRoKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3BpYW5vIGxvYWRlZCcpO1xuICAgICAgICBjb25zb2xlLmxvZygnbWlkaSBsb2FkZWQnLCBtaWRpKTtcbiAgICAgICAgdGhpcy5ub3RlcyA9IG1pZGkudHJhY2tzWzBdLm5vdGVzO1xuICAgICAgICBUb25lLlRyYW5zcG9ydC5zdGFydCgpO1xuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgIC8vIGNvbnN0IG5vdGVPZmZDYWxsYmFjayA9ICh0aW1lOiBUb25lLlVuaXQuVGltZSwgZXZlbnQ6IE5vdGVPZmZFdmVudCkgPT4ge1xuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgVG9uZS5EcmF3LnNjaGVkdWxlKCgpID0+IHRoaXMucGFpbnRLZXkoZXZlbnQsIGZhbHNlKSwgdGltZSk7XG4gICAgICAgIC8vICAgICBwaWFuby5rZXlVcChldmVudC5uYW1lLCB0aW1lKTtcbiAgICAgICAgLy8gfTtcbiAgICAgICAgXG4gICAgICAgIC8vIGNvbnN0IG5vdGVPbkNhbGxiYWNrID0gKHRpbWU6IFRvbmUuVW5pdC5UaW1lLCBldmVudDogTm90ZU9uRXZlbnQpID0+IHtcbiAgICAgICAgLy8gICAgIFRvbmUuRHJhdy5zY2hlZHVsZSgoKSA9PiB0aGlzLnBhaW50S2V5KGV2ZW50LCB0cnVlKSwgdGltZSk7XG4gICAgICAgIC8vICAgICBwaWFuby5rZXlEb3duKGV2ZW50Lm5hbWUsIHRpbWUsIGV2ZW50LnZlbG9jaXR5KTtcbiAgICAgICAgLy8gfTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbn1cblxuLy8gY29uc3Qga2V5Ym9hcmQgPSBuZXcgS2V5Ym9hcmQoKTtcbmV4cG9ydCBkZWZhdWx0IEtleWJvYXJkO1xuIl19