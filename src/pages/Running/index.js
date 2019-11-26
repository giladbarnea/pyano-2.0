"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Glob_1 = require("../../Glob");
const util = require("../../util");
const bhe_1 = require("../../bhe");
const dialog_1 = require("./dialog");
const Piano_1 = require("../../Piano");
const midi_1 = require("@tonejs/midi");
const Tone = require("tone");
async function load(reload) {
    console.group(`pages.Running.index.load(${reload})`);
    Glob_1.default.BigConfig.last_page = "running";
    if (reload) {
        console.groupEnd();
        return util.reloadPage();
    }
    Tone.context.latencyHint = "playback";
    Glob_1.default.Sidebar.remove();
    const subconfig = Glob_1.default.BigConfig.getSubconfig();
    const pianoOptions = {
        samples: SALAMANDER_PATH_ABS,
        release: true,
        pedal: false,
        velocities: 1,
    };
    if (Glob_1.default.BigConfig.dev.mute_animation()) {
        console.warn(`Glob.BigConfig.dev.mute_animation()`);
        pianoOptions.volume = { strings: -Infinity, harmonics: -Infinity, keybed: -Infinity, pedal: -Infinity };
    }
    const piano = new Piano_1.Piano(pianoOptions).toDestination();
    await piano.load();
    console.log('piano loaded');
    const midi = await midi_1.Midi.fromUrl(subconfig.truth.midi.absPath);
    console.log('midi loaded');
    const noteOffCallback = (time, event) => {
        piano.keyUp(event.name, time);
    };
    const noteOnCallback = (time, event) => {
        piano.keyDown(event.name, time, event.velocity);
    };
    let noteOffObjs = [];
    let noteOnObjs = [];
    let notes;
    const maxAnimationNotes = Glob_1.default.BigConfig.dev.max_animation_notes();
    if (maxAnimationNotes) {
        notes = midi.tracks[0].notes.slice(0, maxAnimationNotes);
    }
    else {
        notes = midi.tracks[0].notes;
    }
    for (let note of notes) {
        let { name, velocity, duration, time: timeOn } = note;
        let timeOff = timeOn + duration;
        noteOffObjs.push({ name, time: timeOff });
        noteOnObjs.push({ name, time: timeOn, duration, velocity });
    }
    const noteOffEvents = new Tone.Part(noteOffCallback, noteOffObjs).start(0, "+0.1");
    const noteOnEvents = new Tone.Part(noteOnCallback, noteOnObjs).start(0);
    Tone.Transport.start();
    remote.globalShortcut.register("M", () => Tone.Transport.toggle());
    console.log({ subconfig, midi, piano, "Tone.Context.getDefaults()": Tone.Context.getDefaults(), });
    Glob_1.default.Title.html(`${subconfig.truth.name}`);
    const subtitle = bhe_1.elem({ tag: 'h3', text: '1/1' });
    const dialog = new dialog_1.default(subconfig.demo_type);
    Glob_1.default.MainContent.append(subtitle, dialog);
    console.groupEnd();
}
exports.load = load;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUE4QjtBQUM5QixtQ0FBbUM7QUFDbkMsbUNBQWlDO0FBRWpDLHFDQUE2QjtBQUU3Qix1Q0FBaUQ7QUFDakQsdUNBQW9DO0FBQ3BDLDZCQUE2QjtBQU83QixLQUFLLFVBQVUsSUFBSSxDQUFDLE1BQWU7SUFFL0IsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUVyRCxjQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDckMsSUFBSyxNQUFNLEVBQUc7UUFDVixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkIsT0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDNUI7SUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7SUFDdEMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN0QixNQUFNLFNBQVMsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ2hELE1BQU0sWUFBWSxHQUEwQjtRQUN4QyxPQUFPLEVBQUcsbUJBQW1CO1FBQzdCLE9BQU8sRUFBRyxJQUFJO1FBQ2QsS0FBSyxFQUFHLEtBQUs7UUFDYixVQUFVLEVBQUcsQ0FBQztLQUNqQixDQUFDO0lBQ0YsSUFBSyxjQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsRUFBRztRQUN2QyxPQUFPLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDcEQsWUFBWSxDQUFDLE1BQU0sR0FBRyxFQUFFLE9BQU8sRUFBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRyxDQUFDLFFBQVEsRUFBRSxDQUFB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SSxDQUFDLEVBQUUsR0FBRyxFQUFHLElBQUksRUFBRSxJQUFJLEVBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNwRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGdCQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRS9DLGNBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUNuQixRQUFRLEVBQ1IsTUFBTSxDQUNULENBQUM7SUFDRixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7QUFFdkIsQ0FBQztBQUVRLG9CQUFJIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEdsb2IgZnJvbSBcIi4uLy4uL0dsb2JcIjtcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4uLy4uL3V0aWxcIjtcbmltcG9ydCB7IGVsZW0gfSBmcm9tIFwiLi4vLi4vYmhlXCI7XG5pbXBvcnQgYW5pbWF0aW9uIGZyb20gJy4vYW5pbWF0aW9uJ1xuaW1wb3J0IERpYWxvZyBmcm9tICcuL2RpYWxvZydcbi8vIGltcG9ydCB7IFBpYW5vIH0gZnJvbSBcIi4uLy4uL1BpYW5vXCJcbmltcG9ydCB7IFBpYW5vLCBQaWFub09wdGlvbnMgfSBmcm9tIFwiLi4vLi4vUGlhbm9cIlxuaW1wb3J0IHsgTWlkaSB9IGZyb20gXCJAdG9uZWpzL21pZGlcIjtcbmltcG9ydCAqIGFzIFRvbmUgZnJvbSBcInRvbmVcIjtcblxuLy8gY29uc3QgeyBQaWFubyB9ID0gcmVxdWlyZShcIkB0b25lanMvcGlhbm9cIik7XG5cblxuLyoqaW1wb3J0ICogYXMgcnVubmluZ1BhZ2UgZnJvbSBcIi4uL1J1bm5pbmdcIlxuICogcmVxdWlyZSgnLi9SdW5uaW5nJykqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZChyZWxvYWQ6IGJvb2xlYW4pIHtcbiAgICAvLyAqKiAgUGVyZm9ybWFuY2UsIHZpc3VhbHMgc3luYzogaHR0cHM6Ly9naXRodWIuY29tL1RvbmVqcy9Ub25lLmpzL3dpa2kvUGVyZm9ybWFuY2VcbiAgICBjb25zb2xlLmdyb3VwKGBwYWdlcy5SdW5uaW5nLmluZGV4LmxvYWQoJHtyZWxvYWR9KWApO1xuICAgIFxuICAgIEdsb2IuQmlnQ29uZmlnLmxhc3RfcGFnZSA9IFwicnVubmluZ1wiO1xuICAgIGlmICggcmVsb2FkICkge1xuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgIHJldHVybiB1dGlsLnJlbG9hZFBhZ2UoKTtcbiAgICB9XG4gICAgVG9uZS5jb250ZXh0LmxhdGVuY3lIaW50ID0gXCJwbGF5YmFja1wiO1xuICAgIEdsb2IuU2lkZWJhci5yZW1vdmUoKTtcbiAgICBjb25zdCBzdWJjb25maWcgPSBHbG9iLkJpZ0NvbmZpZy5nZXRTdWJjb25maWcoKTtcbiAgICBjb25zdCBwaWFub09wdGlvbnM6IFBhcnRpYWw8UGlhbm9PcHRpb25zPiA9IHtcbiAgICAgICAgc2FtcGxlcyA6IFNBTEFNQU5ERVJfUEFUSF9BQlMsXG4gICAgICAgIHJlbGVhc2UgOiB0cnVlLFxuICAgICAgICBwZWRhbCA6IGZhbHNlLFxuICAgICAgICB2ZWxvY2l0aWVzIDogMSxcbiAgICB9O1xuICAgIGlmICggR2xvYi5CaWdDb25maWcuZGV2Lm11dGVfYW5pbWF0aW9uKCkgKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgR2xvYi5CaWdDb25maWcuZGV2Lm11dGVfYW5pbWF0aW9uKClgKTtcbiAgICAgICAgcGlhbm9PcHRpb25zLnZvbHVtZSA9IHsgc3RyaW5ncyA6IC1JbmZpbml0eSwgaGFybW9uaWNzIDogLUluZmluaXR5LCBrZXliZWQgOiAtSW5maW5pdHksIHBlZGFsIDogLUluZmluaXR5IH1cbiAgICB9XG4gICAgY29uc3QgcGlhbm8gPSBuZXcgUGlhbm8ocGlhbm9PcHRpb25zKS50b0Rlc3RpbmF0aW9uKCk7XG4gICAgYXdhaXQgcGlhbm8ubG9hZCgpO1xuICAgIGNvbnNvbGUubG9nKCdwaWFubyBsb2FkZWQnKTtcbiAgICBjb25zdCBtaWRpID0gYXdhaXQgTWlkaS5mcm9tVXJsKHN1YmNvbmZpZy50cnV0aC5taWRpLmFic1BhdGgpO1xuICAgIGNvbnNvbGUubG9nKCdtaWRpIGxvYWRlZCcpO1xuICAgIFxuICAgIFxuICAgIHR5cGUgTm90ZU9mZkV2ZW50ID0geyBuYW1lOiBzdHJpbmcgfCBudW1iZXIgfTtcbiAgICB0eXBlIE5vdGVPbkV2ZW50ID0gTm90ZU9mZkV2ZW50ICYgeyB2ZWxvY2l0eTogbnVtYmVyIH07XG4gICAgdHlwZSBOb3RlT2ZmID0gTm90ZU9mZkV2ZW50ICYgeyB0aW1lOiBUb25lLlVuaXQuVGltZSB9O1xuICAgIHR5cGUgTm90ZU9uID0gTm90ZU9uRXZlbnQgJiB7IHRpbWU6IFRvbmUuVW5pdC5UaW1lLCBkdXJhdGlvbjogbnVtYmVyIH07XG4gICAgXG4gICAgY29uc3Qgbm90ZU9mZkNhbGxiYWNrID0gKHRpbWU6IFRvbmUuVW5pdC5UaW1lLCBldmVudDogTm90ZU9mZkV2ZW50KSA9PiB7XG4gICAgICAgIHBpYW5vLmtleVVwKGV2ZW50Lm5hbWUsIHRpbWUpO1xuICAgIH07XG4gICAgY29uc3Qgbm90ZU9uQ2FsbGJhY2sgPSAodGltZTogVG9uZS5Vbml0LlRpbWUsIGV2ZW50OiBOb3RlT25FdmVudCkgPT4ge1xuICAgICAgICBwaWFuby5rZXlEb3duKGV2ZW50Lm5hbWUsIHRpbWUsIGV2ZW50LnZlbG9jaXR5KTtcbiAgICB9O1xuICAgIFxuICAgIFxuICAgIGxldCBub3RlT2ZmT2JqczogTm90ZU9mZltdID0gW107XG4gICAgbGV0IG5vdGVPbk9ianM6IE5vdGVPbltdID0gW107XG4gICAgbGV0IG5vdGVzO1xuICAgIGNvbnN0IG1heEFuaW1hdGlvbk5vdGVzID0gR2xvYi5CaWdDb25maWcuZGV2Lm1heF9hbmltYXRpb25fbm90ZXMoKTtcbiAgICBpZiAoIG1heEFuaW1hdGlvbk5vdGVzICkge1xuICAgICAgICBub3RlcyA9IG1pZGkudHJhY2tzWzBdLm5vdGVzLnNsaWNlKDAsIG1heEFuaW1hdGlvbk5vdGVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBub3RlcyA9IG1pZGkudHJhY2tzWzBdLm5vdGVzO1xuICAgIH1cbiAgICBmb3IgKCBsZXQgbm90ZSBvZiBub3RlcyApIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgdmVsb2NpdHksIGR1cmF0aW9uLCB0aW1lIDogdGltZU9uIH0gPSBub3RlO1xuICAgICAgICBsZXQgdGltZU9mZiA9IHRpbWVPbiArIGR1cmF0aW9uO1xuICAgICAgICBub3RlT2ZmT2Jqcy5wdXNoKHsgbmFtZSwgdGltZSA6IHRpbWVPZmYgfSk7XG4gICAgICAgIG5vdGVPbk9ianMucHVzaCh7IG5hbWUsIHRpbWUgOiB0aW1lT24sIGR1cmF0aW9uLCB2ZWxvY2l0eSB9KTtcbiAgICB9XG4gICAgXG4gICAgY29uc3Qgbm90ZU9mZkV2ZW50cyA9IG5ldyBUb25lLlBhcnQobm90ZU9mZkNhbGxiYWNrLCBub3RlT2ZmT2Jqcykuc3RhcnQoMCwgXCIrMC4xXCIpO1xuICAgIGNvbnN0IG5vdGVPbkV2ZW50cyA9IG5ldyBUb25lLlBhcnQobm90ZU9uQ2FsbGJhY2ssIG5vdGVPbk9ianMpLnN0YXJ0KDApO1xuICAgIFRvbmUuVHJhbnNwb3J0LnN0YXJ0KCk7XG4gICAgXG4gICAgcmVtb3RlLmdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyKFwiTVwiLCAoKSA9PiBUb25lLlRyYW5zcG9ydC50b2dnbGUoKSk7XG4gICAgXG4gICAgY29uc29sZS5sb2coeyBzdWJjb25maWcsIG1pZGksIHBpYW5vLCBcIlRvbmUuQ29udGV4dC5nZXREZWZhdWx0cygpXCIgOiBUb25lLkNvbnRleHQuZ2V0RGVmYXVsdHMoKSwgfSk7XG4gICAgR2xvYi5UaXRsZS5odG1sKGAke3N1YmNvbmZpZy50cnV0aC5uYW1lfWApO1xuICAgIFxuICAgIGNvbnN0IHN1YnRpdGxlID0gZWxlbSh7IHRhZyA6ICdoMycsIHRleHQgOiAnMS8xJyB9KTtcbiAgICBjb25zdCBkaWFsb2cgPSBuZXcgRGlhbG9nKHN1YmNvbmZpZy5kZW1vX3R5cGUpO1xuICAgIFxuICAgIEdsb2IuTWFpbkNvbnRlbnQuYXBwZW5kKFxuICAgICAgICBzdWJ0aXRsZSxcbiAgICAgICAgZGlhbG9nXG4gICAgKTtcbiAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgXG59XG5cbmV4cG9ydCB7IGxvYWQgfVxuIl19