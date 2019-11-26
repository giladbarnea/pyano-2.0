"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Glob_1 = require("../../Glob");
const util = require("../../util");
const bhe_1 = require("../../bhe");
const keyboard_1 = require("./keyboard");
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
        velocities: 5,
    };
    if (Glob_1.default.BigConfig.dev.mute_animation()) {
        pianoOptions.volume = { strings: -Infinity, harmonics: -Infinity, keybed: -Infinity, pedal: -Infinity };
    }
    const piano = new Piano_1.Piano(pianoOptions).toDestination();
    await piano.load();
    console.log('piano loaded');
    const midi = await midi_1.Midi.fromUrl(subconfig.truth.midi.absPath);
    console.log('midi loaded');
    function noteOffCallback(time, event) {
        Tone.Draw.schedule(function () {
            console.log(event.name);
            if (event.name.includes('#')) {
                let nohash = event.name.replace('#', '');
                keyboard_1.default[nohash][event.name].removeClass('on');
            }
            else {
                keyboard_1.default[event.name].removeClass('on');
            }
        }, time);
        piano.keyUp(event.name, time);
    }
    function noteOnCallback(time, event) {
        Tone.Draw.schedule(function () {
            console.log(event.name);
            if (event.name.includes('#')) {
                let nohash = event.name.replace('#', '');
                keyboard_1.default[nohash][event.name].addClass('on');
            }
            else {
                keyboard_1.default[event.name].addClass('on');
            }
        }, time);
        piano.keyDown(event.name, time, event.velocity);
    }
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
    const now = Tone.Transport.now();
    const noteOffEvents = new Tone.Part(noteOffCallback, noteOffObjs).start(now);
    const noteOnEvents = new Tone.Part(noteOnCallback, noteOnObjs).start(now);
    Tone.Transport.start(now);
    remote.globalShortcut.register("CommandOrControl+M", () => Tone.Transport.toggle());
    console.log({ subconfig, midi, piano, "Tone.Context.getDefaults()": Tone.Context.getDefaults(), });
    Glob_1.default.Title.html(`${subconfig.truth.name}`);
    const subtitle = bhe_1.elem({ tag: 'h3', text: '1/1' });
    const dialog = new dialog_1.default(subconfig.demo_type);
    keyboard_1.default.class('active').before(subtitle, dialog);
    console.groupEnd();
}
exports.load = load;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUE4QjtBQUM5QixtQ0FBbUM7QUFDbkMsbUNBQWlDO0FBQ2pDLHlDQUFpQztBQUNqQyxxQ0FBNkI7QUFFN0IsdUNBQWlEO0FBQ2pELHVDQUFvQztBQUNwQyw2QkFBNkI7QUFPN0IsS0FBSyxVQUFVLElBQUksQ0FBQyxNQUFlO0lBRS9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFFckQsY0FBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQ3JDLElBQUssTUFBTSxFQUFHO1FBQ1YsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQzVCO0lBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0lBQ3RDLGNBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDdEIsTUFBTSxTQUFTLEdBQUcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNoRCxNQUFNLFlBQVksR0FBMEI7UUFDeEMsT0FBTyxFQUFHLG1CQUFtQjtRQUM3QixPQUFPLEVBQUcsSUFBSTtRQUNkLEtBQUssRUFBRyxLQUFLO1FBQ2IsVUFBVSxFQUFHLENBQUM7S0FDakIsQ0FBQztJQUNGLElBQUssY0FBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEVBQUc7UUFDdkMsWUFBWSxDQUFDLE1BQU0sR0FBRyxFQUFFLE9BQU8sRUFBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRyxDQUFDLFFBQVEsRUFBRSxDQUFBO0tBQzlHO0lBQ0QsTUFBTSxLQUFLLEdBQUcsSUFB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QUcsSUFBSSxnQkFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQyxrQkFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQzNCLFFBQVEsRUFDUixNQUFNLENBQ1QsQ0FBQztJQUlGLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUV2QixDQUFDO0FBRVEsb0JBQUkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgR2xvYiBmcm9tIFwiLi4vLi4vR2xvYlwiO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwiLi4vLi4vdXRpbFwiO1xuaW1wb3J0IHsgZWxlbSB9IGZyb20gXCIuLi8uLi9iaGVcIjtcbmltcG9ydCBrZXlib2FyZCBmcm9tICcuL2tleWJvYXJkJ1xuaW1wb3J0IERpYWxvZyBmcm9tICcuL2RpYWxvZydcbi8vIGltcG9ydCB7IFBpYW5vIH0gZnJvbSBcIi4uLy4uL1BpYW5vXCJcbmltcG9ydCB7IFBpYW5vLCBQaWFub09wdGlvbnMgfSBmcm9tIFwiLi4vLi4vUGlhbm9cIlxuaW1wb3J0IHsgTWlkaSB9IGZyb20gXCJAdG9uZWpzL21pZGlcIjtcbmltcG9ydCAqIGFzIFRvbmUgZnJvbSBcInRvbmVcIjtcblxuLy8gY29uc3QgeyBQaWFubyB9ID0gcmVxdWlyZShcIkB0b25lanMvcGlhbm9cIik7XG5cblxuLyoqaW1wb3J0ICogYXMgcnVubmluZ1BhZ2UgZnJvbSBcIi4uL1J1bm5pbmdcIlxuICogcmVxdWlyZSgnLi9SdW5uaW5nJykqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZChyZWxvYWQ6IGJvb2xlYW4pIHtcbiAgICAvLyAqKiAgUGVyZm9ybWFuY2UsIHZpc3VhbHMgc3luYzogaHR0cHM6Ly9naXRodWIuY29tL1RvbmVqcy9Ub25lLmpzL3dpa2kvUGVyZm9ybWFuY2VcbiAgICBjb25zb2xlLmdyb3VwKGBwYWdlcy5SdW5uaW5nLmluZGV4LmxvYWQoJHtyZWxvYWR9KWApO1xuICAgIFxuICAgIEdsb2IuQmlnQ29uZmlnLmxhc3RfcGFnZSA9IFwicnVubmluZ1wiO1xuICAgIGlmICggcmVsb2FkICkge1xuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgIHJldHVybiB1dGlsLnJlbG9hZFBhZ2UoKTtcbiAgICB9XG4gICAgVG9uZS5jb250ZXh0LmxhdGVuY3lIaW50ID0gXCJwbGF5YmFja1wiO1xuICAgIEdsb2IuU2lkZWJhci5yZW1vdmUoKTtcbiAgICBjb25zdCBzdWJjb25maWcgPSBHbG9iLkJpZ0NvbmZpZy5nZXRTdWJjb25maWcoKTtcbiAgICBjb25zdCBwaWFub09wdGlvbnM6IFBhcnRpYWw8UGlhbm9PcHRpb25zPiA9IHtcbiAgICAgICAgc2FtcGxlcyA6IFNBTEFNQU5ERVJfUEFUSF9BQlMsXG4gICAgICAgIHJlbGVhc2UgOiB0cnVlLFxuICAgICAgICBwZWRhbCA6IGZhbHNlLFxuICAgICAgICB2ZWxvY2l0aWVzIDogNSxcbiAgICB9O1xuICAgIGlmICggR2xvYi5CaWdDb25maWcuZGV2Lm11dGVfYW5pbWF0aW9uKCkgKSB7XG4gICAgICAgIHBpYW5vT3B0aW9ucy52b2x1bWUgPSB7IHN0cmluZ3MgOiAtSW5maW5pdHksIGhhcm1vbmljcyA6IC1JbmZpbml0eSwga2V5YmVkIDogLUluZmluaXR5LCBwZWRhbCA6IC1JbmZpbml0eSB9XG4gICAgfVxuICAgIGNvbnN0IHBpYW5vID0gbmV3IFBpYW5vKHBpYW5vT3B0aW9ucykudG9EZXN0aW5hdGlvbigpO1xuICAgIGF3YWl0IHBpYW5vLmxvYWQoKTtcbiAgICBjb25zb2xlLmxvZygncGlhbm8gbG9hZGVkJyk7XG4gICAgY29uc3QgbWlkaSA9IGF3YWl0IE1pZGkuZnJvbVVybChzdWJjb25maWcudHJ1dGgubWlkaS5hYnNQYXRoKTtcbiAgICBjb25zb2xlLmxvZygnbWlkaSBsb2FkZWQnKTtcbiAgICBcbiAgICBcbiAgICB0eXBlIE5vdGVPZmZFdmVudCA9IHsgbmFtZTogc3RyaW5nIH07XG4gICAgdHlwZSBOb3RlT25FdmVudCA9IE5vdGVPZmZFdmVudCAmIHsgdmVsb2NpdHk6IG51bWJlciB9O1xuICAgIHR5cGUgTm90ZU9mZiA9IE5vdGVPZmZFdmVudCAmIHsgdGltZTogVG9uZS5Vbml0LlRpbWUgfTtcbiAgICB0eXBlIE5vdGVPbiA9IE5vdGVPbkV2ZW50ICYgeyB0aW1lOiBUb25lLlVuaXQuVGltZSwgZHVyYXRpb246IG51bWJlciB9O1xuICAgIFxuICAgIGZ1bmN0aW9uIG5vdGVPZmZDYWxsYmFjayh0aW1lOiBUb25lLlVuaXQuVGltZSwgZXZlbnQ6IE5vdGVPZmZFdmVudCkge1xuICAgICAgICBUb25lLkRyYXcuc2NoZWR1bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXZlbnQubmFtZSk7XG4gICAgICAgICAgICBpZiAoIGV2ZW50Lm5hbWUuaW5jbHVkZXMoJyMnKSApIHtcbiAgICAgICAgICAgICAgICBsZXQgbm9oYXNoID0gZXZlbnQubmFtZS5yZXBsYWNlKCcjJywgJycpO1xuICAgICAgICAgICAgICAgIGtleWJvYXJkW25vaGFzaF1bZXZlbnQubmFtZV0ucmVtb3ZlQ2xhc3MoJ29uJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleWJvYXJkW2V2ZW50Lm5hbWVdLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aW1lKTtcbiAgICAgICAgcGlhbm8ua2V5VXAoZXZlbnQubmFtZSwgdGltZSk7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIG5vdGVPbkNhbGxiYWNrKHRpbWU6IFRvbmUuVW5pdC5UaW1lLCBldmVudDogTm90ZU9uRXZlbnQpIHtcbiAgICAgICAgVG9uZS5EcmF3LnNjaGVkdWxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGV2ZW50Lm5hbWUpO1xuICAgICAgICAgICAgaWYgKCBldmVudC5uYW1lLmluY2x1ZGVzKCcjJykgKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5vaGFzaCA9IGV2ZW50Lm5hbWUucmVwbGFjZSgnIycsICcnKTtcbiAgICAgICAgICAgICAgICBrZXlib2FyZFtub2hhc2hdW2V2ZW50Lm5hbWVdLmFkZENsYXNzKCdvbicpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXlib2FyZFtldmVudC5uYW1lXS5hZGRDbGFzcygnb24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGltZSk7XG4gICAgICAgIHBpYW5vLmtleURvd24oZXZlbnQubmFtZSwgdGltZSwgZXZlbnQudmVsb2NpdHkpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBsZXQgbm90ZU9mZk9ianM6IE5vdGVPZmZbXSA9IFtdO1xuICAgIGxldCBub3RlT25PYmpzOiBOb3RlT25bXSA9IFtdO1xuICAgIGxldCBub3RlcztcbiAgICBjb25zdCBtYXhBbmltYXRpb25Ob3RlcyA9IEdsb2IuQmlnQ29uZmlnLmRldi5tYXhfYW5pbWF0aW9uX25vdGVzKCk7XG4gICAgaWYgKCBtYXhBbmltYXRpb25Ob3RlcyApIHtcbiAgICAgICAgbm90ZXMgPSBtaWRpLnRyYWNrc1swXS5ub3Rlcy5zbGljZSgwLCBtYXhBbmltYXRpb25Ob3Rlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbm90ZXMgPSBtaWRpLnRyYWNrc1swXS5ub3RlcztcbiAgICB9XG4gICAgZm9yICggbGV0IG5vdGUgb2Ygbm90ZXMgKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHZlbG9jaXR5LCBkdXJhdGlvbiwgdGltZSA6IHRpbWVPbiB9ID0gbm90ZTtcbiAgICAgICAgbGV0IHRpbWVPZmYgPSB0aW1lT24gKyBkdXJhdGlvbjtcbiAgICAgICAgbm90ZU9mZk9ianMucHVzaCh7IG5hbWUsIHRpbWUgOiB0aW1lT2ZmIH0pO1xuICAgICAgICBub3RlT25PYmpzLnB1c2goeyBuYW1lLCB0aW1lIDogdGltZU9uLCBkdXJhdGlvbiwgdmVsb2NpdHkgfSk7XG4gICAgfVxuICAgIGNvbnN0IG5vdyA9IFRvbmUuVHJhbnNwb3J0Lm5vdygpO1xuICAgIGNvbnN0IG5vdGVPZmZFdmVudHMgPSBuZXcgVG9uZS5QYXJ0KG5vdGVPZmZDYWxsYmFjaywgbm90ZU9mZk9ianMpLnN0YXJ0KG5vdyk7XG4gICAgY29uc3Qgbm90ZU9uRXZlbnRzID0gbmV3IFRvbmUuUGFydChub3RlT25DYWxsYmFjaywgbm90ZU9uT2Jqcykuc3RhcnQobm93KTtcbiAgICBUb25lLlRyYW5zcG9ydC5zdGFydChub3cpO1xuICAgIFxuICAgIHJlbW90ZS5nbG9iYWxTaG9ydGN1dC5yZWdpc3RlcihcIkNvbW1hbmRPckNvbnRyb2wrTVwiLCAoKSA9PiBUb25lLlRyYW5zcG9ydC50b2dnbGUoKSk7XG4gICAgXG4gICAgY29uc29sZS5sb2coeyBzdWJjb25maWcsIG1pZGksIHBpYW5vLCBcIlRvbmUuQ29udGV4dC5nZXREZWZhdWx0cygpXCIgOiBUb25lLkNvbnRleHQuZ2V0RGVmYXVsdHMoKSwgfSk7XG4gICAgR2xvYi5UaXRsZS5odG1sKGAke3N1YmNvbmZpZy50cnV0aC5uYW1lfWApO1xuICAgIFxuICAgIGNvbnN0IHN1YnRpdGxlID0gZWxlbSh7IHRhZyA6ICdoMycsIHRleHQgOiAnMS8xJyB9KTtcbiAgICBjb25zdCBkaWFsb2cgPSBuZXcgRGlhbG9nKHN1YmNvbmZpZy5kZW1vX3R5cGUpO1xuICAgIGtleWJvYXJkLmNsYXNzKCdhY3RpdmUnKS5iZWZvcmUoXG4gICAgICAgIHN1YnRpdGxlLFxuICAgICAgICBkaWFsb2dcbiAgICApO1xuICAgIC8vIEdsb2IuTWFpbkNvbnRlbnQuYXBwZW5kKFxuICAgIC8vXG4gICAgLy8gKTtcbiAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgXG59XG5cbmV4cG9ydCB7IGxvYWQgfVxuIl19