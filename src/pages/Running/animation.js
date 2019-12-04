"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("../../util");
const Glob_1 = require("../../Glob");
const Piano_1 = require("../../Piano");
const midi_1 = require("@tonejs/midi");
const Tone = require("tone");
const bhe_1 = require("../../bhe");
class Animation extends bhe_1.VisualBHE {
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
            id: 'animation', children: keys
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
                    const util = require("../../util");
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
}
exports.default = Animation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5pbWF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQWtDO0FBQ2xDLHFDQUE4QjtBQUM5Qix1Q0FBa0Q7QUFDbEQsdUNBQW9DO0FBQ3BDLDZCQUE2QjtBQUM3QixtQ0FBc0M7QUFRdEMsTUFBTSxTQUFVLFNBQVEsZUFBUztJQUs3QjtRQUVJLE1BQU0sSUFBSSxHQUFHO1lBQ1QsRUFBRSxFQUFHO2dCQUNELGtCQUFrQixFQUFHO29CQUNqQixLQUFLLEVBQUcsbUJBQW1CO2lCQUM5QjthQUNKO1lBQ0QsRUFBRSxFQUFHLGtCQUFrQjtTQUMxQixDQUFDO1FBQ0YsTUFBTSxhQUFhLEdBQUc7WUFDbEIsQ0FBQyxFQUFHLEdBQUc7WUFDUCxDQUFDLEVBQUcsR0FBRztZQUNQLENBQUMsRUFBRyxHQUFHO1lBQ1AsQ0FBQyxFQUFHLEdBQUc7WUFDUCxDQUFDLEVBQUcsR0FBRztZQUNQLENBQUMsRUFBRyxHQUFHO1lBQ1AsQ0FBQyxFQUFHLEdBQUc7U0FDVixDQUFDO1FBQ0YsTUFBTSxRQUFRLEdBQUcsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7UUFDMUIsS0FBTSxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRztZQUNyQyxLQUFNLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHO2dCQUNyQyxJQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3JDLElBQUksSUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLFFBQVEsRUFBRSxDQUFDO2dCQUNsQyxJQUFJLEtBQUssQ0FBQztnQkFDVixJQUFLLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUc7b0JBQy9CLEtBQUssR0FBRyxlQUFlLElBQUksSUFBSSxDQUFB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QUFDO1lBRTNCLE1BQU0sT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDekQsT0FBTyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDNUIsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3BDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUcxQyxDQUFDLENBQUMsQ0FBQztJQUVQLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSztRQUNQLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNuQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsQixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkIsT0FBTztJQUdYLENBQUM7SUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWEsRUFBRSxJQUFZO1FBQ3hDLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLEtBQUssV0FBVyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0IsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25CLE9BQU87SUFDWCxDQUFDO0NBR0o7QUFFRCxrQkFBZSxTQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyB1dGlsIGZyb20gXCIuLi8uLi91dGlsXCJcbmltcG9ydCBHbG9iIGZyb20gXCIuLi8uLi9HbG9iXCI7XG5pbXBvcnQgeyBQaWFubywgUGlhbm9PcHRpb25zIH0gZnJvbSBcIi4uLy4uL1BpYW5vXCI7XG5pbXBvcnQgeyBNaWRpIH0gZnJvbSBcIkB0b25lanMvbWlkaVwiO1xuaW1wb3J0ICogYXMgVG9uZSBmcm9tIFwidG9uZVwiO1xuaW1wb3J0IHsgVmlzdWFsQkhFIH0gZnJvbSBcIi4uLy4uL2JoZVwiO1xuXG50eXBlIE5vdGVFdmVudCA9IHsgbmFtZTogc3RyaW5nIH07XG4vLyB0eXBlIE5vdGVPZmZFdmVudCA9IHsgbmFtZTogc3RyaW5nIH07XG50eXBlIE5vdGVPbkV2ZW50ID0gTm90ZUV2ZW50ICYgeyB2ZWxvY2l0eTogbnVtYmVyIH07XG50eXBlIE5vdGVPZmYgPSBOb3RlRXZlbnQgJiB7IHRpbWU6IFRvbmUuVW5pdC5UaW1lIH07XG50eXBlIE5vdGVPbiA9IE5vdGVPbkV2ZW50ICYgeyB0aW1lOiBUb25lLlVuaXQuVGltZSwgZHVyYXRpb246IG51bWJlciB9O1xuXG5jbGFzcyBBbmltYXRpb24gZXh0ZW5kcyBWaXN1YWxCSEUge1xuICAgIHByaXZhdGUgcGlhbm86IFBpYW5vO1xuICAgIHByaXZhdGUgbm90ZU9uczogTm90ZU9uW107XG4gICAgcHJpdmF0ZSBub3RlT2ZmczogTm90ZU9mZltdO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBcbiAgICAgICAgY29uc3Qga2V5cyA9IHtcbiAgICAgICAgICAgIEEwIDoge1xuICAgICAgICAgICAgICAgICdbZGF0YS1ub3RlPVwiQTBcIl0nIDoge1xuICAgICAgICAgICAgICAgICAgICAnQSMwJyA6ICdbZGF0YS1ub3RlPVwiQSMwXCJdJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBCMCA6ICdbZGF0YS1ub3RlPVwiQjBcIl0nLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBpbmRleFRvTGV0dGVyID0ge1xuICAgICAgICAgICAgMSA6IFwiQ1wiLFxuICAgICAgICAgICAgMiA6IFwiRFwiLFxuICAgICAgICAgICAgMyA6IFwiRVwiLFxuICAgICAgICAgICAgNCA6IFwiRlwiLFxuICAgICAgICAgICAgNSA6IFwiR1wiLFxuICAgICAgICAgICAgNiA6IFwiQVwiLFxuICAgICAgICAgICAgNyA6IFwiQlwiXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG5vYmxhY2tzID0gWyAzLCA3IF07IC8vIEUsIEJcbiAgICAgICAgZm9yICggbGV0IHJlZ2lzdGVyIG9mIHV0aWwucmFuZ2UoMSwgNykgKSB7XG4gICAgICAgICAgICBmb3IgKCBsZXQga2V5SW5kZXggb2YgdXRpbC5yYW5nZSgxLCA3KSApIHtcbiAgICAgICAgICAgICAgICBsZXQgbGV0dGVyID0gaW5kZXhUb0xldHRlcltrZXlJbmRleF07XG4gICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBgJHtsZXR0ZXJ9JHtyZWdpc3Rlcn1gO1xuICAgICAgICAgICAgICAgIGxldCB2YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoIG5vYmxhY2tzLmluY2x1ZGVzKGtleUluZGV4KSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBgW2RhdGEtbm90ZT1cIiR7bmFtZX1cIl1gXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFtkYXRhLW5vdGU9XCIke25hbWV9XCJdYDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1Ym5hbWUgPSBgJHtsZXR0ZXJ9IyR7cmVnaXN0ZXJ9YDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1YnF1ZXJ5ID0gYFtkYXRhLW5vdGU9XCIke3N1Ym5hbWV9XCJdYDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1YnZhbHVlID0ge307XG4gICAgICAgICAgICAgICAgICAgIHN1YnZhbHVlW3N1Ym5hbWVdID0gc3VicXVlcnk7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0ge307XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlW3F1ZXJ5XSA9IHN1YnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBrZXlzW25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgaWQgOiAnYW5pbWF0aW9uJywgY2hpbGRyZW4gOiBrZXlzXG4gICAgICAgIH0pO1xuICAgICAgICAvLyB0aGlzLmluaXRQaWFubygpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGluaXQobWlkaUFic1BhdGg6IHN0cmluZykge1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBBbmltYXRpb24uaW5pdCgpYCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBwaWFub09wdGlvbnM6IFBhcnRpYWw8UGlhbm9PcHRpb25zPiA9IHtcbiAgICAgICAgICAgIHNhbXBsZXMgOiBTQUxBTUFOREVSX1BBVEhfQUJTLFxuICAgICAgICAgICAgcmVsZWFzZSA6IHRydWUsXG4gICAgICAgICAgICBwZWRhbCA6IGZhbHNlLFxuICAgICAgICAgICAgdmVsb2NpdGllcyA6IEdsb2IuQmlnQ29uZmlnLnZlbG9jaXRpZXMsXG4gICAgICAgIH07XG4gICAgICAgIGlmICggR2xvYi5CaWdDb25maWcuZGV2Lm11dGVfYW5pbWF0aW9uKCkgKSB7XG4gICAgICAgICAgICBwaWFub09wdGlvbnMudm9sdW1lID0geyBzdHJpbmdzIDogLUluZmluaXR5LCBoYXJtb25pY3MgOiAtSW5maW5pdHksIGtleWJlZCA6IC1JbmZpbml0eSwgcGVkYWwgOiAtSW5maW5pdHkgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucGlhbm8gPSBuZXcgUGlhbm8ocGlhbm9PcHRpb25zKS50b0Rlc3RpbmF0aW9uKCk7XG4gICAgICAgIGNvbnN0IGxvYWRQaWFubyA9IHRoaXMucGlhbm8ubG9hZCgpO1xuICAgICAgICBjb25zdCBsb2FkTWlkaSA9IE1pZGkuZnJvbVVybChtaWRpQWJzUGF0aCk7XG4gICAgICAgIGNvbnN0IFsgXywgbWlkaSBdID0gYXdhaXQgUHJvbWlzZS5hbGwoWyBsb2FkUGlhbm8sIGxvYWRNaWRpIF0pO1xuICAgICAgICBjb25zb2xlLmxvZygncGlhbm8gbG9hZGVkLCBtaWRpIGxvYWRlZDogJywgbWlkaSk7XG4gICAgICAgIGNvbnN0IG5vdGVzID0gbWlkaS50cmFja3NbMF0ubm90ZXM7XG4gICAgICAgIFRvbmUuY29udGV4dC5sYXRlbmN5SGludCA9IFwicGxheWJhY2tcIjtcbiAgICAgICAgVG9uZS5UcmFuc3BvcnQuc3RhcnQoKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBsZXQgbm90ZU9uczogTm90ZU9uW10gPSBbXTtcbiAgICAgICAgbGV0IG5vdGVPZmZzOiBOb3RlT2ZmW10gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoIGxldCBub3RlIG9mIG5vdGVzICkge1xuICAgICAgICAgICAgbGV0IHsgbmFtZSwgdmVsb2NpdHksIGR1cmF0aW9uLCB0aW1lIDogdGltZU9uIH0gPSBub3RlO1xuICAgICAgICAgICAgbGV0IHRpbWVPZmYgPSB0aW1lT24gKyBkdXJhdGlvbjtcbiAgICAgICAgICAgIG5vdGVPbnMucHVzaCh7IG5hbWUsIHRpbWUgOiB0aW1lT24sIGR1cmF0aW9uLCB2ZWxvY2l0eSB9KTtcbiAgICAgICAgICAgIG5vdGVPZmZzLnB1c2goeyBuYW1lLCB0aW1lIDogdGltZU9mZiB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5vdGVPbnMgPSBub3RlT25zO1xuICAgICAgICB0aGlzLm5vdGVPZmZzID0gbm90ZU9mZnM7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgcGFpbnRLZXkoeyBuYW1lIH06IE5vdGVFdmVudCwgY29sb3I6IFwicmVkXCIgfCBcImdyZWVuXCIgfCBcImJsdWVcIiwgb246IGJvb2xlYW4pIHtcbiAgICAgICAgbGV0IGNoaWxkO1xuICAgICAgICBpZiAoIG5hbWUuaW5jbHVkZXMoJyMnKSApIHtcbiAgICAgICAgICAgIGxldCBub2hhc2ggPSBuYW1lLnJlcGxhY2UoJyMnLCAnJyk7XG4gICAgICAgICAgICBjaGlsZCA9IHRoaXNbbm9oYXNoXVtuYW1lXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoaWxkID0gdGhpc1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgICBjaGlsZC50b2dnbGVDbGFzcyhjb2xvciwgb24pO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHBsYXkobm90ZXM/OiBudW1iZXIsIHJhdGU/OiBudW1iZXIpOiBQcm9taXNlPHVua25vd24+IHtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IG5vdGVPbkNhbGxiYWNrID0gKHRpbWU6IFRvbmUuVW5pdC5UaW1lLCBldmVudDogTm90ZU9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBUb25lLkRyYXcuc2NoZWR1bGUoKCkgPT4gdGhpcy5wYWludEtleShldmVudCwgXCJncmVlblwiLCB0cnVlKSwgdGltZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5waWFuby5rZXlEb3duKGV2ZW50Lm5hbWUsIHRpbWUsIGV2ZW50LnZlbG9jaXR5KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBub3RlT2ZmQ2FsbGJhY2sgPSBhc3luYyAodGltZTogVG9uZS5Vbml0LlRpbWUsIGV2ZW50OiBOb3RlRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBUb25lLkRyYXcuc2NoZWR1bGUoKCkgPT4gdGhpcy5wYWludEtleShldmVudCwgXCJncmVlblwiLCBmYWxzZSksIHRpbWUpO1xuICAgICAgICAgICAgICAgIHRoaXMucGlhbm8ua2V5VXAoZXZlbnQubmFtZSwgdGltZSk7XG4gICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoIG5vdGVPZmZFdmVudHMubGVuZ3RoID09PSBjb3VudCApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm93ID0gVG9uZS5UcmFuc3BvcnQubm93KCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHV0aWwgPSByZXF1aXJlKFwiLi4vLi4vdXRpbFwiKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaWZmID0gbm93IC0gdGltZTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdXRpbC53YWl0KChkaWZmICogMTAwMCksIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FuaW1hdGlvbiBlbmRlZCEnKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gY29uc3Qgbm93ID0gVG9uZS5UcmFuc3BvcnQubm93KCk7XG4gICAgICAgICAgICBsZXQgbm90ZU9mZnM7XG4gICAgICAgICAgICBsZXQgbm90ZU9ucztcbiAgICAgICAgICAgIGlmICggbm90ZXMgKSB7XG4gICAgICAgICAgICAgICAgbm90ZU9ucyA9IHRoaXMubm90ZU9ucy5zbGljZSgwLCBub3Rlcyk7XG4gICAgICAgICAgICAgICAgbm90ZU9mZnMgPSB0aGlzLm5vdGVPZmZzLnNsaWNlKDAsIG5vdGVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm90ZU9ucyA9IHRoaXMubm90ZU9ucztcbiAgICAgICAgICAgICAgICBub3RlT2ZmcyA9IHRoaXMubm90ZU9mZnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBvblBhcnQgPSBuZXcgVG9uZS5QYXJ0KG5vdGVPbkNhbGxiYWNrLCBub3RlT25zKTtcbiAgICAgICAgICAgIG9uUGFydC5wbGF5YmFja1JhdGUgPSByYXRlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBvZmZQYXJ0ID0gbmV3IFRvbmUuUGFydChub3RlT2ZmQ2FsbGJhY2ssIG5vdGVPZmZzKTtcbiAgICAgICAgICAgIG9mZlBhcnQucGxheWJhY2tSYXRlID0gcmF0ZTtcbiAgICAgICAgICAgIGNvbnN0IG5vdGVPbkV2ZW50cyA9IG9uUGFydC5zdGFydCgpO1xuICAgICAgICAgICAgY29uc3Qgbm90ZU9mZkV2ZW50cyA9IG9mZlBhcnQuc3RhcnQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgaW50cm8oKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYEFuaW1hdGlvbi5pbnRybygpYCk7XG4gICAgICAgIGF3YWl0IHRoaXMucGxheSgpO1xuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBhc3luYyBsZXZlbEludHJvKG5vdGVzOiBudW1iZXIsIHJhdGU6IG51bWJlcikge1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBBbmltYXRpb24ubGV2ZWxJbnRybyhub3RlczogJHtub3Rlc30sIHJhdGU6ICR7cmF0ZX0pYCk7XG4gICAgICAgIGF3YWl0IHRoaXMucGxheShub3RlcywgcmF0ZSk7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICBcbn1cblxuZXhwb3J0IGRlZmF1bHQgQW5pbWF0aW9uO1xuIl19