"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Glob_1 = require("../../Glob");
const util = require("../../util");
const bhe_1 = require("../../bhe");
const dialog_1 = require("./dialog");
const midi_1 = require("@tonejs/midi");
const { Piano } = require("@tonejs/piano");
async function load(reload) {
    console.group(`pages.Running.index.load(${reload})`);
    Glob_1.default.BigConfig.last_page = "running";
    if (reload) {
        console.groupEnd();
        return util.reloadPage();
    }
    Glob_1.default.Sidebar.remove();
    const subconfig = Glob_1.default.BigConfig.getSubconfig();
    const piano = new Piano({
        samples: SALAMANDER_PATH_ABS,
        release: false,
        pedal: false,
        velocities: 1,
    }).toDestination();
    await piano.load();
    console.log('piano loaded');
    const midi = await midi_1.Midi.fromUrl(subconfig.truth.midi.absPath);
    console.log('midi loaded');
    console.log({ subconfig, midi, piano });
    Glob_1.default.Title.html(`${subconfig.truth.name}`);
    const subtitle = bhe_1.elem({ tag: 'h3', text: '1/1' });
    const dialog = new dialog_1.default(subconfig.demo_type);
    Glob_1.default.MainContent.append(subtitle, dialog);
    console.groupEnd();
}
exports.load = load;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUE4QjtBQUM5QixtQ0FBbUM7QUFDbkMsbUNBQWlDO0FBRWpDLHFDQUE2QjtBQUU3Qix1Q0FBb0M7QUFFcEMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUkzQyxLQUFLLFVBQVUsSUFBSSxDQUFDLE1BQWU7SUFFL0IsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNyRCxjQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDckMsSUFBSyxNQUFNLEVBQUc7UUFDVixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkIsT0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDNUI7SUFDRCxjQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3RCLE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUM7UUFDcEIsT0FBTyxFQUFHLG1CQUFtQjtRQUM3QixPQUFPLEVBQUcsS0FBSztRQUNmLEtBQUssRUFBRyxLQUFLO1FBQ2IsVUFBVSxFQUFHLENBQUM7S0FDakIsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ25CLE1BQU0sS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDNUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxXQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUN4QyxjQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUUzQyxNQUFNLFFBQVEsR0FBRyxVQUFJLENBQUMsRUFBRSxHQUFHLEVBQUcsSUFBSSxFQUFFLElBQUksRUFBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ3BELE1BQU0sTUFBTSxHQUFHLElBQUksZ0JBQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFL0MsY0FBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQ25CLFFBQVEsRUFDUixNQUFNLENBQ1QsQ0FBQztJQUNGLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUV2QixDQUFDO0FBRVEsb0JBQUkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgR2xvYiBmcm9tIFwiLi4vLi4vR2xvYlwiO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwiLi4vLi4vdXRpbFwiO1xuaW1wb3J0IHsgZWxlbSB9IGZyb20gXCIuLi8uLi9iaGVcIjtcbmltcG9ydCBhbmltYXRpb24gZnJvbSAnLi9hbmltYXRpb24nXG5pbXBvcnQgRGlhbG9nIGZyb20gJy4vZGlhbG9nJ1xuLy8gaW1wb3J0IHsgUGlhbm8gfSBmcm9tIFwiLi4vLi4vUGlhbm9cIlxuaW1wb3J0IHsgTWlkaSB9IGZyb20gXCJAdG9uZWpzL21pZGlcIjtcblxuY29uc3QgeyBQaWFubyB9ID0gcmVxdWlyZShcIkB0b25lanMvcGlhbm9cIik7XG5cbi8qKmltcG9ydCAqIGFzIHJ1bm5pbmdQYWdlIGZyb20gXCIuLi9SdW5uaW5nXCJcbiAqIHJlcXVpcmUoJy4vUnVubmluZycpKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWQocmVsb2FkOiBib29sZWFuKSB7XG4gICAgLy8gKiogIFBlcmZvcm1hbmNlLCB2aXN1YWxzIHN5bmM6IGh0dHBzOi8vZ2l0aHViLmNvbS9Ub25lanMvVG9uZS5qcy93aWtpL1BlcmZvcm1hbmNlXG4gICAgY29uc29sZS5ncm91cChgcGFnZXMuUnVubmluZy5pbmRleC5sb2FkKCR7cmVsb2FkfSlgKTtcbiAgICBHbG9iLkJpZ0NvbmZpZy5sYXN0X3BhZ2UgPSBcInJ1bm5pbmdcIjtcbiAgICBpZiAoIHJlbG9hZCApIHtcbiAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICByZXR1cm4gdXRpbC5yZWxvYWRQYWdlKCk7XG4gICAgfVxuICAgIEdsb2IuU2lkZWJhci5yZW1vdmUoKTtcbiAgICBjb25zdCBzdWJjb25maWcgPSBHbG9iLkJpZ0NvbmZpZy5nZXRTdWJjb25maWcoKTtcbiAgICBjb25zdCBwaWFubyA9IG5ldyBQaWFubyh7XG4gICAgICAgIHNhbXBsZXMgOiBTQUxBTUFOREVSX1BBVEhfQUJTLFxuICAgICAgICByZWxlYXNlIDogZmFsc2UsXG4gICAgICAgIHBlZGFsIDogZmFsc2UsXG4gICAgICAgIHZlbG9jaXRpZXMgOiAxLFxuICAgIH0pLnRvRGVzdGluYXRpb24oKTtcbiAgICBhd2FpdCBwaWFuby5sb2FkKCk7XG4gICAgY29uc29sZS5sb2coJ3BpYW5vIGxvYWRlZCcpO1xuICAgIGNvbnN0IG1pZGkgPSBhd2FpdCBNaWRpLmZyb21Vcmwoc3ViY29uZmlnLnRydXRoLm1pZGkuYWJzUGF0aCk7XG4gICAgY29uc29sZS5sb2coJ21pZGkgbG9hZGVkJyk7XG4gICAgY29uc29sZS5sb2coeyBzdWJjb25maWcsIG1pZGksIHBpYW5vIH0pO1xuICAgIEdsb2IuVGl0bGUuaHRtbChgJHtzdWJjb25maWcudHJ1dGgubmFtZX1gKTtcbiAgICBcbiAgICBjb25zdCBzdWJ0aXRsZSA9IGVsZW0oeyB0YWcgOiAnaDMnLCB0ZXh0IDogJzEvMScgfSk7XG4gICAgY29uc3QgZGlhbG9nID0gbmV3IERpYWxvZyhzdWJjb25maWcuZGVtb190eXBlKTtcbiAgICBcbiAgICBHbG9iLk1haW5Db250ZW50LmFwcGVuZChcbiAgICAgICAgc3VidGl0bGUsXG4gICAgICAgIGRpYWxvZ1xuICAgICk7XG4gICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIFxufVxuXG5leHBvcnQgeyBsb2FkIH1cbiJdfQ==